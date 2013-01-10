'use strict';

define([
  'underscore',
  'backbone',
  'localstorage',
  'models/episode'
], function(_, Backbone, Store, Episode) {
  var EpisodesCollection = Backbone.Collection.extend({
    model: Episode,

    localStorage: new Store('Episodes'),

    // Sort podcasts by their published date.
    comparator: function(episode) {
      return episode.get('datePublished');
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
})
