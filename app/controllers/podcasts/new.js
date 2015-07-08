import Ember from 'ember';

export default Ember.Controller.extend({
    isAdding: false,
    isInErrorState: false,

    rssURL: '',

    actions: {
        create: function(url) {
            if (url) {
                this.set('rssURL', url);
            }

            if (!this.get('rssURL') || !this.get('rssURL').length) {
                return;
            }

            // If the URL entered doesn't have a protocol attached, make
            // sure one is added so we don't get an error (#43).
            if (!this.get('rssURL').match(/^http[s]?:\/\//i)) {
                this.set('rssURL', 'http://' + this.get('rssURL'));
            }

            this.set('isAdding', true);

            HighFidelity.Podcast.createFromController(this, this.get('rssURL'));
        }
    }
});
