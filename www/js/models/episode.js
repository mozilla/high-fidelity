'use strict';

define([
  'underscore',
  'backbone',
  'datastore',
  'collections/episodes',
  'require'
], function(_, Backbone, DataStore, Episodes, require) {
    var EpisodeModel = Backbone.Model.extend({
        collection: Episodes,
        defaults: {
            isDownloaded: false,
            url: null
        },

        // Access (or set) an app's blob data in indexedDB.
        blob: function(blobDataOrCallback) {
          if (blobDataOrCallback instanceof Function) {
            this._getBlob(blobDataOrCallback);
          } else {
            this._setBlob(blobDataOrCallback);
          }
        },

        // Extend Backbone's default destroy method so we also delete the
        // podcast blob in indexedDB.
        destroy: function(options) {
            DataStore.destroy(this.id);

            return Backbone.Model.prototype.destroy.call(this, options);
        },

        podcast: function() {
            var Podcasts = require('collections/podcasts');
            return Podcasts.where({id: this.get('podcastID')})[0];
        },

        _getBlob: function(callback) {
          DataStore.get(this.id, callback);
        },

        _setBlob: function(blob) {
          var self = this;

          DataStore.set(this.id, blob, function() {
            self.set({
              isDownloaded: true
            });
            self.save();
            self.trigger('updated');
          });
        }
    });

    return EpisodeModel;
});
