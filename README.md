# high-fidelity [![Build Status](https://travis-ci.org/mozilla/high-fidelity.svg?branch=master)](https://travis-ci.org/mozilla/high-fidelity)

## Introduction

This is an experimental, rewrite branch using Ember.js and Mozilla's recroom.

high-fidelity is an offline-capable, entirely _HTML5/JS_ podcasts app. It's
chiefly designed for Firefox OS, but support for other platforms and browsers
is an eventual design goal. It requires a datastore that supports large files;
currently, we just use IndexedDB.

The app requires elevated _XMLHttpRequest_ privileges to fetch podcast files.
In Firefox OS, this currently means being installed as a packaged app. Details
for other platforms forthcoming.


## Developing Locally - Getting Started

To run a local version of high-fidelity, clone this repo and `cd` into it from your command line:

`git clone git@github.com:mozilla/high-fidelity.git && cd high-fidelity`

Install all necessary bower components and node modules:

`bower install && npm install`

If you have the [recroom] binary installed (`npm install recroom -g`), you can run the following tasks from your command line:

`recroom run` Serves your app on port 9000 and will livereload when changes are made  
`recroom build` Compiles the distributable build of your app to the `dist/` folder

If you don't have or don't wish to install the recroom binary, you can run standard grunt commands (`grunt serve` and `grunt build`, respectively) to perform the same tasks.

## License

This program is free software; it is distributed under an [MIT License][].

Copyright (c) 2012-2014 Mozilla ([Contributors][]).

[recroom]: https://github.com/mozilla/recroom
[Contributors]: https://github.com/mozilla/high-fidelity/graphs/contributors
[MIT License]: https://github.com/mozilla/high-fidelity/blob/master/LICENSE
