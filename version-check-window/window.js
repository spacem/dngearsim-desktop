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
            this.sendStatusToWindow('checking for update...');
        });

        autoUpdater.on('update-available', (info) => {
            this.sendStatusToWindow('update available.');
        });

        autoUpdater.on('update-not-available', (info) => {
            this.sendStatusToWindow('update not available.');
            this.close();
        });

        autoUpdater.on('error', (err) => {
            console.log(err);
            this.sendStatusToWindow('error in auto-updater: ' + err.message);
            this.closeSoon();
        });

        autoUpdater.on('download-progress', (progressObj) => {
            let log_message = "download speed: " + Math.round(progressObj.bytesPerSecond/1024) + 'KB/Sec';;
            log_message = log_message + ' - downloaded ' + Math.round(progressObj.percent) + '%';
            log_message = log_message + ' (' + Math.round(progressObj.transferred/1024/1024) + "MB/" + Math.round(progressObj.total/1024/1024) + 'MB)';
            this.sendStatusToWindow(log_message);
        });

        autoUpdater.on('update-downloaded', (info) => {
            this.sendStatusToWindow('update downloaded; just wait it will install in two seconds');
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