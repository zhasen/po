define(['./fullcalendar', './zh-cn'], function ($, moment) {

    $('#calendar').fullCalendar({
        theme: true,
        header: {
            left: 'prev,next,today',
            center: 'title',
            right: 'agendaWeek'
        },
        lang: 'zh-cn',
        defaultView: 'agendaWeek',
        viewRender: function (view, element) {
//            view.start = '16:00:00'
        },
        contentHeight: 600,
        themeButtonIcons: {
            prev: 'circle-triangle-w',
            next: 'circle-triangle-e'
        },
        events: [
            {
                title: 'All Day Event',
                start: '2014-06-01'
            },
            {
                title: 'Long Event',
                start: '2014-06-07',
                end: '2014-06-10',
                color: 'red'
            },
            {
                id: 999,
                title: 'Repeating Event',
                start: '2014-06-09T16:00:00'
            },
            {
                id: 999,
                title: 'Repeating Event',
                start: '2014-06-16T16:00:00'
            },
            {
                title: 'Meeting',
                start: '2014-06-12T10:30:00',
                end: '2014-06-12T12:30:00'
            },
            {
                title: 'Lunch',
                start: '2014-06-12T12:00:00'
            },
            {
                title: 'Birthday Party',
                start: '2014-06-13T07:00:00'
            },
            {
                title: 'Click for Google',
                url: 'http://google.com/',
                start: '2014-06-28'
            }
        ],
        eventColor: '#378006',
        eventBorderColor: 'red',
        eventBackgroundColor: 'green',
        eventTextColor: 'blue'

    });

});
