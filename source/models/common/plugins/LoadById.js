var DomainPlugin = require('../DomainPlugin');
var redis = require('../../../commons/redis');
var logger = require('../../../commons/logging').logger;
var CommonKeys = require('../../../kvs/CommonKeys');
var plugin = new DomainPlugin({
    name: 'loadById',
    prop: 'loadById',
    methodPlugin: true,
    use: function(schema, options){

        //Add a instance method to ensure id: generate, set and return id
        var method = this.prop;
        var schemaName = schema.name();
        var modelKey = schema.option('modelKey');
        schema.static(method, function (id, returnModel, callback) {
            var key = CommonKeys.objectGenerator(modelKey, id);
            var Model = schema.model();
            redis.hgetall(key, function(err, result){
                if(err){
                    logger.error('Fail to load '+schemaName+' by id='+id+' : ' + err);
                    if(callback) callback(err, null);
                    return;
                }

                if(result){
                    logger.debug('Succeed to load '+schemaName+' by id='+id);
                    var obj = result;
                    if(Model.prototype._fromData){
                        var model = Model.i(result);
                        if(returnModel){
                            model._fromData(result);
                            model.saved(true);// set saved after inserted
                            obj = model;
                        }
                        else{
                            obj = model.json();
                        }
                    }

                    if(callback) callback(err, obj);
                }
                else{
                    if(callback) callback(null, null);
                }
            });
        })
    }
});

module.exports = plugin;