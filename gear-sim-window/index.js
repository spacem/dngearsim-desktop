const electron = require('electron')
const Menu = electron.Menu;
const app = electron.app;
const session = electron.session;
const dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

module.exports = class GearSimWindow {
    open() {
        if(this.mainWindow) {
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

        this.mainWindow.openDevTools();

        session.defaultSession.webRequest.onBeforeRequest({urls: ['file:/**/images/**', 'file:/**/*.lzjson']}, function(details, callback) {
            var index = details.url.indexOf('/images');
            if(index >= 0 && details.url.indexOf('file:') == 0) {
                var newUrl = 'https://spacem.github.io/dngearsim' + details.url.substring(index);
                console.log('redirecting to ' + newUrl);
                callback({
                    redirectURL: newUrl
                });
                return;
            }

            callback({});
        });

        this.mainWindow.on('closed', function () {
            this.mainWindow = null;
            app.quit();
        })

        app.on('window-all-closed', () => {
            console.log('all closed so quit');
            app.quit();
        });

        this.setupMenu();
        this.reload();
    }

    reload() {
        if(this.mainWindow) {
            // and load the index.html of the app.
            this.mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'dngearsim.html'),
                protocol: 'file:',
                slashes: true
            }));
        }
    }

    setupMenu() {
        let t = this;
        let template = []
        // OS X
        const name = app.getName();
        template.unshift({
        label: 'File',
        submenu: [
            {
                label: 'Reload',
                click() {
                    t.reload();
                }
            },
            {
                label: 'Exit',
                click() {
                    app.quit();
                }
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
    
        // Create the Menu
        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }
}