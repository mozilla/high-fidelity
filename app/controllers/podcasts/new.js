import Ember from 'ember';
import createFromController from 'ember-hifi/lib/create-from-controller'

export default Ember.Controller.extend({
    isAdding: false,
    isInErrorState: false,

    rssURL: '',

    actions: {
        create: function(url) {
            var self = this;

            if (url) {
                self.set('rssURL', url);
                console.log('RssURL Set...', url);
            }

            if (!self.get('rssURL') || !self.get('rssURL').length) {
                console.log('No rssUrl specified!');
                return;
            }

            // If the URL entered doesn't have a protocol attached, make
            // sure one is added so we don't get an error (#43).
            if (!self.get('rssURL').match(/^http[s]?:\/\//i)) {
                self.set('rssURL', 'http://' + self.get('rssURL'));
            }

            self.set('isAdding', true);

            console.info('Creating new podcast.');

            var podcast = self.store.createRecord('podcast', {
                rssURL: self.get('rssURL')
            });

            podcast.update().then(function() {
                self.set('isAdding', false);
                self.set('rssURL', '');
                self.transitionToRoute('podcast', podcast);
            }, function() {
                self.set('isAdding', false);
                self.set('isInErrorState', true);
            });


            // createFromController(this, this.get('rssURL'));
        }
    }
});
