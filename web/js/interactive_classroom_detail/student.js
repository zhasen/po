
function initStudent(){

}

function dealStudentMessage(json){
    switch(json.method){
        case ALLMETHOD.init:{
            switch (json.mode){
                case ALLMODE.none:
                    initStudentWait();
                    break;
                case ALLMODE.student_answer:
                    initStudentAnswer();
                    break;
                case ALLMODE.teacher_speak:
                    initStudentExplain();
                    break;
            }
            break;
        }
        case ALLSTUDENTRECEIVEMETHOD.wait:{
            initStudentWait();
            break;
        }
        case ALLSTUDENTRECEIVEMETHOD.answer:{
            initStudentAnswer();
            break;
        }
        case ALLSTUDENTRECEIVEMETHOD.explain:{
            initStudentExplain();
            break;
        }
        case ALLSTUDENTRECEIVEMETHOD.white:{
            if(json.bShow){
                $canvas.show();
            }
            else{
                $canvas.hide();
            }
            break;
        }
        case ALLSTUDENTRECEIVEMETHOD.path_clear:{
            canvas.graphics.push({type: 'clear'});
            redrawGraphics();
            break;
        }
        case ALLSTUDENTRECEIVEMETHOD.path_down:{
            canvas.drawing = {
                type: 'path',
                color: json.color,
                width: json.thickness,
                points: [{x: json.x, y: json.y}]
            };
            break;
        }
        case ALLSTUDENTRECEIVEMETHOD.path_move:{
            var drawing = canvas.drawing;
            if (drawing && drawing.type === 'path') {
                drawing.points.push({x: json.x, y: json.y});
                redrawDrawing();
            }
            break;
        }
        case ALLSTUDENTRECEIVEMETHOD.path_up:{
            var drawing = canvas.drawing;
            if (drawing && drawing.type === 'path') {
                drawing.points.push({x: json.x, y: json.y});
                canvas.graphics.push(drawing);
                drawPath(ctxGraphics, drawing);
                canvas.drawing = null;
                canvas.history = [];
                redrawDrawing();
            }
            break;
        }
        default :{
            break;
        }
    }
}

function initStudentWait(){
    $('#wait').show();
}

function initStudentAnswer(){
    $('#wait').hide();
}

function initStudentExplain(){
    $('#wait').hide();
}