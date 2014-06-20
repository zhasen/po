var Enums = {

    // 试题类型
    erType: {
        map: {
            't': '听力',
            's': '口语',
            'd': '阅读',
            'x': '写作'
        },
        list: [
            {
                id: 't',
                name: '听力'
            },
            {
                id: 's',
                name: '口语'
            },
            {
                id: 'd',
                name: '阅读'
            },
            {
                id: 'x',
                name: '写作'
            }
        ]
    },

    // 发布
    erPublish: {
        map: {
            'y': '已发布',
            'n': '未发布',
            'f': '发布',
            'c': '取消发布'
        },
        list: [
            {
                id: 'y',
                name: '已发布'
            },
            {
                id: 'n',
                name: '未发布'
            },
            {
                id: 'f',
                name: '发布'
            },
            {
                id: 'c',
                name: '取消发布'
            }
        ]
    },

    // 审核
    erAudit: {
        map: {
            'y': '已审核',
            'n': '未审核',
            'f': '审核',
            'c': '取消审核'
        },
        list: [
            {
                id: 'y',
                name: '已审核'
            },
            {
                id: 'n',
                name: '未审核'
            },
            {
                id: 'f',
                name: '审核'
            },
            {
                id: 'c',
                name: '取消审核'
            }
        ]
    },

    // 考区
    erRegion: {
        map: {
            bj: '北京'
        },
        list: [
            {
                id: 'bj',
                name: '北京'
            }
        ]
    },

    // 机构
    erOrgan: {
        map: {
            bj: '北京新东方'
        },
        list: [
            {
                id: 'bj',
                name: '北京新东方'
            }
        ]
    },

    // 风险
    erRisk: {
        map: {
            n: '无风险',
            y: '有风险'

        },
        list: [
            {
                id: 'n',
                name: '无风险'
            },
            {
                id: 'y',
                name: '有风险'
            }
        ]
    },

    // 活动状态
    lifeFlag: {
        map: {
            'r': '活动',
            'l': '已锁定',
            'd': '已删除'
        },
        list: [
            {
                id: 'r',
                name: '解锁'
            },
            {
                id: 'l',
                name: '锁定'
            },
            {
                id: 'd',
                name: '删除'
            }
        ]
    },

    // 试卷类型
    paperType: {
        map: {
            'mn': '模拟卷',
            'zt': '真题卷'
        },
        list: [
            {
                id: 'mn',
                name: '模拟卷'
            },
            {
                id: 'zt',
                name: '真题卷'
            }
        ]
    }
};
module.exports = Enums;