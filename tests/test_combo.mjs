import {assert} from './lib/chai.js';
import {dbGetAll, dbClear, dbDelete} from './common.mjs';
import * as Common from '../common.mjs';
import * as Combo from '../combo.mjs';

describe('combo.mjs', function () {

	describe('loadCombo', function () {

		it('basic', async function () {
			async function test() {
				var combo = await Combo.loadCombo(0);
				assert.deepEqual(combo, ["貓咪軍團",4,0,[[0,0],[1,0],[2,0],[3,0],[4,0]],1]);
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'combo');
			await test();

			// data stored
			await test();
		});

	});

	describe('loadAllCombos', function () {

		it('basic', async function () {
			async function test() {
				var combos = await Combo.loadAllCombos();
				assert.deepEqual(combos.slice(0, 3), [
					["貓咪軍團",4,0,[[0,0],[1,0],[2,0],[3,0],[4,0]],1],
					["下班後的樂趣",6,0,[[13,0],[12,0]],1],
					["大鯨捕獲祭",10,0,[[51,1],[6,1]],1],
				]);
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'combo');
			await test();

			// data stored
			await test();
		});

		it('with params', async function () {
			async function test() {
				var combos = await Combo.loadAllCombos(IDBKeyRange.bound(2, 10), 2);
				assert.deepEqual(combos, [
					["大鯨捕獲祭",10,0,[[51,1],[6,1]],1],
					["DeathRock",3,0,[[19,0],[148,0]],1],
				]);
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'combo');
			await test();

			// data stored
			await test();
		});

	});

	describe('forEachCombo', function () {

		it('basic', async function () {
			async function test() {
				var combos = [];
				for await (const combo of Combo.forEachCombo()) {
					combos.push(combo);
					if (combos.length >= 10) { break; }
				}
				assert.strictEqual(combos.length, 10);
				assert.deepEqual(combos.slice(1, 4), [
					["下班後的樂趣",6,0,[[13,0],[12,0]],1],
					["大鯨捕獲祭",10,0,[[51,1],[6,1]],1],
					["DeathRock",3,0,[[19,0],[148,0]],1],
				]);
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'combo');
			await test();

			// data stored
			await test();
		});

		it('with params', async function () {
			async function test() {
				var combos = [];
				for await (const combo of Combo.forEachCombo(IDBKeyRange.bound(2, 3), 'prev')) {
					combos.push(combo);
				}
				assert.deepEqual(combos, [
					["DeathRock",3,0,[[19,0],[148,0]],1],
					["大鯨捕獲祭",10,0,[[51,1],[6,1]],1],
				]);
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'combo');
			await test();

			// data stored
			await test();
		});

	});

});
