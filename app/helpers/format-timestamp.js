import Ember from 'ember';
import moment from 'moment';

export function formatTimestamp(timestamp/*, hash*/) {
  return moment.unix(timestamp).format('MMM D');
}

export default Ember.Helper.helper(formatTimestamp);
