
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
            classMode = json.mode;
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

    //和designer.testing.js交互
    testing_callback = function(result){
        switch (result.method){
            case TESTING_CALLBACK_METHOD.loadData:{
                if(Testing.paper.structItem.trees.length > 0){
                    var ul = $("#papers");
                    ul.children().remove();
                    for(var i = 1; i <= Player.subjectList.pages.length;i++){
                        if(role == ALLROLL.student){
                            ul.append('<li><span id="page_span'+(i-1)+'" pageIndex="'+(i-1)+'"><input style="visibility:hidden" type="checkbox" name="checkbox" id="page_checkbox'+i+'" class="cbox" /> 第'+i+'题</span></li>');
                        }
                        else if(role == ALLROLL.teacher){
                            ul.append('<li><span id="page_span'+(i-1)+'" pageIndex="'+(i-1)+'"><input type="checkbox" name="checkbox" id="page_checkbox'+i+'" class="cbox" /> 第'+i+'题</span></li>');
                        }
                    }

                    if(role == ALLROLL.teacher){
                        ul.bind("click", function(e){

                            if(e.target.tagName.toLocaleLowerCase() === 'span'){
                                var $target = $(e.target);
                                goToPage($target.attr("pageIndex"),true);
                                if(classMode == ALLMODE.teacher_speak){
                                    var json = getJsonObject();
                                    json.method = ALLTEACHERSENDMETHOD.change_page;
                                    json.page = $target.attr("pageIndex");
                                    ws.send(JSON.stringify(json));
                                }
                            }

                        });
                    }
                }
            }
                break;

            case TESTING_CALLBACK_METHOD.getPageNumber:{
                if(select_pages && select_pages.length > 0){
                    for(var i = 0 ; i < select_pages.length ; i++){
                        if(select_pages[i] == result.currentPage){
                            if(result.orientation == 'next'){
                                if(i == select_pages.length - 1){
                                    return -1;
                                }
                                else{
                                    return select_pages[i+1];
                                }
                            }
                            else if(result.orientation == 'back'){
                                if(i == 0){
                                    return select_pages[i];
                                }
                                else{
                                    return select_pages[i-1];
                                }
                            }
                            return result.currentPage;
                        }
                    }
                }
            }
                break;
        }
    }

});

