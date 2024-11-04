import {loadScheme, floor} from './common.mjs';
import {
	ATK_SINGLE,
	ATK_RANGE,
	ATK_LD,
	ATK_OMNI,
	ATK_KB_REVENGE,

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
	AB_EXPLOSION,

	trait_treasure,

	getAbiString,

	CatIdb,
	EnemyIdb,
	loadCat,
	loadEnemy,
} from './unit.mjs';
const units_scheme = await loadScheme('units', ['talents']);

const CF = document.getElementById('CF');
const CL = document.getElementById('CL');
const add = document.getElementById('add');
const cat_name = document.getElementById('cat-name');
const cat_name2 = document.getElementById('cat-name2');
const id01 = document.getElementById('id01');
const graph_container = document.getElementById('graph_container');
let num_cats, num_enemies;

/**
 * @param {HTMLInputElement} [input] - the html input element for unit name
 * @param {DPSBlock|Render} [B] - if B is not an instance of DPSBlock, a new DPSBlock will be inserted at the end of document
 * @return {Boolean} true if the DPSGraph is created, otherwise false is returned
 */
async function handle_input(input, B) {
	const X = CL.options;
	const name = input.value.trim();
	if (name) {
		for (let i = 0; i < X.length; ++i) {
			if (X[i].value === name) {
				if (i < num_cats) {
					const cat = await loadCat(i);
					const num_forms = cat.forms.length;
					let lvc = CF.selectedIndex;
					if (lvc <= 3) {
						if (lvc >= num_forms) {
							alert('此貓咪沒有第' + (lvc + 1) + '型態');
							return false;
						}
					} else {
						lvc = num_forms - 1;
					}
					if (!(B instanceof DPSBlock))
						B = new DPSBlock(graph_container, B);
					new DPSGraph(new CatDPSHelper(B, cat.forms[lvc]));
					return true;
				}
				const enemy = await loadEnemy(i - num_cats);
				if (!(B instanceof DPSBlock))
					B = new DPSBlock(graph_container, B);
				new DPSGraph(new EnemyDPSHelper(B, enemy));
				return true;
			}
		}
	}

	alert('無法識別輸入的貓咪！請檢查名稱是否正確！');
	return false;
}

function surge_model(min_spawn, max_spawn, Xs) {
	const left_point = min_spawn - 250;
	const right_point = max_spawn + 125;
	const arr = new Uint16Array(right_point - left_point + 1);
	Xs.push([left_point, false]);
	Xs.push([right_point, false]);
	Xs.push([max_spawn - 250, false]);
	Xs.push([min_spawn + 125, false]);
	for (let pos = min_spawn; pos < max_spawn; ++pos) {
		const end = pos + 125;
		for (let i = pos - 250; i <= end; ++i) {
			++arr[i - left_point];
		}
	}
	return arr;
}




class DPSBlock {
	constructor(parent, render) {
		this.dom = document.createElement('div');
		this.dom.classList.add('w3-quarter', 'w3-container');
		const plot_div = document.createElement('div');
		plot_div.classList.add('w3-threequarter', 'w3-container');
		this.R = new render(plot_div);

		const container = document.createElement('div');
		container.classList.add('w3-panel', 'w3-border', 'w3-light-grey', 'w3-round-large');
		container.style.margin = '1em';
		container.style.padding = '0';
		container.appendChild(plot_div);
		container.appendChild(this.dom);
		container.dataset.units = '';
		parent.appendChild(container);;
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
		this.title = this.F.name || this.F.jp_name || '<未命名>';
		this.talent_types = new Set();
	}
	createAttackTypeUI() {
		{
			const h2 = document.createElement('h2');
			h2.textContent = this.title;
			this.B.dom.appendChild(h2);
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
			this.B.dom.appendChild(div);
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
			this.B.dom.appendChild(div);
		}
	}
	createButtons() {
		const self = this;
		const p = document.createElement('p');
		let btn = document.createElement('button');
		btn.textContent = '下載';
		btn.classList.add('w3-button', 'w3-teal', 'w3-round');
		btn.onclick = function() {
			self.B.R.D();
		}
		btn.style.marginRight = '0.5em';
		p.appendChild(btn);

		btn = document.createElement('button');
		btn.textContent = '複製';
		btn.classList.add('w3-button', 'w3-green', 'w3-round');
		btn.onclick = function() {
			navigator.clipboard.writeText(self.B.R.text());
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
			const container = self.B.dom.parentNode;
			self.B.R.destroy(); // destroy the render
			container.parentNode.removeChild(container); // remove the container
			self.setURL(); // update url state
		}
		btn.style.marginRight = '0.5em';
		p.appendChild(btn);

		btn = document.createElement('button');
		btn.textContent = '+';
		btn.classList.add('w3-button', 'w3-circle', 'w3-deep-purple', 'w3-ripple', 'w3-large');
		btn.onclick = async function() {
			id01.style.display = 'block';
			cat_name2.focus();
			add.onclick = async function() {
				if (await handle_input(cat_name2, self.B)) {
					const p = btn.parentNode;
					p.parentNode.removeChild(p);
					id01.style.display = 'none';
				}
			}
		}
		p.appendChild(btn);
		this.B.dom.appendChild(p);
	}
	createUI(graph) {
		this.graph = graph;
	}
	setURL() {
		const blocks = graph_container.getElementsByClassName('w3-panel'); // document.body.querySelectorAll('* [data-units]')
		let all_units = [];

		for (const elem of blocks) {
			let units = elem.dataset.units;
			if (units.endsWith(","))
				units = units.slice(0, -1);

			all_units.push(units);
		}

		const url = new URL(location.href);
		if (all_units.length)
			url.searchParams.set("units", all_units.join('|'));
		else
			url.searchParams.delete('units');
		history.pushState({}, "", url);
	}
	applyLevels() {

	}
	getAtks() {

	}
}

class CatDPSHelper extends UnitDPSHelper {
	constructor(B, F) {
		super(B, F);
		B.dom.parentNode.dataset.units += `${F.id}-${F.lvc},`;
		super.setURL();
	}
	createUI(graph) {
		this.t_lv = [];
		this.s_lv = [];

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
		this.lv_c = document.createElement('input');
		this.lv_c.classList.add('w3-input', 'w3-border', 'w3-round');
		this.lv_c.title = '貓咪的總等級';
		this.lv_c.inputMode = 'numeric';
		p.appendChild(this.lv_c);
		this.B.dom.appendChild(p);
		this.lv_c.onblur = function() {
			let num = this.value.match(/\d+/);
			if (!num) {
				this.value = '請輸入數字！';
				return;
			}
			self.cur_level = num[0];
			self.graph.render();
		}

		// set initial level
		this.cur_level = (this.s_lv.length || this.F.lvc == 3) ? 60 : 50;
	}
	createTalentInput() {
		const self = this;

		if (this.F.lvc >= 2 && this.F.talents) {
			for (let i = 1; i < 113; i += 14) {
				if (!this.F.talents[i]) break;
				((this.F.talents[i + 13] == 1) ? this.s_lv : this.t_lv).push(this.F.talents[i + 1] || 1);
				this.talent_types.add(this.F.talents[i]);
			}
		}

		const dps_ralated_talents = new Set([
			10, // 攻擊力上升
			13, // 會心一擊
			17, // 波動
			31, // 基本攻擊力上升
			50, // 渾身一擊
			56, // 烈波攻擊
			61, // 攻擊間隔縮短
			62, // 小波動
			65, // 小烈波
		]);

		if (this.F.lvc >= 2 && this.F.talents) {
			for (let i = 1; i < 113 && this.F.talents[i]; i += 14) {
				const talent_index = this.F.talents[i];
				if (!dps_ralated_talents.has(talent_index))
					continue;
				const name = units_scheme.talents.names[talent_index];
				const div = document.createElement('p');
				let p = div.appendChild(document.createElement('label'));
				const talent_type = this.F.talents[i + 13] === 1 ? '超本能' : '本能';
				p.textContent = `${talent_type} - ${name}`;
				p = div.appendChild(document.createElement('input'));
				p.classList.add('w3-input');
				p.style.paddingLeft = '0';
				p.style.paddingRight = '0';
				p.type = 'range';
				p.min = 0;
				p.value = p.max = (this.F.talents[i + 1] || 1).toString();
				p.step = 1;
				p.oninput = function() {
					let tal_cnt = 0;
					let sup_cnt = 0;
					for (let j = 1;j < 113;j += 14) {
						if (j == i) {
							if (self.F.talents[j + 13] == 1) {
								self.s_lv[sup_cnt] = parseInt(this.value);
							} else {
								self.t_lv[tal_cnt] = parseInt(this.value);
							}
							self.graph.render();
							return;
						}
						if (self.F.talents[j + 13] == 1)
							++sup_cnt;
						else

						++tal_cnt;
					}
				}
				this.B.dom.appendChild(div);
			}
		}
	}
	applyLevels() {
		const F = this.F.clone();
		F.level = this.cur_level;
		this.lv_c.value = F.level;
		if (F.talents && F.lvc >= 2) {
			F.applyTalents(this.t_lv);
			F.applySuperTalents(this.s_lv);
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
		B.dom.parentNode.dataset.units += `${F.id},`;
		super.setURL();
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
		this.mul_c = document.createElement('input');
		this.mul_c.classList.add('w3-input', 'w3-border', 'w3-round');
		this.mul_c.title = '倍率';
		this.mul_c.inputMode = 'numeric';
		p.appendChild(this.mul_c);
		this.B.dom.appendChild(p);
		this.mul_c.onblur = function() {
			let num = this.value.match(/\d+/);
			if (!num) {
				this.value = '請輸入數字！';
				return;
			}
			self.cur_multi = num[0];
			self.graph.render();
		}

		// set initial multiplier
		this.cur_multi = 100;
		this.mul_c.value = '100';
	}
	applyLevels() {
		return this.F;
	}
	getAtks(F) {
		const atks = [F.atk];

		if (F.info.atk1) atks.push(F.atk1);
		if (F.info.atk2) atks.push(F.atk2);

		if (this.cur_multi !== 100) {
			const mul = this.cur_multi / 100;
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
		this.H = helper.B.R.register(helper.title);
		this.is_normal = !((F.atkType & ATK_LD) || (F.atkType & ATK_OMNI));
		this.options = {};

		for (let i = 0; i < (F.info.atk1 ? (F.info.atk2 ? 3 : 2) : 1); ++i)
			this.abis.push(F.abEnabled(i) !== 0);

		helper.createUI(this);

		let select;
		if (F.ab.hasOwnProperty(AB_MASSIVE)) {
			this.options.massive = true;
			select = this.create_select('超大傷害', ['ON', 'OFF']);
		} else if (helper.talent_types.has(7)) {
			this.options.massive = true;
			select = this.create_select('超大傷害', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.massive = !this.selectedIndex;
				self.render();
			};
			select = null;
		}

		if (F.ab.hasOwnProperty(AB_MASSIVES)) {
			this.options.massives = true;
			this.create_select('極度傷害', ['ON', 'OFF']).oninput = function() {
				self.options.massives = !this.selectedIndex;
				self.render();
			};
		}

		if (F.ab.hasOwnProperty(AB_GOOD)) {
			this.options.good = true;
			select = this.create_select('善於攻擊', ['ON', 'OFF']);
		} else if (helper.talent_types.has(5)) {
			this.options.good = true;
			select = this.create_select('善於攻擊', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.good = !this.selectedIndex;
				self.render();
			};
			select = null;
		}

		if (F.ab.hasOwnProperty(AB_WKILL)) {
			this.options.wkill = true;
			select = this.create_select('終結魔女', ['ON', 'OFF']);
		} else if (helper.talent_types.has(42)) {
			this.options.wkill = true;
			select = this.create_select('終結魔女', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.wkill = !this.selectedIndex;
				self.render();
			};
			select = null;
		}


		if (F.ab.hasOwnProperty(AB_EKILL)) {
			this.options.ekill = true;
			select = this.create_select('終結使徒', ['ON', 'OFF']);
		} else if (helper.talent_types.has(43)) {
			this.options.ekill = true;
			select = this.create_select('終結使徒', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.ekill = !this.selectedIndex;
				self.render();
			};
			select = null;
		}


		if (F.ab.hasOwnProperty(AB_BSTHUNT)) {
			this.options.beast = true;
			select = this.create_select('超獸特效', ['ON', 'OFF']);
		} else if (helper.talent_types.has(64)) {
			this.options.beast = true;
			select = this.create_select('超獸特效', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.beast = !this.selectedIndex;
				self.render();
			};
			select = null;
		}

		if (F.ab.hasOwnProperty(AB_BAIL)) {
			this.options.bail = true;
			select = this.create_select('超生命體特效', ['ON', 'OFF']);
		} else if (helper.talent_types.has(63)) {
			this.options.bail = true;
			select = this.create_select('超生命體特效', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.bail = !this.selectedIndex;
				self.render();
			};
			select = null;
		}

		if (F.ab.hasOwnProperty(AB_SAGE)) {
			this.options.sage = true;
			select = this.create_select('超賢者特效', ['ON', 'OFF']);
		} else if (helper.talent_types.has(66)) {
			this.options.sage = true;
			select = this.create_select('超賢者特效', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.sage = !this.selectedIndex;
				self.render();
			};
			select = null;
		}

		if (F.ab.hasOwnProperty(AB_STRENGTHEN)) {
			this.options.strong = true;
			select = this.create_select('攻擊力上升', ['ON', 'OFF']);
		} else if (helper.talent_types.has(10)) {
			this.options.strong = true;
			select = this.create_select('攻擊力上升', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.strong = !this.selectedIndex;
				self.render();
			};
			select = null;
		}

		if (F.ab.hasOwnProperty(AB_ATKBASE)) {
			this.options.base = true;
			select = this.create_select('善於攻城', ['ON', 'OFF']);
		} else if (helper.talent_types.has(12)) {
			this.options.base = true;
			select = this.create_select('善於攻城', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (select) {
			select.oninput = function() {
				self.options.base = !this.selectedIndex;
				self.render();
			};
			select = null;
		}

		if (F.ab.hasOwnProperty(AB_CRIT) || helper.talent_types.has(13)) {
			this.options.crit = 0;
			this.create_select('會心一擊', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.crit = this.selectedIndex;
					self.render();
				};
		}

		if (F.ab.hasOwnProperty(AB_S) || helper.talent_types.has(50)) {
			this.options.s = 0;
			this.create_select('渾身一擊', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.s = this.selectedIndex;
					self.render();
				};
		}

		if (F.ab.hasOwnProperty(AB_WAVE) || helper.talent_types.has(17)) {
			this.options.wave = 0;
			this.create_select('波動', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.wave = this.selectedIndex;
					self.render();
				};
		}

		if (F.ab.hasOwnProperty(AB_MINIWAVE) || helper.talent_types.has(62)) {
			this.options.wave = 0;
			this.create_select('小波動', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.wave = this.selectedIndex;
					self.render();
				};
		}

		if (F.ab.hasOwnProperty(AB_SURGE) || helper.talent_types.has(56)) {
			this.options.surge = 0;
			this.create_select('烈波', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.surge = this.selectedIndex;
					self.render();
				};
		}

		if (F.ab.hasOwnProperty(AB_EXPLOSION)) {
			this.options.explosion = 0;
			this.create_select('爆波', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.explosion = this.selectedIndex;
					self.render();
				};
		}

		if (F.ab.hasOwnProperty(AB_MINISURGE) || helper.talent_types.has(65)) {
			this.options.surge = 0;
			this.create_select('小烈波', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.surge = this.selectedIndex;
					self.render();
				};
		}
		helper.createButtons();

		this.render();
	}
	create_select(title, texts) {
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
		this.helper.B.dom.appendChild(D);
		return select;
	}
	dps_at(x, buf) {
		let RAW = this.atks.slice();
		let sum = 0;
		buf ??= RAW;
		if (this.is_normal) {
			if (x < -320 || x > this.E.range) RAW.fill(0);
		} else {
			for (let i = 0; i < this.E.lds.length; ++i) {
				let a = this.E.lds[i];
				let b = a + this.E.ldr[i];
				if (a > b) {
					let tmp = a;
					a = b;
					b = tmp;
				}
				if (x < a || x > b) RAW[i] = 0;
			}
		}
		if (this.surge_data) {
			const ab = this.E.ab[AB_SURGE] || this.E.ab[AB_MINISURGE];
			const left_point = ab[1] - 250;
			const right_point = ab[2] + 125;
			if (x >= left_point && x <= right_point) {
				const mul = this.surge_data[x - left_point] * this.surge_mul;
				for (let i = 0; i < buf.length; ++i)
					if (this.abis[i]) buf[i] += ~~(this.atks[i] * mul);
			}
		}
		if (this.wave_pos) {
			if (x >= -67.5 && x <= this.wave_pos) {
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
		if (this.explosion_data) {
			const overlap = this.explosion_data[1] == this.explosion_data[2];
			let dir = 1;
			outer: do {
				for (let i = 0;i < 3;++i) {
					const dmg = (1 - 0.3 * i) * (this.options.explosion ? 1 : (this.explosion_data[0] / 100));
					let dis_0 = [0, 75, 175][i];
					let dis_1 = 75 + 100 * i;
					if (overlap) {
						dis_0 *= dir;
						dis_1 *= dir;
						if (dis_0 > dis_1) {
							let tmp = dis_0;
							dis_0 = dis_1;
							dis_1 = tmp;
						}
						const pos = x - this.explosion_data[1];
						if (pos > dis_0 && pos <= dis_1) {
							for (let i = 0; i < buf.length; ++i)
								if (this.abis[i]) buf[i] += ~~(this.atks[i] * dmg);
							break outer;
						}
					} else {
						let min_range, max_range;
						if (dir == -1 && !i)
							continue;
						if (!i) {
							dis_0 = -75;
							dis_1 = 75;
						}
						if (dir == 1) {
							min_range = this.explosion_data[1] + dis_0;
							max_range = this.explosion_data[2] + dis_1;
						} else {
							min_range = this.explosion_data[1] - dis_1;
							max_range = this.explosion_data[2] - dis_0;
						}
						if (x > min_range && x <= max_range) {
							const spawn_interval = this.explosion_data[2] - this.explosion_data[1];
							const max_interval = max_range - min_range;
							const width = [150, 100, 100][i];
							const double_width = width + width;
							let multi = dmg;

							if (double_width > max_interval) {
								const overlapped = double_width - max_interval;
								if (x > (min_range + width))
									multi *= (max_range - x) / (width - overlapped);
								else if (x < (max_range - width))
									multi *= (x - min_range) / (width - overlapped);
							} else {
								multi *= width / spawn_interval;
								if (x < (min_range + width))
									multi *= (x - min_range) / width;
								else if (x > (max_range - width))
									multi *= (max_range - x) / width;
							}
							for (let i = 0; i < buf.length; ++i)
								if (this.abis[i]) buf[i] += ~~(this.atks[i] * multi);
						}
					}
				}
				dir -= 2;
			} while (dir == -1);
		}
		for (let i of RAW) sum += i;
		return ~~(sum * 30 / this.E.attackF);
	}
	render() {
		const F = this.E = this.helper.applyLevels();
		this.atks = this.helper.getAtks(F);

		let x, Xs, T = F.trait & trait_treasure;

		if (this.options.base && F.ab.hasOwnProperty(AB_ATKBASE)) {
			for (let i = 0; i < this.atks.length; ++i)
				this.atks[i] *= 4;
		} else {
			x = F.ab[AB_CRIT];
			if (x) {
				if (!this.options.crit) {
					for (let i = 0; i < this.atks.length; ++i)
						if (this.abis[i]) this.atks[i] += ~~(this.atks[i] * x / 100);
				} else if (this.options.crit == 1) {
					for (let i = 0; i < this.atks.length; ++i)
						if (this.abis[i]) this.atks[i] *= 2;
				}
			}
			x = F.ab[AB_S];
			if (x) {
				if (!this.options.s) {
					for (let i = 0; i < this.atks.length; ++i)
						if (this.abis[i]) this.atks[i] = ~~(this.atks[i] * (1 + x[0] * x[1] / 10000));
				} else if (this.options.s == 1) {
					for (let i = 0; i < this.atks.length; ++i)
						if (this.abis[i]) this.atks[i] = ~~(this.atks[i] * (1 + x[1] / 100));
				}
			}
			if (this.options.strong && F.ab.hasOwnProperty(AB_STRENGTHEN))
				for (let i = 0; i < this.atks.length; ++i)
					if (this.abis[i]) this.atks[i] = ~~(this.atks[i] * (1 + (F.ab[AB_STRENGTHEN][1] / 100)));
			if (this.options.good) {
				for (let i = 0; i < this.atks.length; ++i) {
					this.atks[i] = ~~(this.atks[i] * (T ? 1.8 : 1.5));
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
					this.atks[i] = ~~(this.atks[i] * 2.5);
				}
			}
			if (this.options.bail) {
				for (let i = 0; i < this.atks.length; ++i) {
					this.atks[i] = ~~(this.atks[i] * 1.6);
				}
			}
			if (this.options.sage) {
				for (let i = 0; i < this.atks.length; ++i) {
					this.atks[i] = ~~(this.atks[i] * 1.2);
				}
			}
		}
		if (this.is_normal) {
			Xs = [
				[-320, true],
				[F.range, false],
				[F.range + 1, false]
			];
		} else {
			Xs = [];
			for (let i = 0; i < F.lds.length; ++i) {
				x = F.lds[i];
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
			Xs.push([(this.wave_pos = (132.5 + 200 * x[1])), false]);
		} else {
			this.wave_pos = null;
		}
		x = F.ab[AB_SURGE] || F.ab[AB_MINISURGE];
		if (x && this.options.surge != 2) {
			this.surge_data = surge_model(x[1], x[2], Xs);
			this.surge_mul = this.options.surge ?
				(x[3] / (x[2] - x[1])) :
				(x[0] * x[3]) / (100 * (x[2] - x[1]));
			if (F.ab[AB_MINISURGE]) this.surge_mul /= 5;
		} else {
			this.surge_data = null;
		}
		x = F.ab[AB_EXPLOSION];
		if (x && this.options.explosion != 2) {
			let dir = 1;
			this.explosion_data = x;

			do {
				for (let i = 0;i < 3;++i) {
					const width = [150, 100, 100][i];
					if (x[1] == x[2]) {
						const p = [75, 175, 275][i];
						Xs.push([x[1] + dir * p, false]);
						Xs.push([x[1] + dir * p + 1, false]);
					} else {
						if (dir == -1 && !i)
							continue;
						let dis_0, dis_1, min_range, max_range;
						if (!i) {
							dis_0 = -75;
							dis_1 = 75;
						} else {
							dis_0 = [0, 75, 175][i];
							dis_1 = 75 + 100 * i;
						}
						if (dir == 1) {
							min_range = this.explosion_data[1] + dis_0;
							max_range = this.explosion_data[2] + dis_1;
						} else {
							min_range = this.explosion_data[1] - dis_1;
							max_range = this.explosion_data[2] - dis_0;
						}
						Xs.push([min_range, false]);
						Xs.push([min_range + width, false]);
						Xs.push([max_range - width, false]);
						Xs.push([max_range, false]);
					}
				}
				dir -= 2;
			} while (dir == -1);
		}
		x = -Infinity;
		for (const e of Xs) x = Math.max(e[0], x);
		Xs.push([x + 20, false]);
		x = Infinity;
		for (const e of Xs) x = Math.min(e[0], x);
		Xs.push([x - 20, false]);
		Xs.sort((a, b) => a[0] - b[0]);
		let new_Xs = [];
		let new_Ys = [];
		let last_x = 0;
		let last_y = 0;
		let surge_sum;
		let SURGE_RAW;
		for (const X of Xs) {
			x = X[0];
			if (last_x == x) continue;
			
			if (this.surge_data || this.explosion_data) SURGE_RAW = new Array(this.atks.length).fill(0);

			const y = this.dps_at(x, SURGE_RAW);

			surge_sum = 0;
			if (this.surge_data || this.explosion_data) {
				surge_sum = 0;
				for (let i of SURGE_RAW) surge_sum += i;
				surge_sum = ~~(surge_sum * 30 / F.attackF)
			}
			if (last_y != y) {
				new_Xs.push(X[1] ? x : last_x);
				new_Ys.push((X[1] ? last_y : y) + surge_sum);
			}
			new_Xs.push(x);
			new_Ys.push(y + surge_sum);
			last_x = x;
			last_y = y;
		}
		this.H.Xs = new_Xs;
		this.H.Ys = new_Ys;

		this.H.D = this.dps_at.bind(this);
		if (this.helper.B.R.C() == 1 && (this.surge_data || this.wave_pos || this.explosion_data)) {
			let tmp;

			this.H.X2s = [];
			this.H.Y2s = [];

			last_x = last_y = 0;

			// disable surge/wave ability temporarily
			if (this.surge_data) {
				tmp = this.surge_data;
				this.surge_data = null;
			} else if (this.explosion_data) {
				tmp = this.explosion_data;
				this.explosion_data = null;
			} else {
				tmp = this.wave_pos;
				this.wave_pos = null;
			}

			// calculate DPS-graph without surge/wave
			for (const X of Xs) {
				x = X[0];
				if (last_x == x) continue;
				const y = this.dps_at(x);
				if (last_y != y) {
					this.H.X2s.push(X[1] ? x : last_x);
					this.H.Y2s.push((X[1] ? last_y : y));
				}
				this.H.X2s.push(x);
				this.H.Y2s.push(y);
				last_x = x;
				last_y = y;
			}

			// restore back data
			if (this.options.hasOwnProperty('surge'))
				this.surge_data = tmp;
			else if (this.options.hasOwnProperty('explosion'))
				this.explosion_data = tmp;
			else
				this.wave_pos = tmp;

			this.helper.B.R.plot(this.H);
			this.H.X2s = null;
			this.H.Y2s = null;
			return;
		}

		this.helper.B.R.plot(this.H);
	}
}

async function main(render) {
	cat_name.focus();
	document.getElementById('loader').hidden = true;

	const catIdb = await CatIdb.open();
	try {
		const catGen = CatIdb.forEachValue(catIdb);
		for await (const cat of catGen) {
			const o = document.createElement('option');
			o.value = cat.forms.map(CL => CL.name || CL.jp_name).join('/');
			CL.appendChild(o);
		}
	} finally {
		catIdb.close();
	}
	num_cats = CL.options.length;

	const enemyIdb = await EnemyIdb.open();
	try {
		const enemyGen = EnemyIdb.forEachValue(enemyIdb);
		for await (const enemy of enemyGen) {
			const o = document.createElement('option');
			o.value = enemy.name || enemy.jp_name;
			CL.appendChild(o);
		}
	} finally {
		enemyIdb.close();
	}
	num_enemies = CL.options.length - num_cats;

	const units = new URLSearchParams(location.search).get('units');
	if (units) {
		for (const part of units.split('|')) {
			let block;
			for (const subpart of part.split(',')) {
				if (subpart.indexOf('-') === -1) {
					const id = parseInt(subpart, 10);
					if (isFinite(id) && id < num_enemies) {
						const enemy = await loadEnemy(id);
						if (!block)
							block = new DPSBlock(graph_container, render);
						new DPSGraph(new EnemyDPSHelper(block, enemy));
					}
				} else {
					const ints = subpart.split('-');
					if (ints.length === 2) {
						const id = parseInt(ints[0], 10);
						const lvc = parseInt(ints[1], 10);
						if (isFinite(id) && isFinite(lvc) && id < num_cats) {
							const cat = await loadCat(id);
							if (lvc < cat.forms.length) {
								if (!block)
									block = new DPSBlock(graph_container, render);
								new DPSGraph(new CatDPSHelper(block, cat.forms[lvc]));
							}
						}
					}
				}
			}
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
		await handle_input(cat_name, render);
	});
	cat_name.addEventListener('focus', function() {
		this.select();
	});
}

export {
	main
};
