var u = require('../../commons/util');
var logger = require('../../commons/logging').logger;
var Schema = require('./Schema');
var Domain = require('./Domain');

var DomainBuilder = function(registry){
    this.registry = registry;
    this.options = {};
    this.pluginProperties = {}
    this.properties = {}
    this.virtualProperties = {};
    this.methods = {};
    this.staticMethods = {};
};

DomainBuilder.prototype.withName = function(name){
    this.name = name;
    return this;
};

DomainBuilder.prototype.withBasis = function(){
    this.withBasicOptions();
    this.withBasicProperties();
    return this;
};

/**
 * @private
 * @returns {*}
 */
DomainBuilder.prototype.withBasicOptions = function(){
    u.extend(this.options, this.registry.baseOptions); //Append basic options' definition
    return this;
};

/**
 * @private
 * @returns {*}
 */
DomainBuilder.prototype.withBasicProperties = function(){
    this.registry.basicPlugins.forEach(function(plugin, index){
        this.pluginProperties[plugin.prop] = null;
    }, this);
    return this;
};

DomainBuilder.prototype.withProperties = function(props){
    u.extend(this.properties, props);
    return this;
};

DomainBuilder.prototype.withOptions = function(options){
    u.extend(this.options, options);
    return this;
};

DomainBuilder.prototype.withProperty = function(name, config){
    this.properties[name] = config;
    return this;
};

DomainBuilder.prototype.withVirtualProperty = function(name, config){
    this.virtualProperties[name] = config;
    return this;
};

DomainBuilder.prototype.withMethod = function(name, method){
    this.methods[name] = method;
    return this;
};

DomainBuilder.prototype.withStaticMethod = function(name, method){
    this.staticMethods[name] = method;
    return this;
};

DomainBuilder.prototype.build = function(){
    var schema = new Schema(this.name);
    schema.option(this.options);
    schema.property(this.properties);
    schema.virtual(this.virtualProperties);
    schema.method(this.methods);
    schema.static(this.staticMethods);
    for(var prop in this.pluginProperties){
        this.registry.plugins[prop].use(schema, this.pluginProperties[prop]);
    }

    var domain = this.registry.add(schema);

    return domain;
};

module.exports = DomainBuilder;