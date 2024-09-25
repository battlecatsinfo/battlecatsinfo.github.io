var mult = document.getElementById('mult'),
	mult_atk = document.getElementById('mult-atk'),
	st_mag = document.getElementById('st-mag'),
	my_params = new URLSearchParams(location.search),
	my_id = parseInt(my_params.get('id')),
	stats = document.getElementById('stats'),
	chs = stats.children,
	specials = chs[3].children[1],
	my_mult = my_params.get('mult') || my_params.get('mag'),
	atk_mag = my_params.get('atkMag'),
	stageMag = my_params.get('stageMag'),
	enemy_content = document.getElementById('ctn'),
	set = new Set(),
	E, I, dst_g, modal;
if (isNaN(my_id))
	my_id = 0;

function hClick(event) {
	event.preventDefault();
	event.stopPropagation();
	if (this.s) {
		this.style.removeProperty('background-color');
		this.s = false;
		set.delete(this.i);
	} else {
		this.style.setProperty('background-color', '#5cabd273', 'important');
		this.s = true;
		set.add(this.i);
	}
	calc();
}

function T(s, icon) {
	let p = document.createElement('div');
	p.style.cursor = 'pointer';
	let U = new Image(40, 40);
	U.src = 'https://i.imgur.com/' + icon + '.png';
	p.appendChild(U);
	p.append(s);
	p.i = I;
	p.s = false;
	p.onclick = hClick;
	specials.appendChild(p);
}

function W(s, icon) {
	let p = document.createElement('div');
	let i = document.createElement('img');
	i.src = 'https://i.imgur.com/' + icon + '.png';
	p.appendChild(i);
	p.append(s);
	specials.appendChild(p);
}

function createAbIcons() {
	createImuIcons(E.imu, specials);
	let d, U = E.pre1 ? '*' : '';
	if (E.trait & TB_SAGE) {
		W(`超賢者：受到我方的所有妨害減少 70%`, 'ERkdLLP');
	}
	for ([I, d] of Object.entries(E.ab)) {
		switch (I = parseInt(I)) {
			case AB_KB:
				W(`${d[0]} % 打飛敵人${U}`, 'cLZsanQ');
				break;
			case AB_STOP:
				W(`${d[0]} % 使動作停止${U}持續 ${numStrT(d[1])}，控場覆蓋率 ${getCoverUnit(E, d[0], d[1])} %`, 'i1pP3Mi');
				break;
			case AB_SLOW:
				W(`${d[0]} % 使動作變慢${U}持續 ${numStrT(d[1])}，控場覆蓋率 ${getCoverUnit(E, d[0], d[1])} %`, 'MyoCUMu');
				break;
			case AB_CRIT:
				T(`${d} % 會心一擊${U}`, 'FV6We1L');
				break;
			case AB_ATKBASE:
				T(`善於攻城（對塔傷害 4 倍）`, 'xIcbDzl');
				break;
			case AB_WAVE:
				T(`${d[0]} % 發射 Lv${d[1]} 波動${U}`, 'ZbPqGoj');
				break;
			case AB_MINIWAVE:
				T(`${d[0]} % 發射 Lv${d[1]} 小波動${U}`, 'W18c1hw');
				break;
			case AB_WEAK:
				W(`${d[0]} % 降低攻擊力${U}至 ${d[2]} % 持續 ${numStrT(d[1])}，控場覆蓋率 ${getCoverUnit(E, d[0], d[1])} %`, 'yRkhAHL');
				break;
			case AB_STRONG:
				T(`血量 ${d[0]} % 以下攻擊力上升至 ${100 + d[1]} %`, 'IE6ihRp');
				break;
			case AB_LETHAL:
				W(`死後 ${d} % 以1血量復活`, 'WcMDxXS');
				break;
			case AB_WAVES:
				W(`波動滅止`, 'BH3LOrK');
				break;
			case AB_BURROW:
				W(`進入射程範圍時鑽地 ${numStr(d[1])} 距離（${d[0] == -1 ? '無限' : d[0].toString() + ' '}次）`, 'j9psrEP');
				break;
			case AB_REVIVE:
				W(`擊倒後 ${numStrT(d[1])} 以 ${d[2]} % 血量復活（${d[0] == -1 ? '無限' : d[0].toString() + ' '}次）`, 'BX2GLgu');
				break;
			case AB_WARP:
				W(`${d[0]} % 將目標向${d[2] < 0 ? '前' : '後'}傳送${U} ${Math.abs(d[2])} 距離持續 ${numStrT(d[1])}`, 'KkYm2Og');
				break;
			case AB_CURSE:
				W(`${d[0]} % 詛咒${U}持續 ${numStrT(d[1])}，控場覆蓋率 ${getCoverUnit(E, d[0], d[1])} %`, '0Rraywl');
				break;
			case AB_S:
				T(`${d[0]} % 渾身一擊${U}（攻擊力增加至 ${100 + d[1]} %）`, 'KDpH72p');
				break;
			case AB_IMUATK:
				W(`${d[0]} % 發動攻擊無效持續 ${numStrT(d[1])}`, '8Eq6vPV');
				break;
			case AB_GLASS:
				W('一次攻擊(自殺)', 'VY93npj');
				break;
			case AB_SHIELD:
				W(`護盾 ${numStr(d[0])} HP`, 'l2VfcmX');
				break;
			case AB_DSHIELD: {
				let p = document.createElement('div');
				p.style.cursor = 'pointer';
				let U = new Image(40, 40);
				U.src = 'https://i.imgur.com/LESVycw.png';
				p.appendChild(U);
				dst_g = document.createElement('span');
				dst_g.textContent = ~~(Math.round(d[0] * (my_mult / 100)) * (stageMag / 100));
				p.append('惡魔盾 ');
				p.appendChild(dst_g);
				p.append(` HP，KB時惡魔盾恢復 ${d[1]} %`);
				p.i = I;
				p.s = false;
				p.onclick = hClick;
				specials.appendChild(p);
			}
			break;
			case AB_COUNTER:
				W('烈波反擊', 'tchDtAr');
				break;
			case AB_AFTERMATH:
				W(`死後 ${d[0]} % 發射 Lv${d[3]}烈波（範圍 ${d[1]}～${d[2]}，持續 ${numStrT(d[3]*20)}）`, 'WmB7utZ');
				break;
			case AB_POIATK:
				W(`${d[0]} % 毒擊（造成角色血量 ${(d[1])} % 傷害）`, '6O6zwrp');
				break;
			case AB_VOLC:
				T(`${d[0]} % 發射 Lv${d[3]} 烈波（出現位置 ${d[1]}～${d[2]}，持續 ${numStrT(d[3]*20)}）`, 'at4bW0n');
				break;
			case AB_MINIVOLC:
				T(`${d[0]} % 發射 Lv${d[3]} 小烈波（出現位置 ${d[1]}～${d[2]}，持續 ${numStrT(d[3]*20)}）`, 'AEITK8t');
				break;
		}
	}
}

function calc() {
	const _atk_mag = atk_mag / 100;
	const _my_mult = my_mult / 100;
	const _stageM = stageMag / 100;
	let HP = E.hp;
	let atk = E.atk;
	let atk1 = E.atk1;
	let atk2 = E.atk2;
	if (E.trait & TB_ALIEN) {
		let m;
		if (E.star == 1)
			m = 16 - treasures[22] / 100;
		else
			m = 7 - treasures[21] / 100;
		HP *= m;
		atk *= m;
		atk1 *= m;
		atk2 *= m;
	} else if (E.star >= 2) {
		let m;
		switch (E.star) {
			case 2:
				m = 11 - (treasures[20] / 10);
				break;
			case 3:
				m = 11 - (treasures[24] / 10);
				break;
			case 4:
				m = 11 - (treasures[30] / 10);
				break;
		}
		HP *= m;
		atk *= m;
		atk1 *= m;
		atk2 *= m;
	}
	atk = ~~(Math.round(atk * _atk_mag) * _stageM);
	atk1 = ~~(Math.round(atk1 * _atk_mag) * _stageM);
	atk2 = ~~(Math.round(atk2 * _atk_mag) * _stageM);
	HP = ~~(Math.round(HP * _my_mult) * _stageM);
	let DPS = atk + atk1 + atk2;

	function ATK(x) {
		atk *= x;
		atk1 *= x;
		atk2 *= x;
	}
	for (let k of set) {
		const v = E.ab[k];
		switch (k) {
			case AB_CRIT:
				DPS *= (1 + v / 100);
				ATK(2);
				break;
			case AB_S:
				DPS *= (1 + (v[0] * v[1] / 10000));
				ATK(1 + v[1] / 100);
				break;
			case AB_ATKBASE:
				DPS *= 4;
				ATK(4);
				break;
			case AB_WAVE:
				ATK(2);
				DPS *= (1 + v[0] / 100);
				break;
			case AB_MINIWAVE:
				ATK(1.2);
				DPS *= (1 + v[0] / 500);
				break;
			case AB_VOLC:
				ATK(1 + v[3]);
				DPS *= (1 + v[3] * v[0] / 100);
				break;
			case AB_MINIVOLC:
				ATK(1 + v[3] / 5);
				DPS *= (1 + v[3] * v[0] / 500);
				break;
			case AB_STRONG: {
				const a = 1 + v[1] / 100;
				ATK(a);
				DPS *= a;
				break;
			}
			case AB_DSHIELD: {
				const s = ~~(Math.round(v[0] * _my_mult) * _stageM);
				HP += ~~(s + s * (v[1] / 100) * (E.kb - 1));
				break;
			}
		}
	}
	if (E.ab[AB_DSHIELD]) {
		if (dst_g) {
			dst_g.textContent = ~~(Math.round(E.ab[AB_DSHIELD][0] * _my_mult) * _stageM);
		}
	}
	chs[0].children[2].textContent = numStr(HP);
	chs[0].children[4].textContent = [atk, atk1, atk2].filter(x => x).map(numStr).join('/');
	chs[1].children[3].textContent = numStr(~~(DPS * 30 / E.attackF));
}

function hfocus() {
	this.focus();
	const s = window.getSelection();
	const r = document.createRange();
	r.selectNodeContents(this);
	s.removeAllRanges();
	s.addRange(r);
}

function search_for() {
	modal = document.getElementById('modal-c');
	modal.textContent = '載入中...';
	document.getElementById('modal').style.display = 'block';
	_really_search();
}

function namefor(v) {
	return v.name || v.nameJp || '？？？';
}

async function _really_search() {
	await utils.loadStageData();
	const {grpName: groupNames} = await utils.getStageExtra(['grpName']);
	really_search.groupNames = groupNames;
	_really_search = really_search;
	await really_search();
}

async function really_search() {
	let previous_td, previous_mc, previous_td2, previous_sm;
	const target = my_id.toString(36);
	let tbl = document.createElement('table');
	tbl.classList.add('w3-table', 'w3-centered', 'Co');
	let tr = document.createElement('tr');
	tbl.appendChild(tr);
	let td = document.createElement('td');
	td.textContent = '分類';
	tr.appendChild(td);
	td = document.createElement('td');
	td.textContent = '地圖';
	tr.appendChild(td);
	tr.appendChild(td);
	td = document.createElement('td');
	td.textContent = '關卡';
	tr.appendChild(td);
	tbl.classList.add('w3-table', 'w3-centered', 'Co');
	modal.textContent = '';
	modal.appendChild(tbl);

	for await (const [key, v] of utils.forEachStage()) {
		for (const group of v.enemyLines.split('|')) {
			if (group.slice(0, group.indexOf(',')) == target) {
				const mc = ~~(key / 1000000);
				const st = key % 1000;
				const sm = ~~((key - mc * 1000000) / 1000);
				const tr = document.createElement('tr');
				let td;

				if (previous_mc == mc) {
					previous_td.rowSpan += 1;
				} else {
					td = document.createElement('td');
					td.textContent = really_search.groupNames[mc];
					tr.appendChild(td);
					previous_td = td;
					previous_mc = mc;
					previous_sm = null;
				}

				if (previous_sm == sm) {
					previous_td2.rowSpan += 1;
				} else {
					const td0 = document.createElement('td');
					utils.getMap(~~(key / 1000)).then(map => {
						td0.textContent = namefor(map);
					});
					tr.appendChild(td0);
					previous_sm = sm;
					previous_td2 = td0;
				}

				td = document.createElement('td')
				a = document.createElement('a');
				a.textContent = v.name || v.nameJp;
				a.href = `/stage.html?s=${mc}-${sm}-${st}`;
				a.target = a.target = '_blank';
				td.appendChild(a);
				tr.appendChild(td);

				tbl.appendChild(tr);
				break;
			}
		}
	}
}
loadEnemy(my_id)
	.then(e => {
		E = e;
		document.getElementById('loader').style.display = 'none';
		document.getElementById('main').style.display = 'block';
		if (my_mult) {
			my_mult = parseInt(my_mult);
			if (isNaN(my_mult))
				my_mult = 100;
		} else {
			my_mult = 100;
		}
		if (atk_mag) {
			atk_mag = parseInt(atk_mag);
			if (isNaN(atk_mag))
				atk_mag = my_mult;
		} else {
			atk_mag = my_mult;
		}
		if (stageMag) {
			stageMag = parseInt(stageMag);
			if (isNaN(stageMag))
				stageMag = 100;
		} else {
			stageMag = 100;
		}
		mult.textContent = '倍率:' + my_mult.toString() + '%';
		mult_atk.textContent = '攻擊倍率:' + atk_mag.toString() + '%';
		st_mag.textContent = '★倍率:' + stageMag.toString() + '%';
		const title = [E.name, E.jp_name].filter(x => x).join('/') || '?';
		document.title = title;
		document.getElementById('e-id').textContent = title;
		var traits = [];
		if (E.trait & TB_RED)
			traits.push('紅色敵人');
		if (E.trait & TB_FLOAT)
			traits.push('漂浮敵人');
		if (E.trait & TB_BLACK)
			traits.push('黑色敵人');
		if (E.trait & TB_METAL)
			traits.push('鋼鐵敵人');
		if (E.trait & TB_ANGEL)
			traits.push('天使敵人');
		if (E.trait & TB_ALIEN) {
			if (E.star == 1)
				traits.push('異星戰士（有星星）');
			else
				traits.push('異星戰士');
		}
		if (E.trait & TB_ZOMBIE)
			traits.push('不死生物');
		if (E.trait & TB_RELIC)
			traits.push('古代種');
		if (E.trait & TB_WHITE)
			traits.push('無屬性敵人');
		if (E.trait & TB_EVA)
			traits.push('使徒');
		if (E.trait & TB_WITCH)
			traits.push('魔女');
		if (E.trait & TB_DEMON)
			traits.push('惡魔');
		if (E.trait & TB_BEAST)
			traits.push('超獸');
		if (E.trait & TB_BARON)
			traits.push('超生命體');
		if (E.trait & TB_INFN)
			traits.push('道場塔');
		if (E.trait & TB_SAGE)
			traits.push('超賢者');
		chs[0].children[8].textContent = traits.join('・');
		if (E.atk1 || E.atk2) {
			const atkNum = E.atk2 ? 3 : 2;
			const atksPre = [E.atk, E.atk1, E.atk2].slice(0, atkNum).map(x => numStr((x / (E.atk + E.atk1 + E.atk2)) * 100) + ' %');
			specials.append(`${atkNum}回連續攻擊（傷害 ${atksPre.join(' / ')}）` + getAbiString(E.abi));
			specials.appendChild(document.createElement('br'));
		}
		var X = '';
		if (E.atkType & ATK_OMNI)
			X += '全方位';
		else if (E.atkType & ATK_LD)
			X += '遠方';
		X += (E.atkType & ATK_RANGE) ? '範圍攻擊' : '單體攻擊';
		if (E.atkType & ATK_KB_REVENGE)
			X += '・擊退反擊';
		if (E.lds) {
			const nums = '①②③';
			var s = '';
			for (let i = 0; i < E.lds.length; ++i) {
				const x = E.lds[i];
				const y = x + E.ldr[i];
				if (x <= y)
					s += `${nums[i]}${x}～${y}`;
				else
					s += `${nums[i]}${y}～${x}`;
			}
			X += `・範圍 ${s}`;
		}
		if (E.atkType & ATK_RANGE) {
			const s = new Image(40, 40);
			s.src = 'https://i.imgur.com/BeuHYlZ.png';
			specials.appendChild(s);
		} else {
			const s = new Image(40, 40);
			s.src = 'https://i.imgur.com/CZwFP3H.png';
			specials.appendChild(s);
		}
		if (E.atkType & ATK_LD) {
			const s = new Image(40, 40);
			s.src = 'https://i.imgur.com/fYILfa8.png';
			specials.appendChild(s);
		}
		if (E.atkType & ATK_OMNI) {
			const s = new Image(40, 40);
			s.src = 'https://i.imgur.com/rvGrwIL.png';
			specials.appendChild(s);
		}
		if (E.atkType & ATK_KB_REVENGE) {
			const s = new Image(40, 40);
			s.src = 'https://i.imgur.com/KqtrO2b.png';
			specials.appendChild(s);
		}
		specials.append(X);
		specials.appendChild(document.createElement('br'));
		X = chs[0].children[0].children[0];
		X.src = `/img/e/${E.i}/0.png`;
		chs[2].children[3].textContent = numStrT(E.backswing);
		chs[2].children[5].textContent = numStrT(E.tba);
		chs[2].children[7].textContent = numStrT(E.attackF);
		X = new URL('https://battlecats-db.com/enemy/' + t3str(my_id + 2) + '.html');
		if (my_mult != 100) X.searchParams.set('mag', my_mult);
		document.getElementById('open-db').href = X.href;
		chs[1].children[5].textContent = E.range;
		chs[1].children[7].textContent = E.getcost();
		if (utils.durationUnit === 'F')
			chs[2].children[1].textContent = [E.pre, E.pre1, E.pre2].filter(x => x).map(numStr).join('/') + ' F';
		else
			chs[2].children[1].textContent = [E.pre, E.pre1, E.pre2].filter(x => x).map(x => numStr(x / 30)).join('/') + ' 秒';
		chs[0].children[6].textContent = E.speed;
		chs[1].children[1].textContent = E.kb;
		calc();
		X = chs[4].children[1];
		for (const s of E.desc.split('|')) {
			X.append(s);
			X.appendChild(document.createElement('br'));
		}
		createAbIcons();
		document.getElementById('search-appear').onclick = search_for;
		document.getElementById('open-anim').href = `/anim.html?id=${-(my_id + 1)}`;
		document.getElementById('fandom').href = 'https://battle-cats.fandom.com/wiki/' + E.fandom;
		mult.addEventListener('focus', hfocus);
		mult.addEventListener('blur', function() {
			let num = mult.textContent.match(/\d+/);
			if (num) {
				atk_mag = my_mult = parseInt(num[0]);
				mult_atk.textContent = `攻擊倍率:${num}%`;
				mult.textContent = `倍率:${num}%`;
				calc();
			} else {
				mult.textContent = `倍率:${my_mult}%`;
			}
		});
		mult_atk.addEventListener('focus', hfocus);
		mult_atk.addEventListener('blur', function() {
			let num = mult_atk.textContent.match(/\d+/);
			if (num) {
				atk_mag = parseInt(num[0]);
				mult_atk.textContent = `攻擊倍率:${num}%`;
				calc();
			} else {
				mult_atk.textContent = `攻擊倍率:${atk_mag}%`;
			}
		});
		st_mag.addEventListener('focus', hfocus);
		st_mag.addEventListener('blur', function() {
			let num = st_mag.textContent.match(/\d+/);
			if (num) {
				stageMag = parseInt(num[0]);
				st_mag.textContent = `★倍率:${num}%`;
				calc();
			} else {
				st_mag.textContent = `★倍率:${stageMag}%`;
			}
		});
		const abar = document.getElementById('abar');
		const btn = abar.previousElementSibling;
		btn.onmouseover = function(event) {
			abar.style.display = 'block';
		}
		btn.onclick = function(event) {
			event.stopPropagation();
			event.preventDefault();
			abar.style.display = 'block';
		}
		window.onclick = function() {
			abar.style.display = 'none';
		}
	});
