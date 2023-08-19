const my_params=new URLSearchParams(location.search);let my_id=parseInt(my_params.get("id"));if(isNaN(my_id))throw alert("Missing enemy id in URL query!"),window.stop(),"";my_id+=2;var my_mult=my_params.get("mult")||my_params.get("mag"),atk_mag=my_params.get("atkMag");const enemy_content=document.getElementById("ctn");function createAbIcons(E,parent){function write(s,icon){icon&&((e=document.createElement("span")).classList.add("bc-icon","bc-icon-"+icon),parent.appendChild(e));var e,icon=document.createElement("span");icon.innerText=s,parent.appendChild(icon),parent.appendChild(document.createElement("br"))}createImuIcons(E.imu,parent);for(var i of Object.entries(E.ab)){var d=i[1];switch(parseInt(i[0])){case AB_KB:write(d[0]+"%機率擊退","kb");break;case AB_STOP:write(`${d[0]}%機率暫停持續${numStrT(d[1])}，控場覆蓋率${numStr(d[2])}%`,"stop");break;case AB_SLOW:write(`${d[0]}%機率緩速持續${numStrT(d[1])}，控場覆蓋率${numStr(d[2])}%`,"slow");break;case AB_CRIT:write(d[0]+"%機率爆擊","crit");break;case AB_ATKBASE:write("對塔傷害四倍","atkbase");break;case AB_WAVE:write(`${d[0]}%機率釋放Lv${d[1]}波動`,"wave");break;case AB_MINIWAVE:write(`${d[0]}%機率釋放Lv${d[1]}小波動`,"wave");break;case AB_WEAK:write(`${d[0]}%機率降低攻擊力至${d[2]}%持續${numStrT(d[1])}，控場覆蓋率${numStr(d[3])}%`,"weak");break;case AB_STRONG:write(`血量${d[0]}%以下攻擊力增加${d[1]}倍`,"strong");break;case AB_LETHAL:write(d[0]+"%機率死後復活","lethal");break;case AB_WAVES:write("波動滅止","waves");break;case AB_BURROW:write(`進入射程範圍時鑽地${numStr(d[1])}距離(${-1==d[0]?"無限":d[0]}次)`);break;case AB_REVIVE:write(`擊倒後${numStrT(d[1])}以${d[2]}%血量復活(${-1==d[0]?"無限":d[0]}次)`);break;case AB_WARP:write(`${d[0]}%機率將向目標${d[2]<0?"前":"後"}傳送${Math.abs(d[2])}距離持續`+numStrT(d[1]),"warp");break;case AB_CURSE:write(`${d[0]}%機率詛咒持續${numStrT(d[1])}，控場覆蓋率${numStr(d[2])}%`,"curse");break;case AB_S:write(`${d[0]}%機率渾身一擊(攻擊力增加${d[1]}%倍)`,"s");break;case AB_IMUATK:write(d[0]+"%機率攻擊無效持續"+numStrT(d[1]),"imu-atk");break;case AB_SHIELD:write(`宇宙盾 ${d[0]}HP`,"shield");break;case AB_DSHIELD:write(`惡魔盾 ${d[0]} HP，KB時惡魔盾恢復${d[1]}%`);break;case AB_COUNTER:write("烈波反擊");break;case AB_POIATK:var img=document.createElement("img");img.src="./data/page/icons/BCPoison.png",parent.appendChild(img),write(`${d[0]}%機率毒擊(造成角色血量${d[1]}%傷害)`);break;case AB_VOLC:write(`${d[0]}%機率放出Lv${d[3]}烈波(出現位置${d[1]}~${d[2]}，持續${20*d[3]}f)`,"volc");break;case AB_MINIVOLC:write(`${d[0]}%機率放出Lv${d[3]}小烈波(出現位置${d[1]}~${d[2]}，持續${20*d[3]}f)`,"mini-volc")}}if(null!=E.deathsurge){const d=E.deathsurge;write(`死後${d[0]}%機率放出Lv${(d[3]/20).toFixed(0)}小烈波(出現位置${d[1]}~${d[2]}，持續${d[3]}f)`)}}function renderTable(E){var chs=document.getElementById("stats").children;const ss=t3str(E.id-2);my_mult&&(my_mult=parseInt(my_mult),!isNaN(my_mult))||(my_mult=100),!atk_mag||(atk_mag=parseInt(atk_mag),isNaN(atk_mag))?atk_mag=.01*my_mult:atk_mag*=.01,document.getElementById("mult").innerText="倍率: "+my_mult.toString()+"%",my_mult*=.01,chs[0].children[0].children[0].src="/data/enemy/"+ss+"/enemy_icon_"+ss+".png",chs[0].children[0].children[0].onerror=function(event){event.currentTarget.src="/data/enemy/"+ss+"/edi_"+ss+".png"},chs[0].children[2].innerText=~~(E.hp*my_mult),chs[0].children[4].innerText=[E.atk*atk_mag,E.atk1*atk_mag,E.atk2*atk_mag].filter(x=>x).map(x=>~~x).join("/"),chs[0].children[6].innerText=E.speed,chs[1].children[1].innerText=E.kb;var allAtk=(E.atk+E.atk1+E.atk2)*atk_mag,allAtk=(chs[1].children[3].innerText=numStr(30*~~allAtk/E.attackF),chs[1].children[5].innerText=E.range,chs[1].children[7].innerText=E.earn,chs[2].children[1].innerText=[E.pre,E.pre1,E.pre2].filter(x=>x).map(numStrT).join("/"),chs[2].children[3].innerText=numStrT(E.backswing),chs[2].children[5].innerText=numStrT(E.tba),chs[2].children[7].innerText=numStrT(E.attackF),chs[4].children[1].innerHTML=E.desc,[]),allAtk=(E.trait&TB_RED&&allAtk.push("紅色敵人"),E.trait&TB_FLOAT&&allAtk.push("漂浮敵人"),E.trait&TB_BLACK&&allAtk.push("黑色敵人"),E.trait&TB_METAL&&allAtk.push("鋼鐵敵人"),E.trait&TB_ANGEL&&allAtk.push("天使敵人"),E.trait&TB_ALIEN&&allAtk.push("異星戰士"+(E.star?"(有星星)":"")),E.trait&TB_ZOMBIE&&allAtk.push("不死生物"),E.trait&TB_RELIC&&allAtk.push("古代種"),E.trait&TB_WHITE&&allAtk.push("白色敵人"),E.trait&TB_EVA&&allAtk.push("使徒"),E.trait&TB_WITCH&&allAtk.push("魔女"),E.trait&TB_DEMON&&allAtk.push("惡魔"),E.trait&TB_BEAST&&allAtk.push("超獸"),E.trait&TB_BARON&&allAtk.push("超生命體"),E.trait&TB_INFN&&allAtk.push("道場塔"),chs[0].children[8].innerText=allAtk.join(" • "),chs[4].children[1].innerHTML=E.desc,chs[3].children[1]),chs="",lds=(E.atkType&ATK_OMNI?chs+="全方位":E.atkType&ATK_LD&&(chs+="遠方"),chs+=E.atkType&ATK_RANGE?"範圍攻擊":"單體攻擊",E.atkType&ATK_KB_REVENGE&&(chs+=" • 擊退反擊"),E.lds),ldr=E.ldr;if(lds[0]||ldr[0]){var s="";for(let i=0;i<lds.length;++i){var x=lds[i],y=x+ldr[i];s+=x<=y?""+"①②③"[i]+x+"~"+y:""+"①②③"[i]+y+"~"+x}chs+=" • 範圍"+s}if(E.ab.hasOwnProperty(AB_GLASS)&&(chs+="一次攻擊"),allAtk.children[0].innerText=chs,E.atk1||E.atk2){const totalAtk=E.atk+E.atk1+E.atk2;var chs=E.atk2?3:2,atksPre=[E.atk,E.atk1,E.atk2].slice(0,chs).map(x=>(x/totalAtk*100).toFixed(0)+"%"),p=document.createElement("p");p.innerText=`${chs}回連續攻擊(傷害${atksPre.join("-")})`+getAbiString(E.abi),allAtk.appendChild(p)}createAbIcons(E,allAtk);chs=[E.name[0],E.jp_name[0]].filter(x=>x).join("/")||"?",document.title=chs,document.getElementById("e-id").innerText=chs,my_mult=my_params.get("mult")||my_params.get("mag"),atksPre=new URL("https://battlecats-db.com/enemy/"+t3str(my_id)+".html"),my_mult&&atksPre.searchParams.set("mag",my_mult),document.getElementById("open-db").href=atksPre.href,document.getElementById("search-appear").href="/appear.html?id="+(my_id-2).toString(),p=t3str(my_id-2),allAtk=`/data/enemy/${p}/${p}_e.png`,E=`/data/enemy/${p}/${p}_e.imgcut`;document.getElementById("open-imgcut").href=`/anim/imgcut.html?cutfile=${E}&imgfile=`+allAtk}loadEnemy(my_id).then(E=>{document.getElementById("loader").style.display="none",loader_text.style.display="none",document.getElementById("main").style.display="block",renderTable(E)});