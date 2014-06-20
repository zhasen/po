var service = require('../../source/services/TestQuestionService');
var logger = require('../../source/commons/logging').logger;

exports.setUp = function (done) {
//    setTimeout(function(){done();}, 500);
    console.info('test is starting');
    done();
};

exports.tearDown = function (done) {
    console.info('done;');
    done();
};

exports.testListTestQuestions = function (test) {
    service.listTestQuestions(function (err, questions) {
        if (err) {
            console.error('Fail to list all test questions: ' + err);
        }
        else {
            test.ok(questions);
            test.equal(questions.length, 0);
            console.debug('Succeed to list all test questions: ' + JSON.stringify(questions));
        }
        test.done();
    });
};

exports.insert = function (test) {
    var body = { name: '新东方',
        questionRegion: 'bj',
        questionType: 't',
        questionRisk: 'y',
        questionYear: '1'}
    service.insert(body, function (err, mode) {
        if (err) {
            console.error('Fail to list all targets: ' + err);
        }
        else {
            test.ok(mode);
        }
        test.done();
    });
};