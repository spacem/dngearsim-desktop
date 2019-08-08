const electron = require('electron');
const dialog = electron.dialog;

module.exports = class SelectFolderAction {
    
    process() {
        return { folder: this.selectFolder('') };
    }

    selectFolder(path) {
        var selected = dialog.showOpenDialog({
            properties: ['openDirectory'],
            defaultPath: path
        });
        if (selected && selected.length) {
            return selected[0];
        }
    }
}