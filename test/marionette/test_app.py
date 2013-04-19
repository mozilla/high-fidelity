from unittest import skip

from gaiatest import GaiaTestCase


class TestApp(GaiaTestCase):
    """Test standard app functionality like menu bar and tab-switching."""
    popular_tab = ('css selector', '#popular-tab-container')
    popular_tab_link = ('css selector', '#popular-tab a')

    search_input = ('id', 'podcast-search')
    search_tab = ('css selector', '#search-tab-container')
    search_tab_link = ('css selector', '#search-tab a')

    def setUp(self):
        """Run the standard Gaia setUp and open Podcasts for every test."""
        GaiaTestCase.setUp(self)

        # Launch the app!
        self.app = self.apps.launch('Podcasts')

    # Popular podcasts are on hold while we look for a new API.
    @skip('Feature disabled until "popular" API/service is found.')
    def test_popular_tab_exists(self):
        """Test the "Top Podcasts" tab.

        Make sure activating the popular tab works and that the appropriate
        DOM elements are in place.
        """
        # Make sure the popular podcasts tab exists.
        self.wait_for_element_displayed(*self.popular_tab_link)
        popular_tab_link_element = self.marionette.find_element(
            *self.popular_tab_link)
        self.assertEqual(popular_tab_link_element.text, 'Popular',
                         'Popular tab link should exist')

        # Clicking on the popular tab link should open the popular tab.
        self.marionette.tap(popular_tab_link_element)
        self.wait_for_element_displayed(*self.popular_tab)
        self.assertTrue(self.marionette.find_element(*self.popular_tab)
                                       .is_displayed(),
                        'Popular podcasts tab should appear when link is '
                        'tapped')

    def test_search_tab_exists(self):
        """Test the Podcast search tab.

        Make sure activating the search tab works and that the appropriate
        DOM elements are in place.
        """
        # Make sure the search tab exists.
        self.wait_for_element_displayed(*self.search_tab_link)
        search_tab_link_element = self.marionette.find_element(
            *self.search_tab_link)
        self.assertEqual(search_tab_link_element.text, 'Search',
                         'Search tab link should exist')

        # Clicking on the search tab link should open the search tab.
        self.marionette.tap(search_tab_link_element)
        self.wait_for_element_displayed(*self.search_tab)
        self.assertTrue(self.marionette.find_element(*self.search_tab)
                                       .is_displayed(),
                        'Search tab should appear when link is tapped')

        # Search field should have a placeholder value.
        self.wait_for_element_displayed(*self.search_input)
        self.assertTrue(self.marionette.find_element(*self.search_input)
                                       .get_attribute('placeholder'),
                        'Search field should have a placeholder')
