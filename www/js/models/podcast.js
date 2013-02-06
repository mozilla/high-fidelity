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
            name: 'Untitled Podcast',
            rssData: null,
            rssURL: null
        },

        initialize: function() {
            // TODO: Actually check against a real time.
            if (this.get('lastUpdated') === 0) {
                this.update();
            }
        },

        cover: function(callback) {
            return '/img/no-cover.jpg';
            DataStore.get('podcast-cover-{0}'.format([this.id]), callback);
        },

        // When deleting a Podcast, delete all its Episodes as well.
        destroy: function(options) {
            this.episodes().forEach(function(e) {
                e.destroy();
            });

            this.trigger('destroyed');

            return Backbone.Model.prototype.destroy.call(this, options);
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

        // Simply return the RSS data for this podcast.
        rss: function() {
            return this.get('rssData') ? JSON.parse(this.get('rssData')) : null;
        },

        update: function() {
            var Episode = require('models/episode');
            var Episodes = require('collections/episodes');
            var self = this;

            RSS.download(this.get('rssURL'), function(result) {
                result.items.forEach(function(episode) {
                    self.set({
                        imageURL: result['itunes:image'],
                        name: result.title,
                    });

                    self.save();

                    // If this episode doesn't exist in our database, it's
                    // new and we should create it!
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
