var typeRegistry = require('../../models/TypeRegistry');
var PageInput = function(){
    this.page = {};
};
PageInput.i = function(){
    return new PageInput();
};
PageInput.prototype = {
    enums: function(types){
        this.page.enums = typeRegistry.dict(types);
        return this;
    }
};

module.exports = PageInput;