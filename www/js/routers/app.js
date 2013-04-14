'use strict';

define([
    'backbone',
    'app',
    'views/app'
], function(Backbone, App, AppViews) {
    var appView;
    var AppRouter = Backbone.Router.extend({
        routes:{
            'subscribe/:feed': 'webActivitySubscribe',
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
        },

        webActivitySubscribe: function(feed) {
            var subscribeView = new AppViews.WebActivitySubscribe();
            subscribeView.subscribeTo(feed);
        }
    })

    return AppRouter;
});
