_ = window.document.webL10n.get

Handlebars.registerHelper "trans", ->
  variables = {}

  if arguments.length > 1
    for i in [1..arguments.length] by 2
      variables[arguments[i]] = arguments[i + 1] if arguments.hasOwnProperty(i)

  new Handlebars.SafeString(_ arguments[0], variables)

window.addEventListener "localized", ->
  HighFidelity = window.HighFidelity = Ember.Application.create()

  # Order and include as you please.
  require "scripts/controllers/*"
  require "scripts/store"
  require "scripts/models/*"
  require "scripts/routes/*"
  require "scripts/views/*"
  require "scripts/router"
  require "/bower_components/fxos-ui/scripts/components/*"
