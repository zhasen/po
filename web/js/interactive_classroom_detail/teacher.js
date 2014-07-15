
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

    });

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
}

function initTeacherAnswer(){
    $beginAnswer.hide();
    $beginExplain.show();
    $whiteBoard.hide();
    $endExplain.hide();
}

function initTeacherExplain(){
    $beginAnswer.hide();
    $beginExplain.hide();
    $whiteBoard.show();
    $endExplain.show();
}