import Ember from 'ember';

export default Ember.Controller.extend({
  podcastSorting: ['title'],
  sortedPodcasts: Ember.computed.sort('model', 'podcastSorting')
});
