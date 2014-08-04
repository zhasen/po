var crypto = require('crypto');
var request = require('request');
var settings = require('../../settings').ixdf;
var time = require('../../source/commons/time');
var querystring = require('querystring');
var logger = require('../commons/logging').logger;
var Service = {};

/**
 * md5相关处理
 * @param str 要加密的数据
 * @returns {*} 返回加密的数据
 */
var md5 = function (str) {
    return crypto.createHash('md5').update(String(str)).digest('hex');
};

var dateShift = function (date) {
    return time.format(time.netToDate(date), 'yyyy.MM.dd')
}

var classStatusText = function (ClassStatus) {
    var text = '';
    if (ClassStatus == 1) {
        text = '已结课';
    } else if (ClassStatus == 2) {
        text = '未开课';
    } else if (ClassStatus == 0) {
        text = '上课中';
    }
    return text;
}

/**
 * 对象合并，把n对象合并到o对象中
 * @param o
 * @param n
 * @param override
 */
var extend = function (o, n, override) {
    for (var p in n)if (n.hasOwnProperty(p) && (!o.hasOwnProperty(p) || override))o[p] = n[p];
};

/**
 * 统一的API接口处理
 * @param param 应用级参数（除sign外）
 * @param controllername url的二级地址，不同的接口有不同的值
 * @param methodname 接口名称
 * @param callback 回调函数
 */
Service.uniAPIInterface = function (param, controllername, methodname, callback) {
    var sysParam = {method: methodname, appid: settings.appid};
    var appKey = {appKey: settings.appKey};
    var p = sysParam;
    extend(p, param);
    extend(p, appKey);
    p.sign = md5(querystring.stringify(p).toLowerCase()).toUpperCase();
    delete p.appKey;
    request({
        method: 'post',
        url: settings.url + controllername + '/',
        form: p
    }, function (err, resp, ret) {
        if (err) {
            console.info('error');
            var errMsg = 'Fail in ' + methodname + ' API: ' + err.message;
            logger.error(errMsg);
            callback(new Error(errMsg), null);
        } else {
            ret = JSON.parse(ret);
            callback(null, ret);
        }
    });
};

/**
 * 获取用户基础数据：学员/老师基本信息
 * @param userid 用户ID
 * @param callback 回调函数
 */
Service.userBasicData = function (userid, callback) {
    var userData = {};
    var o = this;
    o.uniAPIInterface({userid: userid}, 'user', 'GetUserTypeByUserId', function (err, ret) { // 获取用户身份
        console.log('--------->登录');
        console.log(ret);
        if(ret.Data) {
            userData.type = ret.Data.Type; // 用户类型：老师2 ？学生1 ？
            if (userData.type == 2 || userData.type == 22) {
                var controlername = 'teacher';
                var methodname = 'GetTeacherByUserId';
            } else if(userData.type == 1 || userData.type == 9) {
                var controlername = 'student';
                var methodname = 'GetDefaultStudentByUserId';
            } else {
                callback(err, {type:userData.type, code: null, schoolid: null});
                return;
            }
            o.uniAPIInterface({userid: userid}, controlername, methodname, function (err, ret) { // 获取用户数据
                userData.data = ret.Data;
                callback(err, userData);
                //console.info(userData);
            });
        }else {
            callback(err,null);
        }

    });
};

/**
 * 获取学员/老师的前六个班级
 * @param p
 * {
 *      type 用户类型 老师 2 学员 1
 *      schoolid 学员或老师所在的学校ID
 *      code 学员或老师的Code
 * }
 * callback 回调函数
 */
Service.myClass = function (p, callback) {
    var param = {schoolid: p.schoolid, classcodeorname: '', classstatus: 3, pageindex: 1, pagesize: 6};
    var methodname = '';
    if (p.type == 2 || p.type == 22) {
        param.teachercode = p.code;
        methodname = 'GetClassListFilterByTeacherCode';
    } else if(p.type == 1 || p.type == 9) {
        param.studentcode = p.code;
        methodname = 'GetClassListFilterByStudentCode';
    } else {
        callback(null,[]);
        return;
    };
    this.uniAPIInterface(param, 'classExt', methodname, function (err, ret) {
        //console.info(ret);
        var myClass = ret.Data;
        //console.log(myClass);
        if(myClass) {
            myClass.forEach(function (c) {
                c.poBeginDate = dateShift(c.BeginDate);
                c.poEndDate = dateShift(c.EndDate);
                c.ClassStatusText = classStatusText(c.ClassStatus);
            });
            callback(err, myClass);
        }else {
            myClass = [];
            callback(err,myClass);
        }

    })
};

/**
 * 通过classcode调取班级信息
 * param{
 *  schoolid: req.params.schoolid,
 *  classcode: req.params.classcode
 * }
 */
Service.classEntity = function (param, callback) {
    //console.info('classEntity:'+JSON.stringify(param));
    this.uniAPIInterface(param, 'classExt', 'GetClassEntity', function (err, ret) {
        var classData = ret.Data;
        classData.poBeginDate = dateShift(classData.BeginDate);
        classData.poEndDate = dateShift(classData.EndDate);
        classData.ClassStatusText = classStatusText(classData.ClassStatus);
        callback(err, classData);
    });
}

/**
 * 根据学生/老师编号获取班级列表，有分页
 * @p 接口中部分应用参数
 * @user 用户对象
 */
Service.classList = function (param, user, callback) {
    console.info(user);
    var methodname = '', p = {};
    if (user.type == 1) {
        methodname = 'GetClassListFilterByStudentCode';
        p = {schoolid: user.schoolid, studentcode: user.code};

    } else if (user.type == 2) {
        methodname = 'GetClassListFilterByTeacherCode';
        p = {schoolid: user.schoolid, teachercode: user.code};
    }
    extend(p, param);
    // 根据学生编号获取班级列表，有分页
    this.uniAPIInterface(p, 'classExt', methodname, function (err, ret) {
        var classlist = ret.Data;
        classlist.forEach(function (c) {
            c.poBeginDate = dateShift(c.BeginDate);
            c.poEndDate = dateShift(c.EndDate);
            c.ClassStatusText = classStatusText(c.ClassStatus);
        });
        callback(err, ret.Data)
    })
};

/**
 * 获取学生/老师的课表
 * @param param
 * { userid : req.query.userid, // eg: xdf001000862
     start : req.query.start, // eg: 2014-07-07
     end : req.query.end, // eg: 2014-07-14
     userType : req.query.userType // 用户类型 学员 1 老师 2
 * };
 * @param callback
 */
Service.scheduleList = function (param, callback) {
    var p = {}, methodname = '';
    if (param.userType == 1) { // 学员参数
        p = {schoolid: param.schoolid, studentCode: param.code, beginDate: param.start, endDate: param.end};
        methodname = 'GetStudentLessonEntityList';
    } else if (param.userType == 2) { // 老师参数
        p = {schoolid: param.schoolid, teachercode: param.code, language: 1, fromDay: param.start, toDay: param.end};
        methodname = 'GetCalendarEventListOfTeacher';
    }
    //console.info('param:' + JSON.stringify(param));
    this.uniAPIInterface(p, 'calendar', methodname, function (err, ret) {
        if (err) {
            logger.error(err);
            res.json(500, err);
            return;
        }
        //console.info('calendar:' + JSON.stringify(ret.Data));
        //console.info(ret.Data.length);
        var events = [];
        if (ret.Data) {
            ret.Data.forEach(function (c) {
                events.push({
                    id: c.Id, // eg: 60324222
                    title: c.ClassName, // eg: TOEFL核心词汇精讲班（限招45人）
                    start: c.BeginDate, // eg: 2013-01-23 00:00:00
                    end: c.EndDate // eg: 2013-01-23 00:00:00
                });
            });
        }
        callback(err, events);
    });
};

/**
 * 获取班级的日历数据列表
 * @param param
 * {
 *      schoolid : 9, // 学校ID
 *      classCode : '07N105', // 班级code
 * };
 */
Service.scheduleOfClass = function (param, callback) {
    this.uniAPIInterface({
        schoolid: param.schoolid, // eg: 9,
        classCode: param.classcode // eg: '07N105'
    }, 'calendar', 'GetCalendarEventListOfClass', function (err, ret) {
//        console.info('GetCalendarEventListOfClass:');
//        console.info(ret);
        callback(err, ret.Data);
    });
};

/**
 * 根据学员号 学员姓名绑定学员号。
 *
 */

//Service.bindStudentCode = function (userid,email,studentcode,studentName,usertype,method,appkey,appid,url,callback) {
//    var str = ("method=" + method + "&appid=" + appid + "&userId=" + userid  +  "&email=" + email + "&studentcode=" + studentcode + "&studentName=" + studentName + "&usertype=" + usertype + "&appKey=" + appkey).toLowerCase();
//    var md5Str = md51(str).toUpperCase();
//    request({
//        method: 'post',
//        url: url,
//        form: {
//            method: method,
//            appid: appid,
//            userId: userid,
//            email:email,
//            studentcode:studentcode,
//            studentName:studentName,
//            usertype:usertype,
//            sign: md5Str
//        }
//    }, function (err, resp, ret) {
//        if(err) {
//            console.error(err);
//        }
//        console.log('----->绑定学员号返回信息:',ret);
//        callback(ret);
//    });
//};


var md51 = function (str) {
    var Buffer = require('buffer').Buffer
    var buf = new Buffer(1024);
    var len = buf.write(str, 0);
    str = buf.toString('binary', 0, len);
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
};

module.exports = Service;
