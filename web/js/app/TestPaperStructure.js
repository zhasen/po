define(['skeleton', 'config', './TestPaperStructureItem'],
function(sk, config, TestPaperStructureItem) {
    var Collection = sk.Collection.extend({
        model: TestPaperStructureItem,
        configure: function(){

        },
        emptyFn: function(){}
    });
    return Collection;
});