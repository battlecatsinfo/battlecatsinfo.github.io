import {
	config,
	numStr,
	numStrT,
	displayRange,
	displaySpeed,
} from './common.mjs';
import {
	MULTI_AB,

	ATK_RANGE,
	ATK_LD,
	ATK_OMNI,
	ATK_KB_REVENGE,

	TB_ALIEN,
	TB_SAGE,
	TB_LAST,

	AB_ATKBASE,
	AB_DSHIELD,

	getAbiString,

	units_scheme,
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

	addAbilityInteract(obj) {
		const p = document.createElement('div');
		p.style.cursor = 'pointer';
		const U = new Image(40, 40);
		U.src = `/img/i/a/${obj.abNo}.png`;
		p.appendChild(U);
		p.append(obj.text);
		p.dataset.abNo = obj.abNo;
		p.dataset.selected = '0';
		p.addEventListener('click', this.handleClickBind);
		this.specialsEl.appendChild(p);
	}

	addAbility(obj, img) {
		const p = document.createElement('div');
		const i = document.createElement('img');
		i.src = img ?? `/img/i/a/${obj.abNo}.png`;
		p.appendChild(i);
		p.append(obj.text);
		this.specialsEl.appendChild(p);
	}

	createAbIcons() {
		this.enemy.createImuIcons(this.specialsEl);

		if (this.enemy.trait & TB_SAGE) {
			this.addAbility({'text': `超賢者：減輕 70% 受到的妨害效果 `}, `/img/i/e/15.png`);
		}

		for (const obj of this.enemy.abilityDescriptions(1)) {
			if (obj.abNo === AB_DSHIELD) {
				const v = this.enemy.ab[AB_DSHIELD];
				const div = this.specialsEl.appendChild(document.createElement('div'));
				div.style.cursor = 'pointer';
				div.appendChild(new Image(40, 40)).src = '/img/i/a/39.png';
				div.append('惡魔盾 ');
				this.demonShieldEl = div.appendChild(document.createElement('span'));
				this.demonShieldEl.textContent = numStr(~~(Math.round(v[0] * (this.mult / 100)) * (this.stageCrownMult / 100)));
				div.append(` HP，KB時惡魔盾恢復 ${v[1]} %`);
				div.dataset.abNo = obj.abNo;
				div.dataset.selected = '0';
				div.addEventListener('click', this.handleClickBind);
			} else if (MULTI_AB.has(obj.abNo)) {
				this.addAbilityInteract(obj);
			} else {
				this.addAbility(obj);
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
				this.demonShieldEl.textContent = numStr(~~(Math.round(this.enemy.ab[AB_DSHIELD][0] * this.enemy.hpM) * this.enemy.stageM));
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
		for (let x = 1, i = 0; x <= TB_LAST; x <<= 1, i++) {
			if (this.enemy.trait & x) {
				if (x === TB_ALIEN && this.enemy.star === 1) {
					traits.push(units_scheme.traits.stared_alien);
				} else {
					traits.push(units_scheme.traits.names[i]);
				}
			}
		}

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
					s += `${nums[i]}${displayRange(x)}～${displayRange(y)}`;
				else
					s += `${nums[i]}${displayRange(y)}～${displayRange(x)}`;
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
		this.enemyStatsBody[1].children[5].textContent = displayRange(this.enemy.range);
		this.enemyStatsBody[1].children[7].textContent = this.enemy.earn;
		if (config.unit === 'F')
			this.enemyStatsBody[2].children[1].textContent = [this.enemy.pre, this.enemy.pre1, this.enemy.pre2].filter(x => x).map(numStr).join('/') + ' F';
		else
			this.enemyStatsBody[2].children[1].textContent = [this.enemy.pre, this.enemy.pre1, this.enemy.pre2].filter(x => x).map(x => numStr(x / 30)).join('/') + ' 秒';
		this.enemyStatsBody[0].children[6].textContent = displaySpeed(this.enemy.speed);
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
