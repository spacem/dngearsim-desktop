const electron = require('electron')
const Menu = electron.Menu;
const app = electron.app;
const dialog = electron.dialog;
const path = require('path');
const url = require('url');

module.exports = class GearSimMenu {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
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
                    label: 'Legacy Version',
                    click() {
                        t.legacy();
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
                        label: 'Dev Tools',
                        click() {
                            t.mainWindow.openDevTools()
                        }
                    },
                    {
                        label: 'Version',
                        click() {
                            dialog.showMessageBox({ message: 'version: ' + app.getVersion() });
                        }
                    },
                ]
            });

        // Create the Menu
        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }
    
    reload() {
        if (this.mainWindow) {
            // and load the index.html of the app.
            this.mainWindow.loadURL(
                'https://dngearsim.netlify.com/desktop-setup'
            );
        }
    }

    legacy() {
        if (this.mainWindow) {
            // and load the index.html of the app.
            this.mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'legacy-dngearsim.html'),
                protocol: 'file:',
                slashes: true
            }));
        }
    }
}