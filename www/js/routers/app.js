'use strict';

define([
    'backbone',
    'app',
    'views/app',
    'views/webactivities'
], function(Backbone, App, AppView, WebActivityViews) {
    var appView;

    var AppRouter = Backbone.Router.extend({
        routes:{
            'subscribeFromWebActivity': 'webActivitySubscribe',
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
        },

        webActivitySubscribe: function(feed) {
            var subscribeView = new WebActivityViews.Subscribe();
            subscribeView.subscribeTo(feed);
        }
    })

    return AppRouter;
});
