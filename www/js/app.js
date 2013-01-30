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

    // The app-wide download queue, used to make sure we don't download more
    // than a few files at once and that items are downloaded in order. Really
    // simple and hacky interface for now, but this could be expanded into
    // something pretty usable.
    //
    // Any item added to the queue must have a _download() method the queue
    // will call once a download slot is available. It will then assign a
    // `true` value to that item in the queue, signifying it's an active
    // download.
    //
    // TODO: Support for broken downloads, storing the queue in storage so
    // it's crash-resistant, and pause/resume of downloads (this one might be
    // hard?).
    function DownloadQueue() {
        var queue = [];

        function next() {
            if (queue.length) {
                queue.forEach(function(download, i) {
                    if (numberOfActiveDownloads() < GLOBALS.MAX_DOWNLOADS && download[1] !== true) {
                        download[1]._download();
                        queue[i][1] = true;
                    }
                });
            }
        }

        function numberOfActiveDownloads() {
            var active = 0;

            // TOOD: My brain is being weird but feels like there's a more
            // elegant way to do this.
            queue.forEach(function(download) {
                if (download[1] === true) {
                    active++;
                }
            });

            return active;
        }

        this.add = function(id, object) {
            queue.push([id, object ? object : true]);
            next();
        }

        this.done = function(id) {
            var index = null;

            // TODO: Again, there's gotta be a sexier way to do this.
            queue.forEach(function(download, i) {
                if (index !== null) {
                    return;
                }

                if (download[1] === true) {
                    index = i;
                }
            });
            queue.splice(index, 1);
            next();
        }

        return this;
    }
    window.DownloadQueue = new DownloadQueue();

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
