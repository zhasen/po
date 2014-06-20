var domainRegistry = require('./DomainRegistry');
var typeRegistry = require('./TypeRegistry');
var db = domainRegistry.domainBuilder();
db.withName('User')
    .withBasis() //it includes id and version (may be version)
    .withOptions({
        modelKey: 'usr',
        modelTable: 'user'
    })
    .withProperties({
        lifeFlag: {type: String, defaultValue: typeRegistry.LifeFlag.Active.value()},
        type: {type: String, defaultValue: typeRegistry.UserType.OAuth.value()},
        displayName: {type: String, defaultValue: ''},
        username: {type: String},
        password: {type: String},
        email: {type: String},
        phone: {type: String},
        userId: {type: String},
        accessToken: {type: String},
        refreshToken: {type: String},
        expiresIn: {type: Date}
    })
    .withCreatedOn()
    .withUpdatedOn();

module.exports = db.build();