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
        } else if(this.fileName === 'all-items.json') {
            return this.processAllItems();
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

    async processAllItems() {
        const itemDntReader = new DntReader();
        itemDntReader.columnNames = [
            'id',
            'NameID',
            'NameIDParam',
            'Rank',
            'IconImageIndex',
            'Type',
            'LevelLimit',
            'fileName'
        ];
        itemDntReader.numColumns = itemDntReader.columnNames.length;
        itemDntReader.data = [];
        await GetFileAction.pakUtil.processFiles('itemtable', async (fileName, buffer) => {
            const dntReader = new DntReader();
            dntReader.processFile(buffer, fileName);
            if(dntReader.numRows > 0 && 
                'NameID' in dntReader.columnIndexes && 
                'Type' in dntReader.columnIndexes && 
                'IconImageIndex' in dntReader.columnIndexes) {
            
                  for(var i=0;i<dntReader.numRows;++i) {
                    var id = dntReader.getValue(i, 'id');
                    itemDntReader.data.push([
                      id,
                      dntReader.getValue(i, 'NameID'),
                      dntReader.getValue(i, 'NameIDParam'),
                      dntReader.getValue(i, 'Rank'),
                      dntReader.getValue(i, 'IconImageIndex'),
                      dntReader.getValue(i, 'Type'),
                      dntReader.getValue(i, 'LevelLimit'),
                      fileName
                    ]);
                  }
            }
        });
        return itemDntReader;
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