var unit_buy = null;
var skill_file = null;
var SkillLevel = null;
var skill_level_file = null;
const loader_text = document.getElementById('loader-text');
const environment = {
	'ATK': 300,
	'DEF': 300
};
const
  ATK_SINGLE = 1,
  ATK_RANGE = 2,
  ATK_LD = 4,
  ATK_OMNI = 8,
  ATK_KB_REVENGE = 16;
const
  TB_RED = 1,
  TB_FLOAT = 2,
  TB_BLACK = 4,
  TB_METAL = 8,
  TB_ANGEL = 16,
  TB_ALIEN = 32,
  TB_ZOMBIE = 64,
  TB_RELIC = 128,
  TB_WHITE = 256,
  TB_EVA = 512,
  TB_WITCH = 1024,
  TB_DEMON = 2048,
  TB_LAST = TB_DEMON;
const
  IMU_WAVE = 1,
  IMU_STOP = 2,
  IMU_SLOW = 4,
  IMU_KB = 8,
  IMU_VOLC = 16,
  IMU_WEAK = 32,
  IMU_WARP = 64,
  IMU_CURSE = 128,
  IMU_POIATK = 256,
  IMU_LAST = IMU_POIATK;
const
   AB_STRONG = 1,
   AB_LETHAL = 2,
   AB_ATKBASE = 3,
   AB_CRIT = 4,
   AB_ZKILL = 5,
   AB_CKILL = 6,
   AB_BREAK = 7,
   AB_SHIELDBREAK = 8,
   AB_S = 9,
   AB_BOUNTY = 10,
   AB_METALIC = 11,
   AB_MINIWAVE = 12,
   AB_WAVE = 13,
   AB_MINIVOLC = 14,
   AB_VOLC = 15,
   AB_WAVES = 16,
   AB_BAIL = 17,
   AB_BSTHUNT = 18,
   AB_WKILL = 19,
   AB_EKILL = 20,
   AB_WEAK = 21,
   AB_STOP = 22,
   AB_SLOW = 23, 
   AB_ONLY = 24,
   AB_GOOD = 25, 
   AB_RESIST = 26,
   AB_RESISTS = 27,
   AB_MASSIVE = 28,
   AB_MASSIVES = 29, 
   AB_KB = 30,
   AB_WARP = 31,
   AB_IMUATK = 32;
   AB_LAST = AB_IMUATK;
const trait_short_names = ['紅','浮', '黑','鐵','天','星','屍','古', '無' , '使徒',  '魔女', '惡'];
const trait_no_treasure = TB_DEMON | TB_EVA | TB_WITCH | TB_WHITE | TB_METAL;
const trait_treasure = TB_RED | TB_FLOAT | TB_BLACK | TB_ANGEL | TB_ALIEN | TB_ZOMBIE | TB_RELIC;
function t3str(x) {
	let s = x.toString();
	switch (s.length) {
	case 3: return s;
	case 2: return '0' + s;
	case 1: return '00' + s;
	}
}
function numStr(num) {
	return parseFloat(num.toFixed(2)).toString();
}
function numStrT(num) {
	return parseFloat(num / 30).toFixed(2).toString() + 's';
}
function get_trait_short_names(trait) {
	var s = '';
	let i = 0;
	let idxs = [];
	for (let x = 1;x <= TB_LAST;x <<= 1) {
		if (trait & x) {
			s += trait_short_names[i];
		}
		i++;
	}
	return s;
}
function getTraitNames(trait) {
	if ((trait&255) == 255)
		return '所有敵人';
	if ((trait&127) == 127)
		return '有色敵人';
	
	let names = ['紅色敵人', '漂浮敵人', '黑色敵人', '鋼鐵敵人', '天使敵人', '異星戰士', '不死生物', '鋼鐵敵人', '無屬性敵人', '使徒', '魔女', '惡魔'];	
	let i = 0;
	let idxs = [];
	for (let x = 1;x <= TB_LAST;x <<= 1) {
		if (trait & x) {
			idxs.push(i);
		}
		i++;
	}
	if (idxs.length == 1)
		return names[idxs[0]];
	return get_trait_short_names(trait) + '屬性敵人';
}
function getLevelMulti(level) {
	var multi = 1;
	let n = 0;
	--level;
	for (let c of my_curve) {
		if (level <= n) break;
		multi += Math.min(level - n, 10) * (c / 100);
		n += 10;
	}
	return multi;
}
class Form {
	constructor(cat_id, level_count, data) {
		this.descs = unit_descs[cat_id][level_count];
		this.trait = 0;
		this.ab = [];
		this.imu = 0;
		this.tba = 0;
		this.price = data[6];
		this.range = data[5];
		this.hp = data[0];
		this.kb = data[1];
		this.cd = Math.max(data[7] * 2 - 264, 60); // max tech & treasure lead to -264f CD
		this.atk = data[3];
		this.atk1 = data[59] | 0;
		this.atk2 = data[60] | 0;
		this.pre = data[13];
		this.pre1 = data[61];
		this.pre2 = data[62];
		this.tba = data[4] * 2;
		let longPre = this.pre2 ? this.pre2 : (this.pre1 ? this.pre1 : this.pre);
		this.attackF = longPre + this.tba - 1;
		const form_str = 'fcs'[level_count];
		const my_id_str = t3str(cat_id);
		this.icon = `./data/unit/${my_id_str}/${form_str}/uni${my_id_str}_${form_str}00.png`;
		(data[10]) && (this.trait |= TB_RED);
		(data[16]) && (this.trait |= TB_FLOAT);
		(data[17]) && (this.trait |= TB_BLACK);
		(data[18]) && (this.trait |= TB_METAL);
		(data[19]) && (this.trait |= TB_WHITE);
		(data[20]) && (this.trait |= TB_ANGEL);
		(data[21]) && (this.trait |= TB_ALIEN);
		(data[22]) && (this.trait |= TB_ZOMBIE);
		(data[96]) && (this.trait |= TB_DEMON);
		if (this.trait) {
			let trait_names = [getTraitNames(this.trait)];
			(data[23]) && (this.ab[AB_GOOD] = trait_names);
			(data[24]) && (this.ab[AB_KB] = [data[24], trait_names[0]]);
			if (data[25]) {
				let stop_time = data[26];
				this.ab[AB_STOP] = [data[25], trait_names[0], (stop_time / 30).toFixed(1), ((stop_time*1.2) / 30).toFixed(1)];
			}
			if (data[27]) {
				let slow_time = data[28];
				this.ab[AB_SLOW] = [data[27], trait_names[0], (slow_time / 30).toFixed(1), ((slow_time*1.2) / 30).toFixed(1)];
			}
			(data[32]) && (this.ab[AB_ONLY] = trait_names);
			if (data[37]) {
				let weak_time = data[38];
				this.ab[AB_WEAK] = [data[37], trait_names[0], data[39], (weak_time / 30).toFixed(1), ((weak_time*1.2) / 30).toFixed(1)];
			}
			(data[29]) && (this.ab[AB_RESIST] = trait_names);
			(data[30]) && (this.ab[AB_MASSIVE] = trait_names);
			(data[80]) && (this.ab[AB_RESISTS] = trait_names);
			(data[81]) && (this.ab[AB_MASSIVES] = trait_names);
		}
		(data[31]) && (this.ab[AB_CRIT] = [data[31]]);
		(data[33]) && (this.ab[AB_BOUNTY] = []);
		(data[34]) && (this.ab[AB_ATKBASE] = [300]);
		(data[46]) && (this.imu |= IMU_WAVE);
		(data[48]) && (this.imu |= IMU_KB);
		(data[49]) && (this.imu |= IMU_STOP);
		(data[50]) && (this.imu |= IMU_SLOW);
		(data[51]) && (this.imu |= IMU_WEAK);
		(data[75]) && (this.imu |= IMU_WARP);
		(data[79]) && (this.imu |= IMU_CURSE);
		(data[90]) && (this.imu |= IMU_POIATK);
		(data[91]) && (this.imu |= IMU_VOLC);
		(data[41]) && (this.ab[AB_STRONG] = [data[40], data[41]]);
		(data[42]) && (this.ab[AB_LETHAL] = [data[42]]);
		(data[43]) && (this.ab[AB_METALIC] = []);
		(data[47]) && (this.ab[AB_WAVES] = []);
			if (data[35]) {
				if ((data.length < 95 || data[94] != 1)) {
					this.ab[AB_WAVE] = [data[35], data[36]];
				} else {
					this.ab[AB_MINIWAVE] = [data[35], data[36]];
				}
			}
		if (data.length >= 52) {
			(data[52]) && (this.ab[AB_ZKILL] = []);
			(data[53]) && (this.ab[AB_WKILL] = []);
			(data[77]) && (this.ab[AB_EKILL] = []);
			(data[70]) && (this.ab[AB_BREAK] = [data[70]]);
			let imu_atk_prob = data[84];
			let imu_atk_time = data[85];
			(data[82]) && (this.ab[AB_S] = [data[82], data[83]]);
			(data[84]) && (this.ab[AB_IMUATK] = [data[84], numStrT(data[85])]);
			if (data[86]) {
				let des1 = data[87] / 4;
				let des2 = des1 + data[88] / 4;
				let lv = data[89];
				let time = lv * 20;
				if (data.length >= 109 && data[108] == 1) {
					this.ab[AB_MINIVOLC] = [data[86], des1, des2, time, lv];
				} else {
					this.ab[AB_VOLC] = [data[86], des1, des2, time, lv];
				}
			}
			(data[95]) && (this.ab[AB_SHIELDBREAK] = [data[95]]);
			(data[105] && (this.ab[AB_BSTHUNT] = [data[106], data[107]]));
		}
		this.atkType = data[12] ? ATK_RANGE : ATK_SINGLE;
		let atkCount = this.atk1 == 0 ? 1 : this.atk2 == 0 ? 2 : 3;
		let lds = new Array(atkCount);
		lds[0] = data[44];
		let ldr = new Array(atkCount);
		ldr[0] = data[45];
		for (let i = 1;i < atkCount;++i) {
			if (data[99 + (i - 1) * 3] == 1) {
				lds[i] = data[99 + (i - 1) * 3 + 1];
				ldr[i] = data[99 + (i - 1) * 3 + 2];
			} else {
				lds[i] = lds[0];
				ldr[i] = ldr[0];
			}
		}
		for (let x of ldr) {
			if (x < 0) {
				this.atkType |= ATK_OMNI;
				break;
			}
			if (x > 0) {
				this.atkType |= ATK_LD;
				break;
			}
		}
	}
}
class Cat {
	constructor(id, unit_file, unit_buy, skill_file, skill_level_file) {
		if (id instanceof Object) {
			Object.assign(this, id);
			return;
		}
		const my_name = unit_names[id].filter(x => x);
		const my_name_jp = unit_names_jp[id].filter(x => x);
		const unit_levels = Math.max(my_name.length, my_name_jp.length);
		this.forms = new Array(unit_levels);
		const datas = unit_file.replace('\r', '').split('\n').filter(x => x.trim()).map(line => line.split(',').map(x => parseInt(x)));
		for (let i = 0;i < unit_levels;++i)
			this.forms[i] = new Form(id, i, datas[i]);
	}
}
async function createCat(id) {
	if (!unit_buy)
		unit_buy = await ((await fetch('./data/data/unitbuy.csv')).text());
	if (!skill_file)
		skill_file = await ((await fetch('./data/data/SkillAcquisition.csv')).text());
	if (!skill_level_file)
		skill_level_file = await ((await fetch('./data/data/SkillLevel.csv')).text());
	const id_str = t3str(id);
	const unit_file = await ((await fetch(`./data/unit/${id_str}/unit${id_str}.csv`)).text());
	return new Cat(id, unit_file, unit_buy, skill_file, skill_level_file);
}
async function getAllCats() {
	var cats = new Array(unit_names.length);
	for (let i = 0;i < cats.length;++i) {
		cats[i] = await createCat(i);
		loader_text.innerText = `Loading (${i+1}/${cats.length+1})`;
	}
	return cats;
}
async function loadAllCats() {
	return new Promise(resolve => {
		var req = indexedDB.open("db", 1);
		req.onupgradeneeded = function(event) {
	  	  const db = event.target.result;
		    const store = db.createObjectStore('cats', {"keyPath": "id"});
		    store.createIndex("data", '', {"unique": false});
		};
		req.onsuccess = function(event) {
			const db = event.target.result;
			db.transaction(["cats"], "readwrite").objectStore("cats").get(unit_names.length-1).onsuccess = function(event) {
				const res = event.target.result;
				if (!res) {
					getAllCats()
					.then(cats => {
						const tx = db.transaction(["cats"], "readwrite");
						const store = tx.objectStore("cats");
						for (let i = 0;i < cats.length;++i)
							store.put({'id': i, 'data': JSON.stringify(cats[i])});
						tx.oncomplete = function() {
							resolve(cats);
							db.close();
						}
					});
				} else {
					db.transaction(["cats"], "readwrite").objectStore("cats").getAll().onsuccess = function(event) {
						const arr = event.target.result;
						arr.sort((a, b) => a.id - b.id);
						resolve(arr.map(x => new Cat(JSON.parse(x.data))));
					}
				}
			}
		}
	});
}
