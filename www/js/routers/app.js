'use strict';

define([
    'backbone',
    'app',
    'views/app'
], function(Backbone, App, AppViews) {
    var AppRouter = Backbone.Router.extend({
        routes:{
            '': 'index'
        },

        initialize: function() {
            return this;
        },

        index: function() {
            // Initialize the application view.
            var view = new AppViews.Main();
        }
    })

    return AppRouter;
});
