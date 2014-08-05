
var studentAnswers = {};
var ANSWERS = [
    '(A)', '(B)','(C)', '(D)', '(E)', '(F)', '(G)', '(H)', '(I)', '(J)', '(K)'
];

var $beginAnswer;

var $beginExplain;

var $whiteBoard;
var $endExplain;

var currentColor = '#f00';
var COLORS = [
    '#f00', '#00f',
    '#0f0', '#ff0'
];

var currentThick = 0.007;
var THICKNESSES = [
    0.007, 0.009, 0.012, 0.015, 0.02
];

function initTeacher(){

    //左侧学生列表
    $(".btn_sh").bind("click",function(){
        var $clist = $(this).prev();
        if($clist.is(":visible")){
            $clist.hide();
        }else{
            $clist.show();
        }
    });

    $("#checkbox_allpages").bind("click", function(){
        var $target = $(this);
        if($target.is(':checked')){
            $("#papers").find('input').prop("checked",true);
        }
        else{
            $("#papers").find('input').attr("checked",false);
        }
    });

    //白板相关
    $("#size_button").bind("click",function(e){
        var $view = $("#size_pane");
        if($view.is(":visible")){
            $view.hide();
        }else{
            $view.show();
        }
        var $font;
        if(e.target.tagName.toLocaleLowerCase() === 'span'){
            $font = $(e.target).children('font');
        }
        else if(e.target.tagName.toLocaleLowerCase() === 'font'){
            $font = $(e.target);
        }
        if($font){
            switch ($font.attr("class").toLocaleLowerCase()){
                case 'border_1px':
                    currentThick = THICKNESSES[0];
                    break;
                case 'border_3px':
                    currentThick = THICKNESSES[1];
                    break;
                case 'border_5px':
                    currentThick = THICKNESSES[2];
                    break;
                case 'border_10px':
                    currentThick = THICKNESSES[3];
                    break;
            }
        }
    });

    $("#color_button").bind("click",function(e){
        var $view = $("#color_pane");
        if($view.is(":visible")){
            $view.hide();
        }else{
            $view.show();
        }
        var $font;
        if(e.target.tagName.toLocaleLowerCase() === 'span'){
            $font = $(e.target).children('font');
        }
        else if(e.target.tagName.toLocaleLowerCase() === 'font'){
            $font = $(e.target);
        }
        if($font){
            switch ($font.attr("class").toLocaleLowerCase()){
                case 'bg_red':
                    currentColor = COLORS[0];
                    break;
                case 'bg_blue':
                    currentColor = COLORS[1];
                    break;
                case 'bg_green':
                    currentColor = COLORS[2];
                    break;
                case 'bg_yellow':
                    currentColor = COLORS[3];
                    break;
            }
        }
    });

    $("#clear_button").bind("click",function(e){
        clearWhiteBoard();
    });

    $beginAnswer = $("#beginAnswer");
    $beginExplain = $("#beginExplain");
    $whiteBoard = $("#whiteBoard");
    $endExplain = $("#endExplain");

    $beginAnswer.bind("click", function(){

        var ul = $("#papers");

        if(ul.find(":checked").length > 0){
            var select = new Array();
            ul.find('input').each(function(){
                var $target = $(this);
                if($target.is(':checked')){
                    select.push(parseInt($target.parent().attr("pageIndex")));
                }
                else{
                    $target.parent().parent().hide();
                }
                $target.css({visibility:"hidden"});
            });
            if(select.length == 0){
                alert('请至少选择一道题');
            }
            else{
                //alert(JSON.stringify(select));
                var json = getJsonObject();
                json.method = ALLTEACHERSENDMETHOD.answer;
                json.selectPages = select;
                test_Id = new UUID().id;
                json.testId = test_Id;
                ws.send(JSON.stringify(json));

                select_pages = select;
                studentAnswers = {};
                goToPage(select[0],true);
                reloadStudentAnswer();
                initTeacherAnswer();
            }
        }
        else{
            alert('请至少选择一道题');
        }
    });

    $beginExplain.bind("click", function(){
        var json = getJsonObject();
        json.method = ALLTEACHERSENDMETHOD.explain;
        ws.send(JSON.stringify(json));
        initTeacherExplain();
    });

    $endExplain.bind("click", function(){
        var json = getJsonObject();
        json.method = ALLTEACHERSENDMETHOD.wait;
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
        console.log("x="+x+",y="+y);
        x -= offsetX; x /= width;
        y -= offsetY; y /= height;
        return {x: x, y: y};
    }

    function startDrawing(e) {
        e.preventDefault();

        $("#size_pane").hide();
        $("#color_pane").hide();

        var p = getPoint(e);
        if (typeof e.button === 'number' && e.button !== 0)
            return;
        canvas.drawing = {
            type: 'path',
            color: currentColor,
            width: currentThick,
            points: [p]
        };
        var json = getJsonObject();
        json.method = ALLTEACHERSENDMETHOD.path_down;
        json.x = p.x;
        json.y = p.y;
        json.color = currentColor;
        json.thickness = currentThick;
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
                case ALLMODE.teacher_offline:
                    initTeacherWait();
                    break;
                case ALLMODE.wait_teacher_distribute:
                    initTeacherWait();
                    break;
                case ALLMODE.student_answer:
                    test_Id = json.testId;
                    select_pages = json.selectPages;
                    initTeacherAnswer();
                    break;
                case ALLMODE.teacher_speak:
                    select_pages = json.selectPages;
                    current_Page = json.currentPage;
                    initTeacherExplain();
                    break;
            }
            break;
        }
        case ALLTEACHERRECEIVEMETHOD.online:{
            var ul = $("#online_students");
            ul.children().remove();
            var count = 0;
            var online = 0;
            for(var key in json.students){
                count++;
                var student = json.students[key];
                if(student.status == 0){
                    ul.append('<li id="studentCode'+student.code+'"><img src="/web/classroom/images/ic_dele.png" width="13" height="13"/>'+student.name+'<span style="visibility: hidden" class="wrong">(B)</span></li>');
                }
                else{
                    online++;
                    ul.append('<li id="studentCode'+student.code+'"><img src="/web/classroom/images/ic_online.png" width="13"  height="13"/>'+student.name+'<span style="visibility: hidden" class="correct">(C)</span></li>');
                }
            }
            $("#online_students_num").text('在线人数：'+online+'/'+count);
            break;
        }
        case ALLTEACHERRECEIVEMETHOD.answer:{
            studentAnswers[json.studentCode] = json.data;
            reloadStudentAnswer();
            break;
        }
        default :{
            break;
        }
    }
}

function initTeacherWait(){

    delete select_pages;

    classMode = ALLMODE.wait_teacher_distribute;

    $('#layout1').show();
    $('#layout2').hide();
    $('#layout3').hide();
    $canvas.hide();
    $whiteBoard.text('显示白板');

    var ul = $("#papers");
    ul.find('input').each(function(){
        var $target = $(this);
        $target.parent().parent().show();
        $target.css({visibility:"visible"});
    });

    var json = getJsonObject();
    json.method = ALLTEACHERSENDMETHOD.white;
    json.bShow = false;
    ws.send(JSON.stringify(json));

}

function initTeacherAnswer(){

    classMode = ALLMODE.student_answer;

    $('#layout1').hide();
    $('#layout2').show();
    $('#layout3').hide();
    $canvas.hide();
    $whiteBoard.text('显示白板');

    reloadTeacherSelectPage();

}

function initTeacherExplain(){

    classMode = ALLMODE.teacher_speak;

    $('#layout1').hide();
    $('#layout2').hide();
    $('#layout3').show();
    $canvas.hide();
    $whiteBoard.text('显示白板');

    reloadTeacherSelectPage(current_Page);

    var json = getJsonObject();
    json.method = ALLTEACHERSENDMETHOD.change_page;
    json.page = Player.pageIndex;
    ws.send(JSON.stringify(json));

}

function clearWhiteBoard(){

    ctxGraphics.clearRect(0, 0, width, height);
    ctxDrawing.clearRect(0, 0, width, height);

    var json = getJsonObject();
    json.method = ALLTEACHERSENDMETHOD.path_clear;
    ws.send(JSON.stringify(json));
}

function reloadTeacherSelectPage(page){

    var ul = $("#papers");

    var selectPagesMap = {};
    for(var i = 0 ; i < select_pages.length ; i++){
        if(i == 0){
            if(typeof(page) != "undefined"){
                goToPage(parseInt(page),true);
            }
            else{
                goToPage(parseInt(select_pages[i]),true);
            }
        }
        selectPagesMap[parseInt(select_pages[i])] = parseInt(select_pages[i]);
    }

    ul.find('input').each(function () {
        var $target = $(this);
        var pageIndex = parseInt($target.parent().attr("pageIndex"));
        if(typeof(selectPagesMap[pageIndex]) != "undefined"){
            $target.prop("checked",true);
            $target.parent().parent().show();
        }
        else{
            $target.attr("checked",false);
            $target.parent().parent().hide();
        }
        $target.css({visibility: "hidden"});
    });

    reloadStudentAnswer();
}

function reloadStudentAnswer(){
    var ul = $("#online_students");
    ul.find("span").css({visibility:"hidden"});
    for(var key in studentAnswers){
        if(studentAnswers[key]){
            var answerData = studentAnswers[key].subjectData.data.data[Player.pageIndex].data[0];
            var li = ul.children("#studentCode"+key);
            if(li){
                if(answerData){
                    if(answerData.userAnswer.length > 1){
                        if(answerData.userAnswer[0] == 'org.neworiental.rmp.base::OptionGroup'){
                            var span = li.children('span');
                            var userAnswer = parseInt(answerData.userAnswer[1]);
                            var rightAnswer = parseInt(answerData.rightAnswer[0]);
                            span.css({visibility:"visible"});
                            span.attr("class",userAnswer == rightAnswer ? 'correct' : 'wrong');
                            span.text(ANSWERS[userAnswer]);
                        }
                    }
                }
            }
        }
    }
}