/*global _:true, App:true, Backbone:true */
/*jshint forin:false, plusplus:false, sub:true */
'use strict';

define([
    'zepto',
    'underscore',
    'backbone',
    'app',
    'collections/podcasts',
    'models/podcast',
    'views/episode',
    'text!templates/podcast-cover.ejs',
    'text!templates/podcast.ejs'
], function($, _, Backbone, App, Podcasts, Podcast, EpisodeView, PodcastCoverTemplate, PodcastTemplate) {
    var PodcastItemView = Backbone.View.extend({
        className: 'podcast',
        el: '#podcasts',
        $el: $('#podcasts'),
        model: Podcast,
        template: _.template(PodcastCoverTemplate),

        events: {
            'click .reveal': 'showEpisodes'
        },

        initialize: function() {
            var self = this;

            if (!this.model.get('id')) {
                Podcasts.add(this.model);
                this.model.save();
            }

            if (this.model.get('lastUpdated') === 0) {
                this.model.update(function() {
                    self.render();
                });
            }

            this.model.on('destroyed', function() {
                self.remove();
            });

            this.render();
        },

        render: function() {
            var html = this.template({
                podcastCover: this.model.cover(),
                podcast: this.model
            });

            var podcast = this.$el.children('#podcast-{id}'.format({
                id: this.model.get('id')}
            ));

            if (podcast.length) {
                podcast.html(html);
            } else {
                this.$el.append(html);
            }
        },

        showEpisodes: function(event) {
            console.log(event);
            var episodes = new PodcastView({
                model: this.model
            });
            $('#podcasts-modal').show();
        }
    });

    var PodcastView = Backbone.View.extend({
        className: 'podcast',
        el: '#podcasts-modal',
        $el: $('#podcasts-modal'),
        model: Podcast,
        template: _.template(PodcastTemplate),

        events: {
            'click .destroy': 'destroy'
        },

        initialize: function() {
            var self = this;

            this.model.on('destroyed', function() {
                self.remove();
            });

            this.render();
        },

        render: function() {
            var html = this.template({
                podcast: this.model
            });

            var podcast = this.$el.children('#podcast-details-{id}'.format({
                id: this.model.get('id')}
            ));

            if (podcast.length) {
                podcast.html(html);
            } else {
                this.$el.append(html);
            }

            this.model.episodes().forEach(function(episode) {
                var view = new EpisodeView({
                    model: episode
                });
            });
        },

        destroy: function(event) {
            console.log($(event.originalTarget).data('podcastid') === this.model.get('id'));
            if ($(event.originalTarget).data('podcastid') === this.model.get('id')) {
                this.model.destroy();
            }
        }
    });

    return {
        cover: PodcastItemView,
        detail: PodcastView
    };
});
