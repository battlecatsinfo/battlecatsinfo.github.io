const my_params = new URLSearchParams(location.search);
const my_id = parseInt(my_params.get('id'));
const atk_mult_abs = new Set([AB_STRONG, AB_MASSIVE, AB_MASSIVES, AB_EKILL, AB_WKILL, AB_BAIL, AB_BSTHUNT, AB_S, AB_GOOD, AB_CRIT]);
const hp_mult_abs = new Set([AB_EKILL, AB_WKILL, AB_GOOD, AB_RESIST, AB_RESISTS, AB_BSTHUNT, AB_BAIL]);
var my_cat;
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
	const atks = plus ? ('+' + theATK.toFixed(0)) : (theATK.toFixed(0));
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
	atk *= 2.5;
	atk *= getLevelMulti(level);
	const Cs = getCombinations(Object.entries(abs).filter(x => atk_mult_abs.has(parseInt(x[0]))).map(x => Array.prototype.concat(x[0], x[1])));
	parent.appendChild(document.createTextNode(plus ? ('+' + atk.toFixed(0)) : atk.toFixed(0)));
	parent.appendChild(document.createElement('br'));
	for (let line of Cs)
		getAtk(line, atk, parent, true, trait, plus, dps) && getHp(line, atk, parent, false, trait, plus, dps);
	if (abs.hasOwnProperty(AB_ATKBASE)) {
		parent.appendChild(document.createTextNode(`城堡:` + (atk * 4).toFixed(0)));
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
			lines.push('很耐打');
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
	const hps = plus ? ('+' + theHP.toFixed(0)) : (theHP.toFixed(0));
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
	hp *= 2.5;
	hp *= getLevelMulti(level);
	const Cs = getCombinations(Object.entries(abs).filter(x => hp_mult_abs.has(parseInt(x[0]))).map(x => Array.prototype.concat(x[0], x[1])));
	parent.appendChild(document.createTextNode(plus ? ('+' + hp.toFixed(0)) : hp.toFixed(0)));
	parent.appendChild(document.createElement('br'));
	for (let line of Cs)
		getHp(line, hp, parent, true, trait, plus) && getHp(line, hp, parent, false, trait, plus);
}
function updateValues(form, tbl) {
	let chs = tbl.childNodes;
	let HPs = chs[1].childNodes;
	let HPPKBs = chs[2].childNodes;
	let ATKs = chs[3].childNodes;
	let DPSs = chs[4].childNodes;
	let PRs = chs[8].childNodes;
	let CD = chs[7].childNodes[5];
	let KB = chs[7].childNodes[1];
	chs[7].childNodes[3].innerText = form.speed.toString();
	PRs[2].innerText = (form.price).toFixed(0);
	PRs[4].innerText = (form.price * 1.5).toFixed(0);
	PRs[6].innerText = (form.price + form.price).toFixed(0);
	for (let i = 1;i <= 5;++i)
		getHpString(form.hp, form.ab, form.trait, i * 10, HPs[i]);
	getHpString(form.hp * 0.2, form.ab, form.trait, 1, HPs[6], true);
	let hppkb = form.hp / form.kb;
	for (let i = 1;i <= 5;++i)
		getHpString(hppkb, form.ab, form.trait, i * 10, HPPKBs[i]);
	getHpString(hppkb * 0.2, form.ab, form.trait, 1, HPPKBs[6], true);
	const totalAtk = form.atk + form.atk1 + form.atk2;
	for (let i = 1;i <= 5;++i)
		getAtkString(totalAtk, form.ab, form.trait, i * 10, ATKs[i], false);
	getAtkString(totalAtk * 0.2, form.ab, form.trait, 1, ATKs[6], true);
	const attackS = form.attackF / 30;
	for (let i = 1;i <= 5;++i)
		getAtkString(totalAtk/attackS, form.ab, form.trait, i * 10, DPSs[i], false, true);
	getAtkString((totalAtk * 0.2)/attackS, form.ab, form.trait, 1, DPSs[6], true, true);
	chs[6].childNodes[1].innerText = numStrT(form.tba);
	chs[6].childNodes[3].innerText = numStrT(form.backswing);
	chs[5].childNodes[1].innerText = numStrT(form.attackF).replace('秒', '秒/下');
	chs[5].childNodes[3].innerText = numStrT(form.pre);
	var atkType = '';
	if (form.atkType & ATK_OMNI)
		atkType += '全方位';
	else if (form.atkType & ATK_LD)
		atkType += '遠方';
	atkType += (form.atkType & ATK_RANGE) ? '範圍攻擊' : '單體攻擊';
	chs[5].childNodes[6].innerText = atkType;
	const specials = chs[9].childNodes[1];
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
			chs[5].childNodes[5].innerHTML = `接觸點${form.range}<br>範圍<br>${s.slice(0,s.length-4)}`;
		} else {
			chs[5].childNodes[5].innerText = form.range;
		}
	} else {
		chs[5].childNodes[5].innerText = form.range;
	}
	createTraitIcons(form.trait, specials);
	createImuIcons(form.imu, chs[10].childNodes[1]);
	createAbIcons1(form.ab, chs[11].childNodes[1]);
	createAbIcons2(form.ab, chs[12].childNodes[1]);
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
	const level_count = form.lvc;
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
	makeTd(theadtr, 'Lv10');
	makeTd(theadtr, 'Lv20');
	makeTd(theadtr, 'Lv30');
	makeTd(theadtr, 'Lv40');
	makeTd(theadtr, 'Lv50');
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
	tbodytr9.childNodes[1].style.textAlign = 'left';
	tbodytr10.childNodes[1].style.textAlign = 'left';
	tbodytr11.childNodes[1].style.textAlign = 'left';
	tbodytr12.childNodes[1].style.textAlign = 'left';
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
	updateValues(form, tbl);
	(!tbodytr9.childNodes[1].childNodes.length) && (tbl.removeChild(tbodytr9));
	(!tbodytr10.childNodes[1].childNodes.length) && (tbl.removeChild(tbodytr10));
	(!tbodytr11.childNodes[1].childNodes.length) && (tbl.removeChild(tbodytr11));
	(!tbodytr12.childNodes[1].childNodes.length) && (tbl.removeChild(tbodytr12));
	tbl.classList.add('w3-table', 'w3-centered');
	let odd = true;
	for (let e of tbl.childNodes) {
		if (odd)
			e.style.backgroundColor = '#f1f1f1';
		odd = !odd;
	}
	unit_content.appendChild(level_text);
	unit_content.appendChild(tbl);
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
	table.classList.add('w3-table', 'w3-centered');
	let odd = true;
	for (let e of table.childNodes) {
		if (odd)
			e.style.backgroundColor = '#f1f1f1';
		odd = !odd;
	}
	unit_content.appendChild(table);
	document.getElementById('show-xp-graph').href = './xpgraph.html?data=' + btoa(my_cat.info.xp_data);
}
function renderUintPage() {
	const cat_names_jp = my_cat.forms.map(x => x.jp_name).filter(x => x).join(' → ');
	const cat_names = my_cat.forms.map(x => x.name).filter(x => x).join(' → ');
	document.getElementById('open-db').href = 'https://battlecats-db.com/unit/' + t3str(my_id+1) + '.html';
	document.getElementById('ch_name').innerText = cat_names;
	document.getElementById('jp_name').innerText = cat_names_jp;
	document.title = cat_names.replaceAll(' → ', ' ') + ' - 貓咪資訊';
	for (let form of my_cat.forms) {
		const img = new Image();
		img.src = form.icon;
		cat_icons.appendChild(img);
	}
	my_cat.forms.forEach(renderForm);
	renderExtras();
}
loadAllCats()
.then(cats => {
	my_cat = cats[my_id];
	console.log(my_cat)
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
