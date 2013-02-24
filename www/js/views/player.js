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
    // Save audio position every five seconds.
    var SAVE_POSITION_TIMER = 5000;

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

            _(this).bindAll('getEpisode', 'playPause', 'savePlaybackPosition',
                            'setPlaybackPosition',
                            '_savePlaybackPositionTimer',
                            '_startSoftwarePlayer');

            // It's possible to have an empty player, so we check to see if
            // there's an episode loaded; if not, don't bother with much.
            if (this.model.id) {
                this.options.canPlayType = window.GLOBALS.HAS['audioSupport{type}'.format({type: this.model.get('type').toUpperCase()})];
                this.getEpisode();

                this.model.on('destroyed', function() {
                    self.remove();
                });
            }

            // If there's a software player running, we need to stop its
            // playback and remove it from the DOM.
            if (window._player) {
                window._player.setPlaying(false);
                delete window._player;
            }

            // Variables used to store timeouts that run to save position
            // and change titles that appear.
            this.playerTimeout = null;
            this.positionTimeout = null;

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
                softwareDecode: !this.options.canPlayType
            });

            // Check for audio codec support and attempt a software decoding
            // fallback if native support isn't available. This is especially
            // useful for testing on Firefox for desktop which, as of Feb 2013,
            // lacks native MP3 support.
            //
            // TODO: Try to play any file, then search for a software decoder
            // backup if playback doesn't work (more futureproof).
            if (this.options.blobURL && !this.options.canPlayType) {
                JSMad.Player.fromURL(this.options.blobURL, this._startSoftwarePlayer);
            } else {
                window._player = null;
            }

            this.$el.html(html);

            // Set the start time of this podcast (in case it's been played
            // before).
            if (this.options.blobURL) {
                // HACK: Attach model to audio player, because this.model
                // gets fucked halfway through for some reason.
                if ($('audio')[0]) {
                    $('audio')[0]._model = this.model;
                }

                this.setPlaybackPosition(this.playPause);
            }

            // Scale size of text to fit in the player element.
            function resize(element) {
                if (!element || !element.parentNode) {
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
            var audioPlayer = $('#audio')[0];
            if (window._player) {
                window._player.setPlaying(!window._player.playing);
            } else if (audioPlayer) {
                if (audioPlayer.paused) {
                    audioPlayer.play();
                    this._savePlaybackPositionTimer();
                } else {
                    audioPlayer.pause();
                    clearTimeout(this.positionTimeout);
                    this.savePlaybackPosition();
                }
            } else {
                // Audio elements aren't available/ready yet. Abort and try
                // again in a bit!
                setTimeout(this.playPause, 200);
                return;
            }

            $('#play-pause').toggleClass('paused');
        },

        savePlaybackPosition: function() {
            var audioPlayer = $('#audio')[0];
            if (window._player) {
                // TODO: Implement position saving for software decoder.
                return;
                // console.log(window._player);
                // console.log(window._player.absoluteFrameIndex,
                //             window._player.dev.getPlaybackTime(),
                //             window._player.stream.contentLength);
                // this.model.set({
                //     playbackPosition: window._player.absoluteFrameIndex
                // });
                // this.model.save();
            } else if (audioPlayer) {
                audioPlayer._model.set({playbackPosition: audioPlayer.currentTime});
                audioPlayer._model.save();
            }
        },

        setPlaybackPosition: function(callback) {
            var audioPlayer = $('#audio')[0];
            var playbackPosition = this.model.get('playbackPosition');
            var self = this;

            if (window._player) {
                // TOOD: Implement this in software decoding mode.
                callback();
                return;
            } else if (audioPlayer) {
                $(audioPlayer).on('canplay', function() {
                    audioPlayer.currentTime = playbackPosition;
                    $(audioPlayer).off('canplay');

                    callback();
                });
            }
        },

        _savePlaybackPositionTimer: function() {
            var self = this;

            this.positionTimeout = setTimeout(function() {
                self.savePlaybackPosition();
                self._savePlaybackPositionTimer();
            }, SAVE_POSITION_TIMER);
        },

        // Create a software player to decode audio using pure JS (used only
        // if necessary when no hardware support for a codec exists).
        _startSoftwarePlayer: function(player) {
            player.onPlay = function() {};
            player.onPause = function() {};
            player.createDevice();

            // If this model has a previously set playback position, load it.
            if (this.model.get('playbackPosition')) {
                // TODO: Implement this.
                console.log('Implement playbackPosition for software decoder');
            }

            player.setPlaying(true);
            $('#play-pause').removeClass('paused');

            window._player = player;
        }
    });

    return PlayerView;
});
