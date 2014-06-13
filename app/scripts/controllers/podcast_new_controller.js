HighFidelity.PodcastNewController = Ember.ObjectController.extend({
    rssURL: 'http://atp.fm/episodes?format=rss',

    actions: {
        create: function() {
            var _this = this;

            var id = encodeURIComponent(this.get('rssURL')
                        .replace(/^https?:\/\//, ''));
            id = id.replace(/%.{2}/g, '.');

            this.store.find('podcast', id).then(function(existingPodcast) {
                if (existingPodcast.get('id')) {
                    console.debug('Existing record found with id: ',
                                  existingPodcast.get('id'));
                    _this.transitionToRoute('podcast', existingPodcast);
                    return;
                }

                var podcast = _this.store.createRecord('podcast', {
                    id: id,
                    rssURL: _this.get('rssURL')
                });

                podcast.update().then(function() {
                    return podcast.save();
                }).then(function() {
                    _this.transitionToRoute('podcast', podcast);
                });
            });
        }
    }
});
