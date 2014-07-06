var crypto = require('crypto');
var request = require('request');
var ixdf = require('../../source/services/IXDFService');

exports.setUp = function (done) {
//    setTimeout(function(){done();}, 1000);
    console.info('test is starting');
    done();
};
exports.tearDown = function (done) {
    console.info('done;');
    done()
};

// 测试 GetTeacherByUserId 接口：通过userID获取老师相关信息
exports.testGetTeacherByUserId = function (test) {
    ixdf.GetTeacherByUserId('xdf00228972', function (err, ret) {
        console.info('TEST：GetTeacherByUserId :');
        console.info(JSON.stringify(ret));
        //console.info(ret); // 显示列表
        console.info("\n");
        test.done();
    });
}

// 测试 GetCalendarEventListOfTeacher 接口：获取教师的日历数据
exports.testGetCalendarEventListOfTeacher = function (test) {
    test.done();
}

// 测试 GetCalendarInfoListOfTeacher 接口：获取教师日历信息列表

// 测试 GetStudentLessonEntityList 接口：获取学生的日历数据

// 接口的使用，关键是对md5 key的正确生成。这里用来测试request和key的配合使用，王志鹏老师写的。
exports.testKey = function (test) {
    var id = 'xdf00228972';
    var m = "GetTeacherByUserId";
    var k = "v5appkey_test";
    var i = "5001";
    var str = ("method=" + m + "&appid=" + i + "&userId=" + id + "&appKey=" + k).toLowerCase();
    //console.info(str);
    var md5Str = md5(str).toUpperCase();
    //console.info(md5Str);
    request({
        method: 'post',
        url: "http://xytest.staff.xdf.cn/api/Teacher/",
        form: {
            method: "GetTeacherByUserId",
            appid: 5001,
            userId: id,
            sign: md5Str
        }
    }, function (err, resp, ret) {
        console.info('TEST：KEY :');
        ret = JSON.parse(ret);
        //console.info(ret);
        test.equal(ret.State, 1);
        test.done();
    });
};

var md5 = function (str) {
    return crypto.createHash('md5').update(String(str)).digest('hex');
};