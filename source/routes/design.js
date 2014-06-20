var logger = require('../commons/logging').logger;
var util = require('../commons/util');
var path = require('path');
var designService = require('../services/DesignService');

module.exports = function(app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);

    var designPage = function(req, res, next) {
        asseton(req, res);
        var input = {};
        var page = {};
        input.page = page;
        page.user = req.user;
//        res.render('design');
        res.render('tqt-index',input);
    };

    app.get('/tqt-index',designPage);

    var getStanderTemplateList = function(req, res) {
        var list = new Array();
        for(var i = 1 ; i <= 21 ; i++)
        {
//            var template = {};
//            template.id = "10001";
//            template.title = "听力题目导读";
//            template.define = JSON.parse("{\"pages\":[{\"elements\":[{\"id\":\"1463c8fef19e5e\",\"name\":\"text\",\"left\":40,\"top\":20,\"text\":\"<p style=\\\"text-align: center;\\\"><font size=\\\"6\\\">Listening section Directions</font></p><p><br></p><p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; This device was one of four designed to focus beams of particles before they collide in the experimental areas. Admittedly， it had been placed under extreme conditions when it failed， but such forces are to be expected from time to time when the machine is running normally. The magnets have yet to be fixed， although physicists think they know how to do it. Other， smaller hitches have compounded the problem. The collider has been built in eight sections， each of which must be cooled to temperatures only just above absolute zero.&nbsp;</p><p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; This is because the magnets used to accelerate the particles to the high energies needed for particle physics rely on the phenomenon of superconductivity to work—and superconductivity， in turn， needs extremely low temperatures. Unfortunately， the first of the eight sections took far longer to chill than had been expected.&nbsp;</p><p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; If， as the other seven sections are cooled， further problems emerge， the start date will have to be put back still further. It takes a month to cool each section， and a month to warm each one back up to normal temperatures again. If it took， say， a month to fix any problems identified as a section cooled， each cycle would postpone the start date by three months. To accelerate progress （as well as particles）， CERN's management decided last week to cancel an engineering run scheduled for November. Instead of beginning slowly with some safe-but-dull low-energy collisions， the machine's first run will accelerate its particles to high energies straight away.</p><p><br></p>\",\"pageIndex\":0}]}]}");
//            list.push(template);
            try {
                var template = {};
                template = util.clone(require('../templates/toefl/'+i+'.json'));
                template.define = JSON.parse(template.define);
//                template = require('../templates/'+i+'.json');
//                if(typeof(template.define) == "string"){
//                    template.define = JSON.parse(template.define);
//                }
                list.push(template);
            } catch (err) {

            }
        }
//        {
//            var template = {};
//            template.id = "10002";
//            template.title = "阅读文章";
//            template.define = JSON.parse("{\"pages\":[{\"elements\":[]},{\"elements\":[{\"id\":\"1463c98fc5be57\",\"name\":\"richtext\",\"left\":40,\"top\":20,\"text\":\"<p style=\\\"text-align: center;\\\"><font size=\\\"4\\\"><b>“OH DEAR！ Oh dear！ I shall be too late！”&nbsp;</b></font></p><p>So muttered the White Rabbit just before he plunged into Wonderland， with Alice in pursuit. Similar utterances have been escaping the lips of European physicists， as it was confirmed last week that their own subterranean Wonderland， a new machine called the Large Hadron Collider， will not now begin work until May 2008. This delay may enable their American rivals to scoop them by finding the Higgs boson—predicted 43 years ago by Peter Higgs of Edinburgh University to be the reason why matter has mass， but not yet actually discovered.&nbsp;</p><p><br></p><p>&nbsp; &nbsp; The Large Hadron Collider is a 27km-long circular accelerator that is being built at CERN， the European particle-physics laboratory near Geneva， specifically to look for the Higgs boson. When it eventually starts work， it will be the world's most powerful particle collider. It will also be the most expensive， having cost SFr10 billion （$8 billion） to build. The laboratory had hoped it would be ready in 2005， but the schedule has slipped repeatedly. The most recent delay came at the end of March， with the dramatic failure of a magnet assembly that had been supplied by CERN's American counterpart， the Fermi National Accelerator Laboratory （Fermilab） near Chicago.&nbsp;</p><p><br></p><p>&nbsp; &nbsp; This device was one of four designed to focus beams of particles before they collide in the experimental areas. Admittedly， it had been placed under extreme conditions when it failed， but such forces are to be expected from time to time when the machine is running normally. The magnets have yet to be fixed， although physicists think they know how to do it. Other， smaller hitches have compounded the problem. The collider has been built in eight sections， each of which must be cooled to temperatures only just above absolute zero.</p><p>&nbsp;</p><p>&nbsp; &nbsp; This is because the magnets used to accelerate the particles to the high energies needed for particle physics rely on the phenomenon of superconductivity to work—and superconductivity， in turn， needs extremely low temperatures. Unfortunately， the first of the eight sections took far longer to chill than had been expected.&nbsp;</p><p>&nbsp; &nbsp; If， as the other seven sections are cooled， further problems emerge， the start date will have to be put back still further. It takes a month to cool each section， and a month to warm each one back up to normal temperatures again. If it took， say， a month to fix any problems identified as a section cooled， each cycle would postpone the start date by three months. To accelerate progress （as well as particles）， CERN's management decided last week to cancel an engineering run scheduled for November. Instead of beginning slowly with some safe-but-dull low-energy collisions， the machine's first run will accelerate its particles to high energies straight away.</p><p>&nbsp; &nbsp; Such haste may be wise， for rumours are circulating that physicists working at the Tevatron， which is based at Fermilab and is currently the world's most powerful collider， have been seeing hints of the Higgs boson. Finding it would virtually guarantee the discoverer a Nobel prize—shared jointly， no doubt， with Dr Higgs. Hence the rush， as hundreds of physicists head down the rabbit hole， seeking their own adventures in Wonderland.&nbsp;</p>\",\"pageIndex\":1}]}]}");
//            list.push(template);
//        }
        res.json(200, list);
    };
    app.get('/design-stander-list', getStanderTemplateList);

    var getTemplateList = function(req, res) {
        designService.listTemplate(function(err, list) {
            //var arr = new Array();
            if (err) {
                logger.error(err);
                res.json(200, list);
            }
            else{
//                for(var i = 0 ; i < list.length ; i++){
//                    arr.push(JSON.parse(list[i]));
//                }
                res.json(200, list);
            }
        });
    };

    app.get('/design-list', getTemplateList);

    //修改 添加存储
    var addOrUpdateTemplate = function(req, res) {
        var template = JSON.parse(JSON.stringify(req.body));
        console.log(template);
        designService.addOrUpdateTemplate(template,function(err,id){
            if(err){
                logger.error(err);
                res.json(500, {
                    id: -1
                });
            }
            else{
                res.json(200, {
                    id: id
                });
            }
        });
    };
    app.post('/design-addorupdate', addOrUpdateTemplate);

    //删除
    var deleteTemplate = function(req, res) {
        var template = JSON.parse(JSON.stringify(req.body));
        console.log(template);
        designService.deleteTemplate(template,function(err){
            if(err){
                logger.error(err);
                res.json(500, {
                });
            }
            else{
                res.json(200, {
                });
            }
        });
    };
    app.post('/design-delete', deleteTemplate);


    var getTestQuestionContent = function(req, res) {
        var testQuestionContent = JSON.parse(JSON.stringify(req.body));
        designService.getTestQuestionContent(testQuestionContent,(function(err, content) {
            if (err) {
                logger.error(err);
                res.json(200, {});
            }
            else{
                res.json(200, content);
            }
        }));
    };

    app.post('/get-test-question-content', getTestQuestionContent);

    /*
     * 预览
     */
    var previewQuestionContent = function(req, res) {
        asseton(req, res);
        var input = {};
        var page = {};
        input.page = page;

        res.render('tqt-preview', input);

//        var testQuestionContent = JSON.parse(JSON.stringify(req.body));
//        console.log(JSON.stringify(req.body));
//        designService.getTestQuestionContent((function(err, content) {
//            if (err) {
//                logger.error(err);
//                res.json(200, {});
//            }
//            else{
//                page.list = content;
//                res.render('tqt-preview', input);
//            }
//        }));

    };

    app.get('/tqt-preview', previewQuestionContent);

    //修改 添加存储
    var saveTestQuestionContent = function(req, res) {
        var testQuestionContent = JSON.parse(JSON.stringify(req.body));
        designService.saveTestQuestionContent(testQuestionContent,function(err,id){
            if(err){
                logger.error(err);
                res.json(500, {
                    id: -1
                });
            }
            else{
                res.json(200, {
                    id: id
                });
            }
        });
    };
    app.post('/save-test-question-content', saveTestQuestionContent);

    //删除
    var deleteTestQuestionContent = function(req, res) {
        var testQuestionContent = JSON.parse(JSON.stringify(req.body));
        designService.deleteTestQuestionContent(testQuestionContent,function(err){
            if(err){
                logger.error(err);
                res.json(500, {
                });
            }
            else{
                res.json(200, {
                });
            }
        });
    };
    app.post('/delete-test-question-content', deleteTestQuestionContent);

    app.post('/design-file-upload', function(req, res, next){
        var patharray;
        if(req.files.file){
           patharray = req.files.file.path.split(path.sep);
        }
        else{
           patharray = req.files.thumbnail.path.split(path.sep);
        }
        //res.send("<img src='" + patharray[patharray.length-1] + "'/>");
        res.send("/"+patharray[patharray.length-1]);
    });

    //上传图片
    var uploadImg = function(req, res) {
         var fs = require('fs');
         var patharray;
         var uploadDir = require('../../settings.js').file.question;
         var imgTypes = /^image\/(gif|jpe?g|png)$/i;//限制图片格式
         var isImg = imgTypes.test(req.files.imgFile.type);
        if(isImg){
            patharray = req.files.imgFile.path.split(path.sep);
            res.send(uploadDir + "/"+patharray[patharray.length-1]);
        }else{
            fs.unlink(req.files.imgFile.path, function(err){
                if(!err){
                    res.send("errImg");
                }
            })
        }
    };
    app.post('/design-img-upload', uploadImg);

    //音频上传
    var uploadAudio = function(req, res) {
        var patharray;
        var fs = require('fs');
        var audioFile = req.files.audioFile;
        var audioType = /^audio\/(mp3|wav|ogg)$/i;//限制音频格式
        var isAudio = audioType.test(audioFile.type);
        var uploadDir = require('../../settings.js').file.question;
        if(isAudio){
            patharray = req.files.audioFile.path.split(path.sep);
            res.send(uploadDir + "/"+patharray[patharray.length-1]);
        }
        else{
            fs.unlink(audioFile.path, function(err){
                if(!err){
                    res.send("errAudio");
                }
            })
        }
    };
    app.post('/design-audio-upload', uploadAudio);

};