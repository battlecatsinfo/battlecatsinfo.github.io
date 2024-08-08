var cats;
var tooltip;
const _fav = localStorage.getItem('star-cats');
const fav_list = new Set(_fav ? JSON.parse(_fav).map(x => x.id) : []);
const cats_e = document.getElementById('cats');
const main = cats_e.parentNode;
const Ms = main.getElementsByClassName('modal');
const ab_e = document.getElementById('ab').children;
const undo = [];
const to_e = document.getElementById('to');
const text_e = document.getElementById('text');
const not_e = document.getElementById('not-f');
const fav_only = document.getElementById('fav-only');
const ex_only = document.getElementById('ex-only');
const cat_limits = new Set([ /*26,27,28,29,45,53,54,62,64,65,66,67,68,69,77,82,89,90,101,102,103,108,110,111,112,113,114,115,116,117,118,119,120,121,133,139,140,141,142,155,156,157,160,161,162,163,164,165,166,167,173,174,175,178,179,180,181,182,184,185,186,187,188,189,190,191,192,193,202,204,205,206,207,208,213,214,215,216,217,218,219,220,221,222,223,224,225,231,232,233,234,235,236,248,249,250,251,252,253,254,255,256,262,263,264,265,266,270,277,278,279,280,281,285,288,289,290,291,292,293,294,295,296,297,298,299,300,301,309,315,317,320,321,326,327,328,337,340,341,344,345,346,347,348,349,350,353,356,362,363,364,365,366,367,368,369,370,371,372,373,374,384,385,386,387,388,389,390,391,392,393,394,395,398,399,400,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,419,420,421,422,423,424,425,428,429,430,432,433,434,440,453,454,456,457,458,459,460,465,466,467,468,469,470,471,472,473,474,475,476,477,479,480,482,483,485,486,487,488,489,490,491,492,497,498,499,500,503,504,506,508,509,510,511,512,513,514,515,516,517,518,524,530,535,536,537,538,540,541,542,547,548,549,550,551,552,555,556,557,558,560,561,562,567,571,572,573,574,575,576,577,578,579,580,582,583,590,591,592,593,596,597,598,599,600,601,602,603,604,605,606,608,611,624,637,638,639,640,671,672,673,677,678,679,680,681,701,702,703,704,709,710,721,722,727,741,742,743,744,745,746,747,748,749,750,751,752,753,762,766,767*/ ]);
let fav_setting = false;

function t3str(x) {
	var s = x.toString();
	switch (s.length) {
		case 2:
			return "0" + s;
		case 1:
			return "00" + s;
	}
	return s;
}

function onClick(event) {
	const t = event.currentTarget;
	const i = t.firstElementChild;
	const id = parseInt(t.href.slice(t.href.lastIndexOf('?') + 4));
	if (fav_setting) {
		event.preventDefault();
		if (i.classList.contains('grayscale')) {
			i.classList.remove('grayscale');
			t.style.position = 'relative';
			const fav = new Image(128, 128);
			fav.style.position = 'absolute';
			fav.src = '/fav.png';
			fav.style.left = '0px';
			fav.style.right = '0px';
			fav.style.zIndex = 1;
			t.appendChild(fav);
			fav_list.add(id);
		} else {
			i.classList.add('grayscale');
			t.removeChild(i.nextElementSibling);
			fav_list.delete(id);
		}
	}
}

function add_unit(c) {
	const img = new Image(104, 79);
	const a = document.createElement('a');
	img.loading = 'lazy';
	const F = c.forms[0];
	img.src = F.icon;
	img.style.padding = '7px';
	a.href = '/unit.html?id=' + F.id;
	a.onclick = onClick;
	a.appendChild(img);
	if (fav_list.has(c.forms[0].id)) {
		a.style.position = 'relative';
		const fav = new Image(128, 128);
		fav.style.position = 'absolute';
		fav.src = '/fav.png';
		fav.style.left = '0px';
		fav.style.right = '0px';
		fav.style.zIndex = 1;
		a.appendChild(fav);
	} else {
		img.classList.add('grayscale');
	}
	cats_e.appendChild(a);
	img.onmouseover = function() {
		const t = setTimeout(function() {
			tooltip = document.createElement('div');
			tooltip.textContent = c.forms.map(x => x.name || x.jp_name).join(' → ');
			tooltip.classList.add('tooltip');
			a.style.position = 'relative';
			a.appendChild(tooltip);
		}, 300);
		this.onmouseleave = function() {
			clearTimeout(t);
			if (tooltip) {
				tooltip.parentNode.removeChild(tooltip);
				tooltip = null;
			}
		}
	}
}
loadAllCats().then(_cs => {
	cats = _cs;
	document.getElementById('loader').style.display = 'none';
	main.style.display = 'block';
	for (let cat of cats) {
		const TF = cat.forms[2];
		if (TF) {
			const talents = cat.info[10];
			if (talents) {
				TF.trait |= talents[0];
				TF.res = {};
				for (let i = 1; i < 113 && talents[i]; i += 14)
					TF.applyTalent(talents.subarray(i, i + 14), talents[i + 1] || 1);
			}
		}
	}
});
const rarity = document.getElementById('rarity');
const trait = document.getElementById('trait-f');
const G1 = document.getElementById('G1');
const G2 = document.getElementById('G2');
const G3 = document.getElementById('G3');

function ok() {
	undo.length = 0;
	for (let x of Ms)
		if (x.style.display == 'block') {
			x.style.display = 'none';
			break;
		}
	const results = new Set();
	let i;
	let chs = rarity.getElementsByClassName('selected');
	if (chs.length) {
		if (fav_only.classList.contains('selected')) {
			for (let x of chs) {
				const r = parseInt(x.value);
				for (i of fav_list)
					if (cats[i].info[0] == r)
						results.add(i);
			}
		} else {
			for (let x of chs) {
				const r = parseInt(x.value);
				for (i = 0; i < cats.length; ++i)
					if (cats[i].info[0] == r)
						results.add(i);
			}
		}
	} else {
		if (fav_only.classList.contains('selected')) {
			for (i of fav_list)
				results.add(i);
		} else {
			for (i = 0; i < cats.length; ++i)
				results.add(i);
		}
	}

	chs = trait.getElementsByClassName('selected');

	if (chs.length) {
		let t = 0;
		for (let x of chs)
			t |= parseInt(x.value);
		const r2 = [];
		if (trait.previousElementSibling.src.endsWith('or.png')) {
			for (let c of results) {
				B: {
					for (let f of cats[c].forms)
						if (f.trait & t)
							break B;
					results.delete(c);
				}
			}
		} else {
			for (let c of results) {
				B: {
					for (let f of cats[c].forms)
						if (t == (f.trait & t))
							break B;
					results.delete(c);
				}
			}
		}
	}

	let abs = [],
		imu = 0,
		res = [];
	let d = false;

	for (i of ab_e[1].getElementsByClassName('selected'))
		abs.push(parseInt(i.value))
	for (i of ab_e[2].getElementsByClassName('selected'))
		abs.push(parseInt(i.value));
	for (i of ab_e[3].getElementsByClassName('selected'))
		imu |= parseInt(i.value), d = true;
	for (i of ab_e[4].getElementsByClassName('selected'))
		res.push(parseInt(i.value)), d = true;

	if (abs.length || d) {
		if (ab_e[0].src.endsWith('or.png')) {
			loop: for (i = 0; i < cats.length; ++i) {
				const c = cats[i];
				for (let f of c.forms) {
					if (f.imu & imu)
						continue loop;
					for (let x of abs) {
						if (x < 1000) {
							if (f.ab.hasOwnProperty(x))
								continue loop;
						} else if (f.atkType & (x - 1000))
							continue loop;
					}
					for (let x of res)
						if (f.res.hasOwnProperty(x))
							continue loop;
				}
				results.delete(i);
			}
		}
		else {
			for (i = 0; i < cats.length; ++i) {
				const c = cats[i];
				let t = false;
				loop: for (let f of c.forms) {
					if ((f.imu & imu) != imu)
						continue;
					for (let x of abs) {
						if (x < 1000) {
							if (!f.ab.hasOwnProperty(x))
								continue loop;
						} else if (x -= 1000, x != (f.atkType & x))
							continue loop;
					}
					for (let x of res)
						if (!f.res.hasOwnProperty(x))
							continue loop;
					t = true;
					break;
				}
				if (!t)
					results.delete(i);
			}
		}
	}
	chs = to_e.getElementsByTagName('input');
	for (i = 1; i < 5; ++i) {
		if (chs[i].checked) {
			switch (i) {
				case 1: {
					for (let x of results)
						if (cats[x].info[10])
							results.delete(x);
				}
				break;
				case 2: {
					for (let x of results)
						if (!cats[x].info[10])
							results.delete(x);
				}
				break;
				case 3: {
					for (let x of results) {
						const c = cats[x].info[10];
						if (!c) {
							results.delete(x);
						} else {
							outer: {
								for (let j = 1; j < 113 && c[j]; j += 14)
									if (c[j + 13] == 1)
										break outer;
								results.delete(x);
							}
						}
					}
				}
				break;
				case 4: {
					for (let x of results) {
						if (cats[x].forms.length != 4) {
							results.delete(x);
						}
					}
				}
			}
			break;
		}
	}
	d = false;
	const s = new Set();
	for (i of [G1, G2, G3])
		for (let x of i.getElementsByClassName('selected')) {
			for (let n of x.value.split(','))
				s.add(parseInt(n));
			d = true;
		}
	if (d)
		for (let x of results)
			if (!s.has(x))
				results.delete(x);
	if (!ex_only.classList.contains('selected'))
		for (x of results)
			if (cat_limits.has(x))
				results.delete(x);

	cats_e.textContent = '';
	if (!results.size) {
		not_e.style.display = 'block';
		return;
	}

	let sorted = new Array(results.size);
	i = 0;
	for (const x of results)
		sorted[i++] = cats[x];
	sorted.sort((x, y) => {
		x.info[0] - y.info[0]
	});
	sorted.forEach(add_unit);
}

function clearAll(event) {
	event.preventDefault();
	event.stopPropagation();
	for (let x of Ms) {
		if (x.style.display == 'block') {
			for (let n of Array.from(x.getElementsByClassName('selected')))
				n.classList.remove('selected');
			break;
		}
	}
}

function _clearAll(event) {
	event.preventDefault();
	event.stopPropagation();
	for (let x of Ms)
		for (let n of Array.from(x.getElementsByClassName('selected')))
			n.classList.remove('selected');
	cats_e.textContent = '';
	cats.map(add_unit);
}
document.onclick = function(event) {
	if (event.target != main && !event.target.classList.contains('modal')) return;
	if (not_e.style.display = 'block')
		not_e.style.display = 'none';
	for (let x of Ms)
		if (x.style.display == 'block') {
			x.style.display = 'none';
			for (let b of undo)
				b.classList.toggle('selected');
			undo.length = 0;
			return;
		}
}

function ot() {
	this.nextElementSibling.style.display = 'block';
}
for (let C of main.getElementsByClassName('C'))
	C.onclick = ot;
for (let B of main.querySelectorAll('.M button')) {
	if (!B.value) continue;
	B.onclick = function() {
		this.classList.toggle('selected');
		undo.push(this);
	}
}
ab_e[0].onclick = trait.previousElementSibling.onclick = function() {
	if (this.src.endsWith('or.png'))
		this.src = 'and.png';
	else
		this.src = 'or.png';
}
const search_text = document.getElementById('name-search');
document.getElementById('search-name').onclick = function(event) {
	event.preventDefault();
	const q = search_text.value;
	let found = false;
	for (let x of Ms)
		if (x.style.display == 'block') {
			x.style.display = 'none';
			break;
		}
	cats_e.textContent = '';
	if (!q) return;
	let digit = q.length >= 1;
	for (c of q) {
		var x = c.codePointAt(0);
		(x < 48 || 57 < x) && (digit = false);
	}
	if (digit) {
		const x = cats[parseInt(q)];
		x && (found = true, add_unit(x));
	}
	for (let i = 0; i < cats.length; ++i) {
		const c = cats[i];
		for (let f of c.forms) {
			if (f.name.includes(q) || f.jp_name.includes(q)) {
				add_unit(c);
				found = true;
				break;
			}
		}
	}
	if (!found)
		not_e.style.display = 'block';
	return false;
}
onkeydown = function(event) {
	if (event.key == 'Escape') {
		for (let x of Ms)
			if (x.style.display == 'block') {
				x.style.display = 'none';
				for (let b of undo)
					b.classList.toggle('selected');
				undo.length = 0;
				return;
			}
	}
}

function favorite(e) {
	const t = e.target;
	if (t.getAttribute('data-s') == '0') {
		t.setAttribute('data-s', '1');
		t.textContent = '★設定完畢';
		t.classList.add('fav');
		for (let x of main.getElementsByClassName('C'))
			x.style.visibility = 'hidden';
		cats_e.setAttribute("data-t", "1")
		fav_setting = true;
	} else {
		t.setAttribute('data-s', '0');
		t.textContent = '★設定我的最愛';
		t.classList.remove('fav');
		for (let x of main.getElementsByClassName('C'))
			x.style.visibility = 'visible';
		cats_e.setAttribute("data-t", "0")
		fav_setting = false;
		let arr = [];
		for (let x of fav_list) {
			const c = cats[x];
			arr.push({
				'id': x,
				'icon': c.forms[0].icon,
				'name': c.forms[0].name || c.forms[0].jp_name
			});
		}
		localStorage.setItem('star-cats', JSON.stringify(arr));
	}
}
