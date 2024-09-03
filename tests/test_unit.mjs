import {assert} from './lib/chai.js';
import {dbGetAll, dbClear, dbDelete} from './common.mjs';
import * as Common from '../common.mjs';
import * as Unit from '../unit.mjs';

describe('unit.mjs', function () {

	before(function () {
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
				var catsDb = await dbGetAll(Unit.DB_NAME, Unit.DB_VERSION, 'cats');
				assert.strictEqual(catsDb.length, cats.length);
				assert.strictEqual(catsDb[0].i, 0);
				assert.strictEqual(catsDb[0].info.rarity, 0);
				assert.strictEqual(catsDb[0].forms[0].name, '貓咪');
				assert.typeOf(catsDb[106].info.talents, 'string');
			}

			// IDB not exist
			await dbDelete(Unit.DB_NAME);
			await test();

			// data not stored
			await dbClear(Unit.DB_NAME, Unit.DB_VERSION, 'cats');
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
			await dbDelete(Unit.DB_NAME);
			await test();

			// data not stored
			await dbClear(Unit.DB_NAME, Unit.DB_VERSION, 'cats');
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
				var enemiesDb = await dbGetAll(Unit.DB_NAME, Unit.DB_VERSION, 'enemy');
				assert.strictEqual(enemiesDb.length, enemies.length);
				assert.strictEqual(enemiesDb[0].i, 0);
				assert.strictEqual(enemiesDb[0].name, '狗仔');
				assert.strictEqual(enemiesDb[683].name, '大型陶器埴輪巨犬');
			}

			// IDB not exist
			await dbDelete(Unit.DB_NAME);
			await test();

			// data not stored
			await dbClear(Unit.DB_NAME, Unit.DB_VERSION, 'enemy');
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
			await dbDelete(Unit.DB_NAME);
			await test();

			// data not stored
			await dbClear(Unit.DB_NAME, Unit.DB_VERSION, 'enemy');
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
				assert.deepEqual(env.treasures, defaultTreasures);
				assert.notStrictEqual(env.treasures, defaultTreasures);
				assert.strictEqual(env.add_atk, 0);
				assert.strictEqual(env.orb_hp, 1);
				assert.strictEqual(env.orb_massive, 0);
				assert.strictEqual(env.orb_resist, 1);
				assert.strictEqual(env.orb_good_atk, 0);
				assert.strictEqual(env.orb_good_hp, 1);
			});

			it('with params', function () {
				var treasures = [50, 100, , 200, 250];
				var env = new Unit.CatEnv({
					treasures,
					add_atk: 5,
					orb_hp: 0.8,
					orb_massive: 0.5,
					orb_resist: 0.75,
					orb_good_atk: 0.3,
					orb_good_hp: 0.9,
				});
				var defaultTreasures = Common.config.getDefaultTreasures();
				assert.deepEqual(env.treasures, [50, 100, 300, 200, 250].concat(defaultTreasures.slice(5)));
				assert.notStrictEqual(env.treasures, treasures);
				assert.notStrictEqual(env.treasures, defaultTreasures);
				assert.strictEqual(env.add_atk, 5);
				assert.strictEqual(env.orb_hp, 0.8);
				assert.strictEqual(env.orb_massive, 0.5);
				assert.strictEqual(env.orb_resist, 0.75);
				assert.strictEqual(env.orb_good_atk, 0.3);
				assert.strictEqual(env.orb_good_hp, 0.9);
			});

			it('forbid changing internal objects', function () {
				var env = new Unit.CatEnv();

				assert.throws(() => {
					env.treasures = 1;
				}, TypeError);

				assert.throws(() => {
					delete env.treasures;
				}, TypeError);
			});

		});

		describe('reset', function () {

			it('basic', function () {
				var env = new Unit.CatEnv();
				var treasures = env.treasures;

				env.treasures[0] = 0;
				env.treasures[2] = 0;
				env.add_atk = 5;
				env.orb_hp = 0.8;
				env.orb_massive = 0.5;
				env.orb_resist = 0.75;
				env.orb_good_atk = 0.3;
				env.orb_good_hp = 0.9;
				env.reset();

				assert.strictEqual(env.treasures, treasures);
				assert.deepEqual(env.treasures, Common.config.getDefaultTreasures());
				assert.strictEqual(env.add_atk, 0);
				assert.strictEqual(env.orb_hp, 1);
				assert.strictEqual(env.orb_massive, 0);
				assert.strictEqual(env.orb_resist, 1);
				assert.strictEqual(env.orb_good_atk, 0);
				assert.strictEqual(env.orb_good_hp, 1);
			});

		});

		describe('getters', function () {

			it('basic', function () {
				var env = new Unit.CatEnv({
					treasures: [100, 200],
				});
				assert.strictEqual(env.atk_t, 1 + 0.005 * 100);
				assert.strictEqual(env.hp_t, 1 + 0.005 * 200);

				env.treasures[0] = 150;
				env.treasures[1] = 250;
				assert.strictEqual(env.atk_t, 1 + 0.005 * 150);
				assert.strictEqual(env.hp_t, 1 + 0.005 * 250);
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
				assert.strictEqual(cat.obtnStage, '10|19|0|黑暗天堂 - 進擊的黑漩渦 困難');
			});

		});

		describe('Cat.evolStage', function () {

			it('basic', async function () {
				var cat = await Unit.loadCat(0);
				assert.isUndefined(cat.evolStage);

				var cat = await Unit.loadCat(60);
				assert.strictEqual(cat.evolStage, '1|172|1|絕・黑暗天堂 - 絕擊的黑漩渦　極難');
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

				// "#"
				var cat = await Unit.loadCat(34);
				assert.deepEqual(cat.xpCurve, [7800, 9800, 14800, 21800, 42500, 64300, 93200, 118000, 197400, 513500]);

				// "$"
				var cat = await Unit.loadCat(30);
				assert.deepEqual(cat.xpCurve, [6250, 8200, 12400, 17800, 24800, 42400, 64500, 93000, 148000, 298000]);

				// "@"
				var cat = await Unit.loadCat(24);
				assert.deepEqual(cat.xpCurve, [5000, 8000, 12200, 17800, 24800, 33200, 43000, 54200, 66800, 80800]);
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

		describe('CatForm.health', function () {

			it('level should be counted', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.health, 250);
				cf.level = 10;
				assert.strictEqual(cf.health, 700);
				cf.level = 20;
				assert.strictEqual(cf.health, 1200);
				cf.level = 100;
				assert.strictEqual(cf.health, 4200);
			});

			it('the defense buff talent should be counted', async function () {
				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.health, 105300);

				cf.applyAllTalents([0, 0, 5, 0, 0]);
				assert.strictEqual(cf.health, 115830);

				cf.applyAllTalents([0, 0, 10, 0, 0]);
				assert.strictEqual(cf.health, 126360);
			});

		});

		describe('CatForm.ap', function () {

			it('level should be counted', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.ap, 20);
				cf.level = 10;
				assert.strictEqual(cf.ap, 55);
				cf.level = 20;
				assert.strictEqual(cf.ap, 95);
				cf.level = 100;
				assert.strictEqual(cf.ap, 335);
			});

			it('multi-attack should be counted', async function () {
				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.ap, 121000);
			});

			it('the attack buff talent should be counted', async function () {
				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.ap, 101250);

				cf.applyAllTalents([0, 0, 0, 5, 0]);
				assert.strictEqual(cf.ap, 111375);

				cf.applyAllTalents([0, 0, 0, 10, 0]);
				assert.strictEqual(cf.ap, 121500);
			});

		});

		describe('CatForm.dps', function () {

			it('level should be counted', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.dps, 16);
				cf.level = 10;
				assert.strictEqual(cf.dps, 44);
				cf.level = 20;
				assert.strictEqual(cf.dps, 77);
				cf.level = 100;
				assert.strictEqual(cf.dps, 271);
			});

			it('multi-attack should be counted', async function () {
				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.dps, 39032);
			});

			it('the attack buff talent should be counted', async function () {
				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.dps, 44669);

				cf.applyAllTalents([0, 0, 0, 5, 0]);
				assert.strictEqual(cf.dps, 49136);

				cf.applyAllTalents([0, 0, 0, 10, 0]);
				assert.strictEqual(cf.dps, 53602);
			});

		});

		describe('CatForm.cost', function () {

			it('basic', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.cost, 75);

				var cf = (await Unit.loadCat(61)).forms[2];
				assert.strictEqual(cf.cost, 1425);

				var cf = (await Unit.loadCat(61)).forms[2];
				cf.applyAllTalents();
				assert.strictEqual(cf.cost, 975);
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

		describe('Search keys', function () {

			it('hasab()', async function () {
				var cf = (await Unit.loadCat(2)).forms[2];
				assert.isTrue(cf.__hasab(Unit.AB_GOOD));

				var cf = (await Unit.loadCat(0)).forms[2];
				assert.isFalse(cf.__hasab(Unit.AB_GOOD));
			});

			it('hasres()', async function () {
				var cf = (await Unit.loadCat(47)).forms[2];
				cf.applyAllTalents();
				assert.isTrue(cf.__hasres(Unit.RES_CURSE));

				// @TODO: should return false
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.isNotOk(cf.__hasres(Unit.RES_CURSE));
			});

			it('dpsagainst()', async function () {
				var cf = (await Unit.loadCat(2)).forms[2];
				cf.level = 10;
				assert.strictEqual(cf.__dpsagainst(Unit.TB_RED), 700);

				var cf = (await Unit.loadCat(2)).forms[2];
				cf.level = 10;
				assert.strictEqual(cf.__dpsagainst(Unit.TB_BLACK), 388);
			});

			it('hpagainst()', async function () {
				var cf = (await Unit.loadCat(2)).forms[2];
				cf.level = 10;
				assert.strictEqual(cf.__hpagainst(Unit.TB_RED), 5600);

				var cf = (await Unit.loadCat(2)).forms[2];
				cf.level = 10;
				assert.strictEqual(cf.__hpagainst(Unit.TB_BLACK), 2800);
			});

			it('evol_require()', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__evol_require(0), 0);

				var cf = (await Unit.loadCat(44)).forms[2];
				assert.strictEqual(cf.__evol_require(0), 1000000);
				assert.strictEqual(cf.__evol_require(35), 7);
				assert.strictEqual(cf.__evol_require(34), 0);
			});

			it('evol4_require()', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__evol4_require(0), 0);

				var cf = (await Unit.loadCat(138)).forms[3];
				assert.strictEqual(cf.__evol4_require(0), 1000000);
				assert.strictEqual(cf.__evol4_require(40), 2);
				assert.strictEqual(cf.__evol4_require(167), 5);
			});

			it('id', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__id, 0);

				var cf = (await Unit.loadCat(138)).forms[3];
				assert.strictEqual(cf.__id, 138);
			});

			it('rarity', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__rarity, 0);

				var cf = (await Unit.loadCat(138)).forms[0];
				assert.strictEqual(cf.__rarity, 4);
			});

			it('formc', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__formc, 1);

				var cf = (await Unit.loadCat(0)).forms[1];
				assert.strictEqual(cf.__formc, 2);

				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__formc, 3);

				var cf = (await Unit.loadCat(138)).forms[3];
				assert.strictEqual(cf.__formc, 4);
			});

			it('maxformc', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__maxformc, 3);

				var cf = (await Unit.loadCat(200)).forms[0];
				assert.strictEqual(cf.__maxformc, 2);

				var cf = (await Unit.loadCat(138)).forms[0];
				assert.strictEqual(cf.__maxformc, 4);
			});

			it('max_base_lv', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__max_base_lv, 20);

				var cf = (await Unit.loadCat(138)).forms[3];
				assert.strictEqual(cf.__max_base_lv, 60);
			});

			it('max_plus_lv', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__max_plus_lv, 90);

				var cf = (await Unit.loadCat(138)).forms[3];
				assert.strictEqual(cf.__max_plus_lv, 70);
			});

			it('hp', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__hp, 250);

				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.__hp, 105300);
			});

			it('atk', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__atk, 20);

				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.__atk, 101250);

				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.__atk, 121000);
			});

			it('attack', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__attack, 20);

				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.__attack, 101250);

				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.__attack, 121000);
			});

			it('dps', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__dps, 16);

				var cf = (await Unit.loadCat(44)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.__dps, 44669);

				var cf = (await Unit.loadCat(25)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.__dps, 39032);
			});

			it('thp', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__thp, 250);

				var cf = (await Unit.loadCat(288)).forms[1];
				cf.level = 50;
				assert.strictEqual(cf.__thp, 688500);
			});

			it('tatk', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__tatk, 20);

				var cf = (await Unit.loadCat(554)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.__tatk, 121500);
			});

			it('tdps', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__tdps, 16);

				var cf = (await Unit.loadCat(554)).forms[2];
				cf.level = 50;
				assert.strictEqual(cf.__tdps, 28700);
			});

			it('attackf', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__attackf, 37);

				var cf = (await Unit.loadCat(25)).forms[1];
				assert.strictEqual(cf.__attackf, 600);
			});

			it('attacks', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.approximately(cf.__attacks, 37 / 30, Number.EPSILON);

				var cf = (await Unit.loadCat(25)).forms[1];
				assert.strictEqual(cf.__attacks, 20);
			});

			it('pre', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__pre, 8);

				var cf = (await Unit.loadCat(439)).forms[2];
				assert.strictEqual(cf.__pre, 20);
			});

			it('pre1', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__pre1, 0);

				var cf = (await Unit.loadCat(439)).forms[2];
				assert.strictEqual(cf.__pre1, 80);
			});

			it('pre2', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__pre2, 0);

				var cf = (await Unit.loadCat(439)).forms[2];
				assert.strictEqual(cf.__pre2, 140);
			});

			it('backswing', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__backswing, 10);

				var cf = (await Unit.loadCat(25)).forms[2];
				assert.strictEqual(cf.__backswing, 73);
			});

			it('tba', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__tba, 30);

				var cf = (await Unit.loadCat(138)).forms[3];
				assert.strictEqual(cf.__tba, 40);
			});

			it('revenge', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.isFalse(cf.__revenge);

				var cf = (await Unit.loadCat(25)).forms[2];
				assert.isTrue(cf.__revenge);
			});

			it('atkcount', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__atkcount, 1);

				var cf = (await Unit.loadCat(25)).forms[2];
				assert.strictEqual(cf.__atkcount, 3);
			});

			it('atktype', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__atktype, Unit.ATK_SINGLE);

				var cf = (await Unit.loadCat(1)).forms[2];
				assert.strictEqual(cf.__atktype, Unit.ATK_RANGE);

				var cf = (await Unit.loadCat(259)).forms[0];
				assert.strictEqual(cf.__atktype, Unit.ATK_RANGE | Unit.ATK_LD);

				var cf = (await Unit.loadCat(437)).forms[0];
				assert.strictEqual(cf.__atktype, Unit.ATK_RANGE | Unit.ATK_OMNI);

				var cf = (await Unit.loadCat(25)).forms[2];
				assert.strictEqual(cf.__atktype, Unit.ATK_RANGE | Unit.ATK_KB_REVENGE);
			});

			it('range', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__range, 140);

				var cf = (await Unit.loadCat(141)).forms[0];
				assert.strictEqual(cf.__range, 540);
			});

			it('range_min', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__range_min, 140);

				var cf = (await Unit.loadCat(259)).forms[2];
				assert.strictEqual(cf.__range_min, 450);

				var cf = (await Unit.loadCat(643)).forms[2];
				assert.strictEqual(cf.__range_min, -100);

				var cf = (await Unit.loadCat(690)).forms[1];
				assert.strictEqual(cf.__range_min, 250);
			});

			it('range_max', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__range_max, 140);

				var cf = (await Unit.loadCat(259)).forms[2];
				assert.strictEqual(cf.__range_max, 850);

				var cf = (await Unit.loadCat(643)).forms[2];
				assert.strictEqual(cf.__range_max, 350);

				var cf = (await Unit.loadCat(690)).forms[1];
				assert.strictEqual(cf.__range_max, 1000);
			});

			it('reach_base', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__reach_base, 140);

				var cf = (await Unit.loadCat(259)).forms[2];
				assert.strictEqual(cf.__reach_base, 450);

				var cf = (await Unit.loadCat(643)).forms[2];
				assert.strictEqual(cf.__reach_base, 350);

				var cf = (await Unit.loadCat(690)).forms[1];
				assert.strictEqual(cf.__reach_base, 250);
			});

			it('range_interval', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__range_interval, 0);

				var cf = (await Unit.loadCat(259)).forms[2];
				assert.strictEqual(cf.__range_interval, 400);

				var cf = (await Unit.loadCat(643)).forms[2];
				assert.strictEqual(cf.__range_interval, 450);

				var cf = (await Unit.loadCat(690)).forms[1];
				assert.strictEqual(cf.__range_interval, 350);
			});

			it('range_interval_max', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__range_interval_max, 0);

				var cf = (await Unit.loadCat(259)).forms[2];
				assert.strictEqual(cf.__range_interval_max, 400);

				var cf = (await Unit.loadCat(643)).forms[2];
				assert.strictEqual(cf.__range_interval_max, 450);

				var cf = (await Unit.loadCat(690)).forms[1];
				assert.strictEqual(cf.__range_interval_max, 410);

				var cf = (await Unit.loadCat(686)).forms[1];
				assert.strictEqual(cf.__range_interval_max, 430);
			});

			it('kb', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__kb, 3);

				var cf = (await Unit.loadCat(13)).forms[2];
				assert.strictEqual(cf.__kb, 1);
			});

			it('speed', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__speed, 10);

				var cf = (await Unit.loadCat(25)).forms[2];
				assert.strictEqual(cf.__speed, 60);
			});

			it('price', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__price, 75);

				var cf = (await Unit.loadCat(25)).forms[2];
				assert.strictEqual(cf.__price, 4500);
			});

			it('cost', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__cost, 75);

				var cf = (await Unit.loadCat(25)).forms[2];
				assert.strictEqual(cf.__cost, 4500);
			});

			it('cdf', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__cdf, 60);

				var cf = (await Unit.loadCat(25)).forms[2];
				assert.strictEqual(cf.__cdf, 2936);
			});

			it('cd', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__cd, 2);

				var cf = (await Unit.loadCat(25)).forms[2];
				assert.approximately(cf.__cd, 2936 / 30, Number.EPSILON);
			});

			it('trait', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__trait, 0);

				var cf = (await Unit.loadCat(2)).forms[2];
				assert.strictEqual(cf.__trait, Unit.TB_RED);

				var cf = (await Unit.loadCat(13)).forms[2];
				assert.strictEqual(cf.__trait, Unit.TB_RED | Unit.TB_BLACK);
			});

			it('imu', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__imu, 0);

				var cf = (await Unit.loadCat(44)).forms[1];
				assert.strictEqual(cf.__imu, Unit.IMU_WEAK);

				var cf = (await Unit.loadCat(439)).forms[2];
				assert.strictEqual(cf.__imu, Unit.IMU_STOP | Unit.IMU_WARP);
			});

			it('wavelv', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__wavelv, 0);

				var cf = (await Unit.loadCat(352)).forms[2];
				assert.strictEqual(cf.__wavelv, 5);
			});

			it('volclv', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__volclv, 0);

				var cf = (await Unit.loadCat(543)).forms[1];
				assert.strictEqual(cf.__volclv, 3);
			});

			it('miniwavelv', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__miniwavelv, 0);

				var cf = (await Unit.loadCat(585)).forms[1];
				assert.strictEqual(cf.__miniwavelv, 5);
			});

			it('minivolclv', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__minivolclv, 0);

				var cf = (await Unit.loadCat(413)).forms[2];
				assert.strictEqual(cf.__minivolclv, 1);
			});

			it('wave_prob', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__wave_prob, 0);

				var cf = (await Unit.loadCat(94)).forms[2];
				assert.strictEqual(cf.__wave_prob, 100);
			});

			it('mini_wave_prob', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__mini_wave_prob, 0);

				var cf = (await Unit.loadCat(585)).forms[1];
				assert.strictEqual(cf.__mini_wave_prob, 100);
			});

			it('surge_prob', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__surge_prob, 0);

				var cf = (await Unit.loadCat(543)).forms[1];
				assert.strictEqual(cf.__surge_prob, 100);
			});

			it('mini_surge_prob', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__mini_surge_prob, 0);

				var cf = (await Unit.loadCat(705)).forms[1];
				assert.strictEqual(cf.__mini_surge_prob, 100);
			});

			it('crit', async function () {
				var cf = (await Unit.loadCat(0)).forms[0];
				assert.strictEqual(cf.__crit, 0);

				var cf = (await Unit.loadCat(57)).forms[2];
				assert.strictEqual(cf.__crit, 50);
			});

			it('slow_time', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__slow_time, 0);

				var cf = (await Unit.loadCat(138)).forms[0];
				assert.strictEqual(cf.__slow_time, 70);
			});

			it('slow_prob', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__slow_prob, 0);

				var cf = (await Unit.loadCat(138)).forms[0];
				assert.strictEqual(cf.__slow_prob, 20);
			});

			it('slow_cover', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__slow_cover, 0);

				var cf = (await Unit.loadCat(138)).forms[0];
				assert.strictEqual(cf.__slow_cover, '33.87');
			});

			it('stop_time', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__stop_time, 0);

				var cf = (await Unit.loadCat(439)).forms[0];
				assert.strictEqual(cf.__stop_time, 30);
			});

			it('stop_prob', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__stop_prob, 0);

				var cf = (await Unit.loadCat(439)).forms[0];
				assert.strictEqual(cf.__stop_prob, 100);
			});

			it('stop_cover', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__stop_cover, 0);

				var cf = (await Unit.loadCat(439)).forms[0];
				assert.strictEqual(cf.__stop_cover, '34.95');
			});

			it('curse_time', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__curse_time, 0);

				var cf = (await Unit.loadCat(543)).forms[0];
				assert.strictEqual(cf.__curse_time, 135);
			});

			it('curse_prob', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__curse_prob, 0);

				var cf = (await Unit.loadCat(543)).forms[0];
				assert.strictEqual(cf.__curse_prob, 100);
			});

			it('curse_cover', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__curse_cover, 0);

				var cf = (await Unit.loadCat(543)).forms[0];
				assert.strictEqual(cf.__curse_cover, '94.74');
			});

			it('weak_time', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__weak_time, 0);

				var cf = (await Unit.loadCat(198)).forms[2];
				assert.strictEqual(cf.__weak_time, 200);
			});

			it('weak_prob', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__weak_prob, 0);

				var cf = (await Unit.loadCat(198)).forms[2];
				assert.strictEqual(cf.__weak_prob, 100);
			});

			it('weak_cover', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__weak_cover, 0);

				var cf = (await Unit.loadCat(198)).forms[2];
				assert.strictEqual(cf.__weak_cover, '100');
			});

			it('weak_extent', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__weak_extent, 0);

				var cf = (await Unit.loadCat(198)).forms[2];
				assert.strictEqual(cf.__weak_extent, 50);
			});

			it('strong_extent', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__strong_extent, 0);

				var cf = (await Unit.loadCat(441)).forms[1];
				assert.strictEqual(cf.__strong_extent, 100);
			});

			it('lethal_prob', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__lethal_prob, 0);

				var cf = (await Unit.loadCat(37)).forms[1];
				assert.strictEqual(cf.__lethal_prob, 50);

				var cf = (await Unit.loadCat(37)).forms[2];
				assert.strictEqual(cf.__lethal_prob, 100);
			});

			it('savage_extent', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__savage_extent, 0);

				var cf = (await Unit.loadCat(519)).forms[2];
				assert.strictEqual(cf.__savage_extent, 200);
			});

			it('savage_prob', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__savage_prob, 0);

				var cf = (await Unit.loadCat(519)).forms[2];
				assert.strictEqual(cf.__savage_prob, 30);
			});

			it('break_prob', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__break_prob, 0);

				var cf = (await Unit.loadCat(245)).forms[2];
				assert.strictEqual(cf.__break_prob, 30);
			});

			it('shield_break_prob', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__shield_break_prob, 0);

				var cf = (await Unit.loadCat(617)).forms[2];
				assert.strictEqual(cf.__shield_break_prob, 50);
			});

			it('dodge_time', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__dodge_time, 0);

				var cf = (await Unit.loadCat(187)).forms[2];
				assert.strictEqual(cf.__dodge_time, 60);
			});

			it('dodge_prob', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__dodge_prob, 0);

				var cf = (await Unit.loadCat(187)).forms[2];
				assert.strictEqual(cf.__dodge_prob, 20);
			});

			it('beast_prob', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__beast_prob, 0);

				var cf = (await Unit.loadCat(532)).forms[2];
				assert.strictEqual(cf.__beast_prob, 30);
			});

			it('beast_time', async function () {
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.strictEqual(cf.__beast_time, 0);

				var cf = (await Unit.loadCat(532)).forms[2];
				assert.strictEqual(cf.__beast_time, 30);
			});

		});

	});

	describe('Enemy', function () {

		describe('Enemy.health', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.health, 90);

				var enemy = await Unit.loadEnemy(8);
				assert.strictEqual(enemy.health, 2500);
			});

		});

		describe('Enemy.ap', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.ap, 8);
			});

			it('multi-attack should be counted', async function () {
				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.ap, 4997);
			});

		});

		describe('Enemy.dps', function () {

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.dps, 8 / 47 * 30);
			});

			it('multi-attack should be counted', async function () {
				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.dps, 4997 / 16 * 30);
			});

		});

		describe('Enemy.cost', function () {

			afterEach(function () {
				Unit.catEnv.reset();
			});

			it('basic', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.cost, 59.25);

				var enemy = await Unit.loadEnemy(8);
				assert.strictEqual(enemy.cost, 2567.5);
			});

			it('research and treasures should be counted', async function () {
				var enemy = await Unit.loadEnemy(0);
				Unit.catEnv.treasures[3] = 0;
				Unit.catEnv.treasures[18] = 1;
				assert.strictEqual(enemy.cost, 15);

				Unit.catEnv.treasures[3] = 100;
				assert.strictEqual(enemy.cost, 22.5);

				Unit.catEnv.treasures[3] = 300;
				assert.strictEqual(enemy.cost, 37.5);

				Unit.catEnv.treasures[18] = 5;
				assert.strictEqual(enemy.cost, 40.5);
				Unit.catEnv.treasures[18] = 30;
				assert.strictEqual(enemy.cost, 59.25);
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

		describe('Search keys', function () {

			it('hasab()', async function () {
				var enemy = await Unit.loadEnemy(407);
				assert.isTrue(enemy.__hasab(Unit.AB_CURSE));

				var enemy = await Unit.loadEnemy(407);
				assert.isFalse(enemy.__hasab(Unit.AB_WAVE));
			});

			it('hasres()', async function () {
				// @TODO: should return false
				var enemy = await Unit.loadEnemy(407);
				assert.isNotOk(enemy.__hasres());
			});

			it('id', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__id, 0);

				var enemy = await Unit.loadEnemy(8);
				assert.strictEqual(enemy.__id, 8);
			});

			it('hp', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__hp, 90);

				var enemy = await Unit.loadEnemy(8);
				assert.strictEqual(enemy.__hp, 2500);
			});

			it('atk', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__atk, 8);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__atk, 4997);
			});

			it('attack', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__attack, 8);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__attack, 4997);
			});

			it('dps', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__dps, 8 / 47 * 30);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__dps, 4997 / 16 * 30);
			});

			it('thp', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__thp, 90);

				var enemy = await Unit.loadEnemy(8);
				assert.strictEqual(enemy.__thp, 2500);
			});

			it('tatk', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__tatk, 8);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__tatk, 4997);
			});

			it('tdps', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__tdps, 8 / 47 * 30);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__tdps, 4997 / 16 * 30);
			});

			it('attackf', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__attackf, 47);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__attackf, 16);
			});

			it('attacks', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__attacks, 47 / 30);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__attacks, 16 / 30);
			});

			it('pre', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__pre, 8);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__pre, 2);
			});

			it('pre1', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__pre1, 0);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__pre1, 4);
			});

			it('pre2', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__pre2, 0);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__pre2, 8);
			});

			it('backswing', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__backswing, 10);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__backswing, 8);
			});

			it('tba', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__tba, 40);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__tba, 0);
			});

			it('revenge', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.isFalse(enemy.__revenge);

				var enemy = await Unit.loadEnemy(52);
				assert.isTrue(enemy.__revenge);
			});

			it('atktype', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__atktype, Unit.ATK_SINGLE);

				var enemy = await Unit.loadEnemy(52);
				assert.strictEqual(enemy.__atktype, Unit.ATK_RANGE | Unit.ATK_KB_REVENGE);

				var enemy = await Unit.loadEnemy(318);
				assert.strictEqual(enemy.__atktype, Unit.ATK_RANGE | Unit.ATK_LD);

				var enemy = await Unit.loadEnemy(405);
				assert.strictEqual(enemy.__atktype, Unit.ATK_RANGE | Unit.ATK_OMNI);
			});

			it('range', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__range, 110);

				var enemy = await Unit.loadEnemy(318);
				assert.strictEqual(enemy.__range, 150);
			});

			it('kb', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__kb, 3);

				var enemy = await Unit.loadEnemy(318);
				assert.strictEqual(enemy.__kb, 30);
			});

			it('speed', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__speed, 5);

				var enemy = await Unit.loadEnemy(318);
				assert.strictEqual(enemy.__speed, 36);
			});

			it('price', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__price, 59.25);

				var enemy = await Unit.loadEnemy(318);
				assert.strictEqual(enemy.__price, 2962.5);
			});

			it('cost', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__cost, 59.25);

				var enemy = await Unit.loadEnemy(318);
				assert.strictEqual(enemy.__cost, 2962.5);
			});

			it('trait', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__trait, Unit.TB_WHITE);

				var enemy = await Unit.loadEnemy(17);
				assert.strictEqual(enemy.__trait, Unit.TB_RED | Unit.TB_FLOAT);

				var enemy = await Unit.loadEnemy(510);
				assert.strictEqual(enemy.__trait, Unit.TB_BLACK | Unit.TB_BARON);
			});

			it('imu', async function () {
				var enemy = await Unit.loadEnemy(0);
				assert.strictEqual(enemy.__imu, 0);

				var enemy = await Unit.loadEnemy(317);
				assert.strictEqual(enemy.__imu, Unit.IMU_STOP | Unit.IMU_SLOW | Unit.IMU_KB | Unit.IMU_WEAK);
			});

		});

	});

});
