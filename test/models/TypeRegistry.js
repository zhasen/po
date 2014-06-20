var typeRegistry = require('../../source/models/TypeRegistry');

exports.setUp = function(done){
    done();
};
exports.tearDown = function(done){
    done();
};

exports.testTypeRegistry = function(test){
    var erRisk = typeRegistry.item('erRisk');
    test.ok(erRisk);
    test.ok(erRisk.NoRisk);
    test.ok(erRisk.WithRisk);
    test.equal(erRisk.NoRisk.value(), 'n');
    test.equal(erRisk.NoRisk.title(), '无风险');
    test.equal(erRisk.WithRisk.value(), 'y');
    test.equal(erRisk.WithRisk.title(), '有风险');
    console.log(erRisk.names());
    console.log(erRisk.values());
    console.log(erRisk.list());
    console.log(erRisk.dict());


    var erType = typeRegistry.item('erType');
    test.ok(erType);
    test.ok(erType.Reading);
    test.ok(erType.Listening);
    test.ok(erType.Speaking);
    test.ok(erType.Writing);
    test.equal(erType.Reading.value(), 'r');
    test.equal(erType.Reading.title(), '阅读');
    test.equal(erType.Listening.value(), 'l');
    test.equal(erType.Listening.title(), '听力');
    test.equal(erType.Speaking.value(), 's');
    test.equal(erType.Speaking.title(), '口语');
    test.equal(erType.Writing.value(), 'w');
    test.equal(erType.Writing.title(), '写作');
    console.log(erType.names());
    console.log(erType.values());
    console.log(erType.list());
    console.log(erType.dict());

    console.log(typeRegistry.dict());
    console.log(typeRegistry.dict(['LifeFlag', 'UserType']));


    test.done();
};
