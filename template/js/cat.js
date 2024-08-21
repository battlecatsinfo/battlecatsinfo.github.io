const units_scheme = {{{toJSON (loadJSON "units_scheme.json")}}};

var def_lv, plus_lv, my_curve, _info, unit_orbs;
var orb_massive = 0;
var orb_resist = 1;
var orb_good_atk = 0;
var orb_good_hp = 1;

// attack types
const ATK_SINGLE = 1;      // 單體攻擊
const ATK_RANGE = 2;       // 範圍攻擊
const ATK_LD = 4;          // 遠距攻擊
const ATK_OMNI = 8;        // 全方位攻擊
const ATK_KB_REVENGE = 16; // 擊退反擊(非官方)

// traits
const TB_RED = 1;          // 紅色敵人
const TB_FLOAT = 2;        // 飄浮敵人
const TB_BLACK = 4;        // 黑色敵人
const TB_METAL = 8;        // 鋼鐵敵人
const TB_ANGEL = 16;       // 天使敵人
const TB_ALIEN = 32;       // 異星戰士
const TB_ZOMBIE = 64;      // 不死生物
const TB_RELIC = 128;      // 古代種
const TB_WHITE = 256;      // 無屬性敵人
const TB_EVA = 512;        // 使徒
const TB_WITCH = 1024;     // 魔女
const TB_DEMON = 2048;     // 惡魔
const TB_INFN = 4096;      // 道場塔
const TB_BEAST = 8192;     // 超獸
const TB_BARON = 16384;    // 超生命體
const TB_SAGE = 32768;     // 超賢者

// immunities
const IMU_WAVE = 1;
const IMU_STOP = 2;
const IMU_SLOW = 4;
const IMU_KB = 8;
const IMU_VOLC = 16;
const IMU_WEAK = 32;
const IMU_WARP = 64;
const IMU_CURSE = 128;
const IMU_POIATK = 256;
const IMU_BOSSWAVE = 512;

// abilities
const AB_STRONG = 1;
const AB_LETHAL = 2;
const AB_ATKBASE = 3;
const AB_CRIT = 4;
const AB_ZKILL = 5;
const AB_CKILL = 6;
const AB_BREAK = 7;
const AB_SHIELDBREAK = 8;
const AB_S = 9;
const AB_BOUNTY = 10;
const AB_METALIC = 11;
const AB_MINIWAVE = 12;
const AB_WAVE = 13;
const AB_MINIVOLC = 14;
const AB_VOLC = 15;
const AB_WAVES = 16;
const AB_BAIL = 17;
const AB_BSTHUNT = 18;
const AB_WKILL = 19;
const AB_EKILL = 20;
const AB_WEAK = 21;
const AB_STOP = 22;
const AB_SLOW = 23;
const AB_ONLY = 24;
const AB_GOOD = 25;
const AB_RESIST = 26;
const AB_RESISTS = 27;
const AB_MASSIVE = 28;
const AB_MASSIVES = 29;
const AB_KB = 30;
const AB_WARP = 31;
const AB_IMUATK = 32;
const AB_CURSE = 33;
const AB_BURROW = 34;
const AB_REVIVE = 35;
const AB_POIATK = 36;
const AB_GLASS = 37;
const AB_SHIELD = 38;
const AB_DSHIELD = 39;
const AB_COUNTER = 40;
const AB_AFTERMATH = 41;
const AB_SAGE = 42;
const AB_SUMMON = 43;
const AB_MK = 44;

// resists
const RES_WEAK = 0;
const RES_STOP = 1;
const RES_SLOW = 2;
const RES_KB = 3;
const RES_WAVE = 4;
const RES_SURGE = 5;
const RES_CURSE = 6;
const RES_TOXIC = 7;
const RES_WARP = 8;

const trait_no_treasure = TB_DEMON | TB_EVA | TB_WITCH | TB_WHITE | TB_RELIC;
const trait_treasure = TB_RED | TB_FLOAT | TB_BLACK | TB_ANGEL | TB_ALIEN | TB_ZOMBIE | TB_METAL;

const _l_unit = localStorage.getItem("unit");

let _l_f = localStorage.getItem('prec');

if (_l_f)
	_l_f = parseInt(_l_f);
else
	_l_f = 2;

_l_f = new Intl.NumberFormat(undefined, {
	'maximumFractionDigits': _l_f
});

function t3str(x) {
	var s = x.toString();
	switch (s.length) {
		case 2:
			return "0" + s;

		case 1:
			return "00" + s;
	}
	return s;
}

function numStr(num) {
	return _l_f.format(num);
	// return (Math.round(100 * (num + Number.EPSILON)) / 100).toString();
}

function numStrT(num) {
	if (_l_unit == 'F')
		return num.toString() + ' F';
	return numStr(num / 30) + ' 秒';
}

function combineChances(count, chance) {
	let x = 1;
	for (let i = 0; i < count; ++i) x *= (100 - chance) / 100;
	return 1 - x;
}

function getChances(freq, pres, chance, duration) {
	var segments = [];
	outer: for (let now = 0;; now -= freq)
		for (let i = pres.length - 1; 0 <= i; --i) {
			if (0 > now + pres[i] + duration) break outer;
			var a = now + pres[i],
				z = Math.min(a + duration, freq);
			a != z && segments.push([Math.max(a, 0), z]);
		}
	var steps = [];
	let substeps = [];
	for (let i = 0; i <= freq; ++i) {
		for (var x of segments) i != x[0] && i != x[1] || (i == x[0] ? substeps.push(!0) : substeps.push(!1));
		substeps.length && (steps.push([i, substeps]), substeps = []);
	}
	let cover = 0,
		last = steps[0][0],
		count = 0;
	for (let x of steps) {
		var s, now = x[0];
		const substeps = x[1];
		cover += combineChances(count, chance) * (now - last) / freq;
		for (s of substeps) s ? ++count : --count;
		last = now;
	}
	return 100 * Math.min(cover, 1);
}

function getCover(p, durationF, attackF) {
	p /= 100;
	durationF /= attackF, attackF = ~~durationF, durationF -= attackF;
	return 100 * Math.min(1 - durationF * Math.pow(1 - p, 1 + attackF) - (1 - durationF) * Math.pow(1 - p, attackF), 1);
}

function getCoverUnit(unit, chance, duration) {
	if (!(unit.pre2 + unit.pre1)) return numStr(getCover(chance, duration, unit.attackF));
	var pres = [];
	for (let i = 4; 1 <= i; i >>= 1)
		if (unit.abi & i) switch (i) {
			case 1:
				pres.push(unit.pre2);
				break;

			case 2:
				pres.push(unit.pre1);
				break;

			case 4:
				pres.push(unit.pre);
		}
	return numStr(getChances(unit.attackF, pres, chance, duration));
}

function get_trait_short_names(trait) {
	var s = "";
	for (let x = 1, i = 0; x <= TB_DEMON; x <<= 1, i++) trait & x && (s += units_scheme.traits.short_names[i]);
	return s;
}

function getLevelMulti(level) {
	var c, multi = .8;
	let n = 0;
	for (c of my_curve) {
		if (level <= n) break;
		multi += Math.min(level - n, 10) * (c / 100), n += 10;
	}
	return multi;
}

function toi(x) {
	return parseInt(x, 10);
}

class Form {
	constructor(o, lvc) {
		if (o instanceof Array) {
			this.lvc = lvc;
			this.id = o[0];
			this.name = o[1];
			this.jp_name = o[2];
			this.price = o[3];
			this.desc = o[4];
			this.hp = parseInt(o[5], 10);
			this.kb = parseInt(o[6], 10);
			this.speed = parseInt(o[7], 10);
			this.range = parseInt(o[8], 10);
			this.pre = parseInt(o[9], 10);
			this.pre1 = parseInt(o[10], 10);
			this.pre2 = parseInt(o[11], 10);
			this.atk = parseInt(o[12], 10);
			this.atk1 = parseInt(o[13], 10);
			this.atk2 = parseInt(o[14], 10);
			this.tba = parseInt(o[15], 10);
			this.backswing = parseInt(o[16], 10);
			this.attackF = parseInt(o[17], 10);
			this.atkType = parseInt(o[18], 10);
			this.trait = parseInt(o[19], 10);
			this.abi = parseInt(o[20], 10);
			if (o[21]) {
				this.lds = o[21].split('|').map(toi);
				this.ldr = o[22].split('|').map(toi);
			}
			this.imu = parseInt(o[23], 10);
			this.ab = {};
			if (o[24].length) {
				for (const x of o[24].split('|')) {
					let idx = x.indexOf('@');
					if (idx == -1) {
						idx = x.indexOf('&');
						let i = parseInt(x.slice(0, idx), 10);
						if (x.endsWith('&'))
							this.ab[i] = null;
						else
							this.ab[i] = parseInt(x.slice(idx + 1), 10);
					} else {
						this.ab[parseInt(x.slice(0, idx), 10)] = x.slice(idx + 1).split('!').map(toi);
					}
				}
			}
			this.cd = o[25];
			this.icon = o[26];
			this.hpM = 1;
			this.atkM = 1;
		} else {
			Object.assign(this, o);
		}
	}
	applyTalent(talent, level) {
		if (!level) return;
		var t, x, y, z;
		level -= 1;
		const maxLv = talent[1] - 1;
		const inc1 = ~~(talent[2] + level * (talent[3] - talent[2]) / maxLv);
		const inc2 = ~~(talent[4] + level * (talent[5] - talent[4]) / maxLv);
		const inc3 = ~~(talent[6] + level * (talent[7] - talent[6]) / maxLv);
		const inc4 = ~~(talent[8] + level * (talent[9] - talent[8]) / maxLv);
		switch (talent[0]) {
			case 1:
				t = this.ab[AB_WEAK];
				x = inc2 + (t ? t[2] : 0); // duration
				y = inc1 + (t ? t[0] : 0); // chance
				z = (inc3 ? (100 - inc3) : 0) + (t ? t[1] : 0); // power
				this.ab[AB_WEAK] = [y, z, x];
				break;

			case 2:
				t = this.ab[AB_STOP];
				x = inc2 + (t ? t[1] : 0); // duration
				y = inc1 + (t ? t[0] : 0); // chance
				this.ab[AB_STOP] = [y, x];
				break;

			case 3:
				t = this.ab[AB_SLOW];
				x = inc2 + (t ? t[1] : 0); // duration
				y = inc1 + (t ? t[0] : 0); // chance
				this.ab[AB_SLOW] = [y, x];
				break;

			case 4:
				this.ab[AB_ONLY] = null;
				break;

			case 5:
				this.ab[AB_GOOD] = null;
				break;

			case 6:
				this.ab[AB_RESIST] = null;
				break;

			case 7:
				this.ab[AB_MASSIVE] = null;
				break;

			case 8:
				t = this.ab[AB_KB];
				x = inc1 + (t ? t[0] : 0); // chance
				this.ab[AB_KB] = [x];
				break;

			case 10:
				t = this.ab[AB_STRONG];
				x = t ? t[0] : (100 - inc1); // HP Trigger
				y = inc2 + (t ? t[1] : 0); // attack
				this.ab[AB_STRONG] = [x, y];
				break;

			case 11:
				t = this.ab[AB_LETHAL];
				x = inc1 + (t || 0); // chance
				this.ab[AB_LETHAL] = x;
				break;

			case 12:
				this.ab[AB_ATKBASE] = null;
				break;

			case 13:
				t = this.ab[AB_CRIT];
				x = inc1 + (t || 0); // chance
				this.ab[AB_CRIT] = x;
				break;

			case 14:
				this.ab[AB_ZKILL] = null;
				break;

			case 15:
				t = this.ab[AB_BREAK];
				x = inc1 + (t ? t[0] : 0); // chance
				this.ab[AB_BREAK] = [x];
				break;

			case 16:
				this.ab[AB_BOUNTY] = null;
				break;

			case 17:
				t = this.ab[AB_WAVE];
				x = inc1 + (t ? t[0] : 0);
				y = inc2 + (t ? t[1] : 0);
				this.ab[AB_WAVE] = [x, y];
				break;

			case 18:
				this.res[RES_WEAK] = inc1;
				break;

			case 19:
				this.res[RES_STOP] = inc1;
				break;

			case 20:
				this.res[RES_SLOW] = inc1;
				break;

			case 21:
				this.res[RES_KB] = inc1;
				break;

			case 22:
				this.res[RES_WAVE] = inc1;
				break;

			case 23:
				this.ab[AB_WAVES] = null;
				break;

			case 24:
				this.res[RES_WARP] = inc1;
				break;

			case 25:
				this.price -= inc1;
				break;

			case 26:
				this.cd -= inc1;
				break;

			case 27:
				this.speed += inc1;
				break;

			case 29:
				this.imu |= IMU_CURSE;
				break;

			case 30:
				this.res[RES_CURSE] = inc1;
				break;

			case 31:
				this.atkM = 1 + inc1 / 100;
				break;

			case 32:
				this.hpM = 1 + inc1 / 100;
				break;

			case 33:
				this.trait |= TB_RED;
				break;

			case 34:
				this.trait |= TB_FLOAT;
				break;

			case 35:
				this.trait |= TB_BLACK;
				break;

			case 36:
				this.trait |= TB_METAL;
				break;

			case 37:
				this.trait |= TB_ANGEL;
				break;

			case 38:
				this.trait |= TB_ALIEN;
				break;

			case 39:
				this.trait |= TB_ZOMBIE;
				break;

			case 40:
				this.trait |= TB_RELIC;
				break;

			case 41:
				this.trait |= TB_WHITE;
				break;

			case 42:
				this.trait |= TB_WITCH;
				break;

			case 43:
				this.trait |= TB_EVA;
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
				t = this.ab[AB_S];
				x = inc1 + (t ? t[0] : 0); // chance
				y = inc2 + (t ? t[1] : 0); // power
				this.ab[AB_S] = [x, y];
				break;

			case 51:
				t = this.ab[AB_IMUATK];
				x = inc1 + (t ? t[0] : 0); // chance
				y = inc2 + (t ? t[1] : 0); // duration
				this.ab[AB_IMUATK] = [x, y];
				break;

			case 52:
				this.res[RES_TOXIC] = inc1;
				break;

			case 53:
				this.imu |= IMU_POIATK;
				break;

			case 54:
				this.res[RES_SURGE] = inc1;
				break;

			case 55:
				this.imu |= IMU_VOLC;
				break;

			case 56:
				t = this.ab[AB_VOLC];
				x = inc1 + (t ? t[0] : 0); // chance
				y = inc2 + (t ? t[4] : 0); // level
				z = inc3 >> 2;
				this.ab[AB_VOLC] = [x, z, z + (inc4 >> 2), y * 20, y];
				break;

			case 57:
				this.trait |= TB_DEMON;
				break;

			case 58:
				t = this.ab[AB_SHIELDBREAK];
				x = inc1 + (t ? t[0] : 0); // chance
				this.ab[AB_SHIELDBREAK] = [x];
				break;

			case 59:
				this.ab[AB_CKILL] = null;
				break;

			case 60:
				t = this.ab[AB_CURSE];
				x = inc2 + (t ? t[1] : 0); // chance
				y = inc1 + (t ? t[0] : 0); // duration
				this.ab[AB_CURSE] = [y, x];
				break;

			case 61:
				this.tba = ~~(this.tba * (100 - inc1) / 100);
				this.attackF = (this.pre2 || this.pre1 || this.pre) + Math.max(this.backswing, this.tba - 1);
				break;

			case 62: // Mini Wave
				t = this.ab[AB_MINIWAVE];
				x = inc1 + (t ? t[0] : 0);
				y = inc2 + (t ? t[1] : 0);
				this.ab[AB_MINIWAVE] = [x, y];
				break;

			case 63:
				this.ab[AB_BAIL] = null;
				break;

			case 64:
				this.ab[AB_BSTHUNT] = [inc1, inc2];
				break;

			case 65:
				t = this.ab[AB_MINIVOLC];
				x = inc1 + (t ? t[0] : 0); // chance
				y = inc2 + (t ? t[4] : 0); // level
				z = inc3 >> 2;
				this.ab[AB_MINIVOLC] = [x, z, z + (inc4 >> 2), y * 20, y];
				break;
			case 66:
				this.ab[AB_SAGE] = null;
				break;
		}
	}
	applySuperTalents(talents, levels) {
		let j = 0;
		for (let i = 1; i < 113 && talents[i]; i += 14) {
			1 == talents[i + 13] && this.applyTalent(talents.subarray(i, i + 14), levels[j++]);
		}
	}
	applyTalents(talents, levels) {
		this.trait |= talents[0];
		let _super = !(this.res = {}),
			j = 0;
		for (let i = 1; i < 113 && talents[i]; i += 14) 1 == talents[i + 13] ? _super = !0 : this.applyTalent(talents.subarray(i, i + 14), levels[j++]);
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
		return Math.min(def_lv, _info[4]) + Math.min(plus_lv, _info[5]);
	}
	getmax_base_lv() {
		return _info[4];
	}
	getmax_plus_lv() {
		return _info[5];
	}
	getslow_time() {
		const t = this.ab[AB_SLOW];
		return t ? t[1] : 0;
	}
	getslow_prob() {
		const t = this.ab[AB_SLOW];
		return t ? t[0] : 0;
	}
	getstop_time() {
		const t = this.ab[AB_STOP];
		return t ? t[1] : 0;
	}
	getstop_prob() {
		const t = this.ab[AB_STOP];
		return t ? t[0] : 0;
	}
	getcurse_time() {
		const t = this.ab[AB_CURSE];
		return t ? t[1] : 0;
	}
	getcurse_prob() {
		const t = this.ab[AB_CURSE];
		return t ? t[0] : 0;
	}
	getweak_time() {
		const t = this.ab[AB_WEAK];
		return t ? t[2] : 0;
	}
	getweak_prob() {
		const t = this.ab[AB_WEAK];
		return t ? t[0] : 0;
	}
	getweak_extent() {
		const t = this.ab[AB_WEAK];
		return t ? t[1] : 0;
	}
	getstrong_extent() {
		const t = this.ab[AB_STRONG];
		return t ? t[1] : 0;
	}
	getlethal_prob() {
		return this.ab[AB_LETHAL] || 0;
	}
	getsavage_extent() {
		const t = this.ab[AB_S];
		return t ? t[1] : 0;
	}
	getsavage_prob() {
		const t = this.ab[AB_S];
		return t ? t[0] : 0;
	}
	getbreak_prob() {
		const t = this.ab[AB_BREAK];
		return t ? t[0] : 0;
	}
	getshield_break_prob() {
		const t = this.ab[AB_SHIELDBREAK];
		return t ? t[0] : 0;
	}
	getmini_wave_prob() {
		const t = this.ab[AB_MINIWAVE];
		return t ? t[0] : 0;
	}
	getwave_prob() {
		const t = this.ab[AB_WAVE];
		return t ? t[0] : 0;
	}
	getmini_surge_prob() {
		const t = this.ab[AB_MINIVOLC];
		return t ? t[0] : 0;
	}
	getsurge_prob() {
		const t = this.ab[AB_VOLC];
		return t ? t[0] : 0;
	}
	getdodge_time() {
		const t = this.ab[AB_IMUATK];
		return t ? t[1] : 0;
	}
	getdodge_prob() {
		const t = this.ab[AB_IMUATK];
		return t ? t[0] : 0;
	}
	getformc() {
		return this.lvc + 1;
	}
	getkb() {
		return this.kb;
	}
	getrarity() {
		return _info[0];
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
		return 0 != (this.atkType & ATK_KB_REVENGE);
	}
	getbackswing() {
		return this.backswing;
	}
	getbeast_prob() {
		const t = this.ab[AB_BSTHUNT];
		return t ? t[0] : 0;
	}
	getbeast_time() {
		const t = this.ab[AB_BSTHUNT];
		return t ? t[1] : 0;
	}
	getstop_cover() {
		const t = this.ab[AB_STOP];
		if (!t) return 0;
		return getCoverUnit(this, t[0], (this.trait & trait_treasure) ? ~~(t[1] * 1.2) : t[1]);
	}
	getslow_cover() {
		const t = this.ab[AB_SLOW];
		if (!t) return 0;
		return getCoverUnit(this, t[0], (this.trait & trait_treasure) ? ~~(t[1] * 1.2) : t[1]);
	}
	getweak_cover() {
		const t = this.ab[AB_WEAK];
		if (!t) return 0;
		return getCoverUnit(this, t[0], (this.trait & trait_treasure) ? ~~(t[2] * 1.2) : t[2]);
	}
	getcurse_cover() {
		const t = this.ab[AB_CURSE];
		if (!t) return 0;
		return getCoverUnit(this, t[0], (this.trait & trait_treasure) ? ~~(t[1] * 1.2) : t[1]);
	}
	gethp() {
		return ~~(~~(2.5 * Math.round(this.hp * getLevelMulti(this.getTotalLv()))) * this.hpM);
	}
	getatk() {
		const m = getLevelMulti(this.getTotalLv());
		let atk = ~~(~~(2.5 * Math.round(this.atk * m)) * this.atkM);
		if (this.atk1) {
			atk += ~~(~~(2.5 * Math.round(this.atk1 * m)) * this.atkM);
			if (this.atk2) {
				atk += ~~(~~(2.5 * Math.round(this.atk2 * m)) * this.atkM);
			}
		}
		return atk;
	}
	getattack() {
		return this.getatk();
	}
	getdps() {
		return ~~(30 * this.getatk() / this.attackF);
	}
	getthp() {
		let hp = this.gethp();
		if (this.ab.hasOwnProperty(AB_WKILL))
			return hp * 10;
		if (this.ab.hasOwnProperty(AB_EKILL))
			return hp * 5;
		if (this.ab.hasOwnProperty(AB_RESIST)) {
			hp *= this.trait & trait_treasure ? 5 : 4;
		} else if (this.ab.hasOwnProperty(AB_RESISTS)) {
			hp *= this.trait & trait_treasure ? 7 : 6;
		}
		if (this.ab.hasOwnProperty(AB_GOOD)) {
			hp *= this.trait & trait_treasure ? 2 : 2.5;
		}
		if (this.ab.hasOwnProperty(AB_BSTHUNT)) {
			hp /= 0.6;
		} else if (this.ab.hasOwnProperty(AB_BAIL)) {
			hp /= 0.7;
		} else if (this.ab.hasOwnProperty(AB_SAGE)) {
			hp += hp;
		}
		return hp;
	}
	getwavelv() {
		const t = this.ab[AB_WAVE];
		return t ? t[1] : 0;
	}
	getvolclv() {
		const t = this.ab[AB_VOLC];
		return t ? t[4] : 0;
	}
	getminiwavelv() {
		const t = this.ab[AB_MINIWAVE];
		return t ? t[1] : 0;
	}
	getminivolclv() {
		const t = this.ab[AB_MINIVOLC];
		return t ? t[4] : 0;
	}
	getcrit() {
		return this.ab[AB_CRIT] | 0;
	}
	hpagainst(traits) {
		let hp = this.gethp();
		if ((traits & TB_WITCH) && this.ab.hasOwnProperty(AB_WKILL))
			return hp * 10;
		if ((traits & TB_EVA) && this.ab.hasOwnProperty(AB_EKILL))
			return hp * 5;
		const t = this.trait & traits;
		if (t) {
			if (this.ab.hasOwnProperty(AB_RESIST)) {
				hp *= t & trait_treasure ? 5 : 4;
			} else if (this.ab.hasOwnProperty(AB_RESISTS)) {
				hp *= t & trait_treasure ? 7 : 6;
			}
			if (this.ab.hasOwnProperty(AB_GOOD)) {
				hp *= t & trait_treasure ? 2 : 2.5;
			}
		}
		if (traits & TB_BEAST) {
			hp /= 0.6;
		}
		if (traits & TB_BARON) {
			hp /= 0.7;
		}
		return hp;

	}
	dpsagainst(traits) {
		if (this.ab.hasOwnProperty(AB_ONLY) && (!(traits & this.trait)))
			return 0;
		let t = 0;
		for (let x of this._dpsagainst(traits)) {
			t += ~~x;
		}
		return ~~((30 * t) / this.attackF);
	}
	_dpsagainst(traits) {
		let atks = this._getatks();
		let v;
		if (this.ab.hasOwnProperty(AB_ATKBASE)) {
			this.mul(atks, 1 + this.ab[AB_ATKBASE][0] / 100);
			return atks;
		}
		if (this.ab.hasOwnProperty(AB_VOLC)) {
			v = this.ab[AB_VOLC];
			this.mul(atks, 1 + v[4] * v[0] / 100, false);
		} else if (this.ab.hasOwnProperty(AB_MINIVOLC)) {
			v = this.ab[AB_MINIVOLC];
			this.mul(atks, 1 + v[4] * v[0] / 500, false);
		}
		if (this.ab.hasOwnProperty(AB_WAVE)) {
			this.mul(atks, 1 + this.ab[AB_WAVE][0] / 100, false);
		} else if (this.ab.hasOwnProperty(AB_MINIWAVE)) {
			this.mul(atks, 1 + this.ab[AB_MINIWAVE][0] / 500, false);
		}
		if (this.ab.hasOwnProperty(AB_S)) {
			v = this.ab[AB_S];
			this.mul(atks, 1 + v[0] * v[1] / 10000, false);
		}
		if (this.ab.hasOwnProperty(AB_CRIT)) {
			if (traits & TB_METAL) {
				this.mul(atks, this.ab[AB_CRIT] / 100, false);
			} else {
				this.mul(atks, 1 + this.ab[AB_CRIT] / 100, false);
			}
		}
		if (this.ab.hasOwnProperty(AB_STRONG)) {
			this.mul(atks, 1 + this.ab[AB_STRONG][1] / 100);
		}
		if ((traits & TB_EVA) && this.ab.hasOwnProperty(AB_EKILL)) {
			this.mul(atks, 5);
			return atks;
		} else if ((traits & TB_WITCH) && this.ab.hasOwnProperty(AB_WKILL)) {
			this.mul(atks, 5);
			return atks;
		}
		const t = this.trait & traits;
		if (t) {
			const x = t & trait_treasure;
			if (this.ab.hasOwnProperty(AB_MASSIVE)) {
				this.mul(atks, x ? 4 : 3);
			} else if (this.ab.hasOwnProperty(AB_MASSIVES)) {
				this.mul(atks, x ? 6 : 5);
			}
			if (this.ab.hasOwnProperty(AB_GOOD)) {
				this.mul(atks, x ? 1.8 : 1.5);
			}
		}
		if ((traits & TB_BEAST) && this.ab.hasOwnProperty(AB_BSTHUNT)) {
			this.mul(atks, 2.5);
		} else if ((traits & TB_BARON) && this.ab.hasOwnProperty(AB_BAIL)) {
			this.mul(atks, 1.6);
		} else if ((traits & TB_SAGE) && this.ab.hasOwnProperty(AB_SAGE)) {
			this.mul(atks, 1.2);
		}
		if (traits & TB_METAL) {
			let r = this.ab[AB_CRIT];
			if (r == undefined) {
				atks = [1];
				return atks;
			}
			atks[0] += 1 - r / 100;
			return atks;
		}
		return atks;
	}
	_gettatk() {
		let atks = this._getatks();
		if (this.ab.hasOwnProperty(AB_ATKBASE)) {
			this.mul(atks, 1 + this.ab[AB_ATKBASE][0] / 100);
			return atks;
		}
		if (this.ab.hasOwnProperty(AB_VOLC)) {
			this.mul(atks, 1 + this.ab[AB_VOLC][4], false);
		} else if (this.ab.hasOwnProperty(AB_MINIVOLC)) {
			this.mul(atks, 1 + this.ab[AB_MINIVOLC][4] * 0.2, false);
		}
		if (this.ab.hasOwnProperty(AB_WAVE)) {
			this.mul(atks, 2, false);
		} else if (this.ab.hasOwnProperty(AB_MINIWAVE)) {
			this.mul(atks, 1.2, false);
		}
		if (this.ab.hasOwnProperty(AB_S)) {
			this.mul(atks, 1 + this.ab[AB_S][1] / 100, false);
		}
		if (this.ab.hasOwnProperty(AB_CRIT)) {
			this.mul(atks, 2, false);
		}
		if (this.ab.hasOwnProperty(AB_STRONG)) {
			this.mul(atks, 1 + this.ab[AB_STRONG][1] / 100);
		}
		if (this.ab.hasOwnProperty(AB_EKILL) || this.ab.hasOwnProperty(AB_WKILL)) {
			this.mul(atks, 5);
			return atks;
		}
		if (this.ab.hasOwnProperty(AB_MASSIVE)) {
			this.mul(atks, this.trait & trait_treasure ? 4 : 3);
		} else if (this.ab.hasOwnProperty(AB_MASSIVES)) {
			this.mul(atks, this.trait & trait_treasure ? 6 : 5);
		}
		if (this.ab.hasOwnProperty(AB_GOOD)) {
			this.mul(atks, this.trait & trait_treasure ? 1.8 : 1.5);
		}
		if (this.ab.hasOwnProperty(AB_BSTHUNT)) {
			this.mul(atks, 2.5);
		} else if (this.ab.hasOwnProperty(AB_BAIL)) {
			this.mul(atks, 1.6);
		} else if (this.ab.hasOwnProperty(AB_SAGE)) {
			this.mul(atks, 1.2);
		}
		return atks;
	}
	getrange_min() {
		if ((this.atkType & ATK_OMNI) || (this.atkType & ATK_LD)) {
			return Math.max.apply(null, this.lds);;
		}
		return this.range;
	}
	getrange_max() {
		if ((this.atkType & ATK_OMNI) || (this.atkType & ATK_LD)) {
			let m = this.lds[0] + this.ldr[1];
			for (let i = 1; i < this.lds.length; ++i)
				m = Math.max(m, this.lds[i] + this.ldr[i]);
			return m;
		}
		return this.range;
	}
	getreach_base() {
		if (!this.lds) return this.range;
		return this.lds[0] > 0 ? this.lds[0] : this.range;
	}
	getrange_interval() {
		return this.lds ? Math.abs(this.ldr[0]) : 0;
	}
	getrange_interval_max() {
		if ((this.atkType & ATK_OMNI) || (this.atkType & ATK_LD)) {
			let x, r = this.lds[0],
				R = r + this.ldr[0];
			for (let i = 1; i < this.lds.length; ++i) {
				x = this.lds[i];
				r = Math.max(r, x);
				R = Math.max(R, x + this.ldr[i]);
			}
			return Math.abs(R - r);
		}
		return 0;
	}
	involve4_require(x) {
		if (!_info[9]) return 0;
		x = x.toString();
		for (let r of _info[9].split('|')) {
			r = r.split('!');
			if (r[1] == x)
				return parseInt(r[0]);
		}
		return 0;
	}
	involve_require(x) {
		if (!_info[8]) return 0;
		x = x.toString();
		for (let r of _info[8].split('|')) {
			r = r.split('!');
			if (r[1] == x)
				return parseInt(r[0]);
		}
		return 0;
	}
	getatkcount() {
		let c = 1;
		if (this.pre1) {
			c += 1;
			if (this.pre2)
				c += 1;
		}
		return c;
	}
	gettdps() {
		let t = 0;
		for (let x of this._gettdps())
			t += ~~x;
		return ~~((30 * t) / this.attackF);
	}
	_gettdps() {
		let atks = this._getatks();
		let v;
		if (this.ab.hasOwnProperty(AB_ATKBASE)) {
			this.mul(atks, 1 + this.ab[AB_ATKBASE][0] / 100);
			return atks;
		}
		if (this.ab.hasOwnProperty(AB_VOLC)) {
			v = this.ab[AB_VOLC];
			this.mul(atks, 1 + v[4] * v[0] / 100, false);
		} else if (this.ab.hasOwnProperty(AB_MINIVOLC)) {
			v = this.ab[AB_MINIVOLC];
			this.mul(atks, 1 + v[4] * v[0] / 500, false);
		}
		if (this.ab.hasOwnProperty(AB_WAVE)) {
			this.mul(atks, 1 + this.ab[AB_WAVE][0] / 100, false);
		} else if (this.ab.hasOwnProperty(AB_MINIWAVE)) {
			this.mul(atks, 1 + this.ab[AB_MINIWAVE][0] / 500, false);
		}
		if (this.ab.hasOwnProperty(AB_S)) {
			v = this.ab[AB_S];
			this.mul(atks, 1 + v[0] * v[1] / 10000, false);
		}
		if (this.ab.hasOwnProperty(AB_CRIT)) {
			this.mul(atks, 1 + this.ab[AB_CRIT] / 100, false);
		}
		if (this.ab.hasOwnProperty(AB_STRONG)) {
			this.mul(atks, 1 + this.ab[AB_STRONG][1] / 100);
		}
		if (this.ab.hasOwnProperty(AB_EKILL) || this.ab.hasOwnProperty(AB_WKILL)) {
			this.mul(atks, 5);
			return atks;
		}
		if (this.ab.hasOwnProperty(AB_MASSIVE)) {
			this.mul(atks, this.trait & trait_treasure ? 4 : 3);
		} else if (this.ab.hasOwnProperty(AB_MASSIVES)) {
			this.mul(atks, this.trait & trait_treasure ? 6 : 5);
		}
		if (this.ab.hasOwnProperty(AB_GOOD)) {
			this.mul(atks, this.trait & trait_treasure ? 1.8 : 1.5);
		}
		if (this.ab.hasOwnProperty(AB_BSTHUNT)) {
			this.mul(atks, 2.5);
		} else if (this.ab.hasOwnProperty(AB_BAIL)) {
			this.mul(atks, 1.6);
		} else if (this.ab.hasOwnProperty(AB_SAGE)) {
			this.mul(atks, 1.2);
		}
		return atks;
	}
	_getatks() {
		const m = getLevelMulti(this.getTotalLv());
		let atks = [this.atk];
		if (this.atk1)
			atks.push(this.atk1);
		if (this.atk2)
			atks.push(this.atk2);
		for (let i = 0; i < atks.length; ++i)
			atks[i] = ~~(
				(
					~~(Math.round(atks[i] * m) * atk_t)
				) * this.atkM);
		return atks;
	}
	gettatk() {
		let x = this._gettatk();
		let s = 0;
		for (const i of x)
			s += i;
		return s;
	}
	mul(arr, s, ab = true) {
		for (let i = 0; i < arr.length; ++i)
			(ab || this.abi & 1 << 2 - i) && (arr[i] *= s)
	}
	_gettatk() {
		let atks = this._getatks();
		if (this.ab.hasOwnProperty(AB_ATKBASE)) {
			this.mul(atks, 1 + this.ab[AB_ATKBASE][0] / 100);
			return atks;
		}
		if (this.ab.hasOwnProperty(AB_VOLC)) {
			this.mul(atks, 1 + this.ab[AB_VOLC][4], false);
		} else if (this.ab.hasOwnProperty(AB_MINIVOLC)) {
			this.mul(atks, 1 + this.ab[AB_MINIVOLC][4] * 0.2, false);
		}
		if (this.ab.hasOwnProperty(AB_WAVE)) {
			this.mul(atks, 2, false);
		} else if (this.ab.hasOwnProperty(AB_MINIWAVE)) {
			this.mul(atks, 1.2, false);
		}
		if (this.ab.hasOwnProperty(AB_S)) {
			this.mul(atks, 1 + this.ab[AB_S][1] / 100, false);
		}
		if (this.ab.hasOwnProperty(AB_CRIT)) {
			this.mul(atks, 2, false);
		}
		if (this.ab.hasOwnProperty(AB_STRONG)) {
			this.mul(atks, 1 + this.ab[AB_STRONG][1] / 100);
		}
		if (this.ab.hasOwnProperty(AB_EKILL) || this.ab.hasOwnProperty(AB_WKILL)) {
			this.mul(atks, 5);
			return atks;
		}
		if (this.ab.hasOwnProperty(AB_MASSIVE)) {
			this.mul(atks, this.trait & trait_treasure ? 4 : 3);
		} else if (this.ab.hasOwnProperty(AB_MASSIVES)) {
			this.mul(atks, this.trait & trait_treasure ? 6 : 5);
		}
		if (this.ab.hasOwnProperty(AB_GOOD)) {
			this.mul(atks, this.trait & trait_treasure ? 1.8 : 1.5);
		}
		if (this.ab.hasOwnProperty(AB_BSTHUNT)) {
			this.mul(atks, 2.5);
		} else if (this.ab.hasOwnProperty(AB_BAIL)) {
			this.mul(atks, 1.6);
		} else if (this.ab.hasOwnProperty(AB_SAGE)) {
			this.mul(atks, 1.2);
		}
		return atks;
	}
	getspeed() {
		return this.speed;
	}
	getprice() {
		return 1.5 * this.price;
	}
	getcost() {
		return 1.5 * this.price;
	}
	getcdf() {
		return getRes(this.cd);
	}
	getcd() {
		return getRes(this.cd) / 30;
	}
	getimu() {
		return this.imu;
	}
	getatktype() {
		return this.atkType;
	}
}

class Enemy {
	constructor(o) {
		if (o instanceof Array) {
			this.i = o[0];
			this.name = o[1];
			this.jp_name = o[2];
			this.fandom = o[3];
			this.desc = o[4];
			this.hp = parseInt(o[5], 10);
			this.kb = parseInt(o[6], 10);
			this.speed = parseInt(o[7], 10);
			this.range = parseInt(o[8], 10);
			this.pre = parseInt(o[9], 10);
			this.pre1 = parseInt(o[10], 10);
			this.pre2 = parseInt(o[11], 10);
			this.atk = parseInt(o[12], 10);
			this.atk1 = parseInt(o[13], 10);
			this.atk2 = parseInt(o[14], 10);
			this.tba = parseInt(o[15], 10);
			this.backswing = parseInt(o[16], 10);
			this.attackF = parseInt(o[17], 10);
			this.atkType = parseInt(o[18], 10);
			this.trait = parseInt(o[19], 10);
			this.abi = parseInt(o[20], 10);
			if (o[21]) {
				this.lds = o[21].split('|').map(toi);
				this.ldr = o[22].split('|').map(toi);
			}
			this.imu = parseInt(o[23], 10);
			this.ab = {};
			if (o[24].length) {
				for (const x of o[24].split('|')) {
					let idx = x.indexOf('@');
					if (idx == -1) {
						idx = x.indexOf('&');
						let i = parseInt(x.slice(0, idx), 10);
						if (x.endsWith('&'))
							this.ab[i] = null;
						else
							this.ab[i] = parseInt(x.slice(idx + 1), 10);
					} else {
						this.ab[parseInt(x.slice(0, idx), 10)] = x.slice(idx + 1).split('!').map(toi);
					}
				}
			}
			this.earn = parseInt(o[25], 10);
			if (o[26].length)
				this.star = parseInt(o[26], 10);
		} else {
			Object.assign(this, o);
		}
	}
	gethp() {
		return this.hp;
	}
	getthp() {
		return this.hp;
	}
	getatk() {
		return this.atk + this.atk1 + this.atk2;
	}
	getattack() {
		return this.getatk();
	}
	gettatk() {
		return this.getatk();
	}
	getdps() {
		return 30 * this.getatk() / this.attackF;
	}
	gettdps() {
		return this.getdps();
	}
	getimu() {
		return this.imu;
	}
	hasab(i) {
		return this.ab.hasOwnProperty(i);
	}
	getid() {
		return this.i;
	}
	hasres() {
		return 0;
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
		return 0;
	}
	getkb() {
		return this.kb;
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
		return 0 != (this.atkType & ATK_KB_REVENGE);
	}
	getbackswing() {
		return this.backswing;
	}
	getcost() {
		return Math.round(100 * (this.earn * (.95 + .05 * treasures[18] + .005 * treasures[3]) + Number.EPSILON)) / 100;
	}
	getprice() {
		return this.getCost();
	}
	getspeed() {
		return this.speed;
	}
	getatktype() {
		return this.atkType;
	}
}

class Cat {
	constructor(o) {
		if (o instanceof Array) {
			o[0] = parseInt(o[0], 10);
			o[1] = parseInt(o[1], 10);
			o[4] = parseInt(o[4], 10);
			o[5] = parseInt(o[5], 10);

			if (!o[6].length)
				o[6] = o[7] = null;

			if (o[10].length)
				o[10] = new Int16Array(o[10].split('|'));

			if (o[11].length)
				o[11] = parseInt(o[11], 10);
			else
				o[11] = null;

			if (o[12].length)
				o[12] = parseInt(o[12], 10);
			else
				o[12] = null;

			o[16] = parseInt(o[16], 10);

			if (!o[17].length)
				o[17] = null;

			if (!o[18].length)
				o[18] = null;

			this.forms = new Array(o[1]);
			this.info = o;
		} else {
			this.info = o.info;
			this.forms = o.forms.map(x => new Form(x));
		}
	}
}

async function getAllEnemies() {
	let res = await fetch('/enemy.tsv');
	if (!res.ok) throw '';

	res = await res.text();
	res = res.split('\n');

	const enemies = new Array({{{lookup (loadJSON "cat_extras.json") "num_enemies"}}});

	for (let i = 1; i <= {{{lookup (loadJSON "cat_extras.json") "num_enemies"}}}; ++i)
		enemies[i - 1] = new Enemy(res[i].split('\t'));

	return enemies;
}

async function getAllCats() {
	let res = await fetch('/cat.tsv');
	if (!res.ok) throw '';

	res = await res.text();
	res = res.split('\n');

	const cats = new Array({{{lookup (loadJSON "cat_extras.json") "num_cats"}}});

	for (let i = 1; i <= {{{lookup (loadJSON "cat_extras.json") "num_cats"}}}; ++i)
		cats[i - 1] = new Cat(res[i].split('\t'));

	res = await fetch('/catstat.tsv');
	if (!res.ok) throw '';

	res = (await res.text()).split('\n');

	let line, lvc = 0,
		id = 0,
		s = '0',
		end = res.length - 1;
	for (let i = 1; i < end; ++i) {
		line = res[i].split('\t');
		if (s != line[0]) {
			s = line[0];
			lvc = 0;
			++id;
		}
		line[0] = id;
		cats[id].forms[lvc] = new Form(line, lvc);
		++lvc;
	}

	return cats;
}

function onupgradeneeded(e) {
	e = e.target.result;
	try {
		e.deleteObjectStore("cats");
	} catch (e) {

	}
	try {
		e.deleteObjectStore("enemy");
	} catch (e) {

	}
	e.createObjectStore("cats", {
		keyPath: 'i'
	});
	e.createObjectStore('enemy', {
		keyPath: 'i'
	});
}
async function loadCat(id) {
	return new Promise(resolve => {
		var req = indexedDB.open("db", {{{lookup (loadJSON "config.json") "cat_ver"}}});
		req.onupgradeneeded = onupgradeneeded, req.onsuccess = function(e) {
			const db = e.target.result;
			db.transaction(["cats"]).objectStore("cats").get(id).onsuccess = function(e) {
				e = e.target.result;
				if (e)
					return resolve(new Cat(e));

				getAllCats().then(cats => {
					var o, tx = db.transaction(["cats"], "readwrite"),
						store = tx.objectStore("cats");
					for (let i = 0; i < cats.length; ++i)
						o = cats[i], store.put({
							'i': i,
							'info': o.info,
							'forms': o.forms
						});

					tx.oncomplete = function() {
						db.close();
						resolve(cats[id]);
					};
				});
			};
		};
	});
}

async function loadEnemy(id) {
	return new Promise((resolve, reject) => {
		var req = indexedDB.open("db", {{{lookup (loadJSON "config.json") "cat_ver"}}});
		req.onupgradeneeded = onupgradeneeded, req.onsuccess = function(e) {
			const db = e.target.result;
			db.transaction(["enemy"]).objectStore("enemy").get(id).onsuccess = function(e) {
				e = e.target.result;
				if (e) return resolve(new Enemy(e));

				getAllEnemies().then(es => {
					let tx = db.transaction(["enemy"], "readwrite"),
						store = tx.objectStore("enemy");

					for (const e of es)
						store.put(e);

					tx.oncomplete = function() {
						db.close();
						resolve(es[id]);
					};
				});
			};
		};
	});
}

async function loadAllEnemies() {
	return new Promise(resolve => {
		var req = indexedDB.open("db", {{{lookup (loadJSON "config.json") "cat_ver"}}});
		req.onupgradeneeded = onupgradeneeded, req.onsuccess = function(e) {
			const db = e.target.result;
			db.transaction(["enemy"]).objectStore("enemy").get({{{lookup (loadJSON "cat_extras.json") "num_enemies"}}} - 1).onsuccess = function(e) {
				if (e.target.result) {
					let es = new Array({{{lookup (loadJSON "cat_extras.json") "num_enemies"}}});
					db.transaction(["enemy"]).objectStore("enemy").openCursor().onsuccess = function(e) {
						if (e = e.target.result) {
							es[e.value.i] = new Enemy(e.value);
							e.continue();
						} else {
							db.close();
							resolve(es);
						}
					};
				} else getAllEnemies().then(es => {
					let tx = db.transaction(["enemy"], "readwrite"),
						store = tx.objectStore("enemy");
					for (const e of es)
						store.put(e);
					tx.oncomplete = function() {
						db.close();
						resolve(es);
					};
				});
			};
		};
	});
}

async function loadAllCats() {
	return new Promise(resolve => {
		var req = indexedDB.open("db", {{{lookup (loadJSON "config.json") "cat_ver"}}});
		req.onupgradeneeded = onupgradeneeded, req.onsuccess = function(e) {
			const db = e.target.result;
			db.transaction(["cats"]).objectStore("cats").get({{{lookup (loadJSON "cat_extras.json") "num_cats"}}} - 1).onsuccess = function(e) {
				if (e.target.result) {
					let cats = new Array({{{lookup (loadJSON "cat_extras.json") "num_cats"}}});
					db.transaction(["cats"]).objectStore("cats").openCursor().onsuccess = function(e) {
						if (e = e.target.result) {
							cats[e.value.i] = new Cat(e.value);
							e.continue();
						} else {
							db.close();
							resolve(cats);
						}
					};
				} else getAllCats().then(cats => {

					var o, tx = db.transaction(["cats"], "readwrite"),
						store = tx.objectStore("cats");
					for (let i = 0; i < cats.length; ++i)
						o = cats[i], store.put({
							'i': i,
							'info': o.info,
							'forms': o.forms
						});

					tx.oncomplete = function() {
						db.close();
						resolve(cats);
					};
				});
			};
		};
	});
}

function createTraitIcons(trait, parent) {
	if (!trait) { return; }
	const E = document.createElement('div');
	for (let x = 1, i = 0; x <= TB_DEMON; x <<= 1, ++i) {
		if (!(trait & x)) { continue; }
		const e = E.appendChild(new Image(40, 40));
		e.src = 'https://i.imgur.com/' + units_scheme.traits.icons[i] + '.png';
	}
	parent.appendChild(E);
}

function createImuIcons(imu, parent) {
	if (!imu) { return; }
	const p = document.createElement('div');
	const names = [];
	for (let x = 1, i = 0; x <= 512; x <<= 1, ++i) {
		if (!(imu & x)) { continue; }
		const e = p.appendChild(new Image(40, 40));
		e.src = 'https://i.imgur.com/' + units_scheme.immunes.icons[i] + '.png';
		names.push(units_scheme.immunes.names[i]);
	}
	const text = (names.length === 1) ? `${names.join('')}無效` : `無效（${names.join('、')}）`;
	p.append(text);
	parent.appendChild(p);
}

function createResIcons(res, p) {
	for (let [k, v] of Object.entries(res)) {
		k = parseInt(k, 10);
		const c = p.appendChild(document.createElement('div'));
		const e = c.appendChild(new Image(40, 40));
		e.src = 'https://i.imgur.com/' + units_scheme.resists.icons[k] + '.png';
		c.append(units_scheme.resists.descs[k].replace('$', v));
	}
}

function getAbiString(abi) {
	var strs;
	return abi ? (strs = [], 4 & abi && strs.push('一'), 2 & abi && strs.push('二'),
		1 & abi && strs.push('三'), "，第" + strs.join(' / ') + "擊附加特性") : "";
}

const treasures = [300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 30, 10, 30, 30, 30, 30, 30, 30, 30, 100, 600, 1500, 300, 100, 30, 300, 300, 300, 300, 100];

for (let i = 0; i < 31; ++i) {
	const x = localStorage.getItem("t$" + i.toString());
	null != x && (treasures[i] = parseInt(x));
}

const atk_t = 300 == treasures[0] ? 2.5 : 1 + .005 * treasures[0],
	hp_t = 300 == treasures[1] ? 2.5 : 1 + .005 * treasures[1];

function getRes(cd) {
	return Math.max(60, cd - 6 * (treasures[17] - 1) - .3 * treasures[2]);
}
