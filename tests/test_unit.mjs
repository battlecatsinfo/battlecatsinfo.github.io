import {assert} from './lib/chai.js';
import sinon from './lib/sinon-esm.js';
import {dbGetAll, dbClear, dbDelete} from './common.mjs';
import {round} from '../common.mjs';
import * as Common from '../common.mjs';
import * as Unit from '../unit.mjs';

describe('unit.mjs', function () {

	beforeEach(function() {
		Unit.catEnv.reset();
	});

	describe('loadAllCats', function () {

		it('check if cats data can be loaded and stored', async function () {
			async function test() {
				// check return value
				var cats = await Unit.loadAllCats();
				assert.strictEqual(cats[0].i, 0);
				assert.strictEqual(cats[0].info.rarity, 0);
				assert.strictEqual(cats[0].forms[0].info.name, '貓咪');
				assert.instanceOf(cats[106].info.talents, Int16Array);

				// check stored data
				var catsDb = await dbGetAll(Common.DB_NAME, Common.DB_VERSION, 'cats');
				assert.strictEqual(catsDb.length, cats.length);
				assert.strictEqual(catsDb[0].i, 0);
				assert.strictEqual(catsDb[0].info.rarity, 0);
				assert.strictEqual(catsDb[0].forms[0].name, '貓咪');
				assert.typeOf(catsDb[106].info.talents, 'string');
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'cats');
			await test();

			// data stored
			await test();
		});

	});

	describe('loadCat', function () {

		it('check loading single cat', async function () {
			async function test() {
				var cat = await Unit.loadCat(1);
				assert.strictEqual(cat.i, 1);
				assert.strictEqual(cat.info.rarity, 0);
				assert.strictEqual(cat.forms[0].info.name, '坦克貓');

				var cat = await Unit.loadCat(106);
				assert.strictEqual(cat.i, 106);
				assert.instanceOf(cat.info.talents, Int16Array);
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'cats');
			await test();

			// data stored
			await test();
		});

	});

	describe('loadAllEnemies', function () {

		it('check if enemies data can be loaded and stored', async function () {
			async function test() {
				// check return value
				var enemies = await Unit.loadAllEnemies();
				assert.strictEqual(enemies[0].info.i, 0);
				assert.strictEqual(enemies[0].info.name, '狗仔');
				assert.strictEqual(enemies[683].info.name, '大型陶器埴輪巨犬');

				// check the value stored in idb
				var enemiesDb = await dbGetAll(Common.DB_NAME, Common.DB_VERSION, 'enemy');
				assert.strictEqual(enemiesDb.length, enemies.length);
				assert.strictEqual(enemiesDb[0].i, 0);
				assert.strictEqual(enemiesDb[0].name, '狗仔');
				assert.strictEqual(enemiesDb[683].name, '大型陶器埴輪巨犬');
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'enemy');
			await test();

			// data stored
			await test();
		});

	});

	describe('loadEnemy', function () {

		it('check loading single enemy', async function () {
			async function test() {
				var enemy = await Unit.loadEnemy(1);
				assert.strictEqual(enemy.info.i, 1);
				assert.strictEqual(enemy.info.name, "扭扭蛇");
			}

			// IDB not exist
			await dbDelete(Common.DB_NAME);
			await test();

			// data not stored
			await dbClear(Common.DB_NAME, Common.DB_VERSION, 'enemy');
			await test();

			// data stored
			await test();
		});

	});

	describe('CatEnv', function () {

		describe('constructor', function () {

			it('no param', function () {
				var env = new Unit.CatEnv();
				var defaultTreasures = Common.config.getDefaultTreasures();
				assert.deepEqual(env._treasures, defaultTreasures);
				assert.notStrictEqual(env._treasures, defaultTreasures);
				assert.deepEqual(env._orbs, {
					atk: [],
					hp: [],
					good: [],
					massive: [],
					resist: [],
				});
				assert.deepEqual(env._others, {});
			});

			it('with params', function () {
				var treasures = [50, 100, , 200, 250];
				var orbs = {
					atk: [1],
					hp: [2],
					good: [3],
					massive: [4, 1],
					resist: [5],
				};
				var others = {
					'1': [1],
					'5': [264, 792],
				};
				var env = new Unit.CatEnv({treasures, orbs, others});
				var defaultTreasures = Common.config.getDefaultTreasures();
				assert.deepEqual(env._treasures, [50, 100, 300, 200, 250].concat(defaultTreasures.slice(5)));
				assert.notStrictEqual(env._treasures, treasures);
				assert.notStrictEqual(env._treasures, defaultTreasures);
				assert.deepEqual(env._orbs, {
					atk: [1],
					hp: [2],
					good: [3],
					massive: [4, 1],
					resist: [5],
				});
				assert.notStrictEqual(env._orbs, orbs);
				assert.deepEqual(env._others, {
					'1': [1],
					'5': [264, 792],
				});
				assert.notStrictEqual(env._others, others);
			});

			it('forbid changing internal objects', function () {
				var env = new Unit.CatEnv();

				assert.throws(() => {
					env._treasures = 1;
				}, TypeError);

				assert.throws(() => {
					delete env._treasures;
				}, TypeError);

				assert.throws(() => {
					env._orbs = "value";
				}, TypeError);

				assert.throws(() => {
					delete env._orbs;
				}, TypeError);

				assert.throws(() => {
					env._others = "value";
				}, TypeError);

				assert.throws(() => {
					delete env._others;
				}, TypeError);
			});

		});

		describe('reset', function () {

			it('check if underlying reset methods are correctly called', function () {
				var env = new Unit.CatEnv();
				var spy1 = sinon.spy(env, 'resetTreasures');
				var spy2 = sinon.spy(env, 'resetOrbs');
				var spy3 = sinon.spy(env, 'resetOthers');

				env.reset();
				assert(spy1.calledOnceWith());
				assert(spy2.calledOnceWith());
				assert(spy3.calledOnceWith());
			});

		});

		describe('resetTreasures', function () {

			it('basic', function () {
				var env = new Unit.CatEnv();
				env._treasures[0] = 0;
				env._treasures[2] = 0;
				env.resetTreasures();

				assert.deepEqual(env._treasures, Common.config.getDefaultTreasures());
			});

		});

		describe('resetOrbs', function () {

			it('basic', function () {
				var env = new Unit.CatEnv();
				env._orbs.atk.push(5);
				env._orbs.hp.push(1, 2, 3);
				env.resetOrbs();

				assert.deepEqual(env._orbs, {
					atk: [],
					hp: [],
					good: [],
					massive: [],
					resist: [],
				});
			});

		});

		describe('resetOthers', function () {

			it('basic', function () {
				var env = new Unit.CatEnv();
				env._others[1] = 1;
				env._others[2] = [0.1, 0.15];
				env._others[5] = [528, 792];
				env.resetOthers();

				assert.deepEqual(env._others, {});
			});

		});

		describe('getTreasure', function () {

			it('basic', function () {
				var env = new Unit.CatEnv();
				assert.strictEqual(env.getTreasure(0), 300);
				assert.strictEqual(env.getTreasure(1), 300);

				env._treasures[0] = 100;
				assert.strictEqual(env.getTreasure(0), 100);

				env._treasures[2] = 200;
				assert.strictEqual(env.getTreasure(2), 200);
			});

		});

		describe('setTreasure', function () {

			it('basic', function () {
				var env = new Unit.CatEnv();

				env.setTreasure(0, 50);
				assert.strictEqual(env._treasures[0], 50);

				env.setTreasure(1, 100);
				assert.strictEqual(env._treasures[1], 100);
			});

		});

		describe('getOrbs', function () {

			it('basic', function () {
				var env = new Unit.CatEnv();
				for (const key in env._orbs) {
					env._orbs[key].push(5);
					assert.deepEqual(env.getOrbs(key), [5]);
					assert.deepEqual(env.getOrbs(key), env._orbs[key]);
					assert.notStrictEqual(env.getOrbs(key), env._orbs[key]);

					env._orbs[key].push(1, 2);
					assert.deepEqual(env.getOrbs(key), [5, 1, 2]);
					assert.deepEqual(env.getOrbs(key), env._orbs[key]);
					assert.notStrictEqual(env.getOrbs(key), env._orbs[key]);
				}
			});

		});

		describe('addOrb', function () {

			it('add single value', function () {
				var env = new Unit.CatEnv();
				for (const key in env._orbs) {
					env.addOrb(key, 5);
					assert.deepEqual(env._orbs[key], [5]);

					env.addOrb(key, 3);
					env.addOrb(key, 2);
					env.addOrb(key, 1);
					assert.deepEqual(env._orbs[key], [5, 3, 2, 1]);
				}
			});

			it('add multiple values', function () {
				var env = new Unit.CatEnv();
				for (const key in env._orbs) {
					env.addOrb(key, 2, 3);
					assert.deepEqual(env._orbs[key], [2, 3]);

					env.addOrb(key, 4, 1);
					assert.deepEqual(env._orbs[key], [2, 3, 4, 1]);
				}
			});

		});

		describe('setOrbs', function () {

			it('basic', function () {
				var env = new Unit.CatEnv();
				for (const key in env._orbs) {
					var arr = [1, 2, 3];
					env.setOrbs(key, arr);
					assert.deepEqual(env._orbs[key], [1, 2, 3]);
					assert.deepEqual(env._orbs[key], arr);
					assert.notStrictEqual(env._orbs[key], arr);

					var arr = [4, 5, 6];
					env.setOrbs(key, arr);
					assert.deepEqual(env._orbs[key], [4, 5, 6]);
					assert.deepEqual(env._orbs[key], arr);
					assert.notStrictEqual(env._orbs[key], arr);
				}
			});

		});

		describe('getOthers', function () {

			it('basic', function () {
				var env = new Unit.CatEnv();
				env._others[1] = [1];
				env._others[2] = [0.1, 0.15];
				env._others[5] = [528, 792];

				assert.deepEqual(env.getOthers(1), [1]);
				assert.deepEqual(env.getOthers(1), env._others[1]);
				assert.notStrictEqual(env.getOthers(1), env._others[1]);

				assert.deepEqual(env.getOthers(2), [0.1, 0.15]);
				assert.deepEqual(env.getOthers(2), env._others[2]);
				assert.notStrictEqual(env.getOthers(2), env._others[2]);

				assert.deepEqual(env.getOthers(5), [528, 792]);
				assert.deepEqual(env.getOthers(5), env._others[5]);
				assert.notStrictEqual(env.getOthers(5), env._others[5]);
			});

		});

		describe('addOther', function () {

			it('add single value', function () {
				var env = new Unit.CatEnv();
				env.addOther(1, 1);
				assert.deepEqual(env._others[1], [1]);

				env.addOther(5, 528);
				assert.deepEqual(env._others[5], [528]);

				env.addOther(5, 792);
				assert.deepEqual(env._others[5], [528, 792]);
			});

			it('add multiple values', function () {
				var env = new Unit.CatEnv();
				env.addOther(5, 528, 792);
				assert.deepEqual(env._others[5], [528, 792]);
			});

		});

		describe('setOthers', function () {

			it('basic', function () {
				var env = new Unit.CatEnv();

				var arr = [0.3, 0.1, 0.2];
				env.setOthers(9, arr);
				assert.deepEqual(env._others[9], [0.3, 0.1, 0.2]);
				assert.deepEqual(env._others[9], arr);
				assert.notStrictEqual(env._others[9], arr);

				var arr = [0.1, 0.3];
				env.setOthers(9, arr);
				assert.deepEqual(env._others[9], [0.1, 0.3]);
				assert.deepEqual(env._others[9], arr);
				assert.notStrictEqual(env._others[9], arr);
			});

		});

		describe('getters', function () {

			it('treasures related', function () {
				var env = new Unit.CatEnv({
					treasures: [100, 200],
				});
				assert.strictEqual(env.atk_t, 1 + 0.005 * 100);
				assert.strictEqual(env.hp_t, 1 + 0.005 * 200);

				env.setTreasure(0, 150);
				env.setTreasure(1, 250);
				env.setTreasure(18, 10);
				env.setTreasure(3, 50);
				env.setTreasure(17, 20);
				env.setTreasure(2, 75);
				env.setTreasure(23, 100);
				env.setTreasure(21, 500);
				env.setTreasure(22, 1000);
				env.setTreasure(20, 70);
				env.setTreasure(24, 80);
				env.setTreasure(30, 90);

				assert.strictEqual(env.atk_t, 1 + 0.005 * 150);
				assert.strictEqual(env.hp_t, 1 + 0.005 * 250);
				assert.strictEqual(env.earn_r, 0.05 * (10 - 1));
				assert.strictEqual(env.earn_t, 0.005 * 50);
				assert.strictEqual(env.cd_r, 6 * (20 - 1));
				assert.strictEqual(env.cd_t, 0.3 * 75);
				assert.strictEqual(env.good_atk_t, 100 / 1000);
				assert.strictEqual(env.good_hp_t, 100 / 3000);
				assert.strictEqual(env.massive_t, 100 / 300);
				assert.strictEqual(env.resist_t, 100 / 300);
				assert.strictEqual(env.dur_t, 1 + 100 / 1500);
				assert.strictEqual(env.alien_t, 7 - 500 / 100);
				assert.strictEqual(env.alien_star_t, 16 - 1000 / 100);
				assert.strictEqual(env.god1_t, 11 - (70 / 10));
				assert.strictEqual(env.god2_t, 11 - (80 / 10));
				assert.strictEqual(env.god3_t, 11 - (90 / 10));
			});

			it('orbs related', function () {
				var env = new Unit.CatEnv({
					orbs: {
						atk: [5],
						hp: [4],
						good: [3],
						massive: [2],
						resist: [1],
					},
				});
				assert.strictEqual(env.orb_atk, 5);
				assert.approximately(env.orb_hp, (1 - 0.04 * 4), Number.EPSILON);
				assert.approximately(env.orb_good_hp, 1 - 0.02 * 3, Number.EPSILON);
				assert.approximately(env.orb_good_atk, 0.06 * 3, Number.EPSILON);
				assert.approximately(env.orb_massive, 2 / 10, Number.EPSILON);
				assert.approximately(env.orb_resist, (1 - 1 / 20), Number.EPSILON);

				var env = new Unit.CatEnv({
					orbs: {
						atk: [5, 5],
						hp: [4, 2],
						good: [3, 3, 2],
						massive: [2, 2],
						resist: [1, 4],
					},
				});
				assert.strictEqual(env.orb_atk, 10);
				assert.approximately(env.orb_hp, (1 - 0.04 * 4) * (1 - 0.04 * 2), Number.EPSILON);
				assert.approximately(env.orb_good_hp, 1 - 0.02 * 8, Number.EPSILON);
				assert.approximately(env.orb_good_atk, 0.06 * 8, Number.EPSILON);
				assert.approximately(env.orb_massive, 4 / 10, Number.EPSILON);
				assert.approximately(env.orb_resist, (1 - 1 / 20) * (1 - 4 / 20), Number.EPSILON);
			});

			it('others related', async function () {
				var env = new Unit.CatEnv({
					others: {
						'2': [15],
						'4': [10, 15],
						'14': [400, 400],
						'15': [400, 400],
					},
				});
				assert.approximately(env.base_resist, 0, Number.EPSILON);
				assert.approximately(env.combo_atk, 0.15, Number.EPSILON);
				assert.approximately(env.combo_hp, 0, Number.EPSILON);
				assert.approximately(env.combo_speed, 0.25, Number.EPSILON);
				assert.approximately(env.combo_cd, 0, Number.EPSILON);
				assert.approximately(env.combo_crit, 0, Number.EPSILON);
				assert.approximately(env.combo_good, 0, Number.EPSILON);
				assert.approximately(env.combo_massive, 0, Number.EPSILON);
				assert.approximately(env.combo_resist, 0, Number.EPSILON);
				assert.approximately(env.combo_slow, 0, Number.EPSILON);
				assert.approximately(env.combo_stop, 0, Number.EPSILON);
				assert.approximately(env.combo_weak, 0, Number.EPSILON);
				assert.approximately(env.combo_strengthen, 0, Number.EPSILON);
				assert.approximately(env.combo_witch, 8, Number.EPSILON);
				assert.approximately(env.combo_eva, 8, Number.EPSILON);

				var env = new Unit.CatEnv({
					others: {
						'1': [20],              // Base
						'2': [10, 15],          // Atk
						'3': [10, 20],          // HP
						'4': [10, 15],          // Speed
						'5': [264, 528, 792],   // Reseach
						'6': [1, 2],            // Crit
						'7': [10, 20],          // Good
						'8': [10, 20],          // Massive
						'9': [10, 20, 30],      // Resist
						'10': [10, 20, 30],     // Slow
						'11': [10, 20],         // Stop
						'12': [10, 20, 30],     // Weak
						'13': [20, 30],         // Strong
						'14': [400],            // Witch
						'15': [400],            // EVA
					},
				});
				assert.approximately(env.base_resist, 0.15, Number.EPSILON);
				assert.approximately(env.combo_atk, 0.25, Number.EPSILON);
				assert.approximately(env.combo_hp, 0.3, Number.EPSILON);
				assert.approximately(env.combo_speed, 0.25, Number.EPSILON);
				assert.approximately(env.combo_cd, 1584, Number.EPSILON);
				assert.approximately(env.combo_crit, 3, Number.EPSILON);
				assert.approximately(env.combo_good, 0.3, Number.EPSILON);
				assert.approximately(env.combo_massive, 0.3, Number.EPSILON);
				assert.approximately(env.combo_resist, 0.6, Number.EPSILON);
				assert.approximately(env.combo_slow, 0.6, Number.EPSILON);
				assert.approximately(env.combo_stop, 0.3, Number.EPSILON);
				assert.approximately(env.combo_weak, 0.6, Number.EPSILON);
				assert.approximately(env.combo_strengthen, 50, Number.EPSILON);
				assert.approximately(env.combo_witch, 4, Number.EPSILON);
				assert.approximately(env.combo_eva, 4, Number.EPSILON);
			});

		});

	});

	describe('Cat', function () {

		describe('Cat.id', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.strictEqual(cat.id, 0);

				var cat = await Unit.loadCat(138);
				assert.strictEqual(cat.id, 138);
			});

		});

		describe('Cat.rarity', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.strictEqual(cat.rarity, 0);

				var cat = await Unit.loadCat(138);
				assert.strictEqual(cat.rarity, 4);
			});

		});

		describe('Cat.ver', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.isUndefined(cat.ver);

				var cat = await Unit.loadCat(273);
				assert.strictEqual(cat.ver, 50600);
			});

		});

		describe('Cat.obtn', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.strictEqual(cat.obtn, '遊戲開始時最初始的貓咪');

				var cat = await Unit.loadCat(1);
				assert.strictEqual(cat.obtn, '世界篇第1章「台灣」過關後開放');
			});

		});

		describe('Cat.evol', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.strictEqual(cat.evol, '合計Lv30可進化（Lv. 10 + 20）');

				var cat = await Unit.loadCat(200);
				assert.strictEqual(cat.evol, '尚未開放');
			});

		});

		describe('Cat.obtnStage', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.isUndefined(cat.obtnStage);

				var cat = await Unit.loadCat(60);
				assert.deepEqual(cat.obtnStage, [10, 19, 0]);
			});

		});

		describe('Cat.evolStage', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.isUndefined(cat.evolStage);

				var cat = await Unit.loadCat(60);
				assert.deepEqual(cat.evolStage, [1, 172, 1]);
			});

		});

		describe('Cat.evolReq', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.isUndefined(cat.evolReq);

				var cat = await Unit.loadCat(44);
				assert.strictEqual(cat.evolReq, '1000000!0|5!38|7!35|5!36|7!39|3!40');
			});

		});

		describe('Cat.evol4Req', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.isUndefined(cat.evol4Req);

				var cat = await Unit.loadCat(138);
				assert.strictEqual(cat.evol4Req, '1000000!0|1!183|5!168|5!167|2!40');
			});

		});

		describe('Cat.evolDesc', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.isUndefined(cat.evolDesc);

				var cat = await Unit.loadCat(71);
				assert.deepEqual(cat.evolDesc, '第3進化後攻擊力上升！<br>同時移動速度也上升！<br>比誰都更快速！');
			});

		});

		describe('Cat.evol4Desc', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.isUndefined(cat.evol4Desc);

				var cat = await Unit.loadCat(138);
				assert.deepEqual(cat.evol4Desc, '第4進化是變回<br>原有樣貌的超級進化！<br>還取得了鋼鐵殺手的能力！');
			});

		});

		describe('Cat.orbs', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.isUndefined(cat.orbs);

				var cat = await Unit.loadCat(13);
				assert.strictEqual(cat.orbs, 1);

				var cat = await Unit.loadCat(34);
				assert.strictEqual(cat.orbs, 2);
			});

		});

		describe('Cat.eid', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.isUndefined(cat.eid);

				var cat = await Unit.loadCat(656);
				assert.deepEqual(cat.eid, [0, 1]);
			});

		});

		describe('Cat.maxBaseLv', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.strictEqual(cat.maxBaseLv, 20);
			});

		});

		describe('Cat.maxPlusLv', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.strictEqual(cat.maxPlusLv, 90);
			});

		});

		describe('Cat.maxLevel', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.strictEqual(cat.maxLevel, 110);
			});

		});

		describe('Cat.getLevelMulti', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.strictEqual(cat.getLevelMulti(1), 1);
				assert.approximately(cat.getLevelMulti(2), 1.2, Number.EPSILON);
				assert.approximately(cat.getLevelMulti(10), 2.8, Number.EPSILON);
				assert.approximately(cat.getLevelMulti(50), 10.8, Number.EPSILON);
			});

		});

		describe('Cat.xpCurve', function () {

			it('basic', async function () {
				// general
				var cat = await Unit.loadCat(0);
				assert.deepEqual(cat.xpCurve, [200, 400, 700, 1100, 1600, 2200, 2900, 3700, 4600, 5600]);

				// 1
				var cat = await Unit.loadCat(34);
				assert.deepEqual(cat.xpCurve, [7800, 9800, 14800, 21800, 42500, 64300, 93200, 118000, 197400, 513500]);

				// 2
				var cat = await Unit.loadCat(30);
				assert.deepEqual(cat.xpCurve, [6250, 8200, 12400, 17800, 24800, 42400, 64500, 93000, 148000, 298000]);

				// 3
				var cat = await Unit.loadCat(24);
				assert.deepEqual(cat.xpCurve, [5000, 8000, 12200, 17800, 24800, 33200, 43000, 54200, 66800, 80800]);

				// 4
				var cat = await Unit.loadCat(8);
				assert.deepEqual(cat.xpCurve, [2000, 3500, 6200, 9800, 14300, 19700, 26000, 33200, 41300, 50300]);

				// 5
				var cat = await Unit.loadCat(101);
				assert.deepEqual(cat.xpCurve, [1500, 2000, 3200, 4800, 6800, 9200, 12000, 15200, 18800, 22800]);
			});

		});

		describe('Cat.getXpCost', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);

				assert.strictEqual(cat.getXpCost(0), 0);
				assert.strictEqual(cat.getXpCost(1), 400);
				assert.strictEqual(cat.getXpCost(2), 700);
				assert.strictEqual(cat.getXpCost(9), 5600);

				assert.strictEqual(cat.getXpCost(10), 400);
				assert.strictEqual(cat.getXpCost(11), 800);
				assert.strictEqual(cat.getXpCost(19), 11200);

				assert.strictEqual(cat.getXpCost(20), 600);
				assert.strictEqual(cat.getXpCost(21), 1200);
				assert.strictEqual(cat.getXpCost(29), 16800);
			});

		});

		describe('Cat.talents', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.isUndefined(cat.talents);

				var cat = await Unit.loadCat(13);
				assert.deepEqual(cat.talents, new Int16Array([0, 17, 10, 5, 15, 6, 6, 0, 0, 0, 0, 17, 4, -1, 0, 44, 1, 0, 0, 0, 0, 0, 0, 0, 0, 53, 6, -1, 0, 25, 10, 20, 200, 0, 0, 0, 0, 0, 0, 31, 5, -1, 0, 32, 10, 8, 80, 0, 0, 0, 0, 0, 0, 27, 5, -1, 0, 31, 10, 8, 80, 0, 0, 0, 0, 0, 0, 28, 5, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0]));

				var cat = await Unit.loadCat(34);
				assert.deepEqual(cat.talents, new Int16Array([0, 2, 10, 0, 0, 12, 30, 0, 0, 0, 0, 43, 8, -1, 0, 22, 10, 5, 50, 0, 0, 0, 0, 0, 0, 22, 8, -1, 0, 32, 10, 2, 20, 0, 0, 0, 0, 0, 0, 27, 8, -1, 0, 31, 10, 2, 20, 0, 0, 0, 0, 0, 0, 28, 8, -1, 0, 25, 10, 40, 400, 0, 0, 0, 0, 0, 0, 31, 8, -1, 0, 55, 0, 0, 0, 0, 0, 0, 0, 0, 0, 67, 10, -1, 1, 11, 10, 28, 100, 0, 0, 0, 0, 0, 0, 11, 12, -1, 1, 51, 10, 5, 50, 30, 30, 0, 0, 0, 0, 88, 12, -1, 1]));
			});

		});

		describe('Cat.animUrl', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.strictEqual(cat.animUrl, "/anim.html?id=0");

				var cat = await Unit.loadCat(205);
				assert.strictEqual(cat.animUrl, "/anim.html?id=205");
			});

		});

		describe('Cat.bcdbUrl', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.strictEqual(cat.bcdbUrl, "https://battlecats-db.com/unit/001.html");

				var cat = await Unit.loadCat(205);
				assert.strictEqual(cat.bcdbUrl, "https://battlecats-db.com/unit/206.html");
			});

		});

		describe('Cat.udpUrl', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.strictEqual(cat.udpUrl, "https://thanksfeanor.pythonanywhere.com/UDP/000");

				var cat = await Unit.loadCat(205);
				assert.strictEqual(cat.udpUrl, "https://thanksfeanor.pythonanywhere.com/UDP/205");
			});

		});

		describe('Cat.fandomUrl', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.strictEqual(cat.fandomUrl, "https://battle-cats.fandom.com/wiki/Cat_(Normal_Cat)");

				var cat = await Unit.loadCat(305);
				assert.strictEqual(cat.fandomUrl, "https://battle-cats.fandom.com/wiki/Mighty_Drednot_(Uber_Rare_Cat)");
			});

		});

	});

	describe('CatForm', function () {

		describe('CatForm.id', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.strictEqual(cat.forms[0].id, 0);
				assert.strictEqual(cat.forms[1].id, 0);
				assert.strictEqual(cat.forms[2].id, 0);

				var cat = await Unit.loadCat(138);
				assert.strictEqual(cat.forms[0].id, 138);
				assert.strictEqual(cat.forms[1].id, 138);
				assert.strictEqual(cat.forms[2].id, 138);
				assert.strictEqual(cat.forms[3].id, 138);
			});

		});

		describe('CatForm.baseLv', function () {

			it('basic get and set', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				cf.baseLv = 5;
				assert.strictEqual(cf.baseLv, 5);
				cf.baseLv = 20;
				assert.strictEqual(cf.baseLv, 20);
			});

			it('forbid setting beyond [1, maxBaseLv]', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				cf.baseLv = 0;
				assert.strictEqual(cf.baseLv, 1);
				cf.baseLv = 21;
				assert.strictEqual(cf.baseLv, 20);
			});

		});

		describe('CatForm.plusLv', function () {

			it('basic get and set', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				cf.plusLv = 5;
				assert.strictEqual(cf.plusLv, 5);
				cf.plusLv = 20;
				assert.strictEqual(cf.plusLv, 20);
			});

			it('forbid setting beyond [0, maxPlusLv]', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				cf.plusLv = -1;
				assert.strictEqual(cf.plusLv, 0);
				cf.plusLv = 91;
				assert.strictEqual(cf.plusLv, 90);
			});

		});

		describe('CatForm.level', function () {

			it('basic get and set', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				cf.level = 5;
				assert.strictEqual(cf.level, 5);
				assert.strictEqual(cf.baseLv, 5);
				assert.strictEqual(cf.plusLv, 0);
				cf.level = 20;
				assert.strictEqual(cf.level, 20);
				assert.strictEqual(cf.baseLv, 20);
				assert.strictEqual(cf.plusLv, 0);
				cf.level = 21;
				assert.strictEqual(cf.level, 21);
				assert.strictEqual(cf.baseLv, 20);
				assert.strictEqual(cf.plusLv, 1);
			});

			it('forbid setting beyond [1, maxBaseLv + maxPlusLv]', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				cf.level = 0;
				assert.strictEqual(cf.level, 1);
				assert.strictEqual(cf.baseLv, 1);
				assert.strictEqual(cf.plusLv, 0);
				cf.level = 111;
				assert.strictEqual(cf.level, 110);
				assert.strictEqual(cf.baseLv, 20);
				assert.strictEqual(cf.plusLv, 90);
			});

		});

		describe('CatForm.getLevelMulti', function () {

			it('get value for the specified level', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.approximately(cf.getLevelMulti(1), 1, Number.EPSILON);
				assert.approximately(cf.getLevelMulti(2), 1.2, Number.EPSILON);
				assert.approximately(cf.getLevelMulti(10), 2.8, Number.EPSILON);
				assert.approximately(cf.getLevelMulti(50), 10.8, Number.EPSILON);
			});

			it('get value for current level if not specified', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];

				cf.level = 1;
				assert.approximately(cf.getLevelMulti(), 1, Number.EPSILON);

				cf.level = 10;
				assert.approximately(cf.getLevelMulti(), 2.8, Number.EPSILON);

				cf.level = 50;
				assert.approximately(cf.getLevelMulti(), 10.8, Number.EPSILON);
			});

		});

		describe('CatForm.hp', function () {

			it('level should be counted', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.hp, 250);
				cf.level = 10;
				assert.strictEqual(cf.hp, 700);
				cf.level = 20;
				assert.strictEqual(cf.hp, 1200);
				cf.level = 100;
				assert.strictEqual(cf.hp, 4200);
			});

			it('the defense buff talent should be counted', async function () {
				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.hp, 105300);

				cf.applyAllTalents([0, 0, 5, 0, 0]);
				assert.strictEqual(cf.hp, 115830);

				cf.applyAllTalents([0, 0, 10, 0, 0]);
				assert.strictEqual(cf.hp, 126360);
			});

			it('treasures should be counted', async function () {
				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;
				Unit.catEnv.setTreasure(1, 0);
				assert.strictEqual(cf.hp, 42120);

				Unit.catEnv.setTreasure(1, 100);
				assert.strictEqual(cf.hp, 63180);

				Unit.catEnv.setTreasure(1, 300);
				assert.strictEqual(cf.hp, 105300);
			});

			it('combo defense up should be counted', async function () {
				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;

				Unit.catEnv.setOthers(3, [10]);
				assert.strictEqual(cf.hp, 115830);

				Unit.catEnv.setOthers(3, [20]);
				assert.strictEqual(cf.hp, 126360);

				Unit.catEnv.setOthers(3, [10, 20]);
				assert.strictEqual(cf.hp, 136890);
			});

		});

		describe('CatForm.speed', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.speed, 10);

				var cf = (await Unit.loadCat(25)).forms[2];
				assert.strictEqual(cf.speed, 60);
			});

			it('combo speed up should be counted', async function () {
				var cf = (await Unit.loadCat(25)).forms[2];

				Unit.catEnv.setOthers(4, [10]);
				assert.strictEqual(cf.speed, 66);

				Unit.catEnv.setOthers(4, [15]);
				assert.strictEqual(cf.speed, 69);

				Unit.catEnv.setOthers(4, [10, 15]);
				assert.strictEqual(cf.speed, 75);
			});

		});

		describe('CatForm.atks', function () {

			it('check if underlying API is correctly called', async function () {
				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;

				var spy = sinon.spy(cf, 'getatks');
				assert.strictEqual(cf.atks, spy.returnValues[0]);
				assert(spy.calledOnceWith());
			});

			it('level should be counted', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.deepEqual(cf.atks, [20]);
				cf.level = 100;
				assert.deepEqual(cf.atks, [335]);
			});

			it('multi-attack should be counted', async function () {
				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;
				assert.deepEqual(cf.atks, [110000, 4400, 6600]);
			});

			it('the attack buff talent should be counted', async function () {
				var cf = (await Unit.loadCat(137)).forms[2];
				cf.level = 50;
				assert.deepEqual(cf.atks, [16200, 16200, 97200]);

				cf.applyTalents([0, 0, 0, 0, 5]);
				assert.deepEqual(cf.atks, [17820, 17820, 106920]);

				cf.applyTalents([0, 0, 0, 0, 10]);
				assert.deepEqual(cf.atks, [19440, 19440, 116640]);
			});

			it('treasures should be counted', async function () {
				var cf = (await Unit.loadCat(137)).forms[2];
				cf.level = 50;
				Unit.catEnv.setTreasure(0, 0);
				assert.deepEqual(cf.atks, [6480, 6480, 38880]);

				Unit.catEnv.setTreasure(0, 100);
				assert.deepEqual(cf.atks, [9720, 9720, 58320]);

				Unit.catEnv.setTreasure(0, 300);
				assert.deepEqual(cf.atks, [16200, 16200, 97200]);
			});

			it('combo attack up should be counted', async function () {
				var cf = (await Unit.loadCat(137)).forms[2];
				cf.level = 50;

				Unit.catEnv.setOthers(2, [10]);
				assert.deepEqual(cf.atks, [17820, 17820, 106920]);

				Unit.catEnv.setOthers(2, [15]);
				assert.deepEqual(cf.atks, [18630, 18630, 111779]);

				Unit.catEnv.setOthers(2, [10, 15]);
				assert.deepEqual(cf.atks, [20250, 20250, 121500]);
			});

		});

		describe('CatForm.atkm', function () {

			it('check if underlying API is correctly called', async function () {
				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;

				var spy = sinon.spy(cf, 'getatks');
				assert.strictEqual(cf.atkm, spy.returnValues[0].reduce((rv, x) => rv + x));
				assert(spy.calledOnceWith());
			});

			it('level should be counted', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.atkm, 20);
				cf.level = 100;
				assert.strictEqual(cf.atkm, 335);
			});

			it('multi-attack should be counted', async function () {
				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.atkm, 121000);
			});

			it('the attack buff talent should be counted', async function () {
				var cf = (await Unit.loadCat(137)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.atkm, 129600);

				cf.applyTalents([0, 0, 0, 0, 5]);
				assert.strictEqual(cf.atkm, 142560);

				cf.applyTalents([0, 0, 0, 0, 10]);
				assert.strictEqual(cf.atkm, 155520);
			});

			it('treasures should be counted', async function () {
				var cf = (await Unit.loadCat(137)).forms[2];
				cf.level = 50;
				Unit.catEnv.setTreasure(0, 0);
				assert.strictEqual(cf.atkm, 51840);

				Unit.catEnv.setTreasure(0, 100);
				assert.strictEqual(cf.atkm, 77760);

				Unit.catEnv.setTreasure(0, 300);
				assert.strictEqual(cf.atkm, 129600);
			});

		});

		describe('CatForm.atk', function () {

			it('check if underlying API is correctly called', async function () {
				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;

				var spy = sinon.spy(cf, 'getatks');
				assert.strictEqual(cf.atk, spy.returnValues[0]);
				assert(spy.calledOnceWith(0));
			});

			it('level should be counted', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.atk, cf.atks[0]);
				cf.level = 100;
				assert.strictEqual(cf.atk, cf.atks[0]);
			});

			it('return first attack for multi-attack', async function () {
				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.atk, cf.atks[0]);
			});

			it('the attack buff talent should be counted', async function () {
				var cf = (await Unit.loadCat(137)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.atk, cf.atks[0]);

				cf.applyTalents([0, 0, 0, 0, 10]);
				assert.strictEqual(cf.atk, cf.atks[0]);
			});

			it('treasures should be counted', async function () {
				var cf = (await Unit.loadCat(137)).forms[2];
				cf.level = 50;
				Unit.catEnv.setTreasure(0, 0);
				assert.strictEqual(cf.atk, cf.atks[0]);

				Unit.catEnv.setTreasure(0, 300);
				assert.strictEqual(cf.atk, cf.atks[0]);
			});

		});

		describe('CatForm.atk1', function () {

			it('check if underlying API is correctly called', async function () {
				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;

				var spy = sinon.spy(cf, 'getatks');
				assert.strictEqual(cf.atk1, spy.returnValues[0]);
				assert(spy.calledOnceWith(1));
			});

			it('return second attack for multi-attack', async function () {
				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.atk1, cf.atks[1]);
			});

			it('return 0 if no multi-attack', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.atk1, 0);
			});

			it('the attack buff talent should be counted', async function () {
				var cf = (await Unit.loadCat(137)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.atk1, cf.atks[1]);

				cf.applyTalents([0, 0, 0, 0, 10]);
				assert.strictEqual(cf.atk1, cf.atks[1]);
			});

			it('treasures should be counted', async function () {
				var cf = (await Unit.loadCat(137)).forms[2];
				cf.level = 50;
				Unit.catEnv.setTreasure(0, 0);
				assert.strictEqual(cf.atk1, cf.atks[1]);

				Unit.catEnv.setTreasure(0, 300);
				assert.strictEqual(cf.atk1, cf.atks[1]);
			});

		});

		describe('CatForm.atk2', function () {

			it('check if underlying API is correctly called', async function () {
				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;

				var spy = sinon.spy(cf, 'getatks');
				assert.strictEqual(cf.atk2, spy.returnValues[0]);
				assert(spy.calledOnceWith(2));
			});

			it('return third attack for multi-attack', async function () {
				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.atk2, cf.atks[2]);
			});

			it('return 0 if no related multi-attack', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.atk2, 0);
			});

			it('the attack buff talent should be counted', async function () {
				var cf = (await Unit.loadCat(137)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.atk2, cf.atks[2]);

				cf.applyTalents([0, 0, 0, 0, 10]);
				assert.strictEqual(cf.atk2, cf.atks[2]);
			});

			it('treasures should be counted', async function () {
				var cf = (await Unit.loadCat(137)).forms[2];
				cf.level = 50;
				Unit.catEnv.setTreasure(0, 0);
				assert.strictEqual(cf.atk2, cf.atks[2]);

				Unit.catEnv.setTreasure(0, 300);
				assert.strictEqual(cf.atk2, cf.atks[2]);
			});

		});

		describe('CatForm.dps', function () {

			it('check if underlying API is correctly called', async function () {
				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;

				var spy = sinon.spy(cf, 'getatks');
				assert.approximately(
					cf.dps,
					30 * spy.returnValues[0].reduce((rv, x) => rv + x) / cf.attackF,
					Number.EPSILON,
				);
				assert(spy.calledOnceWith());
			});

			it('level should be counted', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(round(cf.dps), 16);
				cf.level = 10;
				assert.strictEqual(round(cf.dps), 45);
				cf.level = 20;
				assert.strictEqual(round(cf.dps), 77);
				cf.level = 100;
				assert.strictEqual(round(cf.dps), 272);
			});

			it('multi-attack should be counted', async function () {
				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.dps), 39032);
			});

			it('the attack buff talent should be counted', async function () {
				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.dps), 44669);

				cf.applyAllTalents([0, 0, 0, 5, 0]);
				assert.strictEqual(round(cf.dps), 49136);

				cf.applyAllTalents([0, 0, 0, 10, 0]);
				assert.strictEqual(round(cf.dps), 53603);
			});

			it('treasures should be counted', async function () {
				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;
				Unit.catEnv.setTreasure(0, 0);
				assert.strictEqual(round(cf.dps), 17868);

				Unit.catEnv.setTreasure(0, 100);
				assert.strictEqual(round(cf.dps), 26801);

				Unit.catEnv.setTreasure(0, 300);
				assert.strictEqual(round(cf.dps), 44669);
			});

		});

		describe('CatForm.thp', function () {

			it('check if underlying API is correctly called', async function () {
				var cf = (await Unit.loadCat(269)).forms[1];
				cf.level = 50;

				var spy = sinon.spy(cf, 'getthp');
				assert.strictEqual(cf.thp, spy.returnValues[0]);
				assert(spy.calledOnceWith());
			});

			it('EVA-killer should be counted', async function () {
				var cf = (await Unit.loadCat(412)).forms[1];
				cf.level = 50;
				assert.strictEqual(cf.thp, 1012500);
			});

			it('witch-killer should be counted', async function () {
				var cf = (await Unit.loadCat(289)).forms[1];
				cf.level = 50;
				assert.strictEqual(cf.thp, 764100);
			});

			it('tough should be counted', async function () {
				var cf = (await Unit.loadCat(585)).forms[1];
				cf.level = 50;
				assert.strictEqual(cf.thp, 945000);
			});

			it('insane tough should be counted', async function () {
				var cf = (await Unit.loadCat(452)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.thp, 122850);
			});

			it('strong-against should be counted', async function () {
				var cf = (await Unit.loadCat(269)).forms[1];
				cf.level = 50;
				assert.strictEqual(cf.thp, 256500);
			});

			it('behemoth slayer should be counted', async function () {
				var cf = (await Unit.loadCat(656)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.thp, 57600);
			});

			it('colossus slayer should be counted', async function () {
				var cf = (await Unit.loadCat(464)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.thp, 1044000);
			});

			it('sage slayer should be counted', async function () {
				var cf = (await Unit.loadCat(212)).forms[3];
				cf.level = 60;
				assert.strictEqual(cf.thp, 640000);
			});

		});

		describe('CatForm.hpAgainst', function () {

			it('check if underlying API is correctly called', async function () {
				var cf = (await Unit.loadCat(269)).forms[1];
				cf.level = 50;

				var spy = sinon.spy(cf, 'getthp');
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), spy.returnValues[0]);
				assert(spy.calledOnceWith({traits: Unit.TB_WHITE}));

				spy.resetHistory();
				assert.strictEqual(cf.hpAgainst(Unit.TB_RED | Unit.TB_FLOAT), spy.returnValues[0]);
				assert(spy.calledOnceWith({traits: Unit.TB_RED | Unit.TB_FLOAT}));

				spy.resetHistory();
				assert.strictEqual(cf.hpAgainst(Unit.TB_RELIC), spy.returnValues[0]);
				assert(spy.calledOnceWith({traits: Unit.TB_RELIC}));
			});

			it('EVA-killer should be counted', async function () {
				var cf = (await Unit.loadCat(412)).forms[1];
				cf.level = 50;
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 202500);
				assert.strictEqual(cf.hpAgainst(Unit.TB_EVA), 1012500);

				// combo EVA
				Unit.catEnv.addOther(15, 400);
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 202500);
				assert.strictEqual(cf.hpAgainst(Unit.TB_EVA), 5062500);
			});

			it('witch-killer should be counted', async function () {
				var cf = (await Unit.loadCat(289)).forms[1];
				cf.level = 50;
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 76410);
				assert.strictEqual(cf.hpAgainst(Unit.TB_WITCH), 764100);

				// combo witch
				Unit.catEnv.addOther(14, 400);
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 76410);
				assert.strictEqual(cf.hpAgainst(Unit.TB_WITCH), 3820500);
			});

			it('tough should be counted', async function () {
				var cf = (await Unit.loadCat(585)).forms[1];
				cf.level = 50;
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 189000);
				assert.strictEqual(cf.hpAgainst(Unit.TB_FLOAT), 945000);
				assert.strictEqual(cf.hpAgainst(Unit.TB_RELIC), 756000);

				// treasure effect up
				Unit.catEnv.setTreasure(23, 0);
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 189000);
				assert.strictEqual(cf.hpAgainst(Unit.TB_FLOAT), 756000);

				Unit.catEnv.resetTreasures();

				// combo tough up
				Unit.catEnv.setOthers(9, [10]);
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 189000);
				assert.strictEqual(cf.hpAgainst(Unit.TB_FLOAT), 1050000);

				Unit.catEnv.setOthers(9, [30]);
				assert.strictEqual(cf.hpAgainst(Unit.TB_FLOAT), 1350000);

				Unit.catEnv.setOthers(9, [10, 20]);
				assert.strictEqual(cf.hpAgainst(Unit.TB_FLOAT), 1350000);

				Unit.catEnv.resetOthers();

				// orb tough up
				var cf = (await Unit.loadCat(106)).forms[2];
				cf.level = 50;

				Unit.catEnv.setOrbs('resist', [2]);
				assert.strictEqual(cf.hpAgainst(Unit.TB_FLOAT), 1710000);

				Unit.catEnv.setOrbs('resist', [5]);
				assert.strictEqual(cf.hpAgainst(Unit.TB_FLOAT), 2052000);

				Unit.catEnv.setOrbs('resist', [2, 3]);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_FLOAT)), 2011765);

				// orb tough up shouldn't work for white
				var stub = sinon.stub(cf.info, 'trait');
				stub.get(() => Unit.TB_WHITE);
				Unit.catEnv.setOrbs('resist', []);
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 1231200);

				Unit.catEnv.setOrbs('resist', [5]);
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 1231200);
			});

			it('insane tough should be counted', async function () {
				var cf = (await Unit.loadCat(452)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 17550);
				assert.strictEqual(cf.hpAgainst(Unit.TB_METAL), 122850);
				assert.strictEqual(cf.hpAgainst(Unit.TB_RELIC), 105300);
			});

			it('strong-against should be counted', async function () {
				var cf = (await Unit.loadCat(105)).forms[2];
				cf.level = 50;
				cf.applyAllTalents();
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 139320);
				assert.strictEqual(cf.hpAgainst(Unit.TB_RED), 348300);
				assert.strictEqual(cf.hpAgainst(Unit.TB_RELIC), 278640);

				// treasure effect up
				Unit.catEnv.setTreasure(23, 0);
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 139320);
				assert.strictEqual(cf.hpAgainst(Unit.TB_RED), 278640);

				Unit.catEnv.resetTreasures();

				// combo strong up
				Unit.catEnv.setOthers(7, [10]);
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 139320);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_RED)), 387000);

				Unit.catEnv.setOthers(7, [20]);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_RED)), 435375);

				Unit.catEnv.setOthers(7, [10, 20]);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_RED)), 497571);

				Unit.catEnv.resetOthers();

				// orb strong up
				Unit.catEnv.setOrbs('good', [2]);
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 139320);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_RED)), 362813);

				Unit.catEnv.setOrbs('good', [5]);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_RED)), 387000);

				Unit.catEnv.setOrbs('good', [2, 3]);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_RED)), 387000);

				// orb strong up shouldn't work for white
				var stub = sinon.stub(cf.info, 'trait');
				stub.get(() => Unit.TB_WHITE);
				Unit.catEnv.setOrbs('good', []);
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 278640);

				Unit.catEnv.setOrbs('good', [5]);
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 278640);
			});

			it('behemoth slayer should be counted', async function () {
				var cf = (await Unit.loadCat(656)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.hpAgainst(Unit.TB_RED), 8640);
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 34560);
				assert.strictEqual(cf.hpAgainst(Unit.TB_BEAST), 14400);
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE | Unit.TB_BEAST), 57600);
			});

			it('colossus slayer should be counted', async function () {
				var cf = (await Unit.loadCat(464)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.hpAgainst(Unit.TB_FLOAT), 156600);
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 626400);
				assert.strictEqual(~~cf.hpAgainst(Unit.TB_BARON), 223714);
				assert.strictEqual(~~cf.hpAgainst(Unit.TB_WHITE | Unit.TB_BARON), 894857);
			});

			it('sage slayer should be counted', async function () {
				var cf = (await Unit.loadCat(212)).forms[3];
				cf.level = 60;
				assert.strictEqual(cf.hpAgainst(Unit.TB_WHITE), 128000);
				assert.strictEqual(cf.hpAgainst(Unit.TB_RED), 320000);
				assert.strictEqual(cf.hpAgainst(Unit.TB_SAGE), 256000);
				assert.strictEqual(cf.hpAgainst(Unit.TB_RED | Unit.TB_SAGE), 640000);
			});

			it('orb defense up should be counted', async function () {
				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;

				Unit.catEnv.setOrbs('hp', [2]);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_RED)), 114457);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_FLOAT)), 114457);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_BLACK)), 114457);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_METAL)), 114457);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_ANGEL)), 114457);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_ALIEN)), 114457);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_ZOMBIE)), 114457);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_RELIC)), 114457);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_DEMON)), 114457);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_WHITE)), 105300);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_EVA)), 105300);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_WITCH)), 105300);

				Unit.catEnv.setOrbs('hp', [5]);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_RED)), 131625);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_FLOAT)), 131625);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_BLACK)), 131625);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_METAL)), 131625);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_ANGEL)), 131625);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_ALIEN)), 131625);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_ZOMBIE)), 131625);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_RELIC)), 131625);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_DEMON)), 131625);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_WHITE)), 105300);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_EVA)), 105300);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_WITCH)), 105300);

				Unit.catEnv.setOrbs('hp', [2, 3]);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_RED)), 130064);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_FLOAT)), 130064);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_BLACK)), 130064);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_METAL)), 130064);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_ANGEL)), 130064);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_ALIEN)), 130064);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_ZOMBIE)), 130064);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_RELIC)), 130064);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_DEMON)), 130064);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_WHITE)), 105300);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_EVA)), 105300);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_WITCH)), 105300);
			});

			it('base defense up should be counted', async function () {
				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;

				Unit.catEnv.setOthers(1, [5]);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_RED)), 109403);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_FLOAT)), 109403);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_BLACK)), 109403);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_ANGEL)), 109403);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_ALIEN)), 109403);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_ZOMBIE)), 109403);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_RELIC)), 109403);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_METAL)), 105300);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_DEMON)), 105300);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_WHITE)), 105300);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_EVA)), 105300);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_WITCH)), 105300);

				Unit.catEnv.setOthers(1, [20]);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_RED)), 123882);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_FLOAT)), 123882);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_BLACK)), 123882);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_ANGEL)), 123882);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_ALIEN)), 123882);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_ZOMBIE)), 123882);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_RELIC)), 123882);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_METAL)), 105300);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_DEMON)), 105300);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_WHITE)), 105300);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_EVA)), 105300);
				assert.strictEqual(round(cf.hpAgainst(Unit.TB_WITCH)), 105300);
			});

		});

		describe('CatForm.tatks', function () {

			it('check if underlying API is correctly called', async function () {
				var cf = (await Unit.loadCat(642)).forms[1];
				cf.level = 50;

				var spy = sinon.spy(cf, 'gettatks');
				assert.strictEqual(cf.tatks, spy.returnValues[0]);
				assert(spy.calledOnceWith({mode: 'max'}));
			});

			it('surge should be counted', async function () {
				var cf = (await Unit.loadCat(642)).forms[1];
				cf.level = 50;
				assert.deepEqual(cf.tatks, [143856]);
			});

			it('mini-surge should be counted', async function () {
				var cf = (await Unit.loadCat(413)).forms[2];
				cf.level = 50;
				assert.deepEqual(cf.tatks, [134136]);
			});

			it('wave should be counted', async function () {
				var cf = (await Unit.loadCat(99)).forms[2];
				cf.level = 50;
				assert.deepEqual(cf.tatks, [46174]);
			});

			it('mini-wave should be counted', async function () {
				var cf = (await Unit.loadCat(585)).forms[1];
				cf.level = 50;
				assert.deepEqual(cf.tatks, [74844]);
			});

			it('savage should be counted', async function () {
				var cf = (await Unit.loadCat(519)).forms[2];
				cf.level = 50;
				assert.deepEqual(cf.tatks, [1093500]);
			});

			it('critical should be counted', async function () {
				var cf = (await Unit.loadCat(57)).forms[2];
				cf.level = 50;
				assert.deepEqual(cf.tatks, [21600]);
			});

			it('strengthen should be counted', async function () {
				var cf = (await Unit.loadCat(240)).forms[2];
				cf.level = 50;
				assert.deepEqual(cf.tatks, [243000]);
			});

			it('massive damage should be counted', async function () {
				var cf = (await Unit.loadCat(36)).forms[2];
				cf.level = 50;
				assert.deepEqual(cf.tatks, [96120]);
			});

			it('insane damage should be counted', async function () {
				var cf = (await Unit.loadCat(463)).forms[1];
				cf.level = 50;
				assert.deepEqual(cf.tatks, [291600]);
			});

			it('strong-against should be counted', async function () {
				var cf = (await Unit.loadCat(2)).forms[2];
				cf.level = 50;
				assert.deepEqual(cf.tatks, [2430]);
			});

			it('behemoth slayer should be counted', async function () {
				var cf = (await Unit.loadCat(656)).forms[2];
				cf.level = 50;
				assert.deepEqual(cf.tatks, [200]);
			});

			it('colossus slayer should be counted', async function () {
				var cf = (await Unit.loadCat(643)).forms[2];
				cf.level = 100;
				assert.deepEqual(cf.tatks, [114912]);
			});

			it('sage slayer should be counted', async function () {
				var cf = (await Unit.loadCat(728)).forms[1];
				cf.level = 100;
				assert.deepEqual(cf.tatks, [8100]);
			});

			it('attack base: ignore for tatk', async function () {
				var cf = (await Unit.loadCat(226)).forms[0];
				cf.level = 50;
				assert.deepEqual(cf.tatks, [173070]);
			});

			it('EVA-killer: ignore for tatk', async function () {
				var cf = (await Unit.loadCat(412)).forms[1];
				cf.level = 50;
				assert.deepEqual(cf.tatks, [74250]);
			});

			it('witch-killer: ignore for tatk', async function () {
				var cf = (await Unit.loadCat(289)).forms[1];
				cf.level = 50;
				assert.deepEqual(cf.tatks, [54810]);
			});

		});

		describe('CatForm.tdps', function () {

			it('check if underlying API is correctly called', async function () {
				// single attack
				var cf = (await Unit.loadCat(642)).forms[1];
				cf.level = 50;

				var spy = sinon.spy(cf, 'gettatks');
				assert.approximately(
					cf.tdps,
					30 * spy.returnValues[0].reduce((rv, x) => rv + x) / cf.attackF,
					Number.EPSILON,
				);
				assert(spy.calledOnceWith({mode: 'expected'}));

				// multi-attack
				var cf = (await Unit.loadCat(71)).forms[2];
				cf.level = 50;

				var spy = sinon.spy(cf, 'gettatks');
				assert.approximately(
					cf.tdps,
					30 * spy.returnValues[0].reduce((rv, x) => rv + x) / cf.attackF,
					Number.EPSILON,
				);
				assert(spy.calledOnceWith({mode: 'expected'}));
			});

			it('surge should be counted', async function () {
				var cf = (await Unit.loadCat(642)).forms[1];
				cf.level = 50;
				assert.strictEqual(round(cf.tdps), 15196);
			});

			it('mini-surge should be counted', async function () {
				var cf = (await Unit.loadCat(413)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.tdps), 26137);
			});

			it('wave should be counted', async function () {
				var cf = (await Unit.loadCat(99)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.tdps), 9833);
			});

			it('mini-wave should be counted', async function () {
				var cf = (await Unit.loadCat(585)).forms[1];
				cf.level = 50;
				assert.deepEqual(round(cf.tdps), 12137);
			});

			it('savage should be counted', async function () {
				var cf = (await Unit.loadCat(519)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.tdps), 34992);
			});

			it('critical should be counted', async function () {
				var cf = (await Unit.loadCat(57)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.tdps), 3240);
			});

			it('strengthen should be counted', async function () {
				var cf = (await Unit.loadCat(240)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.tdps), 14294);
			});

			it('massive damage should be counted', async function () {
				var cf = (await Unit.loadCat(271)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.tdps), 22387);
			});

			it('insane damage should be counted', async function () {
				var cf = (await Unit.loadCat(493)).forms[1];
				cf.level = 50;
				assert.strictEqual(round(cf.tdps), 45198);
			});

			it('strong-against should be counted', async function () {
				var cf = (await Unit.loadCat(269)).forms[1];
				cf.level = 50;
				assert.strictEqual(round(cf.tdps), 15602);
			});

			it('behemoth slayer should be counted', async function () {
				var cf = (await Unit.loadCat(658)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.tdps), 52523);
			});

			it('colossus slayer should be counted', async function () {
				var cf = (await Unit.loadCat(643)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.tdps), 29948);
			});

			it('sage slayer should be counted', async function () {
				var cf = (await Unit.loadCat(212)).forms[3];
				cf.level = 60;
				assert.strictEqual(round(cf.tdps), 22952);
			});

			it('attack base: ignore for tdps', async function () {
				var cf = (await Unit.loadCat(226)).forms[0];
				cf.level = 50;
				assert.strictEqual(round(cf.tdps), 21724);
			});

			it('EVA-killer: ignore for tdps', async function () {
				var cf = (await Unit.loadCat(412)).forms[1];
				cf.level = 50;
				assert.strictEqual(round(cf.tdps), 7628);
			});

			it('witch-killer: ignore for tdps', async function () {
				var cf = (await Unit.loadCat(289)).forms[1];
				cf.level = 50;
				assert.strictEqual(round(cf.tdps), 8263);
			});

		});

		describe('CatForm.dpsAgainst', function () {

			it('check if underlying API is correctly called', async function () {
				// single attack
				var cf = (await Unit.loadCat(269)).forms[1];
				cf.level = 50;

				var spy = sinon.spy(cf, 'gettatks');
				assert.approximately(
					cf.dpsAgainst(Unit.TB_WHITE),
					30 * spy.returnValues[0].reduce((rv, x) => rv + x) / cf.attackF,
					Number.EPSILON,
				);
				assert(spy.calledOnceWith({traits: Unit.TB_WHITE, mode: 'expected'}));

				spy.resetHistory();
				assert.approximately(
					cf.dpsAgainst(Unit.TB_RED | Unit.TB_FLOAT),
					30 * spy.returnValues[0].reduce((rv, x) => rv + x) / cf.attackF,
					Number.EPSILON,
				);
				assert(spy.calledOnceWith({traits: Unit.TB_RED | Unit.TB_FLOAT, mode: 'expected'}));
			});

			it('surge should be counted', async function () {
				var cf = (await Unit.loadCat(642)).forms[1];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 8442);
			});

			it('mini-surge should be counted', async function () {
				var cf = (await Unit.loadCat(413)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 14520);
			});

			it('wave should be counted', async function () {
				var cf = (await Unit.loadCat(99)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 9833);
			});

			it('savage should be counted', async function () {
				var cf = (await Unit.loadCat(519)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 34992);
			});

			it('critical should be counted', async function () {
				var cf = (await Unit.loadCat(57)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 3240);
			});

			it('HP-strengthen should be counted', async function () {
				var cf = (await Unit.loadCat(240)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 14294);
			});

			it('EVA-killer should be counted', async function () {
				var cf = (await Unit.loadCat(412)).forms[1];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 7628);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_EVA)), 38142);

				// combo EVA
				Unit.catEnv.addOther(15, 400);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 7628);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_EVA)), 190711);
			});

			it('witch-killer should be counted', async function () {
				var cf = (await Unit.loadCat(289)).forms[1];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 8263);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WITCH)), 41314);

				// combo witch
				Unit.catEnv.addOther(14, 400);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 8263);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WITCH)), 206570);
			});

			it('massive damage should be counted', async function () {
				var cf = (await Unit.loadCat(271)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 5597);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_FLOAT)), 22387);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RELIC)), 16790);

				// treasure effect up
				Unit.catEnv.setTreasure(23, 0);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 5597);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_FLOAT)), 16790);

				Unit.catEnv.resetTreasures();

				// combo massive up
				Unit.catEnv.setOthers(8, [10]);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 5597);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_FLOAT)), 24626);

				Unit.catEnv.setOthers(8, [20]);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_FLOAT)), 26864);

				Unit.catEnv.setOthers(8, [10, 20]);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_FLOAT)), 29103);

				Unit.catEnv.resetOthers();

				// orb massive up
				Unit.catEnv.setOrbs('massive', [2]);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 5597);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_FLOAT)), 23506);

				Unit.catEnv.setOrbs('massive', [5]);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_FLOAT)), 25185);

				Unit.catEnv.setOrbs('massive', [2, 3]);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_FLOAT)), 25185);

				// orb massive up shouldn't work for white
				var stub = sinon.stub(cf.info, 'trait');
				stub.get(() => Unit.TB_WHITE);
				Unit.catEnv.setOrbs('massive', []);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 16790);

				Unit.catEnv.setOrbs('massive', [5]);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 16790);
			});

			it('insane damage should be counted', async function () {
				var cf = (await Unit.loadCat(493)).forms[1];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 7533);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_ZOMBIE)), 45198);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RELIC)), 37665);
			});

			it('strong-against should be counted', async function () {
				var cf = (await Unit.loadCat(105)).forms[2];
				cf.level = 50;
				cf.applyAllTalents();
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 17639);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 31749);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RELIC)), 26458);

				// treasure effect up
				Unit.catEnv.setTreasure(23, 0);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 17639);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 26458);

				Unit.catEnv.resetTreasures();

				// combo strong up
				Unit.catEnv.setOthers(7, [10]);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 17639);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 34924);

				Unit.catEnv.setOthers(7, [20]);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 38099);

				Unit.catEnv.setOthers(7, [10, 20]);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 41274);

				Unit.catEnv.resetOthers();

				// orb strong up
				Unit.catEnv.setOrbs('good', [2]);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 17639);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 33866);

				Unit.catEnv.setOrbs('good', [5]);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 37041);

				Unit.catEnv.setOrbs('good', [2, 3]);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 37041);

				// orb strong up shouldn't work for white
				var stub = sinon.stub(cf.info, 'trait');
				stub.get(() => Unit.TB_WHITE);
				Unit.catEnv.setOrbs('good', []);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 26458);

				Unit.catEnv.setOrbs('good', [5]);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 26458);
			});

			it('behemoth slayer should be counted', async function () {
				var cf = (await Unit.loadCat(658)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 5252);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 21009);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_BEAST)), 13131);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED | Unit.TB_BEAST)), 52523);
			});

			it('colossus slayer should be counted', async function () {
				var cf = (await Unit.loadCat(643)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 6239);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_BARON)), 9983);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RELIC)), 18718);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RELIC | Unit.TB_BARON)), 29948);
			});

			it('sage slayer should be counted', async function () {
				var cf = (await Unit.loadCat(212)).forms[3];
				cf.level = 60;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 10626);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 19127);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_SAGE)), 12751);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED | Unit.TB_SAGE)), 22952);
			});

			it('attack only: 0 dps when not attackable', async function () {
				var cf = (await Unit.loadCat(226)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_ALIEN)), 32586);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 0);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_FLOAT)), 0);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_BLACK)), 0);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_METAL)), 0);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_ANGEL)), 0);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_ZOMBIE)), 0);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RELIC)), 0);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_DEMON)), 0);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 0);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_EVA)), 0);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WITCH)), 0);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_BEAST)), 0);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_BARON)), 0);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_SAGE)), 0);
			});

			it('metal: 1 damage if no critical attack', async function () {
				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;
				assert.approximately(cf.dpsAgainst(Unit.TB_METAL), 1 / 68 * 30, Number.EPSILON);
			});

			it('metal: n damage if multi-attack and no critical attack', async function () {
				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;
				assert.approximately(cf.dpsAgainst(Unit.TB_METAL), 3 / 93 * 30, Number.EPSILON);
			});

			it('metal: double damage for critical attack and 1 for non-critical', async function () {
				var cf = (await Unit.loadCat(57)).forms[2];
				cf.level = 50;
				assert.approximately(cf.dpsAgainst(Unit.TB_METAL), (2*10800*0.5 + 1*0.5) / 150 * 30, Number.EPSILON);
			});

			it('metal: double damage for critical attack and 1 for non-critical for multi-attack', async function () {
				var cf = (await Unit.loadCat(314)).forms[2];
				cf.level = 50;
				assert.approximately(cf.dpsAgainst(Unit.TB_METAL), (2*4050*0.15 + 1*0.85) * 3 / 161 * 30, Number.EPSILON);
			});

			it('metal: 1 damage for attacks without abilities enabled for multi-attack', async function () {
				var cf = (await Unit.loadCat(418)).forms[1];
				cf.level = 50;
				assert.approximately(cf.dpsAgainst(Unit.TB_METAL), (2*5400 + 2) / 181 * 30, Number.EPSILON);
			});

			it('metal: 1 damage for non-critical waves', async function () {
				// no critical, 100% wave
				var cf = (await Unit.loadCat(94)).forms[2];
				cf.level = 50;
				assert.approximately(cf.dpsAgainst(Unit.TB_METAL), 2 / 125 * 30, Number.EPSILON);

				// no critical, 15% wave
				var cf = (await Unit.loadCat(99)).forms[2];
				cf.level = 50;
				assert.approximately(cf.dpsAgainst(Unit.TB_METAL), 1.15 / 81 * 30, Number.EPSILON);

				// 5% critical, 20% wave
				var cf = (await Unit.loadCat(311)).forms[2];
				cf.level = 50;
				cf.applyAllTalents();
				assert.approximately(cf.dpsAgainst(Unit.TB_METAL), ((2*11664 * 1.2 * 0.05) + (1.2 * 0.95)) / 53 * 30, Number.EPSILON);
			});

			it('metal: 1 damage for non-critical miniwaves', async function () {
				// no critical, 100% miniwave
				var cf = (await Unit.loadCat(585)).forms[1];
				cf.level = 50;
				assert.approximately(cf.dpsAgainst(Unit.TB_METAL), 2 / 185 * 30, Number.EPSILON);

				// no critical, 30% miniwave
				var cf = (await Unit.loadCat(697)).forms[2];
				cf.level = 50;
				assert.approximately(cf.dpsAgainst(Unit.TB_METAL), 1.30 / 131 * 30, Number.EPSILON);
			});

			it('metal: 1 damage for non-critical surges', async function () {
				// no critical, 100% Lv3 surge
				var cf = (await Unit.loadCat(554)).forms[2];
				cf.level = 50;
				assert.approximately(cf.dpsAgainst(Unit.TB_METAL), (1+1*3) / 127 * 30, Number.EPSILON);

				// no critical, 30% Lv1 surge
				var cf = (await Unit.loadCat(547)).forms[1];
				cf.level = 50;
				assert.approximately(cf.dpsAgainst(Unit.TB_METAL), (1+0.3*1) / 151 * 30, Number.EPSILON);

				// 15% critical, 50% Lv1 surge
				var cf = (await Unit.loadCat(446)).forms[2];
				cf.level = 50;
				assert.approximately(cf.dpsAgainst(Unit.TB_METAL), ((2*4860*(1+0.5*1) * 0.15) + ((1+0.5*1) * 0.85)) / 104 * 30, Number.EPSILON);
			});

			it('metal: 1 damage for non-critical minisurges', async function () {
				// no critical, 100% Lv2 minisurge
				var cf = (await Unit.loadCat(625)).forms[2];
				cf.level = 50;
				assert.approximately(cf.dpsAgainst(Unit.TB_METAL), (1+1*2) / 427 * 30, Number.EPSILON);

				// no critical, 30% Lv1 minisurge
				var cf = (await Unit.loadCat(413)).forms[2];
				cf.level = 50;
				assert.approximately(cf.dpsAgainst(Unit.TB_METAL), (1+0.3*1) / 136 * 30, Number.EPSILON);

				// no critical, 100% Lv1 minisurge for 3 attacks
				var cf = (await Unit.loadCat(705)).forms[1];
				cf.level = 50;
				assert.approximately(cf.dpsAgainst(Unit.TB_METAL), (1+1*1) * 3 / 216 * 30, Number.EPSILON);
			});

			it('base: include surge and exclude wave as a general calculation', async function () {
				// surge
				var cf = (await Unit.loadCat(543)).forms[1];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 18621);
				assert.strictEqual(round(cf.dpsAgainst(0)), 18621);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_INFN)), 18621);

				// minisurge
				var cf = (await Unit.loadCat(710)).forms[1];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 9100);
				assert.strictEqual(round(cf.dpsAgainst(0)), 9100);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_INFN)), 9100);

				// wave
				var cf = (await Unit.loadCat(94)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 3370);
				assert.strictEqual(round(cf.dpsAgainst(0)), 1685);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_INFN)), 1685);

				// miniwave
				var cf = (await Unit.loadCat(585)).forms[1];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 12137);
				assert.strictEqual(round(cf.dpsAgainst(0)), 10114);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_INFN)), 10114);
			});

			it('base: count attack base skill only for base (traits & TB_INFN || traits === 0)', async function () {
				var cf = (await Unit.loadCat(226)).forms[0];
				cf.level = 50;
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_FLOAT)), 21724);
				assert.strictEqual(round(cf.dpsAgainst(0)), 86897);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_INFN)), 86897);
			});

			it('orb attack up should be counted', async function () {
				// basic
				var cf = (await Unit.loadCat(32)).forms[2];
				cf.level = 50;

				Unit.catEnv.setOrbs('atk', [2]);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 10038);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_FLOAT)), 10038);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_BLACK)), 10038);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_ANGEL)), 10038);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_ALIEN)), 10038);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_ZOMBIE)), 10038);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RELIC)), 10038);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_DEMON)), 10038);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 9346);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_EVA)), 9346);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WITCH)), 9346);

				Unit.catEnv.setOrbs('atk', [5]);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 11077);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_FLOAT)), 11077);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_BLACK)), 11077);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_ANGEL)), 11077);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_ALIEN)), 11077);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_ZOMBIE)), 11077);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RELIC)), 11077);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_DEMON)), 11077);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 9346);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_EVA)), 9346);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WITCH)), 9346);

				Unit.catEnv.setOrbs('atk', [2, 3]);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 11077);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_FLOAT)), 11077);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_BLACK)), 11077);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_ANGEL)), 11077);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_ALIEN)), 11077);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_ZOMBIE)), 11077);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RELIC)), 11077);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_DEMON)), 11077);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WHITE)), 9346);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_EVA)), 9346);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_WITCH)), 9346);

				// strong should not multiply
				var cf = (await Unit.loadCat(18)).forms[2];
				cf.level = 50;
				cf.applyAllTalents();
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 3695);

				// massive should not multiply
				var cf = (await Unit.loadCat(36)).forms[2];
				cf.level = 50;
				cf.applyAllTalents();
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_FLOAT)), 29701);

				// strengthen should not multiply
				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;
				cf.applyAllTalents();
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 169081);

				// critical should not multiply
				var cf = (await Unit.loadCat(46)).forms[2];
				cf.level = 50;
				cf.applyAllTalents();
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 4314);

				// savage should not multiply
				var cf = (await Unit.loadCat(307)).forms[2];
				cf.level = 50;
				cf.applyAllTalents();
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 5825);

				// wave should multiply (except for base)
				var cf = (await Unit.loadCat(13)).forms[2];
				cf.level = 50;
				cf.applyAllTalents();
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_FLOAT)), 20346);
				assert.strictEqual(round(cf.dpsAgainst(0)), 16043);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_INFN)), 16043);

				// miniwave should multiply (except for base)
				var cf = (await Unit.loadCat(240)).forms[2];
				cf.level = 50;
				cf.applyAllTalents();
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_RED)), 20192);
				assert.strictEqual(round(cf.dpsAgainst(0)), 17153);
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_INFN)), 17153);

				// surge should multiply
				var cf = (await Unit.loadCat(10)).forms[2];
				cf.level = 50;
				cf.applyAllTalents();
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_FLOAT)), 11118);

				// minisurge should multiply
				var cf = (await Unit.loadCat(107)).forms[2];
				cf.level = 50;
				cf.applyAllTalents();
				assert.strictEqual(round(cf.dpsAgainst(Unit.TB_FLOAT)), 25707);
			});

		});

		describe('CatForm.price', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.price, 75);

				var cf = (await Unit.loadCat(61)).forms[2];
				assert.strictEqual(cf.price, 1425);

				var cf = (await Unit.loadCat(61)).forms[2];
				cf.applyAllTalents();
				assert.strictEqual(cf.price, 975);
			});

		});

		describe('CatForm.cd', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.cd, 60);

				var cf = (await Unit.loadCat(8)).forms[2];
				assert.strictEqual(cf.cd, 666);
			});

			it('talents should be counted', async function () {
				var cf0 = (await Unit.loadCat(19)).forms[2];
				var cf = cf0;
				cf.level = 50;
				assert.strictEqual(cf.cd, 136);

				var cf = cf0.clone();
				cf.applyAllTalents([0, 0, 5, 0, 0]);
				assert.strictEqual(cf.cd, 101);

				var cf = cf0.clone();
				cf.applyAllTalents([0, 0, 10, 0, 0]);
				assert.strictEqual(cf.cd, 76);
			});

			it('research and treasures should be counted', async function () {
				var cf = (await Unit.loadCat(7)).forms[0];
				Unit.catEnv.setTreasure(2, 0);
				Unit.catEnv.setTreasure(17, 1);
				assert.strictEqual(cf.cd, 570);

				Unit.catEnv.setTreasure(2, 100);
				assert.strictEqual(cf.cd, 540);

				Unit.catEnv.setTreasure(2, 300);
				assert.strictEqual(cf.cd, 480);

				Unit.catEnv.setTreasure(17, 10);
				assert.strictEqual(cf.cd, 426);

				Unit.catEnv.setTreasure(17, 30);
				assert.strictEqual(cf.cd, 306);
			});

			it('combo research up should be counted', async function () {
				var cf = (await Unit.loadCat(7)).forms[2];
				assert.strictEqual(cf.cd, 506);

				Unit.catEnv.setOthers(5, [264]);
				assert.strictEqual(cf.cd, 480);

				Unit.catEnv.setOthers(5, [792]);
				assert.strictEqual(cf.cd, 427);

				Unit.catEnv.setOthers(5, [264, 792]);
				assert.strictEqual(cf.cd, 401);
			});

		});

		describe('CatForm.icon', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.strictEqual(cat.forms[0].icon, "/img/u/0/0.png");
				assert.strictEqual(cat.forms[1].icon, "/img/u/0/1.png");
				assert.strictEqual(cat.forms[2].icon, "/img/u/0/2.png");

				var cat = await Unit.loadCat(1);
				assert.strictEqual(cat.forms[0].icon, "/img/u/1/0.png");
				assert.strictEqual(cat.forms[1].icon, "/img/u/1/1.png");
				assert.strictEqual(cat.forms[2].icon, "/img/u/1/2.png");
			});

			it('egg', async function () {
				var cat = await Unit.loadCat(656);
				assert.strictEqual(cat.forms[0].icon, "/img/s/0/0.png");
				assert.strictEqual(cat.forms[1].icon, "/img/s/1/1.png");
				assert.strictEqual(cat.forms[2].icon, "/img/u/656/2.png");

				var cat = await Unit.loadCat(658);
				assert.strictEqual(cat.forms[0].icon, "/img/s/0/0.png");
				assert.strictEqual(cat.forms[1].icon, "/img/s/2/1.png");
				assert.strictEqual(cat.forms[2].icon, "/img/u/658/2.png");
			});

		});

		describe('CatForm._getab', function () {

			it('return original ability data if param is undefined', async function () {
				var cf = (await Unit.loadCat(441)).forms[1];
				assert.deepEqual(cf._getab(), {
					[Unit.AB_STRENGTHEN]: [60, 100],
					[Unit.AB_MASSIVE]: null,
				});
			});

			it('return original ability data if param is null', async function () {
				var cf = (await Unit.loadCat(441)).forms[1];
				assert.deepEqual(cf._getab(null), {
					[Unit.AB_STRENGTHEN]: [60, 100],
					[Unit.AB_MASSIVE]: null,
				});
			});

			it('return filtered abilities if param is an Array', async function () {
				var cf = (await Unit.loadCat(441)).forms[1];
				assert.deepEqual(cf._getab([Unit.AB_STRENGTHEN]), {
					[Unit.AB_STRENGTHEN]: [60, 100],
				});

				var cf = (await Unit.loadCat(441)).forms[1];
				assert.deepEqual(cf._getab([Unit.AB_MASSIVE]), {
					[Unit.AB_MASSIVE]: null,
				});

				// order does not matter
				var cf = (await Unit.loadCat(441)).forms[1];
				assert.deepEqual(cf._getab([Unit.AB_MASSIVE, Unit.AB_STRENGTHEN]), {
					[Unit.AB_STRENGTHEN]: [60, 100],
					[Unit.AB_MASSIVE]: null,
				});

				// ignore non-existent ID
				var cf = (await Unit.loadCat(441)).forms[1];
				assert.deepEqual(cf._getab([[Unit.AB_STRENGTHEN], Unit.AB_LETHAL, Unit.AB_CRIT]), {
					[Unit.AB_STRENGTHEN]: [60, 100],
				});
			});

			it('return specified ability key and value if Object value is provided', async function () {
				var cf = (await Unit.loadCat(441)).forms[1];
				assert.deepEqual(
					cf._getab({
						'1': [50, 100],
					}),
					{
						'1': [50, 100],
					},
				);

				// ignore non-existent IDs
				var cf = (await Unit.loadCat(441)).forms[1];
				assert.deepEqual(
					cf._getab({
						'1': 100,
						'2': null,
						'3': [50, 100],
					}),
					{
						'1': 100,
					},
				);
			});

			it('return original ability key and value if Object value is undefined', async function () {
				var cf = (await Unit.loadCat(441)).forms[1];
				assert.deepEqual(
					cf._getab({
						'1': undefined,
					}),
					{
						'1': [60, 100],
					},
				);

				assert.deepEqual(
					cf._getab({
						'28': undefined,
					}),
					{
						'28': null,
					},
				);

				// ignore non-existent IDs
				var cf = (await Unit.loadCat(441)).forms[1];
				assert.deepEqual(
					cf._getab({
						'2': undefined,
					}),
					{},
				);
			});

		});

		describe('CatForm.getthp', function () {

			it('ability filter', async function () {
				var cf = (await Unit.loadCat(61)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.getthp({filter: []}), 102600);
				assert.strictEqual(cf.getthp({filter: [Unit.AB_RESIST]}), 513000);

			});

		});

		describe('CatForm.gettatks', function () {

			it('ability filter', async function () {
				var cf = (await Unit.loadCat(441)).forms[1];
				cf.level = 50;
				assert.deepEqual(cf.gettatks({filter: []}), [29700]);
				assert.deepEqual(cf.gettatks({filter: [Unit.AB_STRENGTHEN]}), [59400]);
				assert.deepEqual(cf.gettatks({filter: [Unit.AB_MASSIVE]}), [89100]);
				assert.deepEqual(cf.gettatks({filter: [Unit.AB_STRENGTHEN, Unit.AB_MASSIVE]}), [178200]);
				assert.deepEqual(cf.gettatks({filter: {[Unit.AB_STRENGTHEN]: [50, 250]}}), [103950]);
			});

			it('mode', async function () {
				var cf = (await Unit.loadCat(57)).forms[2];
				cf.level = 50;
				assert.deepEqual(cf.gettatks({mode: 'expected'}), [16200]);
				assert.deepEqual(cf.gettatks({mode: 'max'}), [21600]);
			});

			it('metal mode', async function () {
				var cf = (await Unit.loadCat(441)).forms[1];
				cf.level = 50;
				assert.deepEqual(cf.gettatks({traits: Unit.TB_METAL, metal: true}), [1]);
				assert.deepEqual(cf.gettatks({traits: Unit.TB_METAL, metal: false}), [59400]);
			});

		});

		describe('CatForm.hasAb', function () {

			it('basic', async function () {
				// ab data is null
				var cf = (await Unit.loadCat(2)).forms[2];
				assert.isTrue(cf.hasAb(Unit.AB_GOOD));

				var cf = (await Unit.loadCat(0)).forms[2];
				assert.isFalse(cf.hasAb(Unit.AB_GOOD));

				// ab data is number
				var cf = (await Unit.loadCat(57)).forms[2];
				assert.isTrue(cf.hasAb(Unit.AB_CRIT));

				var cf = (await Unit.loadCat(0)).forms[2];
				assert.isFalse(cf.hasAb(Unit.AB_CRIT));

				// ab data is array
				var cf = (await Unit.loadCat(496)).forms[2];
				assert.isTrue(cf.hasAb(Unit.AB_S));

				var cf = (await Unit.loadCat(0)).forms[2];
				assert.isFalse(cf.hasAb(Unit.AB_S));
			});

		});

		describe('CatForm.hasRes', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(47)).forms[2];
				cf.applyAllTalents();
				assert.isTrue(cf.hasRes(Unit.RES_CURSE));

				var cf = (await Unit.loadCat(0)).forms[2];
				assert.isFalse(cf.hasRes(Unit.RES_CURSE));
			});

		});

		describe('CatForm.waveLv', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.waveLv, 0);

				var cf = (await Unit.loadCat(352)).forms[2];
				assert.strictEqual(cf.waveLv, 5);
			});

		});

		describe('CatForm.surgeLv', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.surgeLv, 0);

				var cf = (await Unit.loadCat(543)).forms[1];
				assert.strictEqual(cf.surgeLv, 3);
			});

		});

		describe('CatForm.miniWaveLv', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.miniWaveLv, 0);

				var cf = (await Unit.loadCat(585)).forms[1];
				assert.strictEqual(cf.miniWaveLv, 5);
			});

		});

		describe('CatForm.miniSurgeLv', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.miniSurgeLv, 0);

				var cf = (await Unit.loadCat(413)).forms[2];
				assert.strictEqual(cf.miniSurgeLv, 1);
			});

		});

		describe('CatForm.waveProb', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.waveProb, 0);

				var cf = (await Unit.loadCat(94)).forms[2];
				assert.strictEqual(cf.waveProb, 100);
			});

		});

		describe('CatForm.miniWaveProb', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.miniWaveProb, 0);

				var cf = (await Unit.loadCat(585)).forms[1];
				assert.strictEqual(cf.miniWaveProb, 100);
			});

		});

		describe('CatForm.surgeProb', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.surgeProb, 0);

				var cf = (await Unit.loadCat(543)).forms[1];
				assert.strictEqual(cf.surgeProb, 100);
			});

		});

		describe('CatForm.miniSurgeProb', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.miniSurgeProb, 0);

				var cf = (await Unit.loadCat(705)).forms[1];
				assert.strictEqual(cf.miniSurgeProb, 100);
			});

		});

		describe('CatForm.critProb', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.critProb, 0);

				var cf = (await Unit.loadCat(57)).forms[2];
				assert.strictEqual(cf.critProb, 50);
			});

			it('combos should be counted', async function () {
				var cf = (await Unit.loadCat(57)).forms[2];

				Unit.catEnv.setOthers(6, [1]);
				assert.strictEqual(cf.critProb, 51);

				Unit.catEnv.setOthers(6, [2]);
				assert.strictEqual(cf.critProb, 52);

				Unit.catEnv.setOthers(6, [1, 2]);
				assert.strictEqual(cf.critProb, 53);

				// 0 if no ability
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.critProb, 0);
			});

		});

		describe('CatForm.slowTime', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.slowTime, 0);

				var cf = (await Unit.loadCat(138)).forms[0];
				assert.strictEqual(cf.slowTime, 84);
			});

			it('treasures should be counted', async function () {
				var cf = (await Unit.loadCat(138)).forms[0];

				Unit.catEnv.setTreasure(23, 0);
				assert.strictEqual(round(cf.slowTime), 70);

				Unit.catEnv.setTreasure(23, 100);
				assert.strictEqual(round(cf.slowTime), 74);

				Unit.catEnv.setTreasure(23, 300);
				assert.strictEqual(round(cf.slowTime), 84);
			});

			it('combos should be counted', async function () {
				var cf = (await Unit.loadCat(138)).forms[0];

				Unit.catEnv.setOthers(10, [10]);
				assert.strictEqual(round(cf.slowTime), 92);

				Unit.catEnv.setOthers(10, [30]);
				assert.strictEqual(round(cf.slowTime), 109);

				Unit.catEnv.setOthers(10, [10, 20]);
				assert.strictEqual(round(cf.slowTime), 109);

				// 0 if no ability
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.slowTime, 0);
			});

		});

		describe('CatForm.slowProb', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.slowProb, 0);

				var cf = (await Unit.loadCat(138)).forms[0];
				assert.strictEqual(cf.slowProb, 20);
			});

		});

		describe('CatForm.slowCover', function () {

			it('check if underlying API is correctly called', async function () {
				var cf = (await Unit.loadCat(138)).forms[0];
				var spy1 = sinon.spy(cf, 'slowProb', ['get']);
				var spy2 = sinon.spy(cf, 'slowTime', ['get']);
				var spy3 = sinon.spy(cf, 'getCover');
				assert.strictEqual(cf.slowCover, spy3.returnValues[0]);
				assert.strictEqual(round(spy3.returnValues[0]), 34);
				assert(spy1.get.calledOnceWith());
				assert(spy2.get.calledOnceWith());
				assert(spy3.calledOnceWith(spy1.get.returnValues[0], spy2.get.returnValues[0]));
			});

			it('check safety when no ability', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.slowCover, 0);
			});

		});

		describe('CatForm.stopTime', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.stopTime, 0);

				var cf = (await Unit.loadCat(439)).forms[0];
				assert.strictEqual(cf.stopTime, 36);
			});

			it('treasures should be counted', async function () {
				var cf = (await Unit.loadCat(439)).forms[0];

				Unit.catEnv.setTreasure(23, 0);
				assert.strictEqual(round(cf.stopTime), 30);

				Unit.catEnv.setTreasure(23, 100);
				assert.strictEqual(round(cf.stopTime), 32);

				Unit.catEnv.setTreasure(23, 300);
				assert.strictEqual(round(cf.stopTime), 36);
			});

			it('combos should be counted', async function () {
				var cf = (await Unit.loadCat(439)).forms[0];

				Unit.catEnv.setOthers(11, [10]);
				assert.strictEqual(round(cf.stopTime), 40);

				Unit.catEnv.setOthers(11, [20]);
				assert.strictEqual(round(cf.stopTime), 43);

				Unit.catEnv.setOthers(11, [10, 20]);
				assert.strictEqual(round(cf.stopTime), 47);

				// 0 if no ability
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.stopTime, 0);
			});

		});

		describe('CatForm.stopProb', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.stopProb, 0);

				var cf = (await Unit.loadCat(439)).forms[0];
				assert.strictEqual(cf.stopProb, 100);
			});

		});

		describe('CatForm.stopCover', function () {

			it('check if underlying API is correctly called', async function () {
				var cf = (await Unit.loadCat(439)).forms[0];
				var spy1 = sinon.spy(cf, 'stopProb', ['get']);
				var spy2 = sinon.spy(cf, 'stopTime', ['get']);
				var spy3 = sinon.spy(cf, 'getCover');
				assert.strictEqual(cf.stopCover, spy3.returnValues[0]);
				assert.strictEqual(round(spy3.returnValues[0]), 35);
				assert(spy1.get.calledOnceWith());
				assert(spy2.get.calledOnceWith());
				assert(spy3.calledOnceWith(spy1.get.returnValues[0], spy2.get.returnValues[0]));
			});

			it('check safety when no ability', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.stopCover, 0);
			});

		});

		describe('CatForm.curseTime', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.curseTime, 0);

				var cf = (await Unit.loadCat(543)).forms[0];
				assert.strictEqual(cf.curseTime, 162);
			});

			it('treasures should be counted', async function () {
				var cf = (await Unit.loadCat(543)).forms[0];

				Unit.catEnv.setTreasure(23, 0);
				assert.strictEqual(cf.curseTime, 135);

				Unit.catEnv.setTreasure(23, 100);
				assert.strictEqual(cf.curseTime, 144);

				Unit.catEnv.setTreasure(23, 300);
				assert.strictEqual(cf.curseTime, 162);
			});

		});

		describe('CatForm.curseProb', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.curseProb, 0);

				var cf = (await Unit.loadCat(543)).forms[0];
				assert.strictEqual(cf.curseProb, 100);
			});

		});

		describe('CatForm.curseCover', function () {

			it('check if underlying API is correctly called', async function () {
				var cf = (await Unit.loadCat(543)).forms[0];
				var spy1 = sinon.spy(cf, 'curseProb', ['get']);
				var spy2 = sinon.spy(cf, 'curseTime', ['get']);
				var spy3 = sinon.spy(cf, 'getCover');
				assert.strictEqual(cf.curseCover, spy3.returnValues[0]);
				assert.strictEqual(round(spy3.returnValues[0]), 95);
				assert(spy1.get.calledOnceWith());
				assert(spy2.get.calledOnceWith());
				assert(spy3.calledOnceWith(spy1.get.returnValues[0], spy2.get.returnValues[0]));
			});

			it('check safety when no ability', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.curseCover, 0);
			});

		});

		describe('CatForm.weakTime', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.weakTime, 0);

				var cf = (await Unit.loadCat(198)).forms[2];
				assert.strictEqual(cf.weakTime, 240);
			});

			it('treasures should be counted', async function () {
				var cf = (await Unit.loadCat(198)).forms[2];

				Unit.catEnv.setTreasure(23, 0);
				assert.strictEqual(cf.weakTime, 200);

				Unit.catEnv.setTreasure(23, 100);
				assert.strictEqual(cf.weakTime, 213);

				Unit.catEnv.setTreasure(23, 300);
				assert.strictEqual(cf.weakTime, 240);
			});

			it('combos should be counted', async function () {
				var cf = (await Unit.loadCat(198)).forms[2];

				Unit.catEnv.setOthers(12, [10]);
				assert.strictEqual(cf.weakTime, 264);

				Unit.catEnv.setOthers(12, [30]);
				assert.strictEqual(cf.weakTime, 312);

				Unit.catEnv.setOthers(12, [10, 20]);
				assert.strictEqual(cf.weakTime, 312);

				// 0 if no ability
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.weakTime, 0);
			});

		});

		describe('CatForm.weakProb', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.weakProb, 0);

				var cf = (await Unit.loadCat(198)).forms[2];
				assert.strictEqual(cf.weakProb, 100);
			});

		});

		describe('CatForm.weakCover', function () {

			it('check if underlying API is correctly called', async function () {
				var cf = (await Unit.loadCat(33)).forms[2];
				var spy1 = sinon.spy(cf, 'weakProb', ['get']);
				var spy2 = sinon.spy(cf, 'weakTime', ['get']);
				var spy3 = sinon.spy(cf, 'getCover');
				assert.strictEqual(cf.weakCover, spy3.returnValues[0]);
				assert.strictEqual(round(spy3.returnValues[0]), 74);
				assert(spy1.get.calledOnceWith());
				assert(spy2.get.calledOnceWith());
				assert(spy3.calledOnceWith(spy1.get.returnValues[0], spy2.get.returnValues[0]));
			});

			it('check safety when no ability', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.weakCover, 0);
			});

		});

		describe('CatForm.weakExtent', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.weakExtent, 0);

				var cf = (await Unit.loadCat(198)).forms[2];
				assert.strictEqual(cf.weakExtent, 50);
			});

		});

		describe('CatForm.strengthenExtent', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.strengthenExtent, 0);

				var cf = (await Unit.loadCat(441)).forms[1];
				assert.strictEqual(cf.strengthenExtent, 100);
			});

			it('combos should be counted', async function () {
				var cf = (await Unit.loadCat(441)).forms[1];

				Unit.catEnv.setOthers(13, [20]);
				assert.strictEqual(cf.strengthenExtent, 120);

				Unit.catEnv.setOthers(13, [30]);
				assert.strictEqual(cf.strengthenExtent, 130);

				Unit.catEnv.setOthers(13, [20, 30]);
				assert.strictEqual(cf.strengthenExtent, 150);

				// 0 if no ability
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.strengthenExtent, 0);
			});

		});

		describe('CatForm.lethalProb', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.lethalProb, 0);

				var cf = (await Unit.loadCat(37)).forms[1];
				assert.strictEqual(cf.lethalProb, 50);

				var cf = (await Unit.loadCat(37)).forms[2];
				assert.strictEqual(cf.lethalProb, 100);
			});

		});

		describe('CatForm.savageExtent', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.savageExtent, 0);

				var cf = (await Unit.loadCat(519)).forms[2];
				assert.strictEqual(cf.savageExtent, 200);
			});

		});

		describe('CatForm.savageProb', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.savageProb, 0);

				var cf = (await Unit.loadCat(519)).forms[2];
				assert.strictEqual(cf.savageProb, 30);
			});

		});

		describe('CatForm.barrierBreakProb', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.barrierBreakProb, 0);

				var cf = (await Unit.loadCat(245)).forms[2];
				assert.strictEqual(cf.barrierBreakProb, 30);
			});

		});

		describe('CatForm.shieldBreakProb', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.shieldBreakProb, 0);

				var cf = (await Unit.loadCat(617)).forms[2];
				assert.strictEqual(cf.shieldBreakProb, 50);
			});

		});

		describe('CatForm.dodgeTime', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.dodgeTime, 0);

				var cf = (await Unit.loadCat(187)).forms[2];
				assert.strictEqual(cf.dodgeTime, 60);
			});

		});

		describe('CatForm.dodgeProb', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.dodgeProb, 0);

				var cf = (await Unit.loadCat(187)).forms[2];
				assert.strictEqual(cf.dodgeProb, 20);
			});

		});

		describe('CatForm.beastDodgeProb', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.beastDodgeProb, 0);

				var cf = (await Unit.loadCat(532)).forms[2];
				assert.strictEqual(cf.beastDodgeProb, 30);
			});

		});

		describe('CatForm.beastDodgeTime', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.beastDodgeTime, 0);

				var cf = (await Unit.loadCat(532)).forms[2];
				assert.strictEqual(cf.beastDodgeTime, 30);
			});

		});

		describe('Search keys', function () {

			it('hasab', async function () {
				var cf = (await Unit.loadCat(2)).forms[2];
				var args = [Unit.AB_GOOD];
				var spy = sinon.spy(cf, 'hasAb');
				assert.strictEqual(cf.__hasab(...args), spy.returnValues[0]);
				assert.isTrue(spy.returnValues[0]);
				assert(spy.calledOnceWith(...args));
			});

			it('hasres', async function () {
				var cf = (await Unit.loadCat(47)).forms[2];
				cf.applyAllTalents();
				var args = [Unit.RES_CURSE];
				var spy = sinon.spy(cf, 'hasRes');
				assert.strictEqual(cf.__hasres(...args), spy.returnValues[0]);
				assert.isTrue(spy.returnValues[0]);
				assert(spy.calledOnceWith(...args));
			});

			it('dpsagainst', async function () {
				var cf = (await Unit.loadCat(2)).forms[2];
				cf.level = 10;
				assert.strictEqual(round(cf.__dpsagainst(Unit.TB_RED)), 700);

				var cf = (await Unit.loadCat(2)).forms[2];
				cf.level = 10;
				assert.strictEqual(round(cf.__dpsagainst(Unit.TB_BLACK)), 389);
			});

			it('hpagainst', async function () {
				var cf = (await Unit.loadCat(2)).forms[2];
				cf.level = 10;
				assert.strictEqual(cf.__hpagainst(Unit.TB_RED), 7000);

				var cf = (await Unit.loadCat(2)).forms[2];
				cf.level = 10;
				assert.strictEqual(cf.__hpagainst(Unit.TB_BLACK), 2800);
			});

			it('evol_require', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__evol_require(0), 0);

				var cf = (await Unit.loadCat(44)).forms[2];
				assert.strictEqual(cf.__evol_require(0), 1000000);
				assert.strictEqual(cf.__evol_require(35), 7);
				assert.strictEqual(cf.__evol_require(34), 0);
			});

			it('evol4_require', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__evol4_require(0), 0);

				var cf = (await Unit.loadCat(138)).forms[3];
				assert.strictEqual(cf.__evol4_require(0), 1000000);
				assert.strictEqual(cf.__evol4_require(40), 2);
				assert.strictEqual(cf.__evol4_require(167), 5);
			});

			it('id', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__id(), 0);

				var cf = (await Unit.loadCat(138)).forms[3];
				assert.strictEqual(cf.__id(), 138);
			});

			it('rarity', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__rarity(), 0);

				var cf = (await Unit.loadCat(138)).forms[0];
				assert.strictEqual(cf.__rarity(), 4);
			});

			it('formc', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__formc(), 1);

				var cf = (await Unit.loadCat(0)).forms[1];
				assert.strictEqual(cf.__formc(), 2);

				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__formc(), 3);

				var cf = (await Unit.loadCat(138)).forms[3];
				assert.strictEqual(cf.__formc(), 4);
			});

			it('maxformc', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__maxformc(), 3);

				var cf = (await Unit.loadCat(200)).forms[0];
				assert.strictEqual(cf.__maxformc(), 2);

				var cf = (await Unit.loadCat(138)).forms[0];
				assert.strictEqual(cf.__maxformc(), 4);
			});

			it('max_base_lv', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__max_base_lv(), 20);

				var cf = (await Unit.loadCat(138)).forms[3];
				assert.strictEqual(cf.__max_base_lv(), 60);
			});

			it('max_plus_lv', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__max_plus_lv(), 90);

				var cf = (await Unit.loadCat(138)).forms[3];
				assert.strictEqual(cf.__max_plus_lv(), 70);
			});

			it('hp', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__hp(), 250);

				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.__hp(), 105300);
			});

			it('atk', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__atk(), 20);

				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.__atk(), 101250);

				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.__atk(), 121000);
			});

			it('attack', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__attack(), 20);

				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.__attack(), 101250);

				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.__attack(), 121000);
			});

			it('dps', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(round(cf.__dps()), 16);

				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.__dps()), 44669);

				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.__dps()), 39032);
			});

			it('thp', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__thp(), 250);

				var cf = (await Unit.loadCat(288)).forms[1];
				cf.level = 50;
				assert.strictEqual(cf.__thp(), 688500);
			});

			it('tatk', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__tatk(), 20);

				var cf = (await Unit.loadCat(554)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.__tatk(), 121500);
			});

			it('tdps', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(round(cf.__tdps()), 16);

				var cf = (await Unit.loadCat(554)).forms[2];
				cf.level = 50;
				assert.strictEqual(round(cf.__tdps()), 28701);
			});

			it('attackf', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__attackf(), 37);

				var cf = (await Unit.loadCat(25)).forms[1];
				assert.strictEqual(cf.__attackf(), 600);
			});

			it('attacks', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.approximately(cf.__attacks(), 37 / 30, Number.EPSILON);

				var cf = (await Unit.loadCat(25)).forms[1];
				assert.strictEqual(cf.__attacks(), 20);
			});

			it('pre', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__pre(), 8);

				var cf = (await Unit.loadCat(439)).forms[2];
				assert.strictEqual(cf.__pre(), 20);
			});

			it('pre1', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__pre1(), 0);

				var cf = (await Unit.loadCat(439)).forms[2];
				assert.strictEqual(cf.__pre1(), 80);
			});

			it('pre2', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__pre2(), 0);

				var cf = (await Unit.loadCat(439)).forms[2];
				assert.strictEqual(cf.__pre2(), 140);
			});

			it('backswing', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__backswing(), 10);

				var cf = (await Unit.loadCat(25)).forms[2];
				assert.strictEqual(cf.__backswing(), 73);
			});

			it('tba', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__tba(), 30);

				var cf = (await Unit.loadCat(138)).forms[3];
				assert.strictEqual(cf.__tba(), 40);
			});

			it('revenge', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.isFalse(cf.__revenge());

				var cf = (await Unit.loadCat(25)).forms[2];
				assert.isTrue(cf.__revenge());
			});

			it('atkcount', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__atkcount(), 1);

				var cf = (await Unit.loadCat(25)).forms[2];
				assert.strictEqual(cf.__atkcount(), 3);
			});

			it('atktype', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__atktype(), Unit.ATK_SINGLE);

				var cf = (await Unit.loadCat(1)).forms[2];
				assert.strictEqual(cf.__atktype(), Unit.ATK_RANGE);

				var cf = (await Unit.loadCat(259)).forms[0];
				assert.strictEqual(cf.__atktype(), Unit.ATK_RANGE | Unit.ATK_LD);

				var cf = (await Unit.loadCat(437)).forms[0];
				assert.strictEqual(cf.__atktype(), Unit.ATK_RANGE | Unit.ATK_OMNI);

				var cf = (await Unit.loadCat(25)).forms[2];
				assert.strictEqual(cf.__atktype(), Unit.ATK_RANGE | Unit.ATK_KB_REVENGE);
			});

			it('range', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__range(), 140);

				var cf = (await Unit.loadCat(141)).forms[0];
				assert.strictEqual(cf.__range(), 540);
			});

			it('range_min', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__range_min(), 140);

				var cf = (await Unit.loadCat(259)).forms[2];
				assert.strictEqual(cf.__range_min(), 450);

				var cf = (await Unit.loadCat(643)).forms[2];
				assert.strictEqual(cf.__range_min(), -100);

				var cf = (await Unit.loadCat(690)).forms[1];
				assert.strictEqual(cf.__range_min(), 250);
			});

			it('range_max', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__range_max(), 140);

				var cf = (await Unit.loadCat(259)).forms[2];
				assert.strictEqual(cf.__range_max(), 850);

				var cf = (await Unit.loadCat(643)).forms[2];
				assert.strictEqual(cf.__range_max(), 350);

				var cf = (await Unit.loadCat(690)).forms[1];
				assert.strictEqual(cf.__range_max(), 1000);
			});

			it('reach_base', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__reach_base(), 140);

				var cf = (await Unit.loadCat(259)).forms[2];
				assert.strictEqual(cf.__reach_base(), 450);

				var cf = (await Unit.loadCat(643)).forms[2];
				assert.strictEqual(cf.__reach_base(), 350);

				var cf = (await Unit.loadCat(690)).forms[1];
				assert.strictEqual(cf.__reach_base(), 250);
			});

			it('range_interval', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__range_interval(), 0);

				var cf = (await Unit.loadCat(259)).forms[2];
				assert.strictEqual(cf.__range_interval(), 400);

				var cf = (await Unit.loadCat(643)).forms[2];
				assert.strictEqual(cf.__range_interval(), 450);

				var cf = (await Unit.loadCat(690)).forms[1];
				assert.strictEqual(cf.__range_interval(), 350);
			});

			it('range_interval_max', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__range_interval_max(), 0);

				var cf = (await Unit.loadCat(259)).forms[2];
				assert.strictEqual(cf.__range_interval_max(), 400);

				var cf = (await Unit.loadCat(643)).forms[2];
				assert.strictEqual(cf.__range_interval_max(), 450);

				var cf = (await Unit.loadCat(690)).forms[1];
				assert.strictEqual(cf.__range_interval_max(), 410);

				var cf = (await Unit.loadCat(686)).forms[1];
				assert.strictEqual(cf.__range_interval_max(), 430);
			});

			it('kb', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__kb(), 3);

				var cf = (await Unit.loadCat(13)).forms[2];
				assert.strictEqual(cf.__kb(), 1);
			});

			it('speed', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				var spy = sinon.spy(cf, 'speed', ['get']);
				assert.strictEqual(cf.__speed(), spy.get.returnValues[0]);
				assert.strictEqual(spy.get.returnValues[0], 10);
				assert(spy.get.calledOnceWith());
			});

			it('price', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__price(), 75);

				var cf = (await Unit.loadCat(25)).forms[2];
				assert.strictEqual(cf.__price(), 4500);
			});

			it('cost', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__cost(), 75);

				var cf = (await Unit.loadCat(25)).forms[2];
				assert.strictEqual(cf.__cost(), 4500);
			});

			it('cdf', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				var spy = sinon.spy(cf, 'cd', ['get']);
				assert.strictEqual(cf.__cdf(), spy.get.returnValues[0]);
				assert.strictEqual(spy.get.returnValues[0], 60);
				assert(spy.get.calledOnceWith());
			});

			it('cd', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				var spy = sinon.spy(cf, 'cd', ['get']);
				assert.strictEqual(cf.__cd(), spy.get.returnValues[0] / 30);
				assert.strictEqual(spy.get.returnValues[0], 60);
				assert(spy.get.calledOnceWith());
			});

			it('trait', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__trait(), 0);

				var cf = (await Unit.loadCat(2)).forms[2];
				assert.strictEqual(cf.__trait(), Unit.TB_RED);

				var cf = (await Unit.loadCat(13)).forms[2];
				assert.strictEqual(cf.__trait(), Unit.TB_RED | Unit.TB_BLACK);
			});

			it('imu', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__imu(), 0);

				var cf = (await Unit.loadCat(44)).forms[1];
				assert.strictEqual(cf.__imu(), Unit.IMU_WEAK);

				var cf = (await Unit.loadCat(439)).forms[2];
				assert.strictEqual(cf.__imu(), Unit.IMU_STOP | Unit.IMU_WARP);
			});

			it('wavelv', async function () {
				var cf = (await Unit.loadCat(352)).forms[2];
				var spy = sinon.spy(cf, 'waveLv', ['get']);
				assert.strictEqual(cf.__wavelv(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('surgelv', async function () {
				var cf = (await Unit.loadCat(543)).forms[1];
				var spy = sinon.spy(cf, 'surgeLv', ['get']);
				assert.strictEqual(cf.__surgelv(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('miniwavelv', async function () {
				var cf = (await Unit.loadCat(585)).forms[1];
				var spy = sinon.spy(cf, 'miniWaveLv', ['get']);
				assert.strictEqual(cf.__miniwavelv(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('minisurgelv', async function () {
				var cf = (await Unit.loadCat(413)).forms[2];
				var spy = sinon.spy(cf, 'miniSurgeLv', ['get']);
				assert.strictEqual(cf.__minisurgelv(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('wave_prob', async function () {
				var cf = (await Unit.loadCat(94)).forms[2];
				var spy = sinon.spy(cf, 'waveProb', ['get']);
				assert.strictEqual(cf.__wave_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('mini_wave_prob', async function () {
				var cf = (await Unit.loadCat(585)).forms[1];
				var spy = sinon.spy(cf, 'miniWaveProb', ['get']);
				assert.strictEqual(cf.__mini_wave_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('surge_prob', async function () {
				var cf = (await Unit.loadCat(543)).forms[1];
				var spy = sinon.spy(cf, 'surgeProb', ['get']);
				assert.strictEqual(cf.__surge_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('mini_surge_prob', async function () {
				var cf = (await Unit.loadCat(705)).forms[1];
				var spy = sinon.spy(cf, 'miniSurgeProb', ['get']);
				assert.strictEqual(cf.__mini_surge_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('crit', async function () {
				var cf = (await Unit.loadCat(57)).forms[2];
				var spy = sinon.spy(cf, 'critProb', ['get']);
				assert.strictEqual(cf.__crit(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('slow_time', async function () {
				var cf = (await Unit.loadCat(138)).forms[0];
				var spy = sinon.spy(cf, 'slowTime', ['get']);
				assert.strictEqual(cf.__slow_time(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('slow_prob', async function () {
				var cf = (await Unit.loadCat(138)).forms[0];
				var spy = sinon.spy(cf, 'slowProb', ['get']);
				assert.strictEqual(cf.__slow_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('slow_cover', async function () {
				var cf = (await Unit.loadCat(138)).forms[0];
				var spy = sinon.spy(cf, 'slowCover', ['get']);
				assert.strictEqual(cf.__slow_cover(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('stop_time', async function () {
				var cf = (await Unit.loadCat(439)).forms[0];
				var spy = sinon.spy(cf, 'stopTime', ['get']);
				assert.strictEqual(cf.__stop_time(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('stop_prob', async function () {
				var cf = (await Unit.loadCat(439)).forms[0];
				var spy = sinon.spy(cf, 'stopProb', ['get']);
				assert.strictEqual(cf.__stop_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('stop_cover', async function () {
				var cf = (await Unit.loadCat(439)).forms[0];
				var spy = sinon.spy(cf, 'stopCover', ['get']);
				assert.strictEqual(cf.__stop_cover(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('curse_time', async function () {
				var cf = (await Unit.loadCat(543)).forms[0];
				var spy = sinon.spy(cf, 'curseTime', ['get']);
				assert.strictEqual(cf.__curse_time(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('curse_prob', async function () {
				var cf = (await Unit.loadCat(543)).forms[0];
				var spy = sinon.spy(cf, 'curseProb', ['get']);
				assert.strictEqual(cf.__curse_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('curse_cover', async function () {
				var cf = (await Unit.loadCat(543)).forms[0];
				var spy = sinon.spy(cf, 'curseCover', ['get']);
				assert.strictEqual(cf.__curse_cover(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('weak_time', async function () {
				var cf = (await Unit.loadCat(198)).forms[2];
				var spy = sinon.spy(cf, 'weakTime', ['get']);
				assert.strictEqual(cf.__weak_time(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('weak_prob', async function () {
				var cf = (await Unit.loadCat(198)).forms[2];
				var spy = sinon.spy(cf, 'weakProb', ['get']);
				assert.strictEqual(cf.__weak_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('weak_cover', async function () {
				var cf = (await Unit.loadCat(198)).forms[2];
				var spy = sinon.spy(cf, 'weakCover', ['get']);
				assert.strictEqual(cf.__weak_cover(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('weak_extent', async function () {
				var cf = (await Unit.loadCat(198)).forms[2];
				var spy = sinon.spy(cf, 'weakExtent', ['get']);
				assert.strictEqual(cf.__weak_extent(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('strengthen_extent', async function () {
				var cf = (await Unit.loadCat(441)).forms[1];
				var spy = sinon.spy(cf, 'strengthenExtent', ['get']);
				assert.strictEqual(cf.__strengthen_extent(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('lethal_prob', async function () {
				var cf = (await Unit.loadCat(37)).forms[2];
				var spy = sinon.spy(cf, 'lethalProb', ['get']);
				assert.strictEqual(cf.__lethal_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('savage_extent', async function () {
				var cf = (await Unit.loadCat(519)).forms[2];
				var spy = sinon.spy(cf, 'savageExtent', ['get']);
				assert.strictEqual(cf.__savage_extent(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('savage_prob', async function () {
				var cf = (await Unit.loadCat(519)).forms[2];
				var spy = sinon.spy(cf, 'savageProb', ['get']);
				assert.strictEqual(cf.__savage_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('break_prob', async function () {
				var cf = (await Unit.loadCat(245)).forms[2];
				var spy = sinon.spy(cf, 'barrierBreakProb', ['get']);
				assert.strictEqual(cf.__break_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('shield_break_prob', async function () {
				var cf = (await Unit.loadCat(617)).forms[2];
				var spy = sinon.spy(cf, 'shieldBreakProb', ['get']);
				assert.strictEqual(cf.__shield_break_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('dodge_time', async function () {
				var cf = (await Unit.loadCat(187)).forms[2];
				var spy = sinon.spy(cf, 'dodgeTime', ['get']);
				assert.strictEqual(cf.__dodge_time(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('dodge_prob', async function () {
				var cf = (await Unit.loadCat(187)).forms[2];
				var spy = sinon.spy(cf, 'dodgeProb', ['get']);
				assert.strictEqual(cf.__dodge_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('beast_prob', async function () {
				var cf = (await Unit.loadCat(532)).forms[2];
				var spy = sinon.spy(cf, 'beastDodgeProb', ['get']);
				assert.strictEqual(cf.__beast_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('beast_time', async function () {
				var cf = (await Unit.loadCat(532)).forms[2];
				var spy = sinon.spy(cf, 'beastDodgeTime', ['get']);
				assert.strictEqual(cf.__beast_time(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

		});

	});

	describe('Enemy', function () {

		describe('Enemy.hp', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.hp, 90);

				var enemy = await Unit.loadEnemy(8);
				assert.strictEqual(enemy.hp, 2500);
			});

			it('stage mag should be counted', async function () {
				var enemy = await Unit.loadEnemy(0);
				enemy.hpM = 3;
				assert.strictEqual(enemy.hp, 270);

				var enemy = await Unit.loadEnemy(0);
				enemy.stageM = 2;
				assert.strictEqual(enemy.hp, 180);

				var enemy = await Unit.loadEnemy(0);
				enemy.hpM = 3;
				enemy.stageM = 2;
				assert.strictEqual(enemy.hp, 540);

				var enemy = await Unit.loadEnemy(0);
				enemy.atkM = 4;
				assert.strictEqual(enemy.hp, 90);
			});

			it('alien mag and related treasures should be counted', async function () {
				var enemy = await Unit.loadEnemy(167);
				Unit.catEnv.setTreasure(21, 0);
				assert.strictEqual(enemy.hp, 6300);

				Unit.catEnv.setTreasure(21, 300);
				assert.strictEqual(enemy.hp, 3600);

				Unit.catEnv.setTreasure(21, 500);
				assert.strictEqual(enemy.hp, 1800);

				Unit.catEnv.setTreasure(21, 500);
				enemy.hpM = 3;
				enemy.stageM = 2;
				assert.strictEqual(enemy.hp, 10800);
			});

			it('alien (star) mag and related treasures should be counted', async function () {
				var enemy = await Unit.loadEnemy(360);
				Unit.catEnv.setTreasure(22, 0);
				assert.strictEqual(enemy.hp, 112000);

				Unit.catEnv.setTreasure(22, 600);
				assert.strictEqual(enemy.hp, 70000);

				Unit.catEnv.setTreasure(22, 1300);
				assert.strictEqual(enemy.hp, 21000);

				Unit.catEnv.setTreasure(22, 1300);
				enemy.hpM = 3;
				enemy.stageM = 2;
				assert.strictEqual(enemy.hp, 126000);
			});

			it('God mag and related treasures should be counted', async function () {
				// God 1
				var enemy = await Unit.loadEnemy(367);
				Unit.catEnv.setTreasure(20, 0);
				Unit.catEnv.setTreasure(24, 0);
				Unit.catEnv.setTreasure(30, 0);
				assert.strictEqual(enemy.hp, 15399989);

				Unit.catEnv.setTreasure(20, 100);
				assert.strictEqual(enemy.hp, 1399999);

				// God 2
				var enemy = await Unit.loadEnemy(419);
				Unit.catEnv.setTreasure(20, 0);
				Unit.catEnv.setTreasure(24, 0);
				Unit.catEnv.setTreasure(30, 0);
				assert.strictEqual(enemy.hp, 16499989);

				Unit.catEnv.setTreasure(24, 100);
				assert.strictEqual(enemy.hp, 1499999);

				// God 3
				var enemy = await Unit.loadEnemy(446);
				Unit.catEnv.setTreasure(20, 0);
				Unit.catEnv.setTreasure(24, 0);
				Unit.catEnv.setTreasure(30, 0);
				assert.strictEqual(enemy.hp, 10999989);

				Unit.catEnv.setTreasure(30, 100);
				assert.strictEqual(enemy.hp, 999999);
			});

		});

		describe('Enemy.atks', function () {

			it('check if underlying API is correctly called', async function () {
				var enemy = await Unit.loadEnemy(52);
				var spy = sinon.spy(enemy, 'getatks');
				assert.strictEqual(enemy.atks, spy.returnValues[0]);
				assert(spy.calledOnceWith());
			});

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.deepEqual(enemy.atks, [8]);
			});

			it('multi-attack should be counted', async function () {
				var enemy = await Unit.loadEnemy(52);
				assert.deepEqual(enemy.atks, [4250, 250, 497]);
			});

			it('stage mag should be counted', async function () {
				var enemy = await Unit.loadEnemy(52);
				enemy.atkM = 3;
				assert.deepEqual(enemy.atks, [12750, 750, 1491]);

				var enemy = await Unit.loadEnemy(52);
				enemy.stageM = 2;
				assert.deepEqual(enemy.atks, [8500, 500, 994]);

				var enemy = await Unit.loadEnemy(52);
				enemy.atkM = 3;
				enemy.stageM = 2;
				assert.deepEqual(enemy.atks, [25500, 1500, 2982]);

				var enemy = await Unit.loadEnemy(52);
				enemy.hpM = 4;
				assert.deepEqual(enemy.atks, [4250, 250, 497]);
			});

			it('alien mag and related treasures should be counted', async function () {
				var enemy = await Unit.loadEnemy(167);
				Unit.catEnv.setTreasure(21, 0);
				assert.deepEqual(enemy.atks, [1050]);

				Unit.catEnv.setTreasure(21, 300);
				assert.deepEqual(enemy.atks, [600]);

				Unit.catEnv.setTreasure(21, 500);
				assert.deepEqual(enemy.atks, [300]);

				Unit.catEnv.setTreasure(21, 500);
				enemy.atkM = 3;
				enemy.stageM = 2;
				assert.deepEqual(enemy.atks, [1800]);
			});

			it('alien (star) mag and related treasures should be counted', async function () {
				var enemy = await Unit.loadEnemy(360);
				Unit.catEnv.setTreasure(22, 0);
				assert.deepEqual(enemy.atks, [8000]);

				Unit.catEnv.setTreasure(22, 600);
				assert.deepEqual(enemy.atks, [5000]);

				Unit.catEnv.setTreasure(22, 1300);
				assert.deepEqual(enemy.atks, [1500]);

				Unit.catEnv.setTreasure(22, 1300);
				enemy.atkM = 3;
				enemy.stageM = 2;
				assert.deepEqual(enemy.atks, [9000]);
			});

			it('God mag and related treasures should be counted', async function () {
				// God 1
				var enemy = await Unit.loadEnemy(367);
				Unit.catEnv.setTreasure(20, 0);
				Unit.catEnv.setTreasure(24, 0);
				Unit.catEnv.setTreasure(30, 0);
				assert.deepEqual(enemy.atks, [197989, 197989, 197989]);

				Unit.catEnv.setTreasure(20, 100);
				assert.deepEqual(enemy.atks, [17999, 17999, 17999]);

				// God 2
				var enemy = await Unit.loadEnemy(419);
				Unit.catEnv.setTreasure(20, 0);
				Unit.catEnv.setTreasure(24, 0);
				Unit.catEnv.setTreasure(30, 0);
				assert.deepEqual(enemy.atks, [10989, 10989, 725989]);

				Unit.catEnv.setTreasure(24, 100);
				assert.deepEqual(enemy.atks, [999, 999, 65999]);

				// God 3
				var enemy = await Unit.loadEnemy(446);
				Unit.catEnv.setTreasure(20, 0);
				Unit.catEnv.setTreasure(24, 0);
				Unit.catEnv.setTreasure(30, 0);
				assert.deepEqual(enemy.atks, [43989, 43989, 725989]);

				Unit.catEnv.setTreasure(30, 100);
				assert.deepEqual(enemy.atks, [3999, 3999, 65999]);
			});

		});

		describe('Enemy.atkm', function () {

			it('check if underlying API is correctly called', async function () {
				var enemy = await Unit.loadEnemy(52);
				var spy = sinon.spy(enemy, 'getatks');
				assert.strictEqual(enemy.atkm, spy.returnValues[0].reduce((rv, x) => rv + x));
				assert(spy.calledOnceWith());
			});

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.atkm, 8);
			});

			it('multi-attack should be counted', async function () {
				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.atkm, 4997);
			});

		});

		describe('Enemy.atk', function () {

			it('check if underlying API is correctly called', async function () {
				var enemy = await Unit.loadEnemy(52);
				var spy = sinon.spy(enemy, 'getatks');
				assert.strictEqual(enemy.atk, spy.returnValues[0]);
				assert(spy.calledOnceWith(0));
			});

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.deepEqual(enemy.atk, 8);
			});

			it('return first attack for multi-attack', async function () {
				var enemy = await Unit.loadEnemy(52);
				assert.deepEqual(enemy.atk, 4250);
			});

		});

		describe('Enemy.atk1', function () {

			it('check if underlying API is correctly called', async function () {
				var enemy = await Unit.loadEnemy(52);
				var spy = sinon.spy(enemy, 'getatks');
				assert.strictEqual(enemy.atk1, spy.returnValues[0]);
				assert(spy.calledOnceWith(1));
			});

			it('return 0 if no multi-attack', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.deepEqual(enemy.atk1, 0);
			});

			it('return second attack for multi-attack', async function () {
				var enemy = await Unit.loadEnemy(52);
				assert.deepEqual(enemy.atk1, 250);
			});

		});

		describe('Enemy.atk2', function () {

			it('check if underlying API is correctly called', async function () {
				var enemy = await Unit.loadEnemy(52);
				var spy = sinon.spy(enemy, 'getatks');
				assert.strictEqual(enemy.atk2, spy.returnValues[0]);
				assert(spy.calledOnceWith(2));
			});

			it('return 0 if no related multi-attack', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.deepEqual(enemy.atk2, 0);
			});

			it('return third attack for multi-attack', async function () {
				var enemy = await Unit.loadEnemy(52);
				assert.deepEqual(enemy.atk2, 497);
			});

		});

		describe('Enemy.dps', function () {

			it('check if underlying API is correctly called', async function () {
				var enemy = await Unit.loadEnemy(52);
				var spy = sinon.spy(enemy, 'getatks');
				assert.approximately(
					enemy.dps,
					30 * spy.returnValues[0].reduce((rv, x) => rv + x) / enemy.attackF,
					Number.EPSILON,
				);
				assert(spy.calledOnceWith());
			});

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(round(enemy.dps), 5);
			});

			it('multi-attack should be counted', async function () {
				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(round(enemy.dps), 9369);
			});

		});

		describe('Enemy.thp', function () {

			it('check if underlying API is correctly called', async function () {
				var enemy = await Unit.loadEnemy(552);
				var spy = sinon.spy(enemy, 'getthp');
				assert.strictEqual(enemy.thp, spy.returnValues[0]);
				assert(spy.calledOnceWith());
			});

			it('demon shield should be considered', async function () {
				// no mag
				var enemy = await Unit.loadEnemy(552);
				assert.strictEqual(enemy.thp, 13500);

				// mag
				var enemy = await Unit.loadEnemy(552);
				enemy.hpM = 3;
				enemy.stageM = 2;
				assert.strictEqual(enemy.thp, 81000);
			});

			it('barrier should be considered', async function () {
				// no mag
				var enemy = await Unit.loadEnemy(363);
				assert.strictEqual(enemy.thp, 50000);

				// barrier shouldn't be multiplied by mag
				var enemy = await Unit.loadEnemy(363);
				enemy.hpM = 3;
				enemy.stageM = 2;
				assert.strictEqual(enemy.thp, 100000);
			});

			it('revive should be considered', async function () {
				// revive with 50% HP * 1 
				var enemy = await Unit.loadEnemy(284);
				assert.strictEqual(enemy.thp, 22500);

				enemy.hpM = 5;
				enemy.stageM = 2;
				assert.strictEqual(enemy.thp, 225000);

				// revive with 100% HP * 1 
				var enemy = await Unit.loadEnemy(468);
				assert.strictEqual(enemy.thp, 35000);

				enemy.hpM = 5;
				enemy.stageM = 2;
				assert.strictEqual(enemy.thp, 350000);

				// revive with 100% HP * inf (treat as 999)
				var enemy = await Unit.loadEnemy(309);
				assert.strictEqual(enemy.thp, 40000000);

				enemy.hpM = 5;
				enemy.stageM = 2;
				assert.strictEqual(enemy.thp, 400000000);
			});

		});

		describe('Enemy.tatks', function () {

			it('check if underlying API is correctly called', async function () {
				var enemy = await Unit.loadEnemy(552);
				var spy = sinon.spy(enemy, 'gettatks');
				assert.strictEqual(enemy.tatks, spy.returnValues[0]);
				assert(spy.calledOnceWith({mode: 'max'}));
			});

			it('surge should be counted', async function () {
				var enemy = await Unit.loadEnemy(513);
				assert.deepEqual(enemy.tatks, [92000]);
			});

			it('mini-surge should be counted', async function () {
				var enemy = await Unit.loadEnemy(658);
				assert.deepEqual(enemy.tatks, [5332.8]);
			});

			it('wave should be counted', async function () {
				var enemy = await Unit.loadEnemy(44);
				assert.deepEqual(enemy.tatks, [11000]);
			});

			it('mini-wave should be counted', async function () {
				var enemy = await Unit.loadEnemy(538);
				assert.deepEqual(enemy.tatks, [28200]);
			});

			it('savage should be counted', async function () {
				var enemy = await Unit.loadEnemy(556);
				assert.deepEqual(enemy.tatks, [20604]);
			});

			it('critical should be counted', async function () {
				var enemy = await Unit.loadEnemy(32);
				assert.deepEqual(enemy.tatks, [14400]);
			});

			it('strengthen should be counted', async function () {
				var enemy = await Unit.loadEnemy(175);
				assert.deepEqual(enemy.tatks, [2000]);
			});

			it('attack base: ignore for tatk', async function () {
				var enemy = await Unit.loadEnemy(34);
				assert.deepEqual(enemy.tatks, [2800]);
			});

		});

		describe('Enemy.tdps', function () {

			it('check if underlying API is correctly called', async function () {
				var enemy = await Unit.loadEnemy(52);
				var spy = sinon.spy(enemy, 'gettatks');
				assert.approximately(
					enemy.tdps,
					30 * spy.returnValues[0].reduce((rv, x) => rv + x) / enemy.attackF,
					Number.EPSILON,
				);
				assert(spy.calledOnceWith({mode: 'expected'}));
			});

			it('surge should be counted', async function () {
				var enemy = await Unit.loadEnemy(513);
				assert.strictEqual(round(enemy.tdps), 32693);
			});

			it('mini-surge should be counted', async function () {
				var enemy = await Unit.loadEnemy(658);
				assert.strictEqual(round(enemy.tdps), 27997);
			});

			it('wave should be counted', async function () {
				var enemy = await Unit.loadEnemy(44);
				assert.strictEqual(round(enemy.tdps), 5225);
			});

			it('mini-wave should be counted', async function () {
				var enemy = await Unit.loadEnemy(538);
				assert.strictEqual(round(enemy.tdps), 31333);
			});

			it('savage should be counted', async function () {
				var enemy = await Unit.loadEnemy(556);
				assert.strictEqual(round(enemy.tdps), 15453);
			});

			it('critical should be counted', async function () {
				var enemy = await Unit.loadEnemy(32);
				assert.strictEqual(round(enemy.tdps), 13976);
			});

			it('strengthen should be counted', async function () {
				var enemy = await Unit.loadEnemy(175);
				assert.strictEqual(round(enemy.tdps), 896);
			});

			it('attack base: ignore for tdps', async function () {
				var enemy = await Unit.loadEnemy(34);
				assert.strictEqual(round(enemy.tdps), 1400);
			});

		});

		describe('Enemy.earn', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.earn, 59.25);

				var enemy = await Unit.loadEnemy(8);
				assert.strictEqual(enemy.earn, 2567.5);
			});

			it('research and treasures should be counted', async function () {
				var enemy = await Unit.loadEnemy(0);
				Unit.catEnv.setTreasure(3, 0);
				Unit.catEnv.setTreasure(18, 1);
				assert.strictEqual(enemy.earn, 15);

				Unit.catEnv.setTreasure(3, 100);
				assert.strictEqual(enemy.earn, 22.5);

				Unit.catEnv.setTreasure(3, 300);
				assert.strictEqual(enemy.earn, 37.5);

				Unit.catEnv.setTreasure(18, 5);
				assert.strictEqual(enemy.earn, 40.5);
				Unit.catEnv.setTreasure(18, 30);
				assert.strictEqual(enemy.earn, 59.25);
			});

		});

		describe('Enemy.icon', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.icon, "/img/e/0/0.png");

				var enemy = await Unit.loadEnemy(47);
				assert.strictEqual(enemy.icon, "/img/e/47/0.png");
			});

		});

		describe('Enemy.animUrl', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.animUrl, "/anim.html?id=-1");

				var enemy = await Unit.loadEnemy(205);
				assert.strictEqual(enemy.animUrl, "/anim.html?id=-206");
			});

		});

		describe('Enemy.bcdbUrl', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.bcdbUrl, "https://battlecats-db.com/enemy/002.html");

				var enemy = await Unit.loadEnemy(205);
				assert.strictEqual(enemy.bcdbUrl, "https://battlecats-db.com/enemy/207.html");
			});

		});

		describe('Enemy.fandomUrl', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.fandomUrl, "https://battle-cats.fandom.com/wiki/Doge");

				var enemy = await Unit.loadEnemy(205);
				assert.strictEqual(enemy.fandomUrl, "https://battle-cats.fandom.com/wiki/Capy");
			});

		});

		describe('Enemy.getthp', function () {

			it('ability filter', async function () {
				var enemy = await Unit.loadEnemy(557);
				assert.strictEqual(enemy.getthp({filter: []}), 380000);
				assert.strictEqual(enemy.getthp({filter: [Unit.AB_DSHIELD]}), 1180000);
			});

		});

		describe('Enemy.gettatks', function () {

			it('0-damage attack should not be altered', async function () {
				var enemy = await Unit.loadEnemy(574);
				assert.deepEqual(enemy.gettatks(), [0]);
				assert.deepEqual(enemy.gettatks({isMetal: true}), [0]);
			});

			it('ability filter', async function () {
				var enemy = await Unit.loadEnemy(397);
				assert.deepEqual(enemy.gettatks({filter: []}), [20000, 20000, 20000]);
				assert.deepEqual(enemy.gettatks({filter: [Unit.AB_CRIT]}), [20000, 20000, 30000]);
				assert.deepEqual(enemy.gettatks({filter: [Unit.AB_WAVE]}), [20000, 20000, 40000]);
				assert.deepEqual(enemy.gettatks({filter: [Unit.AB_CRIT, Unit.AB_WAVE]}), [20000, 20000, 60000]);
			});

			it('mode', async function () {
				var enemy = await Unit.loadEnemy(668);
				assert.deepEqual(enemy.gettatks({mode: 'expected'}), [66000]);
				assert.deepEqual(enemy.gettatks({mode: 'max'}), [198000]);
			});

			it('metal mode', async function () {
				var enemy = await Unit.loadEnemy(205);
				assert.deepEqual(enemy.gettatks({isMetal: false}), [59799.99999999999]);
				assert.deepEqual(enemy.gettatks({isMetal: true}), [15600.85]);
				assert.deepEqual(enemy.gettatks({metal: false, isMetal: false}), [59799.99999999999]);
				assert.deepEqual(enemy.gettatks({metal: false, isMetal: true}), [59799.99999999999]);
			});

			it('attack base', async function () {
				var enemy = await Unit.loadEnemy(34);
				assert.deepEqual(enemy.gettatks({isBase: false}), [2800]);
				assert.deepEqual(enemy.gettatks({isBase: true}), [5600]);
			});

		});

		describe('Enemy.hasAb', function () {

			it('basic', async function () {
				// ab data is null
				var enemy = await Unit.loadEnemy(551);
				assert.isTrue(enemy.hasAb(Unit.AB_SUICIDE));

				var enemy = await Unit.loadEnemy(0);
				assert.isFalse(enemy.hasAb(Unit.AB_SUICIDE));

				// ab data is number
				var enemy = await Unit.loadEnemy(32);
				assert.isTrue(enemy.hasAb(Unit.AB_CRIT));

				var enemy = await Unit.loadEnemy(0);
				assert.isFalse(enemy.hasAb(Unit.AB_CRIT));

				// ab data is array
				var enemy = await Unit.loadEnemy(407);
				assert.isTrue(enemy.hasAb(Unit.AB_CURSE));

				var enemy = await Unit.loadEnemy(0);
				assert.isFalse(enemy.hasAb(Unit.AB_CURSE));
			});

		});

		describe('Enemy.hasRes', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(407);
				assert.isFalse(enemy.hasRes(Unit.RES_CURSE));
			});

		});

		describe('Enemy.waveLv', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.waveLv, 0);

				var enemy = await Unit.loadEnemy(34);
				assert.strictEqual(enemy.waveLv, 4);
			});

		});

		describe('Enemy.waveProb', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.waveProb, 0);

				var enemy = await Unit.loadEnemy(34);
				assert.strictEqual(enemy.waveProb, 100);
			});

		});

		describe('Enemy.miniWaveLv', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.miniWaveLv, 0);

				var enemy = await Unit.loadEnemy(538);
				assert.strictEqual(enemy.miniWaveLv, 5);
			});

		});

		describe('Enemy.miniWaveProb', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.miniWaveProb, 0);

				var enemy = await Unit.loadEnemy(538);
				assert.strictEqual(enemy.miniWaveProb, 100);
			});

		});

		describe('Enemy.surgeLv', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.surgeLv, 0);

				var enemy = await Unit.loadEnemy(495);
				assert.strictEqual(enemy.surgeLv, 1);
			});

		});

		describe('Enemy.surgeProb', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.surgeProb, 0);

				var enemy = await Unit.loadEnemy(495);
				assert.strictEqual(enemy.surgeProb, 100);
			});

		});

		describe('Enemy.miniSurgeLv', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.miniSurgeLv, 0);

				var enemy = await Unit.loadEnemy(652);
				assert.strictEqual(enemy.miniSurgeLv, 1);
			});

		});

		describe('Enemy.miniSurgeProb', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.miniSurgeProb, 0);

				var enemy = await Unit.loadEnemy(652);
				assert.strictEqual(enemy.miniSurgeProb, 75);
			});

		});

		describe('Enemy.critProb', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.critProb, 0);

				var enemy = await Unit.loadEnemy(32);
				assert.strictEqual(enemy.critProb, 10);
			});

		});

		describe('Enemy.slowTime', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.slowTime, 0);

				var enemy = await Unit.loadEnemy(185);
				assert.strictEqual(enemy.slowTime, 60);
			});

		});

		describe('Enemy.slowProb', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.slowProb, 0);

				var enemy = await Unit.loadEnemy(185);
				assert.strictEqual(enemy.slowProb, 20);
			});

		});

		describe('Enemy.slowCover', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.slowCover, 0);

				var enemy = await Unit.loadEnemy(185);
				assert.strictEqual(round(enemy.slowCover), 42);
			});

		});

		describe('Enemy.stopTime', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.stopTime, 0);

				var enemy = await Unit.loadEnemy(160);
				assert.strictEqual(enemy.stopTime, 60);
			});

		});

		describe('Enemy.stopProb', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.stopProb, 0);

				var enemy = await Unit.loadEnemy(160);
				assert.strictEqual(enemy.stopProb, 25);
			});

		});

		describe('Enemy.stopCover', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.stopCover, 0);

				var enemy = await Unit.loadEnemy(160);
				assert.strictEqual(round(enemy.stopCover), 14);
			});

		});

		describe('Enemy.curseTime', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.curseTime, 0);

				var enemy = await Unit.loadEnemy(407);
				assert.strictEqual(enemy.curseTime, 100);
			});

		});

		describe('Enemy.curseProb', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.curseProb, 0);

				var enemy = await Unit.loadEnemy(407);
				assert.strictEqual(enemy.curseProb, 35);
			});

		});

		describe('Enemy.curseCover', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.curseCover, 0);

				var enemy = await Unit.loadEnemy(407);
				assert.strictEqual(round(enemy.curseCover), 63);
			});

		});

		describe('Enemy.weakTime', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.weakTime, 0);

				var enemy = await Unit.loadEnemy(172);
				assert.strictEqual(enemy.weakTime, 300);
			});

		});

		describe('Enemy.weakProb', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.weakProb, 0);

				var enemy = await Unit.loadEnemy(172);
				assert.strictEqual(enemy.weakProb, 25);
			});

		});

		describe('Enemy.weakCover', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.weakCover, 0);

				var enemy = await Unit.loadEnemy(172);
				assert.strictEqual(round(enemy.weakCover), 93);
			});

		});

		describe('Enemy.weakExtent', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.weakExtent, 0);

				var enemy = await Unit.loadEnemy(172);
				assert.strictEqual(enemy.weakExtent, 20);
			});

		});

		describe('Enemy.strengthenExtent', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.strengthenExtent, 0);

				var enemy = await Unit.loadEnemy(175);
				assert.strictEqual(enemy.strengthenExtent, 100);
			});

		});

		describe('Enemy.lethalProb', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.lethalProb, 0);

				var enemy = await Unit.loadEnemy(173);
				assert.strictEqual(enemy.lethalProb, 100);
			});

		});

		describe('Enemy.savageExtent', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.savageExtent, 0);

				var enemy = await Unit.loadEnemy(556);
				assert.strictEqual(enemy.savageExtent, 200);
			});

		});

		describe('Enemy.savageProb', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.savageProb, 0);

				var enemy = await Unit.loadEnemy(556);
				assert.strictEqual(enemy.savageProb, 10);
			});

		});

		describe('Enemy.dodgeTime', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.dodgeTime, 0);

				var enemy = await Unit.loadEnemy(608);
				assert.strictEqual(enemy.dodgeTime, 30);
			});

		});

		describe('Enemy.dodgeProb', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.dodgeProb, 0);

				var enemy = await Unit.loadEnemy(608);
				assert.strictEqual(enemy.dodgeProb, 20);
			});

		});

		describe('Search keys', function () {

			it('hasab', async function () {
				var enemy = await Unit.loadEnemy(407);
				var args = [Unit.AB_CURSE];
				var spy = sinon.spy(enemy, 'hasAb');
				assert.strictEqual(enemy.__hasab(...args), spy.returnValues[0]);
				assert(spy.calledOnceWith(...args));
			});

			it('hasres', async function () {
				var enemy = await Unit.loadEnemy(407);
				var args = [Unit.RES_CURSE];
				var spy = sinon.spy(enemy, 'hasRes');
				assert.strictEqual(enemy.__hasres(...args), spy.returnValues[0]);
				assert(spy.calledOnceWith(...args));
			});

			it('id', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__id(), 0);

				var enemy = await Unit.loadEnemy(8);
				assert.strictEqual(enemy.__id(), 8);
			});

			it('hp', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__hp(), 90);

				var enemy = await Unit.loadEnemy(8);
				assert.strictEqual(enemy.__hp(), 2500);
			});

			it('atk', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__atk(), 8);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__atk(), 4997);
			});

			it('attack', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__attack(), 8);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__attack(), 4997);
			});

			it('dps', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(round(enemy.__dps()), 5);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(round(enemy.__dps()), 9369);
			});

			it('thp', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__thp(), 90);

				var enemy = await Unit.loadEnemy(8);
				assert.strictEqual(enemy.__thp(), 2500);
			});

			it('tatk', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__tatk(), 8);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__tatk(), 4997);
			});

			it('tdps', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(round(enemy.__tdps()), 5);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(round(enemy.__tdps()), 9369);
			});

			it('attackf', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__attackf(), 47);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__attackf(), 16);
			});

			it('attacks', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__attacks(), 47 / 30);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__attacks(), 16 / 30);
			});

			it('pre', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__pre(), 8);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__pre(), 2);
			});

			it('pre1', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__pre1(), 0);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__pre1(), 4);
			});

			it('pre2', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__pre2(), 0);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__pre2(), 8);
			});

			it('backswing', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__backswing(), 10);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__backswing(), 8);
			});

			it('tba', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__tba(), 40);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__tba(), 0);
			});

			it('revenge', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.isFalse(enemy.__revenge());

				var enemy = await Unit.loadEnemy(52);
				assert.isTrue(enemy.__revenge());
			});

			it('atkcount', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__atkcount(), 1);

				var enemy = await Unit.loadEnemy(10);
				assert.strictEqual(enemy.__atkcount(), 3);
			});

			it('atktype', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__atktype(), Unit.ATK_SINGLE);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__atktype(), Unit.ATK_RANGE | Unit.ATK_KB_REVENGE);

				var enemy = await Unit.loadEnemy(318);
				assert.strictEqual(enemy.__atktype(), Unit.ATK_RANGE | Unit.ATK_LD);

				var enemy = await Unit.loadEnemy(405);
				assert.strictEqual(enemy.__atktype(), Unit.ATK_RANGE | Unit.ATK_OMNI);
			});

			it('range', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__range(), 110);

				var enemy = await Unit.loadEnemy(318);
				assert.strictEqual(enemy.__range(), 150);
			});

			it('range_min', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__range_min(), 110);

				var enemy = await Unit.loadEnemy(318);
				assert.strictEqual(enemy.__range_min(), 350);

				var enemy = await Unit.loadEnemy(317);
				assert.strictEqual(enemy.__range_min(), -700);

				var enemy = await Unit.loadEnemy(599);
				assert.strictEqual(enemy.__range_min(), 1);
			});

			it('range_max', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__range_max(), 110);

				var enemy = await Unit.loadEnemy(318);
				assert.strictEqual(enemy.__range_max(), 650);

				var enemy = await Unit.loadEnemy(317);
				assert.strictEqual(enemy.__range_max(), 800);

				var enemy = await Unit.loadEnemy(599);
				assert.strictEqual(enemy.__range_max(), 600);
			});

			it('reach_base', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__reach_base(), 110);

				var enemy = await Unit.loadEnemy(318);
				assert.strictEqual(enemy.__reach_base(), 350);

				var enemy = await Unit.loadEnemy(317);
				assert.strictEqual(enemy.__reach_base(), 800);

				var enemy = await Unit.loadEnemy(599);
				assert.strictEqual(enemy.__reach_base(), 1);
			});

			it('range_interval', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__range_interval(), 0);

				var enemy = await Unit.loadEnemy(318);
				assert.strictEqual(enemy.__range_interval(), 300);

				var enemy = await Unit.loadEnemy(317);
				assert.strictEqual(enemy.__range_interval(), 1500);

				var enemy = await Unit.loadEnemy(599);
				assert.strictEqual(enemy.__range_interval(), 200);
			});

			it('range_interval_max', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__range_interval_max(), 0);

				var enemy = await Unit.loadEnemy(318);
				assert.strictEqual(enemy.__range_interval_max(), 300);

				var enemy = await Unit.loadEnemy(317);
				assert.strictEqual(enemy.__range_interval_max(), 1500);

				var enemy = await Unit.loadEnemy(604);
				assert.strictEqual(enemy.__range_interval_max(), 350);
			});

			it('kb', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__kb(), 3);

				var enemy = await Unit.loadEnemy(318);
				assert.strictEqual(enemy.__kb(), 30);
			});

			it('speed', async function () {
				var enemy = await Unit.loadEnemy(0);
				var spy = sinon.spy(enemy, 'speed', ['get']);
				assert.strictEqual(enemy.__speed(), spy.get.returnValues[0]);
				assert.strictEqual(spy.get.returnValues[0], 5);
				assert(spy.get.calledOnceWith());
			});

			it('price', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__price(), 59.25);

				var enemy = await Unit.loadEnemy(318);
				assert.strictEqual(enemy.__price(), 2962.5);
			});

			it('cost', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__cost(), 59.25);

				var enemy = await Unit.loadEnemy(318);
				assert.strictEqual(enemy.__cost(), 2962.5);
			});

			it('trait', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__trait(), Unit.TB_WHITE);

				var enemy = await Unit.loadEnemy(17);
				assert.strictEqual(enemy.__trait(), Unit.TB_RED | Unit.TB_FLOAT);

				var enemy = await Unit.loadEnemy(510);
				assert.strictEqual(enemy.__trait(), Unit.TB_BLACK | Unit.TB_BARON);
			});

			it('imu', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__imu(), 0);

				var enemy = await Unit.loadEnemy(317);
				assert.strictEqual(enemy.__imu(), Unit.IMU_STOP | Unit.IMU_SLOW | Unit.IMU_KB | Unit.IMU_WEAK);
			});

			it('wavelv', async function () {
				var enemy = await Unit.loadEnemy(34);
				var spy = sinon.spy(enemy, 'waveLv', ['get']);
				assert.strictEqual(enemy.__wavelv(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('wave_prob', async function () {
				var enemy = await Unit.loadEnemy(34);
				var spy = sinon.spy(enemy, 'waveProb', ['get']);
				assert.strictEqual(enemy.__wave_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('miniwavelv', async function () {
				var enemy = await Unit.loadEnemy(538);
				var spy = sinon.spy(enemy, 'miniWaveLv', ['get']);
				assert.strictEqual(enemy.__miniwavelv(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('mini_wave_prob', async function () {
				var enemy = await Unit.loadEnemy(538);
				var spy = sinon.spy(enemy, 'miniWaveProb', ['get']);
				assert.strictEqual(enemy.__mini_wave_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('surgelv', async function () {
				var enemy = await Unit.loadEnemy(495);
				var spy = sinon.spy(enemy, 'surgeLv', ['get']);
				assert.strictEqual(enemy.__surgelv(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('surge_prob', async function () {
				var enemy = await Unit.loadEnemy(495);
				var spy = sinon.spy(enemy, 'surgeProb', ['get']);
				assert.strictEqual(enemy.__surge_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('minisurgelv', async function () {
				var enemy = await Unit.loadEnemy(652);
				var spy = sinon.spy(enemy, 'miniSurgeLv', ['get']);
				assert.strictEqual(enemy.__minisurgelv(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('mini_surge_prob', async function () {
				var enemy = await Unit.loadEnemy(652);
				var spy = sinon.spy(enemy, 'miniSurgeProb', ['get']);
				assert.strictEqual(enemy.__mini_surge_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('crit', async function () {
				var enemy = await Unit.loadEnemy(32);
				var spy = sinon.spy(enemy, 'critProb', ['get']);
				assert.strictEqual(enemy.__crit(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('slow_time', async function () {
				var enemy = await Unit.loadEnemy(185);
				var spy = sinon.spy(enemy, 'slowTime', ['get']);
				assert.strictEqual(enemy.__slow_time(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('slow_prob', async function () {
				var enemy = await Unit.loadEnemy(185);
				var spy = sinon.spy(enemy, 'slowProb', ['get']);
				assert.strictEqual(enemy.__slow_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('slow_cover', async function () {
				var enemy = await Unit.loadEnemy(185);
				var spy = sinon.spy(enemy, 'slowCover', ['get']);
				assert.strictEqual(enemy.__slow_cover(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('stop_time', async function () {
				var enemy = await Unit.loadEnemy(160);
				var spy = sinon.spy(enemy, 'stopTime', ['get']);
				assert.strictEqual(enemy.__stop_time(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('stop_prob', async function () {
				var enemy = await Unit.loadEnemy(160);
				var spy = sinon.spy(enemy, 'stopProb', ['get']);
				assert.strictEqual(enemy.__stop_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('stop_cover', async function () {
				var enemy = await Unit.loadEnemy(160);
				var spy = sinon.spy(enemy, 'stopCover', ['get']);
				assert.strictEqual(enemy.__stop_cover(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('curse_time', async function () {
				var enemy = await Unit.loadEnemy(407);
				var spy = sinon.spy(enemy, 'curseTime', ['get']);
				assert.strictEqual(enemy.__curse_time(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('curse_prob', async function () {
				var enemy = await Unit.loadEnemy(407);
				var spy = sinon.spy(enemy, 'curseProb', ['get']);
				assert.strictEqual(enemy.__curse_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('curse_cover', async function () {
				var enemy = await Unit.loadEnemy(407);
				var spy = sinon.spy(enemy, 'curseCover', ['get']);
				assert.strictEqual(enemy.__curse_cover(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('weak_time', async function () {
				var enemy = await Unit.loadEnemy(172);
				var spy = sinon.spy(enemy, 'weakTime', ['get']);
				assert.strictEqual(enemy.__weak_time(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('weak_prob', async function () {
				var enemy = await Unit.loadEnemy(172);
				var spy = sinon.spy(enemy, 'weakProb', ['get']);
				assert.strictEqual(enemy.__weak_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('weak_cover', async function () {
				var enemy = await Unit.loadEnemy(172);
				var spy = sinon.spy(enemy, 'weakCover', ['get']);
				assert.strictEqual(enemy.__weak_cover(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('weak_extent', async function () {
				var enemy = await Unit.loadEnemy(172);
				var spy = sinon.spy(enemy, 'weakExtent', ['get']);
				assert.strictEqual(enemy.__weak_extent(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('strengthen_extent', async function () {
				var enemy = await Unit.loadEnemy(175);
				var spy = sinon.spy(enemy, 'strengthenExtent', ['get']);
				assert.strictEqual(enemy.__strengthen_extent(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('lethal_prob', async function () {
				var enemy = await Unit.loadEnemy(173);
				var spy = sinon.spy(enemy, 'lethalProb', ['get']);
				assert.strictEqual(enemy.__lethal_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('savage_extent', async function () {
				var enemy = await Unit.loadEnemy(556);
				var spy = sinon.spy(enemy, 'savageExtent', ['get']);
				assert.strictEqual(enemy.__savage_extent(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('savage_prob', async function () {
				var enemy = await Unit.loadEnemy(556);
				var spy = sinon.spy(enemy, 'savageProb', ['get']);
				assert.strictEqual(enemy.__savage_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('dodge_time', async function () {
				var enemy = await Unit.loadEnemy(608);
				var spy = sinon.spy(enemy, 'dodgeTime', ['get']);
				assert.strictEqual(enemy.__dodge_time(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

			it('dodge_prob', async function () {
				var enemy = await Unit.loadEnemy(608);
				var spy = sinon.spy(enemy, 'dodgeProb', ['get']);
				assert.strictEqual(enemy.__dodge_prob(), spy.get.returnValues[0]);
				assert(spy.get.calledOnceWith());
			});

		});

	});

});
