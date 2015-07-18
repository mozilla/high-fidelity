import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('search');

  this.resource('podcasts', function() {
    this.route('new');
  });

  this.resource('podcast', { path: '/podcast/:podcast_id'});
  this.resource('episode', { path: '/episode/:episode_id' });
  this.route('podcast');
});

export default Router;
