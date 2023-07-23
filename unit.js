const my_params = new URLSearchParams(location.search);
const my_id = parseInt(my_params.get('id'));
const atk_mult_abs = new Set([AB_STRONG, AB_MASSIVE, AB_MASSIVES, AB_EKILL, AB_WKILL, AB_BAIL, AB_BSTHUNT, AB_S, AB_GOOD, AB_CRIT, AB_WAVE, AB_MINIWAVE, AB_MINIVOLC, AB_VOLC]);
const hp_mult_abs = new Set([AB_EKILL, AB_WKILL, AB_GOOD, AB_RESIST, AB_RESISTS, AB_BSTHUNT, AB_BAIL]);
var level_count = 0;
var my_cat;
var tf_tbl;
var custom_talents = [10, 10, 10, 10, 10, 10, 10, 10];
if (isNaN(my_id)) {
	alert('Missing cat id in URL query!');
	window.stop()
	throw '';
}
if (my_id < 0 || my_id >= curveMap.length) {
	alert('沒有這個喵咪!');
	window.stop()
	throw '';
}
const cat_icons = document.getElementById('cat-icons');
const unit_content = document.getElementById('unit-content');
function getCombinations(arr)
{
	const combi = [];
	let temp = [];
	const slent = Math.pow(2, arr.length);

	for (var i = 0; i < slent; i++)
	{
    	temp = [];
    	for (var j = 0; j < arr.length; j++)
    	{
        	if ((i & Math.pow(2, j)))
        	{
            	temp.push(arr[j]);
        	}
    	}
    	if (temp.length > 0)
    	{
        	combi.push(temp);
    	}
	}
	return combi;
}
function getAtk(line, theATK, parent, first, trait, plus, dps) {
	const lines = [];
	var spec = false;
	var treasure;
	for (const ab of line) {
		switch (parseInt(ab[0])) {
		case AB_WAVE:
			lines.push('波動');
			if (dps)
				theATK *= 1 + ab[1] / 100;
			else
				theATK += theATK;
			break;
		case AB_MINIWAVE:
			if (dps)
				theATK *= 1 + ab[1] / 500;
			else
				theATK *= 1.2;
			lines.push('小波動');
			break;
		case AB_VOLC:
			if (dps)
				theATK *= 1 + (ab[5] * ab[1] / 100);
			else
				theATK *= 1 + ab[5];
			lines.push('烈波');
			break;
		case AB_MINIVOLC:
			if (dps)
				theATK *= 1 + (ab[5] * ab[1] / 500);
			else
				theATK *= 1 + ab[5] * 0.2;
			lines.push('小烈波');
			break;
		case AB_GOOD:
			spec = (trait & trait_treasure) && (trait & trait_no_treasure);
			treasure = spec ? first : (trait & trait_treasure);
			theATK *= (treasure ? 1.8 : 1.5);
			lines.push('善攻');
			break;
		case AB_CRIT:
			theATK *= 2;
			if (dps)
				theATK *= (ab[1] / 50);
			else
				theATK *= 2;
			lines.push('爆');
			break;
		case AB_STRONG:
			theATK *= (1 + (ab[2] / 100));
			lines.push('增攻');
			break;
		case AB_S:
			if (dps)
				theATK += theATK * ((ab[1] * ab[2]) / 10000);
			else
				theATK *= 1 + (ab[2] / 100);
			lines.push('渾身');
			break;
		case AB_MASSIVE:
			spec = (trait & trait_treasure) && (trait & trait_no_treasure);
			treasure = spec ? first : (trait & trait_treasure);
			theATK *= (treasure ? 4 : 3);
			lines.push('大傷');
			break;
		case AB_MASSIVES:
			spec = (trait & trait_treasure) && (trait & trait_no_treasure);
			treasure = spec ? first : (trait & trait_treasure);
			theATK *= (treasure ? 6 : 5)
			lines.push('極傷');
			break;
		case AB_EKILL:
			lines.push('使徒');
			theATK *= 5;
			break;
		case AB_WKILL:
			theATK *= 5;
			lines.push('魔女');
			break;
		case AB_BSTHUNT:
			theATK *= 2.5;
			lines.push('超獸');
			break;
		case AB_BAIL:
			theATK *= 1.6;
			lines.push('超生命體');
			break;
		}
	}
	let s = lines.join(' • ');
	s += ':';
	const atks = plus ? ('+' + (~~theATK).toString()) : ((~~theATK).toString());
	s += atks;
	if (spec) {
		if (!first) {
			parent.appendChild(document.createTextNode('/' + atks + '(' + get_trait_short_names(trait & trait_no_treasure) + ')'));
			parent.appendChild(document.createElement('br'));
			return;
		}
		s += '(' + get_trait_short_names(trait & trait_treasure) + ')';
		parent.appendChild(document.createTextNode(s));
		return true;
	}
	parent.appendChild(document.createTextNode(s));
	parent.appendChild(document.createElement('br'));
	return false;
}
function getAtkString(atk, abs, trait, level, parent, plus, dps=false) {
	parent.innerText = '';
	atk *= 2.5;
	atk *= getLevelMulti(level);
	const Cs = getCombinations(Object.entries(abs).filter(x => atk_mult_abs.has(parseInt(x[0]))).map(x => Array.prototype.concat(x[0], x[1])));
	parent.appendChild(document.createTextNode(plus ? ('+' + (~~atk).toString()) : (~~atk).toString()));
	parent.appendChild(document.createElement('br'));
	for (let line of Cs)
		getAtk(line, atk, parent, true, trait, plus, dps) && getAtk(line, atk, parent, false, trait, plus, dps);
	if (abs.hasOwnProperty(AB_ATKBASE)) {
		parent.appendChild(document.createTextNode(`城堡:` + (~~(atk * 4)).toString()));
	}
}
function getHp(line, theHP, parent, first, trait, plus) {
	const lines = [];
	var spec = false;
	var treasure;
	for (const ab of line) {
		switch (parseInt(ab[0])) {
		case AB_GOOD:
			spec = (trait & trait_treasure) && (trait & trait_no_treasure);
			treasure = spec ? first : (trait & trait_treasure);
			theHP *= (treasure ? 2.5 : 2);
			lines.push('善攻');
			break;
		case AB_RESIST:
			spec = (trait & trait_treasure) && (trait & trait_no_treasure);
			treasure = spec ? first : (trait & trait_treasure);
			theHP *= (treasure ? 5 : 4);
			lines.push('耐打');
			break;
		case AB_RESISTS:
			spec = (trait & trait_treasure) && (trait & trait_no_treasure);
			treasure = spec ? first : (trait & trait_treasure);
			theHP *= (treasure ? 7 : 6);
			lines.push('超級耐打');
			break;
		case AB_EKILL:
			lines.push('使徒');
			theHP *= 5;
			break;
		case AB_WKILL:
			theHP *= 10;
			lines.push('魔女');
			break;
		case AB_BSTHUNT:
			theHP /= 0.6;
			lines.push('超獸');
			break;
		case AB_BAIL:
			theHP /= 0.7;
			lines.push('超生命體');
			break;
		}
	}
	let s = lines.join(' • ');
	s += ':';
	const hps = plus ? ('+' + (~~theHP).toString()) : ((~~theHP).toString());
	s += hps;
	if (spec) {
		if (!first) {
			parent.appendChild(document.createTextNode('/' + hps + '(' + get_trait_short_names(trait & trait_no_treasure) + ')'));
			parent.appendChild(document.createElement('br'));
			return;
		}
		s += '(' + get_trait_short_names(trait & trait_treasure) + ')';
		parent.appendChild(document.createTextNode(s));
		return true;
	}
	parent.appendChild(document.createTextNode(s));
	parent.appendChild(document.createElement('br'));
	return false;
}
function getHpString(hp, abs, trait, level, parent, plus = false) {
	parent.innerText = '';
	hp *= 2.5;
	hp *= getLevelMulti(level);
	const Cs = getCombinations(Object.entries(abs).filter(x => hp_mult_abs.has(parseInt(x[0]))).map(x => Array.prototype.concat(x[0], x[1])));
	parent.appendChild(document.createTextNode(plus ? ('+' + (~~hp).toString()) : (~~hp).toString()));
	parent.appendChild(document.createElement('br'));
	for (let line of Cs)
		getHp(line, hp, parent, true, trait, plus) && getHp(line, hp, parent, false, trait, plus);
}
function updateValues(form, tbl) {
	let chs = tbl.children;
	let HPs = chs[1].children;
	let HPPKBs = chs[2].children;
	let ATKs = chs[3].children;
	let DPSs = chs[4].children;
	let PRs = chs[8].children;
	let CD = chs[7].children[5];
	let KB = chs[7].children[1];
	chs[7].children[3].innerText = form.speed.toString();
	PRs[2].innerText = form.price;
	PRs[4].innerText = ~~(form.price * 1.5);
	PRs[6].innerText = form.price * 2;
	let levels = new Array(5);
	let lvE = chs[0].children[1];
	for (let i = 0;i < 5;++i) {
		levels[i] = parseInt(lvE.innerText.slice(2));
		lvE = lvE.nextElementSibling;
	}
	for (let i = 0;i < 5;++i)
		getHpString(form.hp, form.ab, form.trait, levels[i], HPs[i + 1]);
	getHpString(form.hp * 0.2, form.ab, form.trait, 1, HPs[6], true);
	let hppkb = form.hp / form.kb;
	for (let i = 0;i < 5;++i)
		getHpString(hppkb, form.ab, form.trait, levels[i], HPPKBs[i + 1]);
	getHpString(hppkb * 0.2, form.ab, form.trait, 1, HPPKBs[6], true);
	const totalAtk = form.atk + form.atk1 + form.atk2;
	for (let i = 0;i < 5;++i)
		getAtkString(totalAtk, form.ab, form.trait, levels[i], ATKs[i + 1], false);
	getAtkString(totalAtk * 0.2, form.ab, form.trait, 1, ATKs[6], true);
	const attackS = form.attackF / 30;
	for (let i = 0;i < 5;++i)
		getAtkString(totalAtk/attackS, form.ab, form.trait, levels[i], DPSs[i + 1], false, true);
	getAtkString((totalAtk * 0.2)/attackS, form.ab, form.trait, 1, DPSs[6], true, true);
	chs[6].children[1].innerText = numStrT(form.tba);
	chs[6].children[3].innerText = numStrT(form.backswing);
	chs[5].children[1].innerText = numStrT(form.attackF).replace('秒', '秒/下');
	chs[5].children[3].innerText = numStrT(form.pre);
	var atkType = '';
	if (form.atkType & ATK_OMNI)
		atkType += '全方位';
	else if (form.atkType & ATK_LD)
		atkType += '遠方';
	atkType += (form.atkType & ATK_RANGE) ? '範圍攻擊' : '單體攻擊';
	chs[5].children[6].innerText = atkType;
	const specials = chs[9].children[1];
	const lds = form.lds;
	const ldr = form.ldr;
	if (form.atk1 || form.atk2) {
		let atksPre = [form.atk, form.atk1, form.atk2].slice(0, lds.length).map(x => ((x / totalAtk)*100).toFixed(0)+'%');
		specials.appendChild(document.createTextNode(`${lds.length}回連續攻擊(傷害${atksPre.join('-')})`));
		if (lds.length != 1 && (lds.some(x => x) || ldr.some(x => x))) {
			const nums = '①②③';
			var s = '';
			for (let i = 0;i < lds.length;++i) {
				const x = lds[i];
				const y = x + ldr[i];
				if (x <= y)
					s += `${nums[i]}${x}~${y}<br>`;
				else
					s += `${nums[i]}${y}~${x}<br>`;
			}
			chs[5].children[5].innerHTML = `接觸點${form.range}<br>範圍<br>${s.slice(0,s.length-4)}`;
		} else {
			chs[5].children[5].innerText = form.range;
		}
	} else {
		chs[5].children[5].innerText = form.range;
	}
	KB.innerText = form.kb.toString();
	CD.innerText = numStrT(form.cd);
}
function makeTd(parent, text = '') {
	const c = document.createElement('td');
	c.innerText = text;
	parent.appendChild(c);
	return c;
}
function renderForm(form) {
	const info = my_cat.info;
	if (level_count == 2 && info.upReqs != undefined) {
		const container = document.createElement('table');
		container.classList.add('.w3-table', 'w3-centered', 'fruit-table');
		container.style.margin = '0px auto';
		const tr0 = document.createElement('tr');
		const tr1 = document.createElement('tr');
		const td = document.createElement('td');
		td.innerText = '進化素材';
		td.colSpan = info.upReqs.length;
		tr0.appendChild(td);
		for (const r of info.upReqs) {
			const img = new Image(128, 128);
			img.classList.add('fruit');
			const div = document.createElement('td');
			div.style.width = '128px';
			var p = document.createElement('p');
			p.classList.add('fruit');
			if (r[1]) {
				img.src = './page/catfruit/gatyaitemD_' + r[1].toString() + '_f.png';
				p.innerText = 'X' + r[0].toString();
			} else {
				img.src = './page/catfruit/xp.png';
				p.innerText = r[0].toString();
			}
			div.appendChild(img);
			div.appendChild(p);
			tr1.appendChild(div);
		}
		container.appendChild(tr0);
		container.appendChild(tr1);
		unit_content.appendChild(container);
	}
	const level_text = document.createElement('p');
	const tbl = document.createElement('table');
	const theadtr = document.createElement('tr');
	const tbodytr1 = document.createElement('tr');
	const tbodytr2 = document.createElement('tr');
	const tbodytr3 = document.createElement('tr');
	const tbodytr4 = document.createElement('tr');
	const tbodytr5 = document.createElement('tr');
	const tbodytr6 = document.createElement('tr');
	const tbodytr7 = document.createElement('tr');
	const tbodytr8 = document.createElement('tr');
	const tbodytr9 = document.createElement('tr');
	const tbodytr10 = document.createElement('tr');
	const tbodytr11 = document.createElement('tr');
	const tbodytr12 = document.createElement('tr');
	level_text.innerHTML = ['一階：<br>', '二階：<br>', '三階：<br>', '本能完全升滿的數值表格', '超本能完全升滿的數值表格'][level_count] + ((level_count <= 2) ? unit_descs[my_id][level_count] : '');
	level_text.classList.add('bold-large');
	makeTd(theadtr);
	for (let i = 1;i <= 5;++i) {
		const e = makeTd(theadtr, `Lv${i * 10}`);
		e.contentEditable = true;
		e._form = form;
		e._val = i * 10;
		e.addEventListener('blur',  function(event) {
			const t = event.currentTarget;
			const tbl = t.parentNode.parentNode;
			const lvMax = my_cat.info.maxBase + my_cat.info.maxPlus;
			let num = t.innerText.match(/\d+/);
			if (num) {
				num = Math.max(1, Math.min(parseInt(num[0]), lvMax));
				t._val = num;
				t.innerText = `Lv${num}`;
				updateValues(t._form, tbl);
			} else {
				t.innerText = t._val;
			}
		});
	}
	makeTd(theadtr, '每提升一級');
	makeTd(tbodytr1, 'HP');
	for (let i = 0;i < 5;++i)
		makeTd(tbodytr1);
	makeTd(tbodytr1);
	makeTd(tbodytr2, '硬度');
	for (let i = 0;i < 5;++i)
		makeTd(tbodytr2);
	makeTd(tbodytr2);
	makeTd(tbodytr3, '攻擊力');
	for (let i = 0;i < 5;++i)
		makeTd(tbodytr3);
	makeTd(tbodytr3);
	makeTd(tbodytr4, 'DPS');
	for (let i = 0;i < 5;++i)
		makeTd(tbodytr4);
	makeTd(tbodytr4);
	makeTd(tbodytr5, '攻擊頻率');
	makeTd(tbodytr5);
	makeTd(tbodytr5, '出招時間');
	makeTd(tbodytr5);
	makeTd(tbodytr5, '射程').rowSpan = 2;
	makeTd(tbodytr5).rowSpan = 2;
	makeTd(tbodytr5).rowSpan = 3;
	makeTd(tbodytr6, '攻擊間隔');
	makeTd(tbodytr6);
	makeTd(tbodytr6, '收招時間');
	makeTd(tbodytr6);
	makeTd(tbodytr7, 'KB');
	makeTd(tbodytr7);
	makeTd(tbodytr7, '跑速');
	makeTd(tbodytr7);
	makeTd(tbodytr7, '再生產');
	makeTd(tbodytr7);
	makeTd(tbodytr8, '召喚金額');
	makeTd(tbodytr8, '一章');
	makeTd(tbodytr8);
	makeTd(tbodytr8, '二章(傳說)');
	makeTd(tbodytr8);
	makeTd(tbodytr8, '三章');
	makeTd(tbodytr8);
	makeTd(tbodytr9, '屬性');
	makeTd(tbodytr9).colSpan = 6;
	makeTd(tbodytr10, '抗性');
	makeTd(tbodytr10).colSpan = 6;
	makeTd(tbodytr11, '能力');
	makeTd(tbodytr11).colSpan = 6;
	makeTd(tbodytr12, '效果');
	makeTd(tbodytr12).colSpan = 6;
	tbodytr9.children[1].style.textAlign = 'left';
	tbodytr10.children[1].style.textAlign = 'left';
	tbodytr11.children[1].style.textAlign = 'left';
	tbodytr12.children[1].style.textAlign = 'left';
	tbl.appendChild(theadtr);
	tbl.appendChild(tbodytr1);
	tbl.appendChild(tbodytr2);
	tbl.appendChild(tbodytr3);
	tbl.appendChild(tbodytr4);
	tbl.appendChild(tbodytr5);
	tbl.appendChild(tbodytr6);
	tbl.appendChild(tbodytr7);
	tbl.appendChild(tbodytr8);
	tbl.appendChild(tbodytr9);
	tbl.appendChild(tbodytr10);
	tbl.appendChild(tbodytr11);
	tbl.appendChild(tbodytr12);
	const chs = tbl.children;
	updateValues(form, tbl);
	createTraitIcons(form.trait, chs[9].children[1]);
	createImuIcons(form.imu, chs[10].children[1]);
	if (form.res)
		createResIcons(form.res, chs[10].children[1]);
	createAbIcons1(form.ab, chs[11].children[1]);
	createAbIcons2(form.ab, chs[12].children[1]);
	(!tbodytr9.children[1].children.length) && (tbodytr9.style.display = 'none');
	(!tbodytr10.children[1].children.length) && (tbodytr10.style.display = 'none');
	(!tbodytr11.children[1].children.length) && (tbodytr11.style.display = 'none');
	(!tbodytr12.children[1].children.length) && (tbodytr12.style.display = 'none');
	tbl.classList.add('w3-table', 'w3-centered');
	let odd = true;
	for (let e of tbl.children) {
		if (odd)
			e.style.backgroundColor = '#f1f1f1';
		odd = !odd;
	}
	unit_content.appendChild(level_text);
	unit_content.appendChild(tbl);
	++level_count;
	return tbl;
}
function renderExtras() {
	const table = document.createElement('table');
	const th = document.createElement('tr');
	const td0 = document.createElement('td');
	td0.colSpan = 2;
	td0.innerText = '其他資訊';
	th.appendChild(td0);
	const tr1 = document.createElement('tr');
	makeTd(tr1, '稀有度');
	makeTd(tr1, my_cat.info.getRarityString());
	const tr2 = document.createElement('tr');
	makeTd(tr2, '最大基本等級');
	makeTd(tr2, my_cat.info.maxBase.toString());
	const tr3 = document.createElement('tr');
	makeTd(tr3, '最大加值等級');
	makeTd(tr3, '+' + my_cat.info.maxPlus.toString());
	if (my_cat.info.version) {
		let version = my_cat.info.version.toString();
		const div = document.createElement('div');
		div.innerText = `Ver ${parseInt(version.slice(0, 2))}.${parseInt(version.slice(2, 4))}.${parseInt(version.slice(4))} 新增`;
		div.classList.add('r-ribbon');
		document.getElementById('main').appendChild(div);
	}
	table.appendChild(th);
	table.appendChild(tr1);
	table.appendChild(tr2);
	table.appendChild(tr3);
	table.classList.add('w3-table', 'w3-centered', 'tcost');
	let odd = true;
	for (let e of table.children) {
		if (odd)
			e.style.backgroundColor = '#f1f1f1';
		odd = !odd;
	}
	unit_content.appendChild(table);
}
function getTalentInfo(talent, data) {
	function range(name, f='%', start = 2, end = 3) {
		return [name, talent[start].toString() + f, talent[end].toString() + f, talent[1], numStr((talent[end] - talent[start]) / (talent[1] - 1)) + f];
	}
	function range2(name, f='%', start, end, init) {
		return [name, init.toString() + f, talent[end].toString() + f, talent[1], numStr((talent[end] - talent[start]) / (talent[1] - 1)) + f];
	}
	switch (talent[0]) {
	case 1:
		if (data[37]) {
			if (talent[4] && talent[4] != talent[5]) {
				return range('降攻時間', 'f', 4, 5);
			}
			return range('降攻機率', '%', 2, 3);
		}
		if (talent[4] && talent[4] != talent[5])
				return range('降攻機率', '%', 4, 5);
		return range('降攻機率', '%', 2, 3);
	case 2:
		if (data[25]) {
			if (talent[4] && talent[4] != talent[5])
				return range('暫停時間', '%', 4, 5);
			return range('暫停機率', '%', 2, 3);
		}
		if (talent[4] && talent[4] != talent[5])
				return range('暫停機率', '%', 4, 5);
		return range('暫停機率', '%', 2, 3);
	case 3:
		if (data[27]) {
			if (talent[4] && talent[4] != talent[5])
				return range('緩速時間', '%', 4, 5);
			return range('緩速機率', '%', 2, 3);
		}
		if (talent[4] && talent[4] != talent[5])
				return range('緩速機率', '%', 4, 5);
		return range('暫停機率', '%', 2, 3);
	case 5:  return "善於攻擊";
	case 6:  return "耐打";
	case 7:  return "超大傷害";
	case 8:
		if (data[24])
			return range("擊退", '%', 2, 3);
		return range2("擊退", '%', 2, 3, talent[2]);
	case 10:
		if (data[40])
			return range("升攻", '%', 4, 5);
		return range2("升攻", '%', 4, 5, talent[4]);
	case 11:
		if (data[42])
			return range('死前存活', '%', 2, 3);
		return range2("死前存活", '%', 2, 3, talent[2]);
	case 13:
		if (data[31])
			return range('爆擊', '%', 2, 3);
		return `爆擊(${talent[2]}%機率發動)`;
	case 14:
		return '殭屍殺手';
	case 15:
		if (data[70])
			return range('破盾', '%', 2, 3);
		return range2("破盾", '%', 2, 3, talent[2]);
	case 16:
		return '雙倍金錢';
	case 17:
		if (data[35])
			return range('波動', '%', 2, 3);
		return range2(`Lv${talent[4]}波動`, '%', 2, 3, talent[2]);
	case 18: 
		return range("降攻耐性");
	case 19:
		return range("暫停耐性");
	case 20:
		return range("緩速耐性");
	case 21:
		return range("擊退耐性");
	case 22:
		return range("波動耐性");
	case 25: 
		return ['成本減少', ~~(talent[2] * 1.5), ~~(talent[3] * 1.5), talent[1], numStr(talent[2] * 1.5)];
	case 26:
		return ['生產速度', `${talent[2]}f`, `${talent[3]}f`, talent[1], talent[2], numStr((talent[end] - talent[start]) / (talent[1] - 1)) + 'f'];
	case 27:
		return ["移動速度", talent[2], talent[3], talent[1], talent[2]];
	case 29: return "詛咒無效";
	case 30:
		return range("詛咒耐性");
	case 31: return range("攻擊力");
	case 32: return range("血量");
	case 35: return "對黑色敵人";
	case 36: return "對鋼鐵敵人";
	case 38: return "對異星敵人";
	case 39: return "對不死敵人";
	case 40: return "對古代種";
	case 44: return "降攻無效";
	case 45: return "暫停無效";
	case 46: return "緩速無效";
	case 47: return "擊退無效";
	case 48: return "波動無效";
	case 49: return "傳送無效";
	case 50:
		if (data[82])
			return range('渾身一擊', '%', 2, 3);
		return range2('渾身一擊', '%', 2, 3, talent[2]);
	case 51:
		if (data[84]) {
			if (talent[4] && talent[4] != talent[5])
				return range('攻撃無効', 'f', 4, 5);
			return range('攻撃無効', '%', 2, 3);
		}
		if (talent[4] && talent[4] != talent[5])
			return range2('攻撃無効', 'f', 4, 5, talent[2]);
		return range2('攻撃無効', '%', 2, 3, talent[2]);
	case 52:
		return range("毒擊耐性");
	case 53: return "毒擊無效";
	case 54:
		return range("烈波耐性");
	case 55: return "烈波無效";
	case 56:
		if (data[86])
			return range('烈波機率', '%', 2, 3);
		return range(`Lv${talent[4]}烈波機率`, '%', 2, 3, talent[2]);
	case 57: return "對惡魔";
	case 58:
		if (data[58])
			return range("破惡魔盾", '%', 2, 3); 
	 	return range2("破惡魔盾", '%', 2, 3, talent[2]);
	case 59: return "靈魂攻擊";
	case 60:
		if (data[92]) {
			if (talent[4] && talent[4] != talent[5])
				return range('詛咒時間', 'f', 4, 5);
			return range('詛咒機率', '%', 2, 3);
		}
		if (talent[4] && talent[4] != talent[5])
			return range2("詛咒機率", 'f', 4, 5, talent[2]);
		return range2('詛咒機率', 'f', 2, 3, talent[4]);
	case 61:
		{
			const tba = data[4] * 2;
			const first = `${(tba * talent[2])/100}f`;
			return ["TBA縮短", first,`${(tba * talent[3])/100}f`, talent[1], first];
		}
	case 62:
		if (data[94])
			return range('小波動', '%', 2, 3);
		return range2(`Lv${talent[4]}小波動`, '%', 2, 3, talent[2]);
	case 63: return "超生命體特效";
	case 64: return "超獸特效";
	case 65:
		if (data[108])
			return range('小烈波', '%', 2, 3);
		return range2(`Lv${talent[2]}小烈波`, '%', 2, 3, talent[2]);
	default: console.assert(false, `${talent[0]} not handled`);
	}
	return '???';
}
function rednerTalentInfos(talents, data) { 
	const table = document.createElement('table');
	const tr1 = document.createElement('tr');
	const td0 = document.createElement('td');
	td0.innerText = '本能解放(使用NP)';
	td0.colSpan = 5;
	tr1.appendChild(td0);
	table.appendChild(tr1);		
	const tr2 = document.createElement('tr');
	const td1 = document.createElement('td');
	const td2 = document.createElement('td');
	const td3 = document.createElement('td');
	const td4 = document.createElement('td');
	const td5 = document.createElement('td');
	td1.innerText = my_cat.forms[2].name || my_cat.forms[2].jp_name;
	td2.innerText = 'Lv1';
	td3.innerText = 'Lv10';
	td4.innerText = '最高等級';
	td5.innerText = '每提升一級';
	tr2.appendChild(td1);
	tr2.appendChild(td2);
	tr2.appendChild(td3);
	tr2.appendChild(td4);
	tr2.appendChild(td5);
	table.appendChild(tr2);
	let infos = [];
	for (let i = 0;i < 112;i += 14) {
		const tr = document.createElement('tr');
		if (!talents[i]) break;
		if (talents[i + 13] == -1) break;
		const info = getTalentInfo(talents.subarray(i, i + 14), data);
		if (info instanceof Array) {
			infos.push(info[0]);
			let td = null;
			for (let s of info) {
				td = document.createElement('td');
				td.innerText = s;
				tr.appendChild(td);
			}
			td.innerText = '+' + td.innerText;
		} else {
			infos.push(info);
			const t1 = document.createElement('td');
			const t2 = document.createElement('td');
			t1.innerText = '能力新增';
			t2.innerText = info;
			t2.colSpan = 4;
			tr.appendChild(t1);
			tr.appendChild(t2);
		}
		table.appendChild(tr);
	}
	let odd = true;
	for (let e of table.children) {
		if (odd)
			e.style.backgroundColor = '#f1f1f1';
		odd = !odd;
	}
	table.classList.add('w3-table', 'w3-centered', 'tcost');
	unit_content.appendChild(table);
	return infos;
}
function calcCost(event) {
	const t = event.currentTarget;
	const idx = Array.prototype.indexOf.call(t.parentNode.children, t);
	const table = t.parentNode.parentNode;
	let i = 0;
	t.classList.add('o-selected');
	for (const e of table.children) {
		let x = e.children[idx];
		if (!x) continue;
		if (x == t) {
			custom_talents[idx - 1] = i - 1;
		}
		else if (x.classList.contains('o-selected'))
			x.classList.remove('o-selected');
		++i;
	}
	let e = table.children[2];
	let costs = new Uint16Array(e.children.length - 1);
	let selectMap = new Uint8Array(costs.length);
	for (;;) {
		let chs = e.children;;
		if (chs[0].innerText.indexOf('Lv') == -1) break;
		for (let j = 1;j <= costs.length;++j) {
			if (!selectMap[j - 1])
				costs[j - 1] += parseInt(chs[j].innerText.replace('X', '0'));
			if (chs[j].classList.contains('o-selected'))
				selectMap[j - 1] = 1;
		}
		e = e.nextElementSibling;
	}
	let cis = e.children;
	for (let j = 1;j <= costs.length;++j)
		cis[j].innerText = costs[j - 1];
	e.nextElementSibling.firstElementChild.innerText = costs.reduce((a, b) => a + b, 0);
	const TF = new Form(structuredClone(my_cat.forms[2]));
	TF.applyTalents(my_cat.info.talents, custom_talents);
	updateValues(TF, tf_tbl);
	const chs = tf_tbl.children;
	chs[9].children[1].textContent = '';
	chs[10].children[1].textContent = '';
	chs[11].children[1].textContent = '';
	chs[12].children[1].textContent = '';
	createTraitIcons(TF.trait, chs[9].children[1]);
	createImuIcons(TF.imu, chs[10].children[1]);
	createResIcons(TF.res, chs[10].children[1]);
	createAbIcons1(TF.ab, chs[11].children[1]);
	createAbIcons2(TF.ab, chs[12].children[1]);
}
function renderTalentCosts(talent_names, talents, data) {
	const skill_costs = [
		[25,5,5,5,5,10,10,10,10,10],
		[5,5,5,5,5,10,10,10,10,10],
		[50],
		[50,10,10,10,10,15,15,15,15,15],
		[10,10,10,10,10,15,15,15,15,15],
		[75],
		[75,15,15,15,15,20,20,20,20,20],
		[15,15,15,15,15,20,20,20,20,20],
		[100],
		[150],
		[250],
		[100,15,15,15,15,25,25,25,25,25],
		[75,10,10,10,10,20,20,20,20,20],
		[120,20,20,20,20,25,25,25,25,25],
	];
	const table = document.createElement('table');
	const th = document.createElement('tr');
	const td0 = document.createElement('td');
	table.style.userSelect = 'none';
	td0.innerText = '消耗NP一覽';
	th.appendChild(td0);
	
	let names = [];
	let costs = [];
	let c = 0;
	for (let i = 0;i < 112;i += 14) {
		if (!talents[i]) break;
		if (talents[i + 13] == -1) break;
		names.push(talent_names[c]);
		costs.push(talents[i + 11] - 1);
		++c;
	}
	const tr1 = document.createElement('tr');
	td0.colSpan = names.length + 1;
	const td1 = document.createElement('td');
	td1.innerText = '等級';
	tr1.appendChild(td1);
	for (let i = 0;i < names.length;++i) {
		const td = document.createElement('td');
		td.innerText = names[i];
		tr1.appendChild(td);
	}
	const tr2 = document.createElement('tr');
	for (let i = 0;i <= names.length;++i) {
		const td = document.createElement('td');
		td.innerText = i == 0 ? 'Lv0' : '0';
		td.addEventListener('click', calcCost);
		tr2.appendChild(td);
	}
	table.appendChild(th);
	table.appendChild(tr1);
	table.appendChild(tr2);
	for (let i = 1;i <= 10;++i) {
		const tr = document.createElement('tr');
		const td0 = document.createElement('td');
		td0.innerText = 'Lv' + i.toString();
		tr.appendChild(td0);
		for (let j = 0;j < names.length;++j) {
			const td = document.createElement('td');
			const tbl = skill_costs[costs[j]];
			td.innerText = tbl.length > 1 ? tbl[i-1] : (i == 1 ? tbl[0] : 'X');
			tr.appendChild(td);
			td._state = false;
			td.addEventListener('click', calcCost);
		}
		table.appendChild(tr);
	}
	const trend = document.createElement('tr');
	const tdend = document.createElement('td');
	tdend.innerText = '總計';
	tdend.rowSpan = 2;
	let total = 0;
	trend.appendChild(tdend);
	for (let c of costs) {
		const td = document.createElement('td');
		let s = skill_costs[c].reduce((a, b) => a + b, 0);
		td.innerText = s.toString();
		total += s;
		trend.appendChild(td);
	}
	table.appendChild(trend);
	const trend2 = document.createElement('tr');
	const tdend2 = document.createElement('td');
	tdend2.colSpan = names.length;
	tdend2.innerText = '共' + total.toString();
	trend2.appendChild(tdend2);
	table.appendChild(trend2);
	let odd = true;
	for (let e of table.children) {
		if (odd)
			e.style.backgroundColor = '#f1f1f1';
		odd = !odd;
	}
	table.classList.add('w3-table', 'w3-centered', 'tcost');
	unit_content.appendChild(table);
}
function renderCombos() {
	const table = document.createElement('table');
	for (let C of combos) {
		const units = C[3];
		for (let i = 0;i < units.length;i += 2) {
			if (my_id == units[i]) {
				const tr = document.createElement('tr');
				const name = C[0];
				const type = C[1];
				const lv = C[2];
				const types = ['小', '中', '大', '究極'];
				const td = document.createElement('td');
				const p = document.createElement('p');
				const p2 = document.createElement('p');
				td.appendChild(p);
				td.appendChild(p2);
				p.innerText = name;
				p2.innerText = combo_f[type].replace('$', combo_params[type][lv]) + '【' + types[lv] + '】';
				tr.appendChild(td);
				for (let c = 0;c < units.length;c += 2) {
					const td = document.createElement('td');
					const img = new Image();
					const my_id_str = t3str(units[c]);
					const form_str = 'fcs'[units[c + 1]];
					const a = document.createElement('a');
					a.href = './unit.html?id=' + units[c].toString();
					img.src = `./data/unit/${my_id_str}/${form_str}/uni${my_id_str}_${form_str}00.png`;
					a.appendChild(img);
					td.appendChild(a);
					tr.appendChild(td);
				}
				table.appendChild(tr);
				break;
			}
		}
	}
	if (table.children.length) {
		table.classList.add('w3-table', 'w3-centered', 'combo');
		const p = document.createElement('p');
		p.innerText = '聯組資訊';
		unit_content.appendChild(p);
		unit_content.appendChild(table);
	}
}
function renderUintPage() {
	const cat_names_jp = my_cat.forms.map(x => x.jp_name).filter(x => x).join(' → ');
	const cat_names = my_cat.forms.map(x => x.name).filter(x => x).join(' → ');
	for (let form of my_cat.forms) {
		const img = new Image();
		img.src = form.icon;
		cat_icons.appendChild(img);
	}
	for (let form of my_cat.forms) renderForm(form);
	if (my_cat.info.talents) {
		const TF = new Form(structuredClone(my_cat.forms[2]));
		const names = rednerTalentInfos(my_cat.info.talents, TF.data);
		renderTalentCosts(names, my_cat.info.talents, TF.data);
		TF.applyTalents(my_cat.info.talents, custom_talents);
		tf_tbl = renderForm(TF);
	}
	renderExtras();
	document.getElementById('open-db').href = 'https://battlecats-db.com/unit/' + t3str(my_id+1) + '.html';
	document.getElementById('ch_name').innerText = cat_names;
	document.getElementById('jp_name').innerText = cat_names_jp;
	document.getElementById('show-xp-graph').href = './xpgraph.html?data=' + btoa(my_cat.info.xp_data);
	document.title = cat_names.replaceAll(' → ', ' ') + ' - 貓咪資訊';
	renderCombos();
}
loadCat(my_id)
.then(res => {
	my_cat = res;
	useCurve(my_id);
	renderUintPage();
	document.getElementById('loader').style.display = 'none';
	loader_text.style.display = 'none';
	document.getElementById('main').style.display = 'block';
	document.getElementById('star-cat').onclick = function() {
		var oldList = localStorage.getItem('star-cats');
		if (oldList == null)
			oldList = [];
		else
			oldList = JSON.parse(oldList);
		oldList.push({'id': my_id, 'icon': my_cat.forms[0].icon, 'name': my_cat.forms[0].name});
		localStorage.setItem('star-cats', JSON.stringify(oldList));
	};
	document.getElementById('show-level-graph1').href = './levelgraph1.html?id=' + my_id.toString();
	document.getElementById('show-level-graph2').href = './levelgraph2.html?id=' + my_id.toString();
	document.getElementById('show-level-graph3').href = './levelgraph3.html?id=' + my_id.toString();
	document.getElementById('show-level-graph4').href = './levelgraph4.html?id=' + my_id.toString();
});
