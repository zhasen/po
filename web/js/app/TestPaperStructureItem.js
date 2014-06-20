define(['skeleton'], function(sk) {
    var Model = sk.Model.extend({
        name: 'TestPaperStructureItem',
        idAttribute: 'id',
        configure: function(){
        },
        emptyFn: function(){}
    });
    return Model;
});