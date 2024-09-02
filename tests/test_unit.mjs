import {assert} from './lib/chai.js';
import {dbGetAll, dbDelete} from './common.mjs';
import * as Unit from '../unit.mjs';

describe('unit.mjs', function () {

	describe('loadCat', function () {

		it('check if cats data can be loaded and stored', async function () {
			await dbDelete(Unit.DB_NAME);

			// check when idb doesn't exists

			// check return value
			var cats = await Unit.loadCat();
			assert.strictEqual(cats[0].i, 0);
			assert.strictEqual(cats[0].info.rarity, 0);
			assert.strictEqual(cats[0].forms[0].name, '貓咪');
			assert.instanceOf(cats[106].info.talents, Int16Array);

			// check the value stored in idb
			var catsDb = await dbGetAll(Unit.DB_NAME, Unit.DB_VERSION, 'cats');
			assert.strictEqual(catsDb.length, cats.length);
			assert.strictEqual(catsDb[0].i, 0);
			assert.strictEqual(catsDb[0].info.rarity, 0);
			assert.strictEqual(catsDb[0].forms[0].name, '貓咪');
			assert.instanceOf(catsDb[106].info.talents, Int16Array);

			// check when idb exists

			// check return value
			var cats = await Unit.loadCat();
			assert.strictEqual(cats[0].i, 0);
			assert.strictEqual(cats[0].info.rarity, 0);
			assert.strictEqual(cats[0].forms[0].name, '貓咪');
			assert.instanceOf(cats[106].info.talents, Int16Array);

			// check the value stored in idb
			var catsDb = await dbGetAll(Unit.DB_NAME, Unit.DB_VERSION, 'cats');
			assert.strictEqual(catsDb.length, cats.length);
			assert.strictEqual(catsDb[0].i, 0);
			assert.strictEqual(catsDb[0].info.rarity, 0);
			assert.strictEqual(catsDb[0].forms[0].name, '貓咪');
			assert.instanceOf(catsDb[106].info.talents, Int16Array);
		});

		it('check loading single cat', async function () {
			var cat = await Unit.loadCat(1);
			assert.strictEqual(cat.i, 1);
			assert.strictEqual(cat.info.rarity, 0);
			assert.strictEqual(cat.forms[0].name, '坦克貓');
		});

	});

	describe('loadEnemy', function () {

		it('check if enemies data can be loaded and stored', async function () {
			await dbDelete(Unit.DB_NAME);

			// check when idb doesn't exists

			// check return value
			var enemies = await Unit.loadEnemy();
			assert.strictEqual(enemies[0].i, 0);
			assert.strictEqual(enemies[0].name, '狗仔');

			// check the value stored in idb
			var enemiesDb = await dbGetAll(Unit.DB_NAME, Unit.DB_VERSION, 'enemy');
			assert.strictEqual(enemiesDb.length, enemies.length);
			assert.strictEqual(enemiesDb[0].i, 0);
			assert.strictEqual(enemiesDb[0].name, '狗仔');

			// check when idb exists

			// check return value
			var enemies = await Unit.loadEnemy();
			assert.strictEqual(enemies[0].i, 0);
			assert.strictEqual(enemies[0].name, '狗仔');

			// check the value stored in idb
			var enemiesDb = await dbGetAll(Unit.DB_NAME, Unit.DB_VERSION, 'enemy');
			assert.strictEqual(enemiesDb.length, enemies.length);
			assert.strictEqual(enemiesDb[0].i, 0);
			assert.strictEqual(enemiesDb[0].name, '狗仔');
		});

		it('check loading single enemy', async function () {
			var enemy = await Unit.loadEnemy(1);
			assert.strictEqual(enemy.i, 1);
			assert.strictEqual(enemy.name, "扭扭蛇");
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
				var catForm = (await Unit.loadCat(0)).forms[2];
				catForm.baseLv = 5;
				assert.strictEqual(catForm.baseLv, 5);
				catForm.baseLv = 20;
				assert.strictEqual(catForm.baseLv, 20);
			});

			it('forbid setting beyond [1, maxBaseLv]', async function () {
				var catForm = (await Unit.loadCat(0)).forms[2];
				catForm.baseLv = 0;
				assert.strictEqual(catForm.baseLv, 1);
				catForm.baseLv = 21;
				assert.strictEqual(catForm.baseLv, 20);
			});

		});

		describe('CatForm.plusLv', function () {

			it('basic get and set', async function () {
				var catForm = (await Unit.loadCat(0)).forms[2];
				catForm.plusLv = 5;
				assert.strictEqual(catForm.plusLv, 5);
				catForm.plusLv = 20;
				assert.strictEqual(catForm.plusLv, 20);
			});

			it('forbid setting beyond [0, maxPlusLv]', async function () {
				var catForm = (await Unit.loadCat(0)).forms[2];
				catForm.plusLv = -1;
				assert.strictEqual(catForm.plusLv, 0);
				catForm.plusLv = 91;
				assert.strictEqual(catForm.plusLv, 90);
			});

		});

		describe('CatForm.level', function () {

			it('basic get and set', async function () {
				var catForm = (await Unit.loadCat(0)).forms[2];
				catForm.level = 5;
				assert.strictEqual(catForm.level, 5);
				assert.strictEqual(catForm.baseLv, 5);
				assert.strictEqual(catForm.plusLv, 0);
				catForm.level = 20;
				assert.strictEqual(catForm.level, 20);
				assert.strictEqual(catForm.baseLv, 20);
				assert.strictEqual(catForm.plusLv, 0);
				catForm.level = 21;
				assert.strictEqual(catForm.level, 21);
				assert.strictEqual(catForm.baseLv, 20);
				assert.strictEqual(catForm.plusLv, 1);
			});

			it('forbid setting beyond [1, maxBaseLv + maxPlusLv]', async function () {
				var catForm = (await Unit.loadCat(0)).forms[2];
				catForm.level = 0;
				assert.strictEqual(catForm.level, 1);
				assert.strictEqual(catForm.baseLv, 1);
				assert.strictEqual(catForm.plusLv, 0);
				catForm.level = 111;
				assert.strictEqual(catForm.level, 110);
				assert.strictEqual(catForm.baseLv, 20);
				assert.strictEqual(catForm.plusLv, 90);
			});

		});

		describe('CatForm.getLevelMulti', function () {

			it('get value for the specified level', async function () {
				var catForm = (await Unit.loadCat(0)).forms[2];
				assert.approximately(catForm.getLevelMulti(1), 1, Number.EPSILON);
				assert.approximately(catForm.getLevelMulti(2), 1.2, Number.EPSILON);
				assert.approximately(catForm.getLevelMulti(10), 2.8, Number.EPSILON);
				assert.approximately(catForm.getLevelMulti(50), 10.8, Number.EPSILON);
			});

			it('get value for current level if not specified', async function () {
				var catForm = (await Unit.loadCat(0)).forms[2];

				catForm.level = 1;
				assert.approximately(catForm.getLevelMulti(), 1, Number.EPSILON);

				catForm.level = 10;
				assert.approximately(catForm.getLevelMulti(), 2.8, Number.EPSILON);

				catForm.level = 50;
				assert.approximately(catForm.getLevelMulti(), 10.8, Number.EPSILON);
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

			it('hasab', async function () {
				var cf = (await Unit.loadCat(2)).forms[2];
				assert.isTrue(cf.__hasab(Unit.AB_GOOD));

				var cf = (await Unit.loadCat(0)).forms[2];
				assert.isFalse(cf.__hasab(Unit.AB_GOOD));
			});

			it('hasres', async function () {
				var cf = (await Unit.loadCat(47)).forms[2];
				cf.applyAllTalents();
				assert.isTrue(cf.__hasres(Unit.RES_CURSE));

				// @TODO: should return false
				var cf = (await Unit.loadCat(0)).forms[2];
				assert.isNotOk(cf.__hasres(Unit.RES_CURSE));
			});

			it('dpsagainst', async function () {
				var cf = (await Unit.loadCat(2)).forms[2];
				cf.level = 10;
				assert.strictEqual(cf.__dpsagainst(Unit.TB_RED), 280);

				var cf = (await Unit.loadCat(2)).forms[2];
				cf.level = 10;
				assert.strictEqual(cf.__dpsagainst(Unit.TB_BLACK), 155);
			});

			it('hpagainst', async function () {
				var cf = (await Unit.loadCat(2)).forms[2];
				cf.level = 10;
				assert.strictEqual(cf.__hpagainst(Unit.TB_RED), 5600);

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

		describe('Search keys', function () {

			it('hasab', async function () {
				var enemy = await Unit.loadEnemy(407);
				assert.isTrue(enemy.__hasab(Unit.AB_CURSE));

				var enemy = await Unit.loadEnemy(407);
				assert.isFalse(enemy.__hasab(Unit.AB_WAVE));
			});

			it('hasres', async function () {
				// @TODO: should return false
				var enemy = await Unit.loadEnemy(407);
				assert.isNotOk(enemy.__hasres());
			});

		});

	});

});
