define(['jQuery', 'Bootstrap', '../course_schedule/custom_po'],
    function ($, Bootstrap, calendar) {

        var userid = $('#userid').val();
        var userType = $('#userType').val();
        var schoolid = $('#schoolid').val();
        var code = $('#code').val();

        var tabname = $('#tabname').val();
        if (tabname == 'class') {
            $('#schedules-stu-tab li:eq(0) a').tab('show'); // 默认显示第一个标签
        } else if (tabname == 'schedule') {
            $('#schedules-stu-tab li:eq(1) a').tab('show'); // 默认显示第二个标签
            calendar.myRenderCalendar(userid, userType, schoolid, code);
        }

        $('#schedules-stu-tab a[data-toggle="tab"]').on('shown', function (e) {
            if (e.target.hash == '#schedule') {
                calendar.myRenderCalendar(userid, userType, schoolid, code);
            }
        });

        $('#download-class').change(function () {
            var url = $('#schedule-download-url').attr('href');
            var classcode = $(this).val();
            $('#schedule-download-url').attr('href', url.replace(/classcode=(\w)*/g, 'classcode=' + classcode));
        });

    });


