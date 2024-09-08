import {savePng} from './common.mjs';

async function camera(e) {
	const tbl = e.currentTarget.parentNode._t;
	await savePng(tbl, 'rate.png', {
		style: {
			'margin': '0',
		},
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
			node.firstElementChild.onclick = camera;
			N.appendChild(node);
		}
	}
}
onerror = alert; // sometimes domtoimage failed to produce image when the DOM element is too large
