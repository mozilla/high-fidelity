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
    'views/player',
    'views/podcast',
    'text!templates/app.ejs'
], function($, _, Backbone, App, Episodes, Podcasts, Podcast, PlayerView, PodcastViews, AppTemplate) {
    var AppView = Backbone.View.extend({
        el: '#content',
        $el: $('#content'),
        template: _.template(AppTemplate),

        events: {
            'click #add-podcast-button': 'showNewPodcastForm',
            'click #add-rss-cancel': 'hideNewPodcastForm',
            'click #back': 'goBack',
            'submit #add-podcast': 'subscribe'
        },

        initialize: function() {
            var player = new PlayerView({
                model: null
            });

            _(this).bindAll('goBack', 'loadPodcasts');

            this.podcastViews = [];

            this.render();
        },

        render: function() {
            var self = this;

            this.$el.html(this.template({}));

            Podcasts.fetch({
                success: function(podcast) {
                    Episodes.fetch({
                        success: self.loadPodcasts
                    });
                }
            });
        },

        loadPodcasts: function() {
            var podcastViews = this.podcastViews;

            Podcasts.forEach(function(podcast) {
                podcastViews[podcast.get('id')] = new PodcastViews.cover({
                    model: podcast
                });
            });
        },

        // Hide the "add podcast" sheet and reset the form info.
        hideNewPodcastForm: function() {
            $('#add-rss').val('');
            $('#add-podcast').hide();
        },

        goBack: function(event) {
            this.podcastViews[$('#podcast-details .episodes').data('podcastid')].hideEpisodes();
            this.render();
        },

        // Show the "add podcast" sheet, allowing the user to subscribe to
        // a new podcast.
        showNewPodcastForm: function() {
            $('#add-podcast').show();
        },

        // Show a Podcast's info including artwork and episodes.
        showPodcast: function(id) {
            console.log(id);
            // PodcastView({
            //     model: podcast
            // });
        },

        subscribe: function() {
            var url = $('#add-rss').val();

            if (!url || !url.length) {
                window.alert('Need a URL to subscribe to!');
                return;
            }

            var podcast = new PodcastViews.cover({
                model: new Podcast({rssURL: url})
            });

            this.hideNewPodcastForm();
        }
    });

    return AppView;
});
