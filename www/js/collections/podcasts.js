'use strict';

define([
  'underscore',
  'backbone',
  'localstorage',
  'models/podcast'
], function(_, Backbone, Store, Podcast) {
    var PodcastsCollection = Backbone.Collection.extend({
        model: Podcast,

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
        }
    });

    return new PodcastsCollection();
});
