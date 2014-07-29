
var $beginAnswer;

var $beginExplain;

var $whiteBoard;
var $endExplain;

function initTeacher(){

    $("#checkbox_allpages").bind("click", function(){
        var $target = $(this);
        if($target.is(':checked')){
            $("#papers").find('input').prop("checked",true);
        }
        else{
            $("#papers").find('input').attr("checked",false);
        }
    });

    //将就着来
    $("#beginTempRight").bind("click", function(){
        if(Testing.paper.structItem.trees.length > 0){
            var ul = $("#papers");
            ul.children().remove();
            for(var i = 1; i <= Player.subjectList.pages.length;i++){
                ul.append('<li><span id="page_span'+i+'" pageIndex="'+(i-1)+'"><input type="checkbox" name="checkbox" id="page_checkbox'+i+'" class="cbox" /> 第'+i+'题</span></li>');
            }
            ul.bind("click", function(e){

                if(e.target.tagName.toLocaleLowerCase() === 'span'){
                    var $target = $(e.target);
                    Player.pageIndex = parseInt($target.attr("pageIndex"));
                    Player.play();
                }

            });
        }
    });





    var onResize = window.onresize;
    window.onresize = function () {
        var winH = $(window).height();
        $("#resource_panel").height(winH);
        $("#resource_switch").css("top", winH / 2 - 55);
        $(".resource_list").height(winH - 120 - 36);
        $("#papers").height(winH - 120);
        if(onresize){
            onResize();
        }
    };
    window.onresize();

    //右侧资源面板的打开关闭
    $(".left_panel .btn_sh").bind("click",function(){
        var $clist = $(this).prev();
        if($clist.is(":visible")){
            $clist.hide();
            $(".left_panel .btn_sh").css("background",'url(/web/classroom/images/btn_sh_l.png) no-repeat');
        }else{
            $clist.show();
            $(".left_panel .btn_sh").css("background",'url(/web/classroom/images/btn_sh_r.png) no-repeat');
        }
    })

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
                ws.send(JSON.stringify(json));
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
        console.log("x="+x+",y="+y);
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
                case ALLMODE.teacher_offline:
                    initTeacherWait();
                    break;
                case ALLMODE.wait_teacher_distribute:
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
            var ul = $("#online_students");
            ul.children().remove();
            var count = 0;
            var online = 0;
            for(var key in json.students){
                count++;
                var student = json.students[key];
                if(student.status == 0){
                    ul.append('<li><img src="/web/classroom/images/ic_dele.png" width="13" height="13"/>'+student.name+'</li>');
                }
                else{
                    online++;
                    ul.append('<li><img src="/web/classroom/images/ic_online.png" width="13"  height="13"/>'+student.name+'</li>');
                }
            }
            $("#online_students_num").text('在线人数：'+online+'/'+count);
            break;
        }
        default :{
            break;
        }
    }
}

function initTeacherWait(){
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

}

function initTeacherAnswer(){
    $('#layout1').hide();
    $('#layout2').show();
    $('#layout3').hide();
    $canvas.hide();
    $whiteBoard.text('显示白板');
}

function initTeacherExplain(){
    $('#layout1').hide();
    $('#layout2').hide();
    $('#layout3').show();
    $canvas.hide();
    $whiteBoard.text('显示白板');
}