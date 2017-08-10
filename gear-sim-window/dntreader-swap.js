var fs = require('fs');

var OldDntReader = require('../preprocessor/dntreader');
module.exports = class DntReader extends OldDntReader {
    loadDntFromServerFile(fileName, statusFunc, processFileFunc, failFunc) {
        if(fileName.indexOf('file:') == 0) {
            // console.log('loadDntFromServerFile');
            var workFolder = localStorage.getItem('workFolder');
            if(!workFolder) {
                workFolder = __dirname + '\\working';
            }

            const dotIndex = fileName.lastIndexOf('.');
            const slashIndex = fileName.lastIndexOf('/');
            var fileNameWithoutExtension = fileName.substr(slashIndex + 1, dotIndex - slashIndex - 1);

            var newFilePath = workFolder + '\\' + fileNameWithoutExtension + '.json';
            // console.info('dntreader loading', newFilePath);

            fs.readFile(newFilePath, 'utf8', (err, data) => {    
                if(err) {
                    // console.error(err.message);
                    if(failFunc) {
                        failFunc(err.message);
                    }
                }
                else {
                    this.processJsonFile(data, fileName);
                    if(processFileFunc) {
                        processFileFunc();
                    }
                }
            });
        }
        else {
            super.loadDntFromServerFile(fileName, statusFunc, processFileFunc, failFunc);
        }
    }
}