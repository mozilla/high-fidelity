import LFAdapter from 'ember-localforage-adapter/adapters/localforage';

export default LFAdapter.extend({
    databaseName: 'hifi',
    version: 2,
    migrations: function() {
        this.addModel('podcast');
        this.addModel('episode');
    }
});
