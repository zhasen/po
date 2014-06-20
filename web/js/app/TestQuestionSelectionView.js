define(['jQuery', 'skeleton'],
function($, sk) {
    var View = sk.View.extend({
        vid: 'tq-selection',
        templateName: 'tq-selection',
        tagName: 'tr',
        events: {
            'click #tq-selection': "toSelect"
        },
        configure: function(){
            this.listenTo(this.model, 'change:selected', this.onSelectedChanged, this);
        },
        toSelect: function(e){
            var selected = this.model.get('selected');
            this.model.set('selected', !selected);
        },
        onSelectedChanged: function(model, value){
            var selected = value;
            var newClass = null;
            var oldClass = null;
            if(selected){
                newClass = 'fa-minus-square';
                oldClass = 'fa-plus-square';
            }
            else{
                newClass = 'fa-plus-square';
                oldClass = 'fa-minus-square';
            }

            this.$('td#tq-selection i').removeClass(oldClass).addClass(newClass);
        },
        afterRenderChildren: function() {
        },
        afterRender: function() {
        }
    });
    View.makeVid = function(id){
        return 'tq-' + id;
    };
    return View;
});