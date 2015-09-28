import Ember from 'ember';

export default Ember.Component.extend({
  sortedEpisodesProps: ['datePublished:desc'],
  sortedEpisodes: Ember.computed.sort('data', 'sortedEpisodesProps'),
  actions: {
      download: function(episode) {
          episode.download();
      },

      setEpisode: function(episode) {
          var currentEpisode = this.PlayerEvents.currentEpisode;
          var episodeAlreadySelected = (episode === currentEpisode);

          // if the episode is already selected
          if (episodeAlreadySelected) {
              if (episode.get('isPlaying')) { // and is currently playing
                  this.PlayerEvents.publish('pauseEpisode', episode);
              } else { // and is currently paused
                  this.PlayerEvents.publish('playEpisode', episode);
              }
          } else { // if the episode is not already selected
              if (currentEpisode) { // and there is another episode selected
                  this.PlayerEvents.publish('pauseEpisode', currentEpisode); // pause the currently selected episode
                  this.PlayerEvents.publish('playEpisode', episode); // play the new episode
              } else { // and there is not an episode currently selected
                  this.PlayerEvents.publish('playEpisode', episode); // play the new episode
              }
          }
      }
  }
});
