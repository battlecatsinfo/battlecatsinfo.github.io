(function (global, factory) {
	global = typeof globalThis !== "undefined" ? globalThis : global || self;
	Object.assign(global, factory());
}(this, function () {
	'use strict';

	const siteSearchForm = document.getElementById('site-search');
	const siteSearchInput = siteSearchForm.querySelector('input');
	const siteSearchResult = document.getElementById('site-s-result');

	siteSearchForm.addEventListener('submit', onFormSubmit);
	siteSearchInput.addEventListener('focus', onInputFocus);
	siteSearchInput.addEventListener('blur', onInputBlur);
	for (const elem of siteSearchResult.querySelectorAll('[data-search]')) {
		elem.addEventListener('click', onResultClick);
	}

	function onInputFocus(event) {
		siteSearchResult.hidden = false;
	}

	function onInputBlur(event) {
		setTimeout(function() {
			siteSearchResult.hidden = true;
		}, 500);
	}

	function onResultClick(event) {
		const elem = event.currentTarget;
		const url = elem.dataset.search + '?q=' + encodeURIComponent(siteSearchInput.value);
		location.assign(url);
	}

	function onFormSubmit(event) {
		event.preventDefault();
		let value = siteSearchInput.value;
		if (!value)
			return false;
		if (location.pathname.startsWith('/enemy') || location.pathname.startsWith('/esearch'))
			value = '/esearch.html?q=' + encodeURIComponent(value);
		else if (location.pathname.startsWith('/stage'))
			value = '/stage.html?q=' + encodeURIComponent(value);
		else
			value = '/search.html?q=' + encodeURIComponent(value);
		location.assign(value);
	}

}));
