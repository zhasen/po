define(['./Repository'],
function(Repository) {
//    window.user = window.user || {};
//    window.user.meta = window.user.meta || {creates:{},stars:{},likes:{}};
    var page = window.page || {
        user: {
            meta: {
                creates:{},stars:{},likes:{}
            }
        }
    };

    var PageHolder = {
        get: function(){
            return page;
        }
    };

    return PageHolder;
});