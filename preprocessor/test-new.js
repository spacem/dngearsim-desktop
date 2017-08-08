var start = new Date().getTime();

var PaksUtil = require('./paks-util');
var util = new PaksUtil('C:\\games\\DragonNestNA', 'c:\\tmp');
util.loadFiles().then(() => {
    console.log('loaded files');
    util.extractDntFiles().then(() => {
        var end = new Date().getTime();
        var time = end - start;
        console.log('took: ' + time/1000 + 's for');
    }).catch(err => {
        console.log(err);
    });
});
