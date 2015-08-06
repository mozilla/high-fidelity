import I18n from 'I18n';

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
