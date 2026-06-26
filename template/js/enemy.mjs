import {config, numStr, numStrT} from './common.mjs';
import {
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
	TB_KAIJIN,

	AB_STRENGTHEN,
	AB_SURVIVE,
	AB_ATKBASE,
	AB_CRIT,
	AB_ZKILL,
	AB_CKILL,
	AB_BREAK,
	AB_SHIELDBREAK,
	AB_SAVAGE,
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
	AB_DRAIN,

	catEnv,

	getAbiString,

	getCoverUnitStr as getCoverUnit,

	createImuIcons,
} from './unit.mjs';

const mult = document.getElementById('enemy-mult');
const mult_atk = document.getElementById('enemy-mult-atk');
const st_mag = document.getElementById('enemy-st-mag');
const stats = document.getElementById('enemy-stats');
const chs = stats.children;
const specials = chs[3].children[1];

const set = new Set();
let E, dst_g, ab_no, my_mult, atk_mag, stageMag;

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

function handleKW(event) {
	if (event.code == 'Enter' || event.code == 'NumpadEnter') {
		event.preventDefault();
		this.blur();
	}
}

function T(s) {
	let p = document.createElement('div');
	p.style.cursor = 'pointer';
	let U = new Image(40, 40);
	U.src = `/img/i/a/${ab_no}.png`;
	p.appendChild(U);
	p.append(s);
	p.i = ab_no;
	p.s = false;
	p.onclick = hClick;
	specials.appendChild(p);
}

function W(s, img) {
	let p = document.createElement('div');
	let i = document.createElement('img');
	i.src = img || `/img/i/a/${ab_no}.png`;
	p.appendChild(i);
	p.append(s);
	specials.appendChild(p);
}

function createAbIcons() {
	createImuIcons(E.imu, specials);
	let d, U = E.pre1 ? '*' : '';
	if (E.trait & TB_SAGE) {
		W(`超賢者：減輕 70% 受到的妨害效果 `, `/img/i/e/15.png`);
	}
	for (const [i, d] of Object.entries(E.ab)) {
		switch (ab_no = parseInt(i, 10)) {
			case AB_KB:
				W(`${d[0]} % 打飛敵人${U}至 165 距離單位外，持續 ${numStrT(12)}`);
				break;
			case AB_STOP:
				W(`${d[0]} % 使動作停止${U}持續 ${numStrT(d[1])}，控場覆蓋率 ${getCoverUnit(E, d[0], d[1])} %`);
				break;
			case AB_SLOW:
				W(`${d[0]} % 使動作變慢${U}持續 ${numStrT(d[1])}，控場覆蓋率 ${getCoverUnit(E, d[0], d[1])} %`);
				break;
			case AB_CRIT:
				T(`${d} % 會心一擊${U}`);
				break;
			case AB_ATKBASE:
				T(`善於攻城（攻擊傷害 × 4）`);
				break;
			case AB_WAVE:
				T(`${d[0]} % 發射 Lv${d[1]} 波動${U}（射程 ${267.5 + d[1]*200}）`);
				break;
			case AB_MINIWAVE:
				T(`${d[0]} % 發射 Lv${d[1]} 小波動${U}（射程 ${267.5 + d[1]*200}）`);
				break;
			case AB_WEAK:
				W(`${d[0]} % 降低攻擊力${U}至 ${d[1]} % 持續 ${numStrT(d[2])}，控場覆蓋率 ${getCoverUnit(E, d[0], d[2])} %`);
				break;
			case AB_STRENGTHEN:
				T(`體力 ${d[0]} % 以下時攻擊力上升至 ${100 + d[1]} %`);
				break;
			case AB_SURVIVE:
				W(`${d} % 死前存活（遭到致命的攻擊時以1體力存活1次）`);
				break;
			case AB_WAVES:
				W(`波動滅止`);
				break;
			case AB_BURROW:
				W(`進入射程範圍時鑽地 ${numStr(d[1])} 距離（${d[0] == -1 ? '無限' : d[0].toString() + ' '}次）`);
				break;
			case AB_REVIVE:
				W(`擊倒後 ${numStrT(d[1])} 以 ${d[2]} % 體力復活（${d[0] == -1 ? '無限' : d[0].toString() + ' '}次）`);
				break;
			case AB_WARP:
				W(`${d[0]} % 將目標向${d[2] < 0 ? '前' : '後'}傳送${U} ${Math.abs(d[2])} 距離持續 ${numStrT(d[1])}`);
				break;
			case AB_CURSE:
				W(`${d[0]} % 詛咒${U}持續 ${numStrT(d[1])}，控場覆蓋率 ${getCoverUnit(E, d[0], d[1])} %`);
				break;
			case AB_SAVAGE:
				T(`${d[0]} % 渾身一擊${U}（攻擊力增加至 ${100 + d[1]} %）`);
				break;
			case AB_IMUATK:
				W(`${d[0]} % 發動攻擊無效持續 ${numStrT(d[1])}`);
				break;
			case AB_SUICIDE:
				W('一次攻擊');
				break;
			case AB_BARRIER:
				W(`護盾 ${numStr(d[0])} HP`);
				break;
			case AB_DSHIELD: {
				let p = document.createElement('div');
				p.style.cursor = 'pointer';
				let U = new Image(40, 40);
				U.src = '/img/i/a/39.png';
				p.appendChild(U);
				dst_g = document.createElement('span');
				dst_g.textContent = ~~(Math.round(d[0] * (my_mult / 100)) * (stageMag / 100));
				p.append('惡魔盾 ');
				p.appendChild(dst_g);
				p.append(` HP，KB時惡魔盾恢復 ${d[1]} %`);
				p.i = ab_no;
				p.s = false;
				p.onclick = hClick;
				specials.appendChild(p);
			}
			break;
			case AB_COUNTER:
				W('烈波反擊');
				break;
			case AB_DEATHSURGE:
				W(`死後 ${d[0]} % 發射 Lv${d[3]}烈波（範圍 ${d[1]}～${d[2]}，持續 ${numStrT(d[3]*20)}）`);
				break;
			case AB_POIATK:
				W(`${d[0]} % 毒擊（造成角色最大生命值 ${(d[1])} % 的傷害）`);
				break;
			case AB_SURGE:
				T(`${d[0]} % 發射 Lv${d[3]} 烈波（出現位置 ${d[1]}～${d[2]}，持續 ${numStrT(d[3]*20)}）`);
				break;
			case AB_MINISURGE:
				T(`${d[0]} % 發射 Lv${d[3]} 小烈波（出現位置 ${d[1]}～${d[2]}，持續 ${numStrT(d[3]*20)}）`);
				break;
			case AB_EXPLOSION:
				T(d[1] != d[2] ? `${d[0]}% 發出爆波（發生位置：${d[1]}～${d[2]}）` : `${d[0]}% 發出爆波（發生位置：${d[1]}）`);
				break;
			case AB_DRAIN:
				W(`${d[0]} % 遲緩（令受擊角色減少 ${d[1]} % 已恢復之生產進度）`);
				break;
		}
	}
}

function calc() {
	E.hpM = my_mult / 100;
	E.atkM = atk_mag / 100;
	E.stageM = stageMag / 100;
	const filter = Array.from(set);
	const isBase = set.has(AB_ATKBASE);
	const tatks = E.gettatks({filter, mode: 'max', isBase});
	const DPS = 30 * E.gettatks({filter, mode: 'expected', isBase}).reduce((rv, x) => rv + x) / E.attackF;
	const HP = E.getthp({filter});

	if (E.ab[AB_DSHIELD]) {
		if (dst_g) {
			dst_g.textContent = ~~(Math.round(E.ab[AB_DSHIELD][0] * E.hpM) * E.stageM);
		}
	}
	chs[0].children[2].textContent = numStr(HP);
	chs[0].children[4].textContent = tatks.map(numStr).join('/');
	chs[1].children[3].textContent = numStr(DPS);
}

function hfocus() {
	this.focus();
	const s = window.getSelection();
	const r = document.createRange();
	r.selectNodeContents(this);
	s.removeAllRanges();
	s.addRange(r);
}

function renderEnemy(e, options, setTitle = false) {
	E = e;
	my_mult = options.my_mult;
	atk_mag = options.atk_mag;
	stageMag = options.stageMag;
	specials.textContent = '';
	set.clear();
	mult.textContent = '倍率:' + my_mult.toString() + '%';
	mult_atk.textContent = '攻擊倍率:' + atk_mag.toString() + '%';
	st_mag.textContent = '★倍率:' + stageMag.toString() + '%';
	const title = [E.name, E.jp_name].filter(x => x).join('/') || '?';
	setTitle && (document.title = title);
	document.getElementById('enemy-id').textContent = title;
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
	if (E.trait & TB_KAIJIN)
		traits.push('怪人');
	chs[0].children[8].textContent = traits.join('・');
	if (E.info.atk1 || E.info.atk2) {
		const atkNum = E.info.atk2 ? 3 : 2;
		const atksPre = [E.info.atk, E.info.atk1, E.info.atk2].slice(0, atkNum).map(x => numStr((x / (E.info.atk + E.info.atk1 + E.info.atk2)) * 100) + ' %');
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
		s.src = '/img/i/o/0.png';
		specials.appendChild(s);
	} else {
		const s = new Image(40, 40);
		s.src = '/img/i/o/1.png';
		specials.appendChild(s);
	}
	if (E.atkType & ATK_LD) {
		const s = new Image(40, 40);
		s.src = '/img/i/o/2.png';
		specials.appendChild(s);
	}
	if (E.atkType & ATK_OMNI) {
		const s = new Image(40, 40);
		s.src = '/img/i/o/3.png';
		specials.appendChild(s);
	}
	if (E.atkType & ATK_KB_REVENGE) {
		const s = new Image(40, 40);
		s.src = '/img/i/o/4.png';
		specials.appendChild(s);
	}
	specials.append(X);
	specials.appendChild(document.createElement('br'));
	X = chs[0].children[0].children[0];
	X.src = E.icon;
	chs[2].children[3].textContent = numStrT(E.backswing);
	chs[2].children[5].textContent = numStrT(E.tba);
	chs[2].children[7].textContent = numStrT(E.attackF);
	chs[1].children[5].textContent = E.range;
	chs[1].children[7].textContent = E.earn;
	if (config.unit === 'F')
		chs[2].children[1].textContent = [E.pre, E.pre1, E.pre2].filter(x => x).map(numStr).join('/') + ' F';
	else
		chs[2].children[1].textContent = [E.pre, E.pre1, E.pre2].filter(x => x).map(x => numStr(x / 30)).join('/') + ' 秒';
	chs[0].children[6].textContent = E.speed;
	chs[1].children[1].textContent = E.kb;
	calc();
	X = chs[4].children[1];
	X.textContent = '';
	for (const s of E.desc.split('|')) {
		X.append(s);
		X.appendChild(document.createElement('br'));
	}
	createAbIcons(options);
	mult.addEventListener('focus', hfocus);
	mult.addEventListener('keydown', handleKW);
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
	mult_atk.addEventListener('keydown', handleKW);
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
	st_mag.addEventListener('keydown', handleKW);
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
};

export {
	renderEnemy,
};
