var domainRegistry = require('./DomainRegistry');
var time = require('../../source/commons/time');
var db = domainRegistry.domainBuilder();
db.withName('NewsAdmin')
    .withBasis() //it includes id and others (may be version)
    .withOptions({
        modelKey: 'news',
        modelTable: 'news_admin'
    })
    .withProperties(
    {
        title: {type: String},
        content: {type: String},
        to:{type: Number}
    }
)
    .withCreatedOn()
    .withUpdatedOn()

db.withStaticMethod('filter', function(){
    console.log('filter');
});


module.exports = db.build();