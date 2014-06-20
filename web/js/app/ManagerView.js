define(['jQuery', 'jQueryCustom', 'skeleton',
    './TestQuestionFilter', './TestQuestionFilterView'
    ],
function($, $custom, sk,
         TestQuestionFilter, TestQuestionFilterView
    ){
    var ManagerView = sk.View.extend({
        vid: 'manager',
        templateName: 'manager',
        configure: function(){
            var viewId = $('#spaMainViewId').val();
            if(viewId!='tq-filter'){
                return;
            }

            var tqFilter = new TestQuestionFilter();
            var tqFilterView = new TestQuestionFilterView({
                renderPlacing: false,
                model: tqFilter
            });
            this.addChild(tqFilterView);
        },
        afterRenderChildren: function(){
        }
    });

    return ManagerView;
});