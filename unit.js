const my_params=new URLSearchParams(location.search),my_id=parseInt(my_params.get("id")),atk_mult_abs=new Set([AB_STRONG,AB_MASSIVE,AB_MASSIVES,AB_EKILL,AB_WKILL,AB_BAIL,AB_BSTHUNT,AB_S,AB_GOOD,AB_CRIT,AB_WAVE,AB_MINIWAVE,AB_MINIVOLC,AB_VOLC,AB_ATKBASE]),hp_mult_abs=new Set([AB_EKILL,AB_WKILL,AB_GOOD,AB_RESIST,AB_RESISTS,AB_BSTHUNT,AB_BAIL]),maxLen=[0,0];var my_cat,lvMax,tf_tbl,tf_tbl_s,custom_talents,custom_super_talents,orb_attr,orb_eff,orb_gradle,level_count=0,add_atk=0,orb_hp=1;isNaN(my_id)&&(my_id=0);const cat_icons=document.getElementById("cat-icons"),unit_content=document.getElementById("unit-content");function createResIcons(res,parent){var e,res_icon_names=["weak","freeze","slow","kb","wave","surge","curse","toxic","warp"],res_descs=["降攻耐性(受到降攻時間減少$%)","暫停耐性(受到暫停時間減少$%)","緩速耐性(受到緩速時間減少$%)","擊退耐性(受到擊退距離減少$%)","波動耐性(受到波動傷害減少$%)","烈波耐性(受到烈波傷害減少$%)","詛咒耐性(受到詛咒時間減少$%)","毒擊耐性(受到毒擊傷害減少$%)","抗傳耐性"];for(let i=0;i<=RES_WARP;++i)res.hasOwnProperty(i)&&((e=document.createElement("span")).classList.add("bc-icon",`bc-icon-res-${res_icon_names[i]}2`),parent.appendChild(e),(e=document.createElement("span")).textContent=res_descs[i].replace("$",res[i]),parent.appendChild(e),parent.appendChild(document.createElement("br")))}function createTraitIcons(trait,parent){if(trait){var e,names=["red","float","black","metal","angel","alien","zombie","relic","white","eva","witch","demon"];let i=0;for(let x=1;x<=TB_DEMON;x<<=1)trait&x&&((e=document.createElement("span")).classList.add("bc-icon","bc-icon-trait-"+names[i]),parent.appendChild(e)),++i;parent.appendChild(document.createElement("br"))}}function createAbIcons(form,p1,p2){function w1(msg,icon){var s1=document.createElement("span");s1.classList.add("bc-icon","bc-icon-"+icon),p1.appendChild(s1),(icon=document.createElement("span")).textContent=msg,p1.appendChild(icon),p1.appendChild(document.createElement("br"))}function w2(msg,icon){var s1=document.createElement("span");s1.classList.add("bc-icon","bc-icon-"+icon),p2.appendChild(s1),(icon=document.createElement("span")).textContent=msg,p2.appendChild(icon),p2.appendChild(document.createElement("br"))}let treasure=!1,tn,du;form.trait&&(tn=getTraitNames(form.trait),treasure=form.trait&trait_treasure);for(var[i,v]of Object.entries(form.ab))switch(parseInt(i)){case 1:w1(`血量${v[0]}%以下攻擊力增加${v[1]}%(${numStr(1+v[1]/100)}倍)`,"strong");break;case 2:w1(v+"%機率以1血存活一次","lethal");break;case 3:w1(`善於攻城，對塔傷害增加${v[0]}%(${numStr(1+v[0]/100)}倍)`,"atkbase");break;case 4:w1(v+"%機率會心一擊","crit");break;case 5:w1("終結不死","z-kill");break;case 6:w1("靈魂攻擊","ckill");break;case 7:w1(v[0]+"%機率打破宇宙盾","break");break;case 8:w1(v[0]+"%機率打破惡魔盾","shield-break");break;case 9:w1(`${v[0]}%機率渾身一擊(攻擊力增加${v[1]}%)`,"s");break;case 10:w1("擊倒敵人獲得兩倍金錢","bounty");break;case 11:w1("鋼鐵特性(爆擊、毒擊之外攻擊只會受1傷害)","metalic");break;case 12:w1(`${v[0]}%機率發射Lv${v[1]}小波動`,"mini-wave");break;case 13:w1(`${v[0]}%機率發射Lv${v[1]}波動`,"wave");break;case 14:w1(`${v[0]}%機率發射Lv${v[4]}小烈波(出現位置${v[1]}~${v[2]}，持續${numStrT(v[3])})`,"mini-volc");break;case 15:w1(`${v[0]}%機率發射Lv${v[4]}烈波(出現位置${v[1]}~${v[2]}，持續${numStrT(v[3])})`,"volc");break;case 16:w1(`波動滅止	`,"waves");break;case 17:w1("超生命體特效(傷害1.6倍、受傷害減少30%)","bail");break;case 18:w1(`超獸特效(對超獸敵人傷害2.5倍、減傷40%、${v[0]}%攻擊無效${numStrT(v[1])})`,"bsthunt");break;case 19:w1(`終結魔女	`,"wkill");break;case 20:w1("終結使徒","ekill");break;case 21:du=treasure?~~(v[2]*(1+treasures[23]/1500)):v[2],w2(`${v[0]}%機率降低${tn}攻擊力至${v[1]}%持續${numStrT(du)}，控場覆蓋率${getCoverUnit(form,v[0],du)}%`,"weak");break;case 22:du=treasure?~~(v[1]*(1+treasures[23]/1500)):v[1],w2(`${v[0]}%機率暫停${tn}持續${numStrT(du)}，控場覆蓋率${getCoverUnit(form,v[0],du)}%`,"stop");break;case 23:du=treasure?~~(v[1]*(1+treasures[23]/1500)):v[1],w2(`${v[0]}%機率緩速${tn}持續${numStrT(du)}，控場覆蓋率${getCoverUnit(form,v[0],du)}%`,"slow");break;case 24:w2("只能攻擊"+tn,"only");break;case 25:w2(`對${tn}傷害${treasure?numStr(orb_good_atk+1.5+(treasure?treasures[23]/1e3:0)):"1.5"}倍，受到傷害減少`+numStr(1/orb_good_hp*(.5+(treasure?treasures[23]/3e3:0))),"good");break;case 26:w2(`受到${tn}攻擊的傷害減至`+numStr(orb_resist/(4+(treasure?treasures[23]/300:0))),"resist");break;case 27:w2(`受到${tn}攻擊的傷害減至1/`+(treasure?300==treasures[23]?"7":numStr(6+treasures[23]/300):"6"),"resists");break;case 28:w2(`對${tn}造成${numStr(orb_massive+(3+(treasure?treasures[23]/300:0)))}倍傷害`,"massive");break;case 29:w2(`對${tn}造成${treasure?300==treasures[23]?"6":numStr(5+treasures[23]/300):"5"}倍傷害`,"massives");break;case 30:w2(v[0]+"%機率擊退"+tn,"kb");break;case 31:w2(v[0]+"%機率傳送"+tn,"warp");break;case 32:w2(`對${tn}${v[0]}%發動攻擊無效持續`+numStrT(v[1]),"imu-atk");break;case 33:du=treasure?~~(v[1]*(1+treasures[23]/1500)):v[1],w2(`${v[0]}%機率詛咒${tn}持續${numStrT(du)}，控場覆蓋率${getCoverUnit(form,v[0],du)}%`,"curse");break;case 37:var img=document.createElement("img");img.src="/img/i/Suicide.png",p1.appendChild(img),(img=document.createElement("span")).textContent="一次攻擊",p1.appendChild(img),p1.appendChild(document.createElement("br"))}}function getCombinations(arr){if(!arr.length)return[];for(var combi=[],slent=2<<arr.length-1,i=0;i<slent;i++){for(var temp=[],j=0;j<arr.length;j++)i&(j?2<<j-1:1)&&temp.push(arr[j]);temp.length&&combi.push(temp)}return combi}function getAtk(form,line,theATK,parent,first,plus,attackS){function mul(arr,s,ab=!0){for(let i=0;i<arr.length;++i)(ab||form.abi&1<<2-i)&&(arr[i]*=s)}var treasure,lines=[],spec=!1,t_ef=!1,eva_ef=!1;for(const ab of line)switch(parseInt(ab[0])){case AB_WAVE:lines.push("波動"),mul(theATK,null!=attackS?1+ab[1]/100:2,!1);break;case AB_MINIWAVE:mul(theATK,null!=attackS?1+ab[1]/500:1.2,!1),lines.push("小波動");break;case AB_VOLC:mul(theATK,null!=attackS?1+ab[5]*ab[1]/100:1+ab[5],!1),lines.push("烈波");break;case AB_MINIVOLC:mul(theATK,null!=attackS?1+ab[5]*ab[1]/500:1+.2*ab[5],!1),lines.push("小烈波");break;case AB_GOOD:treasure=(spec=form.trait&trait_treasure&&form.trait&trait_no_treasure)?first:form.trait&trait_treasure,mul(theATK,1.5+(2==form.lvc?orb_good_atk:0)+(treasure?treasures[23]/1e3:0)),lines.push("善攻"),t_ef=!0;break;case AB_CRIT:mul(theATK,null!=attackS?1+ab[1]/100:2,!1),lines.push("爆");break;case AB_STRONG:mul(theATK,1+ab[2]/100),lines.push("增攻");break;case AB_S:mul(theATK,null!=attackS?1+ab[1]*ab[2]/1e4:1+ab[2]/100,!1),lines.push("渾身");break;case AB_ATKBASE:mul(theATK,1+ab[1]/100),lines.push("塔");break;case AB_MASSIVE:mul(theATK,((treasure=(spec=form.trait&trait_treasure&&form.trait&trait_no_treasure)?first:form.trait&trait_treasure)?300==treasures[23]?4:3+treasures[23]/300:3)+(2==form.lvc?orb_massive:0)),lines.push("大傷"),t_ef=!0;break;case AB_MASSIVES:mul(theATK,(treasure=(spec=form.trait&trait_treasure&&form.trait&trait_no_treasure)?first:form.trait&trait_treasure)?300==treasures[23]?6:5+treasures[23]/300:5),lines.push("極傷"),t_ef=!0;break;case AB_EKILL:lines.push("使徒"),mul(theATK,5),eva_ef=!0;break;case AB_WKILL:mul(theATK,5),lines.push("魔女"),eva_ef=!0;break;case AB_BSTHUNT:mul(theATK,2.5),lines.push("超獸"),t_ef=!0;break;case AB_BAIL:mul(theATK,1.6),lines.push("超生命體"),t_ef=!0}if(2==form.lvc&&add_atk){var a=[my_cat.forms[2].atk,my_cat.forms[2].atk1,my_cat.forms[2].atk2];for(let i=0;i<theATK.length;++i)theATK[i]+=add_atk*a[i]}if(!eva_ef||!t_ef){let s=lines.join("・"),atkstr=(s+=":","");if(plus&&(atkstr+="+"),null!=attackS){let t=0;for(var x of theATK)t+=~~x;atkstr+=Math.round(t/attackS+Number.EPSILON).toString()}else atkstr+=theATK.map(x=>~~x).join("/");if(s+=atkstr,spec)return first?(s+="("+get_trait_short_names(form.trait&trait_treasure)+")",maxLen[1]=s.length,parent.appendChild(document.createTextNode(s)),!0):(s="/"+atkstr+"("+get_trait_short_names(form.trait&trait_no_treasure)+")",maxLen[0]=Math.max(s.length+maxLen[1],maxLen[0]),parent.appendChild(document.createTextNode(s)),void parent.appendChild(document.createElement("br")));maxLen[0]=Math.max(s.length,maxLen[0]),parent.appendChild(document.createTextNode(s)),parent.appendChild(document.createElement("br"))}return!1}function getAtkString(form,atks,Cs,level,parent,plus,attackS){atks=atks.map(x=>~~(~~(Math.round(x*getLevelMulti(level))*atk_t)*form.atkM)),parent.textContent="";let first;var m1=new Float64Array(atks);if(2==form.lvc&&add_atk){var a=[my_cat.forms[2].atk,my_cat.forms[2].atk1,my_cat.forms[2].atk2];for(let i=0;i<m1.length;++i)m1[i]+=add_atk*a[i]}if(null!=attackS){let t=0;for(var x of m1)t+=~~x;first=Math.round(t/attackS+Number.EPSILON).toString()}else first=m1.join("/");if(parent.appendChild(document.createTextNode(plus?"+"+first:first)),!plus){parent.appendChild(document.createElement("br"));for(var line of Cs)getAtk(form,line,new Float64Array(atks),parent,!0,plus,attackS)&&getAtk(form,line,new Float64Array(atks),parent,!1,plus,attackS)}}function getHp(lvc,line,theHP,parent,first,trait,plus,KB){var treasure,lines=[],spec=!1,t_ef=!1,eva_ef=!1;for(const ab of line)switch(parseInt(ab[0])){case AB_GOOD:treasure=(spec=trait&trait_treasure&&trait&trait_no_treasure)?first:trait&trait_treasure,theHP/=(2==lvc?orb_good_hp:1)*(.5-(treasure?treasures[23]/3e3:0)),lines.push("善攻"),t_ef=!0;break;case AB_RESIST:theHP*=((treasure=(spec=trait&trait_treasure&&trait&trait_no_treasure)?first:trait&trait_treasure)?4+treasures[23]/300:4)/(2==lvc?orb_resist:1),lines.push("耐打"),t_ef=!0;break;case AB_RESISTS:theHP*=(treasure=(spec=trait&trait_treasure&&trait&trait_no_treasure)?first:trait&trait_treasure)?6+treasures[23]/300:6,lines.push("超級耐打"),t_ef=!0;break;case AB_EKILL:lines.push("使徒"),theHP*=5,eva_ef=!0;break;case AB_WKILL:theHP*=10,lines.push("魔女"),eva_ef=!0;break;case AB_BSTHUNT:theHP/=.6,lines.push("超獸");break;case AB_BAIL:theHP/=.7,lines.push("超生命體"),t_ef=!0}if(!t_ef||!eva_ef){let s=lines.join("・");s+=":",2==lvc&&1!=orb_hp&&(theHP*=2-orb_hp),theHP=(~~(theHP/KB)).toString();line=plus?"+"+theHP:theHP;if(s+=line,spec)return first?(s+="("+get_trait_short_names(trait&trait_treasure)+")",parent.appendChild(document.createTextNode(s)),maxLen[1]=s.length,!0):(s="/"+line+"("+get_trait_short_names(trait&trait_no_treasure)+")",maxLen[0]=Math.max(maxLen[1]+s.length,maxLen[0]),parent.appendChild(document.createTextNode(s)),void parent.appendChild(document.createElement("br")));maxLen[0]=Math.max(s.length,maxLen[0]),parent.appendChild(document.createTextNode(s)),parent.appendChild(document.createElement("br"))}return!1}function getHpString(form,Cs,trait,level,parent,plus,KB){parent.textContent="";var hp=~~(~~(Math.round(form.hp*getLevelMulti(level))*hp_t)*form.hpM);let theHP=hp;2==form.lvc&&1!=orb_hp&&(theHP*=2-orb_hp);var line,level=(~~(theHP/KB)).toString();parent.appendChild(document.createTextNode(plus?"+"+level:level)),parent.appendChild(document.createElement("br"));for(line of Cs)getHp(form.lvc,line,hp,parent,!0,trait,plus,KB)&&getHp(form.lvc,line,hp,parent,!1,trait,plus,KB)}function updateValues(form,tbl){var chs=tbl.children,HPs=chs[1].children,HPPKBs=chs[2].children,ATKs=chs[3].children,DPSs=chs[4].children,PRs=chs[8].children,CD=chs[7].children[5],KB=chs[7].children[1],levels=(chs[7].children[3].textContent=form.speed.toString(),PRs[2].textContent=form.price,PRs[4].textContent=numStr(1.5*form.price),PRs[6].textContent=2*form.price,new Array(5));let lvE=chs[0].children[1],i;var attackS=form.attackF/30;for(i=0;i<lvMax;++i)levels[i]=parseInt(lvE.textContent.slice(2)),lvE=lvE.nextElementSibling;var PRs=Object.entries(form.ab),HCs=getCombinations(PRs.filter(x=>hp_mult_abs.has(parseInt(x[0]))).map(x=>Array.prototype.concat(x[0],x[1])));for(i=1;i<=5;++i)i>lvMax?HPs[i].textContent="-":getHpString(form,HCs,form.trait,levels[i-1],HPs[i],!1,1);for(getHpString(form,HCs,form.trait,1,HPs[i],!0,5),i=1;i<=5;++i)i>lvMax?HPPKBs[i].textContent="-":getHpString(form,HCs,form.trait,levels[i-1],HPPKBs[i],!1,form.kb);getHpString(form,HCs,form.trait,1,HPPKBs[i],!0,5*form.kb);var atks=[form.atk,form.atk1,form.atk2].filter(x=>x),ACs=getCombinations(PRs.filter(x=>atk_mult_abs.has(parseInt(x[0]))).map(x=>Array.prototype.concat(x[0],x[1])));for(i=1;i<=5;++i)i>lvMax?ATKs[i].textContent="-":getAtkString(form,atks,ACs,levels[i-1],ATKs[i],!1);for(getAtkString(form,atks.map(x=>.2*x),ACs,1,ATKs[i],!0),i=1;i<=5;++i)i>lvMax?DPSs[i].textContent="-":getAtkString(form,atks,ACs,levels[i-1],DPSs[i],!1,attackS);getAtkString(form,atks,ACs,1,DPSs[i],!0,5*attackS),chs[6].children[1].textContent=numStrT(form.tba),chs[6].children[3].textContent=numStrT(form.backswing),chs[5].children[1].textContent=numStrT(form.attackF).replace("秒","秒/下"),38<maxLen[0]?tbl.style.fontSize="max(16px, 0.9vw)":26<maxLen[0]&&(tbl.style.fontSize="max(17px, 1vw)");var PRs=numStrT(form.pre),tbl=(form.pre1&&(PRs+="/"+numStrT(form.pre1)),form.pre2&&(PRs+="/"+numStrT(form.pre2)),chs[5].children[3].textContent=PRs,""),PRs=(form.atkType&ATK_OMNI?tbl+="全方位":form.atkType&ATK_LD&&(tbl+="遠方"),tbl+=form.atkType&ATK_RANGE?"範圍攻擊":"單體攻擊",chs[5].children[6].textContent=tbl,chs[9].children[1]),lds=form.lds,ldr=form.ldr;if(PRs.textContent="",form.atkType&ATK_KB_REVENGE&&((tbl=document.createElement("p")).textContent="擊退反擊",PRs.appendChild(tbl)),form.atk1||form.atk2){var tbl=form.atk2?3:2,atksPre=[form.atk,form.atk1,form.atk2].slice(0,tbl).map(x=>(x/(form.atk+form.atk1+form.atk2)*100).toFixed(0)+"%");const p=document.createElement("p");p.textContent=`${tbl}回連續攻擊(傷害${atksPre.join("-")})`+getAbiString(form.abi),PRs.appendChild(p)}if(lds[0]||ldr[0]){var s="";for(let i=0;i<lds.length;++i){var x=lds[i],y=x+ldr[i];s+=x<=y?""+"①②③"[i]+x+`~${y}<br>`:""+"①②③"[i]+y+`~${x}<br>`}chs[5].children[5].innerHTML=`接觸點${form.range}<br>範圍<br>`+s.slice(0,s.length-4)}else chs[5].children[5].textContent=form.range;KB.textContent=form.kb.toString(),CD.textContent=numStrT(getRes(form.cd))}function makeTd(parent,text=""){var c=document.createElement("td");return c.textContent=text,parent.appendChild(c),c}function updateTable(TF,tbl){updateValues(TF,tbl);tbl=tbl.children;tbl[9].children[1].textContent="",tbl[10].children[1].textContent="",tbl[11].children[1].textContent="",tbl[12].children[1].textContent="",createTraitIcons(TF.trait,tbl[9].children[1]),createImuIcons(TF.imu,tbl[10].children[1]),createResIcons(TF.res,tbl[10].children[1]),createAbIcons(TF,tbl[11].children[1],tbl[12].children[1])}function renderForm(form,_super){var info=my_cat.info;if(2==level_count&&null!=info.upReqs){var container=document.createElement("table"),td=(container.classList.add(".w3-table","w3-centered","fruit","w3-card-4"),form.involve&&(tr=document.createElement("tr"),(td=document.createElement("td")).colSpan=info.upReqs.length,td.innerHTML=form.involve,tr.appendChild(td),container.appendChild(tr)),document.createElement("tr")),tr1=document.createElement("tr");for(const r of info.upReqs){var img=new Image(128,128),div=document.createElement("td"),p=(div.style.width="128px",document.createElement("p"));r[1]?(img.src=`/img/r/gatyaitemD_${r[1]}_f.png`,p.textContent="×"+r[0].toString()):(img.src="/img/r/gatyaitemD_06_f.png",p.textContent=r[0].toString()),div.appendChild(img),div.appendChild(p),tr1.appendChild(div)}container.appendChild(td),container.appendChild(tr1),unit_content.appendChild(container)}var tr=document.createElement("p"),info=document.createElement("table"),theadtr=document.createElement("tr"),tbodytr1=document.createElement("tr"),tbodytr2=document.createElement("tr"),tbodytr3=document.createElement("tr"),tbodytr4=document.createElement("tr"),td=document.createElement("tr"),container=document.createElement("tr"),tbodytr7=document.createElement("tr"),tbodytr8=document.createElement("tr"),tbodytr9=document.createElement("tr"),tbodytr10=document.createElement("tr"),tbodytr11=document.createElement("tr"),tbodytr12=document.createElement("tr"),_super=(tr.innerHTML=["一階：<br>","二階：<br>","三階：<br>","本能完全升滿的數值表格","超本能完全升滿的數值表格"][level_count]+(level_count<=2&&my_cat.forms[level_count].desc||""),makeTd(theadtr),_super?6:1),II=4+_super;for(let i=_super;i<=II;++i){var e=makeTd(theadtr,"Lv"+10*i);e.contentEditable=!0,e._form=form,e._val=10*i,e.addEventListener("blur",function(event){var event=event.currentTarget,tbl=event.parentNode.parentNode,M=my_cat.info.maxBase+my_cat.info.maxPlus,num=event.textContent.match(/\d+/);num?(num=Math.max(1,Math.min(parseInt(num[0]),M)),event._val=num,event.textContent="Lv"+num,updateValues(event._form,tbl)):event.textContent=event._val})}makeTd(theadtr,"每提升一級"),makeTd(tbodytr1,"HP");for(let i=0;i<6;++i)makeTd(tbodytr1,"-");makeTd(tbodytr2,"硬度");for(let i=0;i<6;++i)makeTd(tbodytr2,"-");makeTd(tbodytr3,"攻擊力");for(let i=0;i<6;++i)makeTd(tbodytr3,"-");makeTd(tbodytr4,"DPS");for(let i=0;i<6;++i)makeTd(tbodytr4,"-");makeTd(td,"攻擊頻率"),makeTd(td),makeTd(td,"出招時間"),makeTd(td);_super=makeTd(td,"射程");_super.rowSpan=2,_super.classList.add("modd"),makeTd(td).rowSpan=2;{let x=makeTd(td);x.rowSpan=3,x.classList.add("modd")}makeTd(container,"攻擊間隔"),makeTd(container),makeTd(container,"收招時間"),makeTd(container),makeTd(tbodytr7,"KB"),makeTd(tbodytr7),makeTd(tbodytr7,"跑速"),makeTd(tbodytr7),makeTd(tbodytr7,"再生產"),makeTd(tbodytr7),makeTd(tbodytr8,"召喚金額"),makeTd(tbodytr8,"一章"),makeTd(tbodytr8),makeTd(tbodytr8,"二章(傳說)"),makeTd(tbodytr8),makeTd(tbodytr8,"三章"),makeTd(tbodytr8),makeTd(tbodytr9,"屬性").style.textAlign="center",makeTd(tbodytr9).colSpan=6,makeTd(tbodytr10,"抗性").style.textAlign="center",makeTd(tbodytr10).colSpan=6,makeTd(tbodytr11,"能力").style.textAlign="center",makeTd(tbodytr11).colSpan=6,makeTd(tbodytr12,"效果").style.textAlign="center",makeTd(tbodytr12).colSpan=6,tbodytr9.classList.add("spec"),tbodytr10.classList.add("spec"),tbodytr11.classList.add("spec"),tbodytr12.classList.add("spec"),info.appendChild(theadtr),info.appendChild(tbodytr1),info.appendChild(tbodytr2),info.appendChild(tbodytr3),info.appendChild(tbodytr4),info.appendChild(td),info.appendChild(container),info.appendChild(tbodytr7),info.appendChild(tbodytr8),info.appendChild(tbodytr9),info.appendChild(tbodytr10),info.appendChild(tbodytr11),info.appendChild(tbodytr12),updateValues(form,info),createTraitIcons(form.trait,tbodytr9.children[1]),createImuIcons(form.imu,tbodytr10.children[1]),form.res&&createResIcons(form.res,tbodytr10.children[1]),createAbIcons(form,tbodytr11.children[1],tbodytr12.children[1]),tbodytr9.children[1].children.length||(tbodytr9.style.display="none"),tbodytr10.children[1].children.length||(tbodytr10.style.display="none"),tbodytr11.children[1].children.length||(tbodytr11.style.display="none"),tbodytr12.children[1].children.length||(tbodytr12.style.display="none"),info.classList.add("w3-table","w3-centered");let odd=!0;for(let e of info.children)odd&&e.classList.add("modd"),odd=!odd;return unit_content.appendChild(tr),unit_content.appendChild(info),++level_count,info}async function applyOrb(){if(orb_attr){if(!orb_attr._loaded)return}else(orb_attr=new Image).crossOrigin="anonymous",orb_attr.src="https://cdn.discordapp.com/attachments/1148597630012768267/1153284863135326208/0.png",orb_attr.onload=function(){this._loaded=!0,applyOrb()};if(orb_eff){if(!orb_eff._loaded)return}else(orb_eff=new Image).crossOrigin="anonymous",orb_eff.src="https://cdn.discordapp.com/attachments/1148597630012768267/1153284863399563315/1.png",orb_eff.onload=function(){this._loaded=!0,applyOrb()};if(orb_gradle){if(!orb_gradle._loaded)return}else(orb_gradle=new Image).crossOrigin="anonymous",orb_gradle.src="https://cdn.discordapp.com/attachments/1148597630012768267/1153284863747707021/2.png",orb_gradle.onload=function(){this._loaded=!0,applyOrb()};orb_massive=0,orb_resist=orb_hp=1,orb_good_atk=0;var C2=[orb_good_hp=1,1,88,1,175,1,1,88,88,88],C1=[1,1,88,1,175,1,262,1,349,1,1,88,88,88,175,88,262,88,349,88];let idx;for(let i=add_atk=0;i<my_cat.info.orbC;++i){var tr=document.getElementById("orb-"+i).children,s1=tr[0].firstElementChild.selectedIndex,s2=tr[2].firstElementChild.selectedIndex,s3=tr[1].firstElementChild.selectedIndex,tr=tr[3].firstElementChild.getContext("2d");if(tr.clearRect(0,0,85,85),s1&&(idx=s1+s1-2,tr.drawImage(orb_attr,C1[idx],C1[idx+1],85,85,0,0,85,85)),s3&&(idx=s3+s3-2,tr.drawImage(orb_eff,C2[idx],C2[idx+1],85,85,0,0,85,85)),s2&&(idx=s2+s2-2,tr.drawImage(orb_gradle,C2[idx],C2[idx+1],85,85,0,0,85,85)),s1&&s3){switch(s3){case 1:add_atk+=s2;break;case 2:orb_hp-=.04*s2;break;case 3:my_cat.forms[2].ab.hasOwnProperty(AB_GOOD)?(orb_good_hp-=.02*s2,orb_good_atk+=.06*s2):alert("提醒\n強化善於攻擊本能玉只能用在有善於攻擊效果的貓咪上");break;case 4:my_cat.forms[2].ab.hasOwnProperty(AB_MASSIVE)?orb_massive+=s2/10:alert("提醒\n強化超大傷害只能用在有超大傷害效果的貓咪上");break;case 5:my_cat.forms[2].ab.hasOwnProperty(AB_RESIST)?orb_resist-=.05*s2:alert("提醒\n強化很耐打本能玉只能用在有很耐打效果的貓咪上")}tr=new Form(structuredClone(my_cat.forms[2]));tr.applyTalents(my_cat.info,custom_talents),updateTable(tr,tf_tbl),tf_tbl_s&&(tr.applySuperTalents(my_cat.info.talents,custom_super_talents),updateTable(tr,tf_tbl_s))}}}function renderOrbs(){var table=document.createElement("table"),tr0=document.createElement("tr"),th0=document.createElement("td");th0.colSpan=4,th0.textContent=`本能玉(可裝置數量:${my_cat.info.orbC})`,tr0.appendChild(th0),table.appendChild(tr0);for(let i=0;i<my_cat.info.orbC;++i){var x,tr=document.createElement("tr"),td0=(tr.id="orb-"+i,document.createElement("td")),td1=document.createElement("td"),td2=document.createElement("td"),td3=document.createElement("td"),o0=document.createElement("select"),o1=document.createElement("select"),o2=document.createElement("select");let o;for(x of["-","紅色敵人","漂浮敵人","黑色敵人","鋼鐵敵人","天使敵人","異星敵人","不死敵人","古代種(暫無開放)","無屬性(暫無開放)","惡魔"])(o=document.createElement("option")).textContent=x,o0.appendChild(o);for(let x of["-","D","C","B","A","S"])(o=document.createElement("option")).textContent=x,o2.appendChild(o);for(let x of["-","提升傷害","減輕傷害","強化善於攻擊","強化超大傷害","強化很耐打"])(o=document.createElement("option")).textContent=x,o1.appendChild(o);td0.appendChild(o0),td1.appendChild(o1),td2.appendChild(o2);var canvas=document.createElement("canvas");canvas.style.width="2.5em",canvas.style.height="2.5em",canvas.width=85,canvas.height=85,td3.appendChild(canvas),o0.selectedIndex=o1.selectedIndex=o2.selectedIndex=0,o0.oninput=o1.oninput=o2.oninput=applyOrb,tr.appendChild(td0),tr.appendChild(td1),tr.appendChild(td2),tr.appendChild(td3),table.appendChild(tr)}table.classList.add("w3-table","w3-centered","tcost","orb"),unit_content.appendChild(table)}function renderExtras(){var tr,e,table=document.createElement("table"),th=document.createElement("tr"),td0=document.createElement("td"),td0=(td0.colSpan=2,td0.textContent="其他資訊",th.appendChild(td0),document.createElement("tr")),tr2=(makeTd(td0,"稀有度"),makeTd(td0,my_cat.info.getRarityString()),document.createElement("tr")),tr3=(makeTd(tr2,"最大基本等級"),makeTd(tr2,my_cat.info.maxBase.toString()),document.createElement("tr")),ic=(makeTd(tr3,"最大加值等級"),makeTd(tr3,"+"+my_cat.info.maxPlus.toString()),table.appendChild(th),table.appendChild(td0),table.appendChild(tr2),table.appendChild(tr3),my_cat.ic.split("|"));for(let i=0;i<ic.length;++i)ic[i]&&(makeTd(tr=document.createElement("tr"),["取得方式","二階進化","三階進化"][i]),makeTd(tr,ic[i]),table.appendChild(tr));if(my_cat.info.hasOwnProperty("unclockS")){const tr=document.createElement("tr");th=document.createElement("td"),td0=document.createElement("a");th.appendChild(td0),td0.textContent="世界篇第"+my_cat.info.unclockS%100+"關",td0.href="/stage.html?s=3-9-"+(my_cat.info.unclockS-1).toString(),makeTd(tr,"解鎖關卡"),tr.appendChild(th),table.appendChild(tr)}if(my_cat.info.hasOwnProperty("unclockFood")){const tr=document.createElement("tr");makeTd(tr,my_cat.info.rarity?"購買所需貓罐頭":"購入XP"),makeTd(tr,my_cat.info.unclockFood),table.appendChild(tr)}if(my_cat.info.hasOwnProperty("obtain")){var id,list=["Cat_Capsules","Rare_Cats","Super_Rare_Cats","Grandon_Mining_Corps","Neneko_and_Gang","Reinforcements","Brainwashed_Cats","Crazed_Cats","Killer_Cats","Li_l_Cats","Purchasable_Special_Cats","Main_Chapters_Unlockable","Legend_Chapters_Unlockable","Heavenly_Tower_Unlockable","Advent_and_Cyclone_Drops","Ancient_Eggs","Monthly_Event_Cats","Uberfest","Epicfest","S1","S2","Best_of_the_Best","10th_Anniversary","Tales_of_the_Nekoluga","The_Dynamites","Sengoku_Wargods_Vajiras","Cyber_Academy_Galaxy_Gals","Lords_of_Destruction_Dragon_Emperors","Ancient_Heroes_Ultra_Souls","Justice_Strikes_Back__Dark_Heroes","The_Almighties_The_Majestic_Zeus","Frontline_Assault_Iron_Legion","Nature_s_Guardians_Elemental_Pixies","Girls___Monsters__Angels_of_Terror","Valentine_Gals","White_Day","Easter_Carnival","June_Bride","Gals_of_Summer","Halloween_Capsules","Xmas_Gals","Red_Busters","Air_Busters","Metal_Busters","Wave_Busters","Colossus_Busters","Dynasty_Fest","Royal_Fest","Princess_Punt","Merc_Storia","Survive__Mola_Mola_","Shoumetsu_Toshi","Metal_Slug_Defense","Puella_Magi_Madoka_Magica","Crash_Fever","Fate_Stay_Night__Heaven_s_Feel","Power_Pro_Baseball","Neon_Genesis_Evangelion","Neon_Genesis_Evangelion_2nd","Bikkuriman","Street_Fighter_V","Hatsune_Miku","Ranma_1_2","Castle___Dragon","River_City_Clash"],nlist=["貓咪轉蛋+","常駐稀有貓","常駐激稀有貓","土龍鑽部隊","限定激稀有系列","貓咪軍團支援隊","洗腦貓","狂亂貓","殺意貓","小小貓","EX罐頭購買貓","世界/未來/宇宙/魔界掉落貓","傳說關卡掉落貓","風雲貓咪塔掉落貓","降臨和漩渦關卡掉落","遠古的蛋","月份貓","超級貓咪祭","特級貓咪祭","卓越群組","超強精選","特級選拔祭","日版10週年紀念 ","傳說中的不明貓一族","超激烈爆彈","戰國武神巴薩拉斯","電腦學園銀河美少女","超破壞大帝龍皇因佩拉斯","超古代勇者超級靈魂勇者","逆襲的戰士黑暗英雄","究極降臨巨神宙斯","革命軍隊鋼鐵戰團","古靈精怪元素小精靈","絕命美少女怪物萌娘隊","情人節淑女們","白色情人節轉蛋","復活節嘉年華","完美新娘","夏日美少女團","萬聖節轉蛋","聖誕美少女","紅色破壞者","漂浮破壞者","鋼鐵破壞者","波動破壞者","超生命體破壞者","超國王祭","女王祭","公主踢騎士Sweets","梅露可物語","活下去！曼波魚！","消滅都市","越南大戰DEFENSE","魔法少女小圓","Crash Fever","劇場版 Fate/stay night","實況野球","福音戰士合作轉蛋","福音戰士合作轉蛋2nd","聖魔大戰","快打旋風","初音未來","亂馬1/2","城與龍","熱血！大運動會"];for(id of my_cat.info.obtain){const tr=document.createElement("tr"),td=(makeTd(tr,"轉蛋"),document.createElement("td")),a=document.createElement("a");a.textContent=nlist[id],a.href="/gacha/"+list[id]+".html",td.appendChild(a),tr.appendChild(td),table.appendChild(tr)}}if(my_cat.info.hasOwnProperty("rw")){const tr=document.createElement("tr"),td=document.createElement("td"),a=document.createElement("a");td.appendChild(a);tr2=my_cat.info.rw.join("-");a.textContent="#"+tr2,a.href="/stage.html?s="+tr2,makeTd(tr,"破關掉落"),tr.appendChild(td),table.appendChild(tr)}if(my_cat.info.hasOwnProperty("tf")){const tr=document.createElement("tr"),td=document.createElement("td"),a=document.createElement("a"),s=(td.appendChild(a),my_cat.info.tf.join("-"));a.textContent="#"+s,a.href="/stage.html?s="+s,makeTd(tr,"進化條件"),tr.appendChild(td),table.appendChild(tr)}my_cat.info.version&&(tr3=my_cat.info.version.toString(),(td0=document.createElement("div")).textContent=`Ver ${parseInt(tr3.slice(0,2))}.${parseInt(tr3.slice(2,4))}.${parseInt(tr3.slice(4))} 新增`,td0.classList.add("r-ribbon"),document.body.appendChild(td0)),table.classList.add("w3-table","w3-centered","tcost");let odd=!0;for(e of table.children)odd&&e.classList.add("modd"),odd=!odd;unit_content.appendChild(table)}function getTalentInfo(talent){function range(name,f="%",start=2){var end=start+1;return[name,talent[start].toString()+f,talent[end].toString()+f,talent[1].toString(),numStr((talent[end]-talent[start])/(talent[1]-1))+f]}var snd=talent[4]!=talent[5];switch(talent[0]){case 1:return talent[6]!=talent[7]?range("降攻程度","%",6):snd?range("降攻時間","F",4):range("降攻機率");case 2:return snd?range("暫停時間","F",4):range("暫停機率");case 3:return snd?range("緩速時間","F",4):range("緩速機率");case 4:return"只能攻擊";case 5:return"善於攻擊";case 6:return"耐打";case 7:return"超大傷害";case 8:return range("擊退機率","%");case 10:return snd?range("升攻","%",4):range("升攻");case 11:return snd?range("死前存活","%",4):range("死前存活");case 12:return"善於攻城";case 13:return snd?range("會心一擊","%",4):"會心一擊";case 14:return"殭屍殺手";case 15:return snd?range("破盾","%",4):range("破盾");case 16:return"雙倍金錢";case 17:return snd?range("波動","%",4):range("波動");case 18:return range("降攻耐性");case 19:return range("暫停耐性");case 20:return range("緩速耐性");case 21:return range("擊退耐性");case 22:return range("波動耐性");case 23:return"波動滅止";case 24:return range("抗傳耐性");case 25:return["成本減少",numStr(1.5*talent[2]),numStr(1.5*talent[3]),talent[1],numStr(1.5*talent[2])];case 26:return range("生產速度","F");case 27:return range("移動速度");case 29:return"詛咒無效";case 30:return range("詛咒耐性");case 31:return range("攻擊力");case 32:return range("血量");case 33:return"對紅色敵人";case 34:return"對漂浮敵人";case 35:return"對黑色敵人";case 36:return"對鋼鐵敵人";case 37:return"對天使敵人";case 38:return"對異星敵人";case 39:return"對不死敵人";case 40:return"對古代種";case 41:return"對白色種";case 42:return"對魔女";case 43:return"對使徒";case 44:return"降攻無效";case 45:return"暫停無效";case 46:return"緩速無效";case 47:return"擊退無效";case 48:return"波動無效";case 49:return"傳送無效";case 50:return snd?range("渾身攻擊力","%",4):range("渾身機率");case 51:return snd?range("攻撃無効","F",4):range("攻撃無効");case 52:return range("毒擊耐性");case 53:return"毒擊無效";case 54:return range("烈波耐性");case 55:return"烈波無效";case 56:return talent[8]!=talent[9]?range("烈波距離","%",8):talent[6]!=talent[7]?range("烈波距離","%",6):snd?range("烈波機率","%",4):range("烈波機率");case 57:return"對惡魔";case 58:return range("破惡魔盾");case 59:return"靈魂攻擊";case 60:return snd?range("詛咒時間","F",4):range("詛咒機率");case 61:return range("TBA縮短");case 62:return snd?range("小波動等級","",4):range("小波動機率");case 63:return"超生命體特效";case 64:return"超獸特效";case 65:return talent[8]!=talent[9]?range("小烈波距離","%",8):talent[6]!=talent[7]?range("小烈波距離","%",6):snd?range("小烈波等級","",4):range("小烈波機率")}return"???"}function rednerTalentInfos(talents,_super=!1){var e,table=document.createElement("table"),tr1=document.createElement("tr"),td0=document.createElement("td"),td0=(td0.textContent=(_super?"超":"")+"本能解放",td0.colSpan=5,tr1.appendChild(td0),table.appendChild(tr1),document.createElement("tr")),tr1=document.createElement("td"),td2=document.createElement("td"),td3=document.createElement("td"),td4=document.createElement("td"),td5=document.createElement("td"),infos=(tr1.textContent=my_cat.forms[2].name||my_cat.forms[2].jp_name,td2.textContent="Lv1",td3.textContent="Lv10",td4.textContent="最高等級",td5.textContent="每提升一級",td0.appendChild(tr1),td0.appendChild(td2),td0.appendChild(td3),td0.appendChild(td4),td0.appendChild(td5),table.appendChild(td0),[]);for(let i=0;i<112;i+=14){var tr=document.createElement("tr");if(!talents[i])break;if(_super==(1==talents[i+13])){var info=getTalentInfo(talents.subarray(i,i+14));if(info instanceof Array){infos.push(info[0]);let td=null;for(var s of info)(td=document.createElement("td")).textContent=s,tr.appendChild(td);td.textContent="+"+td.textContent}else{infos.push(info);var t1=document.createElement("td"),t2=document.createElement("td");t1.textContent="能力新增",t2.textContent=info,t2.colSpan=4,tr.appendChild(t1),tr.appendChild(t2)}table.appendChild(tr)}}let odd=!0;for(e of table.children)odd&&e.classList.add("modd"),odd=!odd;return table.classList.add("w3-table","w3-centered","tcost"),unit_content.appendChild(table),infos}function calcCost(event){var t=event.currentTarget,idx=Array.prototype.indexOf.call(t.parentNode.children,t),event=t.parentNode.parentNode;let i=0;t.classList.add("o-selected");for(const e of event.children){var x=e.children[idx];x&&(x==t?t._super?custom_super_talents[idx-1]=i-1:custom_talents[idx-1]=i-1:x.classList.contains("o-selected")&&x.classList.remove("o-selected"),++i)}let e=event.children[2];for(var costs=new Uint16Array(e.children.length-1),selectMap=new Uint8Array(costs.length);;){var chs=e.children;if(-1==chs[0].textContent.indexOf("Lv"))break;for(let j=1;j<=costs.length;++j)selectMap[j-1]||(costs[j-1]+=parseInt(chs[j].textContent.replace("-","0"))),chs[j].classList.contains("o-selected")&&(selectMap[j-1]=1);e=e.nextElementSibling}var cis=e.children;for(let j=1;j<=costs.length;++j)cis[j].textContent=costs[j-1];e.nextElementSibling.firstElementChild.textContent="共"+costs.reduce((a,b)=>a+b,0);event=new Form(structuredClone(my_cat.forms[2]));event.applyTalents(my_cat.info,custom_talents),updateTable(event,tf_tbl),t._super&&event.applySuperTalents(my_cat.info.talents,custom_super_talents),tf_tbl_s&&updateTable(event,tf_tbl_s)}function renderTalentCosts(talent_names,talents,_super=!1){var skill_costs=[[25,5,5,5,5,10,10,10,10,10],[5,5,5,5,5,10,10,10,10,10],[50],[50,10,10,10,10,15,15,15,15,15],[10,10,10,10,10,15,15,15,15,15],[75],[75,15,15,15,15,20,20,20,20,20],[15,15,15,15,15,20,20,20,20,20],[100],[150],[250],[100,15,15,15,15,25,25,25,25,25],[75,10,10,10,10,20,20,20,20,20],[120,20,20,20,20,25,25,25,25,25]],table=document.createElement("table"),th=document.createElement("tr");const td0=document.createElement("td");table.style.userSelect="none",td0.textContent="消耗NP一覽",th.appendChild(td0);var names=[],costs=[],maxLvs=[];let c=0;for(let i=0;i<112&&talents[i];i+=14)_super==(1==talents[i+13])&&(names.push(talent_names[c]),costs.push(talents[i+11]-1),maxLvs.push(talents[i+1]||1),++c);_super?custom_super_talents=maxLvs:custom_talents=maxLvs;var tr1=document.createElement("tr"),td1=(td0.colSpan=names.length+1,document.createElement("td"));td1.textContent="等級",tr1.appendChild(td1);for(let i=0;i<names.length;++i){var td=document.createElement("td");td.textContent=names[i],tr1.appendChild(td)}var tr2=document.createElement("tr");for(let i=0;i<=names.length;++i){const td=document.createElement("td");td.textContent=0==i?"Lv0":"0",td.addEventListener("click",calcCost),td._super=_super,tr2.appendChild(td)}table.appendChild(th),table.appendChild(tr1),table.appendChild(tr2);for(let i=1;i<=10;++i){var tr=document.createElement("tr");const td0=document.createElement("td");td0.textContent="Lv"+i.toString(),tr.appendChild(td0);for(let j=0;j<names.length;++j){const td=document.createElement("td");var tbl=skill_costs[costs[j]];td.textContent=i>maxLvs[j]?"-":tbl[i-1],tr.appendChild(td),"-"!=td.textContent&&td.addEventListener("click",calcCost),td._super=_super}table.appendChild(tr)}var trend=document.createElement("tr"),td1=document.createElement("td");td1.textContent="總計",td1.rowSpan=2;let total=0;trend.appendChild(td1);for(let i=0;i<costs.length;++i){const td=document.createElement("td");let s=0;for(let j=0;j<maxLvs[i];++j)s+=skill_costs[costs[i]][j];td.textContent=s.toString(),total+=s,trend.appendChild(td)}table.appendChild(trend);var e,th=document.createElement("tr"),td1=document.createElement("td");td1.colSpan=names.length,td1.textContent="共"+total.toString(),th.appendChild(td1),table.appendChild(th);let odd=!0;for(e of table.children)odd&&e.classList.add("modd"),odd=!odd;table.classList.add("w3-table","w3-centered","tcost"),unit_content.appendChild(table)}function renderCombos(){var limits=["世界篇第一章","世界篇第二章","世界篇第三章","未來篇第一章","未來篇第二章","未來篇第三章","宇宙篇第一章","宇宙篇第二章","宇宙篇第三章"],combo_f=["角色攻擊力+$%","角色體力+$%","角色移動速度+$%","初期貓咪砲能量值+$格","初期工作狂貓等級+$","初期所持金額$元","貓咪砲攻擊力+$%","貓咪砲充電速度加快$f","工作狂貓的工作效率+$%","工作狂貓錢包+$%","城堡耐久力+$%","研究力-$%(滿金寶10%=26.4F，所有效果相加後取整數)","會計能力+$%","學習力+$%","「善於攻擊」的效果+$%","「超大傷害」的效果+$%","「很耐打」的效果+$%","「打飛敵人」的效果+$%","「使動作變慢」的效果+$%","「使動作停止」的效果+$%","「攻擊力下降」的效果+$%","「攻擊力上升」的效果+$%","「終結魔女」的效果+$%","「終結使徒」的效果+$%","「會心一擊」的發動率+$%"],combo_params=[[10,15,20,30],[10,20,30,50],[10,15,20,30],[20,40,60,100],[1,2,3,4],[300,500,1e3,2e3],[20,50,100,200],[20,30,40,50],[10,20,30,50],[10,20,30,50],[20,50,100,200],[10,20,30,40,50],[10,20,30,50],[10,15,20,30],[10,20,30,50],[10,20,30,50],[10,20,30,50],[10,20,30,50],[10,20,30,50],[10,20,30,50],[10,20,30,50],[20,30,50,100],[400,400,400,400,400],[400,400,400,400,400],[1,2,3,4]],table=document.createElement("table");for(let j=0;j<combos.length;++j){var C=combos[j],units=C[3];for(let i=0;i<units.length;i+=2)if(my_id==units[i]){var tr=document.createElement("tr"),type=C[1],lv=C[2],td=document.createElement("td"),p=document.createElement("p"),p2=document.createElement("p"),p3=document.createElement("p3"),a=(p3.style.fontSize="smaller",td.appendChild(p),td.appendChild(p2),document.createElement("a"));a.href="/combos.html#"+C[0],a.textContent=C[0],a.style.textDecoration="none",p.appendChild(a),p2.textContent=combo_f[type].replace("$",combo_params[type][lv])+"【"+["小","中","大","究極"][lv]+"】",tr.appendChild(td),1e4<C[4]?(p3.textContent="等排"+[2700,1450,2150][C[4]-10001],td.appendChild(p3)):1<C[4]&&(p3.textContent=""+limits[C[4]-1],td.appendChild(p3));for(let c=0;c<units.length;c+=2){const td=document.createElement("td");var img=new Image,my_id_str=t3str(units[c]),form_str="fcs"[units[c+1]];const a=document.createElement("a");a.href="./unit.html?id="+units[c].toString(),img.src=`/img/u/${my_id_str}/${form_str}/uni${my_id_str}_${form_str}00.png`,a.appendChild(img),td.appendChild(a),tr.appendChild(td)}table.appendChild(tr);break}}if(table.children.length){table.classList.add("w3-table","w3-centered","combo");const p=document.createElement("p");p.textContent="聯組資訊",unit_content.appendChild(p),unit_content.appendChild(table)}}function renderUintPage(){for(var form of my_cat.forms){var img=new Image;img.src=form.icon,cat_icons.appendChild(img)}for(let form of my_cat.forms)renderForm(form);if(document.getElementById("loader").style.display="none",document.getElementById("loader-text").style.display="none",document.getElementById("main").style.display="block",my_cat.info.talents){unit_content.appendChild(document.createElement("hr"));var TF=new Form(structuredClone(my_cat.forms[2])),_super=(renderTalentCosts(rednerTalentInfos(my_cat.info.talents),my_cat.info.talents),TF.applyTalents(my_cat.info,custom_talents));if(tf_tbl=renderForm(TF),_super){unit_content.appendChild(document.createElement("hr"));const names=rednerTalentInfos(my_cat.info.talents,!0);renderTalentCosts(names,my_cat.info.talents,!0),TF.applySuperTalents(my_cat.info.talents,custom_super_talents),tf_tbl_s=renderForm(TF,!0)}}my_cat.info.orbC&&renderOrbs(),renderExtras(),renderCombos()}loadCat(my_id).then(res=>{my_cat=res,useCurve(my_cat.curve);var res=my_cat.forms.map(x=>x.jp_name).filter(x=>x).join(" → "),cat_names=my_cat.forms.map(x=>x.name).filter(x=>x).join(" → "),abar=(document.getElementById("ch_name").textContent=cat_names,document.getElementById("jp_name").textContent=res,lvMax=Math.min(my_cat.info.maxBase+my_cat.info.maxPlus,50)/10,renderUintPage(),document.title=cat_names.replaceAll(" → "," ")+" - 貓咪資訊",document.getElementById("abar")),res=abar.children,s=(res[1].href="https://battlecats-db.com/unit/"+t3str(my_id+1)+".html",res[2].href="./levelgraph1.html?id="+my_id.toString(),res[3].href="./levelgraph2.html?id="+my_id.toString(),res[4].href="./levelgraph3.html?id="+my_id.toString(),res[5].href="./levelgraph4.html?id="+my_id.toString(),res[6].href="./xpgraph.html?data="+btoa(my_cat.info.xp_data),t3str(my_id));res[7].onclick=function(){var oldList=localStorage.getItem("star-cats");(oldList=null==oldList?[]:JSON.parse(oldList)).push({id:my_id,icon:my_cat.forms[0].icon,name:my_cat.forms[0].name}),localStorage.setItem("star-cats",JSON.stringify(oldList))};for(let i=0;i<my_cat.forms.length;++i){var c,a=document.createElement("a");a.classList.add("w3-bar-item"),a.textContent="ImgCut - "+(i+1).toString()+"階";let imgfile,cutfile;cutfile=my_cat.forms[i].icon.startsWith("/img/s")?(c=my_cat.forms[i].icon.slice(7,10),imgfile=`/img/s/${c}/${c}_m.png`,`/img/s/${c}/${c}_m.imgcut`):(c="fcs"[i],imgfile=`/img/u/${s}/${c}/${s}_${c}.png`,`/data/unit/${s}/${c}/${s}_${c}.imgcut`),a.href="/anim/imgcut.html?cutfile="+cutfile+"&imgfile="+imgfile,abar.appendChild(a)}{const a=document.createElement("a");a.classList.add("w3-bar-item"),a.href="/anim/anim.html?id="+my_id.toString(),a.textContent="檢視動畫",abar.appendChild(a)}{const a=document.createElement("a");a.classList.add("w3-bar-item"),a.textContent="UDP",a.href="https://thanksfeanor.pythonanywhere.com/UDP/"+s,abar.appendChild(a)}{const a=document.createElement("a");a.classList.add("w3-bar-item"),a.textContent="Fandom",a.href="https://battle-cats.fandom.com/wiki/"+my_cat.info.fandom,abar.appendChild(a)}});