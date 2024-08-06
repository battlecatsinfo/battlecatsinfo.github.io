const CS = new Set();
let theme = 'light1';

function th(e) {
	document.documentElement.setAttribute("data-Q", theme = e.currentTarget.value);
	for (const x of CS) {
		x.options.theme = theme;
		x.render();
	}
}

class DPSRender {
	constructor(C) {
		const x = document.createElement('div');
		x.style.height = '300px';
		x.style.width = '96%';
		x.style.margin = '5px auto';
		C.appendChild(x);
		this.W = new CanvasJS.Chart(x, {
			'animationEnabled': true,
			'zoomEnabled': true,
			'responsive': true,
			'exportEnabled': true,
			'axisY': {
				'title': "DPS"
			},
			'axisX': {
				'title': "Range"
			},
			'legend': {
				verticalAlign: "top",
				horizontalAlign: "right",
				dockInsidePlotArea: true
			},
			'toolTip': {
				'shared': true
			},
			'data': [],
			'theme': theme
		});
		CS.add(this.W);
	}
	D() {
		this.W.exportChart({
			format: "png"
		});
	}
	register(title) {
		this.W.options.exportFileName = title;
		const x = {
			'name': title,
			'showInLegend': true,
			'legendMarkerType': "square",
			'type': "area",
			'markerSize': 0
		};
		this.W.options.data.push(x);
		return x;
	}
	C() {
		return 0;
	}
	destroy() {
		CS.delete(this.W);
		this.W.destroy();
		this.W = null;
	}
	text() {
		const objs = this.W.options.data;
		const M = {};
		let i, k, c, t, o;

		for (o of objs) {
			o.Z = [];
			i = 0;
			while (i < o.dataPoints.length) {
				c = 1;
				k = o.dataPoints[i].x;

				while ((++i) < o.dataPoints.length && o.dataPoints[i].x == k)
					++c;

				t = M[k];
				if (t) {
					M[k] = Math.max(t, c);
				} else {
					M[k] = c;
				}
			}
		}


		let x_cor = Object.keys(M);
		x_cor = x_cor.map(Number);
		x_cor.sort((x, y) => x - y);
		let F = [];

		for (const x of x_cor) {
			t = M[x];

			for (i = 0; i < t; ++i)
				F.push(x);

			for (o of objs) {
				c = 0;

				for (i = 0; i < o.dataPoints.length; ++i) {
					if (o.dataPoints[i].x == x) {
						do {
							++c;
							o.Z.push(o.dataPoints[i].y);
						} while ((++i) < o.dataPoints.length && o.dataPoints[i].x === x);

						k = o.dataPoints[i - 1].y;

						while (c < t) {
							o.Z.push(k);
							++c;
						}

						break;
					}
				}
				if (!c) {
					k = o.D(x);
					do {
						o.Z.push(k);
					} while ((++c) < t);
				}
			}
		}

		let R = '射程\t';
		for (t = 0; t < objs.length; ++t) {
			if (t == (objs.length - 1))
				R += objs[t].name + '\r\n';
			else
				R += objs[t].name + '\t';
		}

		for (i = 0; i < F.length; ++i) {
			R += F[i].toString() + '\t';
			for (t = 0; t < objs.length; ++t) {
				if (t == (objs.length - 1))
					R += objs[t].Z[i] + '\r\n';
				else
					R += objs[t].Z[i] + '\t';
			}
		}

		for (o of objs)
			o.Z = null;

		return R;
	}
	plot(obj) {
		obj.dataPoints = [];
		for (let i = 0; i < obj.Xs.length; ++i) {
			obj.dataPoints.push({
				'x': obj.Xs[i],
				'y': obj.Ys[i]
			});
		}
		obj.Xs.length = 0;
		obj.Ys.length = 0;
		this.W.render();
	}
}
