/*global Backbone:true */
/*!
 Podcasts | https://github.com/tofumatt/podcasts
*/
'use strict';

// Require.js allows us to configure shortcut alias
require.config({
    paths: {
        backbone: 'lib/backbone',
        localstorage: 'lib/backbone.localstorage',
        install: 'lib/install',
        text: 'lib/require.text',
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

        Backbone.history.start();
    }

    App.initialize(init);
});
