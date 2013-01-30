/*global _:true, App:true, Backbone:true */
/*jshint forin:false, plusplus:false, sub:true */
'use strict';

define([
    'zepto',
    'underscore',
    'backbone',
    'app',
    'collections/episodes',
    'models/episode',
    'views/player',
    'text!templates/episode.ejs',
], function($, _, Backbone, App, Episodes, Episode, PlayerView, EpisodeTemplate) {
    var EpisodeView = Backbone.View.extend({
        className: 'episode',
        el: '#podcasts',
        $el: $('#podcasts'),
        model: Episode,
        tagName: 'li',
        template: _.template(EpisodeTemplate),

        events: {
            'click .play': 'play'
        },

        initialize: function() {
            var self = this;
            if (!this.model.get('id')) {
                Episodes.add(this.model);
                this.model.save();
            }

            this.el = '#podcast-details-{id} ul'.format({
                id: this.model.get('podcastID') ? this.model.get('podcastID') : 'no-id'
            });
            this.$el = $(this.el);

            if (!this.model.get('isDownloaded')) {
                this.model.download();
            }

            this.model.on('downloadStarted', function() {
                self.render({
                    isDownloading: true
                });
            });

            this.model.on('updated', function() {
                self.render();
            });

            this.render();
        },

        render: function(args) {
            if (!args) {
                args = {}
            }

            var html = this.template({
                episode: this.model,
                isDownloading: args.isDownloading,
                isQueued: args.isQueued
            });

            var episode = this.$el.children('#episode-{id}'.format({
                id: this.model.get('id')}
            ));

            if (episode.length) {
                episode.html(html);
            } else {
                this.$el.append(html);
            }

            // TODO: Scale size of text to fit in the list item element.
            // var episodeText = this.$el.children('#episode-{id}'.format({
            //     id: this.model.get('id')}
            // )).find('p')[0];
            // var episodeWidth = episodeText.offsetWidth;
            // var maxWidth = episodeText.parentNode.offsetWidth;
            // var scaleFactor = Math.min(1, (maxWidth - 5) / episodeWidth);
            // console.log(scaleFactor, episodeText);
            // episodeText.style.transform = 'scale(' + scaleFactor + ')';
            // episodeText.style.MozTransform = 'scale(' + scaleFactor + ')';
            // episodeText.style.WebkitTransform = 'scale(' + scaleFactor + ')';
        },

        play: function(event) {
            if ($(event.currentTarget).data('episodeid') === this.model.get('id')) {
                var player = new PlayerView({
                    model: this.model
                });
            }
        }
    });

    return EpisodeView;
});
