export default {
  name: 'player-events',
  initialize: function(_, app) {
    app.inject('component', 'PlayerEvents', 'service:player-events');
  }
};
