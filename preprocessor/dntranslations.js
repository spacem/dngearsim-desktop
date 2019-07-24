// var LZString = require('lz-string');
var DOMParser = require('xmldom').DOMParser;

module.exports = function DnTranslations() {
  // module used to load uistring.xml files

  // the data
  this.sizeLimit = null;
  
  // function to read in the xml data
  // and store it as an array for fast access
  // once loaded it tries to store the data in UIStrings session storage
  this.process = function(xmlFileAsString) {
    const data = {}
    var numItems = 0;
    
    // console.log("processing:");
    var parser = new DOMParser();
    var xmlData = parser.parseFromString(xmlFileAsString,"text/xml");
    var elements = xmlData.getElementsByTagName("message");
    console.log(elements.length + ' string entries found');
    
    for(var m=0;m<elements.length;++m) {
      var text = elements[m].textContent;
      if(this.sizeLimit === null || text.length < this.sizeLimit) {
        var mid = elements[m].getAttribute("mid");
        data[mid] = text;
        numItems++;
      }
    }
    
    console.log('loaded ' + numItems + ' translations');
    return data;
  }
}
