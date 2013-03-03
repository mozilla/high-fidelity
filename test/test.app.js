/*global $:true, casper:true, document:true */
'use strict';

casper.test.comment('Podcasts - App');
casper.test.comment('Setting waitTimeout to 15 seconds');
casper.options.waitTimeout = 15000;

casper.start('http://localhost:3001/', function () {
    casper.test.info('Testing main app page');

    this.test.assertTitle('Podcasts', 'Homepage has the correct title');
});

casper.waitForSelector('#app-header', function() {
    this.test.assertEval(function() {
        return window._DB !== undefined;
    }, 'IndexedDB should be available');
});

casper.run(function () {
    this.test.done();
});
