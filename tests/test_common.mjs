import {assert} from './lib/chai.js';
import sinon from './lib/sinon-esm.js';
import {config, fetch, getNumFormatter, round, pagination} from '../common.mjs';

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
		const _localStorage = Object.getPrototypeOf(localStorage);
		let getItemStub;
		let setItemStub;
		let removeItemStub;
		let matchMediaStub;

		beforeEach(function() {
			getItemStub = sinon.stub(_localStorage, 'getItem');
			setItemStub = sinon.stub(_localStorage, 'setItem');
			removeItemStub = sinon.stub(_localStorage, 'removeItem');
			matchMediaStub = sinon.stub(window, 'matchMedia');
		});

		afterEach(function() {
			getItemStub.restore();
			setItemStub.restore();
			removeItemStub.restore();
			matchMediaStub.restore();
		});

		it('get config.unit', function () {
			getItemStub.withArgs('unit').returns(null);
			assert.strictEqual(config.unit, 'S');

			getItemStub.withArgs('unit').returns('F');
			assert.strictEqual(config.unit, 'F');

			getItemStub.withArgs('unit').returns('S');
			assert.strictEqual(config.unit, 'S');
		});

		it('set config.unit', function () {
			config.unit = 'F';
			assert.deepEqual(setItemStub.lastCall.args, ['unit', 'F']);

			config.unit = 'S';
			assert.deepEqual(setItemStub.lastCall.args, ['unit', 'S']);

			config.unit = null;
			assert.deepEqual(removeItemStub.lastCall.args, ['unit']);
		});

		it('get config.prec', function () {
			getItemStub.withArgs('prec').returns(null);
			assert.strictEqual(config.prec, 2);

			getItemStub.withArgs('prec').returns('4');
			assert.strictEqual(config.prec, 4);

			getItemStub.withArgs('prec').returns('2');
			assert.strictEqual(config.prec, 2);

			getItemStub.withArgs('prec').returns('1');
			assert.strictEqual(config.prec, 1);
		});

		it('set config.prec', function () {
			config.prec = 5;
			assert.deepEqual(setItemStub.lastCall.args, ['prec', 5]);

			config.prec = 1;
			assert.deepEqual(setItemStub.lastCall.args, ['prec', 1]);

			config.prec = null;
			assert.deepEqual(removeItemStub.lastCall.args, ['prec']);
		});

		it('get config.stagel', function () {
			getItemStub.withArgs('stagel').returns(null);
			assert.strictEqual(config.stagel, 0);

			getItemStub.withArgs('stagel').returns('0');
			assert.strictEqual(config.stagel, 0);

			getItemStub.withArgs('stagel').returns('1');
			assert.strictEqual(config.stagel, 1);

			getItemStub.withArgs('stagel').returns('2');
			assert.strictEqual(config.stagel, 2);
		});

		it('set config.stagel', function () {
			config.stagel = 0;
			assert.deepEqual(setItemStub.lastCall.args, ['stagel', 0]);

			config.stagel = 2;
			assert.deepEqual(setItemStub.lastCall.args, ['stagel', 2]);

			config.stagel = null;
			assert.deepEqual(removeItemStub.lastCall.args, ['stagel']);
		});

		it('get config.stagef', function () {
			getItemStub.withArgs('stagef').returns(null);
			assert.strictEqual(config.stagef, 'F');

			getItemStub.withArgs('stagef').returns('S');
			assert.strictEqual(config.stagef, 'S');

			getItemStub.withArgs('stagef').returns('F');
			assert.strictEqual(config.stagef, 'F');
		});

		it('set config.stagef', function () {
			config.stagef = 'F';
			assert.deepEqual(setItemStub.lastCall.args, ['stagef', 'F']);

			config.stagef = 'S';
			assert.deepEqual(setItemStub.lastCall.args, ['stagef', 'S']);

			config.stagef = null;
			assert.deepEqual(removeItemStub.lastCall.args, ['stagef']);
		});

		it('get config.layout', function () {
			getItemStub.withArgs('layout').returns(null);
			assert.strictEqual(config.layout, 1);

			getItemStub.withArgs('layout').returns('2');
			assert.strictEqual(config.layout, 2);

			getItemStub.withArgs('layout').returns('1');
			assert.strictEqual(config.layout, 1);
		});

		it('set config.layout', function () {
			config.layout = 1;
			assert.deepEqual(setItemStub.lastCall.args, ['layout', 1]);

			config.layout = 2;
			assert.deepEqual(setItemStub.lastCall.args, ['layout', 2]);

			config.layout = null;
			assert.deepEqual(removeItemStub.lastCall.args, ['layout']);
		});

		it('get config.colorTheme', function () {
			matchMediaStub.withArgs('(prefers-color-scheme: dark)').returns({matches: true});
			getItemStub.withArgs('theme').returns(null);
			assert.strictEqual(config.colorTheme, 'dark');

			matchMediaStub.withArgs('(prefers-color-scheme: dark)').returns({matches: false});
			getItemStub.withArgs('theme').returns(null);
			assert.strictEqual(config.colorTheme, 'light');

			getItemStub.withArgs('theme').returns('dark');
			assert.strictEqual(config.colorTheme, 'dark');

			getItemStub.withArgs('theme').returns('light');
			assert.strictEqual(config.colorTheme, 'light');
		});

		it('set config.colorTheme', function () {
			config.colorTheme = 'light';
			assert.deepEqual(setItemStub.lastCall.args, ['theme', 'light']);

			config.colorTheme = 'dark';
			assert.deepEqual(setItemStub.lastCall.args, ['theme', 'dark']);

			config.colorTheme = null;
			assert.deepEqual(removeItemStub.lastCall.args, ['theme']);
		});

		it('get config.starCats', function () {
			getItemStub.withArgs('star-cats').returns(null);
			assert.deepEqual(config.starCats, []);

			getItemStub.withArgs('star-cats').returns(JSON.stringify([
				{id: 0, name: "貓咪", icon:"/img/u/0/0.png"},
				{id: 4, name: "牛貓", icon:"/img/u/4/0.png"},
			]));
			assert.deepEqual(config.starCats, [
				{id: 0, name: "貓咪", icon:"/img/u/0/0.png"},
				{id: 4, name: "牛貓", icon:"/img/u/4/0.png"},
			]);

			getItemStub.withArgs('star-cats').returns(JSON.stringify([]));
			assert.deepEqual(config.starCats, []);
		});

		it('set config.starCats', function () {
			config.starCats = [
				{id: 0, name: "貓咪", icon:"/img/u/0/0.png"},
				{id: 3, name: "噁心貓", icon:"/img/u/3/0.png"},
				{id: 4, name: "牛貓", icon:"/img/u/4/0.png"},
			];
			assert.deepEqual(setItemStub.lastCall.args, [
				'star-cats',
				JSON.stringify([
					{id: 0, name: "貓咪", icon:"/img/u/0/0.png"},
					{id: 3, name: "噁心貓", icon:"/img/u/3/0.png"},
					{id: 4, name: "牛貓", icon:"/img/u/4/0.png"},
				]),
			]);

			config.starCats = null;
			assert.deepEqual(removeItemStub.lastCall.args, ['star-cats']);
		});

		it('config.getTreasure', function () {
			getItemStub.withArgs('t$0').returns(null);
			assert.strictEqual(config.getTreasure(0), 300);

			getItemStub.withArgs('t$0').returns('0');
			assert.strictEqual(config.getTreasure(0), 0);

			getItemStub.withArgs('t$0').returns('200');
			assert.strictEqual(config.getTreasure(0), 200);

			getItemStub.withArgs('t$30').returns(null);
			assert.strictEqual(config.getTreasure(30), 100);

			getItemStub.withArgs('t$30').returns('0');
			assert.strictEqual(config.getTreasure(30), 0);

			getItemStub.withArgs('t$30').returns('50');
			assert.strictEqual(config.getTreasure(30), 50);
		});

		it('config.setTreasure', function () {
			config.setTreasure(0, 100);
			assert.deepEqual(setItemStub.lastCall.args, ['t$0', 100]);

			config.setTreasure(0, 0);
			assert.deepEqual(setItemStub.lastCall.args, ['t$0', 0]);

			config.setTreasure(0, null);
			assert.deepEqual(removeItemStub.lastCall.args, ['t$0']);

			config.setTreasure(30, 50);
			assert.deepEqual(setItemStub.lastCall.args, ['t$30', 50]);

			config.setTreasure(30, 0);
			assert.deepEqual(setItemStub.lastCall.args, ['t$30', 0]);

			config.setTreasure(30, null);
			assert.deepEqual(removeItemStub.lastCall.args, ['t$30']);
		});

		it('config.getTreasures', function () {
			const keys = Array.from({length: 31}, (_, i) => `t$${i}`);

			keys.forEach((key) => {
				getItemStub.withArgs(key).returns(null);
			});
			assert.deepEqual(config.getTreasures().slice(0, 5), [300, 300, 300, 300, 300]);

			getItemStub.withArgs('t$0').returns('0');
			getItemStub.withArgs('t$1').returns('25');
			getItemStub.withArgs('t$2').returns('50');
			getItemStub.withArgs('t$3').returns('75');
			assert.deepEqual(config.getTreasures().slice(0, 5), [0, 25, 50, 75, 300]);
		});

		it('config.setTreasures', function () {
			const keys = Array.from({length: 31}, (_, i) => `t$${i}`);

			config.setTreasures([0, 25, 50, 75, 100]);
			assert.deepEqual(setItemStub.args, [
				['t$0', 0],
				['t$1', 25],
				['t$2', 50],
				['t$3', 75],
				['t$4', 100],
			]);

			config.setTreasures([null, null, null, null, null]);
			assert.deepEqual(removeItemStub.args, [
				['t$0'],
				['t$1'],
				['t$2'],
				['t$3'],
				['t$4'],
			]);
		});

		it('config.getDefaultTreasures', function () {
			var d1 = config.getDefaultTreasures();
			var d2 = config.getDefaultTreasures();
			assert.deepEqual(
				d1,
				[300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 30, 10, 30, 30, 30, 30, 30, 30, 30, 100, 600, 1500, 300, 100, 30, 300, 300, 300, 300, 100]
			);
			assert.deepEqual(d1, d2);
			assert.notStrictEqual(d1, d2);
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

	describe('round', function () {

		it('basic', function () {
			assert.strictEqual(round(1.2), 1);
			assert.strictEqual(round(1.49), 1);
			assert.strictEqual(round(1.5), 2);
			assert.strictEqual(round(1.6), 2);
		});

		it('with decimals specified', function () {
			assert.strictEqual(round(1.0049, 2), 1.00);
			assert.strictEqual(round(1.005, 2), 1.01);

			assert.strictEqual(round(10049, -2), 10000);
			assert.strictEqual(round(10050, -2), 10100);
		});

	});

	describe('pagination', function () {

		it('show page and up to adjacentPages at both sides', function () {
			assert.deepEqual(pagination({
				page: 6, max: 11,
			}), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

			assert.deepEqual(pagination({
				page: 3, max: 6,
			}), [1, 2, 3, 4, 5, 6]);

			assert.deepEqual(pagination({
				page: 1, max: 1,
			}), [1]);
		});

		it('show first and last page if not all pages are shown and jump == true (default)', function () {
			assert.deepEqual(pagination({
				page: 6, max: 15,
			}), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15]);

			assert.deepEqual(pagination({
				page: 10, max: 15,
			}), [1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

			assert.deepEqual(pagination({
				page: 6, max: 15, jump: false,
			}), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

			assert.deepEqual(pagination({
				page: 10, max: 15, jump: false,
			}), [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

			// custom adjacentPages
			assert.deepEqual(pagination({
				page: 6, max: 15, adjacentPages: 3,
			}), [1, 4, 5, 6, 7, 8, 15]);

			assert.deepEqual(pagination({
				page: 6, max: 15, adjacentPages: 1,
			}), [1, 6, 15]);
		});

		it('add pages at another side if shown pages < displayPages because page is close to start/end', function () {
			assert.deepEqual(pagination({
				page: 1, max: 10,
			}), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

			assert.deepEqual(pagination({
				page: 1, max: 11,
			}), [1, 2, 3, 4, 5, 6, 7, 8, 9, 11]);

			assert.deepEqual(pagination({
				page: 9, max: 10,
			}), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

			assert.deepEqual(pagination({
				page: 9, max: 11,
			}), [1, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

			// larger displayPages
			assert.deepEqual(pagination({
				page: 1, max: 10,
			}), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

			assert.deepEqual(pagination({
				page: 1, max: 11,
			}), [1, 2, 3, 4, 5, 6, 7, 8, 9, 11]);

			assert.deepEqual(pagination({
				page: 9, max: 10,
			}), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

			assert.deepEqual(pagination({
				page: 9, max: 11,
			}), [1, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

			// smaller displayPages
			assert.deepEqual(pagination({
				page: 1, max: 10, displayPages: 8,
			}), [1, 2, 3, 4, 5, 6, 7, 10]);

			assert.deepEqual(pagination({
				page: 10, max: 10, displayPages: 8,
			}), [1, 4, 5, 6, 7, 8, 9, 10]);

			// show normally if shown pages not < displayPages
			assert.deepEqual(pagination({
				page: 1, max: 10, displayPages: 5,
			}), [1, 2, 3, 4, 5, 10]);

			assert.deepEqual(pagination({
				page: 10, max: 10, displayPages: 5,
			}), [1, 6, 7, 8, 9, 10]);

			assert.deepEqual(pagination({
				page: 1, max: 10, displayPages: 4,
			}), [1, 2, 3, 4, 5, 10]);

			assert.deepEqual(pagination({
				page: 10, max: 10, displayPages: 4,
			}), [1, 6, 7, 8, 9, 10]);
		});

		it('treat displayPages as page with adjacentPages if null', function () {
			assert.deepEqual(pagination({
				page: 1, max: 15, displayPages: null,
			}), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15]);
		});

	});

});
