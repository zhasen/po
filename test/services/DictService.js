var DictService = require('../../source/services/DictService');
var logger = require('../../source/commons/logging').logger;

exports.setUp = function(done){
//    setTimeout(function(){done();}, 500);
    console.info('test is starting');
};
exports.tearDown = function(done){
    console.info('done;');
    done()
};
exports.testListTargets = function(test){
    DictService.listTargets(function(err, targets){
        if(err){
            console.error('Fail to list all targets: '+err);
        }
        else{
            console.debug('Succeed to list all targets: ' + JSON.stringify(targets));
        }
        test.done();
    });
};