var UserService = require('../services/UserService');
module.exports = function(app){
    app.use(require('./xdf').oauth({
        client_id: '95401',
        client_secret: 'u2test-app1-d20-9c5f-4783-8316-ee814test',
        redirect_url: 'http://itemstest.xdf.cn/u2/callback',
        returnUrl: 'http://itemstest.xdf.cn/u2/logout',
        afterSuccess:function(ret, req, res, next){
            var loginInfo = ret ;
            if(!req.session.user){
                UserService.loadById(loginInfo.userId, function(err, user){
                    if(err){
                        throw err; //TODO:
                        return;
                    }

                    if(!user){
                        var userJson = {
                            id:loginInfo.userId ,
                            displayName:loginInfo.nickName,
                            email:loginInfo.email,
                            accessToken:loginInfo.access_token,
                            refreshToken:loginInfo.refresh_token,
                            expiresIn:loginInfo.expires_in
                        };
                        UserService.createFromOAuth(userJson, function(err, user){
                            if(err){
                                throw err; //TODO:
                                return;
                            }
                            req.session.user = {
                                id: user.id,
                                displayName: user.displayName
                            };
                            res.redirect("/") ;
                        });
                    }
                    else{
                        req.session.user = {
                            id: user.id,
                            displayName: user.displayName
                        };
                        res.redirect("/") ;
                    }
                });
            }
        }
    }));
};