define(['skeleton', 'config', './VcbEntry'],
function(sk, config, VcbEntry) {
    var Collection = sk.Collection.extend({
        model: VcbEntry,
        url: '/words',
        configure: function(){

        },
        select: function(specific, wordId, down){
            this.active = wordId;
            this.trigger('select', specific, wordId, down); //specific, wordId, down
        },
        emptyFn: function(){}
    });
    return Collection;
});