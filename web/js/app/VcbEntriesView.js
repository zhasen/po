define(['jQuery', 'skeleton'],
function($, sk) {
    var View = sk.View.extend({
        vid: 'vcb-list',
        templateName: 'vcb-list',
        renderPlacing: false,
        className: 'container-fluid',
        events: {
            "click table tr": "toSelectRow"
        },
        configure: function(){
            var me = this;
            this.listenTo(this.model, 'select', function(specific, wordId, down){
                me.moveRow(wordId, down);
            });
            this.listenTo(this.model, 'filter', function(){
                me.doRender();
                me.setFirstRow();
            });
            this.listenTo(this.model, 'review', this.reviewWord, this);
        },
        toSelectRow: function(e){
            var el = e.target;
            var $el = $(el);
            var wordId = null;
            if(el.tagName=="TD"){
                wordId = $el.next().text();
                $el = $el.parent();
            }
            else if(el.tagName=="TR"){
                wordId = $el.find('TD').next().text();
            }
            this.selectRow(wordId, $el);
            this.showWordDetail(wordId);
        },
        moveRow: function(wordId, down){
            if(this.lastWordTr){
                this.lastWordTr.removeClass('info');
            }

            var $tr = this.lastWordTr ? (down ? this.lastWordTr.next() : this.lastWordTr.prev()) : null;
            this.lastWordTr = $tr || this.lastWordTr || this.$("TR:has(TD:contains('"+ wordId +"'))");
            this.lastWordId = wordId;

            if(this.lastWordTr){
                this.lastWordTr.addClass('info');
            }
            else{
                console.warn('tr is null');
            }
        },
        selectRow: function(wordId, $Tr){
            if(this.lastWordTr){
                this.lastWordTr.removeClass('info');
            }
            this.lastWordTr = $Tr || this.$("TR:has(TD:contains('"+ wordId +"'))");
            this.lastWordId = wordId;
            this.lastWordTr.addClass('info');
        },
        setFirstRow: function(){
            if(this.model.length>0){
                var entry = this.model.at(0);
                var id = entry.id;
                this.selectRow(id);
                this.showWordDetail(id);
            }
            else{
                console.warn('there are no entries to select as first row');
            }
        },
        showWordDetail: function(wordId) {
            var workbench = this.model.getParent().getParent().getChild('workbench');
            if(workbench){
                workbench.pageTo(wordId);
            }
        },
        reviewWord: function(wordDetail){
            if(this.lastWordTr){
                if(!wordDetail.review || wordDetail.review==0){
                    this.lastWordTr.removeClass('success');
                }
                else{
                    this.lastWordTr.addClass('success');
                }
            }
        },
        afterRender: function() {
        }
    });

    return View;
});