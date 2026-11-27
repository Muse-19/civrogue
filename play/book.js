(() => {
  "use strict";
  const G=window.CivGame, V=window.CivPlayView, S=window.CivPlaySound;
  const {h,icon,button,eraFor}=V;
  const prefKey="civrogue.book.preferences";
  function preferences() {
    const defaults={speed:"normal",auto:false,muted:true,volume:35,seen:false};
    try {return {...defaults,...JSON.parse(localStorage.getItem(prefKey))};}
    catch {return defaults;}
  }
  function mount(root, game) {
    const prefs=preferences();
    let transition;
    let timer;
    let lastClick=0;
    const motion=matchMedia("(prefers-reduced-motion: reduce)");
    root.innerHTML=`<header class="pb-top"><div class="pb-top-inner">
      <div class="pb-brand"><span>${icon("book",24)}</span><div><b>CivRogue</b><small>動く文明の絵本</small></div></div>
      <nav aria-label="画面と設定">${button("軽量UI","lightweight")}${button("年代記","album")}${button("設定","settings")}</nav>
    </div></header>
    <main class="pb-main"><div class="pb-welcome" hidden></div><div class="pb-grid">
      <div class="pb-side"><div class="pb-place-slot"></div><div class="pb-dossiers-slot"></div></div>
      <div class="pb-story-slot"></div>
    </div></main>
    <dialog class="pb-dialog" aria-labelledby="pb-dialog-title"><div class="pb-dialog-body"></div></dialog>`;
    const get=selector=>root.querySelector(selector);
    const dialog=get(".pb-dialog");
    function remember() {
      try {localStorage.setItem(prefKey,JSON.stringify(prefs));} catch {}
    }
    function welcome() {
      const panel=get(".pb-welcome");
      panel.hidden=Boolean(prefs.seen);
      if(panel.hidden)return;
      panel.innerHTML=`<div>${icon("book",22)}<div><h2>絵本の遊び方</h2><p>出来事を読み、方針を1つ選びます。選ぶたびに景観が変わり、結果は年代記に残ります。</p></div></div>
        <div>${button("詳しい遊び方","help")}${button("説明を閉じる","dismiss","primary")}</div>`;
    }
    function play(kind,era=0,goal) {
      if(!prefs.muted)S.play(kind,Number(prefs.volume)/100,era,goal);
    }
    function pause() {
      clearTimeout(timer);
      timer=undefined;
      transition=null;
      if(dialog.open)dialog.close();
    }
    function sync() {
      pause();
      paint();
    }
    function paint(focus=false) {
      const state=game.getState();
      const era=eraFor(state), data=V.liveData(state);
      const slot=get(".pb-place-slot");
      const previous=Object.fromEntries(Array.from(slot.querySelectorAll("[data-stat]"),e=>[e.dataset.stat,Number(e.textContent)]));
      slot.innerHTML=V.scene(state,era,data,game.saved());
      const dossier=get(".pb-dossiers-slot");
      const opened=[...dossier.querySelectorAll(".pb-dossiers > details")].map(e=>e.open);
      dossier.innerHTML=V.sidebar(state,data);
      dossier.querySelectorAll(".pb-dossiers > details").forEach((e,index)=>e.open=opened[index]??false);
      const story=get(".pb-story-slot");
      if(transition) story.innerHTML=V.result(state,transition.entry,transition.eraChanged,era,transition.delay==null);
      else if(state.end) story.innerHTML=V.ending(state);
      else if(state.pendingVictory) story.innerHTML=`<article class="pb-paper pb-ending"><h2 id="pb-event-title" tabindex="-1">勝利達成</h2><p>ここで歴史を締めくくるか、別の勝利を目指せます。</p><div class="pb-result-actions">${button("歴史を続ける","keep","primary")}${button("勝利で終える","finish")}</div></article>`;
      else {
        const event=G.publicEvent(state);
        story.innerHTML=(event?V.eventPanel(state,event,era):"")+(state.history.length?`<div class="pb-backstory">${button("直前の結果を読む","last")}</div>`:"");
      }
      if(transition&&!motion.matches&&prefs.speed!=="skip") {
        for(const [id,value] of Object.entries(state.metrics)) {
          const meter=slot.querySelector(`[data-stat="${id}"]`)?.nextElementSibling?.firstElementChild;
          if(meter&&Number.isFinite(previous[id]))meter.animate([{width:previous[id]+"%"},{width:value+"%"}],{duration:280,easing:"ease-out"});
        }
      }
      if(focus)(get(transition?"#pb-result-title":"#pb-event-title")??get("[data-do=lightweight]"))?.focus({preventScroll:true});
    }
    function scrollToStory() {
      if(matchMedia("(max-width: 800px)").matches) get(".pb-story-slot").scrollIntoView({block:"start"});
    }
    function advance() {
      const ending=game.getState().end;
      const fromTransition=!!transition;
      clearTimeout(timer);
      timer=undefined;
      transition=null;
      paint(true);
      scrollToStory();
      if (ending&&fromTransition) play(ending.reason,eraFor(game.getState()),Object.keys(game.getState().victories)[0]);
    }
    function choose(target, event) {
      if(transition||event.detail>1||event.detail===1&&performance.now()-lastClick<320)return;
      const state=game.getState();
      const turn=state.history.length, era=eraFor(state);
      const sceneId=get("[data-page]")?.dataset.page;
      for(const choice of get(".pb-choices").querySelectorAll("button[data-choice]"))choice.disabled=true;
      target.classList.add("picked");
      if(!game.choose(Number(target.dataset.choice),sceneId,turn,target.dataset.choiceId)){paint();return;}
      if(event.detail===1)lastClick=performance.now();
      const next=game.getState();
      const entry=next.history[turn], nextEra=eraFor(next);
      const eraChanged=nextEra!==era;
      const crisis=entry.crisis?.action;
      const prize=entry.trophies?.length>0;
      const serious=next.end||next.pendingVictory||eraChanged||prize||["started","recovered"].includes(crisis)||entry.incident?.severity==="exceptional"||entry.incident?.severity==="major"||entry.reconstruction;
      const sound=prize?"trophy":eraChanged?"era":crisis==="recovered"||entry.reconstruction?"recovery":
        crisis==="started"||entry.incident?.kind==="calamity"||next.incident?.kind==="calamity"?"crisis":"choice";
      play(sound,nextEra);
      if(prefs.speed==="skip"){advance();if(next.end)play(next.end.reason,nextEra,Object.keys(next.victories)[0]);return;}
      const delay=serious&&!prefs.auto?null:
        (prefs.speed==="fast"?380:prefs.speed==="slow"?2450:1300)*(serious?1.7:1);
      transition={entry,eraChanged,delay};
      paint(true);
      scrollToStory();
      if(delay!=null)timer=setTimeout(advance,delay);
    }
    function opened(title,body) {
      get(".pb-dialog-body").innerHTML=`<header><h2 id="pb-dialog-title">${h(title)}</h2>${button("閉じる","close")}</header>${body}`;
      if(!dialog.open)dialog.showModal();
    }
    function settings() {
      opened("絵本の設定",`<div class="pb-controls">
        <label>演出速度 <select name="speed">${[["normal","ふつう"],["fast","速い"],["slow","ゆっくり"],["skip","スキップ"]].map(([x,label])=>`<option value="${x}" ${prefs.speed===x?"selected":""}>${label}</option>`).join("")}</select></label>
        <label class="pb-check"><input name="auto" type="checkbox" ${prefs.auto?"checked":""}> 偉業や時代移行の演出も自動で進める</label>
        <label class="pb-check"><input name="muted" type="checkbox" ${prefs.muted?"checked":""}> ミュート</label>
        <label>効果音の音量 <input name="volume" type="range" min="0" max="100" value="${Math.min(100,Math.max(0,Number(prefs.volume)||0))}"><output>${Number(prefs.volume)||0}%</output></label>
        <div>${button("効果音を試す","listen")} ${button("遊び方を表示","help")}</div>
      </div><form class="pb-new"><h3>新しい文明を始める</h3><p>開始すると現在のセーブが置き換わります。</p><label>乱数シード <input maxlength="64" name="seed" placeholder="空欄ならランダム"></label>
      <button class="pb-button">新規プレーを開始</button></form>`);
    }
    function memory(turn) {
      const entry=game.getState().history.find(e=>e.turn===turn);
      if(!entry)return;
      opened(entry.eventTitle,`<div class="pb-memory-page"><p class="pb-kicker">第${entry.turn}ターン ・ ${h(G.yearLabel(entry.year))}</p><p>${h(entry.body)}</p>
        ${entry.selected?`<h3>選んだ方針</h3><p>${h(entry.selected.title)}</p>`:""}<h3>記録された結果</h3><p>${h(entry.result)}</p>
        ${entry.causes?.length?`<h3>過去の参照</h3><ul>${entry.causes.map(l=>`<li><button type="button" class="pb-link" data-memory="${l.turn}">第${l.turn}ターン ・ ${h(l.label)}</button></li>`).join("")}</ul>`:""}
        </div>`);
    }
    root.addEventListener("click",event=>{
      const choice=event.target.closest("[data-choice]");
      if(choice){choose(choice,event);return;}
      const previous=event.target.closest("[data-memory]");
      if(previous){memory(Number(previous.dataset.memory));return;}
      switch(event.target.closest("[data-do]")?.dataset.do) {
        case "lightweight":game.lightweight();break;
        case "album":game.album();break;
        case "settings":settings();break;
        case "dismiss":prefs.seen=true;remember();welcome();get("#pb-event-title")?.focus();break;
        case "help":opened("絵本の遊び方",V.help());break;
        case "close":dialog.close();break;
        case "continue":advance();break;
        case "last":memory(game.getState().history.at(-1)?.turn);break;
        case "listen":play("trophy");break;
        case "keep":game.finish(false);paint(true);break;
        case "finish":game.finish(true);paint(true);play("victory",eraFor(game.getState()),Object.keys(game.getState().victories)[0]);break;
      }
    });
    root.addEventListener("input",event=>{
      if(event.target.name==="volume") {
        prefs.volume=Number(event.target.value);
        get(".pb-controls output").textContent=prefs.volume+"%";
        remember();
      }
    });
    root.addEventListener("change",event=>{
      if(event.target.name==="speed")prefs.speed=event.target.value;
      else if(["auto","muted"].includes(event.target.name))prefs[event.target.name]=event.target.checked;
      else return;
      remember();
      if(transition&&prefs.speed==="skip")advance();
      else if(transition&&prefs.auto&&timer==null)timer=setTimeout(advance,800);
    });
    root.addEventListener("submit",event=>{
      if(!event.target.matches(".pb-new"))return;
      event.preventDefault();
      const seed=new FormData(event.target).get("seed").trim();
      const random=crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase();
      pause();
      game.start(seed||"CIV-"+random);
      paint(true);
      window.scrollTo(0,0);
    });
    return {sync,pause,enter(){welcome();paint(true);window.scrollTo(0,0);}};
  }
  window.CivPlay={mount};
})();
