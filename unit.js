const my_params = new URLSearchParams(location.search);
const my_id = parseInt(my_params.get('id'));
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
var level_count = 0;
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
	let baseHP = form.hp * (1 + environment.DEF * 0.005);
	if (form.trait && form.ab.hasOwnProperty(AB_RESIST)) {
		let x4 = get_trait_short_names(form.trait & trait_no_treasure);
		let x5 = get_trait_short_names(form.trait & trait_treasure);
		for (let i = 1;i <= 5;++i) {
			let hp = baseHP * getLevelMulti(i * 10);
			let x4s = x4.length ? ('<br>' + x4 + (hp*4).toFixed(0)) : '';
			let x5s = x5.length ? ('<br>' + x5 + (hp*5).toFixed(0)) : '';
			HPs[i].innerHTML = hp.toFixed(0) + x4s + x5s;
			HPPKBs[i].innerHTML = (hp / form.kb).toFixed(0);
		}
		let val = baseHP * 0.2;
		let x4s = x4.length ? ('<br>' + x4 + '+' + numStr(val*4)) : '';
		let x5s = x5.length ? ('<br>' + x5 + '+' + numStr(val*5)) : '';
		HPs[6].innerHTML = '+' + numStr(val) + x4s + x5s;
	} else if (form.trait && form.ab.hasOwnProperty(AB_RESISTS)) {
		let x6 = get_trait_short_names(form.trait & trait_no_treasure);
		let x7 = get_trait_short_names(form.trait & trait_treasure);
		for (let i = 1;i <= 5;++i) {
			let hp = baseHP * getLevelMulti(i * 10);
			let x7s = x7.length ? ('<br>' + x7 + (hp*7).toFixed(0)) : '';
			let x6s = x6.length ? ('<br>' + x6 + (hp*6).toFixed(0)) : '';
			HPs[i].innerHTML = hp.toFixed(0) + x6s + x7s;
			HPPKBs[i].innerHTML = (hp / form.kb).toFixed(0);
		}
		let val = baseHP * 0.2;
		let x6s = x6.length ? ('<br>' + x6 + '+' + numStr(val*6)) : '';
		let x7s = x7.length ? ('<br>' + x7 + '+' + numStr(val*7)) : '';
		HPs[6].innerHTML = '+' + numStr(val) + x6s + x7s;
	} else {
		for (let i = 1;i <= 5;++i) {
			let hp = baseHP * getLevelMulti(i * 10);
			HPs[i].innerText = hp.toFixed(0);
			HPPKBs[i].innerText = (hp / form.kb).toFixed(0);
		}
		HPs[6].innerText = '+' + numStr(baseHP * 0.2);
	}
	HPPKBs[6].innerText	= '+' + numStr((baseHP * 0.2) / form.kb);
	const totalAtk = form.atk + form.atk1 + form.atk2;
	let baseATK = totalAtk * (1 + environment.ATK * 0.005);
	let attackS = form.attackF / 30;
	if (form.trait && form.ab.hasOwnProperty(AB_MASSIVE)) {
		let x3 = get_trait_short_names(form.trait & trait_no_treasure);
		let x4 = get_trait_short_names(form.trait & trait_treasure);
		for (let i = 1;i <= 5;++i) {
			let _atk = baseATK * getLevelMulti(i * 10);
			let x4s = x4.length ? ('<br>' + x4 + (_atk*4).toFixed(0)) : '';
			let x3s = x3.length ? ('<br>' + x3 + (_atk*3).toFixed(0)) : '';
			let x4dps = x4.length ? ('<br>' + x4 + ((_atk*4)/attackS).toFixed(0)) : '';
			let x3dps = x3.length ? ('<br>' + x3 + ((_atk*3)/attackS).toFixed(0)) : '';
			ATKs[i].innerHTML = _atk.toFixed(0) + x3s + x4s;
			DPSs[i].innerHTML = (_atk / attackS).toFixed(0) + x3dps + x4dps;
		}
		let _atk = baseATK * 0.2;
		let x4s = x4.length ? ('<br>' + x4 + '+' + numStr(_atk*4)) : '';
		let x3s = x3.length ? ('<br>' + x3 + '+' + numStr(_atk*3)) : '';
		let x4dps = x4.length ? ('<br>' + x4 + '+' + numStr((_atk*4)/attackS)) : '';
		let x3dps = x3.length ? ('<br>' + x3 + '+' + numStr((_atk*3)/attackS)) : '';
		ATKs[6].innerHTML = '+' + numStr(_atk) + x3s + x4s;
		DPSs[6].innerHTML = '+' + numStr(_atk / attackS) + x3dps + x4dps;
	} else if (form.trait && form.ab.hasOwnProperty(AB_MASSIVES)) {
		let x5 = get_trait_short_names(form.trait & trait_no_treasure);
		let x6 = get_trait_short_names(form.trait & trait_treasure);
		for (let i = 1;i <= 5;++i) {
			let _atk = baseATK * getLevelMulti(i * 10);
			let x5s = x5.length ? ('<br>' + x5 + (_atk*5).toFixed(0)) : '';
			let x6s = x6.length ? ('<br>' + x6 + (_atk*6).toFixed(0)) : '';
			let x5dps = x5.length ? ('<br>' + x5 + ((_atk*5)/attackS).toFixed(0)) : '';
			let x6dps = x6.length ? ('<br>' + x6 + ((_atk*6)/attackS).toFixed(0)) : '';
			ATKs[i].innerHTML = _atk.toFixed(0) + x5s + x6s;
			DPSs[i].innerHTML = (_atk / attackS).toFixed(0) + x5dps + x6dps;
		}
		let _atk = baseATK * 0.2;
		let x5s = x5.length ? ('<br>' + x5 + '+' + numStr(_atk*5)) : '';
		let x6s = x6.length ? ('<br>' + x6 + '+' + numStr(_atk*6)) : '';
		let x5dps = x5.length ? ('<br>' + x5 + '+' + numStr((_atk*5)/attackS)) : '';
		let x6dps = x6.length ? ('<br>' + x6 + '+' + numStr((_atk*6)/attackS)) : '';
		ATKs[6].innerHTML = '+' + numStr(_atk) + x5s + x6s;
		DPSs[6].innerHTML = '+' + numStr(_atk / attackS) + x5dps + x6dps;
	} else {
		for (let i = 1;i <= 5;++i) {
			let _atk = baseATK * getLevelMulti(i * 10);
			ATKs[i].innerText = _atk.toFixed(0);
			DPSs[i].innerText = (_atk / attackS).toFixed(0);
		}
		ATKs[6].innerText = '+' + numStr(baseATK * 0.2);
		DPSs[6].innerText = '+' + numStr((baseATK * 0.2) / attackS);
	}
	chs[6].childNodes[1].innerText = numStrT(form.tba);
	chs[6].childNodes[3].innerText = numStrT(form.backswing);
	chs[5].childNodes[1].innerText = attackS.toPrecision(2) + '秒/下';
	chs[5].childNodes[3].innerText = numStrT(form.pre);
	var atkType = '';
	if (form.atkType & ATK_OMNI)
		atkType += '全方位';
	else if (form.atkType & ATK_LD)
		atkType += '遠方';
	atkType += (form.atkType & ATK_RANGE) ? '範圍攻擊' : '單體攻擊';
	chs[5].childNodes[6].innerText = atkType;
	const specials = chs[9].childNodes[1];
	specials.style.textAlign = 'left';
	const lds = form.lds;
	const ldr = form.ldr;
	if (form.atk1 || form.atk2) {
		const e = document.createElement('p');
		let atksPre = [form.atk, form.atk1, form.atk2].slice(0, lds.length).map(x => ((x / totalAtk)*100).toFixed(0)+'%');
		e.innerText = `${lds.length}回連續攻擊(傷害${atksPre.join('-')})`;
		specials.appendChild(e);
		specials.appendChild(document.createElement('br'));
		if (lds.length != 1 && (lds.some(x => x) || ldr.some(x => x))) {
			const nums = '①②③';
			var s = '';
			for (let i = 0;i < lds.length;++i) {
				s += `${nums[i]}${lds[i]}~${lds[i]+ldr[i]}<br>`;
			}
			chs[5].childNodes[5].innerHTML = `接觸點${form.range}<br>範圍<br>${s.slice(0,s.length-4)}`;
		} else {
			chs[5].childNodes[5].innerText = form.range;
		}
	} else {
		chs[5].childNodes[5].innerText = form.range;
	}
	createTraitIcons(form.trait, specials);
	createImuIcons(form.imu, specials);
	createAbIcons(form.ab, specials);
	KB.innerText = form.kb.toString();
	CD.innerText = numStrT(form.cd);
}
function renderForm(form) {
	function makeTd(parent, text) {
		const c = document.createElement('td');
		c.innerText = text;
		parent.appendChild(c);
		return c;
	}
	function makeTh(parent, text) {
		const c = document.createElement('th');
		c.innerText = text;
		parent.appendChild(c);
		return c;
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
	level_text.innerHTML = ['一階：<br>', '二階：<br>', '三階：<br>', '本能完全升滿的數值表格', '超本能完全升滿的數值表格'][level_count] + ((level_count <= 2) ? unit_descs[my_id][level_count] : '');
	++level_count;
	level_text.classList.add('bold-large');
	makeTh(theadtr, '');
	makeTh(theadtr, 'Lv10');
	makeTh(theadtr, 'Lv20');
	makeTh(theadtr, 'Lv30');
	makeTh(theadtr, 'Lv40');
	makeTh(theadtr, 'Lv50');
	makeTh(theadtr, '每提升一級');

	makeTd(tbodytr1, 'HP');
	for (let i = 0;i < 5;++i)
		makeTd(tbodytr1, '');
	makeTd(tbodytr1, '');
	
	makeTd(tbodytr2, '硬度');
	for (let i = 0;i < 5;++i)
		makeTd(tbodytr2, '');
	makeTd(tbodytr2, '');

	makeTd(tbodytr3, '攻擊力');
	for (let i = 0;i < 5;++i)
		makeTd(tbodytr3, '');
	makeTd(tbodytr3, '');

	makeTd(tbodytr4, 'DPS');
	for (let i = 0;i < 5;++i)
		makeTd(tbodytr4, '');
	makeTd(tbodytr4, '');

	makeTd(tbodytr5, '攻擊頻率');
	makeTd(tbodytr5, '');
	makeTd(tbodytr5, '出招時間');
	makeTd(tbodytr5, '');
	makeTd(tbodytr5, '射程').rowSpan = 2;
	makeTd(tbodytr5, '').rowSpan = 2;
	makeTd(tbodytr5, '').rowSpan = 3;

	makeTd(tbodytr6, '攻擊間隔');
	makeTd(tbodytr6, '');
	makeTd(tbodytr6, '收招時間');
	makeTd(tbodytr6, '');

	makeTd(tbodytr7, 'KB');
	makeTd(tbodytr7, '');
	makeTd(tbodytr7, '跑速');
	makeTd(tbodytr7, '');
	makeTd(tbodytr7, '再生產');
	makeTd(tbodytr7, '');

	makeTd(tbodytr8, '召喚金額');
	makeTd(tbodytr8, '一章');
	makeTd(tbodytr8, '');
	makeTd(tbodytr8, '二章(傳說)');
	makeTd(tbodytr8, '');
	makeTd(tbodytr8, '三章');
	makeTd(tbodytr8, '');

	makeTd(tbodytr9, '特殊能力');
	makeTd(tbodytr9, '').colSpan = 6;

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
	updateValues(form, tbl);
	tbl.classList.add('w3-table', 'w3-striped', 'w3-centered');
	let even = false;
	for (let e of tbl.childNodes) {
		if (even)
			e.style.backgroundColor = '#f1f1f1';
		even = !even;
	}
	unit_content.appendChild(level_text);
	unit_content.appendChild(tbl);
	return tbl;
}
function renderExtras(my_cat) {
	const pre = document.createElement('pre');
	var unit_stats = '類別: ' + my_cat.info.getRarityString();
	unit_stats += '\n最大基本等級： ' + my_cat.info.maxBase.toString();
	unit_stats += '\n最大+等級: ' + my_cat.info.maxPlus.toString();
	unit_stats += '\n';
	if (my_cat.info.version) {
		let version = my_cat.info.version.toString();
		unit_stats += `Ver ${parseInt(version.slice(0, 2))}.${parseInt(version.slice(2, 4))}.${parseInt(version.slice(4))} 新增\n`;
	}
	if (my_cat.info.upReqs) unit_stats += my_cat.info.getCatFruitString();
	pre.innerText = unit_stats;
	document.getElementById('show-xp-graph').href = './xpgraph.html?data=' + btoa(my_cat.info.xp_data);
	unit_content.appendChild(pre);
}
function renderUintPage(my_cat) {
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
	renderExtras(my_cat);
}
loadAllCats()
.then(cats => {
	const my_cat = cats[my_id];
	console.log(my_cat)
	useCurve(my_id);
	renderUintPage(my_cat);	
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
