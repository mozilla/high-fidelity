'use strict';

define([
    'backbone',
    'app',
    'views/app'
], function(Backbone, App, AppView) {
    var appView;

    var AppRouter = Backbone.Router.extend({
        routes:{
            'podcast/:uid': 'podcastDetails',
            'podcasts/add': 'podcastsAdd',
            'podcasts': 'podcastsList',
            'search': 'search',
            '': 'index'
        },

        initialize: function() {
            if (!appView) {
                // Initialize the application view and assign it as a global.
                appView = new AppView();
                window.app = appView;
            }

            return this;
        },

        // The index is only used to navigate to the list of podcasts for now.
        // In the future, a "first run" screen could be displayed here.
        // TODO: Add "first run" screen?
        index: function() {
            console.log(window.location.hash);
            this.navigate('podcasts', {trigger: true});
        },

        // The "detailed" view of a podcast; its list of episodes. This is
        // where the user can download more episodes manually, play an episode,
        // and unsubscribe to the podcast.
        podcastDetails: function(uid) {
            console.log(window.location.hash);
        },

        // The modal, manual "add" input form used to subscribe to a podcast
        // manually using a feed URL.
        podcastsAdd: function() {
            console.log(window.location.hash);
        },

        // The standard screen; a list of podcast covers a user can scroll
        // through.
        podcastsList: function() {
            console.log(window.location.hash);
            window.app.activateTab('podcasts');
        },

        // Search input screen, where a user can search the iTunes podcasts
        // database for podcasts to subscribe to.
        search: function() {
            console.log(window.location.hash);
            window.app.activateTab('search');
        }
    });

    return AppRouter;
});
