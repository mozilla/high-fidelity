'use strict';

// A very simple, key/value-based DeviceStorage library for storing binary data
// on Firefox OS. Used because Podcasts needs to store large binary files (
// podcast image covers and audio files) but can't use Appcache or localStorage.
// Because most data is manipulated with Backbone.js and stored in localStorage
// though, we just use DeviceStorage as blob storage.
//
// This library lets a user store arbitrary "big data" in DeviceStorage with a
// stupid simple API:
//
//     // To get a blob:
//     DataStore.get('some-key', callback)
//
//     // To set a key:
//     DataStore.set('some-key', blobData, callback)
//
//     // And to destroy data:
//     DataStore.destroy('some-key', callback)
define(function(require) {
    // Create/open database.
    var deviceStorage = window.navigator.getDeviceStorage('sdcard');

    // Connect to the database; should be fired on app start, with the app
    // initialization running after the database is ensured to be working.
    function load(callback) {
        callback();
    }

    // Utility function to destroy everything in the datastore. Probably not
    // useful.
    function clearAll() {
        window.alert('TODO');
    }

    // Destroy a blob based on its id key.
    function destroy(id, callback) {
        var deleteRequest = deviceStorage.delete(id);

        if (callback) {
            deleteRequest.onsuccess = callback;
        }

        return deleteRequest;
    }

    // Get blob data based on a simple, string key. Sends the request event
    // and the blob data (if it exists) as the two arguments to a callback.
    // TODO: Supply event data to callback.
    function get(id, callback) {
        var request = deviceStorage.get(id);

        request.onsuccess = function(event) {
            callback(request.result);
        }
    }

    // Save data based on a key to IndexedDB. This can take some time, be warned.
    function set(id, blob, callback) {
        var request = deviceStorage.addNamed(blob, id);

        request.onerror = function() {
            window.alert('SET FAILED ' + id);
        }

        if (callback) {
            request.onsuccess = callback;
        }
    }

    return {
        destroy: destroy,
        get: get,
        load: load,
        set: set
    };
});
