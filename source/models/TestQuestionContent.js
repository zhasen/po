var db = require('./DomainRegistry').domainBuilder();

db.withName('TestQuestionContent')
    .withBasis() //it includes id and others (may be version)
    .withOptions({
        modelKey: 'tqc',
        modelTable: 'test_question_content'
    })
    .withProperties(
        {
            define: {type: String, defaultValue: ''}
        }
    )
    .withCreatedOn()
    .withUpdatedOn()

db.withStaticMethod('filter', function(){
    console.log('filter');
});


module.exports = db.build();