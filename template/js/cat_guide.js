import {loadScheme, config} from './common.mjs';
import {loadAllCats, units_scheme} from './unit.mjs';
const {limited_cats, cat_guide_ids} = await loadScheme('units', ['limited_cats', 'cat_guide_ids']);

const favList = new Set(config.starCats.map(x => x.id));
const catsEl = document.getElementById('cats');
const main = catsEl.parentNode;
const medals = main.getElementsByClassName('modal');
const abSelectEl = document.getElementById('ab').children;
const searchTextEl = document.getElementById('name-search');
let talentsOpenEl = document.getElementById('to');
let orbcEl = document.getElementById('orb-count');
const notFoundEl = document.getElementById('not-f');
const favOnlyEl = document.getElementById('fav-only');
const exOnlyEl = document.getElementById('ex-only');
const rarity = document.getElementById('rarity');
const trait = document.getElementById('trait-f');
const G0 = document.getElementById('G0');
const G1 = document.getElementById('G1');
const G2 = document.getElementById('G2');
const displayOrder = document.getElementById('display-order');
const undo = [];
let cats;
let tooltip;
let favSetting = false;
let lastRarity = null;
let talentsEl;

function onClick(event) {
	const t = event.currentTarget;
	const i = t.firstElementChild;
	const id = parseInt(t.href.slice(t.href.lastIndexOf('?') + 4));
	if (favSetting) {
		event.preventDefault();
		if (i.classList.contains('grayscale')) {
			i.classList.remove('grayscale');
			t.style.position = 'relative';
			const fav = new Image(104, 79);
			fav.style.position = 'absolute';
			fav.src = '/fav.png';
			fav.style.left = '0px';
			fav.style.right = '0px';
			fav.style.zIndex = 1;
			t.appendChild(fav);
			favList.add(id);
		} else {
			i.classList.add('grayscale');
			t.removeChild(i.nextElementSibling);
			favList.delete(id);
		}
	}
}

function addUnit(c, gap=true) {
	if (gap && lastRarity !== c.rarity && lastRarity !== null)
		catsEl.appendChild(document.createElement('p'));
	lastRarity = c.rarity;
	const img = new Image(104, 79);
	const a = document.createElement('a');
	img.loading = 'lazy';
	const F = c.forms[0];
	img.src = F.icon;
	a.href = '/unit.html?id=' + F.id;
	a.onclick = onClick;
	a.appendChild(img);
	if (favList.has(c.forms[0].id)) {
		a.style.position = 'relative';
		const fav = new Image(104, 79);
		fav.style.position = 'absolute';
		fav.src = '/fav.png';
		fav.style.left = '0px';
		fav.style.right = '0px';
		fav.style.zIndex = 1;
		a.appendChild(fav);
	} else {
		img.classList.add('grayscale');
	}
	catsEl.appendChild(a);
	img.onmouseover = function() {
		const t = setTimeout(function() {
			tooltip = document.createElement('div');
			tooltip.textContent = c.forms.map(x => x.name || x.jpName).join(' → ');
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

function setsIntersection(sets) {
	if (sets.length === 0) {
		return new Set();
	}


	// native method (2024 baseline)
	if (sets[0].intersection === 'function') {
		return sets.reduce((acc, x) => {
		  return acc.intersection(x);
		});
	}

	// fallback method
	let result = new Set(sets[0]);

	for (let i = 1; i < sets.length; i++) {
		const current = sets[i];

		const intersection = new Set();

		for (const value of result) {
			if (current.has(value)) {
				intersection.add(value);
			}
		}

		result = intersection;

		if (result.size === 0) {
			break;
		}
	}

	return result;
}


function filter() {
	undo.length = 0;
	for (let x of medals)
		if (x.style.display == 'block') {
			x.style.display = 'none';
			break;
		}
	const results = new Set();
	let i;
	let chs = rarity.getElementsByClassName('selected');
	if (chs.length) {
		if (favOnlyEl.classList.contains('selected')) {
			for (let x of chs) {
				const r = parseInt(x.value);
				for (i of favList)
					if (cats[i].rarity == r)
						results.add(i);
			}
		} else {
			for (let x of chs) {
				const r = parseInt(x.value);
				for (i = 0; i < cats.length; ++i)
					if (cats[i].rarity == r)
						results.add(i);
			}
		}
	} else {
		if (favOnlyEl.classList.contains('selected')) {
			for (i of favList)
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

	for (i of abSelectEl[1].getElementsByClassName('selected'))
		abs.push(parseInt(i.value))
	for (i of abSelectEl[2].getElementsByClassName('selected'))
		abs.push(parseInt(i.value));
	for (i of abSelectEl[3].getElementsByClassName('selected'))
		imu |= parseInt(i.value), d = true;
	for (i of abSelectEl[4].getElementsByClassName('selected'))
		res.push(parseInt(i.value)), d = true;

	if (abs.length || d) {
		if (abSelectEl[0].src.endsWith('or.png')) {
			loop: for (i = 0; i < cats.length; ++i) {
				const c = cats[i];
				for (let f of c.forms) {
					if (f.imu & imu)
						continue loop;
					for (let x of abs) {
						if (x < 1000) {
							if (Object.hasOwn(f.ab, x))
								continue loop;
						} else if (f.atkType & (x - 1000))
							continue loop;
					}
					for (let x of res)
						if (Object.hasOwn(f.res, x))
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
							if (!Object.hasOwn(f.ab, x))
								continue loop;
						} else if (x -= 1000, x != (f.atkType & x))
							continue loop;
					}
					for (let x of res)
						if (!Object.hasOwn(f.res, x))
							continue loop;
					t = true;
					break;
				}
				if (!t)
					results.delete(i);
			}
		}
	}
	chs = talentsOpenEl;
	for (i = 1; i < 5; ++i) {
		if (chs[i].checked) {
			switch (i) {
				case 1: {
					for (let x of results)
						if (cats[x].talents)
							results.delete(x);
				}
				break;
				case 2: {
					for (let x of results)
						if (!cats[x].talents)
							results.delete(x);
				}
				break;
				case 3: {
					for (let x of results) {
						const c = cats[x].talents;
						if (!c) {
							results.delete(x);
						} else {
							outer: {
								for (let j = 1; j < 155 && c[j]; j += 14)
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
	chs = orbcEl;
	for (i = 1; i <= 2; ++i) {
		if (chs[i].checked) {
			for (let x of results) {
				if (cats[x].orbs !== i) {
					results.delete(x);
				}
			}
		}
	}
	chs = talentsEl;
	const dieList = [];
	for (i = 0; i < chs.length; ++i) {
		const check = i + 1;
		if (chs[i].checked) {
			const subSet = new Set();
			for (let x of results) {
				let pass = false;
				const talents = cats[x].talents;
				if (talents) {
					for (let i = 1; i < 155; i += 14) {
						if (talents[i] === check) {
							pass = true;
							break;
						}
					}
				}

				if (!pass) {
					subSet.add(x);
				}
			}
			if (subSet.size) {
				dieList.push(subSet);
			}
		}
	}
	if (dieList.length) {
		for (const x of setsIntersection(dieList)) {
			results.delete(x);
		}
	}

	d = false;
	const s = new Set();
	for (i of [G0, G1, G2])
		for (let x of i.getElementsByClassName('selected')) {
			for (let n of x.value.split(','))
				s.add(parseInt(n));
			d = true;
		}
	if (d)
		for (let x of results)
			if (!s.has(x))
				results.delete(x);
	if (!exOnlyEl.classList.contains('selected'))
		for (const x of results)
			if (limited_cats.has(x))
				results.delete(x);

	catsEl.textContent = '';
	lastRarity = null;
	if (!results.size) {
		notFoundEl.style.display = 'block';
		return;
	}

	if (displayOrder.classList.contains('selected')) {
		let sorted = new Array(results.size);
		i = 0;
		for (const x of results)
			sorted[i++] = cats[x];
		sorted.sort((x, y) => {
			x.rarity - y.rarity
		});
		sorted.forEach(x => addUnit(x, false));
		return;
	}
	let sorted = [];
	for (const id of cat_guide_ids) {
		if (results.has(id))
			sorted.push(cats[id]);
	}
	sorted.forEach(addUnit);
}

function clear(event) {
	event.preventDefault();
	event.stopPropagation();
	for (let x of medals) {
		if (x.style.display == 'block') {
			for (let n of Array.from(x.getElementsByClassName('selected')))
				n.classList.remove('selected');
			break;
		}
	}
}

function clearAll(event) {
	event.preventDefault();
	event.stopPropagation();
	for (let x of medals)
		for (let n of Array.from(x.getElementsByClassName('selected')))
			n.classList.remove('selected');
	catsEl.textContent = '';
	lastRarity = null;
	cats.map(addUnit);
}


function favorite(e) {
	const t = e.target;
	if (t.getAttribute('data-s') == '0') {
		t.setAttribute('data-s', '1');
		t.textContent = '★設定完畢';
		t.classList.add('fav');
		for (let x of main.getElementsByClassName('C'))
			x.style.visibility = 'hidden';
		catsEl.setAttribute("data-t", "1")
		favSetting = true;
	} else {
		t.setAttribute('data-s', '0');
		t.textContent = '★設定我的最愛';
		t.classList.remove('fav');
		for (let x of main.getElementsByClassName('C'))
			x.style.visibility = 'visible';
		catsEl.setAttribute("data-t", "0")
		favSetting = false;
		let arr = [];
		for (let x of favList) {
			const c = cats[x];
			arr.push({
				'id': x,
				'icon': c.forms[0].icon,
				'name': c.forms[0].name || c.forms[0].jpName
			});
		}
		config.starCats = arr;
	}
}

(function () {
	loadAllCats().then(_cs => {
		cats = _cs;
		document.getElementById('loader').style.display = 'none';
		main.style.display = 'block';
		for (let cat of cats) {
			const TF = cat.forms[2];
			if (TF?.talents) {
				TF.applyAllTalents();
			}
		}
		cat_guide_ids.map(i => cats[i]).forEach(addUnit);
	});

	function toggleDisplay() {
		this.nextElementSibling.style.display = 'block';
	}

	for (let C of main.getElementsByClassName('C')) {
		C.addEventListener('click', toggleDisplay);
	}

	for (let B of main.querySelectorAll('.M button')) {
		if (!B.value) continue;
		B.addEventListener('click', function() {
			this.classList.toggle('selected');
			undo.push(this);
		});
	}

	function toggleSelected() {
		this.classList.toggle('selected');
	}

	exOnlyEl.addEventListener('click', toggleSelected);
	favOnlyEl.addEventListener('click', toggleSelected);
	displayOrder.addEventListener('click', toggleSelected);

	abSelectEl[0].onclick = trait.previousElementSibling.onclick = function() {
		if (this.src.endsWith('or.png'))
			this.src = 'and.png';
		else
			this.src = 'or.png';
	}

	document.getElementById('search-name').onclick = function(event) {
		event.preventDefault();
		const q = searchTextEl.value;
		let found = false;
		for (let x of medals)
			if (x.style.display == 'block') {
				x.style.display = 'none';
				break;
			}
		catsEl.textContent = '';
		lastRarity = null;
		if (!q) return;
		let digit = q.length >= 1;
		for (const c of q) {
			let x = c.codePointAt(0);
			(x < 48 || 57 < x) && (digit = false);
		}
		if (digit) {
			const x = cats[parseInt(q)];
			x && (found = true, addUnit(x, false));
		}
		for (let i = 0; i < cats.length; ++i) {
			const c = cats[i];
			for (let f of c.forms) {
				if (f.name.includes(q) || f.jpName.includes(q)) {
					addUnit(c, false);
					found = true;
					break;
				}
			}
		}
		if (!found)
			notFoundEl.style.display = 'block';
		return false;
	}

	document.addEventListener('click', function(event) {
		if (event.target != main && !event.target.classList.contains('modal')) return;
		if (notFoundEl.style.display === 'block')
			notFoundEl.style.display = 'none';
		for (let x of medals)
			if (x.style.display == 'block') {
				x.style.display = 'none';
				for (let b of undo)
					b.classList.toggle('selected');
				undo.length = 0;
				return;
			}
	});

	window.addEventListener('keydown', function(event) {
		if (event.key == 'Escape') {
			for (let x of medals)
				if (x.style.display == 'block') {
					x.style.display = 'none';
					for (let b of undo)
						b.classList.toggle('selected');
					undo.length = 0;
					return;
				}
		}
	});

	for (const e of document.getElementsByClassName('filter'))
		e.addEventListener('click', filter);

	for (const e of document.getElementsByClassName('clear'))
		e.addEventListener('click', clear);

	document.getElementById('favorite').addEventListener('click', favorite);
	document.getElementById('clear-all').addEventListener('click', clearAll);

	talentsEl = orbcEl.parentNode.appendChild(document.createElement('fieldset'));
	talentsEl.appendChild(document.createElement('legend')).textContent = '本能詳細（OR 運算）';

	for (let i = 1; i < units_scheme.talents.names.length; ++i) {
		const p = talentsEl.appendChild(document.createElement('p'));
		const input = p.appendChild(document.createElement('input'));
		const label = p.appendChild(document.createElement('label'));
		label.textContent = `${i}: ${units_scheme.talents.names[i]}`;
		input.type = 'checkbox';
		input.name = 'talents';
		label.htmlFor = input.id = `talents-${i}`;
	}
	talentsOpenEl = talentsOpenEl.getElementsByTagName('input');
	talentsEl = talentsEl.getElementsByTagName('input');
	orbcEl = orbcEl.getElementsByTagName('input');
})();
