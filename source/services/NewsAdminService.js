var logger = require('../commons/logging').logger;
var redis = require("../commons/redis");
var time = require('../commons/time');
var NewsAdmin = require('../models/NewsAdmin').model;
var Service = {};

//查询全部消息
Service.listAllNews = function(callback) {
    NewsAdmin.listAll(false, callback);
};

//添加
Service.insert = function (json, callback) {
    var model = NewsAdmin.i(json);
    model.save(callback);
};
//查询单挑
Service.getById = function(id,callback) {
    NewsAdmin.loadById(id, false, callback);
};
//编辑
Service.update = function(id,obj,callback) {
    NewsAdmin.loadById(id, true, function (err, item) {
        item.set('title', obj.title);
        item.set('content', obj.content);
        item.set('to', obj.to );
        item.save(callback);
    });
};

//删除
Service.delete = function(id,callback) {
    NewsAdmin.delete(id,callback);
};

module.exports = Service;
