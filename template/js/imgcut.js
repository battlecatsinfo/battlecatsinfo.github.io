const my_params = new URLSearchParams(location.search);
let cutfile = my_params.get('cutfile');
let imgfile = my_params.get('imgfile');
const canvas = document.getElementById("imgcut");
const ctx = canvas.getContext('2d');
const edit = document.getElementById('edit');
const img = new Image();
const preview = document.getElementById('preview');
const pctx = preview.getContext('2d');
var last_t;
var cut;
var imgloaded = false;
img.crossOrigin = "anonymous";
img.onload = function() {
	canvas.width = this.naturalWidth;
	canvas.height = this.naturalHeight;
	ctx.drawImage(this, 0, 0, this.naturalWidth, this.naturalHeight);
	imgloaded = true;
};
img.onerror = function() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillText("導入圖片失敗", canvas.width / 2, canvas.height / 2);
	imgloaded = false;
}
if (imgfile) {
	img.src = imgfile;
} else {
	ctx.font = "30px serif";
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText("導入圖片以開始", canvas.width / 2, canvas.height / 2);
}
if (cutfile) {
	fetch(cutfile)
		.then(res => res.text())
		.then(text => {
			cut = new ImgCut(text);
			for (let i = 0; i < cut.cuts.length; ++i)
				edit.appendChild(createLine(cut.cuts[i], i));
		});
} else {
	cutfile = '';
}
class ImgCut {
	constructor(text) {
		if (!text) {
			this.name = '';
			this.cuts = [];
			return;
		}
		const arr = text.replaceAll('\r', '').split('\n');
		this.name = arr[2];
		const L = parseInt(arr[3]);
		let tmp;
		if (!isFinite(L) || L > 5000) throw 'Invalid imgcut';
		this.cuts = new Array(L);
		for (let i = 0; i < L; ++i) {
			tmp = arr[4 + i];
			if (!tmp) {
				this.cuts[i] = [0, 0, 1, 1, ''];
				continue;
			}
			tmp = tmp.split(',');
			const t = new Array(5);
			this.cuts[i] = (t);
			for (let j = 0; j < 4; ++j) {
				let x = parseInt(tmp[j]);
				if (!isFinite(x))
					x = 0;
				t[j] = x;
			}
			t[4] = tmp[4] || '';
		}
	}
}
cut = new ImgCut();

function draw() {
	if (!imgloaded) return;
	let i = 0;
	const nodes = edit.getElementsByClassName('ihover');
	if (nodes.length)
		i = Array.from(edit.children).indexOf(nodes[0]);
	ctx.lineWidth = 2;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
	const c = cut.cuts[i];
	ctx.strokeRect(c[0], c[1], c[2], c[3]);
}

function createLine(c, i) {
	const tr = document.createElement('tr');
	const tdi = document.createElement('td');
	const tdx = document.createElement('td');
	const tdy = document.createElement('td');
	const tdw = document.createElement('td');
	const tdh = document.createElement('td');
	const tdn = document.createElement('td');
	tdi.innerText = i;
	tdx.innerText = c[0];
	tdy.innerText = c[1];
	tdw.innerText = c[2];
	tdh.innerText = c[3];
	tdn.innerText = c[4];
	tdx.contentEditable = true;
	tdy.contentEditable = true;
	tdw.contentEditable = true;
	tdh.contentEditable = true;
	tdn.contentEditable = true;
	tr.appendChild(tdi);
	tr.appendChild(tdx);
	tr.appendChild(tdy);
	tr.appendChild(tdw);
	tr.appendChild(tdh);
	tr.appendChild(tdn);
	tdx.onblur = function(event) {
		let n = parseInt(event.currentTarget.innerText);
		const i = Array.from(edit.children).indexOf(event.currentTarget.parentNode);
		if (!isFinite(n))
			n = cut.cuts[i][0];
		cut.cuts[i][0] = n;
		event.currentTarget.innerText = n;
		draw();
	}
	tdy.onblur = function(event) {
		let n = parseInt(event.currentTarget.innerText);
		const i = Array.from(edit.children).indexOf(event.currentTarget.parentNode);
		if (!isFinite(n))
			n = cut.cuts[i][1];
		cut.cuts[i][1] = n;
		event.currentTarget.innerText = n;
		draw();
	}
	tdw.onblur = function(event) {
		let n = parseInt(event.currentTarget.innerText);
		const i = Array.from(edit.children).indexOf(event.currentTarget.parentNode);
		if (!isFinite(n))
			n = cut.cuts[i][2];
		cut.cuts[i][2] = n;
		event.currentTarget.innerText = n;
		draw();
	}
	tdh.onblur = function(event) {
		let n = parseInt(event.currentTarget.innerText);
		const i = Array.from(edit.children).indexOf(event.currentTarget.parentNode);
		if (!isFinite(n))
			n = cut.cuts[i][3];
		cut.cuts[i][3] = n;
		event.currentTarget.innerText = n;
		draw();
	}
	tr.onclick = function(event) {
		event.stopPropagation();
		if (last_t) last_t.classList.remove('ihover');
		last_t = event.currentTarget;
		last_t.classList.add('ihover');
		draw();
	}
	tdx.f = tdy.f = tdw.f = tdh.f = tdn.f = true;
	tdx.onkeydown = tdy.onkeydown = tdw.onkeydown = tdh.onkeydown = tdn.onkeydown = function(event) {
		const t = event.currentTarget;
		switch (event.keyCode) {
			case 37: {
				event.preventDefault();
				const x = t.previousElementSibling;
				if (x) {
					x.focus();
					x.f = true;
				};
			}
			break;
			case 38: {
				event.preventDefault();
				let x = t.parentNode;
				if (x) {
					x = x.previousElementSibling;
					if (x) {
						x = x.children[Array.from(t.parentNode.children).indexOf(t)];
						x.focus();
						x.parentNode.click();
						x.f = true;
					}
				}
			}
			break;
			case 39: {
				event.preventDefault();
				const x = t.nextElementSibling;
				if (x) {
					x.focus();
					x.f = true;
				};
			}
			break;
			case 40: {
				event.preventDefault();
				let x = t.parentNode;
				if (x) {
					x = x.nextElementSibling;
					if (x) {
						x = x.children[Array.from(t.parentNode.children).indexOf(t)];
						x.focus();
						x.parentNode.click();
						x.f = true;
					}
				}
			}
			break;
			case 13: {
				event.preventDefault();
				t.blur();
				t.focus();
				break;
			}
			case 8:
				t.textContent = '';
				break;
			default:
				if (t.f) {
					t.textContent = '';
					t.f = false;
				}
		}
	}
	return tr;
}

function exportaimg() {
	if (!imgloaded) return;
	var a = document.createElement("a");
	a.href = img.src;
	a.click();
}

function exportcut() {
	var a = document.createElement("a");
	const idx = cutfile.lastIndexOf('/');
	a.download = idx == -1 ? cutfile : cutfile.slice(idx + 1);
	a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`[imgcut]\n0\n${cut.name}\n${cut.cuts.length}\n${cut.cuts.map(x => x.join(',')).join('\n')}\n`);
	a.click();
}

function exportimga() {
	if (!imgloaded) return;

	function download(i) {
		const c = cut.cuts[i];
		if (!c) return;
		preview.width = c[2];
		preview.height = c[3];
		pctx.clearRect(0, 0, preview.width, preview.height);
		pctx.drawImage(img, c[0], c[1], c[2], c[3], 0, 0, c[2], c[3]);
		let a = document.createElement('a');
		a.download = `${i}.png`
		a.href = preview.toDataURL();
		a.click();
		setTimeout(download, 500, i + 1);
	}
	download(0);
}

function exportimg() {
	if (!imgloaded) return;
	let i = 0;
	const nodes = edit.getElementsByClassName('ihover');
	if (nodes.length)
		i = Array.from(edit.children).indexOf(nodes[0]);
	const c = cut.cuts[i];
	preview.width = c[2];
	preview.height = c[3];
	pctx.clearRect(0, 0, preview.width, preview.height);
	pctx.drawImage(img, c[0], c[1], c[2], c[3], 0, 0, c[2], c[3]);
	var a = document.createElement("a");
	a.download = 'cut ' + i.toString() + (c[4] ? ` (${c[4]})` : '');
	a.href = preview.toDataURL();
	a.click();
}

function addline() {
	const c = [0, 0, 1, 1, ''];
	const nodes = edit.getElementsByClassName('ihover');
	if (nodes.length) {
		const e = nodes[0];
		let idx = Array.from(edit.children).indexOf(e);
		cut.cuts.splice(idx + 1, 0, c);
		e.after(createLine(c, idx + 1));
		let n = e.nextElementSibling;
		do
			n.children[0].innerText = ++idx;
		while (n = n.nextElementSibling);
		if (last_t) last_t.classList.remove('ihover');
		last_t = e.nextElementSibling;
		last_t.classList.add('ihover');
		return;
	}
	cut.cuts.push(c);
	if (last_t) last_t.classList.remove('ihover');
	last_t = createLine(c, cut.cuts.length - 1);
	last_t.classList.add('ihover');
	edit.appendChild(last_t);
}

function removeline() {
	if (!edit.firstElementChild) return;
	let e;
	let i;
	const nodes = edit.getElementsByClassName('ihover');
	if (!nodes.length) {
		e = edit.lastElementChild;
		i = edit.children.length - 1;
	} else {
		e = nodes[0];
		i = Array.from(edit.children).indexOf(e);
	}
	cut.cuts.splice(i, 1);
	for (let n = e.nextElementSibling; n; n = n.nextElementSibling)
		n.children[0].innerText = i++;
	edit.removeChild(e);
}
document.onclick = function() {
	last_t = null;
	for (let c of edit.getElementsByClassName('ihover'))
		c.classList.remove('ihover');
}
const file = document.getElementById('file');

function importImg() {
	file.accept = "image/*";
	file.onchange = function() {
		if (!this.files[0]) return;
		const f = new FileReader();
		f.onload = function(e) {
			img.src = e.target.result;
		}
		f.readAsDataURL(this.files[0]);
		imgfile = this.files[0].name;
	}
	file.click();
}

function importImgU() {
	let url = prompt('圖片網址', 'https://i.imgur.com/h6hRnwn.png');
	if (url) {
		img.src = url;
		imgfile = url;
		const u = new URL(location.href);
		u.searchParams.set('imgfile', url);
		history.pushState({}, "", u);
	}
}

function importCut() {
	file.accept = '.imgcut';
	file.onchange = function() {
		if (!this.files[0]) return;
		const f = new FileReader();
		f.onload = function(e) {
			cut = new ImgCut(e.target.result);
			edit.textContent = '';
			for (let i = 0; i < cut.cuts.length; ++i)
				edit.appendChild(createLine(cut.cuts[i], i));
		}
		f.readAsText(this.files[0]);
		cutfile = this.files[0].name;
	}
	file.click();
}

function importCutU() {
	let url = prompt('ImgCut網址', '');
	if (url) {
		fetch(url)
			.then(res => res.text())
			.then(text => {
				cut = new ImgCut(text);
				edit.textContent = '';
				for (let i = 0; i < cut.cuts.length; ++i)
					edit.appendChild(createLine(cut.cuts[i], i));
				cutfile = url;
				const u = new URL(location.href);
				u.searchParams.set('cutfile', url);
				history.pushState({}, "", u);
			});
	}
}
document.onpaste = function(event) {
	const items = (event.clipboardData || event.originalEvent.clipboardData).items;
	for (var index in items) {
		const item = items[index];
		if (item.kind === 'file') {
			var blob = item.getAsFile();
			var reader = new FileReader();
			reader.onload = function(event) {
				img.src = event.target.result;
				imgfile = 'clipboard';
			};
			reader.readAsDataURL(blob);
			return;
		}
	}
};
async function pasteImg() {
	const items = await navigator.clipboard.read();
	for (const c of items) {
		const imageTypes = c.types.filter(x => x.startsWith('image/'));
		for (const t of imageTypes) {
			const blob = await c.getType(t);
			var reader = new FileReader();
			reader.onload = function(event) {
				img.src = event.target.result;
				imgfile = 'clipboard';
			};
			reader.readAsDataURL(blob);
			return;
		}
	}
}
const color = document.getElementById('color');

function scolor() {
	ctx.strokeStyle = color.value;
	draw();
}
