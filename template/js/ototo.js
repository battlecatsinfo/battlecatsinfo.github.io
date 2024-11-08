import {numStr} from './common.mjs';

const ototo = {{{toJSON (loadJSON "ototo.json")}}};
const M = document.getElementById('MC');
const modal = M.parentNode.parentNode;


function get_format_function(fmt) {
	switch (fmt) {
	case 'number': return numStr;
	case 'hp': return x => ~~(x * 0.05).toString();
	case 'frame': return x => `${x}F/${numStr(x / 30)}秒`;
	case '%': return x => numStr(x) + '%';
	case '%2': return x => numStr(x / 10) + '%';
	}
	throw "Unsupported format: " + fmt;
}


function detail(A, B) {
	const type = ototo.types[B];
	const entry = ototo.castles[A];
	const data = entry[type[0]];
	M.textContent = '';

	const table = document.createElement('table');
	const thead = document.createElement('thead');
	const tbody = document.createElement('tbody');

	let tr = document.createElement('tr');
	let td = document.createElement('th');
	td.textContent = entry.name + '（' + type[1] + '）';
	td.colSpan = 1 + 8 + 1 + 1 + (data.effects?.length || 1);
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
	} else if (data.effects) {
		for (const e of data.effects) {
			td = document.createElement('th');
			td.rowSpan = 2;
			td.textContent = e.name;
			tr.appendChild(td);
		}
	}
	thead.appendChild(tr);

	tr = document.createElement('tr');
	for (const x of ototo.materials) {
		td = document.createElement('th');
		if (B)
			td.textContent = x + 'Z';
		else
			td.textContent = x;
		tr.appendChild(td);
	}
	thead.appendChild(tr);
	let sum = new Array(10).fill(0);
	for (let i = 0; i < data.materials.length; ++i) {
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
		for (let j = 0; j < sum.length; ++j) {
			const x = data.materials[i][j];
			sum[j] += parseInt(x);
			td = document.createElement('td');
			td.textContent = j == 9 ? x + 'hr' : (x || '');
			tr.appendChild(td);
		}
		if (B) {
			td = document.createElement('td');
			td.textContent = ((i + 1) * 0.75).toString() + '%';
			tr.appendChild(td);
		} else if (data.effects) {
			const level = i - 2;
			if (level >= 0) {
				for (const effect of data.effects) {
					let s;
					const f = get_format_function(effect.format);
					td = document.createElement('td');
					switch (level) {
						case 0:
							s = f(effect.values[0]);
							break;
						case 9:
							s = f(effect.values[1]);
							break;
						case 19:
							s = f(effect.values[2]);
							break;
						case 29:
							s = f(effect.values[3]);
							break;
						default:
							if (level < 9) {
								s = f(effect.values[0] + ~~((effect.values[1] - effect.values[0]) * level / 9));
							} else if (level < 19) {
								s = f(effect.values[1] + ~~((effect.values[2] - effect.values[1]) * (level - 9) / 10));
							} else {
								s = f(effect.values[2] + ~~((effect.values[3] - effect.values[2]) * (level - 19) / 10));
							}
							break;
					}
					td.textContent = s;
					tr.appendChild(td);
				}
			} else {
				for (let j = 0; j < data.effects.length; ++j) {
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
	for (let i = 0; i < sum.length; ++i) {
		td = document.createElement('td');
		td.textContent = i == 9 ? numStr(sum[i] / 60) + '天' : sum[i];
		tr.appendChild(td);
	}
	if (B) {
		td = document.createElement('td');
		tr.appendChild(td);
	} else if (data.effects) {
		for (const _ of data.effects) {
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

// expose global methods
// @TODO: refactor the code to prevent this
Object.assign(globalThis, {
	detail,
	modal,
});
