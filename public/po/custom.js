function l(con){
    console.log(con);
}

var xdf;
xdf =(function( xdf ){



    return xdf;
})( xdf || {});

$(function(){

    $(".bigPigBg_JS").css({
        "width":$(window).width(),
        "height":663*$(window).width()/1300
    });
    $(".xlBg_JS").css({
        "width":$(window).width(),
        "height":663*$(window).width()/1300
    });




    /*var n=5;
    var h = window.setInterval(fun,100);
    function fun(){
        n++;
        if(n>=54){
            n=5;
        }
        $(".xlBg_JS").attr("src","public/img/xl/"+n+".png");
    }*/




    $(".picCon_JS").css({
        "left":$(window).width()/2-500,
        "top":$(window).width()*660/1300/2-$(".picCon_JS").height()/2
    });

    var time = 200;

    $(".onebtn_JS").each(function(index){
        $(this).hover(
            function(){
                var thisEle = $(this);
                var t = $($(this).parent().parent().find(".turn_JS")[index]);
                //添加第1个css效果
                t.addClass("turn1");
                //n秒后应用第2个效果
                setTimeout(fun,time);
                function fun(){
                    //先移除第1个效果
                    t.removeClass("turn1");
                    //换图
                    t.find("img.tu_JS").attr("src","/public/build/img/po/images/boxf.png");
                    //第2个效果
                    t.addClass("turn2");
                    //文字消失
                    t.find(".wz_JS").hide();
                    //内容出现
                    t.find(".con_JS").show();
                    //添加新的事件
                    thisEle.bind("mouseup",function(){
                        href = t.attr("href-data");
                        window.location = href;
                    });

                    //n秒后应用第3个效果
                    setTimeout(fun,time);
                    function fun(){
                        //先移除第2个效果
                        t.removeClass("turn2");
                        //标志
                        t.addClass("ok");
                    }
                }



            },
            function(){
                var thisEle = $(this);
                var t = $($(this).parent().parent().find(".turn_JS")[index]);
                //第3个效果
                t.addClass("turn3");
                //n秒后应用第4个效果
                setTimeout(fun,time);
                function fun(){
                    //先移除第3个效果
                    t.removeClass("turn3");
                    //换图
                    t.find("img.tu_JS").attr("src","/public/build/img/po/images/boxz.png");
                    //第3个效果
                    t.addClass("turn4");
                    //文字出现
                    t.find(".wz_JS").show();
                    //内容消失
                    t.find(".con_JS").hide();

                    //n秒后应用第4个效果
                    setTimeout(fun,time);
                    function fun(){
                        //先移除第4个效果
                        t.removeClass("turn4");
                        //标志
                        t.removeClass("ok");
                        $(".lala").unbind("mouseout");
                    }
                }


            }
        );
    })

































    $(".tianCongBox_JS").css({
         "height":663*$(window).width()/1300-80
    });









});
