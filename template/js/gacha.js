import {savePng} from './common.mjs';

(function() {
	const tooltip = document.getElementsByClassName('tooltip')[0];
	for (const className of ['rate', 'N', 'Y']) {
		for (const table of document.getElementsByClassName(className)) {
			table.style.position = 'relative';
			const cameraTool = tooltip.cloneNode(true);
			cameraTool.style.position = 'absolute';
			cameraTool.style.right = '-0';
			cameraTool.style.top = '-2em';
			cameraTool.style.display = 'block';
			cameraTool.firstElementChild.addEventListener('click', async event => {
				await savePng(table, 'rate.png', {
					style: {
						'margin': '0',
					},
				});
			});
			table.appendChild(cameraTool);
		}
	}
})();
