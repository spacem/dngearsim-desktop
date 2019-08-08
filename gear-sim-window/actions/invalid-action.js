module.exports = class SelectFolderAction {
    constructor(url) {
        this.url = url;
    }

    process() {
        return { error: 'Invalid url ' + this.url };
    }
}