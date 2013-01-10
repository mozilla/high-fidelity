'use strict';

define([
  'underscore',
  'backbone',
  'blod',
  'require'
], function(_, Backbone, Blod, require) {
    var EpisodeModel = Backbone.Model.extend({
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
            Blod.destroy(this.id);

            return Backbone.Model.prototype.destroy.call(this, options);
        },

        podcast: function() {
            var Podcasts = require('collections/podcasts');
            return Podcasts.where({id: this.get('podcastID')})[0];
        },

        _getBlob: function(callback) {
          Blod.get(this.id, callback);
        },

        _setBlob: function(blob) {
          var self = this;

          Blod.save(this.id, blob, function() {
            self.set({
              isDownloaded: true
            });
            self.save();
          });
        }
    });

    return EpisodeModel;
});
