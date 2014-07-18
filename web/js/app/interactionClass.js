define(['jQuery'],
    function ($) {
        if ($('#_moduleViewName').val() == 'interactionClass') {

            $(function () {
                var $div_li = $(".mt_tab .tab_menu li");
                $div_li.click(function () {
                    $(this).addClass("selected").siblings().removeClass("selected");
                    var index = $div_li.index(this);
                    $(".tab_box > ul").eq(index).show().siblings().hide();
                })

                $(".tab_box ul li").hover(function () {
                    $(this).children('.getinto').show();
                }, function () {
                    $(this).children('.getinto').hide();
                })

            })
<<<<<<< HEAD
=======
        });

        $(function(){
            $(".tab_box ul li").hover(function(){
                $(this).children('.getinto').show();
            },function(){
                $(this).children('.getinto').hide();
            })
        });

        $(function() {

        });
>>>>>>> feivorid

        }
    });




