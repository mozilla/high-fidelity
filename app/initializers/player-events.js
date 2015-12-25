export function initialize(_, app) {
  app.inject('component', 'PlayerEvents', 'service:player-events');
}

export default {
  name: 'player-events',
  initialize: initialize
};
