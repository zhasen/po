

/**
 * 
 * 注释标签说明：
 * todo 需要做，还没有做的
 * confirm 不确定是否有问题，暂时这样做
 * 
 * 
 */

/**
 * 业务处理
 */

var testingDes;
$(function(){
	//初始化
	testingDes = new Designer({
		target: $("#subject_designer"),
		status: "testing",
		imgPath: "http://116.213.70.92/files_test/oms/data/online/resource/",
		audioPath: "http://116.213.70.92/oms2/online/downloadFile!doDownload.do?keyUUID=",
		audioImgPath: "http://116.213.70.92/files_test/oms/data/online/resource/0dc00d23-e8c8-436c-af49-f04b45dd368d/201412/04/",
		statusType: paperConfig.statusType
	});
	Testing.init();
});

/**
 * 测试对象
 * @type {}
 */
var Testing = {
	/**
	 * 初始化
	 */
	init: function(){
		$(window).bind("resize", function(){
			Testing.resizeView();
		});
		Testing.resizeView();
		Testing.loadPaper();
	},
	/**
	 * 测试定义JSON
	 * @type {}
	 */
	paper: null,
	/**
	 * 本次测试ID
	 * @type {String}
	 */
	testId: "",
	/**
	 * 用户上次作答的结果
	 */
	testResult: null,
	/**
	 * 设置视图
	 */
	resizeView: function(){
		var winH = $(window).height();
		var pageH = winH - 125;
		testingDes.config.pageHeight = pageH;
		$("#subject_designer").height(winH);
		$("#subject_designer").find(".subject_page").height(pageH);
		$("#subject_designer").find(".designer_canvas").css("min-height", winH - 146);
	},
	/**
	 * 加载试卷
	 */
	loadPaper: function(){
		var loading = $(".designer_loading");
		loading.css({
			top: ($(window).height() - loading.outerHeight()) / 2,
			left: ($(window).width() - loading.outerWidth()) / 2
		});
		$.ajax({
			url: "test-get",
			type: "post",
			data: {
				method: "loadTestPaper",
				paperId: paperConfig.paperId,
				testId: paperConfig.testId,
				userId: paperConfig.userId,
				allotId: paperConfig.allotId,
				testFrom: paperConfig.testFrom
			},
			dataType: "json",
			success: function(paperDef){
				if(paperDef.errno){
					alert("数据加载失败！");
				}else{
					init(paperDef);
				}
			},
			error: function(){
				if(defaultDef){
					init(defaultDef);
				}else{
					alert("数据加载失败！");
				}
			}
		});
		
		function init(paperDef){
			Testing.paper = paperDef.result;
//			console.log(JSON.stringify(paperDef));
			Testing.testId = Testing.paper.testId;
			if(Testing.paper.allTestResultDetail && Testing.paper.allTestResultDetail.length > 0){
				Testing.testResult = Testing.paper.allTestResultDetail;
			}
			$("#paper_name").text(Testing.paper.paperName);
			Player.structItem = Testing.paper.structItem.trees; //试卷有几个部分
			loading.remove();
			$(".designer_box").show();
			Player.init();
			console.log("开始测试，testId：" + Testing.testId);
			if(testingDes.config.statusType == "review"){
				//review状态
				Review.init();
			}
		}
	}
};

/**
 * 播放器
 * @type {}
 */
var Player = {
	/**
	 * 初始化
	 */
	init: function(){
		$("#btn_back").bind("click", function(){
			Player.back();
		});
		$("#btn_next").bind("click", function(){
			Player.next();
		});
		$("#btn_continue").bind("click", function(){
			Player.next();
		});
		$("#btn_ok").bind("click", function(){
			$("#btn_next").prop("disabled", "");
		});
		$("#btn_timer").bind("click", function(){
			if($("#header_timer").is(":visible")){
				$("#header_timer").hide();
				$("#btn_timer").val("showTime");
			}else{
				$("#header_timer").show();
				$("#btn_timer").val("hideTime");
			}
		});
		$("#btn_review").bind("click", function(){
			Review.show();
		});
		//构建试卷结构
		this.buildItems();
		//构建当前答案
		var lastTime = null;
		if(Testing.testResult){
			var subjectExtends = {}; //在这里存储subjectExtend信息，保存的是当前打开题目的索引
			for (var i = 0; i < Testing.testResult.length; i++) {
				var result = Testing.testResult[i];
				Player.paperAnswers[result.subjectId] = JSON.parse(result.answerContent);
				Player.paperDatas[result.subjectId] = JSON.parse(result.subjectData);
				if(result.subjectExtend){
					subjectExtends[result.subjectId] = JSON.parse(result.subjectExtend);
				}
			}
			if(testingDes.config.statusType == "normal"){
				//设置从第几题开始，循环试题结构，从后往前
				for (var i = this.parts.length - 1; i >= 0; i--) {
					var part = this.parts[i];
					var ended = false;
					for (var ti = part.items.length - 1; ti >= 0; ti--) {
						var item = part.items[ti];
						var itemSubjectId = JSON.parse(decodeURIComponent(item.item.subjectData)).id;
						if(subjectExtends[itemSubjectId]){
							//如果此大题已经作答了，从此大题开始
							ended = true;
							var ext = subjectExtends[itemSubjectId];
							this.partIndex = ext.partIndex;
							this.itemIndex = ext.itemIndex;
							this.pageIndex = ext.pageIndex;
							var data = Player.paperDatas[itemSubjectId];
							if(data.times && data.times.length > 0){
								lastTime = data.times[0]; //当前剩余的时间，继续倒计时
							}
							break;
						}
					}
					if(ended){
						break;
					}
				}
			}
		}
		//构建第一部分答案
		this.buildAnswer(); 
		//播放
		Player.play(lastTime);
	},
	/**
	 * 试题结构
	 * @type {}
	 */
	structItem: null,
	/**
	 * 试卷有几个部分
	 * @type {}
	 */
	parts: [],
	/**
	 * 当前播放的部分的索引
	 * @type {Number}
	 */
	partIndex: 0,
	/**
	 * 当前部分的播放进度，最大播放到了什么位置，下一页时会与这个进行比对
	 * @type {}
	 */
	partStatus: {itemIndex: 0, pageIndex: 0},
	/**
	 * 试卷有多少item
	 * @type {}
	 */
	items: [],
	/**
	 * 当前播放的item的索引
	 * @type {}
	 */
	itemIndex: 0,
	/**
	 * 当前播放部分的题目列表
	 * @type {}
	 */
	subjectList: null,
	/**
	 * 当前播放的第几页
	 * @type {Number}
	 */
	pageIndex: 0,
	/**
	 * 整套试卷的作答答案，在提交时使用, subjectId：value
	 * @type {}
	 */
	paperAnswers: {},
	/**
	 * 整套试卷的试题数据，在提交时使用, subjectId：value
	 * @type {}
	 */
	paperDatas: {},
	/**
	 * 答案
	 * @type [] 数组，对应当前多个item的answerContent
	 */
	answers: [],
	/**
	 * 当前页的答案
	 * @type {}
	 */
	pageAnswer: [],
	/**
	 * 开始播放
	 * @param {} lastTime 剩余时间，不是必须参数
	 */
	play: function(lastTime){
		if(this.itemIndex > this.partStatus.itemIndex){
			//进入了下一个item
			this.partStatus.itemIndex = this.itemIndex;
			this.partStatus.pageIndex = 0;
		}else if(this.itemIndex == this.partStatus.itemIndex){
			//当前item
			if(this.pageIndex > this.partStatus.pageIndex){
				this.partStatus.pageIndex = this.pageIndex;
			}
		}
		var part = this.parts[this.partIndex];
		this.items = part.items;
		var item = this.items[this.itemIndex];
		$("#part_name").text("[ " + part.displayName + " ]"); //设置标题
		//获取到item题目的定义
		var subjectData = item.item.subjectData;
		subjectData = decodeURIComponent(subjectData); //对题目的定义进行解码处理
		this.subjectList = JSON.parse(subjectData);
		var page = this.subjectList.pages[this.pageIndex];
		//设置当前页的答案
		var itemAnswer = this.answers[this.itemIndex];
		this.pageAnswer = itemAnswer[this.pageIndex];
		//打开一页
		testingDes.open(page);
		Testing.resizeView();
		//设置背景音乐
		if(page.url){
			$("#bgaudio_player").attr('src', testingDes.config.audioPath + page.url);
		}else{
			$("#bgaudio_player").attr('src', "");
		}
		$("#header_right_normal").find(".testbtn").hide();
		//根据附加页，控制附加页的显示隐藏
		if(page.extralData){
			$("#btn_extral").show().unbind().bind("click", function(){
				testingDes.open(page.extralData);
				Testing.resizeView();
				$(".designer_header_right").hide();
				$("#header_right_extral_return").show();
			});
			$("#btn_extral_return").unbind().bind("click", function(){
				testingDes.open(page);
				Testing.resizeView();
				$(".designer_header_right").hide();
				$("#header_right_normal").show();
			});
		}else{
			$("#btn_extral").hide();
		}
		$(".designer_header_right").hide();
		$("#header_right_normal").show();
		//控制翻页
		$("#btn_next").val("next");
		if(testingDes.config.statusType == "review"){
			//review状态
			$("#btn_next").show();
			$("#btn_back").show();
			$("#btn_review").show();
			var back = this.getBack();
			if(back == null){
				$("#btn_back").prop("disabled", "disabled");
			}else{
				$("#btn_back").prop("disabled", "");
			}
			var next = this.getNext();
			if(next == null){
				$("#btn_next").prop("disabled", "disabled");
			}else{
				$("#btn_next").prop("disabled", "");
			}
		}else if(page.slidingType == "normal_mode"){
			//普通翻页
			if(page.isExplain == "true"){
				$("#btn_continue").show().prop("disabled", "");
			}else{
				$("#btn_next").show();
				$("#btn_back").show();
				var back = this.getBack();
				if(back == null){
					$("#btn_back").prop("disabled", "disabled");
				}else{
					$("#btn_back").prop("disabled", "");
				}
				var next = this.getNext();
				if(next == null){
					$("#btn_next").val("submit");
				}
			}
		}else if(page.slidingType == "complete_mode"){
			//完成事件翻页
			$("#btn_continue").show().prop("disabled", "disabled");
			if(page.isExplain == "true"){
				//说明页的情况下
				//获取富文本控件的数量
				var richTextCount = 0;
				for(var pi = 0; pi < page.containers.length; pi++){
					var container = page.containers[pi];
					if(container.contents){
						for(var i = 0; i < container.contents.length; i++){
							var sub = container.contents[i];
							if(sub.className == "org.neworiental.rmp.base::BaseTLFText"){
								richTextCount++;
							}
						}
					}
				}
				if(richTextCount == 1){
					//只有一个富文本，要让滚动条滚动到最底部才能continue
					$(".subject_page").bind("scroll", function(){
						var nowTop = $(this).scrollTop();
						$(this).scrollTop(999999);
						if(nowTop == $(this).scrollTop()){
							//已经到最底部，激活continue
							$("#btn_continue").prop("disabled", "");
						}
						$(this).scrollTop(nowTop);
					});
				}
			}
		}else if(page.slidingType == "auto_mode"){
			//自动翻页
			$("#btn_continue").show().prop("disabled", "");
			//查看有没有托福音频控件
			var toelfAudios = $(".subject_box[n='org.neworiental.rmp.base::ToelfAudio']");
			if(toelfAudios.length > 0){
				//如果有音频控件
				var player = toelfAudios.find("audio");
				//绑定事件
				player.bind("ended", function(){
					//播放完，自动下一页
					Player.next();
				});
			}
			//查看有没有倒计时控件
			var toelfTimers = $(".subject_box[n='org.neworiental.rmp.base::TOEFLTimerViewer']");
			if(toelfTimers.length > 0){
				//如果有倒计时控件
				var timer = toelfTimers.find(".subject_canvas");
				//绑定事件
				timer.bind("ended", function(){
					//结束，自动下一页
					Player.next();
				});
			}
			//查看有没有录音控件
			var toelfRecords = $(".subject_box[n='org.neworiental.rmp.base::TOEFLRecord']");
			if(toelfRecords.length > 0){
				//如果有录音控件
				var record = toelfRecords.find(".subject_canvas");
				//绑定事件
				record.bind("ended", function(){
					//结束，自动下一页
					Player.next();
				});
			}
		}else if(page.slidingType == "custom_mode"){
			//手动翻页
			$("#btn_next").show().prop("disabled", "disabled");
			$("#btn_ok").show().prop("disabled", "disabled");
			var options = $(".subject_box[n='org.neworiental.rmp.base::OptionGroup']");
			if(options.length > 0){
				//如果有选择题控件
				options.find("input").bind("click", function(){
					$("#btn_ok").prop("disabled", "");
				});
			}
		}
		//控制问题的显示
		if(item.item.subjectType == "TOEFL_READ"){
			//如果是托福阅读部分
			//构造题目列表，题目列表，[1,3,5]存储，存储当前subjectList中，第几页是题目页
			var questionList = [];
			for (var qi = 0; qi < this.subjectList.pages.length; qi++) {
				var p = this.subjectList.pages[qi];
				if(p.isExplain == "false"){
					questionList.push(qi);
				}
			}
			if(page.isExplain == "true"){
				$("#header_question").hide();
			}else{
				$("#header_question").show();
				var index = questionList.indexOf(this.pageIndex) + 1;
				$("#header_question").children("span").text(index + " of " + questionList.length);
			}
		}else{
			//如果是托福听力部分
			$("#header_question").show();
			$("#header_question").children("span").text((this.itemIndex + 1) + " of " + part.items.length);
		}
		//控制倒计时的显示
		if(testingDes.config.statusType != "review"){
			var relation = part.relation;
			if(relation && relation.examTime){
				//如果当前item存在倒计时
				if(this.timer == null || this.timer.relation.id != relation.id){
					//先停止倒计时
					this.stopTimer();
					//当前倒计时和此item的倒计时不是一个，重新开始
					var time = relation.examTime * 60;
					if(typeof lastTime != "undefined" && lastTime != null){
						time = lastTime;
					}
					this.initTimer(relation, time);
				}
			}else{
				//停止倒计时
				this.stopTimer();
			}
			if(this.timer != null){
				if(page.isExplain == "true"){
					//如果是说明页，暂停倒计时
					this.pauseTimer();
				}else{
					//开始计时
					this.activeTimer();
				}
			}
		}
//		console.log(item);
//		console.log(this.subjectList);
//		console.log(page.slidingType);
//		console.log(page.isExplain);
//		console.log("本组题目长度：" + this.subjectList.pages.length);
//		console.log(page);
//		console.log(this.itemIndex);
//		console.log(this.pageIndex);
	},
	/**
	 * 获取下一页
	 */
	getNext: function(){
		var result = {
			partIndex: this.partIndex,
			itemIndex: this.itemIndex,
			pageIndex: this.pageIndex
		};
		if(testingDes.config.statusType == "review"){
			if(this.pageIndex < this.subjectList.pages.length - 1){
				//查看当前大题还有没有下一页
				result.pageIndex++;
			}else if(this.itemIndex < this.items.length - 1){
				result.itemIndex++;
				result.pageIndex = 0;
			}else{
				result = null;
			}
		}else if(this.itemIndex < this.partStatus.itemIndex || this.pageIndex < this.partStatus.pageIndex){
			//说明是回退回去的，向后寻找一个问题页
			var part = this.parts[this.partIndex];
			for (var i = this.itemIndex; i <= this.partStatus.itemIndex; i++) {
				var item = part.items[i];
				var subjectData = item.item.subjectData;
				subjectData = decodeURIComponent(subjectData); //对题目的定义进行解码处理
				var pageList = JSON.parse(subjectData);
				var pageBegin = this.pageIndex + 1;
				if(i != this.itemIndex){
					//如果不是当前item组，从0开始
					pageBegin = 0;
				}
				for (var j = pageBegin; j < pageList.pages.length; j++) {
					var page = pageList.pages[j];
					if(page.isExplain == "false"){
						//不是说明页，返回
						result.itemIndex = i;
						result.pageIndex = j;
						return result; //在这里return出去
					}
				}
			}
		}else{
			if(this.pageIndex < this.subjectList.pages.length - 1){
				//查看当前大题还有没有下一页
				result.pageIndex++;
			}else if(this.itemIndex < this.items.length - 1){
				result.itemIndex++;
				result.pageIndex = 0;
			}else if(this.partIndex < this.parts.length - 1){
				result.partIndex++;
				result.itemIndex = 0;
				result.pageIndex = 0;
			}else{
				result = null;
			}
		}
		return result;
	},
	/**
	 * 下一页
	 */
	next: function(){
		var next = this.getNext();
		if(next == null){
			//提交试卷
			if(confirm("确认提交试卷？")){
				this.submit();
			}
		}else{
			var nextPart = false; //是否是进入了下一部分
			var goNext = true; //是否进入下一页
			if(next.partIndex != this.partIndex){
				goNext = confirm("确定要进入下一部分？");
				if(goNext){
					this.partStatus = {itemIndex: 0, pageIndex: 0};
					nextPart = true;
				}
			}
			if(goNext){
				if(testingDes.config.statusType != "review"){
					this.sendAnswer(next); //发送当前页的答案，不是在review状态下
				}
				this.partIndex = next.partIndex;
				this.itemIndex = next.itemIndex;
				this.pageIndex = next.pageIndex;
				this.play();
			}
			if(nextPart){
				//如果是进入了下一部分，构建这一部分的默认答案
				this.buildAnswer(); //构建答案
			}
		}
	},
	/**
	 * 获取上一页
	 */
	getBack: function(){
		if(testingDes.config.statusType == "review"){
			var result = {
				pageIndex: this.pageIndex,
				itemIndex: this.itemIndex
			};
			if(this.pageIndex > 0){
				//查看当前大题还有没有下一页
				result.pageIndex--;
			}else if(this.itemIndex > 0){
				result.itemIndex--;
				result.pageIndex = 0;
			}else{
				result = null;
			}
			return result;
		}else {
			var part = this.parts[this.partIndex];
			for (var i = this.itemIndex; i >= 0; i--) {
				var item = part.items[i];
				var subjectData = item.item.subjectData;
				subjectData = decodeURIComponent(subjectData); //对题目的定义进行解码处理
				var pageList = JSON.parse(subjectData);
				var pageBegin = this.pageIndex - 1;
				if(i != this.itemIndex){
					//如果不是当前item组，从最后一个开始
					pageBegin = pageList.pages.length - 1;
				}
				for (var j = pageBegin; j >= 0; j--) {
					var page = pageList.pages[j];
					if(page.isExplain == "false"){
						//不是说明页，返回
						return {
							itemIndex: i,
							pageIndex: j
						}
					}
				}
			}
		}
		return null;
	},
	/**
	 * 上一页
	 */
	back: function(){
		var back = this.getBack();
		if(back != null){
			//查看当前大题还有没有上一页，否则无法回退
			if(testingDes.config.statusType != "review"){
				//发送当前页的答案，不是在review状态下
				this.sendAnswer({partIndex: this.partIndex, itemIndex: back.itemIndex, pageIndex: back.pageIndex});
			}
			
			this.itemIndex = back.itemIndex;
			this.pageIndex = back.pageIndex;
			this.play();
		}
	},
	/**
	 * 构建整个部分的答案
	 */
	buildAnswer: function(){
		this.answers = [];
		var part = this.parts[this.partIndex];
		for (var i = 0; i < part.items.length; i++) {
			var item = part.items[i];
			var itemSubjectId = JSON.parse(decodeURIComponent(item.item.subjectData)).id;
			if(this.paperAnswers[itemSubjectId]){
				//如果当前答案中已经存在比大题的答案了，直接添加
				this.answers.push(this.paperAnswers[itemSubjectId]);
			}else{
				var subjectData = item.item.subjectData;
				subjectData = decodeURIComponent(subjectData); //对题目的定义进行解码处理
				var pageList = JSON.parse(subjectData);
				//开始一页一页循环
				var pages = pageList.pages;
				var itemAnswer = []; //此item的答案
				for (var pi = 0; pi < pages.length; pi++) {
					var page = pages[pi];
					var pageAnswer = this.getPageAnswer(pageList, pi);
					itemAnswer.push(pageAnswer);
				}
				this.answers.push(itemAnswer);
			}
		}
	},
	/**
	 * 发送答案，当下一页时执行
	 * @param {} nextPage 记录下一页是哪一页
	 */
	sendAnswer: function(nextPage){
		var itemIndex = this.itemIndex;
		var pageIndex = this.pageIndex;
		var item = this.items[itemIndex];
		var answerContent = this.answers[this.itemIndex]; //取到这一节的答案
		var pageAnswer = this.getPageAnswer(this.subjectList, this.pageIndex); //取到这一页的答案
		answerContent[this.pageIndex] = pageAnswer;
		var answerStr = JSON.stringify(answerContent);
		this.paperAnswers[this.subjectList.id] = answerContent; //添加到试卷答案中
		var subjectData = this.buildSubjectData(answerContent); //获取试题数据
		var subjectMark = subjectData.data.totalMark;
		var subjectDataStr = JSON.stringify(subjectData);
		this.paperDatas[this.subjectList.id] = subjectData;
		//请求参数data
		var data = {
			//API参数
			testId: Testing.testId, //测试ID
			testFrom: "tpo", //考试类型(toelf gre…)
			subjectId: this.subjectList.id, //试题ID
			subjectIndex: itemIndex, //试题索引
			subjectData: subjectDataStr, //试题数据
			examPoint: "", //考核点，暂时不添
			answerContent: answerStr, //作答内容
			pageIndex: pageIndex, //当前页索引
			leftTimes: "[]", //剩余时间
			isSubmit: 0, //是否提交
			extend: "", //扩展信息（前端信息储存使用）
			subjectExtend: JSON.stringify(nextPage), //习题扩展信息（习题备用），保存的是当前打开题目的索引
			subjectMark: subjectMark, //习题分数
			usedTime: 0 //使用时间
		};
		$.ajax({
			url: "test-save",
			type: "post",
			data: {
				method: "saveTestResultDetail",
				data: data
			}
		});
		var toelfRecords = $(".subject_box[n='org.neworiental.rmp.base::TOEFLRecord']");
		if(toelfRecords.length > 0){
			//如果有录音控件，上传录音
			toelfRecords.trigger("submit"); //提交录音
		}
	},
	/**
	 * 获取当前页的答案
	 */
	getPageAnswer: function(subjectList, pageIndex){
		var page = subjectList.pages[pageIndex];
		var pageAnswer = [];
		for (var ci = 0; ci < page.containers.length; ci++) {
			var container = page.containers[ci];
			//开始循环每一个控件
			if(container.contents && container.contents.length > 0){
				for (var eleIndex = 0; eleIndex < container.contents.length; eleIndex++) {
					var ele = container.contents[eleIndex];
					if(ele.className == "org.neworiental.rmp.base::OptionGroup"){
						//选择题
						var eleAnswer = [ele.className];
						var box = $("#" + ele.ID); //获取控件
						if(box.length > 0){
							//如果控件存在，则为当前页
							box.find("input[name=subject_select_radio]:checked").each(function(){
								var ind = parseInt($(this).attr("ind"));
								eleAnswer.push(ind);
							});						
						}
						pageAnswer.push(eleAnswer);
					}else if(ele.className == "org.neworiental.rmp.base::ToelfInsertPart"){
						//阅读插入
						var eleAnswer = [ele.className];
						var ans = -1;
						var box = $("#" + ele.ID); //获取控件
						if(box.length > 0){
							var inserted = box.find(".inserted");
							if(inserted.length > 0){
								ans = parseInt(inserted.attr("ind"));
							}
						}
						eleAnswer.push(ans);
						pageAnswer.push(eleAnswer);
					}else if(ele.className == "org.neworiental.rmp.base::TOEFLReadingDrag"){
						//阅读拖拽
						var eleAnswer = [ele.className];
						if(ele.answer){
							eleAnswer = eleAnswer.concat(ele.answer);
						}else{
							var blankNums = ele.blankNum.split("*^*");
							for(var i = 0; i < blankNums.length; i++){
								//添加题空
								var blankNum = parseInt(blankNums[i]);
								var bi = 0;
								while(bi < blankNum){
									eleAnswer.push(-1);
									bi++;
								}
							}
						}
						pageAnswer.push(eleAnswer);
					}else if(ele.className == "org.neworiental.rmp.base::TOEFLRecord"){
						//录音
						var eleAnswer = [ele.className, ""];
						var box = $("#" + ele.ID); //获取控件
						if(box.length > 0){
							var recordId = box.attr("recordId");
							if(recordId){
								eleAnswer[1] = recordId;
							}
						}
						pageAnswer.push(eleAnswer);
					}else if(ele.className == "org.neworiental.rmp.base::BaseInputText"){
						//写作
						var eleAnswer = [ele.className];
						var ans = "";
						var box = $("#" + ele.ID); //获取控件
						if(box.length > 0){
							var text = box.find("textarea");
							ans = text.val();
						}
						eleAnswer.push(ans);
						pageAnswer.push(eleAnswer);
					}
				}
			}
		}
		return pageAnswer;
	},
	/**
	 * 构建SubjectData试题数据
	 */
	buildSubjectData: function(answerContent){
		var result = {
			gradeInfo: "[]",
			maxIndex: 0,
			index: 0,
			id: this.subjectList.id,
			times: []
		};
		/**************开始构建第一层**************/
		//当前页是第几个问题页，index参数应该是这样的
		var pages = this.subjectList.pages;
		for(var i = 0; i <= this.pageIndex; i++){
			var page = pages[i];
			if(page.isExplain == "false"){
				//如果是问题页，加1
				result.index++;
			}
		}
		//maxIndex是下一页的索引
		result.maxIndex = this.pageIndex + 1;
		if(result.maxIndex > pages.length - 1){
			result.maxIndex = pages.length - 1;
		}
		if(this.timer != null){
			result.times = [this.timer.time];
		}
		/**************开始构建第二层：data属性**************/
		var data = {
			id: this.subjectList.id,
			testPoint: null,
			subjectMark: 0, //CONFIRM 什么计算规则？貌似总是0
			totalMark: 0, //在下边构建每一页的data时，会计算，如果是客观题，加上题目的分值，为此答题的总分
			answerContent: answerContent
		};
		result.data = data;
		/**************开始构建第三层：data.data作答点属性**************/
		var pageDatas = [];
		data.data = pageDatas;
//		console.log(answerContent);
		for(var i = 0; i < pages.length; i++){
			var page = pages[i];
			//每一页的数据
			var pageAnswer = answerContent[i];
			var pageData = this.getPageData(page, data, pageAnswer);
			pageDatas.push(pageData);
		}
		return result;
	},
	/**
	 * 获取一页的data数据
	 */
	getPageData: function(page, data, pageAnswer){
		var pageData = {
			ID: page.ID,
			data: []
		};
//		if(page.isExplain == "true"){
//			//如果是说明页，直接返回
//			return pageData;
//		}
		for (var ci = 0; ci < page.containers.length; ci++) {
			var container = page.containers[ci];
			//开始循环每一个控件
			if(container.contents && container.contents.length > 0){
				for (var eleIndex = 0; eleIndex < container.contents.length; eleIndex++) {
					var ele = container.contents[eleIndex];
					if(ele.className == "org.neworiental.rmp.base::OptionGroup"){
						var userAnswer = this.getSubjectAnswer(pageAnswer, page, ele); //获取这个控件的作答结果
						//拼装一个控件的data数据
						var eleData = {
							ID: ele.ID,
							optionCount: ele.options.length,
							isResponse: true,
							type: ele.className,
							data: "",
							subjectiveItem: ele.subjectiveItem == "false" ? false : true,
							testPointID: [ele.testPointID],
							testPointName: [ele.testPointName],
							rightAnswer: JSON.parse(ele.rightAns),
							userAnswer: userAnswer, //用户作答结果
							userMark: [0], //用户得分，需要和正确答案比较，并且知道此题分值
							sourceMark: [parseInt(ele.sourceMark)] //原题分值
						};
						if(userAnswer.length <= 1){
							//没有作答
							eleData.isResponse = false;
						}else{
							//作答了
							//计算用户得分
							var allRight = true;
							if(userAnswer.length - 1 != eleData.rightAnswer.length){
								//长度不相等，不正确
								allRight = false;
							}else{
								//判断每一项是否相同
								for (var i = 1; i < userAnswer.length; i++) {
									if(userAnswer[i] != eleData.rightAnswer[i-1]){
										//有一项不对
										allRight = false;
										break;
									}
								}
							}
							if(allRight){
								//回答正确，设置用户分值
								eleData.userMark = eleData.sourceMark;
							}
						}
						pageData.data.push(eleData);
						//给总分加上这道题的分数
						var eleMark = parseInt(ele.sourceMark);
						if(eleMark){
							data.totalMark += eleMark;
						}
					}else if(ele.className == "org.neworiental.rmp.base::ToelfInsertPart"){
						var userAnswer = this.getSubjectAnswer(pageAnswer, page, ele); //获取这个控件的作答结果
						//拼装一个控件的data数据
						var eleData = {
							ID: ele.ID,
							isResponse: true,
							type: ele.className,
							data: "",
							subjectiveItem: ele.subjectiveItem == "false" ? false : true,
							testPointID: [ele.testPointID],
							testPointName: [ele.testPointName],
							rightAnswer: JSON.parse(ele.rightAns),
							userAnswer: userAnswer, //用户作答结果
							userMark: [0], //用户得分，需要和正确答案比较，并且知道此题分值
							sourceMark: [parseInt(ele.sourceMark)] //原题分值
						};
						if(userAnswer.length <= 1 || userAnswer[1] == -1){
							//没有作答
							eleData.isResponse = false;
						}else{
							//作答了
							//计算用户得分
							if(eleData.rightAnswer.length > 0){
								if(userAnswer[1] == eleData.rightAnswer[0]){
									//回答正确，设置用户分值
									eleData.userMark = eleData.sourceMark;
								}
							}
						}
						pageData.data.push(eleData);
						//给总分加上这道题的分数
						var eleMark = parseInt(ele.sourceMark);
						if(eleMark){
							data.totalMark += eleMark;
						}
					}else if(ele.className == "org.neworiental.rmp.base::TOEFLReadingDrag"){
						var userAnswer = this.getSubjectAnswer(pageAnswer, page, ele); //获取这个控件的作答结果
						//拼装一个控件的data数据
						var eleData = {
							ID: ele.ID,
							isResponse: false,
							type: ele.className,
							data: "",
							subjectiveItem: ele.subjectiveItem == "false" ? false : true,
							testPointID: [ele.testPointID],
							testPointName: [ele.testPointName],
							rightAnswer: JSON.parse(ele.rightAns),
							userAnswer: userAnswer, //用户作答结果
							userMark: [0], //用户得分，需要和正确答案比较，并且知道此题分值
							sourceMark: [parseInt(ele.sourceMark)] //原题分值
						};
						//判断是否作答
						for (var i = 1; i < userAnswer.length; i++) {
							if(userAnswer[i] != -1){
								//有一项填写了
								eleData.isResponse = true;
								break;
							}
						}
						if(eleData.isResponse){
							//如果作答了，计算得分
							//计算答对了几个
							var rightCount = 0;
							var allCount = eleData.rightAnswer.length;
							for (var i = 1; i < userAnswer.length; i++) {
								if(userAnswer[i] != -1 && userAnswer[i] == eleData.rightAnswer[i-1]){
									//有一项填写了
									rightCount++;
								}
							}
							var blankNums = ele.blankNum.split("*^*");
							if(blankNums.length > 1){
								//当题空类型数为多种时, 错一个 得2分 错两个 得1分 三个以上就没分
								if(rightCount >= allCount - 1){
									//错一个，或者全对
									eleData.userMark = [2];
								}else if(rightCount == allCount - 2){
									eleData.userMark = [1];
								}
							}else{
								//当题空类型数为1种时，采用 “部分答对且超过填空1/2得半分,不超过1/2得0分，全部答对满分”模式
								if(rightCount == allCount){
									eleData.userMark = eleData.sourceMark;
								}else if(rightCount >= Math.ceil(allCount / 2)){
									eleData.userMark = [parseInt(ele.sourceMark)/2];
								}
							}
						}
						pageData.data.push(eleData);
						//给总分加上这道题的分数
						var eleMark = parseInt(ele.sourceMark);
						if(eleMark){
							data.totalMark += eleMark;
						}
					}else if(ele.className == "org.neworiental.rmp.base::BaseInputText"){
						var userAnswer = this.getSubjectAnswer(pageAnswer, page, ele); //获取这个控件的作答结果
						//拼装一个控件的data数据
						var eleData = {
							ID: ele.ID,
							isResponse: false,
							type: ele.className,
							data: "",
							subjectiveItem: ele.subjectiveItem == "false" ? false : true,
							testPointID: [ele.testPointID],
							testPointName: [ele.testPointName],
							rightAnswer: JSON.parse(ele.rightAns),
							userAnswer: userAnswer, //用户作答结果
							userMark: [0], //用户得分，需要和正确答案比较，并且知道此题分值
							sourceMark: [parseInt(ele.sourceMark)] //原题分值
						};
						if(userAnswer[1] != ""){
							//有一项填写了
							eleData.isResponse = true;
						}
						pageData.data.push(eleData);
						//给总分加上这道题的分数
						var eleMark = parseInt(ele.sourceMark);
						if(eleMark){
							data.totalMark += eleMark;
						}
					}else if(ele.className == "org.neworiental.rmp.base::TOEFLRecord"){
						var userAnswer = this.getSubjectAnswer(pageAnswer, page, ele); //获取这个控件的作答结果
						//拼装一个控件的data数据
						var eleData = {
							ID: ele.ID,
							isResponse: true,
							type: ele.className,
							data: "",
							subjectiveItem: ele.subjectiveItem == "false" ? false : true,
							testPointID: [ele.testPointID],
							testPointName: [ele.testPointName],
							rightAnswer: JSON.parse(ele.rightAns),
							userAnswer: userAnswer, //用户作答结果
							userMark: [0], //用户得分，需要和正确答案比较，并且知道此题分值
							sourceMark: [parseInt(ele.sourceMark)] //原题分值
						};
						pageData.data.push(eleData);
						//给总分加上这道题的分数
						var eleMark = parseInt(ele.sourceMark);
						if(eleMark){
							data.totalMark += eleMark;
						}
					}
				}
			}
		}
		return pageData;
	},
	/**
	 * 获取一道题（一个控件）的答案
	 * @param [] pageAnswer 一页的答案
	 * @param {} page 一页题的定义
	 * @param {} subject 一个控件的定义
	 */
	getSubjectAnswer: function(pageAnswer, page, subject){
		var answers = [];
		for (var i = 0; i < pageAnswer.length; i++) {
			var eleAnswer = pageAnswer[i];
			if(eleAnswer[0] == subject.className){
				//先从本页答案中，单独拿出属于此控件类型的答案，构建成数组
				answers.push(eleAnswer);
			}
		}
		var subjectIndex = -1;
		for (var ci = 0; ci < page.containers.length; ci++) {
			var container = page.containers[ci];
			//开始循环每一个控件
			if(container.contents && container.contents.length > 0){
				for (var eleIndex = 0; eleIndex < container.contents.length; eleIndex++) {
					var ele = container.contents[eleIndex];
					if(ele.className == subject.className){
						//第几个在此页中，此控件属于第几个，即可与答案对应上
						subjectIndex++;
					}
					if(ele.ID == subject.ID){
						return answers[subjectIndex];
					}
				}
			}
		}
		return null;
	},
	/**
	 * 提交试卷
	 */
	submit: function(){
		var data = {
			//API参数
			testId: Testing.testId, //测试ID
			testFrom: "tpo", //考试类型(toelf gre…)
			subjectIndex: 0, //试题索引
			pageIndex: 0, //当前页索引
			leftTimes: "[]", //剩余时间
			isSubmit: 1, //是否提交
			totalMark: 0,
			totalUseTime: 0,
			extend: "",
			subjects: []
		};
		//构建一下当前页的答案
		var answerContent = this.answers[this.itemIndex]; //取到这一节的答案
		var pageAnswer = this.getPageAnswer(this.subjectList, this.pageIndex); //取到这一页的答案
		answerContent[this.pageIndex] = pageAnswer;
		this.paperAnswers[this.subjectList.id] = answerContent; //添加到试卷答案中
		var subjectData = this.buildSubjectData(answerContent); //获取试题数据
		this.paperDatas[this.subjectList.id] = subjectData;
		//构造subjects
		for(var subjectId in this.paperAnswers){
			var ans = this.paperAnswers[subjectId];
			var subjectData = this.paperDatas[subjectId];
			var subData = {
				subjectId: subjectId,
				subjectData: JSON.stringify(subjectData),
				answerContent: JSON.stringify(ans),
				subjectMark: subjectData.data.totalMark,
				examPoint: null,
				usedTime: 0,
				subjectExtend: ""
			};	
			data.subjects.push(subData);
		}
		$.ajax({
			url: "test-save",
			type: "post",
			data: {
				method: "finishTest",
				data: data
			},
			success: function(){
				alert("提交成功!");
				$("#header_right_normal").find("input").unbind();
			}
		});
	},
	/**
	 * 倒计时
	 * @type {relation: relation对象, interval: setInterval对象, time: 剩余秒数}
	 */
	timer: null,
	/**
	 * 初始化倒计时
	 */
	initTimer: function(relation, time){
		$("#header_timer").show();
		$("#btn_timer").val("hideTime");
		this.timer = {};
		this.timer.relation = relation;
		this.timer.time = time;
		this.timer.interval = null;
	},
	/**
	 * 激活定时器，在题目页时
	 */
	activeTimer: function(){
		var begin = new Date().getTime(); //开始时间
		if(this.timer.interval != null){
			return;
		}
		function displayTime(){
			var last = Player.timer.time; //剩下多少秒
			var hours = Math.floor(last / 3600);
			if(hours < 10){
				hours = "0" + hours;
			}
			var minutes = Math.floor((last - hours * 3600) / 60);
			if(minutes < 10){
				minutes = "0" + minutes;
			}
			var seconds = last % 60;
			if(seconds < 10){
				seconds = "0" + seconds;
			}
			if(last <= 0){
				//倒计时结束
				clearInterval(Player.timer.interval);
				alert("倒计时已到！");
				//跳转到下一部分
				var part = Player.parts[Player.partIndex];
				for (var i = Player.itemIndex; i < part.items.length; i++) {
					//发送当前大题，与此部分后边的大题的答题结果
					if(Player.itemIndex != i){
						//不是当前页
						Player.pageIndex = 0;
					}
					Player.itemIndex = i;
					var item = Player.items[Player.itemIndex];
					//获取到item题目的定义
					var subjectData = item.item.subjectData;
					subjectData = decodeURIComponent(subjectData); //对题目的定义进行解码处理
					Player.subjectList = JSON.parse(subjectData);
					Player.sendAnswer({partIndex: Player.partIndex + 1, itemIndex: 0, pageIndex: 0});
				}
				Player.partIndex++;
				Player.itemIndex = 0;
				Player.pageIndex = 0;
				Player.play();
			}
			$("#header_timer").text(hours + " : " + minutes + " : " + seconds);
		}
		this.timer.interval = setInterval(function(){
			var now = new Date().getTime();
			var past = now - begin;
			var pastSeconds = Math.floor(past / 1000);
			if(pastSeconds == 0){
				return;
			}
			begin = now;
			Player.timer.time -= pastSeconds; //timer计时还剩下多少秒
			displayTime();
		}, 250);
		displayTime();
		$("#header_timer_box").show();
	},
	/**
	 * 暂停倒计时，在说明页时
	 */
	pauseTimer: function(){
		if(this.timer != null){
			clearInterval(this.timer.interval);
			this.timer.interval = null;
		}
		$("#header_timer_box").hide();
	},
	/**
	 * 停止倒计时
	 */
	stopTimer: function(){
		this.pauseTimer();
		this.timer = null;
	},
	/**
	 * 构建items
	 */
	buildItems: function(){
		function build(treeNode, parent){
			if(treeNode.items && treeNode.items.length > 0){
				var relation;
				if(treeNode.relation){
					relation = treeNode.relation;
				}else if(parent && parent.relation){
					relation = parent.relation;
				}
				if(relation){
					treeNode.relation = relation;
				}
				if(parent){
					treeNode.displayName = parent.name + "/" + treeNode.name;
				}else{
					treeNode.displayName = treeNode.name;
				}
				Player.parts.push(treeNode);
//				for (var i = 0; i < treeNode.items.length; i++) {
//					var item = treeNode.items[i];
//					if(parent){
//						item.displayName = parent.name + "/" + treeNode.name;
//					}else{
//						item.displayName = treeNode.name;
//					}
//					Player.items.push(item);
//					var relation;
//					if(treeNode.relation){
//						relation = treeNode.relation;
//					}else if(parent && parent.relation){
//						relation = parent.relation;
//					}
//					if(relation){
//						Player.relations[item.id] = relation;
//					}
//				}
			}else if(treeNode.trees && treeNode.trees.length > 0){
				//有子节点，递归构建
				for (var i = 0; i < treeNode.trees.length; i++) {
					var childTreeNode = treeNode.trees[i];
					build(childTreeNode, treeNode);
				}
			}
		}
		this.parts = [];
		for (var i = 0; i < this.structItem.length; i++) {
			var part = this.structItem[i];
			build(part);
		}
	},
	/**
	 * 判断一页中是否包含题目
	 */
	containsSubject: function(page){
		for (var ci = 0; ci < page.containers.length; ci++) {
			var container = page.containers[ci];
			//开始循环每一个控件
			if(container.contents && container.contents.length > 0){
				for (var eleIndex = 0; eleIndex < container.contents.length; eleIndex++) {
					var ele = container.contents[eleIndex];
					if(ele.className == "org.neworiental.rmp.base::OptionGroup"){
						return true;
					}else if(ele.className == "org.neworiental.rmp.base::ToelfInsertPart"){
						return true;
					}else if(ele.className == "org.neworiental.rmp.base::TOEFLReadingDrag"){
						return true;
					}else if(ele.className == "org.neworiental.rmp.base::BaseInputText"){
						return true;
					}else if(ele.className == "org.neworiental.rmp.base::TOEFLRecord"){
						return true;
					}
				}
			}
		}
		return false;
	}
};

/**
 * 作答回顾
 * @type {}
 */
var Review = {
	init: function(){
		var partResults = [];
		for (var pi = 0; pi < Player.parts.length; pi++) {
			var part = Player.parts[pi];
			var partResult = {
				displayName: part.displayName,
				name: part.name,
				correctCount: 0,
				subjectCount: 0,
				userMark: 0,
				totalMark: 0,
				subjects: []
			};
			//开始循环part下每一个item
			for (var ti = 0; ti < part.items.length; ti++) {
				var item = part.items[ti];
				var subjectData = item.item.subjectData;
				subjectData = decodeURIComponent(subjectData); //对题目的定义进行解码处理
				var subjectList = JSON.parse(subjectData);
				//每一个大题的答案
				var itemAnswer = Player.paperAnswers[subjectList.id];
				//开始一页一页的循环
				for (var pageInd = 0; pageInd < subjectList.pages.length; pageInd++) {
					var page = subjectList.pages[pageInd];
					var pageAnswer = null;
					if(itemAnswer && itemAnswer[pageInd]){
						pageAnswer = itemAnswer[pageInd];
					}
					//试题信息
					var subjectInfo = this.getPageSubjectInfo(page, pageAnswer);
					if(subjectInfo != null){
						//是题目页
						var sub = {
							partIndex: pi,
							itemIndex: ti,
							pageIndex: pageInd,
							des: subjectInfo.des,
							rightAns: subjectInfo.rightAns,
							userAns: subjectInfo.userAns
						};
						partResult.subjectCount++;
						partResult.totalMark += subjectInfo.mark;
						partResult.userMark += subjectInfo.userMark;
						partResult.subjects.push(sub);
						if(subjectInfo.right){
							partResult.correctCount++;
						}
					}
				}
			}
			partResults.push(partResult);
		}
		this.buildList(partResults);
		this.show();
	},
	/**
	 * 构建页面
	 */
	buildList: function(partResults){
		//开始构建页面
		var content = $("#review_content");
		for (var i = 0; i < partResults.length; i++) {
			var result = partResults[i];
			content.append("<div class='review_title'>"+result.displayName+"</div>");
			if(result.name != "Speaking" && result.name != "Writing"){
				//口语和写作部分不显示统计信息
				content.append("<div class='review_statis'>正确数/题目数：<span>"+result.correctCount+" / "+result.subjectCount+"</span>得分/总分：<span>"+result.userMark+" / "+result.totalMark+"</span></div>");
			}
			var grid = $("<ul class='review_grid'></ul>").appendTo(content);
			grid.append("<li class='hd'><div class='review_no'>NO.</div><div class='review_des'>Description</div><div class='review_uanswer'>Your Answer</div><div class='review_canswer'>Correct Answer</div><div class='review_correct'></div></li>")
			for (var si = 0; si < result.subjects.length; si++) {
				var sub = result.subjects[si];
				var subItem = $("<li class='item'><div class='review_no'>"+(si+1)+"</div><div class='review_des'>"+sub.des+"</div><div class='review_uanswer'>"+sub.userAns+"</div><div class='review_canswer'>"+sub.rightAns+"</div><div class='review_correct'><span class='tpbtn'>未批改</span></div></li>")
				subItem.appendTo(grid);
				if(si % 2 != 0){
					subItem.addClass("dif");
				}
				subItem.attr({
					partIndex: sub.partIndex,
					itemIndex: sub.itemIndex,
					pageIndex: sub.pageIndex
				});
				subItem.bind("click", function(){
					//点击选中，并跳转
					$("#review_content").find(".review_selected").removeClass("review_selected");
					$(this).addClass("review_selected");
					var oldPartIndex = Player.partIndex;
					Player.partIndex = parseInt($(this).attr("partIndex"));
					Player.itemIndex = parseInt($(this).attr("itemIndex"));
					Player.pageIndex = parseInt($(this).attr("pageIndex"));
					if(Player.partIndex != oldPartIndex){
						Player.buildAnswer();
					}
					Player.play();
				});
			}
		}
	},
	/**
	 * 显示review窗口
	 */
	show: function(){
		$("#dlg_paper_review").dlg();
	},
	/**
	 * 获取一页题的题目信息
	 */
	getPageSubjectInfo: function(page, pageAnswer){
		var containsObjective = false; //是否有客观题
		var result = {
			des: "",
			mark: 0,
			rightAns: "",
			userAns: "",
			userMark: 0,
			right: false
		};
		for (var ci = 0; ci < page.containers.length; ci++) {
			var container = page.containers[ci];
			//开始循环每一个控件
			if(container.contents && container.contents.length > 0){
				for (var eleIndex = 0; eleIndex < container.contents.length; eleIndex++) {
					var ele = container.contents[eleIndex];
					if(ele.className == "org.neworiental.rmp.base::BaseRichTxt"){
						//普通文本，添加描述信息
						result.des += testingDes.utils.toText(ele.htmlText) + "&nbsp;&nbsp;";
					}else if(ele.className == "org.neworiental.rmp.base::BaseTLFText"){
						//富文本，添加描述信息
						result.des += testingDes.utils.toText(decodeURIComponent(ele.text)) + "&nbsp;&nbsp;";
					}else if(ele.className == "org.neworiental.rmp.base::OptionGroup"){
						containsObjective = true;
						//添加得分和正确答案
						var rightAnswer = JSON.parse(ele.rightAns);
						var userAnswer = null;
						if(pageAnswer){
							userAnswer = Player.getSubjectAnswer(pageAnswer, page, ele); //获取这个控件的作答结果
						}
						var ansLabel = ["A", "B", "C", "D", "E", "F"];
						//把正确答案转为A B C
						if(rightAnswer && rightAnswer.length > 0){
							for (var ai = 0; ai < rightAnswer.length; ai++) {
								if(ai != 0){
									result.rightAns += ",";
								}
								var answerIndex = rightAnswer[ai];
								result.rightAns += ansLabel[answerIndex];
							}
						}
						//把用户答案转为A B C
						if(userAnswer && userAnswer.length > 1){
							for (var ai = 1; ai < userAnswer.length; ai++) {
								if(ai != 1){
									result.userAns += ",";
								}
								var answerIndex = userAnswer[ai];
								result.userAns += ansLabel[answerIndex];
							}
						}
						//判断对错
						var allRight = false;
						if(rightAnswer && userAnswer && userAnswer.length > 1){
							if(userAnswer.length - 1 == rightAnswer.length){
								allRight = true;
								//长度相等，再进一步判断每一项是否相同
								for (var i = 1; i < userAnswer.length; i++) {
									if(userAnswer[i] != rightAnswer[i-1]){
										//有一项不对
										allRight = false;
										break;
									}
								}
							}
						}
						result.right = allRight;
						if(ele.sourceMark){
							result.mark = parseInt(ele.sourceMark);
							if(allRight){
								result.userMark = result.mark;
							}
						}
					}else if(ele.className == "org.neworiental.rmp.base::ToelfInsertPart"){
						containsObjective = true;
						//添加得分和正确答案
						var rightAnswer = JSON.parse(ele.rightAns);
						var userAnswer = null;
						if(pageAnswer){
							userAnswer = Player.getSubjectAnswer(pageAnswer, page, ele); //获取这个控件的作答结果
						}
						//设置正确答案
						if(rightAnswer && rightAnswer.length > 0){
							result.rightAns = "第" + (rightAnswer[0] + 1) + "空";
						}
						//设置用户答案
						if(userAnswer && userAnswer.length > 1 && userAnswer[1] != -1){
							result.userAns = "第" + (userAnswer[1] + 1) + "空";
						}
						//判断对错
						var allRight = false;
						if(rightAnswer && rightAnswer.length > 0 && userAnswer && userAnswer.length > 1){
							if(userAnswer[1] != -1 && userAnswer[1] == rightAnswer[0]){
								//回答正确
								allRight = true;
							}
						}
						result.right = allRight;
						if(ele.sourceMark){
							result.mark = parseInt(ele.sourceMark);
							if(allRight){
								result.userMark = result.mark;
							}
						}
					}else if(ele.className == "org.neworiental.rmp.base::TOEFLReadingDrag"){
						containsObjective = true;
						//添加得分和正确答案
						var rightAnswer = JSON.parse(ele.rightAns);
						var userAnswer = null;
						if(pageAnswer){
							userAnswer = Player.getSubjectAnswer(pageAnswer, page, ele); //获取这个控件的作答结果
						}
						//设置正确答案
						if(rightAnswer && rightAnswer.length > 0){
							for (var ai = 0; ai < rightAnswer.length; ai++) {
								if(ai != 0){
									result.rightAns += ",";
								}
								var answerIndex = rightAnswer[ai];
								result.rightAns += "第" + (answerIndex + 1) + "空";
							}
						}
						//设置用户答案
						if(userAnswer && userAnswer.length > 1){
							for (var i = 1; i < userAnswer.length; i++) {
								if(userAnswer[i] != -1){
									if(result.userAns != ""){
										result.userAns += ",";
									}
									var answerIndex = userAnswer[i];
									result.userAns += "第" + (answerIndex + 1) + "空";
								}
							}
						}
						//判断对错与得分
						if(ele.sourceMark){
							result.mark = parseInt(ele.sourceMark);
						}
						if(rightAnswer && rightAnswer.length > 0 && userAnswer && userAnswer.length > 1){
							var rightCount = 0;
							var allCount = rightAnswer.length;
							for (var i = 1; i < userAnswer.length; i++) {
								if(userAnswer[i] != -1 && userAnswer[i] == rightAnswer[i-1]){
									//有一项填写正确
									rightCount++;
								}
							}
							if(rightCount == allCount){
								//全部正确
								result.right = true;
							}
							var blankNums = ele.blankNum.split("*^*");
							if(blankNums.length > 1){
								//当题空类型数为多种时, 错一个 得2分 错两个 得1分 三个以上就没分
								if(rightCount >= allCount - 1){
									//错一个，或者全对
									result.userMark = 2;
								}else if(rightCount == allCount - 2){
									result.userMark = 1;
								}
							}else{
								//当题空类型数为1种时，采用 “部分答对且超过填空1/2得半分,不超过1/2得0分，全部答对满分”模式
								if(rightCount == allCount){
									result.userMark = result.mark;
								}else if(rightCount >= Math.ceil(allCount / 2)){
									result.userMark = [parseInt(result.mark)/2];
								}
							}
						}
					}else if(ele.className == "org.neworiental.rmp.base::BaseInputText"){
						containsObjective = true;
						result.rightAns = "---";
						result.userAns = "---";
						var userAnswer = null;
						if(pageAnswer){
							userAnswer = Player.getSubjectAnswer(pageAnswer, page, ele); //获取这个控件的作答结果
						}
						if(userAnswer && userAnswer.length > 1){
							result.userAns = userAnswer[1];
						}
					}else if(ele.className == "org.neworiental.rmp.base::TOEFLRecord"){
						containsObjective = true;
						result.rightAns = "---";
						result.userAns = "---";
					}
				}
			}
		}
		if(containsObjective){
			return result;
		}else{
			return null;
		}
	}
};


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


