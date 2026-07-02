import {config, numStr, numStrT} from './common.mjs';
import {
	ATK_RANGE,
	ATK_LD,
	ATK_OMNI,
	ATK_KB_REVENGE,

	TB_RED,
	TB_FLOAT,
	TB_METAL,
	TB_BLACK,
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
	TB_KAIJIN,

	AB_STRENGTHEN,
	AB_SURVIVE,
	AB_ATKBASE,
	AB_CRIT,
	AB_SAVAGE,
	AB_MINIWAVE,
	AB_WAVE,
	AB_MINISURGE,
	AB_SURGE,
	AB_WAVES,
	AB_WEAK,
	AB_STOP,
	AB_SLOW,
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
	AB_EXPLOSION,
	AB_DRAIN,

	getAbiString,

	getCoverUnitStr,

	createImuIcons,
} from './unit.mjs';


class EnemyStatsTable {
	/**
	 * Interactive enemy stats table
	 *
	 * @param {Object} [options]
	 * @param {Enemy} [options.enemy] - the taregt enemy
	 * @param {boolean} [options.setTitle=false] - whether to set document.title
	 * @param {number} [options.stageMult=100] - stage multiplier
	 * @param {number} [options.stageAtkMult=100] - stage attack multiplier
	 * @param {number} [options.stageCrownMult=100] - stage crown multiplier
	 */
	constructor({enemy, setTitle = false, stageMult = 100, stageAtkMult = 100, stageCrownMult = 100}) {
		this.enemy = enemy;
		this.mult = stageMult;
		this.stageAtkMult = stageAtkMult;
		this.stageCrownMult = stageCrownMult;

		this.multEl = document.getElementById('enemy-mult');
		this.stageAtkMultEl = document.getElementById('enemy-mult-atk');
		this.stageCrownMultiEl = document.getElementById('enemy-st-mag');
		this.enemyStatsBody = document.getElementById('enemy-stats').children;
		this.specialsEl = this.enemyStatsBody[3].children[1];

		this.demonShieldEl = undefined;
		this.abilityNo = undefined;
		this.set = new Set();
		this.handleClickBind = EnemyStatsTable.handleClick.bind(this);

		this.render(setTitle);
	}

	static handleClick(event) {
		const target = event.currentTarget;
		event.preventDefault();
		event.stopPropagation();
		if (target.dataset.selected === '1') {
			target.style.removeProperty('background-color');
			target.dataset.selected = '0';
			this.set.delete(target.dataset.abNo);
		} else {
			target.style.setProperty('background-color', '#5cabd273', 'important');
			target.dataset.selected = '1';
			this.set.add(target.dataset.abNo);
		}
		this.calc();
	}

	static handleKeyDown(event) {
		if (event.code == 'Enter' || event.code == 'NumpadEnter') {
			event.preventDefault();
			this.blur();
		}
	}

	static handleFocus() {
		this.focus();
		const s = window.getSelection();
		const r = document.createRange();
		r.selectNodeContents(this);
		s.removeAllRanges();
		s.addRange(r);
	}

	addAbilityInteract(s) {
		const p = document.createElement('div');
		p.style.cursor = 'pointer';
		const U = new Image(40, 40);
		U.src = `/img/i/a/${this.abilityNo}.png`;
		p.appendChild(U);
		p.append(s);
		p.dataset.abNo = this.abilityNo;
		p.dataset.selected = '0';
		p.addEventListener('click', this.handleClickBind);
		this.specialsEl.appendChild(p);
	}

	addAbility(s, img) {
		const p = document.createElement('div');
		const i = document.createElement('img');
		i.src = img || `/img/i/a/${this.abilityNo}.png`;
		p.appendChild(i);
		p.append(s);
		this.specialsEl.appendChild(p);
	}

	createAbIcons() {
		createImuIcons(this.enemy.imu, this.specialsEl);
		let U = this.enemy.pre1 ? '*' : '';
		if (this.enemy.trait & TB_SAGE) {
			this.addAbility(`超賢者：減輕 70% 受到的妨害效果 `, `/img/i/e/15.png`);
		}
		for (const [i, d] of Object.entries(this.enemy.ab)) {
			switch (this.abilityNo = parseInt(i, 10)) {
				case AB_KB:
					this.addAbility(`${d[0]} % 打飛敵人${U}至 165 距離單位外，持續 ${numStrT(12)}`);
					break;
				case AB_STOP:
					this.addAbility(`${d[0]} % 使動作停止${U}持續 ${numStrT(d[1])}，控場覆蓋率 ${getCoverUnitStr(this.enemy, d[0], d[1])} %`);
					break;
				case AB_SLOW:
					this.addAbility(`${d[0]} % 使動作變慢${U}持續 ${numStrT(d[1])}，控場覆蓋率 ${getCoverUnitStr(this.enemy, d[0], d[1])} %`);
					break;
				case AB_CRIT:
					this.addAbilityInteract(`${d} % 會心一擊${U}`);
					break;
				case AB_ATKBASE:
					this.addAbilityInteract(`善於攻城（攻擊傷害 × 4）`);
					break;
				case AB_WAVE:
					this.addAbilityInteract(`${d[0]} % 發射 Lv${d[1]} 波動${U}（射程 ${267.5 + d[1]*200}）`);
					break;
				case AB_MINIWAVE:
					this.addAbilityInteract(`${d[0]} % 發射 Lv${d[1]} 小波動${U}（射程 ${267.5 + d[1]*200}）`);
					break;
				case AB_WEAK:
					this.addAbility(`${d[0]} % 降低攻擊力${U}至 ${d[1]} % 持續 ${numStrT(d[2])}，控場覆蓋率 ${getCoverUnitStr(this.enemy, d[0], d[2])} %`);
					break;
				case AB_STRENGTHEN:
					this.addAbilityInteract(`體力 ${d[0]} % 以下時攻擊力上升至 ${100 + d[1]} %`);
					break;
				case AB_SURVIVE:
					this.addAbility(`${d} % 死前存活（遭到致命的攻擊時以1體力存活1次）`);
					break;
				case AB_WAVES:
					this.addAbility(`波動滅止`);
					break;
				case AB_BURROW:
					this.addAbility(`進入射程範圍時鑽地 ${numStr(d[1])} 距離（${d[0] == -1 ? '無限' : d[0].toString() + ' '}次）`);
					break;
				case AB_REVIVE:
					this.addAbility(`擊倒後 ${numStrT(d[1])} 以 ${d[2]} % 體力復活（${d[0] == -1 ? '無限' : d[0].toString() + ' '}次）`);
					break;
				case AB_WARP:
					this.addAbility(`${d[0]} % 將目標向${d[2] < 0 ? '前' : '後'}傳送${U} ${Math.abs(d[2])} 距離持續 ${numStrT(d[1])}`);
					break;
				case AB_CURSE:
					this.addAbility(`${d[0]} % 詛咒${U}持續 ${numStrT(d[1])}，控場覆蓋率 ${getCoverUnitStr(this.enemy, d[0], d[1])} %`);
					break;
				case AB_SAVAGE:
					this.addAbilityInteract(`${d[0]} % 渾身一擊${U}（攻擊力增加至 ${100 + d[1]} %）`);
					break;
				case AB_IMUATK:
					this.addAbility(`${d[0]} % 發動攻擊無效持續 ${numStrT(d[1])}`);
					break;
				case AB_SUICIDE:
					this.addAbility('一次攻擊');
					break;
				case AB_BARRIER:
					this.addAbility(`護盾 ${numStr(d[0])} HP`);
					break;
				case AB_DSHIELD: {
					let p = document.createElement('div');
					p.style.cursor = 'pointer';
					let U = new Image(40, 40);
					U.src = '/img/i/a/39.png';
					p.appendChild(U);
					this.demonShieldEl = document.createElement('span');
					this.demonShieldEl.textContent = ~~(Math.round(d[0] * (this.mult / 100)) * (this.stageCrownMult / 100));
					p.append('惡魔盾 ');
					p.appendChild(this.demonShieldEl);
					p.append(` HP，KB時惡魔盾恢復 ${d[1]} %`);
					p.dataset.abNo = this.abilityNo;
					p.dataset.selected = '0';
					p.addEventListener('click', this.handleClickBind);
					this.specialsEl.appendChild(p);
				}
				break;
				case AB_COUNTER:
					this.addAbility('烈波反擊');
					break;
				case AB_DEATHSURGE:
					this.addAbility(`死後 ${d[0]} % 發射 Lv${d[3]}烈波（範圍 ${d[1]}～${d[2]}，持續 ${numStrT(d[3]*20)}）`);
					break;
				case AB_POIATK:
					this.addAbility(`${d[0]} % 毒擊（造成角色最大生命值 ${(d[1])} % 的傷害）`);
					break;
				case AB_SURGE:
					this.addAbilityInteract(`${d[0]} % 發射 Lv${d[3]} 烈波（出現位置 ${d[1]}～${d[2]}，持續 ${numStrT(d[3]*20)}）`);
					break;
				case AB_MINISURGE:
					this.addAbilityInteract(`${d[0]} % 發射 Lv${d[3]} 小烈波（出現位置 ${d[1]}～${d[2]}，持續 ${numStrT(d[3]*20)}）`);
					break;
				case AB_EXPLOSION:
					this.addAbilityInteract(d[1] != d[2] ? `${d[0]}% 發出爆波（發生位置：${d[1]}～${d[2]}）` : `${d[0]}% 發出爆波（發生位置：${d[1]}）`);
					break;
				case AB_DRAIN:
					this.addAbility(`${d[0]} % 遲緩（令受擊角色減少 ${d[1]} % 已恢復之生產進度）`);
					break;
			}
		}
	}

	calc() {
		this.enemy.hpM = this.mult / 100;
		this.enemy.atkM = this.stageAtkMult / 100;
		this.enemy.stageM = this.stageCrownMult / 100;
		const filter = Array.from(this.set);
		const isBase = this.set.has(AB_ATKBASE);
		const tatks = this.enemy.gettatks({filter, mode: 'max', isBase});
		const DPS = 30 * this.enemy.gettatks({filter, mode: 'expected', isBase}).reduce((rv, x) => rv + x) / this.enemy.attackF;
		const HP = this.enemy.getthp({filter});

		if (this.enemy.ab[AB_DSHIELD]) {
			if (this.demonShieldEl) {
				this.demonShieldEl.textContent = ~~(Math.round(this.enemy.ab[AB_DSHIELD][0] * this.enemy.hpM) * this.enemy.stageM);
			}
		}
		this.enemyStatsBody[0].children[2].textContent = numStr(HP);
		this.enemyStatsBody[0].children[4].textContent = tatks.map(numStr).join('/');
		this.enemyStatsBody[1].children[3].textContent = numStr(DPS);
	}

	render(setTitle) {
		this.specialsEl.textContent = '';
		this.set.clear();
		this.multEl.textContent = `倍率:${this.mult}%`;
		this.stageAtkMultEl.textContent = `攻擊倍率:${this.stageAtkMult}%`;
		this.stageCrownMultiEl.textContent = `★倍率:${this.stageCrownMult}%`;
		const title = [this.enemy.name, this.enemy.jpName].filter(x => x).join('/') || '?';
		if (setTitle) {
			document.title = title;
		}
		document.getElementById('enemy-id').textContent = title;
		const traits = [];
		if (this.enemy.trait & TB_RED)
			traits.push('紅色敵人');
		if (this.enemy.trait & TB_FLOAT)
			traits.push('漂浮敵人');
		if (this.enemy.trait & TB_BLACK)
			traits.push('黑色敵人');
		if (this.enemy.trait & TB_METAL)
			traits.push('鋼鐵敵人');
		if (this.enemy.trait & TB_ANGEL)
			traits.push('天使敵人');
		if (this.enemy.trait & TB_ALIEN) {
			if (this.enemy.star == 1)
				traits.push('異星戰士（有星星）');
			else
				traits.push('異星戰士');
		}
		if (this.enemy.trait & TB_ZOMBIE)
			traits.push('不死生物');
		if (this.enemy.trait & TB_RELIC)
			traits.push('古代種');
		if (this.enemy.trait & TB_WHITE)
			traits.push('無屬性敵人');
		if (this.enemy.trait & TB_EVA)
			traits.push('使徒');
		if (this.enemy.trait & TB_WITCH)
			traits.push('魔女');
		if (this.enemy.trait & TB_DEMON)
			traits.push('惡魔');
		if (this.enemy.trait & TB_BEAST)
			traits.push('超獸');
		if (this.enemy.trait & TB_BARON)
			traits.push('超生命體');
		if (this.enemy.trait & TB_INFN)
			traits.push('道場塔');
		if (this.enemy.trait & TB_SAGE)
			traits.push('超賢者');
		if (this.enemy.trait & TB_KAIJIN)
			traits.push('怪人');
		this.enemyStatsBody[0].children[8].textContent = traits.join('・');
		if (this.enemy.info.atk1 || this.enemy.info.atk2) {
			const atkNum = this.enemy.info.atk2 ? 3 : 2;
			const atksPre = [this.enemy.info.atk, this.enemy.info.atk1, this.enemy.info.atk2].slice(0, atkNum).map(x => numStr((x / (this.enemy.info.atk + this.enemy.info.atk1 + this.enemy.info.atk2)) * 100) + ' %');
			this.specialsEl.append(`${atkNum}回連續攻擊（傷害 ${atksPre.join(' / ')}）` + getAbiString(this.enemy.abi));
			this.specialsEl.appendChild(document.createElement('br'));
		}
		let X = '';
		if (this.enemy.atkType & ATK_OMNI)
			X += '全方位';
		else if (this.enemy.atkType & ATK_LD)
			X += '遠方';
		X += (this.enemy.atkType & ATK_RANGE) ? '範圍攻擊' : '單體攻擊';
		if (this.enemy.atkType & ATK_KB_REVENGE)
			X += '・擊退反擊';
		if (this.enemy.lds) {
			const nums = '①②③';
			let s = '';
			for (let i = 0; i < this.enemy.lds.length; ++i) {
				const x = this.enemy.lds[i];
				const y = x + this.enemy.ldr[i];
				if (x <= y)
					s += `${nums[i]}${x}～${y}`;
				else
					s += `${nums[i]}${y}～${x}`;
			}
			X += `・範圍 ${s}`;
		}
		if (this.enemy.atkType & ATK_RANGE) {
			const s = new Image(40, 40);
			s.src = '/img/i/o/0.png';
			this.specialsEl.appendChild(s);
		} else {
			const s = new Image(40, 40);
			s.src = '/img/i/o/1.png';
			this.specialsEl.appendChild(s);
		}
		if (this.enemy.atkType & ATK_LD) {
			const s = new Image(40, 40);
			s.src = '/img/i/o/2.png';
			this.specialsEl.appendChild(s);
		}
		if (this.enemy.atkType & ATK_OMNI) {
			const s = new Image(40, 40);
			s.src = '/img/i/o/3.png';
			this.specialsEl.appendChild(s);
		}
		if (this.enemy.atkType & ATK_KB_REVENGE) {
			const s = new Image(40, 40);
			s.src = '/img/i/o/4.png';
			this.specialsEl.appendChild(s);
		}
		this.specialsEl.append(X);
		this.specialsEl.appendChild(document.createElement('br'));
		X = this.enemyStatsBody[0].children[0].children[0];
		X.src = this.enemy.icon;
		this.enemyStatsBody[2].children[3].textContent = numStrT(this.enemy.backswing);
		this.enemyStatsBody[2].children[5].textContent = numStrT(this.enemy.tba);
		this.enemyStatsBody[2].children[7].textContent = numStrT(this.enemy.attackF);
		this.enemyStatsBody[1].children[5].textContent = this.enemy.range;
		this.enemyStatsBody[1].children[7].textContent = this.enemy.earn;
		if (config.unit === 'F')
			this.enemyStatsBody[2].children[1].textContent = [this.enemy.pre, this.enemy.pre1, this.enemy.pre2].filter(x => x).map(numStr).join('/') + ' F';
		else
			this.enemyStatsBody[2].children[1].textContent = [this.enemy.pre, this.enemy.pre1, this.enemy.pre2].filter(x => x).map(x => numStr(x / 30)).join('/') + ' 秒';
		this.enemyStatsBody[0].children[6].textContent = this.enemy.speed;
		this.enemyStatsBody[1].children[1].textContent = this.enemy.kb;
		this.calc();
		X = this.enemyStatsBody[4].children[1];
		X.textContent = '';
		for (const s of this.enemy.desc.split('|')) {
			X.append(s);
			X.appendChild(document.createElement('br'));
		}
		this.createAbIcons();
		this.multEl.addEventListener('focus', EnemyStatsTable.handleFocus);
		this.multEl.addEventListener('keydown', EnemyStatsTable.handleKeyDown);
		const self = this;
		this.multEl.addEventListener('blur', function() {
			let num = self.multEl.textContent.match(/\d+/);
			if (num) {
				self.stageAtkMult = self.mult = parseInt(num[0]);
				self.stageAtkMultEl.textContent = `攻擊倍率:${self.stageAtkMult}%`;
				self.multEl.textContent = `倍率:${self.mult}%`;
				self.calc();
			}
			self.multEl.textContent = `倍率:${self.mult}%`;
		});
		this.stageAtkMultEl.addEventListener('focus', EnemyStatsTable.handleFocus);
		this.stageAtkMultEl.addEventListener('keydown', EnemyStatsTable.handleKeyDown);
		this.stageAtkMultEl.addEventListener('blur', function() {
			let num = self.stageAtkMultEl.textContent.match(/\d+/);
			if (num) {
				self.stageAtkMult = parseInt(num[0]);
				self.calc();
			}
			self.stageAtkMultEl.textContent = `攻擊倍率:${self.stageAtkMult}%`;
		});
		this.stageCrownMultiEl.addEventListener('focus', EnemyStatsTable.handleFocus);
		this.stageCrownMultiEl.addEventListener('keydown', EnemyStatsTable.handleKeyDown);
		this.stageCrownMultiEl.addEventListener('blur', function() {
			let num = self.stageCrownMultiEl.textContent.match(/\d+/);
			if (num) {
				self.stageCrownMult = parseInt(num[0]);
				self.calc();
			}
			self.stageCrownMultiEl.textContent = `★倍率:${self.stageCrownMult}%`;
		});
	}
}


export {
	EnemyStatsTable,
};
