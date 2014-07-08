define(['jQuery', './fullcalendar', './zh-cn', './custom_po'], function ($, fullcalendar, lang, custom_po) {
    var course_schedule = {};
    course_schedule.fullcalendar = fullcalendar;
    course_schedule.lang = lang;
    course_schedule.custom_po = custom_po;
    return course_schedule;
});