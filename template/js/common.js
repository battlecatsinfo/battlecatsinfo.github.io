(function (global, factory) {
	global = typeof globalThis !== "undefined" ? globalThis : global || self;
	factory(global);
}(this, function (global) {
	'use strict';

	// apply color theme to the page
	(async () => {
		const {config, toggleTheme} = await import('./common.mjs');
		toggleTheme(config.colorTheme);
	})();

	navigator.serviceWorker.register('/sw.js');
}));
