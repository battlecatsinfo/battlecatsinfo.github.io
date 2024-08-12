function toggleTheme(){
	let e=localStorage.getItem("theme");
	if (e == "dark") {
		document.documentElement.classList.remove("dark");
		localStorage.setItem("theme","light");
	} else {
		document.documentElement.classList.add("dark");
		localStorage.setItem("theme","dark")
	}
}
var _th = localStorage.getItem("theme");
if (_th == 'dark' || !_th && window.matchMedia("(prefers-color-scheme: dark)").matches)
	document.documentElement.classList.add("dark");

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

function savePNG(tbl) {
	tbl.style.margin = '0';
	html2canvas(tbl).then(function(canvas) {
		const a = document.createElement('a');
		a.href = canvas.toDataURL();
		a.download = 'screenshot.png';
		a.click();
		tbl.style.margin = '';
	});
}
onload = function() {
	const tooltip = document.getElementsByClassName('tooltip')[0];
	for (const cls of ['rate', 'N', 'Y']) {
		for (const N of document.getElementsByClassName(cls)) {
			N.style.position = 'relative';
			const node = tooltip.cloneNode(true);
			node.style.position = 'absolute';
			node.style.right = '-0';
			node.style.top = '-2em';
			node.style.display = 'block';
			node._t = N;
			node.firstElementChild.onclick = function(e) { // Camera
				const t = e.currentTarget.parentNode._t;
				if (window.domtoimage != undefined) return savePNG(t);
				const script = document.createElement('script');
				script.onload = () => savePNG(t);
				script.src = '/html2canvas.min.js';
				document.head.appendChild(script);
			}
			N.appendChild(node);
		}
	}
}
