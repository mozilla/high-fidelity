HighFidelity = window.HighFidelity = Ember.Application.create()

# Order and include as you please.
require "scripts/controllers/*"
require "scripts/store"
require "scripts/models/*"
require "scripts/routes/*"
require "scripts/views/*"
require "scripts/router"
require "/bower_components/fxos-ui/scripts/components/*"
