var settings = require('../../settings');
var logger = require('../commons/logging').logger;
var redis = require("../commons/redis");
var Service = {};


var genAllTestExercisePackKey = function(){
    return 'teq:all';
};
Service.listTestPapers = function(callback) {
    redis.lrange(genAllTestExercisePackKey(), 0, -1, function(err, list){
        if(err){
            logger.error('Fail to list test papers:' + err);
            callback(err, null);
            return;
        }
        list.push({
            name:'testteq1',
            paperPublish:'y',
            paperType:'mn',
            testArea:'bj',
            year:2014,
            createPerson:'小林',
            updatePerson:'小费'
        });
        if(list){
            callback(null, list);
        }
        else{
            callback(null, []);
        }
    });
};

module.exports = Service;