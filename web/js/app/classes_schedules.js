define(['jQuery', 'Bootstrap', '../course_schedule/custom_po'],
    function ($, Bootstrap, calendar) {

        $('#classes-schedules-stu-tab a:first').tab('show'); // 默认显示第一个标签

        $('#classes-schedules-stu-tab a[data-toggle="tab"]').on('shown', function (e) {
            if (e.target.hash == '#my-schedule') {
                calendar.myRenderCalendar();
            }
        });

    });


