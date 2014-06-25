
define(['./common','jquery_qeditor'
//define(['./common'
],
function($, $qEdit) {

    /**
     * 设计器对象
     * @returns
     */
    return function Designer(){
        var Des = this;
        /**
         * 定义设计器的属性
         */
        /**
         * 设计器配置
         */
        this.config = {
            target: null, //目标元素，设计器会在此元素上进行构建
            status: "template" //状态，编辑模板、编辑题目、只读 template|subject|readonly
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
                                var elements = Des.model.define.pages[pageIndex].elements;
                                for(var ei = 0; ei < elements.length; ei++){
                                    var sub = elements[ei];
                                    var subBox = Des.config.target.find(".subject_box#" + sub.id);
                                    if(ei == 0 && relY <= sub.top){
                                        //第一个元素，并且在元素上方
                                        subIndex = ei;
                                        break;
                                    }
                                    if(ei < elements.length - 1){
                                        var subTop = subBox.position().top + sub.top;
                                        var next = elements[ei + 1];
                                        var subBottom = subTop + subBox.height() + next.top;
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
                                var subTop = Des.model.define.pages[pageIndex].elements[subIndex].top;
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
                                created.pageIndex = pageIndex;
                                Des.model.add(created, subIndex);
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
                            sub.left-=5;
                            if(sub.left < 0){
                                sub.left = 0;
                            }
                        }else if(e.keyCode == 39){
                            //右
                            sub.left+=5;
                            if(sub.left > 100){
                                sub.left = 100;
                            }
                        }else if(e.keyCode == 38){
                            //上
                            sub.top-=5;
                            if(sub.top < 0){
                                sub.top = 0;
                            }
                        }else if(e.keyCode == 40){
                            //下
                            sub.top+=5;
			    if(sub.top > 200){
			       sub.top = 200;
                            }
                        }
                        Des.renderSubject(sub);
                        $(".position_tip").remove();
                        var tip = $("<div class='position_tip'></div>").appendTo(selected.parent());
                        tip.text("左边距：" + sub.left + " 上边距：" + sub.top);
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
                    var name = sub.name;
                    var operate = $("<div class='subject_operate'></div>").appendTo($(this));
                    if(name == "text"){
					var btn = $("<div class='tpbtn subject_op_btn'>编辑</div>").appendTo(operate);
                        //绑定编辑
                        btn.bind("click", function(){
                            $(".editor_toolbar").children(".insert_rect").hide();
                            $(".editor_toolbar").children(".insert_arrow").hide();
                            $(".editor_toolbar").children(".insert_blank").hide();
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
                    }else if(name == "richtext"){
                        var btn = $("<div class='tpbtn subject_op_btn'>编辑</div>").appendTo(operate);
                        //绑定编辑
                        btn.bind("click", function(){
                            $(".editor_toolbar").children(".insert_rect").show();
                            $(".editor_toolbar").children(".insert_arrow").show();
                            $(".editor_toolbar").children(".insert_blank").hide();
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
                    }
                    /*图片上传 author: yangtiansheng*/
                    else if(name == "image"){//编辑图片
                        operate.append("<div class='tpbtn subject_op_btn'>编辑</div><input type='checkbox' class='chk'/>是否居中");
                        var chk = operate.find("input");
                        if(sub.center){
                            chk.attr("checked", true);
                        }
                        //绑定居中
                        chk.bind("click", function(){
                            var center = $(this).is(":checked");
                            sub.center = center;
                            Des.renderSubject(sub);
                            Des.model.update(sub);
                        });
                        function resetForm(){
                            $("#res_form_add_img")[0].reset();
                            $('#img_url').attr('src','');
                        }
                        //执行图片上传
                        $("#res_form_add_img").find("input").unbind().bind("change", function(){
                            $("#res_form_add_img").submitForm({
                                success: function(data){
                                    if(data != "errImg"){
                                        $('.show_img').show();
                                        $('#img_url').attr('src',data);
                                    }else{
                                        alert("不支持此图片格式");
                                    }
                                }
                            });
                        });
                        //绑定编辑
                        var btn = operate.find(".subject_op_btn");
                        btn.bind("click", function(){
                            $("#dlg_template_img").dlg();
                            resetForm();
                            $('.show_img').hide();
                        });
                        //绑定保存编辑
                        $("#btn_save_img").unbind().bind("click", function(){
                            var img_src = $('#img_url').attr('src');
                            var  subject_box= $(Des.config.target.on('.subject_box'));
                            if(img_src){
                                var canvasWidth = subject_box.find('.subject_canvas').width();
                                sub.src = img_src;
                                Des.renderSubject(sub);
                                subject_box.find('img').css('max-width',canvasWidth +'px');
                                Des.model.update(sub);
                                $("#dlg_template_img").dlg("close");
                            }else{
                                $("#dlg_template_img").dlg("close");
                            }
                        });
                    }
                    /*--END 图片上传*/
                    //编辑音频
                    else if(name == "audio"){
                        operate.append("<div class='tpbtn subject_op_btn'>编辑</div><input type='checkbox' class='chk'/>是否居中");
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
                        function resetForm(){
                            $('#res_form_add_audio')[0].reset();
                            $('.audio_upload_src').attr('src','');
                        }
                        //执行音频上传
                        $("#res_form_add_audio").find("input").unbind().bind("change", function(){
                            $("#res_form_add_audio").submitForm({
                                success: function(data){
                                    if(data != "errAudio"){
                                        $('.show_upload_audio').show();
                                        $('.audio_upload_src').attr('src',data);
                                    }else{
                                        alert("不支持此音频格式");
                                    }
                                }
                            });
                        });
                        //绑定编辑
                        var btn = operate.find(".subject_op_btn");
                        btn.bind("click", function(){
                            $("#dlg_template_audio").dlg();
                            $('.show_upload_audio').hide();
                            resetForm();
                        });
                        //绑定保存编辑
                        $("#btn_save_audio").unbind().bind("click", function(){
                            var audio_src = $('.audio_upload_src').attr('src');
                            if(audio_src){
                                sub.src = audio_src;
                                Des.renderSubject(sub);
                                Des.model.update(sub);
                                resetForm();
                                $("#dlg_template_audio").dlg("close");
                            }else{
                                $("#dlg_template_audio").dlg("close");
                            }
                        });
                    }
                    /*---END   编辑音频 ---*/
                    /*-- author: yangtiansheng --END*/
                    else if(name == "timer"){
                        operate.append("<div class='tpbtn subject_op_btn'>编辑</div><input type='checkbox' class='chk'/>是否居中");
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
                            $("#dlg_edit_timer").dlg();
                            $("#edit_timer_title").val(sub.title).focus();
                            $("#edit_timer_time").val(sub.time);
                            //绑定保存编辑
                            $("#btn_save_timer_edit").unbind().bind("click", function(){
                                sub.title = $("#edit_timer_title").val();
                                var time = parseInt($("#edit_timer_time").val());
                                if(time){
                                    sub.time = time;
                                }
                                Des.renderSubject(sub);
                                $("#dlg_edit_timer").dlg("close");
                                Des.model.update(sub);
                            });
                        });
                    }else if(name == "record"){
                        operate.append("<div class='tpbtn subject_op_btn'>编辑</div><input type='checkbox' class='chk'/>是否居中");
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
                            $("#dlg_edit_record").dlg();
                            $("#edit_record_time").val(sub.time);
                            //绑定保存编辑
                            $("#btn_save_record_edit").unbind().bind("click", function(){
                                var time = parseInt($("#edit_record_time").val());
                                if(time){
                                    sub.time = time;
                                }
                                Des.renderSubject(sub);
                                $("#dlg_edit_record").dlg("close");
                                Des.model.update(sub);
                            });
                        });
                    }else if(name == "write") {
                        var btn = $("<div class='tpbtn subject_op_btn'>编辑</div>").appendTo(operate);
                        //绑定编辑
                        btn.bind("click", function () {
                            $("#dlg_edit_write").dlg();
                            $("#edit_write_placeholder").val(sub.placeholder);
                            $("#edit_write_h").val(sub.minHeight);
                            if (sub.showCount) {
                                $("#edit_write_count").attr("checked", true);
                            } else {
                                $("#edit_write_count").attr("checked", false);
                            }
                            //绑定保存编辑
                            $("#btn_save_write_edit").unbind().bind("click", function () {
                                sub.placeholder = $("#edit_write_placeholder").val();
                                var minH = parseInt($("#edit_write_h").val());
                                if (minH) {
                                    sub.minHeight = minH;
                                }
                                sub.showCount = $("#edit_write_count").is(":checked");
                                Des.renderSubject(sub);
                                $("#dlg_edit_write").dlg("close");
                                Des.model.update(sub);
                            });
                        });
                    }
                    else if(name == "select"){   //选项
                        //默认选中
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
                            var text = "";
                            if(sub.options){
                                for(var i = 0; i < sub.options.length; i++){
                                    if(i != 0){
                                        text += "\n";
                                    }
                                    text += sub.options[i];
                                }
                            }
                            $("#dlg_edit_select").dlg();
                            $("#edit_select_text").val(text).focus();
                            if(sub.multi){
                                $("#edit_select_multi").attr("checked", true);
                            }else{
                                $("#edit_select_multi").attr("checked", false);
                            }
                            //绑定保存编辑
                            $("#btn_save_select_edit").unbind().bind("click", function(){
                                sub.options = $("#edit_select_text").val().split("\n");
                                sub.multi = $("#edit_select_multi").is(":checked");
                                Des.renderSubject(sub);
                                $("#dlg_edit_select").dlg("close");
                                Des.model.update(sub);
                            });
                        });
                    }
                    else if(name == "tableselect"){
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
                                sub.rows = rows;
                                Des.renderSubject(sub);
                                $("#dlg_edit_table").dlg("close");
                                Des.model.update(sub);
                            });
                        });
                    }
                    else if(name == "audiotext") {
                        operate.append("<div class='tpbtn subject_op_btn'>编辑</div><div class='subject_op_chk'><input type='checkbox' class='chk'/>是否居中</div>");
                        var chk = operate.find("input");
                        if (sub.center) {
                            chk.attr("checked", true);
                        }
                        //绑定居中
                        chk.bind("click", function () {
                            var center = $(this).is(":checked");
                            var sub = Des.model.getById(id);
                            sub.center = center;
                            Des.renderSubject(sub);
                            Des.model.update(sub);
                        });
                        //绑定编辑
                        var btn = operate.find(".subject_op_btn");
                        btn.bind("click", function () {
                            $("#audiotext_points").empty();
                            $("#dlg_edit_audiotext").dlg({modal: false});
                            var player = document.getElementById("audiotext_edit_player");
                            //添加时间点
                            function addPoint(point, duration) {
                                var item = $("<div></div>").appendTo("#audiotext_points");
                                //计算X坐标
                                var max = 207;
                                var x = Math.floor(point.time / duration * max);
                                item.css("left", x);
                                if (point.type == "text") {
                                    item.attr("title", point.text);
                                }
                                if (point.type == "end") {
                                    item.addClass("point_type_end");
                                } else {
                                    item.addClass("image_dropable point_type_normal");
                                }
                                item.data("props", point);
                                //绑定双击删除
                                $("#audiotext_points").children("div").unbind("dblclick").bind("dblclick", function (e) {
                                    if (confirm("确定删除该锚点？")) {
                                        $(this).remove();
                                    }
                                });
                                //绑定鼠标悬浮时显示
                                $("#audiotext_points").children(".point_type_normal").unbind("mouseenter").bind("mouseenter", function (e) {
                                    var target = $(this);
                                    var tip = $("#autiotext_point_tip");
                                    if (tip.length == 0) {
                                        tip = $("<div id='autiotext_point_tip'></div>").appendTo("body");
                                    }
                                    tip.empty();
                                    var data = target.data("props");
                                    if (data.image) {
                                        tip.append("<img src='" + data.image + "'/>");
                                    }
                                    tip.append("<div>" + data.text + "</div>");
                                    tip.show().css({
                                        left: target.offset().left,
                                        top: target.offset().top + 20
                                    });
                                });
                                $("#audiotext_points").children(".point_type_normal").unbind("mouseleave").bind("mouseleave", function (e) {
                                    $("#autiotext_point_tip").hide();
                                });
                                $("#audiotext_points").children("div").unbind("mousedown").bind("mousedown", function (e) {
                                    var current = $(this);
                                    //绑定拖动
                                    var pointOffset = e.pageX - current.offset().left;
                                    $(document).bind("mousemove", function (moveE) {
                                        var lineOffset = moveE.pageX - $("#audiotext_points").offset().left;
                                        var newLeft = lineOffset - pointOffset;
                                        if (newLeft < 0) {
                                            newLeft = 0;
                                        } else if (newLeft > max) {
                                            newLeft = max;
                                        }
                                        current.css("left", newLeft);
                                    });
                                    $(document).bind("mouseup", function (moveE) {
                                        $(document).unbind("mouseup");
                                        $(document).unbind("mousemove");
                                        var pos = current.position().left;
                                        var time = Math.floor(pos / max * duration);
                                        var point = current.data("props");
                                        point.time = time;
                                    });
                                });
                            }

                            if (sub.src) {
                                var points = sub.points;
                                if (!points) {
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
                            $("#audiotext_text_btn").unbind().bind("click", function () {
                                if (!$("#audiotext_edit_player").attr("src")) {
                                    alert("音频尚未加载，请先从资源栏中添加音频");
                                    return;
                                }
                                if (!player.duration) {
                                    alert("音频正在加载中，请稍候操作");
                                    return;
                                }
                                var text = $("#audiotext_text").val();
                                if (text == "") {
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
                            $("#audiotext_add_endpoint").unbind().bind("click", function () {
                                if (!$("#audiotext_edit_player").attr("src")) {
                                    alert("音频尚未加载，请先从资源栏中添加音频");
                                    return;
                                }
                                if (!player.duration) {
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
                            $("#btn_save_audiotext_edit").unbind().bind("click", function () {
                                var points = [];
                                $("#audiotext_points").children("div").each(function () {
                                    var point = $(this).data("props");
                                    points.push(point);
                                });
                                sub.points = points;
                                sub.src = $("#audiotext_edit_player").attr("src");
                                if (player.duration && player.duration != sub.duration) {
                                    sub.duration = Math.floor(player.duration);
                                }
                                Des.renderSubject(sub);
                                $("#dlg_edit_audiotext").dlg("close");
                                Des.model.update(sub);
                                $("#audiotext_edit_player").attr("src", "");
                            });
                        });
                    }

//                    if(sub.resource){
//                        var deleteBtn = $("<div class='subject_op_btn'>删除</div>").prependTo(operate);
//                        //绑定删除
//                        deleteBtn.bind("click", function(){
//                            box.remove();
//                            Des.model.remove(id);
//                        });
//                    }
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
			subjectBox = this.config.target.find(".subject_box#" + subject.id);
		}
		if(subjectBox.length == 0){
			if(creating){
				subjectBox = $("<div class='subject_box subject_creating'><div class='subject_canvas'></div></div>").appendTo(this.config.target);
			}else{
				var target = this.config.target.find(".designer_canvas:eq("+subject.pageIndex+")");
				var elements = this.model.define.pages[subject.pageIndex].elements;
				var boxHtml = "<div class='subject_box' id='" + subject.id + "'><div class='subject_canvas'></div></div>";
				if(typeof index == "undefined" || index == -1 || index >= elements.length){
					subjectBox = $(boxHtml).appendTo(target);
				}else{
					//定义了位置，执行插入
					if(index == 0){
						subjectBox = $(boxHtml).prependTo(target);
					}else{
						target.children(".subject_box:eq("+(index - 1)+")").after(boxHtml);
						subjectBox = target.find(".subject_box#" + subject.id);
					}
				}
			}
		}
		var canvas = subjectBox.children(".subject_canvas");
		if(this.config.status == "readonly" || this.config.status == "test"){
			//测试状态、只读状态下，悬浮不变颜色
			canvas.addClass("subject_canvas_readonly");
		}
		if(subject.name == "text"){
			canvas.html(subject.text);
		}else if(subject.name == "richtext"){
			canvas.html(subject.text);
		}else if(subject.name == "image"){
			if(canvas.children("img").length == 0 || canvas.children("img").attr("src") != subject.src){
				//不重复绘制
				canvas.html("<img src='" + subject.src + "'/>");
			}
			if(subject.center){
				canvas.css("text-align", "center");
			}else{
				canvas.css("text-align", "left");
			}
		}else if(subject.name == "audio"){
			canvas.html("<audio controls='controls'></audio>");
			if(subject.src){
				canvas.children("audio").attr("src", subject.src);
			}
			if(subject.center){
				canvas.css("text-align", "center");
			}else{
				canvas.css("text-align", "left");
			}
		}else if(subject.name == "video"){
			canvas.html("<video controls='controls'></video>");
			canvas.children("video").attr({
				width: subject.width + "px",
				height: subject.height + "px"
			});
			if(subject.src){
				canvas.children("video").attr("src", subject.src);
			}
			if(subject.center){
				canvas.css("text-align", "center");
			}else{
				canvas.css("text-align", "left");
			}
		}else if(subject.name == "record"){
			var html = "<div class='subject_record'><div class='record_title'>Recording...</div><div class='record_time'></div><div class='record_progress'></div></div>";
			canvas.html(html);
			var minutes = Math.floor(subject.time / 60);
			if(minutes < 10){
				minutes = "0" + minutes;
			}
			var seconds = subject.time % 60;
			if(seconds < 10){
				seconds = "0" + seconds;
			}
			canvas.find(".record_time").text(minutes + ":" +seconds);
			if(subject.center){
				canvas.css("text-align", "center");
			}else{
				canvas.css("text-align", "left");
			}
		}else if(subject.name == "select"){
			canvas.empty();
			var list = $("<ul class='subject_select_list'></ul>").appendTo(canvas);
			var control;
			if(subject.multi){
				control = "<input type='checkbox' name='subject_select_radio' class='chk'/>";
			}else{
				control = "<input type='radio' name='subject_select_radio' class='chk'/>";
			}
			if(subject.options){
				for(var i = 0; i < subject.options.length; i++){
					var item = $("<li>" + control + "<span>" + subject.options[i] +"</span></li>").appendTo(list);
					var chk = item.children("input");
					chk.attr("ind", i);
					if(Des.config.status == "subject" && subject.rightAnswer){
						//如果是题目编辑状态，显示正确答案
						if(subject.rightAnswer.indexOf(i) >= 0){
							chk.prop("checked", true);
						}
					}
				}
			}
			if(subject.center){
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
		}else if(subject.name == "write"){
			canvas.empty();
			var editBox = $("<div class='subject_write_text'><textarea></textarea></div>").appendTo(canvas);
			var textBox = editBox.children("textarea");
			textBox.css("min-height", subject.minHeight + "px");
			textBox.attr("placeholder", subject.placeholder);
			if(subject.showCount){
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
				if(sub && sub.showCount){
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
		}else if(subject.name == "timer"){
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
			if(subject.center){
				canvas.css("text-align", "center");
			}else{
				canvas.css("text-align", "left");
			}
		}else if(subject.name == "tableselect"){
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
			if(subject.center){
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
		}else if(subject.name == "drag"){
			canvas.empty();
			var blankIndex = 0;
			for(var i = 0; i < subject.blanks.length; i++){
				//添加题空
				var blankBox = $("<div></div>").appendTo(canvas);
				if(i != 0){
					blankBox.css("padding-top", "20px");
				}
				var blank = subject.blanks[i];
				if(blank.description){
					blankBox.append("<div>"+blank.description+"</div>");
				}
				var bi = 0;
				while(bi < blank.size){
					var blankItem = $("<div class='subjectdrag_blank'></div>").appendTo(blankBox);
					if(Des.config.status == "subject" && subject.rightAnswer){
						//如果是题目编辑状态，显示正确答案状态
						var answerInd = subject.rightAnswer[blankIndex];
						if(answerInd >= 0){
							blankItem.html(subject.options[answerInd]);
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
						canvas.append("<div class='subjectdrag_option' ind='"+i+"'>"+subject.options[i]+"</div>");
					}
				}else{
					canvas.append("<div class='subjectdrag_option' ind='"+i+"'>"+subject.options[i]+"</div>");
				}
			}
			if(Des.config.status == "subject"){
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
							if(Des.config.status == "subject"){
								//如果是题目编辑状态，设置正确答案
								var answers = [];
								canvas.find(".subjectdrag_blank").each(function(){
									var an = -1;
									if($(this).attr("an")){
										an = parseInt($(this).attr("an"));
									}
									answers.push(an);
								});
								subject.rightAnswer = answers;
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
		}else if(subject.name == "record_test"){
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
			if(subject.center){
				canvas.css("text-align", "center");
			}else{
				canvas.css("text-align", "left");
			}
		}else if(subject.name == "audiotext"){
			canvas.html("<div class='subject_audiotext'><div class='subject_audiotext_progress'></div></div>");
			if(this.config.status == "template" || this.config.status == "subject"){
				canvas.children().append("<div class='subject_audiotext_tip'>编辑模式不能播放，可预览查看...</div>")
			}
			if(subject.center){
				canvas.css("text-align", "center");
			}else{
				canvas.css("text-align", "left");
			}
		}else if(subject.name == "fillblank"){
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
				"margin-left": subject.left,
				"margin-top": subject.top
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
		if(define.pages.length == 1){
			target.append("<div class='subject_page'><div class='designer_canvas' pindex='0'></div></div>");
		}else{
			var page1 = $("<div class='subject_page'><div class='designer_canvas' pindex='0'></div></div>").appendTo(target);
			var page2 = $("<div class='subject_page'><div class='designer_canvas' pindex='1'></div></div>").appendTo(target);
			if(define.type == "additional"){
				//附加页
				page2.hide();
			}else{
				//两栏
				page1.css({"float": "left", "width": "50%"});
				page2.css({"float": "left", "width": "50%"});
			}
		}
		for(var pi = 0; pi < define.pages.length; pi++){
			var page = define.pages[pi];
			for(var i = 0; i < page.elements.length; i++){
				var sub = page.elements[i];
				this.renderSubject(sub);
			}
		}
		if(this.config.status == "template"){
			if(define.type == "additional"){
				$("#template_addition_area").show();
			}else{
				$("#template_addition_area").hide();
			}
		}else if(this.config.status == "subject"){
			if(define.type == "additional"){
				$("#sub_addition_area").show();
			}else{
				$("#sub_addition_area").hide();
			}
			//设置题目编辑时，头部的属性
			//设置是否是说明页
			if(define.explain){
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
			var turning = "normal";
			if(define.turning){
				turning = define.turning;
			}
			var text = $("#menu_turning").children("li[ty="+turning+"]").text();
			$("#btn_turning_select").text(text);
			//背景音乐
			$(".bgaudio_player").attr("src", define.bgAudio);
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
                    pages:[{
                        elements: []
                    },{
                        elements: []
                    }]
                },
                /**
                 * 创建图形
                 * @param {} name
                 */
                create: function(name){
                    var result = {
                        id: Des.utils.newId(),
                        name: name,
                        left: 40,
                        top: 20
                    };
                    if(name == "text"){
                        result.text = "在此输入普通文本";
                    }else if(name == "richtext"){
                        result.text = "在此输入富文本";
                    }else if(name == "image"){
                        result.src = "web/img/template/img.png";
                    }else if(name == "video"){
                        result.width = 400;
                        result.height = 400;
                    }else if(name == "record"){
                        result.time = 60;
                            }else if(name == "select"){
                                result.options = ["选项", "选项", "选项", "选项"];
                                result.multi = false;
                    }else if(name == "write"){
                        result.placeholder = "请在此输入...";
                        result.minHeight = 200;
                        result.showCount = true;
                    }else if(name == "timer"){
                        result.title = "No Title";
                        result.time = 60;
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
                    }else if(name == "fillblank") {
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
                add: function(subject, index){
                    var elements = this.define.pages[subject.pageIndex].elements;
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
                        this.define.pages[subject.pageIndex].elements = newArray;
                    }
                },
                /**
                 * 更新题目定义
                 * @param {} subject
                 */
                update: function(subject){
                    for(var pi = 0; pi < this.define.pages.length; pi++){
                        var page = this.define.pages[pi];
                        for(var i = 0; i < page.elements.length; i++){
                            var sub = page.elements[i];
                            if(sub.id == subject.id){
                                page.elements[i] = subject;
                            }
                        }
                    }
                },
                /**
                 * 删除形状
                 */
                remove: function(subjectId){
                    for(var pi = 0; pi < this.define.pages.length; pi++){
                        var page = this.define.pages[pi];
                        for(var i = 0; i < page.elements.length; i++){
                            var sub = page.elements[i];
                            if(sub.id == subjectId){
                                page.elements.splice(i, 1);
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
                    for(var pi = 0; pi < this.define.pages.length; pi++){
                        var page = this.define.pages[pi];
                        for(var i = 0; i < page.elements.length; i++){
                            var sub = page.elements[i];
                            if(sub.id == id){
                                return sub;
                            }
                        }
                    }
                    return null;
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
            }
        };

        this.initialize.apply(this, arguments);

        /********************定义结束*************************/

    }

});



