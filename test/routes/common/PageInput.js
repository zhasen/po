var PageInput = require('../../../source/routes/common/PageInput');

exports.setUp = function(done){
    done();
};
exports.tearDown = function(done){
    done();
};

exports.testPageInput = function(test){
    var page = PageInput.i();
    page.enums();
    console.log(page);

    test.done();
};
