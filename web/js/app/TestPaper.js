define(['skeleton'], function(sk) {
    var Model = sk.Model.extend({
        name: 'TestPaper',
        urlRoot: '/tp',
        idAttribute: 'id',
        configure: function(){
        },
        emptyFn: function(){}
    });
    return Model;
});