/*!
 Podcasts | https://github.com/mozilla/high-fidelity
*/

// Require.js shortcuts to our libraries.
require.config({
    paths: {
        async_storage: 'lib/async_storage',
        backbone: 'lib/backbone',
        localstorage: 'lib/backbone.localstorage',
        jed: 'lib/jed',
        tpl: 'lib/tpl',
        underscore: 'lib/lodash',
        zepto: 'lib/zepto'
    },
    // The shim config allows us to configure dependencies for
    // scripts that do not call define() to register a module.
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
    'app'
], function(App) {
    'use strict';

    App.initialize();
});
