var u = require('../../commons/util');
var Schema = function(name){
    this._name = name;
    this._model = null;
    this._options = {};
    this._properties = {};
    this._virtualProperties = {};
    this._methods = {};
    this._staticMethods = {};
    this._queue = [];
    this._eventQueue = {};
};
Schema.prototype = {
    name: function(name){
        if(name){
            this._name = name;
        }
        else{
            return this._name;
        }
    },
    model: function(model){
        if(model){
            this._model = model;
        }
        else{
            return this._model;
        }
    },
    option: function(name, config){
        if(typeof name === 'string'){
            return this._accessor(this._options, false, name, config);
        }
        else{
            //when name is not string, the method is map setter
            u.extend(this._options, name);
        }
    },
    eachOption: function(cb){
        this._eachMap(this._options, cb);
    },

    property: function(name, config){
        if(typeof name === 'string'){
            return this._accessor(this._properties, true, name, config);
        }
        else{
            //when name is not string, the method is map setter
            u.extend(this._properties, name);
        }
    },
    eachProperty: function(cb){
        this._eachMap(this._properties, cb);
    },

    virtual: function(name, config){
        if(typeof name === 'string'){
            return this._accessor(this._virtualProperties, true, name, config);
        }
        else{
            //when name is not string, the method is map setter
            u.extend(this._virtualProperties, name);
        }
    },
    eachVirtualProperty: function(cb){
        this._eachMap(this._virtualProperties, cb);
    },

    method: function(name, config){
        if(typeof name === 'string'){
            return this._accessor(this._methods, false, name, config);
        }
        else{
            //when name is not string, the method is map setter
            u.extend(this._methods, name);
        }
    },
    eachMethod: function(cb){
        this._eachMap(this._methods, cb);
    },

    static: function(name, config){
        if(typeof name === 'string'){
            return this._accessor(this._staticMethods, false, name, config);
        }
        else{
            //when name is not string, the method is map setter
            u.extend(this._staticMethods, name);
        }
    },
    eachStaticMethod: function(cb){
        this._eachMap(this._staticMethods, cb);
    },
    pre: function(method, processor){
        var processors = this._eventQueue['pre-'+method];
        if(!processors){
            processors = this._eventQueue['pre-'+method] = [];
        }
        processors.push(processor);
    },
    post: function(method, processor){
        var processors = this._eventQueue['post-'+method];
        if(!processors){
            processors = this._eventQueue['post-'+method] = [];
        }
        processors.push(processor);
    },
    _getProcessors: function(eventType, method){
        return this._eventQueue[eventType+'-'+method];
    },
    _accessor: function(map, objectConfig, name, config){
        var c = map[name];
        if(config){
            if(objectConfig){
                if(c){
                    u.extend(c, config);
                }
                else{
                    map[name] = u.clone(config);
                }
            }
            else{
                map[name] = config;
            }
            return;
        }
        else{
            return c;
        }
    },
    _eachMap: function(map, cb){
        for(var n in map){
            var v = map[n];
            cb(n, v);
        }
    }
};

module.exports = Schema;