import {assert} from './lib/chai.js';
import {config, fetch, getNumFormatter, numStr, numStrT, numStrX} from '../common.mjs';

describe('common.mjs', function () {

	describe('fetch', function () {

		it('respond for a normal URL', async function () {
			const response = await fetch('../enemy.json');
			const data = await response.json();
			assert.strictEqual(data[0].i, 0);
			assert.strictEqual(data[0].name, '狗仔');
		});

		it('throw for an invalid URL', async function () {
			let hasThrown = false;
			try {
				await fetch('http://ex%23ample.com');
			} catch (ex) {
				hasThrown = true;
			}
			assert.isTrue(hasThrown, 'Error not thrown for an invalid URL');
		});

		it('throw for a bad response', async function () {
			let hasThrown = false;
			try {
				await fetch('!nonexist.html');
			} catch (ex) {
				hasThrown = true;
			}
			assert.isTrue(hasThrown, 'Error not thrown for a bad response');
		});

	});

	describe('config', function () {
		function withLocalStorage(name, callback) {
			const oldValue = localStorage.getItem(name);
			try {
				callback();
			} finally {
				if (oldValue !== null)
					localStorage.setItem(name, oldValue);
				else
					localStorage.removeItem(name);
			}
		}

		it('get config.unit', async function () {
			withLocalStorage('unit', () => {
				// default value
				localStorage.removeItem('unit');
				assert.strictEqual(config.unit, 'S');

				localStorage.setItem('unit', 'F');
				assert.strictEqual(config.unit, 'F');

				localStorage.setItem('unit', 'S');
				assert.strictEqual(config.unit, 'S');
			});
		});

		it('set config.unit', async function () {
			withLocalStorage('unit', () => {
				config.unit = 'F';
				assert.strictEqual(localStorage.getItem('unit'), 'F');

				config.unit = 'S';
				assert.strictEqual(localStorage.getItem('unit'), 'S');

				config.unit = null;
				assert.isNull(localStorage.getItem('unit'));
			});
		});

		it('get config.prec', async function () {
			withLocalStorage('prec', () => {
				// default value
				localStorage.removeItem('prec');
				assert.strictEqual(config.prec, 2);

				localStorage.setItem('prec', 4);
				assert.strictEqual(config.prec, 4);

				localStorage.setItem('prec', 2);
				assert.strictEqual(config.prec, 2);

				localStorage.setItem('prec', 1);
				assert.strictEqual(config.prec, 1);
			});
		});

		it('set config.prec', async function () {
			withLocalStorage('prec', () => {
				config.prec = 5;
				assert.strictEqual(localStorage.getItem('prec'), '5');

				config.prec = 1;
				assert.strictEqual(localStorage.getItem('prec'), '1');

				config.prec = null;
				assert.isNull(localStorage.getItem('prec'));
			});
		});

		it('get config.stagel', async function () {
			withLocalStorage('stagel', () => {
				localStorage.removeItem('stagel');
				assert.strictEqual(config.stagel, 0);

				localStorage.setItem('stagel', 0);
				assert.strictEqual(config.stagel, 0);

				localStorage.setItem('stagel', 1);
				assert.strictEqual(config.stagel, 1);

				localStorage.setItem('stagel', 2);
				assert.strictEqual(config.stagel, 2);
			});
		});

		it('set config.stagel', async function () {
			withLocalStorage('stagel', () => {
				config.stagel = 0;
				assert.strictEqual(localStorage.getItem('stagel'), '0');

				config.stagel = 2;
				assert.strictEqual(localStorage.getItem('stagel'), '2');

				config.stagel = null;
				assert.isNull(localStorage.getItem('stagel'));
			});
		});

		it('get config.stagef', async function () {
			withLocalStorage('stagef', () => {
				localStorage.removeItem('stagef');
				assert.strictEqual(config.stagef, 'F');

				localStorage.setItem('stagef', 'S');
				assert.strictEqual(config.stagef, 'S');

				localStorage.setItem('stagef', 'F');
				assert.strictEqual(config.stagef, 'F');
			});
		});

		it('set config.stagef', async function () {
			withLocalStorage('stagef', () => {
				config.stagef = 'F';
				assert.strictEqual(localStorage.getItem('stagef'), 'F');

				config.stagef = 'S';
				assert.strictEqual(localStorage.getItem('stagef'), 'S');

				config.stagef = null;
				assert.isNull(localStorage.getItem('stagef'));
			});
		});

		it('get config.layout', async function () {
			withLocalStorage('layout', () => {
				localStorage.removeItem('layout');
				assert.strictEqual(config.layout, 1);

				localStorage.setItem('layout', 2);
				assert.strictEqual(config.layout, 2);

				localStorage.setItem('layout', 1);
				assert.strictEqual(config.layout, 1);
			});
		});

		it('set config.layout', async function () {
			withLocalStorage('layout', () => {
				config.layout = 1;
				assert.strictEqual(localStorage.getItem('layout'), '1');

				config.layout = 2;
				assert.strictEqual(localStorage.getItem('layout'), '2');

				config.layout = null;
				assert.isNull(localStorage.getItem('layout'));
			});
		});

		it('get config.colorTheme', async function () {
			const prefIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			withLocalStorage('theme', () => {
				localStorage.removeItem('theme');
				assert.strictEqual(config.colorTheme, prefIsDark ? 'dark' : 'light');

				localStorage.setItem('theme', 'dark');
				assert.strictEqual(config.colorTheme, 'dark');

				localStorage.setItem('theme', 'light');
				assert.strictEqual(config.colorTheme, 'light');
			});
		});

		it('set config.colorTheme', async function () {
			withLocalStorage('theme', () => {
				config.colorTheme = 'light';
				assert.strictEqual(localStorage.getItem('theme'), 'light');

				config.colorTheme = 'dark';
				assert.strictEqual(localStorage.getItem('theme'), 'dark');

				config.colorTheme = null;
				assert.isNull(localStorage.getItem('theme'));
			});
		});

	});

	describe('getNumFormatter', function () {

		it('take default precision when param not provided', async function () {
			const _formatter = new Intl.NumberFormat(undefined, {
				'maximumFractionDigits': config.prec,
			});
			const formatter = getNumFormatter();
			assert.strictEqual(formatter.format(5), '5');
			assert.strictEqual(formatter.format(16384), '16,384');
			assert.strictEqual(formatter.format(Math.PI), _formatter.format(Math.PI));
		});

		it('take specified precision when param provided', async function () {
			const formatter = getNumFormatter(3);
			assert.strictEqual(formatter.format(5), '5');
			assert.strictEqual(formatter.format(16384), '16,384');
			assert.strictEqual(formatter.format(Math.PI), "3.142");
		});

	});

});
