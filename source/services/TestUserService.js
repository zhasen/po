var settings = require('../../settings');
var logger = require('../commons/logging').logger;
var redis = require("../commons/redis");
var crypto = require('crypto');
var idGenerator = require('../../source/commons/id');
var time = require('../../source/commons/time');

var Service = {};
//用户集合key
var genLoginSetTemplateKey = function(){
    return 'u:loginName';
};
var genLoginSetTemplateUidKey = function(){
    return 'u:uid';
};
var genLoginIdSetTemplateKey = function(){
    return 'u:id';
};
//用户的key前缀
var genSingleTemplateHKey = function(id){
    return 'u:single'+id;
};
//加密密码
var generateUserPwd= function(pwd){
    var key = settings.secretKey;
    return crypto.createHash('sha256').update(String(pwd)).update(key).digest('hex');
};
Service.login=function(loginName,password,callback){

    redis.hmget(genLoginSetTemplateKey(),genSingleTemplateHKey(loginName),function(err,data){
        if(err){
            logger.error('Fail to get template : ' + err);
            callback(false,"网络出错") ;
        }else{
            if(null!=data && data.length>0 && data[0]!=null){
                password =generateUserPwd(password) ;
                var userInfo = JSON.parse(data[0]) ;
                if(userInfo.password == password){
                    callback(true,userInfo) ;
                }else{
                    callback(false,"密码错误") ;
                }
            }else{
                callback(false,"用户不存在") ;
            }
        }
    });
}
//查询指定用户名下的对象
Service.findByLoginName = function(loginName,callback){
    redis.hmget(genLoginSetTemplateKey(),genSingleTemplateHKey(loginName),function(err,data){
        if(err){
            logger.error('Fail to get template : ' + err);
            callback(null) ;
        }else{
            data = null!=data[0]? JSON.parse(data[0]):data[0] ;
            callback(data) ;
        }
    });
}
//查询指定用户名下的对象
Service.findByUid = function(uid,callback){
    redis.hmget(genLoginSetTemplateUidKey(),genSingleTemplateHKey(uid),function(err,data){
        if(err){
            logger.error('Fail to get template : ' + err);
            callback(null) ;
        }else{
            data = null!=data[0]? JSON.parse(data[0]):data[0] ;
            callback(data) ;
        }
    });
}
//注册用户
Service.regUser = function(user,callback){
    user.id=idGenerator.get('User').next().toId() ;
    user.createdOn=time.currentTime() ;
    user.updatedOn=time.currentTime() ;
    user.certified="r" ;
    user.lifeFlag=false ;
//    var strUser =
    redis.hmget(genLoginSetTemplateKey(),genSingleTemplateHKey(user.loginName),function(err,data){
        if(err){
            logger.error('Fail to get template : ' + err);
            callback(null) ;
        }else{
            if(null!=data && data.length>0 && data[0]!=null){
                callback(false,"用户已经存在") ;
            }else{
                var tempPwd =  generateUserPwd(user.password) ;
                user.password = tempPwd ;
                redis.hmset(genLoginSetTemplateKey(),genSingleTemplateHKey(user.loginName),JSON.stringify(user));
                redis.hmset(genLoginSetTemplateUidKey(),genSingleTemplateHKey(user.uid),JSON.stringify(user));
                redis.hmget(genLoginSetTemplateKey(),genSingleTemplateHKey(user.loginName),function(err,data){
                    if(err){
                        logger.error('Fail to get template : ' + err);
                        callback(false,"注册失败") ;
                    }else{
                        data = null!=data[0]? JSON.parse(data[0]):data[0] ;
                        callback(true,data) ;
                    }
                });
            }
        }
    });
}
//修改状态
Service.changeCertified = function(loginName,certified,callback){
    redis.hmget(genLoginSetTemplateKey(),genSingleTemplateHKey(loginName),function(err,data){
        if(err){
            logger.error('Fail to get template : ' + err);
            callback(false,"修改失败") ;
        }else{
            data = JSON.parse(data) ;
            data.certified = certified ;
            redis.hmset(genLoginSetTemplateKey(),genSingleTemplateHKey(loginName),JSON.stringify(data));
            redis.hmset(genLoginSetTemplateUidKey(),genSingleTemplateHKey(data.uid),JSON.stringify(data));
            callback(true,data) ;
        }
    });
}
//展示全部用户
Service.selectAll = function(callback){
    redis.hgetall(genLoginSetTemplateKey(),function(err,data){
        if(err){
            logger.error('Fail to get template : ' + err);
            callback(null) ;
        }else{
            var outList = new Array() ;
            for(var key in data){
                outList.push(JSON.parse(data[key])) ;
            }
            callback(outList) ;
        }
    });
}
module.exports = Service;