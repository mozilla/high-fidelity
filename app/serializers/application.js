import DS from 'ember-data';

export default DS.LSSerializer.extend({
  serializeHasMany: function(snapshot, json, relationship) {
      var key = relationship.key;
      var payloadKey = this.keyForRelationship ? this.keyForRelationship(key, "hasMany") : key;
      var relationshipType = snapshot.type.determineRelationshipType(relationship, this.store);

      if (relationshipType === 'manyToNone' ||
          relationshipType === 'manyToMany' ||
          relationshipType === 'manyToOne') {
        json[payloadKey] = snapshot.hasMany(key, { ids: true });
        // TODO support for polymorphic manyToNone and manyToMany relationships
      }
    }
});
