import {assert} from './lib/chai.js';
import {dbClear, dbDelete} from './common.mjs';
import * as Common from '../common.mjs';
import * as Reward from '../reward.mjs';

describe('reward.mjs', function () {

	describe('loadReward', function () {

		it('basic', async function () {
			async function test() {
				// general reward
				var reward = await Reward.loadReward(0);
				assert.strictEqual(reward.id, 0);
				assert.strictEqual(reward.name, "加速");
				assert.strictEqual(reward.icon, "/img/r/0.png");

				// new cat
				var reward = await Reward.loadReward(1103);
				assert.strictEqual(reward.id, 1103);
				assert.strictEqual(reward.name, "狂亂貓");
				assert.strictEqual(reward.icon, "/img/u/91/0.png");

				// evol3
				var reward = await Reward.loadReward(10014);
				assert.strictEqual(reward.id, 10014);
				assert.strictEqual(reward.name, "暗黑姊");
				assert.strictEqual(reward.icon, "/img/u/13/2.png");

				// egg (special icon path)
				var reward = await Reward.loadReward(1059);
				assert.strictEqual(reward.id, 1059);
				assert.strictEqual(reward.name, "遠古的蛋：N001");
				assert.strictEqual(reward.icon, "/img/s/0/0.png");
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'reward');
			await test();

			// data stored
			await test();
		});

	});

	describe('loadAllRewards', function () {

		it('basic', async function () {
			async function test() {
				var rewards = await Reward.loadAllRewards();
				assert.isObject(rewards);
				assert.deepInclude(rewards, {
					"0": {
						"id": 0,
						"name": "加速",
						"icon": "/img/r/0.png",
					},
					"1": {
						"id": 1,
						"name": "寶物雷達",
						"icon": "/img/r/1.png",
					},
					"2": {
						"id": 2,
						"name": "土豪貓",
						"icon": "/img/r/2.png",
					},
				});
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'reward');
			await test();

			// data stored
			await test();
		});

		it('with params', async function () {
			async function test() {
				var rewards = await Reward.loadAllRewards(IDBKeyRange.bound(1, 5), 3);
				assert.isObject(rewards);
				assert.deepEqual(rewards, {
					"1": {
						"id": 1,
						"name": "寶物雷達",
						"icon": "/img/r/1.png",
					},
					"2": {
						"id": 2,
						"name": "土豪貓",
						"icon": "/img/r/2.png",
					},
					"3": {
						"id": 3,
						"name": "貓型電腦",
						"icon": "/img/r/3.png",
					},
				});
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'reward');
			await test();

			// data stored
			await test();
		});

	});

	describe('forEachReward', function () {

		it('basic', async function () {
			async function test() {
				var rewards = [];
				for await (const reward of Reward.forEachReward()) {
					rewards.push(reward);
					if (rewards.length >= 10) { break; }
				}
				assert.strictEqual(rewards.length, 10);
				assert.deepEqual(rewards.slice(0, 3), [
					{
						"id": 0,
						"name": "加速",
						"icon": "/img/r/0.png",
					},
					{
						"id": 1,
						"name": "寶物雷達",
						"icon": "/img/r/1.png",
					},
					{
						"id": 2,
						"name": "土豪貓",
						"icon": "/img/r/2.png",
					},
				]);
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'reward');
			await test();

			// data stored
			await test();
		});

		it('with params', async function () {
			async function test() {
				var rewards = [];
				for await (const reward of Reward.forEachReward(IDBKeyRange.bound(1, 3), 'prev')) {
					rewards.push(reward);
				}
				assert.deepEqual(rewards, [
					{
						"id": 3,
						"name": "貓型電腦",
						"icon": "/img/r/3.png",
					},
					{
						"id": 2,
						"name": "土豪貓",
						"icon": "/img/r/2.png",
					},
					{
						"id": 1,
						"name": "寶物雷達",
						"icon": "/img/r/1.png",
					},
				]);
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'reward');
			await test();

			// data stored
			await test();
		});

	});

});
