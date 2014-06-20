define(['skeleton'], function(sk) {
    var Model = sk.Model.extend({
        name: 'Word',
        urlRoot: '/word',
        idAttribute: 'id',
        configure: function(){
        },
        updateReview: function(value){
            this.save({'review': value}, {
                error: function(model, response, options){
                    console.error(response);
                },
                success: function(model, response, options){
                    console.info(response);
                }
            });
        }
    });
    return Model;
});