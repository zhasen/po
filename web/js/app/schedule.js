define(['jQuery', 'Bootstrap', '../course_schedule/custom_po'],
    function ($, Bootstrap, calendar) {

        var userid = $('#userid').val();
        var userType = $('#userType').val();
        var schoolid = $('#schoolid').val();
        var code = $('#code').val();

        calendar.myRenderCalendar(userid, userType, schoolid, code);

    });


