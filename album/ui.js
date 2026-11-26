(() => {
  "use strict";
  const M=window.AlbumModel, C=window.AlbumCatalog;
  const esc=value=> String(typeof value==="string" || typeof value==="number" ? value : "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const glyphs={
    book:'<path d="M3 5c4-1.5 6-1 9 1 3-2 5-2.5 9-1v14c-4-1-6-.5-9 1-3-1.5-5-2-9-1zM12 6v14"/>',
    home:'<path d="m3 10 9-7 9 7M5 9v11h14V9M10 20v-7h4v7"/>',
    profile:'<path d="M3 5h18v14H3zM13 9h5m-5 4h4"/><circle cx="8" cy="10" r="2"/><path d="M5 16q3-5 6 0"/>',
    eras:'<path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14m6-12v14"/>',
    award:'<path d="m8 15-1 7 5-3 5 3-1-7"/><circle cx="12" cy="9" r="7"/><path d="m12 5 1.2 2.6 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4z"/>',
    chart:'<path d="M4 3v17h17M7 15l4-6 4 3 6-8"/>', links:'<circle cx="5" cy="12" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="m7 11 9-5m-9 7 9 5"/>',
    log:'<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M3 7h4m-4 5h4m-4 5h4m3-9h6m-6 4h6m-6 4h4"/>',
    upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 16v4h16v-4"/>',save:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
    compare:'<rect x="2" y="5" width="8" height="15" rx="2"/><rect x="14" y="3" width="8" height="15" rx="2"/>',
    menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',next:'<path d="m9 5 7 7-7 7"/>',back:'<path d="m15 5-7 7 7 7"/>',
    trade:'<path d="M4 9h15l-4-4M20 15H5l4 4"/>',
    flag:'<path d="M5 21V4q5-3 8 0t7 0v9q-4 3-7 0t-8 0"/>',turn:'<path d="M5 4h14M5 20h14M7 4c0 4 2 5 5 8-3 3-5 4-5 8m10-16c0 4-2 5-5 8 3 3 5 4 5 8"/>',
    leaf:'<path d="M20 3C7 3 2 8 5 16s16 4 15-13ZM4 21 16 8"/>',scroll:'<path d="M4 5c1-3 4-2 4 0v12c0 4 7 4 7 0v-2h6c0 4-2 6-5 6M7 3h12v12"/>',
    shelf:'<path d="M3 20h18M4 5h4v12H4zm6-2h3v14h-3zm5 4 3-1 3 10-3 1z"/>',
    print:'<path d="M7 8V3h10v5M6 18H3V8h18v10h-3M7 14h10v7H7z"/>', close:'<path d="m5 5 14 14M19 5 5 19"/>'
  };
  const icon=(id,size=18)=>`<svg aria-hidden="true" class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${glyphs[id]??glyphs.book}</svg>`;
  const trophy=(id)=>`<svg class="trophy-art" viewBox="0 0 120 96" aria-hidden="true">${Object.hasOwn(window.AlbumTrophyArt,id)?window.AlbumTrophyArt[id]:""}</svg>`;
  const stamp=(kind,id)=>window.AlbumStamps.draw(kind,id);
  const section=(id,title,ico,body,extra="")=>`<section class="leaf-section ${extra}" id="${id}" aria-labelledby="heading-${id}"><header class="section-title"><span class="head-icon">${icon(ico,22)}</span><h2 id="heading-${id}">${title}</h2><i></i></header>${body}</section>`;
  const eraName=e=> M.eras[e.era] ? M.eras[e.era]+"時代" : "時代不詳";
  const empty=s=>`<p class="note">${esc(s)}</p>`;
  const jump=(m,turn,label)=>m.byTurn.has(turn)?`<button type="button" class="turn-link" data-log="${turn}">${esc(label??("第"+turn+"ターン"))}</button>`:esc(label??"ターン不詳");
  function radar(m) {
    const keys=Object.keys(M.metrics),cx=115,cy=88,r=58;
    const pt=(i,k)=>[cx+Math.sin(i*2*Math.PI/5)*k,cy-Math.cos(i*2*Math.PI/5)*k].map(v=>v.toFixed(1)).join(",");
    const ring=k=>keys.map((_,i)=>pt(i,k)).join(" ");
    const poly=keys.every(k=>M.num(m.values[k]))?`<polygon fill="#8cbd9b" fill-opacity=".55" stroke="#326e58" stroke-width="2.4" points="${keys.map((k,i)=>pt(i,r*m.values[k]/100)).join(" ")}"/>`:"";
    return `<svg class="radar" viewBox="0 0 230 172" role="img" aria-label="5指標のレーダーチャート。数値は隣に掲載"><g fill="none" stroke="#d4dacd">${[.25,.5,.75,1].map(f=>'<polygon points="'+ring(f*r)+'"/>').join("")}${keys.map((_,i)=>'<path d="M115 88L'+pt(i,r)+'"/>').join("")}</g>${poly}${keys.map((k,i)=>{const [x,y]=pt(i,r+20).split(",");return `<text x="${x}" y="${+y+4}" text-anchor="middle" fill="#3c5148" font-size="10">${M.metrics[k][0]}</text>`;}).join("")}</svg>`;
  }
  function graph(m,enabled) {
    if (!m.series.length) return empty("指標の推移データがありません。");
    const w=matchMedia("(max-width:650px)").matches?390:840, left=33,right=w-15,top=51,bottom=205;
    const last=Math.max(1,...m.series.map(p=>p.turn),m.last??0);
    const x=t=>left+(right-left)*t/last,y=v=>bottom-(bottom-top)*v/100;
    const bands=m.crises.map(c=>`<rect x="${x(c.startedAt-.45)}" y="${top}" width="${Math.max(1,x(c.recoveredAt??last)-x(c.startedAt-.45))}" height="${bottom-top}" fill="#efcda7" opacity=".52"/>`).join("");
    const borders=m.chapters.filter(c=>c.events.length).map(c=>{const start=x(c.events[0].turn);return `<path d="M${start} ${top}V${bottom}" stroke="#b9b7a3" stroke-dasharray="3 4"/><text x="${start+3}" y="${top+12}" font-size="9" fill="#616755">${c.name}</text>`;}).join("");
    const paths=Object.entries(M.metrics).filter(([k])=>enabled.has(k)).map(([k,[,color,dash]])=>{
      let prev=null;const d=m.series.map(p=>{if(!M.metricValue(p[k])){prev=null;return "";}const step=(prev===p.turn-1?"L":"M")+x(p.turn).toFixed(2)+" "+y(p[k]).toFixed(2);prev=p.turn;return step;}).join(" ");
      return `<path fill="none" stroke="${color}" stroke-width="2.5" stroke-dasharray="${dash}" stroke-linecap="round" d="${d}"/>`;
    }).join("");
    const points=[...m.marked.values()].filter(p=>p.rank>=7).sort((a,b)=>a.entry.turn-b.entry.turn);
    const marker={ending:"◆",trophy:"★",institution:"▣",disaster:"▲",luck:"✦",crisis:"▼",recovery:"＋"};
    const markers=points.map((p,i)=>{const t=p.entry.turn,q=x(t),y0=12+(i%2)*18;return `<g class="graph-pin" role="button" tabindex="0" data-inspect="${t}" aria-label="第${t}ターン　${esc(p.entry.eventTitle)}"><title>${esc(p.labels.join("・"))}</title><path d="M${q} ${y0+7}V${top-1}" stroke="#a49b89" stroke-dasharray="2 3"/><circle cx="${q}" cy="${y0}" r="9" fill="#fff7df" stroke="#af9270"/><text x="${q}" y="${y0+4}" text-anchor="middle" font-size="11" fill="#60472d">${marker[p.kind]??"●"}</text></g>`;}).join("");
    const ticks=[...new Set([0,Math.round(last/3),Math.round(2*last/3),last])];
    return `<svg class="trend-svg" viewBox="0 0 ${w} 232" role="group" aria-label="文明の指標の推移と出来事">${bands}${[0,25,50,75,100].map(v=>`<path d="M${left} ${y(v)}H${right}" stroke="#dedbd0"/><text x="${left-5}" y="${y(v)+4}" text-anchor="end" font-size="10">${v}</text>`).join("")}${borders}${paths}${markers}${ticks.map(t=>`<text x="${x(t)}" y="224" text-anchor="middle" font-size="11">${t}</text>`).join("")}</svg>`;
  }
  window.AlbumUI={esc,icon,trophy,stamp,section,eraName,empty,jump,radar,graph};
})();
