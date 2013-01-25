/*global _:true, App:true, Backbone:true */
/*jshint forin:false, plusplus:false, sub:true */
'use strict';

define([
    'zepto',
    'underscore',
    'backbone',
    'app',
    'collections/episodes',
    'collections/podcasts',
    'models/episode',
    'models/podcast',
    'text!templates/player.ejs'
], function($, _, Backbone, App, Episodes, Podcasts, Episode, Podcast, PlayerTemplate) {
    var PlayerView = Backbone.View.extend({
        className: 'player',
        el: '#player',
        $el: $('#player'),
        model: Episode,
        template: _.template(PlayerTemplate),

        events: {
            'click #play-pause': 'playPause'
        },

        initialize: function() {
            var self = this;

            // It's possible to have an empty player, so we check to see if
            // there's an episode loaded; if not, don't bother with much.
            if (this.model.id) {
                this.getEpisode();

                this.model.on('destroyed', function() {
                    self.remove();
                });
            }

            this.render();
        },

        render: function() {
            // Re-rendering the play/pause buttons means redelegating events.
            this.undelegateEvents();

            var html = this.template({
                blobURL: this.options.blobURL,
                episode: this.model
            });

            this.$el.html(html);
        },

        downloadEpisode: function() {
            var self = this;

            var request = new window.XMLHttpRequest({mozSystem: true});

            request.open('GET', this.model.get('enclosure').url, true);
            request.responseType = 'blob';

            request.addEventListener('load', function(event) {
                self.model.blob(request.response, self.render);
            });

            request.send(null);
        },

        getEpisode: function() {
            var self = this;

            this.model.blob(function(podcast) {
                if (podcast && podcast.file) {
                    try {
                        self.options.blobURL = window.URL.createObjectURL(podcast.file);
                    } catch (e) {
                        console.log('ERROR', e);
                    }
                } else {
                    self.downloadEpisode();
                }

                self.render();
            });
        },

        playPause: function(event) {
            if ($('#audio')[0].paused) {
                $('#audio')[0].play();
            } else {
                $('#audio')[0].pause();
            }

            $('#play-pause').toggleClass('paused');
        }
    });

    return PlayerView;
});
