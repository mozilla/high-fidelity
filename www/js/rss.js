/*jshint forin:false, plusplus:false, sub:true */
'use strict';

// Podcast Atom/RSS parser. Downloads and extract useful info from a podcast
// feed and returns the data as easy-to-consume (and minimally changed)
// JavaScript objects.
define([], function() {
    // Text fields to look for on both channels and episodes.
    var TEXT_FIELDS = ['description', 'guid', 'link', 'itunes:image', 'pubDate', 'title'];

    // Download a podcast feed from the URL specified. Execute a callback
    // (the second argument) whenever the data loads.
    function download(url, callback) {
        var request = new window.XMLHttpRequest();

        request.open('GET', url, true);

        request.addEventListener('load', function(event) {
            if (callback) {
                callback(parser(request.response));
            }
        });

        request.send(null);

        return request;
    }

    // Parse an RSS feed (either actual RSS text or a parsed XML object) and
    // return a subset of the data as a useful object full of podcast data.
    // Will include iTunes images, descriptions, and enclosures.
    function parser(rss) {
        var podcast = {
            items: []
        };
        
        rss = xmlToJSON(rss).rss;

        TEXT_FIELDS.forEach(function(f) {
            if (rss.channel && rss.channel[f] && rss.channel[f]['#text']) {
                podcast[f] = rss.channel[f]['#text'];
            }
        });

        // Fetch individual items and store their relevant info.
        rss.channel.item.forEach(function(item) {
            var episode = {};

            if (item.enclosure) {
                episode.enclosure = item.enclosure['@attributes'];
            } else {
                return;
            }

            TEXT_FIELDS.forEach(function(f) {
                if (item && item[f] && item[f]['#text']) {
                    episode[f] = item[f]['#text'];
                }
            });

            podcast.items.push(episode);
        });

        return podcast;
    }

    // Utility function to parse an XML string or object and transform it into
    // a weird JavaScript object representing XML, because I still think it's
    // easier to deal with than XPath. Thanks to James Johnson on
    // Stack Overflow, who wrote code I borrowed as the basis for this function.
    function xmlToJSON(xml) {
        if (typeof(xml) === 'string') {
            xml = (new window.DOMParser()).parseFromString(xml, 'text/xml');
        }

        var json = {};

        if (xml.nodeType === 1) {
            if (xml.attributes.length > 0) {
                json['@attributes'] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    json['@attributes'][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType === 3) {
            json = xml.nodeValue;
        }

        if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;

                if (typeof(json[nodeName]) === 'undefined') {
                    json[nodeName] = xmlToJSON(item);
                } else {
                    if (typeof(json[nodeName].push) === 'undefined') {
                        var old = json[nodeName];
                        json[nodeName] = [];
                        json[nodeName].push(old);
                    }

                    // Is there an echo in here?
                    json[nodeName].push(xmlToJSON(item));
                }
            }
        }

        return json;
    }

    return {
        download: download,
        parser: parser,
        xmlToJSON: xmlToJSON
    };
});
