import {assert} from './lib/chai.js';
import {dbGet, dbCount, dbClear, dbDelete} from './common.mjs';
import * as Stage from '../stage.mjs';

describe('stage.mjs', function () {

	describe('loadStageData', function () {

		it('check if stage data can be loaded and stored', async function () {
			async function test() {
				await Stage.loadStageData();

				var map = await dbGet(Stage.DB_NAME, Stage.DB_VERSION, 'map', 0);
				assert.strictEqual(map.id, 0);
				assert.strictEqual(map.name, "傳說的開始");

				var stage = await dbGet(Stage.DB_NAME, Stage.DB_VERSION, 'stage', 0);
				assert.strictEqual(stage.id, 0);
				assert.strictEqual(stage.name, "天搖地動");
			}

			// IDB not exist
			await dbDelete(Stage.DB_NAME);
			await test();

			// data not stored
			await dbClear(Stage.DB_NAME, Stage.DB_VERSION, 'map');
			await dbClear(Stage.DB_NAME, Stage.DB_VERSION, 'stage');
			await dbClear(Stage.DB_NAME, Stage.DB_VERSION, 'extra');
			await test();
		});

	});

	describe('getStageExtra', function () {

		it('load all', async function () {
			await Stage.loadStageData();
			const extra = await Stage.getStageExtra();
			assert.isObject(extra.lmGrp);
			assert.isArray(extra.grpName);
			assert.isObject(extra.conditions);
			assert.isArray(extra.matDrops);
			assert.isArray(extra.resetModes);
			assert.isArray(extra.rars);
			assert.isArray(extra.eName);
			assert.isObject(extra.rewards);
		});

		it('load specified keys', async function () {
			await Stage.loadStageData();
			const extra = await Stage.getStageExtra(['lmGrp', 'grpName']);
			assert.deepEqual(Object.keys(extra), ['lmGrp', 'grpName']);
			assert.isObject(extra.lmGrp);
			assert.isArray(extra.grpName);
		});

	});

	describe('getMap', function () {

		it('basic', async function () {
			await Stage.loadStageData();
			var map = await Stage.getMap(0);
			assert.strictEqual(map.id, 0);
			assert.strictEqual(map.name, "傳說的開始");
		});

	});

	describe('getStage', function () {

		it('basic', async function () {
			await Stage.loadStageData();
			var stage = await Stage.getStage(0);
			assert.strictEqual(stage.id, 0);
			assert.strictEqual(stage.name, "天搖地動");
		});

	});

	describe('forEachMap', function () {

		it('iterate all', async function () {
			await Stage.loadStageData();

			var maps = [];
			for await (const map of Stage.forEachMap()) {
				maps.push(map);
			}

			assert.strictEqual(maps[0].id, 0);
			assert.strictEqual(maps[0].name, "傳說的開始");
			assert.strictEqual(maps[1].id, 1);
			assert.strictEqual(maps[1].name, "熱情的國家");
			assert.strictEqual(maps.length, await dbCount(Stage.DB_NAME, Stage.DB_VERSION, 'map'));
		});

		it('iterate one', async function () {
			await Stage.loadStageData();

			var maps = [];
			for await (const map of Stage.forEachMap(1)) {
				maps.push(map);
			}

			assert.strictEqual(maps[0].id, 1);
			assert.strictEqual(maps[0].name, "熱情的國家");
			assert.strictEqual(maps.length, 1);
		});

		it('iterate range', async function () {
			await Stage.loadStageData();

			var maps = [];
			for await (const map of Stage.forEachMap(IDBKeyRange.bound(3, 5))) {
				maps.push(map);
			}

			assert.strictEqual(maps[0].id, 3);
			assert.strictEqual(maps[0].name, "貓咪們渡海");
			assert.strictEqual(maps.length, 3);
		});

	});

	describe('forEachStage', function () {

		it('iterate all', async function () {
			await Stage.loadStageData();

			var stages = [];
			for await (const stage of Stage.forEachStage()) {
				stages.push(stage);
			}

			assert.strictEqual(stages[0].id, 0);
			assert.strictEqual(stages[0].name, "天搖地動");
			assert.strictEqual(stages[1].id, 1);
			assert.strictEqual(stages[1].name, "恐怖再現");
			assert.strictEqual(stages.length, await dbCount(Stage.DB_NAME, Stage.DB_VERSION, 'stage'));
		});

		it('iterate one', async function () {
			await Stage.loadStageData();

			var stages = [];
			for await (const stage of Stage.forEachStage(1)) {
				stages.push(stage);
			}

			assert.strictEqual(stages[0].id, 1);
			assert.strictEqual(stages[0].name, "恐怖再現");
			assert.strictEqual(stages.length, 1);
		});

		it('iterate range', async function () {
			await Stage.loadStageData();

			var stages = [];
			for await (const stage of Stage.forEachStage(IDBKeyRange.bound(3, 5))) {
				stages.push(stage);
			}

			assert.strictEqual(stages[0].id, 3);
			assert.strictEqual(stages[0].name, "憂鬱濕地");
			assert.strictEqual(stages.length, 3);
		});

	});

});
