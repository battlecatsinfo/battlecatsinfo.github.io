import {assert} from './lib/chai.js';
import {dbGet, dbCount, dbClear, dbDelete} from './common.mjs';
import * as Common from '../common.mjs';
import * as Stage from '../stage.mjs';

describe('stage.mjs', function () {

	describe('getMap', function () {

		it('basic', async function () {
			async function test() {
				var map = await Stage.getMap(0);
				assert.strictEqual(map.id, 0);
				assert.strictEqual(map.name, "傳說的開始");
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'map');
			await test();

			// data stored
			await test();
		});

	});

	describe('getStage', function () {

		it('basic', async function () {
			async function test() {
				var stage = await Stage.getStage(0);
				assert.strictEqual(stage.id, 0);
				assert.strictEqual(stage.name, "天搖地動");
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'stage');
			await test();

			// data stored
			await test();
		});

	});

	describe('forEachMap', function () {

		it('basic', async function () {
			async function test() {
				var maps = [];
				for await (const map of Stage.forEachMap()) {
					maps.push(map);
					if (maps.length >= 10) { break; }
				}

				assert.strictEqual(maps.length, 10);
				assert.strictEqual(maps[0].id, 0);
				assert.strictEqual(maps[0].name, "傳說的開始");
				assert.strictEqual(maps[1].id, 1);
				assert.strictEqual(maps[1].name, "熱情的國家");
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'map');
			await test();

			// data stored
			await test();
		});

		it('with params', async function () {
			async function test() {
				var maps = [];
				for await (const map of Stage.forEachMap(IDBKeyRange.bound(3, 5), 'prev')) {
					maps.push(map);
				}

				assert.strictEqual(maps.length, 3);
				assert.strictEqual(maps[0].id, 5);
				assert.strictEqual(maps[0].name, "西方街道");
				assert.strictEqual(maps[1].id, 4);
				assert.strictEqual(maps[1].name, "凝視著貓眼石");
				assert.strictEqual(maps[2].id, 3);
				assert.strictEqual(maps[2].name, "貓咪們渡海");
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'map');
			await test();

			// data stored
			await test();
		});

	});

	describe('forEachStage', function () {

		it('basic', async function () {
			async function test() {
				var stages = [];
				for await (const stage of Stage.forEachStage()) {
					stages.push(stage);
					if (stages.length >= 10) { break; }
				}

				assert.strictEqual(stages.length, 10);
				assert.strictEqual(stages[0].id, 0);
				assert.strictEqual(stages[0].name, "天搖地動");
				assert.strictEqual(stages[1].id, 1);
				assert.strictEqual(stages[1].name, "恐怖再現");
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'stage');
			await test();

			// data stored
			await test();
		});

		it('with params', async function () {
			async function test() {
				var stages = [];
				for await (const stage of Stage.forEachStage(IDBKeyRange.bound(3, 5), 'prev')) {
					stages.push(stage);
				}

				assert.strictEqual(stages.length, 3);
				assert.strictEqual(stages[0].id, 5);
				assert.strictEqual(stages[0].name, "愛意眼神");
				assert.strictEqual(stages[1].id, 4);
				assert.strictEqual(stages[1].name, "碰碰廣場");
				assert.strictEqual(stages[2].id, 3);
				assert.strictEqual(stages[2].name, "憂鬱濕地");
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'stage');
			await test();

			// data stored
			await test();
		});

	});

});
