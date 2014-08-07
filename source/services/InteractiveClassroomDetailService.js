
var logger = require('../commons/logging').logger;
var ixdf = require('./IXDFService');
var InteractiveClassRoomRecord = require('../models/InteractiveClassRoomRecord');

exports.ALLWSTYPE = {classRoom:'ClassRoom'};

var ALLMETHOD = {init:'init',close:'close'};

var ALLTEACHERRECEIVEMETHOD = {online:'teacher_receive_online_student',answer:'teacher_receive_student_answer'};
var ALLTEACHERSENDMETHOD = {offline:'teacher_send_offline',wait:'teacher_send_wait',answer:'teacher_send_answer',explain:'teacher_send_explain',white:'teacher_send_white',path_down:'teacher_send_path_down',path_move:'teacher_send_path_move',path_up:'teacher_send_path_up',path_clear:'teacher_send_path_clear',change_page:'teacher_send_change_page'};

var ALLSTUDENTRECEIVEMETHOD = {offline:'student_receive_offline',wait:'student_receive_wait',answer:'student_receive_answer',explain:'student_receive_explain',white:'student_receive_white',path_down:'student_receive_path_down',path_move:'student_receive_path_move',path_up:'student_receive_path_up',path_clear:'student_receive_path_clear',change_page:'student_receive_change_page'};
var ALLSTUDENTSENDMETHOD = {answer:'student_send_answer'};

var ALLROLL = {student:1,teacher:2};
exports.ALLROLL = ALLROLL;

var ALLMODE = {teacher_offline:1,wait_teacher_distribute:2,student_answer:3,teacher_speak:4};



//classRoom.mode
//1 等待 2 答题 3 讲解

var classRooms = {};

function notifyOnlineStudent(classRoom){
    if(classRoom.teacher){
        for(var key in classRoom.allStudents){
            if(classRoom.students[key]){
                classRoom.allStudents[key].status = 1;
            }
            else{
                classRoom.allStudents[key].status = 0;
            }
        }
        var result = {};
        result.method = ALLTEACHERRECEIVEMETHOD.online;
        result.students = classRoom.allStudents;
        classRoom.teacher.send(JSON.stringify(result));
    }
}

exports.dealFunc = function (ws, data) {
    var result = {};
    var json = JSON.parse(data);
    switch(json.method){
        //浏览器刷新之后 答题记录肯定是获取不到了的 uuid是通过js来生成的 不行的
        case ALLMETHOD.init:{

            ws.role = json.role;
            ws.userId = json.userId;
            ws.classCode = json.classCode;
            ws.schoolId = json.schoolId;

            var classRoom = classRooms[json.classCode];
            if(!classRoom){
                classRoom = {};
                classRoom.mode = ALLMODE.teacher_offline;
                classRoom.students = {};
                classRoom.allStudents = {};

                ixdf.uniAPIInterface({
                    schoolid: json.schoolId,
                    classCode: json.classCode
                }, 'class', 'GetStudentsOfClass', function (err, ret) {
                    if(ret.State == 1){
                        for(var i = 0 ; i < ret.Data.length ; i++){
                            var info = ret.Data[i];
                            classRoom.allStudents[info.Code] = {name:info.Name,code:info.Code,status:0};
                        }
                        notifyOnlineStudent(classRoom);
                    }
                });
                classRooms[json.classCode] = classRoom;
            }

            result.selectPages = classRoom.selectPages;
            result.currentPage = classRoom.currentPage;

            if(json.role == ALLROLL.student){
                var student;
                if(!classRoom.students[json.userId]){
                    classRoom.students[json.userId] = {};
                }
                student = classRoom.students[json.userId];
                student.ws = ws;
                student.role = json.role;
                student.userId = json.userId;
                student.classCode = json.classCode;
                student.schoolId = json.schoolId;

                notifyOnlineStudent(classRoom);
                result.method = ALLMETHOD.init;
                result.mode = classRoom.mode;
                result.testId = student.testId;
                result.testData = student.testData;
                ws.send(JSON.stringify(result));
            }
            else if(json.role == ALLROLL.teacher){

                classRoom.teacher = ws;
                classRoom.teacherId = json.userId;
                notifyOnlineStudent(classRoom);

                result.method = ALLMETHOD.init;
                result.testId = classRoom.teacherTestId;
                result.testData = {};
                for(var key in classRoom.students){
                    var student = classRoom.students[key];
                    result.testData[student.userId] = student.testData;
                }

                if(classRoom.mode == ALLMODE.teacher_offline)
                    result.mode = classRoom.mode = ALLMODE.wait_teacher_distribute;
                else
                    result.mode = classRoom.mode;

                ws.send(JSON.stringify(result));

                switch (result.mode){
                    case ALLMODE.teacher_offline:
                        result.method = ALLSTUDENTRECEIVEMETHOD.offline;
                        break;
                    case ALLMODE.wait_teacher_distribute:
                        result.method = ALLSTUDENTRECEIVEMETHOD.wait;
                        break;
                    case ALLMODE.student_answer:
                        return;
                        break;
                    case ALLMODE.teacher_speak:
                        result.method = ALLSTUDENTRECEIVEMETHOD.explain;
                        break;
                }
                broadcast(classRoom.students,result);
            }

            break;
        }

        //学生的
        case ALLSTUDENTSENDMETHOD.answer:{
            if(ws.classCode){
                var classRoom = classRooms[ws.classCode];
                if(ws.role == ALLROLL.student){

                    var student = classRoom.students[ws.userId];

                    student.testId = json.testId;
                    student.testData = json.data;

                    if(classRoom.teacher){
                        result.method = ALLTEACHERRECEIVEMETHOD.answer;
                        result.data = json.data;
                        result.data.subjectData = JSON.parse(result.data.subjectData);
                        result.studentCode = json.userId;
                        classRoom.teacher.send(JSON.stringify(result));

                        {
                            var recordJson = {
                                selectPage: JSON.stringify(classRoom.selectPages) ,
                                testId: json.testId ,
                                classCode: json.classCode,
                                schoolId: json.schoolId,
                                userId: json.userId,
                                pType: json.pType,
                                data: JSON.stringify(json.data),
                                paperName: json.paperName
                            };
                            if(!json.testId || json.testId.length == 0){
                                console.log(JSON.stringify(recordJson));
                                logger.error(JSON.stringify(recordJson));
                            }
                            addTestRecord(recordJson,null);
                        }

                        {

                            var testIds = new Array();
                            for(var key in classRoom.students){
                                var student = classRoom.students[key];
                                if(student.testId)
                                    testIds.push(student.testId);
                            }

                            var recordJson = {
                                selectPage: JSON.stringify(classRoom.selectPages) ,
                                testId: classRoom.teacherTestId ,
                                classCode: json.classCode,
                                schoolId: json.schoolId,
                                userId: classRoom.teacherId,
                                data: JSON.stringify(testIds),
                                pType: json.pType,
                                paperName: json.paperName
                            };
                            if(!json.testId || json.testId.length == 0){
                                console.log(JSON.stringify(recordJson));
                                logger.error(JSON.stringify(recordJson));
                            }
                            addTestRecord(recordJson,null);
                        }


                    }
                }
            }
            break;
        }

        case ALLMETHOD.close:{
            if(ws.classCode){
                var classRoom = classRooms[ws.classCode];
                if(ws.role == ALLROLL.student){
                    delete classRoom.students[ws.userId].ws;
                }
                else{
                    delete classRoom.teacher;
                }
                notifyOnlineStudent(classRoom);
            }
            break;
        }
        case ALLTEACHERSENDMETHOD.answer:{
            if(ws.classCode){
                if(ws.role == ALLROLL.teacher){
                    var classRoom = classRooms[ws.classCode];
                    for(var key in classRoom.students){
                        var student = classRoom.students[key];
                        delete student.testId;
                        delete student.testData;
                    }
                    classRoom.mode = ALLMODE.student_answer;
                    classRoom.selectPages = json.selectPages;
                    classRoom.teacherTestId = json.testId;
                    json.method = ALLSTUDENTRECEIVEMETHOD.answer;
                    broadcast(classRoom.students,json);
                }
            }
            break;
        }
        case ALLTEACHERSENDMETHOD.explain:{
            if(ws.classCode){
                var classRoom = classRooms[ws.classCode];
                classRoom.mode = ALLMODE.teacher_speak;
                if(ws.role == ALLROLL.teacher){
                    json.method = ALLSTUDENTRECEIVEMETHOD.explain;
                    broadcast(classRoom.students,json);
                }
            }
            break;
        }
        case ALLTEACHERSENDMETHOD.offline:{
            if(ws.classCode){
                var classRoom = classRooms[ws.classCode];
                classRoom.mode = ALLMODE.teacher_offline;
                if(ws.role == ALLROLL.teacher){
                    json.method = ALLSTUDENTRECEIVEMETHOD.offline;
                    broadcast(classRoom.students,json);
                }
            }
            break;
        }
        case ALLTEACHERSENDMETHOD.wait:{
            if(ws.classCode){
                var classRoom = classRooms[ws.classCode];
                classRoom.mode = ALLMODE.wait_teacher_distribute;
                if(ws.role == ALLROLL.teacher){
                    json.method = ALLSTUDENTRECEIVEMETHOD.wait;
                    broadcast(classRoom.students,json);
                }
            }
            break;
        }
        case ALLTEACHERSENDMETHOD.white:{
            if(ws.classCode){
                var classRoom = classRooms[ws.classCode];
                if(ws.role == ALLROLL.teacher){
                    json.method = ALLSTUDENTRECEIVEMETHOD.white;
                    broadcast(classRoom.students,json);
                }
            }
            break;
        }
        case ALLTEACHERSENDMETHOD.path_down:{
            if(ws.classCode){
                var classRoom = classRooms[ws.classCode];
                if(ws.role == ALLROLL.teacher){
                    json.method = ALLSTUDENTRECEIVEMETHOD.path_down;
                    broadcast(classRoom.students,json);
                }
            }
            break;
        }
        case ALLTEACHERSENDMETHOD.path_up:{
            if(ws.classCode){
                var classRoom = classRooms[ws.classCode];
                if(ws.role == ALLROLL.teacher){
                    json.method = ALLSTUDENTRECEIVEMETHOD.path_up;
                    broadcast(classRoom.students,json);
                }
            }
            break;
        }
        case ALLTEACHERSENDMETHOD.path_move:{
            if(ws.classCode){
                var classRoom = classRooms[ws.classCode];
                if(ws.role == ALLROLL.teacher){
                    json.method = ALLSTUDENTRECEIVEMETHOD.path_move;
                    broadcast(classRoom.students,json);
                }
            }
            break;
        }
        case ALLTEACHERSENDMETHOD.path_clear:{
            if(ws.classCode){
                var classRoom = classRooms[ws.classCode];
                if(ws.role == ALLROLL.teacher){
                    json.method = ALLSTUDENTRECEIVEMETHOD.path_clear;
                    broadcast(classRoom.students,json);
                }
            }
            break;
        }
        case ALLTEACHERSENDMETHOD.change_page:{
            if(ws.classCode){
                var classRoom = classRooms[ws.classCode];
                if(ws.role == ALLROLL.teacher){
                    classRoom.currentPage = json.page;
                    json.method = ALLSTUDENTRECEIVEMETHOD.change_page;
                    broadcast(classRoom.students,json);
                }
            }
            break;
        }

        default :{
            return;
        }
    }
};

function broadcast(students,data){
    for(var key in students){
        var student = students[key];
        data.role = ALLROLL.student;
        data.userId = student.userId;
        student.ws.send(JSON.stringify(data));
    }
}


//{classCode:classCode,userId:userId}
exports.findTestRecord = function (whereObject,callback) {
    InteractiveClassRoomRecord
        .findAll({ where: whereObject, order: [['updatedAt', 'DESC']] })
        .complete(function(err, records) {
            if (err) {
                logger.error(err.message);
                callback(err, null);
            } else {
                callback(null, records);
            }
        });
}

var addTestRecord = function (recordObj,callback) {

    InteractiveClassRoomRecord
        .find({ where: {testId:recordObj.testId}})
        .complete(function(err, record) {
            if (err || !record) {
                record = InteractiveClassRoomRecord.build(recordObj);
            } else {
                delete recordObj.testId;
                record.updateAttributes(recordObj);
            }
            record.save()
                .complete(function (err) {

                    if (err)
                        logger.error(err.message);

                    if (callback)
                        callback(err);
                });
        });
}