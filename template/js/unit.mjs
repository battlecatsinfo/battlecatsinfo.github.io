import {fetch, config, numStr, round} from './common.mjs';

const DB_NAME = 'db';
const DB_VERSION = {{{lookup (loadJSON "config.json") "cat_ver"}}};
const units_scheme = {{{toJSON (loadJSON "units_scheme.json")}}};
const levelcurves = {{{toJSON (lookup (loadJSON "cat_extras.json") "level_curve")}}};

// Attack types
const ATK_SINGLE = 1;      // Single Attack 單體攻擊
const ATK_RANGE = 2;       // Area Attack 範圍攻擊
const ATK_LD = 4;          // Long Distance 遠距攻擊
const ATK_OMNI = 8;        // Omni strike 全方位攻擊
const ATK_KB_REVENGE = 16; // KB-Revenge 擊退反擊 [UNOFFICIAL]

// Traits
const TB_RED = 1;          // Red 紅色敵人
const TB_FLOAT = 2;        // Floating 飄浮敵人
const TB_BLACK = 4;        // Black 黑色敵人
const TB_METAL = 8;        // Metal 鋼鐵敵人
const TB_ANGEL = 16;       // Angel 天使敵人
const TB_ALIEN = 32;       // Alien 異星戰士
const TB_ZOMBIE = 64;      // Zombie 不死生物
const TB_RELIC = 128;      // Relic 古代種
const TB_WHITE = 256;      // Traitless 無屬性敵人
const TB_EVA = 512;        // EVA Angel 使徒
const TB_WITCH = 1024;     // Witch 魔女
const TB_DEMON = 2048;     // Aku 惡魔
const TB_INFN = 4096;      // 道場塔 [UNOFFICIAL]
const TB_BEAST = 8192;     // Behemoth 超獸
const TB_BARON = 16384;    // Colossus 超生命體
const TB_SAGE = 32768;     // Sage 超賢者

// Immunities
const IMU_WAVE = 1;        // Immune to Wave 波動傷害無效
const IMU_STOP = 2;        // Immune to Stop 動作停止無效
const IMU_SLOW = 4;        // Immune to Slow 動作變慢無效
const IMU_KB = 8;          // Immune to Knockback 打飛敵人無效
const IMU_SURGE = 16;      // Immune to Surge 烈波傷害無效
const IMU_WEAK = 32;       // Immune to Weaken 攻擊力下降無效
const IMU_WARP = 64;       // Immune to Warp 傳送無效
const IMU_CURSE = 128;     // Immune to Curse 古代詛咒無效
const IMU_TOXIC = 256;     // Immune to Toxic 毒擊傷害無效
const IMU_BOSSWAVE = 512;  // Immune to Boss Shockwave 魔王震波無效 [UNOFFICIAL]

// Abilities
const AB_STRENGTHEN = 1;   // Strengthen 攻擊力上升
const AB_LETHAL = 2;       // Survive 死血存活
const AB_ATKBASE = 3;      // Base Destroyer 善於攻城
const AB_CRIT = 4;         // Critical 會心一擊
const AB_ZKILL = 5;        // Zombie Killer 終結不死
const AB_CKILL = 6;        // Soulstrike 靈魂攻擊
const AB_BREAK = 7;        // Barrier Breaker 破壞護盾
const AB_SHIELDBREAK = 8;  // Shield Piercing 破壞惡魔盾
const AB_S = 9;            // Savage Blow 渾身一擊
const AB_BOUNTY = 10;      // Extra Money 得到很多金錢
const AB_METALIC = 11;     // Metal 鋼鐵特性
const AB_MINIWAVE = 12;    // Mini-Wave 小波動
const AB_WAVE = 13;        // Wave 波動
const AB_MINISURGE = 14;   // Mini-Surge 小烈波
const AB_SURGE = 15;       // Surge 烈波攻擊
const AB_WAVES = 16;       // Wave Shield 波動滅止
const AB_BAIL = 17;        // Colossus Slayer 超生命體特效
const AB_BSTHUNT = 18;     // Behemoth Slayer 超獸特效
const AB_WKILL = 19;       // Witch Killer 終結魔女
const AB_EKILL = 20;       // Eva Angel Killer 終結使徒
const AB_WEAK = 21;        // Weaken 使攻擊力下降
const AB_STOP = 22;        // Freeze 使動作停止
const AB_SLOW = 23;        // Slow 使動作變慢
const AB_ONLY = 24;        // Attacks Only 只能攻擊
const AB_GOOD = 25;        // Strong Against 善於攻擊
const AB_RESIST = 26;      // Resistant 很耐打
const AB_RESISTS = 27;     // Insanely Tough 超耐打
const AB_MASSIVE = 28;     // Massive Damage 超大傷害
const AB_MASSIVES = 29;    // Insane Damage 極度傷害
const AB_KB = 30;          // Knockback 打飛
const AB_WARP = 31;        // Warp 傳送
const AB_IMUATK = 32;      // Dodge Attack 攻擊無效
const AB_CURSE = 33;       // Curse 詛咒
const AB_BURROW = 34;      // Burrow 鑽地 [UNOFFICIAL]
const AB_REVIVE = 35;      // Revive 復活 [UNOFFICIAL]
const AB_POIATK = 36;      // Toxic 毒擊
const AB_SUICIDE = 37;     // Kamikaze(Suicide) 一次攻擊 [UNOFFICIAL]
const AB_BARRIER = 38;     // Barrier 護盾
const AB_DSHIELD = 39;     // Aku Shield 惡魔盾
const AB_COUNTER = 40;     // Counter-Surge 烈波反擊
const AB_DEATHSURGE = 41;  // Death Surge 遺留烈波(死後烈波)
const AB_SAGE = 42;        // Sage Slayer 超賢者特效
const AB_SUMMON = 43;      // Conjure(Summon) 召喚
const AB_MK = 44;          // Metal Killer 鋼鐵殺手

// Resist
const RES_WEAK = 0;        // Resist to Weaken 抗擊耐性
const RES_STOP = 1;        // Resist Freeze 動止耐性
const RES_SLOW = 2;        // Resist Slow 動慢耐性
const RES_KB = 3;          // Resist Knockback 抗飛耐性
const RES_WAVE = 4;        // Resist Wave 抗波耐性
const RES_SURGE = 5;       // Resist Surge Attack 抗烈波耐性
const RES_CURSE = 6;       // Resist Curse 抗古代詛咒耐性
const RES_TOXIC = 7;       // Resist Toxic 抗毒擊耐性
const RES_WARP = 8;        // Resist Warp 抗傳耐性

const trait_no_treasure = TB_DEMON | TB_EVA | TB_WITCH | TB_WHITE | TB_RELIC;
const trait_treasure = TB_RED | TB_FLOAT | TB_BLACK | TB_ANGEL | TB_ALIEN | TB_ZOMBIE | TB_METAL;

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
	if (!(unit.pre2 + unit.pre1)) return getCover(chance, duration, unit.attackF);
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
	return getChances(unit.attackF, pres, chance, duration);
}

function getCoverUnitStr(unit, chance, duration) {
	return numStr(getCoverUnit(unit, chance, duration));
}

function get_trait_short_names(trait) {
	var s = "";
	for (let x = 1, i = 0; x <= TB_DEMON; x <<= 1, i++) trait & x && (s += units_scheme.traits.short_names[i]);
	return s;
}

class CatEnv {
	constructor({treasures, orbs, others} = {}) {
		Object.defineProperties(this, {
			_treasures: {
				value: [],
				enumerable: true,
			},
			_orbs: {
				value: {
					atk: [],
					hp: [],
					good: [],
					massive: [],
					resist: [],
				},
				enumerable: true,
			},
			_others: {
				value: {},
				enumerable: true,
			},
		});
		this.reset();

		Object.assign(this._treasures, treasures);
		for (const [prop, arr] of Object.entries(orbs ?? {})) {
			this.setOrbs(prop, arr);
		}
		for (const [prop, arr] of Object.entries(others ?? {})) {
			this.setOthers(prop, arr);
		}
	}

	reset() {
		this.resetTreasures();
		this.resetOrbs();
		this.resetOthers();
	}

	resetTreasures() {
		this._treasures.length = 0;
		Object.assign(this._treasures, config.getDefaultTreasures());
	}

	resetOrbs() {
		for (const arr of Object.values(this._orbs)) {
			arr.length = 0;
		}
	}

	resetOthers() {
		for (let key in this._others) {
			delete this._others[key];
		}
	}

	getTreasure(idx) {
		return this._treasures[idx];
	}

	setTreasure(idx, value) {
		this._treasures[idx] = value;
	}

	getOrbs(type) {
		return this._orbs[type].slice();
	}

	addOrb(type, ...levels) {
		this._orbs[type].push(...levels);
	}

	setOrbs(type, levels) {
		this._orbs[type].length = 0;
		Object.assign(this._orbs[type], levels);
	}

	getOthers(idx) {
		return this._others[idx]?.slice() ?? [];
	}

	addOther(idx, ...values) {
		(this._others[idx] ??= []).push(...values);
	}

	setOthers(idx, values) {
		const arr = (this._others[idx] ??= []);
		arr.length = 0;
		Object.assign(arr, values);
	}

	get atk_t() {
		return 1 + 0.005 * this._treasures[0];
	}
	get hp_t() {
		return 1 + 0.005 * this._treasures[1];
	}
	get earn_r() {
		return 0.05 * (this._treasures[18] - 1);
	}
	get earn_t() {
		return 0.005 * this._treasures[3];
	}
	get cd_r() {
		return 6 * (this._treasures[17] - 1);
	}
	get cd_t() {
		return 0.3 * this._treasures[2];
	}
	get good_atk_t() {
		return this._treasures[23] / 1000;
	}
	get good_hp_t() {
		return this._treasures[23] / 3000;
	}
	get massive_t() {
		return this._treasures[23] / 300;
	}
	get resist_t() {
		return this._treasures[23] / 300;
	}
	get alien_t() {
		return 7 - this._treasures[21] / 100;
	}
	get alien_star_t() {
		return 16 - this._treasures[22] / 100;
	}
	get god1_t() {
		return 11 - (this._treasures[20] / 10);
	}
	get god2_t() {
		return 11 - (this._treasures[24] / 10);
	}
	get god3_t() {
		return 11 - (this._treasures[30] / 10);
	}

	get orb_atk() {
		return this._orbs.atk.reduce((rv, x) => rv + x, 0);
	}
	get orb_hp() {
		return this._orbs.hp.reduce((rv, x) => rv * (1 - 0.04 * x), 1);
	}
	get orb_good_hp() {
		return this._orbs.good.reduce((rv, x) => rv - 0.02 * x, 1);
	}
	get orb_good_atk() {
		return this._orbs.good.reduce((rv, x) => rv + 0.06 * x, 0);
	}
	get orb_massive() {
		return this._orbs.massive.reduce((rv, x) => rv + x / 10, 0);
	}
	get orb_resist() {
		return this._orbs.resist.reduce((rv, x) => rv * (1 - x / 20), 1);
	}

	// @TODO: rework this as a treasure?
	get base_resist() {
		return (this._others[1]?.[0] ?? 0) * 15 / 2000;
	}

	get combo_atk() {
		return (this._others[2] ?? []).reduce((rv, x) => rv + x / 100, 0);
	}
	get combo_hp() {
		return (this._others[3] ?? []).reduce((rv, x) => rv + x / 100, 0);
	}
	get combo_speed() {
		return (this._others[4] ?? []).reduce((rv, x) => rv + x / 100, 0);
	}
	get combo_cd() {
		return (this._others[5] ?? []).reduce((rv, x) => rv + x, 0);
	}
	get combo_crit() {
		return (this._others[6] ?? []).reduce((rv, x) => rv + x, 0);
	}
	get combo_good() {
		return (this._others[7] ?? []).reduce((rv, x) => rv + x / 100, 0);
	}
	get combo_massive() {
		return (this._others[8] ?? []).reduce((rv, x) => rv + x / 100, 0);
	}
	get combo_resist() {
		return (this._others[9] ?? []).reduce((rv, x) => rv + x / 100, 0);
	}
	get combo_slow() {
		return (this._others[10] ?? []).reduce((rv, x) => rv + x / 100, 0);
	}
	get combo_stop() {
		return (this._others[11] ?? []).reduce((rv, x) => rv + x / 100, 0);
	}
	get combo_weak() {
		return (this._others[12] ?? []).reduce((rv, x) => rv + x / 100, 0);
	}
	get combo_strengthen() {
		return (this._others[13] ?? []).reduce((rv, x) => rv + x, 0);
	}
	get combo_witch() {
		return (this._others[14] ?? []).reduce((rv, x) => rv + x / 100, 0);
	}
	get combo_eva() {
		return (this._others[15] ?? []).reduce((rv, x) => rv + x / 100, 0);
	}
}

class Unit {
	constructor() {
		if (new.target === Unit)
			throw new Error('Abstract Class cannot be instantiated');
	}
	get id() {
		return this.info.i;
	}
	get name() {
		return this.info.name;
	}
	get jp_name() {
		return this.info.jp_name;
	}
	get desc() {
		return this.info.desc;
	}
	get hp() {
		return ~~(round(this.info.hp * (this.alienMag ?? 1) * this.hpM) * this.stageM);
	}
	get thp() {
		return this._getthp();
	}
	get kb() {
		return this.info.kb;
	}
	get speed() {
		return this.info.speed;
	}
	get range() {
		return this.info.range;
	}
	get pre() {
		return this.info.pre;
	}
	get pre1() {
		return this.info.pre1;
	}
	get pre2() {
		return this.info.pre2;
	}
	get atkm() {
		return this._getatks().reduce((rv, x) => rv + x);
	}
	get atks() {
		return this._getatks();
	}
	get atk() {
		return this._getatks(0);
	}
	get atk1() {
		return this._getatks(1);
	}
	get atk2() {
		return this._getatks(2);
	}
	get tatks() {
		return this._gettatks({mode: 'max'});
	}
	get tba() {
		return this.info.tba;
	}
	get backswing() {
		return this.info.backswing;
	}
	get attackF() {
		return this.info.attackF;
	}
	get atkType() {
		return this.info.atkType;
	}
	get dps() {
		return 30 * this.atkm / this.attackF;
	}
	get tdps() {
		const atkm = this._gettatks({mode: 'expected'}).reduce((rv, x) => rv + x);
		return 30 * atkm / this.attackF;
	}
	get trait() {
		return this.info.trait;
	}
	get abi() {
		return this.info.abi;
	}
	get lds() {
		return this.info.lds;
	}
	get ldr() {
		return this.info.ldr;
	}
	get imu() {
		return this.info.imu;
	}
	get ab() {
		return this.info.ab;
	}

	abEnabled(atkIdx) {
		return this.abi & (1 << (2 - atkIdx));
	}
	get _atks() {
		const value = [this.info.atk, this.info.atk1, this.info.atk2];
		Object.defineProperty(this, '_atks', {value});
		return value;
	}
	_getatks(i) {
		const m = this.atkM;

		let atks = this._atks;

		atks = (typeof i !== 'undefined') ? [atks[i]] : atks.filter((x, i) => !i || x);

		atks = atks.map(atk => {
			return ~~(round(atk * (this.alienMag ?? 1) * this.atkM) * this.stageM);
		});

		return (typeof i !== 'undefined') ? atks[0] : atks;
	}

	/**
	 * @typedef {(null|integer|integer[])} AbilityDataEntry
	 */

	/**
	 * @typedef {Object<number, AbilityDataEntry>} AbilityData
	 */

	/**
	 * @typedef {(number[]|AbilityData)} AbilityFilter
	 */

	/**
	 * Get filtered ability data.
	 *
	 * @param {?AbilityFilter} [filter]
	 * @return {AbilityData}
	 */
	_getab(filter) {
		// null or undefined
		if (filter == null) {
			return this.ab;
		}

		if (Array.isArray(filter)) {
			return filter.reduce((rv, id) => {
				if (this.ab.hasOwnProperty(id)) {
					rv[id] = this.ab[id];
				}
				return rv;
			}, {});
		}

		const ab = {};
		for (const id in filter) {
			if (this.ab.hasOwnProperty(id)) {
				ab[id] = typeof filter[id] !== 'undefined' ? filter[id] : this.ab[id];
			}
		}
		return ab;
	}

	/**
	 * Calculate ability-boosted HP.
	 *
	 * @param {Object} [options]
	 * @param {AbilityFilter} [options.filter] - the ability data filter.
	 * @return {number} the boosted HP
	 */
	_getthp({
		filter: abFilter,
	} = {}) {
		const ab = this._getab(abFilter);
		let hp = this.hp;

		if (ab.hasOwnProperty(AB_DSHIELD)) {
			const v = ab[AB_DSHIELD];
			const s = ~~(round(v[0] * this.hpM) * this.stageM);
			hp += ~~(s + s * (v[1] / 100) * (this.kb - 1));
		}

		return hp;
	}

	/**
	 * Calculate ability-boosted attack damages.
	 *
	 * @param {Object} [options]
	 * @param {AbilityFilter} [options.filter] - the ability data filter.
	 * @param {string} [options.mode=expected] - the calculation mode:
	 *     "expected" for expected damage;
	 *     "max" for maximal possible damage.
	 * @param {boolean} [options.metal=true] - treat non-critical attack as 1
	 *     damage for a metal target.
	 * @param {boolean} [options.isBase=false] - target is base.
	 * @param {boolean} [options.isMetal=false] - target is metal.
	 * @return {number[]} the boosted attack damages
	 */
	_gettatks({
		filter: abFilter,
		mode = 'expected',
		metal: metalMode = true,
		isBase = false,
		isMetal = false,
	} = {}) {
		const ab = this._getab(abFilter);
		let v;

		return this._getatks().map((atk, idx) => {
			if (this.abEnabled(idx)) {
				if (ab.hasOwnProperty(AB_SURGE)) {
					v = v = ab[AB_SURGE];
					if (mode === 'max')
						atk *= 1 + v[3];
					else
						atk *= 1 + v[3] * v[0] / 100;
				} else if (ab.hasOwnProperty(AB_MINISURGE)) {
					v = ab[AB_MINISURGE];
					if (mode === 'max')
						atk *= 1 + v[3] * 0.2;
					else
						atk *= 1 + v[3] * v[0] / 500;
				}

				if (!isBase && ab.hasOwnProperty(AB_WAVE)) {
					if (mode === 'max')
						atk *= 2;
					else
						atk *= 1 + ab[AB_WAVE][0] / 100;
				} else if (!isBase && ab.hasOwnProperty(AB_MINIWAVE)) {
					if (mode === 'max')
						atk *= 1.2;
					else
						atk *= 1 + ab[AB_MINIWAVE][0] / 500;
				}

				if (ab.hasOwnProperty(AB_S)) {
					v = ab[AB_S];
					if (mode === 'max')
						atk *= 1 + v[1] / 100;
					else
						atk *= 1 + v[1] * v[0] / 10000;
				}

				// handle metal case specially at last
				if (ab.hasOwnProperty(AB_CRIT) && !(metalMode && isMetal)) {
					if (mode === 'max')
						atk *= 2;
					else
						atk *= 1 + ab[AB_CRIT] / 100;
				}
			}

			if (ab.hasOwnProperty(AB_STRENGTHEN)) {
				atk *= 1 + ab[AB_STRENGTHEN][1] / 100;
			}

			if (isBase && ab.hasOwnProperty(AB_ATKBASE)) {
				atk *= 4;
				return atk;
			}

			if (metalMode && isMetal) {
				const critRate = ab[AB_CRIT] ?? 0;
				const rate = this.abEnabled(idx) ? critRate / 100 : 0;
				const nonCritDmg = (() => {
					let rv = 1;
					if (this.abEnabled(idx)) {
						if (v = ab[AB_SURGE] || ab[AB_MINISURGE]) {
							rv += (mode === 'max') ? v[3] : v[3] * v[0] / 100;
						}
						if (v = ab[AB_WAVE] || ab[AB_MINIWAVE]) {
							rv += (mode === 'max') ? 1 : v[0] / 100;
						}
					}
					return rv;
				})();
				if (mode === 'max')
					return rate ? 2 * atk : nonCritDmg;
				else
					return (2 * atk * rate) + (nonCritDmg * (1 - rate));
			}

			return atk;
		});
	}

	__hasab(ab) {
		return this.ab.hasOwnProperty(ab);
	}
	__hasres() {
		return false;
	}
	__imu() {
		return this.imu;
	}

	__id() {
		return this.id;
	}
	__hp() {
		return this.hp;
	}
	__thp() {
		return this.thp;
	}
	__atk() {
		return this.atkm;
	}
	__attack() {
		return this.atkm;
	}
	__tatk() {
		return this.tatks.reduce((rv, x) => rv + x);
	}
	__atkcount() {
		let c = 1;
		if (this.pre1) {
			c += 1;
			if (this.pre2)
				c += 1;
		}
		return c;
	}
	__range_min() {
		if (this.atkType & ATK_LD) {
			return Math.min.apply(null, this.lds);
		}
		if (this.atkType & ATK_OMNI) {
			return Math.min.apply(null, this.lds.map((x, i) => x + this.ldr[i]));
		}
		return this.range;
	}
	__range_max() {
		if (this.atkType & ATK_LD) {
			return Math.max.apply(null, this.lds.map((x, i) => x + this.ldr[i]));
		}
		if (this.atkType & ATK_OMNI) {
			return Math.max.apply(null, this.lds);
		}
		return this.range;
	}
	__reach_base() {
		if (!this.lds) return this.range;
		return this.lds[0] > 0 ? this.lds[0] : this.range;
	}
	__range_interval() {
		return this.lds ? Math.abs(this.ldr[0]) : 0;
	}
	__range_interval_max() {
		if (this.atkType & (ATK_LD | ATK_OMNI)) {
			return Math.max.apply(null, this.ldr.map(Math.abs));
		}
		return 0;
	}
	__dps() {
		return this.dps;
	}
	__tdps() {
		return this.tdps;
	}
	__tba() {
		return this.tba;
	}
	__pre() {
		return this.pre;
	}
	__pre1() {
		return this.pre1;
	}
	__pre2() {
		return this.pre2;
	}
	__kb() {
		return this.kb;
	}
	__trait() {
		return this.trait;
	}
	__range() {
		return this.range;
	}
	__attackf() {
		return this.attackF;
	}
	__attacks() {
		return this.attackF / 30;
	}
	__revenge() {
		return 0 != (this.atkType & ATK_KB_REVENGE);
	}
	__backswing() {
		return this.backswing;
	}
	__speed() {
		return this.speed;
	}
	__atktype() {
		return this.atkType;
	}

	__wavelv() {
		const t = this.ab[AB_WAVE];
		return t ? t[1] : 0;
	}
	__miniwavelv() {
		const t = this.ab[AB_MINIWAVE];
		return t ? t[1] : 0;
	}
	__surgelv() {
		const t = this.ab[AB_SURGE];
		return t ? t[3] : 0;
	}
	__minisurgelv() {
		const t = this.ab[AB_MINISURGE];
		return t ? t[3] : 0;
	}
	__wave_prob() {
		const t = this.ab[AB_WAVE];
		return t ? t[0] : 0;
	}
	__mini_wave_prob() {
		const t = this.ab[AB_MINIWAVE];
		return t ? t[0] : 0;
	}
	__surge_prob() {
		const t = this.ab[AB_SURGE];
		return t ? t[0] : 0;
	}
	__mini_surge_prob() {
		const t = this.ab[AB_MINISURGE];
		return t ? t[0] : 0;
	}
	__dodge_time() {
		const t = this.ab[AB_IMUATK];
		return t ? t[1] : 0;
	}
	__dodge_prob() {
		const t = this.ab[AB_IMUATK];
		return t ? t[0] : 0;
	}
	__crit() {
		return this.ab[AB_CRIT] | 0;
	}
	__slow_time() {
		const t = this.ab[AB_SLOW];
		return t ? t[1] : 0;
	}
	__slow_prob() {
		const t = this.ab[AB_SLOW];
		return t ? t[0] : 0;
	}
	__stop_time() {
		const t = this.ab[AB_STOP];
		return t ? t[1] : 0;
	}
	__stop_prob() {
		const t = this.ab[AB_STOP];
		return t ? t[0] : 0;
	}
	__weak_time() {
		const t = this.ab[AB_WEAK];
		return t ? t[1] : 0;
	}
	__weak_prob() {
		const t = this.ab[AB_WEAK];
		return t ? t[0] : 0;
	}
	__weak_extent() {
		const t = this.ab[AB_WEAK];
		return t ? t[2] : 0;
	}
	__curse_time() {
		const t = this.ab[AB_CURSE];
		return t ? t[1] : 0;
	}
	__curse_prob() {
		const t = this.ab[AB_CURSE];
		return t ? t[0] : 0;
	}
	__slow_cover() {
		const t = this.ab[AB_SLOW];
		if (!t) return 0;
		return getCoverUnit(this, t[0], t[1]);
	}
	__stop_cover() {
		const t = this.ab[AB_STOP];
		if (!t) return 0;
		return getCoverUnit(this, t[0], t[1]);
	}
	__weak_cover() {
		const t = this.ab[AB_WEAK];
		if (!t) return 0;
		return getCoverUnit(this, t[0], t[1]);
	}
	__curse_cover() {
		const t = this.ab[AB_CURSE];
		if (!t) return 0;
		return getCoverUnit(this, t[0], t[1]);
	}
	__strengthen_extent() {
		const t = this.ab[AB_STRENGTHEN];
		return t ? t[1] : 0;
	}
	__lethal_prob() {
		return this.ab[AB_LETHAL] || 0;
	}
	__savage_extent() {
		const t = this.ab[AB_S];
		return t ? t[1] : 0;
	}
	__savage_prob() {
		const t = this.ab[AB_S];
		return t ? t[0] : 0;
	}
}

class CatForm extends Unit {
	constructor(props = {}) {
		super();
		// make non-structured-cloneable by setting enumerable=false
		Object.defineProperties(this, {
			base: {value: props.base},
			env: {value: props.env ?? catEnv, writable: true, configurable: true},
			info: {value: props.info, enumerable: true},
			hpM: {value: props.hpM ?? 1, writable: true, configurable: true, enumerable: true},
			atkM: {value: props.atkM ?? 1, writable: true, configurable: true, enumerable: true},
			_baseLv: {value: props._baseLv ?? 1, writable: true, configurable: true, enumerable: true},
			_plusLv: {value: props._plusLv ?? 0, writable: true, configurable: true, enumerable: true},
		});
	}
	clone() {
		return new this.constructor(Object.assign({
			base: this.base,
			env: this.env,
		}, structuredClone(this)));
	}
	get id() {
		return this.base.id;
	}
	get lvc() {
		return this.info.lvc;
	}
	get price() {
		return 1.5 * this.info.price;
	}
	set price(value) {
		this.info.price = value;
	}
	get hp() {
		return ~~(~~(round(this.info.hp * this.getLevelMulti()) * this.env.hp_t) * this.hpM);
	}

	hpAgainst(traits) {
		return this._getthp({traits});
	}

	get speed() {
		return super.speed;
	}
	set speed(value) {
		this.info.speed = value;
	}
	get tba() {
		return super.tba;
	}
	set tba(value) {
		this.info.tba = value;
	}
	get attackF() {
		return super.attackF;
	}
	set attackF(value) {
		this.info.attackF = value;
	}
	get trait() {
		return super.trait;
	}
	set trait(value) {
		this.info.trait = value;
	}
	get imu() {
		return super.imu;
	}
	set imu(value) {
		this.info.imu = value;
	}
	get ab() {
		return super.ab;
	}
	set ab(value) {
		this.info.ab = value;
	}
	get cd() {
		return Math.max(60, this.info.cd - this.env.cd_r - this.env.cd_t);
	}
	set cd(value) {
		this.info.cd = value;
	}
	get icon() {
		const eggId = this.base.eid?.[this.lvc];
		return (typeof eggId !== 'undefined') ?
			`/img/s/${eggId}/${this.lvc}.png` :
			`/img/u/${this.id}/${this.lvc}.png`;
	}
	get baseLv() {
		return this._baseLv;
	}
	set baseLv(value) {
		this._baseLv = Math.max(Math.min(value, this.base.maxBaseLv), 1);
	}
	get plusLv() {
		return this._plusLv;
	}
	set plusLv(value) {
		this._plusLv = Math.max(Math.min(value, this.base.maxPlusLv), 0);
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

	dpsAgainst(traits) {
		const atkm = this._gettatks({traits, mode: 'expected'}).reduce((rv, x) => rv + x);
		return 30 * atkm / this.attackF;
	}

	get talents() {
		return this.base.talents;
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
				t = this.ab[AB_STRENGTHEN];
				x = t ? t[0] : (100 - inc1); // HP Trigger
				y = inc2 + (t ? t[1] : 0); // attack
				this.ab[AB_STRENGTHEN] = [x, y];
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
				this.price = this.info.price - inc1;
				break;

			case 26:
				this.cd = this.info.cd - inc1;
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
				this.imu |= IMU_TOXIC;
				break;

			case 54:
				this.res[RES_SURGE] = inc1;
				break;

			case 55:
				this.imu |= IMU_SURGE;
				break;

			case 56:
				t = this.ab[AB_SURGE];
				x = inc1 + (t ? t[0] : 0); // chance
				y = inc2 + (t ? t[3] : 0); // level
				z = inc3 >> 2;
				this.ab[AB_SURGE] = [x, z, z + (inc4 >> 2), y];
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
				t = this.ab[AB_MINISURGE];
				x = inc1 + (t ? t[0] : 0); // chance
				y = inc2 + (t ? t[3] : 0); // level
				z = inc3 >> 2;
				this.ab[AB_MINISURGE] = [x, z, z + (inc4 >> 2), y];
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

	__hasres(r) {
		return this.res && this.res.hasOwnProperty(r) || false;
	}
	__max_base_lv() {
		return this.base.maxBaseLv;
	}
	__max_plus_lv() {
		return this.base.maxPlusLv;
	}
	__weak_time() {
		const t = this.ab[AB_WEAK];
		return t ? t[2] : 0;
	}
	__weak_extent() {
		const t = this.ab[AB_WEAK];
		return t ? t[1] : 0;
	}
	__break_prob() {
		const t = this.ab[AB_BREAK];
		return t ? t[0] : 0;
	}
	__shield_break_prob() {
		const t = this.ab[AB_SHIELDBREAK];
		return t ? t[0] : 0;
	}
	__formc() {
		return this.lvc + 1;
	}
	__maxformc() {
		return this.base.forms.length;
	}
	__rarity() {
		return this.base.rarity;
	}
	__beast_prob() {
		const t = this.ab[AB_BSTHUNT];
		return t ? t[0] : 0;
	}
	__beast_time() {
		const t = this.ab[AB_BSTHUNT];
		return t ? t[1] : 0;
	}
	__stop_cover() {
		const t = this.ab[AB_STOP];
		if (!t) return 0;
		return getCoverUnit(this, t[0], (this.trait & trait_treasure) ? ~~(t[1] * 1.2) : t[1]);
	}
	__slow_cover() {
		const t = this.ab[AB_SLOW];
		if (!t) return 0;
		return getCoverUnit(this, t[0], (this.trait & trait_treasure) ? ~~(t[1] * 1.2) : t[1]);
	}
	__weak_cover() {
		const t = this.ab[AB_WEAK];
		if (!t) return 0;
		return getCoverUnit(this, t[0], (this.trait & trait_treasure) ? ~~(t[2] * 1.2) : t[2]);
	}
	__curse_cover() {
		const t = this.ab[AB_CURSE];
		if (!t) return 0;
		return getCoverUnit(this, t[0], (this.trait & trait_treasure) ? ~~(t[1] * 1.2) : t[1]);
	}
	__hpagainst(traits) {
		return this.hpAgainst(traits);
	}
	__dpsagainst(traits) {
		return this.dpsAgainst(traits);
	}
	__evol4_require(x) {
		if (!this.base.evol4Req) return 0;
		x = x.toString();
		for (let r of this.base.evol4Req.split('|')) {
			r = r.split('!');
			if (r[1] == x)
				return parseInt(r[0]);
		}
		return 0;
	}
	__evol_require(x) {
		if (!this.base.evolReq) return 0;
		x = x.toString();
		for (let r of this.base.evolReq.split('|')) {
			r = r.split('!');
			if (r[1] == x)
				return parseInt(r[0]);
		}
		return 0;
	}
	_getatks(i) {
		const m = this.getLevelMulti();

		let atks = this._atks;

		atks = (typeof i !== 'undefined') ? [atks[i]] : atks.filter((x, i) => !i || x);

		atks = atks.map(atk => {
			return ~~(~~(round(atk * m) * this.env.atk_t) * this.atkM);
		});

		return (typeof i !== 'undefined') ? atks[0] : atks;
	}

	/**
	 * Calculate ability-boosted HP.
	 *
	 * @param {Object} [options]
	 * @param {integer} [options.traits] - the traits of the attacker; omit for
	 *     general case.
	 * @param {AbilityFilter} [options.filter] - the ability data filter.
	 * @return {number} the boosted HP
	 */
	_getthp({
		traits,
		filter: abFilter,
	} = {}) {
		traits = traits ?? ~0;
		const ab = this._getab(abFilter);
		let hp = this.hp;
		if ((traits & TB_WITCH) && ab.hasOwnProperty(AB_WKILL))
			return hp * 10;
		if ((traits & TB_EVA) && ab.hasOwnProperty(AB_EKILL))
			return hp * 5;
		const t = this.trait & traits;
		if (t) {
			const x = t & trait_treasure;
			if (ab.hasOwnProperty(AB_RESIST)) {
				hp *= x ? 5 : 4;
			} else if (ab.hasOwnProperty(AB_RESISTS)) {
				hp *= x ? 7 : 6;
			}
			if (ab.hasOwnProperty(AB_GOOD)) {
				hp *= x ? 2.5 : 2;
			}
		}
		if ((traits & TB_BEAST) && ab.hasOwnProperty(AB_BSTHUNT)) {
			hp /= 0.6;
		} else if ((traits & TB_BARON) && ab.hasOwnProperty(AB_BAIL)) {
			hp /= 0.7;
		} else if ((traits & TB_SAGE) && ab.hasOwnProperty(AB_SAGE)) {
			hp /= 0.5;
		}
		return hp;
	}

	/**
	 * Calculate ability-boosted attack damages.
	 *
	 * @param {Object} [options]
	 * @param {integer} [options.traits] - the traits of the target; omit for
	 *     general case.
	 * @param {AbilityFilter} [options.filter] - the ability data filter.
	 * @param {string} [options.mode=expected] - the calculation mode:
	 *     "expected" for expected damage;
	 *     "max" for maximal possible damage.
	 * @param {boolean} [options.metal=true] - treat non-critical attack as 1
	 *     damage for a metal enemy.
	 * @return {number[]} the boosted attack damages
	 */
	_gettatks({
		traits,
		filter: abFilter,
		mode = 'expected',
		metal: metalMode = true,
	} = {}) {
		traits = traits ?? ~0 ^ (metalMode ? TB_METAL : 0);

		const ab = this._getab(abFilter);
		const isBase = traits === 0;
		const isMetal = traits & TB_METAL;
		let v;

		return this._getatks().map((atk, idx) => {
			if (ab.hasOwnProperty(AB_ONLY) && !(this.trait & traits) && !isBase) {
				return 0;
			}

			if (this.abEnabled(idx)) {
				if (ab.hasOwnProperty(AB_SURGE)) {
					v = ab[AB_SURGE];
					if (mode === 'max')
						atk *= 1 + v[3];
					else
						atk *= 1 + v[3] * v[0] / 100;
				} else if (ab.hasOwnProperty(AB_MINISURGE)) {
					v = ab[AB_MINISURGE];
					if (mode === 'max')
						atk *= 1 + v[3] * 0.2;
					else
						atk *= 1 + v[3] * v[0] / 500;
				}

				if (!isBase && ab.hasOwnProperty(AB_WAVE)) {
					if (mode === 'max')
						atk *= 2;
					else
						atk *= 1 + ab[AB_WAVE][0] / 100;
				} else if (!isBase && ab.hasOwnProperty(AB_MINIWAVE)) {
					if (mode === 'max')
						atk *= 1.2;
					else
						atk *= 1 + ab[AB_MINIWAVE][0] / 500;
				}

				if (ab.hasOwnProperty(AB_S)) {
					v = ab[AB_S];
					if (mode === 'max')
						atk *= 1 + v[1] / 100;
					else
						atk *= 1 + v[1] * v[0] / 10000;
				}

				// handle metal case specially at last
				if (ab.hasOwnProperty(AB_CRIT) && !(metalMode && isMetal)) {
					if (mode === 'max')
						atk *= 2;
					else
						atk *= 1 + ab[AB_CRIT] / 100;
				}
			}

			if (ab.hasOwnProperty(AB_STRENGTHEN)) {
				atk *= 1 + ab[AB_STRENGTHEN][1] / 100;
			}

			if (isBase && ab.hasOwnProperty(AB_ATKBASE)) {
				atk *= 4;
				return atk;
			}
			if ((traits & TB_EVA) && ab.hasOwnProperty(AB_EKILL)) {
				atk *= 5;
				return atk;
			}
			if ((traits & TB_WITCH) && ab.hasOwnProperty(AB_WKILL)) {
				atk *= 5;
				return atk;
			}

			const t = this.trait & traits;
			if (t) {
				const x = t & trait_treasure;
				if (ab.hasOwnProperty(AB_MASSIVE)) {
					atk *= x ? 4 : 3;
				} else if (ab.hasOwnProperty(AB_MASSIVES)) {
					atk *= x ? 6 : 5;
				}
				if (ab.hasOwnProperty(AB_GOOD)) {
					atk *= x ? 1.8 : 1.5;
				}
			}

			if ((traits & TB_BEAST) && ab.hasOwnProperty(AB_BSTHUNT)) {
				atk *= 2.5;
			} else if ((traits & TB_BARON) && ab.hasOwnProperty(AB_BAIL)) {
				atk *= 1.6;
			} else if ((traits & TB_SAGE) && ab.hasOwnProperty(AB_SAGE)) {
				atk *= 1.2;
			}

			if (metalMode && isMetal) {
				const critRate = ab[AB_CRIT] ?? 0;
				const rate = this.abEnabled(idx) ? critRate / 100 : 0;
				const nonCritDmg = (() => {
					let rv = 1;
					if (this.abEnabled(idx)) {
						if (v = ab[AB_SURGE] || ab[AB_MINISURGE]) {
							rv += (mode === 'max') ? v[3] : v[3] * v[0] / 100;
						}
						if (v = ab[AB_WAVE] || ab[AB_MINIWAVE]) {
							rv += (mode === 'max') ? 1 : v[0] / 100;
						}
					}
					return rv;
				})();
				if (mode === 'max')
					return rate ? 2 * atk : nonCritDmg;
				else
					return (2 * atk * rate) + (nonCritDmg * (1 - rate));
			}

			return atk;
		});
	}
	__price() {
		return this.price;
	}
	__cost() {
		return this.price;
	}
	__cdf() {
		return this.cd;
	}
	__cd() {
		return this.cd / 30;
	}
}

class Enemy extends Unit {
	constructor(o, props = {}) {
		super();
		// make non-structured-cloneable by setting enumerable=false
		Object.defineProperties(this, {
			env: {value: props.env ?? catEnv, writable: true, configurable: true},
			info: {value: o, enumerable: true},
			hpM: {value: props.hpM ?? 1, writable: true, configurable: true, enumerable: true},
			atkM: {value: props.atkM ?? 1, writable: true, configurable: true, enumerable: true},
			stageM: {value: props.stageM ?? 1, writable: true, configurable: true, enumerable: true},
		});
	}
	get fandom() {
		return this.info.fandom;
	}
	get earn() {
		return round(this.info.earn * (1 + this.env.earn_r + this.env.earn_t), 2);
	}
	get star() {
		return this.info.star;
	}
	get icon() {
		return `/img/e/${this.id}/0.png`;
	}
	get animUrl() {
		const value = `/anim.html?id=${-(this.id + 1)}`;
		Object.defineProperty(this, 'animUrl', {value});
		return value;
	}
	get bcdbUrl() {
		const value = `https://battlecats-db.com/enemy/${(this.id + 2).toString().padStart(3, '0')}.html`;
		Object.defineProperty(this, 'bcdbUrl', {value});
		return value;
	}
	get fandomUrl() {
		const value = `https://battle-cats.fandom.com/wiki/${this.fandom}`;
		Object.defineProperty(this, 'fandomUrl', {value});
		return value;
	}
	get alienMag() {
		if (this.trait & TB_ALIEN)
			return (this.star === 1) ? this.env.alien_star_t : this.env.alien_t;

		if (this.star === 2)
			return this.env.god1_t;

		if (this.star === 3)
			return this.env.god2_t;

		if (this.star === 4)
			return this.env.god3_t;
	}

	__cost() {
		return this.earn;
	}
	__price() {
		return this.earn;
	}
}

class Cat {
	constructor(o) {
		this.i = o.i;
		this.info = o.info;
		this.forms = o.forms.map(form => {
			return new CatForm({base: this, info: form});
		});

		// parse data for easier future usage
		if (this.info.talents)
			this.info.talents = new Int16Array(this.info.talents.split('|'));
	}

	get id() {
		return this.i;
	}

	get rarity() {
		return this.info.rarity;
	}

	get ver() {
		return this.info.ver;
	}

	get obtn() {
		return this.info.obtn;
	}

	get evol() {
		return this.info.evol;
	}

	get obtnStage() {
		return this.info.obtnStage;
	}

	get evolStage() {
		return this.info.evolStage;
	}

	get evolReq() {
		return this.info.evolReq;
	}

	get evol4Req() {
		return this.info.evol4Req;
	}

	get evolDesc() {
		return this.info.evolDesc;
	}

	get evol4Desc() {
		return this.info.evol4Desc;
	}

	get orbs() {
		return this.info.orbs;
	}

	get eid() {
		return this.info.eid;
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

	get talents() {
		return this.info.talents;
	}

	get animUrl() {
		const value = `/anim.html?id=${this.id}`;
		Object.defineProperty(this, 'animUrl', {value});
		return value;
	}
	get bcdbUrl() {
		const value = `https://battlecats-db.com/unit/${(this.id + 1).toString().padStart(3, '0')}.html`;
		Object.defineProperty(this, 'bcdbUrl', {value});
		return value;
	}
	get udpUrl() {
		const value = `https://thanksfeanor.pythonanywhere.com/UDP/${this.id.toString().padStart(3, '0')}`;
		Object.defineProperty(this, 'udpUrl', {value});
		return value;
	}
	get fandomUrl() {
		const value = `https://battle-cats.fandom.com/wiki/${this.info.fandom}`;
		Object.defineProperty(this, 'fandomUrl', {value});
		return value;
	}
}

async function getAllEnemies() {
	const response = await fetch('/enemy.json');
	return await response.json();
}

async function getAllCats() {
	const response = await fetch('/cat.json');
	return await response.json();
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
				return new Cat(cats[id]);
			else
				return cats.map(e => new Cat(e));
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
				return new Enemy(enemies[id]);
			else
				return enemies.map(e => new Enemy(e));
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

const catEnv = new CatEnv({
	treasures: config.getTreasures(),
});

export {
	DB_NAME,
	DB_VERSION,

	ATK_SINGLE,
	ATK_RANGE,
	ATK_LD,
	ATK_OMNI,
	ATK_KB_REVENGE,

	TB_RED,
	TB_FLOAT,
	TB_BLACK,
	TB_METAL,
	TB_ANGEL,
	TB_ALIEN,
	TB_ZOMBIE,
	TB_RELIC,
	TB_WHITE,
	TB_EVA,
	TB_WITCH,
	TB_DEMON,
	TB_INFN,
	TB_BEAST,
	TB_BARON,
	TB_SAGE,
	trait_no_treasure,
	trait_treasure,

	AB_STRENGTHEN,
	AB_LETHAL,
	AB_ATKBASE,
	AB_CRIT,
	AB_ZKILL,
	AB_CKILL,
	AB_BREAK,
	AB_SHIELDBREAK,
	AB_S,
	AB_BOUNTY,
	AB_METALIC,
	AB_MINIWAVE,
	AB_WAVE,
	AB_MINISURGE,
	AB_SURGE,
	AB_WAVES,
	AB_BAIL,
	AB_BSTHUNT,
	AB_WKILL,
	AB_EKILL,
	AB_WEAK,
	AB_STOP,
	AB_SLOW,
	AB_ONLY,
	AB_GOOD,
	AB_RESIST,
	AB_RESISTS,
	AB_MASSIVE,
	AB_MASSIVES,
	AB_KB,
	AB_WARP,
	AB_IMUATK,
	AB_CURSE,
	AB_BURROW,
	AB_REVIVE,
	AB_POIATK,
	AB_SUICIDE,
	AB_BARRIER,
	AB_DSHIELD,
	AB_COUNTER,
	AB_DEATHSURGE,
	AB_SAGE,
	AB_SUMMON,
	AB_MK,

	RES_WEAK,
	RES_STOP,
	RES_SLOW,
	RES_KB,
	RES_WAVE,
	RES_SURGE,
	RES_CURSE,
	RES_TOXIC,
	RES_WARP,

	IMU_WAVE,
	IMU_STOP,
	IMU_SLOW,
	IMU_KB,
	IMU_SURGE,
	IMU_WEAK,
	IMU_WARP,
	IMU_CURSE,
	IMU_TOXIC,
	IMU_BOSSWAVE,

	units_scheme,
	catEnv,

	get_trait_short_names,
	getAbiString,

	getCoverUnit,
	getCoverUnitStr,

	createTraitIcons,
	createImuIcons,
	createResIcons,

	CatEnv,
	Cat,
	CatForm,
	Enemy,

	loadCat,
	loadAllCats,
	loadEnemy,
	loadAllEnemies,
};
