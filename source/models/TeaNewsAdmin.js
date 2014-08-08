var domainRegistry = require('./DomainRegistry');
var time = require('../../source/commons/time');
var db = domainRegistry.domainBuilder();
db.withName('TeaNewsAdmin')
    .withBasis() //it includes id and others (may be version)
    .withOptions({
        modelKey: 'tea_news',
        modelTable: 'tea_news_admin'
    })
    .withProperties(
    {
        title: {type: String},
        content: {type: String},
        to:{type: Number},
        is_read: {type: String, defaultValue: ''},
        is_delete: {type: String, defaultValue: ''}
    }
)
    .withCreatedOn()
    .withUpdatedOn()

db.withStaticMethod('filter', function(){
    console.log('filter');
});


module.exports = db.build();