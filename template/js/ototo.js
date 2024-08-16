const M = document.getElementById('MC');
const modal = M.parentNode.parentNode;
const ths = [
	'紅磚',
	'羽毛',
	'備長炭',
	'鋼製齒輪',
	'黃金',
	'宇宙石',
	'神秘骨頭',
	'菊石'
];

let _l_f = localStorage.getItem('prec');
if (_l_f) {
	_l_f = parseInt(_l_f);
} else {
	_l_f = 2;
}
_l_f = new Intl.NumberFormat(undefined, {
	'maximumFractionDigits': _l_f
});

function percentage(num) {
	return _l_f.format(num) + '%';
}

function percentage2(num) {
	return _l_f.format(num / 10) + '%';
}

function numStr(num) {
	return _l_f.format(num);
}

function numStrT(num) {
	return `${num}F/${_l_f.format(num / 30)}秒`;
}

function numHP(num) {
	return ~~(num * 0.05).toString();
}

function just(num) {
	return num.toString();
}

const descs = [
	['城總體力', numStr, 123600, 156000, 196000, 236000], // 0: 城體力
	['使動作變慢時間', numStrT, 30, 50, 100, 150], // 1: 低速砲
	['體力', numHP, 100, 298, 330, 362, '持續時間', numStrT, 60, 90, 135, 180], // 2: 鐵壁砲 HP * 5
	['攻擊力', percentage, 30, 39, 48, 57, '使動作停止時間', numStrT, 15, 30, 60, 90], // 3: 閃雷砲
	['傷害比例', percentage, 11, 20, 35, 45], // 4: 水喉砲
	['傷害（地上）', percentage2, 5, 25, 100, 150, '傷害（地下）', percentage2, 100, 150, 300, 400, '使動作停止時間', numStrT, 30, 45, 60, 75], // 5: 天使砲
	['攻擊力', percentage, 30, 50, 100, 150, '半徑', just, 80, 100, 160, 200], // 6: 斬盾砲
	['詛咒時間', numStrT, 33, 60, 120, 180] // 7: 詛咒砲
];

const datas = [
	[
		",,,,,,,,,12|,,,,,,,,,12|,,,,,,,,,12|4,4,4,,,,,,1,12|3,3,3,3,,,,,1,12|6,6,6,,,,,,1,12|6,4,4,4,,,,,2,12|6,6,6,,6,,,,2,12|,6,6,6,,6,,,2,12|9,,7,,7,,7,,3,12|,9,,7,7,7,,,3,12|,,,9,9,9,9,,3,12|4,4,,4,,,,,1,12|8,8,8,,,,,,1,12|6,6,6,6,,,,,2,12|,10,12,,,14,,,2,12|9,,9,9,,,9,,3,12|14,6,,,14,14,,,3,12|,6,14,12,,16,,,3,12|14,,14,,14,,18,,3,12|,14,,14,14,18,,,3,12|,,,18,18,18,18,,4,12|20,,,,,10,10,8,1,12|,,18,12,,,10,8,1,12|,16,,14,20,10,,,2,12|22,20,,,,,10,8,2,12|,,24,16,24,,,8,3,12|24,24,,,,12,12,,3,12|,,28,18,28,,,10,3,12|28,,,,28,18,,10,3,12|30,30,,,,20,16,,3,12|32,,30,,32,,,14,4,12",
		"5,3,4,,,,,,1,12|7,4,5,2,,,,,1,12|9,5,7,3,,,,,2,24|5,3,4,,,,,,1,12|,5,3,4,,,,,1,12|6,5,5,2,,,,,1,12|,6,5,5,2,,,,2,12|6,7,7,,4,,,,2,12|7,5,6,,6,,,,2,12|9,8,7,,,6,,,3,12|10,,8,4,,8,,,3,12|11,10,,,7,,8,,3,12|4,4,4,,,,,,1,12|,6,8,,,10,,,1,12|,6,10,8,,,,,2,12|9,9,9,,,9,,,2,12|,,12,6,6,,12,,3,12|10,,,,10,14,14,,3,12|12,8,16,,12,,,,3,12|14,,14,,,16,16,,3,12|16,,20,4,,20,,,3,12|18,12,,,22,,20,,4,12|,,,8,,,3,1,1,12|,,,5,8,10,,1,1,12|6,6,,,,,10,2,2,12|,,14,6,,14,,2,2,12|,8,,,8,,16,4,3,12|16,,,14,,,14,4,3,12|,12,14,,,16,,6,3,12|22,,,12,20,,,6,3,12|,,22,,,16,14,8,3,12|,24,,18,22,,,8,4,12",
		"3,,4,5,,,,,1,12|4,5,2,7,,,,,1,12|6,,6,9,3,,,,2,24|3,,4,5,,,,,1,12|,2,5,5,,,,,1,12|6,3,3,6,,,,,1,12|,5,4,6,,3,,,2,12|6,,,7,6,,5,,2,12|,6,5,7,,,6,,2,12|,4,,9,8,9,,,3,12|6,,,9,7,8,,,3,12|,7,,11,8,,10,,3,12|,,4,4,4,,,,1,12|,,,5,7,12,,,1,12|,,7,7,,,10,,2,12|9,8,10,9,,,,,2,12|,6,,9,10,11,,,3,12|,,,13,12,12,11,,3,12|12,8,12,16,,,,,3,12|,10,,18,,18,14,,3,12|,,10,20,14,16,,,3,12|16,,,22,16,,18,,4,12|,6,,4,,,,2,1,12|12,,,4,,7,,1,1,12|,,10,6,,,6,2,2,12|,16,,6,12,,,2,2,12|18,,,8,8,,,2,3,12|,,,10,,18,16,4,3,12|,14,20,10,,,,4,3,12|18,,,16,,,20,6,3,12|,16,,16,,20,,8,3,12|,,22,20,22,,,8,4,12",
		",4,4,4,,,,,1,12|4,6,4,4,,,,,1,12|9,,9,,,3,3,,2,24|,4,4,4,,,,,1,12|4,4,4,,,,,,1,12|5,3,6,,4,,,,1,12|6,,,3,,5,4,,2,12|,6,,,7,6,5,,2,12|7,,5,,8,4,,,2,12|,9,,6,8,,7,,3,12|,,7,,6,8,9,,3,12|6,,,,10,9,11,,3,12|,,4,,,4,4,,1,12|,6,6,,,4,8,,1,12|6,6,,4,,8,,,2,12|,8,10,,6,,12,,2,12|8,,,5,,11,12,,3,12|,,14,,7,12,15,,3,12|12,,15,,8,13,,,3,12|13,,16,15,,,16,,3,12|,14,,13,,15,18,,3,12|18,,,,14,20,20,,4,12|,,6,,,,4,2,1,12|7,14,,,,,2,1,1,12|,,5,,,10,6,3,2,12|15,,,10,,,10,1,2,12|,8,14,,,,12,2,3,12|16,,,18,,,10,4,3,12|,10,,,20,,12,6,3,12|,,22,,,22,10,6,3,12|,18,,,22,,12,8,3,12|20,,,22,,,22,8,4,12",
		"6,3,,,3,,,,1,12|8,4,4,,2,,,,1,12|7,8,5,,,,4,,2,24|5,4,,,,3,,,1,12|4,4,,4,,,,,1,12|5,5,5,,3,,,,1,12|5,,5,,,4,4,,2,12|7,4,7,,,,6,,2,12|8,5,7,4,,,,,2,12|9,8,7,,6,,,,3,12|8,7,9,,,6,,,3,12|11,8,10,,,,7,,3,12|4,,,,4,4,,,1,12|6,6,,,,12,,,1,12|7,,10,7,,,,,2,12|8,12,,,6,,10,,2,12|8,,10,4,,14,,,3,12|10,8,14,,,,16,,3,12|10,10,,12,,16,,,3,12|12,16,,,16,,16,,3,12|12,,14,18,,16,,,3,12|14,,18,,,20,20,,4,12|5,,,2,,5,,,1,12|,8,8,2,6,,,,1,12|10,,,4,8,,2,,2,12|,8,12,,6,10,,,2,12|10,10,8,,,,8,,3,12|18,,,10,18,,,2,3,12|,16,16,,,,15,1,3,12|24,,,20,,15,,1,3,12|22,,,,16,20,,2,3,12|24,,26,18,,,,4,4,12",
		",,5,,5,,2,,1,12|6,,,4,5,,3,,1,12|,,8,5,,6,5,,2,24|,,5,,,5,2,,1,12|,,5,4,,,3,,1,12|,4,,4,,5,5,,1,12|,5,,,3,4,6,,2,12|6,,6,6,,,6,,2,12|,5,,,6,6,7,,2,12|,,9,6,8,,7,,3,12|7,,7,,,8,8,,3,12|,7,10,,9,,10,,3,12|,5,5,,,,2,,1,12|12,,,,,8,4,,1,12|,,8,,6,4,6,,2,12|6,12,,,,10,8,,2,12|10,,11,7,,,8,,3,12|,14,,,12,12,10,,3,12|12,,,,12,12,12,,3,12|16,,12,,,18,14,,3,12|,17,14,13,,,16,,3,12|18,,20,16,,,18,,4,12|,,4,,6,,2,,1,12|6,,5,5,,8,,,1,12|5,6,,,8,,5,,2,12|,,8,12,,10,6,,2,12|,10,8,,12,,6,,3,12|14,,,18,,,14,2,3,12|16,,14,,,15,,3,3,12|,16,,,24,,18,2,3,12|24,,,16,,18,,2,3,12|,20,26,,,,24,2,4,12",
		"5,5,,,,2,,,1,12|,,6,,5,3,4,,1,12|8,6,,4,,6,,,2,24|5,,5,,,2,,,1,12|,,,,4,3,5,,1,12|6,5,,3,,4,,,1,12|,,5,,4,4,5,,2,12|10,,,4,4,6,,,2,12|,7,,5,,6,6,,2,12|,8,10,,5,7,,,3,12|10,,,5,7,8,,,3,12|,10,12,,,8,6,,3,12|5,,5,,,2,,,1,12|10,8,,2,,4,,,1,12|,8,7,,3,6,,,2,12|14,,9,7,,6,,,2,12|,10,13,,5,8,,,3,12|14,,16,,,8,10,,3,12|14,14,,10,,10,,,3,12|20,,,,18,10,12,,3,12|,16,18,14,,12,,,3,12|20,16,20,,,16,,,4,12|,,6,2,,4,,,1,12|10,4,,,6,,4,,1,12|8,,8,4,,4,,,2,12|,10,,10,,4,12,,2,12|12,,10,,8,6,,,3,12|,16,,18,,13,,1,3,12|16,,,,,16,15,1,3,12|,,22,,20,16,,2,3,12|,20,,18,,18,,4,3,12|,,,,20,25,22,5,4,12",
		"8,,2,2,,,,,1,12|,2,8,4,4,,,,1,12|12,3,,,,5,4,,2,24|,,8,2,2,,,,1,12|8,,,,,2,2,,1,12|,3,10,,2,,3,,1,12|12,2,,2,,2,,,2,12|,5,12,,5,,2,,2,12|16,,,3,3,2,,,2,12|,5,14,,6,,5,,3,12|16,3,,6,,5,,,3,12|,8,15,,5,,8,,3,12|8,,,2,,2,,,1,12|,2,15,5,,2,,,1,12|18,,,,2,2,2,,2,12|,5,20,6,,5,,,2,12|24,,,5,2,5,,,3,12|,,20,12,10,,6,,3,12|24,,,6,,12,6,,3,12|,12,22,,,14,12,,3,12|24,,,12,14,10,,,3,12|,18,24,,12,,18,,4,12|3,,4,,,,5,,1,12|10,5,,5,,4,,,1,12|,4,10,6,,,4,,2,12|12,,14,,6,,4,,2,12|,10,,8,,6,12,,3,12|14,,18,,14,,,2,3,12|16,10,20,,,,,2,3,12|20,,,22,,16,,2,3,12|,15,24,,,,18,3,3,12|24,,,,24,21,,3,4,12"
	],
	[
		'',
		"3,2,2,1,,,,,2,24|2,1,1,,,,,,1,12|,2,1,1,,,,,1,12|2,2,1,1,,,,,1,12|,2,2,2,1,,,,2,12|2,2,2,,1,,,,2,12|2,2,2,,2,,,,2,12|2,2,2,,,2,,,3,12|3,,2,1,,2,,,3,12|3,3,,,2,,2,,3,12|1,1,1,,,,,1,1,12|,2,2,,,3,,,1,12|,2,3,2,,,,1,2,12|3,2,3,,,3,,,2,12|,,3,,2,,4,1,3,12|3,,,,3,4,3,,3,12|4,,5,,4,,,2,3,12|4,,4,,,4,5,,3,12|5,,5,,,5,,2,3,12|4,3,,,5,,6,,4,12",
		"2,,2,3,1,,,,2,24|1,,1,2,,,,,1,12|,1,2,2,,,,,1,12|2,1,1,2,,,,,1,12|,2,1,2,,1,,,2,12|2,,,2,2,,2,,2,12|,2,2,2,,,2,,2,12|,1,,3,2,3,,,3,12|2,,,3,2,2,,,3,12|,2,,3,2,,3,,3,12|,,1,1,1,,,1,1,12|,,,2,2,4,,,1,12|,,2,2,,,3,1,2,12|3,2,3,3,,,,,2,12|,2,,,3,3,,1,3,12|,,,4,4,3,3,,3,12|4,,3,5,,,,2,3,12|,4,,5,,5,,,3,12|,,3,,4,5,,2,3,12|5,,,6,5,,5,,4,12",
		"3,,3,,,1,1,,2,24|,1,1,1,,,,,1,12|1,1,1,,,,,,1,12|2,1,2,,1,,,,1,12|2,,,1,,2,1,,2,12|,2,,,2,2,2,,2,12|2,,2,,2,1,,,2,12|,3,,2,2,,2,,3,12|,,2,,2,2,3,,3,12|2,,,,3,3,3,,3,12|,,1,,,1,1,1,1,12|,2,2,,,1,2,,1,12|2,2,,,,2,,1,2,12|,2,3,,2,,4,,2,12|2,,,2,,3,,1,3,12|,,4,,2,4,5,,3,12|4,,5,,,4,,2,3,12|3,,4,5,,,4,,3,12|,4,,,,5,5,2,3,12|5,,,,4,6,6,,4,12",
		"2,2,2,,,,1,,2,24|2,1,,,,1,,,1,12|1,1,,1,,,,,1,12|2,2,2,,1,,,,1,12|2,,2,,,1,1,,2,12|2,1,2,,,,2,,2,12|2,2,2,1,,,,,2,12|3,2,2,,2,,,,3,12|2,2,3,,,2,,,3,12|3,2,3,,,,2,,3,12|1,,,,1,1,,1,1,12|2,2,,,,4,,,1,12|2,,3,2,,,,1,2,12|2,4,,,2,,3,,2,12|2,,3,,,4,,1,3,12|3,2,4,,,,4,,3,12|,3,,4,,5,,2,3,12|4,4,,,5,,5,,3,12|4,,4,5,,,,2,3,12|4,,5,,,6,5,,4,12",
		",,2,2,,2,2,,2,24|,,2,,,2,1,,1,12|,,2,1,,,1,,1,12|,1,,1,,2,2,,1,12|,2,,,1,1,2,,2,12|2,,2,2,,,2,,2,12|,2,,,2,2,2,,2,12|,,3,2,2,,2,,3,12|2,,,2,,2,2,,3,12|,2,3,,3,,3,,3,12|,2,2,,,,1,1,1,12|4,,,,,2,1,,1,12|,,2,,2,1,,1,2,12|2,4,,,,3,2,,2,12|3,,3,,,,2,1,3,12|,4,,,3,3,3,,3,12|3,,,,4,,4,2,3,12|5,,3,,,4,4,,3,12|,5,4,,,,5,2,3,12|5,,5,5,,,5,,4,12",
		"2,2,,1,,2,,,2,24|2,,2,,,1,,,1,12|,,,,1,1,2,,1,12|2,2,,1,,1,,,1,12|,,2,,1,1,2,,2,12|3,,,1,1,2,,,2,12|,2,,2,,2,2,,2,12|,2,3,,2,2,,,3,12|3,,,2,2,2,,,3,12|,3,3,,,2,2,,3,12|2,,2,,,1,,1,1,12|3,2,,1,,1,,,1,12|,2,2,,,2,,1,2,12|3,,3,2,,2,,,2,12|,3,4,,2,,,1,3,12|4,,4,,,2,3,,3,12|4,4,,,,3,,2,3,12|5,,,,5,3,3,,3,12|,5,5,4,,,,2,3,12|6,5,5,,,5,,,4,12",
		"4,1,,,,2,1,,2,24|,,2,1,1,,,,1,12|2,,,,,1,1,,1,12|,1,3,,1,,1,,1,12|4,1,,1,,1,,,2,12|,2,4,,2,,1,,2,12|5,,,1,1,1,,,2,12|,2,3,,2,,1,,3,12|4,1,,2,,2,,,3,12|,1,4,,2,,2,,3,12|2,,,1,,1,,1,1,12|,1,5,2,,1,,,1,12|5,,,,1,1,,1,2,12|,2,5,2,,1,,,2,12|6,,,,1,2,,1,3,12|,,5,4,2,,2,,3,12|6,,,,,4,2,2,3,12|,2,6,,,3,3,,3,12|6,,,4,4,,,2,3,12|,5,5,,4,,5,,4,12"
	],
	[
		'',
		"3,2,2,1,,,,,2,24|2,1,1,,,,,,1,12|,2,1,1,,,,,1,12|2,2,2,1,,,,,1,12|,2,2,2,1,,,,2,12|2,2,2,,1,,,,2,12|2,2,2,,2,,,,2,12|3,2,2,,,2,,,3,12|3,,2,1,,2,,,3,12|3,3,,,2,,,1,3,12|1,1,1,,,,,,1,12|,2,2,,,2,,1,1,12|,2,3,2,,,,,2,12|3,3,3,,,,,1,2,12|,,4,2,2,,4,,3,12|3,,,,3,5,,2,3,12|4,2,5,,4,,,,3,12|5,,4,,,5,,2,3,12|5,,5,3,,5,,,3,12|5,5,,,6,,,2,4,12",
		"2,,2,3,1,,,,2,24|1,,1,2,,,,,1,12|,1,2,2,,,,,1,12|2,1,1,2,,,,,1,12|,2,1,2,,1,,,2,12|2,,,2,2,,2,,2,12|,2,2,2,,,2,,2,12|,1,,3,2,3,,,3,12|2,,,3,2,2,,,3,12|,2,,3,2,,,1,3,12|,,1,1,1,,,,1,12|,,,2,2,4,,1,1,12|,,2,2,,,3,,2,12|3,2,3,,,,,1,2,12|,2,,3,3,3,,,3,12|,,,4,4,4,,2,3,12|4,2,4,5,,,,,3,12|,3,,,,5,4,2,3,12|,,3,6,4,5,,,3,12|5,,,7,5,,,2,4,12",
		"3,,3,,,1,1,,2,24|,1,1,1,,,,,1,12|1,1,1,,,,,,1,12|2,1,2,,1,,,,1,12|2,,,1,,2,1,,2,12|,2,,,2,2,2,,2,12|2,,2,,2,1,,,2,12|,3,,2,2,,2,,3,12|,,2,,2,2,3,,3,12|2,,,,3,3,,1,3,12|,,1,,,1,1,,1,12|,2,2,,,1,,1,1,12|2,2,,1,,2,,,2,12|,2,3,,,,4,1,2,12|2,,,2,,3,4,,3,12|,,4,,,4,5,2,3,12|4,,5,,3,4,,,3,12|4,,5,,,,5,2,3,12|,4,,5,,5,5,,3,12|6,,,,5,6,,2,4,12",
		"2,2,2,,,,1,,2,24|2,1,,,,1,,,1,12|1,1,,1,,,,,1,12|2,2,2,,1,,,,1,12|2,,2,,,1,1,,2,12|2,1,2,,,,2,,2,12|2,2,2,1,,,,,2,12|3,2,2,,2,,,,3,12|2,2,3,,,2,,,3,12|3,2,3,,,,,1,3,12|1,,,,1,1,,,1,12|2,2,,,,4,,1,1,12|2,,3,2,,,,,2,12|2,4,,,,,3,1,2,12|2,,3,,2,4,,,3,12|3,,4,,,,5,2,3,12|3,3,,4,,5,,,3,12|4,5,,,5,,,2,3,12|4,,4,5,,5,,,3,12|,,5,,,6,6,2,4,12",
		",,2,2,,2,2,,2,24|,,2,,,2,1,,1,12|,,2,1,,,1,,1,12|,1,,1,,2,2,,1,12|,2,,,1,1,2,,2,12|2,,2,2,,,2,,2,12|,2,,,2,2,2,,2,12|,,3,2,2,,2,,3,12|2,,,2,,2,2,,3,12|,2,3,,3,,,1,3,12|,2,2,,,,1,,1,12|4,,,,,2,1,1,1,12|,,2,,2,1,2,,2,12|,4,,,,3,2,1,2,12|3,,3,2,,,2,,3,12|,4,,,4,4,,2,3,12|4,,,,4,3,4,,3,12|5,,4,,,,4,2,3,12|,5,4,4,,,4,,3,12|5,,6,,,,5,2,4,12",
		"2,2,,1,,2,,,2,24|2,,2,,,1,,,1,12|,,,,1,1,2,,1,12|2,2,,1,,1,,,1,12|,,2,,1,1,2,,2,12|3,,,1,1,2,,,2,12|,2,,2,,2,2,,2,12|,2,3,,2,2,,,3,12|3,,,2,2,2,,,3,12|,3,4,,,2,,1,3,12|2,,2,,,1,,,1,12|3,2,,,,1,,1,1,12|,2,2,,1,2,,,2,12|4,,3,,,2,,1,2,12|,3,4,,2,2,,,3,12|4,,5,,,2,,2,3,12|4,4,,3,,3,,,3,12|6,,,,5,3,,2,3,12|,5,5,4,,4,,,3,12|6,5,,,,5,,2,4,12",
		"4,1,,,,2,1,,2,24|,,2,1,1,,,,1,12|2,,,,,1,1,,1,12|,1,3,,1,,1,,1,12|4,1,,1,,1,,,2,12|,2,3,,2,,1,,2,12|5,,,1,1,1,,,2,12|,2,4,,2,,2,,3,12|5,1,,2,,2,,,3,12|,2,5,,2,,,1,3,12|2,,,1,,1,,,1,12|,1,5,,,1,,1,1,12|5,,,,1,1,1,,2,12|,2,6,2,,,,1,2,12|7,,,2,1,2,,,3,12|,,4,4,3,,,2,3,12|6,,,2,,4,2,,3,12|,4,,,,4,4,2,3,12|5,,,4,3,3,,,3,12|,5,,,4,,5,2,4,12"
	]
];

function detail(A, B) {
	const V = ['貓咪砲', "貓咪城", "低速砲", "鐵壁砲", "閃雷砲", "水喉砲", "天使砲", "斬盾砲", "詛咒砲"][A];
	const R = ['主砲', '基座', '裝飾'][B];
	M.textContent = '';
	let DATA = datas[B][A - 1];
	let DESC;
	if (B == 0)
		DESC = descs[A - 1];

	const table = document.createElement('table');
	const thead = document.createElement('thead');
	const tbody = document.createElement('tbody');

	let tr = document.createElement('tr');
	let td = document.createElement('th');
	td.textContent = V + '（' + R + '）';
	td.colSpan = 1 + 8 + 1 + 1 + (DESC ? DESC.length / 6 : 1);
	tr.appendChild(td);
	thead.appendChild(tr);

	tr = document.createElement('tr');
	td = document.createElement('th');
	td.rowSpan = 2;
	td.textContent = '等級';
	tr.appendChild(td);
	td = document.createElement('th');
	td.colSpan = 8;
	td.textContent = B ? '異次元素材' : '古舊素材';
	tr.appendChild(td);
	td = document.createElement('th');
	td.rowSpan = 2;
	td.textContent = '隊員';
	tr.appendChild(td);
	td = document.createElement('th');
	td.rowSpan = 2;
	td.textContent = '探險時間';
	tr.appendChild(td);
	if (B) {
		td = document.createElement('th');
		td.rowSpan = 2;
		td.textContent = '輕減率';
		tr.appendChild(td);
	} else if (DESC) {
		for (let i = 0; i < DESC.length; i += 6) {
			td = document.createElement('th');
			td.rowSpan = 2;
			td.textContent = DESC[i];
			tr.appendChild(td);
		}
	}
	thead.appendChild(tr);

	tr = document.createElement('tr');
	for (const x of ths) {
		td = document.createElement('th');
		if (B)
			td.textContent = x + 'Z';
		else
			td.textContent = x;
		tr.appendChild(td);
	}
	thead.appendChild(tr);
	DATA = DATA.split('|');
	let sum = new Array(10).fill(0);
	for (let i = 0; i < DATA.length; ++i) {
		tr = document.createElement('tr');
		td = document.createElement('td');
		if (B) {
			td.textContent = 'Lv' + (i + 1);
		} else {
			if (i == 0) {
				td.textContent = '基座';
			} else if (i == 1) {
				td.textContent = '裝飾';
			} else {
				td.textContent = 'Lv' + (i - 1);
			}
		}
		tr.appendChild(td);
		const material = DATA[i].split(',');
		for (let i = 0; i < 10; ++i) {
			const x = material[i];
			if (x)
				sum[i] += parseInt(x);
			td = document.createElement('td');
			td.textContent = i == 9 ? x + 'hr' : x;
			tr.appendChild(td);
		}
		if (B) {
			td = document.createElement('td');
			td.textContent = ((i + 1) * 0.75).toString() + '%';
			tr.appendChild(td);
		} else if (DESC) {
			const level = i - 2;
			if (level >= 0) {
				for (let j = 0; j < DESC.length; j += 6) {
					td = document.createElement('td');
					let f = DESC[j + 1];
					switch (level) {
						case 0:
							f = f(DESC[j + 2]);
							break;
						case 9:
							f = f(DESC[j + 3]);
							break;
						case 19:
							f = f(DESC[j + 4]);
							break;
						case 29:
							f = f(DESC[j + 5]);
							break;
						default:
							if (level < 9) {
								f = f(DESC[j + 2] + ~~((DESC[j + 3] - DESC[j + 2]) * level / 9));
							} else if (level < 19) {
								f = f(DESC[j + 3] + ~~((DESC[j + 4] - DESC[j + 3]) * (level - 9) / 10));
							} else {
								f = f(DESC[j + 4] + ~~((DESC[j + 5] - DESC[j + 4]) * (level - 19) / 10));
							}
							break;
					}
					td.textContent = f;
					tr.appendChild(td);
				}
			} else {
				for (let j = 0; j < DESC.length; j += 6) {
					td = document.createElement('td');
					tr.appendChild(td);
				}
			}
		}
		tbody.appendChild(tr);
	}
	tr = document.createElement('tr');
	td = document.createElement('td');
	td.textContent = '總和';
	tr.appendChild(td);
	for (let i = 0; i < 10; ++i) {
		td = document.createElement('td');
		td.textContent = i == 9 ? numStr(sum[i] / 60) + '天' : sum[i];
		tr.appendChild(td);
	}
	if (B) {
		td = document.createElement('td');
		tr.appendChild(td);
	} else if (DESC) {
		for (let j = 0; j < DESC.length; j += 6) {
			td = document.createElement('td');
			tr.appendChild(td);
		}
	}
	tbody.appendChild(tr);

	table.appendChild(thead);
	table.appendChild(tbody);
	M.append(table);
	modal.style.display = 'block';
}

const _sis = document.getElementById('site-search');
const _s_r = document.getElementById('site-s-result');

document.getElementById('search-btn').onclick = function(event) {
	event.preventDefault();
	event.currentTarget.previousElementSibling.style.display = 'inline-block';
}
_sis.oninput = _sis.onfocus = _sis.onkeydown = function() {
	_s_r.style.display = 'block';
}
_sis.onblur = function() {
	setTimeout(function() {
		_s_r.style.display = 'none';
	}, 500);
}

function _s_open(w) {
	location.href = w + _sis.value;
}
_sis.parentNode.onsubmit = function(e) {
	if (!_sis.value)
		return false;
	if (location.href.includes('enemy') || location.href.includes('esearch'))
		location.href = '/esearch.html?q=' + _sis.value;
	else if (location.href.includes('stage'))
		location.href = '/stage.html?q=' + _sis.value;
	else
		location.href = '/search.html?q=' + _sis.value;
	return false;
}