// HighFidelity.ApplicationAdapter = DS.FixtureAdapter;
// HighFidelity.ApplicationSerializer = DS.LSSerializer.extend();
// HighFidelity.ApplicationSerializer = DS.LFSerializer.extend();
// HighFidelity.PodcastSerializer = DS.LFSerializer.extend({
//     primaryKey: 'rssURL'
// });
// HighFidelity.ApplicationAdapter = DS.LFAdapter.extend({
//     namespace: 'hifi'
// });
// HighFidelity.ApplicationAdapter = DS.LocalForageAdapter;
// HighFidelity.Adapter.map('HighFidelity.Podcast', {
//     primaryKey: '_id'
// });
// localforage.setDriver(localforage.LOCALSTORAGE);
// HighFidelity.ApplicationSerializer = DS.LocalForageSerializer.extend();
// HighFidelity.ApplicationAdapter = DS.LocalForageAdapter.extend();
//indexedDB.deleteDatabase('hifi');
HighFidelity.ApplicationSerializer = DS.IndexedDBSerializer.extend();
HighFidelity.ApplicationAdapter = DS.IndexedDBAdapter.extend({
    //autoIncrement: true,
    databaseName: 'hifi',
    version: 1,
    migrations: function() {
        this.addModel('podcast');
        this.addModel('episode');
    }
});
// localforage.config({
//     name: 'hifi',
//     storeName: 'podcast'
// });
// HighFidelity.ApplicationAdapter = DS.LSAdapter.extend();
// HighFidelity.ApplicationSerializer = DS.LSSerializer.extend();

// Add ability to query fixtures in development mode.
// if (HighFidelity.ApplicationAdapter === DS.FixtureAdapter) {
//     DS.FixtureAdapter.reopen({
//         queryFixtures: function(records, query, type) {
//             return records.filter(function(record) {
//                 for (var key in query) {
//                     if (!query.hasOwnProperty(key)) { continue; }
//                     var value = query[key];
//                     if (record[key] !== value) { return false; }
//                 }
//                 return true;
//             });
//         }
//     });
// }
