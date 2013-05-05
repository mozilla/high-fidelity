'use strict';

define([
    'underscore',
    'backbone',
    'localstorage',
    'collections/episodes',
    'models/podcast'
], function(_, Backbone, Store, Episodes, Podcast) {
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
                success: function(podcast) {
                    Episodes.fetch({
                        success: callback
                    });
                }
            });
        }
    });

    return new PodcastsCollection();
});
