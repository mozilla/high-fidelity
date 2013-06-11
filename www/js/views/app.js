/*jshint forin:false, plusplus:false, sub:true */
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
    'use strict';

    // Main App View, created at app init and kept around. Contains lists of
    // other views including the player view.
    var AppView = Backbone.View.extend({
        el: '#content',
        $el: $('#content'),
        template: AppTemplate,

        events: {
            'click #add-podcast-button': 'showNewPodcastForm',
            'click #add-rss-cancel': 'hideNewPodcastForm',
            'submit #add-podcast': 'addFromMenuBar'
        },

        // Create the player view and set the lower UI (tabs and "now playing"
        // element) as active.
        initialize: function() {
            var player = new PlayerView({
                model: null
            });

            _(this).bindAll('addFromMenuBar', 'activateTab',
                            'hideNewPodcastForm', 'render',
                            'showNewPodcastForm', 'subscribe');

            // Are "lower UI" elements like tabs visible? Defaults to true.
            // These are hidden when the keyboard is enabled.
            // TODO: Tie this to a keyboard-shown event or manage this with
            // events.
            this._lowerIUEnabled = true;

            // Render the main app template!
            this.render();
        },

        // Render the main app template in templates/app.ejs. This is only
        // caused once to load in the main template; other renders happen
        // inside each app view.
        render: function() {
            this.$el.html(this.template());
            this.addPodcastForm = $('#add-podcast');
            this.rssURLInput = $('#add-rss');

            // Add other tabs with their own views after the main app template
            // has been rendered.
            this.tabs = {
                podcasts: new PodcastViews.List(),
                // TODO: Fix popular search tab.
                // popular: new SearchViews.Popular(),
                search: new SearchViews.Search()
            };

            // Store all tab elements in a variable as we access them when
            // a different tab is activated.
            this.$allTabs = $('.tab');
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
            this.$allTabs.hide();
            $(tabToLoad).show();
        },

        // Called when a podcast URL is entered in the manual URL field in the
        // app's header.
        addFromMenuBar: function() {
            var url = this.rssURLInput.val();

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
            this.rssURLInput.val('');
            this.addPodcastForm.hide();
        },

        // Show the "add podcast" sheet, allowing the user to subscribe to
        // a new podcast.
        showNewPodcastForm: function() {
            this.addPodcastForm.show();
        },

        // The subscribe method called across the app; used to add a new
        // podcast to the user's list of podcasts.
        subscribe: function(url) {
            var podcast = new Podcast({rssURL: url});
            var podcastsView = this.tabs.podcasts;

            // Add the podcast to the user's collection.
            Podcasts.create(podcast);

            // When the podcast is updated for the first time, add it to the
            // user's list of podcasts. We wait until it's been updated so
            // metadata is available.
            podcast.on('updated', function() {
                podcastsView.add(podcast);
            });
        }
    });

    return AppView;
});
