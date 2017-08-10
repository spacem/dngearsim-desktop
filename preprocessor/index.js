var PaksUtil = require('./paks-util');
var DnTranslations = require('./dntranslations');
var DntReader = require('./dntreader');
var fs = require('fs');
var preProcessFunc = require('./dntpreprocess-json');
var getItemsFunc = require('./getitems-json');

module.exports = async function(sourceDir, workingDir, progressFunc) {


    var start = new Date().getTime();
    var util = new PaksUtil(sourceDir, workingDir);
    await util.loadFiles();
    progressFunc('looked at paks');
    console.log('loadFiles time', (new Date().getTime() - start)/1000);
    start = new Date().getTime();

    await util.processUiStringFiles((fileName, buffer) => {
        progressFunc('processed uistring');
        console.log('processUiStringFiles time ', (new Date().getTime() - start)/1000);
        start = new Date().getTime();
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
    progressFunc('wrote uistring.json');
    console.log('write uistringfiles time ', (new Date().getTime() - start)/1000);
    start = new Date().getTime();

    await util.processDntFiles((fileName, buffer) => {
        return writeRawDntAsJson(workingDir, fileName, buffer);
    });
    progressFunc('processed dnt files');
    console.log('processedDnt time ', (new Date().getTime() - start)/1000);
    start = new Date().getTime();

    await preProcessFunc(workingDir);
    progressFunc('preformed pre-processing of dnt files');
    console.log('preProcess time ', (new Date().getTime() - start)/1000);
    start = new Date().getTime();

    getItemsFunc(workingDir);
    progressFunc('built item index');
    console.log('getitems time ', (new Date().getTime() - start)/1000);
    start = new Date().getTime();

    var data = fs.readFileSync(sourceDir + '\\Version.cfg', 'utf-8');
    fs.writeFileSync(workingDir + '\\Version.cfg', data);
    progressFunc('copied version.cfg');
    console.log('version time ', (new Date().getTime() - start)/1000);
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
