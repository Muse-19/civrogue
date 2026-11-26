(() => {
  "use strict";
  const C = window.AlbumCatalog;
  const eras = ["原始", "古代", "中世", "近代", "未来"];
  const metrics = {
    order: ["安定度", "#317966", ""], knowledge: ["科学力", "#406f9b", "8 3"],
    wealth: ["経済力", "#9a6519", "3 3"], culture: ["文化力", "#a6475d", "12 3 2 3"], power: ["軍事力", "#73538d", "1 4"]
  };
  const obj = x => x && typeof x === "object" && !Array.isArray(x);
  const arr = x => Array.isArray(x) ? x : [];
  const records = x => arr(x).filter(obj);
  const str = (x, fallback = "") => typeof x === "string" && x.trim() ? x : fallback;
  const num = Number.isFinite;
  const validTurn = x => Number.isSafeInteger(x) && x > 0;
  const metricValue = x => num(x) && x >= 0 && x <= 100;
  const names = x => arr(x).map(item => str(item, str(item?.name))).filter(Boolean);
  function year(y) {
    return num(y) ? (y < 0 ? "紀元前" : "西暦") + Math.abs(y).toLocaleString("ja-JP") + "年" : "年代不詳";
  }
  function seriesFrom(raw, timeline) {
    const rows = new Map();
    const set = row => {
      if (Number.isSafeInteger(row?.turn) && row.turn >= 0 && Object.keys(metrics).some(k => metricValue(row[k]))) rows.set(row.turn, row);
    };
    for (const e of timeline) set({ ...e.after, turn: e.turn });
    for (const row of records(raw.series)) set(row);
    return [...rows.values()].sort((a,b) => a.turn - b.turn);
  }
  function connections(raw, timeline, byTurn) {
    const edges = new Map();
    const add = (from, to, type, label) => {
      if (!byTurn.has(from) || !byTurn.has(to) || from >= to) return;
      const key = JSON.stringify([from,to,type,label]);
      edges.set(key,{from,to,type,label});
    };
    for (const e of timeline) {
      for (const l of records(e.causes)) add(l.turn,e.turn,str(l.type,"record"),str(l.label,l.id));
      for (const l of records(e.consequences)) add(e.turn,l.turn,str(l.type,"record"),str(l.label,l.id));
    }
    for (const f of records(raw.historicalForks)) add(f.fromTurn,f.turn,"fork",str(f.link,"歴史的な継承"));
    for (const a of records(raw.achievements)) for (const e of records(a.effects)) add(a.turn,e.turn,"trophy",str(a.name,C.awards[a.id]?.name));
    return [...edges.values()];
  }
  // Keep direction and recorded labels on every hop. Duplicate edges between the same two events
  // may carry different historical evidence; the selected path uses one of those references.
  function pathsFrom(timeline, edges) {
    const outgoing = new Map(), best = new Map();
    for (const edge of edges) {
      if (!outgoing.has(edge.from)) outgoing.set(edge.from, []);
      outgoing.get(edge.from).push(edge);
    }
    const weight = e => ({fork:6,trophy:5,choice:4,person:4,ideology:3,institution:3,threshold:0}[e.type] ?? 2);
    const score = path => path.reduce((sum,e) => sum + 2 + weight(e),0);
    for (const e of [...timeline].reverse()) {
      const candidates = (outgoing.get(e.turn) ?? []).map(link => [link,...(best.get(link.to) ?? [])].slice(0,4));
      if (candidates.length) best.set(e.turn,candidates.sort((a,b) => score(b)-score(a))[0]);
    }
    return [...best.values()].sort((a,b) => score(b)-score(a) || a[0].from-b[0].from);
  }
  const focusEvidence = {
    knowledge: ["academy", "shared_sky", "open_data"],
    wealth: ["market", "guild_credit", "banking_network"],
    religion: ["faith_practice", "cathedral"],
    power: ["army"],
    culture: ["library", "cultural_houses"],
    order: ["assembly", "civic_law", "responsive_council", "constitution"],
  };
  function eraSnapshot(events, timeline, raw, awards, series) {
    const end = events.at(-1);
    if (!end) return null;
    const flags = new Set();
    function add(id) { if (typeof id === "string") flags.add(id); }
    function remove(entry) { flags.delete(entry?.id); }
    const stages = new Map();
    const addStage = (turn, item) => {
      if (!validTurn(turn) || turn > end.turn) return;
      if (!stages.has(turn)) stages.set(turn, []);
      stages.get(turn).push(item);
    };
    for (const entry of timeline) addStage(entry.turn, entry);
    for (const entry of records(raw.institutions)) addStage(entry.turn, {institutions:[entry.id]});
    for (const [turn, group] of [...stages.entries()].sort(([a],[b])=>a-b)) {
      for (const entry of group) {
        arr(entry.incident?.revoked).forEach(remove);
        arr(entry.incident?.raised).forEach(add);
        arr(entry.institutions).forEach(add);
        arr(entry.institutionsEnded).forEach(remove);
      }
    }
    const trophies = awards.filter(a=>validTurn(a.turn) && a.turn<=end.turn &&
      !records(a.legacy).findLast(x=>validTurn(x.turn) && x.turn<=end.turn)?.status?.includes?.("解体")).map(a=>a.id);
    const politics = records(raw.politicalHistory).filter(g=>g.action==="approve" && validTurn(g.turn) && g.turn<=end.turn)
      .sort((a,b)=>a.turn-b.turn).at(-1);
    const values = {...series.find(row=>row.turn===end.turn),...end.after};
    const scores = {...values};
    if (flags.has("faith_practice") || trophies.includes("cathedral")) scores.religion = values.culture;
    const ranked = Object.keys(focusEvidence).filter(key=>metricValue(scores[key])).sort((a,b)=>scores[b]-scores[a]);
    const evidenced = key=>focusEvidence[key].some(id=>flags.has(id)||trophies.includes(id));
    const focus = ranked.find(evidenced) ?? ranked[0];
    const evidence = focus && focusEvidence[focus].find(id=>flags.has(id)||trophies.includes(id));
    return {focus,flags:[...flags],trophies,evidence: evidence ? str(C.flags[evidence],C.awards[evidence]?.name) : "",
      regime: politics?.regimeId ?? (validTurn(raw.regime?.turn) && raw.regime.turn<=end.turn ? raw.regime.id : null),
      seed:str(raw.seed)};
  }
  function make(raw) {
    if (!obj(raw) || !["timeline","series","civilization","achievements","victories","metrics"].some(k => Object.hasOwn(raw,k))
        || !(Array.isArray(raw.timeline) || Array.isArray(raw.series) || Array.isArray(raw.achievements) ||
             Array.isArray(raw.victories) || obj(raw.metrics) || str(raw.civilization))) throw Error("CivRogueの年代記JSONを選んでください。");
    const byTurn = new Map();
    for (const e of records(raw.timeline)) if (validTurn(e.turn) && !byTurn.has(e.turn)) byTurn.set(e.turn,e);
    const timeline = [...byTurn.values()].sort((a,b) => a.turn-b.turn);
    const entries = key => records(raw[key]);
    const awards = entries("achievements").filter(a => str(a.id) || str(a.name)).sort((a,b) => (a.turn??Infinity)-(b.turn??Infinity));
    const wins = entries("victories"), series = seriesFrom(raw,timeline);
    const last = validTurn(raw.end?.turn) ? raw.end.turn : timeline.at(-1)?.turn ?? series.at(-1)?.turn ?? (raw.end === null && Array.isArray(raw.timeline) ? 0 : null);
    const status = str(raw.end?.reason,raw.end === null ? "ongoing" : "unknown");
    const statusText = ({victory:wins.map(w=>str(w.title,C.goals[w.id])).filter(Boolean).join("・") || "勝利",collapse:"文明の崩壊",limit:"歴史の完結",ongoing:"進行中"})[status] ?? "結末の記録なし";
    const regime = str(raw.regime?.name, str(raw.actualGovernance?.name,
      raw.regime === null ? "中央政府を設けず" : "体制の記録なし"));
    const values = Object.fromEntries(Object.keys(metrics).map(k => [k,metricValue(raw.metrics?.[k]) ? raw.metrics[k] :
      metricValue(series.at(-1)?.[k]) ? series.at(-1)[k] : null]));
    const strongest = Object.keys(metrics).filter(k => values[k] !== null && values[k] === Math.max(...Object.values(values).filter(num)));
    const focus = ({space:"knowledge",religion:"religion",economy:"wealth",democracy:"order",conquest:"power",culture:"culture"})[wins[0]?.id] ?? strongest[0] ?? "order";
    const edges = connections(raw,timeline,byTurn);
    const crisisList = entries("crises"), governments = entries("politicalHistory").filter(g => g.action === "approve");
    const crises = crisisList.filter(c => validTurn(c.startedAt));
    const duration = c => num(c.duration) ? c.duration : validTurn(c.recoveredAt) ? c.recoveredAt-c.startedAt+1 : null;
    const longest = [...crises].sort((a,b) => (duration(b)??0)-(duration(a)??0))[0];
    const points = entries("turningPoints");
    const marked = new Map();
    function mark(turn, rank, kind, label) {
      if (!byTurn.has(turn)) return;
      const p = marked.get(turn) ?? {entry:byTurn.get(turn),rank:0,kind:"choice",labels:[]};
      if (rank>p.rank) { p.kind=kind; p.rank=rank; }
      if (label && !p.labels.includes(label)) p.labels.push(label);
      marked.set(turn,p);
    }
    for (const p of points) mark(p.turn,1,"choice",str(arr(p.reasons)[0]));
    for (const f of entries("historicalForks")) { mark(f.fromTurn,5,"choice",str(f.link)); mark(f.turn,5,"choice",str(f.link)); }
    for (const g of governments) mark(g.turn,7,"institution",str(g.regime)+"の批准");
    for (const c of crises) { mark(c.startedAt,8,"crisis","経済危機の発生"); mark(c.recoveredAt,8,"recovery","経済危機からの回復"); }
    for (const a of awards) mark(a.turn,9,"trophy",str(a.name,C.awards[a.id]?.name));
    for (const e of timeline) {
      if (arr(e.people).length) mark(e.turn,4,"person",names(e.people).join("・"));
      if (["major","exceptional"].includes(e.incident?.severity)) mark(e.turn,8,e.incident.kind==="calamity"?"disaster":"luck",str(C.incidentKinds[e.incident.kind],"重大な偶然の事件"));
      if (e.reconstruction) mark(e.turn,7,"recovery","復興");
    }
    if (raw.end?.reason) mark(raw.end.turn,12,"ending",statusText);
    const chapters = eras.map((name,i) => {
      const events=timeline.filter(e=>e.era===i);
      const ranked = events.map(e=>marked.get(e.turn) ?? {entry:e,rank:0,labels:[],kind:"choice"}).sort((a,b)=>b.rank-a.rank||a.entry.turn-b.entry.turn);
      const highlights = ranked.slice(0,3).sort((a,b)=>a.entry.turn-b.entry.turn);
      const title = str(ranked[0]?.entry?.eventTitle,events.length ? "この時代の記録" : "章の記録なし");
      const earned = awards.filter(a=>byTurn.get(a.turn)?.era===i);
      const summary = events.length ? `第${events[0].turn}〜${events.at(-1).turn}ターンの${events.length}件。` +
        (earned.length ? `この時代には「${str(earned[0].name,C.awards[earned[0].id]?.name)}」${earned.length>1 ? "をはじめとする"+earned.length+"件の偉業を" : "を"}記録した。` :
          (events[0].year!=null && events.at(-1).year!=null ? `${year(events[0].year)}から${year(events.at(-1).year)}までの歩み。` : "")) :
        "この時代に属する出来事は記録されていません。";
      return {name,events,title,highlights,summary,art:eraSnapshot(events,timeline,raw,awards,series)};
    });
    const procedures=entries("finalProcedures");
    const plans=Object.keys(C.goals).map(id=>{
      const p=raw.victoryProgress?.[id];
      const milestones=records(p?.milestones).filter(m=>validTurn(m.turn));
      const passes=procedures.filter(f=>f.goal===id && f.action==="pass");
      const delayed=crises.flatMap(c=>records(c.delays)).filter(d=>str(d.goal)===id);
      const setbacks=entries("victorySetbacks").filter(f=>f.goal===id);
      const win=wins.find(w=>w.id===id);
      const state=win||validTurn(p?.achievedAt)?"達成":passes.length?"最終手続きを見送り": milestones.length||setbacks.length||delayed.length?(status==="ongoing"?"進行中":"未完了"):null;
      return {id,name:str(win?.title,C.goals[id]),state,milestones,passes,setbacks,win,route:str(p?.route)};
    }).filter(p=>p.state);
    return {raw,name:str(raw.civilization,"名称の記録なし"),title:str(raw.title),timeline,byTurn,awards,wins,regime,focus,values,strongest,edges,
      paths:pathsFrom(timeline,edges),chapters,series,crises,longest,duration,governments,marked,plans,last,status,statusText};
  }
  window.AlbumModel={make,eras,metrics,arr,records,str,num,year,names,validTurn,metricValue};
})();
