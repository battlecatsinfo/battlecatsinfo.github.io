const killPersentEl = document.getElementById('kill');
const enemyHpEl = document.getElementById('hp');
const themeSelectEl = document.getElementById('S');
let chart;

function handleInput() {
	let hp = parseInt(enemyHpEl.value);
	let m = parseInt(killPersentEl.value);
	if (!(Number.isFinite(hp) && Number.isFinite(m) && hp >= 1 && m >= 1))
		return;

	let Ys = [{y: hp}];
	m /= 100;

	while (true) {
		hp -= 1 + Math.max(~~(hp * m), 1);
		if (hp <= 0) {
			Ys.push({y: 0});
			break;
		}
		Ys.push({y: hp});
	}
	if (!chart) {
		chart = new CanvasJS.Chart('canvas', {
			'animationEnabled': true,
			'responsive':true,
			'exportEnabled': true,
			'axisY': {
				'title': "Enemy HP"
			},
			'axisX': {
				'title': 'Nth attack'
			},
			'theme': themeSelectEl.value,
			'title': { 'text': "Metal Killer" },
			'data': [{
				'xValueFormatString': '0th attack',
				'yValueFormatString': '#,##0 HP remaining',
				'type': 'line',
				'dataPoints': Ys
			}]
		});
		chart.render();
	} else {
		chart.options.data[0].dataPoints = Ys;
		document.documentElement.setAttribute("data-Q", (chart.options.theme = themeSelectEl.value));
		chart.render();
	}
}

function init() {
	const url = new URL(location.href);	
	const kill = url.searchParams.get('kill');
	if (kill) {
		const nkill = parseInt(kill);
		if (isFinite(kill) && nkill > 0 && nkill < 100)
			killPersentEl.value = nkill;
	}
};


themeSelectEl.addEventListener('input', handleInput);
enemyHpEl.addEventListener('input', handleInput);
killPersentEl.addEventListener('input', handleInput);

init();
handleInput();
