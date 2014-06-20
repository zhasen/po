define(['jQuery', 'skeleton', './TestPaper'],
function($, sk, TestPaper) {
    var View = sk.View.extend({
        vid: 'tp-structure',
        templateName: 'tp-structure',
        events: {
//            'click i.player': "toPlay",
//            'click button[name="review"]': "toReview"
        },
        configure: function(){
            this.listenTo(this.model, 'structure', this.onLoad, this);
        },
        onLoad: function() {
            this.doRender();
        },
        afterRender: function() {
        }
    });

    return View;
});