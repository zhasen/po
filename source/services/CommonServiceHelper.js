var generateAction = function(Model, actionConfig){
    return function (id, callback) {
        Model.loadById(id, true, function (err, item) {
            item.set(actionConfig.property, actionConfig.value);
            item.save(callback);
        });
    };
};

var generateActions = function(Service, Model, actions){
    for(var actionName in actions){
        var actionConfig = actions[actionName];
        Service[actionName] = generateAction(Model, actionConfig);
    }
};

module.exports = {
    generatePropertyActions: generateActions
};