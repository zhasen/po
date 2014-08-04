var sequelize = require('../../source/commons/sequelize');
var User = require('../../source/models/User');
require('../../source/models/InteractiveClassRoomRecord');

exports.setUp = function(done){
    done();
};
exports.tearDown = function(done){
    done();
};
exports.testCurrentTime = function(test){
    test.done();
};
exports.sync = function(test){
    sequelize
        .sync({ force: true })
        .complete(function(err) {
            if (!!err) {
                console.log('An error occurred while creating the table:', err)
            } else {
                console.log('It worked!')
            }
        })
    test.done();
};