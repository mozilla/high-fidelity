/*global _:true, App:true, Backbone:true */
/*jshint forin:false, plusplus:false, sub:true */
'use strict';

define([
    'zepto',
    'underscore',
    'backbone',
    'app',
    'collections/podcasts',
    'models/podcast',
    'views/dialogs',
    'text!templates/search/index.ejs',
    'text!templates/search/popular.ejs',
    'text!templates/search/result.ejs'
], function($, _, Backbone, App, Podcasts, Podcast, DialogViews, SearchTemplate, PopularPodcastsTemplate, SearchResultTemplate) {
    // TODO: Extract this into a "Podcasts search" library.
    var GPODDER_API = 'https://gpodder.net/';

    // Render search results from another view.
    function renderSearchResults(results, request, view) {
        try {
            results = window.JSON.parse(results);
        } catch (e) {
            results = null;
        }

        // Reset this view's results.
        view.destroyResults();

        // If there aren't any results, we skip right past this part and
        // display a "no results found" message. This is rare though; the
        // search API we're currently using is REALLY fuzzy.
        if (results && results.length) {
            results.forEach(function(r) {
                // Ignore podcasts with no title or URL.
                // Also be sure to ignore search result items that have
                // the same RSS URL as a podcast we're already
                // subscribed to.
                if (!r.title || !r.url || Podcasts.where({rssURL: r.url}).length) {
                    return;
                }

                var extraViewOptions = view.childViewOptions || {};
                var resultView = new SearchResultView(_.defaults({
                    templateData: {
                        imageURL: r.logo_url,
                        name: r.title,
                        rssURL: r.url
                    }
                }, extraViewOptions));

                view.options.resultViews.push(resultView);
            });
        }

        if (!view.options.resultViews.length) {
            view.render({noResults: true});
        }

        // Scroll down to the results, pushing the search form out of
        // view. Because the header is position: fixed, we need to
        // adjust the amount of pixels we scroll to.
        var scrollTopOffset = view.options.searchResults[0].offsetTop - $('#app-header').height();
        window.scrollTo(window.document.scrollLeft, scrollTopOffset);
    }

    function search(query, callback, view) {
        var request = new window.XMLHttpRequest({mozSystem: true});

        request.open('GET', '{apiURL}search.json?q={search}'.format({
            apiURL: GPODDER_API,
            search: window.encodeURIComponent(query)
        }), true);

        request.addEventListener('load', function(event) {
            callback(request.response, request, view);
        });

        request.send(null);
    }

    function top(query, callback, view) {
        var request = new window.XMLHttpRequest({mozSystem: true});

        request.open('GET', '{apiURL}toplist/{number}.json'.format({
            apiURL: GPODDER_API,
            number: window.encodeURIComponent(query)
        }), true);

        request.addEventListener('load', function(event) {
            callback(request.response, request, view);
        });

        request.send(null);
    }

    // Return normalized data for use in templates that use data directly from
    // the GPodder API.
    function _templateData(podcast) {
        return {
            imageURL: podcast.logo_url,
            name: podcast.title,
            rssURL: podcast.url
        }
    }

    var PopularPodcastsView = Backbone.View.extend({
        childViewOptions: {
            el: '#popular-results ul',
            $el: '#popular-results ul'
        },
        el: '#popular-tab-container',
        $el: $('#popular-tab-container'),
        template: _.template(PopularPodcastsTemplate),

        initialize: function() {
            this.options.resultViews = [];

            _(this).bindAll('destroyResults');

            this.render();

            top(20, renderSearchResults, this);
        },

        render: function(templateArgs) {
            var html = this.template(_.extend({
                noResults: false
            }, templateArgs));

            this.$el.html(html);

            this.options.searchResults = $('#popular-results');
        },

        destroyResults: function() {
            this.options.resultViews.forEach(function(v) {
                v.remove();
            });

            this.options.resultViews = [];
        }
    });

    var SearchView = Backbone.View.extend({
        el: '#search-tab-container',
        $el: $('#search-tab-container'),
        template: _.template(SearchTemplate),

        events: {
            'submit #podcast-search-form': 'search'
        },

        initialize: function() {
            _(this).bindAll('destroyResults', 'search');

            this.options.resultViews = [];

            this.render();
        },

        render: function(templateArgs) {
            var html = this.template(_.extend({
                noResults: false,
                search: this.options.searchForm ? this.options.searchForm.val() : ''
            }, templateArgs));

            this.$el.html(html);

            this.options.searchForm = $('#podcast-search');
            this.options.searchResults = $('#search-results');
        },

        destroyResults: function() {
            this.options.resultViews.forEach(function(v) {
                v.remove();
            });

            this.options.resultViews = [];
        },

        search: function(event) {
            event.preventDefault();

            this.render();

            search(this.options.searchForm.val(), renderSearchResults, this);
        }
    });

    var SearchResultView = Backbone.View.extend({
        el: '#search-results ul',
        $el: $('#search-results ul'),
        template: _.template(SearchResultTemplate),

        events: {
            'click .subscribe': 'subscribe'
        },

        initialize: function() {
            // Hack to load proper $el value if overloaded.
            if (typeof(this.$el) === 'string') {
                this.$el = $(this.$el);
            }

            _(this).bindAll('subscribe');

            this.render();

            this.options.searchForm = $('#podcast-search');
        },

        render: function() {
            var html = this.template(this.options.templateData);

            if (this.$el.children('.loading')) {
                this.$el.children('.loading').remove();
            }
            this.$el.append(html);

            this.el = this.$el.find('a[data-rss="{rss}"]'.format({
                rss: this.options.templateData.rssURL
            }))[0].parentNode;
            this.$el = $(this.el);
        },

        subscribe: function(event) {
            var self = this;

            var dialog = new DialogViews.Subscribe({
                confirm: function() {
                    window.app.subscribe($(event.currentTarget).data('rss'));

                    self.remove();

                    // TODO: Make this something that happens in the router
                    // rather than being naughty with DOM events.
                    // TODO: Make this navigate to the podcast detail view
                    // instead of the main listing view.
                    $('#tabs #podcasts-tab a').trigger('click');
                },
                templateData: _.defaults({
                    description: null
                }, this.options.templateData)
            });
        }
    });

    return {
        Popular: PopularPodcastsView,
        Result: SearchResultView,
        Search: SearchView
    };
});
