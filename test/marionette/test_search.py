import urllib2
from os import getenv
from time import sleep
from unittest import skipIf

from gaiatest import GaiaTestCase
from marionette.errors import NoSuchElementException


def env_variable(name):
    """Check an environment variable for truth."""
    return getenv(name) is not None and (getenv(name).lower() == 'false' or
                                         getenv(name).lower() == 'no' or
                                         getenv(name).lower() == 'skip' or
                                         getenv(name) == '1')


def network_connectivity():
    """Check for network connectivity to automatically skip online tests.

    Uses one of google.com's IP addresses to avoid a DNS lookup. This tests
    prevents users with no apparent network connection from running tests that
    require a network connection.
    """
    try:
        urllib2.urlopen('http://74.125.113.99', timeout=1)
        return True
    except urllib2.URLError:
        pass
    return False


# If this variable is true, we don't run any tests that rely on a network
# connection, i.e. downloads, search API tests, etc. Doesn't apply to local
# resources, so download procedures can still be tested using a
# manually-added RSS feed with local files.
SKIP_NETWORK_TEST = (env_variable('INTERNET') or env_variable('NETWORK') or
                     network_connectivity is False)


class TestSearch(GaiaTestCase):
    """Test podcasts search, currently using Apple's iTunes Store API."""
    search_button = ('id', 'podcast-search-submit')
    search_input = ('id', 'podcast-search')
    search_results = ('css selector', '#search-results .search-result')
    search_tab = ('css selector', '#search-tab-container')
    search_tab_link = ('css selector', '#search-tab a')

    def setUp(self):
        """Open Podcasts and activate the search tab before every test."""
        GaiaTestCase.setUp(self)

        # Launch the app!
        self.app = self.apps.launch('Podcasts')

        # Wait for search tab to load and activate it.
        self.wait_for_element_displayed(*self.search_tab_link)
        self.search_tab_link_element = self.marionette.find_element(
            *self.search_tab_link)
        self.marionette.tap(self.search_tab_link_element)

    @skipIf(SKIP_NETWORK_TEST, 'Skip test if user is offline.')
    def test_can_subscribe_from_search_results(self):
        """Ensure users can subscribe to a podcast from search results."""
        # I loves me some Dan Savage.
        self.wait_for_element_displayed(*self.search_input)
        self.marionette.tap(self.marionette.find_element(*self.search_input))
        self.marionette.find_element(*self.search_input).send_keys(
            'Savage Lovecast')

        # Tap the search button to run the search.
        self.marionette.tap(self.marionette.find_element(*self.search_button))

        # Wait for the results to load.
        self.wait_for_element_displayed(*self.search_results)
        # Tap on the first result.
        self.marionette.tap(self.marionette.find_element(*self.search_results))

        # Wait for the subscription dialog to appear.
        self.wait_for_element_displayed('id', 'modal-dialog')

        self.assertTrue(self.marionette.find_element('id', 'modal-dialog')
                                       .is_displayed(),
                        'Subscription dialog should appear when a search '
                        'result is tapped')

        # Tap cancel to return to search results.
        self.wait_for_element_displayed('css selector',
            '#modal-dialog button[data-action=cancel]')
        self.marionette.tap(self.marionette.find_element('css selector',
            '#modal-dialog button[data-action=cancel]'))

        sleep(1)  # Wait for dialog to close; clunky, but I've nothing else.
        self.assertRaises(NoSuchElementException, (lambda _:
            self.marionette.find_element('id', 'modal-dialog').is_displayed()),
            'Dialog should disappear after cancel is tapped')

        # Tap the first result again; this time we'll subscribe.
        self.marionette.tap(self.marionette.find_element(*self.search_results))

        self.wait_for_element_displayed('css selector',
            '#modal-dialog button[data-action=confirm]')
        self.marionette.tap(self.marionette.find_element('css selector',
            '#modal-dialog button[data-action=confirm]'))

        sleep(1)  # Wait for dialog to close; clunky, but I've nothing else.
        self.assertRaises(NoSuchElementException, (lambda _:
            self.marionette.find_element('id', 'modal-dialog').is_displayed()),
            'Dialog should disappear after cancel is tapped')

        # Make sure the podcast appeared in our local podcasts.
        self.wait_for_element_displayed('css selector', '.podcast-cover')

        self.assertGreater(self.marionette.find_element('css selector',
                                                        '.podcast-cover'),
                           0, "Podcast should appear in user's podcasts")

    @skipIf(SKIP_NETWORK_TEST, 'Skip test if user is offline.')
    def test_search_api_returns_results(self):
        """Test integration with iTunes Store Search API.

        This test requires (decent) network connectivity, thus it can be
        disabled by running the tests with INTERNET=false or NETWORK=false
        environment variables; however, we do need to test this in case iTunes'
        API changes or whatnot.
        """
        # Search for "5by5"; it's a podcast network so we should get a decent
        # amount of results.
        self.wait_for_element_displayed(*self.search_input)
        self.marionette.tap(self.marionette.find_element(*self.search_input))
        self.marionette.find_element(*self.search_input).send_keys('5by5')

        # Tap the search button to run the search.
        self.marionette.tap(self.marionette.find_element(*self.search_button))

        # Wait for the results to load.
        self.wait_for_element_displayed(*self.search_results)

        # We should have at least one search result:
        # https://itunes.apple.com/search?media=podcast&term=5by5
        self.assertGreater(self.marionette.find_elements(*self.search_results),
                           0, 'Search API should return results')

    def test_search_tab_exists(self):
        """Test the Podcast search tab.

        Make sure activating the search tab works and that the appropriate
        DOM elements are in place.
        """
        # Make sure the search tab exists.
        self.assertEqual(self.search_tab_link_element.text, 'Search',
                         'Search tab link should exist')

        # Activate a different tab first.
        self.marionette.tap(self.marionette.find_element(
            'css selector', '#podcasts-tab a'))
        # Clicking on the search tab link should open the search tab.
        self.marionette.tap(self.search_tab_link_element)
        self.wait_for_element_displayed(*self.search_tab)
        self.assertTrue(self.marionette.find_element(*self.search_tab)
                                       .is_displayed(),
                        'Search tab should appear when link is tapped')

        # Search field should have a placeholder value.
        self.wait_for_element_displayed(*self.search_input)
        self.assertTrue(self.marionette.find_element(*self.search_input)
                                       .get_attribute('placeholder'),
                        'Search field should have a placeholder')

    def test_search_input_hides_lower_ui(self):
        """Ensure lower UI elements are hidden during search text input.

        Gaia's keyboard pushes elements with `position: fixed` CSS up into the
        search field and are useless during user input anyway, so we hide them.
        This test makes sure those elements are hidden and shown properly.
        """
        # Tapping the search input should be enough to hide the UI.
        self.wait_for_element_displayed(*self.search_input)
        self.marionette.tap(self.marionette.find_element(*self.search_input))
        self.wait_for_element_displayed('id', 'tabs')

        sleep(1)
        self.assertTrue('hide' in self.marionette.find_element('id', 'tabs')
                                                 .get_attribute('class'),
                        'Tabs should not be visible when search input active')

        # Tap somewhere else to blur the search input.
        self.marionette.tap(self.marionette.find_element('tag name', 'body'))

        self.assertTrue('hide' not in self.marionette.find_element('id',
                                                                   'tabs')
                                                     .is_displayed(),
                        'Tabs should be visible once search input is inactive')
