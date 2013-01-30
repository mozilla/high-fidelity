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

            this.render();
        },

        render: function() {
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
