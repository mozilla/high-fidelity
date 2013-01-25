'use strict';

// A very simple, key/value-based IndexedDB library for storing binary data
// in IndexedDB. Used because Podcasts needs to store large binary files (
// podcast image covers and audio files) but can't use Appcache or localStorage.
// Because most data is manipulated with Backbone.js and stored in localStorage
// though, we just use IndexedDB as blob storage.
//
// This library lets a user store arbitrary "big data" in IndexedDB with a
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
  var indexedDB = indexedDB || window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
      IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction;
  var dbVersion = 1;

  // Create/open database.
  var db = window._DB || undefined;

  // Create the podcasts and cover image database.
  function createObjectStore(database) {
    var objectStore = database.createObjectStore(window.GLOBALS.OBJECT_STORE_NAME, {
      autoIncrement: false,
      keyPath: 'id'
    });
  }

  // Connect to the database; should be fired on app start, with the app
  // initialization running after the database is ensured to be working.
  function load(callback) {
    var databaseConnect = indexedDB.open(window.GLOBALS.DATABASE_NAME, dbVersion);

    databaseConnect.onerror = function(event) {
      console.error('Error connecting to IndexedDB. Podcasts will fail.');
    };

    databaseConnect.onsuccess = function(event) {
      db = databaseConnect.result;
      window._DB = db;

      var trans = db.transaction([window.GLOBALS.DATABASE_NAME], 'readwrite');
      var store = trans.objectStore(window.GLOBALS.OBJECT_STORE_NAME);

      db.onerror = function(event) {
          console.log('Error creating/accessing IndexedDB database');
      };
      
      // Interim solution for Google Chrome to create an objectStore. Will be deprecated
      if (db.setVersion) {
        if (db.version !== dbVersion) {
          var setVersion = db.setVersion(dbVersion);
          setVersion.onsuccess = function() {
            createObjectStore(db);
          };
        }
      }

      callback();
    }

    databaseConnect.onupgradeneeded = function(event) {
      createObjectStore(event.target.result);
    };
  }

  // Utility function to destroy everything in the datastore. Probably not
  // useful.
  function clearAll() {
    window.localStorage.clear();
    var objectStore = db.transaction(window.GLOBALS.DATABASE_NAME, 'readwrite').objectStore(window.GLOBALS.OBJECT_STORE_NAME);
 
    objectStore.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
      if (cursor) {
        cursor.continue();
      } else {
        console.log('No more entries!');
      }
    };
  }

  // Destroy a blob based on it's id key.
  // TODO: Write this sucker!
  function destroy(id) {
    var trans = db.transaction([window.GLOBALS.DATABASE_NAME], 'readwrite');
    var store = trans.objectStore(window.GLOBALS.OBJECT_STORE_NAME);
  }

  // Get blob data based on a simple, string key. Sends the request event
  // and the blob data (if it exists) as the two arguments to a callback.
  // TODO: Supply event data to callback.
  function get(id, callback) {
    var transaction = db.transaction([window.GLOBALS.DATABASE_NAME]);
    var objectStore = transaction.objectStore(window.GLOBALS.OBJECT_STORE_NAME);
    var request = objectStore.get(id);

    request.onsuccess = function(event) {
      callback(request.result);
    }
  }

  // Save data based on a key to IndexedDB. This can take some time, be warned.
  function set(id, blob, callback) {
    // Open a transaction to the database.
    var transaction = db.transaction([window.GLOBALS.DATABASE_NAME], 'readwrite');

    // Put the blob into the dabase.
    // TODO: Check for key collisions.
    var put = transaction.objectStore(window.GLOBALS.OBJECT_STORE_NAME).add({id: id, file: blob});

    if (callback) {
      put.onsuccess = callback;
    }
  }

  return {
    destroy: destroy,
    get: get,
    load: load,
    set: set
  }
});
