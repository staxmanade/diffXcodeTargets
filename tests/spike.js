#!/usr/bin/env node

var cpuPrifle = false;
var profiler;
var cpuProfileResult;
if(cpuPrifle) profiler = require('v8-profiler');

if(cpuPrifle) profiler.startProfiling('myProfile')                   //begin cpu profiling

var xcode = require('xcode'),
    fs = require('fs'),
    path = require('path'),
    projectPath = path.join(__dirname, './Sample/Sample.xcodeproj/project.pbxproj'),
    project = xcode.project(projectPath);

//var snapshot = profiler.takeSnapshot('start')
function getBuildSettings(project, buildConfigId) {
  var objects = project.hash.project.objects;

  var x = objects.XCBuildConfiguration[buildConfigId]
  console.log(x);
  return x.buildSettings;
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
    //console.log(targetSettings.buildConfigurationList);
    //var configList = objects[targetSettings.buildConfigurationList];
    //console.log(objects.XCConfigurationList[targetSettings.buildConfigurationList]);

    // like Debug/Release
    var configurationList = objects.XCConfigurationList[targetSettings.buildConfigurationList];
    // if(configurationList) {
    //   console.log(configurationList);
    //   throw 'wat?'
    // }
    configurationList.buildConfigurations.forEach(function (item) {
      console.log(item);
      result[item.comment] = getBuildSettings(project, item.value);
    });

  }
  console.log("TEST");
  return result
}

// parsing is async, in a different process
project.parseSync()

var objects = project.hash.project.objects;

var nativeTargets = {};

Object.keys(objects.PBXNativeTarget).forEach(function (key) {
  var item = objects.PBXNativeTarget[key];
  if(["Sample", "SampleMissingStuff"].indexOf(item.name) >= 0) {
    nativeTargets[item.name] = item;
  }
});

var targetToVerify = "SampleMissingStuff"

var sampleMissingStuffTarget = nativeTargets[targetToVerify]
// console.log(sampleMissingStuffTarget);

var buildConfigId = project.buildConfigurationList
// console.log(project.hash.project.objects[buildConfigId]);

//console.log(JSON.stringify(project, null, '  '));

var buildSettings = getBuildConfigurations(project, targetToVerify)
console.log(buildSettings);

if(cpuPrifle) {
  cpuProfileResult = profiler.stopProfiling("myProfile");
  fs.writeFileSync('myProfile4.cpuprofile', JSON.stringify(cpuProfileResult));
}

/*
  'PBXBuildFile',
  'PBXContainerItemProxy',
  'PBXFileReference',
  'PBXFrameworksBuildPhase',
  'PBXGroup',
  'PBXNativeTarget',
  'PBXProject',
  'PBXResourcesBuildPhase',
  'PBXShellScriptBuildPhase',
  'PBXSourcesBuildPhase',
  'PBXTargetDependency',
  'PBXVariantGroup',
  'XCBuildConfiguration',
  'XCConfigurationList'
*/
