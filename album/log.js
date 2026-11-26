(() => {
  "use strict";
  const M=window.AlbumModel,U=window.AlbumUI,P=window.AlbumPages,C=window.AlbumCatalog;
  const {esc:h,jump,empty}=U, {str,arr,records,names,year,num}=M;
  function rows(m,era,topic) {
    const selected=m.timeline.filter(e=>(era==="all"||String(e.era)===era)&&(topic==="all"||e.category===topic));
    return `<p class="log-count">${selected.length} / ${m.timeline.length} 件</p>`+selected.map(e=>`<details class="log-row" id="event-${e.turn}" data-turn="${e.turn}"><summary><span class="log-turn">T${e.turn}</span><b>${h(P.title(e))}</b><small>${h(str(e.category))}</small></summary><div class="log-entry"></div></details>`).join("")+(selected.length?"":empty("この条件の出来事はありません。"));
  }
  function page(m) {
    const cats=[...new Set(m.timeline.map(e=>str(e.category)).filter(Boolean))];
    return U.section("log","完全プレーログ","log",`<div class="log-tools"><label>時代 <select id="log-era"><option value="all">すべての時代</option>${m.chapters.map((c,i)=>c.events.length?`<option value="${i}">${c.name}時代</option>`:"").join("")}</select></label><label>分野 <select id="log-topic"><option value="all">すべての分野</option>${cats.map(c=>`<option value="${h(c)}">${h(c)}</option>`).join("")}</select></label></div><div id="log-rows">${rows(m,"all","all")}</div>`);
  }
  function entry(m,e) {
    const f=[],field=(name,body)=>{if(body)f.push(P.note(name,body));},plain=(name,v)=>field(name,h(str(v)));
    const group=(name,v,fmt)=>{const data=records(v);if(data.length)field(name,data.map(fmt).join("<br>"));};
    const join=(v,dict={})=>arr(v).map(x=>typeof x==="string"?str(dict[x],x):str(x?.name,str(dict[x?.id],str(x?.id)))).filter(Boolean).join("・");
    const affected=v=>Object.entries(M.metrics).filter(([k])=>num(v?.[k])).map(([k,[n]])=>n+" "+(v[k]>0?"+":"")+v[k]).join("　");
    const ref=l=>jump(m,l.turn,P.turn(l.turn)+"　"+str(l.label,str(l.eventTitle)));
    plain("時代・年代",U.eraName(e)+" ／ "+year(e.year));
    plain("状況",e.body);
    if(e.incident){plain("偶然による出来事",str(C.incidentKinds[e.incident.kind],"偶然")+"　"+str(e.incident.narrative));
      plain("対応前の変動",affected(e.incident.changes));plain("備えで軽減された損失",affected(e.incident.prevented));}
    if(e.selected){plain(e.actor==="ai"?"AIが選んだ行動":"選んだ行動",e.selected.title);plain("選択前の説明",e.selected.summary);}
    else if(e.actor==="chance") plain("プレイヤーの対応","対応を選ぶ前に文明が崩壊した。");
    group("選ばなかった選択肢",e.alternatives,o=>h([o.title,o.summary].filter(s=>typeof s==="string").join(" ／ ")));
    plain("直後の結果",e.result);plain("指標の変動",affected(e.changes));
    plain("ターン終了時の値",Object.entries(M.metrics).filter(([k])=>num(e.after?.[k])).map(([k,[n]])=>n+" "+e.after[k]).join("　"));
    plain("成立した制度",join(e.institutions,C.flags));plain("廃止した制度",join(e.institutionsEnded,C.flags));
    plain("生まれた思想・体制",join(e.ideology?.formed,C.tags));plain("終了した思想・体制",join(e.ideology?.ended,C.tags));
    plain("統合した国",join(e.nations,C.nations));plain("成立した勝利",join(e.victories,C.goals));
    plain("獲得した偉業",arr(e.trophies).map(id=>str(C.awards[id]?.name,str(id))).join("・"));
    group("偉業のその後",e.trophyChanges,l=>h(str(C.awards[l.id]?.name,str(l.id))+" ／ "+str(l.status)));
    group("人物",e.people,l=>h([l.name,l.role,l.stage].filter(x=>typeof x==="string").join(" ／ ")));
    group("制度間の対立と対応",e.conflicts,l=>h([l.topic,l.outcome].filter(x=>typeof x==="string").join(" ／ ")));
    const crisis=e.crisis;if(crisis)plain("経済危機",[({started:"発生",response:"対応",recovered:"回復"})[crisis.action],crisis.method,crisis.sacrifice].filter(x=>typeof x==="string").join(" ／ "));
    plain("復興",e.reconstruction);group("因果の参照元",e.causes,ref);group("後世への参照",e.consequences,ref);
    return P.dl(f.join(""))+P.details("このターンの元データ",`<pre>${h(JSON.stringify(e,null,2))}</pre>`);
  }
  window.AlbumLog={page,rows,entry};
})();
