const fs = require('fs');
const {dialog} = require('electron').remote;
const preProcessFunc = require('../preprocessor');

angular.module('dnsim').component('dnsimElectronSetup', {
  templateUrl: __dirname + '/gearsim-setup.html',
  controller: ['$window', '$timeout', 'region',
  function($window, $timeout, region) {
    const ctrl = this;
    $window.document.title = 'dngearsim | SETUP';

    ctrl.workLocation = region.alternativeFiles.url;
    if(ctrl.workLocation.indexOf('file:/') >= 0) {
      ctrl.workLocation = ctrl.workLocation.substr(6);
    }

    ctrl.dnLocation = localStorage.getItem('dnFolder');
    if(!ctrl.dnLocation) {
      ctrl.dnLocation = 'C:\\DragonNest';
    }

    ctrl.selectWorkingFolder = function() {
      ctrl.workLocation = ctrl.selectFolder(ctrl.workLocation);
      ctrl.validateWorking();
    }

    ctrl.selectGameFolder = function() {
      ctrl.dnLocation = ctrl.selectFolder(ctrl.dnLocation);
      ctrl.validateGame();
    }

    ctrl.selectFolder = function(folder) {
      var selected = dialog.showOpenDialog({
        properties: ['openDirectory'],
        defaultPath: folder
      });
      if(selected && selected.length) {
        return selected[0];
      }
      else {
        return folder;
      }
    }

    ctrl.validateWorking = function() {
      try {
        var files = fs.readdirSync(ctrl.workLocation);
        if(files.length == 0) {
          ctrl.workingFolderStatus = 'empty folder';
          localStorage.setItem('workFolder', ctrl.workLocation);
        }
        else {
          if(files.find(e => e.indexOf('Version.cfg') >= 0) && files.find(e => e.indexOf('uistring') >= 0)) {
            var contents = fs.readFileSync(ctrl.workLocation + '\\Version.cfg', 'utf8');
            var versionString = contents.split('\n')[0];
            var versionIndex = contents.indexOf('Version');
            if(versionIndex == 0) {
              ctrl.workingFolderStatus = 'found ' + versionString.toLowerCase();
              localStorage.setItem('workFolder', ctrl.workLocation);
            }
            else {
              ctrl.workingFolderStatus = 'cannot find processed files';
            }
          }
          else {
            ctrl.workingFolderStatus = 'folder is not empty but does not contain expected files';
          }
        }
      }
      catch(ex) {
        ctrl.workingFolderStatus = ex.message;
      }
    }

    ctrl.validateGame = function() {
      try {
        var files = fs.readdirSync(ctrl.dnLocation);
        if(files.length == 0) {
          ctrl.dnFolderStatus = 'empty folder';
          localStorage.setItem('dnFolder', ctrl.dnLocation);
        }
        else {
          if(files.find(e => e.indexOf('Version.cfg') >= 0) && files.find(e => e.indexOf('Resource00.pak') >= 0)) {
            var contents = fs.readFileSync(ctrl.dnLocation + '\\Version.cfg', 'utf8');
            var versionString = contents.split('\n')[0];
            var versionIndex = contents.indexOf('Version');
            if(versionIndex == 0) {
              ctrl.dnFolderStatus = 'found ' + versionString.toLowerCase();
              localStorage.setItem('dnFolder', ctrl.dnLocation);
            }
            else {
              ctrl.dnFolderStatus = 'cannot find game files';
            }
          }
          else {
            ctrl.dnFolderStatus = 'folder does not contain expected files';
          }
        }
      }
      catch(ex) {
        ctrl.dnFolderStatus = ex.message;
      }
    }

    ctrl.doProcessing = function() {
        preProcessFunc(ctrl.dnLocation, ctrl.workLocation).then(() => {
          ctrl.processing = false;
          ctrl.preProcessStatus = 'ready';
          $timeout();
        });
    }

    ctrl.buildFiles = function() {
      if(dialog.showMessageBox({
        message: 'This might take some time.',
        type: 'question',
        buttons: ['OK', 'Cancel'],
      }) == 0) {
        localStorage.setItem('dnFolder', ctrl.dnLocation);
        localStorage.setItem('workFolder', ctrl.workLocation);
        ctrl.processing = true;
        $timeout(() => ctrl.doProcessing());
      }
    }

    ctrl.validateWorking();
    ctrl.validateGame();
  }]
});