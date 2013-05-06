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
    'views/dialogs',
    'views/player',
    'views/podcast',
    'views/search',
    'tpl!templates/app.ejs'
], function($, _, Backbone, App, Episodes, Podcasts, Podcast, DialogViews, PlayerView, PodcastViews, SearchViews, AppTemplate) {
    var AppView = Backbone.View.extend({
        el: '#content',
        $el: $('#content'),
        template: AppTemplate,

        events: {
            'click #add-podcast-button': 'showNewPodcastForm',
            'click #add-rss-cancel': 'hideNewPodcastForm',
            'click #back': 'goBack',
            'click #tabs a': 'changeTab',
            'submit #add-podcast': 'addFromMenuBar'
        },

        initialize: function() {
            var player = new PlayerView({
                model: null
            });

            _(this).bindAll('addFromMenuBar', 'changeTab', 'goBack',
                            'hideNewPodcastForm', 'loadPodcasts', 'render',
                            'showNewPodcastForm', 'subscribe');

            this.options.podcastViews = [];

            // Store whether the app has rendered the main app HTML once.
            // We don't re-render this part.
            this._hasRendered = false;

            // Are "lower UI" elements like tabs visible? Defaults to true.
            this._lowerIUEnabled = true;

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
                // this.options.popularViewTab = new SearchViews.Popular();
                this.options.searchViewTab = new SearchViews.Search();
            }

            // Don't re-render certain parts of this page again.
            this._hasRendered = true;
        },

        addFromMenuBar: function() {
            var url = this.options.rssURLInput.val();

            // TOOD: Make this display a dialog.
            this.subscribe(url);
            // var dialog = new DialogViews.Subscribe({
            //     confirm: function() {
            //         window.app.subscribe(url);

            //         // TODO: Make this something that happens in the router
            //         // rather than being naughty with DOM events.
            //         // TODO: Make this navigate to the podcast detail view
            //         // instead of the main listing view.
            //         $('#tabs #podcasts-tab a').trigger('click');
            //     },
            //     templateData: _.defaults({
            //         description: null
            //     }, this.options.templateData)
            // });

            this.hideNewPodcastForm();
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

        subscribe: function(url) {
            var podcastViews = this.options.podcastViews;
            var podcast = new Podcast({rssURL: url});

            Podcasts.create(podcast);

            podcast.on('updated', function() {
                podcastViews[podcast.get('id')] = new PodcastViews.cover({
                    model: podcast
                });
            });
        }
    });

    return AppView;
});
