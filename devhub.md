# Podcasts #

## Description ##

Podcasts is an offline-capable, entirely HTML5/JS audio app. It's chiefly designed for Firefox OS, but support for other platforms and browsers is an eventual design goal. It allows users to subscribe to any podcast and listen to it right from their Firefox OS device!

[Read the full developer walkthrough](https://github.com/mozilla/high-fidelity/blob/master/making-of.md)

## Web API Usage ##

 * **localStorage**
   Used to store settings and basic podcast metadata. NOT used for podcast audio files or cover art.
 * **IndexedDB**
   Asynchronous, big, and fast datastore. Ideally the entire app would use IndexedDB for storage, but not all browsers even support it, and the API is more taxing. Still, podcast audio and image covers are stored in IndexedDB for a smooth experience.
 * **systemXHR**
   We download every straight from client-side Javascript, so we have to be able to make requests to third-party servers. On Firefox OS, systemXHR lets us do this.

## Third-party Libraries ##

 * **zepto.js**
   The lightweight jQuery-like library simplifies common tasks such as DOM manipulation.
 * **backbone.js**
   Backbone lets us do data-binding and MVC-style coding, making the app a lot easier to develop.

The app also parses Atom/RSS feeds for podcasts offline and uses IndexedDB as a datastore. Both of these functions were abstracted into libraries available (in alpha!) on GitHub ([IndexedDB](https://github.com/tofumatt/localForage) and [Feed Parser](https://github.com/mozilla/hungry-js)).
