const url = new URL(location.href);
let q_id = url.searchParams.get('id');
if (!q_id) {
	alert('Missing id in URL query');
	throw '';
}
q_id = parseInt(q_id);
if (q_id < 0 || isNaN(q_id)) {
	alert('Invalid Enemy id!');
	throw '';
}
const img = document.getElementById('eicon');
const ss = t3str(q_id);
img.src = '/data/enemy/' + ss + 'enemy_icon_' + ss + '.png';
img.onerror = function() {
  document.getElementById('eicon').src = '/data/enemy/' + ss + '/edi_' + ss + '.png';
}
const main_div = document.getElementById('main');
var Buffer = BrowserFS.BFSRequire('buffer').Buffer;
const materialDrops = [85, 86, 87, 88, 89, 90, 91, 140, 187, 188, 189, 190, 191, 192, 193, 194];
BrowserFS.install(window);
var enemy_names;
function t3str(x) {
  let s = x.toString();
  switch (s.length) {
  case 2: return '0' + s;
  case 1: return '00' + s;
  }
  return s;
}
fetch('enemyName.json').then(res => res.json()).then(json => enemy_names = json).then(function() {
fetch('/stages.zip').then(res => res.arrayBuffer()).then(function(zipData) {
  BrowserFS.configure({
    fs: "ZipFS",
    options: { 'zipData': Buffer.from(zipData) }
  }, function(e) {
    if (e) {
      console.error(e);
      return;
    }
    fs = BrowserFS.BFSRequire('fs');
    const S1 = fs.readdirSync('/stages');
    main_div.style.display = 'block';
    setTimeout(do_search, 0);
  });
});
});
function do_search() {
  const s1 = fs.readdirSync('/stages');
  let num_results = 0;
  for (let i = 0;i < s1.length;++i) {
  	const d1 = document.createElement('details');
    const m1 = s1[i];
    if (m1 == 'group') continue;
    const i1 = JSON.parse(fs.readFileSync(`/stages/${m1}/info`, 'utf-8', 'r'));
    const s2 = fs.readdirSync(`/stages/${m1}`);
    for (let j = 0;j < s2.length;++j) {
    	const d2 = document.createElement('details');
      	const m2 = s2[j];
      	if (m2 == 'info') continue;
      	const i2 = JSON.parse(fs.readFileSync(`/stages/${m1}/${m2}/info`, 'utf-8', 'r'));
      	const s3 = fs.readdirSync(`/stages/${m1}/${m2}`);
      	for (let k = 0;k < s3.length;++k) {
        	const m3 = s3[k];
        	if (m3 == 'info') continue;
        	const i3 = JSON.parse(fs.readFileSync(`/stages/${m1}/${m2}/${m3}`, 'utf-8', 'r'));
        	for (let line of i3.l) {
        		if (line[0] == q_id) {
              ++num_results;
        			const a = document.createElement('a');
        			a.href = '/stage.html?s=' + [i, j, k].join('-');
        			a.innerHTML = [i3.name, i3.jpname].filter(x => x).join('/');
        			d2.appendChild(a);
        			break;
        		}
        	}
      	}
	    if (d2.children.length) {
    	    const s2 = document.createElement('summary');
        	s2.innerText = [i2.name, i2.jpname].filter(x => x).join('/');
        	d2.appendChild(s2);
        	d1.appendChild(d2);
        }
    }
    if (d1.children.length) {
    	const s1 = document.createElement('summary');
    	s1.innerText = [i1.name, i1.jpname].filter(x => x).join('/');
    	d1.appendChild(s1);
    	main_div.appendChild(d1);
    }
  }
  if (!num_results)
  	main_div.innerHTML = main_div.innerHTML + '<h1>沒有結果</h1>';
}
