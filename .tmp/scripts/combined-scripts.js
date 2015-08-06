(function() {

var HighFidelity = window.HighFidelity = Ember.Application.create({
    LOG_TRANSITIONS: true
});

// Order and include as you please.


})();

(function() {

// This code sets the min-height of the x-layout element to the height of
// the viewport in older versions of Gecko (essentially, < 19 i.e. Firefox OS
// 1.0 and 1.1). This prevents flexbox bugs.
$(function() {
    if (window.navigator.userAgent &&
        window.navigator.userAgent.match('Firefox/18.0')) {
        $('html').addClass('fxos11');
    }
});


})();

(function() {

// MozApps helpers.
(function() {
    'use strict';

    function checkIfPackaged(app) {
        // By default, we aren't a packaged app.
        app.set('isPackaged', false);

        if (window.navigator.mozApps) {
            var appRequest = window.navigator.mozApps.getSelf();

            appRequest.addEventListener('success', function() {
                if (appRequest.result) {
                    // The app is installed.
                    if (appRequest.result.manifest &&
                        appRequest.result.manifest.type === 'privileged') {
                        app.set('isPackaged', true);
                        app.set('_permissions', appRequest.result.manifest
                                                                 .permissions);

                        jQuery.ajaxSettings.xhr = function() {
                            try {
                                return new XMLHttpRequest({mozSystem: true});
                            } catch (error) {
                                console.error(error);
                            }
                        };
                    }
                }
            });
        } else {
            console.debug('Open Web Apps not supported');
        }
    }

    HighFidelity.MozApps = {
        checkIfPackaged: checkIfPackaged
    };
})();


})();

(function() {

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


})();

(function() {

// Time helpers.
(function() {
    'use strict';

    // Format a time in seconds to a pretty 5:22:75 style time. Cribbed from
    // the Gaia Music app.
    function formatTime(secs) {
        if (isNaN(secs)) {
            return '--:--';
        }

        var hours = parseInt(secs / 3600, 10) % 24;
        var minutes = parseInt(secs / 60, 10) % 60;
        var seconds = parseInt(secs % 60, 10);

        var time = (hours !== 0 ? hours + ':' : '') +
                   (minutes < 10 ? '0' + minutes : minutes) + ':' +
                   (seconds < 10 ? '0' + seconds : seconds);

        return time;
    }
    HighFidelity.formatTime = formatTime;

    // Return a timestamp from a JavaScript Date object. If no argument is
    // supplied, return the timestamp for "right now".
    function timestamp(date) {
        if (!date) {
            date = new Date();
        }

        if (date instanceof Date !== true) {
            date = new Date(date);
        }

        return Math.round(date.getTime() / 1000);
    }

    HighFidelity.timestamp = timestamp;
})();


})();

(function() {

// TODO: Check this somehow?
HighFidelity.MozApps.checkIfPackaged(HighFidelity);


})();

(function() {

Ember.Handlebars.registerHelper('t', function(property, options) {
    var params = options.hash;
    var _this = this;

    // Support variable interpolation for this string.
    Object.keys(params).forEach(function(key) {
        params[key] = Ember.Handlebars.get(_this, params[key], options);
    });

    return I18n.t(property, params);
});


})();

(function() {

I18n.defaultLocale = "en-US";
I18n.locale = window.navigator.language || 'en-US';
I18n.fallbacks = true;
I18n.translations = {
    // English by @tofumatt
    en: {
        app: {
            title: 'Podcasts',
        },
        episode: {
            episodes: 'Episodes',
            new: 'New:',
        },
        podcast: {
            add: 'Add',
            addOne: 'Want to add one?',
            addRSSFeed: 'Add RSS Feed',
            newToPodcasts: 'New to Podcasts?',
            noneFound: 'No podcasts found.',
            recommendations: 'Check out our recommendations:',
        },
        search: {
            find: 'Find',
            noResults: 'No results.',
            placeholder: 'Podcast Name or Keywords',
            searchForAPodcast: 'Search for a Podcast',
            subscribe: 'Subscribe to {{podcast}}?',
        },
        tabs: {
            myPodcasts: 'My Podcasts',
            popular: 'Popular',
            search: 'Search',
        },
    },

    // Esperanto by @Airon90
    eo: {
        app: {
            title: 'Podkastoj',
        },
        episode: {
            episodes: 'Epizodoj',
            new: 'Nova:',
        },
        podcast: {
            add: 'Aldoni',
            addOne: 'Ĉu vi volas aldoni novan?',
            addRSSFeed: 'Aldoni RSS-fluon',
            newToPodcasts: 'Ĉu malkutimas podkastojn?',
            noneFound: 'Neniu podkasto trovata.',
            recommendations: 'Kontrolu niajn rekomendojn:',
        },
        search: {
            find: 'Trovi',
            noResults: 'Neniu rezulto.',
            placeholder: 'Nomo de podkasto aŭ ŝlosilvorto',
            searchForAPodcast: 'Serĉi podkaston',
            subscribe: 'Ĉu aliĝi al {{podcast}}?',
        },
        tabs: {
            myPodcasts: 'Miaj podkastoj',
            popular: 'Popularaj',
            search: 'Serĉi',
        },
    },

    // French by @AntoineTurmel
    fr: {
        app: {
            title: 'Podcasts',
        },
        episode: {
            episodes: "Episodes",
            new: 'nouveau:',
        },
        podcast: {
            add: 'Ajouter',
            addOne: 'Voulez-vous en ajouter un?',
            addRSSFeed: 'Ajouter un flux RSS',
            newToPodcasts: 'Vous ne connaissez pas de Podcasts?',
            noneFound: 'Aucun podcast trouvé.',
            recommendations: 'Voici nos recommandations:',
        },
        search: {
            find: 'chercher',
            noResults: 'Aucun résultat.',
            placeholder: 'Nom du podcast ou mots-clés',
            searchForAPodcast: 'Trouver un podcast',
            subscribe: 'S\'abonner à {{podcast}}?',
        },
        tabs: {
            myPodcasts: 'mes podcasts',
            popular: 'populaire',
            search: 'recherche',
        },
    },
    
    // Italian by @Airon90
    it: {
        app: {
            title: 'Podcast',
        },
        episode: {
            episodes: 'Episodi',
            new: 'Nuovo:',
        },
        podcast: {
            add: 'Aggiungi',
            addOne: 'Aggiungi uno nuovo?',
            addRSSFeed: 'Aggiungi feed RSS',
            newToPodcasts: 'Nuovo ai podcast?',
            noneFound: 'Nessun podcast trovato.',
            recommendations: 'Controlla i nostri consigli:',
        },
        search: {
            find: 'Trova',
            noResults: 'Nessun risultato.',
            placeholder: 'Nome del podcast o parola chiave',
            searchForAPodcast: 'Cerca un podcast',
            subscribe: 'Vuoi abbonarti a {{podcast}}?',
        },
        tabs: {
            myPodcasts: 'I miei podcast',
            popular: 'Popolari',
            search: 'Cerca',
        },
    },

    // Polish by @MaciejCzyzewski
    pl: {
        app: {
            title: 'Podcasty', // Transmisje
        },
        episode: {
            episodes: 'Epizody', // Fragmenty
            new: 'Nowe:',
        },
        podcast: {
            add: 'Dodaj',
            addOne: 'Chcesz jedno dodać?',
            addRSSFeed: 'Dodaj źródło RSS',
            newToPodcasts: 'Nowe do podcastu?',
            noneFound: 'Nie znaleziono podcastów.',
            recommendations: 'Sprawdź nasze rekomendacje:',
        },
        search: {
            find: 'Szukaj',
            noResults: 'Brak wyników.',
            placeholder: 'Podcast tytuł albo słowo kluczowe',
            searchForAPodcast: 'Szukaj w podcastach',
            subscribe: 'Subskrybuj {{podcast}}?',
        },
        tabs: {
            myPodcasts: 'Moje Podcasty',
            popular: 'Popularne',
            search: 'Szukaj',
        },
    },
    // galego by @xmgz
    gl: {
        app: {
            title: 'Podcasts',
        },
        episode: {
            episodes: 'Episodios',
            new: 'Novo:',
        },
        podcast: {
            add: 'Engadir',
            addOne: 'Quere engadir un?',
            addRSSFeed: 'Engdir fonte RSS',
            newToPodcasts: 'Novo nos podcast?',
            noneFound: 'Non se atoparon podcast.',
            recommendations: 'Mire as nosas recomendacións:',
        },
        search: {
            find: 'Buscar',
            noResults: 'Sen resultados.',
            placeholder: 'Nome do podcast ou palabras chave',
            searchForAPodcast: 'Buscar un podcast',
            subscribe: 'Suscribirse a {{podcast}}?',
        },
        tabs: {
            myPodcasts: 'Os meus podcast',
            popular: 'Popular',
            search: 'Buscar',
        },
    },
    // spanish by @xmgz
    es: {
        app: {
            title: 'Podcasts',
        },
        episode: {
            episodes: 'Episodios',
            new: 'Nuevo:',
        },
        podcast: {
            add: 'Añadir',
            addOne: 'Desea añadir uno',
            addRSSFeed: 'Añadir fuente RSS',
            newToPodcasts: 'Nuevo en los podcast?',
            noneFound: 'No se encontraron podcast.',
            recommendations: 'Estas son nuestras recomendaciones:',
        },
        search: {
            find: 'Buscar',
            noResults: 'Sin resultados.',
            placeholder: 'Nombre del podcast o palabras clave',
            searchForAPodcast: 'Buscar un podcast',
            subscribe: 'Suscribirse a {{podcast}}?',
        },
        tabs: {
            myPodcasts: 'Mis podcast',
            popular: 'Popular',
            search: 'Buscar',
        },
    },
};


})();

(function() {

HighFidelity.ApplicationController = Ember.ObjectController.extend({
    isPackaged: function() {
        return HighFidelity.get('isPackaged');
    }.property('application.isPackaged')
});


})();

(function() {

HighFidelity.EpisodeController = Ember.ObjectController.extend({
    // Implement your controller here.
});


})();

(function() {

HighFidelity.EpisodesController = Ember.ArrayController.extend({
    needs: ['player'],

    sortAscending: false,
    sortProperties: ['datePublished'],

    actions: {
        download: function(episode) {
            episode.download();
        },

        setEpisode: function(episode) {
            if (!episode.get('isDownloaded')) {
                console.log('Not downloaded');
                this.get('controllers.player').send('setEpisode', episode);
            } else {
                console.log('Start playing!');
                this.get('controllers.player').send('setEpisode', episode);
            }
        }
    }
});


})();

(function() {

HighFidelity.PlayerController = Ember.ObjectController.extend({
    _hasAudio: function() {
        this.set('isPopulated', !!this.get('model').get('id'));
    }.observes('model'),

    isPopulated: false,
    progressBar: {
        max: 0,
        value: 0
    },
    setToPlayAfterLoaded: false,
    skipTime: 15, // Time, in seconds, to skip backward/forward.
    timeElapsed: '--:--',
    timeRemaining: '--:--',
    timeTotal: '--:--',

    actions: {
        pause: function(episode) {
            clearTimeout(this._saveInBackgroundTimeout);
            clearTimeout(this._timeUpdateTimeout);
            $('#audio-player')[0].pause();

            episode.set('playbackPosition', $('#audio-player')[0].currentTime);
            episode.set('isPlaying', false);
            episode.save();
        },

        play: function(episode) {
            $('#audio-player')[0].play();
            episode.set('isPlaying', true);
        },

        rewind: function(episode) {
            $('#audio-player')[0].currentTime -= this.get('skipTime');
            episode.set('playbackPosition', $('#audio-player')[0].currentTime);
        },

        forward: function(episode) {
            $('#audio-player')[0].currentTime += this.get('skipTime');
            episode.set('playbackPosition', $('#audio-player')[0].currentTime);
        },

        setEpisode: function(episode) {
            var _this = this;

            this.set('model', episode);

            if (this.get('model').get('isDownloaded')) {
                episode.blobURL().then(function(url) {
                    _this.set('audio', url);
                    _this.playAfterSet();
                });
            } else {
                this.set('audio', this.get('model').get('audioURL'));
                this.playAfterSet();
            }
        }
    },

    playAfterSet: function() {
        var audio = $('#audio-player')[0];
        var _this = this;

        console.log("this.get('audio')", this.get('audio'));
        $(audio).attr('src', this.get('audio'));

        $(audio).bind('canplay', function() {
            $(this).unbind('canplay');

            if (_this.get('model').get('playbackPosition')) {
                audio.currentTime = _this.get('model').get('playbackPosition');
            }

            _this.updateTime();
            _this.set('timeTotal', HighFidelity.formatTime(audio.duration));

            _this.send('play', _this.get('model'));
        });

        this._saveInBackgroundTimeout = setTimeout(function() {
            _this._saveInBackground();
        }, 10000);
        _this.updateTime();
    },

    updateTime: function() {
        var audio = $('#audio-player')[0];
        var _this = this;

        this.set('timeElapsed', HighFidelity.formatTime(audio.currentTime));
        this.set('timeRemaining',
                 HighFidelity.formatTime(audio.duration - audio.currentTime));

        this.set('progressBar.max', audio.duration);
        this.set('progressBar.value', audio.currentTime);

        this._timeUpdateTimeout = setTimeout(function() {
            _this.updateTime();
        }, 1000);
    },

    _saveInBackground: function() {
        var audio = $('#audio-player')[0];
        var _this = this;

        this.get('model').set('playbackPosition', audio.currentTime);
        this.get('model').save();

        this._saveInBackgroundTimeout = setTimeout(function() {
            _this._saveInBackground();
        }, 10000);
    }
});


})();

(function() {

HighFidelity.PodcastController = Ember.ObjectController.extend({
    actions: {
        delete: function() {
            this.get('model').destroyRecord();

            this.transitionToRoute('podcasts');
        },

        update: function() {
            this.get('model').update();
        }
    }
});


})();

(function() {

HighFidelity.PodcastNewController = Ember.ObjectController.extend({
    isAdding: false,
    isInErrorState: false,

    rssURL: '',

    actions: {
        create: function(url) {
            if (url) {
                this.set('rssURL', url);
            }

            if (!this.get('rssURL') || !this.get('rssURL').length) {
                return;
            }

            // If the URL entered doesn't have a protocol attached, make
            // sure one is added so we don't get an error (#43).
            if (!this.get('rssURL').match(/^http[s]?:\/\//i)) {
                this.set('rssURL', 'http://' + this.get('rssURL'));
            }

            this.set('isAdding', true);

            HighFidelity.Podcast.createFromController(this, this.get('rssURL'));
        }
    }
});


})();

(function() {

HighFidelity.PodcastsController = Ember.ArrayController.extend({
    sortProperties: ['title']
});


})();

(function() {

HighFidelity.SearchController = Ember.ObjectController.extend({
    isSearching: false,

    query: '',
    request: null,
    resultCount: 0,
    results: null,

    searchPlaceholder: I18n.t('search.placeholder'),

    search: function(query) {
        var _this = this;

        if (this.get('request')) {
            this.get('request').abort();
        }

        this.set('isSearching', true);

        return new Promise(function(resolve, reject) {
            var API = 'https://itunes.apple.com/search?media=podcast';

            _this.set('request', $.ajax({
                url: API + '&term=' +
                     encodeURIComponent(query),
                dataType: 'json',
                success: function(response, xhr) {
                    if (!response || !response.results) {
                        console.error('Bad response', response);
                        return reject(xhr);
                    }

                    var results = [];

                    response.results.forEach(function(p) {
                        results.push({
                            logo_url: p.artworkUrl100,
                            url: p.feedUrl,
                            title: p.trackName
                        });
                    });

                    _this.set('isSearching', false);
                    _this.set('resultCount', response.resultCount);
                    _this.set('results', response.results);

                    resolve(results);
                },
                error: function(xhr, error) {
                    if (error !== 'abort') {
                        _this.set('isSearching', false);
                        reject(error);
                    }
                }
            }));
        });
    },

    actions: {
        search: function(query) {
            this.search(this.get('query'));
        },

        subscribe: function(url, podcastName) {
            if (window.confirm(I18n.t('search.subscribe',
                               {podcast: podcastName}))) {
                HighFidelity.Podcast.createFromController(this, url);
            }
        }
    }
});


})();

(function() {

// HighFidelity.ApplicationAdapter = DS.FixtureAdapter;
// HighFidelity.ApplicationSerializer = DS.LSSerializer.extend();
// HighFidelity.ApplicationSerializer = DS.LFSerializer.extend();
// HighFidelity.PodcastSerializer = DS.LFSerializer.extend({
//     primaryKey: 'rssURL'
// });
// HighFidelity.ApplicationAdapter = DS.LFAdapter.extend({
//     namespace: 'hifi'
// });
// HighFidelity.ApplicationAdapter = DS.LocalForageAdapter;
// HighFidelity.Adapter.map('HighFidelity.Podcast', {
//     primaryKey: '_id'
// });
// localforage.setDriver(localforage.LOCALSTORAGE);
// HighFidelity.ApplicationSerializer = DS.LocalForageSerializer.extend();
// HighFidelity.ApplicationAdapter = DS.LocalForageAdapter.extend();
//indexedDB.deleteDatabase('hifi');
HighFidelity.ApplicationSerializer = DS.IndexedDBSerializer.extend();
HighFidelity.ApplicationAdapter = DS.IndexedDBAdapter.extend({
    //autoIncrement: true,
    databaseName: 'hifi',
    version: 1,
    migrations: function() {
        this.addModel('podcast');
        this.addModel('episode');
    }
});
// localforage.config({
//     name: 'hifi',
//     storeName: 'podcast'
// });
// HighFidelity.ApplicationAdapter = DS.LSAdapter.extend();
// HighFidelity.ApplicationSerializer = DS.LSSerializer.extend();

// Add ability to query fixtures in development mode.
// if (HighFidelity.ApplicationAdapter === DS.FixtureAdapter) {
//     DS.FixtureAdapter.reopen({
//         queryFixtures: function(records, query, type) {
//             return records.filter(function(record) {
//                 for (var key in query) {
//                     if (!query.hasOwnProperty(key)) { continue; }
//                     var value = query[key];
//                     if (record[key] !== value) { return false; }
//                 }
//                 return true;
//             });
//         }
//     });
// }


})();

(function() {

HighFidelity.Episode = DS.Model.extend({
    podcast: DS.belongsTo('podcast', {async: true}),

    name: DS.attr('string'),
    audioURL: DS.attr('string'),
    audioLength: DS.attr('number'),
    playbackPosition: DS.attr('number'),
    playCount: DS.attr('number'),
    // audioFile: DS.attr('object'),
    guid: DS.attr('string'),

    // Episode metadata from RSS.
    datePublished: DS.attr('number'),

    // Episode download data; unavailable in hosted version for the time being.
    isDownloaded: DS.attr('boolean'),
    _chunkCount: DS.attr('number'),
    _chunkCountSaved: DS.attr('number'),
    _loadComplete: false,

    // canDownload: function() {
    //     return HighFidelity.isPackaged;
    // }.property(),

    isDownloading: false,
    isPlaying: false,

    isNew: function() {
        return !this.get('playbackPosition') && !this.get('playCount');
    }.property('playbackPosition', 'playCount'),

    blobURL: function() {
        var _this = this;

        return new Promise(function(resolve) {
            _this._assembleChunkData().then(function(blob) {
                resolve(window.URL.createObjectURL(blob));
            });
        });
    },

    // Download the episode for local playback.
    download: function(model) {
        this.set('isDownloading', true);
        this.set('_chunkCount', 0);
        this.set('_chunkCountSaved', 0);

        console.log(this, model);

        var _this = this;
        var request = new XMLHttpRequest({mozSystem: true});

        request.open('GET', this.get('audioURL'), true);
        request.responseType = 'moz-chunked-arraybuffer';

        // request.addEventListener('load', );
        request.addEventListener('load', function() {
            console.log(request.readyState, request);
            if (request.readyState === 4) {
                // _this._setAudioType(_this.get('audioURL'));
                _this._loadComplete = true;
            }
        });

        request.addEventListener('progress', function(event) {
            console.info('eventProgress', _this.get('_chunkCount'));
            localforage.setItem('ep:' + _this.get('id') +
                                _this.get('_chunkCount'), request.response)
                       .then(function() {
                // Increment our internal data chunk count.
                _this.incrementProperty('_chunkCountSaved');

                if (_this.get('_chunkCount') ===
                    _this.get('_chunkCountSaved') &&
                    _this.get('_loadComplete')) {
                    console.log('chunk data assembled');
                    _this.set('isDownloading', false);
                    _this.set('isDownloaded', true);
                    // try {
                    //     setTimeout(function() {
                    //         _this.save();
                    //     }, 20);
                    // } catch (e) {
                    //     console.error(e);
                    // }
                }
            });

            _this.incrementProperty('_chunkCount');
        });

        request.addEventListener('error', function(event) {
            window.alert('Error downloading this episode. Please try again.');

            // _this.trigger('download:cancel');
        });

        request.send(null);
    },

    // Because of limitations/platform bugs in b2g18 (what ships on
    // first-gen Firefox OS devices), we can't move around huge Blob
    // objects (particularly, we can't save them anywhere) without crashing
    // the app on a device from out of memory errors.
    //
    // This retrieves the smaller, more manageable chunks of data from
    // IndexedDB and assembles them into a Blob object we hand off to a
    // callback function. For some reason, B2G seems to cope just fine with
    // this very odd solution because it handles Blobs full of arrayBuffers
    // better than it saves large Blobs.
    //
    // This is a HACK and should be fixed by platform in the next release,
    // I hope.
    //
    // See: https://bugzilla.mozilla.org/show_bug.cgi?id=873274
    // and: https://bugzilla.mozilla.org/show_bug.cgi?id=869812
    _assembleChunkData: function() {
        var audioBlobs = [];
        var chunkCount = this.get('_chunkCount');
        var _this = this;

        return new Promise(function(resolve) {
            function _walkChunks(chunkID) {
                if (chunkID === undefined) {
                    chunkID = 0;
                }

                if (chunkID < chunkCount) {
                    localforage.getItem('ep:' + _this.get('id') + chunkID)
                               .then(function(blob) {
                        console.info('ep:' + _this.get('id') + chunkID, blob);
                        audioBlobs.push(blob);
                        _walkChunks(chunkID + 1);
                    });
                } else {
                    var blob = new Blob(audioBlobs, {type: 'mp3'});
                    resolve(blob);
                }
            }

            _walkChunks();
        });
    },

    // Set the audio type based on the responseType (or filename) of this
    // episode's enclosure file/URL.
    _setAudioType: function(audioURL, event) {
        // TODO: Make this better.
        var type;

        try {
            type = event.target.response.type.split('/')[1];
        } catch (e) {
            // Try to extract the type of this file from its filename.
            var enclosureArray = audioURL.split('.');
            type = enclosureArray[enclosureArray.length - 1];
        }

        // Assume "mpeg" = MP3, for now. Kinda hacky.
        if (type === 'mpeg') {
            type = 'mp3';
        }

        this.set('type', type);
        // this.save();
    }
});

// delete below here if you do not want fixtures
HighFidelity.Episode.FIXTURES = [
    {
        id: 0,
        audioURL: 'http://traffic.libsyn.com/atpfm/atp68.mp3',
        datePublished: 1401828879,
        guid: '513abd71e4b0fe58c655c105:513abd71e4b0fe58c655c111:538e35b2e4b07a3ec5184bf4',
        name: '68: Siracusa Waited Impatiently For This',
        playbackPosition: 15.05034
    }
];


})();

(function() {

HighFidelity.Podcast = DS.Model.extend({
    episodes: DS.hasMany('episode', {async: true}),

    title: DS.attr('string'),
    description: DS.attr('string'),
    rssURL: DS.attr('string'),
    lastUpdated: DS.attr('number'),
    lastPlayed: DS.attr('number'),

    coverImageBlob: DS.attr('string'),
    coverImageURL: DS.attr('string'),

    // Podcast initialization; mostly used to check for new episodes.
    // init: function() {
    //     this._super();
    //     console.info('init for podcast:' + this.get('id'),
    //                  this.get('lastUpdated'), this);
    //
    //     if (this._needsUpdate) {
    //         console.log('Updating podcast -- ', this.get('lastUpdated'));
    //         this.update();
    //     }
    // },

    coverImage: function() {
        // if (this.get('coverImageBlob')) {
        //     return null;
        // } else
        //
        if (this.get('coverImageURL')) {
            return this.get('coverImageURL');
        } else {
            return null;
        }
    }.property('coverImageBlob', 'coverImageURL'),

    destroyRecord: function() {
        var _this = this;
        this.get('episodes').forEach(function(episode) {
            // if (episode.get('isPlaying')) {
            //     _this.get('controllers.player').send('setEpisode', null);
            // }
            episode.destroyRecord();
        });
        return this._super();
    },

    getCoverImage: function() {
        //return;
        if (!this.get('coverImageURL')) {
            console.debug('No coverImageURL found; skipping.');
            return;
        }

        var _this = this;

        var request = new XMLHttpRequest({mozSystem: true});

        request.open('GET', this.get('coverImageURL'), true);
        request.responseType = 'arraybuffer';

        request.addEventListener('load', function(event) {
            _this.set('coverImageBlob', request.response);
            _this.save();
        });

        try {
            request.send(null);
        } catch (err) {
            console.error(err);
        }
    },

    // Update this podcast from the RSS feed, but don't download any
    // new episodes by default.
    update: function() {
        var _this = this;

        console.info('Updating podcast:' + this.get('id'));
        return new Promise(function(resolve, reject) {
            // _this.getCoverImage();

            // Update last updated time so we aren't constantly looking for new
            // episodes ;-)
            _this.set('lastUpdated', HighFidelity.timestamp());

            HighFidelity.RSS.get(_this.get('rssURL')).then(function(result) {
                var $xml = $(result);
                var $channel = $xml.find('channel');
                var $items = $xml.find('item');
                var saved = false;

                if (!$xml.length || !$xml.find('item').length) {
                    // If we can't make sense of this podcast's feed, we delete
                    // it and inform the user of the error.
                    window.alert('Error downloading podcast feed.');
                    return;
                }

                _this.set('title', $channel.find('title').eq(0).text());
                _this.set('description', $channel.find('description')
                                                 .eq(0).text());
                _this.set('coverImageURL', $channel.find('itunes\\:image')
                                                   .attr('href'));

                _this.get('episodes').then(function(episodes) {
                    var itemsSaved = 0;
                    $items.each(function(i, episode) {
                        var guid = $(episode).find('guid').text();

                        if (episodes.filterBy('guid', guid).length) {
                            return;
                        }

                        var oldImageURL = _this.get('coverImageURL');

                        // Use the latest artwork for the cover image.
                        var episodeImageURL = $(episode).find('itunes\\:image')
                                                        .attr('href');
                        console.log('episodeImage', episodeImageURL);
                        if (i === 0 && episodeImageURL !== oldImageURL) {
                            _this.set('coverImageURL', episodeImageURL);
                        }

                        // If the cover image has changed (or this podcast is
                        // new) we update the cover image.
                        if (!oldImageURL ||
                            oldImageURL !== _this.get('coverImageURL')) {
                            // _this.getCoverImage();
                        }

                        var e = _this.store.createRecord('episode', {
                            guid: guid,
                            audioURL: $(episode).find('enclosure').attr('url'),
                            datePublished: HighFidelity.timestamp(
                                $(episode).find('pubDate').text()
                            ),
                            name: $(episode).find('title').text(),
                            podcast: _this
                        });

                        // Add this episode to the list of objects; this will
                        // cause it to appear in any existing lists.
                        e.save();
                        episodes.pushObject(e);

                        itemsSaved++;

                        if ($items.length === i + 1) {
                            console.info('Updated podcast:' + _this.get('id'),
                                         itemsSaved + ' new episodes.');
                            saved = true;
                            _this.save().then(resolve);
                        }
                    });

                    if (!itemsSaved && !$items.length && !saved) {
                        console.info('Updated podcast:' + _this.get('id'),
                                     itemsSaved + ' new episodes.');
                        _this.save().then(resolve);
                    }
                });
            }, function(error) {
                console.error('Could not download podcast', error);
                _this.destroyRecord().then(reject);
            });
        });
    },

    _autoUpdate: function() {
        if (this.get('lastUpdated') + 3600 < HighFidelity.timestamp()) {
            console.debug('Auto update for:' + this.get('title'));
            this.update();
        }
    }.observes('lastUpdated').on('init')
});

HighFidelity.Podcast.createFromController = function(controller, rssURL) {
    console.debug('Find podcast with rssURL:', rssURL);
    var existingPodcast = controller.store.find('podcast', {
        rssURL: rssURL
    }).then(function(podcast) {
        console.info('Podcast already exists', podcast.objectAt(0));

        controller.set('isAdding', false);
        controller.set('rssURL', '');
        controller.transitionToRoute('podcast', podcast.objectAt(0));
    }, function() {
        console.info('Creating new podcast.');

        var podcast = controller.store.createRecord('podcast', {
            rssURL: rssURL
        });

        podcast.update().then(function() {
            controller.set('isAdding', false);
            controller.set('rssURL', '');
            controller.transitionToRoute('podcast', podcast);
        }, function() {
            controller.set('isAdding', false);
            controller.set('isInErrorState', true);
        });
    });
};

// delete below here if you do not want fixtures
HighFidelity.Podcast.FIXTURES = [
    {
        id: 0,
        title: 'Accidental Tech Podcast',
        rssURL: 'http://atp.fm/episodes?format=rss',
        lastUpdated: 234,
        lastPlayed: 200,
        coverImageURL: 'http://static.squarespace.com/static/513abd71e4b0fe58c655c105/t/52c45a37e4b0a77a5034aa84/1388599866232/1500w/Artwork.jpg',
        episodes: [0]
    },
    {
        id: 1,
        title: 'The Cracked Podcast',
        rssURL: 'http://rss.earwolf.com/the-cracked-podcast',
        lastUpdated: 247724,
        lastPlayed: 24742,
        coverImageURL: 'http://cdn.earwolf.com/wp-content/uploads/2013/08/EAR_CrackedPodcast_1600x1600_Cover_Final.jpg',
        episodes: []
    }
];


})();

(function() {

HighFidelity.IndexRoute = Ember.Route.extend({
    redirect: function() {
        this.transitionTo('podcasts');
    }
});


})();

(function() {

HighFidelity.EpisodeRoute = Ember.Route.extend({
    model: function(params) {
        return this.get('store').find('episode', params.episode_id);
    }
});



})();

(function() {

HighFidelity.EpisodesRoute = Ember.Route.extend({
    model: function() {
        return this.get('store').find('episode');
    }
});


})();

(function() {

HighFidelity.PodcastNewRoute = Ember.Route.extend({});


})();

(function() {

HighFidelity.PodcastRoute = Ember.Route.extend({
    model: function(params) {
        // Use findQuery so we don't get an error when looking for a
        // non-existant ID.
        return this.get('store').find('podcast', params.podcast_id);
    },

    renderTemplate: function(controller, model) {
        // Inside a podcast view, our "action button" changes from the
        // "add podcast" action to the "refresh episodes" action.
        this.render('header-actions/podcast', {
            outlet: 'headerAction'
        });

        this.render('podcast');
    }
});


})();

(function() {

HighFidelity.PodcastsRoute = Ember.Route.extend({
    model: function() {
        return this.get('store').find('podcast');
    },

    renderTemplate: function(controller, model) {
        // Inside a podcast view, we use the "add podcast" button
        this.render('header-actions/podcasts', {
            outlet: 'headerAction'
        });

        this.render('podcasts');
    }
});


})();

(function() {

HighFidelity.SearchRoute = Ember.Route.extend({});


})();

(function() {

HighFidelity.EpisodeView = Ember.View.extend({});


})();

(function() {

HighFidelity.EpisodesView = Ember.View.extend({});


})();

(function() {

HighFidelity.PlayerView = Ember.View.extend();


})();

(function() {

HighFidelity.PodcastNewView = Ember.View.extend({});


})();

(function() {

HighFidelity.PodcastView = Ember.View.extend({});


})();

(function() {

HighFidelity.PodcastsView = Ember.View.extend({});


})();

(function() {

HighFidelity.ProgressBarView = Ember.View.extend({
    eventManager: Ember.Object.create({
        mouseDown: function(event) {
            console.log(event, this);
            return;
            // this.set('isScrubberDragging', true);
            // this.seekTo(this.event.pageX);
        },

        mouseMove: function(event) {
            console.log(event, this);
        },

        mouseUp: function(event) {
            console.log(event, this);
        },
    })
});


})();

(function() {

HighFidelity.SearchView = Ember.View.extend({
});


})();

(function() {

HighFidelity.Router.map(function() {
    // this.route('popular');
    this.route('search');

    this.resource('podcasts');
    this.resource('podcast.new', {path: '/podcast/new'});
    this.resource('podcast', {path: '/podcast/:podcast_id'});
    this.resource('episode', { path: '/episode/:episode_id' });
});


})();