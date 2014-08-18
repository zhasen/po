
//判断是否显示互动课堂
exports.showInteractionClass = function(classCode,callback) {
    if(classCode.indexOf('TFJL') == 0 || classCode.indexOf('ZTFJL') == 0) {
        var flag = true;
    }else {
        var flag = false;
    }
    callback(flag);
};

//判断是否显示模考
exports.showImitateExam = function(classCode,callback) {
    if(classCode.indexOf('TF') == 0 || classCode.indexOf('TFJL') == 0 || classCode.indexOf('TFQC') == 0 || classCode.indexOf('TP') == 0 || classCode.indexOf('TWP') == 0) {
        var flag = true;
    }else {
        var flag = false;
    }
    callback(flag);
};