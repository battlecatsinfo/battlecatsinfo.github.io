(function (global, factory) {
	global = typeof globalThis !== "undefined" ? globalThis : global || self;
	factory(global);
}(this, function (global) {
	'use strict';

	const siteSearchForm = document.getElementById('site-search');
	const siteSearchInput = siteSearchForm.querySelector('input');
	const siteSearchResult = document.getElementById('site-s-result');
	const siteSearchClear = document.getElementById('search-clear');
	const siteSearchOptions = Array.from(siteSearchResult.querySelectorAll('[data-search]'));
	const siteThemeAnchor = siteSearchForm.parentNode.previousElementSibling;
	let siteSearchIndex = -1;

	siteSearchForm.addEventListener('submit', onFormSubmit);
	siteSearchInput.addEventListener('focus', onInputFocus);
	siteSearchInput.addEventListener('blur', onInputBlur);
	siteSearchInput.addEventListener('input', onInputChange);
	siteSearchInput.addEventListener('keydown', onInputKeyDown);
	siteSearchClear.addEventListener('click', onClearClick);
	for (const elem of siteSearchOptions) {
		elem.addEventListener('click', onResultClick);
		elem.addEventListener('mouseenter', () => setSearchIndex(siteSearchOptions.indexOf(elem)));
	}
	syncClearButton();

	function onInputFocus(event) {
		siteSearchResult.hidden = false;
	}

	function onInputBlur(event) {
		setTimeout(function () {
			siteSearchResult.hidden = true;
		}, 500);
	}

	function onInputChange(event) {
		syncClearButton();
		setSearchIndex(-1);
	}

	function setSearchIndex(index) {
		siteSearchIndex = index;
		siteSearchOptions.forEach((elem, i) => {
			elem.classList.toggle('active', i === index);
		});
	}

	function onInputKeyDown(event) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			siteSearchResult.hidden = false;
			if (siteSearchIndex === -1)
				setSearchIndex(event.key === 'ArrowDown' ? 0 : siteSearchOptions.length - 1);
			else {
				const offset = event.key === 'ArrowDown' ? 1 : -1;
				setSearchIndex((siteSearchIndex + offset + siteSearchOptions.length) % siteSearchOptions.length);
			}
		} else if (event.key === 'Enter' && siteSearchIndex >= 0) {
			event.preventDefault();
			onResultClick({currentTarget: siteSearchOptions[siteSearchIndex]});
		} else if (event.key === 'Escape') {
			siteSearchResult.hidden = true;
			setSearchIndex(-1);
		}
	}

	function syncClearButton() {
		siteSearchClear.hidden = !siteSearchInput.value;
	}

	function onClearClick(event) {
		siteSearchInput.value = '';
		syncClearButton();
		setSearchIndex(-1);
		siteSearchInput.focus();
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

	(async () => {
		const {toggleTheme} = await import('./common.mjs');
		siteThemeAnchor.addEventListener('click', () => toggleTheme());
	})();

}));
