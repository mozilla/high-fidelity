'use strict';

// Do simple substitutions on any String object. (Monkeypatching FTW.)
// Accepts either an array or an object of subsitutions.
// If you supply an Array:
//   `'Hello {0}.'.format(['world'])` will return: 'Hello world.'
// If you supply an Object:
//   `'Hello {world}.'.format({world: 'Earth'})` will return: 'Hello Earth.'
String.prototype.format = function(substitutions) {
  return this.replace(/\{([A-Za-z0-9]+)\}/g, function(match, key) {
    return substitutions[key] !== undefined ? substitutions[key] : ''
  })
}
