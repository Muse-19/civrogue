(() => {
  "use strict";
  const G=window.CivGame, U=window.AlbumUI, art=window.AlbumScenes;
  const {esc:h,icon,stamp,trophy}=U;
  const metrics=Object.entries(G.METRICS);
  const labels={order:"安定度",knowledge:"科学力",wealth:"経済力",culture:"文化力",power:"軍事力"};
  const metricHelp={order:"社会や政治がどれほど安定しているか。ゼロになると文明が崩壊する。",
    knowledge:"研究、技術、調査を進めるための力。",wealth:"交易や事業を支える力。ゼロになると文明が崩壊する。",
    culture:"表現や慣習、他文明との交流を育てる力。",power:"防衛や外交で軍を動かす力。"};
  const signed=n=>n>0?"+"+n:String(n);
  const tag=(word,kind="")=>`<span class="pb-tag ${kind}">${h(word)}</span>`;
  const button=(label,action,cls="")=>`<button type="button" class="pb-button ${cls}" data-do="${action}">${h(label)}</button>`;
  const fold=(title,body,cls="")=>`<details class="pb-fold ${cls}"><summary>${title}</summary><div>${body}</div></details>`;
  const entryLink=(turn,label)=>`<button type="button" class="pb-link" data-memory="${turn}">${h(label??("第"+turn+"ターン"))}</button>`;
  const eraFor=s=>G.eraAt(s.end ? s.end.turn-1 : s.history.length,s.version);
  function liveData(s) {
    const trophies=Object.keys(s.trophies??{}).filter(id=>!/(解体|失われ|撤去|焼失)/.test(s.trophyLegacy?.[id]?.status??""));
    const last=s.history.at(-1);
    const regime=Object.keys(s.tags??{}).find(id=>G.TAGS[id]?.group==="politics");
    return { flags:Object.keys(s.flags), trophies, metrics:s.metrics, regime,
      crisis:s.crises?.findLast(c=>!c.recoveredAt),
      disaster:[s.incident,last?.incident].some(x=>x?.kind==="calamity" && x.severity!=="ordinary") && !last?.reconstruction && last?.crisis?.action!=="recovered",
      recovery:last?.crisis?.action==="recovered" || !!last?.reconstruction,
      ending:s.end?.reason, seed:s.seed };
  }
  function scene(s,era,data,saved) {
    const turn=s.end?.turn??s.history.length+1;
    const regime=G.TAGS[data.regime]?.name??s.governance?.name??"中央政府の成立前";
    const stage=G.ERAS[era];
    return `<section class="pb-place" aria-label="文明の景観">
      <header class="pb-place-head"><div><p class="pb-kicker">${icon("book",16)} ${stage.name}時代 ・ ${h(G.yearLabel(G.yearAt((s.end?.turn??turn)-1,s.version)))}</p><h1>${h(s.name)}文明</h1></div><div class="pb-turn"><span>ターン</span><b>${turn}</b><small> / ${G.limitFor(s.version)}</small></div></header>
      <div class="pb-scene" data-era="${era}">${art.live(era,data)}<span class="pb-scene-label">${h(art.chapterSubtitles[era])}</span></div>
      <div class="pb-caption"><span>${stamp("regime",data.regime)} ${h(regime)}</span><span aria-live="polite">${saved?"自動保存済み":"このタブ内でプレー中"}</span></div>
      ${data.crisis?`<div class="pb-alert"><b>経済危機</b> 第${data.crisis.startedAt}ターンに発生。経済が回復するまで、一部の計画が保留されます。</div>`:""}
      ${data.recovery?`<div class="pb-alert recovery"><b>${s.history.at(-1).reconstruction?"復興":"経済危機から回復"}</b> ${h(s.history.at(-1).reconstruction??"保留された計画を、条件に応じて進められるようになります。")}</div>`:""}
      <div class="pb-stats" aria-label="文明の指標">${metrics.map(([id,m])=>`<div title="${h(metricHelp[id])}"><span>${h(m.name)}</span><strong data-stat="${id}">${s.metrics[id]}</strong><div class="pb-track"><i style="--meter:${s.metrics[id]}%;--metric:${m.color}"></i></div></div>`).join("")}</div>
    </section>`;
  }
  function references(s,links,heading) {
    const byTurn=new Map(s.history.map(e=>[e.turn,e]));
    const refs=[...new Map(links.filter(l=>byTurn.has(l.turn)).map(l=>[l.turn+"|"+(l.label??l.name),l])).values()];
    if(!refs.length)return "";
    return fold(heading,`<ul class="pb-memory">${refs.map(l=>{
      const e=byTurn.get(l.turn);
      return `<li>${entryLink(l.turn,"第"+l.turn+"ターン ・ "+e.eventTitle)}<span>${h(l.label??l.name)}</span></li>`;
    }).join("")}</ul>`,"pb-recall");
  }
  function choiceArt(option,category,index) {
    const id=option.trophyInfluences?.[0]?.id;
    if(id)return trophy(id);
    const types=[
      [/観測|道具|技術|研究|試験|設計|機器|航法/,"科学・技術"],
      [/売|商|交易|資金|建設|備蓄|税|予算|供給|支出|支援/,"経済・産業"],
      [/法|会議|合意|投票|批准|議会|規制|決め/,"政治・法律"],
      [/巡礼|教義|神|祭|信仰/,"宗教・思想"],
      [/遠征|軍|武装|防衛|城|攻め|護衛/,"外交・軍事"],
      [/歌|物語|文化|記録|学芸/,"社会・文化"],
    ];
    const match=types.find(([pattern])=>pattern.test(option.title));
    if(match)return stamp("topic",match[1]);
    return index===0?stamp("topic",category):stamp("moment",["choice","institution","person","recovery"][index]);
  }
  function eventPanel(s,event,era) {
    const links=[...(event.trophyInfluences??[]),...(event.incident?.protections??[])];
    const illustration=event.incident ? stamp("moment",event.incident.kind==="calamity"?"disaster":event.incident.kind==="fortune"?"luck":"choice") : stamp("topic",event.category);
    return `<article class="pb-event pb-paper" data-page="${h(event.id)}" aria-labelledby="pb-event-title">
      <header class="pb-event-heading era-${era}"><div class="pb-event-art">${illustration}</div><div>
      <p class="pb-kicker">${h(event.category)}</p><h2 id="pb-event-title" tabindex="-1">${h(event.title)}</h2></div></header>
      ${event.incident?`<div class="pb-alert"><b>${h(G.incidentLabels[event.incident.kind])}</b> ${h(event.incident.narrative)} <span>${h(metrics.filter(([id])=>event.incident.changes[id]).map(([id,m])=>m.name+" "+signed(event.incident.changes[id])).join(" ・ "))}</span></div>`:""}
      <div class="pb-story">${event.body.split(/\n{1,}/).map(part=>`<p>${h(part)}</p>`).join("")}</div>
      ${references(s,links,"この出来事につながる記録")}
      <h3 class="pb-select-head">どんな方針を取りますか</h3>
      <div class="pb-choices">${event.options.map((option,index)=>{
        const note=option.finalProcedure?.text;
        const warning=option.warning; 
        const summary=option.summary.replace(warning?" 警告　"+warning:"\u0000","").replace(note?" "+note:"\u0000","").trim();
        const influence=option.trophyInfluences?.filter(l=>l.kind==="option")??[];
        return `<div class="pb-choice-group">
          <button type="button" class="pb-choice ${warning?"fatal":""}" data-choice="${index}" data-choice-id="${h(option.id)}">
          ${choiceArt(option,event.category,index)}<span class="pb-choice-copy"><strong>${h(option.title)}</strong><span>${h(summary)}</span>
          ${warning?`<span class="pb-warning"><b>崩壊の警告</b> ${h(warning)}</span>`:""}
          ${note?`<span class="pb-procedure"><b>${option.finalProcedure.action==="pass"?"勝利機会の見送り":"実施後の条件"}</b> ${h(note)}</span>`:""}</span><span class="pb-choice-n" aria-hidden="true">${"ABCD"[index]}</span></button>
          ${references(s,influence,"この選択肢を開いた偉業")}</div>`;
      }).join("")}</div></article>`;
  }
  function goals(s) {
    const defs=G.victoryDefinitions(s.version);
    const progress=s.version>=3?G.victoryProgress(s):{};
    return Object.entries(defs).map(([id,definition])=>{
      const p=progress[id];
      const reached=p?.milestones.filter(m=>m.turn)??[];
      const retry=s.history.findLast(e=>e.selected?.finalProcedure?.goal===id)?.selected?.finalProcedure;
      const readiness=p?.readiness?.status;
      let status=s.victories[id]?"勝利達成":s.end?"未達成":reached.length?"計画進行中":"未着手";
      if (!s.end && !s.victories[id]) {
        if(readiness==="used" || (retry?.action==="pass" && retry.outlook!=="conditional"))status="最終機会の終了";
        else if(readiness==="crisis")status="危機による中断";
        else if(retry?.action==="pass" && retry.outlook==="conditional" && !p?.readiness?.text.includes("期間は終了"))status="再挑戦の余地あり";
        else if(reached.length && ["prerequisites","metrics","institution"].includes(readiness))status="条件不足";
        if(p?.readiness?.text.includes("期間は終了"))status="最終機会の終了";
      }
      const milestones=(p?.milestones??[]).map(m=>`<li class="${m.turn?"done":""}"><span>${h(m.label??G.FLAGS[m.id]??m.id)}</span>${m.turn?entryLink(m.turn,"第"+m.turn+"ターン"):"<small>未成立</small>"}</li>`).join("");
      return fold(`<span class="pb-goal-title">${stamp("victory",id)}<b>${h(definition.title)}</b>${tag(status,s.victories[id]?"success":"")}</span>`,
        `<p>${h(definition.detail)}</p>${p?.readiness?.text?`<p>${h(p.readiness.text)}</p>`:""}${p?.route?`<p>${h(p.route)}</p>`:""}${milestones?`<ul class="pb-milestones">${milestones}</ul>`:""}`,"pb-goal");
    }).join("");
  }
  function award(record,compact=false) {
    const effects=record.effects??[];
    return `<article class="pb-award ${compact?"compact":""}"><div>${trophy(record.id)}</div><div><small>第${record.turn}ターン</small><h4>${h(record.name)}</h4>
      ${compact?"":`<p>${h(record.meaning??record.context??record.route.label)}</p>
      <p class="pb-award-effect">${h(record.currentStatus?.status??(effects.length?"後の出来事に影響が記録されています。":"後の影響は歴史の進行とともに年代記に記録されます。"))}</p>
      ${effects.slice(-2).map(e=>entryLink(e.turn,e.eventTitle)).join(" ")}`}</div></article>`;
  }
  function sidebar(s,data) {
    const records=G.achievementReport(s);
    const institutions=data.flags.map(id=>entryLink(s.flags[id],G.FLAGS[id]??id));
    const tags=Object.keys(s.tags??{}).map(id=>tag(G.TAGS[id]?.name??id));
    return `<div class="pb-dossiers"><h2>文明の記録</h2>
      ${fold(icon("flag",17)+" 勝利への歩み",`<p class="pb-muted">成立した計画の記録です。たどれる経路は文明によって異なります。</p>${goals(s)}`)}
      ${fold(icon("award",17)+" 偉業コレクション "+records.length+" / "+G.achievementCount,records.length?`<div class="pb-awards-grid">${records.map(r=>award(r)).join("")}</div>`:"<p>獲得した偉業が、ここに並びます。</p>")}
      ${fold(icon("scroll",17)+" 制度・思想",`<div class="pb-tags">${tags.join("")}</div><div class="pb-institutions">${institutions.join("")||"<p>成立した制度はまだありません。</p>"}</div>`)}
      ${fold(icon("profile",17)+" 指標と用語のヘルプ",help())}
    </div>`;
  }
  function help() {
    return `<dl class="pb-defs">${Object.entries(metricHelp).map(([key,value])=>`<div><dt>${labels[key]}</dt><dd>${value}</dd></div>`).join("")}</dl>
      <p>偉業は歴史上の達成を記録します。勝利条件は、成立した制度と計画の進捗で確認できます。</p>
      <p>経済危機では一部の計画が保留されます。危機への対応と回復は年代記に残ります。</p>`;
  }
  function result(s,entry,eraChanged,era,manual) {
    const awards=G.achievementReport(s).filter(r=>entry.trophies?.includes(r.id));
    const changed=metrics.filter(([id])=>entry.changes[id]);
    const descriptions=[
      ["成立した制度",entry.institutions?.map(id=>G.FLAGS[id])],
      ["終了した制度",[...(entry.institutionsEnded??[]),...(entry.incident?.revoked??[])].map(x=>G.FLAGS[x.id])],
      ["新しい思想・体制",entry.ideology?.formed.map(id=>G.TAGS[id]?.name)],
      ["終了した思想・体制",entry.ideology?.ended.map(x=>G.TAGS[x.id]?.name)],
      ["勝利への進展",entry.selected?.finalProcedure?.action==="advance"?[G.VICTORIES[entry.selected.finalProcedure.goal]?.title+"の最終手続きを実行"]:[]],
      ["達成した勝利",entry.victories?.map(id=>G.victoryDefinitions(s.version)[id]?.title)],
      ["経済危機",entry.crisis?[({started:"発生",recovered:"回復",response:"対応"})[entry.crisis.action],entry.crisis.method,entry.crisis.sacrifice]:[]],
      ["復興",entry.reconstruction?[entry.reconstruction]:[]]
    ];
    const previousEra=s.history.filter(e=>e.era===entry.era);
    const notable=previousEra.filter(e=>e.trophies?.length||e.institutions.length).slice(-3);
    return `<article class="pb-result pb-paper ${awards.length||eraChanged?"pb-celebrate":""}" data-result-turn="${entry.turn}" aria-labelledby="pb-result-title">
      <p class="pb-kicker">${icon("leaf",18)} 第${entry.turn}ターンの結果</p><h2 id="pb-result-title" tabindex="-1">${h(entry.eventTitle)}</h2>
      <p class="pb-selected">${h(entry.selected?.title)}</p><p class="pb-result-text">${h(entry.result)}</p>
      ${changed.length?`<div class="pb-deltas">${changed.map(([id,m])=>`<span>${h(m.name)} <b class="${entry.changes[id]>0?"rise":"fall"}">${signed(entry.changes[id])}</b></span>`).join("")}</div>`:""}
      ${descriptions.filter(([,info])=>info?.some(Boolean)).map(([name,info])=>`<p class="pb-change-line"><strong>${name}</strong> ${h(info.filter(Boolean).join(" ・ "))}</p>`).join("")}
      ${awards.length?`<div class="pb-unlock"><h3>歴史的偉業を獲得</h3>${awards.map(r=>award(r)).join("")}</div>`:""}
      ${references(s,entry.causes??[],"この結果につながった記録")}
      ${eraChanged?`<div class="pb-chapter"><div>${art.era(era)}</div><p class="pb-kicker">新しい時代</p><h3>${G.ERAS[era].name}時代</h3><p>前の時代の記録</p>${(notable.length?notable:previousEra.slice(-2)).map(e=>entryLink(e.turn,e.eventTitle)).join(" ")}</div>`:""}
      <div class="pb-result-actions">${button(s.end?"終幕を見る":"次へ","continue","primary")}${manual?"":`<span>自動で次へ進みます</span>`}</div></article>`;
  }
  function ending(s) {
    const report=G.report(s), goal=report.victories[0]?.id, reason=s.end.reason;
    const records=report.achievements??[];
    const selected=report.turningPoints.filter(p=>p.turn!==s.end.turn && p.reasons.length).slice(-4);
    return `<article class="pb-ending pb-paper" data-ending="${h(goal??reason)}">
      <div class="pb-ending-image">${art.finale(reason,goal)}</div><p class="pb-kicker">第${s.end.turn}ターン ・ ${h(G.LABELS[reason])}</p>
      <h2 id="pb-event-title" tabindex="-1">${h(report.title)}</h2>
      <p>${h(report.victories.map(v=>v.title).join("・")||G.LABELS[reason])}</p>
      ${reason==="collapse"?`<div class="pb-alert"><b>${s.end.source==="chance"?"対応前の偶然":s.end.source==="choice"?"選択の負担":"文明の崩壊"}</b>
        ${h(s.end.depleted?.map(id=>G.METRICS[id].name).join("・"))}が尽きました。${h(report.collapseCause?.description??s.history.at(-1)?.result)}</div>`:""}
      ${records.length?`<h3>歴史に残した偉業</h3><div class="pb-ending-awards">${records.slice(-3).map(r=>award(r,true)).join("")}</div>`:""}
      ${selected.length?`<h3>文明を形づくった出来事</h3><ul>${selected.map(e=>`<li>${entryLink(e.turn,e.title)}</li>`).join("")}</ul>`:""}
      <div class="pb-result-actions">${button("年代記を開く","album","primary")}</div></article>`;
  }
  window.CivPlayView={h,icon,button,fold,liveData,scene,eventPanel,sidebar,help,result,ending,eraFor};
})();
