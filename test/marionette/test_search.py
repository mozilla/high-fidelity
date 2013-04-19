import urllib2
from os import getenv
from unittest import skipIf

from gaiatest import GaiaTestCase


def env_variable(name):
    """Check an environment variable for truth."""
    return getenv(name) is not None and (getenv(name).lower() == 'false' or
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
SKIP_NETWORK_TEST = (network_connectivity is False or
                     env_variable('INTERNET') or env_variable('NETWORK'))


class TestSearch(GaiaTestCase):
    """Test podcasts search, currently using Apple's iTunes Store API."""
    search_input = ('id', 'podcast-search')
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
                        'Search tab should appear when link is tapped.')

        # Search field should have a placeholder value.
        self.wait_for_element_displayed(*self.search_input)
        self.assertTrue(self.marionette.find_element(*self.search_input)
                                       .get_attribute('placeholder'),
                        'Search field should have a placeholder.')

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
        self.marionette.tap(self.marionette.find_element(
            'id', 'podcast-search-submit'))

        # Wait for the results to load.
        self.wait_for_element_displayed('class name', 'search-result')
        search_results = self.marionette.find_elements('class name',
                                                       'search-result')

        # We should have at least one search result:
        # https://itunes.apple.com/search?media=podcast&term=5by5
        self.assertGreater(search_results, 0,
                           'Search API should return results.')
