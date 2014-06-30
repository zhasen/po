var Authenticator = require('./authenticator');
var OAuthClient = require('./oauth-client');
var settings = require('../../settings').oauth;

var xdf = new OAuthClient({
    providerHost:settings.providerHost,
    providerAuthorizeUri: settings.providerAuthorizeUri,
    providerAccessTokenUri: settings.providerAccessTokenUri,
    providerLogoutUri: settings.providerLogoutUri,
    client_id: settings.clientId,
    client_secret: settings.clientSecret,
    clientHost: settings.clientHost,
    clientCallbackUri: '/auth/callback',
    clientLogoutReturnUrl: settings.clientHost
});

var auth = new Authenticator({
    oauthClient: xdf,
    authRouteRe: /^(?!\/auth\/|\/$).*/, // match the url except / and /auth/*
    loginUri: '/auth/login',
    callbackUri: '/auth/callback',
    logoutUri: '/auth/logout'
});

module.exports = auth;