define(['../po/jquery_selectMode', 'Bootstrap', '../course_schedule/custom_calendar'],
    function ($, Bootstrap, calendar) {
        if ($('#_moduleViewName').val() == 'schedules_stu') {

            var userid = $('#userid').val();
            var userType = $('#userType').val();
            var schoolid = $('#schoolid').val();
            var code = $('#code').val();

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

            $().selectMode('.s-ac', '.s-key', '.s-hdn'); // 班级下拉菜单

            var $sc_li = $(".sche_class_tab ul li"); // TAB切换
            $sc_li.click(function () {
                $(this).addClass("scseleted").siblings().removeClass("scseleted");
                var indexsc = $sc_li.index(this);
                $(".sche_class_box > .sche_class").eq(indexsc).show().siblings().hide();
                if (indexsc == 0) { // 显示课表
                    calendar.myRenderCalendar(userid, userType, schoolid, code);
                }
            })

            var tabname = $('#tabname').val();
            if (tabname == 'class') {
                $('#tab1').addClass("scseleted").siblings().removeClass("scseleted");
                $(".sche_class_box > .sche_class").eq(1).show().siblings().hide();
            } else if (tabname == 'schedule') {
                $('#tab0').addClass("scseleted").siblings().removeClass("scseleted");
                $(".sche_class_box > .sche_class").eq(0).show().siblings().hide();
                calendar.myRenderCalendar(userid, userType, schoolid, code);
            }

            // 点击下载班级下拉菜单，处理下载链接地址
            $(".option_class_download").click(function () {
                $('#scheduledl-url').attr({href: '/scheduledl-' + schoolid + '-' + $(this).children().attr('name')});
                // o_a_url.attr('href', o_a_url.attr('href').replace(/-(\w)+$/g, '-' + classCode));
            });

            // 班级列表 ajax 调取
            $('#search-class-button').click(function () {
                class_list($('#search-class').val());
            });

            // 班级列表 ajax 调取
            $('#search-class').keydown(function (event) {
                if ((event || window.event).keyCode == 13) {
                    class_list($(this).val());
                }
            })

            // 班级列表 ajax 调取
            function class_list(class_key) {
                $.getJSON('/classlist-data', {class_key: class_key, type: userType, schoolid: schoolid, code: code}, function (resp) {
                    var html = [];
                    resp.forEach(function (clas) {
                        html.push('<li><a href="class-' + clas.SchoolId + '-' + clas.ClassCode + '">');
                        html.push('<dl class="box ongoing">');
                        html.push('<dt class="f_l fs_14">');
                        html.push('<p>');
                        html.push('<a href="class-' + clas.SchoolId + '-' + clas.ClassCode + '" data-bypass>');
                        html.push(clas.ClassName);
                        html.push('</a></p>');
                        html.push('<p>' + clas.ClassCode + '</p>');
                        html.push(clas.poBeginDate + '-' + clas.poEndDate);
                        html.push('</dt>');
                        html.push('<dd class="f_r">');
                        html.push('<div class="course_level have_course fs_14">预备</div>');
                        html.push('<div class="course_stauts fc_3dc">');
                        html.push('<span class="lp_sicons icons_ing"></span>');
                        html.push(clas.ClassStatusText);
                        html.push('</div>');
                        html.push('</dd>');
                        html.push('</dl>');
                        html.push('</a>');
                        html.push('</li>');
                    });
                    $('#classlist_ul').html(html.join(''));
                });
            }


        }
    });


