var settings = require('../../settings');
var logger = require('../commons/logging').logger;
var redis = require("../commons/redis");
var time = require('../commons/time');
var TestPackage = require('../models/TestPackage').model;
var typeRegistry = require('../models/TypeRegistry');
var Service = {};

//查询全部试题信息
Service.listAll = function(callback) {
    TestPackage.listAll(false, callback);
};

//添加
Service.insert = function (json, callback) {
    var model = TestPackage.i(json);
    model.save(callback);
};

//查询一个记录信息
Service.loadById = function(id,callback) {
    TestPackage.loadById(id, false, callback);
}
//编辑
Service.update = function(obj,callback) {
    TestPackage.loadById(obj.id, true, function (err, item) {
        item.set('name', obj.name);
        item.set('remark', obj.remark);
        item.save(callback);
    });
}

//添加试卷
Service.addPaper = function(id,paperId,callback) {
    TestPackage.loadById(obj.id, true, function (err, item) {
        var paperArr = JSON.parse(item.get('paperArr')) ;
        paperArr.push(paperId) ;
        var sum = item.get('paper_num') ;
        sum++ ;
        item.set('paper_num',sum);
        item.set('paperArr', JSON.stringify(paperArr));
        item.save(callback);
    });
}
//移除试卷
Service.removePaper = function(id,paperId,callback) {
    TestPackage.loadById(obj.id, true, function (err, item) {
        var paperArr = JSON.parse(item.get('paperArr')) ;
        paperArr.splice(paperId) ;
        var sum = item.get('paper_num') ;
        sum-- ;
        item.set('paper_num',sum);
        item.set('paperArr', JSON.stringify(paperArr));
        item.save(callback);
    });
}

module.exports = Service;