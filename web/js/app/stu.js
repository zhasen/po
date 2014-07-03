define(['jQuery', 'Bootstrap', '../course_schedule/custom_po'], function ($, Bootstrap, calendar) {

    $('#myTab a:first').tab('show'); // 默认显示第一个标签

    $('a[data-toggle="tab"]').on('show', function (e) {
        if (e.target.hash == '#my-schedule') {
            calendar.renderCalendar();
        }
//        alert('activated tab: ' + e.target.hash);
//        alert('previous tab: ' + e.relatedTarget.hash);
    })

});


