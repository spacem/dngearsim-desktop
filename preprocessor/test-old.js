var start = new Date().getTime();

var ExtractPaks = require('./extract-paks');
var util = new ExtractPaks('C:\\games\\DragonNestNA', 'c:\\tmp');
util.extract();
var end = new Date().getTime();
var time = end - start;
console.log('took: ' + time/1000 + 's for');
