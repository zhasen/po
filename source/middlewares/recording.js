//---------------------------------录音上传，边录边传功能开始---------------------------------------
var  settings = require('../../settings');
//uuid生成
function UUID() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

var WebSocket = require('faye-websocket')
var fs = require('fs');
var wav = require('wav');
module.exports = function(recordSocketServer){
    recordSocketServer.on('upgrade', function(request, socket, body) {
        if (WebSocket.isWebSocket(request)) {
            var ws = new WebSocket(request, socket, body);

//            var recorderWebSocketPath = 'uploads/recorders/';
            var recorderWebSocketPath = settings.file.answer;
            var WAVFileUpload = "temp.wav";
            var WAVFileNotHeardCache = "tempNotHeardCache.wav";
            var WAVFileNotHeardSetCache = "tempNotHeardSetCache.wav";
            var WAVFileMerge = "wavFileMerge.wav";
            var dirSave ;
            var mergeWAV = function(){
                var writer =new wav.Writer();
                var inPut = fs.createReadStream(dirSave+WAVFileNotHeardSetCache);
                var outPut = fs.createWriteStream(dirSave+WAVFileMerge);
                inPut.pipe(writer);
                writer.pipe(outPut) ;
                outPut.on('close',function(){
                    console.log('copy over');
                    fs.readFile(dirSave+WAVFileMerge,function(err,data){
                        ws.send(dirSave+WAVFileMerge);
                        ws.send(data);
                        ws.send("openAudio");
                        fs.unlink(dirSave+WAVFileUpload);
                        fs.unlink(dirSave+WAVFileNotHeardCache);
                        fs.unlink(dirSave+WAVFileNotHeardSetCache);
                    });
                });
            }
            ws.on('open', function(event) {
                dirSave = recorderWebSocketPath+UUID()+'/' ;
                console.log('open');
            });
            ws.on('message', function(event) {
                var messageTemp = event.data;
                if (typeof (event.data) == "string"){
                    switch (messageTemp) {
                        case "stop":
                            mergeWAV() ;
//                        fs.exists(dirSave+WAVFileMerge,function(exists){
//                            if(exists){
//                                fs.unlink(dirSave+WAVFileMerge,function(){
//
//                                });
//                            }else{
//                                mergeWAV() ;
//                            }
//                        });
                            break;
                        case "start":
                            fs.exists(dirSave,function(exists){
                                if(!exists){
                                    fs.mkdir(dirSave,777,function(){
                                        ws.send(messageTemp);
                                    })
                                }else{
                                    fs.unlink(dirSave+WAVFileNotHeardSetCache,function(){
                                        fs.exists(dirSave+WAVFileMerge,function(exists){
                                            if(exists){
                                                fs.unlink(dirSave+WAVFileMerge,function(){
                                                    ws.send(messageTemp);
                                                });
                                            }else{
                                                ws.send(messageTemp);
                                            }
                                        });
                                    });
                                }
                            });
                            break;
                        case "analyze":
                            ws.send(messageTemp);
                            break;
                    }
                }else{
                    fs.writeFile(dirSave+WAVFileUpload,messageTemp,function(){
                        var reader = new wav.Reader();
                        var inPut = fs.createReadStream(dirSave+WAVFileUpload);
                        var outPut = fs.createWriteStream(dirSave+WAVFileNotHeardCache);
                        inPut.pipe(reader);
                        reader.pipe(outPut);
                        outPut.on('close',function(){
                            console.log('copy over');
                            fs.readFile(dirSave+WAVFileNotHeardCache,function(err,data){
                                fs.appendFile(dirSave+WAVFileNotHeardSetCache,data) ;
                            })
                        });
                    });
                }
                console.log(event.data);
            });
            ws.on('close', function(event) {
                console.log('close', event.code, event.reason);
                ws = null;
            });
        }
    });
};
//---------------------------------录音上传，边录边传功能结束---------------------------------------