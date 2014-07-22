define(['jQuery'], function ($) {

    $(function () {

        $(".nav li").hover(function () {
            $(this).children(".menu").addClass("curren_state").siblings().removeClass("curren_state");
            $(this).children(".menu").next().show();
        }, function () {
            $(this).children(".menu").removeClass("curren_state");
            $(this).children(".menu").next().hide();
        })

        $(".lp_class_list li").hover(function () {
            $(this).find(".hasended").animate({opacity: '1'}, "600");
        }, function () {
            $(this).find(".hasended").animate({opacity: '0.5'}, "600");
        })
        
    })

});


