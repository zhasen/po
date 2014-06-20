var logger = require('../commons/logging').logger;
var util = require('util');
var time = require('../../source/commons/time');
var PageInput = require('./common/PageInput');
var typeRegistry = require('../models/TypeRegistry');
var TestQuestion = require('../models/TestQuestion').model;
var TestQuestionContent = require('../models/TestQuestionContent').model;
var TestQuestionService = require('../services/TestQuestionService');

module.exports = function (app) {
    var mode = app.get('env') || 'development';
    var asseton = require('../middlewares/asseton')(mode);
    /**
     * 试题（列表）首页
     */
    var testQuestionIndexPage = function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i().enums();
        TestQuestionService.listTestQuestions(function (err, list) {
            if (err) {
                logger.error(err);
                res.json(500, err); //TODO response a json document with error info
                return;
            }
            input.page.testQuestions = list;
            res.render('tq-index', input);
        });
    };

    var testQuestionFilterPage = function (req, res, next) {
        asseton(req, res);
        var input = {};
        var page = {};
        input.page = page;
        page.user = req.user;
        page.enums = {};

        page.enums.region = typeRegistry.Region.data();
        page.enums.org = typeRegistry.Organization.data();
        page.enums.erType = typeRegistry.erType.data();
        page.enums.erRisk = typeRegistry.erRisk.data();
        page.enums.erPublishStatus = typeRegistry.erPublishStatus.data();
        page.enums.erPublishAction = typeRegistry.erPublishAction.data();
        page.enums.erAuditStatus = typeRegistry.erAuditStatus.data();
        page.enums.erAuditAction = typeRegistry.erAuditAction.data();
        res.render('tq-filter', input);
    };

    /**
     * 试题属性录入页面
     */
    var editPage = function (req, res, next) {
        asseton(req, res);
        var input = PageInput.i().enums();
        input.page.data = TestQuestion.i()._data;
        input.page.recentYears = time.recentYears(3);
        input.page.currentYear = time.currentYear();
        input.page.content = TestQuestionContent.i()._data;
        input.page.type = 'add'; // 'add' 新增状态 'edit' 编辑状态
        if (req.params.id) {
            TestQuestionService.getById(req.params.id, function (err, result) {
                console.info('getById By ' + req.params.id + ' : ' + JSON.stringify(result));
                input.page.data = result[0];
                var define = '';
                if (result[1]) {
                    define = JSON.stringify(result[1].define);
                }
                input.page.content = {id: req.params.id, 'define': define};
                input.page.type = 'edit';
                res.render('tq-edit', input);
            });
        } else {
            res.render('tq-edit', input);
        }
    };

    /**
     * 试题属性插入动作
     */
    var editInsertAction = function (req, res, next) {
        asseton(req, res);
        TestQuestionService.insert(req.body, function (err, result) {
            if (err) {
                console.err('save error');
                res.json({s: 'error', status: '保存失败，错误信息：' + JSON.stringify(err)});
            } else {
                var o = {s: 'success', status: '保存成功'};
                if (result[0]) {
                    console.info(result[0].get('id'), ' ', result[0].json());
                    o.id = result[0].get('id');
                }
                res.json(o);
            }
        });
    };

    /**
     * 试题属性编辑
     */
    var editUpdateAction = function (req, res, next) {
        asseton(req, res);
        TestQuestionService.update(req.params.id, req.body, function (err, result) {
            if (err) {
                console.err({s: 'error', status: '保存失败，错误信息：' + JSON.stringify(err)});
            } else {
                console.info(result[0].get('id'), ' ', result[0].json());
                res.json({
                    s: 'success',
                    status: '保存成功',
                    id: result[0].get('id')
                });
            }
        });
    };

    var singleAttrAction = function (req, res, next) {
        var tqId = req.params.id;
        var action = req.params.action;
        //logger.debug(util.format('User [%s] %ss thing [%s]', uid, action, thingId));
        TestQuestionService[action](tqId, function (err, result) {
            if (err) {
                logger.error(err);
                res.json(500, {s: 'error', status: 'error', result: '操作失败，错误信息：' + err});
                return;
            }
            res.json(200, {s: 'success', result: result});
        });
    };

    var getTqAction = function (req, res, next) {
        var actions = {getContentById: 'getContentById', getAttrById: 'getAttrById', getById: 'getById'};
        var tqId = req.params.id;
        var action = req.params.action;

        //logger.debug(util.format('User [%s] %ss thing [%s]', uid, action, thingId));
        if (actions[action]) {
            TestQuestionService[action](tqId, function (err, result) {
                if (err) {
                    logger.error(err);
                    res.json(500, {status: 'error', result: '操作失败，错误信息：' + err});
                    return;
                }
                res.json(200, {status: 'success', result: result});
            });
        } else {
            res.json(500, {status: 'error', result: '操作失败，错误信息：错误的路径'});
        }
    };

    //删除
    var deleteAction = function (req, res, next) {
        asseton(req, res);
        TestQuestionService.delete(req.params.id, function (err) {
            if (err) {
                logger.error(err);
                res.json(500, {status: '删除失败, 错误信息：' + err});
            } else {
                res.json(200, {status: 'success', result: '删除成功'});
            }
        });
    };

    app.get('/tq-index', testQuestionIndexPage); // 试题（列表）首页
    app.get('/tq-filter', testQuestionFilterPage); // 试题（列表）首页

    app.get('/tq/filter/:query', function (req, res, next) {
        TestQuestionService.listTestQuestions(function (err, list) {
            if (err) {
                logger.error(err);
                res.json(500, err); //TODO response a json document with error info
                return;
            }
            res.json(200, list);
        });
    });

    app.get('/tq-edit', editPage); // 试题属性录入页面
    app.post('/tq', editInsertAction); // 试题属性录入功能
    app.get('/tq-edit-:id', editPage); // 试题属性编辑页面
    app.put('/tq/:id', editUpdateAction); // 试题属性编辑功能
    app.delete('/tq/:id', deleteAction); // 删除操作
    app.put('/tq/:id/:action', singleAttrAction); // 修改试题的发布状态、审核状态等单一属性
    app.get('tq/:id/:action', getTqAction); // 获取试题数据的接口，eg: /tq/5uHg0/getContentById;  /tq/5uHg0/getAttrById; /tq/5uHg0/getById

}