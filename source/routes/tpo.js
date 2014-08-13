
module.exports = function (app) {

    app.get('/tpo-test', function (req, res, next) {
        var data = {};
        data.userId = req.session.user.code;
        data.testId = req.query.testId;
        data.paperId = req.query.paperId;
        data.allotId = req.query.allotId;

        if(!data.testId){
            data.testId = "";
        }

        res.render('tpo-test', data);
    });

    app.get('/tpo-review', function (req, res, next) {
        var data = {};
        data.userId = req.session.user.code;
        data.testId = req.query.testId;
        data.paperId = req.query.paperId;
        data.allotId = req.query.allotId;

        res.render('tpo-review', data);
    });


};