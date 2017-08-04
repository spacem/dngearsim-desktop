var path = require('path')
var fs = require('fs');
var DntReader = require('./dntreader');
var LZString = require('lz-string');

module.exports = function getItems(sourceDir) {
  console.log('writing item lookup file');

  oldItemReader = null;

  var itemDntReader = new DntReader();
  itemDntReader.columnNames = [
    'id',
    'NameID',
    'NameIDParam',
    'Rank',
    'IconImageIndex',
    'Type',
    'LevelLimit',
    'fileName',
    'version',
    ];
  itemDntReader.numColumns = itemDntReader.columnNames.length;
  itemDntReader.data = [];

  outputFolder = sourceDir;
  
  walkSync(sourceDir, function(filePath, stat) {
    if(filePath.indexOf('.dnt') == -1) {
      return;
    }
      
    var fileName = path.basename(filePath, '.dnt');
    
    var reader = null;
    if(fileName.indexOf('optimised') < 0 && fileName.indexOf('table') > 0) {
  
  try {
    reader = readFile(filePath, new DntReader());
      if(reader.numRows > 0 && 
    'NameID' in reader.columnIndexes && 
    'Type' in reader.columnIndexes && 
    'IconImageIndex' in reader.columnIndexes) {

      for(var i=0;i<reader.numRows;++i) {

        var id = reader.getValue(i, 'id');

        var version = null;      
        itemDntReader.data.push([
          id,
          reader.getValue(i, 'NameID'),
          reader.getValue(i, 'NameIDParam'),
          reader.getValue(i, 'Rank'),
          reader.getValue(i, 'IconImageIndex'),
          reader.getValue(i, 'Type'),
          reader.getValue(i, 'LevelLimit'),
          fileName,
          version
        ]);
      }
    }
  }
  catch(ex) {
    console.log(filePath, ex);
  }
    }
  });
  
  itemDntReader.numRows = itemDntReader.data.length;
  outputFile(itemDntReader, outputFolder + '/' + 'all-items.lzjson');
}

function outputFile(data, fileName) {
  try
  {
    var dataString = JSON.stringify(data);
    var cdata = LZString.compressToUTF16(dataString);
    
    dataString = null;
    fs.writeFileSync(fileName, cdata);
    console.log('written ' + fileName);
  }
  catch(ex) {
    console.log('--- ERROR --- ');
    console.log('--- ERROR --- ');
    console.log('--- ERROR --- ');
    console.log(ex);
  }
}

function readFile(filePath, dntReader) {
  var data = fs.readFileSync(filePath);
  
  if(data.length > 0) {
    var buf = toArrayBuffer(data);
    data = null;
    dntReader.processFile(buf, filePath);
    buf = null;
  }
  return dntReader;
}

function toArrayBuffer(b) {
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

function walkSync(currentDirPath, callback) {
    var fs = require('fs'),
        path = require('path');
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

function readCurrentVerison(dnFolder) {
    var versionFileContents = fs.readFileSync(path.join(dnFolder, 'Version.cfg'), 'utf8');
    var splitVersion = versionFileContents.split('\n');
    return splitVersion[0].split(' ')[1].trim();
}

function getPreviousItemFileName(oldVersionFolder, currentVersion) {
  if(!fs.existsSync(oldVersionFolder)) {
    return;
  }

  var folders = fs.readdirSync(oldVersionFolder);
  var previousVersion = 0;
  folders.forEach(function(folder) {
      if(folder != currentVersion && Number(folder) > previousVersion) {
          previousVersion = Number(folder);
      }
  });
  return path.join(oldVersionFolder, previousVersion.toString(), 'all-items.lzjson');
}