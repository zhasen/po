var domainRegistry = require('./DomainRegistry');
var time = require('../../source/commons/time');
var db = domainRegistry.domainBuilder();
db.withName('VisNewsAdmin')
    .withBasis() //it includes id and others (may be version)
    .withOptions({
        modelKey: 'vis_news',
        modelTable: 'vis_news_admin'
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