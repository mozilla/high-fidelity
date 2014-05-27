// Podcast Atom/RSS parser. Downloads and extract useful info from a podcast
// feed and returns the data as easy-to-consume (and minimally changed)
// JavaScript objects.
// TODO: Make this less podcast-focused; it would be a useful RSS library
// in general.
(function() {
    'use strict';

    // Download a podcast feed from the URL specified. Execute a callback
    // (the second argument) whenever the data loads.
    function getFromGoogle(url, callback) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=' + encodeURIComponent(url) + '&num=' + 15 + '&output=json_xml',
                dataType: 'json',
                success: function(response) {
                    var xml = new DOMParser();
                    var xmlString = response.responseData.xmlString;
                    var xmlDoc = xml.parseFromString(xmlString, 'text/xml');

                    if (callback) {
                        callback(xmlDoc);
                    }
                    resolve(xmlDoc);
                },
                error: function() {
                    reject();
                }
            });
        });
    }

    HighFidelity.RSS = window.RSS = {
        get: getFromGoogle
    };
})();
