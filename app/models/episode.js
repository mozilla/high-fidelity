import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
    podcast: DS.belongsTo('podcast', {async: true}),

    name: DS.attr('string'),
    audioURL: DS.attr('string'),
    audioLength: DS.attr('number'),
    playbackPosition: DS.attr('number'),
    playCount: DS.attr('number'),
    // audioFile: DS.attr('object'),
    guid: DS.attr('string'),

    // Episode metadata from RSS.
    datePublished: DS.attr('number'),

    // Episode download data; unavailable in hosted version for the time being.
    isDownloaded: DS.attr('boolean'),
    _chunkCount: DS.attr('number'),
    _chunkCountSaved: DS.attr('number'),
    _loadComplete: false,

    isDownloading: false,
    isPlaying: false,

    isNew: function() {
        return !this.get('playbackPosition') && !this.get('playCount');
    }.property('playbackPosition', 'playCount')
});
