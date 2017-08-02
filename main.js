const log = require('electron-log');
const {autoUpdater} = require("electron-updater");

const electron = require('electron')
const Menu = electron.Menu;
// Module to control application life.
const app = electron.app
const session = electron.session;
const dialog = electron.dialog;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

require('electron-debug')({enabled: true});

function createWindow() {
  if(mainWindow) {
    return;
  }
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      webSecurity: false,
     }
  });

  session.defaultSession.webRequest.onBeforeRequest({urls: ['file:/**/images/**']}, function(details, callback) {
    // console.log('checking url ' + details.url);
    var index = details.url.indexOf('/images');
    if(index >= 0 && details.url.indexOf('file:') == 0) {
      var newUrl = 'https://spacem.github.io/dngearsim' + details.url.substring(index);
      console.log('redirecting to ' + newUrl);
      callback({
        redirectURL: newUrl
      });
    }
    else {
      callback({});
    }
  });

  reload();

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
      app.quit();
  })

  if(win && !win.isDestroyed()) {
    win.close();  
  }
  app.on('window-all-closed', () => {
    console.log('all closed so quit');
    app.quit();
  });
}

function reload() {
  if(mainWindow) {
    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'dngearsim.html'),
      protocol: 'file:',
      slashes: true
    }));
  }
}

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');


let template = []
// OS X
const name = app.getName();
template.unshift({
  label: 'File',
  submenu: [
    {
      label: 'Reload',
      click() { reload(); }
    },
    {
      label: 'Exit',
      click() { app.quit(); }
    },
  ]
},
{
  label: 'About',
  submenu: [
    {
      label: 'Version',
      click() {
        dialog.showMessageBox({message: 'version: ' + app.getVersion()});
      }
    },
  ]
});


let win;

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}
function createDefaultWindow() {
  win = new BrowserWindow();
  win.on('closed', () => {
    createWindow();
    win = null;
  });

  win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
  return win;
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
  createWindow();
})
autoUpdater.on('error', (err) => {
  console.log(err);
  sendStatusToWindow('Error in auto-updater: ' + err.message);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded; will install in 2 seconds');
});
app.on('ready', function() {
  // Create the Menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  createDefaultWindow();
  autoUpdater.checkForUpdates();
});

autoUpdater.on('update-downloaded', (info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  setTimeout(function() {
    autoUpdater.quitAndInstall();  
  }, 2000)
})
