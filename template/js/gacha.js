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
