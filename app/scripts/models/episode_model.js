HighFidelity.Episode = DS.Model.extend({
    podcast: DS.belongsTo('podcast', {async: true}),

    name: DS.attr('string'),
    audioURL: DS.attr('string'),
    audioLength: DS.attr('number'),
    playbackPosition: DS.attr('number'),
    audioFile: DS.attr('string'),

    // Episode metadata from RSS.
    datePublished: DS.attr('date'),
    episodeId: DS.attr('number'),

    isPlaying: false,

    isDownloaded: function() {
        return this.get('audioFile') !== null && this.get('audioFile') !== undefined;
    }.property('audioFile')
});

// probably should be mixed-in...
HighFidelity.Episode.reopen({
  attributes: function(){
    var model = this;
    return Ember.keys(this.get('data')).map(function(key){
      return Ember.Object.create({ model: model, key: key, valueBinding: 'model.' + key });
    });
  }.property()
});

// delete below here if you do not want fixtures
HighFidelity.Episode.FIXTURES = [
    {
        id: 0,
        name: 'The Year Of Casey',
        audioURL: 'http://traffic.libsyn.com/atpfm/atp65.mp3',
        playbackPosition: 0,
        datePublished: (new Date()),
        episodeId: 65
    },
    {
        id: 1,
        name: 'Boiling A Pretty Big Lake',
        audioURL: 'http://traffic.libsyn.com/atpfm/atp66.mp3',
        playbackPosition: 0,
        audioFile: 'foo',
        datePublished: (new Date()),
        episodeId: 66
    }
];
