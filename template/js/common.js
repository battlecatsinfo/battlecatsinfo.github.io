(function (global, factory) {
	global = typeof globalThis !== "undefined" ? globalThis : global || self;
	factory(global.utils);
}(this, function (utils) {
	'use strict';

	utils.toggleTheme(utils.getTheme());

}));
