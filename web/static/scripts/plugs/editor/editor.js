
var QEDITOR_ALLOW_TAGS_ON_PASTE, QEDITOR_DISABLE_ATTRIBUTES_ON_PASTE, QEDITOR_TOOLBAR_HTML;
QEDITOR_TOOLBAR_HTML = "<div class=\"editor_toolbar\">" +
		"<select class='fontname'><option value=''>字体</option><option value='微软雅黑'>微软雅黑</option><option value='宋体'>宋体</option><option value='Arial'>Arial</option><option value='Tahoma'>Tahoma</option><option value='Times New Roman'>Times New Roman</option></select>" +
		"<select class='fontsize'><option value=''>字号</option><option value='1'>特小</option><option value='2'>很小</option><option value='3'>小</option><option value='4'>中</option><option value='5'>大</option><option value='6'>很大</option><option value='7'>特大</option></select>" +
		"<span class=\"bold\" title=\"加粗\"></span>" +
		"<span class=\"italic\" title=\"斜体\"></span>" +
		"<span class=\"underline\" title=\"下划线\"></span>" +
		"<span class=\"strikethrough\" title=\"删除线\"></span>" +
		"<div class=\"colorpicker\" title=\"文字颜色\"><div class='ico_colordrop'></div></div>" +
		"<div class='devider'></div>" +
		"<span class=\"insert_rect\" title=\"插入矩形标识\"></span>" +
		"<span class=\"insert_arrow\" title=\"插入箭头标识\"></span>" +
		"<span class=\"insert_blank\" title=\"插入题空\"></span>" +
		"<span class=\"justifyleft\" title=\"左对齐\"></span>" +
		"<span class=\"justifycenter\" title=\"居中对齐\"></span>" +
		"<span class=\"justifyright\" title=\"右对齐\"></span>" +
		"<span class=\"fullscreen\" title=\"全屏\"></span>" +
		"</div>";

QEDITOR_ALLOW_TAGS_ON_PASTE = "div,p,ul,ol,li,br,b,strong,i,em,img,u,strike,span";

QEDITOR_DISABLE_ATTRIBUTES_ON_PASTE = ["style", "class", "id", "name", "width", "height", "type", "rel" ];

var QEditor = {
	doc: null,
	content: null,
	actions : [ 'bold', 'italic', 'underline', 'strikethrough', 'justifyleft', 'justifycenter', 'justifyright'],
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
		}else if(a === "fullscreen"){
			return QEditor.toggleFullScreen(editor);
		}else if(a === "insert_rect"){
			this.insertHtml("<input class='richtext_rect' readonly='readonly'/>");
			return false;
		}else if(a === "insert_arrow"){
			this.insertHtml("<input class='richtext_arrow' readonly='readonly'/>");
			return false;
		}else if(a === "insert_blank"){
			this.insertHtml("<input class='fillblank_blank' type='text'/>");
			return false;
		}
		if (QEditor.state(a)) {
			this.doc.execCommand(a, false, null);
		} else {
			this.doc.execCommand(a, false, p);
		}
		QEditor.checkSectionState(editor);
		return false;
	},
	state : function(action) {
		//判断光标处的状态，比如是否是加粗
		return this.doc.queryCommandState(action) === true;
	},
	insertHtml: function(html){
		$(".editor_preview")[0].contentWindow.focus();
		if (!+"\v1") {
			/****这里需要解决IE丢失光标位置的问题，详见核心代码四**************/
			this.doc.selection.createRange().pasteHTML(html);
		} else {
			var selection = this.content.getSelection();
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
			height: $(window).height() - 41
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
			height: "auto"
		});
		border.attr("style", border.attr("st"));
		border.removeAttr("st");
		border.find(".editor_preview").css("height", border.height() - 41);
		border.find(".fullscreen").removeClass("state-on");
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
	/**
	 * 构建取色器的html
	 * @return {}
	 */
	colorPickerHtml: function(){
		var  _hex = ['00', '33', '66', '99', 'CC', 'FF'],
	    builder = [],
	    // 呈现一个颜色格
	    _drawCell = function(builder, red, green, blue){
	        builder.push('<td bgcolor="');
	        builder.push('#' + red + green + blue);
	        builder.push('" unselectable="on"></td>');
	    },
	    // 呈现一行颜色
	    _drawRow = function(builder, red, blue){
	        builder.push('<tr>');
	        for (var i = 0; i < 6; ++i) {
	            _drawCell(builder, red, _hex[i], blue)
	        }
	        builder.push('</tr>');
	    },
	    // 呈现六个颜色区之一
	    _drawTable = function(builder, blue){
	        builder.push('<table class="cell" unselectable="on">');
	        for (var i = 0; i < 6; ++i) {
	            _drawRow(builder, _hex[i], blue)
	        }
	        builder.push('</table>');
	    };
	    //开始创建
	    builder.push('<table style="border-top: 1px solid #000;border-left: 1px solid #000;"><tr>');
	    for (var i = 0; i < 3; ++i) {
	        builder.push('<td>');
	        _drawTable(builder, _hex[i]);
	        builder.push('</td>');
	    }
	    builder.push('</tr><tr>');
	    for (var i = 3; i < 6; ++i) {
	        builder.push('<td>');
	        _drawTable(builder, _hex[i])
	        builder.push('</td>');
	    }
	    builder.push('</tr></table>');
	    return builder.join('');
	}
};

(function($) {
	return $.fn.qeditor = function(options) {
		if(typeof options == "string"){
			//调用方法
			if(options == "setValue"){
				var val = arguments[1];
				var obj = $(this);
				var editor = obj.parent().find(".editor_preview");
				var doc = editor[0].contentDocument || editor[0].contentWindow.document;
				var body = doc.body;
				$(body).html(val);
				obj.val(val);
			}
			return;
		}
		return this.each(function() {
			var currentVal, editor, obj, qe_heading, toolbar;
			obj = $(this);
			obj.addClass("qeditor");
			editor = $('<iframe class="editor_preview" frameborder="0"></iframe>');
//			currentVal = obj.val();
//			editor.html(currentVal);
			//开始构造页面
			obj.wrap('<div class="editor_border"></div>');
			$(".editor_border").attr("style", obj.attr("style"));
			obj.hide();
			obj.after(editor);
			editor.css("height", $(".editor_border").height() - 41);
			//添加toolbar
			toolbar = $(QEDITOR_TOOLBAR_HTML);
			editor.before(toolbar);
			var content = editor[0].contentWindow;
			QEditor.content = content;
			var doc = editor[0].contentDocument || editor[0].contentWindow.document;
			doc.designMode = "on";
			doc.open();
			doc.write("<html><head><link type='text/css' rel='stylesheet' href='static/styles/plugs/editor.css'>" +
					"<style type=\"text/css\">" +
					"body{margin:0px;padding:8px 10px;font-family:微软雅黑;font-size:16px;border:0;color:#333;}" +
					"p{margin: 10px 0px;}" +
					"ol,ul{margin:10px 0 10px 40px;padding: 0;}" +
					"ol{list-style:decimal;}" +
					"ul{list-style:disc;}" +
					"img{max-width: 100%;}" +
					"a{color:#c35d0e;}" +
					"</style></head><body>" +
					obj.val() +
					"</body></html>");
			doc.close();
			QEditor.doc = doc;
			var body = doc.body;
			$(body).html(obj.val());
			doc.execCommand('defaultParagraphSeparator', false, 'p');
			$(content).bind("focus", function() {
				//获取焦点时，判断每个指令的状态，比如是否加粗
				QEditor.checkSectionState(editor);
			});
			$(content).bind("blur", function() {
				//绑定失去焦点事件
				QEditor.checkSectionState(editor);
				var text = $(doc.body).text().trim();
				if(text == ""){
					obj.val("");
				}else{
					obj.val($(body).html());
				}
			});
			$(content).bind("paste", function() {
				//记录现在已有的内容的行内style样式
				var styles = [];
				var elements = [];
				$(doc.body).html($(doc.body).html().replace("&nbsp;", " "));
				$(doc.body).find("*").each(function(){
					var ele = $(this);
					elements.push(ele);
					styles.push(ele.attr("style"));
				});
				//粘帖时，删除编辑器不允许的属性，删除不允许的标签
				return setTimeout(function() {
					var attrName, els, _i, _len;
					var els = $(doc.body).find("*");
					//先把不允许的属性从所有元素上删除
					for (_i = 0, _len = QEDITOR_DISABLE_ATTRIBUTES_ON_PASTE.length; _i < _len; _i++) {
						attrName = QEDITOR_DISABLE_ATTRIBUTES_ON_PASTE[_i];
						els.removeAttr(attrName);
					}
					//再把已有元素的style属性加进去
					for(var i = 0; i < styles.length; i++){
						if(styles[i]){
							elements[i].attr("style", styles[i]);
						}
					}
					//查找不允许的标签，取消标签的包裹
					$(doc.body).find(":not(" + QEDITOR_ALLOW_TAGS_ON_PASTE + ")").contents().unwrap();
					return true;
				}, 5);
			});
			$(content).bind("keyup", function(e) {
				if (e.keyCode === 27) {
					//ESC退出全屏
					QEditor.exitFullScreen();
				}
				//判断每个指令的状态，比如是否加粗
				QEditor.checkSectionState(editor);
			});
			$(content).bind("click", function(e) {
				//点击时，判断每个指令的状态，比如是否加粗
				QEditor.checkSectionState(editor);
				return e.stopPropagation();
			});
			//初始化toolbar
//			toolbar.bind("mousedown", function(e){
//				e.preventDefault();
//			});
			toolbar.find("span").click(function() {
				return QEditor.action(this, $(this).attr("class").split(" ")[0]);
			});
			toolbar.find("select").change(function() {
				var newVal = $(this).val();
				$(this).val("");
				return QEditor.action(this, $(this).attr("class"), newVal);
			});
			toolbar.find(".colorpicker").bind("mousedown", function(){
				var box = $("#colorpicker_box");
				if(box.length == 0){
					box = $("<div id='colorpicker_box'></div>").appendTo($(this));
					var html = QEditor.colorPickerHtml();
					box.html(html);
					box.find("td[bgcolor]").bind("click", function(){
						box.hide();
						return QEditor.action(this, "forecolor", $(this).attr("bgcolor"));
					});
				}
				box.show();
			});
		});
	};
})(jQuery);
