'use strict';

import Ember from 'ember';

const NUMBER_OF_PODCASTS_TO_GET = 1000;

export default function getRSS(url, callback) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
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
