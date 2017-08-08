var DOMParser = require('xmldom').DOMParser;

module.exports = function DnTranslations() {
  // module used to load uistring.xml files

  // the data
  this.data = null;
  this.sizeLimit = null;
  
  
  // function to read in the xml data
  // and store it as an array for fast access
  // once loaded it tries to store the data in UIStrings session storage
  this.process = function(xmlFileAsString, callback, complete) {
    this.data = {}
    var numItems = 0;
    
    // console.log("processing:");
    
    var parser = new DOMParser();
    var xmlData = parser.parseFromString(xmlFileAsString,"text/xml");
    var elements = xmlData.getElementsByTagName("message");
    
    for(var m=0;m<elements.length;++m) {
      var text = elements[m].textContent;
      if(this.sizeLimit == null || text.length < this.sizeLimit) {
        var mid = elements[m].getAttribute("mid");
        this.data[mid] = text.replace(/\\n/g, ' ').replace(/\n/g, ' ').replace(/#r/g, '').replace(/#Y/g, '').replace(/#y/g, '').replace(/#w/g, '').replace(/#j/g, '').replace(/#s/g, '').replace(/#j/g, '').replace(/#v/g, '');
        numItems++;
      }
    }
    
    callback('loaded ' + numItems + ' translations');
    complete();
  }
  
  // function to load xml file from url
  // if the file is not found we look for a zip verison and then unzip it
  // it tries to find the already loaded data in UIStrings session storage
  // and uses this if it can
  this.loadDefaultFile = function(fileName, callback, complete, fail) {
    //console.log("about to load");
    
    if(this.data != null && typeof this.data == 'object') {
      callback('using uistrings stored in session storage');
      complete();
    }
    else if(fileName == null) {
      callback('Translation location required');
    }
    else {
      //console.log('data still not set');
    
      var t = this;
      fs.readFile( fileName, function (err, data) {
        if (err) {
          throw err; 
        }
        t.process(data.toString(), callback, complete);
        //console.log(data.toString());
      });
    
    }
  }

  function onerror(message) {
    console.error(message);
  }
}