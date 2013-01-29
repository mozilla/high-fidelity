/*global _:true, App:true, Backbone:true */
/*jshint forin:false, plusplus:false, sub:true */
'use strict';

define([
    'zepto',
    'install',
    'datastore',
    'collections/episodes',
    'collections/podcasts',
    'models/episode',
    'models/podcast',
    'views/app'
], function($, install, DataStore, Episodes, Podcasts, Episode, Podcast, AppView) {
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
            var app = new AppView();
        });

        if ($('#_install').length) {
            $('#_install').on('click', function() {
                install();
            });
        }
    }

    function DownloadQueue() {
        var queue = [];

        this.add = function(id, object) {
            queue[id] = object ? object : true;
        }

        this.done = function(id) {
            delete queue[id];
            if (queue.length) {
                _.first(queue)._download();
            }
        }

        return this;
    }
    window.DownloadQueue = DownloadQueue;

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
