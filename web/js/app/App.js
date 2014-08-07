define(['jQuery', 'skeleton', 'Bootstrap', './schedules_stu', './schedules_tch', './schedule','./interactionClass'],
    function ($, sk, Bootstrap) {
        /*var Spa = sk.Spa.extend({
            configure: function () {
                var viewName = $('#_moduleViewName').val();
                if (!viewName) {
                    return;
                }

                var ModuleView = require('app/' + viewName);
                var view = new ModuleView();
                $('body section div[data-view-id=manager]').replaceWith(view.el);
            }
        });*/

        return Spa;
    });