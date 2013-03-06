'use strict';

define([
    'backbone',
    'app',
    'views/app'
], function(Backbone, App, AppViews) {
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
                // Initialize the application view.
                appView = new AppViews.Main();
            }
        }
    })

    return AppRouter;
});
