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
		function withLocalStorage(names, callback) {
			if (!Array.isArray(names)) {
				names = [names];
			}
			const oldValues = names.map(name => localStorage.getItem(name));
			try {
				callback();
			} finally {
				names.forEach((name, i) => {
					const oldValue = oldValues[i];
					if (oldValue !== null)
						localStorage.setItem(name, oldValue);
					else
						localStorage.removeItem(name);
				});
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

		it('get config.stagel', function () {
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

		it('set config.stagel', function () {
			withLocalStorage('stagel', () => {
				config.stagel = 0;
				assert.strictEqual(localStorage.getItem('stagel'), '0');

				config.stagel = 2;
				assert.strictEqual(localStorage.getItem('stagel'), '2');

				config.stagel = null;
				assert.isNull(localStorage.getItem('stagel'));
			});
		});

		it('get config.stagef', function () {
			withLocalStorage('stagef', () => {
				localStorage.removeItem('stagef');
				assert.strictEqual(config.stagef, 'F');

				localStorage.setItem('stagef', 'S');
				assert.strictEqual(config.stagef, 'S');

				localStorage.setItem('stagef', 'F');
				assert.strictEqual(config.stagef, 'F');
			});
		});

		it('set config.stagef', function () {
			withLocalStorage('stagef', () => {
				config.stagef = 'F';
				assert.strictEqual(localStorage.getItem('stagef'), 'F');

				config.stagef = 'S';
				assert.strictEqual(localStorage.getItem('stagef'), 'S');

				config.stagef = null;
				assert.isNull(localStorage.getItem('stagef'));
			});
		});

		it('get config.layout', function () {
			withLocalStorage('layout', () => {
				localStorage.removeItem('layout');
				assert.strictEqual(config.layout, 1);

				localStorage.setItem('layout', 2);
				assert.strictEqual(config.layout, 2);

				localStorage.setItem('layout', 1);
				assert.strictEqual(config.layout, 1);
			});
		});

		it('set config.layout', function () {
			withLocalStorage('layout', () => {
				config.layout = 1;
				assert.strictEqual(localStorage.getItem('layout'), '1');

				config.layout = 2;
				assert.strictEqual(localStorage.getItem('layout'), '2');

				config.layout = null;
				assert.isNull(localStorage.getItem('layout'));
			});
		});

		it('get config.colorTheme', function () {
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

		it('set config.colorTheme', function () {
			withLocalStorage('theme', () => {
				config.colorTheme = 'light';
				assert.strictEqual(localStorage.getItem('theme'), 'light');

				config.colorTheme = 'dark';
				assert.strictEqual(localStorage.getItem('theme'), 'dark');

				config.colorTheme = null;
				assert.isNull(localStorage.getItem('theme'));
			});
		});

		it('get config.starCats', function () {
			withLocalStorage('star-cats', () => {
				localStorage.removeItem('star-cats');
				assert.deepEqual(config.starCats, []);

				localStorage.setItem('star-cats', JSON.stringify([
					{id: 0, name: "貓咪", icon:"/img/u/0/0.png"},
					{id: 4, name: "牛貓", icon:"/img/u/4/0.png"},
				]));
				assert.deepEqual(config.starCats, [
					{id: 0, name: "貓咪", icon:"/img/u/0/0.png"},
					{id: 4, name: "牛貓", icon:"/img/u/4/0.png"},
				]);

				localStorage.setItem('star-cats', JSON.stringify([]));
				assert.deepEqual(config.starCats, []);
			});
		});

		it('set config.starCats', function () {
			withLocalStorage('star-cats', () => {
				config.starCats = [
					{id: 0, name: "貓咪", icon:"/img/u/0/0.png"},
					{id: 3, name: "噁心貓", icon:"/img/u/3/0.png"},
					{id: 4, name: "牛貓", icon:"/img/u/4/0.png"},
				];
				assert.strictEqual(localStorage.getItem('star-cats'), JSON.stringify([
					{id: 0, name: "貓咪", icon:"/img/u/0/0.png"},
					{id: 3, name: "噁心貓", icon:"/img/u/3/0.png"},
					{id: 4, name: "牛貓", icon:"/img/u/4/0.png"},
				]));

				config.starCats = null;
				assert.isNull(localStorage.getItem('star-cats'));
			});
		});

		it('config.getTreasure', function () {
			withLocalStorage('t$0', () => {
				localStorage.removeItem('t$0');
				assert.strictEqual(config.getTreasure(0), 300);

				localStorage.setItem('t$0', 0);
				assert.strictEqual(config.getTreasure(0), 0);

				localStorage.setItem('t$0', 200);
				assert.strictEqual(config.getTreasure(0), 200);
			});

			withLocalStorage('t$30', () => {
				localStorage.removeItem('t$30');
				assert.strictEqual(config.getTreasure(30), 100);

				localStorage.setItem('t$30', 0);
				assert.strictEqual(config.getTreasure(30), 0);

				localStorage.setItem('t$30', 50);
				assert.strictEqual(config.getTreasure(30), 50);
			});
		});

		it('config.setTreasure', function () {
			withLocalStorage('t$0', () => {
				config.setTreasure(0, 100);
				assert.strictEqual(localStorage.getItem('t$0'), '100');

				config.setTreasure(0, 0);
				assert.strictEqual(localStorage.getItem('t$0'), '0');

				config.setTreasure(0, null);
				assert.isNull(localStorage.getItem('t$0'));
			});

			withLocalStorage('t$30', () => {
				config.setTreasure(30, 50);
				assert.strictEqual(localStorage.getItem('t$30'), '50');

				config.setTreasure(30, 0);
				assert.strictEqual(localStorage.getItem('t$30'), '0');

				config.setTreasure(30, null);
				assert.isNull(localStorage.getItem('t$30'));
			});
		});

		it('config.getTreasures', function () {
			const keys = Array.from({length: 31}, (_, i) => `t$${i}`);
			withLocalStorage(keys, () => {
				keys.forEach((key) => localStorage.removeItem(key));
				assert.deepEqual(config.getTreasures().slice(0, 5), [300, 300, 300, 300, 300]);

				localStorage.setItem('t$0', 0);
				localStorage.setItem('t$1', 25);
				localStorage.setItem('t$2', 50);
				localStorage.setItem('t$3', 75);
				assert.deepEqual(config.getTreasures().slice(0, 5), [0, 25, 50, 75, 300]);
			});
		});

		it('config.setTreasures', function () {
			const keys = Array.from({length: 31}, (_, i) => `t$${i}`);
			withLocalStorage(keys, () => {
				config.setTreasures([0, 25, 50, 75, 100]);
				assert.deepEqual(config.getTreasures().slice(0, 5), [0, 25, 50, 75, 100]);

				config.setTreasures([null, null, null, null, null]);
				assert.deepEqual(config.getTreasures().slice(0, 5), [300, 300, 300, 300, 300]);
			});
		});

		it('config.getDefaultTreasures', function () {
			assert.deepEqual(
				config.getDefaultTreasures(),
				[300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 30, 10, 30, 30, 30, 30, 30, 30, 30, 100, 600, 1500, 300, 100, 30, 300, 300, 300, 300, 100]
			);

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
