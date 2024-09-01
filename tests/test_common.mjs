import {assert} from './lib/chai.js';
import {config, fetch, getNumFormatter} from '../common.mjs';

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

		it('get config.unit', function () {
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

		it('set config.unit', function () {
			withLocalStorage('unit', () => {
				config.unit = 'F';
				assert.strictEqual(localStorage.getItem('unit'), 'F');

				config.unit = 'S';
				assert.strictEqual(localStorage.getItem('unit'), 'S');

				config.unit = null;
				assert.isNull(localStorage.getItem('unit'));
			});
		});

		it('get config.prec', function () {
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

		it('set config.prec', function () {
			withLocalStorage('prec', () => {
				config.prec = 5;
				assert.strictEqual(localStorage.getItem('prec'), '5');

				config.prec = 1;
				assert.strictEqual(localStorage.getItem('prec'), '1');

				config.prec = null;
				assert.isNull(localStorage.getItem('prec'));
			});
		});

	});

	describe('getNumFormatter', function () {

		it('take default precision when param not provided', function () {
			const _formatter = new Intl.NumberFormat(undefined, {
				'maximumFractionDigits': config.prec,
			});
			const formatter = getNumFormatter();
			assert.strictEqual(formatter.format(5), '5');
			assert.strictEqual(formatter.format(16384), '16,384');
			assert.strictEqual(formatter.format(Math.PI), _formatter.format(Math.PI));
		});

		it('take specified precision when param provided', function () {
			const formatter = getNumFormatter(3);
			assert.strictEqual(formatter.format(5), '5');
			assert.strictEqual(formatter.format(16384), '16,384');
			assert.strictEqual(formatter.format(Math.PI), "3.142");
		});

	});

});
