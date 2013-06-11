/*jshint forin:false, plusplus:false, sub:true */
define([
    'underscore',
    'backbone',
    'datastore',
    'queue',
    'collections/episodes',
    'require'
], function(_, Backbone, DataStore, queue, Episodes, require) {
    'use strict';

    var EpisodeModel = Backbone.Model.extend({
        // Keep track of how many chunks of data we receive and how many
        // we've saved, so we know when we have all data. These values are
        // transitive; they aren't saved in the model's persistent datastore.
        _chunkCount: 0,
        _chunkSaveCount: 0,

        collection: Episodes,
        defaults: {
            chunkCount: 0,
            isDownloaded: false,
            playbackPosition: 0,
            url: null
        },

        initialize: function() {
            _(this).bindAll('_download', '_incrementChunkSaveCount',
                            '_setAudioTypeFromEvent');
        },

        // Access an app's blob data from indexedDB.
        blob: function(callback) {
            this._assembleChunkData(callback);
        },

        // Output the published date of this podcast in a pretty way.
        date: function() {
            var date = new Date(this.get('datePublished'));
            return date.toLocaleDateString();
        },

        // Extend Backbone's default destroy method so we also delete the
        // podcast blob in indexedDB.
        destroy: function(options) {
            DataStore.destroy('e{id}'.format({id: this.get('id')}));

            return Backbone.Model.prototype.destroy.call(this, options);
        },

        // TODO: Fire an event that says we've queued this download, so we
        // can display this information in the UI.
        // TODO: Hook the above into the UI.
        download: function() {
            this.trigger('download:queued');
            queue.add('e{id}'.format({id: this.get('id')}), this);
        },

        podcast: function() {
            var Podcasts = require('collections/podcasts');
            return Podcasts.where({id: this.get('podcastID')})[0];
        },

        // Download a podcast's audio file. Called by the download queue
        // manager, so we don't try to download one hundred MP3s at once!
        _download: function() {
            var self = this;

            this.trigger('download:started');

            var request = new window.XMLHttpRequest({mozSystem: true});

            request.open('GET', this.get('enclosure'), true);
            request.responseType = 'moz-chunked-arraybuffer';

            request.addEventListener('load', this._setAudioTypeFromEvent);

            request.addEventListener('progress', function(event) {
                self._saveChunk(self._chunkCount, request.response);

                // Increment our internal data chunk count.
                self._chunkCount++;
            });

            request.addEventListener('error', function(event) {
                window.alert('Error downloading this episode. Please try again.');

                self.trigger('download:cancel');
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
        _assembleChunkData: function(callback) {
            var audioBlobs = [];
            var chunkCount = this.get('chunkCount');
            var self = this;
            var type = this.get('type');

            function _walkChunks(chunkID) {
                if (chunkID === undefined) {
                    chunkID = 0;
                }

                if (chunkID < chunkCount) {
                    DataStore.get('_chunk-episode-{id}-{chunk}'.format({
                        chunk: chunkID,
                        id: self.get('id')
                    }), function(data) {
                        audioBlobs.push(data.file);
                        _walkChunks(chunkID + 1);
                    });
                } else {
                    var blob = new window.Blob(audioBlobs, {type: type});
                    callback(blob);
                }
            }

            _walkChunks();
        },

        // Called as a callback whenever a new chunk of audio data is saved.
        // Used to keep track of the number of downloaded versus processed
        // chunks, and to fire the queue finished, download, and update events.
        _incrementChunkSaveCount: function() {
            this._chunkSaveCount++;

            if (this._chunkCount === this._chunkSaveCount && this.get('type')) {
                this.set({
                    chunkCount: this._chunkCount,
                    isDownloaded: true
                });
                this.save();

                queue.done('e{id}'.format({id: this.get('id')}));

                this.trigger('downloaded');
                this.trigger('updated');
            }
        },

        _saveChunk: function(chunk, arrayBuffer) {
            DataStore.set('_chunk-episode-{id}-{chunk}'.format({
                chunk: chunk,
                id: this.get('id')
            }), arrayBuffer, this._incrementChunkSaveCount);
        },

        // Set the audio type based on the responseType (or filename) of this
        // episode's enclosure file/URL.
        _setAudioTypeFromEvent: function(event) {
            // TODO: Make this better.
            var type;

            try {
                type = event.target.response.type.split('/')[1];
            } catch (e) {
                // Try to extract the type of this file from its filename.
                var enclosureArray = this.get('enclosure').split('.');
                type = enclosureArray[enclosureArray.length - 1];
            }

            // Assume "mpeg" = MP3, for now. Kinda hacky.
            if (type === 'mpeg') {
                type = 'mp3';
            }

            this.set({type: type});
            this.save();
        }
    });

    return EpisodeModel;
});
