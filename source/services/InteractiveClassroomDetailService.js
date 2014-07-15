
var ALLMETHOD = {init:'init',close:'close'};

var ALLTEACHERRECEIVEMETHOD = {online:'teacher_receive_online_student'};
var ALLTEACHERSENDMETHOD = {answer:'teacher_send_answer',explain:'teacher_send_explain'};

var ALLSTUDENTRECEIVEMETHOD = {wait:'student_receive_wait',answer:'student_receive_answer',explain:'student_receive_explain'};
var ALLSTUDENTSENDMETHOD = {answer:'student_send_answer'};

var ALLROLL = {student:1,teacher:2};
var ALLWSTYPE = {classRoom:'ClassRoom'};

var ALLMODE = {none:1,student_answer:2,teacher_speak:3};

//classRoom.mode
//1 等待 2 答题 3 讲解

var classRooms = {};

function notifyOnlineStudent(classRoom){
    if(classRoom.teacher){
        var students = '';
        for(var key in classRoom.students){
//            alert(values[ele]);//下标
            students += key + ' ';
        }
        var result = {};
        result.method = ALLTEACHERRECEIVEMETHOD.online;
        result.students = students;
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
                classRoom.mode = ALLMODE.none;
                classRoom.students = {};
                classRooms[json.classCode] = classRoom;
            }

            if(json.role == ALLROLL.student){
                classRoom.students[json.userID] = ws;
                notifyOnlineStudent(classRoom);
                switch (classRoom.mode){
                    case ALLMODE.none:{
                        result.method = ALLSTUDENTRECEIVEMETHOD.wait;
                        ws.send(JSON.stringify(result));
                        break;
                    }
                    case ALLMODE.student_answer:{
                        result.method = ALLSTUDENTRECEIVEMETHOD.answer;
                        ws.send(JSON.stringify(result));
                        break;
                    }
                    case ALLMODE.teacher_speak:{
                        result.method = ALLSTUDENTRECEIVEMETHOD.explain;
                        ws.send(JSON.stringify(result));
                        break;
                    }
                }
            }
            else if(json.role == ALLROLL.teacher){
                classRoom.teacher = ws;
                notifyOnlineStudent(classRoom);
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
                classRoom.mode = ALLMODE.student_answer;
                var classRoom = classRooms[ws.classCode];
                if(ws.role == ALLROLL.teacher){
                    for(var key in classRoom.students){
                        var student = classRoom.students[key];
                        result.method = ALLSTUDENTRECEIVEMETHOD.answer;
                        student.send(JSON.stringify(result));
                    }
                }
            }
            break;
        }
        default :{
            return;
        }
    }
};
