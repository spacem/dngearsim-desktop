const fs = require('fs');

module.exports = class CheckFolderAction {
    constructor(folder) {
        this.folder = folder;
    }

    process() {
        var contents = fs.readFileSync(this.folder + '\\Version.cfg', 'utf8');
        var versionString = contents.split('\n')[0];
        return { detail: versionString };
    }
}