require.config({
    baseUrl: './web/js',
    shim: {
        'jQuery': {
            exports: '$'
        },
        'Underscore': {
            exports: '_'
        },
        'Backbone': {
            deps: ['Underscore', 'jQuery'],
            exports: 'Backbone'
        },
        'Bootstrap': {
            deps: ['jQuery']
        },
        'JST': {
            exports: 'JST'
        },
        'jqBootstrapValidation': {
            deps: ['jQuery']
        },
        'jquery_qeditor': {
            deps: ['jQuery']
        },
        'fullcalendar': {
            deps: ['jQuery']
        }
        ,'moment' : {
            deps: ['jQuery']
        }
    },
    packages: ["skeleton", "misc", "config", "app", "template", "course_schedule"],
    paths: {
        requireLib: '../../public/components/requirejs/require',
        jQuery: '../../public/components/jquery/jquery',
        Underscore: '../../public/components/underscore/underscore',
        Backbone: '../../public/components/backbone/backbone',
        Bootstrap: '../../public/components/bootstrap/js/bootstrap',
        Holder: '../../public/components/holderjs/holder',
        JST: '../../public/build/js/templates',
        jQueryCustom: 'jquery.custom',
        jqBootstrapValidation: '../../public/components/jqBootstrapValidation/dist/jqBootstrapValidation-1.3.7',
        jquery_qeditor: './template/plugs/editor/editor',
        fullcalendar: './course_schedule/fullcalendar',
        moment: '../../public/components/moment/moment'
    },
    deps: ['app', 'misc', 'template', 'course_schedule'],
    callback: function () {
    },
    preserveLicenseComments: false
});

//require(['designer_business']);
