var settings = require('../../settings');
var logger = require('../commons/logging').logger;
var redis = require("../commons/redis");
var time = require('../commons/time');
var TestPaper = require('../models/TestPaper').model;
var Structure = require('../models/ModelTestStructure');
var typeRegistry = require('../models/TypeRegistry');
var CommonServiceHelper = require('./CommonServiceHelper');
var Service = {};

//查询全部试卷信息
Service.listTestPapers = function(callback) {
    TestPaper.listAll(false, callback);
};

//添加
Service.insert = function (json, callback) {
    var model = TestPaper.i(json);
    model.set('erPublish', 'n'); // 默认发布状态
    //console.log(typeRegistry.Organization.data());
    model.set('organization','bjxdf');//默认机构
    //var st = "{t:'听力',s:'口语',d:'阅读',x:'写作'}";
    var st = Structure();
    //console.log(st);
    st = JSON.stringify(st);
    //console.log(st);
    model.set('st',st);
    model.save(callback);
};

//发布
Service.publishPaper = function(id,paperPublish,callback) {
    TestPaper.loadById(id, true, function (err, item) {
        if(paperPublish == 'y') {
            item.set('paperPublish', 'n');
        }
        if(paperPublish == 'n') {
            item.set('paperPublish', 'y');
        }
        item.save(callback);
    });
}
//删除
Service.deletePaper = function(id,callback) {
    TestPaper.delete(id,callback);
};
//查询单挑记录信息
Service.getById = function(id,callback) {
    TestPaper.loadById(id, false, callback);
}
//编辑
Service.update = function(id,obj,callback) {
    TestPaper.loadById(id, true, function (err, item) {
//        var item = TestQuestion.i(obj);
        item.set('name', obj.name);
        item.set('testArea', obj.testArea);
        item.set('paperType', obj.paperType );
        item.set('year', obj.year);
        item.save(callback);
    });
}

//复制
Service.copyPaper = function(id,body,callback) {
    TestPaper.loadById(id, false, function (err, item) {
        if(err) {
            logger.error(err);
        }else {
            var model = TestPaper.i(body);
            model.set('name',body.name);
            model.set('organization',body.organization);
            model.set('testArea',item.testArea);
            model.set('paperType',item.paperType);
            model.set('paperPublish','n');
            model.set('year',item.year);
            model.set('st',item.st);
            //model.set('id',id);
            //console.log(model);
            model.save(callback);
        }

    });
}

var actions = {
    publish: {
        property: 'erPublish',
        value: typeRegistry.erPublishStatus.Published.value()
    },
    unpublish: {
        property: 'erPublish',
        value: typeRegistry.erPublishStatus.Unpublished.value()
    }
};

CommonServiceHelper.generatePropertyActions(Service, TestPaper, actions);


module.exports = Service;