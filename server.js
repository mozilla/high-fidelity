'use strict';

var express = require('express');
var app = express.createServer();
var port = process.env.PORT ? process.env.PORT : 3000;

// Configuration.
app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(app.router);

    // Public/static files directory. If you add more folders here,
    // they'll also be served statically from the root URL.
    app.use(express.static(__dirname + '/www'));

    if (!process.env.NODE_ENV) {
        app.use(express.logger('dev'));
    }
});

app.configure(function() {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.listen(port);
console.log('Listening on port ' + port);

exports.app = app;
