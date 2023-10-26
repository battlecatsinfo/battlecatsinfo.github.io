var used_variables,cats,cats_old;const filter_expr=document.getElementById("filter-expr"),sort_expr=document.getElementById("sort-expr"),search_result=document.getElementById("search-result"),tbody=document.getElementById("tbody"),pages_a=document.getElementById("pages-a");var hide_seach=!1,last_forms,save_my_cats,fav_my_cats;const tables=document.getElementById("tables"),toggle_s=document.getElementById("toggle-s"),only_my_cats=document.getElementById("only-my-cats"),only_my_fav=document.getElementById("only-my-fav"),def_lv_e=document.getElementById("def-lv"),plus_lv_e=document.getElementById("plus-lv"),cattype_e=document.getElementById("cattype"),trait_s=document.getElementById("trait-s"),atk_s=document.getElementById("atk-s"),ab_s=document.getElementById("ab-s"),atkBtn=atk_s.firstElementChild.firstElementChild,traitBtn=trait_s.firstElementChild.firstElementChild,abBtn=ab_s.firstElementChild.firstElementChild,name_search=document.getElementById("name-search");function rerender(event){event.preventDefault();var id=event.currentTarget.id;if(pages_a.textContent="",9<=id){let i=0;var maxPage=Math.min(Math.ceil(last_forms.length/10),id+7);for(let c=id-2;c<=maxPage;++c){var td=document.createElement("td");if(td.textContent=c.toString(),td.onclick=rerender,(td.id=c)==id&&(td.classList.add("N"),td.onclick=null),pages_a.appendChild(td),10<=++i)break}}renderTable(last_forms,id)}function renderTable(forms,page=1){var H=10*page,display_forms=forms.slice(H-10,H);if(tbody.textContent="",search_result.textContent=`顯示第${H-9}到第${Math.min(forms.length,H)}個結果，共有${forms.length}個結果`,0==(last_forms=forms).length)tbody.innerHTML='<tr><td colSpan="13">沒有符合調件的貓咪!</td></tr>';else{if(!pages_a.children.length){let c=1;for(let i=0;i<forms.length;i+=10){var td=document.createElement("td");if(td.textContent=c.toString(),td.onclick=rerender,page==(td.id=c)&&(td.classList.add("N"),td.onclick=null),pages_a.appendChild(td),10<=c++)break}}for(let i=0;i<display_forms.length;++i){var tr=document.createElement("tr"),theForm=display_forms[i][1],base=(useCurve(cats_old[theForm.id].curve),_info=cats_old[theForm.id].info,Math.min(def_lv,_info.maxBase)),plus=Math.min(plus_lv,_info.maxPlus),texts=[theForm.id+"-"+(theForm.lvc+1),`Lv ${base} + `+plus,"","",~~theForm.gethp(),~~theForm.getatk(),Math.round(theForm.getdps()+Number.EPSILON),theForm.kb,theForm.range,numStrT(theForm.attackF),theForm.speed,numStr(1.5*theForm.price),numStr(display_forms[i][0])];for(let j=0;j<13;++j){var e=document.createElement("td");3==j?(theForm.name&&e.appendChild(document.createTextNode(theForm.name)),theForm.jp_name&&(e.appendChild(document.createElement("br")),e.appendChild(document.createTextNode(theForm.jp_name)))):e.textContent=texts[j].toString(),tr.appendChild(e)}(base=document.createElement("a")).href="./unit.html?id="+theForm.id.toString(),base.style.width="110px",base.style.height="85px",base.style.backgroundImage=`url(${theForm.icon})`,base.style.backgroundPosition="-10px -20px",base.style.display="inline-block",tr.children[2].appendChild(base),tbody.appendChild(tr)}}}function simplify(code){return code.replaceAll("\n","").replaceAll(" ","").replaceAll("\r","").replaceAll("\t","")}function calculate(code=""){pages_a.textContent="";const sortCode=simplify(sort_expr.value),url=(def_lv=Math.min(Math.max(parseInt(def_lv_e.value),1),60),plus_lv=Math.min(Math.max(parseInt(plus_lv_e.value),0),90),def_lv_e.value=def_lv,plus_lv_e.value=plus_lv,new URL(location.pathname,location.href));if(code.length){if(!code.length)return renderTable([]);url.searchParams.set("filter",code)}else{const codes=[],cattypes=Array.from(cattype_e.querySelectorAll(".o-selected"));if(cattypes.length){let M=cattypes.map(x=>x.getAttribute("data-expr"));url.searchParams.set("cattypes",M.join(" ")),codes.push(M.join("||"))}const traits=Array.from(trait_s.querySelectorAll(".o-selected"));if(traits.length){let M=traits.map(x=>x.getAttribute("data-expr"));url.searchParams.set("traits",M.join(" ")),"OR"==traitBtn.textContent?codes.push(M.join("||")):codes.push(M.join("&&"))}const atks=Array.from(atk_s.querySelectorAll(".o-selected"));if(atks.length){let M=atks.map(x=>x.getAttribute("data-expr"));url.searchParams.set("atks",M.join(" ")),"OR"==atkBtn.textContent?codes.push(M.join("||")):codes.push(M.join("&&"))}const abs=Array.from(ab_s.querySelectorAll(".o-selected"));if(abs.length){let M=abs.map(x=>x.getAttribute("data-expr"));url.searchParams.set("abs",M.join(" ")),"OR"==abBtn.textContent?codes.push(M.join("||")):codes.push(M.join("&&"))}code=codes.length?filter_expr.value=codes.map(x=>`(${x})`).join("&&"):"1"}var results=[],pcode;try{pcode=pegjs.parse(code)}catch(e){alert(e.toString())}let f=eval(`form => (${pcode})`);for(let i=0;i<cats.length;++i){let c=cats[i];useCurve(c.curve),_info=c.info;for(var form of c.forms)f(form)&&results.push(form)}try{pcode=pegjs.parse(sortCode||"1")}catch(e){alert(e.toString())}let fn=eval(`form => (${pcode})`);results=results.map((form,i)=>{var c=cats_old[form.id],c=(useCurve(c.curve),_info=c.info,fn(form));return[isFinite(c)?c:0,form]}).sort((a,b)=>b[0]-a[0]),renderTable(results),url.searchParams.set("deflv",def_lv),url.searchParams.set("pluslv",plus_lv),sortCode.length&&url.searchParams.set("sort",sortCode);const a="OR"==atkBtn.textContent?"1":"0",b="OR"==traitBtn.textContent?"1":"0",c="OR"==abBtn.textContent?"1":"0";url.searchParams.set("ao",a+b+c),history.pushState({},"",url)}function addBtns(parent,s){if(s){var c;s.split(" ");for(c of parent.querySelectorAll("button"))s.includes(c.parentNode.getAttribute("data-expr"))&&c.parentNode.classList.add("o-selected")}}async function loadStats(){return new Promise(resolve=>{var req=indexedDB.open("data",1);req.onupgradeneeded=function(event){event.target.result.createObjectStore("data",{keyPath:"i"})},req.onsuccess=function(event){const db=event.target.result;(event=db.transaction(["data"],"readwrite")).objectStore("data").get(0).onsuccess=function(event){(event=event.target.result)&&resolve(event.data),resolve(null)},event.oncomplete=function(){db.close()}}})}loadAllCats().then(_cats=>{cats_old=cats=_cats;_cats=new URLSearchParams(location.search);document.getElementById("loader").style.display="none",document.getElementById("loader-text").style.display="none",document.getElementById("main").style.display="block";for(let i=0;i<cats_old.length;++i){var TF=cats_old[i].forms[2];if(TF){var info=cats_old[i].info,talents=info.talents;if(talents){info.hasOwnProperty("talentT")&&(TF.trait|=info.talentT),TF.res={};for(let i=0;i<112&&info.talents[i];i+=14)TF.applyTalent(talents.subarray(i,i+14),info.talents[i+1]||1)}}}var sort,Q=_cats.get("q");Q?(plus_lv=0,def_lv=50,name_search.value=Q,name_search.oninput(),history.pushState({},"","/search.html")):(Q=_cats.get("filter"),sort=_cats.get("sort"),Q&&(filter_expr.value=Q),sort&&(sort_expr.value=sort),(sort=_cats.get("ao"))&&(atkBtn.textContent="1"==sort[0]?"OR":"AND",traitBtn.textContent="1"==sort[1]?"OR":"AND",abBtn.textContent="1"==sort[2]?"OR":"AND"),addBtns(cattype_e,_cats.get("cattypes")),addBtns(atk_s,_cats.get("atks")),addBtns(ab_s,_cats.get("abs")),addBtns(trait_s,_cats.get("traits")),calculate(Q||""))}),document.querySelectorAll("button").forEach(elem=>{elem.state="0",elem.addEventListener("click",function(event){"0"==(event=event.currentTarget).state?(event.parentNode.classList.add("o-selected"),event.state="1"):(event.parentNode.classList.remove("o-selected"),event.state="0"),calculate()})}),document.querySelectorAll(".or-and").forEach(e=>{e.onclick=function(event){"OR"==(event=event.currentTarget).textContent?event.textContent="AND":event.textContent="OR",calculate()}}),document.getElementById("filter-go").onclick=function(){calculate(simplify(filter_expr.value))},document.getElementById("filter-clear").onclick=function(){function fn(x){x.classList.remove("o-selected")}cattype_e.querySelectorAll(".o-selected").forEach(fn),trait_s.querySelectorAll(".o-selected").forEach(fn),atk_s.querySelectorAll(".o-selected").forEach(fn),ab_s.querySelectorAll(".o-selected").forEach(fn),filter_expr.value="",sort_expr.value="",calculate()},only_my_cats.onchange=async function(){if(!save_my_cats){if(!(save_my_cats=await loadStats()))return alert("尚未上傳遊戲存檔\n請先去 主頁->上傳遊戲存檔");save_my_cats=save_my_cats.cats}if(only_my_cats.checked){var my_cats=[];for(let i=0;i<cats_old.length;++i)save_my_cats[i]&&my_cats.push(cats_old[i]);cats=my_cats}else cats=cats_old;calculate(simplify(filter_expr.value))},only_my_fav.onchange=function(){if(!fav_my_cats){if(!(fav_my_cats=localStorage.getItem("star-cats"))||"[]"==fav_my_cats)return alert("我的最愛裡還沒有貓咪，去貓咪詳細資料新增");fav_my_cats=JSON.parse(fav_my_cats)}cats=only_my_fav.checked?fav_my_cats.map(x=>cats_old[x.id]):cats_old,calculate(simplify(filter_expr.value))},toggle_s.onclick=function(){hide_seach?(tables.style.left="390px",tables.style.width="calc(100% - 400px)",document.documentElement.style.setProperty("--mhide","block"),toggle_s.textContent="隱藏搜尋器"):(document.documentElement.style.setProperty("--mhide","none"),tables.style.left="0px",tables.style.width="100%",toggle_s.textContent="顯示搜尋器"),hide_seach=!hide_seach},name_search.oninput=function(){var c,search=name_search.value.trim();if(!search)return calculate(simplify(filter_expr.value));let digit=1<=search.length;for(c of search){var x=c.codePointAt(0);(x<48||57<x)&&(digit=!1)}var C,s=cats,results=[];if(digit){let x=parseInt(search);if(x<cats.length){s=[...cats];for(var f of cats[x].forms)results.push([1,f]);s.splice(x,1)}}for(C of s)for(let f of C.forms)(f.name.includes(search)||f.jp_name.includes(search))&&results.push([1,f]);renderTable(results)};