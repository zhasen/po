var typeRegistry = require('../../models/TypeRegistry');
var PageInput = function(){
    this.page = {};
};
PageInput.i = function(req){
    if(req){
        if(!req.pageInput){
            req.pageInput = new PageInput();
        }
        req.pageInput.putUser(req);
        return req.pageInput;
    }
    else{
        return new PageInput();
    }
};

PageInput.prototype = {
    enums: function(types){
        this.page.enums = typeRegistry.dict(types);
        return this;
    },
    put: function(name, value){
        this.page[name] = value;
        return this;
    },
    putUser: function(req){
        this.page.user = req.session.user;
        return this;
    }

};

module.exports = PageInput;