/*global Backbone:true */
/*!
 Podcasts | https://github.com/mozilla/high-fidelity
*/
'use strict';

// Require.js allows us to configure shortcut alias
require.config({
    paths: {
        backbone: 'lib/backbone',
        localstorage: 'lib/backbone.localstorage',
        jed: 'lib/jed',
        // jsmad: 'lib/jsmad',
        // indexedDB: 'lib/indexeddb',
        install: 'lib/install',
        // sink: 'lib/sink',
        tpl: 'lib/tpl',
        underscore: 'lib/lodash',
        zepto: 'lib/zepto'
    },
    // The shim config allows us to configure dependencies for
    // scripts that do not call define() to register a module
    shim: {
        'backbone': {
            deps: [
                'underscore',
                'zepto'
            ],
            exports: 'Backbone'
        },
        // 'jsmad': {
        //     deps: [
        //         'sink'
        //     ],
        //     exports: 'Mad'
        // },
        // 'indexedDB': {
        //     exports: 'indexedDB'
        // },
        // 'sink': {
        //     exports: 'Sink'
        // },
        'underscore': {
            exports: '_'
        },
        'zepto': {
            exports: 'Zepto'
        }
    }
});

require([
    'app',
    'routers/app'
], function(App, AppRouter) {
    function init() {
        // Initialize routing and start Backbone.history()
        var router = new AppRouter();
        window.router = router;

        Backbone.history.start();
    }

    App.initialize(init);
});
