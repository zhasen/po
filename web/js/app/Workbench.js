define(['skeleton', 'config'],
function(sk, config) {

    var Workbench = sk.Model.extend({
        configure: function(){
            this.on('review', this.reviewWord, this);
        },
        setEntries: function(entries){
            this.entries = entries;

            this.set('wordId', null);
            this.set('wordIndex', null);
            //TODO here to set first selection
            this.trigger('reset');
        },
        pageTo: function(wordId){
            console.log('page to ' + wordId);
            var entries = this.entries;
            var length = entries ? entries.length : 0;
            var wordIndex = 0;
            if(length>0){
                for(var i=0; i<length; i++){
                    if(entries.models[i].id==wordId){
                        wordIndex = i;
                    }
                }
                this.set('wordId', wordId);
                this.set('wordIndex', wordIndex);
            }
        },
        pageAction: function(down){
            console.log('page ' + (down ? 'down' : 'up'));
            var wordId = null;
            var wordIndex = this.get('wordIndex');
            var entries = this.entries;
            var length = entries ? entries.length : 0;
            console.info('length is ' + length);
            if(length!=0 && down && wordIndex+1 < length){
                wordId = entries.at(wordIndex+1).id;
                if(wordId){
                    this.set('wordId', wordId);
                    this.set('wordIndex', ++wordIndex);
                    entries.select(false, wordId, down);

                    console.info('wordId  ' + wordId);
                    console.info('wordIndex  ' + wordIndex);
                }
                else{
                    console.warn(wordId + ' is blank');
                }
            }
            else if(length!=0 && !down && wordIndex-1 >= 0){
                wordId = entries.at(wordIndex-1).id;
                if(wordId){
                    this.set('wordId', wordId);
                    this.set('wordIndex', --wordIndex);
                    entries.select(false, wordId, down);

                    console.info('wordId  ' + wordId);
                    console.info('wordIndex  ' + wordIndex);
                }
                else{
                    console.warn(wordId + ' is blank');
                }
            }
            else{
                console.warn('word index is ' + wordIndex + ', it touches the end of the entries');
            }
        },
        reviewWord: function(wordDetail){
            this.entries.trigger('review', wordDetail);
        },
        emptyFn: function(){}
    });
    return Workbench;
});