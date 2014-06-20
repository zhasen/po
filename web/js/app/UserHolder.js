define(['./Repository', './PageHolder', './User'],
function(Repository, PageHolder, User) {
    var page = PageHolder.get();
    var uid = page.user.id;
    if(!uid) {
        uid = null;
    }
    else{
        var user = new User();
        user.fetched = true;
        user.init(page.user);
        Repository.put('user', uid, user);
    }

    var UserHolder = {
        uid: uid,
        get: function(){
            return Repository.get('user', this.uid);
        }
    };
    return UserHolder;
});