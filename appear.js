const url=new URL(location.href);let Q=url.searchParams.get("id");if(!Q)throw document.write("請指定要搜尋的敵人 id！（如 /appear.html?id=5 ）"),"";if((Q=parseInt(Q))<0||isNaN(Q))throw alert("Invalid Enemy id!"),"";const img=document.getElementById("eicon"),ss=t3str(Q),main_div=(img.src="/img/e/"+ss+"/enemy_icon_"+ss+".png",document.getElementById("main"));var Buffer=BrowserFS.BFSRequire("buffer").Buffer;const materialDrops=[85,86,87,88,89,90,91,140,187,188,189,190,191,192,193,194];function t3str(x){var s=x.toString();switch(s.length){case 2:return"0"+s;case 1:return"00"+s}return s}function loadStage(){return new Promise(resolve=>{var req=indexedDB.open("stage",16);req.onupgradeneeded=function(event){event=event.target.result;try{event.deleteObjectStore("data")}catch(e){}event.createObjectStore("data",{keyPath:"name"}).createIndex("data","",{unique:!1})},req.onsuccess=function(event){const db=event.target.result;db.transaction("data").objectStore("data").get("stages").onsuccess=function(event){event=event.target.result;if(event)return resolve(event.data);fetch("/stages.zip").then(res=>res.arrayBuffer()).then(buffer=>{var tx=db.transaction(["data"],"readwrite");tx.objectStore("data").put({name:"stages",data:buffer}),tx.oncomplete=function(){db.close()},resolve(buffer)})}}})}BrowserFS.install(window),loadStage().then(function(zipData){BrowserFS.configure({fs:"ZipFS",options:{zipData:Buffer.from(zipData)}},function(e){e?console.error(e):(fs=BrowserFS.BFSRequire("fs"),s1=fs.readdirSync("/stages"),GO(),main_div.style.display="block")})});var d1,d2,s1,s2,s3,i1,i2,i3,m1,m2,m3,j,k,i=0,num_results=!1;function GO(){if(null==(m1="group"==(m1=s1[i])?s1[++i]:m1))num_results||(main_div.textContent="<h1>沒有結果</h1>");else{for(i1=JSON.parse(fs.readFileSync(`/stages/${m1}/info`)),s2=fs.readdirSync("/stages/"+m1),d1=d1||document.createElement("details"),j=0;j<s2.length;++j)if(d2=d2||document.createElement("details"),"info"!=(m2=s2[j])){for(i2=JSON.parse(fs.readFileSync(`/stages/${m1}/${m2}/info`)),s3=fs.readdirSync(`/stages/${m1}/`+m2),k=0;k<s3.length;++k)if("info"!=(m3=s3[k]))for(var line of(i3=JSON.parse(fs.readFileSync(`/stages/${m1}/${m2}/`+m3))).l)if(line[0]==Q){num_results=!0;line=document.createElement("a");line.href="/stage.html?s="+[i,j,k].join("-"),line.textContent=[i3.name,i3.jpname].filter(x=>x).join(" - "),d2.appendChild(line);break}var x;d2.children.length&&((x=document.createElement("summary")).textContent=[i2.name,i2.jpname].filter(x=>x).join(" - "),d2.appendChild(x),d1.appendChild(d2),d2=null)}if(d1.children.length){const x=document.createElement("summary");x.textContent=i1.name,d1.appendChild(x),main_div.appendChild(d1),d1=null}++i,setTimeout(GO,0)}}