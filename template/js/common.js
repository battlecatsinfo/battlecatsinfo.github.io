(function (global, factory) {
	global = typeof globalThis !== "undefined" ? globalThis : global || self;
	factory();
}(this, function () {
	'use strict';

	// apply color theme to the page
	(async () => {
		const {config, toggleTheme} = await import('./common.mjs');
		toggleTheme(config.colorTheme);
	})();

}));
