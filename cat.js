var unit_buy = null;
var skill_file = null;
var SkillLevel = null;
var skill_level_file = null;
var uints_zip = null;
var anim2 = null;
var _eggs = null;
const loader_text = document.getElementById('loader-text');
var def_lv;
var plus_lv;
var my_curve;
var _info;
const environment = {
	'ATK': 300,
	'DEF': 300
};
const catfruits = {
	30: '紫色貓薄荷種子',
	31: '紅色貓薄荷種子',
	32: '藍色貓薄荷種子',
	33: '綠色貓薄荷種子',
	34: '黃色貓薄荷種子',
	35: '紫色貓薄荷果實',
	36: '紅色貓薄荷果實',
	37: '藍色貓薄荷果實',
	38: '綠色貓薄荷果實',
	39: '黃色貓薄荷種子',
	40: '彩虹貓薄荷果實',
	41: '古代貓薄荷種子',
	42: '古代貓薄荷果實',
	43: '彩虹貓薄荷種子',
	44: '黃金貓薄荷果實',
	160: '惡貓薄荷種子',
	161: '惡貓薄荷果實',
	164: '黃金貓薄荷種子',
	167: "紫獸石",
	168: "紅獸石",
	169: "蒼獸石",
	170: "翠獸石",
	171: "黃獸石",
	179: "紫獸石結晶",
	180: "紅獸石結晶",
	181: "蒼獸石結晶",
	182: "翠獸石結晶",
	183: "黃獸石結晶",
	184: "虹獸石"
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
   AB_LAST = AB_IMUATK
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
	return parseFloat((num / 30).toFixed(2)).toString() + '秒';
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
const _curves = [curveData0, curveData1, curveData2, curveData3, curveData4, curveData5];
function useCurve(my_id) {
	my_curve = _curves[curveMap[my_id]];
}
function getLevelMulti(level) {
	var multi = 0.8;
	let n = 0;
	for (let c of my_curve) {
		if (level <= n) break;
		multi += Math.min(level - n, 10) * (c / 100);
		n += 10;
	}
	return multi;
}
class Form {
	constructor(name, jp_name, cat_id, level_count, data) {
		if (!data) {
			Object.assign(this, name);
			return;
		}
		this.id = cat_id;
		this.lvc = level_count;
		this.name = name;
		this.jp_name = jp_name;
		this.trait = 0;
		this.ab = {};
		this.imu = 0;
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
		this.speed = data[2];
		const atkAnim = anim2[cat_id][level_count];
		this.backswing = atkAnim[0];
		this.attackF = atkAnim[1];
		const form_str = 'fcs'[level_count];
		const my_id_str = t3str(cat_id);
		const may_egg = _eggs[level_count];
		if (may_egg >= 0) {
			const str = t3str(_eggs[level_count]);
			this.icon = `./data/img/m/${str}/${str}_m.png`;
		} else {
			this.icon = `./data/unit/${my_id_str}/${form_str}/uni${my_id_str}_${form_str}00.png`;
		}
		(data[10]) && (this.trait |= TB_RED);
		(data[16]) && (this.trait |= TB_FLOAT);
		(data[17]) && (this.trait |= TB_BLACK);
		(data[18]) && (this.trait |= TB_METAL);
		(data[19]) && (this.trait |= TB_WHITE);
		(data[20]) && (this.trait |= TB_ANGEL);
		(data[21]) && (this.trait |= TB_ALIEN);
		(data[22]) && (this.trait |= TB_ZOMBIE);
		(data[78]) && (this.trait |= TB_RELIC);
		(data[96]) && (this.trait |= TB_DEMON);
		if (this.trait) {
			let trait_names = [getTraitNames(this.trait)];
			(data[23]) && (this.ab[AB_GOOD] = trait_names);
			(data[24]) && (this.ab[AB_KB] = [data[24], trait_names[0]]);
			if (data[25]) {
				let stop_time = data[26];
				let cover = Math.min((data[25] * stop_time * 1.2) / (this.attackF * 100), 1);
				this.ab[AB_STOP] = [data[25], trait_names[0], (stop_time / 30).toFixed(1), ((stop_time*1.2) / 30).toFixed(1), (cover*100).toFixed(0) + '%'];
			}
			if (data[27]) {
				let slow_time = data[28];
				let cover = Math.min((data[27] * slow_time * 1.2) / (this.attackF * 100), 1);
				this.ab[AB_SLOW] = [data[27], trait_names[0], (slow_time / 30).toFixed(1), ((slow_time*1.2) / 30).toFixed(1), (cover*100).toFixed(0) + '%'];
			}
			(data[32]) && (this.ab[AB_ONLY] = trait_names);
			if (data[37]) {
				let weak_time = data[38];
				let cover = Math.min((data[37] * weak_time * 1.2) / (this.attackF * 100), 1);
				this.ab[AB_WEAK] = [data[37], trait_names[0], data[39], (weak_time / 30).toFixed(1), ((weak_time*1.2) / 30).toFixed(1), (cover*100).toFixed(0) + '%'];
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
			(data[97]) && (this.ab[AB_BAIL] = []);
			(data[98]) && (this.ab[AB_CKILL] = []);
			(data[105] && (this.ab[AB_BSTHUNT] = [data[106], data[107]]));
		}
		this.atkType = data[12] ? ATK_RANGE : ATK_SINGLE;
		let atkCount = this.atk1 == 0 ? 1 : this.atk2 == 0 ? 2 : 3;
		this.lds = new Array(atkCount);
		this.lds[0] = data[44];
		this.ldr = new Array(atkCount);
		this.ldr[0] = data[45];
		for (let i = 1;i < atkCount;++i) {
			if (data[99 + (i - 1) * 3] == 1) {
				this.lds[i] = data[99 + (i - 1) * 3 + 1];
				this.ldr[i] = data[99 + (i - 1) * 3 + 2];
			} else {
				this.lds[i] = this.lds[0];
				this.ldr[i] = this.ldr[0];
			}
		}
		for (let x of this.ldr) {
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
	hasab(ab) {
		return this.ab.hasOwnProperty(ab);
	}
	getid() {
		return this.id;
	}
	getTotalLv() {
		return Math.min(def_lv, _info.maxBase) + Math.min(plus_lv, _info.maxPlus);
	}
	getlevelcount() {
		this.lvc;
	}
	getkb() {
		return this.kb;
	}
	getrarity() {
		return _info.rarity;
	}
	gettrait() {
		return this.trait;
	}
	getrange() {
		return this.range;
	}
	getattackf() {
		return this.attackF;
	}
	getattacks() {
		return this.attackF / 30;
	}
	getbackswing() {
		return this.backswing;
	}
	gethp() {
		return this.hp * 2.5 * getLevelMulti(this.getTotalLv());
	}
	getatk() {
		return 2.5 * (this.atk + this.atk1 + this.atk2) * getLevelMulti(this.getTotalLv());
	}
	getdps() {
		return (this.getatk() * 30) / this.attackF;
	}
	getthp() {
		let hp = this.gethp();
		if (this.ab.hasOwnProperty(AB_RESIST)) {
			hp *= (this.trait & trait_treasure) ? 5 : 4;
		} else if (this.ab.hasOwnProperty(AB_RESISTS)) {
			hp *= (this.trait & trait_treasure) ? 7 : 6;
		}
		if (this.ab.hasOwnProperty(AB_GOOD)) {
			hp *= (this.trait & trait_treasure) ? 2.5 : 2;
		}
		if (this.ab.hasOwnProperty(AB_BSTHUNT)) {
			hp /= 0.6;
		}
		if (this.ab.hasOwnProperty(AB_BAIL)) {
			hp /= 0.7;
		}
		if (this.ab.hasOwnProperty(AB_EKILL)) {
			hp *= 5;
		}
		if (this.ab.hasOwnProperty(AB_WKILL)) {
			hp *= 10;
		}
		return hp;
	}
	gettdps() {
		let dps = this.getdps();
		if (this.ab.hasOwnProperty(AB_ATKBASE))
			return dps * 4;
		if (this.ab.hasOwnProperty(AB_S)) {
			const s = this.ab[AB_S];
			dps += dps * ((s[0] * s[1]) / 10000);
		}
		if (this.ab.hasOwnProperty(AB_CRIT))
			dps += dps * (this.ab[AB_CRIT][0] / 100);
		if (this.ab.hasOwnProperty(AB_STRONG))
			dps *= 1 + (this.ab[AB_STRONG][1] / 100);
		if (this.ab.hasOwnProperty(AB_MASSIVE))
			dps *= (this.trait & trait_treasure) ? 4 : 3;
		else if (this.ab.hasOwnProperty(AB_MASSIVES))
			dps *= (this.trait & trait_treasure) ? 6 : 5;
		if (this.ab.hasOwnProperty(AB_GOOD))
			dps *= (this.trait & trait_treasure) ? 1.8 : 1.5;
		if (this.ab.hasOwnProperty(AB_BSTHUNT))
			dps *= 2.5;
		if (this.ab.hasOwnProperty(AB_BAIL))
			dps *= 1.6;
		if (this.ab.hasOwnProperty(AB_EKILL))
			dps *= 5;
		if (this.ab.hasOwnProperty(AB_WKILL))
			dps *= 5;
		return dps;
	}
	gettatk() {
		let atk = this.getatk();
		if (this.ab.hasOwnProperty(AB_ATKBASE))
			return atk * 4;
		if (this.ab.hasOwnProperty(AB_S))
			atk *= (this.ab[AB_S][1] / 100);
		if (this.ab.hasOwnProperty(AB_CRIT))
			atk += atk;
		if (this.ab.hasOwnProperty(AB_STRONG))
			atk *= 1 + (this.ab[AB_STRONG][1] / 100);
		if (this.ab.hasOwnProperty(AB_MASSIVE))
			atk *= (this.trait & trait_treasure) ? 4 : 3;
		else if (this.ab.hasOwnProperty(AB_MASSIVES))
			atk *= (this.trait & trait_treasure) ? 6 : 5;
		if (this.ab.hasOwnProperty(AB_GOOD))
			atk *= (this.trait & trait_treasure) ? 1.8 : 1.5;
		if (this.ab.hasOwnProperty(AB_BSTHUNT))
			atk *= 2.5;
		if (this.ab.hasOwnProperty(AB_BAIL))
			atk *= 1.6;
		if (this.ab.hasOwnProperty(AB_EKILL))
			atk *= 5;
		if (this.ab.hasOwnProperty(AB_WKILL))
			atk *= 5;
		return atk;
	}
	getspeed() {
		return this.speed;
	}
	getprice() {
		return this.price * 1.5;
	}
	getcost() {
		return this.price * 1.5;
	}
	getcd() {
		return this.cd / 30;
	}
	getimu() {
		return this.imu;
	}
	getatktype() {
		return this.atkType;
	}
}
class CatInfo {
	constructor(id) {
		if (id instanceof Object) {
			Object.assign(this, id);
			return;
		}
		this.loadTalents(id);
		this.loadAttitional(id);
	}
	getRarityString(cat_id) {
		const rarities = ["基本", "EX", "稀有", "激稀有", "超激稀有", "傳說稀有"];
		return rarities[this.rarity];
	}
	loadAttitional(my_id) {
		const text = unit_buy;
		var i = 0;
		var start = 0;
		var end;
		while (i < my_id) {
			var j = start;
			for (;text[j] != '\n';++j) {}
			start = j + 1;
			++i;
		}
		for (end = start;text[end] != '\n';++end) {}
		const data = text.slice(start, end).split(',').map(x => parseInt(x));
		this.rarity = data[13];
		this.maxBase = data[50];
		this.maxPlus = data[51];
		var version = data[data.length - 6];
		if (version >= 100000)
			this.version = version;
		if (data[27]) {
			this.upReqs = [[data[27], 0]];
			for (let i = 28;i <= 38;i+=2) {
				let amount = data[i + 1];
				if (amount) {
					this.upReqs.push([amount, data[i]]);
				}
			}
		}
		this.crazed = (data[3] > 50000) && (data[13] == 3);
		let xp_last = this.crazed ? data[3] * 1.5 : data[2] * 2;
		this.xp_data = [0].concat(data.slice(3, 12), xp_last).join(',');
		_eggs = data.slice(data.length - 2);
	}
	loadTalents(my_id) {
		const text = skill_file;
		const skillCost = skill_level_file;
		const match = '\n' + my_id.toString();
		var idx = text.indexOf(match);
		if (idx != -1) {
			++idx;
			var end;
			for (end = idx;text[end] != '\n' && text[end];++end) {}
			let data = text.slice(idx, end).split(',').map(x => parseInt(x));
			let talents = [];
			for (let i = 0;i < 8;++i) {
				let o = i * 14;
				let maxLv = data[o+3];
				let lvId = data[o+13];
				let costIdx = skillCost.indexOf('\n' + lvId.toString());
				if (costIdx != -1) {
					++costIdx;
					var end;
					for (end = costIdx;skillCost[end] != '\n' && skillCost[end];++end) {}
					let costData = skillCost.slice(costIdx, end).split(',').slice(1).map(x => parseInt(x));
					talents.push([data.slice(o+2, o+16), costData, maxLv]);
				}
			}
		}
	}
}
class Cat {
	constructor(id, unit_file) {
		if (id instanceof Object) {
			this.forms = new Array(id.forms.length);
			for (let i = 0;i < id.forms.length;++i)
				this.forms[i] = new Form(id.forms[i]);
			this.info = new CatInfo(id.info);
			return;
		}
		this.info = new CatInfo(id);
		const my_name = unit_names[id];
		const my_name_jp = unit_names_jp[id];
		const unit_levels = Math.max(my_name.filter(x => x).length, my_name_jp.filter(x => x).length);
		this.forms = new Array(unit_levels);
		const datas = unit_file.replace('\r', '').split('\n').filter(x => x.trim()).map(line => line.split(',').map(x => parseInt(x)));
		for (let i = 0;i < unit_levels;++i) {
			this.forms[i] = new Form(my_name[i], my_name_jp[i], id, i, datas[i]);
		}
	}
}
async function getZip() {
	return await JSZip.loadAsync(
		await (
			(await fetch("./all_units.zip")).blob())
	);
}
async function createCat(id) {
	const unit_file = await uints_zip.file(`all/${id}`).async('string');
	return new Cat(id, unit_file);
}
async function getAllCats() {
	console.log('[Loading cats]');
	unit_buy = await ((await fetch('./data/data/unitbuy.csv')).text());
	skill_file = await ((await fetch('./data/data/SkillAcquisition.csv')).text());
	skill_level_file = await ((await fetch('./data/data/SkillLevel.csv')).text());
	uints_zip = await getZip();
	var cats = new Array(unit_names.length);
	for (let i = 0;i < cats.length;++i) {
		cats[i] = await createCat(i);
		loader_text.innerText = `Loading (${i+1}/${cats.length})`;
	}
	uints_zip = null;
	return cats;
}
async function loadAllCats() {
	return new Promise(resolve => {
		var req = indexedDB.open("db", 1);
		req.onupgradeneeded = function(event) {
	  	  const db = event.target.result;
	  	  try { db.deleteObjectStore('cats'); } catch (e) { }
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
let icon_names = [
		'strong', 
		'lethal', 
		'atkbase', 
		'crit', 
	  'z-kill', 
	  'ckill', 
	  'break', 
	  'shield-break', 
	  's', 
	  'bounty', 
	  'metalic',
	  'mini-wave', 
	  'wave', 
	  'mini-volc', 
	  'volc', 
	  'waves',
	  'bail', 
	  'bsthunt',
	  'wkill', 
	  'ekill',
	  'weak', 
	  'stop', 
	  'slow', 
	  'only', 
	  'good', 
	  'resist', 
	  'resists', 
	  'massive', 
	  'massives', 
	  'kb', 
	  'warp', 
	  'imu-atk'
]
let icon_descs = [
	'血量{1}%以下攻擊力增加{2}%倍',
	'{1}%機率以1血存活一次', 
	'善於攻城({1}%倍s傷害)',
	'{1}%機率會心一擊',
	'終結不死	',
	'靈魂攻擊',
	'{1}%機率打破宇宙盾',
	'{1}%機率打破惡魔盾',
	'{1}%機率渾身一擊(攻擊力增加{2}%倍)',
	'擊倒敵人獲得兩倍金錢',
	'鋼鐵特性(爆擊之外攻擊只會受1傷害)',
	'{1}%機率放出Lv{2}小波動',
	'{1}%機率放出Lv{2}波動',
	'{1}%機率放出Lv{5}小烈波(出現位置{2}~{3}，持續{4}f)',
	'{1}%機率放出Lv{5}烈波(出現位置{2}~{3}，持續{4}f)',
	'波動滅止	',
	'超生命體特效(傷害1.6倍、受傷害減少30%)',
	'超獸特效(對超獸敵人傷害2.5倍、減傷40%、{1}%攻擊無效{2}f)',
	'終結魔女	',
	'終結使徒',
	'{1}%機率降低{2}攻擊力至{3}%{4}秒({5}秒，控場覆蓋率{6})',
	'{1}%機率暫停{2}{3}秒({4}秒，控場覆蓋率{5})',
	'{1}%機率緩速{2}{3}秒({4}秒，控場覆蓋率{5})',
	'只能攻擊{1}',
	'對{1}傷害傷害1.5倍(1.8倍)受到紅屬性的敵人傷害減少50%(60%)',
	'受到{1}攻擊的傷害減至1/4(1/5)',
	'受到{1}攻擊的傷害減至1/6(1/7)',
	'對{1}造成3倍(4倍)傷害',
	'對{1}造成5倍(6倍)傷害',
	'{1}%機率擊退{2}',
	'{1}%機率傳送{2}',
	'{1}%發動攻擊無效{2}秒'
]
function createAbIcons1(ab, parent) {
	for (let i = 1;i <= AB_LAST;++i) {
		if (i < 20 && ab.hasOwnProperty(i)) {
			const e = document.createElement('span');
			e.classList.add('bc-icon', `bc-icon-${icon_names[i - 1]}`);
			parent.appendChild(e);
			const e2 = document.createElement('span');
			{
				var s = icon_descs[i - 1];
				let o = ab[i];
				for (let j = 1;j <= o.length;++j) {
					s = s.replace('{' + j.toString() + '}', o[j - 1]);
				}
				e2.innerText = s;
			}
			parent.appendChild(e2);
			parent.appendChild(document.createElement('br'));
		}
	}
}
function createAbIcons2(ab, parent) {
	for (let i = 1;i <= AB_LAST;++i) {
		if (i >= 20 && ab.hasOwnProperty(i)) {
			const e = document.createElement('span');
			e.classList.add('bc-icon', `bc-icon-${icon_names[i - 1]}`);
			parent.appendChild(e);
			const e2 = document.createElement('span');
			{
				var s = icon_descs[i - 1];
				let o = ab[i];
				for (let j = 1;j <= o.length;++j) {
					s = s.replace('{' + j.toString() + '}', o[j - 1]);
				}
				e2.innerText = s;
			}
			parent.appendChild(e2);
			parent.appendChild(document.createElement('br'));
		}
	}
}
function createImuIcons(imu, parent) {
	if (!imu) return;
	let names = [
		'波動無效', 
		'暫停無效', 
		'緩速無效', 
		'擊退無效',
		'烈波無效',
		'降攻無效',
		'傳送無效',
		'詛咒無效',
		'毒擊無效'
	];
	let icon_names = ['wave', 'stop', 'slow', 'kb', 'volc', 'weak', 'warp', 'curse', 'poiatk'];
	let i = 0;
	for (let x = 1;x <= IMU_LAST;x <<= 1) {
		if (imu & x) {
			const e = document.createElement('span');
			e.classList.add('bc-icon', `bc-icon-imu-${icon_names[i]}`);
			parent.appendChild(e);
			const e2 = document.createElement('span');
			e2.innerText = names[i];
			parent.appendChild(e2);
			parent.appendChild(document.createElement('br'));
		}
		i++;
	}
}
function createTraitIcons(trait, parent) {
	if (parent.childNodes.length)
		parent.appendChild(document.createElement('br'));
	if (!trait) return;
	const names = [
		'red', 'float', 'black', 'metal', 'angel', 'alien', 'zombie', 'relic', 'white', 'eva', 'witch', 'demon'
	];
	let i = 0;
	for (let x = 1;x <= TB_LAST;x <<= 1) {
		if (trait & x) {
			const e = document.createElement('span');
			e.classList.add('bc-icon', `bc-icon-trait-${names[i]}`);
			parent.appendChild(e);
		}
		++i;
	}
	parent.appendChild(document.createElement('br'));
}
(async () => {
	unit_buy = await ((await fetch('./data/data/unitbuy.csv')).text());
	skill_file = await ((await fetch('./data/data/SkillAcquisition.csv')).text());
	skill_level_file = await ((await fetch('./data/data/SkillLevel.csv')).text());
	anim2 = await ((await fetch('./anim2')).json());
	uints_zip = await getZip();
})();
