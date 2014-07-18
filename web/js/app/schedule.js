define(['jQuery', 'Bootstrap', '../course_schedule/custom_calendar'],
    function ($, Bootstrap, calendar) {
        if ($('#_moduleViewName').val() == 'schedule') {
            var userid = $('#userid').val();
            var userType = $('#userType').val();
            var schoolid = $('#schoolid').val();
            var code = $('#code').val();

            calendar.myRenderCalendar(userid, userType, schoolid, code);
        }

    });


