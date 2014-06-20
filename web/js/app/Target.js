define(['skeleton'], function(sk) {
    var Model = sk.Model.extend({
        name: 'Target',
        urlRoot: '/target',
        idAttribute: 'id',
        configure: function(){

        }
    });
    return Model;
});