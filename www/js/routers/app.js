'use strict';

define([
    'backbone',
    'app',
    'views/app'
], function(Backbone, App, AppViews) {
    var appView;
    var AppRouter = Backbone.Router.extend({
        routes:{
            // 'podcast/:id': 'podcast',
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

        podcast: function(id) {
            console.log(id);
            // Show a podcast's episodes
            appView.showPodcast(id);
        }
    })

    return AppRouter;
});
