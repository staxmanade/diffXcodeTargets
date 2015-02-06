#!/usr/bin/env node
const Liftoff = require('liftoff');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');

var temp = require('temp');
//temp.track();

var cleanArgs = process.argv.map(function (item) {
  return (item || '').toLowerCase();
});
var debug = argv.verbose = cleanArgs.indexOf('--debug') >= 0 || cleanArgs.indexOf('--verbose') >= 0;

const DiffXcodeTargets = new Liftoff({
  name: 'diffXcodeTargets',
  v8flags: ['--harmony'] // to support all flags: require('v8flags');
  // ^ respawn node with any flag listed here
}).on('require', function (name, module) {
  dlog('Loading:', name);
}).on('requireFail', function (name, err) {
  dlog('Unable to load:', name, err);
}).on('respawn', function (flags, child) {
  dlog('Detected node flags:', flags);
  dlog('Respawned to PID:', child.pid);
});


function dlog() {
  if(debug) {
    console.log.apply(null, arguments);
  }
};

var getVersion = function () {
  return require('../package.json').version;
};

var printHelpMessage = function() {

  dlog('printing help...');

  var helpFile = path.join(__dirname, 'help.md');
  var output = require('msee').parseFile(helpFile);

  var version = getVersion();
  output = output.replace('{{version}}', version);

  // Some spacing formatting cleanup
  output = output.replace(/&nbsp;/g, ' ');
  console.log(output);
};

DiffXcodeTargets.launch({
  cwd: argv.cwd,
  //configPath: null, //argv.hackerfile,
  //require: argv.require,
  completion: argv.completion,
  verbose: debug
}, invoke);

function invoke (env) {

  if (argv.verbose) {
    dlog('LIFTOFF SETTINGS:', this);
    dlog('CLI OPTIONS:', argv);
    dlog('CWD:', env.cwd);
    dlog('LOCAL MODULES PRELOADED:', env.require);
    dlog('SEARCHING FOR:', env.configNameRegex);
    dlog('FOUND CONFIG AT:',  env.configPath);
    dlog('CONFIG BASE DIR:', env.configBase);
    dlog('YOUR LOCAL MODULE IS LOCATED:', env.modulePath);
    dlog('LOCAL PACKAGE.JSON:', env.modulePackage);
    dlog('CLI PACKAGE.JSON', require('../package'));
  }


  if(argv.help) {
    printHelpMessage();
    return;
  }

  if(argv.version) {
    console.log(getVersion());
    return;
  }


  var xcode = require('xcode');
  var fs = require('fs');

  var projectFile = argv._[0] || '';

  var targetA = argv._[1] || '';
  var targetB = argv._[2] || '';

  if(!fs.existsSync(projectFile)) {
    console.log(chalk.red("Project file not specified."));
    process.exit(1);
  }

  projectFile = path.join(process.cwd(), projectFile);

  dlog("projectFile: ", projectFile);

  if(!fs.existsSync(projectFile)) {
    console.log(chalk.red("Project file not found: '" + projectFile + "'"));
    process.exit(1);
  }

  if(!targetA) {
    console.log(chalk.red("TargetA not specified: '" + targetA + "'"));
    process.exit(1);
  }

  if(!targetA) {
    console.log(chalk.red("TargetB not specified: '" + targetB + "'"));
    process.exit(1);
  }

  var project = xcode.project(projectFile);

  project.parse(function (err) {
    if(err) {
      throw err;
    }

    var objects = project.hash.project.objects;
    var sources = objects.PBXSourcesBuildPhase;

    var targetANativeTarget;
    var targetBNativeTarget;
    var availableTargets = [];

    Object.keys(objects.PBXNativeTarget).forEach(function (key) {
      var item = objects.PBXNativeTarget[key];
      if(item.name) {
        if(item.name.toLowerCase() === targetA.toLowerCase()){
          targetANativeTarget = item;
        }

        if(item.name.toLowerCase() === targetB.toLowerCase()){
          targetBNativeTarget = item;
        }

        availableTargets.push(item.name);
      }
    });

    if(!targetANativeTarget) {
      console.log(chalk.red("Could not find TargetA '" + targetA + "'. Possible targets are: " + availableTargets.join(', ')));
      process.exit(1);
    }

    if(!targetBNativeTarget) {
      console.log(chalk.red("Could not find TargetB '" + targetB + "'. Possible targets are: " + availableTargets.join(', ')));
      process.exit(1);
    }

    function buildDataFor(targetName, nativeTarget) {

      // Sorce files
      var sourcesId = nativeTarget.buildPhases.filter(function (item) {
        return item.comment === "Sources";
      })[0].value;

      var sources = objects.PBXSourcesBuildPhase[sourcesId];

      sourceFiles = sources.files.map(function (item) {
        return item.comment.replace(" in Sources", "");
      }).sort();

      // Framework files
      var frameworksId = nativeTarget.buildPhases.filter(function (item) {
        return item.comment === "Frameworks";
      })[0].value;

      var frameworks = objects.PBXFrameworksBuildPhase[frameworksId];

      frameworkFiles = frameworks.files.map(function (item) {
        return item.comment.replace(" in Frameworks", "");
      }).sort();

      return {
        name: targetName,
        configurations: getBuildConfigurations(project, targetName),
        sources: sourceFiles,
        frameworks: frameworkFiles
      };
    }

    function getBuildSettings(project, buildConfigId) {
      var objects = project.hash.project.objects;
      return objects.XCBuildConfiguration[buildConfigId].buildSettings;
    }

    function getBuildConfigurations(project, target) {
      var objects = project.hash.project.objects;
      var targetSettings;
      Object.keys(objects.PBXNativeTarget).forEach(function (key) {
        var item = objects.PBXNativeTarget[key];
        if(item.name === target) {
          targetSettings = item;
        }
      });

      var result = {};

      if(targetSettings) {
        // like Debug/Release
        var configurationList = objects.XCConfigurationList[targetSettings.buildConfigurationList];
        configurationList.buildConfigurations.forEach(function (item) {
          result[item.comment] = getBuildSettings(project, item.value);
        });
      }
      return result
    }

    var targetAData = buildDataFor(targetA, targetANativeTarget);
    var targetBData = buildDataFor(targetB, targetBNativeTarget);

    temp.mkdir("diffXcodeTargets", function (err, dirPath) {
      var fileName = targetA + "-" + targetB;
      var approvedName = path.join(dirPath, fileName + ".approved.txt");
      fs.writeFileSync(approvedName, JSON.stringify(targetAData, null, '  '));
      require('approvals').verifyAsJSON(dirPath, fileName, targetBData);
    });

  });
}
