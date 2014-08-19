define(['./fullcalendar', './zh-cn'], function ($, moment) {

    var custom_calendar = {};

    custom_calendar.$ = $;

    custom_calendar.myRenderCalendar = function (userid, userType, schoolid, code) {
        $('#calendar').fullCalendar('destroy');
        $('#calendar').fullCalendar({
            //defaultDate: '2013-01-23', // 测试用，默认今天
            allDaySlot: false,
            theme: true,
            header: {
                left: 'prev, next', // prev, next, today
                center: '', // title
                right: '' // agendaWeek
            },
            lang: 'zh-cn',
            defaultView: 'agendaWeek',
            contentHeight: 450,
            themeButtonIcons: {
                prev: 'circle-triangle-w',
                next: 'circle-triangle-e'
            },
            minTime: "07:00:00",
            maxTime: "23:00:00",
            slotDuration: '00:30:00',
            axisFormat: 'HH:mm',
            /*events: [
                {title: 'Long Event', start: '2014-06-07', end: '2014-06-10'
                },{ id: 999, title: 'Repeating Event', start: '2014-06-09T16:00:00'
                },{ id: 999, title: 'Repeating Event', start: '2014-06-15T16:00:00'
                },{ title: 'Meeting', start: '2014-06-12T10:30:00', end: '2014-06-12T12:30:00'
                },{ title: 'Lunch', start: '2014-06-12T12:00:00'
                },{ title: 'Birthday Party', start: '2014-06-13T07:00:00' }
            ],*/
            events: {
                url: '/schedule-data?userid=' + userid + '&userType=' + userType + '&schoolid=' + schoolid + '&code=' + code,
                cache: false, // 正式启用时用 true，测试时用false
                error: function () {
                    console.log('schedule-data:err');
                }
            },
            timeFormat: 'HH:mm',
            loading: function (bool) {
                //$('#loading').toggle(bool);
            }
            /*eventColor: '#378006',
            eventBorderColor: 'red',
            eventBackgroundColor: 'green',
            eventTextColor: 'blue'*/
        });
    }

    return custom_calendar;

});
