var fs = require('fs');
var OldDnTranslations = require('../preprocessor/dntranslations');
module.exports = class DnTranslations {

    constructor() {
      this.original = new OldDnTranslations();
    }

    loadFromSession() {
        return false;
    }

    translate(value) {
      return this.original.translate(value);
    }

    loadDefaultFile(fileName, callback, complete, fail) {
      if(fileName.indexOf('file:') == 0) {
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
                this.original.data = this.data;
                if(complete) {
                    complete();
                }
            }
        });
      }
      else {
        console.log('using original ui string loader for file ', fileName);
        this.original.loadDefaultFile(fileName, callback, complete, fail);
      }
    }
}
