define(['jQuery'],
    function ($) {

        $(function(){
            $(".nav li").hover(function(){
                $(this).children(".menu").addClass("curren_state").siblings().removeClass("curren_state");
                $(this).children(".menu").next().show();
            },function(){
                $(this).children(".menu").removeClass("curren_state");
                $(this).children(".menu").next().hide();
            })
        })

        $(function(){
            var $div_li = $(".mt_tab .tab_menu li");
            $div_li.click(function(){
                $(this).addClass("selected").siblings().removeClass("selected");
                var index = $div_li.index(this);
                $(".tab_box > ul").eq(index).show().siblings().hide();
            })
        })

        $(function(){
            $(".tab_box ul li").hover(function(){
                $(this).children('.getinto').show();
            },function(){
                $(this).children('.getinto').hide();
            })
        })

    });

