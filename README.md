# high-fidelity [![Build Status](https://travis-ci.org/mozilla/high-fidelity.svg?branch=master)](https://travis-ci.org/mozilla/high-fidelity)

## Introduction

This is an experimental, rewrite branch using __Ember.js__ and __Mozilla's recroom__.

high-fidelity is an offline-capable, entirely _HTML5/JS_ podcasts app. It's
chiefly designed for __Firefox OS__, but support for other platforms and browsers
is an eventual design goal. It requires a datastore that supports large files;
currently, we just use __IndexedDB__.

The app requires elevated _XMLHttpRequest_ privileges to fetch podcast files.
In __Firefox OS__, this currently means being installed as a packaged app. Details
for other platforms forthcoming.

## License 

This program is free software; it is distributed under an [MIT License][].

Copyright (c) 2012-2014 Mozilla ([Contributors][]).

[Contributors]: https://github.com/mozilla/high-fidelity/graphs/contributors
[MIT License]: https://github.com/mozilla/high-fidelity/blob/master/LICENSE
