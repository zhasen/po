var time = require('../commons/time');
var defaultPattern = 'yyyy-MM-dd hh:mm:ss'; //TODO: configure it settings
Date.prototype.format = function(pattern){
    if(!pattern){
        pattern = defaultPattern;
    }
    return time.format(this, pattern);
};

module.exports = function(){
};