function tab(event, div) {
	var i, x;
	x = document.getElementsByClassName("content");
	for (i = 0; i < x.length; i++)
		x[i].style.display = "none";
	for (n of event.currentTarget.parentNode.children)
		n.classList.remove('active');
	document.getElementById(div).style.display = "block";
	event.currentTarget.classList.add("active");
}
let format = new Intl.NumberFormat(undefined, {
	'maximumFractionDigits': 2
});
window.CCC = {
	'download': function(obj, type) {
		const a = document.createElement('a');
		let o, t;
		if (type == 'json') {
			o = JSON.stringify(obj);
			t = 'application/json; charset=utf-8';
		} else {
			o = '';
			for (let line of obj) {
				if (line instanceof Array) {
					o += line.join(type == 'tsv' ? '\t' : ',');
				} else {
					o += String(line);
				}
				o += '\r\n';
			}
			t = 'text/' + type + ';charset=utf-8;';
		}
		const url = URL.createObjectURL(new Blob([o], {
			'type': t
		}));
		a.href = url;
		a.download = 'download.' + type;
		a.click();
		URL.revokeObjectURL(url);
	},
	'makeTable': function(array) {
		const tbody = document.getElementById('tbody');
		tbody.textContent = '';
		for (let x of array) {
			if (!(x instanceof Array))
				x = [x];
			const tr = document.createElement('tr');
			for (let y of x) {
				const td = document.createElement('td');
				td.textContent = String(y);
				tr.appendChild(td);
			}
			tbody.appendChild(tr);
		}
	},
	'isSuper': function(info) {
		const c = info.talents;
		if (!c) return false;
		for (let j = 1; j < 113 && c[j]; j += 14)
			if (c[j + 13] == 1)
				return true;
		return false;
	},
	'makeText': function(obj) {
		const div = document.getElementById('pre');
		div.textContent = obj;
	},
	'getChart': function() {
		const t = Chart.getChart("chart");
		if (t != undefined) t.destroy();
		return document.getElementById('chart');
	},
	'str': function(num) {
		return format.format(num);
	},
	'Chart': Chart
};
