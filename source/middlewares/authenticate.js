var Authenticator = require('./authenticator');
var OAuthClient = require('./oauth-client');

//TODO: Use settings
var xdf = new OAuthClient({
    providerHost: 'http://testu2.staff.xdf.cn',
    providerAuthorizeUri: '',
    providerAccessTokenUri: '/apis/OAuth.ashx',
    providerLogoutUri: '/Logout.aspx',
    client_id: '95401',
    client_secret: 'u2test-app1-d20-9c5f-4783-8316-ee814test',
    clientHost: 'http://testpath.xdf.cn',
    clientCallbackUri: '/auth/callback',
    clientLogoutReturnUrl: 'http://testpath.xdf.cn'
});

var auth = new Authenticator({
    oauthClient: xdf,
    authRouteRe: /^(?!\/auth\/|\/$).*/, // match the url except / and /auth/*
    loginUri: '/auth/login',
    callbackUri: '/auth/callback',
    logoutUri: '/auth/logout'
});

module.exports = auth;