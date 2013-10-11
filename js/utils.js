// Javascript Patterns - http://shop.oreilly.com/product/9780596806767.do
var utils = {
	addListener: null,
	removeListener: null
};

if (typeof window.addEventListener === 'function') {
	utils.addListener = function (el, type, fn) {
		el.addEventListener(type, fn, false);
	};
	utils.removeListener = function (el, type, fn) {
		el.removeEventListener(type, fn, false);
	}
}
else if (typeof document.attachEvent === 'function') { // IE
	utils.addListener = function (el, type, fn) {
		el.attachEvent('on' + type, fn);
	};
	utils.removeListener = function (el, type, fn) {
		el.detachEvent('on' + type, fn);
	};
}
else { // Older browsers.
	utils.addListener = function (el, type, fn) {
		el['on' + type] = fn;
	};
	utils.removeListener = function (el, type, fn) {
		el['on' + type] = fn;
	};
};