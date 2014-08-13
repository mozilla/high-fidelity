HighFidelity.PodcastNewController = Ember.ObjectController.extend({
    isAdding: false,

    rssURL: '',

    actions: {
        create: function(url) {
            if (url) {
                if (!url.match(/^http[s]?:\/\//i)) {
                  url = 'http://' + url;
                }

                this.set('rssURL', url);
            }

            if (!this.get('rssURL') || !this.get('rssURL').length) {
                return;
            }

            this.set('isAdding', true);

            HighFidelity.Podcast.createFromController(this, this.get('rssURL'));
        }
    }
});
