import DS from 'ember-data';

export default DS.LSAdapter.extend({
    databaseName: 'hifi',
    version: 2,
    migrations: function() {
        this.addModel('podcast');
        this.addModel('episode');
    }
});
