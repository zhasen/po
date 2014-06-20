define(['./App', 'JST', 'config'],
function(App, JST, config) {
    var appConfig = window.appConfig;

    var app = new App({
        mode: appConfig.mode,
        JST: JST
    });
    return app;
});