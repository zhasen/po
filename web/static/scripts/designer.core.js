
/**
 * 设计器对象
 * @returns
 */
function Designer(){
	var Des = this;
	/**
	 * 定义设计器的属性
	 */
	/**
	 * 设计器配置
	 */
	this.config = {
		target: null, //目标元素，设计器会在此元素上进行构建
		status: "template", //状态，编辑模板、编辑题目、只读 template|subject|readonly
		pageHeight: 500,
		imgPath: "",
		audioPath: "",
		audioImgPath: "",
		statusType: "normal" //状态类型，对status参数的二级修饰，在某一种状态下，用来进一步进行区分，比如测试状态下，会有review状态
	};
	this.canvas = null;
	/**
	 * 初始化，在构建时进行调用
	 */
	this.initialize = function(options){
		$.extend(true, this.config, options);
		$(document).bind("selectstart", function(){
			return false;
		});
		if(this.config.status == "template"){
			//初始化模板编辑
			$(".template_toolbar").children(".bar").unbind().bind("mousedown", function(e){
				//创建
				var name = $(this).attr("n");
				var created = null;
				var box = null;
				var mousePos = null;
				var pageIndex = -1;
				var subIndex;
				$(document).bind("mousemove", function(moveE){
					if(created == null){
						//创建默认题目
						created = Des.model.create(name);
						box = Des.renderSubject(created, true);
					}
					mousePos = Des.utils.getRelativePos(moveE.pageX, moveE.pageY, Des.config.target);
					box.css({
						left: mousePos.x,
						top: mousePos.y
					});
					//判断up时落在了哪一页
					pageIndex = -1;
					subIndex = -1;
					var pageCanvas = null;
					Des.config.target.find(".designer_canvas").each(function(){
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
						if(Des.utils.pointInRect(moveE.pageX, moveE.pageY, rect)){
							//鼠标在某一画布上，可以创建
							pageIndex = parseInt(canvas.attr("pindex"));
							pageCanvas = canvas;
							var elements = Des.model.define.containers[pageIndex].contents;
							for(var ei = 0; ei < elements.length; ei++){
								var sub = elements[ei];
								var subBox = Des.config.target.find(".subject_box#" + sub.ID);
								var subTop = parseInt(sub.topDis);
								if(ei == 0 && relY <= subTop){
									//第一个元素，并且在元素上方
									subIndex = ei;
									break;
								}
								if(ei < elements.length - 1){
									subTop = subBox.position().top + subTop;
									var next = elements[ei + 1];
									var subBottom = subTop + subBox.height() + parseInt(next.topDis);
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
					//删除插入线
					$(".insert_line").remove();
					//添加插入线
					if(pageIndex != -1){
						var line = $("<div class='insert_line'></div>");
						if(subIndex != -1){
							//可以插入，显示插入位置标识
							var subTop = Des.model.define.containers[pageIndex].contents[subIndex].topDis;
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
				});
				$(document).bind("mouseup", function(upE){
					$(".insert_line").remove();
					Des.config.target.find(".designer_canvas").unbind("mouseenter").unbind("mouseleave");
					$(document).unbind("mousemove");
					$(document).unbind("mouseup");
					if(mousePos != null){
						//鼠标进行了移动
						box.remove(); //删除创建时的容器
						if(pageIndex != -1){
							Des.model.add(created, pageIndex, subIndex);
							Des.renderSubject(created, false, subIndex);
						}
					}
				});
			});
			//初始化鼠标移入事件，显示操作
			this.config.target.on("mouseenter", ".subject_canvas", function(){
				var box = $(this).parent();
				var id = box.attr("id");
				if(box.hasClass("subject_creating")){
					return;
				}
				$(".subject_operate").remove();
				var operate = $("<div class='subject_operate'></div>").appendTo($(this));
				var deleteBtn = $("<div class='tpbtn subject_op_btn'>删除</div>").appendTo(operate);
				//绑定删除
				deleteBtn.bind("click", function(){
					box.remove();
					Des.model.remove(id);
				});
			});
			this.config.target.on("mouseleave", ".subject_canvas", function(){
				//鼠标移出，隐藏操作
				$(".subject_operate").remove();
			});
			
			//初始化鼠标点击事件，选中
			this.config.target.on("click", ".subject_canvas", function(e){
				e.stopPropagation();
				$(".subject_selected").removeClass("subject_selected");
				$(this).addClass("subject_selected");
			});
			//初始化移动
			this.config.target.bind("keydown", function(e){
				var selected = Des.config.target.find(".subject_selected");
				if(selected.length > 0 && e.keyCode >= 37 && e.keyCode <= 40){
					var id = selected.parent().attr("id");
					var sub = Des.model.getById(id);
					if(e.keyCode == 37){
						//左
						sub.leftDis = parseInt(sub.leftDis);
						sub.leftDis-=5;
						if(sub.leftDis < 0){
							sub.leftDis = 0;
						}
						sub.leftDis += ""; //转成字符串，存储格式都是字符串
					}else if(e.keyCode == 39){
						//右
						sub.leftDis = parseInt(sub.leftDis);
						sub.leftDis+=5;
						if(sub.leftDis > 100){
							sub.leftDis = 100;
						}
						sub.leftDis += ""; //转成字符串，存储格式都是字符串
					}else if(e.keyCode == 38){
						//上
						sub.topDis = parseInt(sub.topDis);
						sub.topDis-=5;
						if(sub.topDis < 0){
							sub.topDis = 0;
						}
						sub.topDis += ""; //转成字符串，存储格式都是字符串
					}else if(e.keyCode == 40){
						//下
						sub.topDis = parseInt(sub.topDis);
						sub.topDis+=5;
						if(sub.topDis > 200){
							sub.topDis = 200;
						}
						sub.topDis += ""; //转成字符串，存储格式都是字符串
					}
					Des.renderSubject(sub);
					$(".position_tip").remove();
					var tip = $("<div class='position_tip'></div>").appendTo(selected.parent());
					tip.text("左边距：" + sub.leftDis + " 上边距：" + sub.topDis);
					Des.config.target.bind("keyup", function(){
						$(".position_tip").fadeOut();
						Des.config.target.unbind("keyup");
					});
				}
			}).bind("click", function(){
				//点击取消选中
				$(".subject_selected").removeClass("subject_selected");
			});
		}else if(this.config.status == "subject"){
			
			/**********************初始化对题目的编辑********************/
			
			//初始化鼠标移入事件，显示操作
			this.config.target.on("mouseenter", ".subject_canvas", function(){
				var box = $(this).parent();
				if(box.hasClass("subject_creating")){
					return;
				}
				var id = box.attr("id");
				$(".subject_operate").remove();
				//不同图形有不同的编辑规则
				var sub = Des.model.getById(id);
				var name = sub.className;
				var operate = $("<div class='subject_operate'></div>").appendTo($(this));
				if(name == "org.neworiental.rmp.base::BaseRichTxt"){
					var btn = $("<div class='tpbtn subject_op_btn'>编辑</div>").appendTo(operate);
					//绑定编辑
					btn.bind("click", function(){
						$(".editor_toolbar").children(".insert_rect").hide();
						$(".editor_toolbar").children(".insert_arrow").hide();
						$(".editor_toolbar").children(".insert_blank").hide();
						$("#txt_edit_text").qeditor("setValue", sub.htmlText);
						$("#dlg_edit_text").dlg();
						//绑定保存编辑
						$("#btn_save_text").unbind().bind("click", function(){
							sub.htmlText = $("#txt_edit_text").val();
							Des.renderSubject(sub);
							$("#dlg_edit_text").dlg("close");
							Des.model.update(sub);
						});
					});
				}else if(name == "org.neworiental.rmp.base::BaseTLFText"){
					var btn = $("<div class='tpbtn subject_op_btn'>编辑</div>").appendTo(operate);
					//绑定编辑
					btn.bind("click", function(){
						$(".editor_toolbar").children(".insert_rect").show();
						$(".editor_toolbar").children(".insert_arrow").show();
						$(".editor_toolbar").children(".insert_blank").hide();
						$("#txt_edit_text").qeditor("setValue", decodeURIComponent(sub.text));
						$("#dlg_edit_text").dlg();
						//绑定保存编辑
						$("#btn_save_text").unbind().bind("click", function(){
							sub.text = decodeURIComponent($("#txt_edit_text").val());
							Des.renderSubject(sub);
							$("#dlg_edit_text").dlg("close");
							Des.model.update(sub);
						});
					});
				}else if(name == "org.neworiental.rmp.base::BasePicture" || name == "org.neworiental.rmp.base::BaseAudio"){
					operate.append("<div class='subject_op_chk'><input type='checkbox' class='chk'/>是否居中</div>");
					var chk = operate.find("input");
					if(sub.isCenter == "true"){
						chk.attr("checked", true);
					}
					//绑定编辑
					chk.bind("click", function(){
						var center = $(this).is(":checked");
						var sub = Des.model.getById(id);
						sub.isCenter = center + ""; //转为字符串
						Des.renderSubject(sub);
						Des.model.update(sub);
					});
				}else if(name == "org.neworiental.rmp.base::BaseVideo"){
					operate.append("<div class='tpbtn subject_op_btn'>编辑</div><div class='subject_op_chk'><input type='checkbox' class='chk'/>是否居中</div>");
					var chk = operate.find("input");
					if(sub.isCenter == "true"){
						chk.attr("checked", true);
					}
					//绑定居中
					chk.bind("click", function(){
						var center = $(this).is(":checked");
						var sub = Des.model.getById(id);
						sub.isCenter = center + ""; //转为字符串
						Des.renderSubject(sub);
						Des.model.update(sub);
					});
					//绑定编辑
					operate.find(".subject_op_btn").bind("click", function(){
						$("#dlg_edit_video").dlg();
						$("#edit_video_w").val(sub.vWidth).focus();
						$("#edit_video_h").val(sub.vHeight);
						//绑定保存编辑
						$("#btn_save_video_edit").unbind().bind("click", function(){
							var w = $("#edit_video_w").val();
							var h = $("#edit_video_h").val();
							if(w && h){
								sub.vWidth = w;
								sub.vHeight = h;
								Des.renderSubject(sub);
								Des.model.update(sub);
							}
							$("#dlg_edit_video").dlg("close");
						});
					});
				}else if(name == "org.neworiental.rmp.base::TOEFLRecord"){
					//录音
					operate.append("<div class='tpbtn subject_op_btn'>编辑</div><div class='subject_op_chk'><input type='checkbox' class='chk'/>是否居中</div>");
					var chk = operate.find("input");
					if(sub.isCenter == "true"){
						chk.attr("checked", true);
					}
					//绑定居中
					chk.bind("click", function(){
						var center = $(this).is(":checked");
						var sub = Des.model.getById(id);
						sub.isCenter = center + ""; //转为字符串
						Des.renderSubject(sub);
						Des.model.update(sub);
					});
					//绑定编辑
					var btn = operate.find(".subject_op_btn");
					btn.bind("click", function(){
						$("#dlg_edit_record").dlg();
						$("#edit_record_time").val(sub.time);
						//绑定保存编辑
						$("#btn_save_record_edit").unbind().bind("click", function(){
							var time = $("#edit_record_time").val();
							if(time){
								sub.time = time;
							}
							Des.renderSubject(sub);
							$("#dlg_edit_record").dlg("close");
							Des.model.update(sub);
						});
					});
				}else if(name == "org.neworiental.rmp.base::OptionGroup"){
					operate.append("<div class='tpbtn subject_op_btn'>编辑</div><div class='subject_op_chk'><input type='checkbox' class='chk'/>是否居中</div>");
					var chk = operate.find("input");
					if(sub.isCenter == "true"){
						chk.attr("checked", true);
					}
					//绑定居中
					chk.bind("click", function(){
						var center = $(this).is(":checked");
						var sub = Des.model.getById(id);
						sub.isCenter = center + "";
						Des.renderSubject(sub);
						Des.model.update(sub);
					});
					//绑定编辑
					var btn = operate.find(".subject_op_btn");
					btn.bind("click", function(){
						var text = "";
						if(sub.options){
							for(var i = 0; i < sub.options.length; i++){
								var opt = sub.options[i];
								if(i != 0){
									text += "\n";
								}
								text += Des.utils.toText(opt.htmlText); //把html转为纯文本
							}
						}
						$("#dlg_edit_select").dlg();
						$("#edit_select_text").val(text).focus();
						if(sub.isMult == "true"){
							$("#edit_select_multi").attr("checked", true);
						}else{
							$("#edit_select_multi").attr("checked", false);
						}
						//绑定保存编辑
						$("#btn_save_select_edit").unbind().bind("click", function(){
							var optText = $("#edit_select_text").val().split("\n");
							var options = [];
							for (var oi = 0; oi < optText.length; oi++) {
								var text = optText[oi];
								options.push({
									"horizentalCenter": "NaN",
									"className": "org.neworiental.rmp.base::BaseRichTxt",
									"verticalCenter": "NaN",
									"topDis": "NaN",
									"rightDis": "0",
									"ID": "",
									"htmlText": text,
									"leftDis": "30",
									"isNode": "false",
									"bottomDis": "NaN"
								});
							}
							sub.options = options;
							sub.isMult = $("#edit_select_multi").is(":checked") + "";
							sub.rightAns = "[]";
							Des.renderSubject(sub);
							$("#dlg_edit_select").dlg("close");
							Des.model.update(sub);
						});
					});
				}else if(name == "write"){
					var btn = $("<div class='tpbtn subject_op_btn'>编辑</div>").appendTo(operate);
					//绑定编辑
					btn.bind("click", function(){
						$("#dlg_edit_write").dlg();
						$("#edit_write_placeholder").val(sub.placeholder);
						$("#edit_write_h").val(sub.minHeight);
						if(sub.showCount){
							$("#edit_write_count").attr("checked", true);
						}else{
							$("#edit_write_count").attr("checked", false);
						}
						//绑定保存编辑
						$("#btn_save_write_edit").unbind().bind("click", function(){
							sub.placeholder = $("#edit_write_placeholder").val();
							var minH = parseInt($("#edit_write_h").val());
							if(minH){
								sub.minHeight = minH;
							}
							sub.showCount = $("#edit_write_count").is(":checked");
							Des.renderSubject(sub);
							$("#dlg_edit_write").dlg("close");
							Des.model.update(sub);
						});
					});
				}else if(name == "org.neworiental.rmp.base::TOEFLTimerViewer"){
					operate.append("<div class='tpbtn subject_op_btn'>编辑</div><div class='subject_op_chk'><input type='checkbox' class='chk'/>是否居中</div>");
					var chk = operate.find("input");
					if(sub.isCenter == "true"){
						chk.attr("checked", true);
					}
					//绑定居中
					chk.bind("click", function(){
						var center = $(this).is(":checked");
						var sub = Des.model.getById(id);
						sub.isCenter = center + "";
						Des.renderSubject(sub);
						Des.model.update(sub);
					});
					//绑定编辑
					var btn = operate.find(".subject_op_btn");
					btn.bind("click", function(){
						$("#dlg_edit_timer").dlg();
						$("#edit_timer_title").val(sub.title).focus();
						$("#edit_timer_time").val(sub.time);
						//绑定保存编辑
						$("#btn_save_timer_edit").unbind().bind("click", function(){
							sub.title = $("#edit_timer_title").val();
							var time = parseInt($("#edit_timer_time").val());
							if(time){
								sub.time = $("#edit_timer_time").val(); //验证数字合法性
							}
							Des.renderSubject(sub);
							$("#dlg_edit_timer").dlg("close");
							Des.model.update(sub);
						});
					});
				}else if(name == "tableselect"){
					operate.append("<div class='tpbtn subject_op_btn'>编辑</div><div class='subject_op_chk'><input type='checkbox' class='chk'/>是否居中</div>");
					var chk = operate.find("input");
					if(sub.center){
						chk.attr("checked", true);
					}
					//绑定居中
					chk.bind("click", function(){
						var center = $(this).is(":checked");
						var sub = Des.model.getById(id);
						sub.center = center;
						Des.renderSubject(sub);
						Des.model.update(sub);
					});
					//绑定编辑
					var btn = operate.find(".subject_op_btn");
					btn.bind("click", function(){
						$("#dlg_edit_table").dlg();
						$("#edit_table_column_text").val(sub.columns.join("\n"));
						$("#edit_table_row_text").val(sub.rows.join("\n"));
						//绑定保存编辑
						$("#btn_save_table_edit").unbind().bind("click", function(){
							var rows = $("#edit_table_row_text").val().split("\n");
							var columns = $("#edit_table_column_text").val().split("\n");
							sub.columns = columns;
							sub.rightAnswer = [];
							sub.rows = rows;
							Des.renderSubject(sub);
							$("#dlg_edit_table").dlg("close");
							Des.model.update(sub);
						});
					});
				}else if(name == "drag"){
					operate.append("<div class='tpbtn subject_op_btn'>编辑</div>");
					//绑定编辑
					var btn = operate.find(".subject_op_btn");
					btn.bind("click", function(){
						//初始化题空编辑与展示
						$("#edit_drag_blanks").empty();
						for(var bi = 0; bi < sub.blanks.length; bi++){
							var blank = sub.blanks[bi];
							var item = $("<div class='edit_drag_blank'>题空个数：<input type='text' class='txt edit_drag_blank_size'/>描述：<input type='text' class='txt edit_drag_blank_des'/></div>").appendTo("#edit_drag_blanks");
							item.children(".edit_drag_blank_size").val(blank.size);
							item.children(".edit_drag_blank_des").val(blank.description);
							if(bi != 0){
								item.append("<div class='tpbtn default delete_btn'>删除</div>");
							}
						}
						$("#dlg_edit_drag").dlg();
						$("#edit_drag_options").val(sub.options.join("\n")).focus();
						//绑定添加题空
						$("#edit_drag_add").unbind().bind("click", function(){
							var item = $("<div class='edit_drag_blank'>题空个数：<input type='text' value='1' class='txt edit_drag_blank_size'/>描述：<input type='text' class='txt edit_drag_blank_des'/><div class='tpbtn default delete_btn'>删除</div></div>").appendTo("#edit_drag_blanks");
						});
						//绑定删除题空，用on的形式，因为可能有动态添加的
						$("#edit_drag_blanks").on("click", ".delete_btn", function(){
							$(this).parent().remove();
						});
						//绑定保存编辑
						$("#btn_save_drag_edit").unbind().bind("click", function(){
							var options = $("#edit_drag_options").val().split("\n");
							sub.options = options;
							var blanks = [];
							$(".edit_drag_blank").each(function(){
								var sizeInput = $(this).children(".edit_drag_blank_size");
								var size = parseInt(sizeInput.val());
								if(!size){
									size = 1;
								}
								var des = $(this).children(".edit_drag_blank_des").val();
								var blank = {size: size, description: des};
								blanks.push(blank);
							});
							sub.rightAnswer = [];
							sub.blanks = blanks;
							Des.renderSubject(sub);
							$("#dlg_edit_drag").dlg("close");
							Des.model.update(sub);
						});
					});
				}else if(name == "fillblank"){
					var btn = $("<div class='tpbtn subject_op_btn'>编辑</div>").appendTo(operate);
					//绑定编辑
					btn.bind("click", function(){
						$(".editor_toolbar").children(".insert_rect").hide();
						$(".editor_toolbar").children(".insert_arrow").hide();
						$(".editor_toolbar").children(".insert_blank").show();
						$("#txt_edit_text").qeditor("setValue", sub.text);
						$("#dlg_edit_text").dlg();
						//绑定保存编辑
						$("#btn_save_text").unbind().bind("click", function(){
							sub.text = $("#txt_edit_text").val();
							Des.renderSubject(sub);
							$("#dlg_edit_text").dlg("close");
							Des.model.update(sub);
						});
					});
				}else if(name == "audiotext"){
					operate.append("<div class='tpbtn subject_op_btn'>编辑</div>");
					//绑定编辑
					var btn = operate.find(".subject_op_btn");
					btn.bind("click", function(){
						$("#audiotext_points").empty();
						$("#dlg_edit_audiotext").dlg({modal: false});
						var player = document.getElementById("audiotext_edit_player");
						//添加时间点
						function addPoint(point, duration){
							var item = $("<div></div>").appendTo("#audiotext_points");
							//计算X坐标
							var max = 207;
							var x = Math.floor(point.time / duration * max);
							item.css("left", x);
							if(point.type == "text"){
								item.attr("title", point.text);
							}
							if(point.type == "end"){
								item.addClass("point_type_end");
							}else{
								item.addClass("image_dropable point_type_normal");
							}
							item.data("props", point);
							//绑定双击删除
							$("#audiotext_points").children("div").unbind("dblclick").bind("dblclick", function(e){
								if(confirm("确定删除该锚点？")){
									$(this).remove();
								}
							});
							//绑定鼠标悬浮时显示
							$("#audiotext_points").children(".point_type_normal").unbind("mouseenter").bind("mouseenter", function(e){
								var target = $(this);
								var tip = $("#autiotext_point_tip");
								if(tip.length == 0){
									tip = $("<div id='autiotext_point_tip'></div>").appendTo("body");
								}
								tip.empty();
								var data = target.data("props");
								if(data.image){
									tip.append("<img src='"+data.image+"'/>");
								}
								tip.append("<div>" + data.text + "</div>");
								tip.show().css({
									left: target.offset().left,
									top: target.offset().top + 20
								});
							});
							$("#audiotext_points").children(".point_type_normal").unbind("mouseleave").bind("mouseleave", function(e){
								$("#autiotext_point_tip").hide();
							});
							$("#audiotext_points").children("div").unbind("mousedown").bind("mousedown", function(e){
								var current = $(this);
								//绑定拖动
								var pointOffset = e.pageX - current.offset().left;
								$(document).bind("mousemove", function(moveE){
									var lineOffset = moveE.pageX - $("#audiotext_points").offset().left;
									var newLeft = lineOffset - pointOffset;
									if(newLeft < 0){
										newLeft = 0;
									}else if(newLeft > max){
										newLeft = max;
									}
									current.css("left", newLeft);
								});
								$(document).bind("mouseup", function(moveE){
									$(document).unbind("mouseup");
									$(document).unbind("mousemove");
									var pos = current.position().left;
									var time = Math.floor(pos / max * duration);
									var point = current.data("props");
									point.time = time;
								});
							});
						}
						if(sub.src){
							var points = sub.points;
							if(!points){
								points = [];
							}
							//初始化
							for (var pi = 0; pi < points.length; pi++) {
								var p = points[pi];
								addPoint(p, sub.duration);
							}
							//设置音频
							$("#audiotext_edit_player").attr("src", sub.src);
						}
						
						//绑定添加文字
						$("#audiotext_text_btn").unbind().bind("click", function(){
							if(!$("#audiotext_edit_player").attr("src")){
								alert("音频尚未加载，请先从资源栏中添加音频");
								return;
							}
							if(!player.duration){
								alert("音频正在加载中，请稍候操作");
								return;
							}
							var text = $("#audiotext_text").val();
							if(text == ""){
								$("#audiotext_text").focus();
								return;
							}
							$("#audiotext_text").val("");
							//添加
							var time = player.currentTime; //当前播放时间
							var point = {
								type: "text",
								time: Math.floor(time),
								text: text
							}
							addPoint(point, player.duration);
						});
						
						//绑定添加截止点
						$("#audiotext_add_endpoint").unbind().bind("click", function(){
							if(!$("#audiotext_edit_player").attr("src")){
								alert("音频尚未加载，请先从资源栏中添加音频");
								return;
							}
							if(!player.duration){
								alert("音频正在加载中，请稍候操作");
								return;
							}
							//添加
							var time = player.currentTime; //当前播放时间
							var point = {
								type: "end",
								time: Math.floor(time)
							}
							addPoint(point, player.duration);
						});
						//绑定保存编辑
						$("#btn_save_audiotext_edit").unbind().bind("click", function(){
							var points = [];
							$("#audiotext_points").children("div").each(function(){
								var point = $(this).data("props");
								points.push(point);
							});
							sub.points = points;
							sub.src = $("#audiotext_edit_player").attr("src");
							if(player.duration && player.duration != sub.duration){
								sub.duration = Math.floor(player.duration);
							}
							Des.renderSubject(sub);
							$("#dlg_edit_audiotext").dlg("close");
							Des.model.update(sub);
							$("#audiotext_edit_player").attr("src", "");
						});
					});
				}else if(name == "record_test"){
					operate.append("<div class='subject_op_chk'><input type='checkbox' class='chk'/>是否居中</div>");
					var chk = operate.find("input");
					if(sub.center){
						chk.attr("checked", true);
					}
					//绑定居中
					chk.bind("click", function(){
						var center = $(this).is(":checked");
						var sub = Des.model.getById(id);
						sub.center = center;
						Des.renderSubject(sub);
						Des.model.update(sub);
					});
				}
				if(sub.resource){
					var deleteBtn = $("<div class='tpbtn subject_op_btn'>删除</div>").prependTo(operate);
					//绑定删除
					deleteBtn.bind("click", function(){
						box.remove();
						Des.model.remove(id);
					});
				}
			});
			this.config.target.on("mouseleave", ".subject_canvas", function(){
				//鼠标移出，隐藏操作
				$(".subject_operate").remove();
			});
		}
	};
	/**
	 * 绘制图形
	 * @param {} shape
	 */
	this.renderSubject = function(subject, creating, index){
		var subjectBox;
		if(creating){
			subjectBox = this.config.target.find(".subject_creating");
		}else{
			subjectBox = this.config.target.find(".subject_box#" + subject.ID);
		}
		var elements = null;
		if(subjectBox.length == 0){
			if(creating){
				subjectBox = $("<div class='subject_box subject_creating'><div class='subject_canvas'></div></div>").appendTo(this.config.target);
			}else{
				var pageIndex = this.model.getSubContainerIndex(subject.ID);
				var target = this.config.target.find(".designer_canvas:eq("+pageIndex+")");
				elements = this.model.define.containers[pageIndex].contents;
				var boxHtml = "<div class='subject_box' id='" + subject.ID + "'><div class='subject_canvas'></div></div>";
				if(typeof index == "undefined" || index == -1 || index >= elements.length){
					subjectBox = $(boxHtml).appendTo(target);
				}else{
					//定义了位置，执行插入
					if(index == 0){
						subjectBox = $(boxHtml).prependTo(target);
					}else{
						target.children(".subject_box:eq("+(index - 1)+")").after(boxHtml);
						subjectBox = target.find(".subject_box#" + subject.ID);
					}
				}
			}
		}
		subjectBox.attr("n", subject.className);
		var canvas = subjectBox.children(".subject_canvas");
		if(this.config.status == "readonly" || this.config.status == "testing"){
			//测试状态、只读状态下，悬浮不变颜色
			canvas.addClass("subject_canvas_readonly");
		}
		if(subject.className == "org.neworiental.rmp.base::BaseRichTxt"){
			//普通文本
			canvas.html(Des.utils.formatHtml(subject.htmlText));
		}else if(subject.className == "org.neworiental.rmp.base::BaseTLFText"){
			//富文本
			var text = decodeURIComponent(subject.text);
			canvas.html(Des.utils.formatHtml(text));
			if(elements != null && elements.length == 1 && this.model.define.containers.length == 2){
				//有两页，并且只有富文本控件的情况下，判断有没有箭头标记
				var tags = canvas.find(".richtext_arrow");
				if(tags.length > 0){
					var top = tags.position().top;
					subjectBox.parent().parent().scrollTop(top);
				}
			}
		}else if(subject.className == "org.neworiental.rmp.base::ToelfInsertPart"){
			//阅读插入
			var text = decodeURIComponent(subject.data);
			canvas.html(Des.utils.formatHtml(text));
			var rects = canvas.find(".richtext_rect");
			var ind = 0;
			rects.each(function(){
				$(this).attr("ind", ind);
				ind++;
			});
			//绑定矩形标记可以点击
			rects.bind("click", function(){
				canvas.find(".richtext_rect").show().removeClass("inserted");
				canvas.find(".inserted_text").remove();
				$(this).after("<span class='inserted_text' style='color: blue'>"+subject.showText+"</span>");
				$(this).hide().addClass("inserted");
			});
			if(elements != null && elements.length == 1 && this.model.define.containers.length == 2){
				//有两页，并且只有富文本控件的情况下，判断有没有箭头标记
				var tags = canvas.find(".richtext_arrow");
				if(tags.length > 0){
					var top = tags.position().top;
					subjectBox.parent().parent().scrollTop(top);
				}
			}
			if(Des.config.status == "testing" && Player.pageAnswer && Player.pageAnswer.length > 0){
				//如果是测试状态，显示用户答案
				var answer = Player.pageAnswer[0];
				var answer = Player.getSubjectAnswer(Player.pageAnswer, Des.model.define, subject);
				if(answer.length > 1){
					canvas.find(".richtext_rect[ind="+answer[1]+"]").trigger("click");
				}
			}
		}else if(subject.className == "org.neworiental.rmp.base::BasePicture"){
			if(canvas.children("img").length == 0 || canvas.children("img").attr("src") != subject.url){
				//不重复绘制
				canvas.html("<img src='" + this.config.imgPath + subject.url + ".png'/>");
			}
			if(subject.isCenter == "true"){
				canvas.css("text-align", "center");
			}else{
				canvas.css("text-align", "left");
			}
		}else if(subject.className == "org.neworiental.rmp.base::BaseAudio"){
			canvas.html("<audio controls='controls'></audio>");
			if(subject.soundURL){
				canvas.children("audio").attr("src", subject.soundURL);
			}
			if(subject.isCenter == "true"){
				canvas.css("text-align", "center");
			}else{
				canvas.css("text-align", "left");
			}
		}else if(subject.className == "org.neworiental.rmp.base::BaseVideo"){
			canvas.html("<video controls='controls'></video>");
			canvas.children("video").attr({
				width: subject.vWidth + "px",
				height: subject.vHeight + "px"
			});
			if(subject.url){
				canvas.children("video").attr("src", subject.url);
			}
			if(subject.isCenter == "true"){
				canvas.css("text-align", "center");
			}else{
				canvas.css("text-align", "left");
			}
		}else if(subject.className == "org.neworiental.rmp.base::TOEFLRecord"){
			var html = "<div class='subject_record'><div class='record_title'>Recording...</div><div class='record_time'></div><div class='record_progress'></div></div>";
			canvas.html(html);
			var totalTime = parseInt(subject.totalTime);
			var minutes = Math.floor(totalTime / 60);
			if(minutes < 10){
				minutes = "0" + minutes;
			}
			var seconds = totalTime % 60;
			if(seconds < 10){
				seconds = "0" + seconds;
			}
			canvas.find(".record_time").text(minutes + ":" +seconds);
			canvas.css("text-align", "center");
			if(Des.config.status == "testing"){
				//如果是测试状态，直接开始倒计时
				var begin = new Date().getTime();
				var progress = canvas.find(".record_progress");
				var bar = $("<div></div>").appendTo(progress);
				var intTimer = setInterval(function(){
					if(canvas.length == 0 || !canvas.is(":visible")){
						//canvas不存在了或者隐藏了
						clearInterval(intTimer);
						return;
					}
					var now = new Date().getTime();
					var past = Math.round((now - begin) / 1000); //已经过去多少秒
					var totalTime = parseInt(subject.totalTime);
					var last = totalTime - past;
					if(last <= 0){
						//倒计时结束
						bar.css("width", "100%");
						canvas.find(".record_time").text("00:00");
						clearInterval(intTimer);
						canvas.trigger("ended");
						return;
					}
					//设置进度条
					bar.css("width", past / totalTime * 100 + "%");
					//设置时间显示
					var minutes = Math.floor(last / 60);
					if(minutes < 10){
						minutes = "0" + minutes;
					}
					var seconds = last % 60;
					if(seconds < 10){
						seconds = "0" + seconds;
					}
					canvas.find(".record_time").text(minutes + ":" +seconds);
				}, 250);
			}
		}else if(subject.className == "org.neworiental.rmp.base::OptionGroup"){
			canvas.empty();
			var list = $("<ul class='subject_select_list'></ul>").appendTo(canvas);
			var control;
			if(subject.isMult == "true"){
				control = "<input type='checkbox' name='subject_select_radio' class='chk'/>";
			}else{
				control = "<input type='radio' name='subject_select_radio' class='chk'/>";
			}
			if(subject.options){
				for(var i = 0; i < subject.options.length; i++){
					var opt = subject.options[i];
					var item = $("<li></li>").appendTo(list);
					var randomId = Des.utils.newId();
					var chk = $(control).appendTo(item);
					chk.attr("id", randomId);
					var label = $("<label>" + Des.utils.toText(opt.htmlText) +"</label>").appendTo(item);
					label.attr("for", randomId);
					chk.attr("ind", i);
					if(Des.config.status == "subject" && subject.rightAns){
						//如果是题目编辑状态，显示正确答案
						var rightAnswer = JSON.parse(subject.rightAns);
						if(rightAnswer.indexOf(i) >= 0){
							chk.prop("checked", true);
						}
					}else if(Des.config.status == "testing" && Player.pageAnswer && Player.pageAnswer.length > 0){
						//如果是测试状态，显示用户答案
						var answer = Player.getSubjectAnswer(Player.pageAnswer, Des.model.define, subject);
						if(answer.indexOf(i) >= 0){
							chk.prop("checked", true);
						}
					}
				}
			}
			if(subject.isCenter == "true"){
				canvas.css("text-align", "center");
			}else{
				canvas.css("text-align", "left");
			}
			if(Des.config.status == "subject"){
				//绑定设置正确答案
				list.find("input").bind("click", function(){
					var answers = list.find("input:checked").map(function(){
						return parseInt($(this).attr("ind"));
					}).get();
					var id = list.parents(".subject_box").attr("id");
					var sub = Des.model.getById(id);
					sub.rightAnswer = answers;
					Des.model.update(sub);
				});
			}
		}else if(subject.className == "org.neworiental.rmp.base::BaseInputText"){
			canvas.empty();
			var editBox = $("<div class='subject_write_text'><textarea></textarea></div>").appendTo(canvas);
			var textBox = editBox.children("textarea");
			textBox.css("min-height", subject.minHeight + "px");
			textBox.attr("placeholder", subject.defaultText);
			if(subject.hideCount == "false"){
				canvas.prepend("<div class='write_word_count'>Word Count: 0</div>")
			}
			//绑定编辑过程的控制
			textBox.unbind().bind("keyup", function(){
				$(this).scrollTop(999999);
				var h = $(this).height() + $(this).scrollTop();
				$(this).height(h);
				//统计字符数
				var subId = $(this).parent().parent().parent().attr("id");
				var sub = Des.model.getById(subId);
				if(sub && sub.hideCount == "false"){
					var content = $(this).val();
					var words = content.split(/\s+/);
					var count = words.length;
					if(count >= 1){
						if(words[words.length - 1] == ""){
							count = count - 1;
						}
					}
					$(this).parent().parent().children(".write_word_count").text("Word Count: " + count);
				}
			});
			textBox.trigger("keyup");
			if(Des.config.status == "testing"){
				var answer = Player.getSubjectAnswer(Player.pageAnswer, Des.model.define, subject);
				textBox.val(answer[1]).trigger("keyup");
			}
		}else if(subject.className == "org.neworiental.rmp.base::TOEFLTimerViewer"){
			var html = "<div class='subject_timer'><div class='timer_title'>"+subject.title+"</div><div class='timer_time'></div><div class='timer_progress'></div></div>";
			canvas.html(html);
			var minutes = Math.floor(subject.time / 60);
			if(minutes < 10){
				minutes = "0" + minutes;
			}
			var seconds = subject.time % 60;
			if(seconds < 10){
				seconds = "0" + seconds;
			}
			canvas.find(".timer_time").text(minutes + ":" +seconds);
			if(subject.isCenter == "true"){
				canvas.css("text-align", "center");
			}else{
				canvas.css("text-align", "left");
			}
			if(Des.config.status == "testing"){
				//如果是测试状态，直接开始倒计时
				var begin = new Date().getTime();
				var progress = canvas.find(".timer_progress");
				var bar = $("<div></div>").appendTo(progress);
				var intTimer = setInterval(function(){
					if(canvas.length == 0 || !canvas.is(":visible")){
						//canvas不存在了或者隐藏了
						clearInterval(intTimer);
						return;
					}
					var now = new Date().getTime();
					var past = Math.round((now - begin) / 1000); //已经过去多少秒
					var last = subject.time - past;
					if(last <= 0){
						//倒计时结束
						bar.css("width", "100%");
						canvas.find(".timer_time").text("00:00");
						clearInterval(intTimer);
						canvas.trigger("ended");
						return;
					}
					//设置进度条
					bar.css("width", past / subject.time * 100 + "%");
					//设置时间显示
					var minutes = Math.floor(last / 60);
					if(minutes < 10){
						minutes = "0" + minutes;
					}
					var seconds = last % 60;
					if(seconds < 10){
						seconds = "0" + seconds;
					}
					canvas.find(".timer_time").text(minutes + ":" +seconds);
				}, 250);
			}
		}else if(subject.className == "tableselect"){
			var html = "<table class='subject_tableselect'>";
			//构造表头
			html += "<tr class='table_select_header'>";
			html += "<td></td>";
			var selectHtml = ""; //每行选择区域的html
			for(var i = 0; i < subject.columns.length; i++){
				html += "<td>";
				html += subject.columns[i];
				html += "</td>";
				selectHtml += "<td class='tableselect_chkbox' ind='"+i+"'></td>";
			}
			html += "</tr>";
			//构造列头
			for(var i = 0; i < subject.rows.length; i++){
				html += "<tr>";
				html += "<td>";
				html += subject.rows[i];
				html += "</td>";
				html += selectHtml;
				html += "</tr>";
			}
			html += "</table>";
			canvas.html(html);
			if(subject.isCenter == "true"){
				canvas.children("table").css("margin", "0px auto");
			}else{
				canvas.children("table").css("margin", "0px");
			}
			if(Des.config.status == "subject" && subject.rightAnswer){
				//如果是题目编辑状态，显示正确答案
				var rows = canvas.find("tr:not(.table_select_header)");
				var ind = 0;
				rows.each(function(){
					var an = subject.rightAnswer[ind];
					if(an >= 0){
						$(this).children(".tableselect_chkbox:eq("+an+")").addClass("table_checked");
					}
					ind++;
				});
			}
			canvas.find(".tableselect_chkbox").unbind().bind("click", function(){
				$(this).parent().children().removeClass("table_checked");
				$(this).addClass("table_checked");
				if(Des.config.status == "subject"){
					//题目编辑状态下，绑定设置正确答案
					var rows = canvas.find("tr:not(.table_select_header)");
					var answers = [];
					rows.each(function(){
						var an = -1;
						var checked = $(this).children(".table_checked");
						if(checked.length){
							an = parseInt(checked.attr("ind"));
						}
						answers.push(an);
					});
					var id = canvas.parents(".subject_box").attr("id");
					var sub = Des.model.getById(id);
					sub.rightAnswer = answers;
					Des.model.update(sub);
				}
			});
		}else if(subject.className == "org.neworiental.rmp.base::TOEFLReadingDrag"){
			canvas.empty();
			var blankNums = subject.blankNum.split("*^*");
			var descArr = subject.blankDescs.split("*^*");
			var blankIndex = 0;
			for(var i = 0; i < blankNums.length; i++){
				//添加题空
				var blankBox = $("<div></div>").appendTo(canvas);
				if(i != 0){
					blankBox.css("padding-top", "20px");
				}
				var blankNum = parseInt(blankNums[i]);
				var des = descArr[i];
				if(des){
					blankBox.append("<div>"+des+"</div>");
				}
				if(Des.config.status == "testing" && !subject.answer){
					var answer = Player.getSubjectAnswer(Player.pageAnswer, Des.model.define, subject);
					//如果是测试状态，并且题目没有作答信息，从用户答案中取出来，并设置到题目中，等于进行初始化
					subject.answer = [];
					for(var i = 1; i < answer.length; i++){
						subject.answer.push(answer[i]);
					}
				}
				var bi = 0;
				while(bi < blankNum){
					var blankItem = $("<div class='subjectdrag_blank'></div>").appendTo(blankBox);
					if(Des.config.status == "subject" && subject.rightAnswer){
						//如果是题目编辑状态，显示正确答案状态
						var answerInd = subject.rightAnswer[blankIndex];
						if(answerInd >= 0){
							blankItem.html(this.utils.toText(subject.options[answerInd]));
							blankItem.attr("an", answerInd);
						}
					}else if(Des.config.status == "testing"){
						//如果是测试状态，在题空上显示用户答案
						var answerInd = subject.answer[blankIndex];
						if(answerInd >= 0){
							blankItem.html(this.utils.toText(subject.options[answerInd]));
							blankItem.attr("an", answerInd);
						}
					}
					bi++;
					blankIndex++;
				}
			}
			for(var i = 0; i < subject.options.length; i++){
				//添加选项
				var option = subject.options[i];
				if(Des.config.status == "subject" && subject.rightAnswer){
					//如果是题目编辑状态，显示正确答案状态
					if(subject.rightAnswer.indexOf(i) < 0){
						canvas.append("<div class='subjectdrag_option' ind='"+i+"'>"+this.utils.toText(subject.options[i])+"</div>");
					}
				}else if(Des.config.status == "testing"){
					//如果是题目编辑状态，显示正确答案状态
					if(subject.answer.indexOf(i) < 0){
						canvas.append("<div class='subjectdrag_option' ind='"+i+"'>"+this.utils.toText(subject.options[i])+"</div>");
					}
				}else{
					canvas.append("<div class='subjectdrag_option' ind='"+i+"'>"+this.utils.toText(subject.options[i])+"</div>");
				}
			}
			if(Des.config.status == "subject" || Des.config.status == "testing"){
				//如果是题目编辑状态，绑定拖拽
				canvas.children(".subjectdrag_option").unbind().bind("mousedown", function(e){
					var target = $(this);
					var offsetX = e.pageX - target.offset().left;
					var offsetY = e.pageY - target.offset().top;
					var clone = target.clone().appendTo("body");
					clone.css({
						"position": "absolute",
						"margin-top": "0px",
						"background": "transparent"
					});
					clone.width(target.width());
					$(document).bind("mousemove.sub_drag", function(moveE){
						clone.css({
							left: moveE.pageX - offsetX,
							top: moveE.pageY - offsetY
						});
					});
					$(document).bind("mouseup.sub_drag", function(upE){
						var upX = upE.pageX;
						var upY = upE.pageY;
						//判断是放在了哪个题空里
						var targetIndex = 0;
						var targetBlank = null;
						canvas.find(".subjectdrag_blank").each(function(){
							var blank = $(this);
							var rect = {
								x: blank.offset().left,
								y: blank.offset().top,
								w: blank.outerWidth(),
								h: blank.outerHeight()
							};
							if(Des.utils.pointInRect(upX, upY, rect)){
								targetBlank = blank;
								return false;
							}
							targetIndex++;
						});
						if(targetBlank != null){
							targetBlank.attr("an", clone.attr("ind"));
							//放到了题空中
							if(Des.config.status == "subject" || Des.config.status == "testing"){
								//设置答案
								var answers = [];
								canvas.find(".subjectdrag_blank").each(function(){
									var an = -1;
									if($(this).attr("an")){
										an = parseInt($(this).attr("an"));
									}
									answers.push(an);
								});
								if(Des.config.status == "testing"){
									//如果是测试状态，设置用户答案
									subject.answer = answers;
								}else{
									//如果是题目编辑状态，设置正确答案
									subject.rightAnswer = answers;
								}
								Des.model.update(subject);
								Des.renderSubject(subject);
							}
						}
						clone.remove();
						$(document).unbind("mouseup.sub_drag");
						$(document).unbind("mousemove.sub_drag");
					});
				});
			}
		}else if(subject.className == "org.neworiental.rmp.base::TOEFLRecordChecker"){
			var html = "<div class='subject_record_test'>" +
				"<div class='record_test_line'>" +
				"Select Microphone<div class='tpbtn drop record_test_select'>Default</div>" +
				"<div class='tpbtn' style='width: 80px;'>Recording</div><div class='tpbtn'>Stop</div>" +
				"</div>" +
				"<div class='record_test_line record_test_line2'>" +
				"<div class='record_test_progress'></div>" +
				"<div class='tpbtn' style='width: 80px;'>Play</div><div class='tpbtn'>ReTry</div>" +
				"</div>" +
				"</div>";
			canvas.html(html);
			canvas.css("text-align", "center");
		}else if(subject.className == "org.neworiental.rmp.base::ToelfAudio"){
			canvas.html("<div class='subject_audiotext'><div class='subject_audiotext_progress'></div></div>");
			if(this.config.status == "template" || this.config.status == "subject"){
				canvas.children().append("<div class='subject_audiotext_tip'>编辑模式不能播放，可预览查看...</div>");
			}
			canvas.css("text-align", "center");
			if(Des.config.status == "testing"){
				canvas.children().append("<div class='subject_audiotext_tip'>加载中，请稍候...</div>");
				//如果是测试状态，直接开始播放
				var audio = $("<audio></audio>").appendTo(canvas);
				audio.bind("canplay", function(){
					//加载完自动开始播放
					canvas.find(".subject_audiotext_tip").remove();
					var player = $(this)[0];
					player.play();
					//控制进度
					var progress = canvas.find(".subject_audiotext_progress");
					var bar = $("<div></div>").appendTo(progress);
					//开始监听
					var second = 0;
					var intTimer = setInterval(function(){
						if(canvas.length == 0 || !canvas.is(":visible")){
							//canvas不存在了或者隐藏了
							clearInterval(intTimer);
							return;
						}
						var curSecond = Math.floor(player.currentTime);
						//设置进度条
						bar.css("width", player.currentTime / player.duration * 400 + "px");
						if(player.currentTime >= player.duration){
							//倒计时结束
							clearInterval(intTimer);
							return;
						}
						if(curSecond == second){
							return; //同一秒
						}
						second = curSecond;
						//显示时间点，解析mode属性
						//mode属性示例："[{"isWord":false,"word":null,"url":"A9060840-8384-6B97-9C59-A72029247234","timestamp":5108}]"
						var mode = JSON.parse(subject.mode);
						for (var pi = 0; pi < mode.length; pi++) {
							var point = mode[pi];
							var time = Math.floor(point.timestamp / 1000); //毫秒转为秒
							if(curSecond == time){
								//显示文本
								if(point.isWord && point.word){
									canvas.find(".audiotext_view").remove();
									var view = $("<div class='audiotext_view'><div></div></div>").prependTo(canvas);
									view.children("div").append("<span>" + point.word + "</span>");
								}else if(point.url){
									canvas.find(".audiotext_view").remove();
									var view = $("<div class='audiotext_view audiotext_nobor'></div>").prependTo(canvas);
									view.append("<img src='" + (Des.config.audioImgPath + point.url + ".jpg") + "'/>");
								}
							}else if(point.type == "end" && point.time == curSecond){
								//截止点
								canvas.find(".audiotext_view").remove();
							}
						}
					}, 100);
				});
				if(subject.url){
					audio.attr("src", this.config.audioPath + subject.url);
				}
			}
		}else if(subject.className == "fillblank"){
			canvas.html(subject.text);
			//控制题空的宽度
			canvas.find(".fillblank_blank").unbind().bind("keyup", function(){
				var testBox = $("#test_blank_w");
				if(testBox.length == 0){
					//用来测试文本宽度的控件
					testBox = $("<div class='fillblank_blank' style='width: auto;position: absolute; left: -500px'></div>").appendTo("body");
				}
				testBox.text($(this).val());
				$(this).css("width", testBox.width());
			});
			canvas.find(".fillblank_blank").trigger("keyup");
		}
		if(!creating){
			subjectBox.css({
				"margin-left": subject.leftDis + "px",
				"margin-top": subject.topDis + "px"
			});
		}
		return subjectBox;
	};
	/**
	 * 打开
	 * @param {} define
	 */
	this.open = function(define){
		if(typeof define == "string"){
			define = JSON.parse(define);
		}
		this.model.define = define;
		var target = this.config.target;
		target.find(".subject_page").remove();
		if(define.containers.length == 1){
			target.append("<div class='subject_page'><div class='designer_canvas' pindex='0'></div></div>");
		}else{
			var page1 = $("<div class='subject_page'><div class='designer_canvas' pindex='0'></div></div>").appendTo(target);
			var page2 = $("<div class='subject_page'><div class='designer_canvas' pindex='1'></div></div>").appendTo(target);
			page1.css({"float": "left", "width": "50%"});
			page2.css({"float": "left", "width": "50%"});
		}
		target.find(".subject_page").height(this.config.pageHeight);
		for(var pi = 0; pi < define.containers.length; pi++){
			var container = define.containers[pi];
			if(container.contents){
				for(var i = 0; i < container.contents.length; i++){
					var sub = container.contents[i];
					this.renderSubject(sub);
				}
			}
		}
		if(this.config.status == "template"){
//			if(define.type == "additional"){
//				$("#template_addition_area").show();
//			}else{
//				$("#template_addition_area").hide();
//			}
		}else if(this.config.status == "subject"){
//			if(define.type == "additional"){
//				$("#sub_addition_area").show();
//			}else{
//				$("#sub_addition_area").hide();
//			}
			//设置题目编辑时，头部的属性
			//设置是否是说明页
			if(define.isExplain == "true"){
				$("#chk_des_page").prop("checked", true);
			}else{
				$("#chk_des_page").prop("checked", false);
			}
			if(define.time){ //倒计时
				$("#input_page_time").val(define.time);
			}else{
				$("#input_page_time").val("");
			}
			//翻页方式
			var slidingType = "normal";
			if(define.slidingType){
				slidingType = define.slidingType;
			}
			var text = $("#menu_turning").children("li[ty="+slidingType+"]").text();
			$("#btn_turning_select").text(text);
			//背景音乐
			$(".bgaudio_player").attr("src", define.url);
		}else if(this.config.status == "testing"){
			
		}
	},
	/**
	 * 打开、关闭附加页
	 * @param {} open true : 打开，false : 关闭
	 */
	this.toggleAdditional = function(open){
		var target = this.config.target;
		if(open){
			target.find(".subject_page:eq(0)").hide();
			target.find(".subject_page:eq(1)").show();
		}else{
			target.find(".subject_page:eq(1)").hide();
			target.find(".subject_page:eq(0)").show();
		}
	},
	/**
	 * 数据对象
	 * @type {}
	 */
	this.model = {
		/**
		 * 定义
		 * @type {}
		 */
		define: {
//			pages:[{
//				elements: []
//			},{
//				elements: []
//			}]
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
			"ID": "",
			"slidingType": "normal_mode",
			"leftDis": "NaN",
			"bottomDis": "NaN",
			containers:[{
					"horizentalCenter": "NaN",
					"className": "org.neworiental.rmp.base::BaseContainer",
					"verticalCenter": "NaN",
					"topDis": "NaN",
					"rightDis": "NaN",
					"ID": "",
					"leftDis": "NaN",
					"isNode": "false",
					"bottomDis": "NaN",
					contents: []
				}
			]
		},
		/**
		 * 创建图形
		 * @param {} name
		 */
		create: function(name){
			var result = {
				"ID": Des.utils.newId(),
				"className": name,
				"horizentalCenter": "NaN",
				"verticalCenter": "NaN",
				"topDis": "20",
				"rightDis": "20",
				"leftDis": "40",
				"bottomDis": "0",
				"isNode": "false"
			};
			if(name == "org.neworiental.rmp.base::BaseRichTxt"){
				result.htmlText = "在此输入普通文本";
			}else if(name == "org.neworiental.rmp.base::BaseTLFText"){
				result.text = encodeURIComponent("在此输入富文本");
			}else if(name == "org.neworiental.rmp.base::BasePicture"){
				result.isCenter = "false";
				result.url = "static/images/img.png";
			}else if(name == "org.neworiental.rmp.base::BaseAudio"){
				result.isCenter = "false";
				result.soundURL = "";
			}else if(name == "org.neworiental.rmp.base::BaseVideo"){
				result.isCenter = "false";
				result.vWidth = "400";
				result.vHeight = "400";
				result.url = "";
			}else if(name == "org.neworiental.rmp.base::TOEFLRecord"){
				//录音
				result.sourceMark = "0";
				result.testPointName = "";
				result.testPointID = "";
				result.subjectiveItem = "true";
				result.sourceMark = "0";
				result.rightAns = "[\"\"]";
				result.totalTime = "60";
			}else if(name == "org.neworiental.rmp.base::OptionGroup"){
				//选择题
				result.layoutMode = "0";
				result.isMult = "false";
				result.markLogic = "0";
				result.sourceMark = "1";
				result.isCenter = "false";
				result.testPointName = "";
				result.testPointID = "";
				result.subjectiveItem = "false";
				result.options = [{
						"horizentalCenter": "NaN",
						"className": "org.neworiental.rmp.base::BaseRichTxt",
						"verticalCenter": "NaN",
						"topDis": "NaN",
						"rightDis": "0",
						"ID": "",
						"htmlText": "选项",
						"leftDis": "30",
						"isNode": "false",
						"bottomDis": "NaN"
	                },{
						"horizentalCenter": "NaN",
						"className": "org.neworiental.rmp.base::BaseRichTxt",
						"verticalCenter": "NaN",
						"topDis": "NaN",
						"rightDis": "0",
						"ID": "",
						"htmlText": "选项",
						"leftDis": "30",
						"isNode": "false",
						"bottomDis": "NaN"
	                },{
						"horizentalCenter": "NaN",
						"className": "org.neworiental.rmp.base::BaseRichTxt",
						"verticalCenter": "NaN",
						"topDis": "NaN",
						"rightDis": "0",
						"ID": "",
						"htmlText": "选项",
						"leftDis": "30",
						"isNode": "false",
						"bottomDis": "NaN"
	                },{
						"horizentalCenter": "NaN",
						"className": "org.neworiental.rmp.base::BaseRichTxt",
						"verticalCenter": "NaN",
						"topDis": "NaN",
						"rightDis": "0",
						"ID": "",
						"htmlText": "选项",
						"leftDis": "30",
						"isNode": "false",
						"bottomDis": "NaN"
	                }
				];
			}else if(name == "write"){
				result.placeholder = "请在此输入...";
				result.minHeight = 200;
				result.showCount = true;
			}else if(name == "org.neworiental.rmp.base::TOEFLTimerViewer"){
				result.title = "No Title";
				result.time = "60";
				result.isCenter = "false";
			}else if(name == "tableselect"){
				result.rows = ["ClimateCharts", "Interviews with meteorologists", "Journals notes"];
				result.columns = ["Include report", "Not include in report"];
			}else if(name == "drag"){
				result.blanks = [{size: 2, description: ""}];
				result.options = [
					"Ecologists now think that the stability of an environment is a result of diversity rather than patchiness.",
					"Patchy environments that vary from place to place do not often have high species diversity.",
					"A patchy environment is thought to increase stability because it is able to support a wide variety of organisms."
				];
			}else if(name == "fillblank"){
				result.text = "<p style=\"text-align: center;\"><b>Title in this</b></p><p style=\"text-align: left;\">So muttered the White Rabbit just before<input class=\"fillblank_blank\" type=\"text\">he plunged into Wonderlan with Alic</p>";
			}else if(name == "audiotext"){
				result.points = [];
			}
			return result;
		},
		/**
		 * 添加
		 * @param {} subject
		 */
		add: function(subject, pageIndex, index){
			var elements = this.define.containers[pageIndex].contents;
			if(typeof index == "undefined" || index == -1 || index >= elements.length){
				//插入到最后
				elements.push(subject);
			}else{
				var newArray = [];
				for(var i = 0; i < elements.length; i++){
					if(i == index){
						newArray.push(subject);
					}
					newArray.push(elements[i]);
				}
				this.define.containers[pageIndex].contents = newArray;
			}
		},
		/**
		 * 更新题目定义
		 * @param {} subject
		 */
		update: function(subject){
			for(var pi = 0; pi < this.define.containers.length; pi++){
				var page = this.define.containers[pi];
				for(var i = 0; i < page.contents.length; i++){
					var sub = page.contents[i];
					if(sub.ID == subject.ID){
						page.contents[i] = subject;
					}
				}
			}
		},
		/**
		 * 删除形状
		 */
		remove: function(subjectId){
			for(var pi = 0; pi < this.define.containers.length; pi++){
				var page = this.define.containers[pi];
				for(var i = 0; i < page.contents.length; i++){
					var sub = page.contents[i];
					if(sub.ID == subjectId){
						page.contents.splice(i, 1);
						return;
					}
				}
			}
		},
		/**
		 * 通过ID获取图形
		 * @param {} id
		 * @return {}
		 */
		getById: function(id){
			for(var pi = 0; pi < this.define.containers.length; pi++){
				var page = this.define.containers[pi];
				for(var i = 0; i < page.contents.length; i++){
					var sub = page.contents[i];
					if(sub.ID == id){
						return sub;
					}
				}
			}
			return null;
		},
		/**
		 * 获取题目所属的contents节
		 * @param {} id
		 * @return {}
		 */
		getSubContainerIndex: function(id){
			for(var pi = 0; pi < this.define.containers.length; pi++){
				var page = this.define.containers[pi];
				if(page.contents){
					for(var i = 0; i < page.contents.length; i++){
						var sub = page.contents[i];
						if(sub.ID == id){
							return pi;
						}
					}
				}
			}
			return 0;
		},
		/**
		 * 通过className获取
		 * @param {} className
		 */
		getByClassName: function(className){
			var result = [];
			for(var pi = 0; pi < this.define.containers.length; pi++){
				var page = this.define.containers[pi];
				if(page.contents){
					for(var i = 0; i < page.contents.length; i++){
						var sub = page.contents[i];
						if(sub.className == className){
							result.push(sub);
						}
					}
				}
			}
			return result;
		}
	};
	
	/**
	 * 工具类
	 * @type {}
	 */
	this.utils = {
		/**
		 * 获取相对于某一元素的相对坐标
		 * @param {} pageX
		 * @param {} pageY
		 * @param {} related
		 * @return {}
		 */
		getRelativePos: function(pageX, pageY, related){
			var relatedOffset = related.offset();
			if(relatedOffset == null){
				relatedOffset = {left: 0, top: 0};
			}
			return {
				x: pageX - relatedOffset.left + related.scrollLeft(),
				y: pageY - relatedOffset.top + related.scrollTop()
			};
		},
		/**
		 * 创建一个唯一id
		 * @return {}
		 */
		newId: function(){
			var random = Math.random();
			var newId = (random + new Date().getTime());
			return newId.toString(16).replace(".", "");
		},
		/**
		 * 一个点是否在一个矩形中
		 */
		pointInRect: function(px, py, rect){
			if(px >= rect.x && px <= rect.x + rect.w
				&& py >= rect.y && py <= rect.y + rect.h){
				return true;
			}
			return false;
		},
		/**
		 * 从数组中删除一个元素
		 * @param {} array
		 * @param {} element
		 */
		removeFromArray: function(array, element){
			var index = array.indexOf(element);
			if(index >= 0){
				array.splice(index, 1);
			}
			return array;
		},
		/**
		 * 添加到数组，不重复
		 * @param {} array
		 * @param {} element
		 */
		addToSet: function(array, element){
			var index = array.indexOf(element);
			if(index < 0){
				array.push(element);
			}
			return array;
		},
		/**
		 * 合并两个数组
		 * @param {} arr1
		 * @param {} arr2
		 */
		mergeArray: function(arr1, arr2){
			for (var i = 0; i < arr2.length; i++) {
				var ele = arr2[i];
				if(arr1.indexOf(ele) < 0){
					arr1.push(ele);
				}
			}
			return arr1;
		},
		/**
		 * 复制一个对象
		 * @param {} obj
		 */
		copy: function(obj){
			return $.extend(true, {}, obj);
		},
		/**
		 * html转为文本
		 * @param {} html
		 */
		toText: function(html){
			var convertor = $("#text_convertor");
			if(convertor.length == 0){
				convertor = $("<div id='text_convertor' style='display:none'></div>").appendTo("body");
			}
			convertor.html(html);
			return convertor.text();
		},
		/**
		 * 格式化flash的html
		 * @param {} html
		 */
		formatHtml: function(html){
			var convertor = $("#text_convertor");
			if(convertor.length == 0){
				convertor = $("<div id='text_convertor' style='display:none'></div>").appendTo("body");
			}
			convertor.html(html);
			var flows = convertor.find("textflow");
			var formats = convertor.find("textformat");
			flows.css("display", "block");
			//格式化textflow
			flows.each(function(){
				var flow = $(this);
				if(flow.attr("paddingbottom")){
					flow.css("padding-bottom", flow.attr("paddingbottom") + "px");
				}
				if(flow.attr("paddingleft")){
					flow.css("padding-left", flow.attr("paddingleft") + "px");
				}
				if(flow.attr("paddingtop")){
					flow.css("padding-top", flow.attr("paddingtop") + "px");
				}
				if(flow.attr("paddingright")){
					flow.css("padding-right", flow.attr("paddingright") + "px");
				}
			});
			//格式化段落
			var paragraphs = convertor.find("p");
			paragraphs.each(function(){
				var p = $(this);
				if(p.attr("textalign")){
					p.css("text-align", p.attr("textalign"));
				}
				if(p.attr("textindent")){
					p.css("text-indent", p.attr("textindent") + "px");
				}
			});
			//格式化span
			var spans = convertor.find("span");
			spans.each(function(){
				var sp = $(this);
				if(sp.attr("color")){
					sp.css("color", sp.attr("color"));
				}
				if(sp.attr("fontfamily")){
					sp.css("font-family", sp.attr("fontfamily"));
				}
				if(sp.attr("fontstyle")){
					sp.css("font-style", sp.attr("fontstyle"));
				}
				if(sp.attr("fontweight")){
					sp.css("font-weight", sp.attr("fontweight"));
				}
				if(sp.attr("textdecoration")){
					sp.css("text-decoration", sp.attr("textdecoration"));
				}
				if(sp.attr("fontsize")){
					sp.css("font-size", sp.attr("fontsize") + "px");
				}
			});
			//格式化font
			var fonts = convertor.find("font");
			fonts.each(function(){
				var font = $(this);
				if(font.attr("size")){
					font.css("font-size", font.attr("size") + "px");
				}
				if(font.attr("face")){
					font.css("font-family", font.attr("face"));
				}
			});
			//格式化标记
			var tags = convertor.find("img[source]");
			//source示例：org.neworiental.rmp.base.tlf.tab::CommentTab*^*47C2CABF-C4CC-3935-2280-6369BBE3072A*^*0*^*null
			tags.each(function(){
				var tag = $(this);
				var source = tag.attr("source");
				if(source.indexOf("org.neworiental.rmp.base.tlf.tab::CommentTab") >= 0){
					//箭头
					tag.after('<input class="richtext_arrow" readonly="readonly">');
				}else if(source.indexOf("org.neworiental.rmp.base.tlf.tab::ToelfInsertTab") >= 0){
					//方框
					tag.after('<input class="richtext_rect" readonly="readonly">');
				}else if(source.indexOf("org.neworiental.rmp.base.tlf.tab::HeadSetTab") >= 0){
					//方框
					tag.after('<input class="richtext_headset" readonly="readonly">');
				}
			});
			return convertor.html();
		}
	};
	
	this.initialize.apply(this, arguments);

/********************定义结束*************************/

}


