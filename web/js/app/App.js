define(['jQuery', 'skeleton', 'Bootstrap', './TestQuestionFilterView', './TestPaperEditView'],
function($, sk, Bootstrap, TestQuestionFilterView, TestPaperEditView) {
    var Spa = sk.Spa.extend({
        configure: function(){
            var viewName = $('#_moduleViewName').val();
            if(!viewName){
                return;
            }

            var ModuleView = require('app/'+viewName);
            var view = new ModuleView();
            $('body section div[data-view-id=manager]').replaceWith(view.el);
        }
    });

    return Spa;
});