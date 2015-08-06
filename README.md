# High Fidelity

High Fidelity is a Firefox OS Application for subscribing and listening to podcasts. It is built with ember-cli, using ember-data and localstorage for managing podcast data. Supporting other platforms/browsers, and implementing service workers are eventual design goals.

The app requires elevated XMLHttpRequest privileges to fetch podcast files. In Firefox OS, this currently means being installed as a packaged app. Details for other platforms forthcoming.

## Developing Locally

You will need the following things properly installed on your computer:

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://www.ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

### Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`
* `bower install`

### Running / Development

* `ember server`
* Visit your app at [http://localhost:4200](http://localhost:4200).

#### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

#### Running Tests

* `ember test`
* `ember test --server`

#### Building

* `ember build` (development)


## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://www.ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)


## License

This program is free software; it is distributed under an [MIT License][].

Copyright (c) 2012-2014 Mozilla ([Contributors][]).

[Contributors]: https://github.com/mozilla/high-fidelity/graphs/contributors
[MIT License]: https://github.com/mozilla/high-fidelity/blob/master/LICENSE

