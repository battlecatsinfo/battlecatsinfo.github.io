const mult=document.getElementById("mult"),mult_atk=document.getElementById("mult-atk"),st_mag=document.getElementById("st-mag"),my_params=new URLSearchParams(location.search);let my_id=parseInt(my_params.get("id"));const stats=document.getElementById("stats"),chs=stats.children,specials=chs[3].children[1];isNaN(my_id)&&(my_id=0),my_id+=2;var my_mult=my_params.get("mult")||my_params.get("mag"),atk_mag=my_params.get("atkMag"),stageMag=my_params.get("stageMag");const enemy_content=document.getElementById("ctn");function createAbIcons(E){function write(s,icon){var e=document.createElement("div"),i=document.createElement("img");i.src="https://i.imgur.com/"+icon+".png",e.appendChild(i),e.append(s),specials.appendChild(e)}createImuIcons(E.imu,specials);var i,U=E.pre1?"*":"";for(i of Object.entries(E.ab)){var d=i[1];switch(parseInt(i[0])){case AB_KB:write(d[0]+" % 打飛敵人"+U,"cLZsanQ");break;case AB_STOP:write(`${d[0]} % 使動作停止${U}持續 ${numStrT(d[1])}，控場覆蓋率 ${getCoverUnit(E,d[0],d[1])} %`,"i1pP3Mi");break;case AB_SLOW:write(`${d[0]} % 使動作變慢${U}持續 ${numStrT(d[1])}，控場覆蓋率 ${getCoverUnit(E,d[0],d[1])} %`,"MyoCUMu");break;case AB_CRIT:write(d+" % 會心一擊"+U,"FV6We1L");break;case AB_ATKBASE:write("善於攻城（對塔傷害 4 倍）","xIcbDzl");break;case AB_WAVE:write(`${d[0]} % 發射 Lv. ${d[1]} 波動`+U,"ZbPqGoj");break;case AB_MINIWAVE:write(`${d[0]} % 發射 Lv. ${d[1]} 小波動`+U,"W18c1hw");break;case AB_WEAK:write(`${d[0]} % 降低攻擊力${U}至 ${d[2]} % 持續 ${numStrT(d[1])}，控場覆蓋率 ${getCoverUnit(E,d[0],d[1])} %`,"yRkhAHL");break;case AB_STRONG:write(`血量 ${d[0]} % 以下攻擊力增加 ${d[1]} %`,"dlZ8xNU");break;case AB_LETHAL:write(d+" % 死後復活","WcMDxXS");break;case AB_WAVES:write("波動滅止","BH3LOrK");break;case AB_BURROW:write(`進入射程範圍時鑽地 ${numStr(d[1])} 距離（${-1==d[0]?"無限":d[0].toString()+" "}次）`,"j9psrEP");break;case AB_REVIVE:write(`擊倒後 ${numStrT(d[1])} 以 ${d[2]} % 血量復活（${-1==d[0]?"無限":d[0].toString()+" "}次）`,"BX2GLgu");break;case AB_WARP:write(`${d[0]} % 將目標向${d[2]<0?"前":"後"}傳送${U} ${Math.abs(d[2])} 距離持續 `+numStrT(d[1]),"KkYm2Og");break;case AB_CURSE:write(`${d[0]} % 詛咒${U}持續 ${numStrT(d[1])}，控場覆蓋率 ${getCoverUnit(E,d[0],d[1])} %`,"0Rraywl");break;case AB_S:write(`${d[0]} % 渾身一擊${U}（攻擊力增加 ${d[1]} %）`,"KDpH72p");break;case AB_IMUATK:write(d[0]+" % 發動攻擊無效持續 "+numStrT(d[1]),"yCMsSbc");break;case AB_GLASS:write("一次攻擊","VY93npj");break;case AB_SHIELD:write(`護盾 ${numStr(d[0])} HP`,"EeIl4Ug");break;case AB_DSHIELD:write(`惡魔盾 ${numStr(d[0])} HP，KB時惡魔盾恢復 ${d[1]} %`,"uItamql");break;case AB_COUNTER:write("烈波反擊","tchDtAr");break;case AB_AFTERMATH:write(`死後 ${d[0]} % 發射 Lv. ${d[3]}烈波（範圍 ${d[1]}～${d[2]}，持續 ${numStrT(20*d[3])}）`,"amhSmHa");break;case AB_POIATK:write(`${d[0]} % 毒擊（造成角色血量 ${d[1]} % 傷害）`,"6O6zwrp");break;case AB_VOLC:write(`${d[0]} % 發射 Lv. ${d[3]} 烈波（出現位置 ${d[1]}～${d[2]}，持續 ${numStrT(20*d[3])}）`,"at4bW0n");break;case AB_MINIVOLC:write(`${d[0]} % 發射 Lv. ${d[3]} 小烈波（出現位置 ${d[1]}～${d[2]}，持續 ${numStrT(20*d[3])}）`,"AEITK8t")}}}function renderTable(E){var ss=t3str(E.id-2),_atk_mag=atk_mag/100,_my_mult=my_mult/100,_stageM=stageMag/100;chs[0].children[0].children[0].src="https://battlecatsinfo.github.io/img/e/"+ss+"/enemy_icon_"+ss+".png";let hp=E.hp,atk=E.atk,atk1=E.atk1,atk2=E.atk2;if(E.trait&TB_ALIEN){let m;m=1==E.star?16-treasures[22]/100:7-treasures[21]/100,hp*=m,atk*=m,atk1*=m,atk2*=m}else if(2<=E.star){let m;switch(E.star){case 2:m=11-treasures[20]/10;break;case 3:m=11-treasures[24]/10;break;case 4:m=11-treasures[30]/10}hp*=m,atk*=m,atk1*=m,atk2*=m}atk=~~(Math.round(atk*_atk_mag)*_stageM),atk1=~~(Math.round(atk1*_atk_mag)*_stageM),atk2=~~(Math.round(atk2*_atk_mag)*_stageM),chs[0].children[2].textContent=numStr(~~(Math.round(hp*_my_mult)*_stageM)),chs[0].children[4].textContent=[atk,atk1,atk2].filter(x=>x).map(numStr).join("/"),chs[0].children[6].textContent=E.speed,chs[1].children[1].textContent=E.kb;ss=atk+atk1+atk2,chs[1].children[3].textContent=numStr(~~(30*ss/E.attackF)),chs[1].children[5].textContent=E.range,chs[1].children[7].textContent=E.getcost(),"F"==_l_unit?chs[2].children[1].textContent=[E.pre,E.pre1,E.pre2].filter(x=>x).map(numStr).join("/")+" F":chs[2].children[1].textContent=[E.pre,E.pre1,E.pre2].filter(x=>x).map(x=>numStr(x/30)).join("/")+" 秒",chs[2].children[3].textContent=numStrT(E.backswing),chs[2].children[5].textContent=numStrT(E.tba),chs[2].children[7].textContent=numStrT(E.attackF),_atk_mag=new URL("https://battlecats-db.com/enemy/"+t3str(my_id)+".html");100!=my_mult&&_atk_mag.searchParams.set("mag",my_mult),document.getElementById("open-db").href=_atk_mag.href}loadEnemy(my_id).then(E=>{document.getElementById("loader").style.display="none",document.getElementById("loader-text").style.display="none",document.getElementById("main").style.display="block",my_mult&&(my_mult=parseInt(my_mult),!isNaN(my_mult))||(my_mult=100),atk_mag&&(atk_mag=parseInt(atk_mag),!isNaN(atk_mag))||(atk_mag=my_mult),stageMag&&(stageMag=parseInt(stageMag),!isNaN(stageMag))||(stageMag=100),mult.textContent="倍率:"+my_mult.toString()+"%",mult_atk.textContent="攻擊倍率:"+atk_mag.toString()+"%",st_mag.textContent="★倍率:"+stageMag.toString()+"%";var title=[E.name+E.ts,E.jp_name].filter(x=>x).join("/")||"?",title=(document.title=title,document.getElementById("e-id").textContent=title,[]),title=(E.trait&TB_RED&&title.push("紅色敵人"),E.trait&TB_FLOAT&&title.push("漂浮敵人"),E.trait&TB_BLACK&&title.push("黑色敵人"),E.trait&TB_METAL&&title.push("鋼鐵敵人"),E.trait&TB_ANGEL&&title.push("天使敵人"),E.trait&TB_ALIEN&&(1==E.star?title.push("異星戰士(有星星)"):title.push("異星戰士")),E.trait&TB_ZOMBIE&&title.push("不死生物"),E.trait&TB_RELIC&&title.push("古代種"),E.trait&TB_WHITE&&title.push("無屬性敵人"),E.trait&TB_EVA&&title.push("使徒"),E.trait&TB_WITCH&&title.push("魔女"),E.trait&TB_DEMON&&title.push("惡魔"),E.trait&TB_BEAST&&title.push("超獸"),E.trait&TB_BARON&&title.push("超生命體"),E.trait&TB_INFN&&title.push("道場塔"),E.trait&TB_SAGE&&title.push("賢者"),chs[0].children[8].textContent=title.join("・"),(E.atk1||E.atk2)&&(title=E.atk2?3:2,atksPre=[E.atk,E.atk1,E.atk2].slice(0,title).map(x=>(x/(E.atk+E.atk1+E.atk2)*100).toFixed(0)+" %"),specials.append(`${title}回連續攻擊（傷害 ${atksPre.join(" / ")}）`+getAbiString(E.abi)),specials.appendChild(document.createElement("br"))),""),lds=(E.atkType&ATK_OMNI?title+="全方位":E.atkType&ATK_LD&&(title+="遠方"),title+=E.atkType&ATK_RANGE?"範圍攻擊":"單體攻擊",E.atkType&ATK_KB_REVENGE&&(title+="・擊退反擊"),E.lds),ldr=E.ldr;if(lds[0]||ldr[0]){var s="";for(let i=0;i<lds.length;++i){var x=lds[i],y=x+ldr[i];s+=x<=y?""+"①②③"[i]+x+"～"+y:""+"①②③"[i]+y+"～"+x}title+="・範圍 "+s}if(E.atkType&ATK_RANGE){const s=new Image(40,40);s.src="https://i.imgur.com/BeuHYlZ.png",specials.appendChild(s)}else{const s=new Image(40,40);s.src="https://i.imgur.com/CZwFP3H.png",specials.appendChild(s)}if(E.atkType&ATK_LD){const s=new Image(40,40);s.src="https://i.imgur.com/fYILfa8.png",specials.appendChild(s)}if(E.atkType&ATK_OMNI){const s=new Image(40,40);s.src="https://i.imgur.com/rvGrwIL.png",specials.appendChild(s)}if(E.atkType&ATK_KB_REVENGE){const s=new Image(40,40);s.src="https://i.imgur.com/KqtrO2b.png",specials.appendChild(s)}specials.append(title),specials.appendChild(document.createElement("br")),renderTable(E),chs[4].children[1].innerHTML=E.desc,createAbIcons(E),document.getElementById("search-appear").href="/appear.html?id="+(my_id-2).toString();var atksPre=t3str(my_id-2),title=`/img/e/${atksPre}/${atksPre}_e.png`,atksPre=`/data/enemy/${atksPre}/${atksPre}_e.imgcut`;document.getElementById("open-imgcut").href=`/anim/imgcut.html?cutfile=${atksPre}&imgfile=`+title,document.getElementById("open-anim").href="/anim/anim.html?id=-"+(my_id-1),document.getElementById("fandom").href="https://battle-cats.fandom.com/wiki/"+E.fandom,mult.addEventListener("blur",function(){var num=mult.textContent.match(/\d+/);num?(atk_mag=my_mult=parseInt(num[0]),mult_atk.textContent=`攻擊倍率:${num}%`,mult.textContent=`倍率:${num}%`,renderTable(E)):mult.textContent=`倍率:${my_mult}%`}),mult_atk.addEventListener("blur",function(){var num=mult_atk.textContent.match(/\d+/);num?(atk_mag=parseInt(num[0]),mult_atk.textContent=`攻擊倍率:${num}%`,renderTable(E)):mult_atk.textContent=`攻擊倍率:${atk_mag}%`}),st_mag.addEventListener("blur",function(){var num=st_mag.textContent.match(/\d+/);num?(stageMag=parseInt(num[0]),st_mag.textContent=`★倍率:${num}%`,renderTable(E)):st_mag.textContent=`★倍率:${stageMag}%`});const abar=document.getElementById("abar");atksPre=abar.previousElementSibling;atksPre.onmouseover=function(event){abar.style.display="block"},atksPre.onclick=function(event){event.stopPropagation(),event.preventDefault(),abar.style.display="block"},window.onclick=function(){abar.style.display="none"}});