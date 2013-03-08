/*global $:true, casper:true, document:true */
'use strict';

casper.test.comment('Podcasts - Popular podcasts and Search');
casper.test.comment('Setting waitTimeout to 15 seconds');
casper.options.waitTimeout = 15000;

casper.start('http://localhost:3001/');

casper.waitForSelector('#search-tab a', function() {
    casper.test.info('Testing search');

    this.click('#search-tab a');

    this.evaluate(function() {
        $('#podcast-search').val('5by5');
    });

    this.click('#podcast-search-submit');
}).waitForSelector('#search-tab-container .search-result', function() {
    this.test.assertEval(function() {
        return $('#search-tab-container .search-result').length > 0;
    }, 'Search results should be populated');
});

casper.then(function() {
    casper.test.info('Testing popular podcasts');

    this.click('#popular-tab a');

    this.test.assertEval(function() {
        return $('#popular-tab-container .search-result').length > 0;
    }, 'Popular podcasts should be populated');

    this.click('#popular-tab-container .search-result:first-child a');
}).waitForSelector('#modal-dialog', function() {
    casper.test.info('Testing subscribe dialog');

    this.test.assertEval(function() {
        return $('#podcasts .podcast-cover').length === 0;
    }, 'User should have no podcasts in listing');

    this.click('#modal-dialog button[data-action="cancel"]');

    this.test.assertEval(function() {
        return $('#modal-dialog').length === 0;
    }, 'Modal dialog should go away after user clicks "cancel"');
}).waitForSelector('#popular-tab-container .search-result a', function() {
    this.click('#popular-tab-container .search-result:first-child a');
}).waitForSelector('#modal-dialog', function() {
    this.test.assertEval(function() {
        return $('#podcasts .podcast-cover').length === 0;
    }, 'User should still have zero podcasts in their listing');

    this.click('#modal-dialog .recommend');

    this.test.assertEval(function() {
        return $('#modal-dialog').length === 0;
    }, 'Modal dialog should go away after user clicks "subscribe"');
});

casper.run(function () {
    this.test.done();
});
