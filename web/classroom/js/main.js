
$(function(){
    ws = new WebSocket("ws://127.0.0.1:3010");
    ws.onopen = function () {
        console.log('socket open');
        {
            var json = getJsonObject();
            json.method = ALLMETHOD.init;
            ws.send(JSON.stringify(json));
        }
    };
    ws.onclose = function (e) {
        console.log('socket close');
    }
    ws.onmessage = function (e) {
        console.log(e.data);
        var json = JSON.parse(e.data);
        if(json.method == ALLMETHOD.init){
            mode = json.mode;
        }
        if(role == ALLROLL.student){
            dealStudentMessage(json);
        }
        else if(role == ALLROLL.teacher){
            dealTeacherMessage(json);
        }
    }

    initElement();

    if(role == ALLROLL.student){
        initStudent();
    }
    else if(role == ALLROLL.teacher){
        initTeacher();
    }

});

