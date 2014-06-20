var settings = require('../../settings');
var logger = require('../commons/logging').logger;
var redis = require("../commons/redis");
var UserTemplate = require('../models/UserTemplate').model;
var TestQuestionContent = require('../models/TestQuestionContent').model;
var Service = {};

Service.listTemplate = function(callback) {
    UserTemplate.listAll(false, function(err,array){
        callback(err,array);
    });
};

Service.addOrUpdateTemplate = function(template,callback) {
    var model = UserTemplate.i();
    model.set("title",template.title);
    model.set("define",template.define);
    if(parseInt(template.id) > 0){
        model.set("id",template.id);
    }
    model.save(function(err,template){
        callback(err,template.get("id"));
    });
};

Service.deleteTemplate = function(template,callback) {
    if(parseInt(template.id) > 0){
        UserTemplate.delete(template.id,callback);
    }
};

Service.saveTestQuestionContent = function(content,callback) {
    if(parseInt(content.id) > 0){
        var model = TestQuestionContent.i();
        model.set("id",content.id);
        model.set("define",content.define);
        model.save(function(err,content){
            callback(err,content.get("id"));
        });
    }
};

Service.getTestQuestionContent = function(content,callback) {
    if(parseInt(content.id) > 0){
        TestQuestionContent.loadById(content.id, false, callback);
    }
};

Service.deleteTestQuestionContent = function(content,callback) {
    if(parseInt(content.id) > 0){
        TestQuestionContent.delete(content.id,callback);
    }
};

module.exports = Service;