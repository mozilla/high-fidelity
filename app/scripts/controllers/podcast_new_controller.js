HighFidelity.PodcastNewController = Ember.ObjectController.extend({
    rssURL: 'http://atp.fm/episodes?format=rss',

    actions: {
        create: function(url) {
            if (url) {
                this.set('rssURL', url);
            }

            var _this = this;

            console.debug('Find podcast with rssURL:', this.get('rssURL'));
            var existingPodcast = this.store.find('podcast', {
                rssURL: this.get('rssURL')
            }).then(function(podcast) {
                console.info('Podcast already exists', podcast.objectAt(0));
                _this.transitionToRoute('podcast', podcast.objectAt(0));
            }, function() {
                console.info('Creating new podcast.');

                var podcast = _this.store.createRecord('podcast', {
                    rssURL: _this.get('rssURL')
                });

                podcast.update().then(function() {
                    _this.transitionToRoute('podcast', podcast);
                });
            });
        }
    }
});
