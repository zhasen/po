define(['skeleton', 'config', './Target'],
function(sk, config, Target) {
    var Collection = sk.Collection.extend({
        model: Target,
        url: '/targets',
        configure: function(){

        },
        emptyFn: function(){}
    });
    return Collection;
});