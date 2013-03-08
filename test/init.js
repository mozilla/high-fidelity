/*global $:true, casper:true, document:true */
'use strict';

casper.test.comment('Pre-test setup');

casper.start('http://localhost:3001/', function () {
    casper.test.info('Clearing out localStorage');

    // Clear localStorage from any previous test runs.
    this.evaluate(function() {
        window.localStorage.clear();
    });

    this.test.assertEval(function() {
        return window.localStorage.length === 0;
    }, 'localStorage should be empty');
}).run(function () {
    this.test.done();
});
