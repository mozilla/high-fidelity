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
    'models/podcast',
    'views/podcast'
], function($, _, Backbone, App, Episodes, Podcasts, Podcast, PodcastView) {
    var AppView = Backbone.View.extend({
        el: '#content',
        $el: $('#content'),

        events: {
            'click #add-rss-submit': 'subscribe'
        },

        initialize: function() {
            var self = this;

            Podcasts.fetch({
                success: function(podcast) {
                    Episodes.fetch({
                        success: self.loadPodcasts
                    });
                }
            });
        },

        loadPodcasts: function() {
            Podcasts.forEach(function(podcast) {
                var view = new PodcastView({
                    model: podcast
                });
            });
        },

        subscribe: function() {
            var url = $('#add-rss').val();

            if (!url || !url.length) {
                window.alert('Need a URL to subscribe to!');
                return;
            }

            var podcast = new PodcastView({
                model: new Podcast({rssURL: url})
            });
        }
    });

    return AppView;
});
