var path = require('path')
var fs = require('fs');
var colsToLoad = require('./colsToLoad');
var itemTypes = require('./itemTypes');
var DntReader = require('./dntreader');
var LZString = require('lz-string');

var colsToLoadLookup = null;

module.exports = function preProcess(workingFolder) {
  var sourceDir = workingFolder;
  var outputFolder = workingFolder;

  try {
    
    var potentialsToUse = {};
    var enchantmentsToUse = {};

    outputJsonFiles(workingFolder);
    
    // now output itemtables and build up list of items that were skipped
    console.log('writing optimised item files');
    walkSync(sourceDir, function(filePath, stat) {
        
      var fileName = path.basename(filePath, '.dnt');
      if(!isItemFile(fileName + '.dnt')) {
        return;
      }
      
      var optimisedFileName = outputFolder + '/' + fileName + '.optimised.lzjson'
      var jsonFileName = outputFolder + '/' + fileName + '.optimised.json'
      
      if(filePath.indexOf('.dnt') == filePath.length - 4) {
        
        var data = readFile(filePath);
        if(data.length == 0) {
        }
        else {
          var dntReader = new DntReader();
          dntReader.colsToLoad = getColsToLoad(fileName + '.dnt');
          if(!dntReader.colsToLoad) {
            dntReader.colsToLoad = null;
          }
          var buf = toArrayBuffer(data);
          data = null;
          dntReader.processFile(buf, filePath);
          buf = null;
          
          var filtered = filterItemData(fileName + '.dnt', dntReader);
          // console.log(' filtered ' + dntReader.numRows + ' rows');
          for(var i=0;i<dntReader.numRows;++i) {
            enchantmentsToUse[dntReader.getValue(i, 'EnchantID')] = true;
            potentialsToUse[dntReader.getValue(i, 'TypeParam1')] = true;
          }
          
          if((filtered || dntReader.colsToLoad) && !fileExists(jsonFileName)) {
            writeFileFromReader(dntReader, optimisedFileName, jsonFileName);
          }
          dntReader = null;
        }
      }
    });
    
    // finally output other files
    console.log('writing other optimised files');
    walkSync(sourceDir, function(filePath, stat) {
        
      var fileName = path.basename(filePath, '.dnt');
      if(isItemFile(fileName + '.dnt')) {
        return;
      }
      
      var optimisedFileName = outputFolder + '/' + fileName + '.optimised.lzjson'
      var jsonFileName = outputFolder + '/' + fileName + '.optimised.json'
      if(filePath.indexOf('.dnt') == filePath.length - 4 &&
        !fileExists(jsonFileName)
        ) {
        
        var data = readFile(filePath);
        if(data.length == 0) {
        }
        else {
          var dntReader = new DntReader();
          dntReader.colsToLoad = getColsToLoad(fileName + '.dnt');
          if(!dntReader.colsToLoad) {
            dntReader.colsToLoad = null;
          }
          var buf = toArrayBuffer(data);
          data = null;
          dntReader.processFile(buf, filePath);
          buf = null;
          
          if(!filterData(fileName + '.dnt', dntReader, potentialsToUse, enchantmentsToUse) && !dntReader.colsToLoad) {
            return;
          }
          
          writeFileFromReader(dntReader, optimisedFileName, jsonFileName);
          dntReader = null;
        }
      }
    });
  }
  catch(ex) {
    console.log('--- ERROR --- ');
    console.log(ex.stack);
  }
}

function outputJsonFiles(sourceDir) {
  // first process everything as json
  console.log('outputting json files');
  walkSync(sourceDir, function(filePath, stat) {
      
    var fileName = path.basename(filePath, '.dnt');
    var outputFileName = sourceDir + '/' + fileName + '.lzjson'
    
    if(filePath.indexOf('.dnt') == filePath.length - 4 &&
      !fileExists(outputFileName)
      ) {
      
      var data = readFile(filePath);
      if(data.length == 0) {
      }
      else {
        var dntReader = new DntReader();
        var buf = toArrayBuffer(data);
        data = null;
        dntReader.processFile(buf, filePath);
        buf = null;
        
        writeFileFromReader(dntReader, outputFileName);
        dntReader = null;
      }
    }
  });
}

function writeFileFromReader(dntReader, outputFileName, jsonFileName) {
  var dataString = JSON.stringify(dntReader);
  
  if(jsonFileName) {
    outputFile(dataString, jsonFileName);
  }
  else {
    var cdata = LZString.compressToUTF16(dataString);
    
    dataString = null;
    outputFile(cdata, outputFileName);
    cdata = null;
  }
}

function toArrayBuffer(b) {
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

function getColsToLoad(fileName) {
  if(colsToLoadLookup == null) {
    colsToLoadLookup = {};
    for(var i=0;i<itemTypes.length;++i) {
      var t = itemTypes[i];
      if(t.mainDnt) {
        colsToLoadLookup[t.mainDnt] = colsToLoad.mainDnt;
      }
      if(t.partsDnt) {
        colsToLoadLookup[t.partsDnt] = colsToLoad.partsDnt;
      }
      if(t.weaponDnt) {
        colsToLoadLookup[t.weaponDnt] = colsToLoad.weaponDnt;
      }
      if(t.enchantDnt) {
        colsToLoadLookup[t.enchantDnt] = colsToLoad.enchantDnt;
      }
      if(t.potentialDnt) {
        colsToLoadLookup[t.potentialDnt] = colsToLoad.potentialDnt;
      }
      if(t.sparkDnt) {
        colsToLoadLookup[t.sparkDnt] = colsToLoad.sparkDnt;
      }
      if(t.setDnt) {
        colsToLoadLookup[t.setDnt] = colsToLoad.setDnt;
      }
      if(t.gemDnt) {
        colsToLoadLookup[t.gemDnt] = colsToLoad.gemDnt;
      }
    }
  }

  if(colsToLoadLookup[fileName]) {
    return colsToLoadLookup[fileName];
  }
  else if(fileName in colsToLoad) {
    return colsToLoad[fileName];
  }
}

function canRemoveStats(fileName) {
  for(var i=0;i<itemTypes.length;++i) {
    var t = itemTypes[i];
    
    if(t.potentialDnt == fileName) {
      return true;
    }
    else if(t.enchantDnt == fileName) {
      return true;
    }
  }
  
  return false;
}

function getMinLevel(fileName) {
  for(var i=0;i<itemTypes.length;++i) {
    var t = itemTypes[i];
    
    if(t.mainDnt == fileName && 'minLevel' in t) {
      // console.log('got min level');
      return t.minLevel;
    }
  }
  
  return null;
}

function getMinRank(fileName) {
  for(var i=0;i<itemTypes.length;++i) {
    var t = itemTypes[i];
    
    if(t.mainDnt == fileName && 'minRank' in t) {
      // console.log('got min rank');
      return t.minRank;
    }
  }
  
  return null;
}

function isPartsFile(fileName) {
  for(var i=0;i<itemTypes.length;++i) {
    var t = itemTypes[i];
    
    if(t.partsDnt == fileName) {
      return true;
    }
    else if(t.weaponDnt == fileName) {
      return true;
    }
  }
  
  return false;
}

function isItemFile(fileName) {
  
  for(var i=0;i<itemTypes.length;++i) {
    var t = itemTypes[i];
    
    if(t.mainDnt == fileName) {
      return true;
    }
  }
  
  return false;
}

function isEnchantFile(fileName) {
  
  for(var i=0;i<itemTypes.length;++i) {
    var t = itemTypes[i];
    
    if(t.enchantDnt == fileName) {
      return true;
    }
  }
  
  return false;
}


function isPotentialFile(fileName) {
  
  for(var i=0;i<itemTypes.length;++i) {
    var t = itemTypes[i];
    
    if(t.potentialDnt == fileName) {
      return true;
    }
  }
  
  return false;
}

function filterData(fileName, data, potentialsToUse, enchantmentsToUse) {
  
  var newData = [];
  if(isPartsFile(fileName)) {
    
    for(var i=0;i<data.numRows;++i) {
      
      var dSetId = data.getValue(i, 'SetItemID');
      if(dSetId > 0) {
        newData.push(data.data[i]);
      }
    }
  }
  else if(canRemoveStats(fileName)) {
    
    for(var i=0;i<data.numRows;++i) {
      var newRow = [];
      
      for(var c=0;c<data.numColumns;++c) {
        if(data.columnNames[c] == 'State1') {
          break;
        }
        else {
          newRow[c] = data.data[i][c];
        }
      }
      
      for(var s=1;s<=10;++s) {
        var dState = data.getValue(i, 'State' + s);
        if(dState == -1) {
          break;
        }
        else {
          newRow.push(dState);
          var value = data.getValue(i, 'State' + s + 'Value');
          newRow.push(Math.round(value*10000)/10000);
        }
      }
      
      if(isEnchantFile(fileName)) {
        var id = data.getValue(i, 'EnchantID');
        if(id in enchantmentsToUse) {
          newData.push(data.data[i]);
        }
      }
      else if(isPotentialFile(fileName)) {
        var id = data.getValue(i, 'PotentialID');
        if(id in potentialsToUse) {
          var pData = data.getRow(i);

          var found = false;
          for(var q=0;q<i;++q) {
            if(data.getValue(q, 'PotentialID') == id && potentialsMatch(data.getRow(q), pData)) {
              found = true;
              break;
            }
          }

          if(!found) {
            newData.push(newRow);
          }
        }
      }
    }
  }

  if(newData.length > 0) {
    data.data = newData;
    data.numRows = newData.length;
    return true;
  }
  else {
    return false;
  }
}

function potentialsMatch(p1, p2) {
  
  var i = 1;
  var j = 1;
  for(;;) {
    var state1Col = 'State' + i;
    var state2Col = 'State' + j;
    
    if(p1[state1Col] == 107 || p1[state1Col] == 10 || p1[state1Col] == 11 || p1[state1Col] == 13 || p1[state1Col] == 14 || p1[state1Col] == 15) {
      i++;
      state1Col = 'State' + i;
    }
    if(p2[state2Col] == 107 || p2[state2Col] == 10 || p2[state2Col] == 11 || p2[state2Col] == 13 || p2[state2Col] == 14 || p2[state2Col] == 15) {
      j++;
      state2Col = 'State' + j;
    }
    
    if(!(state1Col in p1 || state2Col in p2)) {
      return true;
    }
    
    if(!(state1Col in p1)) {
      return false;
    }
    if(!(state2Col in p2)) {
      return false;
    }
    
    if(p1[state1Col] == -1 && p2[state2Col] == -1) {
      return true;
    }
    
    if(!(p1[state1Col] >= 0 || p2[state2Col] >= 0)) {
      return true;
    }
    
    if(p1[state1Col] != p2[state2Col]) {
      return false;
    }
    
    var val1Col = 'State' + i + 'Value';
    var val2Col = 'State' + j + 'Value';
    if(p1[val1Col] != p2[val2Col]) {
      return false;
    }
    
    ++i;
  }
}

function isValidLevel(levelLimit, minLevel, fileName, nameParam) {
  if(levelLimit < minLevel) {

    // allow radient accessories only
    if(fileName == 'itemtable_equipment.dnt' && nameParam.indexOf('{1000001970}') > -1) {
      return true;
    }
    else {
      return false;
    }
  }
  return true;
}

function skipItemType(dType) {
  return dType == 8 ||
    dType == 9 ||
    dType == 11 ||
    dType == 12 ||
    dType == 13 ||
    dType == 18 ||
    dType == 19 ||
    dType == 20 ||
    dType == 21 ||
    dType == 24 ||
    dType == 29 ||
    dType == 46 ||
    dType == 51 ||
    dType == 74 ||
    dType == 75 ||
    dType == 76 ||
    dType == 78 ||
    dType == 79 ||
    dType == 84 ||
    dType == 100 ||
    dType == 112 ||
    dType == 114 ||
    dType == 115 ||
    dType == 116 ||
    dType == 122 ||
    dType == 142 ||
    dType == 174 ||
    dType == 130 ||
    dType == 182;
}

function skipRank(minRank, dRank) {
  if(minRank && dRank < minRank) {
    return true;
  }

  return false;
}

function skipTechs(data, currentIndex, dLevelLimit, dTypeParam1) {
  for(var i=0;i<currentIndex;++i) {
    if(data.getValue(i, 'LevelLimit') == dLevelLimit &&
      data.getValue(i, 'TypeParam1') == dTypeParam1) {
        return true;
      }
  }
  return false;
}

function isBadPlate(dType, sellAmount, id) {
  if(dType == 38) {
    if(sellAmount === 0) {
      return true;
    }
    
    // Darkness, Fire, Lake, Lucky, Spirited, Strong-Willed, Stunning, Unyielding, Willful
    switch (id) {
      case 268466900:
      case 268473768:
      case 268473727:
      case 268466739:
      case 268466743:
      case 268473587:
      case 268473809:
      case 268473554:
      case 268466734:
      case 268473850:
      case 268466727:
      case 268466726:
      case 268473850:
      case 268466896:
      case 268466894:
      case 268474015:
      case 268474171:
      case 268466733:
      case 268466898:
      case 268473842:
      return true;
    }
  }

  return false;
}

function isAnnoyingItem(nameParam) {
  return nameParam && nameParam.indexOf && nameParam.indexOf('{1000116119}') >= 0;
}

function filterItemData(fileName, data) {
  
  var newData = [];
  var minLevel = getMinLevel(fileName);
  var minRank = getMinRank(fileName);
    // console.log('filtering to ' + minLevel);
  
  for(var i=0;i<data.numRows;++i) {
    
    var dType = data.getValue(i, 'Type');
    if(skipItemType(dType)) {
      continue;
    }

    var dLevelLimit = data.getValue(i, 'LevelLimit');
    var dNameIDParam = data.getValue(i, 'NameIDParam');
    if(!isValidLevel(dLevelLimit, minLevel, fileName, dNameIDParam)) {        
      continue;
    }

    if(isAnnoyingItem(dNameIDParam)) {
      continue;
    }

    var dRank = data.getValue(i, 'Rank');
    if(skipRank(minRank, dRank)) {
      continue;
    }

    var sellAmount = data.getValue(i, 'SellAmount');
    var id = data.getValue(i, 'id');
    if(isBadPlate(dType, sellAmount, id)) {
      continue;
    }
    
    var dState1max = data.getValue(i, 'State1_Max');
    var dStateValue1 = data.getValue(i, 'StateValue1');
    var dTypeParam1 = data.getValue(i, 'TypeParam1');

    // skip items with no data
    if(dState1max > 0 || dStateValue1 > 0 || dTypeParam1 > 0) {

      if(fileName == 'itemtable_skilllevelup.dnt') {
        if(skipTechs(data, i, dLevelLimit, dTypeParam1)) {
          continue;
        }
      }

      newData.push(data.data[i]);
    }
  }

  if(newData.length > 0) {
    data.data = newData;
    data.numRows = newData.length;
    return true;
  }
  else {
    return false;
  }
}

function outputFile(data, fileName) {
  try
  {
    // console.log('writing file: ' + fileName);
    // console.log('should be ' + data.length * 2 + 'bytes');
    fs.writeFileSync(fileName, data);
  }
  catch(ex) {
    console.log('--- ERROR --- ');
    console.log('--- ERROR --- ');
    console.log('--- ERROR --- ');
    console.log(ex);
  }
}

function readFile(filePath) {
  return fs.readFileSync(filePath);
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

function fileExists(path) {

  try  {
    return fs.statSync(path).isFile();
  }
  catch (e) {

    if (e.code == 'ENOENT') { // no such file or directory. File really does not exist
      // console.log("File does not exist.");
      return false;
    }

    console.log("Exception fs.statSync (" + path + "): " + e);
    throw e; // something else went wrong, we don't have rights, ...
  }
}