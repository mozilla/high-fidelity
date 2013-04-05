# Podcasts #

## Description ##

Podcasts is an offline-capable, entirely HTML5/JS audio app. It's chiefly designed for Firefox OS, but support for other platforms and browsers is an eventual design goal. It allows users to subscribe to any podcast and listen to it right from their Firefox OS device!

[Read the full developer walkthrough](https://github.com/mozilla/high-fidelity/blob/master/making-of.md)

## Web API Usage ##

 * **localStorage**
   Used to store settings and basic podcast metadata. Not used for podcast audio files or cover art.
 * **IndexedDB**
   An asynchronous and fast datastore for storing podcast audio and images.
 * **systemXHR**
   Allows cross-domain requests on Firefox OS without CORS.

## Third-party Libraries ##

 * **zepto.js**
   The lightweight jQuery-like library simplifies common tasks such as DOM manipulation.
 * **backbone.js**
   Backbone lets us do data-binding and MVC-style coding, making the app a lot easier to develop.

The app also parses Atom/RSS feeds for podcasts offline and uses IndexedDB as a datastore. Both of these functions were abstracted into libraries available (in alpha!) on GitHub ([IndexedDB](https://github.com/tofumatt/localForage) and [Feed Parser](https://github.com/mozilla/hungry-js)).

## Screenshots ##

 1. http://cl.ly/image/0O3R3811101z
 2. http://cl.ly/image/2c2U2P19421r
 3. http://cl.ly/image/0d0B0I3h1n2u
