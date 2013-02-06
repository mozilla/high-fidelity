/*jshint forin:false, plusplus:false, sub:true */
'use strict';

// Podcast Atom/RSS parser. Downloads and extract useful info from a podcast
// feed and returns the data as easy-to-consume (and minimally changed)
// JavaScript objects.
// TODO: Make this less podcast-focused; it would be a useful RSS library
// in general.
define(['underscore'], function(_) {
    // Fields we get attributes from instead of simple text.
    var ATTRIBUTE_FIELDS = {'enclosure': 'url', 'itunes:image': 'href'};
    // Text fields to look for on both channels and episodes.
    var TEXT_FIELDS = ['description', 'guid', 'link', 'pubDate', 'title'];

    // Download a podcast feed from the URL specified. Execute a callback
    // (the second argument) whenever the data loads.
    function download(url, callback) {
        var request = new window.XMLHttpRequest({mozSystem: true});

        request.open('GET', url, true);

        request.addEventListener('load', function(event) {
            if (callback) {
                callback(parse(request.response));
            }
        });

        request.send(null);

        return request;
    }

    // Parse an RSS feed (either actual RSS text or a parsed XML object) and
    // return a subset of the data as a useful object full of RSS data.
    function parse(rss) {
        var feed = {
            items: []
        };

        rss = xmlToJSON(rss).rss;

        _.keys(ATTRIBUTE_FIELDS).forEach(function(f) {
            if (rss.channel && rss.channel[f] && rss.channel[f]['@attributes']) {
                feed[f] = rss.channel[f]['@attributes'][ATTRIBUTE_FIELDS[f]];
            }
        });
        TEXT_FIELDS.forEach(function(f) {
            // TODO: Normalize the weird XML-representation of this data
            // so getting at it is easier.
            if (rss.channel && rss.channel[f] && rss.channel[f]['#text']) {
                feed[f] = rss.channel[f]['#text'];
            }
        });

        // Fetch individual items and store their relevant info.
        rss.channel.item.forEach(function(item) {
            var parsedItem = {};

            // Don't bother with items lacking an enclosure attribute.
            if (!item.enclosure) {
                return;
            }

            _.keys(ATTRIBUTE_FIELDS).forEach(function(f) {
                if (item && item[f] && item[f]['@attributes']) {
                    parsedItem[f] = item[f]['@attributes'][ATTRIBUTE_FIELDS[f]];
                }
            });
            TEXT_FIELDS.forEach(function(f) {
                if (item && item[f] && item[f]['#text']) {
                    parsedItem[f] = item[f]['#text'];
                }
            });

            feed.items.push(parsedItem);
        });

        return feed;
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

        // TODO: If any more nodeTypes are needed, convert this to a
        // switch/case so it's a bit easier to read.
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
        parse: parse,
        xmlToJSON: xmlToJSON
    };
});
