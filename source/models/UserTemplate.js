var db = require('./DomainRegistry').domainBuilder();

db.withName('UserTemplate')
    .withBasis() //it includes id and others (may be version)
    .withOptions({
        modelKey: 'ut',
        modelTable: 'user_template'
    })
    .withProperties(
        {
            title: {type: String},
            define: {type: String}
        }
    )
    .withCreatedOn()
    .withUpdatedOn()

db.withStaticMethod('filter', function(){
    console.log('filter');
});


module.exports = db.build();