define(['jQuery', 'skeleton', './VcbEntries', './VcbEntriesView'
    ],
function($, sk, VcbEntries, VcbEntriesView
    ) {
    var NavigatorView = sk.View.extend({
        vid: 'navigator',
        templateName: 'navigator',
        events: {
            "click #filter": "toFilter"
        },
        routes: {
            "desk": "desk"
        },
        getModelData: function(){
            var data = {};
            if(this.model){
                var model = _.result(this, 'model');
                data = this.getModelJson(model);
                data['targets'] = this.getChildModelData(model, 'targets');
            }

            return data;
        },
        configure: function(){
            var vcbEntries = new VcbEntries();
            this.model.addChild('vcbEntries', vcbEntries);
            var vcbEntriesView = new VcbEntriesView({
                model: vcbEntries
            });
            this.addChild(vcbEntriesView);
        },
        toFilter: function(e){
            var data = {};
            data.target = this.$('#target').val();
            data.core = this.$('input[name=core]:checked').val();
            data.order = this.$('input[name=order]:checked').val();
            data.check = this.$('input[name=check]:checked').val();

            var workbench = this.getParent().getChild('workbench').model;
            var vcbEntries = this.model.getChild('vcbEntries');
            vcbEntries.fetch({
                reset: true,
                error: function(model, response, options){
                    console.error(response);
                },
                success: function(model, response, options){
                    workbench.setEntries(vcbEntries);
                    vcbEntries.trigger('filter', response);
                },
                data: data
            });
        },
        afterRender: function() {
        }
    });

    return NavigatorView;
});