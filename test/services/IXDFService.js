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

// 测试 GetUserTypeByUserId 接口：获取用户角色
exports.GetUserTypeByUserId = function (test) {
    ixdf.uniAPIInterface({
//        userid: 'xdf00228972' // 张洪伟 老师
        userid: 'xdf001000862' // 李梦晗 学员
    }, 'user', 'GetUserTypeByUserId', function (err, ret) {
        console.info('TEST：GetUserTypeByUserId:' + JSON.stringify(ret) + "\n");
        test.done();
    });
}

// 测试 GetDefaultStudentByUserId 接口：通过学生UserId获取学生信息
exports.GetDefaultStudentByUserId = function (test) {
    ixdf.uniAPIInterface({
        userid: 'xdf001000862' // 李梦晗 学员
    }, 'student', 'GetDefaultStudentByUserId', function (err, ret) {
        console.info('TEST：GetDefaultStudentByUserId:' + JSON.stringify(ret) + "\n");
        console.info(ret);
        test.done();
    });
}

// 测试 GetTeacherByUserId 接口：通过userID获取老师相关信息
exports.GetTeacherByUserId = function (test) {
    ixdf.uniAPIInterface({
        userid: 'xdf00228972' // 张洪伟 老师
    }, 'teacher', 'GetTeacherByUserId', function (err, ret) {
        console.info('TEST：GetTeacherByUserId:' + JSON.stringify(ret) + "\n");
        //console.info(ret);
        test.done();
    });
}

// 测试 GetClassListFilterByTeacherCode 接口：根据教师编号获取班级列表
exports.GetClassListFilterByTeacherCode = function (test) {
    ixdf.uniAPIInterface({
        schoolid: 1,
        teachercode: 'BM0001',
        classcodeorname: '',
        classstatus: 3,
        pageindex: 1,
        pagesize: 10
    }, 'class', 'GetClassListFilterByTeacherCode', function (err, ret) {
        console.info('TEST：GetClassListFilterByTeacherCode:' + JSON.stringify(ret) + "\n");
        //console.info(ret);
        test.done();
    })
}

// 测试 GetClassListFilterByStudentCode 接口：根据学生编号获取班级列表
exports.GetClassListFilterByStudentCode = function (test) {
    ixdf.uniAPIInterface({
        schoolid: 1,
        studentcode: 'BJ986146',
        classcodeorname: '',
        classstatus: 3,
        pageindex: 1,
        pagesize: 10
    }, 'class', 'GetClassListFilterByStudentCode', function (err, ret) {
        console.info('TEST：GetClassListFilterByStudentCode:' + JSON.stringify(ret) + "\n");
        //console.info(ret);
        test.done();
    })
}

// 测试 GetCalendarEventListOfTeacher 接口：获取教师的日历数据
exports.GetCalendarEventListOfTeacher = function (test) {
    ixdf.uniAPIInterface({
        schoolid: 1,
        teachercode: 'BM0001',
        language: 1,
        fromDay: '2001-06-15',
        toDay: '2014-07-07'
    }, 'calendar', 'GetCalendarEventListOfTeacher', function (err, ret) {
        console.info('TEST：GetCalendarEventListOfTeacher:' + JSON.stringify(ret) + "\n");
        //console.info(ret);
        test.done();
    });
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