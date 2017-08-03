const log = require('electron-log');
const {autoUpdater} = require("electron-updater");
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

module.exports = class VersionWindow {
    constructor() {
    }

    sendStatusToWindow(text) {
        log.info(text);
        this.win.webContents.send('message', text);
    }

    open() {
        autoUpdater.logger = log;
        autoUpdater.logger.transports.file.level = 'info';
        log.info('App starting...');

        this.win = new BrowserWindow({
            type: 'toolbar'
        });
        this.win.setMenu(null);
        this.win.on('closed', () => {
            this.close();
            this.win = null;
        });

        this.win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);

        autoUpdater.on('checking-for-update', () => {
            this.sendStatusToWindow('Checking for update...');
        });

        autoUpdater.on('update-available', (info) => {
            this.sendStatusToWindow('Update available.');
        });

        autoUpdater.on('update-not-available', (info) => {
            this.sendStatusToWindow('Update not available.');
            this.close();
        });

        autoUpdater.on('error', (err) => {
            console.log(err);
            this.sendStatusToWindow('Error in auto-updater: ' + err.message);
            this.closeSoon();
        });

        autoUpdater.on('download-progress', (progressObj) => {
            let log_message = "Download speed: " + progressObj.bytesPerSecond;
            log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
            log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
            this.sendStatusToWindow(log_message);
        });

        autoUpdater.on('update-downloaded', (info) => {
            this.sendStatusToWindow('Update downloaded; will install in 2 seconds');
        });

        autoUpdater.on('update-downloaded', (info) => {
            setTimeout(function() {
                autoUpdater.quitAndInstall();  
            }, 2000)
        });

        this.win.webContents.on('did-finish-load', () => {
            autoUpdater.checkForUpdates();
        });
    }

    closeSoon() {
        setTimeout(() => {
            this.close();
        }, 3000)
    }

    close() {
        if(this.onClose) {
            this.onClose();
        }

        if(this.win && !this.win.isDestroyed()) {
            this.win.close();  
        }
    }
}