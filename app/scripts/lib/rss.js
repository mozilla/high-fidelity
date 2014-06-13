// Podcast Atom/RSS parser. Downloads and extract useful info from a podcast
// feed and returns the data as easy-to-consume (and minimally changed)
// JavaScript objects.
// TODO: Make this less podcast-focused; it would be a useful RSS library
// in general.
(function() {
    'use strict';

    var NUMBER_OF_PODCASTS_TO_GET = 1000;

    // Download a podcast feed from the URL specified. Execute a callback
    // (the second argument) whenever the data loads.
    function getFromGoogle(url, callback) {
        return new Promise(function(resolve, reject) {
            var jsonpCallback = HighFidelity.isPackaged ? '' : '&callback=?';

            $.ajax({
                url: 'https://ajax.googleapis.com/ajax/' +
                     'services/feed/load?v=1.0' + jsonpCallback +
                     // TODO: Actually paginate results; for now we just get
                     // "all" podcasts, presuming most podcasts have fewer
                     // than 1,000 episodes.
                     '&num=' + NUMBER_OF_PODCASTS_TO_GET + '&output=json_xml' +
                     '&q=' + encodeURIComponent(url),
                dataType: 'json',
                success: function(response, xhr) {
                    if (!response || !response.responseData) {
                        console.error('Bad response', response);
                        return reject(xhr);
                    }

                    var xml = new DOMParser();
                    var xmlString = response.responseData.xmlString;
                    var xmlDoc = xml.parseFromString(xmlString, 'text/xml');

                    if (callback) {
                        callback(xmlDoc);
                    }
                    resolve(xmlDoc);
                },
                error: function(error) {
                    reject(error);
                }
            });
        });
    }

    HighFidelity.RSS = {
        get: getFromGoogle
    };
})();
