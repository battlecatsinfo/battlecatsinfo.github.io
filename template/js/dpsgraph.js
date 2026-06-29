import {loadScheme, floor} from './common.mjs';
import {
	ATK_RANGE,
	ATK_LD,
	ATK_OMNI,

	AB_STRENGTHEN,
	AB_ATKBASE,
	AB_CRIT,
	AB_SAVAGE,
	AB_MINIWAVE,
	AB_WAVE,
	AB_MINISURGE,
	AB_SURGE,
	AB_BAIL,
	AB_BSTHUNT,
	AB_WKILL,
	AB_EKILL,
	AB_GOOD,
	AB_MASSIVE,
	AB_MASSIVES,
	AB_SAGE,
	AB_EXPLOSION,

	TRAIT_TREASURE,

	getAbiString,

	CatIdb,
	EnemyIdb,
	loadCat,
	loadEnemy,
} from './unit.mjs';

const unitScheme = await loadScheme('units', ['talents']);
const formSelectEl = document.getElementById('form-select');
const nameListEl = document.getElementById('name-list');
const addBtnEl = document.getElementById('add');
const catNameEl = document.getElementById('cat-name');
const catName2El = document.getElementById('cat-name2');
const popModalEl = document.getElementById('popup-modal');
const graphContainerEl = document.getElementById('graph-container');
let numCats, numEnemies;

const DPS_RELATED_TALENTS = new Set([
	10, // 攻擊力上升
	13, // 會心一擊
	17, // 波動
	31, // 基本攻擊力上升
	50, // 渾身一擊
	56, // 烈波攻擊
	61, // 攻擊間隔縮短
	62, // 小波動
	65, // 小烈波
	67, // 爆波攻擊
]);

/**
 * @param {HTMLInputElement} [input] - the html input element for unit name
 * @param {DPSBlock|Render} [B] - if B is not an instance of DPSBlock, a new DPSBlock will be inserted at the end of document
 * @return {Boolean} true if the DPSGraph is created, otherwise false is returned
 */
async function handleInput(input, B) {
	const X = nameListEl.options;
	const name = input.value.trim();
	if (name) {
		for (let i = 0; i < X.length; ++i) {
			if (X[i].value === name) {
				if (i < numCats) {
					const cat = await loadCat(i);
					const numForms = cat.forms.length;
					let lvc = formSelectEl.selectedIndex;
					if (lvc <= 3) {
						if (lvc >= numForms) {
							alert('此貓咪沒有第' + (lvc + 1) + '型態');
							return false;
						}
					} else {
						lvc = numForms - 1;
					}
					if (!(B instanceof DPSBlock))
						B = new DPSBlock(graphContainerEl, B);
					new DPSGraph(new CatDPSHelper(B, cat.forms[lvc]));
					B.createButtons();
					return true;
				}
				const enemy = await loadEnemy(i - numCats);
				if (!(B instanceof DPSBlock))
					B = new DPSBlock(graphContainerEl, B);
				new DPSGraph(new EnemyDPSHelper(B, enemy));
				B.createButtons();
				return true;
			}
		}
	}

	alert('無法識別輸入的貓咪！請檢查名稱是否正確！');
	return false;
}

function surgeModel(minSpawn, maxSpawn, Xs) {
	const leftLoint = minSpawn - 250;
	const rightPoint = maxSpawn + 125;
	const arr = new Uint16Array(rightPoint - leftLoint + 1);
	Xs.push([leftLoint, false]);
	Xs.push([rightPoint, false]);
	Xs.push([maxSpawn - 250, false]);
	Xs.push([minSpawn + 125, false]);
	for (let pos = minSpawn; pos < maxSpawn; ++pos) {
		const end = pos + 125;
		for (let i = pos - 250; i <= end; ++i) {
			++arr[i - leftLoint];
		}
	}
	return arr;
}

function setURL() {
	const blocks = graphContainerEl.getElementsByClassName('w3-panel'); // document.body.querySelectorAll('* [data-units]')
	let allUnits = [];

	for (const elem of blocks) {
		let units = elem.dataset.units;
		if (units.endsWith(","))
			units = units.slice(0, -1);

		allUnits.push(units);
	}

	const url = new URL(location.href);
	if (allUnits.length)
		url.searchParams.set("units", allUnits.join('|'));
	else
		url.searchParams.delete('units');
	history.pushState({}, "", url);
}


class DPSBlock {
	constructor(parent, renderCls) {
		this.controlsEl = document.createElement('div');
		this.controlsEl.classList.add('w3-quarter', 'w3-container');
		const plotEl = document.createElement('div');
		plotEl.classList.add('w3-threequarter', 'w3-container');
		this.render = new renderCls(plotEl);

		const container = document.createElement('div');
		container.classList.add('w3-panel', 'w3-border', 'w3-light-grey', 'w3-round-large');
		container.style.margin = '1em';
		container.style.padding = '0';
		container.appendChild(plotEl);
		container.appendChild(this.controlsEl);
		container.dataset.units = '';
		parent.appendChild(container);;
	}
	createButtons() {
		const self = this;
		const p = document.createElement('p');
		let btn = document.createElement('button');
		btn.textContent = '下載';
		btn.classList.add('w3-button', 'w3-teal', 'w3-round');
		btn.onclick = function() {
			self.render.D();
		}
		btn.style.marginRight = '0.5em';
		p.appendChild(btn);

		btn = document.createElement('button');
		btn.textContent = '複製';
		btn.classList.add('w3-button', 'w3-green', 'w3-round');
		btn.onclick = function() {
			navigator.clipboard.writeText(self.render.text());
			this.textContent = '成功';
			const u = this;
			setTimeout(function() {
				u.textContent = '複製';
			}, 500);
		}
		btn.style.marginRight = '0.5em';
		p.appendChild(btn);

		btn = document.createElement('button');
		btn.textContent = '刪除';
		btn.classList.add('w3-button', 'w3-red', 'w3-round');
		btn.onclick = function() {
			const container = self.controlsEl.parentNode;
			self.render.destroy(); // destroy the render
			container.parentNode.removeChild(container); // remove the container
			setURL(); // update url state
		}
		btn.style.marginRight = '0.5em';
		p.appendChild(btn);

		btn = document.createElement('button');
		btn.textContent = '+';
		btn.classList.add('w3-button', 'w3-circle', 'w3-deep-purple', 'w3-ripple', 'w3-large');
		btn.onclick = async function() {
			popModalEl.style.display = 'block';
			catName2El.focus();
			addBtnEl.onclick = async function() {
				if (await handleInput(catName2El, self)) {
					const p = btn.parentNode;
					p.parentNode.removeChild(p);
					popModalEl.style.display = 'none';
				}
			}
		}
		p.appendChild(btn);
		this.controlsEl.appendChild(p);
	}
}

class UnitDPSHelper {
	/**
	 * @param {DPSBlock} [B] - a valid DPSBlock
	 * @param {Unit} [F] - any instance of Unit
	 */
	constructor(B, F) {
		if (new.target === UnitDPSHelper)
			throw new Error('Abstract Class cannot be instantiated');
		this.B = B;
		this.F = F;
		this.title = this.F.name || this.F.jpName || '<未命名>';
		this.talentTypes = new Set();
	}
	createAttackTypeUI() {
		{
			const h2 = document.createElement('h2');
			h2.textContent = this.title;
			this.B.controlsEl.appendChild(h2);
		}

		{
			const div = document.createElement('div');
			let desc = '';
			if (this.F.atkType & ATK_OMNI) {
				desc += '全方位';
			} else if (this.F.atkType & ATK_LD) {
				desc += '遠方';
			} else {
				desc += '普通';
			}
			desc += (this.F.atkType & ATK_RANGE) ? '範圍攻擊' : '單體攻擊';
			if (this.graph.abis.length > 1) {
				div.textContent = desc + getAbiString(this.F.abi);
			} else {
				div.textContent = desc;
			}
			this.B.controlsEl.appendChild(div);
		}

		{
			let div = document.createElement('div');
			if (this.F.lds) {
				const nums = '①②③';
				let desc = '';
				for (let i = 0; i < this.F.lds.length; ++i) {
					const x = this.F.lds[i];
					const y = x + this.F.ldr[i];
					if (x <= y)
						desc += `${nums[i]}${x}～${y}`;
					else
						desc += `${nums[i]}${y}～${x}`;
				}
				div.textContent = `接觸點${this.F.range}，範圍：${desc}`;
			} else {
				div.textContent = '射程：' + this.F.range;
			}
			this.B.controlsEl.appendChild(div);
		}
	}
	createUI(graph) {
		this.graph = graph;
	}
	applyLevels() {

	}
	getAtks() {

	}
}

class CatDPSHelper extends UnitDPSHelper {
	constructor(B, F) {
		super(B, F);
		B.controlsEl.parentNode.dataset.units += `${F.id}-${F.lvc},`;
		setURL();
	}
	createUI(graph) {
		this.talentLevels = [];
		this.superTalentLevels = [];

		super.createUI(graph);
		super.createAttackTypeUI();
		this.createLevelInput();
		this.createTalentInput();
	}
	createLevelInput() {
		const self = this;

		const p = document.createElement('p');
		const label = document.createElement('label');
		label.textContent = '等級';
		p.appendChild(label);
		this.levelInput = document.createElement('input');
		this.levelInput.classList.add('w3-input', 'w3-border', 'w3-round');
		this.levelInput.title = '貓咪的總等級';
		this.levelInput.inputMode = 'numeric';
		p.appendChild(this.levelInput);
		this.B.controlsEl.appendChild(p);
		this.levelInput.onblur = function() {
			let num = this.value.match(/\d+/);
			if (!num) {
				this.value = '請輸入數字！';
				return;
			}
			self.curLevel = num[0];
			self.graph.render();
		}

		// set initial level
		this.curLevel = (this.superTalentLevels.length || this.F.lvc == 3) ? 60 : 50;
	}
	createTalentInput() {
		const self = this;

		if (this.F.lvc >= 2 && this.F.talents) {
			for (let i = 1; i < 113; i += 14) {
				if (!this.F.talents[i]) break;
				((this.F.talents[i + 13] == 1) ? this.superTalentLevels : this.talentLevels).push(this.F.talents[i + 1] || 1);
				this.talentTypes.add(this.F.talents[i]);
			}
		}


		if (this.F.lvc >= 2 && this.F.talents) {
			for (let i = 1; i < 113 && this.F.talents[i]; i += 14) {
				const talentIndex = this.F.talents[i];
				if (!DPS_RELATED_TALENTS.has(talentIndex))
					continue;
				const name = unitScheme.talents.names[talentIndex];
				const div = document.createElement('p');
				let p = div.appendChild(document.createElement('label'));
				const talentType = this.F.talents[i + 13] === 1 ? '超本能' : '本能';
				p.textContent = `${talentType} - ${name}`;
				p = div.appendChild(document.createElement('input'));
				p.classList.add('w3-input');
				p.style.paddingLeft = '0';
				p.style.paddingRight = '0';
				p.type = 'range';
				p.min = 0;
				p.value = p.max = (this.F.talents[i + 1] || 1).toString();
				p.step = 1;
				p.oninput = function() {
					let talentsCounter = 0;
					let superTalentsCounter = 0;
					for (let j = 1;j < 113;j += 14) {
						if (j == i) {
							if (self.F.talents[j + 13] == 1) {
								self.superTalentLevels[superTalentsCounter] = parseInt(this.value);
							} else {
								self.talentLevels[talentsCounter] = parseInt(this.value);
							}
							self.graph.render();
							return;
						}
						if (self.F.talents[j + 13] == 1)
							++superTalentsCounter;
						else

						++talentsCounter;
					}
				}
				this.B.controlsEl.appendChild(div);
			}
		}
	}
	applyLevels() {
		const F = this.F.clone();
		F.level = this.curLevel;
		this.levelInput.value = F.level;
		if (F.talents && F.lvc >= 2) {
			F.applyTalents(this.talentLevels);
			F.applySuperTalents(this.superTalentLevels);
		}
		return F;
	}
	getAtks(F) {
		const atks = [F.atk];

		if (F.info.atk1) atks.push(F.atk1);
		if (F.info.atk2) atks.push(F.atk2);

		return atks;
	}
}

class EnemyDPSHelper extends UnitDPSHelper {
	constructor(B, F) {
		super(B, F);
		B.controlsEl.parentNode.dataset.units += `${F.id},`;
		setURL();
	}
	createUI(graph) {
		super.createUI(graph);
		super.createAttackTypeUI();
		this.createMultiInput();
	}
	createMultiInput() {
		const self = this;

		const p = document.createElement('p');
		const label = document.createElement('label');
		label.textContent = '倍率';
		p.appendChild(label);
		this.multiInputEl = document.createElement('input');
		this.multiInputEl.classList.add('w3-input', 'w3-border', 'w3-round');
		this.multiInputEl.title = '倍率';
		this.multiInputEl.inputMode = 'numeric';
		p.appendChild(this.multiInputEl);
		this.B.controlsEl.appendChild(p);
		this.multiInputEl.onblur = function() {
			let num = this.value.match(/\d+/);
			if (!num) {
				this.value = '請輸入數字！';
				return;
			}
			self.curMulti = num[0];
			self.graph.render();
		}

		// set initial multiplier
		this.curMulti = 100;
		this.multiInputEl.value = '100';
	}
	applyLevels() {
		return this.F;
	}
	getAtks(F) {
		const atks = [F.atk];

		if (F.info.atk1) atks.push(F.atk1);
		if (F.info.atk2) atks.push(F.atk2);

		if (this.curMulti !== 100) {
			const mul = this.curMulti / 100;
			for (let i = 0;i < atks.length;++i) {
				atks[i] = floor(atks[i] * mul);
			}
		}

		return atks;
	}
}

class DPSGraph {
	/**
	 * @param {UnitDPSHelper} [helper] - an instance of UnitDPSHelper
	 */
	constructor(helper) {
		const self = this;
		const F = helper.F;

		this.helper = helper;
		this.abis = [];
		this.H = helper.B.render.register(helper.title);
		this.isNormal = !((F.atkType & ATK_LD) || (F.atkType & ATK_OMNI));
		this.options = {};

		for (let i = 0; i < (F.info.atk1 ? (F.info.atk2 ? 3 : 2) : 1); ++i)
			this.abis.push(F.abEnabled(i) !== 0);

		helper.createUI(this);

		let select;
		if (Object.hasOwn(F.ab, AB_MASSIVE)) {
			this.options.massive = true;
			select = this.createSelect('超大傷害', ['ON', 'OFF']);
		} else if (helper.talentTypes.has(7)) {
			this.options.massive = true;
			select = this.createSelect('超大傷害', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.massive = !this.selectedIndex;
				self.render();
			};
			select = null;
		}

		if (Object.hasOwn(F.ab, AB_MASSIVES)) {
			this.options.massives = true;
			this.createSelect('極度傷害', ['ON', 'OFF']).oninput = function() {
				self.options.massives = !this.selectedIndex;
				self.render();
			};
		}

		if (Object.hasOwn(F.ab, AB_GOOD)) {
			this.options.good = true;
			select = this.createSelect('善於攻擊', ['ON', 'OFF']);
		} else if (helper.talentTypes.has(5)) {
			this.options.good = true;
			select = this.createSelect('善於攻擊', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.good = !this.selectedIndex;
				self.render();
			};
			select = null;
		}

		if (Object.hasOwn(F.ab, AB_WKILL)) {
			this.options.wkill = true;
			select = this.createSelect('終結魔女', ['ON', 'OFF']);
		} else if (helper.talentTypes.has(42)) {
			this.options.wkill = true;
			select = this.createSelect('終結魔女', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.wkill = !this.selectedIndex;
				self.render();
			};
			select = null;
		}


		if (Object.hasOwn(F.ab, AB_EKILL)) {
			this.options.ekill = true;
			select = this.createSelect('終結使徒', ['ON', 'OFF']);
		} else if (helper.talentTypes.has(43)) {
			this.options.ekill = true;
			select = this.createSelect('終結使徒', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.ekill = !this.selectedIndex;
				self.render();
			};
			select = null;
		}


		if (Object.hasOwn(F.ab, AB_BSTHUNT)) {
			this.options.beast = true;
			select = this.createSelect('超獸特效', ['ON', 'OFF']);
		} else if (helper.talentTypes.has(64)) {
			this.options.beast = true;
			select = this.createSelect('超獸特效', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.beast = !this.selectedIndex;
				self.render();
			};
			select = null;
		}

		if (Object.hasOwn(F.ab, AB_BAIL)) {
			this.options.bail = true;
			select = this.createSelect('超生命體特效', ['ON', 'OFF']);
		} else if (helper.talentTypes.has(63)) {
			this.options.bail = true;
			select = this.createSelect('超生命體特效', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.bail = !this.selectedIndex;
				self.render();
			};
			select = null;
		}

		if (Object.hasOwn(F.ab, AB_SAGE)) {
			this.options.sage = true;
			select = this.createSelect('超賢者特效', ['ON', 'OFF']);
		} else if (helper.talentTypes.has(66)) {
			this.options.sage = true;
			select = this.createSelect('超賢者特效', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.sage = !this.selectedIndex;
				self.render();
			};
			select = null;
		}

		if (Object.hasOwn(F.ab, AB_STRENGTHEN)) {
			this.options.strong = true;
			select = this.createSelect('攻擊力上升', ['ON', 'OFF']);
		} else if (helper.talentTypes.has(10)) {
			this.options.strong = true;
			select = this.createSelect('攻擊力上升', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.strong = !this.selectedIndex;
				self.render();
			};
			select = null;
		}

		if (Object.hasOwn(F.ab, AB_ATKBASE)) {
			this.options.base = true;
			select = this.createSelect('善於攻城', ['ON', 'OFF']);
		} else if (helper.talentTypes.has(12)) {
			this.options.base = true;
			select = this.createSelect('善於攻城', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.base = !this.selectedIndex;
				self.render();
			};
		}

		if (Object.hasOwn(F.ab, AB_CRIT) || helper.talentTypes.has(13)) {
			this.options.crit = 0;
			this.createSelect('會心一擊', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.crit = this.selectedIndex;
					self.render();
				};
		}

		if (Object.hasOwn(F.ab, AB_SAVAGE) || helper.talentTypes.has(50)) {
			this.options.s = 0;
			this.createSelect('渾身一擊', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.s = this.selectedIndex;
					self.render();
				};
		}

		if (Object.hasOwn(F.ab, AB_WAVE) || helper.talentTypes.has(17)) {
			this.options.wave = 0;
			this.createSelect('波動', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.wave = this.selectedIndex;
					self.render();
				};
		}

		if (Object.hasOwn(F.ab, AB_MINIWAVE) || helper.talentTypes.has(62)) {
			this.options.wave = 0;
			this.createSelect('小波動', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.wave = this.selectedIndex;
					self.render();
				};
		}

		if (Object.hasOwn(F.ab, AB_SURGE) || helper.talentTypes.has(56)) {
			this.options.surge = 0;
			this.createSelect('烈波', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.surge = this.selectedIndex;
					self.render();
				};
		}

		if (Object.hasOwn(F.ab, AB_EXPLOSION) || helper.talentTypes.has(67)) {
			this.options.explosion = 0;
			this.createSelect('爆波', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.explosion = this.selectedIndex;
					self.render();
				};
		}

		if (Object.hasOwn(F.ab, AB_MINISURGE) || helper.talentTypes.has(65)) {
			this.options.surge = 0;
			this.createSelect('小烈波', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.surge = this.selectedIndex;
					self.render();
				};
		}

		this.render();
	}
	createSelect(title, texts) {
		let o;
		const D = document.createElement('div');
		const select = document.createElement('select');
		const span = document.createElement('span');
		select.classList.add('w3-select', 'w3-border');
		span.textContent = title;
		D.appendChild(span);
		for (const v of texts) {
			o = document.createElement('option');
			o.textContent = v;
			select.appendChild(o);
		}
		D.appendChild(select);
		this.helper.B.controlsEl.appendChild(D);
		return select;
	}
	dpsAt(x, buf) {
		let RAW = this.atks.slice();
		let sum = 0;
		buf ??= RAW;
		if (this.isNormal) {
			if (x < -320 || x > this.E.range) RAW.fill(0);
		} else {
			for (let i = 0; i < this.E.lds.length; ++i) {
				let a = this.E.lds[i];
				let b = a + this.E.ldr[i];
				if (a > b) {
					[a, b] = [b, a];
				}
				if (x < a || x > b) RAW[i] = 0;
			}
		}
		if (this.surgeData) {
			const ab = this.E.ab[AB_SURGE] || this.E.ab[AB_MINISURGE];
			const leftPoint = ab[1] - 250;
			const rightPoint = ab[2] + 125;
			if (x >= leftPoint && x <= rightPoint) {
				const mul = this.surgeData[x - leftPoint] * this.surgeMul;
				for (let i = 0; i < buf.length; ++i)
					if (this.abis[i]) buf[i] += this.atks[i] * mul;
			}
		}
		if (this.wavePos) {
			if (x >= -67.5 && x <= this.wavePos) {
				const ab = this.E.ab[AB_WAVE] || this.E.ab[AB_MINIWAVE];
				const mini = this.E.ab[AB_MINIWAVE] ? 0.2 : 1;
				for (let i = 0; i < RAW.length; ++i) {
					if (this.options.wave) {
						for (let i = 0; i < RAW.length; ++i) {
							if (this.abis[i]) RAW[i] += (this.atks[i] * mini);
						}
					} else {
						for (let i = 0; i < RAW.length; ++i) {
							if (this.abis[i]) RAW[i] += (this.atks[i] * mini * ab[0] / 100);
						}
					}
				}
			}
		}
		if (this.explosionData) {
			const blasts = [
				{min: -275, max: -175, mul: 0.4},
				{min: -175, max: -75, mul: 0.7},
				{min: -75, max: 75, mul: 1},
				{min: 75, max: 175, mul: 0.7},
				{min: 175, max: 275, mul: 0.4},
			];
			const cases = this.explosionData[2] - this.explosionData[1] + 1;

			// allow early break to improve performance,
			// under the presumption that blasts never overlap
			let canBreak = false;

			for (const {min, max, mul} of blasts) {
				const left = this.explosionData[1] + min;
				const right = this.explosionData[2] + max;

				if (!(left < x && x <= right))
					continue;

				let multi = mul * (this.options.explosion ? 1 : (this.explosionData[0] / 100));

				if (cases === 1) {
					canBreak = true;
				} else {
					const leftMax = this.explosionData[1] + max;
					const rightMin = this.explosionData[2] + min;

					if (rightMin < x && x <= leftMax) {
						// x within this blast for all cases
						// implies: width = max - min >= cases
						canBreak = true;
					} else if (rightMin < x) {
						// x within this blast for some rightmost cases
						multi *= (right - x + 1) / cases;
					} else if (x <= leftMax) {
						// x within this blast for some leftmost cases
						multi *= (x - left) / cases;
					} else {
						// x within this blast for some middle cases
						// implies: width = max - min < cases
						multi *= (max - min) / cases;
					}
				}

				for (let i = 0; i < buf.length; ++i)
					if (this.abis[i]) buf[i] += this.atks[i] * multi;

				if (canBreak)
					break;
			}
		}
		for (let i of RAW) sum += i;
		return floor(sum * 30 / this.E.attackF);
	}
	render() {
		const F = this.E = this.helper.applyLevels();
		this.atks = this.helper.getAtks(F);

		let x, Xs, T = F.trait & TRAIT_TREASURE;

		if (this.options.base) {
			for (let i = 0; i < this.atks.length; ++i)
				this.atks[i] *= 4;
		} else {
			x = F.ab[AB_CRIT];
			if (x) {
				if (!this.options.crit) {
					for (let i = 0; i < this.atks.length; ++i)
						if (this.abis[i]) this.atks[i] += this.atks[i] * x / 100;
				} else if (this.options.crit == 1) {
					for (let i = 0; i < this.atks.length; ++i)
						if (this.abis[i]) this.atks[i] *= 2;
				}
			}
			x = F.ab[AB_SAVAGE];
			if (x) {
				if (!this.options.s) {
					for (let i = 0; i < this.atks.length; ++i)
						if (this.abis[i]) this.atks[i] = this.atks[i] * (1 + x[0] * x[1] / 10000);
				} else if (this.options.s == 1) {
					for (let i = 0; i < this.atks.length; ++i)
						if (this.abis[i]) this.atks[i] = this.atks[i] * (1 + x[1] / 100);
				}
			}
			if (this.options.strong)
				for (let i = 0; i < this.atks.length; ++i)
					if (this.abis[i]) this.atks[i] = this.atks[i] * (1 + (F.ab[AB_STRENGTHEN][1] / 100));
			if (this.options.good) {
				for (let i = 0; i < this.atks.length; ++i) {
					this.atks[i] = this.atks[i] * (T ? 1.8 : 1.5);
				}
			}
			if (this.options.massive) {
				for (let i = 0; i < this.atks.length; ++i) {
					this.atks[i] *= T ? 4 : 3;
				}
			}
			if (this.options.massives) {
				for (let i = 0; i < this.atks.length; ++i) {
					this.atks[i] *= T ? 6 : 5;
				}
			}
			if (this.options.wkill) {
				for (let i = 0; i < this.atks.length; ++i) {
					this.atks[i] *= 5;
				}
			}
			if (this.options.ekill) {
				for (let i = 0; i < this.atks.length; ++i) {
					this.atks[i] *= 5;
				}
			}
			if (this.options.beast) {
				for (let i = 0; i < this.atks.length; ++i) {
					this.atks[i] *= 2.5;
				}
			}
			if (this.options.bail) {
				for (let i = 0; i < this.atks.length; ++i) {
					this.atks[i] *= 1.6;
				}
			}
			if (this.options.sage) {
				for (let i = 0; i < this.atks.length; ++i) {
					this.atks[i] *= 1.2;
				}
			}
		}
		if (this.isNormal) {
			Xs = [
				[-320, true],
				[F.range, false],
				[F.range + 1, false]
			];
		} else {
			Xs = [];
			for (let i = 0; i < F.lds.length; ++i) {
				let a = F.lds[i];
				let b = a + F.ldr[i];
				if (a > b) {
					x = a;
					a = b;
					b = x;
				}
				Xs.push([a, true]);
				Xs.push([b, true]);
				Xs.push([b + 1, false]);
			}
		}
		x = F.ab[AB_WAVE] || F.ab[AB_MINIWAVE];
		if (x && this.options.wave != 2) {
			Xs.push([-67.5, true]);
			Xs.push([(this.wavePos = (132.5 + 200 * x[1])), false]);
		} else {
			this.wavePos = null;
		}
		x = F.ab[AB_SURGE] || F.ab[AB_MINISURGE];
		if (x && this.options.surge != 2) {
			this.surgeData = surgeModel(x[1], x[2], Xs);
			this.surgeMul = this.options.surge ?
				(x[3] / (x[2] - x[1])) :
				(x[0] * x[3]) / (100 * (x[2] - x[1]));
			if (F.ab[AB_MINISURGE]) this.surgeMul /= 5;
		} else {
			this.surgeData = null;
		}
		x = F.ab[AB_EXPLOSION];
		if (x && this.options.explosion != 2) {
			this.explosionData = x;
			const offsets = [-275, -175, -75, 75, 175, 275];
			for (const offset of offsets) {
				Xs.push([x[1] + offset, false]);
				Xs.push([x[1] + offset + 1, false]);
				Xs.push([x[2] + offset, false]);
				Xs.push([x[2] + offset + 1, false]);
			}
		}
		x = -Infinity;
		for (const e of Xs) x = Math.max(e[0], x);
		Xs.push([x + 20, false]);
		x = Infinity;
		for (const e of Xs) x = Math.min(e[0], x);
		Xs.push([x - 20, false]);
		Xs.sort((a, b) => a[0] - b[0]);
		let newXs = [];
		let newYs = [];
		let lastX = 0;
		let lastY = 0;
		let surgeSum;
		let surgeRaw;
		for (const X of Xs) {
			x = X[0];
			if (lastX == x) continue;
			
			if (this.surgeData || this.explosionData) surgeRaw = new Array(this.atks.length).fill(0);

			const y = this.dpsAt(x, surgeRaw);

			surgeSum = 0;
			if (this.surgeData || this.explosionData) {
				surgeSum = 0;
				for (let i of surgeRaw) surgeSum += i;
				surgeSum = floor(surgeSum * 30 / F.attackF);
			}
			if (lastY != y) {
				newXs.push(X[1] ? x : lastX);
				newYs.push((X[1] ? lastY : y) + surgeSum);
			}
			newXs.push(x);
			newYs.push(y + surgeSum);
			lastX = x;
			lastY = y;
		}
		this.H.Xs = newXs;
		this.H.Ys = newYs;

		this.H.D = this.dpsAt.bind(this);
		if (this.helper.B.render.C() == 1 && (this.surgeData || this.wavePos || this.explosionData)) {
			let tmp;

			this.H.X2s = [];
			this.H.Y2s = [];

			lastX = lastY = 0;

			// disable surge/wave ability temporarily
			if (this.surgeData) {
				tmp = this.surgeData;
				this.surgeData = null;
			} else if (this.explosionData) {
				tmp = this.explosionData;
				this.explosionData = null;
			} else {
				tmp = this.wavePos;
				this.wavePos = null;
			}

			// calculate DPS-graph without surge/wave
			for (const X of Xs) {
				x = X[0];
				if (lastX == x) continue;
				const y = this.dpsAt(x);
				if (lastY != y) {
					this.H.X2s.push(X[1] ? x : lastX);
					this.H.Y2s.push((X[1] ? lastY : y));
				}
				this.H.X2s.push(x);
				this.H.Y2s.push(y);
				lastX = x;
				lastY = y;
			}

			// restore back data
			if (Object.hasOwn(this.options, 'surge'))
				this.surgeData = tmp;
			else if (Object.hasOwn(this.options, 'explosion'))
				this.explosionData = tmp;
			else
				this.wavePos = tmp;

			this.helper.B.render.plot(this.H);
			this.H.X2s = null;
			this.H.Y2s = null;
			return;
		}

		this.helper.B.render.plot(this.H);
	}
}

async function main(render) {
	catNameEl.focus();
	document.getElementById('loader').hidden = true;

	const catIdb = await CatIdb.open();
	try {
		const catGen = CatIdb.forEachValue(catIdb);
		for await (const cat of catGen) {
			const o = document.createElement('option');
			o.value = cat.forms.map(CL => CL.name || CL.jpName).join('/');
			nameListEl.appendChild(o);
		}
	} finally {
		catIdb.close();
	}
	numCats = nameListEl.options.length;

	const enemyIdb = await EnemyIdb.open();
	try {
		const enemyGen = EnemyIdb.forEachValue(enemyIdb);
		for await (const enemy of enemyGen) {
			const o = document.createElement('option');
			o.value = enemy.name || enemy.jpName;
			nameListEl.appendChild(o);
		}
	} finally {
		enemyIdb.close();
	}
	numEnemies = nameListEl.options.length - numCats;

	const units = new URLSearchParams(location.search).get('units');
	if (units) {
		for (const part of units.split('|')) {
			let block;
			for (const subpart of part.split(',')) {
				if (subpart.indexOf('-') === -1) {
					const id = parseInt(subpart, 10);
					if (isFinite(id) && id < numEnemies) {
						const enemy = await loadEnemy(id);
						if (!block)
							block = new DPSBlock(graphContainerEl, render);
						new DPSGraph(new EnemyDPSHelper(block, enemy));
					}
				} else {
					const ints = subpart.split('-');
					if (ints.length === 2) {
						const id = parseInt(ints[0], 10);
						const lvc = parseInt(ints[1], 10);
						if (isFinite(id) && isFinite(lvc) && id < numCats) {
							const cat = await loadCat(id);
							if (lvc < cat.forms.length) {
								if (!block)
									block = new DPSBlock(graphContainerEl, render);
								new DPSGraph(new CatDPSHelper(block, cat.forms[lvc]));
							}
						}
					}
				}
			}
			if (block)
				block.createButtons();
		}
	}

	document.getElementById('switch_mode').addEventListener('click', function() {
		let path = location.pathname;
		if (path.includes('png'))
			path = '/dpsgraph_svg.html';
		else
			path = '/dpsgraph_png.html';
		location.assign(path + location.search);
	});
	document.getElementById('ok').addEventListener('click', async function() {
		await handleInput(catNameEl, render);
	});
	catNameEl.addEventListener('focus', function() {
		this.select();
	});
	document.getElementById('popup-modal-close').addEventListener('click', function () {
		popModalEl.style.display = 'none';
	});
}

export {
	main
};
