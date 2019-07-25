const electron = require('electron')
const Menu = electron.Menu;
const app = electron.app;
const session = electron.session;
const dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;
const fs = require('fs');
var PaksUtil = require('../preprocessor/paks-util');
var DnTranslations = require('../preprocessor/dntranslations');
var DntReader = require('../preprocessor/dntreader');
const path = require('path');
const url = require('url');

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

        session.defaultSession.webRequest.onBeforeRequest({ urls: ['file:/**/images/**', 'file:/**/*.lzjson'] }, function (details, callback) {
            var index = details.url.indexOf('/images');
            if (index >= 0 && details.url.indexOf('file:') == 0) {
                var newUrl = 'https://spacem.github.io/dngearsim' + details.url.substring(index);
                console.log('redirecting to ' + newUrl);
                callback({
                    redirectURL: newUrl
                });
                return;
            }

            callback({});
        });

        electron.protocol.registerStringProtocol('dngearsim', (req, callback) => {
            try {
                Promise.resolve(this.processUrl(req)).then(result => {
                    const stringified = JSON.stringify(result);
                    // console.log('got  ' + stringified.length + ' characters eg.' + stringified.substr(0, 30));
                    callback({ mimeType: 'application/json', data: stringified });
                }).catch(err => {
                    console.error(err);
                    callback({ mimeType: 'application/json', data: JSON.stringify({ error: err.message }) });
                });
            } catch(err) {
                console.error(err);
                callback({ mimeType: 'application/json', data: JSON.stringify({ error: err.message }) });
            }
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

    processUrl(req) {
        console.log('processing ' + req.url);
        const parts = req.url.split(':');
        let param;
        let path;
        if (parts.length > 2) {
            const paths = parts[2].split('/');
            param = decodeURIComponent(paths[0]);
            if (paths.length > 1) {
                path = paths[1];
            }
        }
        switch (parts[1]) {
            case '//select-folder':
                return { folder: this.selectFolder('') };
            case '//check-folder':
                var contents = fs.readFileSync(param + '\\Version.cfg', 'utf8');
                var versionString = contents.split('\n')[0];
                return this.setupPaks(param).then(result => {
                    return { detail: versionString + ' | ' + result };
                });
            case '//data':
                return this.getFile(param, path);
            default:
                return { error: 'Invalid url ' + req.url };
        }
    }

    setupPaks(folder) {
        if (!this.pakUtil || this.pakUtil.sourceDir != folder) {
            this.pakUtil = new PaksUtil(folder);
            return this.pakUtil.loadFiles();
        } else {
            return Promise.resolve(this.pakUtil.getStatus())
        }
    }

    async getFile(folder, fileName) {
        await this.setupPaks(folder);
        console.log('getting file ' +  fileName);
        if(fileName === 'uistring.optimised.json' || fileName === 'uistring.json') {
            var dnTranslations = new DnTranslations();
            dnTranslations.sizeLimit = 200;
            let result;
            await this.pakUtil.processUiStringFiles((fileName, buffer) => {
                result = dnTranslations.process(buffer.toString());
            });
            return result;
        } else if(fileName.indexOf('.json') > 0) {
            fileName = fileName.replace('.optimised', '');
            const dntReader = new DntReader();
            await this.pakUtil.processFiles(fileName.replace('.json', '.dnt'), (fileName, buffer) => {
                dntReader.processFile(buffer, fileName);
            });
            return dntReader;
        }
        return 'some file called ' + fileName + ' from ' + folder;
    }

    selectFolder(path) {
        var selected = dialog.showOpenDialog({
            properties: ['openDirectory'],
            defaultPath: path
        });
        if (selected && selected.length) {
            return selected[0];
        }
        else {
            return folder;
        }
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
}