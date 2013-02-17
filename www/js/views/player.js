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
    'text!templates/player.ejs',
    'jsmad'
], function($, _, Backbone, App, Episodes, Podcasts, Episode, Podcast, PlayerTemplate, JSMad) {
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

            // If there's a software player running, we need to stop its
            // playback and remove it from the DOM.
            if (window._player) {
                window._player.setPlaying(false);
                // window._player = null;
                delete window._player;
            }

            this.playerTimeout = null;

            this.render();
        },

        render: function() {
            var self = this;

            // Stop titles from transitioning.
            clearTimeout(this.playerTimeout);

            // Re-rendering the play/pause buttons means redelegating events.
            this.undelegateEvents();

            var html = this.template({
                blobURL: this.options.blobURL,
                episode: this.model,
                softwareDecode: !window.GLOBALS.HAS.audioSupportMP3
            });

            // Check for audio codec support and attempt a software decoding
            // fallback if native support isn't available. This is especially
            // useful for testing on Firefox for desktop which, as of Feb 2013,
            // lacks native MP3 support.
            //
            // TODO: Actually check audio type. For now, MP3 is assumed as it's
            // a safe bet that most podcasts are in MP3 format.
            if (this.options.blobURL && !window.GLOBALS.HAS.audioSupportMP3) {
                JSMad.Player.fromURL(this.options.blobURL, this._startSoftwarePlayer);
            } else {
                window._player = null;
            }

            this.$el.html(html);

            // Scale size of text to fit in the player element.
            function resize(element) {
                if (!element) {
                    return;
                }

                var episodeWidth = element.offsetWidth;
                var maxWidth = element.parentNode.offsetWidth;
                // TODO: 70 should be the width of the play/pause button.
                var scaleFactor = Math.min(1, (maxWidth - 70) / episodeWidth);
                element.style.transform = 'scale(' + scaleFactor + ')';
                element.style.MozTransform = 'scale(' + scaleFactor + ')';
                element.style.WebkitTransform = 'scale(' + scaleFactor + ')';
            }

            var episodeTitle = this.$el.find('h3')[0];
            var podcastTitle = this.$el.find('h2')[0];
            resize(episodeTitle);
            resize(podcastTitle);

            // TODO: Wire this up to CSS transitions and such.
            function transitionTitles() {
                self.playerTimeout = setTimeout(function() {
                    $(episodeTitle).toggleClass('hide');
                    $(podcastTitle).toggleClass('hide');
                    resize(episodeTitle);
                    resize(podcastTitle);
                    transitionTitles();
                }, 4000);
            }

            if (episodeTitle && podcastTitle) {
                transitionTitles();
            }
        },

        // Extract an Object URI for this episode and insert it into the audio
        // player's src attribute by re-rendering the template.
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

        // Play or pause the current track and update the DOM to reflect the
        // player's state.
        playPause: function(event) {
            if (window._player) {
                window._player.setPlaying(!window._player.playing);
            } else {
                if ($('#audio')[0].paused) {
                    $('#audio')[0].play();
                } else {
                    $('#audio')[0].pause();
                }
            }

            $('#play-pause').toggleClass('paused');
        },

        // Create a software player to decode audio using pure JS (used only
        // if necessary when no hardware support for a codec exists).
        _startSoftwarePlayer: function(player) {
            player.onPlay = function() {};
            player.onPause = function() {};
            player.createDevice();
            player.setPlaying(true);
            window._player = player;
        }
    });

    return PlayerView;
});
