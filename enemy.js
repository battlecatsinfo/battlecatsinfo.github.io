const my_params = new URLSearchParams(location.search);
let my_id = parseInt(my_params.get('id'));
if (isNaN(my_id)) {
	alert('Missing enemy id in URL query!');
	window.stop()
	throw '';
}
my_id += 2;
var my_mult = my_params.get('mult') || my_params.get('mag');
const enemy_content = document.getElementById('ctn');
function createAbIcons(E, parent) {
	createImuIcons(E.imu, parent);
	function write(s, icon) {
		if (icon) {
			const e = document.createElement('span');
			e.classList.add('bc-icon', `bc-icon-${icon}`);
			parent.appendChild(e);
		}
		const e2 = document.createElement('span');
		e2.innerText = s;
		parent.appendChild(e2);
		parent.appendChild(document.createElement('br'));
	}
	for (let i of Object.entries(E.ab)) {
		const d = i[1];
		switch (parseInt(i[0])) {
		case AB_KB: write(`${d[0]}%機率擊退`, 'kb'); break;
		case AB_STOP: write(`${d[0]}%機率暫停持續${numStrT(d[1])}`, 'stop'); break;
		case AB_SLOW: write(`${d[0]}%機率緩速持續${numStrT(d[1])}`, 'slow'); break;
		case AB_CRIT: write(`${d[0]}%機率爆擊`, 'crit'); break;
		case AB_ATKBASE: write(`對塔傷害四倍`, 'atkbase'); break;
		case AB_WAVE: write(`${d[0]}%機率釋放Lv${d[1]}波動`, 'wave'); break;
		case AB_MINIWAVE: write(`${d[0]}%機率釋放Lv${d[1]}小波動`, 'wave'); break;
		case AB_WEAK: write(`${d[0]}%機率降低攻擊力至${d[2]}%持續${numStrT(d[1])}`, 'weak'); break;
		case AB_STRONG: write(`血量${d[0]}%以下攻擊力增加${d[1]}倍`, 'strong'); break;
		case AB_LETHAL: write(`${d[0]}%機率死後復活`, 'lethal'); break;
		case AB_WAVES: write(`波動滅止`, 'waves'); break;
		case AB_BURROW: write(`進入射程範圍時鑽地${numStrT(d[1])}(${d[0]}次)`); break;
		case AB_REVIVE: write(`擊倒後${numStrT(d[1])}以${d[1]}%血量復活(${d[0]}次)`); break;
		case AB_WARP: write(`${d[0]}%機率將向目標${d[2] < 0 ? '前' : '後'}傳送${Math.abs(d[2])}距離持續${numStrT(d[1])}`, 'warp'); break;
		case AB_CURSE: write(`${d[0]}%機率詛咒持續${numStrT(d[1])}`, 'curse'); break;
		case AB_S: write(`${d[0]}%機率渾身一擊(攻擊力增加${d[1]}%倍)`, 's'); break;
		case AB_IMUATK: write(`${d[0]}%機率攻擊無效持續${numStrT(d[1])}`, 'imu-atk'); break;
		case AB_SHIELD: write(`宇宙盾 ${d[0]}HP`, 'shield'); break;
		case AB_DSHIELD: write(`惡魔盾 ${d[0]} HP，KB時惡魔盾恢復${d[1]}%`); break;
		case AB_COUNTER: write('烈波反擊'); break;
		case AB_POIATK: 
			{
				const img = document.createElement('img');
				img.src = './data/page/icons/BCPoison.png';
				parent.appendChild(img);
				write(`${d[0]}%機率毒擊(造成角色血量${(d[1])}%傷害)`);
				break;
			}
		case AB_VOLC: write(`${d[0]}%機率放出Lv${d[3]}烈波(出現位置${d[1]}~${d[2]}，持續${d[3]*20}f)`, 'volc'); break;
		case AB_MINIVOLC: write(`${d[0]}%機率放出Lv${d[3]}小烈波(出現位置${d[1]}~${d[2]}，持續${d[3]*20}f)`, 'mini-volc'); break;
		}
	}
	if (E.deathsurge != undefined) {
		const d = E.deathsurge;
		write(`死後${d[0]}%機率放出Lv${(d[3]/20).toFixed(0)}小烈波(出現位置${d[1]}~${d[2]}，持續${d[3]}f)`);
	}
}
function renderTable(E) {
	const stats = document.getElementById('stats');
	const chs = stats.children;
	const ss = t3str(E.id - 2);
	if (my_mult) {
		my_mult = parseInt(my_mult);
		if (isNaN(my_mult))
			my_mult = 100;
	} else {
		my_mult = 100;
	}
	document.getElementById('mult').innerText = '倍率: ' + my_mult.toString() + '%';
	my_mult *= 0.01;
	chs[0].children[0].children[0].src = 'data/enemy/' + ss + '/enemy_icon_' + ss + '.png';
	chs[0].children[0].children[0].onerror = function(event) {
		event.currentTarget.src = 'data/enemy/' + ss + '/edi_' + ss + '.png';
	}
	chs[0].children[2].innerText = E.hp * my_mult;
	chs[0].children[4].innerText = [E.atk * my_mult, E.atk1 * my_mult, E.atk2 * my_mult].filter(x => x).join('/');
	chs[0].children[6].innerText = E.speed;
	chs[1].children[1].innerText = E.kb;
	chs[1].children[3].innerText = numStr((E.atk + E.atk1 + E.atk2) * my_mult * 30 / E.attackF);
	chs[1].children[5].innerText = E.range;
	chs[1].children[7].innerText = E.earn;
	chs[2].children[1].innerText = [E.pre, E.pre1, E.pre2].filter(x => x).map(numStrT).join('/');
	chs[2].children[3].innerText = numStrT(E.backswing);
	chs[2].children[5].innerText = numStrT(E.tba);
	chs[2].children[7].innerText = numStrT(E.attackF);
	chs[4].children[1].innerHTML = E.desc;
	var traits = [];
  	if (E.trait & TB_RED)
  		traits.push('紅色敵人');
  	if (E.trait & TB_FLOAT)
  		traits.push('漂浮敵人');
  	if (E.trait & TB_BLACK)
  		traits.push('黑色敵人');
  	if (E.trait & TB_METAL)
  		traits.push('鋼鐵敵人');
  	if (E.trait & TB_ANGEL)
  		traits.push('天使敵人');
  	if (E.trait & TB_ALIEN)
  		traits.push('異星戰士' + (E.star ? '(有星星)' : ''));
  	if (E.trait & TB_ZOMBIE)
  		traits.push('不死生物');
  	if (E.trait & TB_RELIC)
  		traits.push('古代種');
  	if (E.trait & TB_WHITE)
  		traits.push('白色敵人');
  	if (E.trait & TB_EVA)
  		traits.push('使徒');
   	if (E.trait & TB_WITCH)
  		traits.push('魔女');
  	if (E.trait & TB_DEMON)
  		traits.push('惡魔');
  	if (E.trait & TB_BEAST)
  		traits.push('超獸');
  	if (E.trait & TB_BARON)
  		traits.push('超生命體');
  	if (E.trait & TB_INFN)
  		traits.push('道場塔');
	chs[0].children[8].innerText = traits.join(' • ');
	chs[4].children[1].innerHTML = E.desc;
	const specials = chs[3].children[1];
	var atkType = '';
	if (E.atkType & ATK_OMNI)
		atkType += '全方位';
	else if (E.atkType & ATK_LD)
		atkType += '遠方';
	atkType += (E.atkType & ATK_RANGE) ? '範圍攻擊' : '單體攻擊';
	if (E.atkType & ATK_KB_REVENGE)
		atkType += ' • 擊退反擊';
	
	const lds = E.lds;
	const ldr = E.ldr;
	if (lds[0] || ldr[0]) {
		const nums = '①②③';
		var s = '';
		for (let i = 0;i < lds.length;++i) {
			const x = lds[i];
			const y = x + ldr[i];
			if (x <= y)
				s += `${nums[i]}${x}~${y}`;
			else
				s += `${nums[i]}${y}~${x}`;
		}
		atkType += ` • 範圍${s}`;
	}
	if (E.ab.hasOwnProperty(AB_GLASS))
		atkType += '一次攻擊';
	specials.children[0].innerText = atkType;
	if (E.atk1 || E.atk2) {
		const totalAtk = E.atk + E.atk1 + E.atk2;
		const atkNum = E.atk2 ? 3 : 2;
		const atksPre = [E.atk, E.atk1, E.atk2].slice(0, atkNum).map(x => ((x / totalAtk)*100).toFixed(0)+'%');
		const p = document.createElement('p');
		p.innerText = `${atkNum}回連續攻擊(傷害${atksPre.join('-')})`;
		specials.appendChild(p);
	}
	createAbIcons(E, specials);
	const title = [E.name, E.jp_name].filter(x => x).join('/');
	document.title = title;
	document.getElementById('e-id').innerText = title;
	my_mult = my_params.get('mult') || my_params.get('mag');
	var url = new URL('https://battlecats-db.com/enemy/' + t3str(my_id) + '.html');
	if (my_mult) 
		url.searchParams.set('mag', my_mult);
	document.getElementById('open-db').href = url.href;
}
loadEnemy(my_id)
.then(E => {
	document.getElementById('loader').style.display = 'none';
	loader_text.style.display = 'none';
	document.getElementById('main').style.display = 'block';
	renderTable(E);
}).catch(e => alert('找不到此敵人'));
