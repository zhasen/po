define(['jQuery', 'skeleton', './Word', './WordView'],
function($, sk, Word, WordView) {

    var keycodeToReviews = {
        49: 30, //Number 1 in keyboard
        50: 20, //Number 2 in keyboard
        51: 10, //Number 3 in keyboard
        52: 0  //Number 4 in keyboard
    };
    var WorkbenchView = sk.View.extend({
        vid: 'workbench',
        templateName: 'workbench',
        events: {
        },
        configure: function(){
            this.listenTo(this.model, 'change:wordId', this.changeWordView, this);
            this.listenTo(this.model, 'reset', this.resetWordView, this);
        },
        changeWordView: function(model, value, options) {
            this.removeLastWordView();
            if(value){
                this.addWordView(value);
            }
        },
        addWordView: function(wordId){
            var word = new Word({id: wordId});
            word.fetched = true;
            var wordView = new WordView({
                model: word,
                renderPlacing: false,
                prerendered: false
            });
            this.addChild(wordView);
            word.fetch({
                error: function(model, response, options){
                    console.error(response);
                },
                success: function(model, response, options){
//                    console.info(model);
                }
            });
        },
        removeLastWordView: function(){
            var childView = this.getChild('word-detail');
            if(childView){
                this.removeChild('word-detail');
                childView.destroy();
            }
        },
        renderContent: function(){
            var childView = this.getChild('word-detail');
            if(childView){
                childView.doRender();
                this.renderChild(childView);
            }
        },
        resetWordView: function(){
            this.removeLastWordView();
        },
        toReviewWord: function(cmd){
            var reviewValue = keycodeToReviews[cmd];
            var wordView = this.getChild('word-detail');
            if(wordView){
                wordView.model.updateReview(reviewValue);
            }
        },
        afterRender: function() {
            var me = this;
            $(document.body).keydown(function(e){
                if(e.keyCode==33){
                    me.model.pageAction(false);
                }
                else if(e.keyCode==34){
                    me.model.pageAction(true);
                }
                else if(e.keyCode>=49 && e.keyCode<=52){
                    me.toReviewWord(e.keyCode);
                }
                else{
                    console.info('key code: ' + e.keyCode);
                }
            });
        }
    });

    return WorkbenchView;
});