var cats,tooltip;const _fav=localStorage.getItem("star-cats"),fav_list=new Set(_fav?JSON.parse(_fav).map(x=>x.id):[]),cats_e=document.getElementById("cats"),main=cats_e.parentNode,Ms=main.getElementsByClassName("modal"),ab_e=document.getElementById("ab").children,undo=[],to_e=document.getElementById("to"),text_e=document.getElementById("text"),not_e=document.getElementById("not-f"),fav_only=document.getElementById("fav-only"),ex_only=document.getElementById("ex-only");let fav_setting=!1;function t3str(x){var s=x.toString();switch(s.length){case 2:return"0"+s;case 1:return"00"+s}return s}function onClick(event){var t=event.currentTarget,i=t.firstElementChild,id=parseInt(t.href.slice(t.href.lastIndexOf("?")+4));fav_setting&&(event.preventDefault(),i.classList.contains("grayscale")?(i.classList.remove("grayscale"),t.style.position="relative",(event=new Image(128,128)).style.position="absolute",event.src="/fav.png",event.style.left="0px",event.style.right="0px",event.style.zIndex=1,t.appendChild(event),fav_list.add(id)):(i.classList.add("grayscale"),t.removeChild(i.nextElementSibling),fav_list.delete(id)))}function add_unit(c){var img=new Image(128,128);const a=document.createElement("a");img.loading="lazy";var F=c.forms[0];img.src="https://battlecatsinfo.github.io"+F.icon,a.href="/unit.html?id="+F.id,a.onclick=onClick,a.appendChild(img),fav_list.has(c.forms[0].id)?(a.style.position="relative",(F=new Image(128,128)).style.position="absolute",F.src="/fav.png",F.style.left="0px",F.style.right="0px",F.style.zIndex=1,a.appendChild(F)):img.classList.add("grayscale"),cats_e.appendChild(a),img.onmouseover=function(){const t=setTimeout(function(){(tooltip=document.createElement("div")).textContent=c.forms.map(x=>x.name||x.jp_name).join(" → "),tooltip.classList.add("tooltip"),a.style.position="relative",a.appendChild(tooltip)},300);this.onmouseleave=function(){clearTimeout(t),tooltip&&(tooltip.parentNode.removeChild(tooltip),tooltip=null)}}}loadAllCats().then(_cs=>{cats=_cs,document.getElementById("loader").style.display="none",document.getElementById("loader-text").style.display="none",main.style.display="block";for(var cat of cats){var TF=cat.forms[2];if(TF){var info=cat.info,talents=info.talents;if(talents){info.hasOwnProperty("talentT")&&(TF.trait|=info.talentT),TF.res={};for(let i=0;i<112&&info.talents[i];i+=14)TF.applyTalent(talents.subarray(i,i+14),info.talents[i+1]||1)}}}});const rarity=document.getElementById("rarity"),trait=document.getElementById("trait-f"),G1=document.getElementById("G1"),G2=document.getElementById("G2"),G3=document.getElementById("G3");function ok(){undo.length=0;for(let x of Ms)if("block"==x.style.display){x.style.display="none";break}var results=new Set;let i;var chs=rarity.getElementsByClassName("selected");if(chs.length)if(fav_only.classList.contains("selected"))for(let x of chs){var r=parseInt(x.value);for(i of fav_list)cats[i].info.rarity==r&&results.add(i)}else for(let x of chs){const r=parseInt(x.value);for(i=0;i<cats.length;++i)cats[i].info.rarity==r&&results.add(i)}else if(fav_only.classList.contains("selected"))for(i of fav_list)results.add(i);else for(i=0;i<cats.length;++i)results.add(i);if((chs=trait.getElementsByClassName("selected")).length){let t=0;for(let x of chs)t|=parseInt(x.value);if(trait.previousElementSibling.src.endsWith("or.png"))for(var c of results)B:{for(var f of cats[c].forms)if(f.trait&t)break B;results.delete(c)}else for(let c of results)B:{for(let f of cats[c].forms)if(t==(f.trait&t))break B;results.delete(c)}}let abs=[],imu=0,res=[],d=!1;for(i of ab_e[1].getElementsByClassName("selected"))abs.push(parseInt(i.value));for(i of ab_e[2].getElementsByClassName("selected"))abs.push(parseInt(i.value));for(i of ab_e[3].getElementsByClassName("selected"))imu|=parseInt(i.value),d=!0;for(i of ab_e[4].getElementsByClassName("selected"))res.push(parseInt(i.value)),d=!0;if(abs.length||d)if(ab_e[0].src.endsWith("or.png"))loop:for(i=0;i<cats.length;++i){const c=cats[i];for(let f of c.forms){if(f.imu&imu)continue loop;for(let x of abs)if(x<1e3){if(f.ab.hasOwnProperty(x))continue loop}else if(f.atkType&x-1e3)continue loop;for(let x of res)if(f.res.hasOwnProperty(x))continue loop}results.delete(i)}else for(i=0;i<cats.length;++i){const c=cats[i];let t=!1;loop:for(let f of c.forms)if((f.imu&imu)==imu){for(let x of abs)if(x<1e3){if(!f.ab.hasOwnProperty(x))continue loop}else if((x-=1e3)!=(f.atkType&x))continue loop;for(let x of res)if(!f.res.hasOwnProperty(x))continue loop;t=!0;break}t||results.delete(i)}for(chs=to_e.getElementsByTagName("input"),i=1;i<5;++i)if(chs[i].checked){switch(i){case 1:for(let x of results)cats[x].info.hasOwnProperty("talents")&&results.delete(x);break;case 2:for(let x of results)cats[x].info.hasOwnProperty("talents")||results.delete(x);break;case 3:for(let x of results){const c=cats[x].info.talents;if(c)outer:{for(let j=0;j<112&&c[j];j+=14)if(1==c[j+13])break outer;results.delete(x)}else results.delete(x)}break;case 4:for(let x of results)4!=cats[x].forms.length&&results.delete(x)}break}d=!1;var s=new Set;for(i of[G1,G2,G3])for(let x of i.getElementsByClassName("selected")){for(var n of x.value.split(","))s.add(parseInt(n));d=!0}if(d)for(let x of results)s.has(x)||results.delete(x);if(!ex_only.classList.contains("selected"))for(x of results)cat_limits.has(x)&&results.delete(x);if(cats_e.textContent="",results.size){var sorted=new Array(results.size);i=0;for(const x of results)sorted[i++]=cats[x];sorted.sort((x,y)=>{x.info.rarity,y.info.rarity}),sorted.forEach(add_unit)}else not_e.style.display="block"}function clearAll(event){event.preventDefault(),event.stopPropagation();for(var x of Ms)if("block"==x.style.display){for(var n of Array.from(x.getElementsByClassName("selected")))n.classList.remove("selected");break}}function _clearAll(event){event.preventDefault(),event.stopPropagation();for(var x of Ms)for(var n of Array.from(x.getElementsByClassName("selected")))n.classList.remove("selected");cats_e.textContent="",cats.map(add_unit)}function ot(){this.nextElementSibling.style.display="block"}document.onclick=function(event){if(event.target==main||event.target.classList.contains("modal")){not_e.style.display="block",not_e.style.display="none";for(var x of Ms)if("block"==x.style.display){x.style.display="none";for(var b of undo)b.classList.toggle("selected");return void(undo.length=0)}}};for(let C of main.getElementsByClassName("C"))C.onclick=ot;for(let B of main.querySelectorAll(".M button"))B.value&&(B.onclick=function(){this.classList.toggle("selected"),undo.push(this)});ab_e[0].onclick=trait.previousElementSibling.onclick=function(){this.src.endsWith("or.png")?this.src="and.png":this.src="or.png"};const search_text=document.getElementById("name-search");function favorite(e){e=e.target;if("0"==e.getAttribute("data-s")){e.setAttribute("data-s","1"),e.textContent="★設定完畢",e.classList.add("fav");for(var x of main.getElementsByClassName("C"))x.style.visibility="hidden";cats_e.setAttribute("data-t","1"),fav_setting=!0}else{e.setAttribute("data-s","0"),e.textContent="★設定我的最愛",e.classList.remove("fav");for(let x of main.getElementsByClassName("C"))x.style.visibility="visible";cats_e.setAttribute("data-t","0"),fav_setting=!1;var arr=[];for(let x of fav_list){var c=cats[x];arr.push({id:x,icon:c.forms[0].icon,name:c.forms[0].name||c.forms[0].jp_name})}localStorage.setItem("star-cats",JSON.stringify(arr))}}document.getElementById("search-name").onclick=function(event){event.preventDefault();var q=search_text.value;let found=!1;for(let x of Ms)if("block"==x.style.display){x.style.display="none";break}if(cats_e.textContent="",q){let digit=1<=q.length;for(c of q){var x=c.codePointAt(0);(x<48||57<x)&&(digit=!1)}if(digit){const x=cats[parseInt(q)];x&&(found=!0,add_unit(x))}for(let i=0;i<cats.length;++i){const c=cats[i];for(var f of c.forms)if(f.name.includes(q)||f.jp_name.includes(q)){add_unit(c),found=!0;break}}return found||(not_e.style.display="block"),!1}},onkeydown=function(event){if("Escape"==event.key)for(var x of Ms)if("block"==x.style.display){x.style.display="none";for(var b of undo)b.classList.toggle("selected");return void(undo.length=0)}};