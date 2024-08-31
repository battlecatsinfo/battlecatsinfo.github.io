const DB_NAME = 'db';
const DB_VERSION = {{{lookup (loadJSON "config.json") "cat_ver"}}};
const units_scheme = {{{toJSON (loadJSON "units_scheme.json")}}};
const levelcurves = {{{toJSON (lookup (loadJSON "cat_extras.json") "level_curve")}}};

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
	return utils.numStr(num);
	// return (Math.round(100 * (num + Number.EPSILON)) / 100).toString();
}

function numStrT(num) {
	if (utils.durationUnit === 'F')
		return num.toString() + ' F';
	return numStr(num / 30) + ' 秒';
}

function combineChances(count, chance) {
	let x = 1;
	for (let i = 0; i < count; ++i) x *= (100 - chance) / 100;
	return 1 - x;
}

// https://gist.github.com/battlecatsinfo/7d043065effd6c2397d7d9272c6aba83
function getChances(freq, pres, chance, duration) {
		const segments = [];
		const steps = new Set();
		outer: for (let now = 0;;now -= freq) {
				for (let i = pres.length - 1;i >= 0;--i) {
					let start = now + pres[i];
					let end = start + duration;

					if (end < 0)
						break outer;

					start = Math.max(start, 0);
					end = Math.min(end, freq);

					if (start != end) {
						segments.push([start, end]);
						steps.add(start);
						steps.add(end);
					}
				}
		}
		let cover = 0;
		let count = 0;
		let last_f = 0;
		for (const f of Array.from(steps).sort((a, b) => a - b)) {
			if (f != last_f) {
				cover += combineChances(count, chance) * (f - last_f);
				last_f = f;
			}
			for (const [start, end] of segments) {
				if (start == f)
					++count;
				else if (end == f)
					--count;
			}
		}
		return 100 * cover / freq;
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

function toi(x) {
	return parseInt(x, 10);
}

class CatForm {
	constructor(o, props = {}) {
		Object.assign(this, o);

		// make non-structured-cloneable
		Object.defineProperties(this, {
			base: {value: props.base},
			hpM: {value: props.hpM ?? 1, writable: true},
			atkM: {value: props.atkM ?? 1, writable: true},
			_baseLv: {value: props._baseLv ?? 1, writable: true},
			_plusLv: {value: props._plusLv ?? 0, writable: true},
		});
	}
	clone() {
		const {base, hpM, atkM, _baseLv, _plusLv} = this;
		return new CatForm(structuredClone(this), {base, hpM, atkM, _baseLv, _plusLv});
	}
	get id() {
		return this.base.id;
	}
	get baseLv() {
		return this._baseLv;
	}
	set baseLv(value) {
		this._baseLv = Math.max(Math.min(value, this.base.info.maxBaseLv), 1);
	}
	get plusLv() {
		return this._plusLv;
	}
	set plusLv(value) {
		this._plusLv = Math.max(Math.min(value, this.base.info.maxPlusLv), 0);
	}
	get level() {
		return this._baseLv + this._plusLv;
	}
	set level(value) {
		this.baseLv = value;
		this.plusLv = value - this.baseLv;
	}
	getLevelMulti(level = this.level) {
		return this.base.getLevelMulti(level);
	}

	get talents() {
		return this.base.info.talents;
	}

	/**
	 * @param {integer} [type] - the type of talents to apply: 0 for talents;
	 *     1 for super talents; and undefined/null for any type.
	 */
	maxTalentLevels(type = null) {
		const talents = this.talents;
		const rv = [];
		for (let i = 1; i < 113 && talents[i]; i += 14)
			if (type === null || type === talents[i + 13])
				rv.push(talents[i + 1] || 1);
		return rv;
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

	applyAllTalents(levels) {
		this._applyTalents(levels);
	}

	applySuperTalents(levels) {
		this._applyTalents(levels, 1);
	}

	applyTalents(levels) {
		this._applyTalents(levels, 0);
	}

	/**
	 * @param {integer[]} [levels] - level of each talent. Omit to set to all max.
	 * @param {integer} [type] - the type of talents to apply: 0 for talents;
	 *     1 for super talents; and undefined/null for any type.
	 */
	_applyTalents(levels, type = null) {
		levels ??= this.maxTalentLevels(type);
		this.res ??= {};
		const talents = this.talents;
		let j = 0;
		for (let i = 1; i < 113 && talents[i]; i += 14) {
			if (type === null || type === talents[i + 13])
				this.applyTalent(talents.subarray(i, i + 14), levels[j++]);
		}
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
	getmax_base_lv() {
		return this.base.info.maxBaseLv;
	}
	getmax_plus_lv() {
		return this.base.info.maxPlusLv;
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
	getmaxformc() {
		return this.base.forms.length;
	}
	getkb() {
		return this.kb;
	}
	getrarity() {
		return this.base.info.rarity;
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
		return ~~(~~(2.5 * Math.round(this.hp * this.getLevelMulti())) * this.hpM);
	}
	getatk() {
		const m = this.getLevelMulti();
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
	evol4_require(x) {
		if (!this.base.info.evol4Req) return 0;
		x = x.toString();
		for (let r of this.base.info.evol4Req.split('|')) {
			r = r.split('!');
			if (r[1] == x)
				return parseInt(r[0]);
		}
		return 0;
	}
	evol_require(x) {
		if (!this.base.info.evolReq) return 0;
		x = x.toString();
		for (let r of this.base.info.evolReq.split('|')) {
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
		const m = this.getLevelMulti();
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
		Object.assign(this, o);
	}
	get id() {
		return this.i;
	}
	get icon() {
		return `/img/e/${this.id}/0.png`;
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
		return this.id;
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
		return this.getcost();
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
		this.i = o.i;
		this.info = o.info;
		this.forms = o.forms.map(form => {
			return new CatForm(form, {base: this});
		});
	}
	get id() {
		return this.i;
	}
	get maxBaseLv() {
		return this.info.maxBaseLv;
	}
	get maxPlusLv() {
		return this.info.maxPlusLv;
	}
	get maxLevel() {
		return this.maxBaseLv + this.maxPlusLv;
	}
	get lvCurve() {
		const value = levelcurves[this.info.lvCurve];
		Object.defineProperty(this, 'lvCurve', {value});
		return value;
	}
	getLevelMulti(level) {
		var c, multi = .8;
		let n = 0;
		for (c of this.lvCurve) {
			if (level <= n) break;
			multi += Math.min(level - n, 10) * (c / 100), n += 10;
		}
		return multi;
	}
	get xpCurve() {
		const s = this.info.xpCurve;
		const value = units_scheme.xp_curves[s] || s.split('|').map(Number);
		Object.defineProperty(this, 'xpCurve', {value});
		return value;
	}
	getXpCost(level) {
		if (level === 0) { return 0; }
		const curve = this.xpCurve;
		const mul = units_scheme.xp_multipliers;
		return mul[~~(level / 10)] * curve[level % 10];
	}
}

async function getAllEnemies() {
	const res = await utils.fetch('/enemy.json');
	const data = await res.json();
	return data.map(enemy => new Enemy(enemy));
}

async function getAllCats() {
	const res = await utils.fetch('/cat.json');
	const data = await res.json();
	return data.map(cat => {
		// slightly tweak data before storage
		const info = cat.info;
		if (info.talents)
			info.talents = new Int16Array(info.talents.split('|'));

		return new Cat(cat);
	});
}

function onupgradeneeded(event) {
	const db = event.target.result;
	try {
		db.deleteObjectStore("cats");
	} catch (ex) {}
	try {
		db.deleteObjectStore("enemy");
	} catch (ex) {}
	db.createObjectStore("cats", {
		keyPath: 'i'
	});
	db.createObjectStore('enemy', {
		keyPath: 'i'
	});
}

/**
 * @param {number} [id] - ID of the cat to load. Load all cats when omitted.
 * @return {(Cat|Cat[])}
 */
async function loadCat(id) {
	let db;
	let cats;
	let needReload = false;

	try {
		db = await new Promise((resolve, reject) => {
			const req = indexedDB.open(DB_NAME, DB_VERSION);
			req.onupgradeneeded = (event) => {
				needReload = true;
				onupgradeneeded(event);
			};
			req.onsuccess = (event) => resolve(event.target.result);
			req.onerror = (event) => reject(new Error(event.target.error));
		});

		if (!needReload) {
			await new Promise((resolve, reject) => {
				const tx = db.transaction(["cats"]);
				tx.oncomplete = resolve;
				tx.onerror = (event) => reject(new Error(event.target.error));
				tx.objectStore("cats").openCursor().onsuccess = (event) => {
					if (!event.target.result)
						needReload = true;
				};
			});
		}

		if (needReload) {
			cats = await getAllCats();
			await new Promise((resolve, reject) => {
				const tx = db.transaction(["cats"], "readwrite");
				tx.oncomplete = resolve;
				tx.onerror = (event) => reject(new Error(event.target.error));
				try {
					const store = tx.objectStore("cats");
					store.clear();
					for (const cat of cats) {
						store.put(cat);
					}
				} catch (ex) {
					reject(ex);
					tx.abort();
				}
			});
		}

		if (cats) {
			if (typeof id !== 'undefined')
				return cats[id];
			else
				return cats;
		}

		return await new Promise((resolve, reject) => {
			let rv;
			const tx = db.transaction(["cats"]);
			tx.oncomplete = (event) => resolve(rv);
			tx.onerror = (event) => reject(new Error(event.target.error));

			const store = tx.objectStore("cats");
			if (typeof id !== 'undefined') {
				store.get(id).onsuccess = (event) => {
					rv = new Cat(event.target.result);
				};
			} else {
				store.getAll().onsuccess = (event) => {
					rv = event.target.result.map(e => new Cat(e));
				};
			}
		});
	} finally {
		db && db.close();
	}
}

/**
 * Alias for loadCat().
 */
async function loadAllCats() {
	return await loadCat();
}

/**
 * @param {number} [id] - ID of the enemy to load. Load all enemies when omitted.
 * @return {(Enemy|Enemy[])}
 */
async function loadEnemy(id) {
	let db;
	let enemies;
	let needReload = false;

	try {
		db = await new Promise((resolve, reject) => {
			const req = indexedDB.open(DB_NAME, DB_VERSION);
			req.onupgradeneeded = (event) => {
				needReload = true;
				onupgradeneeded(event);
			};
			req.onsuccess = (event) => resolve(event.target.result);
			req.onerror = (event) => reject(new Error(event.target.error));
		});

		if (!needReload) {
			await new Promise((resolve, reject) => {
				const tx = db.transaction(["enemy"]);
				tx.oncomplete = resolve;
				tx.onerror = (event) => reject(new Error(event.target.error));
				tx.objectStore("enemy").openCursor().onsuccess = (event) => {
					if (!event.target.result)
						needReload = true;
				};
			});
		}

		if (needReload) {
			enemies = await getAllEnemies();
			await new Promise((resolve, reject) => {
				const tx = db.transaction(["enemy"], "readwrite");
				tx.oncomplete = resolve;
				tx.onerror = (event) => reject(new Error(event.target.error));
				try {
					const store = tx.objectStore("enemy");
					store.clear();
					for (const enemy of enemies) {
						store.put(enemy);
					}
				} catch (ex) {
					reject(ex);
					tx.abort();
				}
			});
		}

		if (enemies) {
			if (typeof id !== 'undefined')
				return enemies[id];
			else
				return enemies;
		}

		return await new Promise((resolve, reject) => {
			let rv;
			const tx = db.transaction(["enemy"]);
			tx.oncomplete = (event) => resolve(rv);
			tx.onerror = (event) => reject(new Error(event.target.error));

			const store = tx.objectStore("enemy");
			if (typeof id !== 'undefined') {
				store.get(id).onsuccess = (event) => {
					rv = new Enemy(event.target.result);
				};
			} else {
				store.getAll().onsuccess = (event) => {
					rv = event.target.result.map(e => new Enemy(e));
				};
			}
		});
	} finally {
		db && db.close();
	}
}

/**
 * Alias for loadEnemy().
 */
async function loadAllEnemies() {
	return await loadEnemy();
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
