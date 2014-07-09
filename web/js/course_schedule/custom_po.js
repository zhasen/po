define(['./fullcalendar', './zh-cn'], function ($, moment) {

    var calendar = {};

    calendar.$ = $;

    calendar.myRenderCalendar = function (userid) {
        $('#calendar').fullCalendar('destroy');
        $('#calendar').fullCalendar({
            theme: true,
            header: {
                left: 'prev,next,today',
                center: 'title',
                right: 'agendaWeek'
            },
            lang: 'zh-cn',
            defaultView: 'agendaWeek',
            contentHeight: 450,
            themeButtonIcons: {
                prev: 'circle-triangle-w',
                next: 'circle-triangle-e'
            },
            minTime: "06:00:00",
            maxTime: "24:00:00",
            slotDuration: '00:30:00',
            events: {
                url: '/schedule-data?userid=' + userid,
                cache: false, // 正式启用时用 true，测试时用false
                error: function () {
                    console.log('schedule-data:err');
                }
            },
            loading: function (bool) {
                //$('#loading').toggle(bool);
            },
            eventColor: '#378006',
            eventBorderColor: 'red',
            eventBackgroundColor: 'green',
            eventTextColor: 'blue'
        });
    }

    return calendar;

});
