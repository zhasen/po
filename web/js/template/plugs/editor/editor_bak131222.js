
var QEDITOR_ALLOW_TAGS_ON_PASTE, QEDITOR_DISABLE_ATTRIBUTES_ON_PASTE, QEDITOR_TOOLBAR_HTML;

QEDITOR_TOOLBAR_HTML = "<div class=\"editor_toolbar\">" +
		"<span class=\"bold\" title=\"加粗\"></span>" +
		"<span class=\"italic\" title=\"斜体\"></span>" +
		"<span class=\"underline\" title=\"下划线\"></span>" +
		"<span class=\"strikethrough\" title=\"删除线\"></span>" +
		"<div></div>" +
		"<span class=\"insertorderedlist\" title=\"有序列表\"></span>" +
		"<span class=\"insertunorderedlist\" title=\"无序列表\"></span>" +
		"<span class=\"indent\" title=\"增加缩进\"></span>" +
		"<span class=\"outdent\" title=\"减少缩进\"></span>" +
		"<div></div>" +
		"<span class=\"blockquote\" title=\"引用\"></span></a>" +
		"<span class=\"createLink\" title=\"链接\"></span>" +
		"<form enctype='multipart/form-data' method='post' action='/editor/upload'><span class=\"insertimage\" title=\"图片\"><input type='file' name='img' title='图片'/></span></form>" +
		"<div class='upload_tip'></div>" +
		"<span class=\"fullscreen\" title=\"全屏\"></span>" +
		"</div>";

QEDITOR_ALLOW_TAGS_ON_PASTE = "div,p,ul,ol,li,hr,br,b,strong,i,em,img";

QEDITOR_DISABLE_ATTRIBUTES_ON_PASTE = ["style", "class", "id", "name", "width", "height", "type", "rel" ];

var QEditor = {
	actions : [ 'bold', 'italic', 'underline', 'strikethrough',
			'insertunorderedlist', 'insertorderedlist', 'blockquote'],
	action : function(el, a, p) {
		var editor;

		editor = $(".editor_preview", $(el).parent().parent());
		editor.focus();
		if (p === null) {
			p = false;
		}
		if (a === "blockquote") {
			p = a;
			a = "formatBlock";
		}
		if (a === "createLink") {
			this.promptLink();
			return false;
		} else if (a === "insertimage") {
			return;
		}else if(a === "fullscreen"){
			return QEditor.toggleFullScreen(editor);
		}
		if (QEditor.state(a)) {
			document.execCommand(a, false, null);
		} else {
			document.execCommand(a, false, p);
		}
		QEditor.checkSectionState(editor);
		editor.change();
		return false;
	},
	state : function(action) {
		//判断光标处的状态，比如是否是加粗
		return false;
		return document.queryCommandState(action) === true;
	},
	prompt : function(title) {
		var val;

		val = prompt(title);
		if (val) {
			return val;
		} else {
			return false;
		}
	},
	promptLink: function(){
		var dialog = $("#dlg_editor_link");
		if(dialog.length == 0){
			dialog = $("<div id='dlg_editor_link' class='dlg'>" +
					"<div class='dlg_header'>超链接</div>" +
					"<div class='dlg_content'>" +
					"<div class='link_lbl'>链接地址</div>" +
					"<div class='link_addr'><input type='text' class='text'/></div>" +
					"</div>" +
					"<div class='dlg_buttons'>" +
					"<span class='btn editor_link_insert'>确定</span>&nbsp;&nbsp;" +
					"<span class='btn light' onclick=\"$('#dlg_editor_link').dlg('close')\">取消</span>" +
					"</div>" +
					"</div>");
			dialog.appendTo("body");
			dialog.find(".editor_link_insert").bind("click", function(){
				QEditor.insertLink();
			});
			dialog.find("input").bind("keyup", function(e){
				if(e.keyCode == 13){
					QEditor.insertLink();
				}
			});
		}
		dialog.dlg();
		dialog.find("input").select();
	},
	insertLink: function(){
		var input = $("#dlg_editor_link").find("input");
		var link = input.val().trim();
		if(link.length > 0){
			$(".editor_preview").focus();
			document.execCommand("createLink", false, link);
		}
		$('#dlg_editor_link').dlg('close');
		$(".editor_preview").change();
		QEditor.insertHtml("<a href=''>www.baidu.com</a>");
	},
	insertHtml: function(html){
		$(".editor_preview").focus();
		if (!+"\v1") {
			/****这里需要解决IE丢失光标位置的问题，详见核心代码四**************/
			iframeDocument.selection.createRange().pasteHTML(html);
		} else {
			var selection = $(".editor_preview")[0].getSelection();
			console.log(selection);
			var range;
			if (selection) {
				range = selection.getRangeAt(0);
			} else {
				range = iframeDocument.createRange();
			}
			var oFragment = range.createContextualFragment(html), oLastNode = oFragment.lastChild;
			range.insertNode(oFragment);
			range.setEndAfter(oLastNode);
			range.setStartAfter(oLastNode);
			selection.removeAllRanges();//清除选择
			selection.addRange(range);
		}
	},
	toggleFullScreen : function(ed) {
		var border;
		border = $(ed).parent();
		if (border.data("fullscreen") === "1") {
			QEditor.exitFullScreen();
		} else {
			QEditor.enterFullScreen(border);
		}
		return false;
	},
	enterFullScreen : function(border) {
		border.data("fullscreen", "1").addClass("editor_fullscreen");
		border.find(".editor_preview").focus();
		//给body添加样式，不显示body的滚动条
		$("body").addClass("body_fullscreen");
		border.find(".editor_preview").css({
			width: $(window).width() - 22,
			height: $(window).height() - 58
		});
		//删除border容器的样式
		border.attr("st", border.attr("style"));
		border.removeAttr("style");
		border.find(".fullscreen").addClass("state-on");
	},
	exitFullScreen : function() {
		var border = $(".editor_border");
		border.removeClass("editor_fullscreen").data("fullscreen", "0");
		$("body").removeClass("body_fullscreen");
		border.find(".editor_preview").css({
			width: "auto",
			height: "auto"
		});
		border.attr("style", border.attr("st"));
		border.removeAttr("st");
		border.find(".editor_preview").css("height", border.height() - 57);
		border.find(".fullscreen").removeClass("state-on");
	},
	/**
	 * 获取当前的容器节点
	 * @returns
	 */
	getCurrentContainerNode : function() {
		var containerNode, node;
		if (window.getSelection) {
			node = window.getSelection().anchorNode;
			containerNode = node.nodeType === 3 ? node.parentNode : node;
		}
		return containerNode;
	},
	checkSectionState : function(editor) {
		var a, link, _i, _len, _ref, _results;
		_ref = QEditor.actions;
		_results = [];
		for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			a = _ref[_i];
			link = editor.parent().find(
					".editor_toolbar ." + a);
			if (QEditor.state(a)) {
				_results.push(link.addClass("state-on"));
			} else {
				_results.push(link.removeClass("state-on"));
			}
		}
		return _results;
	},
	version : function() {
		return "0.2.0";
	}
};

(function($) {
	return $.fn.qeditor = function(options) {
		return this.each(function() {
			var currentVal, editor, obj, qe_heading, toolbar;
			obj = $(this);
			obj.addClass("qeditor");
			editor = $('<div class="editor_preview" contentEditable="true"></div>');
			//ESC退出全屏
			$(document).keyup(function(e) {
				if (e.keyCode === 27) {
					return QEditor.exitFullScreen();
				}
			});
			//设置段落分隔符为p标签
			document.execCommand('defaultParagraphSeparator', false, 'p');
			currentVal = obj.val();
			editor.html(currentVal);
			obj.after(editor); //添加editor
			editor.focusin(function() {
				//获取焦点时，判断每个指令的状态，比如是否加粗
				QEditor.checkSectionState(editor);
			});
			editor.blur(function() {
				//绑定失去焦点事件
				QEditor.checkSectionState(editor);
			});
			editor.change(function() {
				var pobj, t;
				pobj = $(this);
				t = pobj.parent().find('.qeditor');
				//发生变化时，给textarea赋值
				return t.val(pobj.html());
			});
			editor.on("paste", function() {
				//粘帖时，删除编辑器不允许的属性，删除不允许的标签
				var txt;
				txt = $(this);
				return setTimeout(function() {
					var attrName, els, _i, _len;
					els = txt.find("*");
					for (_i = 0, _len = QEDITOR_DISABLE_ATTRIBUTES_ON_PASTE.length; _i < _len; _i++) {
						attrName = QEDITOR_DISABLE_ATTRIBUTES_ON_PASTE[_i];
						els.removeAttr(attrName);
					}
					//查找不允许的标签，取消标签的包裹
					txt.find(":not(" + QEDITOR_ALLOW_TAGS_ON_PASTE + ")").contents().unwrap();
					txt.change();
					return true;
				}, 5);
			});
			editor.keyup(function(e) {
				//判断每个指令的状态，比如是否加粗
				QEditor.checkSectionState(editor);
				return $(this).change();
			});
			editor.on("click", function(e) {
				//点击时，判断每个指令的状态，比如是否加粗
				QEditor.checkSectionState(editor);
				return e.stopPropagation();
			});
			editor.keydown(function(e) {
				var node, nodeName;
				node = QEditor.getCurrentContainerNode();
				nodeName = "";
				if (node && node.nodeName) {
					nodeName = node.nodeName.toLowerCase();
				}
				//回车时，插入新的段落
				if (e.keyCode === 13 && !(e.shiftKey || e.ctrlKey)) {
					if (nodeName === "blockquote" || nodeName === "pre") {
						e.stopPropagation();
						document.execCommand('InsertParagraph', false);
						document.execCommand("formatBlock", false, "p");
						document.execCommand('outdent', false);
						return false;
					}
				}
			});
			//开始构造页面
			obj.wrap('<div class="editor_border"></div>');
			$(".editor_border").attr("style", obj.attr("style"));
			obj.hide();
			obj.after(editor);
			editor.css("height", $(".editor_border").height() - 57);
			//添加toolbar
			toolbar = $(QEDITOR_TOOLBAR_HTML);
			toolbar.bind("mousedown", function(e){
				e.preventDefault();
			});
			toolbar.find("span").click(function() {
				return QEditor.action(this, $(this).attr("class").split(" ")[0]);
			});
			//上传图片
			toolbar.find("input[type=file]").change(function(){
				toolbar.find(".upload_tip").removeClass("error_tip").text("上传中...");
				toolbar.find("form").submitForm({
					success: function(data){
						if(data.error == "type"){
							toolbar.find(".upload_tip").text("文件不是图片").addClass("error_tip");
							setTimeout(function(){
								toolbar.find(".upload_tip").empty();
							}, 4000);
						}else if(data.error == "size"){
							toolbar.find(".upload_tip").text("图片最大限制5M").addClass("error_tip");
							setTimeout(function(){
								toolbar.find(".upload_tip").empty();
							}, 4000);
						}else{
							toolbar.find(".upload_tip").empty().removeClass("error_tip");
							$(".editor_preview").focus();
							document.execCommand("insertimage", false, data.src);
							$(".editor_preview").change();
						}
					}
				});
				$(this).val("");
			});
			return editor.before(toolbar);
		});
	};
})(jQuery);
