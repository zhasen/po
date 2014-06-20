var userService = require('../services/TestUserService');
module.exports = function(app){
    app.use(require('./xdf').oauth({
        client_id: '95401',
        client_secret: 'u2test-app1-d20-9c5f-4783-8316-ee814test',
        redirect_url: 'http://itemstest.xdf.cn/u2/callback',
        returnUrl: 'http://itemstest.xdf.cn/u2/logout',
        afterSuccess:function(ret, req, res,next){
            var loginInfo = ret ;

            if(!req.session){
                req.session = {} ;
            }
            var loginType = req.session.loginType ;
            if(!loginType){
                var uid = ret.userId ;
                userService.findByUid(uid,function(data){
                    if(!data){
                        var user = {loginName:loginInfo.email,
                            email:loginInfo.email,
                            uid:loginInfo.userId ,
                            password:loginInfo.email
                        }
                        userService.regUser(user,function(flag,data){
                            if(flag){
                                req.session.loginType = true;
                                req.session.loginName = data.loginName ;
                                req.session.uid = data.uid;
                                req.session.iid = data.id ;
                                res.redirect("/") ;
                            }
                        })
                    }else{
                        req.session.loginType = true;
                        req.session.loginName = data.loginName ;
                        req.session.uid = data.uid;
                        req.session.iid = data.id ;
                        res.redirect("/") ;
                    }
                });
            }
        }
    }));
};
//---------------------------------录音上传，边录边传功能结束---------------------------------------