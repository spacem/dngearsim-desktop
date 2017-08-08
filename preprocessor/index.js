var PaksUtil = require('./paks-util');
var DnTranslations = require('./dntranslations');
var DntReader = require('./dntreader');
var fs = require('fs');
var preProcessFunc = require('./dntpreprocess-json');
var getItemsFunc = require('./getitems-json');

module.exports = async function(sourceDir, workingDir) {
    
    var util = new PaksUtil(sourceDir, workingDir);
    await util.loadFiles();

    await util.processUiStringFiles((fileName, buffer) => {
        var dnTranslations = new DnTranslations();
        return new Promise((resolve, reject) => {
            dnTranslations.process(buffer.toString(), function() {}, () => {
                var data = JSON.stringify(dnTranslations.data);
                fs.writeFile(workingDir + '\\uistring.json', data, (err) => {
                    if(err) {
                        reject();
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    });

    await util.processDntFiles((fileName, buffer) => {
        return writeRawDntAsJson(workingDir, fileName, buffer);
    });
    preProcessFunc(workingDir);
    getItemsFunc(workingDir);

    var data = fs.readFileSync(sourceDir + '\\Version.cfg', 'utf-8');
    fs.writeFileSync(workingDir + '\\Version.cfg', data);
}

async function writeRawDntAsJson(workingDir, fileName, buffer) {
    var dntReader = new DntReader();
    dntReader.processFile(buffer, fileName);
    var data = JSON.stringify(dntReader);
    return new Promise((resolve, reject) => {
        let newFileName = fileName.substr(0, fileName.length-3) + 'json';
        fs.writeFile(newFileName, data, (err) => {
            if(err) {
                reject();
            }
            else {
                resolve();
            }
        });
    });
}
