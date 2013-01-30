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
            if (this.get('lastUpdated') === 0) {
                this.update();
            }
        },

        addEpisode: function(episode) {
            var Episodes = require('collections/episodes');

            Episodes.add(episode);
            episode.save();
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

        rss: function() {
            return this.get('rssData') ? JSON.parse(this.get('rssData')) : null;
        },

        update: function(callback) {
            var Episode = require('models/episode');
            var self = this;

            RSS.download(this.get('rssURL'), function(result) {
                var newEpisodes = [];
                result.items.forEach(function(episode) {
                    // if (newEpisodes.length > 4) { // TODO: Magic constant!
                    //     return;
                    // }

                    self.set({
                        name: result.title
                    });

                    self.save();

                    if (self.episodes({guid: episode.guid}).length === 0) {
                        var episodeInstance = new Episode(_.extend({
                            datePublished: episode.pubDate,
                            podcastID: self.get('id')
                        }, episode));

                        // console.log(episodeInstance);

                        newEpisodes.push(episodeInstance);
                        self.addEpisode(episodeInstance);
                    }
                });

                self.set({lastUpdated: window.timestamp()});
                self.save();

                if (callback) {
                    callback(newEpisodes);
                }

                self.trigger('updated');
            });
        }
    });

    return PodcastModel;
});
