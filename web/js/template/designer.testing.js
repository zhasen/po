

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
		audioImgPath: "http://116.213.70.92/files_test/oms/data/online/resource/0dc00d23-e8c8-436c-af49-f04b45dd368d/201412/04/"
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
		Player.init();
	},
	paper: null,
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
		this.paper = paperDef.result;
		console.log(paperDef);
		$("#paper_name").text(this.paper.paperName);
		Player.structItem = this.paper.structItem.trees; //试卷有几个部分
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
		this.buildItems();
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
		this.buildAnswer(); //构建第一部分答案
		Player.play();
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
	 */
	play: function(){
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
		subjectData = decodeURIComponent(subjectData); //对题目的定义惊醒解码处理
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
		if(page.slidingType == "normal_mode"){
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
		var relation = part.relation;
		if(relation && relation.examTime){
			//如果当前item存在倒计时
			if(this.timer == null || this.timer.relation.id != relation.id){
				//先停止倒计时
				this.stopTimer();
				//当前倒计时和此item的倒计时不是一个，重新开始
				this.initTimer(relation);
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
		if(this.itemIndex < this.partStatus.itemIndex || this.pageIndex < this.partStatus.pageIndex){
			//说明是回退回去的，向后寻找一个问题页
			var part = this.parts[this.partIndex];
			for (var i = this.itemIndex; i <= this.partStatus.itemIndex; i++) {
				var item = part.items[i];
				var subjectData = item.item.subjectData;
				subjectData = decodeURIComponent(subjectData); //对题目的定义惊醒解码处理
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
				//TODO 提交试卷
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
				this.sendAnswer(); //发送当前页的答案
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
		var part = this.parts[this.partIndex];
		for (var i = this.itemIndex; i >= 0; i--) {
			var item = part.items[i];
			var subjectData = item.item.subjectData;
			subjectData = decodeURIComponent(subjectData); //对题目的定义惊醒解码处理
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
		return null;
	},
	/**
	 * 上一页
	 */
	back: function(){
		var back = this.getBack();
		if(back != null){
			//查看当前大题还有没有上一页，否则无法回退
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
			var subjectData = item.item.subjectData;
			subjectData = decodeURIComponent(subjectData); //对题目的定义惊醒解码处理
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
	},
	/**
	 * 发送答案，当下一页时执行
	 */
	sendAnswer: function(){
		var itemIndex = this.itemIndex;
		var pageIndex = this.pageIndex;
		var item = this.items[itemIndex];
		var answerContent = this.answers[this.itemIndex]; //取到这一节的答案
		var pageAnswer = this.getPageAnswer(this.subjectList, this.pageIndex); //取到这一页的答案
		answerContent[this.pageIndex] = pageAnswer;
		var answerStr = JSON.stringify(answerContent);
		var subjectData = this.buildSubjectData(answerContent); //获取试题数据
		var subjectMark = subjectData.data.totalMark;
		var subjectDataStr = JSON.stringify(subjectData);
		
		//请求参数data
		var data = {
			//API参数
			testId: Testing.paper.id, //TODO 测试ID
			testFrom: "tpo", //考试类型(toelf gre…)
			subjectId: item.subjectId, //试题ID
			subjectIndex: itemIndex, //试题索引
			subjectData: subjectDataStr, //试题数据
			examPoint: "", //考核点，暂时不添
			answerContent: answerStr, //作答内容
			pageIndex: pageIndex, //当前页索引
			leftTimes: "[]", //剩余时间
			isSubmit: 0, //是否提交
			extend: "", //扩展信息（前端信息储存使用）
			subjectExtend: "", //习题扩展信息（习题备用）
			subjectMark: subjectMark, //习题分数
			usedTime: 0 //使用时间
		};
		console.log(data);
		$.ajax({
			url: "test-save",
			type: "post",
			data: {
				method: "saveTestResultDetail",
				data: data
			}
		});
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
		if(page.isExplain == "true"){
			//如果是说明页，直接返回
			return pageData;
		}
		
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
						data.totalMark += eleMark;
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
	 * 倒计时
	 * @type {relation: relation对象, interval: setInterval对象, time: 剩余秒数}
	 */
	timer: null,
	/**
	 * 初始化倒计时
	 */
	initTimer: function(relation){
		$("#header_timer").show();
		$("#btn_timer").val("hideTime");
		this.timer = {};
		this.timer.relation = relation;
		this.timer.time = relation.examTime * 60;
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
		this.timer.interval = setInterval(function(){
			var now = new Date().getTime();
			var past = now - begin;
			var pastSeconds = Math.floor(past / 1000);
			if(pastSeconds == 0){
				return;
			}
			begin = now;
			Player.timer.time -= pastSeconds; //timer计时还剩下多少秒
			var last = Player.timer.time; //剩下多少秒
			var hours = Math.floor(last / 3600);
			if(hours < 10){
				hours = "0" + hours;
			}
			var minutes = Math.floor(last / 60);
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
			}
			$("#header_timer").text(hours + " : " + minutes + " : " + seconds);
		}, 250);
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


