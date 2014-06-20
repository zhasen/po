var domainRegistry = require('./DomainRegistry');
var time = require('../../source/commons/time');
var typeRegistry = require('./TypeRegistry');
var db = domainRegistry.domainBuilder();
db.withName('TestPackage')
    .withBasis() //it includes id and version (may be version)
    .withOptions({
        modelKey: 'tpk',
        modelTable: 'test_package'
    })
    .withProperties(
    {
        name: {type: String, defaultValue: ''},
        paper_num: {type: String, defaultValue: '0'},
        remark: {type: String, defaultValue: ''},
        paperArr: {type: String, defaultValue: '[]'},
        lifeFlag: {type: String, defaultValue: typeRegistry.LifeFlag.Active.value()}
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