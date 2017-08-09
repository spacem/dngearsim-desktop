var fs = require('fs');
module.exports = class DnTranslations {
    constructor() {
    }

    loadFromSession() {
        return false;
    }
  
  // function to lookup some string value by its id
  // this will also work with values that have a number
  // of mids enclosed in curly brackets
 translate(value) {
    if(this.data === null) {
      return value;
    }
    var result = "";
    
    if(value === 0 || value === "" || value === null) {
      result = value;
    }
    else if(value.toString().indexOf(',') > -1) {
      var values = value.toString().split(',');
      
      var results = []
      for(var v=0;v<values.length;++v) {
        var stripped = values[v].replace("{", "").replace("}", "");
        results.push(values[v].replace(stripped, this.translate(stripped)));
      }
      
      result = results.join(',');
    }
    else {
      result = this.data[value];
      if(typeof result === 'undefined') {
        if(typeof value === 'string') {
          if(value.indexOf('{') == 0) {
            var stripped = value.replace("{", "").replace("}", "");
            result = value.replace(stripped, this.translate(stripped));
          }
          else {
            result = value.toString();
          }
        }
        else {
          result = value;
        }
      }
      else if(typeof value === 'string' && result.indexOf('#N/A') == 0) {
        result = '';
      }
    }
    
    return result;
  }

    loadDefaultFile(fileName, callback, complete, fail) {
        var workFolder = localStorage.getItem('workFolder');
        if(!workFolder) {
            workFolder = __dirname + '\\working';
        }

        fs.readFile(workFolder + '\\uistring.json', 'utf8', (err, data) => {    
            if(err) {
                console.log(err);
                if(fail) {
                    fail(err);
                }
            }
            else {
                this.data = JSON.parse(data);
                if(complete) {
                    complete();
                }
            }
        });
    }
}
