var u = require('../../commons/util');

var DomainPlugin = function(o){
    u.extend(this, o);
    if(!this.name){
        throw new Error('"name" is required and unique');
    }
    if(!this.prop){
        throw new Error('"prop" is required');
    }
    if(!this.methodPlugin && !this.type){
        throw new Error('"type" is required');
    }
    this.methodName = 'with' + this.name.charAt(0).toUpperCase() + this.name.slice(1);
};
DomainPlugin.prototype = {
    /*
     *  The identifier is used in builder. make sure it is unique in all plugins.
     *  i.e. if name is createBy and the plugin is registered,
     *  then withCreatedBy method will be generated in builder.
     */
    name: null,
    prop: null, //property name in domain.object which will be stored in db layer
    type: null, //domain types. i.e. {type: String, required: true}
    methodPlugin: false,
    register: function(builderClass){
        var plugin = this;
        builderClass.prototype[this.methodName] = function(options){
            this.pluginProperties[plugin.prop] = options;
            return this;
        };
    },
    use: function(domain, options){
        console.log('DomainPlugin ' + this.name + ' is used');
    }
};

module.exports = DomainPlugin;