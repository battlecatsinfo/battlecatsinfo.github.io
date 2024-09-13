import {
	ATK_SINGLE,
	ATK_RANGE,
	ATK_LD,
	ATK_OMNI,
	ATK_KB_REVENGE,

	AB_STRONG,
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
	AB_MINIVOLC,
	AB_VOLC,
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
	AB_GLASS,
	AB_SHIELD,
	AB_DSHIELD,
	AB_COUNTER,
	AB_AFTERMATH,
	AB_SAGE,
	AB_SUMMON,
	AB_MK,

	units_scheme,

	trait_treasure,

	getAbiString,

	loadAllCats,
} from './unit.mjs';

const CF = document.getElementById('CF');
const CL = document.getElementById('CL');
const add = document.getElementById('add');
const cat_name = document.getElementById('cat-name');
const cat_name2 = document.getElementById('cat-name2');
const id01 = document.getElementById('id01');
let cats, adder;


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
	constructor(C) {
		let x, y;

		this.dom = document.createElement('div');
		this.dom.classList.add('w3-quarter', 'w3-container');
		y = document.createElement('div');
		y.classList.add('w3-threequarter', 'w3-container');
		this.R = new DPSRender(y);

		x = document.createElement('div');
		//x.classList.add('w3-row-padding', 'w3-card-4', 'w3-light-grey');
		x.classList.add('w3-panel', 'w3-border', 'w3-light-grey', 'w3-round-large');
		x.style.margin = '1em';
		x.style.padding = '0';
		x.appendChild(y);
		x.appendChild(this.dom);
		C.appendChild(x);
	}
}

class FormDPS {
	constructor(B, C, m) {
		const self = this;
		const talent_types = new Set();

		this.F = C.forms[m];
		this.abis = [];
		this.B = B;
		this.title = this.F.name || this.F.jp_name || '<未命名>';
		this.H = this.B.R.register(this.title);

		for (let i = 0; i < (this.F.atk1 ? (this.F.atk2 ? 3 : 2) : 1); ++i)
			this.abis.push((this.F.abi & (1 << 2 - i)) != 0);

		this.t_lv = [];
		this.s_lv = [];
		if (this.F.lvc >= 2 && C.info.talents) {
			for (let i = 1; i < 113; i += 14) {
				if (!C.info.talents[i]) break;
				((C.info.talents[i + 13] == 1) ? this.s_lv : this.t_lv).push(C.info.talents[i + 1] || 1);
				talent_types.add(C.info.talents[i]);
			}
		}
		this.is_normal = !((this.F.atkType & ATK_LD) || (this.F.atkType & ATK_OMNI));
		this.info = C.info;

		let x = document.createElement('h3');
		x.textContent = this.title;
		this.B.dom.appendChild(x);
		let obj = '';

		if (this.F.atkType & ATK_OMNI) {
			obj += '全方位';
		} else if (this.F.atk1 & ATK_LD) {
			obj += '遠方';
		} else {
			obj = '普通';
		}

		obj += (this.F.atkType & ATK_RANGE) ? '範圍攻擊' : '單體攻擊';

		x = document.createElement('div');
		if (this.abis.length > 1) {
			x = document.createElement('div');
			x.textContent = obj + getAbiString(this.F.abi);
		} else {
			x.textContent = obj;
		}
		this.B.dom.appendChild(x);

		if (this.F.lds) {
			const nums = '①②③';
			obj = '';
			for (let i = 0; i < this.F.lds.length; ++i) {
				const x = this.F.lds[i];
				const y = x + this.F.ldr[i];
				if (x <= y)
					obj += `${nums[i]}${x}～${y}`;
				else
					obj += `${nums[i]}${y}～${x}`;
			}
			x = document.createElement('div');
			x.textContent = `接觸點${this.F.range}，範圍：${obj}`;
		} else {
			x = document.createElement('div');
			x.textContent = '射程：' + this.F.range;
		}
		this.B.dom.appendChild(x);

		obj = null;

		x = document.createElement('p');
		let y = document.createElement('label');
		y.textContent = '等級';
		x.appendChild(y);
		this.lv_c = document.createElement('input');
		this.lv_c.classList.add('w3-input', 'w3-border', 'w3-round');
		this.lv_c.title = '貓咪的總等級';
		this.lv_c.inputMode = 'numeric';
		x.appendChild(this.lv_c);
		this.B.dom.appendChild(x);
		this.F.level = (this.s_lv.length || this.F.lvc == 3) ? 60 : 50;
		this.lv_c.value = this.F.level;
		this.lvm = this.F.getLevelMulti();
		this.lv_c.onblur = function() {
			let num = this.value.match(/\d+/);
			if (!num) {
				this.value = '請輸入數字！';
				return;
			}
			num = num[0];
			self.F.level = num;
			this.value = self.F.level;
			self.lvm = self.F.getLevelMulti();
			self.render();
		}
		this.options = {};
		if (this.F.ab.hasOwnProperty(AB_MASSIVE)) {
			this.options.massive = true;
			obj = this.create_select('超大傷害', ['ON', 'OFF']);
		} else if (talent_types.has(7)) {
			this.options.massive = true;
			obj = this.create_select('超大傷害', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (obj) {
			obj.oninput = function() {
				self.options.massive = !this.selectedIndex;
				self.render();
			};
			obj = null;
		}

		if (this.F.ab.hasOwnProperty(AB_MASSIVES)) {
			this.options.massives = true;
			this.create_select('極度傷害', ['ON', 'OFF']).oninput = function() {
				self.options.massives = !this.selectedIndex;
				self.render();
			};
		}

		if (this.F.ab.hasOwnProperty(AB_GOOD)) {
			this.options.good = true;
			obj = this.create_select('善於攻擊', ['ON', 'OFF']);
		} else if (talent_types.has(5)) {
			this.options.good = true;
			obj = this.create_select('善於攻擊', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (obj) {
			obj.oninput = function() {
				self.options.good = !this.selectedIndex;
				self.render();
			};
			obj = null;
		}

		if (this.F.ab.hasOwnProperty(AB_WKILL)) {
			this.options.wkill = true;
			obj = this.create_select('終結魔女', ['ON', 'OFF']);
		} else if (talent_types.has(42)) {
			this.options.wkill = true;
			obj = this.create_select('終結魔女', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (obj) {
			obj.oninput = function() {
				self.options.wkill = !this.selectedIndex;
				self.render();
			};
			obj = null;
		}


		if (this.F.ab.hasOwnProperty(AB_EKILL)) {
			this.options.ekill = true;
			obj = this.create_select('終結使徒', ['ON', 'OFF']);
		} else if (talent_types.has(43)) {
			this.options.ekill = true;
			obj = this.create_select('終結使徒', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (obj) {
			obj.oninput = function() {
				self.options.ekill = !this.selectedIndex;
				self.render();
			};
			obj = null;
		}


		if (this.F.ab.hasOwnProperty(AB_BSTHUNT)) {
			this.options.beast = true;
			obj = this.create_select('超獸特效', ['ON', 'OFF']);
		} else if (talent_types.has(64)) {
			this.options.beast = true;
			obj = this.create_select('超獸特效', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (obj) {
			obj.oninput = function() {
				self.options.beast = !this.selectedIndex;
				self.render();
			};
			obj = null;
		}

		if (this.F.ab.hasOwnProperty(AB_BAIL)) {
			this.options.bail = true;
			obj = this.create_select('超生命體特效', ['ON', 'OFF']);
		} else if (talent_types.has(63)) {
			this.options.bail = true;
			obj = this.create_select('超生命體特效', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (obj) {
			obj.oninput = function() {
				self.options.bail = !this.selectedIndex;
				self.render();
			};
			obj = null;
		}

		if (this.F.ab.hasOwnProperty(AB_SAGE)) {
			this.options.sage = true;
			obj = this.create_select('超賢者特效', ['ON', 'OFF']);
		} else if (talent_types.has(66)) {
			this.options.sage = true;
			obj = this.create_select('超賢者特效', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (obj) {
			obj.oninput = function() {
				self.options.sage = !this.selectedIndex;
				self.render();
			};
			obj = null;
		}

		if (this.F.ab.hasOwnProperty(AB_STRONG)) {
			this.options.strong = true;
			obj = this.create_select('攻擊力上升', ['ON', 'OFF']);
		} else if (talent_types.has(10)) {
			this.options.strong = true;
			obj = this.create_select('攻擊力上升', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (obj) {
			obj.oninput = function() {
				self.options.strong = !this.selectedIndex;
				self.render();
			};
			obj = null;
		}

		if (this.F.ab.hasOwnProperty(AB_ATKBASE)) {
			this.options.base = true;
			obj = this.create_select('善於攻城', ['ON', 'OFF']);
		} else if (talent_types.has(12)) {
			this.options.base = true;
			obj = this.create_select('善於攻城', ['ON（本能解放)', 'OFF（無本能）']);
		}
		if (obj) {
			obj.oninput = function() {
				self.options.base = !this.selectedIndex;
				self.render();
			};
			obj = null;
		}

		if (this.F.ab.hasOwnProperty(AB_CRIT) || talent_types.has(13)) {
			this.options.crit = 0;
			this.create_select('會心一擊', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.crit = this.selectedIndex;
					self.render();
				};
		}

		if (this.F.ab.hasOwnProperty(AB_S) || talent_types.has(50)) {
			this.options.s = 0;
			this.create_select('渾身一擊', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.s = this.selectedIndex;
					self.render();
				};
		}

		if (this.F.ab.hasOwnProperty(AB_WAVE) || talent_types.has(17)) {
			this.options.wave = 0;
			this.create_select('波動', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.wave = this.selectedIndex;
					self.render();
				};
		}

		if (this.F.ab.hasOwnProperty(AB_MINIWAVE) || talent_types.has(62)) {
			this.options.wave = 0;
			this.create_select('小波動', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.wave = this.selectedIndex;
					self.render();
				};
		}

		if (this.F.ab.hasOwnProperty(AB_VOLC) || talent_types.has(56)) {
			this.options.volc = 0;
			this.create_select('烈波', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.volc = this.selectedIndex;
					self.render();
				};
		}

		if (this.F.ab.hasOwnProperty(AB_MINIVOLC) || talent_types.has(65)) {
			this.options.volc = 0;
			this.create_select('小烈波', [`期望值`, '最大值（100%）', '無'])
				.oninput = function() {
					self.options.volc = this.selectedIndex;
					self.render();
				};
		}

		if (this.F.lvc >= 2 && this.info.talents) {
			for (let i = 1; i < 113 && this.info.talents[i]; i += 14) {
				obj = units_scheme.talents.names[this.info.talents[i]];
				if (!obj) continue;
				const div = document.createElement('p');
				let p = div.appendChild(document.createElement('label'));
				p.textContent = '本能 - ' + obj;
				p = div.appendChild(document.createElement('input'));
				p.classList.add('w3-input');
				p.style.paddingLeft = '0';
				p.style.paddingRight = '0';
				p.type = 'range';
				p.min = 0;
				p.value = p.max = (this.info.talents[i + 1] || 1).toString();
				p.step = 1;
				p.oninput = function() {
					let tal_cnt = 0;
					let sup_cnt = 0;
					for (let j = 1;j < 113;j += 14) {
						if (j == i) {
							if (self.info.talents[j + 13] == 1) {
								self.s_lv[sup_cnt] = parseInt(this.value);
							} else {
								self.t_lv[tal_cnt] = parseInt(this.value);
							}
							self.render();
							return;
						}
						if (self.info.talents[j + 13] == 1)
							++sup_cnt;
						else

						++tal_cnt;
					}
				}
				this.B.dom.appendChild(div);
			}
		}

		obj = document.createElement('button');
		obj.textContent = '下載';
		obj.classList.add('w3-button', 'w3-teal', 'w3-round');
		obj.onclick = function() {
			self.B.R.D();
		}
		obj.style.marginRight = '0.5em';
		this.B.dom.appendChild(obj);

		obj = document.createElement('button');
		obj.textContent = '複製';
		obj.classList.add('w3-button', 'w3-green', 'w3-round');
		obj.onclick = function() {
			navigator.clipboard.writeText(self.B.R.text());
			this.textContent = '成功';
			const u = this;
			setTimeout(function() {
				u.textContent = '複製';
			}, 500);
		}
		obj.style.marginRight = '0.5em';
		this.B.dom.appendChild(obj);

		obj = document.createElement('button');
		obj.textContent = '刪除';
		obj.classList.add('w3-button', 'w3-red', 'w3-round');
		obj.onclick = function() {
			const x = self.B.dom.parentNode;
			self.B.R.destroy();
			x.parentNode.removeChild(x);
		}
		obj.style.marginRight = '0.5em';
		this.B.dom.appendChild(obj);

		obj = document.createElement('button');
		obj.textContent = '+';
		obj.classList.add('w3-button', 'w3-circle', 'w3-deep-purple', 'w3-ripple', 'w3-large');
		obj.onclick = function() {
			id01.style.display = 'block';
			adder = this;
			cat_name2.focus();
			add.onclick = function() {
				const X = CL.options;
				const Y = cat_name2.value;
				for (let i = 0; i < X.length; ++i) {
					if (X[i].value == Y) {
						const X = cats[i].forms.length;
						let m = CF.selectedIndex;
						if (m <= 3) {
							if (m >= X) {
								alert('此貓咪沒有第' + (m + 1) + '型態');
								return;
							}
						} else {
							m = X - 1;
						}
						const x = adder.parentNode;
						x.removeChild(adder.previousElementSibling);
						x.removeChild(adder.previousElementSibling);
						x.removeChild(adder.previousElementSibling);
						x.removeChild(adder);
						id01.style.display = 'none';
						new FormDPS(self.B, cats[i], m);
						cat_name2.value = '';
						return;
					}
				}
			}
		}
		this.B.dom.appendChild(obj);

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
		this.B.dom.appendChild(D);
		return select;
	}
	dps_at(x) {
		let RAW = this.atks.slice();
		let sum = 0;
		if (this.is_normal) {
			if (x < -320 || x > this.E.range) RAW.fill(0);
			if (this.surge_data) {
				const ab = this.E.ab[AB_VOLC] || this.E.ab[AB_MINIVOLC];
				const left_point = ab[1] - 250;
				const right_point = ab[2] + 125;
				if (x >= left_point && x <= right_point) {
					const mul = this.surge_data[x - left_point] * this.surge_mul;
					for (let i = 0; i < RAW.length; ++i)
						if (this.abis[i]) RAW[i] += ~~(this.atks[i] * mul);
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
			if (this.surge_data) {
				const ab = this.E.ab[AB_VOLC] || this.E.ab[AB_MINIVOLC];
				const left_point = ab[1] - 250;
				const right_point = ab[2] + 125;
				if (x >= left_point && x <= right_point) {
					const mul = this.surge_data[x - left_point] * this.surge_mul;
					for (let i = 0; i < RAW.length; ++i)
						if (this.abis[i]) RAW[i] += ~~(this.atks[i] * mul);
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
		}
		for (let i of RAW) sum += i;
		return ~~(sum * 30 / this.E.attackF);
	}
	render() {
		const F = this.F.clone();
		this.E = F;
		let x, Xs;
		this.atks = [F.atk];

		if (this.info.talents && F.lvc >= 2) {
			F.applyTalents(this.t_lv);
			F.applySuperTalents(this.s_lv);
		}

		if (F.atk1) this.atks.push(F.atk1);
		if (F.atk2) this.atks.push(F.atk2);

		let T = F.trait & trait_treasure;

		for (let i = 0; i < this.atks.length; ++i) this.atks[i] = ~~(
			(
				~~(Math.round(this.atks[i] * this.lvm) * 2.5)) * F.atkM);

		if (this.options.base && F.ab.hasOwnProperty(AB_ATKBASE)) {
			for (let i = 0; i < this.atks.length; ++i)
				this.atks[i] = ~~(this.atks[i] * (1 + (F.ab[AB_ATKBASE][0] / 100)));
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
			if (this.options.strong && F.ab.hasOwnProperty(AB_STRONG))
				for (let i = 0; i < this.atks.length; ++i)
					if (this.abis[i]) this.atks[i] = ~~(this.atks[i] * (1 + (F.ab[AB_STRONG][1] / 100)));
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
		x = F.ab[AB_VOLC] || F.ab[AB_MINIVOLC];
		if (x && this.options.volc != 2) {
			this.surge_data = surge_model(x[1], x[2], Xs);
			this.surge_mul = this.options.volc ?
				(x[4] / (x[2] - x[1])) :
				(x[0] * x[4]) / (100 * (x[2] - x[1]));
			if (F.ab[AB_MINIVOLC]) this.surge_mul /= 5;
		} else {
			this.surge_data = null;
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
		let sum;
		let surge_sum;
		let RAW;
		let SURGE_RAW;
		for (const X of Xs) {
			x = X[0];
			if (last_x == x) continue;
			RAW = this.atks.slice();
			if (this.surge_data) SURGE_RAW = new Array(this.atks.length).fill(0);
			sum = 0;
			surge_sum = 0;
			if (this.is_normal) {
				if (x < -320 || x > F.range) RAW.fill(0);
				if (this.surge_data) {
					const ab = F.ab[AB_VOLC] || F.ab[AB_MINIVOLC];
					const left_point = ab[1] - 250;
					const right_point = ab[2] + 125;
					if (x >= left_point && x <= right_point) {
						const mul = this.surge_data[x - left_point] * this.surge_mul;
						for (let i = 0; i < RAW.length; ++i)
							if (this.abis[i]) SURGE_RAW[i] += ~~(this.atks[i] * mul);
					}
				}
				if (this.wave_pos) {
					if (x >= -67.5 && x <= this.wave_pos) {
						const ab = F.ab[AB_WAVE] || F.ab[AB_MINIWAVE];
						const mini = F.ab[AB_MINIWAVE] ? 0.2 : 1;
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
			} else {
				for (let i = 0; i < F.lds.length; ++i) {
					let a = F.lds[i];
					let b = a + F.ldr[i];
					if (a > b) {
						let tmp = a;
						a = b;
						b = tmp;
					}
					if (x < a || x > b) RAW[i] = 0;
				}
				if (this.surge_data) {
					const ab = F.ab[AB_VOLC] || F.ab[AB_MINIVOLC];
					const left_point = ab[1] - 250;
					const right_point = ab[2] + 125;
					if (x >= left_point && x <= right_point) {
						const mul = this.surge_data[x - left_point] * this.surge_mul;
						for (let i = 0; i < RAW.length; ++i)
							if (this.abis[i]) SURGE_RAW[i] += ~~(this.atks[i] * mul);
					}
				}
				if (this.wave_pos) {
					if (x >= -67.5 && x <= this.wave_pos) {
						const ab = F.ab[AB_WAVE] || F.ab[AB_MINIWAVE];
						const mini = F.ab[AB_MINIWAVE] ? 0.2 : 1;
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
			}
			for (let i of RAW) sum += i;
			sum = ~~(sum * 30 / F.attackF);
			if (this.surge_data) {
				surge_sum = 0;
				for (let i of SURGE_RAW) surge_sum += i;
				surge_sum = ~~(surge_sum * 30 / F.attackF)
			}
			if (last_y != sum) {
				new_Xs.push(X[1] ? x : last_x);
				new_Ys.push((X[1] ? last_y : sum) + surge_sum);
			}
			new_Xs.push(x);
			new_Ys.push(sum + surge_sum);
			last_x = x;
			last_y = sum;
		}

		this.H.D = this.dps_at.bind(this);

		if (this.surge_data && this.B.R.C() == 1) {
			const tmp = this.surge_data;
			this.surge_data = null;
			this.H.X2s = [];
			this.H.Y2s = [];

			last_x = last_y = 0;

			for (const X of Xs) {
				x = X[0];
				if (last_x == x) continue;
				sum = this.dps_at(x);
				if (last_y != sum) {
					this.H.X2s.push(X[1] ? x : last_x);
					this.H.Y2s.push((X[1] ? last_y : sum) + surge_sum);
				}
				this.H.X2s.push(x);
				this.H.Y2s.push(sum + surge_sum);
				last_x = x;
				last_y = sum;
			}

			this.surge_data = tmp;
			this.H.Xs = new_Xs;
			this.H.Ys = new_Ys;
			this.B.R.plot(this.H);
			this.H.X2s = null;
			this.H.Y2s = null;
			return;
		}
		this.H.Xs = new_Xs;
		this.H.Ys = new_Ys;
		this.B.R.plot(this.H);
	}
}

loadAllCats().then(s => {
	let o;
	document.getElementById('loader').style.display = 'none';
	cats = s;
	for (let i = 0; i < s.length; ++i) {
		o = document.createElement('option');
		o.value = s[i].forms.map(CL => CL.name || CL.jp_name).join('/');
		CL.appendChild(o);
	}
	cat_name.focus();
});
document.getElementById('ok').onclick = function() {
	const X = CL.options;
	const Y = cat_name.value;
	for (let i = 0; i < X.length; ++i) {
		if (X[i].value == Y) {
			const X = cats[i].forms.length;
			let m = CF.selectedIndex;
			if (m <= 3) {
				if (m >= X) {
					alert('此貓咪沒有第' + (m + 1) + '型態');
					return;
				}
			} else {
				m = X - 1;
			}
			new FormDPS(new DPSBlock(document.body), cats[i], m);
			cat_name.value = '';
			return;
		}
	}
	alert('無法識別輸入的貓咪！請檢查名稱是否正確！');
};
