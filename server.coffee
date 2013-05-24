'use strict'

express = require 'express'
app = express.createServer()
port = 8181

app_folder = process.env.PWD

# Configuration.
app.configure ->
  app.use express.bodyParser()
  app.use express.methodOverride()

  app.use app.router

  # Public/static files directory. If you add more folders here,
  # they'll also be served statically from the root URL.
  app.use express.static(app_folder + '/www-manifest')

  app.use express.logger('dev') unless process.env.NODE_ENV

app.configure ->
  app.use express.errorHandler
    dumpExceptions: true
    showStack: true

app.get ''

app.listen port

console.log ''
console.log 'Listening on port ' + port
console.log 'Serving folder ' + app_folder + '/www-manifest'
console.log ''

exports.app = app
