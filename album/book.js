(() => {
  "use strict";
  const M=window.AlbumModel,U=window.AlbumUI,P=window.AlbumPages,L=window.AlbumLog;
  const {esc:h,icon}=U,$=id=>document.getElementById(id);
  const embedded=window.parent!==window && new URLSearchParams(location.search).has("game");
  const origin=location.origin==="null"?"*":location.origin;
  const nav=[["cover","book","文明の表紙"],["profile","profile","文明プロフィール"],["chapters","eras","時代別文明史"],["collection","award","歴史的偉業"],["rise","chart","盛衰と転換点"],["ties","links","因果関係と計画"],["log","log","完全プレーログ"]];
  const books=[];
  let current=-1,m=null,enabled=new Set(Object.keys(M.metrics)),locked=false,observer;
  const node=document.currentScript;
  const assetRoot=new URL(".",node.src);
  const sampleUrl=new URL('sample.js',assetRoot).href;
  function tell(s){$("notice").hidden=!s;$("notice").textContent=s;}
  const label=b=>(b.source==="sample"?"収録サンプル ／ ":b.source==="game"?"プレー中の記録 ／ ":"")+b.model.name+" · "+(b.model.last??"—")+"T"+(b.file?" ／ "+b.file:"");
  function insert(raw,source,file) {
    const model=M.make(raw),book={raw,model,source,file};
    const idx=source==="game"?books.findIndex(b=>b.source==="game"):-1;
    if(idx>=0){books[idx]=book;return idx;}
    books.push(book);return books.length-1;
  }
  function choose(idx) {
    const book=books[idx];if(!book)return;
    m=book.model; current=idx;locked=false;enabled=new Set(Object.keys(M.metrics));
    $("shelf").replaceChildren(...books.map((b,i)=>new Option(label(b),i,i===idx,i===idx)));
    $("source").textContent=({sample:"同梱のプレー記録",game:"現在のゲームから表示",file:book.file})[book.source];
    $("crumb").innerHTML=icon("shelf",16)+"<span>文明史アルバム</span>"+icon("next",12)+"<b>"+h(m.name)+"</b>";
    $("pages").innerHTML=P.cover(m)+P.bookmarks(m)+P.profile(m)+P.chapters(m)+P.collection(m,locked)+P.rise(m,enabled)+P.ties(m)+L.page(m);
    observe();active("cover");window.scrollTo(0,0);
  }
  function active(id){for(const link of $("toc").children){const on=link.hash==="#"+id;link.classList.toggle("on",on);if(on)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current");}}
  function observe(){
    observer?.disconnect();
    if(!window.IntersectionObserver)return;
    observer=new IntersectionObserver(items=>{
      const hit=items.filter(x=>x.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
      if(hit)active(hit.target.id);
    },{rootMargin:"-8% 0px -66% 0px"});
    for(const [id] of nav)observer.observe($(id));
  }
  function filter(){if(m)$("log-rows").innerHTML=L.rows(m,$("log-era").value,$("log-topic").value);}
  function showTurn(t){
    if(!m?.byTurn.has(t))return;
    if(!$("event-"+t)){$("log-era").value=$("log-topic").value="all";filter();}
    const row=$("event-"+t);row.open=true;fill(row);row.scrollIntoView({block:"start"});row.querySelector("summary").focus({preventScroll:true});
  }
  function fill(row){const dest=row.querySelector(".log-entry");if(dest && !dest.hasChildNodes())dest.innerHTML=L.entry(m,m.byTurn.get(Number(row.dataset.turn)));}
  function inspect(t){const p=m.marked.get(t);if(!p)return;$("inspected").innerHTML=P.eventCard(m,p);}
  function shelfMenu(open){document.body.classList.toggle("menu-open",open);$("menu").setAttribute("aria-expanded",String(open));}
  document.addEventListener("toggle",e=>{if(e.target.matches?.(".log-row[open]"))fill(e.target);},true);
  $("pages").addEventListener("click",e=>{
    const log=e.target.closest("[data-log]"),pin=e.target.closest("[data-inspect]");
    if(log)showTurn(Number(log.dataset.log));
    if(pin)inspect(Number(pin.dataset.inspect));
  });
  $("pages").addEventListener("keydown",e=>{if(e.target.matches("[data-inspect]")&&["Enter"," "].includes(e.key)){e.preventDefault();inspect(Number(e.target.dataset.inspect));}});
  $("pages").addEventListener("change",e=>{
    const k=e.target.dataset.metric;
    if(k){if(e.target.checked)enabled.add(k);else enabled.delete(k);$("graph").innerHTML=U.graph(m,enabled);}
    if(e.target.id==="locked"){locked=e.target.checked;$("collection").outerHTML=P.collection(m,locked);$("locked").focus({preventScroll:true});observe();}
    if(e.target.id==="path-select")$("chain-map").innerHTML=P.chain(m,+e.target.value);
    if(["log-topic","log-era"].includes(e.target.id))filter();
  });
  matchMedia("(max-width:650px)").addEventListener("change",()=>{if(m)$("graph").innerHTML=U.graph(m,enabled);});
  $("toc").innerHTML=nav.map(([id,ico,name])=>`<a href="#${id}">${icon(ico)}<span>${name}</span></a>`).join("");
  $("toc").addEventListener("click",e=>{const a=e.target.closest("a");if(a){active(a.hash.slice(1));shelfMenu(false);}});
  $("brand-icon").innerHTML=icon("book",28);
  for(const [id,ico] of [["import","upload"],["compare","compare"],["menu","menu"],["export","save"],["print","print"],["return","back"]]) $(id).insertAdjacentHTML("afterbegin",icon(ico));
  $("menu").onclick=()=>shelfMenu(!document.body.classList.contains("menu-open"));
  $("shelf").onchange=e=>{choose(+e.target.value);shelfMenu(false);tell("");};
  $("import").onclick=()=>$("files").click();
  $("files").onchange=async e=>{
    const files=[...e.target.files],errors=[];let selected=-1,count=0;
    for(const file of files){try{const raw=JSON.parse((await file.text()).replace(/^\uFEFF/,""));selected=insert(raw,"file",file.name);count++;}catch{errors.push(file.name);}}
    e.target.value="";if(selected>=0)choose(selected);
    tell((count?count+"件の年代記を開きました。":"")+(errors.length?" 年代記JSONを確認してください（"+errors.join("、")+"）。":""));
    if($("comparison").open)comparison();
  };
  $("print").onclick=()=>window.print();
  $("export").onclick=()=>{
    if(!m)return;
    const a=document.createElement("a"),url=URL.createObjectURL(new Blob([JSON.stringify(m.raw,null,2)+"\n"],{type:"application/json"}));
    a.href=url;a.download="civrogue-"+M.str(m.raw.seed,"album").replace(/[^a-zA-Z0-9_-]/g,"_")+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  function comparison(a=current,b=books.findIndex((_,i)=>i!==a)) {
    const wrap=$("compare-body");
    if(books.length<2){wrap.innerHTML='<p>比較する文明の年代記JSONをもう1冊開いてください。</p><button class="tool primary" id="compare-import">JSONを開く</button>';$("compare-import").onclick=()=>$("files").click();return;}
    const pair=[books[a].model,books[b].model];
    function select(id,idx){return `<select aria-label="${id==="left"?"左":"右"}の文明" id="compare-${id}">${books.map((book,i)=>`<option value="${i}" ${i===idx?"selected":""}>${h(label(book))}</option>`).join("")}</select>`;}
    const row=(name,fn)=>`<tr><th scope="row">${h(name)}</th>${pair.map(x=>`<td>${h(fn(x))}</td>`).join("")}</tr>`;
    wrap.innerHTML=`<div class="compare-picks">${select("left",a)}${select("right",b)}</div>${pair[0].raw.version!==pair[1].raw.version?"<p class='compare-note'>異なる版の記録です。勝利条件、ターン上限、偉業の有無が異なる場合があります。</p>":""}<table><thead><tr><th>項目</th>${pair.map(x=>"<th>"+h(x.name)+"</th>").join("")}</tr></thead><tbody>${[
      row("ルール版",x=>x.raw.version!=null?"v0."+x.raw.version:"記録なし"),row("結末",x=>x.statusText),row("ターン",x=>x.last??"記録なし"),row("政治・統治",x=>x.regime),
      ...Object.entries(M.metrics).map(([k,[n]])=>row(n,x=>x.values[k]??"記録なし")),row("主な分野",x=>x.strongest.map(k=>M.metrics[k][0]).join("・")||"記録なし"),
      row("偉業",x=>Array.isArray(x.raw.achievements)?x.awards.map(P.awardName).join("・")||"0件":"記録なし"),row("経済危機",x=>Array.isArray(x.raw.crises)?x.crises.length+"件":"記録なし")].join("")}</tbody></table>`;
    $("compare-left").onchange=e=>comparison(+e.target.value,+e.target.value===b?a:b);$("compare-right").onchange=e=>comparison(+e.target.value===a?b:a,+e.target.value);
  }
  $("compare").onclick=()=>{comparison();$("comparison").showModal();};$("close-compare").onclick=()=>$("comparison").close();
  if(embedded){
    $("return").onclick=e=>{e.preventDefault();window.parent.postMessage({type:"civrogue-album-close"},origin);};
    window.addEventListener("message",e=>{
      if(e.source!==parent||e.origin!==location.origin||e.data?.type!=="civrogue-album-report")return;
      try{const i=insert(e.data.report,"game");if(current<0||current===i)choose(i);}catch{tell("現在の年代記を読み込めませんでした。");}
    });
    parent.postMessage({type:"civrogue-album-ready"},origin);
  }else{
    const script=document.createElement("script");script.src=sampleUrl;
    script.onload=()=>{const i=insert(window.AlbumSample,"sample");if(current<0)choose(i);else $("shelf").add(new Option(label(books[i]),i));};
    script.onerror=()=>{$("pages").innerHTML=U.empty("手元の年代記JSONを開いてください。");};document.head.append(script);
  }
})();
