HighFidelity.Episode = DS.Model.extend({
    podcast: DS.belongsTo('podcast', {async: true}),

    name: DS.attr('string'),
    audioURL: DS.attr('string'),
    audioLength: DS.attr('number'),
    playbackPosition: DS.attr('number'),
    playCount: DS.attr('number'),
    audioFile: DS.attr('string'),
    guid: DS.attr('string'),

    // Episode metadata from RSS.
    datePublished: DS.attr('number'),

    isPlaying: false,

    isDownloaded: function() {
        return (this.get('audioFile') !== null &&
                this.get('audioFile') !== undefined);
    }.property('audioFile')
});

// probably should be mixed-in...
HighFidelity.Episode.reopen({
    attributes: function(){
        var model = this;
        return Ember.keys(this.get('data')).map(function(key){
            return Ember.Object.create({
                model: model,
                key: key,
                valueBinding: '  model.' + key
            });
        });
    }.property()
});

// delete below here if you do not want fixtures
HighFidelity.Episode.FIXTURES = [
    {
        id: 0,
        audioURL: 'http://traffic.libsyn.com/atpfm/atp68.mp3',
        datePublished: 1401828879,
        guid: '513abd71e4b0fe58c655c105:513abd71e4b0fe58c655c111:538e35b2e4b07a3ec5184bf4',
        name: '68: Siracusa Waited Impatiently For This',
        playbackPosition: 15.05034
    }
];
