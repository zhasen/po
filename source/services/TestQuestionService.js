var settings = require('../../settings');
var logger = require('../commons/logging').logger;
var redis = require("../commons/redis");
var idGenerator = require('../../source/commons/id');
var time = require('../../source/commons/time');
var keys = require('../kvs/TestQuestionKeys');
var async = require("async");
var TestQuestion = require('../models/TestQuestion').model; // 试题属性model
var TestQuestionContent = require('../models/TestQuestionContent').model; // 试题内容model
var typeRegistry = require('../models/TypeRegistry');
var CommonServiceHelper = require('./CommonServiceHelper');
var Service = {};

// 获取试题列表
Service.listTestQuestions = function (callback) {
    TestQuestion.listAll(false, callback);
};

// 用ASYNC集成 insertAttr 和 saveContent
Service.insert = function (json, callback) {
    var item = TestQuestion.i(json['attrs']);
    async.series([
            function (cb) { // 插入试题属性
                item.set('erPublish', typeRegistry.erPublishStatus.Unpublished.value()); // 默认
                item.set('erAudit', typeRegistry.erAuditStatus.Unaudited.value()); // 默认
                item.save(function (err, result) {
                    cb(err, result);
                });
            },
            function (cb) { // 插入试题内容
                Service.saveContent({'id': item.get('id'), 'define': json['content'].define}, function (err, result) {
                    cb(err, result);
                });
            }
        ],
        function (err, results) {
            if (err) {
                throw err; // TODO do more error handling
            }
            if (results[0]) {
                console.info('result[0] ; ' + JSON.stringify(results[0]));
            }
            if (results[1]) {
                console.info('result[1] ; ' + JSON.stringify(results[1]));
            }
            callback(err, results);
        }
    );
};

// 用ASYNC集成 updateAttr 和 saveContent
Service.update = function (id, json, callback) {
    async.parallel([
            function (cb) { // 更新试题属性
                Service.updateAttr(id, json['attrs'], function (err, result) {
                    cb(err, result);
                });
            },
            function (cb) { // 插入试题内容
                Service.saveContent({'id': id, 'define': json['content'].define}, function (err, result) {
                    cb(err, result);
                });
            }
        ],
        function (err, results) {
            if (err) {
                throw err; // TODO do more error handling
            }
            if (results[0]) {
                console.info('result[0] ; ' + JSON.stringify(results[0]));
            }
            if (results[1]) {
                console.info('result[1] ; ' + JSON.stringify(results[1]));
            }
            callback(err, results);
        }
    );
};

// 用ASYNC集成 getAttrById 和 getContentById
Service.getById = function (id, callback) {
    async.parallel([
            function (cb) { // 获取试题属性
                Service.getAttrById(id, function (err, result) {
                    cb(err, result);
                });
            },
            function (cb) { // 获取试题内容
                Service.getContentById(id, function (err, result) {
                    cb(err, result);
                });
            }
        ],
        function (err, results) {
            if (err) {
                throw err; // TODO do more error handling
            }
            if (results[0]) {
                console.info('result[0] ; ' + JSON.stringify(results[0]));
            }
            if (results[1]) {
                console.info('result[1] ; ' + JSON.stringify(results[1]));
            }
            callback(err, results);
        }
    );
};

// 用ASYNC集成 deleteAttr 和 deleteContentById
Service.delete = function (id, callback) {
    async.parallel([
            function (cb) { // 获取试题属性
                Service.deleteAttr(id, function (err, result) {
                    cb(err, result);
                });
            },
            function (cb) { // 获取试题内容
                Service.deleteContentById(id, function (err, result) {
                    cb(err, result);
                });
            }
        ],
        function (err, results) {
            if (err) {
                throw err; // TODO do more error handling
            }
            if (results[0]) {
                console.info('result[0] ; ' + JSON.stringify(results[0]));
            }
            if (results[1]) {
                console.info('result[1] ; ' + JSON.stringify(results[1]));
            }
            callback(err, results);
        }
    );
};

// 插入试题属性
Service.insertAttr = function (json, callback) {
    var item = TestQuestion.i(json);
    item.set('erPublish', typeRegistry.erPublishStatus.Unpublished.value()); // 默认
    item.set('erAudit', typeRegistry.erAuditStatus.Unaudited.value()); // 默认
    item.save(callback);
};

// 更新试题属性
Service.updateAttr = function (id, obj, callback) {
    TestQuestion.loadById(id, true, function (err, item) {
        item.set('name', obj.name);
        item.set('region', obj.region);
        item.set('org', obj.org);
        item.set('erType', obj.erType);
        item.set('erRisk', obj.erRisk);
        item.set('erYear', obj.erYear);
        item.save(callback);
    });
};

// 获取试题属性
Service.getAttrById = function (id, callback) {
    TestQuestion.loadById(id, false, callback);
};

// 删除试题属性
Service.deleteAttr = function (id, callback) {
    TestQuestion.delete(id, callback);
};

// 存储试题内容
Service.saveContent = function (content, callback) {
    var model = TestQuestionContent.i();
    model.set("id", content.id);
    model.set("define", content.define);
    model.save(function (err, content) {
        callback(err, content.get("id"));
    });
};

// 获取试题内容
Service.getContentById = function (id, callback) {
    TestQuestionContent.loadById(id, false, callback);
};

// 删除试题内容
Service.deleteContentById = function (id, callback) {
    TestQuestionContent.delete(id, callback);
};

var actions = {
    publish: {
        property: 'erPublish',
        value: typeRegistry.erPublishStatus.Published.value()
    },
    unpublish: {
        property: 'erPublish',
        value: typeRegistry.erPublishStatus.Unpublished.value()
    },
    audit: {
        property: 'erAudit',
        value: typeRegistry.erAuditStatus.Audited.value()
    },
    unaudit: {
        property: 'erAudit',
        value: typeRegistry.erAuditStatus.Unaudited.value()
    }
};

CommonServiceHelper.generatePropertyActions(Service, TestQuestion, actions);

module.exports = Service;