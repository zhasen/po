define(['jQuery', './fullcalendar', './zh-cn', './custom_calendar'], function ($, fullcalendar, lang, custom_calendar) {
    var course_schedule = {};
    course_schedule.fullcalendar = fullcalendar;
    course_schedule.lang = lang;
    course_schedule.custom_calendar = custom_calendar;
    return course_schedule;
});