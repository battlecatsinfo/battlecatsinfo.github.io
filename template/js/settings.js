function fucus(event) {
	for (let node of Array.from(document.getElementsByClassName('fucus')))
		node.classList.remove('fucus');
	event.currentTarget.classList.add('fucus');
}
const my_stars = document.getElementById('my-stars');
var my_stars_list = localStorage.getItem('star-cats');
if (my_stars_list == null || my_stars_list == '[]') {
	my_stars.parentNode.innerHTML = '你還沒有收藏的貓咪，在貓咪檢視畫面按下「★加入我的最愛」或貓咪圖鑑收藏貓咪';
} else {
	my_stars_list = JSON.parse(my_stars_list);
	let i = 0;
	for (let cat of my_stars_list) {
		const tr = document.createElement('tr');
		const td1 = document.createElement('td');
		const a = document.createElement('a');
		a.href = './unit.html?id=' + cat.id;
		a.innerText = cat.id.toString();
		td1.appendChild(a);
		const td2 = document.createElement('td');
		const a2 = document.createElement('a');
		a2.href = a.href;
		const img = new Image();
		img.src = cat.icon;
		a2.appendChild(img);
		td2.appendChild(a2);
		const td3 = document.createElement('td');
		td3.innerText = cat.name;
		const td4 = document.createElement('td');
		const a3 = document.createElement('a');
		a3.innerText = '刪除';
		a3.style.setProperty('color', '#ff5722', 'important');
		a3.style.cursor = 'pointer';
		a3.onclick = function(event) {
			event.preventDefault();
			const tr = event.target.parentNode.parentNode;
			const id = parseInt(tr.children[0].children[0].innerText);
			my_stars_list = my_stars_list.filter(x => x.id != id);
			localStorage.setItem('star-cats', JSON.stringify(my_stars_list));
			tr.parentNode.removeChild(tr);
			return false;
		}
		td4.appendChild(a3);
		tr.appendChild(td1);
		tr.appendChild(td2);
		tr.appendChild(td3);
		tr.appendChild(td4);
		if (++i & 1)
			tr.style.backgroundColor = 'rgb(241, 241, 241)';
		my_stars.appendChild(tr);
	}
}

function tab(evt, cityName) {
	var i, x, tablinks;
	x = document.getElementsByClassName("treasure");
	for (i = 0; i < x.length; i++)
		x[i].style.display = "none";
	tablinks = document.getElementsByClassName("tablink");
	for (i = 0; i < x.length; i++)
		tablinks[i].classList.remove('atab');
	document.getElementById(cityName).style.display = "block";
	evt.currentTarget.classList.add("atab");
}

function handleChange(event) {
	const t = event.currentTarget;
	const val = parseInt(t.value);
	if (val >= parseInt(t.min) && val <= parseInt(t.max))
		localStorage.setItem(`t$${t.getAttribute('data-i')}`, t.value);
}
document.querySelectorAll('.w3-input').forEach(x => {
	x.onchange = handleChange;
	const val = localStorage.getItem('t$' + x.getAttribute('data-i'));
	if (val != null)
		x.value = val;
});

function fullTreasure() {
	document.querySelectorAll('.w3-input').forEach(x => {
		localStorage.setItem('t$' + x.getAttribute('data-i'), x.max);
		x.value = x.max;
	});
}

let x = localStorage.getItem('unit');
if (x == 'F')
	document.getElementById('unit-f').checked = true;
x = localStorage.getItem('prec');
if (x && x != '2')
	document.getElementById('prec-' + x).checked = true;
x = localStorage.getItem('layout');
if (x && x != '1')
	document.getElementById('layout-' + x).checked = true;
x = localStorage.getItem('theme');
if (x)
	document.getElementById('theme-' + x).checked = true;
x = localStorage.getItem('stagel');
if (x)
	document.getElementById('stagel-' + x).checked = true;
x = localStorage.getItem('stagef');
if (x)
	document.getElementById('stagef-' + x).checked = true;
