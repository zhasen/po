var WebSocket = require('faye-websocket')
var dealFunc = {};

exports.init = function(server){
    server.on('upgrade', function(request, socket, body) {
        if (WebSocket.isWebSocket(request)) {
            var ws = new WebSocket(request, socket, body);

            ws.on('message', function(event) {
                if(ws.dealFunc){
                    ws.dealFunc(ws,event.data);
                }
                else{
                    //每一个websocket连接成功后 必须先发一个init消息 表明自己的身份 （互动课堂、录音。。。）
                    if (typeof (event.data) == "string"){
                        var json = JSON.parse(event.data);
                        if(json.method === 'init'){
                            ws.dealFunc = dealFunc[json.type];
                            ws.dealFunc(ws,event.data);
                        }
                    }
                }
            });
            ws.on('close', function(event) {
                console.log('close', event.code, event.reason);
                ws.dealFunc(ws,'{"method":"close"}');
                ws.dealFunc = null;
                ws = null;
            });
        }
    });
};

exports.register = function(name,func){
    dealFunc[name] = func;
}