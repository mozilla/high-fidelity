/* jshint ignore:start */

/* jshint ignore:end */

define('high-fidelity/adapters/application', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].LSAdapter.extend({
        databaseName: 'hifi',
        version: 2,
        migrations: function migrations() {
            this.addModel('podcast');
            this.addModel('episode');
        }
    });

});
define('high-fidelity/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'high-fidelity/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  var App;

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('high-fidelity/components/audio-player', ['exports', 'ember', 'high-fidelity/lib/timestamp'], function (exports, Ember, timeStamper) {

    'use strict';

    exports['default'] = Ember['default'].Component.extend({
        init: function init() {
            this._super.apply(this, arguments);
            this.set('model', null);
            this.PlayerEvents.subscribe('pauseEpisode', this, function (episode) {
                this.send('pause', episode);
            });
            this.PlayerEvents.subscribe('playEpisode', this, 'setEpisode');
        },
        _hasAudio: (function () {
            if (this.get('model')) {
                this.set('isPopulated', !!this.get('model').get('id'));
            }
        }).observes('model'),
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
            pause: function pause(episode) {
                clearTimeout(this._timeUpdateTimeout);
                clearTimeout(this._saveInBackgroundTimeout);
                Ember['default'].$('#audio-player')[0].pause();

                episode.set('playbackPosition', Ember['default'].$('#audio-player')[0].currentTime);
                episode.set('isPlaying', false);
                episode.save();
            },

            play: function play(episode) {
                Ember['default'].$('#audio-player')[0].play();
                episode.set('isPlaying', true);
                this._saveInBackground();
                this.updateTime();
            },

            rewind: function rewind(episode) {
                Ember['default'].$('#audio-player')[0].currentTime -= this.get('skipTime');
                episode.set('playbackPosition', Ember['default'].$('#audio-player')[0].currentTime);
            },

            forward: function forward(episode) {
                Ember['default'].$('#audio-player')[0].currentTime += this.get('skipTime');
                episode.set('playbackPosition', Ember['default'].$('#audio-player')[0].currentTime);
            }
        },

        setEpisode: function setEpisode(episode) {
            this.set('model', episode);
            this.set('audio', this.get('model').get('audioURL'));
            this.PlayerEvents.currentEpisode = episode;
            this.resetPlayer();
        },

        resetPlayer: function resetPlayer() {
            var audio = Ember['default'].$('#audio-player')[0];
            var _this = this;

            Ember['default'].$(audio).attr('src', this.get('audio'));

            Ember['default'].$(audio).bind('canplay', function () {
                Ember['default'].$(this).unbind('canplay');

                if (_this.get('model').get('playbackPosition')) {
                    audio.currentTime = _this.get('model').get('playbackPosition');
                }
                _this.send('play', _this.get('model'));
            });
        },

        updateTime: function updateTime() {
            var audio = Ember['default'].$('#audio-player')[0];
            var _this = this;

            this.set('progressBar.max', audio.duration);
            this.set('progressBar.value', audio.currentTime);

            this.set('timeElapsed', timeStamper['default'].formatTime(audio.currentTime));
            this.set('timeRemaining', timeStamper['default'].formatTime(audio.duration - audio.currentTime));

            this._timeUpdateTimeout = setTimeout(function () {
                _this.updateTime();
            }, 1000);
        },

        _saveInBackground: function _saveInBackground() {
            var audio = Ember['default'].$('#audio-player')[0];
            var _this = this;

            this.get('model').set('playbackPosition', audio.currentTime);
            this.get('model').save();

            this._saveInBackgroundTimeout = setTimeout(function () {
                _this._saveInBackground();
            }, 10000);
        }
    });

});
define('high-fidelity/components/episode-list', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Component.extend({
        sortedEpisodesProps: ['datePublished:desc'],
        sortedEpisodes: Ember['default'].computed.sort('data', 'sortedEpisodesProps'),
        actions: {
            download: function download(episode) {
                episode.download();
            },

            setEpisode: function setEpisode(episode) {
                var currentEpisode = this.PlayerEvents.currentEpisode;
                var episodeAlreadySelected = episode === currentEpisode;

                // if the episode is already selected
                if (episodeAlreadySelected) {
                    if (episode.get('isPlaying')) {
                        // and is currently playing
                        this.PlayerEvents.publish('pauseEpisode', episode);
                    } else {
                        // and is currently paused
                        this.PlayerEvents.publish('playEpisode', episode);
                    }
                } else {
                    // if the episode is not already selected
                    if (currentEpisode) {
                        // and there is another episode selected
                        this.PlayerEvents.publish('pauseEpisode', currentEpisode); // pause the currently selected episode
                        this.PlayerEvents.publish('playEpisode', episode); // play the new episode
                    } else {
                            // and there is not an episode currently selected
                            this.PlayerEvents.publish('playEpisode', episode); // play the new episode
                        }
                }
            }
        }
    });

});
define('high-fidelity/components/ui-accordion', ['exports', 'semantic-ui-ember/components/ui-accordion'], function (exports, Accordion) {

	'use strict';

	exports['default'] = Accordion['default'];

});
define('high-fidelity/components/ui-checkbox', ['exports', 'semantic-ui-ember/components/ui-checkbox'], function (exports, Checkbox) {

	'use strict';

	exports['default'] = Checkbox['default'];

});
define('high-fidelity/components/ui-dropdown', ['exports', 'semantic-ui-ember/components/ui-dropdown'], function (exports, Dropdown) {

	'use strict';

	exports['default'] = Dropdown['default'];

});
define('high-fidelity/components/ui-progress', ['exports', 'semantic-ui-ember/components/ui-progress'], function (exports, Progress) {

	'use strict';

	exports['default'] = Progress['default'];

});
define('high-fidelity/components/ui-radio', ['exports', 'semantic-ui-ember/components/ui-radio'], function (exports, Radio) {

	'use strict';

	exports['default'] = Radio['default'];

});
define('high-fidelity/components/ui-rating', ['exports', 'semantic-ui-ember/components/ui-rating'], function (exports, Rating) {

	'use strict';

	exports['default'] = Rating['default'];

});
define('high-fidelity/controllers/application', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        isPackaged: (function () {
            return HighFidelity.get('isPackaged');
        }).property('application.isPackaged')
    });

});
define('high-fidelity/controllers/array', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('high-fidelity/controllers/object', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('high-fidelity/controllers/podcasts/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    sortedPodcasts: (function () {
      return Ember['default'].ArrayProxy.extend(Ember['default'].SortableMixin).create({
        sortProperties: ['title'],
        content: this.get('model')
      });
    }).property('model')
  });

});
define('high-fidelity/controllers/podcasts/new', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    isAdding: false,
    isInErrorState: false,
    rssURL: '',
    actions: {
      create: function create(url) {
        var self = this;

        if (url) {
          self.set('rssURL', url);
        }

        if (!self.get('rssURL') || !self.get('rssURL').length) {
          console.log('No rssUrl specified!');
          return;
        }

        // If the URL entered doesn't have a protocol attached, make
        // sure one is added so we don't get an error (#43).
        if (!self.get('rssURL').match(/^http[s]?:\/\//i)) {
          self.set('rssURL', 'http://' + self.get('rssURL'));
        }

        self.set('isAdding', true);

        // var existingPodcast = self.store.find('podcast', {
        //   rssURL: self.get('rssURL')
        // }).then(function(podcast) {
        //   console.log('Podcast: ', podcast);
        //   console.info('Podcast already exists', podcast.objectAt(0));

        //   self.set('isAdding', false);
        //   self.set('rssURL', '');
        //   self.transitionToRoute('podcast', podcast.objectAt(0));
        // }, function() {

        var podcast = self.store.createRecord('podcast', {
          rssURL: self.get('rssURL')
        });

        podcast.update().then(function () {
          self.set('isAdding', false);
          self.set('rssURL', '');
          self.transitionToRoute('podcasts.show', podcast);
        }, function () {
          self.set('isAdding', false);
          self.set('isInErrorState', true);
        });
        // });
      }
    }
  });

});
define('high-fidelity/controllers/podcasts/show', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    sortedEpisodes: (function () {
      return Ember['default'].ArrayProxy.extend(Ember['default'].SortableMixin).create({
        sortAscending: false,
        sortProperties: ['datePublished'],
        content: this.get('model').get('episodes')
      });
    }).property('model'),
    actions: {
      'delete': function _delete() {
        this.get('model').destroyRecord();
        this.transitionToRoute('podcasts');
      },
      update: function update() {
        this.get('model').update();
      }
    }
  });

});
define('high-fidelity/helpers/fa-icon', ['exports', 'ember-cli-font-awesome/helpers/fa-icon'], function (exports, fa_icon) {

	'use strict';



	exports.default = fa_icon.default;
	exports.faIcon = fa_icon.faIcon;

});
define('high-fidelity/helpers/format-timestamp', ['exports', 'ember', 'moment'], function (exports, Ember, moment) {

  'use strict';

  exports.formatTimestamp = formatTimestamp;

  function formatTimestamp(timestamp /*, hash*/) {
    return moment['default'].unix(timestamp).format('MMM D');
  }

  exports['default'] = Ember['default'].Helper.helper(formatTimestamp);

});
define('high-fidelity/initializers/ember-i18n', ['exports', 'high-fidelity/instance-initializers/ember-i18n'], function (exports, instanceInitializer) {

  'use strict';

  exports['default'] = {
    name: instanceInitializer['default'].name,

    initialize: function initialize(registry, application) {
      if (application.instanceInitializer) {
        return;
      }

      instanceInitializer['default'].initialize(application);
    }
  };

});
define('high-fidelity/initializers/export-application-global', ['exports', 'ember', 'high-fidelity/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (config['default'].exportApplicationGlobal !== false) {
      var value = config['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember['default'].String.classify(config['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  }

  ;

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('high-fidelity/initializers/i18n', ['exports'], function (exports) {

  'use strict';

  exports['default'] = {
    name: 'i18n',
    after: 'ember-i18n',
    initialize: function initialize(_, app) {
      app.inject('model', 'i18n', 'service:i18n');
    }
  };

});
define('high-fidelity/initializers/player-events', ['exports'], function (exports) {

  'use strict';

  exports['default'] = {
    name: 'player-events',
    initialize: function initialize(_, app) {
      app.inject('component', 'PlayerEvents', 'service:player-events');
    }
  };

});
define('high-fidelity/instance-initializers/app-version', ['exports', 'high-fidelity/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;
  var registered = false;

  exports['default'] = {
    name: 'App Version',
    initialize: function initialize(application) {
      if (!registered) {
        var appName = classify(application.toString());
        Ember['default'].libraries.register(appName, config['default'].APP.version);
        registered = true;
      }
    }
  };

});
define('high-fidelity/instance-initializers/ember-i18n', ['exports', 'ember', 'ember-i18n/legacy-helper', 'ember-i18n/helper', 'high-fidelity/config/environment'], function (exports, Ember, legacyHelper, Helper, ENV) {

  'use strict';

  exports['default'] = {
    name: 'ember-i18n',

    initialize: function initialize(instance) {
      var defaultLocale = (ENV['default'].i18n || {}).defaultLocale;
      if (defaultLocale === undefined) {
        Ember['default'].warn('ember-i18n did not find a default locale; falling back to "en".');
        defaultLocale = 'en';
      }
      instance.container.lookup('service:i18n').set('locale', defaultLocale);

      if (legacyHelper['default'] != null) {
        Ember['default'].HTMLBars._registerHelper('t', legacyHelper['default']);
      }

      if (Helper['default'] != null) {
        instance.registry.register('helper:t', Helper['default']);
      }
    }
  };

});
define('high-fidelity/lib/rss', ['exports', 'ember'], function (exports, Ember) {

    'use strict';



    exports['default'] = getRSS;

    'use strict';var NUMBER_OF_PODCASTS_TO_GET = 1000;
    function getRSS(url, callback) {
        return new Ember['default'].RSVP.Promise(function (resolve, reject) {
            var jsonpCallback = HighFidelity.isPackaged ? '' : '&callback=?';

            $.ajax({
                url: 'https://ajax.googleapis.com/ajax/' + 'services/feed/load?v=1.0' + jsonpCallback +
                // TODO: Actually paginate results; for now we just get
                // "all" podcasts, presuming most podcasts have fewer
                // than 1,000 episodes.
                '&num=' + NUMBER_OF_PODCASTS_TO_GET + '&output=json_xml' + '&q=' + encodeURIComponent(url),
                dataType: 'json',
                success: function success(response, xhr) {
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
                error: function error(_error) {
                    reject(_error);
                }
            });
        });
    }

});
define('high-fidelity/lib/timestamp', ['exports'], function (exports) {

    'use strict';

    'use strict';

    exports['default'] = {
        formatTime: function formatTime(secs) {
            if (isNaN(secs)) {
                return '--:--';
            }

            var hours = parseInt(secs / 3600, 10) % 24;
            var minutes = parseInt(secs / 60, 10) % 60;
            var seconds = parseInt(secs % 60, 10);

            var time = (hours !== 0 ? hours + ':' : '') + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);

            return time;
        },

        timestamp: function timestamp(date) {
            if (!date) {
                date = new Date();
            }

            if (date instanceof Date !== true) {
                date = new Date(date);
            }

            return Math.round(date.getTime() / 1000);
        }
    };

});
define('high-fidelity/locales/en/config', ['exports'], function (exports) {

  'use strict';

  // Ember-I18n inclues configuration for common locales. Most users
  // can safely delete this file. Use it if you need to override behavior
  // for a locale or define behavior for a locale that Ember-I18n
  // doesn't know about.
  exports['default'] = {
    // rtl: [true|FALSE],
    //
    // pluralForm: function(count) {
    //   if (count === 0) { return 'zero'; }
    //   if (count === 1) { return 'one'; }
    //   if (count === 2) { return 'two'; }
    //   if (count < 5) { return 'few'; }
    //   if (count >= 5) { return 'many'; }
    //   return 'other';
    // }
  };

});
define('high-fidelity/locales/en/translations', ['exports'], function (exports) {

    'use strict';

    exports['default'] = {
        "app": {
            "title": 'Podcasts'
        },
        "episode": {
            "episodes": 'Episodes',
            "new": 'New'
        },
        "podcast": {
            "add": 'Add',
            "addOne": 'Want to add one?',
            "addRSSFeed": 'Add RSS Feed',
            "newToPodcasts": 'New to Podcasts?',
            "noneFound": 'No podcasts found.',
            "recommendations": 'Check out our recommendations:'
        },
        "search": {
            "find": 'Find',
            "noResults": 'No results.',
            "placeholder": 'Podcast Name or Keywords',
            "searchForAPodcast": 'Search for a Podcast',
            "subscribe": 'Subscribe to {{podcast}}?'
        },
        "tabs": {
            "myPodcasts": 'My Podcasts',
            "popular": 'Popular',
            "search": 'Search'
        }
    };

});
define('high-fidelity/locales/eo/config', ['exports'], function (exports) {

  'use strict';

  // Ember-I18n inclues configuration for common locales. Most users
  // can safely delete this file. Use it if you need to override behavior
  // for a locale or define behavior for a locale that Ember-I18n
  // doesn't know about.
  exports['default'] = {
    // rtl: [true|FALSE],
    //
    // pluralForm: function(count) {
    //   if (count === 0) { return 'zero'; }
    //   if (count === 1) { return 'one'; }
    //   if (count === 2) { return 'two'; }
    //   if (count < 5) { return 'few'; }
    //   if (count >= 5) { return 'many'; }
    //   return 'other';
    // }
  };

});
define('high-fidelity/locales/eo/translations', ['exports'], function (exports) {

    'use strict';

    exports['default'] = {
        "app": {
            "title": 'Podkastoj'
        },
        "episode": {
            "episodes": 'Epizodoj',
            "new": 'Nova'
        },
        "podcast": {
            "add": 'Aldoni',
            "addOne": 'Ĉu vi volas aldoni novan?',
            "addRSSFeed": 'Aldoni RSS-fluon',
            "newToPodcasts": 'Ĉu malkutimas podkastojn?',
            "noneFound": 'Neniu podkasto trovata.',
            "recommendations": 'Kontrolu niajn rekomendojn:'
        },
        "search": {
            "find": 'Trovi',
            "noResults": 'Neniu rezulto.',
            "placeholder": 'Nomo de podkasto aŭ ŝlosilvorto',
            "searchForAPodcast": 'Serĉi podkaston',
            "subscribe": 'Ĉu aliĝi al {{podcast}}?'
        },
        "tabs": {
            "myPodcasts": 'Miaj podkastoj',
            "popular": 'Popularaj',
            "search": 'Serĉi'
        }
    };

});
define('high-fidelity/locales/es/config', ['exports'], function (exports) {

  'use strict';

  // Ember-I18n inclues configuration for common locales. Most users
  // can safely delete this file. Use it if you need to override behavior
  // for a locale or define behavior for a locale that Ember-I18n
  // doesn't know about.
  exports['default'] = {
    // rtl: [true|FALSE],
    //
    // pluralForm: function(count) {
    //   if (count === 0) { return 'zero'; }
    //   if (count === 1) { return 'one'; }
    //   if (count === 2) { return 'two'; }
    //   if (count < 5) { return 'few'; }
    //   if (count >= 5) { return 'many'; }
    //   return 'other';
    // }
  };

});
define('high-fidelity/locales/es/translations', ['exports'], function (exports) {

	'use strict';

	exports['default'] = {
		// spanish by @xmgz
		"app": {
			"title": 'Podcasts'
		},
		"episode": {
			"episodes": 'Episodios',
			"new": 'Nuevo'
		},
		"podcast": {
			"add": 'Añadir',
			"addOne": 'Desea añadir uno',
			"addRSSFeed": 'Añadir fuente RSS',
			"newToPodcasts": 'Nuevo en los podcast?',
			"noneFound": 'No se encontraron podcast.',
			"recommendations": 'Estas son nuestras recomendaciones:'
		},
		"search": {
			"find": 'Buscar',
			"noResults": 'Sin resultados.',
			"placeholder": 'Nombre del podcast o palabras clave',
			"searchForAPodcast": 'Buscar un podcast',
			"subscribe": 'Suscribirse a {{podcast}}?'
		},
		"tabs": {
			"myPodcasts": 'Mis podcast',
			"popular": 'Popular',
			"search": 'Buscar'
		}
	};

});
define('high-fidelity/locales/fr/config', ['exports'], function (exports) {

  'use strict';

  // Ember-I18n inclues configuration for common locales. Most users
  // can safely delete this file. Use it if you need to override behavior
  // for a locale or define behavior for a locale that Ember-I18n
  // doesn't know about.
  exports['default'] = {
    // rtl: [true|FALSE],
    //
    // pluralForm: function(count) {
    //   if (count === 0) { return 'zero'; }
    //   if (count === 1) { return 'one'; }
    //   if (count === 2) { return 'two'; }
    //   if (count < 5) { return 'few'; }
    //   if (count >= 5) { return 'many'; }
    //   return 'other';
    // }
  };

});
define('high-fidelity/locales/fr/translations', ['exports'], function (exports) {

    'use strict';

    exports['default'] = {
        "app": {
            "title": 'Podcasts'
        },
        "episode": {
            "episodes": "Episodes",
            "new": 'nouveau'
        },
        "podcast": {
            "add": 'Ajouter',
            "addOne": 'Voulez-vous en ajouter un?',
            "addRSSFeed": 'Ajouter un flux RSS',
            "newToPodcasts": 'Vous ne connaissez pas de Podcasts?',
            "noneFound": 'Aucun podcast trouvé.',
            "recommendations": 'Voici nos recommandations:'
        },
        "search": {
            "find": 'chercher',
            "noResults": 'Aucun résultat.',
            "placeholder": 'Nom du podcast ou mots-clés',
            "searchForAPodcast": 'Trouver un podcast',
            "subscribe": 'S\'abonner à {{podcast}}?'
        },
        "tabs": {
            "myPodcasts": 'mes podcasts',
            "popular": 'populaire',
            "search": 'recherche'
        }
    };

});
define('high-fidelity/locales/gl/config', ['exports'], function (exports) {

  'use strict';

  // Ember-I18n inclues configuration for common locales. Most users
  // can safely delete this file. Use it if you need to override behavior
  // for a locale or define behavior for a locale that Ember-I18n
  // doesn't know about.
  exports['default'] = {
    // rtl: [true|FALSE],
    //
    // pluralForm: function(count) {
    //   if (count === 0) { return 'zero'; }
    //   if (count === 1) { return 'one'; }
    //   if (count === 2) { return 'two'; }
    //   if (count < 5) { return 'few'; }
    //   if (count >= 5) { return 'many'; }
    //   return 'other';
    // }
  };

});
define('high-fidelity/locales/gl/translations', ['exports'], function (exports) {

    'use strict';

    exports['default'] = {
        "app": {
            "title": 'Podcasts'
        },
        "episode": {
            "episodes": 'Episodios',
            "new": 'Novo'
        },
        "podcast": {
            "add": 'Engadir',
            "addOne": 'Quere engadir un?',
            "addRSSFeed": 'Engdir fonte RSS',
            "newToPodcasts": 'Novo nos podcast?',
            "noneFound": 'Non se atoparon podcast.',
            "recommendations": 'Mire as nosas recomendacións:'
        },
        "search": {
            "find": 'Buscar',
            "noResults": 'Sen resultados.',
            "placeholder": 'Nome do podcast ou palabras chave',
            "searchForAPodcast": 'Buscar un podcast',
            "subscribe": 'Suscribirse a {{podcast}}?'
        },
        "tabs": {
            "myPodcasts": 'Os meus podcast',
            "popular": 'Popular',
            "search": 'Buscar'
        }
    };

});
define('high-fidelity/locales/it/config', ['exports'], function (exports) {

  'use strict';

  // Ember-I18n inclues configuration for common locales. Most users
  // can safely delete this file. Use it if you need to override behavior
  // for a locale or define behavior for a locale that Ember-I18n
  // doesn't know about.
  exports['default'] = {
    // rtl: [true|FALSE],
    //
    // pluralForm: function(count) {
    //   if (count === 0) { return 'zero'; }
    //   if (count === 1) { return 'one'; }
    //   if (count === 2) { return 'two'; }
    //   if (count < 5) { return 'few'; }
    //   if (count >= 5) { return 'many'; }
    //   return 'other';
    // }
  };

});
define('high-fidelity/locales/it/translations', ['exports'], function (exports) {

    'use strict';

    exports['default'] = {
        "app": {
            "title": 'Podcast'
        },
        "episode": {
            "episodes": 'Episodi',
            "new": 'Nuovo'
        },
        "podcast": {
            "add": 'Aggiungi',
            "addOne": 'Aggiungi uno nuovo?',
            "addRSSFeed": 'Aggiungi feed RSS',
            "newToPodcasts": 'Nuovo ai podcast?',
            "noneFound": 'Nessun podcast trovato.',
            "recommendations": 'Controlla i nostri consigli:'
        },
        "search": {
            "find": 'Trova',
            "noResults": 'Nessun risultato.',
            "placeholder": 'Nome del podcast o parola chiave',
            "searchForAPodcast": 'Cerca un podcast',
            "subscribe": 'Vuoi abbonarti a {{podcast}}?'
        },
        "tabs": {
            "myPodcasts": 'I miei podcast',
            "popular": 'Popolari',
            "search": 'Cerca'
        }
    };

});
define('high-fidelity/locales/pl/config', ['exports'], function (exports) {

  'use strict';

  // Ember-I18n inclues configuration for common locales. Most users
  // can safely delete this file. Use it if you need to override behavior
  // for a locale or define behavior for a locale that Ember-I18n
  // doesn't know about.
  exports['default'] = {
    // rtl: [true|FALSE],
    //
    // pluralForm: function(count) {
    //   if (count === 0) { return 'zero'; }
    //   if (count === 1) { return 'one'; }
    //   if (count === 2) { return 'two'; }
    //   if (count < 5) { return 'few'; }
    //   if (count >= 5) { return 'many'; }
    //   return 'other';
    // }
  };

});
define('high-fidelity/locales/pl/translations', ['exports'], function (exports) {

    'use strict';

    exports['default'] = {
        "app": {
            "title": 'Podcasty' },
        // Transmisje
        "episode": {
            "episodes": 'Epizody', // Fragmenty
            "new": 'Nowe'
        },
        "podcast": {
            "add": 'Dodaj',
            "addOne": 'Chcesz jedno dodać?',
            "addRSSFeed": 'Dodaj źródło RSS',
            "newToPodcasts": 'Nowe do podcastu?',
            "noneFound": 'Nie znaleziono podcastów.',
            "recommendations": 'Sprawdź nasze rekomendacje:'
        },
        "search": {
            "find": 'Szukaj',
            "noResults": 'Brak wyników.',
            "placeholder": 'Podcast tytuł albo słowo kluczowe',
            "searchForAPodcast": 'Szukaj w podcastach',
            "subscribe": 'Subskrybuj {{podcast}}?'
        },
        "tabs": {
            "myPodcasts": 'Moje Podcasty',
            "popular": 'Popularne',
            "search": 'Szukaj'
        }
    };

});
define('high-fidelity/models/episode', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
        podcast: DS['default'].belongsTo('podcast', { async: true }),

        name: DS['default'].attr('string'),
        audioURL: DS['default'].attr('string'),
        audioLength: DS['default'].attr('string'),
        playbackPosition: DS['default'].attr('number'),
        playCount: DS['default'].attr('number'),
        // audioFile: DS.attr('object'),
        guid: DS['default'].attr('string'),

        // Episode metadata from RSS.
        datePublished: DS['default'].attr('number'),

        // Episode download data; unavailable in hosted version for the time being.
        isDownloaded: DS['default'].attr('boolean'),
        _chunkCount: DS['default'].attr('number'),
        _chunkCountSaved: DS['default'].attr('number'),
        _loadComplete: false,

        isDownloading: false,
        isPlaying: false,

        isNew: (function () {
            return !this.get('playbackPosition') && !this.get('playCount');
        }).property('playbackPosition', 'playCount')
    });

});
define('high-fidelity/models/podcast', ['exports', 'ember-data', 'ember', 'high-fidelity/lib/timestamp', 'high-fidelity/lib/rss'], function (exports, DS, Ember, timeStamper, getRSS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
        episodes: DS['default'].hasMany('episode', { async: true }),

        title: DS['default'].attr('string'),
        description: DS['default'].attr('string'),
        rssURL: DS['default'].attr('string'),
        lastUpdated: DS['default'].attr('number'),
        lastPlayed: DS['default'].attr('number'),

        coverImageURL: DS['default'].attr('string'),

        destroyRecord: function destroyRecord() {
            var self = this;
            var removeEpisodes = function removeEpisodes() {
                self.get('episodes').forEach(function (episode) {
                    if (episode) {
                        episode.destroyRecord();
                    } else {
                        removeEpisodes();
                    }
                });
            };
            removeEpisodes();

            return this._super();
        },

        // Update this podcast from the RSS feed, but don't download any
        // new episodes by default.
        update: function update() {
            var _this = this;

            console.info('Updating podcast:' + this.get('id'));
            return new Ember['default'].RSVP.Promise(function (resolve, reject) {
                // Update last updated time so we aren't constantly looking
                // for new episodes ;-)
                _this.set('lastUpdated', timeStamper['default'].timestamp());

                getRSS['default'](_this.get('rssURL')).then(function (result) {
                    var $xml = $(result);
                    var $channel = $xml.find('channel');
                    var $items = $xml.find('item');

                    if (!$xml.length || !$xml.find('item').length) {
                        // If we can't make sense of this podcast's feed, we delete
                        // it and inform the user of the error.
                        window.alert('Error downloading podcast feed.');
                        return;
                    }

                    _this.set('title', $channel.find('title').eq(0).text());
                    _this.set('description', $channel.find('description').eq(0).text());
                    _this.set('coverImageURL', $channel.children('itunes\\:image, image').attr('href'));

                    _this.get('episodes').then(function (episodes) {
                        var itemsSaved = 0;
                        var saved = false;
                        $items.each(function (i, episode) {
                            var guid = $(episode).find('guid').text();

                            if (episodes.filterBy('guid', guid).length) {
                                return;
                            }

                            var e = _this.store.createRecord('episode', {
                                guid: guid,
                                audioURL: $(episode).find('enclosure').attr('url'),
                                datePublished: timeStamper['default'].timestamp($(episode).find('pubDate').text()),
                                name: $(episode).find('title').text(),
                                audioLength: $(episode).find('duration').text(),
                                podcast: _this
                            });

                            // Add this episode to the list of objects; this will
                            // cause it to appear in any existing lists.
                            e.save();
                            episodes.pushObject(e);

                            itemsSaved++;

                            if ($items.length === i + 1) {
                                console.info('Updated podcast:' + _this.get('id'), itemsSaved + ' new episodes.');
                                saved = true;
                                _this.save().then(resolve);
                            }
                        });

                        if (!itemsSaved && !$items.length && !saved) {
                            console.info('Updated podcast:' + _this.get('id'), itemsSaved + ' new episodes.');
                            _this.save().then(resolve);
                        }
                    });
                }, function (error) {
                    console.error('Could not download podcast', error);
                    _this.destroyRecord().then(reject);
                });
            });
        },

        _autoUpdate: (function () {
            if (this.get('lastUpdated') + 3600 < timeStamper['default'].timestamp()) {
                console.debug('Auto update for:' + this.get('title'));
                this.update();
            }
        }).observes('lastUpdated').on('init')
    });

});
define('high-fidelity/router', ['exports', 'ember', 'high-fidelity/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    this.route('search');

    this.route('podcasts', { path: '/podcasts' }, function () {
      this.route('new');
      this.route('show', { path: '/podcast/:podcast_id' });
    });

    // this.route('podcast', { path: '/podcast/:podcast_id'});
  });

  exports['default'] = Router;

});
define('high-fidelity/routes/application', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    i18n: Ember['default'].inject.service(),
    model: function model() {
      return this.store;
    },
    afterModel: function afterModel() {
      var locale = (window.navigator.language || window.navigator.browserLanguage).split('-')[0];
      this.set('i18n.locale', locale);
    },
    actions: {
      closeModal: function closeModal() {
        return this.disconnectOutlet({
          outlet: 'modal',
          parentView: 'application'
        });
      },
      openModal: function openModal(modalName) {
        return this.render(modalName, {
          into: 'application',
          outlet: 'modal'
        });
      }
    }
  });

});
define('high-fidelity/routes/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    redirect: function redirect() {
      this.transitionTo('podcasts');
    }
  });

});
define('high-fidelity/routes/podcast', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model(params) {
      return this.store.find('podcast', params.podcast_id);
    }
  });

});
define('high-fidelity/routes/podcasts', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model() {
      return this.store.findAll('podcast');
    }
  });

});
define('high-fidelity/serializers/application', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].LSSerializer.extend({
    serializeHasMany: function serializeHasMany(snapshot, json, relationship) {
      var key = relationship.key;
      var payloadKey = this.keyForRelationship ? this.keyForRelationship(key, "hasMany") : key;
      var relationshipType = snapshot.type.determineRelationshipType(relationship, this.store);

      if (relationshipType === 'manyToNone' || relationshipType === 'manyToMany' || relationshipType === 'manyToOne') {
        json[payloadKey] = snapshot.hasMany(key, { ids: true });
        // TODO support for polymorphic manyToNone and manyToMany relationships
      }
    }
  });

});
define('high-fidelity/services/i18n', ['exports', 'ember-i18n/service'], function (exports, Service) {

	'use strict';

	exports['default'] = Service['default'];

});
define('high-fidelity/services/player-events', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Service.extend(Ember['default'].Evented, {
    publish: function publish() {
      return this.trigger.apply(this, arguments);
    },
    subscribe: function subscribe() {
      return this.on.apply(this, arguments);
    },
    unsubscribe: function unsubscribe() {
      return this.off.apply(this, arguments);
    }
  });

});
define('high-fidelity/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 10,
              "column": 2
            },
            "end": {
              "line": 13,
              "column": 2
            }
          },
          "moduleName": "high-fidelity/templates/application.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1,"class","sound icon");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment(" {{t \"tabs.myPodcasts\"}} ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 14,
              "column": 2
            },
            "end": {
              "line": 17,
              "column": 2
            }
          },
          "moduleName": "high-fidelity/templates/application.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1,"class","search icon");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment(" {{t \"tabs.search\"}} ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 29,
            "column": 0
          }
        },
        "moduleName": "high-fidelity/templates/application.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","application");
        dom.setAttribute(el1,"class","ui text");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("\n  <h1>{{#link-to 'podcasts'}}{{t \"app.title\"}}{{/link-to}}</h1>\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ui top labeled icon fixed item menu");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment(" {{#link-to 'podcasts.new' class=\"item\"}}\n      <i class=\"plus icon\"></i>\n      {{t \"podcast.add\"}}\n    {{/link-to}} ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("audio");
        dom.setAttribute(el1,"id","audio-player");
        dom.setAttribute(el1,"preload","auto");
        dom.setAttribute(el1,"mozaudiochannel","content");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [2]);
        var morphs = new Array(5);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]),3,3);
        morphs[1] = dom.createMorphAt(element0,1,1);
        morphs[2] = dom.createMorphAt(element0,2,2);
        morphs[3] = dom.createMorphAt(fragment,6,6,contextualElement);
        morphs[4] = dom.createMorphAt(fragment,8,8,contextualElement);
        return morphs;
      },
      statements: [
        ["content","outlet",["loc",[null,[6,2],[6,12]]]],
        ["block","link-to",["podcasts"],["class","item"],0,null,["loc",[null,[10,2],[13,14]]]],
        ["block","link-to",["podcasts.new"],["class","item"],1,null,["loc",[null,[14,2],[17,14]]]],
        ["content","audio-player",["loc",[null,[26,0],[26,16]]]],
        ["inline","outlet",["modal"],[],["loc",[null,[28,0],[28,18]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('high-fidelity/templates/components/audio-player', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 17,
              "column": 4
            },
            "end": {
              "line": 21,
              "column": 4
            }
          },
          "moduleName": "high-fidelity/templates/components/audio-player.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("a");
          dom.setAttribute(el1,"class","play-pause");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element1 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createElementMorph(element1);
          morphs[1] = dom.createMorphAt(element1,1,1);
          return morphs;
        },
        statements: [
          ["element","action",["pause",["get","model",["loc",[null,[18,26],[18,31]]]]],[],["loc",[null,[18,9],[18,33]]]],
          ["inline","fa-icon",["pause"],[],["loc",[null,[19,6],[19,25]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 21,
              "column": 4
            },
            "end": {
              "line": 25,
              "column": 4
            }
          },
          "moduleName": "high-fidelity/templates/components/audio-player.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("a");
          dom.setAttribute(el1,"class","play-pause");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createElementMorph(element0);
          morphs[1] = dom.createMorphAt(element0,1,1);
          return morphs;
        },
        statements: [
          ["element","action",["play",["get","model",["loc",[null,[22,25],[22,30]]]]],[],["loc",[null,[22,9],[22,32]]]],
          ["inline","fa-icon",["play"],[],["loc",[null,[23,6],[23,24]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 32,
            "column": 0
          }
        },
        "moduleName": "high-fidelity/templates/components/audio-player.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","player");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","time-info");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"id","time-elapsed");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"id","time-remaining");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("progress");
        dom.setAttribute(el3,"id","audio-progress");
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","episode-name");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","player-controls");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("a");
        dom.setAttribute(el3,"class","backward");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("a");
        dom.setAttribute(el3,"class","forward");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element2 = dom.childAt(fragment, [0]);
        var element3 = dom.childAt(element2, [1]);
        var element4 = dom.childAt(element3, [5]);
        var element5 = dom.childAt(element2, [5]);
        var element6 = dom.childAt(element5, [1]);
        var element7 = dom.childAt(element5, [5]);
        var morphs = new Array(11);
        morphs[0] = dom.createAttrMorph(element2, 'class');
        morphs[1] = dom.createMorphAt(dom.childAt(element3, [1]),0,0);
        morphs[2] = dom.createMorphAt(dom.childAt(element3, [3]),0,0);
        morphs[3] = dom.createAttrMorph(element4, 'max');
        morphs[4] = dom.createAttrMorph(element4, 'value');
        morphs[5] = dom.createMorphAt(dom.childAt(element2, [3]),0,0);
        morphs[6] = dom.createElementMorph(element6);
        morphs[7] = dom.createMorphAt(element6,1,1);
        morphs[8] = dom.createMorphAt(element5,3,3);
        morphs[9] = dom.createElementMorph(element7);
        morphs[10] = dom.createMorphAt(element7,1,1);
        return morphs;
      },
      statements: [
        ["attribute","class",["concat",["populated-",["get","isPopulated",["loc",[null,[1,36],[1,47]]]]," ui bottom fixed menu"]]],
        ["content","timeElapsed",["loc",[null,[3,28],[3,43]]]],
        ["content","timeRemaining",["loc",[null,[4,30],[4,47]]]],
        ["attribute","max",["get","progressBar.max",["loc",[null,[5,40],[5,55]]]]],
        ["attribute","value",["get","progressBar.value",["loc",[null,[6,22],[6,39]]]]],
        ["content","model.name",["loc",[null,[10,28],[10,42]]]],
        ["element","action",["rewind",["get","model",["loc",[null,[13,25],[13,30]]]]],[],["loc",[null,[13,7],[13,32]]]],
        ["inline","fa-icon",["backward"],[],["loc",[null,[14,6],[14,28]]]],
        ["block","if",[["get","model.isPlaying",["loc",[null,[17,10],[17,25]]]]],[],0,1,["loc",[null,[17,4],[25,11]]]],
        ["element","action",["forward",["get","model",["loc",[null,[27,26],[27,31]]]]],[],["loc",[null,[27,7],[27,33]]]],
        ["inline","fa-icon",["forward"],[],["loc",[null,[28,6],[28,27]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('high-fidelity/templates/components/episode-list', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.3",
            "loc": {
              "source": null,
              "start": {
                "line": 9,
                "column": 8
              },
              "end": {
                "line": 13,
                "column": 8
              }
            },
            "moduleName": "high-fidelity/templates/components/episode-list.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment(" <div class=\"ui red right small corner label new\">\n            {{t \"episode.new\"}}\n          </div> ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      var child1 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.3",
            "loc": {
              "source": null,
              "start": {
                "line": 28,
                "column": 14
              },
              "end": {
                "line": 33,
                "column": 14
              }
            },
            "moduleName": "high-fidelity/templates/components/episode-list.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","ui label medium black");
            var el2 = dom.createTextNode("\n                ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("i");
            dom.setAttribute(el2,"class","clock icon");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n              ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),3,3);
            return morphs;
          },
          statements: [
            ["content","episode.audioLength",["loc",[null,[31,16],[31,39]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 2
            },
            "end": {
              "line": 47,
              "column": 2
            }
          },
          "moduleName": "high-fidelity/templates/components/episode-list.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","content");
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("\n          The new badge that hangs out in the corner if the episode hasn't\n          been played at all yet\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","ui grid");
          var el4 = dom.createTextNode("\n          ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","thirteen wide column");
          var el5 = dom.createTextNode("\n            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment(" Episode name ");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5,"class","header");
          var el6 = dom.createTextNode("\n              ");
          dom.appendChild(el5, el6);
          var el6 = dom.createComment("");
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n            ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n\n            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment(" Date released, length, etc. ");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5,"class","extra");
          var el6 = dom.createTextNode("\n              ");
          dom.appendChild(el5, el6);
          var el6 = dom.createElement("div");
          dom.setAttribute(el6,"class","ui label medium black");
          var el7 = dom.createTextNode("\n                ");
          dom.appendChild(el6, el7);
          var el7 = dom.createElement("i");
          dom.setAttribute(el7,"class","calendar icon");
          dom.appendChild(el6, el7);
          var el7 = dom.createTextNode("\n                ");
          dom.appendChild(el6, el7);
          var el7 = dom.createComment("");
          dom.appendChild(el6, el7);
          var el7 = dom.createTextNode("\n              ");
          dom.appendChild(el6, el7);
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n");
          dom.appendChild(el5, el6);
          var el6 = dom.createComment("");
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("            ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment(" Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n\n          ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","three wide column center aligned play-button");
          var el5 = dom.createTextNode("\n            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("button");
          dom.setAttribute(el5,"class","circular ui icon button");
          var el6 = dom.createTextNode("\n              ");
          dom.appendChild(el5, el6);
          var el6 = dom.createElement("i");
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n            ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [1]);
          var element2 = dom.childAt(element1, [5]);
          var element3 = dom.childAt(element2, [1]);
          var element4 = dom.childAt(element3, [7]);
          var element5 = dom.childAt(element2, [3, 1]);
          var element6 = dom.childAt(element5, [1]);
          var morphs = new Array(7);
          morphs[0] = dom.createAttrMorph(element0, 'class');
          morphs[1] = dom.createMorphAt(element1,3,3);
          morphs[2] = dom.createMorphAt(dom.childAt(element3, [3]),1,1);
          morphs[3] = dom.createMorphAt(dom.childAt(element4, [1]),3,3);
          morphs[4] = dom.createMorphAt(element4,3,3);
          morphs[5] = dom.createElementMorph(element5);
          morphs[6] = dom.createAttrMorph(element6, 'class');
          return morphs;
        },
        statements: [
          ["attribute","class",["concat",["item episode ",["subexpr","if",[["get","isNew",["loc",[null,[3,34],[3,39]]]],"new","old"],[],["loc",[null,[3,29],[3,53]]]]]]],
          ["block","if",[["get","episode.isNew",["loc",[null,[9,14],[9,27]]]]],[],0,null,["loc",[null,[9,8],[13,15]]]],
          ["content","episode.name",["loc",[null,[19,14],[19,30]]]],
          ["inline","format-timestamp",[["get","episode.datePublished",["loc",[null,[26,35],[26,56]]]]],[],["loc",[null,[26,16],[26,58]]]],
          ["block","if",[["get","episode.audioLength",["loc",[null,[28,20],[28,39]]]]],[],1,null,["loc",[null,[28,14],[33,21]]]],
          ["element","action",["setEpisode",["get","episode",["loc",[null,[40,42],[40,49]]]]],[],["loc",[null,[40,20],[40,51]]]],
          ["attribute","class",["concat",[["subexpr","if",[["get","episode.isPlaying",["loc",[null,[41,29],[41,46]]]],"pause","play"],[],["loc",[null,[41,24],[41,63]]]]," icon"]]]
        ],
        locals: ["episode"],
        templates: [child0, child1]
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 47,
              "column": 2
            },
            "end": {
              "line": 49,
              "column": 2
            }
          },
          "moduleName": "high-fidelity/templates/components/episode-list.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
          return morphs;
        },
        statements: [
          ["inline","render",["spinner"],[],["loc",[null,[48,4],[48,24]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 51,
            "column": 0
          }
        },
        "moduleName": "high-fidelity/templates/components/episode-list.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","episodes ui divided relaxed large list");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]),1,1);
        return morphs;
      },
      statements: [
        ["block","each",[["get","sortedEpisodes",["loc",[null,[2,10],[2,24]]]]],[],0,1,["loc",[null,[2,2],[49,11]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('high-fidelity/templates/components/ui-dropdown', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 0
            },
            "end": {
              "line": 4,
              "column": 0
            }
          },
          "moduleName": "high-fidelity/templates/components/ui-dropdown.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(1);
          morphs[0] = dom.createAttrMorph(element0, 'class');
          return morphs;
        },
        statements: [
          ["attribute","class",["concat",[["subexpr","-bind-attr-class",[["get","icon",[]],"icon"],[],[]]," ","icon"]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 0
            },
            "end": {
              "line": 6,
              "column": 0
            }
          },
          "moduleName": "high-fidelity/templates/components/ui-dropdown.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1,"class","dropdown icon");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.3",
            "loc": {
              "source": null,
              "start": {
                "line": 9,
                "column": 4
              },
              "end": {
                "line": 11,
                "column": 4
              }
            },
            "moduleName": "high-fidelity/templates/components/ui-dropdown.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            return morphs;
          },
          statements: [
            ["inline","view",[["get","view.groupView",["loc",[null,[10,13],[10,27]]]]],["content",["subexpr","@mut",[["get","content",["loc",[null,[10,36],[10,43]]]]],[],[]],"label",["subexpr","@mut",[["get","label",["loc",[null,[10,50],[10,55]]]]],[],[]]],["loc",[null,[10,6],[10,57]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 8,
              "column": 2
            },
            "end": {
              "line": 12,
              "column": 2
            }
          },
          "moduleName": "high-fidelity/templates/components/ui-dropdown.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","each",[["get","view.groupedContent",["loc",[null,[9,12],[9,31]]]]],[],0,null,["loc",[null,[9,4],[11,13]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    var child3 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.3",
            "loc": {
              "source": null,
              "start": {
                "line": 13,
                "column": 4
              },
              "end": {
                "line": 15,
                "column": 4
              }
            },
            "moduleName": "high-fidelity/templates/components/ui-dropdown.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            return morphs;
          },
          statements: [
            ["inline","view",[["get","view.optionView",["loc",[null,[14,13],[14,28]]]]],["content",["subexpr","@mut",[["get","this",["loc",[null,[14,37],[14,41]]]]],[],[]],"initialized",0],["loc",[null,[14,6],[14,57]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 12,
              "column": 2
            },
            "end": {
              "line": 16,
              "column": 2
            }
          },
          "moduleName": "high-fidelity/templates/components/ui-dropdown.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","each",[["get","view.content",["loc",[null,[13,12],[13,24]]]]],[],0,null,["loc",[null,[13,4],[15,13]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    var child4 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 18,
              "column": 0
            },
            "end": {
              "line": 20,
              "column": 0
            }
          },
          "moduleName": "high-fidelity/templates/components/ui-dropdown.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
          return morphs;
        },
        statements: [
          ["content","yield",["loc",[null,[19,2],[19,11]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 21,
            "column": 0
          }
        },
        "moduleName": "high-fidelity/templates/components/ui-dropdown.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","text");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","menu");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        morphs[1] = dom.createMorphAt(fragment,2,2,contextualElement);
        morphs[2] = dom.createMorphAt(dom.childAt(fragment, [3]),1,1);
        morphs[3] = dom.createMorphAt(fragment,5,5,contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["content","view.prompt",["loc",[null,[1,18],[1,33]]]],
        ["block","if",[["get","icon",["loc",[null,[2,6],[2,10]]]]],[],0,1,["loc",[null,[2,0],[6,7]]]],
        ["block","if",[["get","view.optionGroupPath",["loc",[null,[8,8],[8,28]]]]],[],2,3,["loc",[null,[8,2],[16,9]]]],
        ["block","if",[["get","view.template",["loc",[null,[18,6],[18,19]]]]],[],4,null,["loc",[null,[18,0],[20,7]]]]
      ],
      locals: [],
      templates: [child0, child1, child2, child3, child4]
    };
  }()));

});
define('high-fidelity/templates/podcasts/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.3",
            "loc": {
              "source": null,
              "start": {
                "line": 7,
                "column": 8
              },
              "end": {
                "line": 9,
                "column": 8
              }
            },
            "moduleName": "high-fidelity/templates/podcasts/index.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("img");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element1 = dom.childAt(fragment, [1]);
            var morphs = new Array(2);
            morphs[0] = dom.createAttrMorph(element1, 'src');
            morphs[1] = dom.createAttrMorph(element1, 'alt');
            return morphs;
          },
          statements: [
            ["attribute","src",["get","podcast.coverImageURL",["loc",[null,[8,21],[8,42]]]]],
            ["attribute","alt",["get","podcast.title",["loc",[null,[8,51],[8,64]]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 4
            },
            "end": {
              "line": 11,
              "column": 4
            }
          },
          "moduleName": "high-fidelity/templates/podcasts/index.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","column four wide computer podcast-cover");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["block","link-to",["podcasts.show",["get","podcast",["loc",[null,[7,35],[7,42]]]]],["class","cover"],0,null,["loc",[null,[7,8],[9,20]]]]
        ],
        locals: ["podcast"],
        templates: [child0]
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.3",
            "loc": {
              "source": null,
              "start": {
                "line": 12,
                "column": 35
              },
              "end": {
                "line": 12,
                "column": 85
              }
            },
            "moduleName": "high-fidelity/templates/podcasts/index.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["inline","t",["podcast.addOne"],[],["loc",[null,[12,63],[12,85]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 11,
              "column": 4
            },
            "end": {
              "line": 13,
              "column": 4
            }
          },
          "moduleName": "high-fidelity/templates/podcasts/index.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(element0,0,0);
          morphs[1] = dom.createMorphAt(element0,2,2);
          return morphs;
        },
        statements: [
          ["inline","t",["podcast.noneFound"],[],["loc",[null,[12,9],[12,34]]]],
          ["block","link-to",["podcasts.new"],[],0,null,["loc",[null,[12,35],[12,97]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 18,
            "column": 0
          }
        },
        "moduleName": "high-fidelity/templates/podcasts/index.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","podcast-index horizontal-padding");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        dom.setAttribute(el2,"class","ui dividing header");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","ui doubling six column grid");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element2 = dom.childAt(fragment, [0]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(dom.childAt(element2, [1]),0,0);
        morphs[1] = dom.createMorphAt(dom.childAt(element2, [3]),1,1);
        morphs[2] = dom.createMorphAt(fragment,2,2,contextualElement);
        return morphs;
      },
      statements: [
        ["inline","t",["tabs.myPodcasts"],[],["loc",[null,[2,33],[2,56]]]],
        ["block","each",[["get","controller.sortedPodcasts",["loc",[null,[5,12],[5,37]]]]],[],0,1,["loc",[null,[5,4],[13,13]]]],
        ["content","outlet",["loc",[null,[17,0],[17,10]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('high-fidelity/templates/podcasts/new', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 2
            },
            "end": {
              "line": 9,
              "column": 2
            }
          },
          "moduleName": "high-fidelity/templates/podcasts/new.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","error");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          var el3 = dom.createTextNode("Encountered an error while adding Podcast.");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          var el3 = dom.createTextNode("Is the Podcast URL valid?");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 36,
              "column": 2
            },
            "end": {
              "line": 40,
              "column": 2
            }
          },
          "moduleName": "high-fidelity/templates/podcasts/new.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","full-screen");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["inline","render",["spinner"],[],["loc",[null,[38,6],[38,26]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 42,
            "column": 0
          }
        },
        "moduleName": "high-fidelity/templates/podcasts/new.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","podcast-new horizontal-padding");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        dom.setAttribute(el2,"class","ui header");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","ui input");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"class","ui button");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h3");
        dom.setAttribute(el2,"class","ui header");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","sub header");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","ui doubling six column grid");
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","column two wide computer podcast-cover");
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h5");
        dom.setAttribute(el4,"class","ui header centered align");
        var el5 = dom.createTextNode("The Cracked Podcast");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("img");
        dom.setAttribute(el4,"alt","The Cracked Podcast");
        dom.setAttribute(el4,"class","cover cover-image");
        dom.setAttribute(el4,"src","http://cdn.earwolf.com/wp-content/uploads/2013/08/EAR_CrackedPodcast_1600x1600_Cover_Final.jpg");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n  ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n  ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","column two wide computer podcast-cover");
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h5");
        dom.setAttribute(el4,"class","ui header centered align");
        var el5 = dom.createTextNode("Hello");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("br");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("Internet");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("img");
        dom.setAttribute(el4,"alt","Hello Internet");
        dom.setAttribute(el4,"class","cover cover-image");
        dom.setAttribute(el4,"src","http://static.squarespace.com/static/52d66949e4b0a8cec3bcdd46/t/52ebf67fe4b0f4af2a4502d8/1391195777839/1500w/Hello%20Internet.003.png");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n  ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [7]);
        var element2 = dom.childAt(element0, [9]);
        var element3 = dom.childAt(element0, [11]);
        var element4 = dom.childAt(element3, [1, 3]);
        var element5 = dom.childAt(element3, [3, 3]);
        var morphs = new Array(10);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
        morphs[1] = dom.createMorphAt(element0,3,3);
        morphs[2] = dom.createMorphAt(dom.childAt(element0, [5]),1,1);
        morphs[3] = dom.createElementMorph(element1);
        morphs[4] = dom.createMorphAt(element1,0,0);
        morphs[5] = dom.createMorphAt(element2,0,0);
        morphs[6] = dom.createMorphAt(dom.childAt(element2, [2]),0,0);
        morphs[7] = dom.createElementMorph(element4);
        morphs[8] = dom.createElementMorph(element5);
        morphs[9] = dom.createMorphAt(element0,13,13);
        return morphs;
      },
      statements: [
        ["inline","t",["podcast.addRSSFeed"],[],["loc",[null,[2,24],[2,50]]]],
        ["block","if",[["get","isInErrorState",["loc",[null,[4,8],[4,22]]]]],[],0,null,["loc",[null,[4,2],[9,9]]]],
        ["inline","input",[],["type","url","value",["subexpr","@mut",[["get","rssURL",["loc",[null,[12,29],[12,35]]]]],[],[]],"placeholder","Podcast URL"],["loc",[null,[12,4],[12,63]]]],
        ["element","action",["create"],[],["loc",[null,[14,28],[14,47]]]],
        ["inline","t",["podcast.add"],[],["loc",[null,[14,48],[14,67]]]],
        ["inline","t",["podcast.newToPodcasts"],[],["loc",[null,[16,26],[16,55]]]],
        ["inline","t",["podcast.recommendations"],[],["loc",[null,[17,30],[17,61]]]],
        ["element","action",["create","http://rss.earwolf.com/the-cracked-podcast"],[],["loc",[null,[24,9],[24,73]]]],
        ["element","action",["create","http://feeds.podtrac.com/m2lTaLRx8AWb"],[],["loc",[null,[31,14],[31,73]]]],
        ["block","if",[["get","isAdding",["loc",[null,[36,8],[36,16]]]]],[],1,null,["loc",[null,[36,2],[40,9]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('high-fidelity/templates/podcasts/show', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 21,
              "column": 2
            },
            "end": {
              "line": 22,
              "column": 2
            }
          },
          "moduleName": "high-fidelity/templates/podcasts/show.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 26,
            "column": 0
          }
        },
        "moduleName": "high-fidelity/templates/podcasts/show.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","podcast-show ui grid");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","sixteen wide column");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        dom.setAttribute(el3,"class","ui header");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","fourteen wide column centered center aligned podcast-cover");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("img");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","eight wide column center aligned");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"class","blue ui button");
        var el5 = dom.createTextNode("Refresh");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","eight wide column center aligned");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"class","negative ui button");
        var el5 = dom.createTextNode("Unsubscribe");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment(" <p>{{model.description}}</p> ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [3, 1]);
        var element2 = dom.childAt(element0, [5]);
        var element3 = dom.childAt(element2, [1, 1]);
        var element4 = dom.childAt(element2, [3, 1]);
        var morphs = new Array(6);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1, 1]),0,0);
        morphs[1] = dom.createAttrMorph(element1, 'src');
        morphs[2] = dom.createAttrMorph(element1, 'alt');
        morphs[3] = dom.createElementMorph(element3);
        morphs[4] = dom.createElementMorph(element4);
        morphs[5] = dom.createMorphAt(element0,9,9);
        return morphs;
      },
      statements: [
        ["content","model.title",["loc",[null,[3,26],[3,41]]]],
        ["attribute","src",["get","model.coverImageURL",["loc",[null,[7,15],[7,34]]]]],
        ["attribute","alt",["get","model.title",["loc",[null,[7,43],[7,54]]]]],
        ["element","action",["update"],[],["loc",[null,[12,37],[12,56]]]],
        ["element","action",["delete"],[],["loc",[null,[16,14],[16,33]]]],
        ["block","episode-list",[],["data",["subexpr","@mut",[["get","model.episodes",["loc",[null,[21,23],[21,37]]]]],[],[]],"class","sixteen wide column"],0,null,["loc",[null,[21,2],[22,19]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('high-fidelity/templates/spinner', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 8,
            "column": 0
          }
        },
        "moduleName": "high-fidelity/templates/spinner.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","spinner");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","rect1");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","rect2");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","rect3");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","rect4");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","rect5");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() { return []; },
      statements: [

      ],
      locals: [],
      templates: []
    };
  }()));

});
define('high-fidelity/tests/adapters/application.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/application.js should pass jshint', function() { 
    ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/components/audio-player.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/audio-player.js should pass jshint', function() { 
    ok(true, 'components/audio-player.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/components/episode-list.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/episode-list.js should pass jshint', function() { 
    ok(true, 'components/episode-list.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/controllers/application.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/application.js should pass jshint', function() { 
    ok(true, 'controllers/application.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/controllers/podcasts/index.jshint', function () {

  'use strict';

  module('JSHint - controllers/podcasts');
  test('controllers/podcasts/index.js should pass jshint', function() { 
    ok(true, 'controllers/podcasts/index.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/controllers/podcasts/new.jshint', function () {

  'use strict';

  module('JSHint - controllers/podcasts');
  test('controllers/podcasts/new.js should pass jshint', function() { 
    ok(true, 'controllers/podcasts/new.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/controllers/podcasts/show.jshint', function () {

  'use strict';

  module('JSHint - controllers/podcasts');
  test('controllers/podcasts/show.js should pass jshint', function() { 
    ok(true, 'controllers/podcasts/show.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/helpers/format-timestamp.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/format-timestamp.js should pass jshint', function() { 
    ok(true, 'helpers/format-timestamp.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/helpers/resolver', ['exports', 'ember/resolver', 'high-fidelity/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('high-fidelity/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/helpers/start-app', ['exports', 'ember', 'high-fidelity/app', 'high-fidelity/config/environment'], function (exports, Ember, Application, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('high-fidelity/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/initializers/i18n.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/i18n.js should pass jshint', function() { 
    ok(true, 'initializers/i18n.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/initializers/player-events.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/player-events.js should pass jshint', function() { 
    ok(true, 'initializers/player-events.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/lib/rss.jshint', function () {

  'use strict';

  module('JSHint - lib');
  test('lib/rss.js should pass jshint', function() { 
    ok(true, 'lib/rss.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/lib/timestamp.jshint', function () {

  'use strict';

  module('JSHint - lib');
  test('lib/timestamp.js should pass jshint', function() { 
    ok(true, 'lib/timestamp.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/locales/en/config.jshint', function () {

  'use strict';

  module('JSHint - locales/en');
  test('locales/en/config.js should pass jshint', function() { 
    ok(true, 'locales/en/config.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/locales/en/translations.jshint', function () {

  'use strict';

  module('JSHint - locales/en');
  test('locales/en/translations.js should pass jshint', function() { 
    ok(true, 'locales/en/translations.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/locales/eo/config.jshint', function () {

  'use strict';

  module('JSHint - locales/eo');
  test('locales/eo/config.js should pass jshint', function() { 
    ok(true, 'locales/eo/config.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/locales/eo/translations.jshint', function () {

  'use strict';

  module('JSHint - locales/eo');
  test('locales/eo/translations.js should pass jshint', function() { 
    ok(true, 'locales/eo/translations.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/locales/es/config.jshint', function () {

  'use strict';

  module('JSHint - locales/es');
  test('locales/es/config.js should pass jshint', function() { 
    ok(true, 'locales/es/config.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/locales/es/translations.jshint', function () {

  'use strict';

  module('JSHint - locales/es');
  test('locales/es/translations.js should pass jshint', function() { 
    ok(true, 'locales/es/translations.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/locales/fr/config.jshint', function () {

  'use strict';

  module('JSHint - locales/fr');
  test('locales/fr/config.js should pass jshint', function() { 
    ok(true, 'locales/fr/config.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/locales/fr/translations.jshint', function () {

  'use strict';

  module('JSHint - locales/fr');
  test('locales/fr/translations.js should pass jshint', function() { 
    ok(true, 'locales/fr/translations.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/locales/gl/config.jshint', function () {

  'use strict';

  module('JSHint - locales/gl');
  test('locales/gl/config.js should pass jshint', function() { 
    ok(true, 'locales/gl/config.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/locales/gl/translations.jshint', function () {

  'use strict';

  module('JSHint - locales/gl');
  test('locales/gl/translations.js should pass jshint', function() { 
    ok(true, 'locales/gl/translations.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/locales/it/config.jshint', function () {

  'use strict';

  module('JSHint - locales/it');
  test('locales/it/config.js should pass jshint', function() { 
    ok(true, 'locales/it/config.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/locales/it/translations.jshint', function () {

  'use strict';

  module('JSHint - locales/it');
  test('locales/it/translations.js should pass jshint', function() { 
    ok(true, 'locales/it/translations.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/locales/pl/config.jshint', function () {

  'use strict';

  module('JSHint - locales/pl');
  test('locales/pl/config.js should pass jshint', function() { 
    ok(true, 'locales/pl/config.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/locales/pl/translations.jshint', function () {

  'use strict';

  module('JSHint - locales/pl');
  test('locales/pl/translations.js should pass jshint', function() { 
    ok(true, 'locales/pl/translations.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/models/episode.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/episode.js should pass jshint', function() { 
    ok(true, 'models/episode.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/models/podcast.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/podcast.js should pass jshint', function() { 
    ok(true, 'models/podcast.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/routes/application.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/application.js should pass jshint', function() { 
    ok(true, 'routes/application.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/routes/index.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/index.js should pass jshint', function() { 
    ok(true, 'routes/index.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/routes/podcast.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/podcast.js should pass jshint', function() { 
    ok(true, 'routes/podcast.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/routes/podcasts.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/podcasts.js should pass jshint', function() { 
    ok(true, 'routes/podcasts.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/serializers/application.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/application.js should pass jshint', function() { 
    ok(true, 'serializers/application.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/services/player-events.jshint', function () {

  'use strict';

  module('JSHint - services');
  test('services/player-events.js should pass jshint', function() { 
    ok(true, 'services/player-events.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/test-helper', ['high-fidelity/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('high-fidelity/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/unit/adapters/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('adapter:application', 'Unit | Adapter | application', {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });

});
define('high-fidelity/tests/unit/adapters/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/adapters');
  test('unit/adapters/application-test.js should pass jshint', function() { 
    ok(true, 'unit/adapters/application-test.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/unit/components/audio-player-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('audio-player', 'Unit | Component | audio player', {
    // Specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar'],
    unit: true
  });

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

});
define('high-fidelity/tests/unit/components/audio-player-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components');
  test('unit/components/audio-player-test.js should pass jshint', function() { 
    ok(true, 'unit/components/audio-player-test.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/unit/controllers/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:application', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});
define('high-fidelity/tests/unit/controllers/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/application-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/application-test.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/unit/controllers/episodes-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:episodes', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});
define('high-fidelity/tests/unit/controllers/episodes-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/episodes-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/episodes-test.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/unit/controllers/player-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:player', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});
define('high-fidelity/tests/unit/controllers/player-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/player-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/player-test.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/unit/controllers/podcast-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:podcast', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});
define('high-fidelity/tests/unit/controllers/podcast-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/podcast-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/podcast-test.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/unit/controllers/podcasts-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:podcasts', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});
define('high-fidelity/tests/unit/controllers/podcasts-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/podcasts-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/podcasts-test.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/unit/helpers/format-timestamp-test', ['high-fidelity/helpers/format-timestamp', 'qunit'], function (format_timestamp, qunit) {

  'use strict';

  qunit.module('Unit | Helper | format timestamp');

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    var result = format_timestamp.formatTimestamp(42);
    assert.ok(result);
  });

});
define('high-fidelity/tests/unit/helpers/format-timestamp-test.jshint', function () {

  'use strict';

  module('JSHint - unit/helpers');
  test('unit/helpers/format-timestamp-test.js should pass jshint', function() { 
    ok(true, 'unit/helpers/format-timestamp-test.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/unit/helpers/t-test', ['high-fidelity/helpers/t', 'qunit'], function (t, qunit) {

  'use strict';

  qunit.module('Unit | Helper | t');

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    var result = t.t(42);
    assert.ok(result);
  });

});
define('high-fidelity/tests/unit/helpers/t-test.jshint', function () {

  'use strict';

  module('JSHint - unit/helpers');
  test('unit/helpers/t-test.js should pass jshint', function() { 
    ok(true, 'unit/helpers/t-test.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/unit/models/episode-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('episode', 'Unit | Model | episode', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('high-fidelity/tests/unit/models/episode-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/episode-test.js should pass jshint', function() { 
    ok(true, 'unit/models/episode-test.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/unit/models/podcast-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('podcast', 'Unit | Model | podcast', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('high-fidelity/tests/unit/models/podcast-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/podcast-test.js should pass jshint', function() { 
    ok(true, 'unit/models/podcast-test.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/unit/routes/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:application', 'Unit | Route | application', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('high-fidelity/tests/unit/routes/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/application-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/application-test.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/unit/routes/podcast-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:podcast', 'Unit | Route | podcast', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('high-fidelity/tests/unit/routes/podcast-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/podcast-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/podcast-test.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/unit/routes/podcasts-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:podcasts', 'Unit | Route | podcasts', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('high-fidelity/tests/unit/routes/podcasts-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/podcasts-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/podcasts-test.js should pass jshint.'); 
  });

});
define('high-fidelity/tests/unit/serializers/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('application', 'Unit | Serializer | application', {
    // Specify the other units that are required for this test.
    needs: ['serializer:application']
  });

  // Replace this with your real tests.
  ember_qunit.test('it serializes records', function (assert) {
    var record = this.subject();

    var serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });

});
define('high-fidelity/tests/unit/serializers/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/serializers');
  test('unit/serializers/application-test.js should pass jshint', function() { 
    ok(true, 'unit/serializers/application-test.js should pass jshint.'); 
  });

});
define('high-fidelity/utils/i18n/compile-template', ['exports', 'ember-i18n/compile-template'], function (exports, compileTemplate) {

	'use strict';

	exports['default'] = compileTemplate['default'];

});
define('high-fidelity/utils/i18n/missing-message', ['exports', 'ember-i18n/missing-message'], function (exports, missingMessage) {

	'use strict';

	exports['default'] = missingMessage['default'];

});
define('high-fidelity/views/ui-modal', ['exports', 'semantic-ui-ember/views/ui-modal'], function (exports, Modal) {

	'use strict';

	exports['default'] = Modal['default'];

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('high-fidelity/config/environment', ['ember'], function(Ember) {
  var prefix = 'high-fidelity';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("high-fidelity/tests/test-helper");
} else {
  require("high-fidelity/app")["default"].create({"name":"high-fidelity","version":"3.0.0+e0fee434"});
}

/* jshint ignore:end */
//# sourceMappingURL=high-fidelity.map