var CommonKeys = require('./CommonKeys');
module.exports = {
    list: function(){return CommonKeys.prefix + 'tq:all'},
    obj: function(obj){return CommonKeys.prefix + 'tq:obj:'+obj.id}
};