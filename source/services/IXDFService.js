var crypto = require('crypto');
var request = require('request');
var settings = require('../../settings').ixdf;
var time = require('../../source/commons/time');
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
 * 获取用户基础数据：学员/老师基本信息
 * @param userid 用户ID
 * @param callback 回调函数
 * userdata{
 *  type: 用户类型：老师2 学生1
 *  data: 用户数据
 *  学员数据示例
 *  {
         UserId: 'xdf001000862',
         SchoolId: 1,
         Code: 'BJ986146',
         Name: '李梦晗',
         IdCard: '1234567890',
         Gender: 2,
         Email: 'i@xdf.cn',
         Address: '医大',
         PostCode: '',
         Mobile: 'k0E4Xdv/4/eJTq8Pij4coA==',
         DeCodeMobile: '13777777777'
     }
 *  老师数据示例
 *   {
         nSchoolId: 1,
         sCode: 'BM0001',
         sName: '张洪伟',
         sShowName: '张洪伟',
         nGender: 1,
         nDegree: null,
         sMajor: null,
         sPhone: '13777777777',
         sEmail: 'jinxin@xdf.cn',
         dtBirthday: null,
         nType: null,
         nID: 40,
         sLoginPass: 'NFFyY09VbTZXYXUrVnVCWDhnK0lQZz09',
         nTeacherType: null,
         sDeptCode: 'DPBJ001',
         dtModify: '2012-09-13 21:06:33',
         SyncDate: '2012-09-13 21:17:29',
         nInUsed: 1,
         UserID: 'xdf00228972',
         Subject: '托福阅读/GMAT阅读',
         Intro: '北京师范大学英语文学博士，新东方教育科技集团北美项目全国推广管理中心主任。教授过各类英美文学等英语专业课程，特别对英语阅读及写作课程有深入的研究，2001年加盟北京新东方学校，教学激情、幽默、善于把零散的考点总结地令人发指般的清晰。',
         Motto: null,
         LogoUrl: 'http://bj.xdf.cn/bj_static/images/teacher/beimei/zhanghongwei.jpg',
         Pinyin: 'ZhangHongWei',
         EnglishName: '',
         NickName: '',
         Nationality: '中国',
         BirthAdress: '',
         Favorite: '',
         CompanyEmail: null,
         Quotes: '',
         NewLogoUrl: '2011/20110518/BM000120110518.jpg',
         IsImport: '1',
         IsSearchShow: true,
         Teachingability: null,
         TeacherSort: 13994,
         sCourseCode: null,
         bValid: true,
         Id: 13894
     }
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
 * @param param
 * {
 *      type 用户类型 老师 2 学员 1
 *      schoolid 学员或老师所在的学校ID
 *      code 学员或老师的Code
 * }
 * callback 回调函数
 */
Service.class6 = function (p, callback) {
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
        console.info(ret)
        var class6 = ret.Data;
        class6.forEach(function (c) {
            c.poBeginDate = time.format(time.netToDate(c.BeginDate), 'yyyy.MM.dd');
            c.poEndDate = time.format(time.netToDate(c.EndDate), 'yyyy.MM.dd');
        });
        callback(err, class6);
    })
};

module.exports = Service;
