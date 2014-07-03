var crypto = require('crypto');
var request = require('request');

exports.setUp = function(done){
//    setTimeout(function(){done();}, 1000);
    console.info('test is starting');
    done();
};
exports.tearDown = function(done){
    console.info('done;');
    done()
};

exports.testLoadById = function(test){
    var id = 'xdf0050001152';
    var m = "GetTeacherByUserId";
    var k = "v5appkey_test";
    var i = "5001";
    var str = ("method="+m+"&appid="+i+"&userId="+id+"&appKey="+k).toLowerCase();
    console.info(str);
    var md5Str = md5(str).toUpperCase();;
    console.info(md5Str);
    request({
        method: 'post',
        url: "http://xytest.staff.xdf.cn/api/Teacher/",
        form: {
            method: "GetTeacherByUserId",
            appid: 5001,
            userId: id,
            sign:md5Str
        }
    }, function (err, resp, ret) {
        ret = JSON.parse(ret);
        console.info(ret);
        test.done();
    });
};

var md5 = function(str) {
    return crypto.createHash('md5').update(String(str)).digest('hex');
};