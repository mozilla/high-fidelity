"use strict";

var fs = require('fs');
var path = require('path');
var po2json = require('po2json');

var languages = fs.readdirSync(__dirname);

languages.forEach(function(f) {
    var lang;

    try {
        lang = f.split('/')[0];
    } catch (e) {
        console.log(e);
    }

    // Hacky, obviously.
    if (['.DS_Store', 'extract.sh', 'merge.sh', 'newlocale.sh', 'compile.js',
         'templates'].indexOf(lang) === -1 &&
        lang.match(/[A-Za-z]{2}(-[A-Za-z]{2})?/)) {
        var json;
        var messages = path.join(__dirname, lang, 'LC_MESSAGES', 'messages.po');

        try {
            json = JSON.stringify(po2json.parseSync(messages));
        } catch (e) {
            console.log(e);
        }

        var jsonPath = path.join(__dirname, '../', 'www', 'locale', lang + '.json');
        var stream = fs.createWriteStream(jsonPath, {});
        stream.write(json);

        console.log('Saved ' + lang);
    }
});

console.log('Compiled all PO files to JSON in www/locale');
