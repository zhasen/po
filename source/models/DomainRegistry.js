var DomainRegistry = require('./common/DomainRegistry');
var DomainBuilder = require('./common/DomainBuilder');
var Id = require('./common/plugins/Id');
var Version = require('./common/plugins/Version');
var Save = require('./common/plugins/Save');
var Delete = require('./common/plugins/Delete');
var LoadById = require('./common/plugins/LoadById');
var ListAll = require('./common/plugins/ListAll');
var CreatedOn = require('./common/plugins/CreatedOn');
var UpdatedOn = require('./common/plugins/UpdatedOn');


var instance = new DomainRegistry(DomainBuilder);
instance.addPlugin(Id, true);
instance.addPlugin(Version, true);
instance.addPlugin(Save, true);
instance.addPlugin(Delete, true);
instance.addPlugin(LoadById, true);
instance.addPlugin(ListAll, true);
instance.addPlugin(CreatedOn, false);
instance.addPlugin(UpdatedOn, false);

module.exports = instance;