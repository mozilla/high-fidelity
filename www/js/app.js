/*global _:true, App:true, Backbone:true */
/*jshint forin:false, plusplus:false, sub:true */
'use strict';

define([
    'zepto',
    'blod',
    'collections/episodes',
    'collections/podcasts',
    'models/episode',
    'models/podcast',
    'views/app'
], function($, Blod, Episodes, Podcasts, Episode, Podcast, AppView) {
    var GLOBALS = {
        HAS: {
            nativeScroll: (function() {
                return 'WebkitOverflowScrolling' in window.document.createElement('div').style;
            })()
        },
        TIME_TO_UPDATE: 3600 * 1 // Update podcasts every hour
    }

    function initialize(callback) {
        if (GLOBALS.HAS.nativeScroll) {
            $('body').addClass('native-scroll');
        }

        Blod.load(function() {
            var app = new AppView();
        });
    }

    return {
        initialize: initialize
    };
});
