var util = {};
util.extend = function(obj, source) {
    for (var prop in source) {
        obj[prop] = source[prop];
    }
    return obj;
};
util.extendAll = function(target, source){
    for (var prop in source) {
        if(typeof source[prop]=='object'){
            if(typeof target[prop]!='object'){
                target[prop] = {};
            }
            util.extendAll(target[prop], source[prop]);
        }
        else{
            target[prop] = source[prop];

        }
    }
    return target;
};
util.clone = function(source) {
    return util.extend({},source);
};
util.defaults = function(obj, source) {
    for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
    }
    return obj;
};
util.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return typeof value === 'function' ? value.call(object) : value;
};


module.exports = {
    extend: util.extend,
    extendAll: util.extendAll,
    clone: util.clone,
    defaults: util.defaults,
    result: util.result
};