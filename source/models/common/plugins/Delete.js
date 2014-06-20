var DomainPlugin = require('../DomainPlugin');
var redis = require('../../../commons/redis');
var logger = require('../../../commons/logging').logger;
var CommonKeys = require('../../../kvs/CommonKeys');
var async = require("async");

var plugin = new DomainPlugin({
    name: 'delete',
    prop: 'delete',
    methodPlugin: true,
    use: function(schema, options){
        var method = this.prop;
        var schemaName = schema.name();
        var modelKey = schema.option('modelKey');
        schema.method(method, function (callback) {
            var id = this.get('id');
            var objKey = CommonKeys.objectGenerator(modelKey, id);
            var colKey = CommonKeys.collectionGenerator(modelKey, 'all');

            async.series([
                function(cb){
                    redis.zrem(colKey, id, function(err, result){
                        if(err){
                            logger.error('Fail to remove '+schemaName+' '+id+' from model-all: ' + err);
                            cb(err, false);
                            return;
                        }
                        logger.debug('Succeed to remove '+schemaName+' '+id+' from model-all');
                        cb(null, true);
                    });
                }
                ,function(cb){
                    redis.del(objKey, function(err, result){
                        if(err){
                            logger.error('Fail to delete '+schemaName+' '+id+': ' + err);
                            cb(err, false);
                            return;
                        }
                        logger.debug('Succeed to delete '+schemaName+' '+id);
                        cb(null, true);
                    });
                }],
                function(err, results){
                    if(err){
                        logger.error('Fail to delete '+schemaName+' '+id+': ' + err);
                        cb(err);
                        return;
                    }
                    if(callback) callback(null, id);
                }
            );
        });
        schema.static(method, function (id, callback) {
            var objKey = CommonKeys.objectGenerator(modelKey, id);
            var colKey = CommonKeys.collectionGenerator(modelKey, 'all');

            async.series([
                function(cb){
                    redis.zrem(colKey, id, function(err, result){
                        if(err){
                            logger.error('Fail to remove '+schemaName+' '+id+' from model-all: ' + err);
                            cb(err, false);
                            return;
                        }
                        logger.debug('Succeed to remove '+schemaName+' '+id+' from model-all');
                        cb(null, true);
                    });
                }
                ,function(cb){
                    redis.del(objKey, function(err, result){
                        if(err){
                            logger.error('Fail to delete '+schemaName+' '+id+': ' + err);
                            cb(err, false);
                            return;
                        }
                        logger.debug('Succeed to delete '+schemaName+' '+id);
                        cb(null, true);
                    });
                }],
                function(err, results){
                    if(err){
                        logger.error('Fail to delete '+schemaName+' '+id+': ' + err);
                        cb(err);
                        return;
                    }
                    if(callback) callback(null, id);
                }
            );
        });

    }
});

module.exports = plugin;