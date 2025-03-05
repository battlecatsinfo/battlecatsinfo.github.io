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

	// i18n
	(function () {
		var supportedLanguages = ['zh', 'en', 'ja'];
		var translations = {};

		var currentLang = localStorage.getItem('lang');
		if (!supportedLanguages.includes(currentLang)) {
			var browserLang = navigator.languages.find(function (lang) {
				return lang.startsWith('zh');
			}) ? 'zh' :
			navigator.languages.find(function (lang) {
				return lang.startsWith('en');
			}) ? 'en' :
			navigator.languages.find(function (lang) {
				return lang.startsWith('ja');
			}) ? 'ja' : 'en';
			currentLang = browserLang;
			localStorage.setItem('lang', currentLang);
		}

		function t(key) {
			return translations[key] || key;
		}

		function loadTranslations(lang, callback) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', '/i18n_' + lang + '.json', true);
			xhr.onload = function () {
				if (xhr.status === 200) {
					translations = JSON.parse(xhr.responseText);
					callback();
				} else {
					console.error('Failed to load translations for ' + lang);
					translations = {};
					callback();
				}
			};
			xhr.onerror = function () {
				console.error('Error fetching translations for ' + lang);
				translations = {};
				callback();
			};
			xhr.send();
		}

		function applyTranslations() {
			var elements = document.querySelectorAll('[data-i18n]');
			for (var i = 0; i < elements.length; i++) {
				var key = elements[i].getAttribute('data-i18n');
				elements[i].textContent = t(key);
			}

			var attrElements = document.querySelectorAll('[data-i18n-attrs]');
			for (var j = 0; j < attrElements.length; j++) {
				var attrs = attrElements[j].getAttribute('data-i18n-attrs').split(',');
				for (var k = 0; k < attrs.length; k++) {
					var pair = attrs[k].split(':');
					var attrName = pair[0].trim();
					var key = pair[1].trim();
					attrElements[j].setAttribute(attrName, t(key));
				}
			}
		}

		function setLanguage(lang) {
			if (!supportedLanguages.includes(lang)) {
				lang = 'en';
			}
			localStorage.setItem('lang', lang);
			currentLang = lang;
			loadTranslations(lang, applyTranslations);
		}

		// i18n init
		loadTranslations(currentLang, function () {
			applyTranslations();

			var languageSelect = document.getElementById('language-select');
			if (languageSelect) {
				languageSelect.value = currentLang;
				languageSelect.addEventListener('change', function () {
					setLanguage(languageSelect.value);
				});
			}
		});

		window.t = t;
		window.setLanguage = setLanguage;
		window.currentLang = currentLang;
	})();
}));