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
    'views/dialogs',
    'views/episode',
    'text!templates/podcasts/cover.ejs',
    'text!templates/podcasts/details.ejs'
], function($, _, Backbone, App, Podcasts, Podcast, DialogViews, EpisodeView, PodcastCoverTemplate, PodcastDetailsTemplate) {
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

            _(this).bindAll('destroy', 'hideEpisodes', 'showEpisodes');

            if (!this.model.get('id')) {
                Podcasts.add(this.model);
                this.model.save();
            }

            this.model.on('destroy', function() {
                self.destroy();
            });

            this.model.on('image:available', function() {
                self.render();
            });

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
                id: this.model.get('id')
            }));

            if (podcast.length) {
                podcast.replaceWith(html);
            } else {
                this.$el.append(html);
            }
        },

        destroy: function() {
            this.$el = this.$el.children('#podcast-{id}'.format({
                id: this.model.get('id')
            }));

            this.remove();
        },

        hideEpisodes: function() {
            $('#back,#podcast-details').hide();
            $('#podcasts').show();

            this.episodesView.remove();
        },

        showEpisodes: function(event) {
            if ($(event.currentTarget).data('podcastid') !== this.model.get('id')) {
                return;
            }

            this.episodesView = new PodcastView({
                model: this.model,
                parentView: this
            });
            $('#podcasts').hide();
            $('#back,#podcast-details').show();
        }
    });

    var PodcastView = Backbone.View.extend({
        className: 'podcast',
        el: '#podcast-details',
        $el: $('#podcast-details'),
        model: Podcast,
        template: _.template(PodcastDetailsTemplate),

        events: {
            'click .destroy': 'destroyPrompt'
        },

        initialize: function() {
            var self = this;

            _(this).bindAll('destroy');

            this.model.on('destroy', function() {
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

        destroy: function() {
            window.app.goBack();

            this.model.destroy();
        },

        destroyPrompt: function(event) {
            var self = this;

            var dialog = new DialogViews.DeletePodcast({
                confirm: function() {
                    self.destroy();
                },
                templateData: _.defaults({
                    description: null
                }, {
                    imageURL: self.model.coverImage,
                    podcast: self.model
                })
            });
        }
    });

    return {
        cover: PodcastItemView,
        detail: PodcastView
    };
});
