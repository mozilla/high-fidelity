/*global _:true, App:true, Backbone:true */
/*jshint forin:false, plusplus:false, sub:true */
'use strict';

define([
    'zepto',
    'underscore',
    'backbone',
    'app',
    'rss',
    'collections/podcasts',
    'models/podcast',
    'views/dialogs',
    'tpl!templates/search/index.ejs',
    'tpl!templates/search/popular.ejs',
    'tpl!templates/search/result.ejs'
], function($, _, Backbone, App, RSS, Podcasts, Podcast, DialogViews, SearchTemplate, PopularPodcastsTemplate, SearchResultTemplate) {
    // TODO: Extract this into a "Podcasts search" library.
    var API = 'https://itunes.apple.com/search?media=podcast';
    var TOP_RSS = 'https://itunes.apple.com/us/rss/toppodcasts/limit=25/explicit=true/xml';

    // Render search results from another view.
    function renderSearchResults(results, request, view) {
        try {
            results = JSON.parse(results);
        } catch (e) {
            console.log("Couldn't parse search results");
            results = [];
        }

        // Reset this view's results.
        view.destroyResults();

        // Create a SearchResultView for each result and add it to this view's
        // "resultViews" array.
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

        // If there aren't any results, we display a "no results found"
        // message. This is rare though; the search API we're currently using
        // is REALLY fuzzy.
        if (!view.options.resultViews.length) {
            view.render({noResults: true});
        }

        // Scroll down to the results, pushing the search form out of
        // view. Because the header is position: fixed, we need to
        // adjust the amount of pixels we scroll to.
        var scrollTopOffset = view.options.searchResults[0].offsetTop -
                              $('#app-header').height();
        window.scrollTo(window.document.scrollLeft, scrollTopOffset);
    }

    function search(query, callback, view) {
        var request = new window.XMLHttpRequest({mozSystem: true});

        request.open('GET', '{apiURL}&term={search}'.format({
            apiURL: API,
            search: window.encodeURIComponent(query)
        }), true);

        request.addEventListener('load', function(event) {
            callback(request.response, request, view);
        });

        request.send(null);
    }

    function top(query, callback, view) {
        var request = new window.XMLHttpRequest({mozSystem: true});

        request.open('GET', TOP_RSS, true);

        request.addEventListener('load', function(event) {
            callback(request.response, request, view);
        });

        request.send(null);
    }

    // Cheeky function that gets the actual podcast RSS URL from iTunes by
    // spoofing User-Agent and making an HTTP request to iTunes. Inspired by
    // http://www.zerologic.com/Blog/How-to-get-the-original-RSS-feed-for-a-podcast-in-iTunes.html
    function _getPodcastURLFromiTunes(podcastID) {
        var baseURL = 'https://itunes.apple.com/podcast/id/'

        var request = new window.XMLHttpRequest({mozSystem: true});

        request.open('GET', baseURL + podcastID, true);

        request.addEventListener('load', function(event) {
            console.log($(request.response).find('button'));
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
        template: PopularPodcastsTemplate,

        initialize: function() {
            this.options.resultViews = [];

            _(this).bindAll('destroyResults');

            this.render();

            top(20, this.convertiTunesRSS, this);
        },

        convertiTunesRSS: function(rss, request, view) {
            var podcasts = [];
            var topPodcasts = RSS.xmlToJSON(rss);

            console.log(topPodcasts);

            topPodcasts.feed.entry.forEach(function(p) {
                var imageURL;

                // Get the largest image URL for this podcast, if available.
                if (p['im:image']) {
                    var biggestImageIndex = 0;
                    var size = 0;

                    p['im:image'].forEach(function(i, index) {
                        if (i['@attributes'].height > size) {
                            biggestImageIndex = index;
                        }
                    });

                    imageURL = p['im:image'][biggestImageIndex]['#text'];
                }

                console.log('test!', p['id']['@attributes']['im:id']);
                _getPodcastURLFromiTunes(p['id']['@attributes']['im:id']);

                // podcasts.push({
                //     logo_url: imageURL,
                //     title: p.name['#text'],
                //     url: ''
                // });
            });
        },

        render: function(templateArgs) {
            var html = this.template(_.extend({
                noResults: false
            }, templateArgs));

            this.$el.html(html);

            this.options.searchResults = $('#popular-results');

            if (this.options.resultViews.length) {
                this.options.resultViews.forEach(function(v) {
                    v.render();
                });
            }
        },

        destroyResults: function() {
            this.options.resultViews = [];
        }
    });

    var SearchView = Backbone.View.extend({
        el: '#search-tab-container',
        $el: $('#search-tab-container'),
        template: SearchTemplate,

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

            if (this.options.resultViews.length) {
                this.options.resultViews.forEach(function(v) {
                    v.render();
                });
            }
        },

        destroyResults: function() {
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
        template: SearchResultTemplate,

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
