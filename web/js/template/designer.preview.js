
define(['./common','jquery_qeditor','./designer.core','./designer.business'],
function($, $qEdit, Designer) {

    /**
     * 业务处理
     */
    var previewDes;

    $(function(){
        //todo 判断url是否为同一个URL
        var curUrl =  window.location.href;
        /*
         * 当前URl没有ID，从浏览器本地缓存获取数据，否则从数据库获取数据
         * http://localhost:3000/tqt-preview？testQuestionContentID=ucrjii89
         */
        if(curUrl.indexOf("/tqt-preview?") < 0){
            var define = $.localStorage.get("paperListObj");
            if(define){
                if(typeof define == "string"){
                    subjectList = JSON.parse(define);
                }
                else{
                    subjectList = define;
                }
            }
            else{
                subjectList = [];
            }
        }else{
            //todo 从数据库获取数据

        }


        //初始化
        previewDes = new Designer({
            target: $("#preview_designer"),
            status: "test"
        });


        //预览按钮处理
        $("#btn_preview_subjects").bind("click", function(){
            //打开新的页面
            window.open("/tqt-preview");
            //将试卷页缓存到本地
            $.localStorage.set("paperListObj",JSON.stringify(subjectList));
        });


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
             * 打开预览
             */
            show: function(){

                if(subjectList.length == 0){
                    return;
                }
//                $("#subject_designer").hide();
//                $("#preview_designer").show();
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
                this.curentInex--;
                previewDes.open(subjectList[this.curentInex]);
                resizeView();
            },
            /**
             * 退出
             */
            exit: function(){
                if(confirm("您确定要关闭本页吗？")){
                    window.opener=null;
                    window.open('','_self');
                    window.close();
                }else{}
                resizeView();
            }
        }

        Preview.init();
        Preview.show();
    });
});

