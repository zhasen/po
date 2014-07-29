
var ALLMETHOD = {init:'init',close:'close'};

var ALLTEACHERRECEIVEMETHOD = {online:'teacher_receive_online_student'};
var ALLTEACHERSENDMETHOD = {offline:'teacher_send_offline',wait:'teacher_send_wait',answer:'teacher_send_answer',explain:'teacher_send_explain',white:'teacher_send_white',path_down:'teacher_send_path_down',path_move:'teacher_send_path_move',path_up:'teacher_send_path_up',path_clear:'teacher_send_path_clear'};

var ALLSTUDENTRECEIVEMETHOD = {offline:'student_receive_offline',wait:'student_receive_wait',answer:'student_receive_answer',explain:'student_receive_explain',white:'student_receive_white',path_down:'student_receive_path_down',path_move:'student_receive_path_move',path_up:'student_receive_path_up',path_clear:'student_receive_path_clear'};
var ALLSTUDENTSENDMETHOD = {answer:'student_send_answer'};

var ALLROLL = {student:1,teacher:2};
var ALLWSTYPE = {classRoom:'ClassRoom'};

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

module.exports = function (ws, data) {
    var result = {};
    var json = JSON.parse(data);
    switch(json.method){
        case ALLMETHOD.init:{
            ws.role = json.role;
            ws.userID = json.userID;
            ws.classCode = json.classCode;
            var classRoom = classRooms[json.classCode];
            if(!classRoom){
                classRoom = {};
                classRoom.mode = ALLMODE.teacher_offline;
                classRoom.students = {};
                classRoom.allStudents = {};
                classRoom.allStudents['1'] = {name:'s1',code:'c1',status:0};
                classRoom.allStudents['2'] = {name:'s2',code:'c2',status:0};
                classRoom.allStudents['3'] = {name:'s3',code:'c3',status:0};
                classRooms[json.classCode] = classRoom;
            }

            if(json.role == ALLROLL.student){
                classRoom.students[json.userID] = ws;
                notifyOnlineStudent(classRoom);
                result.method = ALLMETHOD.init;
                result.mode = classRoom.mode;
                result.selectPages = classRoom.selectPages;
                ws.send(JSON.stringify(result));
            }
            else if(json.role == ALLROLL.teacher){
                classRoom.teacher = ws;
                notifyOnlineStudent(classRoom);

                result.method = ALLMETHOD.init;
                if(classRoom.mode == ALLMODE.teacher_offline)
                    result.mode = classRoom.mode = ALLMODE.wait_teacher_distribute;
                else
                    result.mode = classRoom.mode;

                ws.send(JSON.stringify(result));

                switch (result.mode){
                    case ALLMODE.teacher_offline:
                        json.method = ALLSTUDENTRECEIVEMETHOD.offline;
                        break;
                    case ALLMODE.wait_teacher_distribute:
                        json.method = ALLSTUDENTRECEIVEMETHOD.wait;
                        break;
                    case ALLMODE.student_answer:
                        json.method = ALLSTUDENTRECEIVEMETHOD.answer;
                        break;
                    case ALLMODE.teacher_speak:
                        json.method = ALLSTUDENTRECEIVEMETHOD.explain;
                        break;
                }
                broadcast(classRoom.students,json);
            }

            break;
        }
        case ALLMETHOD.close:{
            if(ws.classCode){
                var classRoom = classRooms[ws.classCode];
                if(ws.role == ALLROLL.student){
                    delete classRoom.students[ws.userID];
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
                var classRoom = classRooms[ws.classCode];
                classRoom.mode = ALLMODE.student_answer;
                classRoom.selectPages = json.selectPages;
                if(ws.role == ALLROLL.teacher){
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
        default :{
            return;
        }
    }
};

function broadcast(students,data){
    for(var key in students){
        var student = students[key];
        data.role = ALLROLL.student;
        data.userID = student.userID;
        student.send(JSON.stringify(data));
    }
}