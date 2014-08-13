
function initStudent(){

}

function dealStudentMessage(json){
    switch(json.method){
        case ALLMETHOD.init:{
            switch (json.mode){
                case ALLMODE.teacher_offline:
                    current_Page = 0;
                    initStudentWait('老师离线，请稍后...');
                    break;
                case ALLMODE.wait_teacher_distribute:
                    current_Page = 0;
                    initStudentWait('等待老师分配试题...');
                    break;
                case ALLMODE.student_answer:
                    var temp;current_Page = temp;
                    test_Id = json.testId;
                    select_pages = json.selectPages;
                    if(json.testData){
                        //加载答案
                        Player.paperAnswers = {};
                        Player.paperAnswers[json.testData.subjectId] = JSON.parse(json.testData.answerContent);
                        Player.buildAnswer();
                        current_Page = json.testData.pageIndex;
                    }
                    initStudentAnswer();
                    break;
                case ALLMODE.teacher_speak:
                    select_pages = json.selectPages;
                    current_Page = json.currentPage;
                    initStudentExplain();
                    break;
            }
            break;
        }
        case ALLSTUDENTRECEIVEMETHOD.offline:{
            current_Page = 0;
            classMode = ALLMODE.teacher_offline;
            initStudentWait('老师离线，请稍后...');
            break;
        }
        case ALLSTUDENTRECEIVEMETHOD.wait:{
            current_Page = 0;
            classMode = ALLMODE.wait_teacher_distribute;
            initStudentWait('等待老师分配试题...');
            break;
        }
        case ALLSTUDENTRECEIVEMETHOD.answer:{
            var temp;current_Page = temp;
            test_Id = new UUID().id;
            classMode = ALLMODE.student_answer;
            select_pages = json.selectPages;


            $('.subject_page').text('');
            Player.paperAnswers = {};
            Player.buildAnswer();

            initStudentAnswer();

            break;
        }
        case ALLSTUDENTRECEIVEMETHOD.explain:{
            classMode = ALLMODE.teacher_speak;
            current_Page = json.page;
            initStudentExplain();
            break;
        }
        case ALLSTUDENTRECEIVEMETHOD.white:{
            if(json.bShow){
                ctxGraphics.clearRect(0, 0, width, height);
                ctxDrawing.clearRect(0, 0, width, height);
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
        case ALLSTUDENTRECEIVEMETHOD.change_page:{
            goToPage(json.page,true);
            break;
        }
        default :{
            break;
        }
    }
}

function initStudentWait(str){

    delete select_pages;

    $("#forbid_control").hide();

    var h = $(document).height();
    $('#loadingText').text(str);
    $(".overlay").css({"height": h });
    $(".overlay").css({'display':'block','opacity':'0.4'});
    $(".showbox").stop(true).animate({'margin-top':'300px','opacity':'1'},200);
}

function initStudentReview(json){
    if(json.length == 1){
        json = json[0];
        var temp;current_Page = temp;
        select_pages = JSON.parse(json.selectPage);
        if(json.data){
            json.data = JSON.parse(json.data);
            //加载答案
            Player.paperAnswers = {};
            Player.paperAnswers[json.data.subjectId] = JSON.parse(json.data.answerContent);
            Player.buildAnswer();
        }
        initStudentAnswer();
    }
}

function initStudentAnswer(){

    $("#forbid_control").hide();

    $(".showbox").stop(true).animate({'margin-top':'250px','opacity':'0'},400);
    $(".overlay").css({'display':'none','opacity':'0'});

    reloadStudentSelectPage(current_Page);

}

function initStudentExplain(){
    $(".showbox").stop(true).animate({'margin-top':'250px','opacity':'0'},400);
    $(".overlay").css({'display':'none','opacity':'0'});
    $("#forbid_control").show();
    $("#forbid_control").css({"height": $(document).height() });

    reloadStudentSelectPage(current_Page);

}

function reloadStudentSelectPage(page){
    var ul = $("#papers");
    ul.children().remove();
    for(var i = 0; i < select_pages.length;i++){
        var j = parseInt(select_pages[i]);
        ul.append('<li><span id="page_span'+(j)+'" pageIndex="'+j+'"><input type="checkbox" name="checkbox" id="page_checkbox'+i+'" class="cbox" style="visibility: hidden"/> 第'+(j+1)+'题</span></li>');
    }

    if(typeof(page) != "undefined"){
        goToPage(parseInt(page),true);
    }
    else{
        goToPage(parseInt(select_pages[0]),true);
    }

}