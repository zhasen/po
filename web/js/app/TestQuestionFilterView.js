define(['jQuery', 'skeleton', './TestQuestionFilter'
    ],
function($, sk, TestQuestionFilter
    ) {
    var TestQuestionFilterView = sk.View.extend({
        vid: 'tq-filter',
        templateName: 'tq-filter',
        events: {
            "click #filter": "toFilter"
        },
        routes: {
            "tq-filter": "toFilter",
            "tq-edit-:id": "toEdit"
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
        toEdit: function(id) {
            alert(id);
        },
        afterRender: function() {
        }
    });

    return TestQuestionFilterView;
});