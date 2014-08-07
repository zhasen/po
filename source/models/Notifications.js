var domainRegistry = require('./DomainRegistry');
var time = require('../../source/commons/time');
var db = domainRegistry.domainBuilder();
db.withName('Notifications')
    .withBasis() //it includes id and others (may be version)
    .withOptions({
        modelKey: 'notification',
        modelTable: 'notifications'
    })
    .withProperties(
    {
        userid: {type: String},
        title: {type: String},
        content: {type: String},
        dto:{type: Number},
        is_read:{type: Number}
    }
)
    .withCreatedOn()
    .withUpdatedOn()

db.withStaticMethod('filter', function(){
    console.log('filter');
});


module.exports = db.build();