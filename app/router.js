import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('search');

  this.route('podcasts', { path: '/podcasts' }, function() {
    this.route('new');
  });

  this.route('podcast', { path: '/podcast/:podcast_id'});
});

export default Router;
