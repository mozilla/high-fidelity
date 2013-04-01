# Podcasts in your browser #
## An HTML5 podcasts app for Firefox OS ##

I'm [tofumatt](http://tofumatt.com), and I wrote a Podcasts app in HTML5. Here's how I did it:

### Genesis ###

What started out as a very innocent remark in Mozilla's Mountain View office ("We should write a podcasts app for Firefox OS.") has grown into probably the most intricate JavaScript app I've ever built. *Podcasts for Firefox OS*, codenamed [high fidelity](https://github.com/mozilla/high-fidelity), is a full-featured, fully HTML5 podcasts app comparable in features to something like [Podcasts for iOS](https://itunes.apple.com/app/podcasts/id525463029?mt=8).

In order to make this work, it was clear I was going to need to utilize some pretty cutting-edge web technologies. Sure, the easy way to make "a podcasts app" would be to use a server to parse RSS feeds, pull that data down via an AJAX request, and point an audio tag to a URL. Trouble is: that user experience sucks. There's no offline capabilities and it's not very fast. Plus maintaining a server to run an app that can work entirely client-side on iOS seems bonkers. So I started to take inventory of what I'd need to build a client-side-only, entirely offline-capable, and performant Podcasts app for Firefox OS that I would want to use.

Turns out, I needed:

* **a _large_, _performant_ storage backend to store audio files**
For me, this was IndexedDB; it's fast and can store tonnes of binary data. The only issue was the API isn't that sexy, especially when I really just wanted to use it as a key/value storage for blob data (other app data is stored in localStorage using a [Backbone.js localStorage adapter](https://github.com/mozilla/high-fidelity/blob/9646bdc79f1c7b0fb9c33e8b365ad4d815922349/www/js/lib/backbone.localstorage.js))
* **the ability to make cross-origin requests**
CORS gets you so far here, but many CDNs or even feed hosts don't support it. I needed to be able to make AJAX requests not only to get podcast XML data, but also to download the audio files themselves.
* **compiled JavaScript templates**
Thanks to Firefox OS's [rather strict CSP rules](https://developer.mozilla.org/en-US/docs/Apps/CSP), my templates needed to be compiled. This is a good performance boost and should be a best practice for any client-side app, but it is _required_ for privileged apps on Firefox OS.
* **decoding of common podcast audio formats**
Basically: MP3 support. Firefox OS has this built-in. For in-browser testing, I use JSMad, a pure JS MP3 decoder.
* **a way to parse podcast feeds (Atom and RSS)**
Simple enough, but I still had to do it and deal with weird things like how many feeds redirect.
* **a way to subscribe to podcasts without typing feed URLs**
A mix of some kind of podcast search API (thanks to [wenzel](http://fredericiana.com/) for finding a good one) and web activities, so users don't have to type in a feed URL, especially on a phone. The first iteration of Podcasts had a manual "add" button, and it was awful.

That's the short list of stuff I needed. So, how did it come together?

### The Easy Parts ###

#### Don't be `eval()` ####

Basically all JavaScript templating libraries will `eval()` templates and turn them into executable code. This is fine when debugging, but slow in production. Still, modern browsers being what they are, many apps could never pre-compile their templates and probably make out alright.

For privileged apps, a strict set of CSP rules are enforced, and _any_ `eval()` or `new Function` calls will cause the app to fail. I [include a fancy RequireJS template loader](https://github.com/mozilla/high-fidelity/blob/fb606df7fe956394e8efc71b7503a3342db6ad65/www/js/lib/tpl.js) and pre-compile my templates into my `main.built.js` file to solve this problem.

#### HTTP requests ####

Turns out, **cross-origin HTTP requests** are simple on Firefox OS. All it takes is requesting the `systemXHR` permission in your [web app's manifest](https://developer.mozilla.org/en-US/docs/Apps/Manifest) and initializing all your XHR requests with a special argument:

    var request = new window.XMLHttpRequest({mozSystem: true});

I'm sure you could subclass `XMLHttpRequest` if that's too much typing for you.

There's also a Firefox add-on, [Force CORS](https://addons.mozilla.org/en-us/firefox/addon/forcecors/), that allows you to temporary enable/disable non-same-origin requests in Firefox. Be careful with this add-on though: it affects _the entire browser_ so you're effectively disabling a huge part of JavaScript security in using it. I actually plan on submitting a patch that allows developers to specify on which domains they want it enabled, which should keep things more secure!

#### Parsing feeds ####

This too, was pretty easy. I plan on abstracting the code out into a bit more of a robust library within a month or two, but if you want to check out how I'm fetching and parsing RSS today: [check out the code is on GitHub](https://github.com/mozilla/high-fidelity/blob/640f8091c1f2f7eb68cd6e519e629813772d63b1/www/js/rss.js). Thanks to JavaScript's ability to deal with XML, albeit in a verbose way, this was also a breeze to implement.

#### Subscribing without typing ####

I have to thank [gPodder](http://gpodder.org/) for making this easy. Turns out they have a pretty intense library of podcasts and a dead-simple API to search through said library. The API tends to spit back a lot of garbage and duplicate results, but it's [nothing some relatively simple checks](https://github.com/mozilla/high-fidelity/blob/8f833b77e8ce1774cbf5339b4331b4483c71b70a/www/js/views/search.js#L35) can't fix.

Firefox OS Web Activities are the other piece of this puzzle. They allow an app to, effectively, "listen in" on activities on the phone--like a user clicking a link--and offer functionality that ties in with the data associated with that activity. There's some [awesome documentation on MDN about Web Activities](https://developer.mozilla.org/en-US/docs/WebAPI/Web_Activities).

### A Bit Trickier ###

So those parts of the app were reasonably well-charted territory, but there really aren't many instances of audio apps in HTML5 that actually save _existing_ audio to be played without a network connection. The best example I can think of is actually [Firefox OS's own Music app](https://github.com/mozilla-b2g/gaia/tree/master/apps/music), but even it loads music from internal storage instead of downloading it. Many Audio API experiments aren't about decoding files, but instead _creating entirely new streams_ of audio.

My two big problems were **decoding** and **storage**.

#### Decoding audio ####

Patents suck. While Firefox OS *can* play MP3 files (the format most podcasts arrive in), the desktop version of Firefox on Mac OS X (where I do most of my development) *cannot* (yet). Furthermore, there's no podcast spec; podcasts can come in a myriad of different formats. I'm not planning on supporting obscure or uncommon formats--in fact, most podcasts are in MP3 format--but I figured being able to play AAC, MP3, and OGG files was reasonable. This means that podcasts needs to handle software decoding for [any formats that can't be played by the browser](https://github.com/mozilla/high-fidelity/blob/a2561b8dec18d62e31a6671ea8a6c13dd69bc3bc/www/js/app.js#L17).

This meant relying on some [fantastic implementations by official.fm](http://labs.official.fm/codecs/). Unfortunately, their APIs are not one-to-one with browsers, so a lot of code has to be more-or-less written twice. A good for-instance here: because of some bugs in JSMad (the MP3 decoder), there isn't an audio position scrubber in software mode when playing MP3s.

Still, having access to software decoding as a fallback makes testing easier **and** widens the potential audience for the app; my hope is that as access to `systemXHR`-like APIs across browsers improves, Mozilla's podcasts app could replace a native one, even on desktop.

#### Storing audio ####

Note: I'm oversimplifying this section a bit. For the purposes of this post, let's consider devicestorage, IndexedDB, and WebSQL the same thing.

This one was the tricky one. There are two storage mechanisms available to Firefox OS: localStorage and IndexedDB. localStorage has a very simple API and there's a great Backbone.js adapter for it that lets a developer use it as their sole storage mechanism for Backbone models. Unfortunately, localStorage usually has low storage limits. Worse, though, is that localStorage is an API for synchronous I/O access. This means any interaction with data in localStorage is blocking, so reading/writing huge podcasts files with it was out of the question. Using localStorage to store MP3s would mean any time the user downloaded a podcast the entire app would hang during save. That's a really bad user experience!

Enter IndexedDB. It's an asynchronous data storage API available in the browser. Its API is _much_ more onerous, so it's no wonder developers gravitate toward localStorage. In fact, podcasts still stores a lot of its data in localStorage, but podcast audio and image files are stored in IndexedDB. This means playing a podcast isn't a UI-blocking activity.

I really don't like the IndexedDB API though. So [I created a simple wrapper around it](https://github.com/mozilla/high-fidelity/blob/a2561b8dec18d62e31a6671ea8a6c13dd69bc3bc/www/js/datastore.js) that lets me use it as simple blob storage. I'm planning on, again, extracting this out into a library soon. It should even have a bit of a more robust feature set by then.

### Localization ###

The last thing I want to touch on is localization in Podcasts. I'm using [gettext](http://en.wikipedia.org/wiki/Gettext), but I'm converting the messages into JSON files and accessing them with [Jed](http://slexaxton.github.com/Jed/). It's currently quite simple, but it works well and I think is a much more developer-friendly solution than some others I've seen for purely client-side web apps. My next step is to find a great tool for localizers to contribute strings with; at Mozilla we have tools to do this, but they're a bit tied to Mozilla process and infrastructure. I want something any small team can use easily!

## That's all I've got ##

This is my, hopefully somewhat brief, overview of building Podcasts for Firefox OS. You can [find its code on GitHub](https://github.com/mozilla/high-fidelity) and if you have any bugs or feature requests please see the README to find out about filing bugs. Also: patches more than welcome!
