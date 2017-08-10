const electron = require('electron');
const app = electron.app;

const GearSimWindow = require('./gear-sim-window/window');
const VersionCheckWindow = require('./version-check-window/window');
require('electron-debug')({enabled: true});

let versionCheck = new VersionCheckWindow();
let gearSim = new GearSimWindow();

versionCheck.onClose = function() {
  versionCheck.onClose = null;
  versionCheck = null;
  gearSim.open();
}

app.on('ready', function() {
  versionCheck.open();
});
