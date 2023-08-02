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
const main_div = document.getElementById('main');
const search_result = document.getElementById('search-result');
const m_drops = document.getElementById('drops');
const rewards = document.getElementById('rewards');
const m_times = document.getElementById('times');
const mM = document.getElementById('mM');
var info1, info2, info3;
var enemy_names;
var star;
var char_groups;
var Buffer = BrowserFS.BFSRequire('buffer').Buffer;
const materialDrops = [85, 86, 87, 88, 89, 90, 91, 140, 187, 188, 189, 190, 191, 192, 193, 194];
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
      if (m1 == 'group') return;
      const p = document.createElement('option');
      const info = JSON.parse(fs.readFileSync((p.value = `/stages/${m1}`) + '/info', 'utf-8', 'r'));
      p.innerText = [info.name, info.jpname].filter(x => x).join('/');
      M1.appendChild(p);
    });
    char_groups = JSON.parse(fs.readFileSync('/stages/group', 'utf-8', 'r'));
    const url = new URL(location.href);
    const stars = url.searchParams.get('star');
    if (stars) {
      star = parseInt(stars);
      if (isNaN(star) || star <= 0 || star > 4)
        star = 1;
    } else {
      star = 1;
    }
    const st = url.searchParams.get('s');
    if (st) {
      const sts = st.split('-').map(x => parseInt(x)).filter(x => !isNaN(x));
      if (sts.length) {
        M1.selectedIndex = sts[0];
        M1.oninput(null, sts);
        main_div.style.display = 'block';
        return;
      }
    }
    M1.selectedIndex = 0;
    M1.oninput();
    main_div.style.display = 'block';
  });
});
});
function merge(g1, g2) {
  group = [g1[0], [...g1[1]]];
  if (g1[0] == 0 && g2[0] == 0) {
    group[1] = [];
    for (let x of g1[1]) {
      if (g2[1].includes(x))
        group[1].push(x);
    }
  } else if (g1[0] == 0 && g2[0] == 2) {
    group[1] = group[1].filter(x => g2[1].contains(x));
  } else if (g1[0] == 2 && g2[0] == 0) {
    group[0] = 0;
    for (let x of g2[1]) {
      if (!group[1].includes(x))
        group[1].push(x);
    }
    group[1] = group[1].filter(x => g1[1].contains(x));
  } else if (g1[0] == 2 && g2[0] == 2) {
    for (let x of g2[1]) {
      if (!group[1].includes(x))
        group[1].push(x);
    }
  }
  return group;
}
function getRarityString(rare) {
  const names = ['基本','EX','稀有','激稀有','超激稀有','傳説稀有'];
  var strs = [];
  let y = 0;
  for (let i = 1;i < 64;i <<= 1) {
    if (rare & i)
      strs.push(names[y]);
    ++y;
  }
  return strs.join('，');
}
class Limit {
  constructor(x) {
    if (x != undefined) {
      this.star = x[0];
      this.sid = x[1];
      this.rare = x[2];
      this.num = x[3];
      this.line = x[4];
      this.min = x[5];
      this.max = x[6];
      this.group = char_groups[x[7]];
    } else {
      this.star = -1;
      this.sid = -1;
      this.rare = 0;
      this.num = 0;
      this.line = 0;
      this.min = 0;
      this.max = 0;
    }
  }
  combine(other) {
    if (this.rare == 0)
      this.rare = other.rare;
    else if (other.rare != 0)
      this.rare &= other.rare;
    if (this.num * other.num > 0)
      this.num = Math.min(this.num, other.num);
    else
      this.num = Math.max(this.num, other.num);
    this.line |= other.line;
    this.min = Math.max(this.min, other.min);
    this.max = this.max > 0 && other.max > 0 ? Math.min(this.max, other.max) : (this.max + other.max);
    if (other.hasOwnProperty('group')) {
      if (this.hasOwnProperty('group')) {
        this.group = merge(this.group, other.group);
      } else {
        this.group = other.group;
      }
    }
  }
}
M1.oninput = function(event, sts) {
  const dir = M1.selectedOptions[0].value;
  info1 = JSON.parse(fs.readFileSync(dir + '/info'));
  M2.textContent = '';
  M3.textContent = '';
  fs.readdirSync(dir).forEach(m1 => {
    if (m1 == 'info') return;
    const p = document.createElement('option');
    const info = JSON.parse(fs.readFileSync((p.value = dir + '/' + m1) + '/info', 'utf-8', 'r'));
    p.innerText = [info.name, info.jpname].filter(x => x).join('/');
    M2.appendChild(p);
  });
  if (sts && sts.length > 1)
    M2.selectedIndex = sts[1];
  else
    M2.selectedIndex = 0;
  M2.oninput(null, sts);
}
M2.oninput = function(event, sts) {
  const dir = M2.selectedOptions[0].value;
  info2 = JSON.parse(fs.readFileSync(dir + '/info'));
  M3.textContent = '';
  fs.readdirSync(dir).forEach(m1 => {
    if (m1 == 'info') return;
    const p = document.createElement('option');
    const info = JSON.parse(fs.readFileSync((p.value = dir + '/' + m1), 'utf-8', 'r'));
    p.innerText = [info.name, info.jpname].filter(x => x).join('/');
    M3.appendChild(p);
  });
  if (sts && sts.length > 2)
    M3.selectedIndex = sts[2];
  else
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
  case 2: return '0' + s;
  case 1: return '00' + s;
  }
  return s;
}
function getDropData() {
  const res = [];
  var sum = 0;
  const drops = info3.drop;
  for (let x of drops)
    sum += x[0];
  if (sum == 1000) {
    for (let x of drops)
      res.push((x[0] / 10).toFixed(0));
  } else if ((sum == drops.length && sum != -1) || info3.rand == -3) {
    for (let x of drops)
      res.push(x[0].toString());
    return res;
  } else if (sum == 100) {
    for (let x of drops) {
      res.push(x[0].toString());
    }
  } else if (sum > 100 && (info3.rand == 0 || info3.rand == 1)) {
    var rest = 100;
    if (drops[0][0] == 100) {
      res.push('100');
      for (let i = 1;i < drops.length;++i) {
        const filter = rest * drops[i][0] / 100;
        rest -= filter;
        res.push(filter.toFixed(0));
      }
    } else {
      for (let x of drops) {
        const filter = rest * x[0] / 100;
        rest -= filter;
        res.push(filter.toFixed(0));
      }
    }
  } else if (info3.rand == -4) {
    for (let x of drops) {
      res.push((x[0] * 100 / sum).toFixed(0));
    }
  } else {
    for (let x of drops) {
      res.push(x[0].toString());
    }
  }
  return res;
}
M3.oninput = function() {
  const dir = M3.selectedOptions[0].value;
  const url = new URL(location.href);
  url.searchParams.set('s', [M1.selectedIndex, M2.selectedIndex, M3.selectedIndex].join('-'));
  if (info2.stars.length)
    star = Math.min(info2.stars.length, star);
  else
    star = 1;
  url.searchParams.set('star', star);
  history.pushState({}, "", url);
  info3 = JSON.parse(fs.readFileSync(dir));
  stName.innerText = stage_name = [info1.name, info2.name, info3.name].filter(x => x).join(' • ');
  stName2.innerText = [info1.jpname, info2.jpname, info3.jpname].filter(x => x).join(' • ');
  document.title = stage_name;
  const stars_tr = document.getElementById('stars-tr');
  if (stars_tr)
    stars_tr.parentNode.removeChild(stars_tr);
  const warn_tr = document.getElementById('warn-tr');
  if (warn_tr)
    warn_tr.parentNode.removeChild(warn_tr);
  const limit_bt = document.getElementById('limit-bt');
  if (limit_bt)
    limit_bt.parentNode.removeChild(limit_bt);
  let mult = info2.stars[star - 1];
  if (!mult) {
    mult = 1;
  } else {
    mult *= 0.01;
  }
  if (info2.stars.length) {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.colSpan = 6;
    for (let i = 0;i < info2.stars.length;++i) {
      const a = document.createElement('a');
      a.classList.add('star');
      a.innerText = (i+1).toString() + '★: ' + info2.stars[i].toString() + '%';
      url.searchParams.set('star', i+1);
      a.href = url.href;
      if ((!star && !i) || (star -1 == i)) {
        a.style.color = '#a5652a';
      }
      th.appendChild(a);
    }
    tr.appendChild(th);
    tr.id = 'stars-tr';
    stName.parentNode.parentNode.appendChild(tr);
  }
  if (info3.hasOwnProperty('nC') || info2.rM || info1.hasOwnProperty('gc') || info2.hasOwnProperty('gc')) {
    var s;
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    tr.style.fontSize = '15px';
    th.colSpan = 6;
    if (info2.rM) {
      const span = document.createElement('div');
      span.innerText = ["過關獎勵將會在再次出現時重置", "清除狀況將會在再次出現時重置", "可過關次數將會在再次出現時重置"][info2.rM - 1];
      span.style.color = 'brown';
      th.appendChild(span);
    }
    if (info1.hasOwnProperty('gc') || info2.hasOwnProperty('gc')) {
      const span = document.createElement('div');
      span.style.color = 'darkgoldenrod';
      span.innerText = '黃金貓電腦貓電腦掃蕩不可';
      th.appendChild(span);
    }
    if (info3.hasOwnProperty('nC')) {
      const span = document.createElement('div');
      span.style.color = '#ff634e';
      span.innerText = '接關不可';
      th.appendChild(span);
    }
    tr.appendChild(th);
    tr.id = 'warn-tr';
    stName.parentNode.parentNode.appendChild(tr);
  }
  rewards.textContent = '';
  if (info3.drop.length && M2.selectedOptions[0].value != '/stages/3/3') {
    const chances = getDropData();
    for (let i =0;i < info3.drop.length;++i) {
      if (!parseInt(chances[i])) continue;
      const v = info3.drop[i];
      const tr = document.createElement('tr');
      const td0 = document.createElement('td');
      const td1 = document.createElement('td');
      const td2 = document.createElement('td');
      const rw = v[1];
      var s = RWSTNAME[rw];
      if (!s)
        s = RWNAME[rw] || (`獎勵#` + rw.toString());
      const cat_id = drop_chara[rw];
      if (cat_id) {
        const a = document.createElement('a');
        a.href = '/unit.html?id=' + cat_id.toString();
        a.innerText = s;
        td0.appendChild(a);
      } else {
        td0.innerText = s + ` ×${v[2]}`;
      }
      td1.appendChild(document.createTextNode(chances[i] + '%' + ((i == 0 && info3.drop[i][0] != 100 && info3.rand != -4) ? '(寶雷)' : '')));
      td2.innerText = (i == 0 && (info3.rand == 1 || (info3.drop[0][1] >= 1000 && info3.drop[0][1] < 30000))) ? '一次' : '無';
      tr.appendChild(td0);
      tr.appendChild(td1);
      tr.appendChild(td2);
      rewards.appendChild(tr);
    }
  }
  if (rewards.children.length)
    rewards.parentNode.style.display = 'table';
  else
    rewards.parentNode.style.display = 'none';
  m_drops.textContent = '';
  for (let i = 1;i < info2.mD.length;++i) {
    if (info2.mD[i] <= 0)
      continue;
    const tr = document.createElement('tr');
    const td0 = document.createElement('td');
    td0.innerText = RWNAME[materialDrops[i - 1]];
    tr.appendChild(td0);
    const td1 = document.createElement('td');
    td1.innerText = `${info2.mD[i]}%`;
    tr.appendChild(td1);
    m_drops.appendChild(tr);
  }
  if (m_drops.children.length)
    m_drops.parentNode.style.display = 'table';
  else
    m_drops.parentNode.style.display = 'none';
  mM.innerText = `機率(最大掉落量${~~Math.round(mult * info3.mM)})`;
  if (info3.time.length) {
    m_times.textContent = '';
    for (let tm of info3.time) {
      const tr = document.createElement('tr');
      const td0 = document.createElement('td');
      const td1 = document.createElement('td');
      const td2 = document.createElement('td');
      var s = '';
      const rw = tm[1];
      var s = RWSTNAME[rw];
      if (!s)
        s = RWNAME[rw];
      td0.innerText = s;
      td1.innerText = tm[2];
      td2.innerText = tm[0];
      tr.appendChild(td0);
      tr.appendChild(td1);
      tr.appendChild(td2);
      m_times.appendChild(tr);
    }
    m_times.parentNode.style.display = 'table';
  } else {
    m_times.parentNode.style.display = 'none';
  }
  st1[1].innerText = (M1.selectedOptions[0].value == '/stages/14') ? ('貓力達' + String.fromCharCode(65 + info3.e/1000) + '×' + (info3.e % 1000).toString()) : info3.e;
  st1[3].innerText = info3.max;
  st1[5].innerText = info3.len;
  st2[1].innerText = info3.H;
  const ca = document.createElement('a');
  const cas = t3str(info3.castle % 1000);
  const cad = ["rc", "ec", "wc", "sc"][Math.floor(info3.castle / 1000)];
  ca.href = '/data/img/' + cad + '/' + cad  + cas + '.png';
  ca.innerText = cas;
  st2[3].textContent = '';
  st2[3].appendChild(ca);
  const a = document.createElement('a');
  a.href = '/data/img/bg/bg' + t3str(info3.bg) + '.png';
  a.innerText = t3str(info3.bg);
  st2[5].textContent = '';
  st2[5].appendChild(a);
  st3[1].innerText = info3.xp;
  const a1 = document.createElement('a');
  a1.innerText = t3str(info3.m0);
  a1.href = 'https://github.com/battlecatsultimate/bcu-assets/raw/maste/music/' + t3str(info3.m0) + '.ogg';
  const a2 = document.createElement('a');
  a2.innerText = t3str(info3.m1);
  a2.href = 'https://github.com/battlecatsultimate/bcu-assets/raw/master/music/' + t3str(info3.m1) + '.ogg';
  st3[3].textContent = '';
  st3[3].appendChild(a1);
  st3[5].textContent = '';
  st3[5].appendChild(a2);
  stLines.textContent = '';
  if (info2.hasOwnProperty('Lim')) {
    const lims = info2.Lim.map(x => new Limit(x));
    const theStar = star - 1;
    const lim = new Limit();
    const m3N = M3.selectedOptions[0].value;
    const my_sid = parseInt(m3N.slice(m3N.lastIndexOf('/') + 1));
    for (l of lims)
      if (l.star == -1 || l.star == theStar)
        if (l.sid == -1 || l.sid == my_sid) 
          lim.combine(l);
    var limits = [];
    if (lim.rare)
      limits.push('稀有度：' + getRarityString(lim.rare));
    if (lim.num)
      limits.push('最多可出戰角色數量：' + lim.num);
    if (lim.max && lim.min)
      limits.push(`生產成本：${lim.min}元與${lim.min}元之間`);
    else if (lim.max)
      limits.push(`生產成本：${lim.max}元以上`);
    else if (lim.min) 
      limits.push(`生產成本：${lim.min}元以下`);
    if (lim.line)
      limits.push('出陣列表：僅限第1頁');
    if (lim.group && lim.group[1].length)
      limits.push('可出擊角色的ID: ' + lim.group[1].join(','));
    if (limits.length) {
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      const div = document.createElement('div');
      div.innerText = '出擊制限：' + limits.join('、');
      div.style.color = '#8d5b00';
      tr.style.fontSize = '15px';
      th.colSpan = 6;
      th.appendChild(div);
      tr.appendChild(th);
      tr.id = 'limit-bt';
      stName.parentNode.parentNode.appendChild(tr);
    }
  }
  for (let line of info3.l) {
    const tr = document.createElement('tr');
    const enemy = line[0];
    makeTd(tr, enemy_names[enemy]);
    const img = new Image(85, 32);
    const a = document.createElement('a');
    a.href = `/enemy.html?id=${enemy}&mag=${(line[9] || 100) * mult}`;
    s = t3str(enemy)
    img.src = '/data/enemy/' + s + '/edi_' + s + '.png';
    const td = document.createElement('td');
    a.appendChild(img);
    td.appendChild(a);
    tr.appendChild(td);
    makeTd(tr, ((line[9] || 100) * mult).toFixed(0) + '%');
    makeTd(tr, line[1] || '無限');
    makeTd(tr, line[5].toString() + '%');
    makeTd(tr, line[2] == line[10] ? line[10] : `${line[2]}~${line[10]}`);
    makeTd(tr, line[3] == line[4] ? line[3] : `${line[3]}~${line[4]}`);
    const boss = line[8];
    if (boss == 2) {
      const span = document.createElement('span');
      span.innerText = '(BOSS,震波)';
      span.classList.add('boss');
      tr.firstElementChild.appendChild(span);
    } else if (boss == 1) {
      const span = document.createElement('span');
      span.innerText = '(BOSS)';
      span.classList.add('boss');
      tr.firstElementChild.appendChild(span);
    }
    stLines.appendChild(tr);
  }
}
document.getElementById('name-search').oninput = function(event) {
  setTimeout(doSearch, 0, event.currentTarget);
}
function doSearch(t) {
  const v = t.value.split(' ').filter(x => x);
  if (!v.length) {
    search_result.style.display = 'none';
    main_div.style.display = 'block';
    return;
  }
  search_result.textContent = '';
  function f(s) {
    if (!s) return false;
    for (let i of v) {
      if (s.includes(i))
        return true;
    }
    return false;
  }
  function add(ms, is) {
    const a = document.createElement('a');
    for (let i = 0;i < is.length;++i) {
      if (is[i].name) {
        for (let j of v)
          is[i].name = is[i].name.replaceAll(j, (match) => `<span>${match}</span>`);
      }
      if (is[i].jpname) {
        for (let j of v)
          is[i].jpname = is[i].jpname.replaceAll(j, (match) => `<span>${match}</span>`);
      }
    }
    a.href = '/stage.html?s=' + ms.join('-');
    a.innerHTML = is.map(x => x.name ? (x.jpname ? `${x.name}(${x.jpname})` : x.name) : x.jpname).join(' • ');
    a.classList.add('res');
    search_result.appendChild(a);
  }
  main_div.style.display = 'none';
  search_result.style.display = 'block';
  const s1 = fs.readdirSync('/stages');
  let num_results = 0;
  for (let i = 0;i < s1.length;++i) {
    const m1 = s1[i];
    if (m1 == 'group') continue;
    const i1 = JSON.parse(fs.readFileSync(`/stages/${m1}/info`, 'utf-8', 'r'));
    if (f(i1.name) || f(i1.jpname)) {
      add([i], [i1]);
      if (++num_results > 20) return;
    }
    const s2 = fs.readdirSync(`/stages/${m1}`);
    for (let j = 0;j < s2.length;++j) {
      const m2 = s2[j];
      if (m2 == 'info') continue;
      const i2 = JSON.parse(fs.readFileSync(`/stages/${m1}/${m2}/info`, 'utf-8', 'r'));
      if (f(i2.name) || f(i2.jpname)) {
        add([i, j], [i1, i2]);
        if (++num_results > 20) return;
      }
      const s3 = fs.readdirSync(`/stages/${m1}/${m2}`);
      for (let k = 0;k < s3.length;++k) {
        const m3 = s3[k];
        if (m3 == 'info') continue;
        const i3 = JSON.parse(fs.readFileSync(`/stages/${m1}/${m2}/${m3}`, 'utf-8', 'r'));
        if (f(i3.name) || f(i3.jpname)) {
          add([i, j, k], [i1, i2, i3]);
          if (++num_results > 20) return;
        }
      }
    }
  }
  if (!num_results)
    search_result.innerText = '沒有結果';
}
