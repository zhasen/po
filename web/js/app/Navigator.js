define(['skeleton','./PageHolder', './Targets'], function(sk, PageHolder, Targets) {
    var Navigator = sk.Model.extend({
        name: 'Navigator',
        configure: function(){
            var page = PageHolder.get();
            var targets = null;
            if(page.targets){
                targets = new Targets(page.targets);
            }
            else{
                targets = new Targets();
                targets.fetch();
            }
            this.addChild('targets', targets);
        }
    });
    return Navigator;
});