
var path = require('path');
var fs = require('fs');
var lame = require('lame');
var wav = require('wav');
var api = require('../../settings').api;
var fileConfig = require('../../settings').file;

module.exports = function (app) {

    app.get('/tpo-test', function (req, res, next) {
        var data = {};
        data.userId = req.session.user.code;
        data.testId = req.query.testId;
        data.paperId = req.query.paperId;
        data.allotId = req.query.allotId;
        data.classCode = req.query.classCode;

        if(!data.testId){
            data.testId = "";
        }

        res.render('tpo-test', data);
    });

    app.get('/tpo-review', function (req, res, next) {
        var data = {};
        data.userId = req.session.user.code;
        data.testId = req.query.testId;
        data.paperId = req.query.paperId;
        data.allotId = req.query.allotId;
        data.classCode = req.query.classCode;

        res.render('tpo-review', data);
    });

    app.post('/upload1', function (req, res) {
        console.log(req.files);

        var patharray = req.files.audioData.path.split(path.sep);
        //var newPath = req.files.audioData.path.replace(patharray[patharray.length - 1],req.query.id)+'.mp3';

        var newPath = fileConfig.record + req.query.id+'.mp3';

        var input = fs.createReadStream(req.files.audioData.path);
        var output = fs.createWriteStream(newPath);

        var reader = new wav.Reader();
        reader.on('format', function(format){

            var encoder = new lame.Encoder(format);
            reader.pipe(encoder).pipe(output);

        });
        input.pipe(reader);
    });

    app.get('/download-get', function(req, res) {
        var str = api.imitateExam;
        str += "method=downloadResource";
        str += "&keyUUID="+req.query.keyUUID;
        request({
            method: 'get',
            url: str,
            followRedirect: false
        }, function (err, resp, ret) {
            res.writeHead(302, {
                'Location': resp.headers.location
            });
            res.end();
        });
    });

};