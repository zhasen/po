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
//        ,'common': {
//            deps: ['jQuery']
//        },
//        'designer_core': {
//            deps: ['editor']
//        },
//        'designer_business': {
//            deps: ['designer_core']
//        }
    },
    packages: ["skeleton", "misc", "config", "app", "template", "fullcalender"],
    //packages: ["skeleton", "misc", "config", "app"],
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
        fullcalendar: './fullcalendar/fullcalendar'
//        ,common: './template/common',
//        designer_core: './template/designer.core',
//        designer_business: './template/designer.business'
    },
    deps: ['app', 'misc', 'template', 'fullcalendar'],
    //deps: ['app', 'misc'],
    callback: function () {
    },
    preserveLicenseComments: false
});

//require(['designer_business']);
