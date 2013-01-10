'use strict';

define([
    'underscore',
    'backbone',
    'rss',
    'require'
], function(_, Backbone, RSS, require) {
    var PodcastModel = Backbone.Model.extend({
        defaults: {
            name: 'Untitled Podcast',
            rssData: null,
            rssURL: null
        },

        addEpisode: function(episode) {
            var Episodes = require('collections/episodes');

            Episodes.add(episode);
            episode.save();
        },

        // When deleting a Podcast, delete all its Episodes as well.
        destroy: function(options) {
            this.episodes().each(function(e) {
                e.destroy();
            });

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
                    self.set({
                        name: result.title
                    });

                    self.save();

                    if (self.episodes({guid: episode.guid}).length === 0) {
                        var episodeInstance = new Episode(_.extend({
                            datePublished: episode.pubDate,
                            podcastID: self.get('id')
                        }, episode));

                        console.log(episodeInstance);

                        newEpisodes.push(episodeInstance);
                        self.addEpisode(episodeInstance);
                    }
                });

                if (callback) {
                    callback(newEpisodes);
                }
            });
        }
    });

    return PodcastModel;
});
