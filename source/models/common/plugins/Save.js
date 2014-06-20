var DomainPlugin = require('../DomainPlugin');
var redis = require('../../../commons/redis');
var logger = require('../../../commons/logging').logger;
var CommonKeys = require('../../../kvs/CommonKeys');
var async = require("async");

var plugin = new DomainPlugin({
    name: 'save',
    prop: 'save',
    methodPlugin: true,
    use: function(schema, options){
        var method = this.prop;
        var schemaName = schema.name();
        var modelKey = schema.option('modelKey');
        schema.method('insert', function (callback) {
            var me = this;
            var data = this._toData ? this._toData() : this.json();
            var objKey = CommonKeys.objectGenerator(modelKey, data.id);
            var colKey = CommonKeys.collectionGenerator(modelKey, 'all');
            var score = data.updOn || data.crtOn || 1;
            async.series([
                function(cb){
                    redis.hmset(objKey, data, function(err, result){
                        if(err){
                            logger.error('Fail to insert '+schemaName+': ' + err);
                            cb(err, me);
                            return;
                        }
                        if(result=='OK'){
                            logger.debug('Succeed to insert '+schemaName);
                            cb(err, me);
                        }
                        else{
                            cb(new Error('Fail to insert '+schemaName+': ' + JSON.stringify(data)), me);
                        }
                    });
                }
                ,function(cb){
                    redis.zadd(colKey, score, data.id, function(err, result){
                        if(err){
                            logger.error('Fail to add '+schemaName+' id to model-all: ' + err);
                            cb(err, 0);
                            return;
                        }
                        logger.debug('Succeed to push '+schemaName + ' id to model-all');
                        cb(null, result);
                    });
                }],
                function(err, results){
                    if(err){
                        logger.error('Fail to insert '+schemaName+': ' + err);
                        cb(err, me);
                        return;
                    }
                    me.saved(true);// set saved after inserted
                    if(callback) callback(null, me);
                }
            );
        });

        schema.method('update', function (callback) {
            var me = this;
            var data = this._toData ? this._toData() : this.json();
            var objKey = CommonKeys.objectGenerator(modelKey, data.id);
            var colKey = CommonKeys.collectionGenerator(modelKey, 'all');
            var score = data.updOn || data.crtOn || 1;
            async.series([
                function(cb){
                    redis.hmset(objKey, data, function(err, result){
                        if(err){
                            logger.error('Fail to update '+schemaName+': ' + err);
                            cb(err, me);
                            return;
                        }
                        if(result=='OK'){
                            logger.debug('Succeed to update '+schemaName);
                            cb(err, me);
                        }
                        else{
                            cb(new Error('Fail to update '+schemaName+': ' + JSON.stringify(data)), me);
                        }
                    });
                }
                ,function(cb){
                    redis.zadd(colKey, score, data.id, function(err, result){
                        if(err){
                            logger.error('Fail to add '+schemaName+' id to model-all: ' + err);
                            cb(err, 0);
                            return;
                        }
                        logger.debug('Succeed to add '+schemaName + ' id to model-all');
                        cb(null, result);
                    });
                }],
                function(err, results){
                    if(err){
                        logger.error('Fail to update '+schemaName+': ' + err);
                        cb(err, me);
                        return;
                    }
                    if(callback) callback(null, me);
                }
            );
        });

        schema.method(method, function (callback) {
            if(this.saved()){//update
                this.update(callback);
            }
            else{//insert
                this.insert(callback);
            }
        });
    }
});

module.exports = plugin;