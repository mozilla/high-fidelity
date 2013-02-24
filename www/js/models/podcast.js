'use strict';

define([
    'underscore',
    'backbone',
    'datastore',
    'rss',
    'collections/podcasts',
    'require'
], function(_, Backbone, DataStore, RSS, Podcasts, require) {
    var PodcastModel = Backbone.Model.extend({
        collection: Podcasts,
        defaults: {
            lastUpdated: 0,
            name: null,
            rssData: null,
            rssURL: null
        },

        // When this podcast is loaded, let's try to update it.
        initialize: function() {
            if (!this.get('lastUpdated') || window.timestamp() - this.get('lastUpdated') > window.GLOBALS.TIME_TO_UPDATE) {
                this.update();
            }

            this.loadImage();
            this.on('image:downloaded', this.loadImage);
        },

        // When deleting a Podcast, delete all its Episodes as well.
        destroy: function(options) {
            this.episodes().forEach(function(e) {
                e.destroy();
            });

            DataStore.destroy('podcastCover-{id}'.format({id: this.get('id')}));

            return Backbone.Model.prototype.destroy.call(this, options);
        },

        // Download the cover image and update it in the blob datastore. Fires
        // events to let any views know the image has changed.
        downloadCoverImage: function() {
            var self = this;

            this.trigger('downloadImageStarted');

            var request = new window.XMLHttpRequest({mozSystem: true});

            request.open('GET', this.get('imageURL'), true);
            request.responseType = 'blob';

            request.addEventListener('load', function(event) {
                self.saveImage(request.response);
            });

            request.send(null);
        },

        // Return all episodes belonging to this podcast.
        episodes: function(where) {
            var Episodes = require('collections/episodes');

            if (where) {
                where = _.extend(where, {podcastID: this.get('id')});
            } else {
                where = {podcastID: this.get('id')};
            }
            return Episodes.where(where);
        },

        loadImage: function() {
            var self = this;

            DataStore.get('podcastCover-' + this.get('id'), function(blob) {
                if (!blob || !blob.file) {
                    return;
                }

                self.coverImage = window.URL.createObjectURL(blob.file);
                self.trigger('image:available');
            });
        },

        // Simply return the RSS data for this podcast.
        rss: function() {
            return this.get('rssData') ? JSON.parse(this.get('rssData')) : null;
        },

        saveImage: function(blob) {
            var self = this;

            // TODO: Setup a separate "table" for different item types in the
            // datastore.
            DataStore.set('podcastCover-' + this.get('id'), blob, function() {
                self.trigger('image:downloaded');
            });
        },

        // Update this podcast from the RSS feed, but don't download any
        // new episodes by default.
        update: function() {
            var Episode = require('models/episode');
            var Episodes = require('collections/episodes');
            var self = this;

            RSS.download(this.get('rssURL'), function(result) {
                if (!result) {
                    return;
                }

                // If the result of downloading and parsing an RSS feed is
                // just a string, it means we received a redirect with a new
                // RSS feed URL. In the future it might be worth unabstracting
                // that from the RSS reader, or making it an Exception or
                // some special return code.
                if (typeof(result) === 'string') {
                    self.set({rssURL: result});
                    self.update();
                    return;
                }

                result.items.forEach(function(episode, i) {
                    // TODO: Handle episode saving better; for now, simply get
                    // the most recent 15 podcasts.
                    // TODO: Remove magic constant.
                    if (i > 15) {
                        return;
                    }
                    var oldImageURL = self.get('imageURL');

                    self.set({
                        imageURL: result['itunes:image'],
                        name: result.title
                    });
                    self.save();

                    // If the cover image has changed (or this podcast is new)
                    // we update the cover image.
                    if (!oldImageURL || oldImageURL !== self.get('imageURL')) {
                        self.downloadCoverImage();
                    }

                    // If no episodes exist in our database, this podcast is
                    // new and we should download some!
                    if (self.episodes({guid: episode.guid}).length === 0) {
                        var episodeInstance = new Episode(_.extend({
                            datePublished: episode.pubDate,
                            podcastID: self.get('id')
                        }, episode));

                        Episodes.add(episodeInstance);
                        episodeInstance.save();
                    }
                });

                self.set({lastUpdated: window.timestamp()});
                self.save();

                self.trigger('updated');
            });
        }
    });

    return PodcastModel;
});
