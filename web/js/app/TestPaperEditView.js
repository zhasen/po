define(['jQuery', 'skeleton',
    './TestPaper',
    './TestPaperStructureItem',
    './TestPaperStructure',
    './TestPaperStructureView',
    './TestQuestionSelectionFilterView'],
function($, sk,
         TestPaper,
         TestPaperStructureItem,
         TestPaperStructure,
         TestPaperStructureView,
         TestQuestionSelectionFilterView
    ) {
    var View = sk.View.extend({
        vid: 'tp-edit',
        templateName: 'tp-edit',
        prerendered: false,
        events: {
//            'click i.player': "toPlay",
//            'click button[name="review"]': "toReview"
        },
        routes: {
            'tp-edit-:id': 'toLoad'
        },
        configure: function(){
            this.model = new TestPaper();
//            this.listenTo(this.model, 'load', this.onLoad, this);
            this.listenTo(this.model, 'sync', this.onLoad, this);

            var structure = new TestPaperStructure();
            this.model.addChild('structure', structure);

            var structureView = new TestPaperStructureView({
                model: structure
            });
            this.addChild(structureView);

            var testQuestionFilterView = new TestQuestionSelectionFilterView({});
            this.addChild(testQuestionFilterView);
        },
        toLoad: function(id){
            this.model.set('id', id);
            this.model.fetch({
                error: function(model, response, options){
                    console.error(response);
                },
                success: function(model, response, options){
//                    console.info(response);
                    //TODO:
                },
                data: {}
            });
            this.getChild('tq-filter').toFilter();
        },
        onLoad: function(model, resp, options) {
            var st = JSON.parse(this.model.get('st'));
            var structure = this.model.getChild('structure');
            for(var i=0; i<st.length; i++){
                var item = st[i];
                structure.add(item);
            }
            this.doRender();
            structure.trigger('structure');
        },
        afterRenderChildren: function() {
        },
        afterRender: function() {
        }
    });

    return View;
});