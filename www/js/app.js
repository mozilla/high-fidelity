/*global _:true, App:true, Backbone:true */
/*jshint forin:false, plusplus:false, sub:true */
'use strict';

define([
    'zepto',
    'datastore',
    'jed',
    'collections/episodes',
    'collections/podcasts',
    'models/episode',
    'models/podcast',
    'views/app'
], function($, DataStore, Jed, Episodes, Podcasts, Episode, Podcast, AppView) {
    var GLOBALS = {
        DATABASE_NAME: 'podcasts',
        HAS: {
            audioSupportMP3: (function() {
                var a = window.document.createElement('audio');
                return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
            })(),
            audioSupportOGG: (function() {
                var a = window.document.createElement('audio');
                return !!(a.canPlayType && a.canPlayType('audio/ogg;').replace(/no/, ''));
            })(),
            nativeScroll: (function() {
                return 'WebkitOverflowScrolling' in window.document.createElement('div').style;
            })()
        },
        LANGUAGE: window.navigator.language, // HACK: Better way for this, I assume?
        MAX_DOWNLOADS: 2, // Maximum number of podcast downloads at one time.
        OBJECT_STORE_NAME: 'podcasts',
        TIME_TO_UPDATE: 3600 * 5 // Update podcasts every five hours
    };
    window.GLOBALS = GLOBALS;

    function initialize(callback) {
        if (GLOBALS.HAS.nativeScroll) {
            $('body').addClass('native-scroll');
        }

        DataStore.load(function() {
            setLanguage(function() {
                window.app = new AppView();
            });
        });
    }

    // Format a time in seconds to a pretty 5:22:75 style time. Cribbed from
    // the Gaia Music app.
    function formatTime(secs) {
        if (isNaN(secs)) {
            return '--:--';
        }

        var hours = parseInt(secs / 3600, 10) % 24;
        var minutes = parseInt(secs / 60, 10) % 60;
        var seconds = parseInt(secs % 60, 10);

        return '{hours}{minutes}:{seconds}'.format({
            hours: hours !== 0 ? hours + ':' : '',
            minutes: minutes < 10 ? '0' + minutes : minutes,
            seconds: seconds < 10 ? '0' + seconds : seconds
        });
    }
    window.formatTime = formatTime;

    // Set the language of the app and retrieve the proper localization files.
    // This could be improved, but for now works fine.
    // TODO: Allow an override argument for testing, etc.
    function setLanguage(callback, override) {
        var request = new window.XMLHttpRequest();

        request.open('GET', 'locale/{lang}.json'.format({
            lang: GLOBALS.LANGUAGE
        }), true);

        request.addEventListener('load', function(event) {
            if (request.status === 200) {
                // Alias _ for gettext-style l10n jazz.
                var l10n = new Jed({
                    locale_data: JSON.parse(request.response)
                });

                // TODO: This seems a bit hacky; maybe we can do better?
                window._l10n = l10n;
                window.l = function(key) {
                    return l10n.gettext(key);
                };
            } else {
                window._l10n = null;
                window.l = function(key) {
                    return key;
                }
            }

            if (callback) {
                callback();
            }
        });

        request.send();
    }

    function timestamp(date) {
        if (!date) {
            date = new Date();
        }

        return Math.round(date.getTime() / 1000);
    }
    window.timestamp = timestamp;

    return {
        initialize: initialize
    };
});
