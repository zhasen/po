var logger = require('../commons/logging').logger;
var redis = require("../commons/redis");
var time = require('../commons/time');
var StuNewsAdmin = require('../models/StuNewsAdmin').model;
var TeaNewsAdmin = require('../models/TeaNewsAdmin').model;
var VisNewsAdmin = require('../models/VisNewsAdmin').model;
var Service = {};


/*
    1: 学生身份
    2：老师身份
    5：游客身份
 */
//查询全部消息
Service.listAllNews = function(type,callback) {
    if(type == 1) {
        StuNewsAdmin.listAll(false, callback);
    }else if(type == 2) {
        TeaNewsAdmin.listAll(false, callback);
    }else {
        VisNewsAdmin.listAll(false, callback);
    }

};

//添加
Service.insert = function (type, json, callback) {
    if(type == 1) {
        var model = StuNewsAdmin.i(json);
        model.save(callback);
    }else if(type == 2) {
        var model = TeaNewsAdmin.i(json);
        model.save(callback);
    }else {
        var model = VisNewsAdmin.i(json);
        model.save(callback);
    }

};
//查询单挑
Service.getById = function(type,id,callback) {
    if(type == 1) {
        StuNewsAdmin.loadById(id, false, callback);
    }else if(type == 2) {
        TeaNewsAdmin.loadById(id,false,callback);
    }else {
        VisNewsAdmin.loadById(id,false,callback);
    }
};
//编辑
Service.update = function(type,id,obj,callback) {
    if(type == 1) {
        StuNewsAdmin.loadById(id, true, function (err, item) {
            item.set('title', obj.title);
            item.set('content', obj.content);
            item.set('to', obj.to );
            item.set('is_delete',obj.is_delete);
            item.set('is_read',obj.is_read);
            item.save(callback);
        });
    }else if(type == 2) {
        TeaNewsAdmin.loadById(id, true, function (err, item) {
            item.set('title', obj.title);
            item.set('content', obj.content);
            item.set('to', obj.to );
            item.set('is_delete',obj.is_delete);
            item.set('is_read',obj.is_read);
            item.save(callback);
        });
    }else {
        VisNewsAdmin.loadById(id, true, function (err, item) {
            item.set('title', obj.title);
            item.set('content', obj.content);
            item.set('to', obj.to );
            item.set('is_delete',obj.is_delete);
            item.set('is_read',obj.is_read);
            item.save(callback);
        });
    }
};

//删除
Service.delete = function(to,id,callback) {
    if(to == 1) {
        StuNewsAdmin.delete(id,function(err,flag) {
            callback(flag);
        });
    }else if(to == 2) {
        TeaNewsAdmin.delete(id,function(err,flag) {
            callback(flag);
        });
    }else {
        VisNewsAdmin.delete(id,function(err,flag) {
            callback(flag);
        });
    }
};

module.exports = Service;
