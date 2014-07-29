var Authenticator = require('./authenticator');
var OAuthClient = require('./oauth-client');
var settings = require('../../settings');

var clientHost = 'http://' + settings.app.domain + (settings.app.context=='/' ? '' : settings.app.context);
var xdf = new OAuthClient({
    providerHost:settings.oauth.providerHost,
    providerAuthorizeUri: settings.oauth.providerAuthorizeUri,
    providerAccessTokenUri: settings.oauth.providerAccessTokenUri,
    providerLogoutUri: settings.oauth.providerLogoutUri,
    client_id: settings.oauth.clientId,
    client_secret: settings.oauth.clientSecret,
    clientHost: clientHost,
    clientCallbackUri: '/auth/callback',
    clientLogoutReturnUrl: clientHost
});

var auth = new Authenticator({
    oauthClient: xdf,
    authRouteRe: /^(?!\/auth\/|\/$|\/main-login$).*/, // match the url except / and /auth/*
    context: settings.app.context,
    loginUri: '/auth/login',
    callbackUri: '/auth/callback',
    logoutUri: '/auth/logout'
});

module.exports = auth;