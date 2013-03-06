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
    'views/search',
    'text!templates/app.ejs'
], function($, _, Backbone, App, Episodes, Podcasts, Podcast, PlayerView, PodcastViews, SearchViews, AppTemplate) {
    var AppView = Backbone.View.extend({
        el: '#content',
        $el: $('#content'),
        template: _.template(AppTemplate),

        events: {
            // 'click #add-podcast-button': 'showNewPodcastForm',
            // 'click #add-rss-cancel': 'hideNewPodcastForm',
            'click #back': 'goBack',
            'click #tabs a': 'changeTab',
            'submit #add-podcast': 'subscribe'
        },

        initialize: function() {
            var player = new PlayerView({
                model: null
            });

            _(this).bindAll('changeTab', 'goBack', 'hideNewPodcastForm',
                            'loadPodcasts', 'render', 'showNewPodcastForm',
                            'subscribe');

            this.options.podcastViews = [];

            // Store whether the app has rendered the main app HTML once.
            // We don't re-render this part.
            this._hasRendered = false;

            this.render();

            // Refresh the podcast list view any time the podcast list is
            // updated.
            // TODO: Write a collection "subscribe" method to fire a custom
            // "subscribe"/"unsubscribe" event allow refresh only on
            // subscription changes.
            // Podcasts.on('add remove', this.render, this);
        },

        render: function() {
            var self = this;

            if (!this._hasRendered) {
                this.$el.html(this.template());
                this.options.addPodcastForm = $('#add-podcast');
                this.options.rssURLInput = $('#add-rss');
            }

            Podcasts.fetch({
                success: function(podcast) {
                    Episodes.fetch({
                        success: self.loadPodcasts
                    });
                }
            });

            // Add other tabs with their own views after the main app template
            // has been rendered.
            if (!this._hasRendered) {
                this.options.popularViewTab = new SearchViews.Popular();
                this.options.searchViewTab = new SearchViews.Search();
            }

            // Don't re-render certain parts of this page again.
            this._hasRendered = true;
        },

        changeTab: function(event) {
            var tabToLoad = $(event.currentTarget).attr('href') + '-container';
            $('#tabs a').removeClass('active');
            $(event.currentTarget).addClass('active');

            $('.tab').hide();
            $(tabToLoad).show();
        },

        loadPodcasts: function() {
            var podcastViews = this.options.podcastViews;

            Podcasts.forEach(function(podcast) {
                podcastViews[podcast.get('id')] = new PodcastViews.cover({
                    model: podcast
                });
            });
        },

        // Hide the "add podcast" sheet and reset the form info.
        hideNewPodcastForm: function() {
            this.options.rssURLInput.val('');
            this.options.addPodcastForm.hide();
        },

        goBack: function(event) {
            this.options.podcastViews[$('#podcast-details .episodes').data('podcastid')].hideEpisodes();
            this.render();
        },

        // Show the "add podcast" sheet, allowing the user to subscribe to
        // a new podcast.
        showNewPodcastForm: function() {
            this.options.addPodcastForm.show();
        },

        // Show a Podcast's info including artwork and episodes.
        showPodcast: function(id) {
            console.log(id);
            // PodcastView({
            //     model: podcast
            // });
        },

        subscribe: function(url) {
            var podcastViews = this.options.podcastViews;
            url = url || this.options.rssURLInput.val();

            var podcast = new Podcast({rssURL: url});
            Podcasts.add(podcast);
            podcast.save();

            podcast.on('updated', function() {
                podcastViews[podcast.get('id')] = new PodcastViews.cover({
                    model: podcast
                });
            });

            this.hideNewPodcastForm();
        }
    });

    return AppView;
});
