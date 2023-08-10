var stage_name = '';
var fs;
const M1 = document.getElementById('M1');
const M2 = document.getElementById('M2');
const M3 = document.getElementById('M3');
const st1 = document.getElementById('st-1').children;
const st2 = document.getElementById('st-2').children;
const st3 = document.getElementById('st-3').children;
const st4 = document.getElementById('st-4').children;
const stName = document.getElementById('st-name');
const stName2 = document.getElementById('st-name2');
const stLines = document.getElementById('lines');
const main_div = document.getElementById('main');
const search_result = document.getElementById('search-result');
const m_drops = document.getElementById('drops');
const rewards = document.getElementById('rewards');
const m_times = document.getElementById('times');
const mM = document.getElementById('mM');
const ex_stages = document.getElementById('ex-stages');
var info1, info2, info3;
var enemy_names;
var star;
var char_groups;
var Buffer = BrowserFS.BFSRequire('buffer').Buffer;
const materialDrops = [85, 86, 87, 88, 89, 90, 91, 140, 187, 188, 189, 190, 191, 192, 193, 194];
BrowserFS.install(window);
const event_types = {"3":[1000,1001,1002,1003,1004,1250,1150,1151,1152,1073,1074,1075,1076,1077,1208,1269,1270,1271,1275,1276,1111,1112,1114,1184,1186,1192,1194,1197,1165,1166,1167,1168,1170,1171,1175,1140,1149,1154,1125,1160,1234,1235,1236,1237,24032,24033,24039,24040,24043,24044,24046,24047,24050,24051,24015,24016,24017,24018,24021,24022,24023,24024,24025,24026,24028,24029,24030,24031,7000,7001,7002,7003,7004,7005,7006,7007,7008,16000,33000,2066,2208,2209,27007,1343,1309,1182,1069,1120,1190,1287,1289,24053,24054,2100,2185,2089,27013,1344],"4":[1027,1028,1059,1124,1155,1319,1308,1033,1034,1035,1070,1079,1146,24049,2080],"5":[1097,1098,1099,1100,1101,1162,1222,1274,1118,1326,31000,31001,31002,1315,1316,1317,1318],"0":[1014,1016,1015,1043,1039,1066,1096,1122,1157,1189,1259,1095,1119,1117,1128,1158,1177,1215,1226,1246,1272,1217,1219,1220,1229,1231,1232,1273,1340,1017,1018,1019,1020,1021,1022,1023,1024,1025,1161,1277,1278,1279,1280,1011,1012,1013,1026,1029,1030,1031,1032,1036,1038,1009,1010,2006,1297,24042,1129,1164,1115,1174,1072,1325,2065,2205,2001,2002,2088,1348],"1":[1169,1172,1176,1185,1187,1193,1195,1196,1198,1247,1199,1201,1203,1205,1207,1214,1243,1296,1338,1102,1103,1104,1105,1106,1107,1108,1109,1110,1130,1131,1132,1133,1134,1135,1136,1137,1138,1045,1046,1047,1048,1049,1050,1051,1052,1053,1054,1055,1056,1057,1058,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1143,1144,1153,2037,1337,2206,2207,1342,2043,2044],"6":[24055,24020,24027,24034,24035,24037,24038,24061],"7":[1006,1007,1078,1173,1336],"-1":[1255,1256,1257,1258,1265,1266,1312,1313,1314,1333,1334,1335,1339,1251,1252,1253,1305,1306,1307,11000,11001,11002,11003,11004,11005,11006,11007,11008,11009,11011,11012,11013,11014,11015,11016,11017,11018,11019,11020,11021,11022,11023,11024,1345,1346,1347],"2":[1209],"8":[24052,24019]};
const hidden_groups = [
[25000, 25001, 25003],       
[25007, 25002, 25004],       
[25008, 25005, 25006],       
[25009, 25012, 25015, 25018, 25021, 25024, 25027],
[25010, 25013, 25016, 25019, 25022, 25025, 25028],
[25011, 25014, 25017, 25020, 25023, 25026, 25029],
[25063],           
[25064],           
[25065],           
[25030, 25051, 25052, 25053],     
[25031, 25054, 25055, 25056],     
[25032, 25057, 25058, 25059],     
[25060],           
[25061],           
[25062],           
[25066],
];
const mapConditions = {
    "1": {
        "name": "世界篇第一章"
    },
    "2": {
        "name": "世界篇第二章"
    },
    "3": {
        "name": "世界篇第三章"
    },
    "4": {
        "name": "未來篇第一章"
    },
    "5": {
        "name": "未來篇第二章"
    },
    "6": {
        "name": "未來篇第三章"
    },
    "7": {
        "name": "宇宙篇第一章"
    },
    "8": {
        "name": "宇宙篇第二章"
    },
    "9": {
        "name": "宇宙篇第三章"
    },
    "10": {
    "condition":[101017,-114024]
      },
    "11": {
    "condition":[101018,-114025]
      },
    "12": {
    "condition":[101019,-114026]
      },
    "13": {
    "condition":[101020,-114027]
      },
    "14": {
    "condition":[101021,-114028]
      },
    "15": {
    "condition":[101022,-114029]
      },
    "16": {
    "condition":[101023,-114030]
      },
    "17": {
    "condition":[101024,-114031]
      },
    "18": {
    "condition":[101025,-114032]
      },
    "19": {
    "name": "全狂亂貓關卡"
      },
    "21": {
    "name": "New Challenger全部關卡完成任意4關"
      },
    "30": {
    "condition":[101014,-114018]
      },
    "31": {
    "condition":[101015,-114019]
      },
    "32": {
    "condition":[101016,-114020]
      },
    "33": {
    "condition":[101039,-114021]
      },
    "34": {
    "condition":[101043,-114022]
      },
    "35": {
    "condition":[101066,-114023]
      },
    "36": {
    "condition":[101095,-114012]
      },
    "37": {
    "condition":[101117,-114013]
      },
    "38": {
    "condition":[101119,-114014]
      },
    "39": {
    "condition":[101128,-114015]
      },
    "40": {
    "condition":[101158,-114016]
      },
    "41": {
    "condition":[101177,-114017]
      },
    "42": {
    "condition":[101095,-201095]
      },
    "43": {
    "condition":[101117,-201117]
      },
    "44": {
    "condition":[101119,-201119]
      },
    "45": {
    "condition":[101128,-201128]
      },
    "46": {
    "condition":[101158,-201158]
      },
    "47": {
    "condition":[101177,-201177]
      },
    "48": {
    "condition":[101014,-201014]
      },
    "49": {
    "condition":[101015,-201015]
      },
    "50": {
    "condition":[101016,-201016]
      },
    "51": {
    "condition":[101039,-201039]
      },
    "52": {
    "condition":[101043,-201043]
      },
    "53": {
    "condition":[101066,-201066]
      },
    "54": {
    "condition":[101017,-201017]
      },
    "55": {
    "condition":[101018,-201018]
      },
    "56": {
    "condition":[101019,-201019]
      },
    "57": {
    "condition":[101020,-201020]
      },
    "58": {
    "condition":[101021,-201021]
      },
    "59": {
    "condition":[101022,-201022]
      },
    "60": {
    "condition":[101023,-201023]
      },
    "61": {
    "condition":[101024,-201024]
      },
    "62": {
    "condition":[101025,-201025]
      },
    "63": {
    "condition":[102065,102066,102205,102206]
      },
    "64": {
    "condition":[101095,-114012,101117,-114013]
      },
    "65": {
    "condition":[101119,-114014,101128,-114015]
      },
    "66": {
    "condition":[101158,-114016,101177,-114017]
      },
    "67": {
    "condition":[101257,101258,101266]
      },
    "68": {
    "condition":[101268]
      },
    "69": {
    "condition":[107000],
    "stage":39
      },
    "70": {
    "condition":[130000],
    "stage":29
      },
    "71": {
    "condition":[101128,-114015,101215,-114033]
      },
    "72": {
    "condition":[101119,-114014,101177,-114017]
      },
    "73": {
    "condition":[101095,-114012,101158,-114016]
      },
    "74": {
    "condition":[101215,-201215]
      },
    "75": {
    "condition":[101161,-201161]
      },
    "76": {
    "condition":[101096,-201096]
      },
    "77": {
    "condition":[101122,-201122]
      },
    "78": {
    "condition":[101189,-201189]
      },
    "79": {
    "condition":[101259,-201259]
      },
    "80": {
    "condition":[101226,-201226]
      },
    "81": {
    "condition":[101102,-201102]
      },
    "82": {
    "condition":[101103,-201103]
      },
    "83": {
    "condition":[101104,-201104]
      },
    "84": {
    "condition":[101105,-201105]
      },
    "85": {
    "condition":[101106,-201106]
      },
    "86": {
    "condition":[101107,-201107]
      },
    "87": {
    "condition":[101108,-201108]
      },
    "88": {
    "condition":[101109,-201109]
      },
    "89": {
    "condition":[101110,-201110]
      },
    "90": {
    "condition":[101157,-201157]
      },
    "91": {
    "condition":[101096,-114035]
      },
    "92": {
    "condition":[101122,-114036]
      },
    "93": {
    "condition":[101157,-114049]
      },
    "94": {
    "condition":[101189,-114037]
      },
    "95": {
    "condition":[101226,-114039]
      },
    "96": {
    "condition":[131000],
    "stage":3
      },
    "97": {
    "condition":[131001],
    "stage":3
      },
    "98": {
    "condition":[131002],
    "stage":3
      },
    "99": {
    "condition":[113047],
    "stage":4
      },
    "100": {
    "condition":[131000],
    "stage":9
      },
    "101": {
    "condition":[131001],
    "stage":9
      },
    "102": {
    "condition":[131002],
    "stage":9
      },
    "103": {
    "condition":[101130,101131,101132,101133,101134,101135,101136,101137,101138]
      },
    "104": {
    "condition":[101259,-114038]
      },
    "105": {
    "condition":[131000],
    "stage":15
      },
    "106": {
    "condition":[131001],
    "stage":15
      },
    "107": {
    "condition":[131002],
    "stage":15
      }
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
    const event_names = ["未分類","角色","進化權利","貓罐頭","道具","XP","進化素材","本能珠珠","貓咪券","活動券"];
    fs = BrowserFS.BFSRequire('fs');
    for (let x of Object.entries(event_types)) {
      const p = document.createElement('option');
      p.innerText = event_names[parseInt(x[0]) + 1];
      p.value = x[0];
      M1.appendChild(p);
    }
    char_groups = JSON.parse(fs.readFileSync('/stages/group', 'utf-8', 'r'));
    main();
  });
});
});
function main() {
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
}
function getConditionHTML(obj) {
  if (obj > 100000) {
    const x = Math.abs(obj) % 100000;
    const m = ~~(x / 1000);
    const s = x % 1000;
    const info = JSON.parse(fs.readFileSync(`/stages/${m}/${s}/info`));
    const a = document.createElement('a');
    const div = document.createElement('div');
    div.append('破完');
    a.href = `/stage.html?v=${m}-${s}`;
    a.innerText = info.name;
    div.appendChild(a);
    return div;
  } else {
    obj = mapConditions[obj];
    if (!obj) return document.createTextNode('???');
  }
  if (obj.hasOwnProperty('name'))
    return document.createTextNode(obj.name);
  if (obj.hasOwnProperty('stage')) {
    const x = Math.abs(obj.condition) % 100000;
    const m = ~~(x / 1000);
    const s = x % 1000;
    const info = JSON.parse(fs.readFileSync(`/stages/${m}/${s}/info`));
    const a = document.createElement('a');
    const div = document.createElement('div');
    div.append('破完');
    const st = obj.stage;
    a.innerText = info.name + '第' + (st + 1).toString() + '關';
    a.href = `/stage.html?v=${m}-${s}-${st}`;
    div.appendChild(a);
    return div;
  }
  const div = document.createElement('div');
  div.append('破完');
  let i = 0;
  for (const y of obj.condition) {
    const x = Math.abs(y) % 100000;
    const m = ~~(x / 1000);
    const s = x % 1000;
    const info = JSON.parse(fs.readFileSync(`/stages/${m}/${s}/info`));
    const a = document.createElement('a');
    a.href = `/stage.html?v=${m}-${s}`;
    a.innerText = info.name;
    if (i)
      div.append(y < 0 ? 'or' : '+');
    div.appendChild(a);
    ++i;
  }
  return div;
}
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
  M2.textContent = '';
  event_types[M1.selectedOptions[0].value].forEach(m1 => {
    const p = document.createElement('option');
    const mc = ~~(m1 / 1000);
    const m = m1 % 1000;
    try {
      p.innerText = JSON.parse(fs.readFileSync(`/stages/${mc}/${m}/info`)).name;
    } catch (e) { return; };
    M2.appendChild(p);
  });
  if (sts && sts.length > 1)
    M2.selectedIndex = sts[1];
  else
    M2.selectedIndex = 0;
  M2.oninput(null, sts);
}
M2.oninput = function(event, sts) {
  M3.textContent = '';
  const m = event_types[M1.selectedOptions[0].value][M2.selectedIndex];
  const dir = `/stages/${~~(m / 1000)}/${m % 1000}`;
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
  {
    const x = event_types[M1.selectedOptions[0].value][M2.selectedIndex];
    const mc = ~~(x / 1000);
    const m = x % 1000;
    info1 = JSON.parse(fs.readFileSync(`/stages/${mc}/info`));
    info2 = JSON.parse(fs.readFileSync(`/stages/${mc}/${m}/info`));
    info3 = JSON.parse(fs.readFileSync(`/stages/${mc}/${m}/0`));
  }
  const url = new URL(location.href);
  url.searchParams.set('s', [M1.selectedIndex, M2.selectedIndex, M3.selectedIndex].join('-'));
  if (info2.stars.length)
    star = Math.min(info2.stars.length, star);
  else
    star = 1;
  url.searchParams.set('star', star);
  history.pushState({}, "", url);
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
  if (info3.hasOwnProperty('nC') || info2.rM || info1.hasOwnProperty('gc') || info2.hasOwnProperty('gc') || info2.hasOwnProperty('wT') || info2.hasOwnProperty('hC')) {
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
      span.innerText = '掃蕩不可';
      th.appendChild(span);
    }
    if (info3.hasOwnProperty('nC')) {
      const span = document.createElement('div');
      span.style.color = '#ff634e';
      span.innerText = '接關不可';
      th.appendChild(span);
    }
    if (info2.hasOwnProperty('wT')) {
      const span = document.createElement('div');
      span.style.color = '#ff634e';
      span.innerText = '成功挑戰冷卻時長' + info2.wT.toString() + '分鐘';
      th.appendChild(span);
    }
    if (info2.hasOwnProperty('hC')) {
      const span = document.createElement('div');
      span.style.color = '#ff634e';
      span.innerText = '全破後隱藏';
      th.appendChild(span);
    }
    tr.appendChild(th);
    tr.id = 'warn-tr';
    stName.parentNode.parentNode.appendChild(tr);
  }
  rewards.textContent = '';
  if (info3.drop.length) {
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
      td1.appendChild(document.createTextNode(chances[i] + '%' + ((i == 0 && info3.drop[i][0] != 100 && info3.rand != -4) ? ' (寶雷)' : '')));
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
  mM.innerText = `抽選次數: ${~~Math.round(info3.mM * info2.mP[star - 1])}回`;
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
  st1[1].innerText = (M1.selectedOptions[0].value == '/stages/14') ? ('喵力達' + String.fromCharCode(65 + info3.e/1000) + '×' + (info3.e % 1000).toString()) : info3.e;
  st1[3].innerText = info3.max;
  st1[5].innerText = info3.len;
  if (info2.hasOwnProperty('mapcond')) {
    st4[1].textContent = '';
    st4[1].appendChild(getConditionHTML(info2.mapcond));
  } else {
    st4[1].textContent = '無限制';
  }
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
  if (info2.hasOwnProperty('stagecond')) {
    st4[3].textContent = '';
    st4[3].appendChild(getConditionHTML(info2.stagecond));
  } else {
    st4[3].textContent = '無限制';
  }
  if (!info3.xp) {
    if (M1.selectedIndex == 3)
      info3.xp = 1000 + Math.min(M3.selectedIndex, 47) * 300;
  }
  let totalXP = info3.xp * 4.7;
  if ([0, 9, 16].includes(M1.selectedIndex))
    totalXP *= 9;
  st3[1].innerText = `${info3.xp}(滿:${~~totalXP})`;
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
  st4[5].textContent = info2.hasOwnProperty('userrank') ? info2.userrank : '無限制';
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
      limits.push(`生產成本${lim.min}元與${lim.max}元之間`);
    else if (lim.max)
      limits.push(`生產成本${lim.max}元以下`);
    else if (lim.min)
      limits.push(`生產成本${lim.min}元以上`);
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
  ex_stages.textContent = '';
  if (info3.eC > 0) {
    const td = document.createElement('div');
    td.innerText = 'EX關卡(出現機率 ' + info3.eC + '%)';
    ex_stages.appendChild(td);
    for (let i = info3.eI;i <= info3.eA;++i) {
      const td = document.createElement('div');
      const info = JSON.parse(fs.readFileSync('/stages/4/' + info3.eM.toString() + '/' + i.toString(), 'utf-8', 'r'));
      const a = document.createElement('a');
      a.innerText = [info.name, info.jpname].join('/');
      a.href = '/stage.html?s=4-' + info3.eM.toString() + '-' + i.toString();
      td.appendChild(a);
      ex_stages.appendChild(td);
    }
  } else if (info3.hasOwnProperty('exS')) {
    const table = document.createElement('table');
    table.classList.add('w3-table', 'w3-centered');
    const tbody = document.createElement('tbody');
    const tr = document.createElement('tr');
    const td0 = document.createElement('td');
    const td1 = document.createElement('td');
    td0.innerText = 'EX關卡';
    td1.innerText = '機率';
    tr.appendChild(td0);
    tr.appendChild(td1);
    tbody.appendChild(tr);
    for (let i = 0;i < info3.exS.length;++i) {
      const s = info3.exS[i];
      const td0 = document.createElement('td');
      const td1 = document.createElement('td');
      const tr = document.createElement('tr');
      const a = document.createElement('a');
      const st = s % 100;
      const sm = ~~((s % 100000) / 100);
      const mc = ~~(s / 100000);
      const sts = [mc, sm, st];
      a.innerText = JSON.parse(fs.readFileSync(`/stages/${mc}/${sm}/${st}`)).name;
      a.href = `/stage.html?${mc}-${sm}-${st}`;
      td0.appendChild(a);
      td1.innerText = info3.exC[i].toFixed(1) + '%';
      tr.appendChild(td0);
      tr.appendChild(td1);
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    ex_stages.appendChild(table);
  } else if (info3.hasOwnProperty('enc')) {
    const table = document.createElement('table');
    table.classList.add('w3-table', 'w3-centered');
    const tbody = document.createElement('tbody');
    const tr = document.createElement('tr');
    const td0 = document.createElement('td');
    const td1 = document.createElement('td');
    td0.innerText = 'EX關卡';
    td1.innerText = '機率';
    tr.appendChild(td0);
    tr.appendChild(td1);
    tbody.appendChild(tr);
    for (let i = 0;i < info3.eni.length;++i) {
      const td0 = document.createElement('td');
      const td1 = document.createElement('td');
      const tr = document.createElement('tr');
      td1.innerText = info3.enc[i].toFixed(1) + '%';
      tr.appendChild(td0);
      tr.appendChild(td1);
      const groups = hidden_groups[info3.eni[i]];
      for (let j = 0;j < groups.length;++j) {
        const a = document.createElement('a');
        const mc = ~~(groups[j] / 1000);
        const sm = groups[j] % 1000;
        a.innerText = JSON.parse(fs.readFileSync(`/stages/${mc}/${sm}/info`)).name;
        a.href = `/stage.html?v=${mc}-${sm}`;
        const sts = [mc, sm];
        td0.appendChild(a);
        if (j != (groups.length - 1)) 
          td0.appendChild(document.createTextNode(' or '));
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    ex_stages.appendChild(table);
  }
  if (ex_stages.children.length)
    ex_stages.style.display = 'block';
  else
    ex_stages.style.display = 'none';
  for (let line of info3.l) {
    const tr = document.createElement('tr');
    const enemy = line[0];
    makeTd(tr, enemy_names[enemy] || '?');
    const img = new Image(85, 32);
    const a = document.createElement('a');
    let atkM = ((line[13] || 100) * mult).toFixed(0);
    let hpM = ((line[9] || 100) * mult).toFixed(0);
    a.href = `/enemy.html?id=${enemy}&mag=${hpM}&atkMag=${atkM}`;
    s = t3str(enemy);
    img.src = '/data/enemy/' + s + '/edi_' + s + '.png';
    const td = document.createElement('td');
    a.appendChild(img);
    td.appendChild(a);
    tr.appendChild(td);
    makeTd(tr, hpM == atkM ? (hpM + '%') : `HP:${hpM}%,ATK:${atkM}%`);
    makeTd(tr, line[1] || '無限');
    makeTd(tr, line[5].toString() + '%');
    if (line[3] > line[4]) {
      const tmp = line[3];
      line[3] = line[4];
      line[4] = tmp;
    }
    if (Math.abs(line[2]) >= Math.abs(line[10])) {
      makeTd(tr, line[2]);
    } else {
      makeTd(tr, `${line[2]}~${line[10]}`);
    }
    makeTd(tr, (line[1] == 1)  ? '-' : (line[3] == line[4] ? line[3] : `${line[3]}~${line[4]}`));
    makeTd(tr, line[14]);
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
window.onpopstate = main;
