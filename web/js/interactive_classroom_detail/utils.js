var ALLMETHOD = {init:'init',close:'close'};

var ALLTEACHERRECEIVEMETHOD = {online:'teacher_receive_online_student'};
var ALLTEACHERSENDMETHOD = {answer:'teacher_send_answer',explain:'teacher_send_explain',wait:'teacher_send_wait'};

var ALLSTUDENTRECEIVEMETHOD = {wait:'student_receive_wait',answer:'student_receive_answer',explain:'student_receive_explain'};
var ALLSTUDENTSENDMETHOD = {answer:'student_send_answer'};

var ALLROLL = {student:1,teacher:2};
var ALLWSTYPE = {classRoom:'ClassRoom'};

var ALLMODE = {none:1,student_answer:2,teacher_speak:3};

var canvas, width, height;

var $canvas, $drawing, $graphics;
var ctxGraphics, ctxDrawing;

function getJsonObject(){
    var json = {};
    json.type = ALLWSTYPE.classRoom;
    json.role = role;
    json.userID = userID;
    json.classCode = classCode;
    return json;
}

function initElement(){
    $canvas = $('#canvas');
    $drawing = $('#drawing')[0];
    $graphics = $('#graphics')[0];
    ctxGraphics = $graphics.getContext('2d');
    ctxDrawing = $drawing.getContext('2d');
}