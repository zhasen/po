
var $beginAnswer;

var $beginExplain;

var $whiteBoard;
var $endExplain;

function initTeacher(){

    $beginAnswer = $("#beginAnswer");
    $beginExplain = $("#beginExplain");
    $whiteBoard = $("#whiteBoard");
    $endExplain = $("#endExplain");

    $beginAnswer.bind("click", function(){
        var json = getJsonObject();
        json.method = ALLTEACHERSENDMETHOD.answer;
        //这里还需要带上老师分配的试题
        ws.send(JSON.stringify(json));
        initTeacherAnswer();
    });

    $beginExplain.bind("click", function(){
        var json = getJsonObject();
        json.method = ALLTEACHERSENDMETHOD.explain;
        //这里还需要带上老师分配的试题
        ws.send(JSON.stringify(json));
        initTeacherExplain();
    });

    $endExplain.bind("click", function(){
        var json = getJsonObject();
        json.method = ALLTEACHERSENDMETHOD.wait;
        //这里还需要带上老师分配的试题
        ws.send(JSON.stringify(json));
        initTeacherWait();
    });

    $whiteBoard.bind("click", function(){
        if($canvas.is(':visible'))
            $canvas.hide();
        else{
            ctxGraphics.clearRect(0, 0, width, height);
            ctxDrawing.clearRect(0, 0, width, height);
            $canvas.show();
        }

    });

    canvas = {
        graphics: [],
        history: [],
        drawing: null
    };

    var offsetX, offsetY;
    window.onresize = function () {
        var top, bottom, left, right;
        top = bottom = left = right = 20;
        // get current size
        width = window.innerWidth;
        height = window.innerHeight;
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
        setPos($drawing);
        setPos($graphics);

        // redraw
        redrawGraphics();
        redrawDrawing();
    };
    window.onresize();

    /* Drawing */

    function getPoint(e) {
        var x, y;
        if (e.touches) {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        }
        else {
            x = e.clientX;
            y = e.clientY;
        }
        x -= offsetX; x /= width;
        y -= offsetY; y /= height;
        return {x: x, y: y};
    }

    function startDrawing(e) {
        e.preventDefault();
        var p = getPoint(e);
        if (typeof e.button === 'number' && e.button !== 0)
            return;
        canvas.drawing = {
            type: 'path',
            color: '#ff0000',
            width: 0.015,
            points: [p]
        };
        //socket.emit('draw path', p.x, p.y,brushStyle.color, brushStyle.thickness);
    }

    function drawing(e) {
        e.preventDefault();
        var drawing = canvas.drawing;
        if (!drawing || drawing.type !== 'path')
            return;
        var p = getPoint(e);
        drawing.points.push(p);
        //socket.emit('draw path add', p.x, p.y);
        redrawDrawing();
    }

    function endDrawing(e) {
        e.preventDefault();
        var drawing = canvas.drawing;
        if (!drawing || drawing.type !== 'path')
            return;
        if (!e.touches)
            drawing.points.push(getPoint(e));

        var length = drawing.points.length;
        var lastPoint = drawing.points[length - 1];
        canvas.graphics.push(drawing);
        canvas.history = [];
        //$undo.disabled = false;
        //$redo.disabled = true;
        //$clear.disabled = false;
        drawPath(ctxGraphics, drawing);
        //socket.emit('draw path end', lastPoint.x, lastPoint.y);
        canvas.drawing = null;
        redrawDrawing();
    }

    $drawing.addEventListener('mousedown', startDrawing);
    $drawing.addEventListener('mousemove', drawing);
    $drawing.addEventListener('mouseup', endDrawing);
    $drawing.addEventListener('touchstart', startDrawing);
    $drawing.addEventListener('touchmove', drawing);
    $drawing.addEventListener('touchend', endDrawing);

}

function dealTeacherMessage(json){
    switch(json.method){
        case ALLMETHOD.init:{
            switch (json.mode){
                case ALLMODE.none:
                    initTeacherWait();
                    break;
                case ALLMODE.student_answer:
                    initTeacherAnswer();
                    break;
                case ALLMODE.teacher_speak:
                    initTeacherExplain();
                    break;
            }
            break;
        }
        case ALLTEACHERRECEIVEMETHOD.online:{
            $("#online").text(json.students);
            break;
        }
        default :{
            break;
        }
    }
}

function initTeacherWait(){
    $beginAnswer.show();
    $beginExplain.hide();
    $whiteBoard.hide();
    $endExplain.hide();
    $canvas.hide();
}

function initTeacherAnswer(){
    $beginAnswer.hide();
    $beginExplain.show();
    $whiteBoard.hide();
    $endExplain.hide();
    $canvas.hide();
}

function initTeacherExplain(){
    $beginAnswer.hide();
    $beginExplain.hide();
    $whiteBoard.show();
    $endExplain.show();
    $canvas.hide();
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