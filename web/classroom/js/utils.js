
var ALLMETHOD = {init:'init',close:'close'};

var ALLTEACHERRECEIVEMETHOD = {online:'teacher_receive_online_student'};
var ALLTEACHERSENDMETHOD = {offline:'teacher_send_offline',wait:'teacher_send_wait',answer:'teacher_send_answer',explain:'teacher_send_explain',white:'teacher_send_white',path_down:'teacher_send_path_down',path_move:'teacher_send_path_move',path_up:'teacher_send_path_up',path_clear:'teacher_send_path_clear'};

var ALLSTUDENTRECEIVEMETHOD = {offline:'student_receive_offline',wait:'student_receive_wait',answer:'student_receive_answer',explain:'student_receive_explain',white:'student_receive_white',path_down:'student_receive_path_down',path_move:'student_receive_path_move',path_up:'student_receive_path_up',path_clear:'student_receive_path_clear'};
var ALLSTUDENTSENDMETHOD = {answer:'student_send_answer'};

var ALLROLL = {student:1,teacher:2};
var ALLWSTYPE = {classRoom:'ClassRoom'};

var ALLMODE = {teacher_offline:1,wait_teacher_distribute:2,student_answer:3,teacher_speak:4};


var canvas, width, height, offsetX, offsetY;
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

    canvas = {
        graphics: [],
        history: [],
        drawing: null
    };

    window.onresize = function () {
        var top, bottom, left, right;
        top = bottom = left = right = 2;
        top = 85;
        right = 188;
        // get current size
        width = window.innerWidth - right;
        height = window.innerHeight - top - 5;
        if (width == 0 || height == 0)
            return;

        offsetX = left;
        offsetY = top;

        function setPos(e) {
            e.width = width;
            e.height = height;
            e.style.width = width + 'px';
            e.style.height = height + 'px';
            e.style.left = offsetX + 'px';
            e.style.top = offsetY + 'px';
        }
        setPos($canvas[0]);
        offsetX = 0;
        offsetY = 0;
        setPos($drawing);
        setPos($graphics);
        offsetX = left;
        offsetY = top;

        // redraw
        redrawGraphics();
        redrawDrawing();
    };
    window.onresize();
}

// drawing functions
function redrawGraphics() {
    var ctx = ctxGraphics;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    for (var i = canvas.graphics.length - 1; i >= 0; --i) {
        var graph = canvas.graphics[i];
        if (graph.type === 'clear')
            break;
        else if (graph.type === 'path')
            drawPath(ctx, graph);
    }
    ctx.restore();
}

function redrawDrawing() {
    ctxDrawing.clearRect(0, 0, width, height);
    if (!canvas.drawing)
        return;
    drawPath(ctxDrawing, canvas.drawing);
}

function drawPath(ctx, graph) {
    var path = graph.points;
    if (path.length <= 1)
        return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineWidth = graph.width * width;
    ctx.strokeStyle = graph.color;

    ctx.beginPath();
    // move to the first point
    ctx.moveTo(path[0].x * width, path[0].y * height);

    for (i = 1; i < path.length - 2; i ++)
    {
        var xc = (path[i].x + path[i + 1].x) / 2 * width;
        var yc = (path[i].y + path[i + 1].y) / 2 * height;
        ctx.quadraticCurveTo(path[i].x * width, path[i].y * height, xc, yc);
    }
    // curve through the last two path
    if (path.length >= 3) {
        ctx.quadraticCurveTo(
                path[i].x * width, path[i].y * height,
                path[i + 1].x * width, path[i + 1].y * height
        );
    }
    ctx.stroke();

    ctx.restore();
}