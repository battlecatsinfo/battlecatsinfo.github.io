const my_params = new URLSearchParams(location.search);
const my_id = parseInt(my_params.get('id'));
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
	tbodytr5.childNodes[4].style.verticalAlign = 'middle';
	tbodytr5.childNodes[5].style.verticalAlign = 'middle';
	tbodytr5.childNodes[6].style.verticalAlign = 'middle';
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
		document.body.appendChild(div);
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
