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
            nativeScroll: (function() {
                return 'WebkitOverflowScrolling' in window.document.createElement('div').style;
            })()
        },
        OBJECT_STORE_NAME: 'podcasts',
        TIME_TO_UPDATE: 3600 * 5 // Update podcasts every five hours
    }
    window.GLOBALS = GLOBALS;

    function initialize(callback) {
        if (GLOBALS.HAS.nativeScroll) {
            $('body').addClass('native-scroll');
        }

        DataStore.load(function() {
            var app = new AppView();
        });
    }

    function timestamp(date) {
        if (!date) {
            date = new Date()
        }

        return Math.round(date.getTime() / 1000)
    }
    window.timestamp = timestamp;

    return {
        initialize: initialize
    };
});
