var stage_name = '';
var fs;
const M1 = document.getElementById('M1');
const M2 = document.getElementById('M2');
const M3 = document.getElementById('M3');
const st1 = document.getElementById('st-1').children;
const st2 = document.getElementById('st-2').children;
const st3 = document.getElementById('st-3').children;
const stName = document.getElementById('st-name');
const stName2 = document.getElementById('st-name2');
const stLines = document.getElementById('lines');
var info1, info2, info3;
var enemy_names;
var Buffer = BrowserFS.BFSRequire('buffer').Buffer;
BrowserFS.install(window);
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
    fs.readdirSync('/stages').forEach(m1 => {
      const p = document.createElement('option');
      const info = JSON.parse(fs.readFileSync((p.value = `/stages/${m1}`) + '/info', 'utf-8', 'r'));
      p.innerText = [info.name, info.jpname].filter(x => x && x.length).join('/');
      M1.appendChild(p);
    });
    M1.selectedIndex = 0;
    M1.oninput();
  });
});
})
Array.from(document.getElementById('stars').children).forEach((x, i) => {
    x.star = (i + 1).toString();
    x.style.cursor = 'pointer';
    x.onclick = function(event) {
        const url = new URL(location.href);
        const t = event.currentTarget;
        url.searchParams.set('star', t.star);
        history.pushState({}, "", url);
        document.title = stage_name + ' (' + t.star + '星)';
        var x;
        for (x=t;;) {
            x = x.nextElementSibling;
            if (!x) break;
            x.style.color = 'white';
        }
        for (x=t;;) {
            x = x.previousElementSibling;
            if (!x) break;
            x.color = 'darkorange';
        }
        t.style.color = 'darkorange';
    }
});
M1.oninput = function() {
  const dir = M1.selectedOptions[0].value;
  info1 = JSON.parse(fs.readFileSync(dir + '/info'));
  M2.textContent = '';
  M3.textContent = '';
  fs.readdirSync(dir).forEach(m1 => {
    if (m1 == 'info') return;
    const p = document.createElement('option');
    const info = JSON.parse(fs.readFileSync((p.value = dir + '/' + m1) + '/info', 'utf-8', 'r'));
    p.innerText = [info.name, info.jpname].filter(x => x && x.length).join('/');
    M2.appendChild(p);
  });
  M2.selectedIndex = 0;
  M2.oninput();
}
M2.oninput = function() {
  const dir = M2.selectedOptions[0].value;
  info2 = JSON.parse(fs.readFileSync(dir + '/info'));
  M3.textContent = '';
  fs.readdirSync(dir).forEach(m1 => {
    if (m1 == 'info') return;
    const p = document.createElement('option');
    const info = JSON.parse(fs.readFileSync((p.value = dir + '/' + m1), 'utf-8', 'r'));
    p.innerText = [info.name, info.jpname].filter(x => x && x.length).join('/');
    M3.appendChild(p);
  });
  M3.selectedIndex = 0;
  M3.oninput();
}
function makeTd(p, txt) {
  const td = document.createElement('td');
  td.innerText = txt;
  p.appendChild(td);
}
function t3str(x) {
  let s = x.toString();
  switch (s.length) {
  case 3: return s;
  case 2: return '0' + s;
  case 1: return '00' + s;
  }
}
M3.oninput = function() {
  const dir = M3.selectedOptions[0].value;
  info3 = JSON.parse(fs.readFileSync(dir));
  stName.innerText = stage_name = [info1.name, info2.name, info3.name].join(' • ');
  stName2.innerText = [info1.jpname, info2.jpname, info3.jpname].join(' • ');
  document.title = stage_name;
  st1[1].innerText = 'enegy';
  st1[3].innerText = 'e-max';
  st1[5].innerText = info3.len;
  st2[1].innerText = info3.health;
  st2[3].innerText = info3.castle;
  st2[5].innerText = info3.bg;
  st3[1].innerText = 'xp';
  st3[3].innerText = '可';
  st3[5].innerText = '可';
  stLines.textContent = '';
  for (let line of info3.lines) {
    const tr = document.createElement('tr');
    //<tr><td colspan="2">敵人</td><td>倍率</td><td>出現數</td><td>城連動</td><td>初登場</td><td>再登場</td></tr>
    const enemy = line[0];
    makeTd(tr, enemy_names[enemy]);
    const img = new Image(85, 32);
    const a = document.createElement('a');
    a.href = '/enemy.html?id=' + enemy.toString();
    s = t3str(enemy)
    img.src = '/data/enemy/' + s + '/edi_' + s + '.png';
    const td = document.createElement('td');
    a.appendChild(img);
    td.appendChild(a);
    tr.appendChild(td);
    makeTd(tr, (line[9] || 100).toString() + '%');
    makeTd(tr, line[1] || '無限');
    makeTd(tr, line[5].toString() + '%');
    makeTd(tr, line[2] == line[10] ? line[10] : `${line[2]}~${line[10]}`);
    makeTd(tr, line[3] == line[4] ? line[3] : `${line[3]}~${line[4]}`);
    stLines.appendChild(tr);
  }
}
