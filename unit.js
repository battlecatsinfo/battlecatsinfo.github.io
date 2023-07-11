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
let my_curve = [20].concat([curveData0, curveData1, curveData2, curveData3, curveData4, curveData5][curveMap[my_id]]);
const
  TB_RED = 1,
  TB_FLOAT = 2,
  TB_BLACK = 4,
  TB_METAL = 8,
  TB_ANGEL = 16,
  TB_ALIEN = 32,
  TB_ZOMBIE = 64,
  TB_RELIC = 128,
  TB_WHITE = 256,
  TB_EVA = 512,
  TB_WITCH = 1024,
  TB_DEMON = 2048,
  TB_LAST = TB_DEMON;
const
  IMU_WAVE = 1,
  IMU_STOP = 2,
  IMU_SLOW = 4,
  IMU_KB = 8,
  IMU_VOLC = 16,
  IMU_WEAK = 32,
  IMU_WARP = 64,
  IMU_CURSE = 128,
  IMU_POIATK = 256,
  IMU_LAST = IMU_POIATK;
const
   AB_STRONG = 1,
   AB_LETHAL = 2,
   AB_ATKBASE = 3,
   AB_CRIT = 4,
   AB_ZKILL = 5,
   AB_CKILL = 6,
   AB_BREAK = 7,
   AB_SHIELDBREAK = 8,
   AB_S = 9,
   AB_BOUNTY = 10,
   AB_METALIC = 11,
   AB_MINIWAVE = 12,
   AB_WAVE = 13,
   AB_MINIVOLC = 14,
   AB_VOLC = 15,
   AB_WAVES = 16,
   AB_BAIL = 17,
   AB_BSTHUNT = 18,
   AB_WKILL = 19,
   AB_EKILL = 20,
   AB_WEAK = 21,
   AB_STOP = 22,
   AB_SLOW = 23, 
   AB_ONLY = 24,
   AB_GOOD = 25, 
   AB_RESIST = 26,
   AB_RESISTS = 27,
   AB_MASSIVE = 28,
   AB_MASSIVES = 29, 
   AB_KB = 30,
   AB_WARP = 31,
   AB_IMUATK = 32;
   AB_LAST = AB_IMUATK;
const cat_icons = document.getElementById('cat-icons');
const unit_content = document.getElementById('unit-content');
var level_count = 0;
let tables = [];
const environment = {
	'ATK': 300,
	'DEF': 300
};
const trait_no_treasure = TB_DEMON | TB_EVA | TB_WITCH | TB_WHITE | TB_METAL;
const trait_treasure = TB_RED | TB_FLOAT | TB_BLACK | TB_ANGEL | TB_ALIEN | TB_ZOMBIE | TB_RELIC;
let trait_short_names = ['紅','浮', '黑','鐵','天','星','屍','古', '無' , '使徒',  '魔女', '惡'];
function get_trait_short_names(trait) {
	var s = '';
	let i = 0;
	let idxs = [];
	for (let x = 1;x <= TB_LAST;x <<= 1) {
		if (trait & x) {
			s += trait_short_names[i];
		}
		i++;
	}
	return s;
}
function getTraitNames(trait) {
	if ((trait&255) == 255)
		return '所有敵人';
	if ((trait&127) == 127)
		return '有色敵人';
	
	let names = ['紅色敵人', '漂浮敵人', '黑色敵人', '鋼鐵敵人', '天使敵人', '異星戰士', '不死生物', '鋼鐵敵人', '無屬性敵人', '使徒', '魔女', '惡魔'];	
	let i = 0;
	let idxs = [];
	for (let x = 1;x <= TB_LAST;x <<= 1) {
		if (trait & x) {
			idxs.push(i);
		}
		i++;
	}
	if (idxs.length == 1)
		return names[idxs[0]];
	return get_trait_short_names(trait) + '屬性敵人';
}
function createAbIcons(ab, parent) {
	let icon_names = [
		'strong', 
		'lethal', 
		'atkbase', 
		'crit', 
    'z-kill', 
    'c-killl', 
    'break', 
    'shield-break', 
    's', 
    'bounty', 
    'metalic',
	  'mini-wave', 
	  'wave', 
	  'mini-volc', 
	  'volc', 
	  'waves',
	  'bail', 
	  'bsthunt',
	  'wkill', 
	  'ekill',
	  'weak', 
	  'stop', 
	  'slow', 
	  'only', 
	  'good', 
	  'resist', 
	  'resists', 
	  'massive', 
	  'massives', 
	  'kb', 
	  'warp', 
	  'imu-atk'
	]
  let descs = [
	'血量{1}%以下攻擊力增加{2}%',
	'{1}%機率以1血存活一次', 
	'善於攻城({1}%傷害)',
	'會心一擊	',
	'終結不死	',
	'靈魂攻擊',
	'{1}%機率打破惡魔盾',
	'{1}%機率打破宇宙盾',
	'{1}%機率使出{2}%以上渾身一擊',
	'擊倒敵人獲得兩倍金錢',
	'鋼鐵特性(爆擊之外攻擊只會受1傷害)',
	'{1}%機率放出Lv{2}小波動',
	'{1}%機率放出Lv{2}波動',
	'{1}%機率放出Lv{5}小烈波(出現位置{2}~{3}，持續{4}f)',
	'{1}%機率放出Lv{5}烈波(出現位置{2}~{3}，持續{4}f)',
	'波動滅止	',
	'超生命體特效(傷害1.6倍、受傷害減少30%)',
	'超獸特效(對超獸敵人傷害2.5倍、減傷40%、{1}%攻擊無效{2}f)',
	'終結魔女	',
	'終結使徒',
	'{1}%機率降低{2}攻擊力{3}{4}秒({5}秒)',
	'{1}%機率暫停{2}{3}秒({4}秒)',
	'{1}%機率緩速{2}{3}秒({4}秒)',
	'只能攻擊{1}',
	'對{1}傷害傷害1.5倍(1.8倍)受到紅屬性的敵人傷害減少50%(60%)',
	'受到{1}攻擊的傷害減至1/4(1/5)',
	'受到{1}攻擊的傷害減至1/5(1/6)',
	'對{1}造成3倍(4倍)傷害',
	'對{1}造成5倍(6倍)傷害',
	'{1}%機率擊退{2}',
	'{1}%機率傳送{2}',
	'{1}%發動攻擊無效{2}秒'
	]
	for (let i = 1;i <= AB_LAST;++i) {
		if (ab.hasOwnProperty(i)) {
			const e = document.createElement('span');
			e.classList.add('bc-icon', `bc-icon-${icon_names[i - 1]}`);
			parent.appendChild(e);
			const e2 = document.createElement('span');
			{
				var s = descs[i - 1];
				let o = ab[i];
				for (let j = 1;j <= o.length;++j) {
					s = s.replace('{' + j.toString() + '}', o[j - 1]);
				}
				e2.innerText = s;
			}
			parent.appendChild(e2);
			parent.appendChild(document.createElement('br'));
		}
	}
}
function createImuIcons(imu, parent) {
	if (!imu) return;
	let names = [
		'波動無效', 
		'暫停無效', 
		'緩速無效', 
		'擊退無效',
		'烈波無效',
		'降攻無效',
		'傳送無效',
		'詛咒無效',
		'毒擊無效'
	];
	let icon_names = ['wave', 'stop', 'slow', 'kb', 'volc', 'weak', 'wrap', 'curse', 'poiatk'];
	let i = 0;
	for (let x = 1;x <= IMU_LAST;x <<= 1) {
		if (imu & x) {
			const e = document.createElement('span');
			e.classList.add('bc-icon', `bc-icon-imu-${icon_names[i]}`);
			parent.appendChild(e);
			const e2 = document.createElement('span');
			e2.innerText = names[i];
			parent.appendChild(e2);
			parent.appendChild(document.createElement('br'));
		}
		i++;
	}
}
function createTraitIcons(trait, parent) {
	if (!trait) return;
	const names = [
		'red', 'float', 'black', 'metal', 'angel', 'alien', 'zombie', 'relic', 'white', 'eva', 'witch', 'demon'
	];
	let i = 0;
	for (let x = 1;x <= TB_LAST;x <<= 1) {
		if (trait & x) {
			const e = document.createElement('span');
			e.classList.add('bc-icon', `bc-icon-trait-${names[i]}`);
			parent.appendChild(e);
		}
		++i;
	}
	parent.appendChild(document.createElement('br'));
}
function numStr(num) {
	return parseFloat(num.toFixed(2)).toString();
}
function numStrT(num) {
	return parseFloat(num / 30).toFixed(2).toString() + 's';
}
function getLevelMulti(level) {
	var multi = 1;
	let n = 0;
	--level;
	for (let c of my_curve) {
		if (level <= n) break;
		multi += Math.min(level - n, 10) * (c / 100);
		n += 10;
	}
	return multi;
}

function updateValues(data, tbl) {
	let chs = tbl.childNodes;
	let HPs = chs[1].childNodes;
	let HPPKBs = chs[2].childNodes;
	let ATKs = chs[3].childNodes;
	let DPSs = chs[4].childNodes;
	let PRs = chs[8].childNodes;
	let CD = chs[7].childNodes[5];
	let KB = chs[7].childNodes[1];
	let kb = data[1];
	let price = data[6];
	let range = data[5];
	var trait = 0;
	var imu = 0;
	var ab = {};
	(data[10]) && (trait |= TB_RED);
	(data[16]) && (trait |= TB_FLOAT);
	(data[17]) && (trait |= TB_BLACK);
	(data[18]) && (trait |= TB_METAL);
	(data[19]) && (trait |= TB_WHITE);
	(data[20]) && (trait |= TB_ANGEL);
	(data[21]) && (trait |= TB_ALIEN);
	(data[22]) && (trait |= TB_ZOMBIE);
	(data[96]) && (trait |= TB_DEMON);
	if (trait) {
		let trait_names = [getTraitNames(trait)];
		(data[23]) && (ab[AB_GOOD] = trait_names);
		(data[24]) && (ab[AB_KB] = [data[24], trait_names[0]]);
		if (data[25]) {
			let stop_time = data[26];
			ab[AB_STOP] = [data[25], trait_names[0], (stop_time / 30).toFixed(1), ((stop_time*1.2) / 30).toFixed(1)];
		}
		if (data[27]) {
			let slow_time = data[28];
			ab[AB_SLOW] = [data[27], trait_names[0], (slow_time / 30).toFixed(1), ((slow_time*1.2) / 30).toFixed(1)];
		}
		(data[32]) && (ab[AB_ONLY] = trait_names);
		if (data[37]) {
			let weak_time = data[38];
			ab[AB_WEAK] = [data[37], trait_names[0], data[39], (weak_time / 30).toFixed(1), ((weak_time*1.2) / 30).toFixed(1)];
		}
		(data[29]) && (ab[AB_RESIST] = trait_names);
		(data[30]) && (ab[AB_MASSIVE] = trait_names);
		(data[80]) && (ab[AB_RESISTS] = trait_names);
		(data[81]) && (ab[AB_MASSIVES] = trait_names);
	}
	(data[31]) && (ab[AB_CRIT] = [data[31]]);
	(data[33] && (ab[AB_BOUNTY] = []));
	(data[34] && (ab[AB_ATKBASE] = [300]));
	(data[46]) && (imu |= IMU_WAVE);
	(data[48]) && (imu |= IMU_KB);
	(data[49]) && (imu |= IMU_STOP);
	(data[50]) && (imu |= IMU_SLOW);
	(data[51]) && (imu |= IMU_WEAK);
	(data[75]) && (imu |= IMU_WARP);
	(data[79]) && (imu |= IMU_CURSE);
	(data[90]) && (imu |= IMU_POIATK);
	(data[91]) && (imu |= IMU_VOLC);
	(data[41]) && (ab[AB_STRONG] = [data[40], data[41]]);
	(data[42]) && (ab[AB_LETHAL] = [data[42]]);
	(data[43]) && (ab[AB_METALIC] = []);
	(data[47]) && (ab[AB_WAVES] = []);
		if (data[35]) {
			if ((data.length < 95 || data[94] != 1)) {
				ab[AB_WAVE] = [data[35], data[36]];
			} else {
				ab[AB_MINIWAVE] = [data[35], data[36]];
			}
		}
	if (data.length >= 52) {
		(data[52]) && (ab[AB_ZKILL] = []);
		(data[53]) && (ab[AB_WKILL] = []);
		(data[77]) && (ab[AB_EKILL] = []);
		(data[70]) && (ab[AB_BREAK] = [data[70]]);
		let imu_atk_prob = data[84];
		let imu_atk_time = data[85];
		(data[82]) && (ab[AB_S] = [data[82], data[83]]);
		(data[84]) && (ab[AB_IMUATK] = [data[84], numStrT(data[85])]);
		if (data[86]) {
			let des1 = data[87] / 4;
			let des2 = des1 + data[88] / 4;
			let lv = data[89];
			let time = lv * 20;
			if (data.length >= 109 && data[108] == 1) {
				ab[AB_MINIVOLC] = [data[86], des1, des2, time, lv];
			} else {
				ab[AB_VOLC] = [data[86], des1, des2, time, lv];
			}
		}
		(data[95]) && (ab[AB_SHIELDBREAK] = [data[95]]);
		(data[105] && (ab[AB_BSTHUNT] = [data[106], data[107]]));
	}
	PRs[2].innerText = price;
	PRs[4].innerText = price * 1.5;
	PRs[6].innerText = price + price;
	let baseHP = data[0] * (1 + environment.DEF * 0.005);
	if (trait && data[29]) {
		let x4 = get_trait_short_names(trait & trait_treasure);
		let x3 = get_trait_short_names(trait & trait_no_treasure);
		for (let i = 1;i <= 5;++i) {
			let hp = baseHP * getLevelMulti(i * 10);
			let x4s = x4.length ? ('<br>' + x4 + (hp*4).toFixed(0)) : '';
			let x3s = x3.length ? ('<br>' + x3 + (hp*3).toFixed(0)) : '';
			HPs[i].innerHTML = hp.toFixed(0) + x3s + x4s;
			HPPKBs[i].innerHTML = (hp / kb).toFixed(0);
		}
		let val = baseHP * 0.2;
		let x4s = x4.length ? ('<br>' + x4 + '+' + numStr(val*4)) : '';
		let x3s = x3.length ? ('<br>' + x3 + '+' + numStr(val*3)) : '';
		HPs[6].innerHTML = '+' + numStr(val) + x3s + x4s;
	} else if (trait && data[80]) {
		let x4 = get_trait_short_names(trait & trait_no_treasure);
		let x5 = get_trait_short_names(trait & trait_treasure);
		for (let i = 1;i <= 5;++i) {
			let hp = baseHP * getLevelMulti(i * 10);
			let x4s = x4.length ? ('<br>' + x4 + (hp*4).toFixed(0)) : '';
			let x5s = x5.length ? ('<br>' + x5 + (hp*5).toFixed(0)) : '';
			HPs[i].innerHTML = hp.toFixed(0) + x4s + x5s;
			HPPKBs[i].innerHTML = (hp / kb).toFixed(0);
		}
		let val = baseHP * 0.2;
		let x4s = x4.length ? ('<br>' + x4 + '+' + numStr(val*4)) : '';
		let x5s = x5.length ? ('<br>' + x5 + '+' + numStr(val*5)) : '';
		HPs[6].innerHTML = '+' + numStr(val) + x4s + x5s;
	} else {
		for (let i = 1;i <= 5;++i) {
			let hp = baseHP * getLevelMulti(i * 10);
			HPs[i].innerText = hp.toFixed(0);
			HPPKBs[i].innerText = (hp / kb).toFixed(0);
		}
		HPs[6].innerText = '+' + numStr(baseHP * 0.2);
	}
	HPPKBs[6].innerText	= '+' + numStr((baseHP * 0.2)  / kb);
	let cd = Math.max(data[7] * 2 - 264, 60); // max tech & treasure lead to -264f CD
	let atk = data[3];
	let atk1 = data[59] | 0;
	let atk2 = data[60] | 0;
	let pre = data[13];
	let pre1 = data[61];
	let pre2 = data[62];
	let tba = data[4] * 2;
	let longPre = pre2 ? pre2 : (pre1 ? pre1 : pre);
	let attackF = longPre + tba - 1;
	let totalAtk = atk + atk1 + atk2;
	let baseATK = totalAtk * (1 + environment.ATK * 0.005);
	let attackS = attackF / 30;
/*
		(data[30]) && (ab[AB_MASSIVE] = trait_names);
		(data[81]) && (ab[AB_MASSIVES] = trait_names);
*/
	if (trait && data[30]) {
		let x3 = get_trait_short_names(trait & trait_no_treasure);
		let x4 = get_trait_short_names(trait & trait_treasure);
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
	} else if (trait && data[81]) {
		
	} else {
		for (let i = 1;i <= 5;++i) {
			let _atk = baseATK * getLevelMulti(i * 10);
			ATKs[i].innerText = _atk.toFixed(0);
			DPSs[i].innerText = (_atk / attackS).toFixed(0);
		}
		ATKs[6].innerText = '+' + numStr(baseATK * 0.2);
		DPSs[6].innerText = '+' + numStr((baseATK * 0.2) / attackS);
	}

	chs[6].childNodes[1].innerText = data[4].toString() + 'f';
	chs[6].childNodes[3].innerText = numStrT(tba);
	chs[5].childNodes[1].innerText = Math.round(attackS).toPrecision(2) + '秒/下';
	chs[5].childNodes[3].innerText = numStrT(data[13]);

	let atkCount = atk1 == 0 ? 1 : atk2 == 0 ? 2 : 3;
	let lds = new Array(atkCount);
	lds[0] = data[44];
	let ldr = new Array(atkCount);
	ldr[0] = data[45];
	for (let i = 1;i < atkCount;++i) {
		if (data[99 + (i - 1) * 3] == 1) {
			lds[i] = data[99 + (i - 1) * 3 + 1];
			ldr[i] = data[99 + (i - 1) * 3 + 2];
		} else {
			lds[i] = lds[0];
			ldr[i] = ldr[0];
		}
	}
	var atkModel = '';
	for (let x of ldr) {
		if (x < 0) {
			atkModel = '全方位';
			break;
		}
		if (x > 0) {
			atkModel = '遠方';
		}
	}
  chs[5].childNodes[6].innerText = atkModel + (data[12] ? '範圍攻擊' : '單體攻擊');
	let specials = chs[9].childNodes[1];
	specials.style.textAlign = 'left';
  if (lds.length != 1) {
  	const e = document.createElement('p');
  	let atksPre = [atk, atk1, atk2].slice(0, lds.length).map(x => ((x / totalAtk)*100).toFixed(0)+'%');
  	let atksP = atksPre.join('-');
  	e.innerText = `${lds.length}回連續攻擊(傷害${atksP})`;
  	specials.appendChild(e);
  	specials.appendChild(document.createElement('br'));
  	let nums = '①②③';
  	var s = '';
  	for (let i = 0;i < lds.length;++i) {
  		s += `${nums[i]}${lds[i]}~${lds[i]+ldr[i]}<br>`;
  	}
  	chs[5].childNodes[5].innerHTML = `接觸點${range}<br>範圍<br>${s.slice(0,s.length-4)}`;
  } else {
  	chs[5].childNodes[5].innerText = range;
  }
	createTraitIcons(trait, specials);
	createImuIcons(imu, specials);
	createAbIcons(ab, specials);
	KB.innerText = kb;
	CD.innerText = numStrT(cd);
}
function t3str(x) {
	let s = x.toString();
	switch (s.length) {
	case 3: return s;
	case 2: return '0' + s;
	case 1: return '00' + s;
	}
}
const my_id_str = t3str(my_id);
function createTable(data) {
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

	makeTd(tbodytr6, '間隔');
	makeTd(tbodytr6, `${2.07} 秒`);
	makeTd(tbodytr6, 'TBA');
	makeTd(tbodytr6, `${5.9} 秒`);

	makeTd(tbodytr7, 'KB');
	makeTd(tbodytr7, '2');
	makeTd(tbodytr7, '跑速');
	makeTd(tbodytr7, '32');
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
	updateValues(data, tbl);
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
function loadAdditional() {
	fetch('./data/data/unitbuy.csv')
	.then(res => res.text())
	.then(text => {
		const rarities = ["基本", "EX", "稀有", "激稀有",
                   "超激稀有", "傳說稀有"];
		var unit_stats = '';
		var i = 0;
		var start = 0;
		var end;
		while (i < my_id) {
			var j = start;
			for (;text[j] != '\n';++j) {}
			start = j + 1;
			++i;
		}
		for (end = start;text[end] != '\n';++end) {}
		let data = text.slice(start, end).split(',').map(x => parseInt(x));
		unit_stats += '貓咪類別： ' + rarities[data[13]];
		unit_stats += '\n最大基本等級： ' + data[50].toString();
		unit_stats += '\n最大+等級： ' + data[51].toString();
		unit_stats += '\n';
		var version = data[data.length - 6];
		if (version >= 100000) {
			version = version.toString();
			unit_stats += `Ver ${parseInt(version.slice(0, 2))}.${parseInt(version.slice(2, 4))}.${parseInt(version.slice(4))} 新增\n`;
		}
		const catfruits = {
			30: '紫色貓薄荷種子',
			31: '紅色貓薄荷種子',
			32: '籃色貓薄荷種子',
			33: '綠色貓薄荷種子',
			34: '黃色貓薄荷種子',
			35: '紫色貓薄荷果實',
			36: '紅色貓薄荷果實',
			37: '籃色貓薄荷果實',
			38: '綠色貓薄荷果實',
			39: '黃色貓薄荷種子',
			40: '彩虹貓薄荷果實',
			41: '古代貓薄荷種子',
			42: '古代貓薄荷果實',
			43: '彩虹貓薄荷種子',
			44: '黃金貓薄荷果實',
			160: '惡貓薄荷種子',
			161: '惡貓薄荷果實',
			164: '黃金貓薄荷種子',
			167: "紫獸石",
			168: "紅獸石",
			169: "蒼獸石",
			170: "翠獸石",
			171: "黃獸石",
			179: "紫獸石結晶",
			180: "紅獸石結晶",
			181: "蒼獸石結晶",
			182: "翠獸石結晶",
			183: "黃獸石結晶",
			184: "虹獸石"
		};
		
		if (data[27]) {
			var s = '角色等級達到Lv30後，以';
			var reqs = ['XP ' + data[27].toString()];
			for (let i = 28;i <= 38;i+=2) {
				let amount = data[i + 1];
				if (amount) {
				    reqs.push(catfruits[data[i]] + 'x' + amount.toString());
				}
			}
			unit_stats += s + reqs.join('、');
			unit_stats += '進化\n';
		}
		let crazed = (data[3] > 50000) && (data[13] == 3);
		let xp_last = crazed ? data[3] * 1.5 : data[2] * 2;
		let xp_data = [0].concat(data.slice(3, 12), xp_last).join(',');
		document.getElementById('show-xp-graph').href = './xpgraph.html?data=' + btoa(xp_data);
		const pre = document.createElement('pre');
		pre.innerText = unit_stats;
		unit_content.appendChild(pre);
	});
}
function loadContents() {
	const my_name = unit_names[my_id].filter(x => x);
	const my_name_jp = unit_names_jp[my_id].filter(x => x);
	document.getElementById('ch_name').innerText = my_name.join(' → ');
	document.getElementById('open-db').href = 'https://www.google.com/search?q=' + (document.getElementById('jp_name').innerText = my_name_jp.join(' → ')).split('→')[0].trim() + '+site%3Abattlecats-db.com'
	const unit_levels = Math.max(my_name.length, my_name_jp.length);
	for (let i= 0;i < unit_levels;++i) {
		let img = new Image();
		let form = 'fcs'[i];
		img.src = `./data/unit/${my_id_str}/${form}/uni${my_id_str}_${form}00.png`;
		cat_icons.appendChild(img);
	}
	document.title = (my_name ? my_name : my_name_jp) + ' - 貓咪資訊';
	fetch(`./data/unit/${my_id_str}/unit${my_id_str}.csv`)
	.then(res => res.text())
	.then(text => {
		loadAdditional();
		let datas = text.replace('\r', '').split('\n').filter(x => x.trim()).map(line => line.split(',').map(x => parseInt(x)));
		for (let i = 0;i < Math.min(datas.length, unit_levels);++i) {
			tables.push(createTable(datas[i]));
		}
	});
}

loadContents();
document.getElementById('show-level-graph').href = './levelgraph.html?id=' + my_id.toString();
