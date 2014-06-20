var u = require('../../commons/util');

var Model = function(json){
    this._data = json || {}; //as of now, it is never used. can be deleted later
};

Model.prototype = {
    get: function(prop){
        return this._data[prop];
    },
    set: function(prop, value){
        this._data[prop] = value;
    },
    saved: function(saved){
        if(saved){
            this._saved = saved;
        }
        else{
            return this._saved || this.get('v');
        }
    },
    json: function(){
        return this._data;
    },
    toJson: function(options){
        return u.clone(this._data);
    }
};

module.exports = Model;