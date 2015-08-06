import Ember from 'ember';

export default Ember.Controller.extend({
  isAdding: false,
  isInErrorState: false,
  rssURL: '',
  actions: {
    create: function(url) {
      var self = this;

      if (url) {
        self.set('rssURL', url);
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

      // var existingPodcast = self.store.find('podcast', {
      //   rssURL: self.get('rssURL')
      // }).then(function(podcast) {
      //   console.log('Podcast: ', podcast);
      //   console.info('Podcast already exists', podcast.objectAt(0));

      //   self.set('isAdding', false);
      //   self.set('rssURL', '');
      //   self.transitionToRoute('podcast', podcast.objectAt(0));
      // }, function() {

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
      // });
    }
  }
});
