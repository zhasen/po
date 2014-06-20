var DomainPlugin = require('../DomainPlugin');
var redis = require('../../../commons/redis');
var logger = require('../../../commons/logging').logger;
var CommonKeys = require('../../../kvs/CommonKeys');
var async = require("async");
var plugin = new DomainPlugin({
    name: 'listAll',
    prop: 'listAll',
    methodPlugin: true,
    use: function(schema, options){
        //Add a instance method to ensure id: generate, set and return id
        var method = this.prop;
        var schemaName = schema.name();
        var modelKey = schema.option('modelKey');
        var colKey = CommonKeys.collectionGenerator(modelKey, 'all');

        schema.static(method, function (returnModel, callback) {
            var Model = schema.model();
            var loadModel = function(id, next){
                var key = CommonKeys.objectGenerator(modelKey, id);
                redis.hgetall(key, function(err, result){
                    if(err){
                        logger.error('Fail to load '+schemaName+' by id='+id+' : ' + err);
                        next(err, null);
                        return;
                    }

                    if(result){
                        logger.debug('Succeed to load '+schemaName+' by id='+id);
                        var obj = result;
                        if(Model.prototype._fromData){
                            var model = Model.i();
                            model._fromData(result);
                            if(returnModel){ //TODO
                                obj = model;
                            }
                            else{
                                obj = model.json();
                            }
                        }
                        next(err, obj);
                    }
                    else{
                        next(null, null);
                    }
                });
            };
            redis.zrevrange(colKey, 0, -1, function (err, list) {
                if (err) {
                    logger.error('Fail to list '+schemaName+':' + err);
                    if(callback) callback(err, null);
                    return;
                }
                if (list) {
                    async.map(list, loadModel, function (err, models) {
                        if(err){
                            if(callback) callback(null, []);
                        }
                        else{
                            if(callback) callback(null, models);
                        }
                    });
                }
                else {
                    if(callback) callback(null, []);
                }
            });
        });
    }
});

module.exports = plugin;