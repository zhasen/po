define(['jQuery', './fullcalendar', './custom_po'], function ($, custom_po, fullcalendar) {
    var course_schedule = {};
    course_schedule.custom_po = custom_po;
    course_schedule.fullcalendar = fullcalendar;
    return course_schedule;
});