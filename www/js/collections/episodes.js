'use strict';

define([
    'underscore',
    'backbone',
    'localstorage',
    'models/episode'
], function(_, Backbone, Store, Episode) {
    var EpisodesCollection = Backbone.Collection.extend({
        model: Episode,

        // Custom properly sets this model to only sync with localStorage and
        // never attempt to talk to a server.
        localStorage: new Store('Episodes'),

        // Sort podcasts by their published date.
        comparator: function(episode) {
            return -(new Date(episode.get('datePublished')).getTime());
        },

        // Easy way to delete all episodes, including their blob data in indexedDB.
        deleteAll: function() {
            this.models.forEach(function(model) {
                model.destroy();
            });

            this.reset();
        }
    });

    return new EpisodesCollection();
});
