var time = require('../../source/commons/time');
var initon = require('../../source/middlewares/initon');

exports.setUp = function(done){
    done();
};
exports.tearDown = function(done){
    done();
};
exports.testCurrentTime = function(test){
    console.info(time.currentTime());
    console.info(time.currentTimeMillis());
    test.done();
};
exports.format = function(test){
    var fmt = 'yyyy-MM-dd hh:mm:ss';
    console.info();
    console.info(time.format(new Date(), fmt));
    var now = new Date();
    console.info(now.format());
    console.info(now.format('yyyy-MM-dd hh:mm'));
    console.info(now.format('yyyy年MM月dd日 hh点mm分ss秒'));
    test.done();
};