var domainRegistry = require('./DomainRegistry');
var typeRegistry = require('./TypeRegistry');
var time = require('../../source/commons/time');
var db = domainRegistry.domainBuilder();
db.withName('TestQuestion')
    .withBasis() //it includes id and version (may be version)
    .withOptions({
        modelKey: 'tq',
        modelTable: 'test_question'
    })
    .withProperties({
        name: {type: String, defaultValue: ''},
        lifeFlag: {type: String, defaultValue: typeRegistry.LifeFlag.Active.value()},
        region: {type: String, defaultValue: typeRegistry.Region.Beijing.value()},
        org: {type: String, defaultValue: typeRegistry.Organization.BeijingXDF.value()},
        erType: {type: String, defaultValue: typeRegistry.erType.Reading.value()},
        erRisk: {type: String, defaultValue: typeRegistry.erRisk.NoRisk.value()},
        erYear: {type: String, defaultValue: function(){return time.currentYear();}},
        erPublish: {type: String, defaultValue: typeRegistry.erPublishStatus.Unpublished.value()},
        erAudit: {type: String, defaultValue: typeRegistry.erAuditStatus.Unaudited.value()}
    })
//    .withCreatedBy()
//    .withUpdatedBy()
    .withCreatedOn()
    .withUpdatedOn()

db.withStaticMethod('filter', function () {
    console.log('filter');
});


module.exports = db.build();