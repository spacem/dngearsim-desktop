const SelectFolderAction = require('./select-folder-action');
const CheckFolderAction = require('./check-folder-action');
const GetFileAction = require('./get-file-action');
const InvalidAction = require('./invalid-action');

module.exports = class ActionFactory {

    create(url) {
        const parts = url.split(':');
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
                return new SelectFolderAction();
            case '//check-folder':
                return new CheckFolderAction(param);
            case '//data':
                return new GetFileAction(param, path);
            default:
                return new InvalidAction(url);
        }
    }
}
