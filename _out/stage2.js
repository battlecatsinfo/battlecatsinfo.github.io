const
	loader = document.getElementById('loader'),
	eggs = new Set([656,658,659,663,664,665,669,670,675,676,685,691,697,700,706,707,713,716,717,720,724,730,757,765]),

	stages_top = [
		"傳奇關卡", "特別關卡", "期間限定合作關卡", "主篇章", "EX關卡", "貓咪道場關卡", "貓咪塔", "排行關卡", "挑戰賽", "真傳奇關卡", "喵力達專用關卡", "強襲關卡", "發掘關卡", "合作強襲", "超獸討伐關卡", "地底迷宮", "傳奇故事0", "異次元競技場"
	],

	SI_TW_NAME = 0,
	SI_JP_NAME = 1,
	SI_XP = 2,
	SI_HEALTH = 3,
	SI_ENERGY = 4,
	SI_LEN = 5,
	SI_RAND = 6,
	SI_DROP = 7,
	SI_TIME = 8,
	SI_MAXMATERIAL = 9,
	SI_FLAGS = 10,
	SI_MAX = 11,
	SI_MIN_SPAWN = 12,
	SI_BG = 13,
	SI_ENEMY_LINES = 14,
	SI_EX_STAGE = 15,

	SM_TW_NAME = 0,
	SM_JP_NAME = 1,
	SM_STARS = 2,
	SM_MAPCOND = 3,
	SM_STAGECOND = 4,
	SM_MATERIALDROP = 5,
	SM_MULTIPLIER = 6,
	SM_FLAGS = 7,
	SM_WAITFORTIMER = 8,
	SM_RESETMODE = 9,
	SM_SPECIALCOND = 10,
	SM_INVALID_COMBO = 11,
	SM_LIMIT = 12,

	QQ = '？？？',
	event_types = [[1255,1256,1257,1258,1265,1266,1312,1313,1314,1333,1334,1335,1339,1251,1252,1253,1305,1306,1307,7000,7001,7002,7003,7004,7005,7006,7007,7008,7009,7011,7012,7013,7014,7015,7016,7017,7018,7019,7020,7021,7022,7023,7024,1345,1346,1347,7025,7026,7027,7028,1377,1378,1379],[1014,1016,1015,1043,1039,1066,1096,1122,1157,1189,1259,1095,1119,1117,1128,1158,1177,1215,1226,1246,1272,1217,1219,1220,1229,1231,1232,1273,1340,1017,1018,1019,1020,1021,1022,1023,1024,1025,1161,1277,1278,1279,1280,1011,1012,1013,1026,1029,1030,1031,1032,1036,1038,1009,1010,2006,1297,11042,1129,1164,1115,1174,1072,1325,2065,2205,2001,2002,2088,1348,2024,1281,2166,2168,2170,2126,2007,2008,1320,2021,2022,11064,2215,2216,1206,2092],[1169,1172,1176,1185,1187,1193,1195,1196,1198,1247,1199,1201,1203,1205,1207,1214,1243,1296,1338,1102,1103,1104,1105,1106,1107,1108,1109,1110,1130,1131,1132,1133,1134,1135,1136,1137,1138,1045,1046,1047,1048,1049,1050,1051,1052,1053,1054,1055,1056,1057,1058,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1143,1144,1153,2037,1337,2206,2207,1342,2043,2044,2025,2167,2204,2018,2046,2047,1350,1351,1352,1353,1354,1355,1356,1357,1358,1375,1381,2094,2095,1383],[1209,2210,1363,1288,1368,1370,1224],[1000,1001,1002,1003,1004,1250,1150,1151,1152,1073,1074,1075,1076,1077,1208,1269,1270,1271,1275,1276,1111,1112,1114,1184,1186,1192,1194,1197,1165,1166,1167,1168,1170,1171,1175,1140,1149,1154,1125,1160,1234,1235,1236,1237,11032,11033,11039,11040,11043,11044,11046,11047,11050,11051,11015,11016,11017,11018,11021,11022,11023,11024,11025,11026,11028,11029,11030,11031,6000,6001,6002,6003,6004,6005,6006,6007,6008,1000,15000,2066,2208,2209,13007,1343,1309,1182,1069,1120,1190,1287,1289,11053,11054,2100,2185,2089,13013,1344,2026,13011,2169,13000,2128,13005,2211,2086,13004,1261,1262,1263,1264,11056,1321,1361,1362,11058,1365,1366,11063,6009,11045,1290,1291,1292,13015,1300,1330,1301,1331,1302,1332,1303,1329,11014,11066,1369,2214,13016,2217,2218,13017,2219,1372,1373,1374,1376,17000,17001,13002,13003,17002,17003,17004],[1027,1028,1059,1124,1155,1319,1308,1033,1034,1035,1070,1079,1146,11049,2080,2078,2127,2163,2085,1260,1359,1360,1299,1267,1286,1249],[1097,1098,1099,1100,1101,1162,1222,1274,1118,1326,14000,14001,14002,1315,1316,1317,1318,1364,1367],[11055,11020,11027,11034,11035,11037,11038,11061,11065],[1006,1007,1078,1173,1336,1349],[11052,11019,11062,11041,11048,1298,1380,2093,11067,1382]],
	conditions = {"0":"通過前一個關卡","1":"通過世界篇第1章","2":"通過世界篇第2章","3":"通過世界篇第3章","4":"通過未來篇第1章","5":"通過未來篇第2章","6":"通過未來篇第3章","7":"通過宇宙篇第1章","8":"通過宇宙篇第2章","9":"通過宇宙篇第3章","10":{"condition":[101017,-114024]},"11":{"condition":[101018,-114025]},"12":{"condition":[101019,-114026]},"13":{"condition":[101020,-114027]},"14":{"condition":[101021,-114028]},"15":{"condition":[101022,-114029]},"16":{"condition":[101023,-114030]},"17":{"condition":[101024,-114031]},"18":{"condition":[101025,-114032]},"19":"通過狂亂貓咪降臨關卡(共9種)","20":"通過所有的傳奇故事","21":"通過New Challenger4個","25":"需要先達到等級排行1600以上","26":"通過3月・4月・5月活動3地圖","27":"通過6月・7月・8月活動3地圖","28":"通過9月・10月・11月活動3地圖","29":"通過12月・1月・2月活動3地圖","30":{"condition":[101014,-114018]},"31":{"condition":[101015,-114019]},"32":{"condition":[101016,-114020]},"33":{"condition":[101039,-114021]},"34":{"condition":[101043,-114022]},"35":{"condition":[101066,-114023]},"36":{"condition":[101095,-114012]},"37":{"condition":[101117,-114013]},"38":{"condition":[101119,-114014]},"39":{"condition":[101128,-114015]},"40":{"condition":[101158,-114016]},"41":{"condition":[101177,-114017]},"42":{"condition":[101095,-201095]},"43":{"condition":[101117,-201117]},"44":{"condition":[101119,-201119]},"45":{"condition":[101128,-201128]},"46":{"condition":[101158,-201158]},"47":{"condition":[101177,-201177]},"48":{"condition":[101014,-201014]},"49":{"condition":[101015,-201015]},"50":{"condition":[101016,-201016]},"51":{"condition":[101039,-201039]},"52":{"condition":[101043,-201043]},"53":{"condition":[101066,-201066]},"54":{"condition":[101017,-201017]},"55":{"condition":[101018,-201018]},"56":{"condition":[101019,-201019]},"57":{"condition":[101020,-201020]},"58":{"condition":[101021,-201021]},"59":{"condition":[101022,-201022]},"60":{"condition":[101023,-201023]},"61":{"condition":[101024,-201024]},"62":{"condition":[101025,-201025]},"63":"通過第4、第6、第9、第10使徒關卡","64":"通過”斷罪天使海蝶降臨”和”地獄門”","65":"通過”女帝飛來”和”亡者肥普降臨”","66":"通過”吉娃娃伯爵降臨”和”春宵苦短，少女做夢吧！”","67":{"condition":[101257,101258,101266]},"68":"通過時空的彎曲・解放的貓咪們2關卡","69":{"condition":[107000],"stage":39},"70":"通過魔界篇的\"魔界火山\"","71":"通過”藍色衝擊”和”亡者肥普降臨”","72":"通過”女帝飛來”和”春宵苦短，少女做夢吧！”","73":"通過”斷罪天使海蝶降臨”和”吉娃娃伯爵降臨”","74":{"condition":[101215,-201215]},"75":{"condition":[101161,-201161]},"76":{"condition":[101096,-201096]},"77":{"condition":[101122,-201122]},"78":{"condition":[101189,-201189]},"79":{"condition":[101259,-201259]},"80":{"condition":[101226,-201226]},"81":{"condition":[101102,-201102]},"82":{"condition":[101103,-201103]},"83":{"condition":[101104,-201104]},"84":{"condition":[101105,-201105]},"85":{"condition":[101106,-201106]},"86":{"condition":[101107,-201107]},"87":{"condition":[101108,-201108]},"88":{"condition":[101109,-201109]},"89":{"condition":[101110,-201110]},"90":{"condition":[101157,-201157]},"91":{"condition":[101096,-114035]},"92":{"condition":[101122,-114036]},"93":{"condition":[101157,-114049]},"94":{"condition":[101189,-114037]},"95":{"condition":[101226,-114039]},"96":{"condition":[131000],"stage":3},"97":{"condition":[131001],"stage":3},"98":{"condition":[131002],"stage":3},"99":{"condition":[113047],"stage":4},"100":{"condition":[131000],"stage":9},"101":{"condition":[131001],"stage":9},"102":{"condition":[131002],"stage":9},"103":{"condition":[101130,101131,101132,101133,101134,101135,101136,101137,101138]},"104":{"condition":[101259,-114038]},"105":{"condition":[131000],"stage":15},"106":{"condition":[131001],"stage":15},"107":{"condition":[131002],"stage":15},"108":"通過”甲普拉密林”的所有關卡","109":"通過”亞蜥比沙漠”的所有關卡","110":"","111":"","112":{"condition":[101350,101351,101352,101353,101354,101355,101356,101357,101358]},"113":"通過”奈落門”和”第一次的差事”","114":"通過”綺羅星汪汪降臨”和”死靈妖精海蝶降臨”","115":"通過”古王妃飛來”和”聖者波普降臨”","116":{"condition":[101199,101214]},"117":{"condition":[101207,101196]},"118":{"condition":[101201,101205]},"100000":"通過\"傳說的開始\"全關卡","100001":"通過\"熱情的國家\"全關卡","100002":"通過\"葡萄糖胺沙漠 \"全關卡","100003":"通過\"貓咪們渡海\"全關卡","100004":"通過\"凝視著貓眼石\"全關卡","100005":"通過\"西方街道\"全關卡","100006":"通過\"鮪魚海域\"全關卡","100007":"通過\"竹子島\"全關卡","100008":"通過\"黏糊糊的鐘乳洞\"全關卡","100009":"通過\"瓦魯肯諾火山\"全關卡","100010":"通過\"千里之道\"全關卡","100011":"通過\"鹹魚要塞\"全關卡","100012":"通過\"軍艦島\"全關卡","100013":"通過\"貓咪磨爪的走廊\"全關卡","100014":"通過\"帕德嫩神殿\"全關卡","100015":"通過\"退潮的海水浴場\"全關卡","100016":"通過\"惡魔島\"全關卡","100017":"通過\"越獄隧道\"全關卡","100018":"通過\"卡彭監獄\"全關卡","100019":"通過\"絲綢之路\"全關卡","100020":"通過\"通向黑暗的地下道\"全關卡","100021":"通過\"魔王的豪宅\"全關卡","100022":"通過\"終焉宣告之夜\"全關卡","100023":"通過\"大混戰\"全關卡","100024":"通過\"戰爭的傷痕\"全關卡","100025":"通過\"污染海洋的壞人\"全關卡","100026":"通過\"連接心身的東西\"全關卡","100027":"通過\"脆弱性和弱酸性\"全關卡","100028":"通過\"被引導的貓咪們\"全關卡","100029":"通過\"黑暗的國際城市\"全關卡","100030":"通過\"加拉・巴・哥\"全關卡","100031":"通過\"岩海苔半島\"全關卡","100032":"通過\"惡羅斯聯邦\"全關卡","100033":"通過\"亡者聚集之地\"全關卡","100034":"通過\"孤島大瘟疫\"全關卡","100035":"通過\"迪死你樂園\"全關卡","100036":"通過\"豪來塢帝國\"全關卡","100037":"通過\"小跟班海岸\"全關卡","100038":"通過\"雲泥溫泉鄉\"全關卡","100039":"通過\"濃濃春色島\"全關卡","100040":"通過\"IT地下墓穴\"全關卡","100041":"通過\"怪展會之畫\"全關卡","100042":"通過\"22區\"全關卡","100043":"通過\"超越大草原\"全關卡","100044":"通過\"暴風雪車道\"全關卡","100045":"通過\"奇點村\"全關卡","100046":"通過\"最終大陸\"全關卡","100047":"通過\"傳說的終點\"全關卡","100048":"通過\"古代研究所\"全關卡","101009":"通過勞動感謝特別活動！","101010":"通過聖誕節居然來了！","101011":"通過新年快樂？","101012":"通過被召喚的福！","101013":"通過人偶架上的戰士們","101014":"通過紅色突變關卡","101026":"通過春天來了!高校教師","101029":"通過相思病戀歌","101030":"通過禁斷之妻","101031":"通過因為夏天喵！","101032":"通過返鄉熱潮！","101036":"通過在鎮上看到的超強老人","101038":"秋天運動會！通過","101165":"通過續・禁斷之妻全關卡","101166":"通過因為超級夏天喵！全關卡","101167":"通過收假熱潮！全關卡","101168":"通過在鎮上看到的超強老人2全關卡","101170":"通過夜間運動會！全關卡","101171":"通過工作方式大革命全關卡","101175":"通過宇宙中聖誕節居然也來了！全關卡","101184":"通過新年快樂了？全關卡","101186":"通過再次被召喚的福！全關卡","101192":"通過人偶架上的戰士們特別版全關卡","101194":"通過新・春天來了!高校教師全關卡","101196":"通過所有的絕・斷罪天使海蝶降臨關卡","101197":"通過再一次的相思病戀歌全關卡","101199":"通過絕・地獄門全關卡","101201":"通過絕・女帝飛來","101205":"通過絕・亡者肥普降臨","101207":"通過絕・吉娃娃伯爵降臨","101214":"通過\"絕・春宵苦短，少女做夢吧！\"全關卡","101262":"通過熱血！兩人三腳賽 低學年","101263":"通過熱血！兩人三腳賽 中學年","101290":"通過後輩送的本命巧克力","101291":"通過前輩送的本命巧克力","101300":"通過Weekend～告白～","101301":"通過Weekend～告白～","101302":"通過Weekend～告白～","101303":"通過Season4～畢業之日～","101312":"通過密林的異變","101313":"通過沙漠的怪事","101314":"通過火山的威脅","101315":"通過蟲蟲王者相撲 預賽","101316":"通過蟲蟲王者相撲 半準決賽","101317":"通過蟲蟲王者相撲 準決賽","101333":"通過密林的異變Ⅱ","101334":"通過沙漠的怪事Ⅱ","101335":"通過火山的威脅Ⅱ","101345":"通過密林的異變Ⅲ","101346":"通過沙漠的怪事Ⅲ","101347":"通過火山的威脅Ⅲ","102035":"通過魔女之夜","102210":"通過週末演唱會 第1天","113000":"通過真・傳說的開始","999999":"目前的版本只能挑戰到這裡喵。等待下次的更新吧！"},
	M1 = document.getElementById("M1"),
	M2 = document.getElementById("M2"),
	M3 = document.getElementById("M3"),
	st1 = document.getElementById("st-1").children,
	st2 = document.getElementById("st-2").children,
	st3 = document.getElementById("st-3").children,
	stName = document.getElementById("st-name"),
	stName2 = document.getElementById("st-name2"),
	stLines = document.getElementById("lines"),
	main_div = document.getElementById("main"),
	search_result = document.getElementById("search-result"),
	m_drops = document.getElementById("drops"),
	rewards = document.getElementById("rewards"),
	m_times = document.getElementById("times"),
	mM = document.getElementById("mM"),
	ex_stages = document.getElementById("ex-stages"),
	stageL = parseInt(localStorage.getItem('stagel') || '0', 10),
	materialDrops = [85, 86, 87, 88, 89, 90, 91, 140, 187, 188, 189, 190, 191, 192, 193, 194];
var
	db, info2, info3, star, char_groups, stageF, _l_f;

_l_f = localStorage.getItem('prec');
if (_l_f) {
	_l_f = parseInt(_l_f);
} else {
	_l_f = 2;
}
_l_f = new Intl.NumberFormat(undefined, {
	'maximumFractionDigits': _l_f
});

if (localStorage.getItem('stagef') == 's')
	stageF = new Intl.NumberFormat(undefined, {
		maximumFractionDigits: 2
	});

function fromV(s) {
	switch (s) {
		case 0:
		case 1:
		case 2:
		case 3:
		case 4:
			return s;
		case 6:
			return 5;
		case 7:
			return 6;
		case 11:
			return 7;
		case 12:
			return 8;
		case 13:
			return 9;
		case 14:
			return 10;
		case 24:
			return 11;
		case 25:
			return 12;
		case 27:
			return 13;
		case 31:
			return 14;
		case 33:
			return 15;
		case 34:
			return 16;
		case 36:
			return 17;
		default:
			return 1;
	}
}

function namefor(str) {
	let i = str.indexOf('\t');
	const s = str.slice(0, i);
	if (s)
		return s;
	i += 1;
	return str.slice(i, str.indexOf('\t', i)) || QQ;
}

function createReward(tr, v) {
	var td = document.createElement("td");
	var td1 = document.createElement('td');
	if (v.length != 3) {
		var img = new Image(104, 79);
		img.style.maxWidth = "3em";
		img.style.height = 'auto';
		td1.appendChild(img);
		const S = v[4];
		if (v[3].endsWith("的權利")) {
			img.src = `/img/u/${S}/2.png`;
		} else {
			if (eggs.has(parseInt(S)))
				img.src = '/img/s/0/0.png';
			else
				img.src = `/img/u/${S}/0.png`;
		}
		var a = document.createElement("a");
		a.href = "/unit.html?id=" + S;
		a.textContent = v[3];
		a.style.verticalAlign = 'center';
		td.appendChild(a);
	} else {
		var img = new Image(128, 128);
		img.style.maxWidth = "2.7em";
		img.style.height = 'auto';
		td1.appendChild(img);
		var rw = parseInt(v[1], 10);
		var span = document.createElement('span');
		span.style.verticalAlign = 'center';
		span.textContent = char_groups['RWNAME'][rw].concat(' ×', v[2] > 1000 ? numStr(v[2]) : v[2]);
		if (rw <= 13 && rw >= 11)
			rw += 9;
		img.src = `/img/r/${rw}.png`;
		td.appendChild(span);
	}
	tr.appendChild(td);
	tr.appendChild(td1);
}

function numStr(num) {
	return _l_f.format(num);
}

function TI(t) {
	return stageF ? stageF.format(t / 30) + 's' : t.toString();
}

function TI2(t) {
	if (stageF)
		return stageF.format(parseInt(t, 10) / 30) + 's';
	return t;
}

function initUI() {
	var prev = document.getElementById('prev');
	prev.onclick = function() {
		if (M3.selectedIndex) {
			M3.selectedIndex -= 1;
			M3.oninput();
		} else if (M2.selectedIndex) {
			M2.selectedIndex -= 1;
			M2.oninput();
		} else {
			alert('沒有上一關了！');
		}
	};
	prev.nextElementSibling.onclick = function() {
		if ((M3.selectedIndex + 2) <= M3.options.length) {
			M3.selectedIndex += 1;
			M3.oninput();
		} else if ((M2.selectedIndex + 2) <= M2.options.length) {
			M2.selectedIndex += 1;
			M2.oninput();
		} else {
			alert('沒有下一關了！');
		}
	};
	handle_url();
}

function handle_url() {
	var url = new URL(location.href);
	var Q = url.searchParams.get('q');
	if (Q) {
		loader.style.display = 'none';
		loader.previousElementSibling.style.display = 'none';
		doSearch({
			'value': Q
		});
		document.getElementById("form").firstElementChild.value = Q;
		return;
	}
	var stars = url.searchParams.get("star");
	if (stars) {
		star = parseInt(stars, 10);
		if (isNaN(star) || star <= 0 || star > 4)
			star = 1;
	} else {
		star = 1;
	}
	let sts;
	let st = url.searchParams.get("s");
	if (st)
		sts = st.split("-").map(x => parseInt(x, 10));
	M1.oninput(null, sts);
	loader.style.display = 'none';
	loader.previousElementSibling.style.display = 'none';
	main_div.style.display = "block";
}

function getConditionHTML(obj) {
	obj = parseInt(obj, 36);
	if (obj > 100000) {
		const x = Math.abs(obj) % 100000;
		const mc = fromV(~~(x / 1000));
		const sm = x % 1000;
		const a = document.createElement("a");
		const div = document.createElement("div");
		db.transaction('map').objectStore('map').get(mc * 1000 + sm).onsuccess = function(e) {
			a.textContent = namefor(e.target.result);
		}
		div.append("通過");
		a.href = `/stage.html?s=${mc}-${sm}`;
		div.appendChild(a);
		return div;
	} else {
		obj = conditions[obj];
		if (!obj) return document.createTextNode(QQ);
	}
	if (typeof obj == "string") return document.createTextNode(obj);
	if (obj.hasOwnProperty("stage")) {
		const x = Math.abs(obj.condition) % 100000;
		const mc = fromV(~~(x / 1000));
		const sm = x % 1000;
		const a = document.createElement("a");
		const div = document.createElement("div");
		div.append("通過");
		db.transaction('map').objectStore('map').get(mc * 1000 + sm).onsuccess = function(e) {
			a.textContent = namefor(e.target.result) + a.n;
		}
		a.href = `/stage.html?${mc}-${sm}`;
		const st = obj.stage;
		a.n = "第" + (st + 1).toString() + "關";
		div.appendChild(a);
		return div;
	}
	const div = document.createElement("div");
	let i = 0;
	let last = 0;
	for (const y of obj.condition) {
		const ay = Math.abs(y);
		const x = ay % 100000;
		const mc = fromV(~~(x / 1000));
		const sm = x % 1000;
		const a = document.createElement("a");
		a.href = `/stage.html?v=${mc}-${sm}`;
		db.transaction('map').objectStore('map').get(mc * 1000 + sm).onsuccess = function(e) {
			a.textContent = namefor(e.target.result);
		}
		if (i) div.append(Math.sign(y) != Math.sign(last) ? "或" : "及");
		div.append(ay > 200000 ? "通過" : "玩過");
		div.appendChild(a);
		++i;
		last = y;
	}
	return div;
}

function merge(g1, g2) {
	var group = [g1[0],
		[...g1[1]]
	];
	if (g1[0] == 0 && g2[0] == 0) {
		group[1] = [];
		for (var _i = 0, _a = g1[1]; _i < _a.length; _i++) {
			var x = _a[_i];
			if (g2[1].includes(x))
				group[1].push(x);
		}
	} else if (g1[0] == 0 && g2[0] == 2) {
		group[1] = group[1].filter(function(x) {
			return g2[1].includes(x);
		});
	} else if (g1[0] == 2 && g2[0] == 0) {
		group[0] = 0;
		for (var _b = 0, _c = g2[1]; _b < _c.length; _b++) {
			var x = _c[_b];
			if (!group[1].includes(x))
				group[1].push(x);
		}
		group[1] = group[1].filter(function(x) {
			return g1[1].includes(x);
		});
	} else if (g1[0] == 2 && g2[0] == 2) {
		for (var _d = 0, _e = g2[1]; _d < _e.length; _d++) {
			var x = _e[_d];
			if (!group[1].includes(x))
				group[1].push(x);
		}
	}
	return group;
}

function getRarityString(rare) {
	var names = ["基本", "EX", "稀有", "激稀有", "超激稀有", "傳説稀有"];
	var strs = [];
	var y = 0;
	for (var i = 1; i < 64; i <<= 1) {
		if (rare & i)
			strs.push(names[y]);
		++y;
	}
	return strs.join("，");
}
class Limit {
	constructor(x) {
		if (x != undefined) {
			let strs = x.split(',');
			this.star = parseInt(strs[0], 10);
			this.sid = parseInt(strs[1], 10);
			this.rare = parseInt(strs[2], 10);
			this.num = parseInt(strs[3], 10);
			this.line = parseInt(strs[4], 10);
			this.min = parseInt(strs[5], 10);
			this.max = parseInt(strs[6], 10);
			this.group = char_groups[parseInt(strs[7], 10)];
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
		if (this.rare == 0) this.rare = other.rare;
		else if (other.rare != 0) this.rare &= other.rare;
		if (this.num * other.num > 0) this.num = Math.min(this.num, other.num);
		else this.num = Math.max(this.num, other.num);
		this.line |= other.line;
		this.min = Math.max(this.min, other.min);
		this.max = this.max > 0 && other.max > 0 ? Math.min(this.max, other.max) : this.max + other.max;
		if (other.hasOwnProperty("group")) {
			if (this.hasOwnProperty("group")) {
				this.group = merge(this.group, other.group);
			} else {
				this.group = other.group;
			}
		}
	}
}

function set_name(e) {
	e.target.o.textContent = namefor(e.target.result);
}
M1.oninput = (function(event, sts) {
	var o, req;

	if (sts && sts.length)
		M1.selectedIndex = sts[0];

	M2.length = "";

	for (const map_code of event_types[M1.selectedIndex]) {
		o = document.createElement('option');
		M2.appendChild(o);
		req = db.transaction('map').objectStore('map').get(map_code);
		req.o = o;
		req.onsuccess = set_name;
	}
	if (sts && sts.length > 1)
		M2.selectedIndex = sts[1];
	M2.oninput(null, sts);
});

M2.oninput = (function(event, sts) {
	M3.length = '';
	if (sts && sts.length > 2)
		M3.q = sts[2];

	const start = event_types[M1.selectedIndex][M2.selectedIndex] * 1000;

	db.transaction('stage').objectStore('stage').openCursor(IDBKeyRange.bound(start, start + 1000, false, true)).onsuccess = function(e) {
		e = e.target.result;
		if (e) {
			var o = document.createElement('option');
			const i = e.value.indexOf('\t');
			if (M3.c == M3.q)
				M3.v = e.value;
			if (stageL) {
				const jp = e.value.slice(i + 1, e.value.indexOf('\t', i + 1));
				if (stageL == 1)
					o.textContent = jp || QQ;
				else
					o.textContent = [e.value.slice(0, i), jp].filter(x => x).join('/');
			} else {
				o.textContent = e.value.slice(0, i);
				if (!o.textContent)
					o.textContent = e.value.slice(i + 1, e.value.indexOf('\t', i + 1)) || QQ;
			}
			M3.appendChild(o);
			e.continue();
		} else {
			M3.selectedIndex = M3.q;
			M3.oninput();
		}
	}
});

function makeTd(p, txt) {
	var td = document.createElement("td");
	td.textContent = txt;
	p.appendChild(td);
}

function parse_drop(D) {
	return D.split('|').map(function(x) {
		return x.split(',');
	});
}

function getDropData(drops) {
	var res = [];
	var sum = 0;
	var ints = [];
	for (var _i = 0, drops_1 = drops; _i < drops_1.length; _i++) {
		var d = drops_1[_i];
		ints.push(parseInt(d[0], 10));
	}
	for (var _a = 0, ints_1 = ints; _a < ints_1.length; _a++) {
		var x = ints_1[_a];
		sum += x;
	}
	if (sum == 1e3) {
		for (var _b = 0, ints_2 = ints; _b < ints_2.length; _b++) {
			var x = ints_2[_b];
			res.push(numStr(x / 10));
		}
	} else if (info3[SI_RAND] == '-3') {
		var c = Math.floor(100 / drops.length).toString();
		for (var _c = 0, ints_3 = ints; _c < ints_3.length; _c++) {
			var x = ints_3[_c];
			res.push(c);
		}
	} else if (sum == 100) {
		for (var _d = 0, ints_4 = ints; _d < ints_4.length; _d++) {
			var x = ints_4[_d];
			res.push(x.toString());
		}
	} else if (sum > 100 && (info3[SI_RAND] == '0' || info3[SI_RAND] == '1')) {
		var rest = 100;
		if (ints[0] == 100) {
			res.push("100");
			for (var i = 1; i < ints.length; ++i) {
				var filter = rest * ints[i] / 100;
				rest -= filter;
				res.push(numStr(filter));
			}
		} else {
			for (var _e = 0, ints_5 = ints; _e < ints_5.length; _e++) {
				var x = ints_5[_e];
				var filter = rest * x / 100;
				rest -= filter;
				res.push(numStr(filter));
			}
		}
	} else if (info3[SI_RAND] == '-4') {
		for (var _f = 0, ints_6 = ints; _f < ints_6.length; _f++) {
			var x = ints_6[_f];
			res.push(numStr(x * 100 / sum));
		}
	} else {
		for (var _g = 0, ints_7 = ints; _g < ints_7.length; _g++) {
			var x = ints_7[_g];
			res.push(x.toString());
		}
	}
	return res;
}
M3.oninput = function() {
	const key = event_types[M1.selectedIndex][M2.selectedIndex];
	const req = db.transaction('stage').objectStore('stage').get(key * 1000 + M3.selectedIndex);
	req.k = key;
	req.onsuccess = function(e) {
		info3 = e.target.result.split('\t');
		db.transaction('map').objectStore('map').get(e.target.k).onsuccess = render_stage;
	}
}

function render_stage(e) {
	info2 = e.target.result.split('\t');

	const flags2 = parseInt(info2[SM_FLAGS] || '0', 36);
	const flags3 = parseInt(info3[SI_FLAGS] || '0', 36);
	const stars_str = info2[SM_STARS] ? info2[SM_STARS].split(',') : [];
	const url = x = new URL(location.protocol + '//' + location.host + location.pathname);

	if (star != 1 || (M2.selectedIndex + M1.selectedIndex + M3.selectedIndex)) {
		url.searchParams.set("s", [M1.selectedIndex, M2.selectedIndex, M3.selectedIndex].join("-"));
		if (stars_str.length)
			star = Math.min(stars_str.length, star);
		else
			star = 1;
		if (star != 1)
			url.searchParams.set("star", star.toString());
		history.pushState({}, "", url);
	}


	stName.textContent = [info2[SM_TW_NAME] || QQ, info3[SI_TW_NAME] || QQ].join(" - ");
	stName2.textContent = [info2[SM_JP_NAME] || QQ, info3[SI_JP_NAME] || QQ].join(" - ");
	document.title = (info2[SI_TW_NAME] || info2[SI_JP_NAME] || QQ) + ' - ' + (info3[SI_TW_NAME] || info3[SI_JP_NAME] || QQ);

	var stars_tr = document.getElementById("stars-tr");
	if (stars_tr)
		stars_tr.parentNode.removeChild(stars_tr);

	var warn_tr = document.getElementById("warn-tr");
	if (warn_tr)
		warn_tr.parentNode.removeChild(warn_tr);

	var limit_bt = document.getElementById("limit-bt");
	if (limit_bt)
		limit_bt.parentNode.removeChild(limit_bt);

	var mult = 100;
	if (stars_str.length) {
		mult = parseInt(stars_str[star - 1], 10);
		var tr = document.createElement("tr");
		var th = document.createElement("th");
		th.colSpan = 6;
		for (let i = 0; i < stars_str.length; ++i) {
			var a = document.createElement("span");
			a.classList.add("a");
			a.textContent = (i + 1).toString() + "★: " + stars_str[i] + "%";
			url.searchParams.set("star", (i + 1).toString());
			a.href = url.href;
			a.i = i;
			a.onclick = function() {
				star = this.i + 1;
				M3.oninput();
				return false;
			};
			if (!star && !i || star - 1 == i)
				a.classList.add('A');
			th.appendChild(a);
		}
		tr.appendChild(th);
		tr.id = "stars-tr";
		stName.parentNode.parentNode.appendChild(tr);
	}
	if (info3[SI_FLAGS] || info2[SM_RESETMODE] || info2[SM_WAITFORTIMER] || info2[SM_FLAGS] || info2[SM_SPECIALCOND]) {
		var s;
		var tr = document.createElement("tr");
		var th = document.createElement("th");
		tr.style.fontSize = "larger";
		th.colSpan = 6;
		if (info2[SM_RESETMODE]) {
			var span = document.createElement("div");
			span.textContent = ["過關獎勵將會在再次出現時重置", "清除狀況將會在再次出現時重置", "可過關次數將會在再次出現時重置"][info2[SM_RESETMODE].charCodeAt(0) - 48];
			span.classList.add('I');
			th.appendChild(span);
		}
		if (info2[SM_WAITFORTIMER]) {
			var span = document.createElement("div");
			span.classList.add('W');
			span.textContent = "成功挑戰冷卻時長：" + info2[SM_WAITFORTIMER];
			th.appendChild(span);
		}

		if (flags2 & 1) {
			var span = document.createElement("div");
			span.classList.add('I');
			span.textContent = "全破後隱藏";
			th.appendChild(span);
		}
		if (flags2 & 2) {
			var span = document.createElement("div");
			span.classList.add('W');
			span.textContent = "※掃蕩不可※";
			th.appendChild(span);
		}

		if (flags3 & 1) {
			var span = document.createElement("div");
			span.classList.add('w');
			span.textContent = "※接關不可※";
			th.appendChild(span);
		}
		if (flags3 & 2) {
			var span = document.createElement("div");
			span.classList.add('w');
			span.textContent = "※速攻不可（城堡盾）※";
			th.appendChild(span);
		}
		if (info2[SM_SPECIALCOND]) {
			var span = document.createElement("div");
			span.classList.add('w');
			span.textContent = info2[SM_SPECIALCOND];
			th.appendChild(span);
			if (info2[SM_INVALID_COMBO]) {
				span = document.createElement("div");
				span.classList.add('W');
				span.textContent = info2[SM_INVALID_COMBO];
				th.appendChild(span);
			}
		}
		tr.appendChild(th);
		tr.id = "warn-tr";
		stName.parentNode.parentNode.appendChild(tr);
	}
	rewards.textContent = "";
	if (info3[SI_DROP]) {
		var drop_data = parse_drop(info3[SI_DROP]);
		var chances = getDropData(drop_data);
		var once = true;
		for (var i = 0; i < drop_data.length; ++i) {
			if (!parseInt(chances[i], 10))
				continue;
			var v = drop_data[i];
			var tr = document.createElement("tr");
			var td1 = document.createElement("td");
			var td2 = document.createElement("td");
			td1.appendChild(document.createTextNode(chances[i] + "%" + (i == 0 && v[0] != '100' && info3[SI_RAND] != '-4' ? " （寶雷）" : "")));
			td2.textContent = i == 0 && (info3[SI_RAND] == '1' || parseInt(drop_data[0][1], 10) >= 1e3 && parseInt(drop_data[0][1], 10) < 3e4) ? "一次" : "無";
			createReward(tr, v);
			tr.appendChild(td1);
			tr.appendChild(td2);
			rewards.appendChild(tr);
		}
	}
	if (rewards.children.length)
		rewards.parentNode.style.display = "table";
	else
		rewards.parentNode.style.display = "none";
	m_drops.textContent = "";
	var material_drop = info2[SM_MATERIALDROP].split(',');
	for (var i = 1; i < material_drop.length; ++i) {
		const x = parseInt(material_drop[i], 36);
		if (x == '0')
			continue;
		var img = new Image(128, 128);
		var rw = materialDrops[i - 1];
		img.style.maxWidth = "2.7em";
		img.style.height = 'auto';
		img.src =`/img/r/${rw}.png`;
		var td2 = document.createElement('td');
		var tr = document.createElement("tr");
		var td0 = document.createElement("td");
		td0.textContent = char_groups['RWNAME'][rw];
		tr.appendChild(td0);
		td2.appendChild(img);
		tr.appendChild(td2);
		var td1 = document.createElement("td");
		td1.textContent = x + '%';
		tr.appendChild(td1);
		m_drops.appendChild(tr);
	}
	if (m_drops.children.length)
		m_drops.parentNode.style.display = "table";
	else
		m_drops.parentNode.style.display = "none";
	mM.textContent = "抽選次數：".concat(~~Math.round(parseInt(info3[SI_MAXMATERIAL], 10) * parseFloat(info2[SM_MULTIPLIER].split(',')[star - 1])), "回");
	if (info3[SI_TIME]) {
		m_times.textContent = "";
		var drop_data = parse_drop(info3[SI_TIME]);
		for (var _i = 0, drop_data_1 = drop_data; _i < drop_data_1.length; _i++) {
			var v = drop_data_1[_i];
			var tr = document.createElement("tr");
			var td1 = document.createElement("td");
			var td2 = document.createElement("td");
			td1.textContent = v[2];
			td2.textContent = v[0];
			createReward(tr, v);
			tr.appendChild(td1);
			tr.appendChild(td2);
			m_times.appendChild(tr);
		}
		m_times.parentNode.style.display = "table";
	} else {
		m_times.parentNode.style.display = "none";
	}
	const energy = parseInt(info3[SI_ENERGY], 36);
	if (M1.selectedIndex == 10) {
		st1[1].textContent = `喵力達${String.fromCharCode(65 + energy / 1000)} × ${energy % 1e3}`;
	} else {
		st1[1].textContent = energy > 1000 ? numStr(energy) : energy;
	}
	st1[3].textContent = info3[SI_MAX];
	st1[5].textContent = info3[SI_LEN];
	if (info2[SM_MAPCOND]) {
		st3[3].textContent = "";
		st3[3].appendChild(getConditionHTML(info2[SM_MAPCOND]));
	} else {
		st3[3].textContent = "無限制";
	}
	if (flags3 & 8) {
		st2[1].textContent = numStr(~~((parseInt(info3[SI_HEALTH], 10) * mult) / 100));
	} else {
		st2[1].textContent = numStr(parseInt(info3[SI_HEALTH], 10));
	}
	if (info2[SM_STAGECOND]) {
		st3[5].textContent = "";
		st3[5].appendChild(getConditionHTML(info2[SM_STAGECOND]));
	} else {
		st3[5].textContent = "無限制";
	}
	var xp = parseInt(info3[SI_XP], 36);
	switch (M1.selectedIndex) {
		case 3:
			st3[1].textContent = 1000 + Math.min(M3.selectedIndex, 47) * 300;
			break;
		case 0:
		case 9:
		case 6:
			st3[1].textContent = numStr(~~(xp * 9 * 4.7));
			break;
		default:
			st3[1].textContent = numStr(~~(xp * 4.7));
	}

	st2[5].textContent = info3[SI_BG];
	st2[3].textContent = info3[SI_MIN_SPAWN] + 'F';
	if (info2[SM_LIMIT]) {
		const limits = info2[SM_LIMIT].split('|').map(x => Limit);
		const theStar = star - 1;
		var lim = new Limit();
		for (var _a = 0; _a < limits.length; _a++) {
			var l = limits[_a];
			if (l.star == -1 || l.star == theStar)
				if (l.sid == -1 || l.sid == M3.selectedIndex)
					lim.combine(l);
		}
		var limits_str = [];
		if (lim.rare)
			limits_str.push("稀有度:" + getRarityString(lim.rare));
		if (lim.num)
			limits_str.push("最多可出戰角色數量:" + lim.num);
		if (lim.max && lim.min)
			limits_str.push("生產成本".concat(lim.min, "元與").concat(lim.max, "元之間"));
		else if (lim.max)
			limits_str.push("生產成本".concat(lim.max, "元以下"));
		else if (lim.min)
			limits_str.push("生產成本".concat(lim.min, "元以上"));
		if (lim.line)
			limits_str.push("出陣列表:僅限第1頁");
		if (lim.group && lim.group[1].length)
			limits_str.push("可出擊角色的ID: " + lim.group[1].join("/"));
		if (limits_str.length) {
			var tr = document.createElement("tr");
			var th = document.createElement("th");
			var div = document.createElement("div");
			div.textContent = "※出擊限制※：" + limits_str.join("、");
			div.classList.add('W');
			tr.style.fontSize = "larger";
			th.colSpan = 6;
			th.appendChild(div);
			tr.appendChild(th);
			tr.id = "limit-bt";
			stName.parentNode.parentNode.appendChild(tr);
		}
	}
	ex_stages.textContent = "";
	let ex_stage_data = info3[SI_EX_STAGE];
	if (ex_stage_data) {
		ex_stages.style.display = 'block';
		ex_stage_data = ex_stage_data.split('$');
		if (ex_stage_data[0]) {
			const [exChance, exMapID, exStageIDMin, exStageIDMax] = ex_stage_data[0].split(',');
			const td = document.createElement("div");
			if (exStageIDMin != exStageIDMax)
				td.textContent = (exChance == '100' ? "必定出現以下EX關卡：（各EX關卡平分出現機率）" : "EX關卡：（出現機率：" + exChance + "%，各EX關卡平分出現機率）");
			else
				td.textContent = (exChance == '100' ? "必定出現以下EX關卡：" : 'EX關卡：' + "（出現機率：" + exChance + "%）");
			ex_stages.appendChild(td);
			const start = 4000000 + parseInt(exMapID, 10) * 1000;
			db.transaction('stage').objectStore('stage').openCursor(IDBKeyRange.bound(start + parseInt(exStageIDMin, 10), start + parseInt(exStageIDMax, 10))).onsuccess = function(e) {
				e = e.target.result;
				if (e) {
					const td = document.createElement("div");
					const a = document.createElement("a");
					const k = e.key - 4000000;
					const sm = ~~(k / 1000);
					const si = k - sm * 1000;
					a.textContent = namefor(e.value);
					a.onclick = function() {
						M1.oninput(null, [4, sm, si]);
						return false;
					}
					a.href = `/stage.html?s=4-${sm}-${si}`;
					td.appendChild(a);
					ex_stages.appendChild(td);
					e.continue();
				}
			}
		} else if (ex_stage_data[1]) {
			let [exStage, exChance] = ex_stage_data[1].split('|');
			const table = document.createElement("table");
			table.classList.add("w3-table", "w3-centered");
			const tbody = document.createElement("tbody");
			const tr = document.createElement("tr");
			const td0 = document.createElement("td");
			const td1 = document.createElement("td");
			td0.textContent = "EX關卡";
			td1.textContent = "機率";
			tr.appendChild(td0);
			tr.appendChild(td1);
			tbody.appendChild(tr);
			table.appendChild(tbody);
			exStage = exStage.split(',');
			exChance = exChance.split(',');
			for (let i = 0; i < exStage.length; ++i) {
				const s = parseInt(exStage[i], 36);
				const mc = ~~(s / 1000000);
				const st = s % 1000;
				const sm = ~~((s - mc * 1000000) / 1000);
				const td0 = document.createElement("td");
				const td1 = document.createElement("td");
				const tr = document.createElement("tr");
				const a = document.createElement("a");
				a.href = '/stage.html?s=' + (a.sts = [mc, sm, st]).join('-');
				db.transaction('stage').objectStore('stage').get(s).onsuccess = function(e) {
					a.textContent = namefor(e.target.result);
				};
				td0.appendChild(a);
				td1.textContent = exChance[i] + "%";
				tr.appendChild(td0);
				tr.appendChild(td1);
				tbody.appendChild(tr);
			}
			ex_stages.appendChild(table);
		}
	} else {
		ex_stages.style.display = 'none';
	}
	stLines.textContent = "";
	for (const line of info3[SI_ENEMY_LINES].split('|')) {
		const strs = line.split(',');
		const tr = document.createElement("tr");
		const a = document.createElement('a');
		const enemy = parseInt(strs[0], 36);
		const img = new Image(64, 64);
		const m = mult / 100;
		const td = document.createElement('td');
		let hpM, atkM;

		if (strs[7].includes('+'))
			[hpM, atkM] = strs[7].split('+');
		else
			hpM = atkM = strs[7];
		hpM = parseInt(hpM || '2s', 36);
		atkM = parseInt(atkM || '2s', 36);

		makeTd(tr, char_groups['ENAME'][enemy] || "?"); // enemy name

		img.src = `/img/e/${enemy}/0.png`;
		if (strs[6].length == 2) {
			hpM = ~~(hpM * m).toString() + '%';
			atkM = atkM.toString() + '%';
			a.href = `/enemy.html?id=${enemy}&mag=${hpM}&atkMag=${atkM}`;
		} else {
			a.href = `/enemy.html?id=${enemy}&mag=${hpM}&atkMag=${atkM}&stageMag=${mult}`;
			hpM = ~~(hpM * m).toString() + '%';
			atkM = ~~(atkM * m).toString() + '%';
		}
		a.appendChild(img);
		td.appendChild(a);
		tr.appendChild(td); // image
		makeTd(tr, hpM == atkM ? hpM : `HP:${hpM}, ATK:${atkM}`); // mag
		makeTd(tr, strs[1] || "無限"); // count
		makeTd(tr, strs[5] + '%'); // tower
		if (stageF)
			makeTd(tr, TI(strs[2]));
		else
			makeTd(tr, strs[2]);
		if (strs[3]) {
			if (strs[4])
				stageF ? makeTd(tr, TI(strs[3]) + '~' + TI(strs[4])) : makeTd(tr, strs[3] + '~' + strs[4]);
			else
				makeTd(tr, strs[3]);
		} else {
			makeTd(tr, '-');
		}
		makeTd(tr, strs[8] || '')
		if (strs[6].length == 2) {
			const span = document.createElement("span");
			span.textContent = "（敵塔）";
			span.classList.add("boss");
			tr.firstElementChild.appendChild(span);
		}
		if (strs[6][0] == '2') {
			const span = document.createElement("span");
			span.textContent = "（BOSS、震波）";
			span.classList.add("boss");
			tr.firstElementChild.appendChild(span);
		} else if (strs[6][0] == '1') {
			const span = document.createElement("span");
			span.textContent = "（BOSS）";
			span.classList.add("boss");
			tr.firstElementChild.appendChild(span);
		}
		stLines.appendChild(tr);
	}
};
document.getElementById("form").onsubmit = function(event) {
	event.preventDefault();
	setTimeout(doSearch, 0, event.currentTarget.firstElementChild);
	return false;
};

function add_result_stage(id, name, search_for) {
	name = name.replaceAll(search_for, x => '<span>' + x + '</span>');
	const a = document.createElement('a');
	a.classList.add("res");
	const mc = ~~(id / 1000000);
	const st = id % 1000;
	const sm = ~~((id - mc * 1000000) / 1000);
	a.href = `/stage.html?s=${mc}-${sm}-${st}`;
	a.id = id;
	search_result.appendChild(a);
	a.v = stages_top[mc] + ' - ';
	a.e = name;
	db.transaction('map').objectStore('map').get(mc * 1000 + sm).onsuccess = function(e) {
		e = e.target.result;
		a.innerHTML = a.v + namefor(e) + ' - ' + a.e;
	};
}

function add_result_map(id, name, search_for) {
	name = name.replaceAll(search_for, x => '<span>' + x + '</span>');
	const a = document.createElement('a');
	a.classList.add("res");
	const sm = id % 1000;
	const mc = ~~(id / 1000);
	a.href = `/stage.html?s=${mc}-${sm}`;
	a.id = id;
	search_result.appendChild(a);
	a.innerHTML = stages_top[mc] + ' - ' + name;
}

function doSearch(t) {
	const v = t.value.trim();
	if (!v) {
		search_result.style.display = 'none';
		main_div.style.display = 'block';
		return;
	}
	main_div.style.display = 'none';
	search_result.style.display = 'block';
	search_result.textContent = '';
	db.transaction('stage').objectStore('stage').openCursor().onsuccess = function(e) {
		e = e.target.result;
		if (e) {
			let i = e.value.indexOf('\t');
			let s = e.value.slice(0, i);
			if (s.includes(v))
				add_result_stage(e.key, s, v);
			else {
				i += 1;
				s = e.value.slice(i, e.value.indexOf('\t', i));
				if (s.includes(v))
					add_result_stage(e.key, s, v);
			}
			e.continue();
		} else {
			db.transaction('map').objectStore('map').openCursor(IDBKeyRange.lowerBound(0)).onsuccess = function(e) {
				e = e.target.result;
				if (e) {
					let i = e.value.indexOf('\t');
					let s = e.value.slice(0, i);
					if (s.includes(v))
						add_result_map(e.key, s, v);
					else {
						i += 1;
						s = e.value.slice(i, e.value.indexOf('\t', i));
						if (s.includes(v))
							add_result_map(e.key, s, v);
					}
					e.continue();
				} else {
					if (!search_result.textContent)
						search_result.textContent = "找不到名稱包含「" + v + "」的關卡";
				}
			}
		}
	}
}

function wait(tx) {
	return new Promise(function(resolve, reject) {
		tx.oncomplete = resolve;
		tx.onerror = reject;
	});
}
async function load_all() {
	let l, m, i = 0,
		c = 0;
	let res = await fetch('/map.tsv');
	if (!res.ok) throw '';
	let A = await res.text();
	let tx = db.transaction('map', 'readwrite');
	let store = tx.objectStore('map');

	O1:
		while (true) {
			while (c < 1000) {
				l = i;
				while (A[i] != '\t')
					++i;
				m = i;

				while (A[i] != '\n')
					++i;

				store.put(A.slice(m + 1, i), parseInt(A.slice(l, m), 36));

				if ((++i) >= A.length) {
					await wait(tx);
					break O1;
				}

				++c;
			}
			await wait(tx);
			c = 0;
			tx = db.transaction('map', 'readwrite');
			store = tx.objectStore('map');
		}

	c = 0;
	i = 0;
	A = null;
	res = await fetch('/stage.tsv');
	if (!res.ok) throw '';
	A = await res.text();
	tx = db.transaction('stage', 'readwrite');
	store = tx.objectStore('stage');
	O2:
		while (true) {
			while (c < 1000) {
				l = i;
				while (A[i] != '\t')
					++i;
				m = i;

				while (A[i] != '\n')
					++i;

				store.put(A.slice(m + 1, i), parseInt(A.slice(l, m), 36));

				if ((++i) >= A.length) {
					await wait(tx);
					break O2;
				}

				++c;
			}
			await wait(tx);
			c = 0;
			tx = db.transaction('stage', 'readwrite');
			store = tx.objectStore('stage');
		}
	A = null;
	res = await fetch("/group.json");
	if (!res.ok) throw '';
	char_groups = await res.json();
	res = await fetch("/reward.json");
	if (!res.ok) throw '';
	char_groups['RWNAME'] = await res.json();
	res = await fetch("/ENAME.txt");
	if (!res.ok) throw '';
	char_groups['ENAME'] = (await res.text()).split('\n');
	char_groups['ver'] = 13601;
	db.transaction('map', 'readwrite').objectStore('map').put(char_groups, -1).onsuccess = initUI;
}
const req = indexedDB.open('stage_v2');
req.onupgradeneeded = function(e) {
	db = e.target.result;
	if (!db.objectStoreNames.contains('map'))
		db.createObjectStore("map");
	if (!db.objectStoreNames.contains('stage'))
		db.createObjectStore("stage");
}
req.onsuccess = function(e) {
	db = e.target.result;
	db.transaction("map").objectStore("map").get(-1).onsuccess = function(e) {
		char_groups = e.target.result;
		if (char_groups && char_groups['ver'] == 13601)
			initUI();
		else
			load_all();
	}
}
