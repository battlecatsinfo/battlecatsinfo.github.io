const kill = document.getElementById('kill');
const HP = document.getElementById('hp');
const S = document.getElementById('S');
let chart;

(function () {
	const url = new URL(location.href);	
	const pkill = url.searchParams.get('kill');
	if (pkill) {
		const nkill = parseInt(pkill);
		if (isFinite(nkill) && nkill > 0 && nkill < 100)
			kill.value = nkill;
	}
})();

(S.onclick = HP.oninput = kill.oninput = function () {
	let hp = Math.max(parseInt(HP.value) || 1, 1);
	let Ys = [{y: hp}];
	let m = parseInt(kill.value) / 100;
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
			'theme': S.value,
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
		document.documentElement.setAttribute("data-Q", chart.options.theme = S.value);
		chart.render();
	}
})();
