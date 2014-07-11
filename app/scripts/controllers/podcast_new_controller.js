HighFidelity.PodcastNewController = Ember.ObjectController.extend({
    isAdding: false,

    rssURL: '',

    actions: {
        create: function(url) {
            if (url) {
                this.set('rssURL', url);
            }

            if (!this.get('rssURL') || !this.get('rssURL').length) {
                return;
            }

            this.set('isAdding', true);

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
                    _this.set('isAdding', false);
                    _this.set('rssURL', '');
                    _this.transitionToRoute('podcast', podcast);
                });
            });
        }
    }
});
