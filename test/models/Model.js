var redis = require('../../source/commons/redis');

var TestQuestion = require('../../source/models/TestQuestion');
var Model = TestQuestion.model;
exports.setUp = function(done){
    var id = require('../../source/commons/id');
    setTimeout((function() {
        done();
    }), 1000);
};
exports.tearDown = function(done){
//    setTimeout((function() {
//        redis.quit();
//    }), 1000);
    done();
};

exports.testModelBasis = function(test){
    var model = Model.i();
    var schema = model.schema();
    test.ok(schema);
    test.ok(model);
    test.ok(!model.saved());

    var id = model.autoId();
    test.ok(id);
    var anotherId = model.autoId(true);
    test.ok(id!=anotherId);

    var createdOn = model.autoCreatedOn();
    test.ok(createdOn);
    var anotherCreatedOn = model.autoCreatedOn();
    test.ok(createdOn==anotherCreatedOn);

    var updatedOn = model.autoUpdatedOn();
    test.ok(updatedOn);
    var anotherUpdatedOn = model.autoUpdatedOn();
    test.ok(updatedOn!=anotherUpdatedOn);

    test.done();
};
