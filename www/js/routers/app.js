'use strict';

define([
    'backbone',
    'app',
    'views/app'
], function(Backbone, App, AppView) {
    var appView;

    var AppRouter = Backbone.Router.extend({
        routes:{
            '': 'index'
        },

        initialize: function() {
            return this;
        },

        index: function() {
            if (!appView) {
                // Initialize the application view and assign it as a global.
                appView = new AppView();
                window.app = appView;
            }
        }
    })

    return AppRouter;
});
