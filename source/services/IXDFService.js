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
    if (date) {
        return time.format(time.netToDate(date), 'yyyy.MM.dd')
    } else {
        return '';
    }
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
    // 拼成形如 method=GetUserTypeByUserId&appid=2009&userid=xdf001000862&appKey=v5appkey_vps_%40%23kztsk2m3v传
    var txt = token = '';
    for (var kk in p) {
        txt += token + kk + '=' + p[kk];
        token = '&';
    }
    // console.info(txt);
    // p.sign = md5(querystring.stringify(p).toLowerCase()).toUpperCase();
    p.sign = md5(txt.toLowerCase()).toUpperCase();
    delete p.appKey;
    console.log('uniAPIInterface p ');
    console.log(controllername);
    console.log(p);
    request({
        method: 'post',
        url: settings.url + controllername + '/',
        form: p
    }, function (err, resp, ret) {
        if (err) {
            console.log('uniAPIInterface error');
            var errMsg = 'Fail in ' + methodname + ' API: ' + err.message;
            console.log(errMsg);
            logger.error(errMsg);
            callback(new Error(errMsg), null);
        } else {
            console.log(ret);
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
        console.log('--------->获取用户身份接口：');
        console.log(ret);
        if (ret.Data) {
            userData.type = ret.Data.Type; // 用户类型：老师2 ？学生1 ？
            if (userData.type == 2 || userData.type == 22) {
                var controlername = 'teacher';
                var methodname = 'GetTeacherByUserId';
            } else if (userData.type == 1 || userData.type == 9) {
                var controlername = 'student';
                var methodname = 'GetDefaultStudentByUserId';
            } else {
                callback(err, {type: userData.type, code: null, schoolid: null});
                return;
            }
            o.uniAPIInterface({userid: userid}, controlername, methodname, function (err, ret) { // 获取用户数据
                console.log('------------>获取的用户信息：');
                console.log(ret.Data);
                userData.data = ret.Data;
                callback(err, userData);
                console.log(userData);
            });
        } else {
            callback(err, null);
        }

    });
};

/**
 * 根据学生/老师编号获取班级列表，有分页
 * @p 接口中部分应用参数
 * @user 用户对象
 */
Service.classList = function (req, param, user, callback) {
//    console.info(user);
    var methodname = '', p = {};
    if (user.type == 1 || user.type == 9) {
        methodname = 'GetClassListFilterByStudentCode';
        p = {schoolid: user.schoolid, studentcode: user.code};
    } else if (user.type == 2 || user.type == 22) {
        methodname = 'GetClassListFilterByTeacherCode';
        p = {schoolid: user.schoolid, teachercode: user.code};
    } else {
        callback(null, []);
        return;
    }
    extend(p, param);
    p.beginDate = time.currentYear() + '-01-01';
    p.endDate = time.format(time.currentTime(), 'yyyy-MM-dd');

    var key = querystring.stringify(p);
    var classLists = req.session[key];
    if (classLists) {
        console.log('going session, IXDFService.js 204');
        callback(null, classLists);
        return;
    } else {
        // 根据学生编号获取班级列表，有分页
        this.uniAPIInterface(p, 'classExt', methodname, function (err, ret) {
            if (err) {
                throw err;
                return;
            }
            var classlists = ret.Data || [];
            req.session[key] = classlists;
            classlists.forEach(function (c) {
                c.poBeginDate = dateShift(c.BeginDate);
                c.poEndDate = dateShift(c.EndDate);
                c.ClassStatusText = classStatusText(c.ClassStatus);
            });
            callback(err, classlists);
            return;
        })
    }
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
                            title: c.ClassName, // eg: TOEFL核心词汇精讲班（限招45人）
                            start: c.SectBegin.replace(' ', 'T'), // eg: 2013-01-23 00:00:00 转成 2013-01-23T00:00:00
                            end: c.SectEnd.replace(' ', 'T') // eg: 2013-01-23 00:00:00 转成 2013-01-23T00:00:00
                        });
                    }
                );
            }
            /*events = [
             { title: 'Long Event', start: '2014-06-10T16:00:00', end: '2014-06-11T16:00:00'},
             { title: 'Repeating Event', start: '2014-06-09T16:00:00'},
             { title: 'Repeating Event', start: '2014-06-15T10:00:00'},
             { title: 'Meeting', start: '2014-06-12T10:30:00', end: '2014-06-12T12:30:00'},
             { title: 'Lunch', start: '2014-06-12T12:00:00'},
             { title: 'Birthday Party', start: '2014-06-13T07:00:00' }
             ];*/
            callback(err, events);
        }
    )
    ;
}
;

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
