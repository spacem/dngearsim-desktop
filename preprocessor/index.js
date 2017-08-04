var fs = require('fs');

var ExtractPaks = require('./extract-paks');
var preProcessFunc = require('./dntpreprocess');
var uistringzipFunc = require('./uistringzip');
var getItemsFunc = require('./getitems');
var getStringsFunc = require('./getstrings');

module.exports = async function(sourceDir, workingDir) {

    fs.readdirSync(workingDir).forEach(function (name) {
        if(name.indexOf('.lzjson') >= 0 || name.indexOf('.dnt') >= 0 || name.indexOf('.json') >= 0 || name.indexOf('Version.cfg') >= 0 || name.indexOf('uistring.xml') >= 0) {
            fs.unlinkSync(workingDir + '\\' + name);
        }
    });

    var extractPaks = new ExtractPaks(sourceDir, workingDir);
    extractPaks.extract();
    preProcessFunc(workingDir);
    await uistringzipFunc(workingDir);

    getItemsFunc(workingDir);
    getStringsFunc(workingDir);

    var data = fs.readFileSync(sourceDir + '\\Version.cfg', 'utf-8');
    fs.writeFileSync(workingDir + '\\Version.cfg', data);
}