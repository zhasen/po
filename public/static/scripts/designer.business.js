var subjectDes;var templateDes;var previewDes;$(function(){subjectDes=new Designer({target:$(".subject_canvas_container"),status:"subject"});var g='{"horizentalCenter":"NaN","time":"0","className":"org.neworiental.rmp.base::Group","verticalCenter":"NaN","rightDis":"NaN","version":"3.0","isNode":"false","url":"","topDis":"NaN","isExplain":"false","ID":"14719d1f466c02","slidingType":"normal_mode","leftDis":"NaN","bottomDis":"NaN","containers":[{"horizentalCenter":"NaN","className":"org.neworiental.rmp.base::BaseContainer","verticalCenter":"NaN","topDis":"NaN","rightDis":"NaN","ID":"14719d1f466acc","leftDis":"NaN","isNode":"false","bottomDis":"NaN","contents":[{"ID":"14719d1f8cb3e1","className":"drag","horizentalCenter":"NaN","verticalCenter":"NaN","topDis":"20","rightDis":"20","leftDis":"40","bottomDis":"0","isNode":"false","blanks":[{"size":2,"description":""}],"options":["Ecologists now think that the stability of an environment is a result of diversity rather than patchiness.","Patchy environments that vary from place to place do not often have high species diversity.","A patchy environment is thought to increase stability because it is able to support a wide variety of organisms."]}]}]}';subjectDes.open(g);templateDes=new Designer({target:$("#template_designer"),status:"template"});previewDes=new Designer({target:$("#preview_designer"),status:"testing"});$("#txt_edit_text").qeditor();$(window).bind("resize",function(){resizeView()});resizeView();function f(){$("#left_subjects").empty();for(var m=0;m<subjectList.length;m++){var o=subjectList[m];var p=$('<div ind="'+m+'" class="subject_list_box"><div class="ico sub_remove"></div><div class="subject_list_container"><div class="item_thumb"></div></div></div>').appendTo("#left_subjects");var q=p.find(".item_thumb");q.css({width:"1000px",height:"800px","-webkit-transform":"translate(10px, 10px) scale(0.1, 0.1)",transform:"translate(-450px, -360px) scale(0.1, 0.1)"});var n=new Designer({target:q,status:"readonly"});n.open(o)}$("#left_subjects").children().unbind().bind("click",function(){var s=$(this);var r=parseInt(s.attr("ind"));h(r)});$("#left_subjects").find(".sub_remove").unbind().bind("click",function(){var t=$(this).parent();var s=parseInt(t.attr("ind"));var r=0;if(subjectList.length==1){alert("至少要保留一页！");return}if(confirm("确定要删除此页吗？ ")){if(s==subjectList.length-1){r=subjectList.length-2}else{r=s}subjectList.splice(s,1);f();h(r)}})}function h(m){$("#left_subjects").children().removeClass("selected");var o=$("#left_subjects").children(":eq("+m+")");o.addClass("selected");var n=subjectList[m];subjectDes.open(n);resizeView()}function e(){if(systemTemplates==null){$.ajax({url:"design-stander-list",type:"get",dataType:"json",data:{userId:""},success:function(m){systemTemplates=m;i()}})}else{i()}if(userTemplates==null){$.ajax({url:"design-list",type:"get",dataType:"json",data:{userId:""},success:function(o){for(var n=0;n<o.length;n++){var m=o[n];if(typeof m.define=="string"){m.define=JSON.parse(m.define)}}userTemplates=o;c()}})}else{c()}$("#dlg_template").find(".dialog_content").css("height",$(window).height()-240);$("#dlg_template").dlg()}function i(){a($(".system_templates"),systemTemplates)}function c(){a($(".user_templates"),userTemplates)}function a(m,p){m.empty();for(var o=0;o<p.length;o++){var n=p[o];var r=$('<div class="item" id="'+n.id+'"><div class="item_box"><div class="item_thumb"></div></div><span>'+n.title+"</span></div>").appendTo(m);var s=r.find(".item_thumb");s.css({width:"1000px",height:"800px",transform:"translate(-450px, -360px) scale(0.1, 0.1)"});var q=new Designer({target:s,status:"readonly"});q.open(n.define)}}function b(){$("#dlg_template").dlg("close")}$("#add_subject").bind("click",function(){e()});$(".template_items").on("click",".item",function(){$(".template_items").find(".selected").removeClass("selected");var m=$(this);m.addClass("selected")});$("#btn_tem_select").bind("click",function(){var o=$(".template_items").find(".selected");if(o.length==0){return}var n;var q=o.attr("id");if(o.parent().hasClass("user_templates")){n=l(q)}else{n=k(q)}var p=subjectDes.utils.copy(n.define);var m=p;b();subjectList.push(m);f();h(subjectList.length-1);$("#left_subjects").scrollTop(99999)});var j=null;$(".edit_template_btns").children("span:eq(0)").bind("click",function(n){j=null;b();var m=$("input[name=add_tem_type]:checked").val();$("#subject_designer").hide();if(m=="single"){templateDes.open({horizentalCenter:"NaN",time:"0",className:"org.neworiental.rmp.base::Group",verticalCenter:"NaN",rightDis:"NaN",version:"3.0",isNode:"false",url:"",topDis:"NaN",isExplain:"false",ID:templateDes.utils.newId(),slidingType:"normal_mode",leftDis:"NaN",bottomDis:"NaN",containers:[{horizentalCenter:"NaN",className:"org.neworiental.rmp.base::BaseContainer",verticalCenter:"NaN",topDis:"NaN",rightDis:"NaN",ID:templateDes.utils.newId(),leftDis:"NaN",isNode:"false",bottomDis:"NaN",contents:[]}]})}else{templateDes.open({horizentalCenter:"NaN",time:"0",className:"org.neworiental.rmp.base::Group",verticalCenter:"NaN",rightDis:"NaN",version:"3.0",isNode:"false",url:"",topDis:"NaN",isExplain:"false",ID:templateDes.utils.newId(),slidingType:"normal_mode",leftDis:"NaN",bottomDis:"NaN",containers:[{horizentalCenter:"NaN",className:"org.neworiental.rmp.base::BaseContainer",verticalCenter:"NaN",topDis:"NaN",rightDis:"NaN",ID:templateDes.utils.newId(),leftDis:"NaN",isNode:"false",bottomDis:"NaN",contents:[]},{horizentalCenter:"NaN",className:"org.neworiental.rmp.base::BaseContainer",verticalCenter:"NaN",topDis:"NaN",rightDis:"NaN",ID:templateDes.utils.newId(),leftDis:"NaN",isNode:"false",bottomDis:"NaN",contents:[]}]})}$("#template_designer").show();$("#template_edit_title").val("");resizeView()});function l(o){for(var n=0;n<userTemplates.length;n++){var m=userTemplates[n];if(m.id==o){return m}}}function k(o){for(var n=0;n<systemTemplates.length;n++){var m=systemTemplates[n];if(m.id==o){return m}}}$(".edit_template_btns").children("span:eq(1)").bind("click",function(o){var n=$(".user_templates").find(".selected");if(n.length==0){alert("请选择一个模版进行编辑~");return}j=n.attr("id");var m=l(j);$("#subject_designer").hide();var p=templateDes.utils.copy(m.define);templateDes.open(p);$("#template_designer").show();$("#template_edit_title").val(m.title);resizeView();b()});$(".edit_template_btns").children("span:eq(2)").bind("click",function(n){var m=$(".user_templates").find(".selected");if(m.length==0){alert("请选择一个自定义模版进行删除~");return}function o(){var p=confirm("确定要删除此模版？");if(p==true){var q=m.attr("id");$.ajax({url:"design-delete",type:"post",dataType:"json",data:{id:q},success:function(t){for(var s=0;s<userTemplates.length;s++){var r=userTemplates[s];if(r.id==q){userTemplates.splice(s,1);break}}c()}})}else{}}o()});$("#btn_save_template").bind("click",function(){var m=$("#template_edit_title").val();if(m==""){$("#template_edit_title").focus();return}$.ajax({url:"design-addorupdate",type:"post",dataType:"json",data:{id:j,title:m,define:JSON.stringify(templateDes.model.define)},success:function(r){var q={id:r.id,title:m,define:templateDes.model.define};var n=null;for(var o=0;o<userTemplates.length;o++){var p=userTemplates[o];if(p.id==r.id){n=p;break}}if(n==null){userTemplates.push(q)}else{n.title=q.title;n.define=q.define}$("#btn_cancel_template").trigger("click")}})});$("#btn_cancel_template").bind("click",function(){$("#template_designer").hide();$("#subject_designer").show();e();resizeView()});$("#chk_tem_additional").bind("click",function(){if($(this).is(":checked")){templateDes.toggleAdditional(true)}else{templateDes.toggleAdditional(false)}});$("#chk_sub_additional").bind("click",function(){if($(this).is(":checked")){subjectDes.toggleAdditional(true)}else{subjectDes.toggleAdditional(false)}});$("#chk_des_page").bind("click",function(){var m=$(this).is(":checked");subjectDes.model.define.explain=m});$("#input_page_time").bind("blur",function(){var n=$(this).val();var m="";if(n.trim()!=""){m=parseInt(n)}if(!m){m=""}subjectDes.model.define.time=m});$("#btn_turning_select").bind("click",function(){var m=$(this);$("#menu_turning").dropmenu({target:m,onSelect:function(o){var n=o.attr("ty");subjectDes.model.define.turning=n;$("#btn_turning_select").text(o.text())}})});$("#resource_switch").bind("click",function(){$(this).toggleClass("opened");if($(this).hasClass("opened")){$("#resource_panel").css("right","0px");$("#resource_panel").css("box-shadow","-3px 0px 5px rgba(0,0,0,0.4)")}else{$("#resource_panel").css("right","-200px");$("#resource_panel").css("box-shadow","none")}});$(".resource_header").bind("click",function(){$(".resource_current").removeClass("resource_current");$(this).parent().addClass("resource_current")});$(".resource_header:eq(0)").trigger("click");$("#resource_add_text").bind("click",function(){$("#dlg_res_text_type").dlg()});$("#btn_save_res_text_type").bind("click",function(){var m=$("input[name=res_text_type]:checked").val();$(".editor_toolbar").children(".insert_blank").hide();if(m=="text"){$(".editor_toolbar").children(".insert_rect").hide();$(".editor_toolbar").children(".insert_arrow").hide()}else{$(".editor_toolbar").children(".insert_rect").show();$(".editor_toolbar").children(".insert_arrow").show()}$("#txt_edit_text").qeditor("setValue","");$("#dlg_res_text_type").dlg("close");$("#dlg_edit_text").dlg();$("#btn_save_text").unbind().bind("click",function(){var o=$("#txt_edit_text").val();var n={name:m,text:o};addResource(n);$("#dlg_edit_text").dlg("close")})});function d(){$(".res_upload").unbind().bind("change",function(){var n=$(this).parent();var m=n.attr("n");var p=$(this).val();var o=n.parent();o.submitForm({success:function(r){var q={name:m,src:r};addResource(q)}});n.find("input").remove();n.append('<input type="file" name="file"/>');d()})}d();initResourcePanel();$("#bgaudio_player_box").bind("mouseenter",function(){var n=$(this);if(n.children("audio").attr("src")){var m=$("<span class='tpbtn'>删除</span>").appendTo(n);m.bind("click",function(){n.children("audio").attr("src","");$(this).remove();subjectDes.model.define.bgAudio=""})}});$("#bgaudio_player_box").bind("mouseleave",function(){var m=$(this);m.children("span").remove()});$("#btn_save_subjects").bind("click",function(){$.ajax({url:"save-test-question-content",type:"post",dataType:"json",data:{id:3,define:JSON.stringify(subjectList)},success:function(m){alert("保存成功")}})});$.ajax({url:"get-test-question-content",type:"post",dataType:"json",data:{id:3},success:function(m){if(m.define){if(typeof m.define=="string"){subjectList=JSON.parse(m.define)}else{subjectList=m.define}}else{subjectList=[]}f();if(subjectList.length>0){h(0)}}});Preview.init()});var resources={"1111":{name:"audio",src:"huozhe.mp3",id:"1111",left:40,top:20},"2222":{name:"image",src:"test.png",id:"2222",left:40,top:20}};function addResource(b){var e=subjectDes.model.create(b.name);$.extend(e,b);b=e;resources[b.id]=b;var d=null;if(b.name=="text"||b.name=="richtext"){d=$("#res_list_text");var a=$("<div class='resource_item_container'></div>").appendTo(d);var c=$("<div class='resource_item' id='"+b.id+"'></div>").appendTo(a);c.html(b.text);c.append("<div class='ico res_remove' onclick='removeResource(\""+b.id+"\", this)'></div>");if(b.name=="text"){a.append("<div class='resource_item_label'>普通文本</div>")}else{a.append("<div class='resource_item_label'>富文本</div>")}}else{if(b.name=="image"){d=$("#res_list_image");var a=$("<div class='resource_item_container'></div>").appendTo(d);var c=$("<div class='resource_item' id='"+b.id+"'></div>").appendTo(a);c.html("<img src='"+b.src+"'/>");c.append("<div class='ico res_remove' onclick='removeResource(\""+b.id+"\", this)'></div>")}else{if(b.name=="audio"){d=$("#res_list_audio");var a=$("<div class='resource_item_container'></div>").appendTo(d);var c=$("<div class='resource_item' id='"+b.id+"'></div>").appendTo(a);c.html("<audio src='"+b.src+"' controls='controls'></audio>");c.append("<div class='ico res_remove' onclick='removeResource(\""+b.id+"\", this)'></div>")}else{if(b.name=="video"){d=$("#res_list_video");var a=$("<div class='resource_item_container'></div>").appendTo(d);var c=$("<div class='resource_item' id='"+b.id+"'></div>").appendTo(a);c.html("<video src='"+b.src+"' controls='controls'></video>");c.append("<div class='ico res_remove' onclick='removeResource(\""+b.id+"\", this)'></div>")}}}}}function removeResource(b,a){$(a).parent().parent().remove();delete resources[b]}function initResourcePanel(){$(".resource_list").off().on("mousedown",".resource_item",function(i){i.preventDefault();var b=$(this).attr("id");var d=null;var g=null;var k=null;var c=-1;var f;var a=null;var h=null;var j=null;$(document).bind("mousemove",function(n){if(d==null){d=subjectDes.utils.copy(resources[b]);d.id=subjectDes.utils.newId();g=subjectDes.renderSubject(d,true);g.css("z-index",1000)}k=subjectDes.utils.getRelativePos(n.pageX,n.pageY,subjectDes.config.target);g.css({left:k.x,top:k.y});c=-1;f=-1;a=null;h=null;j=null;var o=null;$(".insert_line").remove();$(".subject_box_updating").removeClass("subject_box_updating");$(".audio_droping").removeClass("audio_droping");if(n.pageX>$(window).width()-200){return}if(d.name=="audio"){$(".audio_dropable").each(function(){var q=$(this);if(!q.is(":visible")){return true}var p={x:q.offset().left,y:q.offset().top,w:q.width(),h:q.height()};if(subjectDes.utils.pointInRect(n.pageX,n.pageY,p)){q.addClass("audio_droping");h=q;return false}})}else{if(d.name=="image"){$(".image_dropable").each(function(){var p=$(this);if(!p.is(":visible")){return true}var q={x:p.offset().left,y:p.offset().top,w:p.outerWidth(),h:p.outerHeight()};if(subjectDes.utils.pointInRect(n.pageX,n.pageY,q)){p.addClass("audio_droping");j=p;return false}})}}if(h==null&&j==null){subjectDes.config.target.find(".designer_canvas").each(function(){var t=$(this);if(!t.is(":visible")){return true}var x={x:t.offset().left,y:t.offset().top,w:t.width(),h:t.height()};var y=n.pageY-t.offset().top;if(subjectDes.utils.pointInRect(n.pageX,n.pageY,x)){c=parseInt(t.attr("pindex"));o=t;var q=subjectDes.model.define.containers[c].contents;for(var u=0;u<q.length;u++){var r=q[u];var s=subjectDes.config.target.find(".subject_box#"+r.id);var v=parseInt(r.topDis);if(u==0&&y<=v){f=u;break}v=s.position().top+v;var p=v+s.height();if(r.className==d.className&&y>v&&y<p){a=r;break}if(u<q.length-1){var w=q[u+1];p+=parseInt(w.topDis);if(y>v&&y<=p){f=u+1;break}}}return false}});if(a!=null){var e=subjectDes.config.target.find(".subject_box#"+a.id);e.addClass("subject_box_updating")}else{if(c!=-1){var l=$("<div class='insert_line'></div>");if(f!=-1){var m=subjectDes.model.define.containers[c].contents[f].topDis;m=parseInt(m);l.height(m/2);if(f==0){o.prepend(l)}else{o.children(".subject_box:eq("+(f-1)+")").after(l)}}else{o.append(l)}}}}});$(document).bind("mouseup",function(e){$(".insert_line").remove();$(".subject_box_updating").removeClass("subject_box_updating");subjectDes.config.target.find(".designer_canvas").unbind("mouseenter").unbind("mouseleave");$(".audio_droping").removeClass("audio_droping");$(document).unbind("mousemove");$(document).unbind("mouseup");if(g!=null){g.remove()}if(h!=null){h.attr("src",d.src);if(h.hasClass("bgaudio_player")){subjectDes.model.define.bgAudio=d.src}else{if(h.hasClass("audiotext_edit_player")){$("#audiotext_points").empty()}}}else{if(j!=null){if(j.hasClass("point_type_normal")){var l=j.data("props");l.image=d.src}}else{if(a!=null){if(d.text){a.text=d.text}else{if(d.src){a.src=d.src}}subjectDes.model.update(a);subjectDes.renderSubject(a)}else{if(c!=-1){d.resource=true;subjectDes.model.add(d,c,f);subjectDes.renderSubject(d,false,f)}}}}})})}function onlyNum(b){var a=b||window.event;if(!(a.keyCode>=8&&a.keyCode<=20)||(a.keyCode>=33&&a.keyCode<=46)){if(!((a.keyCode>=48&&a.keyCode<=57)||(a.keyCode>=96&&a.keyCode<=105))){if(window.event){a.returnValue=false}else{a.preventDefault()}}}return a.keyCode}function resizeView(){var a=$(window).height();$("#subject_designer").height(a);$(".subject_list").height(a);$("#resource_panel").height(a);$("#resource_switch").css("top",a/2-55);$(".resource_list").height($(window).height()-120-36);$("#left_subjects").height(a-41);$(".subject_canvas_container").height(a);$("#subject_canvas").css("min-height",a-80);$("#subject_designer").find(".subject_page").height(a-80);$("#subject_designer").find(".designer_canvas").css("min-height",a-101);subjectDes.config.pageHeight=a-80;$("#template_designer").height(a);$("#template_designer").find(".subject_page").height(a-95);$("#template_designer").find(".designer_canvas").css("min-height",a-116);templateDes.config.pageHeight=a-95;$("#preview_designer").height(a);$("#preview_designer").find(".subject_page").height(a-120);$("#preview_designer").find(".designer_canvas").css("min-height",a-141);previewDes.config.pageHeight=a-120}var Preview={curentInex:0,init:function(){$(".preview_btn").bind("click",function(){Preview.show()});$("#btn_preview_back").bind("click",function(){Preview.back()});$("#btn_preview_next").bind("click",function(){Preview.next()});$("#btn_preview_exit").bind("click",function(){Preview.exit()})},pauseMedia:function(){var d=$("audio");for(var c=0;c<d.length;c++){var e=d[c];e.pause()}var b=$("video");for(var c=0;c<b.length;c++){var a=b[c];a.pause()}},show:function(){if(subjectList.length==0){return}this.pauseMedia();$("#subject_designer").hide();$("#preview_designer").show();previewDes.open(subjectList[0]);resizeView();this.curentInex=0},next:function(){if(this.curentInex==subjectList.length-1){alert("已经是最后一页");return}this.pauseMedia();this.curentInex++;previewDes.open(subjectList[this.curentInex]);resizeView()},back:function(){if(this.curentInex==0){alert("已经是第一页");return}this.pauseMedia();this.curentInex--;$("#preview_designer").find("audio").attr("src","");previewDes.open(subjectList[this.curentInex]);resizeView()},exit:function(){this.pauseMedia();$("#preview_designer").hide();$("#subject_designer").show();$("#preview_designer").find("audio").attr("src","");resizeView()}};