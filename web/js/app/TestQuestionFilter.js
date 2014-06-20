define(['skeleton', 'config', './TestQuestion'],
function(sk, config, TestQuestion) {
    var Collection = sk.Collection.extend({
        model: TestQuestion,
        url: '/tq/filter/blank',
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