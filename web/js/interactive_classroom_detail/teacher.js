
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
        var json = getJsonObject();
        json.method = ALLTEACHERSENDMETHOD.white;
        if($canvas.is(':visible')){
            json.bShow = false;
            $canvas.hide();
            $whiteBoard.text('显示白板');
        }
        else{
            json.bShow = true;
            ctxGraphics.clearRect(0, 0, width, height);
            ctxDrawing.clearRect(0, 0, width, height);
            $canvas.show();
            $whiteBoard.text('隐藏白板');
        }
        ws.send(JSON.stringify(json));
    });

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
        var json = getJsonObject();
        json.method = ALLTEACHERSENDMETHOD.path_down;
        json.x = p.x;
        json.y = p.y;
        json.color = '#ff0000';
        json.thickness = 0.015;
        ws.send(JSON.stringify(json));
        //socket.emit('draw path', p.x, p.y,brushStyle.color, brushStyle.thickness);
    }

    function drawing(e) {
        e.preventDefault();
        var drawing = canvas.drawing;
        if (!drawing || drawing.type !== 'path')
            return;
        var p = getPoint(e);
        drawing.points.push(p);
        var json = getJsonObject();
        json.method = ALLTEACHERSENDMETHOD.path_move;
        json.x = p.x;
        json.y = p.y;
        ws.send(JSON.stringify(json));
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
        var json = getJsonObject();
        json.method = ALLTEACHERSENDMETHOD.path_up;
        json.x = lastPoint.x;
        json.y = lastPoint.y;
        ws.send(JSON.stringify(json));
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
    $whiteBoard.text('显示白板');
}

function initTeacherAnswer(){
    $beginAnswer.hide();
    $beginExplain.show();
    $whiteBoard.hide();
    $endExplain.hide();
    $canvas.hide();
    $whiteBoard.text('显示白板');
}

function initTeacherExplain(){
    $beginAnswer.hide();
    $beginExplain.hide();
    $whiteBoard.show();
    $endExplain.show();
    $canvas.hide();
    $whiteBoard.text('显示白板');
}