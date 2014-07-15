
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