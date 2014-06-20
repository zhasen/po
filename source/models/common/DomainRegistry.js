var u = require('../../commons/util');
var Domain = require('./Domain');
var Model = require('./Model');

var DomainRegistry = function(builderClass){
    this.builderClass = builderClass;
    this.domains = {};
    this.plugins = {};
    this.basicPlugins = [];
    this.baseOptions = {};
};
DomainRegistry.prototype = {
    domainBuilder: function(){
        return new this.builderClass(this);
    },
    get: function(name){
        return this.domains[name];
    },
    add: function(schema){
        var domain = new Domain();
        var name = schema.name();
        domain.schema = schema;
        domain.model = this.buildModel(schema);
        this.domains[name] = domain;
        return domain;
    },
    buildModel: function(schema){
        var defaults = {};
        var defaultLength = 0;
        var init = function(json){
            var data = json || {};
            if(defaultLength){
                for(var p in defaults){
                    if(!data.hasOwnProperty(p)){
                        data[p] = u.result(defaults, p);
                    }
                }
            }
            this._data = data;

        };
        var M = function(json){
            init.call(this, json);
        };

        /*
         *  predefined method schema which is used to get schema object of the model
         */
        M.prototype = {
            schema: function(){return schema;}
        };

        u.extend(M.prototype, Model.prototype);

        //generate _toData and _fromData
        var objProps = [];
        schema.eachProperty(function(name, value){
            if(typeof value.defaultValue !== 'undefined'){
                defaults[name] = value.defaultValue;
                defaultLength++;
            }
            value.prop = name;
            if(value.toData){
                objProps.push(value);
            }
        });
        if(objProps.length>0){
            M.prototype._toData = function(){
                var data = this.toJson();
                var prop = null;
                for(var i=0; i<objProps.length; i++){
                    prop = objProps[i].prop;
                    data[prop] = objProps[i].toData(data[prop]);
                }
                return data;
            };
            M.prototype._fromData = function(data){
                this._data = data;
                var prop = null;
                for(var i=0; i<objProps.length; i++){
                    prop = objProps[i].prop;
                    this._data[prop] = objProps[i].fromData(data[prop]);
                }
            };
        }

        var generateProcessor = function(eventType, method){
            var processors = schema._getProcessors(eventType, method);
            var chain = !processors ? null : function(scope){
                var preIndex = 0;
                var next = function(){
                    if(preIndex<processors.length){
                        processors[preIndex++].call(scope, next);
                    }
                };
                next();
            };
            return chain;
        };
        schema.eachMethod(function(method, handler){
            var preChainHandler = generateProcessor('pre', method);
            var postChainHandler = generateProcessor('post', method);

            if(preChainHandler && postChainHandler){
                M.prototype[method] = function(){
                    var ret = null;
                    preChainHandler(this);
                    ret = handler.apply(this, arguments);
                    postChainHandler(this);
                    return ret;
                };
            }
            else if(preChainHandler && !postChainHandler){
                M.prototype[method] = function(){
                    var ret = null;
                    preChainHandler(this);
                    ret = handler.apply(this, arguments);
                    return ret;
                };
            }
            else if(!preChainHandler && postChainHandler){
                M.prototype[method] = function(){
                    var ret = null;
                    ret = handler.apply(this, arguments);
                    postChainHandler(this);
                    return ret;
                };
            }
            else{
                M.prototype[method] = function(){
                    return handler.apply(this, arguments);
                };
            }
        });

        M.i = function(json){
            return new M(json);
        };

        schema.eachStaticMethod(function(method, handler){
            M[method] = handler;
        });
        schema.model(M);
        return M;
    },
    addPlugin: function(plugin, basic){
        this.plugins[plugin.prop] = plugin;
        plugin.register(this.builderClass);
        if(basic){
            this.basicPlugins.push(plugin);
        }
    },
    option: function(name, value){
        if(typeof value !== 'undefined'){
            this.baseOptions[name] = value;
        }
        else{
            return this.baseOptions[name];
        }
    }

};

module.exports = DomainRegistry;