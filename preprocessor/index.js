var fs = require('fs');

var ExtractPaks = require('./extract-paks');
var preProcessFunc = require('./dntpreprocess');
var uistringzipFunc = require('./uistringzip');
var getItemsFunc = require('./getitems');
var getStringsFunc = require('./getstrings');

module.exports = function(sourceDir, workingDir) {
    var extractPaks = new ExtractPaks(sourceDir, workingDir);
    extractPaks.extract();
    preProcessFunc(workingDir);
    uistringzipFunc(workingDir);

    getItemsFunc(workingDir);
    getStringsFunc(workingDir);

    var data = fs.readFileSync(sourceDir + '\\Version.cfg', 'utf-8');
    fs.writeFileSync(workingDir + '\\Version.cfg', data);
}