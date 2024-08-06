class ColorGen {
	constructor() {
		this.i = 0;
		this.L = [ColorGen.Paired, ColorGen.Dark, ColorGen.Cat10, ColorGen.Tableau];
	}
	getColorFunc() {
		if ((++this.i) >= 4) {
			this.i = 0;
		}
		return this.L[this.i];
	}
	static Paired(x, i) {
		i = i % 6;
		i += i;
		x.fc = d3.schemePaired[i];
		x.dc = d3.schemePaired[i + 1];
	}
	static Tableau(x, i) {
		x.fc = d3.schemeTableau10[i % 10];
		x.dc = d3.color(x.fc).darker(1).formatHex8();
	}
	static Cat10(x, i) {
		x.fc = d3.schemeCategory10[i % 10];
		x.dc = d3.color(x.fc).darker(1).formatHex8();
	}
	static Dark(x, i) {
		x.fc = d3.schemeDark2[i % 10];
		x.dc = d3.color(x.fc).darker(1).formatHex8();
	}
}

const GEN = new ColorGen();

class DPSRender {
	constructor(C) {
		const self = this;

		this.CF = GEN.getColorFunc();
		this.tooltip = {
			'style': () => null,
			'remove': () => null
		};

		this.svg = d3.create("svg")
			.attr("viewBox", `0 0 1300 650`)
			.attr("style", "width:100%;overflow:visible;font-family:Verdana,sans-serif;")
			.on("pointerenter pointermove", this.pointermoved.bind(this))
			.on("pointerleave", () => self.tooltip && self.tooltip.style("display", "none"))
			.on("touchstart", e => e.preventDefault());

		this.svg.append("text")
			.attr("x", 45)
			.attr("y", 35)
			.attr("text-anchor", "middle")
			.attr("font-size", "20px")
			.text("DPS");

		this.svg.append("text")
			.attr("x", 1300 / 2)
			.attr("y", 650 - 50)
			.attr("text-anchor", "middle")
			.attr("font-size", "22px")
			.text("射程");
		C.appendChild(this.svg.node());
		this.objs = [];
	}

	pointermoved(e) {
		const X = Math.round(this.x.invert(d3.pointer(e)[0]));
		let s = ['距離: ' + X],
			T, t;

		for (const o of this.objs) {
			if (t = o.D(X)) {
				s.push(`${o.title}: ${format.format(t)}`);
				T = t;
			}
		}

		if (!T) return;

		this.tooltip.style("display", null);
		this.tooltip.attr("transform", `translate(${this.x(X)},${this.y(T)})`);
		const path = this.tooltip.selectAll("path").data([, ]).join("path").attr("fill", "white").attr("stroke", "black");
		const text = this.tooltip.selectAll("text").data([, ]).join("text").call(text => text.selectAll("tspan").data(s).join("tspan").attr("x", 0).attr("y", (_, i) => `${i * 1.7}em`).text(d => d));
		const {
			x,
			y,
			width: w,
			height: h
		} = text.node().getBBox();
		text.attr("transform", `translate(${-w / 2},${15 - y})`);
		path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
	}

	destroy() {
		this.objs.length = 0;
	}
	D() {
		if (self.tooltip) {
			this.tooltip.remove();
			this.tooltip = null;
		}

		const url = URL.createObjectURL(
			new Blob(
				['<?xml version="1.0" standalone="no"?>\r\n' + new XMLSerializer().serializeToString(this.svg.node())], {
					'type': 'image/svg+xml;charset=utf-8'
				}
			)
		);

		const a = document.createElement('a');
		a.href = url;
		a.download = this.S + '.svg';
		a.click();
		URL.revokeObjectURL(url);
	}
	C() {
		return this.objs.length;
	}
	register(title) {
		const x = {
			'title': title
		};
		this.CF(x, this.objs.length);
		this.objs.push(x);
		this.S = title;

		return x;
	}
	text() {
		const M = {};
		let i, k, c, t, o;

		for (o of this.objs) {
			o.Z = [];
			i = 0;
			while (i < o.Xs.length) {
				c = 1;
				k = o.Xs[i];

				while ((++i) < o.Xs.length && o.Xs[i] == k)
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

			for (o of this.objs) {
				c = 0;

				for (i = 0; i < o.Xs.length; ++i) {
					if (o.Xs[i] == x) {
						do {
							++c;
							o.Z.push(o.Ys[i]);
						} while (o.Xs[++i] === x);

						k = o.Ys[i - 1];

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
		for (t = 0; t < this.objs.length; ++t) {
			if (t == (this.objs.length - 1))
				R += this.objs[t].title + '\r\n';
			else
				R += this.objs[t].title + '\t';
		}

		for (i = 0; i < F.length; ++i) {
			R += F[i].toString() + '\t';
			for (t = 0; t < this.objs.length; ++t) {
				if (t == (this.objs.length - 1))
					R += this.objs[t].Z[i] + '\r\n';
				else
					R += this.objs[t].Z[i] + '\t';
			}
		}

		for (o of this.objs)
			o.Z = null;

		return R;
	}
	plot(obj) {
		const width = 1300;
		const height = 650;
		const marginTop = 40;
		const marginRight = 30;
		const marginBottom = 100;
		const marginLeft = 80;

		let x_min = Infinity,
			x_max = -Infinity,
			y_max = -Infinity;

		for (const O of this.objs) {
			x_min = Math.min(Math.min(...O.Xs), x_min);
			x_max = Math.max(Math.max(...O.Xs), x_max);
			y_max = Math.max(Math.max(...O.Ys), y_max);
		}

		if (!isFinite(x_min))
			return;

		this.x = d3.scaleLinear([x_min, x_max], [marginLeft, width - marginRight]);
		this.y = d3.scaleLinear([0, y_max], [height - marginBottom, marginTop]);

		for (const O of this.objs) {
			if (O.line) {
				O.line
					.datum(O.Xs)
					.transition()
					.duration(750)
					.attr("d",
						d3.area()
						.x0((d, i) => this.x(O.Xs[i]))
						.y0(this.y(0))
						.y1((d, i) => this.y(O.Ys[i]))
					);
			} else {
				O.line = this.svg.append("path")
					.datum(O.Xs)
					.attr("fill", O.fc)
					.attr('fill-opacity', 0.5)
					.attr("stroke", O.dc)
					.attr("stroke-width", 1)
					.attr("d", d3.area()
						.x0((d, i) => this.x(O.Xs[i]))
						.y0(this.y(0))
						.y1((d, i) => this.y(O.Ys[i]))
					);
			}
			if (O.Y2s) {
				if (O.l2) {
					O.l2
						.datum(O.X2s)
						.transition()
						.duration(750)
						.attr("d",
							d3.area()
							.x0((d, i) => this.x(O.X2s[i]))
							.y0(this.y(0))
							.y1((d, i) => this.y(O.Y2s[i]))
						);
				} else {
					O.l2 = this.svg.append("path")
						.datum(O.X2s)
						.attr("fill", 'red')
						.attr('fill-opacity', 0.5)
						.attr("stroke", '#000')
						.attr("stroke-width", 1)
						.attr("d", d3.area()
							.x0((d, i) => this.x(O.X2s[i]))
							.y0(this.y(0))
							.y1((d, i) => this.y(O.Y2s[i]))
						);
				}
			} else if (O.l2) {
				O.l2.remove();
			}
		}

		if (!this.x_axis) {

			this.x_axis = this.svg.append("g")
				.attr("transform", `translate(0,${height - marginBottom})`)
				.call(d3.axisBottom(this.x))
				.attr("font-size", "19px");

			this.y_axis = this.svg.append("g")
				.attr("transform", `translate(${marginLeft},0)`)
				.call(d3.axisLeft(this.y))
				.attr("font-size", "19px");

		} else {

			this.x_axis
				.transition()
				.call(d3.axisBottom(this.x))
				.duration(750);

			this.y_axis
				.transition()
				.call(d3.axisLeft(this.y))
				.duration(750);
		}

		if (self.tooltip)
			this.tooltip.remove();

		this.tooltip = this.svg.append("g").style("font-size", "22px");

	}
}
