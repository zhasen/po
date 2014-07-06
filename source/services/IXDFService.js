var crypto = require('crypto');
var request = require('request');
var settings = require('../../settings').ixdf;
var Service = {};

// md5相关处理
var md5 = function (str) {
    return crypto.createHash('md5').update(String(str)).digest('hex');
};

// 获取对象的第一个属性名称
var getObjFirstAttrName = function (obj) {
    for (var key in obj) return key;
}

// 对象合并
var extend = function (o, n, override) {
    for (var p in n)if (n.hasOwnProperty(p) && (!o.hasOwnProperty(p) || override))o[p] = n[p];
};

var uniAPIDeal = function (param, methodname, callback) {
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
        url: settings.url,
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
}

/**
 * GetTeacherByUserId 接口：通过userID获取老师相关信息
 * @param id 用户ID，示例 xdf001000862
 * 使用例子：GetTeacherByUserId('xdf001000862', function(err, ret){})
 */
Service.GetTeacherByUserId = function (userId, callback) {
    var param = {userId: userId};
    var methodname = getObjFirstAttrName(this);
    uniAPIDeal(param, methodname, callback);
};

/**
 * GetCalendarEventListOfTeacher接口：获取教师的日历数据
 */

module.exports = Service;
