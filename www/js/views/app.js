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
            'submit #add-podcast': 'addFromMenuBar'
        },

        initialize: function() {
            var player = new PlayerView({
                model: null
            });

            _(this).bindAll('addFromMenuBar', 'activateTab',
                            'hideNewPodcastForm', 'render',
                            'showNewPodcastForm', 'subscribe');

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
            this.$el.html(this.template());
            this.options.addPodcastForm = $('#add-podcast');
            this.options.rssURLInput = $('#add-rss');

            // Add other tabs with their own views after the main app template
            // has been rendered.
            // TODO: Fix popular search tab.
            // this.options.popularViewTab = new SearchViews.Popular();
            this.tabs = {
                podcasts: new PodcastViews.List(),
                search: new SearchViews.Search()
            }
        },

        // Activate a particular tab, usually called from the router when a
        // tab is tapped.
        activateTab: function(tab) {
            // Reset which tab is considered "active".
            var tabToLoad = $('#{tab}-tab-container'.format({tab: tab}));
            $('#tabs a').removeClass('active');
            $('#{tab}-tab a'.format({tab: tab})).addClass('active');

            // Set the active body tab; this is used for some CSS magic,
            // usually regarding the back button.
            $('body').data('active-tab', tab);

            // If the tab view responds to _activate(), call it.
            if (this.tabs[tab]._activate) {
                this.tabs[tab]._activate();
            }

            // Hide all tabs and show only the active one.
            $('.tab').hide();
            $(tabToLoad).show();
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

        // Hide the "add podcast" sheet and reset the form info.
        hideNewPodcastForm: function() {
            this.options.rssURLInput.val('');
            this.options.addPodcastForm.hide();
        },

        // Show the "add podcast" sheet, allowing the user to subscribe to
        // a new podcast.
        showNewPodcastForm: function() {
            this.options.addPodcastForm.show();
        },

        subscribe: function(url) {
            var podcast = new Podcast({rssURL: url});
            var podcastsView = this.tabs.podcasts;

            Podcasts.create(podcast);

            podcast.on('updated', function() {
                podcastsView.add(podcast);
            });
        }
    });

    return AppView;
});
