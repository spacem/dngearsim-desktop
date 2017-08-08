var path = require('path')
var fs = require('fs');
var DntReader = require('./dntreader');

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
  
  walkSync(sourceDir, function(filePath) {
    if(filePath.indexOf('.json') == -1 || filePath.indexOf('uistring') >= 0) {
      return;
    }
      
    var fileName = path.basename(filePath, '.json');
    
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
  outputFile(itemDntReader, outputFolder + '/' + 'all-items.json');
}

function outputFile(data, fileName) {
  try
  {
    var dataString = JSON.stringify(data);
    fs.writeFileSync(fileName, dataString);
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
    dntReader.processJsonFile(data, filePath);
  }
  return dntReader;
}

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        callback(filePath);
    });
}
