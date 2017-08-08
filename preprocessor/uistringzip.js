var fs = require('fs');
var LZString = require('lz-string');

var DnTranslations = require('./dntranslations');

module.exports = function uistringzip(workingFolder) {
  var dnTranslations = new DnTranslations(); // loads the uistring.xml
  // dnTranslations.sizeLimit = 1000;

  return new Promise((resolve, reject) => {
    dnTranslations.loadDefaultFile(
      workingFolder + '\\uistring.xml',
      function(msg) {
        // console.log(msg);
      },
      () => {
        writeTranslations(dnTranslations, workingFolder),
        resolve();
      },
      function(msg) {
        // console.log(msg);
      }
    );
  });
}

function writeTranslations(dnTranslations, path) {
  // console.log('showing');
    var data = JSON.stringify(dnTranslations.data);
    // console.log('len' + data.length);
    var cdata = LZString.compressToUTF16(data);
    fs.writeFileSync(path + '\\uistring.lzjson', cdata);
}