function savePNG(tbl) {
	tbl.style.margin = '0';
	domtoimage.toBlob(tbl).then(function (blob) {
		const a = document.createElement('a');
		const url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = 'rate.png';
		a.click();
		URL.revokeObjectURL(url);
		tbl.style.margin = '';
	});
}
function camera(e) {
	const t = e.currentTarget.parentNode._t;
	if (window.domtoimage != undefined) return savePNG(t);
	const script = document.createElement('script');
	script.onload = () => savePNG(t);
	script.src = '/dom-to-image.min.js';
	document.head.appendChild(script);
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
			node.firstElementChild.onclick = camera;
			N.appendChild(node);
		}
	}
}
onerror = alert; // sometimes domtoimage failed to produce image when the DOM element is too large
