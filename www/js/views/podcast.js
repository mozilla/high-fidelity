/*jshint forin:false, plusplus:false, sub:true */
define([
    'zepto',
    'underscore',
    'backbone',
    'app',
    'collections/podcasts',
    'models/podcast',
    'views/dialogs',
    'views/episode',
    'tpl!templates/podcasts/cover.ejs',
    'tpl!templates/podcasts/details.ejs'
], function($, _, Backbone, App, Podcasts, Podcast, DialogViews, EpisodeView, PodcastCoverTemplate, PodcastDetailsTemplate) {
    'use strict';

    // We access the body a fair bit here; cache the object for all views in
    // this file.
    var $body = $('body');

    var PodcastItemView = Backbone.View.extend({
        className: 'podcast',
        el: '#podcasts',
        $el: $('#podcasts'),
        model: Podcast,
        template: PodcastCoverTemplate,

        events: {
        },

        initialize: function() {
            var self = this;

            _(this).bindAll('destroy');

            if (!this.model.get('id')) {
                Podcasts.add(this.model);
                this.model.save();
            }

            this.model.on('destroy', function() {
                self.destroy();
            });

            this.model.on('image:available', function() {
                self.render();
            });

            this.model.on('updated', function() {
                self.render();
            });

            this.render();
        },

        render: function() {
            var html = this.template({
                podcastCover: this.model.coverImage,
                podcast: this.model
            });

            var podcast = this.$el.children('#podcast-{id}'.format({
                id: this.model.get('id')
            }));

            if (podcast.length) {
                podcast.replaceWith(html);
            } else {
                this.$el.append(html);
            }
        },

        destroy: function() {
            this.$el = this.$el.children('#podcast-{id}'.format({
                id: this.model.get('id')
            }));

            this.remove();
        }
    });

    var PodcastListView = Backbone.View.extend({
        el: '#podcasts',
        $el: $('#podcasts'),

        events: {
            // 'click .destroy': 'destroyPrompt'
        },

        initialize: function() {
            _(this).bindAll('_addAll', 'add', 'destroy', 'hideEpisodes',
                            'render', 'showEpisodes');

            this.$podcastsTabLink = $('#podcasts-tab a');
            this.podcastCoverViews = [];

            this.render();
        },

        // Main render call; removes and adds all podcasts in bulk.
        render: function() {
            this.podcastCoverViews.forEach(function(view) {
                view.remove();
            });

            Podcasts.loadAll(this._addAll);
        },

        // Add a podcast to this view; called on load and also whenever a new
        // podcast is added.
        add: function(podcast) {
            this.podcastCoverViews[podcast.get('id')] = new PodcastItemView({
                model: podcast,
                parentView: this
            });
        },

        // Remove a single podcast from the list without reloading the entire
        // view.
        destroy: function(id) {
            this.podcastCoverViews[id].remove();
        },

        // Hide the episodes view and reset the tab link to go to the list of
        // all podcasts, rather than a specific podcast's details view.
        hideEpisodes: function() {
            // This function can be called by the router when no detail view
            // exists; if this is the case, just ignore it.
            if (!this.episodesView) {
                return;
            }

            // Restore the podcast tab's URL to the list of podcasts now that
            // we've left the details view.
            this.$podcastsTabLink.attr('href', this.$podcastsTabLink.data('original-href'));

            $body.data('podcast-details', 'off');
            this.$el.show();

            this.episodesView.remove();
            this.episodesView = null;
        },

        // Show all episodes and details for a podcast, specified by uid.
        showEpisodes: function(id) {
            // This method is called by the router even if a detail view is
            // rendered, so make sure we don't have one already.
            if (this.episodesView) {
                if (this.episodesView.model.get('id') === id) {
                    // We've already loaded the right view, so just return!
                    return;
                } else { // Load a new id; hide the old one first!
                    this.hideEpisodes();
                }
            }

            // Change the URL of the podcasts tab to this episode, so switching
            // from the search tab returns to this podcast instead of the list.
            this.$podcastsTabLink.attr('href', '#/podcasts/' + id);

            this.episodesView = new PodcastView({
                model: Podcasts.where({id: id})[0],
                parentView: this
            });

            $body.data('podcast-details', 'on');
            this.$el.hide();
        },

        // Add all podcast cover views to this list; usually called on init.
        _addAll: function() {
            Podcasts.forEach(this.add);
        }
    });

    var PodcastView = Backbone.View.extend({
        className: 'podcast',
        el: '#podcast-details',
        $el: $('#podcast-details'),
        model: Podcast,
        template: PodcastDetailsTemplate,

        events: {
            'click .destroy': 'destroyPrompt'
        },

        initialize: function() {
            var self = this;

            _(this).bindAll('destroyPrompt', 'render');

            this.model.on('destroy', function() {
                self.remove();
            });

            this.render();
        },

        render: function() {
            var html = this.template({
                podcast: this.model
            });

            $('#podcasts-tab-container').append(html);

            this.model.episodes().forEach(function(episode) {
                var view = new EpisodeView({
                    model: episode
                });
            });

            this.el = '#podcast-details';
            this.$el = $(this.el);

            this.$el.addClass('active');
        },

        destroyPrompt: function(event) {
            var self = this;

            var dialog = new DialogViews.DeletePodcast({
                confirm: function() {
                    // Destroying the model will trigger both the detail and
                    // cover views own `remove()` methods.
                    self.model.destroy();

                    // Go back to the list of podcasts, as we've just deleted
                    // this one!
                    window.router.navigate('/podcasts', {trigger: true});
                },
                templateData: _.defaults({
                    description: null
                }, {
                    imageURL: self.model.coverImage,
                    podcast: self.model
                })
            });
        }
    });

    return {
        Cover: PodcastItemView,
        Detail: PodcastView,
        List: PodcastListView
    };
});
