
$(function(){

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
                if(!paperConfig.testId || paperConfig.testId.length == 0)
                {
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
                }
                else{
                    $.ajax({
                        url: "answer-get?testId="+paperConfig.testId+"&role="+role,
                        success: function(json){
                            console.log(json);
                            if(role == ALLROLL.student){
                                initStudentReview(json);
                            }
                            else if(role == ALLROLL.teacher){
                                initTeacherReview(json);
                            }
                        },
                        error: function(){

                        }
                    });
                }
                if(Testing.paper.structItem.trees.length > 0){

                    var ul = $("#papers");
                    ul.children().remove();
                    for(var i = 1; i <= Player.subjectList.pages.length;i++){
                        if(role == ALLROLL.student){
                            ul.append('<li><span id="page_span'+(i-1)+'" pageIndex="'+(i-1)+'"><input style="visibility:hidden" type="checkbox" name="checkbox" id="page_checkbox'+i+'" class="cbox" /> 第'+i+'页</span></li>');
                        }
                        else if(role == ALLROLL.teacher){
                            ul.append('<li><span id="page_span'+(i-1)+'" pageIndex="'+(i-1)+'"><input type="checkbox" name="checkbox" id="page_checkbox'+i+'" class="cbox" /> 第'+i+'页</span></li>');
                        }
                    }

                    if(role == ALLROLL.teacher){
                        ul.bind("click", function(e){

                            if(e.target.tagName.toLocaleLowerCase() === 'span'){
                                var $target = $(e.target);
                                goToPage($target.attr("pageIndex"),true);
                                reloadStudentAnswer();
                                notifyStudentChangePage($target.attr("pageIndex"));
                            }

                        });
                    }

                    if(select_pages && select_pages.length > 0){
                        if(classMode == ALLMODE.student_answer){
                            if(role == ALLROLL.student){
                                initStudentAnswer();
                            }
                            else if(role == ALLROLL.teacher){
                                initTeacherAnswer();
                            }
                        }
                        else if(classMode == ALLMODE.teacher_speak){
                            if(role == ALLROLL.student){
                                initStudentExplain();
                            }
                            else if(role == ALLROLL.teacher){
                                initTeacherExplain();
                            }
                        }
                    }
                }

                goToPage(0,false);

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
                                    goToPage(select_pages[i+1],false);
                                    notifyStudentChangePage(select_pages[i+1]);
                                    return select_pages[i+1];
                                }
                            }
                            else if(result.orientation == 'back'){
                                if(i == 0){
                                    goToPage(select_pages[i],false);
                                    notifyStudentChangePage(select_pages[i]);
                                    return select_pages[i];
                                }
                                else{
                                    goToPage(select_pages[i-1],false);
                                    notifyStudentChangePage(select_pages[i-1]);
                                    return select_pages[i-1];
                                }
                            }
                            return result.currentPage;
                        }
                    }
                }
                else{
                    if(result.orientation == 'next'){
                        var page = result.currentPage + 1;
                        if(page < Player.subjectList.pages.length)
                            goToPage(page,false);
                    }
                    else{
                        var page = result.currentPage - 1;
                        if(page >= 0)
                            goToPage(page,false);
                    }
                }
            }
                break;

            case TESTING_CALLBACK_METHOD.sendAnswer:{
                if(role == ALLROLL.student){
                    var json = getJsonObject();
                    json.method = ALLSTUDENTSENDMETHOD.answer;
                    json.data = result.data;
                    json.paperName = Testing.paper.paperName;
                    json.testId = test_Id;
                    ws.send(JSON.stringify(json));
                }
            }
                break;

        }
    }

    function notifyStudentChangePage(page){
        if(role == ALLROLL.teacher && classMode == ALLMODE.teacher_speak){
            var json = getJsonObject();
            json.method = ALLTEACHERSENDMETHOD.change_page;
            json.page = page;
            ws.send(JSON.stringify(json));
        }
    }

});

