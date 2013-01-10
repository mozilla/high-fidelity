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
            if (!this.model.get('id')) {
                Episodes.add(this.model);
                this.model.save();
            }

            this.el = '#podcast-{id}'.format({
                id: this.model.get('podcastID') ? this.model.get('podcastID') : 'no-id'
            });
            this.$el = $(this.el);

            if (!this.model.get('isDownloaded')) {
                this.downloadEpisode();
            }

            this.render();
        },

        downloadEpisode: function() {
            var self = this;

            var request = new window.XMLHttpRequest();

            request.open('GET', this.model.get('enclosure').url, true);
            request.responseType = 'blob';

            request.addEventListener('load', function(event) {
                self.model.blob(request.response, self.render);
            });

            request.send(null);
        },

        render: function() {
            var html = this.template({
                episode: this.model
            });

            var episode = this.$el.children('#episode-{id}'.format({
                id: this.model.get('id')}
            ));

            if (episode.length) {
                episode.html(html);
            } else {
                this.$el.append(html);
            }
        },

        play: function(event) {
            if ($(event.originalTarget).data('episodeid') === this.model.get('id')) {
                var player = new PlayerView({
                    model: this.model
                });
            }
        }
    });

    return EpisodeView;
});
