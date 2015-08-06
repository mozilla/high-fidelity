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
    }.property('playbackPosition', 'playCount'),

    blobURL: function() {
        var _this = this;

        return new Ember.RSVP.Promise(function(resolve) {
            _this._assembleChunkData().then(function(blob) {
                resolve(window.URL.createObjectURL(blob));
            });
        });
    },

    // Download the episode for local playback.
    download: function(model) {
        this.set('isDownloading', true);
        this.set('_chunkCount', 0);
        this.set('_chunkCountSaved', 0);

        var _this = this;
        var request = new XMLHttpRequest({mozSystem: true});

        request.open('GET', this.get('audioURL'), true);
        request.responseType = 'moz-chunked-arraybuffer';

        // request.addEventListener('load', );
        request.addEventListener('load', function() {
            console.log(request.readyState, request);
            if (request.readyState === 4) {
                // _this._setAudioType(_this.get('audioURL'));
                _this._loadComplete = true;
            }
        });

        request.addEventListener('progress', function() {
            console.info('eventProgress', _this.get('_chunkCount'));
            localforage.setItem('ep:' + _this.get('id') +
                                _this.get('_chunkCount'), request.response)
                       .then(function() {
                // Increment our internal data chunk count.
                _this.incrementProperty('_chunkCountSaved');

                if (_this.get('_chunkCount') ===
                    _this.get('_chunkCountSaved') &&
                    _this.get('_loadComplete')) {
                    console.log('chunk data assembled');
                    _this.set('isDownloading', false);
                    _this.set('isDownloaded', true);
                    // try {
                    //     setTimeout(function() {
                    //         _this.save();
                    //     }, 20);
                    // } catch (e) {
                    //     console.error(e);
                    // }
                }
            });

            _this.incrementProperty('_chunkCount');
        });

        request.addEventListener('error', function() {
            window.alert('Error downloading this episode. Please try again.');

            // _this.trigger('download:cancel');
        });

        request.send(null);
    },

    // Because of limitations/platform bugs in b2g18 (what ships on
    // first-gen Firefox OS devices), we can't move around huge Blob
    // objects (particularly, we can't save them anywhere) without crashing
    // the app on a device from out of memory errors.
    //
    // This retrieves the smaller, more manageable chunks of data from
    // IndexedDB and assembles them into a Blob object we hand off to a
    // callback function. For some reason, B2G seems to cope just fine with
    // this very odd solution because it handles Blobs full of arrayBuffers
    // better than it saves large Blobs.
    //
    // This is a HACK and should be fixed by platform in the next release,
    // I hope.
    //
    // See: https://bugzilla.mozilla.org/show_bug.cgi?id=873274
    // and: https://bugzilla.mozilla.org/show_bug.cgi?id=869812
    _assembleChunkData: function() {
        var audioBlobs = [];
        var chunkCount = this.get('_chunkCount');
        var _this = this;

        return new Ember.RSVP.Promise(function(resolve) {
            function _walkChunks(chunkID) {
                if (chunkID === undefined) {
                    chunkID = 0;
                }

                if (chunkID < chunkCount) {
                    localforage.getItem('ep:' + _this.get('id') + chunkID)
                               .then(function(blob) {
                        console.info('ep:' + _this.get('id') + chunkID, blob);
                        audioBlobs.push(blob);
                        _walkChunks(chunkID + 1);
                    });
                } else {
                    var blob = new Blob(audioBlobs, {type: 'mp3'});
                    resolve(blob);
                }
            }

            _walkChunks();
        });
    },

    // Set the audio type based on the responseType (or filename) of this
    // episode's enclosure file/URL.
    _setAudioType: function(audioURL, event) {
        // TODO: Make this better.
        var type;

        try {
            type = event.target.response.type.split('/')[1];
        } catch (e) {
            // Try to extract the type of this file from its filename.
            var enclosureArray = audioURL.split('.');
            type = enclosureArray[enclosureArray.length - 1];
        }

        // Assume "mpeg" = MP3, for now. Kinda hacky.
        if (type === 'mpeg') {
            type = 'mp3';
        }

        this.set('type', type);
        // this.save();
    }
});
