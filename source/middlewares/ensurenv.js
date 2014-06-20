var fs = require('fs');
var settings = require('../../settings');

var ensureDir = function(rootDir, targetDir){
    var targetPath = rootDir +  '/' + targetDir;
    fs.readdir(targetPath, function(err,fileNameArray){
        if(err){
            fs.mkdir(targetPath, 0777);
        }
    });
};

module.exports = function(rootDir){
    ensureDir(rootDir, settings.file.public);
    ensureDir(rootDir, settings.file.build);
    ensureDir(rootDir, settings.file.components);
    ensureDir(rootDir, settings.file.upload);
    ensureDir(rootDir, settings.file.question);
    ensureDir(rootDir, settings.file.answer);
};