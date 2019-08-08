const electron = require('electron')
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const GearSimMenu = require('./menu');
const GearSimProtocolHandler = require('./protocol-handler');

module.exports = class GearSimWindow {

    open() {
        if (this.mainWindow) {
            return;
        }

        this.mainWindow = new BrowserWindow({
            width: 1024,
            height: 768,
            titleBarStyle: 'hiddenInset',
            webPreferences: {
                webSecurity: false,
            }
        });
        this.protocolHandler = new GearSimProtocolHandler();
        electron.protocol.registerStringProtocol(
            'dngearsim',
            (req, callback) => this.protocolHandler.handle(req, callback));

        this.mainWindow.on('closed', function () {
            this.mainWindow = null;
            app.quit();
        })

        app.on('window-all-closed', () => {
            console.log('all closed so quit');
            app.quit();
        });

        this.menu = new GearSimMenu(this.mainWindow);
        this.menu.setupMenu();
        this.menu.reload();
    }
}