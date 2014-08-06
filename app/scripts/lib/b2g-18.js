// This code sets the min-height of the x-layout element to the height of
// the viewport in older versions of Gecko (essentially, < 19 i.e. Firefox OS
// 1.0 and 1.1). This prevents flexbox bugs.
$(function() {
    if (window.navigator.userAgent &&
        window.navigator.userAgent.match('Firefox/18.0')) {
        $('html').addClass('fxos11');
    }
});
