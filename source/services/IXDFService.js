var crypto = require('crypto');
var request = require('request');
var settings = require('../../settings').ixdf;
var time = require('../../source/commons/time');
var querystring = require('querystring');
var Service = {};

/**
 * md5相关处理
 * @param str 要加密的数据
 * @returns {*} 返回加密的数据
 */
var md5 = function (str) {
    return crypto.createHash('md5').update(String(str)).digest('hex');
};

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
            /*console.info('uniAPIInterface:');
             console.info(ret);
             callback(null, {Data: []});*/
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
        userData.type = ret.Data.Type; // 用户类型：老师2 ？学生1 ？
        if (userData.type == 2) {
            var controlername = 'teacher';
            var methodname = 'GetTeacherByUserId';
        } else {
            var controlername = 'student';
            var methodname = 'GetDefaultStudentByUserId';
        }
        o.uniAPIInterface({userid: userid}, controlername, methodname, function (err, ret) { // 获取用户数据
            userData.data = ret.Data;
            callback(err, userData);
            //console.info(userData);
        });
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
    if (p.type == 2) {
        param.teachercode = p.code;
        methodname = 'GetClassListFilterByTeacherCode';
    } else {
        param.studentcode = p.code;
        methodname = 'GetClassListFilterByStudentCode';
    }
    this.uniAPIInterface(param, 'class', methodname, function (err, ret) {
        //console.info(ret)
        var myClass = ret.Data;
        myClass.forEach(function (c) {
            c.poBeginDate = time.format(time.netToDate(c.BeginDate), 'yyyy.MM.dd');
            c.poEndDate = time.format(time.netToDate(c.EndDate), 'yyyy.MM.dd');
        });
        callback(err, myClass);
    })
};

/**
 * 根据学生/老师编号获取班级列表，有分页
 * @p 接口中部分应用参数
 * @user 用户对象
 */
Service.classList = function (param, user, callback) {
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
    this.uniAPIInterface(p, 'class', methodname, function (err, ret) {
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
        callback(err, ret.Data);
        //console.info(ret);
    });
}

module.exports = Service;
