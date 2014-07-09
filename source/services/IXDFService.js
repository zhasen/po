var crypto = require('crypto');
var request = require('request');
var settings = require('../../settings').ixdf;
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
 * 对象合并
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
    var sysParam = {
        method: methodname,
        appid: settings.appid
    };
    var appKey = {
        appKey: settings.appKey
    };
    var p = sysParam;
    extend(p, param);
    extend(p, appKey);
    var str = '', token = '';
    for (var key in p) {
        str += token + key + '=' + p[key];
        token = '&';
    }
    //console.info('str: ' + str);
    p.sign = md5(str.toLowerCase()).toUpperCase();
    delete p.appKey;
    request({
        method: 'post',
        url: settings.url + controllername + '/',
        form: p
    }, function (err, resp, ret) {
        if (err) {
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
 * 获取用户基础数据：学员/老师基本信息、学员/老师的前六个班级
 * 每个页面都要调一次
 * @param userid 用户ID
 * @param callback 回调函数
 * @return userData
 * {
 *      type: 老师2 学生1,
 *      data: 用户数据,
 *      token: tch stu
 *      class6: 前六个班级的对象数组,
 * }
 */
Service.userBasicData = function (userid, callback) {
    var userData = {};
    var o = this;
    o.uniAPIInterface({userid: userid}, 'user', 'GetUserTypeByUserId', function (err, ret) { // 获取用户身份
        userData.type = ret.Data.Type; // 用户类型：老师2 ？学生1 ？
        if (userData.type == 2) {
            var controlername = 'teacher';
            var methodname = 'GetTeacherByUserId';
            userData.token = 'tch';
        } else {
            var controlername = 'student';
            var methodname = 'GetDefaultStudentByUserId';
            userData.token = 'stu';
        }
        o.uniAPIInterface({userid: userid}, controlername, methodname, function (err, ret) { // 获取用户数据
            userData.data = ret.Data;
            //console.info(userData);
            // 获取前六个班级
            var param = {classcodeorname: '', classstatus: 3, pageindex: 1, pagesize: 6};
            var controllername = 'class';
            var methodname = '', viewname = '', token = '';
            if (userData.type == 2) {
                param.schoolid = userData.data.nSchoolId;
                param.teachercode = userData.data.sCode;
                methodname = 'GetClassListFilterByTeacherCode';
            } else {
                param.schoolid = userData.data.SchoolId;
                param.studentcode = userData.data.Code;
                methodname = 'GetClassListFilterByStudentCode';
            }
            o.uniAPIInterface(param, controllername, methodname, function (err, ret) {
                // console.info(ret)
                userData.class6 = ret.Data;
                callback(err, userData);
            })
        });
    });
};


module.exports = Service;
