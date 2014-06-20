var TypeRegistry = require('./common/TypeRegistry');
var registry = new TypeRegistry('TypeRegistry', 'TypeRegistry', 'TypeRegistry');

registry
.item('LifeFlag', 'LifeFlag', '状态')
    .addChild('Active','a', '活动')
    .addChild('Inactive','i', '锁定')
    .addChild('Deleted','d', '已删除')

.up().item('erRisk', 'erRisk', '风险')
    .addChild('NoRisk','n', '无风险')
    .addChild('WithRisk','y', '有风险')

.up().item('erType', 'erType', '试题类型')
    .addChild('Reading','r', '阅读')
    .addChild('Listening','l', '听力')
    .addChild('Speaking','s', '口语')
    .addChild('Writing','w', '写作')

.up().item('erPublishStatus', 'erPublish', '发布状态')
    .addChild('Unpublished','n', '未发布')
    .addChild('Published','y', '已发布')

.up().item('erPublishAction', 'erPublishAction', '发布活动')
    .addChild('Publish','n', '发布')
    .addChild('Unpublish','y', '取消发布')

.up().item('erAuditStatus', 'erAuditStatus', '审核状态')
    .addChild('Unaudited','n', '未审核')
    .addChild('Audited','y', '已审核')

.up().item('erAuditAction', 'erAuditAction', '审核活动')
    .addChild('Audit','n', '审核')
    .addChild('Unaudit','y', '取消审核')

.up().item('TestPaperType', 'TestPaperType', '试卷类型')
    .addChild('Model','m', '模拟卷')
    .addChild('Original','o', '真题卷')

.up().item('Organization', 'org', '机构')
    .addChild('BeijingXDF','bjxdf', '北京新东方')

    .up().item('Region', 'region', '考区')
    .addChild('Beijing','bj', '北京')

.up().item('UserType', 'UserType', '用户类型')
    .addChild('Local','l', '本地')
    .addChild('OAuth','o', '通行证')

module.exports = registry;