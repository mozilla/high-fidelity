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
    'text!templates/podcasts/cover.ejs',
    'text!templates/podcasts/details.ejs'
], function($, _, Backbone, App, Podcasts, Podcast, EpisodeView, PodcastCoverTemplate, PodcastDetailsTemplate) {
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

            _(this).bindAll('hideEpisodes', 'showEpisodes');

            if (!this.model.get('id')) {
                Podcasts.add(this.model);
                this.model.save();
            }

            this.model.on('destroyed', function() {
                self.remove();
            });

            this.model.on('image:available', function() {
                self.render();
            })

            this.model.on('updated', function() {
                self.render();
            });

            this.render();
        },

        render: function() {
            var html = this.template({
                podcastCover: this.model.coverImage,
                podcast: this.model
            });

            var podcast = this.$el.children('#podcast-{id}'.format({
                id: this.model.get('id')}
            ));

            if (podcast.length) {
                podcast.replaceWith(html);
            } else {
                this.$el.append(html);
            }
        },

        showEpisodes: function(event) {
            if ($(event.currentTarget).data('podcastid') !== this.model.get('id')) {
                return;
            }

            this.episodesView = new PodcastView({
                model: this.model
            });
            $('#podcasts').hide();
            $('#back,#podcast-details').show();
        },

        hideEpisodes: function() {
            $('#back,#podcast-details').hide();
            $('#podcasts').show();
            this.episodesView.remove();
        }
    });

    var PodcastView = Backbone.View.extend({
        className: 'podcast',
        el: '#podcast-details',
        $el: $('#podcast-details'),
        model: Podcast,
        template: _.template(PodcastDetailsTemplate),

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

            this.$el.addClass('active');
        },

        destroy: function(event) {
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
