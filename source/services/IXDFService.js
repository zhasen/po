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
}

module.exports = Service;
