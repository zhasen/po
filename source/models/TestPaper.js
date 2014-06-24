var domainRegistry = require('./DomainRegistry');
var typeRegistry = require('./TypeRegistry');
var time = require('../../source/commons/time');
var db = domainRegistry.domainBuilder();
db.withName('TestPaper')
    .withBasis() //it includes id and others (may be version)
    .withOptions({
        modelKey: 'tp',
        modelTable: 'test_paper'
    })
    .withProperties(
        {
            name: {type: String},
            erPublish: {type: String, defaultValue: typeRegistry.erPublishStatus.Unpublished.value()}
        }
    )
    .withCreatedOn()
    .withUpdatedOn()

db.withStaticMethod('filter', function(){
    console.log('filter');
});


module.exports = db.build();


