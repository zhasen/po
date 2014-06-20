var domainRegistry = require('./common/Registry');
var time = require('../../source/commons/time');
var db = domainRegistry.domainBuilder();
db.withName('TestUser')
    .withBasis() //it includes id and version (may be version)
    .withOptions({
        modelKey: 'u',
        modelTable: 'test_user'
    })
    .withProperties(
    {
        loginName: {type: String, defaultValue: ''},
        email: {type: String, defaultValue: ''},
        password: {type: String, defaultValue: ''},
        lifeFlag: {type: String, defaultValue: false},
        certified: {type: String, defaultValue: 'r'}
    }
)
//    .withCreatedBy()
//    .withUpdatedBy()
    .withCreatedOn()
    .withUpdatedOn()

db.withStaticMethod('filter', function () {
    console.log('filter');
});


module.exports = db.build();