
/**
 * 业务处理
 */

var subjectDes;
var templateDes;
var previewDes;
$(function(){
	//初始化
	subjectDes = new Designer({
		target: $(".subject_canvas_container"),
		status: "subject"
	});
	var ddd = '{"horizentalCenter":"NaN","time":"0","className":"org.neworiental.rmp.base::Group","verticalCenter":"NaN","rightDis":"NaN","version":"3.0","isNode":"false","url":"","topDis":"NaN","isExplain":"false","ID":"14719d1f466c02","slidingType":"normal_mode","leftDis":"NaN","bottomDis":"NaN","containers":[{"horizentalCenter":"NaN","className":"org.neworiental.rmp.base::BaseContainer","verticalCenter":"NaN","topDis":"NaN","rightDis":"NaN","ID":"14719d1f466acc","leftDis":"NaN","isNode":"false","bottomDis":"NaN","contents":[{"ID":"14719d1f8cb3e1","className":"drag","horizentalCenter":"NaN","verticalCenter":"NaN","topDis":"20","rightDis":"20","leftDis":"40","bottomDis":"0","isNode":"false","blanks":[{"size":2,"description":""}],"options":["Ecologists now think that the stability of an environment is a result of diversity rather than patchiness.","Patchy environments that vary from place to place do not often have high species diversity.","A patchy environment is thought to increase stability because it is able to support a wide variety of organisms."]}]}]}';
	subjectDes.open(ddd);
	templateDes = new Designer({
		target: $("#template_designer"),
		status: "template"
	});
	
	previewDes = new Designer({
		target: $("#preview_designer"),
		status: "testing"
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
				"horizentalCenter": "NaN",
				"time": "0",
				"className": "org.neworiental.rmp.base::Group",
				"verticalCenter": "NaN",
				"rightDis": "NaN",
				"version": "3.0",
				"isNode": "false",
				"url": "",
				"topDis": "NaN",
				"isExplain": "false",
				"ID": templateDes.utils.newId(),
				"slidingType": "normal_mode",
				"leftDis": "NaN",
				"bottomDis": "NaN",
				containers:[{
						"horizentalCenter": "NaN",
						"className": "org.neworiental.rmp.base::BaseContainer",
						"verticalCenter": "NaN",
						"topDis": "NaN",
						"rightDis": "NaN",
						"ID": templateDes.utils.newId(),
						"leftDis": "NaN",
						"isNode": "false",
						"bottomDis": "NaN",
						contents: []
					}
				]
			});
		}else{
			templateDes.open({
				"horizentalCenter": "NaN",
				"time": "0",
				"className": "org.neworiental.rmp.base::Group",
				"verticalCenter": "NaN",
				"rightDis": "NaN",
				"version": "3.0",
				"isNode": "false",
				"url": "",
				"topDis": "NaN",
				"isExplain": "false",
				"ID": templateDes.utils.newId(),
				"slidingType": "normal_mode",
				"leftDis": "NaN",
				"bottomDis": "NaN",
				containers:[{
						"horizentalCenter": "NaN",
						"className": "org.neworiental.rmp.base::BaseContainer",
						"verticalCenter": "NaN",
						"topDis": "NaN",
						"rightDis": "NaN",
						"ID": templateDes.utils.newId(),
						"leftDis": "NaN",
						"isNode": "false",
						"bottomDis": "NaN",
						contents: []
					},{
						"horizentalCenter": "NaN",
						"className": "org.neworiental.rmp.base::BaseContainer",
						"verticalCenter": "NaN",
						"topDis": "NaN",
						"rightDis": "NaN",
						"ID": templateDes.utils.newId(),
						"leftDis": "NaN",
						"isNode": "false",
						"bottomDis": "NaN",
						contents: []
					}
				]
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
            var r=confirm("确定要删除此模版？");
            if (r==true)
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
//		console.log(JSON.stringify(templateDes.model.define));
//		return;
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
	
//	$("#btn_turning_select").children().bind("click", function(){
//		var item = $(this);
//		var type = item.attr("ty");
//		console.log(type);
//	});
	
	//右侧资源面板的打开关闭
	$("#resource_switch").bind("click", function(){
		$(this).toggleClass("opened")
		if($(this).hasClass("opened")){
			//打开
			$("#resource_panel").css("right", "0px");
			$("#resource_panel").css("box-shadow", "-3px 0px 5px rgba(0,0,0,0.4)");
		}else{
			//关闭
			$("#resource_panel").css("right", "-200px");
			$("#resource_panel").css("box-shadow", "none");
		}
	});
	//控制资源面板手风琴
	$(".resource_header").bind("click", function(){
		$(".resource_current").removeClass("resource_current");
		$(this).parent().addClass("resource_current");
	});
	$(".resource_header:eq(0)").trigger("click");
	
	//文本资源，新建，选择类型
	$("#resource_add_text").bind("click", function(){
		$("#dlg_res_text_type").dlg();
	});
	
	//文本资源类型选择后确定
	$("#btn_save_res_text_type").bind("click", function(){
		var type = $("input[name=res_text_type]:checked").val();
		$(".editor_toolbar").children(".insert_blank").hide();
		if(type == "text"){
			$(".editor_toolbar").children(".insert_rect").hide();
			$(".editor_toolbar").children(".insert_arrow").hide();
		}else{
			$(".editor_toolbar").children(".insert_rect").show();
			$(".editor_toolbar").children(".insert_arrow").show();
		}
		$("#txt_edit_text").qeditor("setValue", "");
		$("#dlg_res_text_type").dlg("close");
		$("#dlg_edit_text").dlg();
		//绑定保存编辑
		$("#btn_save_text").unbind().bind("click", function(){
			var text = $("#txt_edit_text").val();
			var resource = {
				name: type,
				text: text
			};
			addResource(resource);
			$("#dlg_edit_text").dlg("close");
		});
	});
	
	//绑定上传图片资源
	function bindResUpload(){
		$(".res_upload").unbind().bind("change", function(){
			var btn = $(this).parent();
			var name = btn.attr("n");
			var path = $(this).val();
			var form = btn.parent();
			form.submitForm({
				success: function(data){
					var resource = {
						name: name,
						src: data
					};
					addResource(resource);
				}
			});
			//上传后重新初始化选择
			btn.find("input").remove();
			btn.append('<input type="file" name="file"/>');
			bindResUpload();
		});
	}
	bindResUpload();
	
	initResourcePanel();
	
	//绑定删除背景音乐
	$("#bgaudio_player_box").bind("mouseenter", function(){
		var box = $(this);
		if(box.children("audio").attr("src")){
			var btn = $("<span class='tpbtn'>删除</span>").appendTo(box);
			btn.bind("click", function(){
				box.children("audio").attr("src", "");
				$(this).remove();
				subjectDes.model.define.bgAudio = "";
			})
		}
	});
	$("#bgaudio_player_box").bind("mouseleave", function(){
		var box = $(this);
		box.children("span").remove();
	});

    //保存试题
    $("#btn_save_subjects").bind("click", function(){
        $.ajax({
            url: "save-test-question-content",
            type: "post",
            dataType: "json",
            data: {
                id: 3,
                define: JSON.stringify(subjectList) //定义
            },
            success: function(data){
                //保存成功
                alert("保存成功");
            }
        });
    });

    //读取试题
    $.ajax({
        url: "get-test-question-content",
        type: "post",
        dataType: "json",
        data: {id: 3},
        success: function(data){
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
    });
    //初始化预览
    Preview.init();
//    renderSubjectList();
//    editSubject(0);
});

var resources = {"1111":{name: "audio", src: "huozhe.mp3", id: "1111", left: 40, top: 20}, "2222":{name: "image", src: "test.png", id: "2222", left: 40, top: 20}};
/**
 * 添加资源
 * @param {} res
 */
function addResource(res){
	var created = subjectDes.model.create(res.name);
	$.extend(created, res);
	res = created;
	resources[res.id] = res;
	var list = null;
	if(res.name == "text" || res.name == "richtext"){
		list = $("#res_list_text");
		var container = $("<div class='resource_item_container'></div>").appendTo(list);
		var box = $("<div class='resource_item' id='"+res.id+"'></div>").appendTo(container);
		box.html(res.text);
		box.append("<div class='ico res_remove' onclick='removeResource(\""+res.id+"\", this)'></div>");
		if(res.name == "text"){
			container.append("<div class='resource_item_label'>普通文本</div>");
		}else{
			container.append("<div class='resource_item_label'>富文本</div>");
		}
	}else if(res.name == "image"){
		list = $("#res_list_image");
		var container = $("<div class='resource_item_container'></div>").appendTo(list);
		var box = $("<div class='resource_item' id='"+res.id+"'></div>").appendTo(container);
		box.html("<img src='"+res.src+"'/>");
		box.append("<div class='ico res_remove' onclick='removeResource(\""+res.id+"\", this)'></div>");
	}else if(res.name == "audio"){
		list = $("#res_list_audio");
		var container = $("<div class='resource_item_container'></div>").appendTo(list);
		var box = $("<div class='resource_item' id='"+res.id+"'></div>").appendTo(container);
		box.html("<audio src='"+res.src+"' controls='controls'></audio>");
		box.append("<div class='ico res_remove' onclick='removeResource(\""+res.id+"\", this)'></div>");
	}else if(res.name == "video"){
		list = $("#res_list_video");
		var container = $("<div class='resource_item_container'></div>").appendTo(list);
		var box = $("<div class='resource_item' id='"+res.id+"'></div>").appendTo(container);
		box.html("<video src='"+res.src+"' controls='controls'></video>");
		box.append("<div class='ico res_remove' onclick='removeResource(\""+res.id+"\", this)'></div>");
	}
}
/**
 * 删除资源
 * @param {} resId
 * @param {} element
 */
function removeResource(resId, element){
	$(element).parent().parent().remove();
	delete resources[resId];
}

/**
 * 初始化资源面板的拖动
 */
function initResourcePanel(){
	$(".resource_list").off().on("mousedown", ".resource_item", function(e){
		e.preventDefault();
		//创建
		var id = $(this).attr("id");
		var created = null;
		var box = null;
		var mousePos = null;
		var pageIndex = -1;
		var subIndex;
		var toUpdate = null;
		var audioSet = null;
		var imgSet = null;
		$(document).bind("mousemove", function(moveE){
			if(created == null){
				//创建默认题目
				created = subjectDes.utils.copy(resources[id]);
				created.id = subjectDes.utils.newId();
				box = subjectDes.renderSubject(created, true);
				box.css("z-index", 1000);
			}
			mousePos = subjectDes.utils.getRelativePos(moveE.pageX, moveE.pageY, subjectDes.config.target);
			box.css({
				left: mousePos.x,
				top: mousePos.y
			});
			//判断up时落在了哪一页
			pageIndex = -1;
			subIndex = -1;
			toUpdate = null;
			audioSet = null;
			imgSet = null;
			var pageCanvas = null;
			//删除插入线
			$(".insert_line").remove();
			$(".subject_box_updating").removeClass("subject_box_updating");
			$(".audio_droping").removeClass("audio_droping");
			if(moveE.pageX > $(window).width() - 200){
				//鼠标在右边资源面板上悬浮
				return;
			}
			if(created.name == "audio"){
				//判断可以放的音频控件，页面背景音乐、音频与文字的设置等
				$(".audio_dropable").each(function(){
					var audio = $(this);
					if(!audio.is(":visible")){
						//如果控件被隐藏了，不进行计算
						return true;
					}
					var rect = {
						x: audio.offset().left,
						y: audio.offset().top,
						w: audio.width(),
						h: audio.height()
					};
					if(subjectDes.utils.pointInRect(moveE.pageX, moveE.pageY, rect)){
						audio.addClass("audio_droping");
						audioSet = audio;
						return false;
					}
				});
			}else if(created.name == "image"){
				//判断可以放图片的控件，如音频与文字编辑时的点
				$(".image_dropable").each(function(){
					var element = $(this);
					if(!element.is(":visible")){
						//如果控件被隐藏了，不进行计算
						return true;
					}
					var rect = {
						x: element.offset().left,
						y: element.offset().top,
						w: element.outerWidth(),
						h: element.outerHeight()
					};
					if(subjectDes.utils.pointInRect(moveE.pageX, moveE.pageY, rect)){
						element.addClass("audio_droping");
						imgSet = element;
						return false;
					}
				});
			}
			if(audioSet == null && imgSet == null){
				subjectDes.config.target.find(".designer_canvas").each(function(){
					var canvas = $(this);
					if(!canvas.is(":visible")){
						//如果此页被隐藏了，不进行计算
						return true;
					}
					var rect = {
						x: canvas.offset().left,
						y: canvas.offset().top,
						w: canvas.width(),
						h: canvas.height()
					};
					var relY = moveE.pageY - canvas.offset().top; //相对于画布的y坐标
					if(subjectDes.utils.pointInRect(moveE.pageX, moveE.pageY, rect)){
						//鼠标在某一画布上，可以创建
						pageIndex = parseInt(canvas.attr("pindex"));
						pageCanvas = canvas;
						var elements = subjectDes.model.define.containers[pageIndex].contents;
						for(var ei = 0; ei < elements.length; ei++){
							var sub = elements[ei];
							var subBox = subjectDes.config.target.find(".subject_box#" + sub.id);
							var subTop = parseInt(sub.topDis);
							if(ei == 0 && relY <= subTop){
								//第一个元素，并且在元素上方
								subIndex = ei;
								break;
							}
							subTop = subBox.position().top + subTop;
							var subBottom = subTop + subBox.height();
							if(sub.className == created.className && relY > subTop && relY < subBottom){
								//在元素上，可用于更新元素
								toUpdate = sub;
								break;
							}
							if(ei < elements.length - 1){
								var next = elements[ei + 1];
								subBottom += parseInt(next.topDis);
								if(relY > subTop && relY <= subBottom){
									subIndex = ei + 1;
									break;
								}
							}
						}
						//继续判断是插入在哪个位置上
						return false;
					}
				});
				//添加插入线
				if(toUpdate != null){
					var subBox = subjectDes.config.target.find(".subject_box#" + toUpdate.id);
					subBox.addClass("subject_box_updating");
				}else if(pageIndex != -1){
					var line = $("<div class='insert_line'></div>");
					if(subIndex != -1){
						//可以插入，显示插入位置标识
						var subTop = subjectDes.model.define.containers[pageIndex].contents[subIndex].topDis;
						subTop = parseInt(subTop);
						line.height(subTop / 2);
						if(subIndex == 0){
							pageCanvas.prepend(line);
						}else{
							pageCanvas.children(".subject_box:eq("+(subIndex - 1)+")").after(line);
						}
					}else{
						pageCanvas.append(line);
					}
				}
			}
		});
		$(document).bind("mouseup", function(upE){
			$(".insert_line").remove();
			$(".subject_box_updating").removeClass("subject_box_updating");
			subjectDes.config.target.find(".designer_canvas").unbind("mouseenter").unbind("mouseleave");
			$(".audio_droping").removeClass("audio_droping");
			$(document).unbind("mousemove");
			$(document).unbind("mouseup");
			if(box != null){
				box.remove(); //删除创建时的容器
			}
			if(audioSet != null){
				audioSet.attr("src", created.src);
				if(audioSet.hasClass("bgaudio_player")){
					//设置背景音乐
					subjectDes.model.define.bgAudio = created.src;
				}else if(audioSet.hasClass("audiotext_edit_player")){
					//设置音频与文字，清除时间点 
					$("#audiotext_points").empty();
				}
			}else if(imgSet != null){
				if(imgSet.hasClass("point_type_normal")){
					//设置音频与文字的图片
					var data = imgSet.data("props");
					data.image = created.src;
				}
			}else if(toUpdate != null){
				//更新
				if(created.text){
					//文本资源
					toUpdate.text = created.text;
				}else if(created.src){
					//图片、音频、视频资源
					toUpdate.src = created.src;
				}
				subjectDes.model.update(toUpdate);
				subjectDes.renderSubject(toUpdate);
			}else if(pageIndex != -1){
				//插入
				created.resource = true;
				subjectDes.model.add(created, pageIndex, subIndex);
				subjectDes.renderSubject(created, false, subIndex);
			}
		});
	});
}

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
};

//设置视图
function resizeView(){
	var winH = $(window).height();
	$("#subject_designer").height(winH);
	$(".subject_list").height(winH);
	$("#resource_panel").height(winH);
	$("#resource_switch").css("top", winH / 2 - 25);
	$(".resource_list").height($(window).height() - 320 - 36);
	$("#left_subjects").height(winH - 41);
	$(".subject_canvas_container").height(winH);
	$("#subject_canvas").css("min-height", winH - 80);
	$("#subject_designer").find(".subject_page").height(winH - 80);
	$("#subject_designer").find(".designer_canvas").css("min-height", winH - 51);
	subjectDes.config.pageHeight = winH - 50;
	
	$("#template_designer").height(winH);
	$("#template_designer").find(".subject_page").height(winH - 95);
	$("#template_designer").find(".designer_canvas").css("min-height", winH - 156);
	templateDes.config.pageHeight = winH - 55;
	
	$("#preview_designer").height(winH);
	$("#preview_designer").find(".subject_page").height(winH - 120);
	$("#preview_designer").find(".designer_canvas").css("min-height", winH - 141);
	previewDes.config.pageHeight = winH - 120;
}

/**
 * 预览相关
 * @type {}
 */
var Preview = {
	/**
	 * 当前第几页
	 * @type {Number}
	 */
	curentInex: 0,
	/**
	 * 初始化
	 */
	init: function(){
		//打开预览
		$(".preview_btn").bind("click", function(){
			Preview.show();
		});
		
		//上一页
		$("#btn_preview_back").bind("click", function(){
			Preview.back();
		});
		
		//下一页
		$("#btn_preview_next").bind("click", function(){
			Preview.next();
		});
		
		//退出
		$("#btn_preview_exit").bind("click", function(){
			Preview.exit();
		});
	},
	/**
	 * 停止所有的媒体播放
	 */
	pauseMedia: function(){
		var audios = $("audio");
		for (var i = 0; i < audios.length; i++) {
			var au = audios[i];
			au.pause();
		}
		var videos = $("video");
		for (var i = 0; i < videos.length; i++) {
			var vd = videos[i];
			vd.pause();
		}
	},
	/**
	 * 打开预览
	 */
	show: function(){
		if(subjectList.length == 0){
			return;
		}
		this.pauseMedia();
		$("#subject_designer").hide();
		$("#preview_designer").show();
		previewDes.open(subjectList[0]);
		resizeView();
		this.curentInex = 0;
	},
	/**
	 * 下一页
	 */
	next: function(){
		if(this.curentInex == subjectList.length - 1){
			alert("已经是最后一页")
			return;
		}
		this.pauseMedia();
		this.curentInex++;
		previewDes.open(subjectList[this.curentInex]);
		resizeView();
	},
	/**
	 * 上一页
	 */
	back: function(){
		if(this.curentInex == 0){
			alert("已经是第一页")
			return;
		}
		this.pauseMedia();
		this.curentInex--;
		$("#preview_designer").find("audio").attr("src", ""); //让所有音频停止
		previewDes.open(subjectList[this.curentInex]);
		resizeView();
	},
	/**
	 * 退出
	 */
	exit: function(){
		this.pauseMedia();
		$("#preview_designer").hide();
		$("#subject_designer").show();
		$("#preview_designer").find("audio").attr("src", ""); //让所有音频停止
		resizeView();
	}
};


