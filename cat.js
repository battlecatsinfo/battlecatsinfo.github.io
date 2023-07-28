var unit_buy = null;
var skill_file = null;
var SkillLevel = null;
var uints_zip = null;
var t_unit = null;
var anim1 = null;
var anim2 = null;
var _eggs = null;
var enemy_descs = null;
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
  C_ATK = 0,
  C_DEF = 1,
  C_SPE = 2,
  C_C_INI = 3,
  C_M_LV = 4,
  C_M_INI = 5,
  C_C_ATK = 6,
  C_C_SPE = 7,
	C_M_INC = 8,
  C_M_MAX = 9,
  C_BASE = 10,
  C_RESP = 11,
  C_MEAR = 12,
  C_XP = 13,
  C_GOOD = 14,
  C_MASSIVE = 15,
  C_RESIST = 16,
  C_KB = 17,
  C_SLOW = 18,
  C_STOP = 19,
  C_WEAK = 20,
  C_STRONG = 21,
  C_WKILL = 22,
  C_EKILL = 23,
  C_CRIT = 24,
  C_TOT = 25;
const combo_f = [
	"角色攻擊力+$%",
	"角色體力+$%",
	"跑速+$%",
	"貓砲初期能量+$格",
	"工作狂貓初期等級+$",
	"初期持有金錢+$元",
	"貓砲攻擊力+$%",
	"貓砲冷卻-$f",
	"工作狂貓工作效率+$%",
	"錢包上限+$%",
	"城堡體力+$%",
	"研究力-$f",
	"打倒敵人獲得金錢+$%",
	"通關xp+$%",
	"善於攻擊效果+$%",
	"超大傷害效果+$%",
	"很耐打效果+$%",
	"擊退距離上升+$%",	
	"緩速效果時間+$%",
	"暫停效果時間+$%",
	"降攻效果時間+$%",
	"降血增攻幅度+$%",
	"終結魔女",
	"終結使徒",
	"會心一擊機率+$%",
];
const combo_params = [
[10,15,20,30,-20],
[10,20,30,50,-20],
[10,15,20,30,-20],
[20,40,60,100,0],
[1,2,3,4,0],
[300,500,1000,2000,0],
[20,50,100,200,-50],
[150,300,450,600,-20],
[10,20,30,50,-20],
[10,20,30,50,-20],
[20,50,100,200,-90],
[26.4,52.8,79.2,105.6,-20],
[10,20,30,50,-20],
[10,15,20,30,-90],
[10,20,30,50,-20],
[10,20,30,50,-20],
[10,20,30,50,-20],
[10,20,30,50,-20],
[10,20,30,50,-20],
[10,20,30,50,-20],
[10,20,30,50,-20],
[20,30,50,100,-20],
[400,400,400,400,400],
[400,400,400,400,400],
[1,2,3,4,0]
];
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
  TB_INFN = 4096,
  TB_BEAST = 8192,
  TB_BARON = 16384;
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
   AB_IMUATK = 32,
   AB_CURSE = 33,
   AB_BURROW = 34,
   AB_REVIVE = 35,
   AB_POIATK = 36,
   AB_GLASS = 37,
   AB_SHIELD = 38,
   AB_DSHIELD = 39,
   AB_COUNTER = 40,
   AB_AFTERMATH = 41;
const
  RES_WEAK = 0,
  RES_STOP = 1,
  RES_SLOW = 2,
  RES_KB = 3,
  RES_WAVE = 4,
  RES_SURGE = 5,
  RES_CURSE = 6,
  RES_TOXIC = 7,
  RES_LAST = RES_TOXIC;
const trait_short_names = ['紅','浮', '黑','鐵','天','星','屍','古', '無', '使徒', '魔女', '惡'];
const trait_no_treasure = TB_DEMON | TB_EVA | TB_WITCH | TB_WHITE | TB_RELIC;
const trait_treasure = TB_RED | TB_FLOAT | TB_BLACK | TB_ANGEL | TB_ALIEN | TB_ZOMBIE | TB_METAL;
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
	for (let x = 1;x <= TB_DEMON;x <<= 1) {
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
	let names = ['紅色敵人', '漂浮敵人', '黑色敵人', '鋼鐵敵人', '天使敵人', '異星戰士', '不死生物', '古代種', '無屬性敵人', '使徒', '魔女', '惡魔'];	
	let i = 0;
	let idxs = [];
	for (let x = 1;x <= TB_DEMON;x <<= 1) {
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
		if (level_count == 2)
			this.data = Int16Array.from(data); // We need unit data when calculate talents
		this.id = cat_id;
		this.lvc = level_count;
		this.name = name;
		this.jp_name = jp_name;
		this.trait = 0;
		this.ab = {};
		this.res = {};
		this.imu = 0;
		this.price = data[6];
		this.range = data[5];
		this.hp = data[0];
		this.kb = data[1];
		this.cd = Math.max(data[7] * 2 - 264, 60);
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
			const str = t3str(may_egg);
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
			const trait_names = [getTraitNames(this.trait)];
			(data[23]) && (this.ab[AB_GOOD] = trait_names);
			(data[24]) && (this.ab[AB_KB] = [data[24], trait_names[0]]);
			if (data[25]) {
				let stop_time = data[26];
				let cover = Math.min((data[25] * stop_time * 1.2) / (this.attackF * 100), 1);
				this.ab[AB_STOP] = [data[25], trait_names[0], numStrT(stop_time), numStrT(stop_time * 1.2), numStr(cover*100) + '%'];
			}
			if (data[27]) {
				let slow_time = data[28];
				let cover = Math.min((data[27] * slow_time * 1.2) / (this.attackF * 100), 1);
				this.ab[AB_SLOW] = [data[27], trait_names[0], numStrT(slow_time), numStrT(slow_time * 1.2), numStr(cover*100) + '%'];
			}
			(data[32]) && (this.ab[AB_ONLY] = trait_names);
			if (data[37]) {
				let weak_time = data[38];
				let cover = Math.min((data[37] * weak_time * 1.2) / (this.attackF * 100), 1);
				this.ab[AB_WEAK] = [data[37], trait_names[0], data[39], numStrT(weak_time), numStrT(weak_time * 1.2), numStr(cover*100) + '%'];
			}
			(data[29]) && (this.ab[AB_RESIST] = trait_names);
			(data[30]) && (this.ab[AB_MASSIVE] = trait_names);
			(data[80]) && (this.ab[AB_RESISTS] = trait_names);
			(data[81]) && (this.ab[AB_MASSIVES] = trait_names);
			if (data[92]) {
				let curse_time = data[93];
				let cover = Math.min((data[92] * curse_time * 1.2) / (this.attackF * 100), 1);
				this.ab[AB_CURSE] = [data[92], trait_names[0], numStrT(curse_time),  numStrT(curse_time * 1.2), numStr(cover*100) + '%'];
			}
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
				const des1 = data[87] >> 2;
				const des2 = (data[87] + data[88]) >> 2;
				const lv = data[89];
				const time = lv * 20;
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
		if ((this.tba + this.pre) < (this.attackF / 2))
			this.atkType |= ATK_KB_REVENGE;
	}
	updateTraitNames() {
		const new_names = getTraitNames(this.trait);
		if (this.ab.hasOwnProperty(AB_GOOD))
			this.ab[AB_GOOD][0] = new_names;
		if (this.ab.hasOwnProperty(AB_KB))
			this.ab[AB_KB][1] = new_names;
		if (this.ab.hasOwnProperty(AB_STOP))
			this.ab[AB_STOP][1] = new_names;
		if (this.ab.hasOwnProperty(AB_WEAK))
			this.ab[AB_WEAK][1] = new_names;
		if (this.ab.hasOwnProperty(AB_SLOW))
			this.ab[AB_SLOW][1] = new_names;
		if (this.ab.hasOwnProperty(AB_ONLY))
			this.ab[AB_ONLY][0] = new_names;
		if (this.ab.hasOwnProperty(AB_RESIST))
			this.ab[AB_RESIST][0] = new_names;
		if (this.ab.hasOwnProperty(AB_RESISTS))
			this.ab[AB_RESISTS][0] = new_names;
		if (this.ab.hasOwnProperty(AB_MASSIVE))
			this.ab[AB_MASSIVE][0] = new_names;
		if (this.ab.hasOwnProperty(AB_MASSIVES))
			this.ab[AB_MASSIVES][0] = new_names;
		if (this.ab.hasOwnProperty(AB_CURSE))
			this.ab[AB_CURSE][1] = new_names;
	}
	applyTalent(talent, level) {
		if (!level) return;
		switch (talent[0]) {
case 1:
{
		if (this.data[37]) {
			const o = this.ab[AB_WEAK];
			o[1] = getTraitNames(this.trait);
			if (talent[4] && talent[4] != talent[5]) {
				const weak_time = this.data[38] + talent[4] + (level-1) * (talent[5] - talent[4]) / (talent[1] - 1);
				const cover = Math.min((this.data[37] * weak_time * 1.2) / (this.attackF * 100), 1);
				o[3] = numStrT(weak_time);
				o[4] = numStrT(weak_time * 1.2);
				o[5] = numStr(cover*100) + '%';
			} else {
				const weak_time = this.data[38];
				const pos = this.data[37] + talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
				const cover = Math.min((pos * weak_time * 1.2) / (this.attackF * 100), 1);
				o[0] = pos;
				o[5] = numStr(cover*100) + '%';
			}
		} else {
			if (talent[4] && talent[4] != talent[5]) {
				const weak_time = this.data[38] + talent[4] + (level-1) * (talent[5] - talent[4]) / (talent[1] - 1);
				const pos = talent[2];
				const cover = Math.min((pos * weak_time * 1.2) / (this.attackF * 100), 1);
				this.ab[AB_WEAK] = [pos, getTraitNames(this.trait), talent[7], numStrT(weak_time), numStrT(weak_time * 1.2), numStr(cover*100) + '%'];
			} else {
				const weak_time = this.data[38];
				const pos = talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
				const cover = Math.min((pos * weak_time * 1.2) / (this.attackF * 100), 1);
				this.ab[AB_WEAK] = [pos, getTraitNames(this.trait), talent[7], numStrT(weak_time), numStrT(weak_time * 1.2), numStr(cover*100) + '%'];
			}
	}
	break;
}
case 2:
{
		if (this.data[25]) {
			const o = this.ab[AB_STOP];
			o[1] = getTraitNames(this.trait);
			if (talent[4] && talent[4] != talent[5]) {
				const stop_time = this.data[26] + talent[4] + (level-1) * (talent[5] - talent[4]) / (talent[1] - 1);
				const cover = Math.min((this.data[25] * stop_time * 1.2) / (this.attackF * 100), 1);
				o[2] = numStrT(stop_time);
				o[3] = numStrT(stop_time * 1.2);
				o[4] = numStr(cover*100) + '%';
			} else {
				const stop_time = this.data[26];
				const pos = this.data[25] + talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
				const cover = Math.min((pos * stop_time * 1.2) / (this.attackF * 100), 1);
				o[0] = pos;
				o[4] = numStr(cover*100) + '%';
			}
		} else {
			if (talent[4] && talent[4] != talent[5]) {
					const stop_time = this.data[26] + talent[4] + (level-1) * (talent[5] - talent[4]) / (talent[1] - 1);
					const pos = talent[2];
					const cover = Math.min((pos * stop_time * 1.2) / (this.attackF * 100), 1);
					this.ab[AB_STOP] = [pos, getTraitNames(this.trait), numStrT(stop_time), numStrT(stop_time * 1.2), numStr(cover*100) + '%'];
			} else {
					const stop_time = this.data[26];
					const pos = talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
					const cover = Math.min((pos * stop_time * 1.2) / (this.attackF * 100), 1);
					this.ab[AB_STOP] = [pos, getTraitNames(this.trait), numStrT(stop_time), numStrT(stop_time * 1.2), numStr(cover*100) + '%'];
			}
		}
	break;
}
case 3:
{
		if (this.data[27]) {
			const o = this.ab[AB_SLOW];
			o[1] = getTraitNames(this.trait);
			if (talent[4] && talent[4] != talent[5]) {
				const slow_time = this.data[28] + talent[4] + (level-1) * (talent[5] - talent[4]) / (talent[1] - 1);
				const cover = Math.min((this.data[27] * slow_time * 1.2) / (this.attackF * 100), 1);
				o[2] = numStrT(slow_time);
				o[3] = numStrT(slow_time * 1.2);
				o[4] = numStr(cover*100) + '%';
			} else {
				const slow_time = this.data[28];
				const pos = this.data[27] + talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
				const cover = Math.min((pos * slow_time * 1.2) / (this.attackF * 100), 1);
				o[0] = pos;
				o[4] = numStr(cover*100) + '%';
			}
		} else {
			if (talent[4] && talent[4] != talent[5]) {
					const slow_time = this.data[28] + talent[4] + (level-1) * (talent[5] - talent[4]) / (talent[1] - 1);
					const pos = talent[2];
					const cover = Math.min((pos * slow_time * 1.2) / (this.attackF * 100), 1);
					this.ab[AB_SLOW] = [pos, getTraitNames(this.trait), numStrT(slow_time), numStrT(slow_time * 1.2), numStr(cover*100) + '%'];
			} else {
					const slow_time = this.data[28];
					const pos = talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
					const cover = Math.min((pos * slow_time * 1.2) / (this.attackF * 100), 1);
					this.ab[AB_SLOW] = [pos, getTraitNames(this.trait), numStrT(slow_time), numStrT(slow_time * 1.2), numStr(cover*100) + '%'];
			}
	}
	break;
}
case 5:
	this.ab[AB_GOOD] = [getTraitNames(this.trait)];
	break;
case 6: 
	this.ab[AB_RESIST] = [getTraitNames(this.trait)];
	break;
case 7:
	this.ab[AB_MASSIVE] = [getTraitNames(this.trait)];
	break;
case 8:
	if (this.data[24]) {
		this.ab[AB_KB][0] += talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	} else {
		this.ab[AB_KB] = [talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1), getTraitNames(this.trait)];
	}
	break;
case 10:
	if (this.data[40]) {
		this.ab[AB_STRONG][1] += talent[4] + (level-1) * (talent[5] - talent[4]) / (talent[1] - 1);
	} else {
		this.ab[AB_STRONG] = [talent[2], talent[4] + (level-1) * (talent[5] - talent[4]) / (talent[1] - 1)];
	}
	break;
case 11:
	if (this.data[42]) {
		this.ab[AB_LETHAL][0] += talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	} else {
		this.ab[AB_LETHAL] = [talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1)];
	}
	break;
case 13:
	if (this.data[31]) {
		this.ab[AB_CRIT][0] += talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	} else {
		this.ab[AB_CRIT] = talent[2];
	}
	break;
case 14:
	this.ab[AB_ZKILL] = [];
	break;
case 15:
	if (this.data[70]) {
		this.ab[AB_BREAK] += talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	} else {
		this.ab[AB_BREAK] = [talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1)];
	}
	break;
case 16:
	this.ab[AB_BOUNTY] = [];
	break;
case 17:
	if (this.data[35]) {
		this.ab[AB_WAVE][0] += talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	} else {
		this.ab[AB_WAVE] = [talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1), talent[4]];
	}
	break;
case 18:
	this.res[RES_WEAK] = talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	break;
case 19:
	this.res[RES_STOP] = talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	break;
case 20:
	this.res[RES_SLOW] = talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	break;
case 21:
	this.res[RES_KB] = talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	break;
case 22:
	this.res[RES_WAVE] = talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	break;
case 25:
	this.price = this.price - talent[2] * level;
	break;
case 26:
	this.cd = Math.max(this.data[7] * 2 - 264 - level * talent[2], 60);
	break;
case 27:
	this.speed += level * talent[2];
	break;
case 29:
	this.imu |= IMU_CURSE;
	break;
case 30:
	this.res[RES_CURSE] = talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	break;
case 31:
	this.atk *= 1 + (talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1)) * 0.01;
	break;
case 32:
	this.hp *= 1 + (talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1)) * 0.01;
	break;
case 35:
	this.trait |= TB_BLACK;
	this.updateTraitNames();
	break;
case 36:
	this.trait |= TB_METAL;
	this.updateTraitNames();
	break;
case 37:
	this.trait |= TB_ANGEL;
	this.updateTraitNames();
case 38:
	this.trait |= TB_ALIEN;
	this.updateTraitNames();
	break;
case 39:
	this.trait |= TB_ZOMBIE;
	this.updateTraitNames();
	break;
case 40:
	this.trait |= TB_RELIC;
	this.updateTraitNames();
	break;
case 44:
	this.imu |= IMU_WEAK;
	break;
case 45:
	this.imu |= IMU_STOP;
	break;
case 46:
	this.imu |= IMU_SLOW;
	break;
case 47:
	this.imu |= IMU_KB;
	break;
case 48:
	this.imu |= IMU_WAVE;
	break;
case 49:
	this.imu |= IMU_WARP;
	break;
case 50:
	if (this.data[82]) {
		this.ab[AB_S][0] += talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	} else {
		this.ab[AB_S] = [talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1), talent[4]];
	}
	break;
case 51:
	if (this.data[84]) {
		if (talent[4] && talent[4] != talent[5]) {
			this.ab[AB_IMUATK][1] = numStrT(data[85] + talent[4] + (level-1) * (talent[5] - talent[4]) / (talent[1] - 1));
		} else {
			this.ab[AB_IMUATK][0] += talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
		}
	} else {
		if (talent[4] && talent[4] != talent[5]) {
			this.ab[AB_IMUATK] = [talent[2], numStrT(talent[4] + (level-1) * (talent[5] - talent[4]) / (talent[1] - 1))];
		} else {
			this.ab[AB_IMUATK] = [talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1), numStrT(talent[4])];
		}
	}
	break;
case 52:
	this.res[RES_TOXIC] = talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	break;
case 53:
	this.imu |= IMU_CURSE;
	break;
case 54:
	this.res[RES_SURGE] = talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
case 55:
	this.imu |= IMU_VOLC;
	break;
case 56:
	if (this.data[86]) {
		this.ab[AB_VOLC][0] += talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	} else {
		const des1 = talent[6] >> 2;
		const des2 = (talent[6] + talent[8]) >> 2;
		const lv = talent[4];
		this.ab[AB_VOLC] = [talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1), des1, des2, lv * 20, lv];
	}
	break;
case 57:
	this.trait |= TB_DEMON;
	this.updateTraitNames();
	break;
case 58:
	if (this.data[95]) {
		this.ab[AB_SHIELDBREAK][0] += talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	} else {
		this.ab[AB_SHIELDBREAK] = [talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1)];
	}
	break;
case 59:
	this.ab[AB_CKILL] = [];
	break;
case 60:
{
		if (this.data[92]) {
			const o = this.ab[AB_CURSE];
			if (talent[4] && talent[4] != talent[5]) {
				o[1] = getTraitNames(this.trait);
				const curse_time = this.data[93] + talent[4] + (level-1) * (talent[5] - talent[4]) / (talent[1] - 1);
				const cover = Math.min((this.data[92] * curse_time * 1.2) / (this.attackF * 100), 1);
				o[2] = numStrT(curse_time);
				o[3] = numStrT(curse_time * 1.2);
				o[4] = numStr(cover*100) + '%';
			} else {
				const curse_time = this.data[93];
				const pos = this.data[92] + talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
				const cover = Math.min((pos * curse_time * 1.2) / (this.attackF * 100), 1);
				o[0] = pos;
				o[4] = numStr(cover*100) + '%';
			}
		} else {
			if (talent[4] && talent[4] != talent[5]) {
					const curse_time = this.data[93] + talent[4] + (level-1) * (talent[5] - talent[4]) / (talent[1] - 1);
					const pos = this.data[92];
					const cover = Math.min((pos * curse_time * 1.2) / (this.attackF * 100), 1);
					this.ab[AB_CURSE] = [pos, getTraitNames(this.trait), numStrT(curse_time), numStrT(curse_time * 1.2), numStr(cover*100) + '%'];
			} else {
					const curse_time = this.data[93];
					const pos = talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
					const cover = Math.min((pos * curse_time * 1.2) / (this.attackF * 100), 1);
					this.ab[AB_CURSE] = [pos, getTraitNames(this.trait), numStrT(curse_time), numStrT(curse_time * 1.2), numStr(cover*100) + '%'];
			}
		}
	break;
}
case 61:
	this.tba -= talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	this.attackF = (this.pre2 ? this.pre2 : (this.pre1 ? this.pre1 : this.pre)) + Math.max(this.backswing, this.tba - 1);
	break;
case 62:
	if (this.data[94]) {
		this.ab[AB_MINIWAVE][0] += talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	} else {
		this.ab[AB_MINIWAVE] = [talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1), talent[4]];
	}
	break;
case 63:
	this.ab[AB_BAIL] = [];
	break;
case 64:
	this.ab[AB_BSTHUNT] = [5, 30];
	break;
case 65:
	if (this.data[108]) {
		this.ab[AB_MINIVOLC][0] += talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1);
	} else {
		const des1 = talent[6] >> 2;
		const des2 = (talent[6] + talent[8]) >> 2;
		const lv = talent[4];
		this.ab[AB_MINIVOLC] = [talent[2] + (level-1) * (talent[3] - talent[2]) / (talent[1] - 1), des1, des2, lv * 20, lv];
	}
	break;
default: console.assert(false, talent[0]);
		}
	}
	applySuperTalents(talents, levels) {
		let j = 0;
		for (let i = 0;i < 112;i += 14) {
			if (!talents[i]) break;
			if (talents[i + 13] != 1) continue;
			this.applyTalent(talents.subarray(i, i + 14), levels[j++]);
			++j;
		}
	}
	applyTalents(talents, levels) {
		this.res = {};
		let _super = false;
		let j = 0;
		for (let i = 0;i < 112;i += 14) {
			if (!talents[i]) break;
			if (talents[i + 13] == 1) {
				_super = true;
				continue;
			}
			this.applyTalent(talents.subarray(i, i + 14), levels[j++]);
		}
		return _super;
	}
	hasres(r) {
		return this.res && this.res.hasOwnProperty(r);
	}
	hasab(ab) {
		return this.ab.hasOwnProperty(ab);
	}
	getid() {
		return this.id;
	}
	gettba() {
		return this.tba;
	}
	getpre() {
		return this.pre;
	}
	getpre1() {
		return this.pre1;
	}
	getpre2() {
		return this.pre2;
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
	getrevenge() {
		return (this.atkType & ATK_KB_REVENGE) != 0;
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
	dpsagainst(traits) {
		if (traits & TB_METAL) {
			if (this.ab.hasOwnProperty(AB_CRIT)) {
				const rate = this.ab[AB_CRIT][0] * 0.01;
				let atk = this.getatk();
				if (this.ab.hasOwnProperty(AB_S))
					atk *= (this.ab[AB_S][1] / 100);
				if (this.ab.hasOwnProperty(AB_STRONG))
					atk *= 1 + (this.ab[AB_STRONG][1] / 100);
				if (this.ab.hasOwnProperty(AB_MASSIVE))
					atk *= 4;
				else if (this.ab.hasOwnProperty(AB_MASSIVES))
					atk *= 6;
				if (this.ab.hasOwnProperty(AB_GOOD))
					atk *= 1.8;
				atk += atk;
				return 30 * ((1 - rate) + atk * rate) / this.attackF;
			}
			return 30 / this.attackF;
		}
		let dps = this.getdps();
		if (this.ab.hasOwnProperty(AB_S)) {
			const s = this.ab[AB_S];
			dps += dps * ((s[0] * s[1]) / 10000);
		}
		if (this.ab.hasOwnProperty(AB_CRIT))
			dps += dps * (this.ab[AB_CRIT][0] / 100);
		if (this.ab.hasOwnProperty(AB_STRONG))
			dps *= 1 + (this.ab[AB_STRONG][1] / 100);
		const t = this.trait & traits;
		if (t) {
			if (this.ab.hasOwnProperty(AB_MASSIVE))
				dps *= (t & trait_treasure) ? 4 : 3;
			else if (this.ab.hasOwnProperty(AB_MASSIVES))
				dps *= (t & trait_treasure) ? 6 : 5;
			if (this.ab.hasOwnProperty(AB_GOOD))
				dps *= (t & trait_treasure) ? 1.8 : 1.5;
		}
		if ((traits & TB_BEAST) && this.ab.hasOwnProperty(AB_BSTHUNT))
			dps *= 2.5;
		if ((traits & TB_BARON) && this.ab.hasOwnProperty(AB_BAIL))
			dps *= 1.6;
		if ((traits & TB_EVA) && this.ab.hasOwnProperty(AB_EKILL))
			dps *= 5;
		if ((traits & TB_WITCH) && this.ab.hasOwnProperty(AB_WKILL))
			dps *= 5;
		return dps;
	}
	gettdps() {
		let dps = this.getdps();
		if (this.ab.hasOwnProperty(AB_ATKBASE))
			return dps * 4;
		if (this.ab.hasOwnProperty(AB_S)) {
			const s = this.ab[AB_S];
			dps *= 1 + ((s[0] * s[1]) / 10000);
		}
		if (this.ab.hasOwnProperty(AB_VOLC)) {
			const x = this.ab[AB_VOLC];
			atk *= 1 + (x[4] * x[0] / 100);
		}
		else if (this.ab.hasOwnProperty(AB_MINIVOLC)) {
			const x = this.ab[AB_MINIVOLC];
			atk *= 1 + (x[4] * x[0] / 500);
		}
		if (this.ab.hasOwnProperty(AB_WAVE))
			atk *= 1 + this.ab[AB_WAVE][0] / 100;
		else if (this.ab.hasOwnProperty(AB_MINIWAVE))
			atk *= 1 + this.ab[AB_MINIWAVE][0] / 500;
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
		if (this.ab.hasOwnProperty(AB_VOLC)) {
			const x = this.ab[AB_VOLC];
			atk *= (1 + x[4]);
		}
		else if (this.ab.hasOwnProperty(AB_MINIVOLC)) {
			const x = this.ab[AB_MINIVOLC];
			atk *= (1 + x[4] * 0.2);
		}
		if (this.ab.hasOwnProperty(AB_WAVE))
			atk += atk;
		else if (this.ab.hasOwnProperty(AB_MINIWAVE))
			atk *= 1.2;
		if (this.ab.hasOwnProperty(AB_S))
			atk *= 1 + (this.ab[AB_S][1] / 100);
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
		let idx = skill_file.indexOf(`\n${my_id},`);
		if (idx != -1) {
			++idx;
			let end;
			for (end = idx;skill_file[end] != '\n' && skill_file[end];++end) {}
			let data = skill_file.slice(idx, end).split(',');
			this.talents = new Int16Array(112);
			for (let i = 0;i < 112;++i)
				this.talents[i] = data[2 + i];
		}
	}
}
class Enemy {
	constructor(id, name, jp_name, data) {
		if (id instanceof Object) {
			Object.assign(this, id);
			return;
		}
		this.id = id;
		id -= 2;
		this.name = name;
		this.jp_name = jp_name;
		this.desc = enemy_descs[id];
		this.backswing = anim1[id][0];
		this.attackF = anim1[id][1];
		this.hp = data[0];
		this.kb = data[1];
		this.speed = data[2];
		this.atk = data[3];
		this.tba = data[4] * 2;
		this.atkType = data[5] ? ATK_RANGE : ATK_SINGLE;
		this.earn = data[6];
		this.range = data[5];
		this.trait = 0;
		this.isrange = data[11] != 0;
		this.pre = data[12];
		this.death = data[54];
		this.atk1 = data[55];
		this.atk2 = data[56];
		this.pre1 = data[57];
		this.pre2 = data[58];
		(data[69]) && (this.star = true);
		this.ab = {};
		this.imu = 0;
		(data[10]) && (this.trait |= TB_RED);
		(data[13]) && (this.trait |= TB_FLOAT);
		(data[14]) && (this.trait |= TB_BLACK);
		(data[15]) && (this.trait |= TB_METAL);
		(data[16]) && (this.trait |= TB_WHITE);
		(data[17]) && (this.trait |= TB_ANGEL);
		(data[18]) && (this.trait |= TB_ALIEN);
		(data[19]) && (this.trait |= TB_ZOMBIE);
		(data[48]) && (this.trait |= TB_WITCH);
		(data[49]) && (this.trait |= TB_INFN);
		(data[71]) && (this.trait |= TB_EVA);
		(data[72]) && (this.trait |= TB_RELIC);
		(data[93]) && (this.trait |= TB_DEMON);
		(data[94]) && (this.trait |= TB_BARON);
		(data[101]) && (this.trait |= TB_BEAST);
		
		(data[20]) && (this.ab[AB_KB] = [data[20]]);
		(data[21]) && (this.ab[AB_STOP] = [data[21], data[22]]);
		(data[23]) && (this.ab[AB_SLOW] = [data[23], data[24]]);
		(data[25]) && (this.ab[AB_CRIT] = [data[25]]);
		(data[26]) && (this.ab[AB_ATKBASE] = []);
		(data[29]) && (this.ab[AB_WEAK] = [data[29], data[30], data[31]]);
		(data[32]) && (this.ab[AB_STRONG] = [data[32], data[33]]);
		(data[34]) && (this.ab[AB_LETHAL] = [data[34]]);
		(data[38]) && (this.ab[AB_WAVES] = []);
		(data[43]) && (this.ab[AB_BURROW] = [data[43], data[44] / 4]);
		(data[45]) && (this.ab[AB_REVIVE] = [data[45], data[46], data[47]]);
		(data[52]) && (this.ab[AB_GLASS] = []);
		(data[64]) && (this.ab[AB_SHIELD] = [data[64]]);
		(data[65]) && (this.ab[AB_WARP] = [data[65], data[66], data[67] / 4]);
		(data[73]) && (this.ab[AB_CURSE] = [data[73], data[74]]);
		(data[75]) && (this.ab[AB_S] = [data[75], data[76]]);
		(data[77]) && (this.ab[AB_IMUATK] = [data[77], data[78]]);
		(data[79]) && (this.ab[AB_POIATK] = [data[79], data[80]]);
		(data[87]) && (this.ab[AB_DSHIELD] = [data[87]]);
		(data[89]) && (this.ab[AB_AFTERMATH] = [data[89], data[90] / 4, data[91] / 4 + data[90], data[92] * 20]);
		(data[103]) && (this.ab[AB_COUNTER] = []);
		if (data[27]) {
			if (data[86]) {
				this.ab[AB_MINIWAVE] = [data[27], data[28]];
			} else {
				this.ab[AB_WAVE] = [data[27], data[28]];
			}
		}
		if (data[81]) {
			if (data[102]) {
				this.ab[AB_MINIVOLC] = [data[81], data[82] >> 2, (data[83] + data[82]) >> 2, data[84]];
			} else {
				this.ab[AB_VOLC] = [data[81], data[82] >> 2, (data[83] + data[82]) >> 2, data[84]];
			}
		}
		(data[37]) && (this.imu |= IMU_WAVE);
		(data[39]) && (this.imu |= IMU_KB);
		(data[40]) && (this.imu |= IMU_STOP);
		(data[41]) && (this.imu |= IMU_SLOW);
		(data[42]) && (this.imu |= IMU_WEAK);
		if (data[52] == 2)
			this.glass = true;
		const atkCount = this.atk1 == 0 ? 1 : this.atk2 == 0 ? 2 : 3;
		this.lds = new Array(atkCount);
		this.lds[0] = data[35];
		this.ldr = new Array(atkCount);
		this.ldr[0] = data[36];
		for (let i = 1;i < atkCount;++i) {
			if (data[99 + (i - 1) * 3] == 1) {
				this.lds[i] = data[95 + (i - 1) * 3 + 1];
				this.ldr[i] = data[95 + (i - 1) * 3 + 2];
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
		if ((this.tba + this.pre) < (this.attackF / 2))
			this.atkType |= ATK_KB_REVENGE;
	}
	gethp() {	return this.hp; }
	getthp() { return this.hp; }
	getatk() { return this.atk + this.atk1 + this.atk2; }
	gettatk() { return this.getatk(); }
	getdps() { return (this.getatk() * 30) / this.attackF; }
	gettdps() { return this.getdps(); }
	getimu() { return this.imu; }
	hasab(i) { return this.ab.hasOwnProperty(i); }
	dpsagainst() { return 0; }
	getid() { return this.id; }
	hasres() { return 0; }
	gettba() { return this.tba; }
	getpre() { return this.pre; }
	getpre1() { return this.pre1; }
	getpre2() { return this.pre2; }
	getTotalLv() { return 0; }
	getkb() { return this.kb; }
	getrarity() { return 0; }
	gettrait() { return this.trait; }
	getrange() { return this.range; }
	getattackf() { return this.attackF; }
	getattacks() { return this.attackF / 30; }
	getrevenge() { return (this.atkType & ATK_KB_REVENGE) != 0; }
	getbackswing() { return this.backswing; }
	getcost() { return this.earn; }
	getprice() { return this.earn; }
	getspeed() { return this.speed; }
	getatktype() { return this.atkType; }
	getcd() { return 0; }
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
	getObj() {
		return { 'info': this.info, 'forms': this.forms };
	}
}
async function getAllEnemies() {
	enemy_descs = await ((await fetch('./enemyDescs.json')).json());
	t_unit = (await ((await fetch('./data/data/t_unit.csv')).text())).replace('\r', '').split('\n').filter(x => x.trim()).map(line => line.split(',').map(x => parseInt(x)));;
	anim1 = await ((await fetch('./anim1')).json());
	const enemies_names = await ((await fetch('enemyName.json')).json());
	const jp_names = await ((await fetch('enemyNameJP.json')).json());
	var enemies = new Array(enemies_names.length);
	for (let id = 2;id < enemies.length;++id) {
		const unit_file = t_unit[id];
		const y = id - 2;
		enemies[id] = new Enemy(id, enemies_names[y], jp_names[y], unit_file);
		loader_text.innerText = `Loading Enemies (${id+1}/${enemies.length})`;
	} 
	enemy_descs = null;
	t_unit = null;
	anim1 = null;	
	return enemies;
}
async function getAllCats() {
	anim2 = await ((await fetch('./anim2')).json());
	unit_buy = await ((await fetch('./data/data/unitbuy.csv')).text());
	skill_file = await ((await fetch('./data/data/SkillAcquisition.csv')).text());
	uints_zip = await (await JSZip.loadAsync(
		await (
			(await fetch("./all_units.zip")).blob())
	));
	var cats = new Array(unit_names.length);
	for (let id = 0;id < cats.length;++id) {
		const unit_file = await uints_zip.file(`all/${id}`).async('string');
		cats[id] = new Cat(id, unit_file);
		loader_text.innerText = `Loading Units (${id+1}/${cats.length})`;
	}
	uints_zip = null;
	skill_file = null;
	uint_buy = null;
	return cats;
}
function onupgradeneeded(event) {
	const db = event.target.result;
	try { db.deleteObjectStore('cats'); } catch (e) { }
	try { db.deleteObjectStore('enemy'); } catch (e) { }
	let store = db.createObjectStore('cats', {"keyPath": "id"});
	store.createIndex("data", '', {"unique": false});
	store = db.createObjectStore('enemy', {"keyPath": "id"});
	store.createIndex("data", '', {"unique": false});
}
async function loadCat(id) {
	return new Promise(resolve => {
		var req = indexedDB.open("db", 1);
		req.onupgradeneeded = onupgradeneeded;
		req.onsuccess = function(event) {
			const db = event.target.result;
			db.transaction(["cats"], "readwrite").objectStore("cats").get(id).onsuccess = function(event) {
				const res = event.target.result;
				if (res) return resolve(new Cat(res.data));
				getAllCats()
				.then(cats => {
					const tx = db.transaction(["cats"], "readwrite");
					const store = tx.objectStore("cats");
					for (let i = 0;i < cats.length;++i)
						store.put({'id': i, 'data': cats[i].getObj()});
					tx.oncomplete = function() {
						resolve(cats[id]);
						db.close();
					}
				});
			}
		}
	});
}
async function loadEnemy(id) {
	return new Promise((resolve, reject) => {
		var req = indexedDB.open("db", 1);
		req.onupgradeneeded = onupgradeneeded;
		req.onsuccess = function(event) {
			const db = event.target.result;
			db.transaction(["enemy"], "readwrite").objectStore("enemy").get(id).onsuccess = function(event) {
				const res = event.target.result;
				if (res) {
					if (!res.data) return reject();
					return resolve(new Enemy(res.data));
				}
				getAllEnemies()
				.then(es => {
					const tx = db.transaction(["enemy"], "readwrite");
					const store = tx.objectStore("enemy");
					for (let i = 0;i < es.length;++i)
						store.put({'id': i, 'data': es[i]});
					tx.oncomplete = function() {
						resolve(es[id]);
						db.close();
					}
				});
			}
		}
	});
}
async function loadAllEnemies() {
	return new Promise(resolve => {
		var req = indexedDB.open("db", 1);
		req.onupgradeneeded = onupgradeneeded;
		req.onsuccess = function(event) {
			const db = event.target.result;
			db.transaction(["enemy"], "readwrite").objectStore("enemy").get(651).onsuccess = function(event) {
				const res = event.target.result;
				if (!res) {
					getAllEnemies()
					.then(es => {
						const tx = db.transaction(["enemy"], "readwrite");
						const store = tx.objectStore("enemy");
						for (let i = 0;i < es.length;++i)
							store.put({'id': i, 'data': es[i]});
						tx.oncomplete = function() {
							resolve(es);
							db.close();
						}
					});
				} else {
					let es = new Array(652);
					db.transaction(["enemy"], "readwrite").objectStore("enemy").openCursor().onsuccess = function(event) {
						const cursor = event.target.result;
						if (cursor) {
							cursor.value.data && (es[cursor.value.id] = new Enemy(cursor.value.data));
							cursor.continue();
						} else {
							resolve(es);
							db.close();
						}
					}
				}
			}
		}
	});
}
async function loadAllCats() {
	return new Promise(resolve => {
		var req = indexedDB.open("db", 1);
		req.onupgradeneeded = onupgradeneeded;
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
							store.put({'id': i, 'data': cats[i].getObj()});
						tx.oncomplete = function() {
							resolve(cats);
							db.close();
						}
					});
				} else {
					let cats = new Array(unit_names.length);
					db.transaction(["cats"], "readwrite").objectStore("cats").openCursor().onsuccess = function(event) {
						const cursor = event.target.result;
						if (cursor) {
							cats[cursor.value.id] = new Cat(cursor.value.data);
							cursor.continue();
						} else {
							resolve(cats);
							db.close();
						}
					}
				}
			}
		}
	});
}
const res_icon_names = [
	"weak",
	"freeze",
	"slow",
	"kb",
	"wave",
	"surge",
	"curse",
	"toxic"
];
const res_descs = [
	'降攻耐性(受到降攻時間減少$%)',
	'暫停耐性(受到暫停時間減少$%)',
	'緩速耐性(受到緩速時間減少$%)',
	'擊退耐性(受到擊退距離減少$%)',
	'波動耐性(受到波動傷害減少$%)',
	'烈波耐性(受到烈波傷害減少$%)',
	'詛咒耐性(受到詛咒時間減少$%)',
	'毒擊耐性(受到毒擊傷害減少$%)',
];
function createResIcons(res, parent) {
	for (let i = 1;i <= RES_LAST;++i) {
		if (res.hasOwnProperty(i)) {
			const e = document.createElement('span');
			e.classList.add('bc-icon', `bc-icon-${icon_names[i - 1]}`);
			parent.appendChild(e);
			const e2 = document.createElement('span');
			e2.innerText = res_descs[i].replace('$', res[i]);
			parent.appendChild(e2);
			parent.appendChild(document.createElement('br'));
		}
	}
}
const icon_names = [
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
	  'imu-atk',
	  'curse'
]
const icon_descs = [
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
	'{1}%機率降低{2}攻擊力至{3}%持續{4}({5}，控場覆蓋率{6})',
	'{1}%機率暫停{2}持續{3}({4}，控場覆蓋率{5})',
	'{1}%機率緩速{2}持續{3}({4}，控場覆蓋率{5})',
	'只能攻擊{1}',
	'對{1}傷害傷害1.5倍(1.8倍)受到紅屬性的敵人傷害減少50%(60%)',
	'受到{1}攻擊的傷害減至1/4(1/5)',
	'受到{1}攻擊的傷害減至1/6(1/7)',
	'對{1}造成3倍(4倍)傷害',
	'對{1}造成5倍(6倍)傷害',
	'{1}%機率擊退{2}',
	'{1}%機率傳送{2}',
	'{1}%攻擊無效{2}秒',
	'{1}%機率詛咒{2}持續{3}({4}，控場覆蓋率{5})',
]
function createAbIcons1(ab, parent) {
	for (let i = 1;i <= AB_CURSE;++i) {
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
	for (let i = 1;i <= AB_CURSE;++i) {
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
	if (!trait) return;
	const names = [
		'red', 'float', 'black', 'metal', 'angel', 'alien', 'zombie', 'relic', 'white', 'eva', 'witch', 'demon'
	];
	let i = 0;
	for (let x = 1;x <= TB_DEMON;x <<= 1) {
		if (trait & x) {
			const e = document.createElement('span');
			e.classList.add('bc-icon', `bc-icon-trait-${names[i]}`);
			parent.appendChild(e);
		}
		++i;
	}
	parent.appendChild(document.createElement('br'));
}
