var PaksUtil = require('../../preprocessor/paks-util');
var DnTranslations = require('../../preprocessor/dntranslations');
var DntReader = require('../../preprocessor/dntreader');

module.exports = class GetFileAction {
    constructor(folder, fileName) {
        this.folder = folder;
        this.fileName = fileName;
    }

    async process() {
        await this.setupPaks(this.folder);
        console.log('getting file ' +  this.fileName);
        if(this.fileName === 'uistring.optimised.json' || this.fileName === 'uistring.json') {
            var dnTranslations = new DnTranslations();
            dnTranslations.sizeLimit = 200;
            let result;
            await GetFileAction.pakUtil.processUiStringFiles((fileName, buffer) => {
                result = dnTranslations.process(buffer.toString());
            });
            return result;
        } else if(this.fileName.indexOf('.json') > 0) {
            const fileName = this.fileName.replace('.optimised', '');
            const dntReader = new DntReader();
            await GetFileAction.pakUtil.processFiles(fileName.replace('.json', '.dnt'), (fileName, buffer) => {
                dntReader.processFile(buffer, fileName);
            });
            return dntReader;
        }
        return 'some file called ' + this.fileName + ' from ' + this.folder;
    }

    setupPaks(folder) {
        if (!GetFileAction.pakUtil || GetFileAction.pakUtil.sourceDir != folder) {
            GetFileAction.pakUtil = new PaksUtil(folder);
            return GetFileAction.pakUtil.loadFiles();
        } else {
            return Promise.resolve(GetFileAction.pakUtil.getStatus())
        }
    }
}