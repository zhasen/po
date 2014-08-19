var settings = require('../../settings');

var Service = {};

//同步用户信息接口实现
Service.synLearnTestUser = function(UserId,SchoolId,Code,Email,callback) {
    var data = {
        UserId: UserId,
        SchoolId: SchoolId,
        Code: Code,
        Email: Email
    };
    var method = "synLearnTestUser";
    //var key = "u2_userKey_#_1omsy2e*@%";
    var key = settings.ixdf.appKey;
    var str = (Code + Email + SchoolId + UserId + key).toLowerCase();
    var md5Str = md5(str).toUpperCase();
    var timestamp = new Date().Format("yyyy-MM-dd hh:mm:ss");
    request({
        method: 'post',
        //url: 'http://rd.xdf.cn/oms/public/oms/api/omsapi!oms2Api.do',
        url: settings.oms.omsUrl,
        form: {
            method: method,
            data: JSON.stringify(data),
            timestamp: timestamp,
            sign: md5Str
        }
    }, function (err, resp, ret) {
        ret = JSON.parse(ret);
        console.log('---------->同步用户信息接口测试:');
        console.info(ret);
        callback(err,ret);
    });
};

//绑定学员号接口
Service.bindStudentCode = function(UserId,SchoolId,Code,Email,StudentName,UserType) {
    var method = "BindStudentCodeByStudentName";
    var appkey = settings.ixdf.appkey;
    var appid = settings.ixdf.appid;
    var str = ("method=" + method + "&appid=" + appid + "&userId=" + UserId + "&email=" + Email + "&studentcode=" + Code + "&studentName=" + StudentName + "&usertype=" + UserType + "&appKey=" + appkey).toLowerCase();
    var md5Str = md51(str).toUpperCase();
    request({
        method: 'post',
        url: settings.ixdf.url + '/user/',
        form: {
            method: method,
            appid: appid,
            userId: UserId,
            email: Email,
            studentcode: Code,
            studentName: StudentName,
            usertype: UserType,
            sign: md5Str
        }
    }, function (err, resp, ret) {
        ret = JSON.parse(ret);
        console.log('---------->绑定学员号接口测试:');
        console.info(ret);
        callback(err,ret);
    });
};




//转时间格式
Date.prototype.Format = function(fmt)
{
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
};


module.exports = Service;