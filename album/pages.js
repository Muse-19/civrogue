(() => {
  "use strict";
  const M=window.AlbumModel, C=window.AlbumCatalog;
  const {esc:h,icon,trophy,stamp,section,eraName,empty,jump,radar,graph}=window.AlbumUI;
  const {arr,records,str,names,year,num}=M;
  const tags=list=>list.map(v=>`<span class="tag">${h(v)}</span>`).join("");
  const title=e=>str(e?.eventTitle,"名称の記録なし");
  const awardName=a=>str(a.name,C.awards[a.id]?.name??"名称の記録なし");
  const turn=t=>M.validTurn(t)?"第"+t+"ターン":"ターン不詳";
  const note=(label,value)=>`<div class="fact"><dt>${h(label)}</dt><dd>${value}</dd></div>`;
  const fact=(label,value)=>value?note(label,h(value)):"";
  const details=(label,body)=>`<details class="fold"><summary>${h(label)}</summary><div>${body}</div></details>`;
  const dl=items=>`<dl class="facts">${items}</dl>`;
  const paragraph=s=>`<p>${h(s)}</p>`;
  function motif(m,p) {
    if (p.kind==="trophy") {
      const a=m.awards.find(a=>a.turn===p.entry.turn);
      if (a) return trophy(a.id);
    }
    if (p.kind==="ending") return m.wins.length ? stamp("victory",m.wins[0].id) : stamp("ending",m.status);
    return p.kind==="choice"?stamp("topic",p.entry.category):stamp("moment",p.kind);
  }
  function cover(m) {
    const featured=[...m.awards].sort((a,b)=>arr(b.effects).length-arr(a.effects).length)[0];
    const sectors=m.chapters.filter(c=>c.events.length),era=sectors.at(-1)?.events.at(-1)?.era??0;
    const label=m.raw.civilization?(m.name.endsWith("文明")?m.name:m.name+"文明"):m.name;
    const range=m.timeline.length?`${year(m.timeline[0].year)} — ${year(m.timeline.at(-1).year)}`:"";
    const summary=featured?`「${awardName(featured)}」を歴史に刻んだ${label}。${range?range.replace(" — ","から")+"までの歩み。":""}`:
      m.timeline.length?`「${title(m.timeline[0])}」から始まる、${m.timeline.length}件の出来事を収めた年代記。`:"記録に残る文明の歩みを収めた一冊。";
    const picture=window.AlbumScenes.cover({focus:m.focus,era,regime:str(m.raw.regime?.id),trophies:(sectors.at(-1)?.art?.trophies ?? m.awards.map(a=>a.id)),ending:m.status,seed:str(m.raw.seed,m.name)});
    return `<section id="cover" class="cover" aria-label="文明の表紙"><div class="cloth-edge"></div><div class="cover-spread"><div class="cover-copy">
      <span class="cover-label">${icon("book",16)} 文明史アルバム</span><h1>${h(label)}</h1>
      ${m.title?`<p class="epithet">${h(m.title)}</p>`:""}<div class="ornament" aria-hidden="true"><i></i>✧<i></i></div>
      <p class="intro">${h(summary)}</p><div class="ending-chip">${m.wins.length?stamp("victory",m.wins[0].id):stamp("ending",m.status)}${h(m.statusText)}</div></div>
      <figure class="cover-picture"><div class="photo">${picture}</div><figcaption>${h(m.name)}の風景 <span>象徴図</span></figcaption></figure></div>
      <div class="cover-facts">${[
        ["turn",m.status==="ongoing"?"記録ターン":"終幕のターン",m.last??"記録なし",m.last!=null?"ターン":""],
        ["flag","政治体制・統治",m.regime,""],["award","歴史的偉業",Array.isArray(m.raw.achievements)?m.awards.length:"記録なし",Array.isArray(m.raw.achievements)?"件":""],
        ["eras","記録された時代",sectors.length,sectors.length?"時代":""]
      ].map(([ico,l,v,u])=>`<div>${icon(ico,19)}<span><small>${h(l)}</small><b>${h(v)} <em>${h(u)}</em></b></span></div>`).join("")}</div></section>`;
  }
  function bookmarks(m) {
    const scenes=window.AlbumScenes;
    const tiles=m.chapters.map((chapter,index)=>`<a href="#era-${index}" class="era-tile e${index}">
      <div class="era-illustration">${scenes.era(index,chapter.art)}<i class="era-mark">${icon(["leaf","trade","flag","scroll","chart"][index],17)}</i></div>
      <div class="era-caption"><div><b>${chapter.name}時代</b><small>${scenes.chapterSubtitles[index]}</small></div>${icon("next",14)}</div>
    </a>`).join("");
    return `<section class="era-index" aria-label="時代のしおり"><div class="mini-head">${icon("eras",20)}<h2>時代のしおり</h2></div><div class="era-strip">${tiles}</div></section>`;
  }
  function profile(m) {
    const r=m.raw,traits=names(r.traits),institutions=names(r.institutions),a=m.awards.at(-1);
    const leaders=m.strongest.map(k=>M.metrics[k][0]).join("・");
    const c=m.longest;
    const story=(leaders?`記録上、最も高い最終指標は${leaders}（${m.values[m.strongest[0]]}）。`:"")+
      (r.regime?.name?`第${M.validTurn(r.regime.turn)?r.regime.turn:"―"}ターンの記録に「${r.regime.name}」が残る。`:r.actualGovernance?.name?`運営形態として「${r.actualGovernance.name}」が記録された。`:"");
    const chosen=[...m.marked.values()].sort((a,b)=>b.rank-a.rank).find(p=>p.rank>=5 && p.kind!=="ending");
    const extra=records(r.politicalHistory).map(v=>({turn:v.turn,label:[v.regime,({proposed:"提案",approve:"批准",reject:"見送り",expired:"審議期限の終了",deferred:"持ち越し",superseded:"別案への変更"})[v.action]??v.action].filter(Boolean).join(" ／ ")}));
    const legacyGroups=[["政治体制の審議",extra],["制度の成立と終了",records(r.institutionHistory).map(v=>({turn:v.turn,label:str(v.name)+" ／ "+(v.action==="formed"?"成立":v.action==="ended"?"終了":str(v.action))}))],["旧制度の継承と整理",records(r.legacyHistory).map(v=>({turn:v.turn,label:[v.name,({retained:"残存",settled:"解消",restored:"復活",limited:"期限を設定",expired:"期限満了"})[v.action]??v.action].filter(Boolean).join(" ／ ")}))]];
    return section("profile","文明プロフィール","profile",`<div class="profile-grid"><div class="paper profile-id"><div class="regime">${stamp("regime",r.regime?.id??"none")}<div><small>政治体制・統治</small><h3>${h(m.regime)}</h3></div></div><p>${h(story)}</p>
      ${dl(note("思想・社会",traits.length?tags(traits):"記録なし")+note("主要制度",institutions.length?h(institutions.slice(0,4).join("・")):"記録なし")+
      (a?note("記録された偉業",jump(m,a.turn,awardName(a))):"")+
      (c?note("最長の経済危機",jump(m,c.startedAt,turn(c.startedAt)+"から"+(m.duration(c)!=null?m.duration(c)+"ターン":"期間不詳"))):note("経済危機",Array.isArray(r.crises)?"記録上0件":"記録なし"))+
      (chosen?note("転換点",jump(m,chosen.entry.turn,title(chosen.entry))):""))}</div>
      <div class="paper indicators"><h3>文明の指標</h3>${radar(m)}<div class="metric-list">${Object.entries(M.metrics).map(([k,[n,color]])=>`<div><span><i style="background:${color}"></i>${n}</span><b>${m.values[k]??"—"}</b></div>`).join("")}</div></div></div>
      ${details("制度と政治の記録", (institutions.length?paragraph(institutions.join("・")):"")+legacyGroups.map(([name,rows])=>rows.length?details(name+"（"+rows.length+"件）",rows.map(v=>`<p>${jump(m,v.turn)}　${h(v.label)}</p>`).join("")):"").join("")||empty("追加の記録はありません。"))}`);
  }
  function eventCard(m,p) {
    const e=p.entry;return `<article class="event-card ${p.rank>=8?"prominent":""}"><div class="event-symbol">${motif(m,p)}</div><div><small>${h(turn(e.turn))} · ${h(str(e.category))}</small><h4>${jump(m,e.turn,title(e))}</h4><p>${h(str(e.result,str(e.body)))}</p>${p.labels[0]?`<span class="evidence">${h(p.labels[0])}</span>`:""}</div></article>`;
  }
  function chapters(m) {
    return section("chapters","時代別の文明史","eras",m.chapters.map((c,i)=>`<article class="era-chapter e${i}" id="era-${i}"><header><div><small>${c.name}時代 ・ ${window.AlbumScenes.chapterSubtitles[i]}</small><h3>${h(c.title)}</h3><p>${h(c.summary)}</p></div><div class="chapter-art">${window.AlbumScenes.era(i,c.art)}<span class="chapter-caption">${c.art?.evidence?"この時代の記録に「"+h(c.art.evidence)+"」":"時代の象徴図"}</span></div></header>
      ${c.events.length?`<div class="chapter-cards">${c.highlights.map(p=>eventCard(m,p)).join("")}</div>${details("この時代の全"+c.events.length+"件",c.events.map(e=>`<p>${jump(m,e.turn,turn(e.turn)+"　"+title(e))}</p>`).join(""))}`:""}</article>`).join(""));
  }
  function collection(m,locked=false) {
    const cards=m.awards.map(a=>{
      const meta=Object.hasOwn(C.awards,a.id)?C.awards[a.id]:{};
      const id=str(a.id),fields=names(a.fields).length?names(a.fields):names(meta.fields);
      return `<article class="award-card ${meta.type==="work"?"work":meta.type==="turning"?"turning":"system"}"><div class="award-image"><i class="award-halo" aria-hidden="true"></i>${trophy(id)}<span>${h(turn(a.turn))}</span></div>
        <div class="award-body"><h3>${h(awardName(a))}</h3><div class="field-tags">${tags(fields)}</div><p>${h(str(a.route?.label,str(a.choiceTitle,"達成経緯の記録なし")))}</p>
        ${details("達成とその後",dl(fact("契機",str(a.eventTitle))+fact("選択",str(a.choiceTitle))+fact("当時の政治体制",str(a.regime?.name,str(a.governance)))+
          fact("歴史的な意味",str(a.meaning,str(a.context,"記録なし")))+fact("現在の状態",str(a.currentStatus?.status,"後日の状態変更の記録なし"))+
          note("後世への影響",records(a.effects).length?records(a.effects).map(e=>jump(m,e.turn,turn(e.turn)+"　"+str(e.eventTitle))).join("<br>"):"後続の参照記録なし")+
          note("獲得の記録",jump(m,a.turn))))}</div></article>`;
    });
    const hasRecords=Array.isArray(m.raw.achievements);
    if (locked && hasRecords) for(const [id,meta] of Object.entries(C.awards)) if(!m.awards.some(a=>a.id===id)) cards.push(`<article class="award-card locked"><div class="award-image"><i class="award-halo" aria-hidden="true"></i>${trophy(id)}</div><div class="award-body"><h3>${h(meta.name)}</h3><small>未獲得</small></div></article>`);
    return section("collection","歴史的偉業コレクション","award",`<div class="collection-bar"><p>${hasRecords?"獲得した偉業　"+m.awards.length+" / 36":"この版の記録には偉業一覧がありません。"}</p>${hasRecords?`<label><input type="checkbox" id="locked" ${locked?"checked":""}> 未獲得も表示</label>`:""}</div>
      ${!m.awards.length?`<div class="empty-art">${stamp("moment","choice")}<p>${hasRecords?"この文明に偉業の獲得記録はありません。":"偉業の獲得状況は不明です。"}${m.timeline.length?"「"+h(title(m.timeline[0]))+"」からの歩みは時代のページに残っています。":""}</p></div>`:""}<div class="award-grid">${cards.join("")}</div>`);
  }
  function rise(m,enabled) {
    const top=[...m.marked.values()].sort((a,b)=>b.rank-a.rank||a.entry.turn-b.entry.turn).slice(0,8).sort((a,b)=>a.entry.turn-b.entry.turn);
    const ending=m.raw.end ? `<div class="ending-scene ${h(m.status)}">${window.AlbumScenes.finale(m.status,m.wins[0]?.id)}<div><h3>${h(m.statusText)}</h3><p>${jump(m,m.last,turn(m.last))}</p></div></div>`:"";
    return section("rise","文明の盛衰と転換点","chart",`<div class="paper plot"><h3>5つの指標の歩み</h3><div class="plot-toggles">${Object.entries(M.metrics).map(([k,[n,col,dash]])=>`<label><input type="checkbox" data-metric="${k}" ${enabled.has(k)?"checked":""}><svg width="22" height="8" aria-hidden="true"><path d="M0 4h22" stroke="${col}" stroke-width="3" stroke-dasharray="${dash}"/></svg>${n}</label>`).join("")}</div><div id="graph">${graph(m,enabled)}</div>
      <p class="graph-key">縦線は時代の境界、色帯は経済危機。上部のしるしを選ぶと出来事を読めます。</p><div id="inspected" aria-live="polite"></div></div>
      ${ending}<h3 class="subhead">歴史の転換点</h3><div class="digest">${top.map(p=>eventCard(m,p)).join("")||empty("転換点の記録はまだありません。")}</div>`);
  }
  function chain(m,i) {
    const path=m.paths[i]; if (!path) return empty(m.timeline.length?`この記録には前後を結ぶ参照がありません。最初に記されたのは「${title(m.timeline[0])}」です。`:"参照できる出来事がまだありません。");
    const card=t=>{const e=m.byTurn.get(t);return `<div class="chain-node">${stamp("topic",e.category)}<div><small>${turn(t)}</small><b>${jump(m,t,title(e))}</b></div></div>`;};
    return `<div class="chain">${card(path[0].from)}${path.map(edge=>`<div class="chain-edge"><span>${h(edge.label??"因果参照")}</span></div>${card(edge.to)}`).join("")}</div>`;
  }
  function ties(m) {
    const delays=m.crises.flatMap(c=>records(c.delays));
    return section("ties","歴史のつながりと計画","links",`<div class="paper"><h3>因果関係マップ</h3>${m.paths.length>1?`<label class="control-label">たどる出来事 <select id="path-select">${m.paths.map((path,i)=>`<option value="${i}">${h(turn(path[0].from)+"　"+title(m.byTurn.get(path[0].from)))}</option>`).join("")}</select></label>`:""}<div id="chain-map">${chain(m,0)}</div></div>
      <h3 class="subhead">達成した計画と、実現しなかった歴史</h3><div class="plan-grid">${m.plans.map(p=>`<article class="plan ${p.state==="達成"?"complete":"unfinished"}">${stamp("victory",p.id)}<div><small>${h(p.state)}</small><h4>${h(p.name)}</h4>${p.route?paragraph(p.route):""}${p.milestones.map(v=>jump(m,v.turn,str(v.label)+"（"+turn(v.turn)+"）")).join(" ")}${p.passes.map(v=>`<p>${jump(m,v.turn)}　${h(v.choiceTitle)}を選び、最終手続きを見送った。</p>`).join("")}${p.setbacks.filter(v=>!p.passes.some(f=>f.turn===v.turn)).map(v=>`<p>${jump(m,v.turn)}　${h(v.outcome)}</p>`).join("")}</div></article>`).join("")||empty("具体的な計画の進捗は記録されていません。")}</div>
      ${delays.length?details("危機で保留された議題（"+delays.length+"件）",delays.map(v=>paragraph(turn(v.turn)+"　"+str(v.title))).join("")):""}`);
  }
  window.AlbumPages={cover,bookmarks,profile,chapters,collection,rise,ties,chain,eventCard,details,dl,note,fact,paragraph,turn,title,awardName};
})();
