
define(['./common','jquery_qeditor','./designer.core'
//define(['./common', './designer.core'
],
function($, $qEdit, Designer) {


    /**
     * 业务处理
     */

    var subjectDes;
    var templateDes;
    $(function(){
        //初始化
        subjectDes = new Designer({
            target: $(".subject_canvas_container"),
            status: "subject"
        });
//        var ddd = '{"pages":[{"elements":[{"id":"14622d6e80325","name":"text","left":40,"top":20,"text":"在此输入普通文本","pageIndex":0},{"id":"14622d6ea42895","name":"richtext","left":40,"top":20,"text":"在此输入富文本","pageIndex":0},{"id":"14622d6ed08edf","name":"image","left":40,"top":20,"src":"static/images/img.png","pageIndex":0},{"id":"14622d6f110a33","name":"audio","left":40,"top":20,"pageIndex":0},{"id":"14622d6f7c0f64","name":"video","left":40,"top":20,"width":400,"height":400,"pageIndex":0}]}]} ';
//        subjectDes.open(ddd);
        templateDes = new Designer({
            target: $("#template_designer"),
            status: "template"
        });

        $("#txt_edit_text").qeditor();

	$(window).bind("resize", function(){
		resizeView();
	});
	
	resizeView();

        //绘制左侧题目列表
        function renderSubjectList(){
		    $("#left_subjects").empty();
		    for(var i = 0; i < subjectList.length; i++){
                var sub = subjectList[i];
                var item = $('<div ind="'+i+'" class="subject_list_box"><div class="ico sub_remove"></div><div class="subject_list_container"><div class="item_thumb"></div></div></div>').appendTo("#left_subjects");
                var target = item.find(".item_thumb");
                target.css({
                    width: "1000px",
                    height: "800px",
                    "-webkit-transform": "translate(10px, 10px) scale(0.1, 0.1)",
                    "transform": "translate(-450px, -360px) scale(0.1, 0.1)"
			    });
                var des = new Designer({
                    target: target,
                    status: "readonly"
                });
                des.open(sub);
		    }
            //绑定编辑题目
            $("#left_subjects").children().unbind().bind("click", function(){
                var cur = $(this);
                var index = parseInt(cur.attr("ind"));
                editSubject(index);
            });
            //绑定删除题目
            $("#left_subjects").find(".sub_remove").unbind().bind("click", function(){
                var target = $(this).parent();
                var index = parseInt(target.attr("ind"));
                var nextIndex = 0;
                if(subjectList.length == 1){
                    alert("至少要保留一页！");
                    return;
                }
                if(confirm("确定要删除此页吗？ ")){
                    if(index == subjectList.length - 1){
                        //最后一个，删除后编辑倒数第二个
                        nextIndex = subjectList.length - 2;
                    }else{
                        nextIndex = index;
                    }
                    subjectList.splice(index, 1); //从模型中删除
                    renderSubjectList();
                    editSubject(nextIndex);
                }
            });
        }

        //编辑题目
        function editSubject(index){
            $("#left_subjects").children().removeClass("selected");
            var cur = $("#left_subjects").children(":eq("+index+")");
            cur.addClass("selected");
            var sub = subjectList[index];
            subjectDes.open(sub);
            resizeView();
        }

        //打开模板选择
        function showTemplateSelect(){
            //初始化系统模板
            if(systemTemplates == null){
                //如果没加载过，去后台加载
                $.ajax({
                    url: "design-stander-list",
                    type: "get",
                    dataType: "json",
                    data: {
                        userId: ""
                    },
                    success: function(data){
                        systemTemplates = data;
                        refreshSystemTemplates();
                    }
                });
            }else{
                refreshSystemTemplates();
            }
            //初始化用户模板
            if(userTemplates == null){
                //如果没加载过，去后台加载
                $.ajax({
                    url: "design-list",
                    type: "get",
                    dataType: "json",
                    data: {
                        userId: ""
                    },
                    success: function(data){
		    	//需要返回格式，多个模版的数组：[{id: "xxxx", "title": "xxxxx", "define": "xxxxxx"}]
                        for(var i = 0; i < data.length; i++){
                            var tem = data[i];
                            if(typeof tem.define == "string"){
                                tem.define = JSON.parse(tem.define);
                            }
                        }
		    	userTemplates = data;
                        refreshUserTemplates();
                    }
                });
            }else{
                refreshUserTemplates();
            }
		    //根据屏幕高度自适应
		    $("#dlg_template").find(".dialog_content").css("height", $(window).height() - 240);
            $("#dlg_template").dlg();
        }

        //刷新系统模板
        function refreshSystemTemplates(){
            refreshTemplates($(".system_templates"), systemTemplates);
        }

            //刷新用户模板
            function refreshUserTemplates(){
            refreshTemplates($(".user_templates"), userTemplates);
        }

        //刷新模板
        function refreshTemplates(container, templates){
            container.empty();
            for(var i = 0; i < templates.length; i++){
                var tem = templates[i];
                var item = $('<div class="item" id="'+tem.id+'"><div class="item_box"><div class="item_thumb"></div></div><span>'+tem.title+'</span></div>').appendTo(container);
                    var target = item.find(".item_thumb");
                    target.css({
                        width: "1000px",
                        height: "800px",
                        "transform": "translate(-450px, -360px) scale(0.1, 0.1)"
                    });
                    var des = new Designer({
                        target: target,
                        status: "readonly"
                    });
                    des.open(tem.define);
                }
            }

            //关闭模板选择
            function hideTemplateSelect(){
                $("#dlg_template").dlg("close");
            }

            //添加一页，打开选择模板窗口
            $("#add_subject").bind("click", function(){
                showTemplateSelect();
            });

            //控制模板条目的选择
            $(".template_items").on("click", ".item", function(){
                $(".template_items").find(".selected").removeClass("selected");
                var item = $(this);
                item.addClass("selected");
            });

        //选择模板后，进行题目的编辑
        $("#btn_tem_select").bind("click", function(){
            var selected = $(".template_items").find(".selected");
            if(selected.length == 0){
                return;
            }
            //获取模板的定义
            var tem;
            var id = selected.attr("id");
            if(selected.parent().hasClass("user_templates")){
                //选择的是用户模板
                tem = getUseTemplate(id);
            }else{
                //选择的是内置模板
                tem = getSystemTemplate(id);
            }
                //copy一下，否则会直接修改模板的定义，要在保存时才进行设置
                var copy = subjectDes.utils.copy(tem.define);
            var templateDef = copy;
            hideTemplateSelect();
            subjectList.push(templateDef); //添加到题目列表
            renderSubjectList();
            editSubject(subjectList.length - 1); //开始编辑
            $("#left_subjects").scrollTop(99999);
        });
	
        var editTemplateId = null;

        //维护个人模板，添加模板
        $(".edit_template_btns").children("span:eq(0)").bind("click", function(e){
            editTemplateId = null;
            hideTemplateSelect();
            var type = $("input[name=add_tem_type]:checked").val();
            $("#subject_designer").hide();
            if(type == "single"){
			templateDes.open({
				explain: false,
				time: "",
				turning: "normal",
				type: type,
				bgAudio: "",
				pages:[{
					elements: []
				}]
			});
		}else{
			templateDes.open({
				explain: false,
				time: "",
				turning: "normal",
				type: type,
				bgAudio: "",
				pages:[{
					elements: []
				},{
					elements: []
				}]
			});
		}
            $("#template_designer").show();
            $("#template_edit_title").val("");
            resizeView();
        });

        //获取用户模板
        function getUseTemplate(id){
            for (var index = 0; index < userTemplates.length; index++) {
                var tem = userTemplates[index];
                if(tem.id == id){
                    return tem;
                }
            }
        }

        //获取内置模板
        function getSystemTemplate(id){
            for (var index = 0; index < systemTemplates.length; index++) {
                var tem = systemTemplates[index];
                if(tem.id == id){
                    return tem;
                }
            }
        }

        //维护个人模板，修改模板
        $(".edit_template_btns").children("span:eq(1)").bind("click", function(e){
            var selected = $(".user_templates").find(".selected");
            if(selected.length == 0){
                alert('请选择一个模版进行编辑~');
                return;
            }
            editTemplateId = selected.attr("id");
            var tem = getUseTemplate(editTemplateId);
            $("#subject_designer").hide();
            //copy一下，否则会直接修改模板的定义，要在保存时才进行设置
            var copy = templateDes.utils.copy(tem.define);
            templateDes.open(copy);
            $("#template_designer").show();
            $("#template_edit_title").val(tem.title);
            resizeView();
            hideTemplateSelect();
        });

        //维护个人模板，删除模板
        $(".edit_template_btns").children("span:eq(2)").bind("click", function(e){
            var selected = $(".user_templates").find(".selected");
            if(selected.length == 0){
                alert('请选择一个自定义模版进行删除~');
                return;
            }
            function bcanDel() {
                var r = confirm("确定要删除此模版？");
                if (r == true)
                {
                    var id = selected.attr("id");
                    $.ajax({
                        url: "design-delete",
                        type: "post",
                        dataType: "json",
                        data: {
                            id: id //模板的ID
                        },
                        success: function(data){
                            //不需要返回值
                            for (var index = 0; index < userTemplates.length; index++) {
                                var tem = userTemplates[index];
                                if(tem.id == id){
                                    userTemplates.splice(index, 1);
                                    break;
                                }
                            }
                            refreshUserTemplates(); //重新加载
                        }
                    });
                }
                else
                {
                }
            }
            bcanDel();
        });

        //保存模板编辑
        $("#btn_save_template").bind("click", function(){
            var title = $("#template_edit_title").val();
            if(title == ""){
                $("#template_edit_title").focus();
                return;
            }
            $.ajax({
                url: "design-addorupdate",
                type: "post",
                dataType: "json",
                data: {
                    id: editTemplateId, //模板的ID，为空的话为新增
                    title: title, //标题
                    define: JSON.stringify(templateDes.model.define) //定义
                },
                success: function(data){
				//需要返回格式：{id: "xxxxx"}
                    var template = {
                        id: data.id,
                        title: title,
                        define: templateDes.model.define
                    }
                    //更新前台内存中的模板
                    var tem = null;
                    for (var index = 0; index < userTemplates.length; index++) {
                        var t = userTemplates[index];
                        if(t.id == data.id){
                            tem = t;
                            break;
                        }
                    }
                    if(tem == null){
                        //新增
                        userTemplates.push(template);
                    }else{
                        tem.title = template.title;
                        tem.define = template.define;
                    }
                    $("#btn_cancel_template").trigger("click");
                }
            });
        });

        //取消模板编辑
        $("#btn_cancel_template").bind("click", function(){
            $("#template_designer").hide();
            $("#subject_designer").show();
            showTemplateSelect();
            resizeView();
        });
        //编辑模板时，显示附加页
        $("#chk_tem_additional").bind("click", function(){
            if($(this).is(":checked")){
                //显示附加页
                templateDes.toggleAdditional(true);
            }else{
                templateDes.toggleAdditional(false);
            }
        });

        //编辑题目时，显示附加页
        $("#chk_sub_additional").bind("click", function(){
            if($(this).is(":checked")){
                //显示附加页
                subjectDes.toggleAdditional(true);
            }else{
                subjectDes.toggleAdditional(false);
            }
        });

        //设置是否是说明页
        $("#chk_des_page").bind("click", function(){
            var value = $(this).is(":checked");
            subjectDes.model.define.explain = value;
        });

        //编辑倒计时
        $("#input_page_time").bind("blur", function(){
            var val = $(this).val();
            var time = "";
            if(val.trim() != ""){
                time = parseInt(val);
            }
            if(!time){
                time = "";
            }
            subjectDes.model.define.time = time;
        });

        //翻页形式选择的菜单
        $("#btn_turning_select").bind("click", function(){
            var target = $(this);
            $("#menu_turning").dropmenu({
                target: target,
                onSelect: function(item){
                    var type = item.attr("ty");
                    subjectDes.model.define.turning = type;
                    $("#btn_turning_select").text(item.text());
                }
            });
        });

        window.DesignerModel = {};
        //保存试题
        window.DesignerModel.getTestQuestionContent = function(){
            return {define: JSON.stringify(subjectList)};
        }
//        $("#btn_save_subjects").bind("click", function(){
//            $.ajax({
//                url: "save-test-question-content",
//                type: "post",
//                dataType: "json",
//                data: {
//                    id: 3,
//                    define: JSON.stringify(subjectList) //定义
//                },
//                success: function(data){
//                    //保存成功
//                    alert("保存成功");
//                }
//            });
//        });

        window.DesignerModel.setTestQuestionContent = function(data){
            testQuestionID = data.id;
            if(data.define){
                if(typeof data.define == "string"){
                    subjectList = JSON.parse(data.define);
                }
                else{
                    subjectList = data.define;
                }
            }
            else{
                subjectList = [];
            }
            renderSubjectList();
            if(subjectList.length > 0){
                editSubject(0); //开始编辑第一页
            }
        }

        try{
            if(testQuestionContentID && testQuestionContentID != -1){
                //读取试题
                $.ajax({
                    url: "get-test-question-content",
                    type: "post",
                    dataType: "json",
                    data: {id: testQuestionContentID},
                    success: function(data){
                        DesignerModel.setTestQuestionContent(data);
                    }
                });
            }
        }catch(e) {

        }

    });
});

/**
 * 输入框允许输入数字，用于onkeydown
 * @param {Object} eventTag
 */
function onlyNum(eventTag){
	var event = eventTag||window.event;
	if(!(event.keyCode>=8 && event.keyCode <= 20) || (event.keyCode>=33 && event.keyCode <= 46))
	if(!((event.keyCode>=48&&event.keyCode<=57)||(event.keyCode>=96&&event.keyCode<=105))) {
		if(window.event){
			event.returnValue=false;
		}else{
			event.preventDefault();
		}
	}
	return event.keyCode;
}


//设置视图
function resizeView(){
	var winH = $(window).height();
	$("#subject_designer").height(winH);
	$(".subject_list").height(winH);
	$("#resource_panel").height(winH);
	$("#resource_switch").css("top", winH / 2 - 55);
	$(".resource_list").height($(window).height() - 120 - 36);
	$("#left_subjects").height(winH - 41);
	$(".subject_canvas_container").height(winH);
	$("#subject_canvas").css("min-height", winH - 80);
	$("#subject_designer").find(".subject_page").height(winH - 80);
	$("#subject_designer").find(".designer_canvas").css("min-height", winH - 101);
	
	$("#template_designer").height(winH);
	$("#template_designer").find(".subject_page").height(winH - 95);
	$("#template_designer").find(".designer_canvas").css("min-height", winH - 116);
	
	$("#preview_designer").height(winH);
	$("#preview_designer").find(".subject_page").height(winH - 120);
	$("#preview_designer").find(".designer_canvas").css("min-height", winH - 141);
}