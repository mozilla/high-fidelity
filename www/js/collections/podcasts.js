/*jshint forin:false, plusplus:false, sub:true */
define([
    'underscore',
    'backbone',
    'localstorage',
    'collections/episodes',
    'models/podcast'
], function(_, Backbone, Store, Episodes, Podcast) {
    'use strict';

    // The user's single collection of Podcasts, loaded into the main app tab.
    var PodcastsCollection = Backbone.Collection.extend({
        model: Podcast,

        // Custom properly sets this model to only sync with localStorage and
        // never attempt to talk to a server.
        localStorage: new Store('Podcasts'),

        // Sort podcasts by their published date.
        comparator: function(podcast) {
            return podcast.get('name');
        },

        // Easy way to delete all episodes, including their blob data in indexedDB.
        deleteAll: function() {
            this.models.forEach(function(model) {
                model.destroy();
            });

            this.reset();
        },

        // Load all podcasts and episodes, making sure anything new is in the
        // collection.
        loadAll: function(callback) {
            this.fetch({
                success: function(podcasts) {
                    Episodes.fetch({
                        success: callback,
                        error: function(podcasts) {
                            // TODO: Obviously, make this better.
                            window.alert('Error loading podcasts data. Contact support: tofumatt@mozilla.com');
                        }
                    });
                },
                // If a user manually messed with localStorage data or
                // something else very bad happened the collection data could
                // be corrupted.
                // TODO: Reset collection data when this happens?
                error: function(podcasts) {
                    // TODO: Obviously, make this better.
                    window.alert('Error loading podcasts data. Contact support: tofumatt@mozilla.com');
                }
            });
        }
    });

    return new PodcastsCollection();
});
