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
        },
        'user', 'GetUserTypeByUserId', function (err, ret) {
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
        //console.info(ret);
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

// 测试 GetStudentLessonEntityList 接口：获取学生的日历数据
exports.GetStudentLessonEntityList = function (test) {
    ixdf.uniAPIInterface({
        schoolid: 1,
        studentCode: 'BJ986146',
        beginDate: '2001-06-15',
        endDate: '2014-07-07'
    }, 'calendar', 'GetStudentLessonEntityList', function (err, ret) {
        console.info('TEST：GetStudentLessonEntityList:' + JSON.stringify(ret) + "\n");
        //console.info(ret);
        test.done();
    });
}

// 测试 GetClassEntity 接口：根据班号获取班级信息
exports.GetClassEntity = function (test) {
    ixdf.uniAPIInterface({
        schoolid: 1,
        classcode: 'YB02'
    }, 'class', 'GetClassEntity', function (err, ret) {
        console.info('TEST：GetClassEntity:' + JSON.stringify(ret) + "\n");
        //console.info(ret);
        test.done();
    });
}

// 测试 GetCalendarEventListOfClass 接口：获取班级的日历数据列表
exports.GetCalendarEventListOfClass = function (test) {
    ixdf.uniAPIInterface({
        schoolid: 9,
        classCode: '07N105'
    }, 'calendar', 'GetCalendarEventListOfClass', function (err, ret) {
        console.info('TEST：GetCalendarEventListOfClass:' + JSON.stringify(ret) + "\n");
        //console.info(ret);
        test.done();
    });
}

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
        console.log('---------------->上一个接口的测试：');
        console.info(ret);
        test.equal(ret.State, 1);
        test.done();
    });
};




//绑定学员号接口测试
//exports.xueyuanhao = function(test) {
//    ixdf.uniAPIInterface({
//        userid : 'xdf001000862',
//        email : 'student@springbuds.com',
//        studentcode : 'BJ986146',
//        studentName : '李梦晗',
//        usertype : 1,
//        nickname : '小小',
//        appsources : "MVC_PassPort"
//    }, 'user', 'BindStudentCodeByStudentName', function (err, ret) {
//        console.info('TEST：学员号绑定接口测试:' + JSON.stringify(ret) + "\n");
////        console.info(ret);
//        test.done();
//    });
//};

exports.xueyuanhao = function (test) {
    var id = 'xdf001000862';
    var email = 'student@springbuds.com';
    var studentcode = 'BJ986146';
    var studentName = '李梦晗';
    var usertype = 1;

    var m = "BindStudentCodeByStudentName";
    var k = "v5appkey_test";
    var i = "5001";
    var str = ("method=" + m + "&appid=" + i + "&userId=" + id  +  "&email=" + email + "&studentcode=" + studentcode + "&studentName=" + studentName + "&usertype=" + usertype + "&appKey=" + k).toLowerCase();
//    console.info('----------->没加密之前但转小写',str);
    var md5Str = md51(str).toUpperCase();
//    console.info('---------->sign',md5Str);
    request({
        method: 'post',
        url: "http://xytest.staff.xdf.cn/api/user",
        form: {
            method: m,
            appid: 5001,
            userId: id,
            email:email,
            studentcode:studentcode,
            studentName:studentName,
            usertype:usertype,
            sign: md5Str
        }
    }, function (err, resp, ret) {
        ret = JSON.parse(ret);
        console.log('---------->绑定学员号接口测试:');
        console.info(ret);
        test.done();
    });
};

var md5 = function (str) {
    return crypto.createHash('md5').update(String(str)).digest('hex');
};

//var MD5 = function(password) {
//    var md5 = crypto.createHash('md5');
//    md5.update(password);
//    password = md5.digest('hex');
//    return password;
//};

var md51 = function (str)
{
    var Buffer = require('buffer').Buffer
    var buf = new Buffer(1024);
    var len = buf.write(str,0);
    str = buf.toString('binary', 0, len);
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
};