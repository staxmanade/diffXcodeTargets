var approvals = require('approvals');
var exec = require('shelljs').exec;
var path = require('path');

describe('when calling the cli', function () {

  [
    {
      testName: 'blank',
      cmd: ''
    },
    {
      testName: 'badProjectFile',
      cmd: 'badProjectFile.projectx'
    },
    {
      testName: 'help',
      cmd: '--help'
    }
  ].forEach(function (item) {

    it('should verify command: ' + item.cmd, function () {
      this.timeout(5000);

      var result = exec(path.join(__dirname, "../bin/index.js") + " " + item.cmd).toString();

      var output = result;

      // remove version
      output = output.replace(/\(v(.*)\)/g, '(v###)');

      approvals.verify(__dirname, item.testName, output);

    });

  });

});
