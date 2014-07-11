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

    // canDownload: function() {
    //     return HighFidelity.isPackaged;
    // }.property(),

    isPlaying: false,

    isDownloaded: function() {
        return (this.get('audioFile') !== null &&
                this.get('audioFile') !== undefined);
    }.property('audioFile'),

    isNew: function() {
        return !this.get('playbackPosition') && !this.get('playCount');
    }.property('playbackPosition', 'playCount'),

    // Download the episode for local playback.
    download: function() {
        var request = new window.XMLHttpRequest({mozSystem: true});

        request.open('GET', this.get('audioURL'), true);
        request.responseType = 'moz-chunked-arraybuffer';

        request.addEventListener('load', this._setAudioTypeFromEvent);

        request.addEventListener('progress', function(event) {
            localForage.setItem('_chunk-episode-{id}-{chunk}'.format({
                chunk: self._chunkCount,
                id: self.get('id')
            }), request.response, self._incrementChunkSaveCount);

            // Increment our internal data chunk count.
            self._chunkCount++;
        });

        request.addEventListener('error', function(event) {
            window.alert('Error downloading this episode. Please try again.');

            self.trigger('download:cancel');
        });

        request.send(null);
    },

    // Set the audio type based on the responseType (or filename) of this
    // episode's enclosure file/URL.
    // _setAudioTypeFromEvent: function(event) {
    //     // TODO: Make this better.
    //     var type;
    //
    //     try {
    //         type = event.target.response.type.split('/')[1];
    //     } catch (e) {
    //         // Try to extract the type of this file from its filename.
    //         var enclosureArray = this.get('audioURL').split('.');
    //         type = enclosureArray[enclosureArray.length - 1];
    //     }
    //
    //     // Assume "mpeg" = MP3, for now. Kinda hacky.
    //     if (type === 'mpeg') {
    //         type = 'mp3';
    //     }
    //
    //     this.set('type', type);
    //     this.save();
    // }
});

// probably should be mixed-in...
HighFidelity.Episode.reopen({
    attributes: function() {
        var model = this;
        return Ember.keys(this.get('data')).map(function(key) {
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
