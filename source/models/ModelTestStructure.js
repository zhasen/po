var Structure = require('./TestPaperStructure');
var erType = require('./TypeRegistry').erType;

//var Structure = {};
//
////返回考试结构
////Structure.testPaperStructrue = function () {
////    var st = {
////        'R': {name: '阅读', part: 0},
////        'L': {name: '听力', part: {part1:'第一部分',part2:'第二部分'} },
////        'S': {name: '口语', part: 0},
////        'W': {name: '写作', part: 0}
////        };
////    return st;
////}


module.exports = function(){
    var tpbs = [];
    var reading = new Structure(erType.Reading.value(), 'erType', erType.Reading.value(), erType.Reading.title());
    var listening = new Structure(erType.Listening.value(), 'erType', erType.Listening.value(), erType.Listening.title());
    var speaking = new Structure(erType.Speaking.value(), 'erType', erType.Speaking.value(), erType.Speaking.title());
    var writing = new Structure(erType.Writing.value(), 'erType', erType.Writing.value(), erType.Writing.title());

    tpbs.push(reading);
    tpbs.push(listening);
    tpbs.push(speaking);
    tpbs.push(writing);

    listening.addPart(1,'第一部分');
    listening.addPart(2,'第二部分');

    return tpbs;
};