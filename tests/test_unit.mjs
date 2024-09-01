import {assert} from './lib/chai.js';
import {dbGetAll, dbClear, dbDelete} from './common.mjs';
import * as Common from '../common.mjs';
import * as Unit from '../unit.mjs';

describe('unit.mjs', function () {

	describe('loadAllCats', function () {

		it('check if cats data can be loaded and stored', async function () {
			async function test() {
				// check return value
				var cats = await Unit.loadAllCats();
				assert.strictEqual(cats[0].i, 0);
				assert.strictEqual(cats[0].info.rarity, 0);
				assert.strictEqual(cats[0].forms[0].name, '貓咪');
				assert.instanceOf(cats[106].info.talents, Int16Array);

				// check stored data
				var catsDb = await dbGetAll(Unit.DB_NAME, Unit.DB_VERSION, 'cats');
				assert.strictEqual(catsDb.length, cats.length);
				assert.strictEqual(catsDb[0].i, 0);
				assert.strictEqual(catsDb[0].info.rarity, 0);
				assert.strictEqual(catsDb[0].forms[0].name, '貓咪');
				assert.instanceOf(catsDb[106].info.talents, Int16Array);
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
				assert.strictEqual(cat.forms[0].name, '坦克貓');

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
				assert.strictEqual(enemies[0].i, 0);
				assert.strictEqual(enemies[0].name, '狗仔');
				assert.strictEqual(enemies[683].name, '大型陶器埴輪巨犬');

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
				assert.strictEqual(enemy.i, 1);
				assert.strictEqual(enemy.name, "扭扭蛇");
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

	});

	describe('Enemy', function () {

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

	});

});
