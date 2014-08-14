var idGenerator = require('../../source/commons/id');
var UserService = require('../../source/services/UserService');
var InteractiveClassroomDetailService = require('../../source/services/InteractiveClassroomDetailService');
var logger = require('../../source/commons/logging').logger;
exports.setUp = function(done){
//    setTimeout(function(){done();}, 1000);
    console.info('test is starting');
    done();
};
exports.tearDown = function(done){
    console.info('done;');
    done()
};


exports.testLoadById = function(test){
    var id = '0';
    UserService.loadById(id, function(err, user){
        if(err){
            test.ok(false);
            console.log(user);
        }
        else{
            test.ok(true);
            console.log(user);
            console.log(user.id);
            console.log(user.displayName);
        }
        test.done();
    });
};

exports.findTestRecord = function(test){
    var id = '0';
    var whereObject = {
        'classCode': 1,
        'userId': 0,
        'pType': 1
    };
    InteractiveClassroomDetailService.findTestRecord(whereObject, function(err, user){
        if(err){
            test.ok(false);
            console.log(user);
        }
        else{
            test.ok(true);
            console.log(user);
            console.log(user.id);
            console.log(user.displayName);
        }
        test.done();
    });
};

exports.testCreateUserFromOAuth = function(test){
    /*
    var userJson = {
        id: idGenerator.get('User').toId(),
        displayName: 'tom',
        accessToken: '111'
    };

    UserService.createFromOAuth(userJson, function(err, user){
        if(err){
            test.ok(false);
        }
        else{
            test.ok(true);
            console.log(user);
        }
        test.done();
    });
    */
    test.done();
};