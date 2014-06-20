define(['jQuery', 'skeleton', './TestQuestionFilter', './TestQuestion', './TestQuestionSelectionView'
    ],
function($, sk, TestQuestionFilter, TestQuestion, TestQuestionSelectionView
    ) {
    var View = sk.View.extend({
        vid: 'tq-filter',
        templateName: 'tq-filter',
        events: {
            "click #filter": "toFilter"
        },
        routes: {
        },
        configure: function(){
            this.model = new TestQuestionFilter();
            var view = this;
            this.listenTo(this.model, 'sync', function(collection, resp, options){
                view.doRender();
            });
        },
        toFilter: function(e){
            this.model.fetch({
                reset: true,
                error: function(model, response, options){
                    console.error(response);
                },
                success: function(model, response, options){
                    //console.info(response);
                },
                data: {}
            });
        },
        doRender: function() {
            var input = {};
            this.$el.html(this.evaluateTemplate( {input: input, id: this.getId()} ))
            this.afterRender();
            this.rendered = true;

            if(this.hidden) this.hide();
            else this.show();

            this.renderChildren();
            this.afterRenderChildren();
            return this;
        },
        renderChildren: function() {
            var items = this.model.models;
            var $el = this.$el.find('tbody');
            console.log($el);
            var fragment = document.createDocumentFragment();
            for(var index = 0; index<items.length; index++){
                var item = items[index];
                fragment.appendChild(this.addItemView(item).el);
            }
            $el[0].appendChild(fragment);
        },
        addItemView: function(item) {
            var itemView = new TestQuestionSelectionView({
                vid: TestQuestionSelectionView.makeVid(item.id),
                model: item
            });
            itemView.doRender();
//            this.addChild(itemView);
            return itemView;
        },
        afterRender: function() {
        }
    });

    return View;
});