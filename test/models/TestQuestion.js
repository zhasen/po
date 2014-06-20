var redis = require('../../source/commons/redis');
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

exports.testTestQuestion = function(test){
    var TestQuestion = require('../../source/models/TestQuestion');
    var Model = TestQuestion.model;

    var model = Model.i();

    //test getter and setter
    var name =  'test question 1';
    model.set('name', name);
    model.save(function(err, model){
        Model.loadById(model.get('id'), true, function(err, tq){
            test.ok(tq);
            console.error(tq);
        });
        model.save(function(err, model){
            Model.loadById(model.get('id'), true, function(err, tq){
                test.ok(tq);
                console.error(tq);
                test.done();
            });
        });
    });

    var model2 = Model.i({name: 'test question 2'});
    model2.save(function(err, model){
        model2.delete(function(err, result){});
    });

    var model3 = Model.i({name: 'test question 3'});
    model3.save(function(err, model){
        Model.delete(model.get('id'), function(err, result){
            console.error(result);
        });
    });

    Model.listAll(true, function(err, results){
        console.log('list all test questions');
        console.log(results);
    });

};
