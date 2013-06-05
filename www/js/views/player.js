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
    'tpl!templates/player.ejs'/*,
    'jsmad'*/
], function($, _, Backbone, App, Episodes, Podcasts, Episode, Podcast, PlayerTemplate/*, JSMad*/) {
    // Save audio position every five seconds.
    var SAVE_POSITION_TIMER = 5000;

    var PlayerView = Backbone.View.extend({
        className: 'player',
        el: '#player',
        $el: $('#player'),
        model: Episode,
        template: PlayerTemplate,

        events: {
            'mousedown #audio-progress': 'progressMouseDown',
            'mousemove #audio-progress': 'progressMouseMove',
            'mouseup #audio-progress': 'progressMouseUp',
            'click #play-pause': 'playPause'
        },

        initialize: function() {
            var self = this;

            _(this).bindAll('getEpisode', 'playPause', 'progressMouseDown',
                            'progressMouseMove', 'progressMouseUp', 'render',
                            'savePlaybackPosition', 'seekTo',
                            'setPlaybackPosition', 'updateProgress',
                            '_adjustPlayerSizeAndText',
                            '_savePlaybackPositionTimer',
                            '_startSoftwarePlayer', '_updateElements');

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

            // HTML elements we use throughout this view.
            this.audio = null;
            this.$playPause = null;
            this.progressBar = null;
            this.$timeElapsed = null;
            this.$timeRemaining = null;

            // Store current dragging state of time scrubber (progress element).
            this._isScrubberDragging = false;

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
                // JSMad.Player.fromURL(this.options.blobURL, this._startSoftwarePlayer);
                window.alert('Cannot play this episode; software decoding is disabled.');
            } else {
                window._player = null;
            }

            this.$el.html(html);

            // Set the start time of this podcast (in case it's been played
            // before).
            if (this.options.blobURL) {
                // Make sure we're referencing the right elements.
                this._updateElements();

                // HACK: Attach model to audio player, because this.model
                // gets fucked halfway through for some reason.                
                if (this.audio) {
                    this.audio._model = this.model;
                    $(this.audio).on('timeupdate', this.updateProgress);
                }

                this.setPlaybackPosition(this.playPause);
            }

            // TODO: Better name for this? lulz
            this._adjustPlayerSizeAndText();
        },

        // Extract an Object URI for this episode and insert it into the audio
        // player's src attribute by re-rendering the template.
        getEpisode: function() {
            var self = this;

            this.model.blob(function(podcast) {
                if (podcast) {
                    try {
                        self.options.blobURL = window.URL.createObjectURL(podcast);
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
            // HACK: Make sure elements are up-to-date.
            this._updateElements();

            if (window._player) {
                window._player.setPlaying(!window._player.playing);
            } else if (this.audio) {
                if (this.audio.paused) {
                    this.audio.play();
                    this._savePlaybackPositionTimer();
                } else {
                    this.audio.pause();
                    clearTimeout(this.positionTimeout);
                    this.savePlaybackPosition();
                }
            } else {
                // Audio elements aren't available/ready yet. Abort and try
                // again in a bit!
                setTimeout(this.playPause, 200);
                return;
            }

            this.updateProgress();

            this.$playPause.toggleClass('paused');
        },

        progressMouseDown: function(event) {
            this._isScrubberDragging = true;
            this.seekTo(event.pageX);
        },

        progressMouseMove: function(event) {
            if (this._isScrubberDragging) {
                this.seekTo(event.pageX);
            }
        },

        progressMouseUp: function(event) {
            if (this._isScrubberDragging) {
                this._isScrubberDragging = false;
                this.seekTo(event.pageX);
            }
        },

        savePlaybackPosition: function() {
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
            } else if (this.audio) {
                this.audio._model.set({playbackPosition: this.audio.currentTime});
                this.audio._model.save();
            }
        },

        seekTo: function(x) {
            // HACK: make sure we're referencing the right elements.
            this._updateElements();

            var maxDuration = this.audio.duration;
            var position = x - $(this.progressBar).offset().left;
            var percentage = 100 * position / $(this.progressBar).width();

            // Make sure that the percentage click is an actual percent!
            if (percentage > 99) {
                percentage = 99;
            }

            if (percentage < 0) {
                percentage = 0;
            }

            this.audio.currentTime = maxDuration * percentage / 100;

            this.savePlaybackPosition();
            this.updateProgress();
        },

        setPlaybackPosition: function(callback) {
            var playbackPosition = this.model.get('playbackPosition');
            var self = this;

            if (window._player) {
                // TOOD: Implement this in software decoding mode.
                callback();
                return;
            } else if (this.audio) {
                $(this.audio).on('canplay', function() {
                    self.audio.currentTime = playbackPosition;

                    $(self.audio).off('canplay');

                    if (callback) {
                        callback();
                    }
                });
            }
        },

        updateProgress: function() {
            this.$timeElapsed.text(window.formatTime(this.audio.currentTime));

            var timeRemaining = this.audio.duration - this.audio.currentTime;
            this.$timeRemaining.text(window.formatTime(timeRemaining));

            this.progressBar.max = this.audio.duration;
            this.progressBar.value = this.audio.currentTime;
        },

        _adjustPlayerSizeAndText: function() {
            var self = this;

            // Scale size of text to fit in the player element.
            // TODO: Make this a global function. It's hella useful.
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
            this.$playPause.removeClass('paused');

            window._player = player;
        },

        _updateElements: function() {
            // Store references to commonly-used elements.
            this.audio = $('audio')[0];
            this.$playPause = $('#play-pause');
            this.progressBar = $('#audio-progress')[0];
            this.$timeElapsed = $('#time-elapsed');
            this.$timeRemaining = $('#time-remaining');
        }
    });

    return PlayerView;
});
