var Sequelize = require('sequelize');
var sequelize = require('../commons/sequelize');

var InteractiveClassRoomRecord = sequelize.define('InteractiveClassRoomRecord',
    {
        testId: {type: Sequelize.STRING, primaryKey: true},
        schoolId: {type: Sequelize.INTEGER},
        classCode: {type: Sequelize.STRING},
        userId: {type: Sequelize.STRING},
        data: {type: Sequelize.TEXT},
        selectPage: {type: Sequelize.TEXT},
        pType: {type: Sequelize.INTEGER},
        paperName: {type: Sequelize.STRING}
    },
    {
        tableName: 'InteractiveClassRoomRecord'
    }
);
module.exports = InteractiveClassRoomRecord;