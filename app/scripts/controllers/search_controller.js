HighFidelity.SearchController = Ember.ObjectController.extend({
    isSearching: false,

    query: '',
    resultCount: 0,
    results: null,

    search: function(query) {
        var _this = this;

        this.set('isSearching', true);

        return new Promise(function(resolve, reject) {
            var API = 'https://itunes.apple.com/search?media=podcast';

            $.ajax({
                url: 'https://itunes.apple.com/search?media=podcast&term=' +
                     encodeURIComponent(query),
                dataType: 'json',
                success: function(response, xhr) {
                    if (!response || !response.results) {
                        console.error('Bad response', response);
                        return reject(xhr);
                    }

                    var results = [];

                    response.results.forEach(function(p) {
                        results.push({
                            logo_url: p.artworkUrl100,
                            url: p.feedUrl,
                            title: p.trackName
                        });
                    });

                    console.info('Raw Search Results:', response);
                    console.info('iTunes Search Results:', results);

                    _this.set('isSearching', false);
                    _this.set('resultCount', response.resultCount);
                    _this.set('results', response.results);

                    resolve(results);
                },
                error: function(error) {
                    reject(error);
                }
            });
        });
    },

    actions: {
        search: function(query) {
            this.search(this.get('query'));
        }
    }
});
