var fs,info1,info2,info3,star,char_groups,stage_name="";const QQ="？？？",M1=document.getElementById("M1"),M2=document.getElementById("M2"),M3=document.getElementById("M3"),st1=document.getElementById("st-1").children,st2=document.getElementById("st-2").children,st3=document.getElementById("st-3").children,stName=document.getElementById("st-name"),stName2=document.getElementById("st-name2"),stLines=document.getElementById("lines"),main_div=document.getElementById("main"),search_result=document.getElementById("search-result"),m_drops=document.getElementById("drops"),rewards=document.getElementById("rewards"),m_times=document.getElementById("times"),mM=document.getElementById("mM"),ex_stages=document.getElementById("ex-stages");var Buffer=BrowserFS.BFSRequire("buffer").Buffer;const materialDrops=[85,86,87,88,89,90,91,140,187,188,189,190,191,192,193,194],treasures=(BrowserFS.install(window),[300,300,300,300,300,300,300,300,300,300,300,30,10,30,30,30,30,30,30,30,100,600,1500,300,100,30,300,300,300,300,100]);for(let i=0;i<31;++i){const x=localStorage.getItem("t$"+i.toString());null!=x&&(treasures[i]=parseInt(x))}function duo(n){return n<10?"0"+n.toString():n.toString()}const hidden_groups=[[25e3,25001,25003],[25007,25002,25004],[25008,25005,25006],[25009,25012,25015,25018,25021,25024,25027],[25010,25013,25016,25019,25022,25025,25028],[25011,25014,25017,25020,25023,25026,25029],[25063],[25064],[25065],[25030,25051,25052,25053],[25031,25054,25055,25056],[25032,25057,25058,25059],[25060],[25061],[25062],[25066]];function createReward(tr,v){var td=document.createElement("td"),td1=document.createElement("td"),img=new Image(128,128);if(img.style.maxWidth="2.7em",img.style.height="auto",td1.appendChild(img),3!=v.length){var id=v[4],ids=t3str(id),ids=(v[3].endsWith("的權利")?img.src=`/img/u/${ids}/s/uni${ids}_s00.png`:img.src=`/img/u/${ids}/f/uni${ids}_f00.png`,document.createElement("a"));ids.href="/unit.html?id="+id,ids.textContent=v[3],ids.style.verticalAlign="center",td.appendChild(ids)}else{let rw=v[1];rw<=13&&11<=rw&&(rw+=9),img.src=`/img/r/gatyaitemD_${duo(rw)}_f.png`;id=document.createElement("span");id.style.verticalAlign="center",id.textContent=RWNAME[rw]+(" ×"+v[2]),td.appendChild(id)}tr.appendChild(td),tr.appendChild(td1)}const mapConditions={10:{condition:[101017,-114024]},11:{condition:[101018,-114025]},12:{condition:[101019,-114026]},13:{condition:[101020,-114027]},14:{condition:[101021,-114028]},15:{condition:[101022,-114029]},16:{condition:[101023,-114030]},17:{condition:[101024,-114031]},18:{condition:[101025,-114032]},19:"通過狂亂貓咪降臨關卡(共9種)",21:"通過New Challenger4個",30:{condition:[101014,-114018]},31:{condition:[101015,-114019]},32:{condition:[101016,-114020]},33:{condition:[101039,-114021]},34:{condition:[101043,-114022]},35:{condition:[101066,-114023]},36:{condition:[101095,-114012]},37:{condition:[101117,-114013]},38:{condition:[101119,-114014]},39:{condition:[101128,-114015]},40:{condition:[101158,-114016]},41:{condition:[101177,-114017]},42:{condition:[101095,-201095]},43:{condition:[101117,-201117]},44:{condition:[101119,-201119]},45:{condition:[101128,-201128]},46:{condition:[101158,-201158]},47:{condition:[101177,-201177]},48:{condition:[101014,-201014]},49:{condition:[101015,-201015]},50:{condition:[101016,-201016]},51:{condition:[101039,-201039]},52:{condition:[101043,-201043]},53:{condition:[101066,-201066]},54:{condition:[101017,-201017]},55:{condition:[101018,-201018]},56:{condition:[101019,-201019]},57:{condition:[101020,-201020]},58:{condition:[101021,-201021]},59:{condition:[101022,-201022]},60:{condition:[101023,-201023]},61:{condition:[101024,-201024]},62:{condition:[101025,-201025]},63:"通過第4、第6、第9、第10使徒關卡",64:"通過”斷罪天使海蝶降臨”和”地獄門”",65:"通過”女帝飛來”和”亡者肥普降臨”",66:"通過”吉娃娃伯爵降臨”和”春宵苦短，少女做夢吧！”",67:{condition:[101257,101258,101266]},68:"通過時空的彎曲・解放的貓咪們2關卡",69:{condition:[107e3],stage:39},70:'通過魔界篇的"魔界火山"',71:"通過”藍色衝擊”和”亡者肥普降臨”",72:"通過”女帝飛來”和”春宵苦短，少女做夢吧！”",73:"通過”斷罪天使海蝶降臨”和”吉娃娃伯爵降臨”",74:{condition:[101215,-201215]},75:{condition:[101161,-201161]},76:{condition:[101096,-201096]},77:{condition:[101122,-201122]},78:{condition:[101189,-201189]},79:{condition:[101259,-201259]},80:{condition:[101226,-201226]},81:{condition:[101102,-201102]},82:{condition:[101103,-201103]},83:{condition:[101104,-201104]},84:{condition:[101105,-201105]},85:{condition:[101106,-201106]},86:{condition:[101107,-201107]},87:{condition:[101108,-201108]},88:{condition:[101109,-201109]},89:{condition:[101110,-201110]},90:{condition:[101157,-201157]},91:{condition:[101096,-114035]},92:{condition:[101122,-114036]},93:{condition:[101157,-114049]},94:{condition:[101189,-114037]},95:{condition:[101226,-114039]},96:{condition:[131e3],stage:3},97:{condition:[131001],stage:3},98:{condition:[131002],stage:3},99:{condition:[113047],stage:4},100:{condition:[131e3],stage:9},101:{condition:[131001],stage:9},102:{condition:[131002],stage:9},103:{condition:[101130,101131,101132,101133,101134,101135,101136,101137,101138]},104:{condition:[101259,-114038]},105:{condition:[131e3],stage:15},106:{condition:[131001],stage:15},107:{condition:[131002],stage:15},108:"通過”甲普拉密林”的所有關卡",109:"通過”亞蜥比沙漠”的所有關卡",110:{condition:[101361],stage:0},0:"通過前一個關卡",1:"通過世界篇第1章",2:"通過世界篇第2章",3:"通過世界篇第3章",4:"通過未來篇第1章",5:"通過未來篇第2章",6:"通過未來篇第3章",7:"通過宇宙篇第1章",8:"通過宇宙篇第2章",9:"通過宇宙篇第3章",20:"通過所有的傳奇故事",25:"需要先達到等級排行1600以上",26:"通過3月・4月・5月活動3地圖",27:"通過6月・7月・8月活動3地圖",28:"通過9月・10月・11月活動3地圖",29:"通過12月・1月・2月活動3地圖",1e5:'通過"傳說的開始"全關卡',100001:'通過"熱情的國家"全關卡',100002:'通過"葡萄糖胺沙漠 "全關卡',100003:'通過"貓咪們渡海"全關卡',100004:'通過"凝視著貓眼石"全關卡',100005:'通過"西方街道"全關卡',100006:'通過"鮪魚海域"全關卡',100007:'通過"竹子島"全關卡',100008:'通過"黏糊糊的鐘乳洞"全關卡',100009:'通過"瓦魯肯諾火山"全關卡',100010:'通過"千里之道"全關卡',100011:'通過"鹹魚要塞"全關卡',100012:'通過"軍艦島"全關卡',100013:'通過"貓咪磨爪的走廊"全關卡',100014:'通過"帕德嫩神殿"全關卡',100015:'通過"退潮的海水浴場"全關卡',100016:'通過"惡魔島"全關卡',100017:'通過"越獄隧道"全關卡',100018:'通過"卡彭監獄"全關卡',100019:'通過"絲綢之路"全關卡',100020:'通過"通向黑暗的地下道"全關卡',100021:'通過"魔王的豪宅"全關卡',100022:'通過"終焉宣告之夜"全關卡',100023:'通過"大混戰"全關卡',100024:'通過"戰爭的傷痕"全關卡',100025:'通過"污染海洋的壞人"全關卡',100026:'通過"連接心身的東西"全關卡',100027:'通過"脆弱性和弱酸性"全關卡',100028:'通過"被引導的貓咪們"全關卡',100029:'通過"黑暗的國際城市"全關卡',100030:'通過"加拉・巴・哥"全關卡',100031:'通過"岩海苔半島"全關卡',100032:'通過"惡羅斯聯邦"全關卡',100033:'通過"亡者聚集之地"全關卡',100034:'通過"孤島大瘟疫"全關卡',100035:'通過"迪死你樂園"全關卡',100036:'通過"豪來塢帝國"全關卡',100037:'通過"小跟班海岸"全關卡',100038:'通過"雲泥溫泉鄉"全關卡',100039:'通過"濃濃春色島"全關卡',100040:'通過"IT地下墓穴"全關卡',100041:'通過"怪展會之畫"全關卡',100042:'通過"22區"全關卡',100043:'通過"超越大草原"全關卡',100044:'通過"暴風雪車道"全關卡',100045:'通過"奇點村"全關卡',100046:'通過"最終大陸"全關卡',100047:'通過"傳說的終點"全關卡',100048:'通過"古代研究所"全關卡',101009:"通過勞動感謝特別活動！",101010:"通過聖誕節居然來了！",101011:"通過新年快樂？",101012:"通過被召喚的福！",101013:"通過人偶架上的戰士們",101014:"通過紅色突變關卡",101026:"通過春天來了!高校教師",101029:"通過相思病戀歌",101030:"通過禁斷之妻",101031:"通過因為夏天喵！",101032:"通過返鄉熱潮！",101036:"通過在鎮上看到的超強老人",101038:"通過秋天運動會！",101196:"通過所有的絕・斷罪天使海蝶降臨關卡",101199:"通過絕・地獄門全關卡",101201:"通過絕・女帝飛來",101205:"通過絕・亡者肥普降臨",101207:"通過絕・吉娃娃伯爵降臨",101214:'通過"絕・春宵苦短，少女做夢吧！"全關卡',102035:"通過魔女之夜",113e3:"通過真・傳說的開始",101184:"通過新年快樂了？全關卡",101186:"通過再次被召喚的福！全關卡",101192:"通過人偶架上的戰士們特別版全關卡",101194:"通過新・春天來了!高校教師全關卡",101197:"通過再一次的相思病戀歌全關卡",101165:"通過續・禁斷之妻全關卡",101166:"通過因為超級夏天喵！全關卡",101167:"通過收假熱潮！全關卡",101168:"通過在鎮上看到的超強老人2全關卡",101170:"通過夜間運動會！全關卡",101171:"通過工作方式大革命全關卡",101175:"通過宇宙中聖誕節居然也來了！全關卡",101262:"通過熱血！兩人三腳賽 低學年",101263:"通過熱血！兩人三腳賽 中學年",101290:"通過後輩送的本命巧克力",101291:"通過前輩送的本命巧克力",999999:"目前的版本只能挑戰到這裡喵。等待下次的更新吧！",101312:"通過密林的異變",101313:"通過沙漠的怪事",101314:"通過火山的威脅",101315:"通過蟲蟲王者相撲 預賽",101316:"通過蟲蟲王者相撲 半準決賽",101317:"通過蟲蟲王者相撲 準決賽",101303:"通過Season4～畢業之日～",101300:"通過Weekend～告白～",101301:"通過Weekend～告白～",101302:"通過Weekend～告白～",101333:"通過密林的異變Ⅱ",101334:"通過沙漠的怪事Ⅱ",101335:"通過火山的威脅Ⅱ",101345:"通過密林的異變Ⅲ",101346:"通過沙漠的怪事Ⅲ",101347:"通過火山的威脅Ⅲ"};function numStr(num){return(Math.round(100*(num+Number.EPSILON))/100).toString()}function loadStage(){return new Promise(resolve=>{var req=indexedDB.open("stage",13);req.onupgradeneeded=function(event){event=event.target.result;try{event.deleteObjectStore("data")}catch(e){}event.createObjectStore("data",{keyPath:"name"}).createIndex("data","",{unique:!1})},req.onsuccess=function(event){const db=event.target.result;db.transaction("data").objectStore("data").get("stages").onsuccess=function(event){event=event.target.result;if(event)return resolve(event.data);fetch("/stages.zip").then(res=>res.arrayBuffer()).then(buffer=>{var tx=db.transaction(["data"],"readwrite");tx.objectStore("data").put({name:"stages",data:buffer}),tx.oncomplete=function(){db.close()},resolve(buffer)})}}})}function main(){var url=new URL(location.href),Q=url.searchParams.get("q");if(Q)doSearch({value:Q}),document.getElementById("form").firstElementChild.value=Q,history.pushState({},"","/stage.html");else{Q=url.searchParams.get("star");(!Q||(star=parseInt(Q),isNaN(star))||star<=0||4<star)&&(star=1);let st=url.searchParams.get("s");if(st){Q=st.split("-").map(x=>parseInt(x)).filter(x=>!isNaN(x));if(Q.length)return M1.selectedIndex=Q[0],M1.oninput(null,Q),void(main_div.style.display="block")}else if(st=url.searchParams.get("v")){const sts=st.split("-").map(x=>parseInt(x)).filter(x=>!isNaN(x));if(sts.length)return M1.value="/stages/"+sts[0],M1.oninput(null,sts),void(main_div.style.display="block")}M1.selectedIndex=0,M1.oninput(),main_div.style.display="block"}}function getConditionHTML(obj){if(1e5<obj){var x=Math.abs(obj)%1e5;const m=~~(x/1e3),s=x%1e3;var x=JSON.parse(fs.readFileSync(`/stages/${m}/${s}/info`)),a=document.createElement("a");const div=document.createElement("div");return div.append("通過"),a.href=`/stage.html?v=${m}-`+s,a.textContent=x.name,a.onclick=function(event){return M1.value="/stages/"+m,M1.oninput(null,[null,s]),!1},div.appendChild(a),div}if(!(obj=mapConditions[obj]))return document.createTextNode(QQ);if("string"==typeof obj)return document.createTextNode(obj);if(obj.hasOwnProperty("stage")){const x=Math.abs(obj.condition)%1e5,m=~~(x/1e3),s=x%1e3,info=JSON.parse(fs.readFileSync(`/stages/${m}/${s}/info`)),a=document.createElement("a"),div=document.createElement("div"),st=(div.append("通過"),a.href=`/stage.html?${m}-`+s,obj.stage);return a.textContent=info.name+"第"+(st+1).toString()+"關",a.onclick=function(event){return M1.value="/stages/"+m,M1.oninput(null,[null,s,st]),!1},div.appendChild(a),div}const div=document.createElement("div");let i=0,last=0;for(const y of obj.condition){var ay=Math.abs(y);const x=ay%1e5,m=~~(x/1e3),s=x%1e3,info=JSON.parse(fs.readFileSync(`/stages/${m}/${s}/info`)),a=document.createElement("a");a.href=`/stage.html?v=${m}-`+s,a.textContent=info.name,a.onclick=function(event){return M1.value="/stages/"+m,M1.oninput(null,[null,s]),!1},i&&div.append(Math.sign(y)!=Math.sign(last)?"或":"及"),div.append(2e5<ay?"通過":"玩過"),div.appendChild(a),++i,last=y}return div}function merge(g1,g2){if(group=[g1[0],[...g1[1]]],0==g1[0]&&0==g2[0]){group[1]=[];for(var x of g1[1])g2[1].includes(x)&&group[1].push(x)}else if(0==g1[0]&&2==g2[0])group[1]=group[1].filter(x=>g2[1].contains(x));else if(2==g1[0]&&0==g2[0]){group[0]=0;for(let x of g2[1])group[1].includes(x)||group[1].push(x);group[1]=group[1].filter(x=>g1[1].contains(x))}else if(2==g1[0]&&2==g2[0])for(let x of g2[1])group[1].includes(x)||group[1].push(x);return group}function getRarityString(rare){var names=["基本","EX","稀有","激稀有","超激稀有","傳説稀有"],strs=[];let y=0;for(let i=1;i<64;i<<=1)rare&i&&strs.push(names[y]),++y;return strs.join("，")}loadStage().then(function(zipData){BrowserFS.configure({fs:"ZipFS",options:{zipData:Buffer.from(zipData)}},function(e){e?console.error(e):((fs=BrowserFS.BFSRequire("fs")).readdirSync("/stages").forEach(m1=>{var p;"group"!=m1&&(p=document.createElement("option"),m1=JSON.parse(fs.readFileSync((p.value="/stages/"+m1)+"/info")),p.textContent=m1.name||m1.jpname,M1.appendChild(p))}),char_groups=JSON.parse(fs.readFileSync("/stages/group")),main())})});class Limit{constructor(x){null!=x?(this.star=x[0],this.sid=x[1],this.rare=x[2],this.num=x[3],this.line=x[4],this.min=x[5],this.max=x[6],this.group=char_groups[x[7]]):(this.star=-1,this.sid=-1,this.rare=0,this.num=0,this.line=0,this.min=0,this.max=0)}combine(other){0==this.rare?this.rare=other.rare:0!=other.rare&&(this.rare&=other.rare),0<this.num*other.num?this.num=Math.min(this.num,other.num):this.num=Math.max(this.num,other.num),this.line|=other.line,this.min=Math.max(this.min,other.min),this.max=0<this.max&&0<other.max?Math.min(this.max,other.max):this.max+other.max,other.hasOwnProperty("group")&&(this.hasOwnProperty("group")?this.group=merge(this.group,other.group):this.group=other.group)}}function makeTd(p,txt){var td=document.createElement("td");td.textContent=txt,p.appendChild(td)}function t3str(x){var s=x.toString();switch(s.length){case 2:return"0"+s;case 1:return"00"+s}return s}function getDropData(){var x,res=[],sum=0,drops=info3.drop;for(x of drops)sum+=x[0];if(1e3==sum)for(let x of drops)res.push(numStr(x[0]/10));else{if(sum==drops.length&&-1!=sum||-3==info3.rand){var c=Math.floor(100/drops.length).toString();for(let x of drops)res.push(c);return res}if(100==sum)for(let x of drops)res.push(x[0].toString());else if(100<sum&&(0==info3.rand||1==info3.rand)){var rest=100;if(100==drops[0][0]){res.push("100");for(let i=1;i<drops.length;++i){var filter=rest*drops[i][0]/100;rest-=filter,res.push(numStr(filter))}}else for(let x of drops){const filter=rest*x[0]/100;rest-=filter,res.push(numStr(filter))}}else if(-4==info3.rand)for(let x of drops)res.push(numStr(100*x[0]/sum));else for(let x of drops)res.push(x[0].toString())}return res}function doSearch(t){const v=t.value.split(" ")[0];if(v){search_result.textContent="",main_div.style.display="none",search_result.style.display="block";var s1=fs.readdirSync("/stages");let num_results=0;for(let i=0;i<s1.length;++i){var m1=s1[i];if("group"!=m1){var i1=JSON.parse(fs.readFileSync(`/stages/${m1}/info`)),s2=fs.readdirSync("/stages/"+m1);for(let j=0;j<s2.length;++j){var m2=s2[j];if("info"!=m2){var i2=JSON.parse(fs.readFileSync(`/stages/${m1}/${m2}/info`));if((f(i2.name)||f(i2.jpname))&&(add([i,j],[i1,i2]),20<++num_results))return;var s3=fs.readdirSync(`/stages/${m1}/`+m2);for(let k=0;k<s3.length;++k){var m3=s3[k];if("info"!=m3){m3=JSON.parse(fs.readFileSync(`/stages/${m1}/${m2}/`+m3));if((f(m3.name)||f(m3.jpname))&&(add([i,j,k],[i1,i2,m3]),20<++num_results))return}}}}}}function f(s){return s&&s.includes(v)}function add(ms,is){var a=document.createElement("a");for(let i=0;i<is.length;++i)is[i].name&&(is[i].name=is[i].name.replaceAll(v,match=>`<span>${match}</span>`)),is[i].jpname&&(is[i].jpname=is[i].jpname.replaceAll(v,match=>`<span>${match}</span>`));a.href="/stage.html?s="+ms.join("-"),a.onclick=function(){return search_result.style.display="none",main_div.style.display="block",M1.selectedIndex=ms[0],M1.oninput(null,ms),!1},a.innerHTML=is.map(x=>x.name?x.jpname?`${x.name}(${x.jpname})`:x.name:x.jpname).join(" - "),a.classList.add("res"),search_result.appendChild(a)}num_results||(search_result.textContent="沒有結果")}else search_result.style.display="none",main_div.style.display="block"}M1.oninput=function(event,sts){const dir=M1.selectedOptions[0].value;info1=JSON.parse(fs.readFileSync(dir+"/info")),M2.textContent="",M3.textContent="",fs.readdirSync(dir).forEach(m1=>{var p;"info"!=m1&&(p=document.createElement("option"),m1=JSON.parse(fs.readFileSync((p.value=dir+"/"+m1)+"/info")),p.textContent=m1.name||m1.jpname,M2.appendChild(p))}),sts&&1<sts.length?M2.selectedIndex=sts[1]:M2.selectedIndex=0,M2.oninput(null,sts)},M2.oninput=function(event,sts){const dir=M2.selectedOptions[0].value;info2=JSON.parse(fs.readFileSync(dir+"/info")),M3.textContent="",fs.readdirSync(dir).forEach(m1=>{var p;"info"!=m1&&(p=document.createElement("option"),m1=JSON.parse(fs.readFileSync(p.value=dir+"/"+m1)),p.textContent=m1.name||m1.jpname,M3.appendChild(p))}),sts&&2<sts.length?M3.selectedIndex=sts[2]:M3.selectedIndex=0,M3.oninput()},M3.oninput=function(){var dir=M3.selectedOptions[0].value,url=new URL(location.href),dir=(url.searchParams.set("s",[M1.selectedIndex,M2.selectedIndex,M3.selectedIndex].join("-")),star=info2.stars.length?Math.min(info2.stars.length,star):1,url.searchParams.set("star",star),history.pushState({},"",url),info3=JSON.parse(fs.readFileSync(dir)),stName.textContent=stage_name=[info1.name||QQ,info2.name||QQ,info3.name||QQ].join(" - "),stName2.textContent=[info1.jpname||QQ,info2.jpname||QQ,info3.jpname||QQ].join(" - "),document.title=stage_name,document.getElementById("stars-tr")),dir=(dir&&dir.parentNode.removeChild(dir),document.getElementById("warn-tr")),dir=(dir&&dir.parentNode.removeChild(dir),document.getElementById("limit-bt"));dir&&dir.parentNode.removeChild(dir);let mult=info2.stars[star-1];if(mult=mult||100,info2.stars.length){var dir=document.createElement("tr"),th=document.createElement("th");th.colSpan=6;for(let i=0;i<info2.stars.length;++i){const a=document.createElement("a");a.classList.add("star"),a.textContent=(i+1).toString()+"★: "+info2.stars[i].toString()+"%",url.searchParams.set("star",i+1),a.href=url.href,a.onclick=function(event){return star=i+1,M3.oninput(),!1},(star||i)&&star-1!=i||a.classList.add("W"),th.appendChild(a)}dir.appendChild(th),dir.id="stars-tr",stName.parentNode.parentNode.appendChild(dir)}if(info3.hasOwnProperty("nC")||info2.rM||info1.hasOwnProperty("gc")||info2.hasOwnProperty("gc")||info2.hasOwnProperty("wT")||info2.hasOwnProperty("hC")){const tr=document.createElement("tr"),th=document.createElement("th");if(tr.style.fontSize="larger",th.colSpan=6,info2.rM&&((dir=document.createElement("div")).textContent=["過關獎勵將會在再次出現時重置","清除狀況將會在再次出現時重置","可過關次數將會在再次出現時重置"][info2.rM-1],dir.classList.add("I"),th.appendChild(dir)),info2.hasOwnProperty("wT")){const span=document.createElement("div");span.classList.add("W"),span.textContent="成功挑戰冷卻時長："+info2.wT.toString()+"分鐘",th.appendChild(span)}if(info2.hasOwnProperty("hC")){const span=document.createElement("div");span.classList.add("I"),span.textContent="全破後隱藏",th.appendChild(span)}if(info1.hasOwnProperty("gc")||info2.hasOwnProperty("gc")){const span=document.createElement("div");span.classList.add("W"),span.textContent="※掃蕩不可※",th.appendChild(span)}if(info3.hasOwnProperty("nC")){const span=document.createElement("div");span.classList.add("w"),span.textContent="※接關不可※",th.appendChild(span)}tr.appendChild(th),tr.id="warn-tr",stName.parentNode.parentNode.appendChild(tr)}if(rewards.textContent="",info3.drop.length&&3!=M1.selectedIndex){var chances=getDropData();for(let i=0;i<info3.drop.length;++i)if(parseInt(chances[i])){var v=info3.drop[i];const tr=document.createElement("tr");var td1=document.createElement("td"),td2=document.createElement("td");td1.appendChild(document.createTextNode(chances[i]+"%"+(0==i&&100!=v[0]&&-4!=info3.rand?" (寶雷)":""))),td2.textContent=0==i&&(1==info3.rand||1e3<=info3.drop[0][1]&&info3.drop[0][1]<3e4)?"一次":"無",createReward(tr,v),tr.appendChild(td1),tr.appendChild(td2),rewards.appendChild(tr)}}rewards.children.length?rewards.parentNode.style.display="table":rewards.parentNode.style.display="none",m_drops.textContent="";for(let i=1;i<info2.mD.length;++i)if(!(info2.mD[i]<=0)){var img=new Image(128,128),rw=materialDrops[i-1];img.style.maxWidth="2.7em",img.style.height="auto",img.src=`/img/r/gatyaitemD_${duo(rw)}_f.png`;const td2=document.createElement("td"),tr=document.createElement("tr");var td0=document.createElement("td");td0.textContent=RWNAME[rw],tr.appendChild(td0),td2.appendChild(img),tr.appendChild(td2);const td1=document.createElement("td");td1.textContent=info2.mD[i]+"%",tr.appendChild(td1),m_drops.appendChild(tr)}if(m_drops.children.length?m_drops.parentNode.style.display="table":m_drops.parentNode.style.display="none",mM.textContent=`抽選次數: ${~~Math.round(info3.mM*info2.mP[star-1])}回`,info3.time){m_times.textContent="";for(let v of info3.time){const tr=document.createElement("tr"),td1=document.createElement("td"),td2=document.createElement("td");td1.textContent=v[2],td2.textContent=v[0],createReward(tr,v),tr.appendChild(td1),tr.appendChild(td2),m_times.appendChild(tr)}m_times.parentNode.style.display="table"}else m_times.parentNode.style.display="none";st1[1].textContent="/stages/14"==M1.selectedOptions[0].value?"喵力達"+String.fromCharCode(65+info3.e/1e3)+"×"+(info3.e%1e3).toString():info3.e,st1[3].textContent=info3.max,st1[5].textContent=info3.len,info2.hasOwnProperty("mapcond")?(st3[3].textContent="",st3[3].appendChild(getConditionHTML(info2.mapcond))):st3[3].textContent="無限制",st2[1].textContent=info3.H;var line,dir=document.createElement("a"),cas=t3str(info3.castle%1e3),cad=["rc","ec","wc","sc"][Math.floor(info3.castle/1e3)];dir.href="/img/"+cad+"/"+cad+cas+".png",dir.textContent=cas,st2[3].textContent="",st2[3].appendChild(dir);const a=document.createElement("a");a.href="/img/bg/bg"+t3str(info3.bg)+".png",a.textContent=t3str(info3.bg),st2[5].textContent="",st2[5].appendChild(a),info2.hasOwnProperty("stagecond")?(st3[5].textContent="",st3[5].appendChild(getConditionHTML(info2.stagecond))):st3[5].textContent="無限制",info3.xp||3==M1.selectedIndex&&(info3.xp=1e3+300*Math.min(M3.selectedIndex,47));let totalXP=info3.xp*(.95+.05*treasures[19]+.005*treasures[9]+.0025*treasures[10]);if([0,9,16].includes(M1.selectedIndex)&&(totalXP*=9),st3[1].textContent=~~totalXP,stLines.textContent="",info2.hasOwnProperty("Lim")){var cad=info2.Lim.map(x=>new Limit(x)),theStar=star-1,lim=new Limit,cas=M3.selectedOptions[0].value,my_sid=parseInt(cas.slice(cas.lastIndexOf("/")+1));for(l of cad)-1!=l.star&&l.star!=theStar||-1!=l.sid&&l.sid!=my_sid||lim.combine(l);dir=[];if(lim.rare&&dir.push("稀有度:"+getRarityString(lim.rare)),lim.num&&dir.push("最多可出戰角色數量:"+lim.num),lim.max&&lim.min?dir.push(`生產成本${lim.min}元與${lim.max}元之間`):lim.max?dir.push(`生產成本${lim.max}元以下`):lim.min&&dir.push(`生產成本${lim.min}元以上`),lim.line&&dir.push("出陣列表:僅限第1頁"),lim.group&&lim.group[1].length&&dir.push("可出擊角色的ID: "+lim.group[1].join("/")),dir.length){const tr=document.createElement("tr"),th=document.createElement("th");cas=document.createElement("div");cas.textContent="※出擊限制※："+dir.join("、"),cas.classList.add("W"),tr.style.fontSize="larger",th.colSpan=6,th.appendChild(cas),tr.appendChild(th),tr.id="limit-bt",stName.parentNode.parentNode.appendChild(tr)}}if(ex_stages.textContent="",0<info3.eC){cad=document.createElement("div");cad.textContent="EX關卡(出現機率 "+info3.eC+"%)",ex_stages.appendChild(cad);for(let i=info3.eI;i<=info3.eA;++i){const td=document.createElement("div");var info=JSON.parse(fs.readFileSync("/stages/4/"+info3.eM.toString()+"/"+i.toString()));const a=document.createElement("a");a.textContent=info.name||info.jpname,a.href="/stage.html?s=4-"+info3.eM.toString()+"-"+i.toString(),a.onclick=function(){return M1.value="/stages/4",M1.oninput(null,[null,info3.eM,i]),!1},td.appendChild(a),ex_stages.appendChild(td)}}else if(info3.hasOwnProperty("exS")){var dir=document.createElement("table"),tbody=(dir.classList.add("w3-table","w3-centered"),document.createElement("tbody"));const tr=document.createElement("tr"),td0=document.createElement("td"),td1=document.createElement("td");td0.textContent="EX關卡",td1.textContent="機率",tr.appendChild(td0),tr.appendChild(td1),tbody.appendChild(tr);for(let i=0;i<info3.exS.length;++i){const s=info3.exS[i],td0=document.createElement("td"),td1=document.createElement("td"),tr=document.createElement("tr"),a=document.createElement("a");var st=s%100,sm=~~(s%1e5/100),mc=~~(s/1e5);const sts=[mc,sm,st],info=JSON.parse(fs.readFileSync(`/stages/${mc}/${sm}/`+st));a.textContent=info.name||info.jpname,a.href=`/stage.html?v=${mc}-${sm}-`+st,a.onclick=function(event){return M1.value="/stages/"+sts[0],M1.oninput(null,sts),!1},td0.appendChild(a),td1.textContent=numStr(info3.exC[i])+"%",tr.appendChild(td0),tr.appendChild(td1),tbody.appendChild(tr)}dir.appendChild(tbody),ex_stages.appendChild(dir)}else if(info3.hasOwnProperty("enc")){const table=document.createElement("table"),tbody=(table.classList.add("w3-table","w3-centered"),document.createElement("tbody")),tr=document.createElement("tr"),td0=document.createElement("td"),td1=document.createElement("td");td0.textContent="EX關卡",td1.textContent="機率",tr.appendChild(td0),tr.appendChild(td1),tbody.appendChild(tr);for(let i=0;i<info3.eni.length;++i){const td0=document.createElement("td"),td1=document.createElement("td"),tr=document.createElement("tr");td1.textContent=numStr(info3.enc[i])+"%",tr.appendChild(td0),tr.appendChild(td1);var groups=hidden_groups[info3.eni[i]];for(let j=0;j<groups.length;++j){const a=document.createElement("a"),mc=~~(groups[j]/1e3),sm=groups[j]%1e3,info=JSON.parse(fs.readFileSync(`/stages/${mc}/${sm}/info`)),sts=(a.textContent=info.name||info.jpname,[mc,sm]);a.href=`/stage.html?v=${mc}-`+sm,a.onclick=function(event){return M1.value="/stages/"+sts[0],M1.oninput(null,sts),!1},td0.appendChild(a),j!=groups.length-1&&td0.appendChild(document.createTextNode(" or "))}tbody.appendChild(tr)}table.appendChild(tbody),ex_stages.appendChild(table)}ex_stages.children.length?ex_stages.style.display="block":ex_stages.style.display="none";for(line of info3.l){const tr=document.createElement("tr");var enemy=line[0];makeTd(tr,enemy_names[enemy]||"?");const img=new Image(64,64),a=document.createElement("a");var atkM=line[13]||100,hpM=line[9]||100;a.href=`/enemy.html?id=${enemy}&mag=${hpM}&atkMag=${atkM}&stageMag=`+mult,s=t3str(enemy),img.src="/img/e/"+s+"/enemy_icon_"+s+".png";const td=document.createElement("td");td.style.padding="0px",a.appendChild(img),td.appendChild(a),tr.appendChild(td);var s,enemy=mult/100,hpM=Math.ceil(hpM*enemy).toString()+"%",atkM=Math.ceil(atkM*enemy).toString()+"%",enemy=(makeTd(tr,hpM==atkM?hpM:`HP:${hpM},ATK:`+atkM),makeTd(tr,line[1]||"無限"),makeTd(tr,100<line[5]?line[5]:line[5].toString()+"%"),line[3]>line[4]&&(s=line[3],line[3]=line[4],line[4]=s),Math.abs(line[2])>=Math.abs(line[10])?makeTd(tr,line[2]):makeTd(tr,line[2]+"~"+line[10]),makeTd(tr,1==line[1]?"-":line[3]==line[4]?line[3]:line[3]+"~"+line[4]),makeTd(tr,line[14]),line[8]);if(2==enemy){const span=document.createElement("span");span.textContent="(BOSS,震波)",span.classList.add("boss"),tr.firstElementChild.appendChild(span)}else if(1==enemy){const span=document.createElement("span");span.textContent="(BOSS)",span.classList.add("boss"),tr.firstElementChild.appendChild(span)}stLines.appendChild(tr)}},document.getElementById("form").onsubmit=function(event){return event.preventDefault(),setTimeout(doSearch,0,event.currentTarget.firstElementChild),!1},window.onpopstate=()=>setTimeout(main,0);