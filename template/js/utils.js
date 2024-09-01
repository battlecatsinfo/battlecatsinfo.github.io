(function (global, factory) {
	global = typeof globalThis !== "undefined" ? globalThis : global || self;
	global.utils = factory();
}(this, function () {
	'use strict';

	function getTheme() {
		let value = localStorage.getItem('theme');
		if (!value) {
			value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		return value;
	}

	function toggleTheme(newValue) {
		if (!newValue) {
			newValue = (getTheme() === 'dark') ? 'light' : 'dark';
		}
		document.documentElement.classList[newValue === 'dark' ? 'add' : 'remove']('dark');
		localStorage.setItem('theme', newValue);
	}

	function getNumberFormatter() {
		let value = localStorage.getItem('prec');
		value = (value !== null) ? parseInt(value, 10) : 2;
		return new Intl.NumberFormat(undefined, {
			'maximumFractionDigits': value,
		});
	}

	function getDurationUnit() {
		return localStorage.getItem("unit");
	}

	const utils = {
		get numberFormatter() {
			const value = getNumberFormatter();
			Object.defineProperty(this, 'numberFormatter', {value});
			return value;
		},

		get durationUnit() {
			const value = getDurationUnit();
			Object.defineProperty(this, 'durationUnit', {value});
			return value;
		},

		numStr(num) {
			return this.numberFormatter.format(num);
		},

		async fetch(url, options) {
			const response = await fetch(url, options).catch(ex => {
				throw new Error(`Unable to fetch "${url}": ${ex.message}`);
			});
			if (!response.ok) {
				throw new Error(`Bad rsponse when fetching "${url}": ${response.status} ${response.statusText}`, {cause: response});
			}
			return response;
		},

		getTheme,
		toggleTheme,
	};

	return utils;

}));
