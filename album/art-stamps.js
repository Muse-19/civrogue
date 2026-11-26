/* Original small illustrations for the civilization album. All coordinates are in an
   80-unit square. Frames and enamels are shared so the set prints as one collection. */
(() => {
  "use strict";

  const ink = "#523e32";
  const cream = "#fff4d6";
  const gold = "#e4ad49";
  const brass = "#b87936";
  const coral = "#dd8264";
  const plum = "#926476";
  const leaf = "#76a68a";
  const pine = "#446d61";
  const sky = "#8bbac9";
  const lake = "#548596";
  const clay = "#af7154";
  const linen = "#ede0b8";

  const path = (d, fill = "none") => `<path d="${d}" fill="${fill}"/>`;
  const ellipse = (x, y, rx, ry, fill) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
  const dot = (x, y, r, color = ink) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="none"/>`;
  const rect = (x, y, w, h, r, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
  const thin = d => `<path d="${d}" fill="none" stroke-width="1.25"/>`;
  const star = (x,y,s,color=gold) => `<g transform="translate(${x} ${y}) scale(${s})">${path("M0 -6 Q1 -1 5 0 Q1 1 0 6 Q-1 1 -5 0 Q-1 -1 0 -6Z",color)}</g>`;
  const tile = (x,y,roof,wall) => path(`M${x} ${y+1}l7 -6 7 6v10H${x}z`,wall) +
    path(`M${x-2} ${y+1}l9 -9 9 9 -2 2 -7 -6 -7 6Z`,roof) + rect(x+5,y+5,4,6,1,clay);
  const laurel = path("M28 57Q16 49 17 35 M52 57Q64 49 63 35") +
    path("M19 46q-7-2 -6-9 6 2 6 9Zm3 6q-7 0-9-5 5-1 9 5Zm39-6q7-2 6-9-6 2-6 9Zm-3 6q7 0 9-5-5-1-9 5Z",leaf);
  const book = path("M19 37q10-3 20 2 11-5 22-2v17q-11-2-22 3-10-5-20-3Z",clay) +
    path("M20 33q10-3 19 2 11-5 21-2v18q-11-2-21 3-10-5-19-3Z",cream) + thin("M39 36v17 M24 39q6-1 11 2 M24 44q6-1 11 2 M44 40l10-2 M44 45l10-2");
  const feather = path("M33 42Q37 19 59 16q-1 13-9 19l-4-1-2 5-11 3Z",leaf) +
    thin("M29 48q10-14 24-25 M39 36l6-1 M46 28l1-5");

  // The picture, its pastel enamel and the small enamel's border accent.
  const art = {};
  function picture(id, ground, accent, drawing) {
    art[id] = {ground, accent, drawing};
  }

  picture("lunar", "#dce9ed", lake,
    path("M15 56q11-7 24-3 13 4 28-1",linen) + thin("M18 57h8 M49 57h6") +
    path("M31 38l-8 14m20-14 11 14M18 53h10m21 0h10") +
    path("M28 35l3-11h14l4 11-3 8H31Z",gold) +
    path("M31 32l3-6h8l3 6-2 4h-9Z",sky) + path("M26 40h24v4H26Z",cream) +
    thin("M35 45l-3 7 M38 45l-3 7 M31 48h6 M49 24l3-8") + ellipse(52,17,4,2,cream) +
    star(21,26,.55,cream) + star(59,31,.42,gold));
  picture("ballot", "#dcebd9", pine,
    path("M21 41l13-6h20l7 7-14 6Z",sky) + path("M21 41l25 4v15l-25-5Z",leaf) +
    path("M46 45l15-4v14l-15 5Z",pine) + path("M30 40l17-2 5 2-16 3Z",ink) +
    path("M32 22l15-4 5 15-15 5Z",cream) + path("M37 28l4 3 5-9") + thin("M27 48l11 2"));
  picture("world", "#e4ecdb", pine,
    ellipse(39,39,17,17,sky) + path("M25 29l7 1 2 4-5 4 3 5-5 3-4-5q-2-7 2-12Z",leaf) +
    path("M40 22l6 2 2 4 5 1 2 6-6 2-3-3-6 2-4-4 5-4Z",leaf) + path("M41 41l10-3 2 7-5 6-3 1-2-6Z",leaf) +
    laurel + path("M24 54q14 5 29-1l-1 6q-13 5-27 0Z",cream) + thin("M31 57q10 2 16-1"));
  picture("tradefleet", "#e0ece6", lake,
    path("M17 47q19 5 45-3l-7 10q-18 5-32 0Z",clay) + thin("M22 51q18 3 35-2 M40 46V19") +
    path("M38 22q-2 13-13 19 8 1 13 0Z",cream) + path("M42 25q10 5 12 14l-12 2Z",coral) +
    path("M40 21l9-2-3 3 3 1-9 2Z",gold) + path("M17 58q5-3 10 0 5-3 10 0 5-3 10 0 5-3 11 0") +
    star(57,25,.52));
  picture("anthology", "#f4e4d8", coral, book + feather + star(23,25,.55) + star(59,33,.35));
  picture("pilgrimage", "#eee3dc", plum,
    path("M20 48h38v8H20Z",linen) + path("M20 47V33q0-4 6-8 6 4 6 8v14Z",coral) +
    path("M46 47V33q0-4 6-8 6 4 6 8v14Z",sky) + path("M29 48V31q0-7 10-13 10 6 10 13v17Z",cream) +
    path("M34 47V34q0-5 5-9 5 4 5 9v13Z",gold) + thin("M39 28v18 M35 34h8 M36 39h6 M25 34v6 M53 34v6") +
    ellipse(39,17,2,2,brass) + thin("M24 52h30"));
  picture("keepsake", "#f4e8c9", brass, laurel +
    path("M29 29q-9-5-8 3 1 9 11 11m18-14q10-5 9 3-2 9-12 11",gold) +
    path("M28 26h23q0 18-10 20v5l7 3v3H32v-3l6-3v-5q-10-3-10-20Z",gold) +
    path("M28 25h23v5H28Z",cream) + star(40,36,.56,cream));
  picture("remains", "#e9e3d7", clay,
    path("M16 56q13-3 22 0 13-2 25-1",linen) + path("M21 53V35h6v-7h7v11l6-3v17Z",linen) +
    path("M45 54V30l5 3v-8l7 5v24Z",clay) + thin("M22 42h9 M26 42v5 M49 39h8 M55 40v5") +
    path("M33 55l4-6 8 2 4 5Z",gold) + path("M41 51v-8q2-4 7-5-1 7-7 6m0 4q-7-1-7-6 6 1 7 6Z",leaf));
  picture("lastpage", "#f2e6cf", brass,
    ellipse(40,28,8,8,gold) + thin("M39 15v3 M25 20l3 3 M54 19l-2 3 M24 29h-4 M56 28h4") +
    path("M18 37q10-7 22-3 8-6 22-1v6H18Z",leaf) + book +
    path("M48 37l5-1v11l-3-2-2 2Z",coral));
  picture("journey", "#e1e9dd", pine, book +
    path("M39 35q-11-3-14-16 11 1 14 11-1-12 12-15-1 14-12 17Z",leaf) + thin("M39 37V28"));
  picture("roundtable", "#efe4d3", clay,
    ellipse(31,28,4,4,coral) + ellipse(50,28,4,4,sky) + ellipse(21,37,4,4,gold) + ellipse(59,37,4,4,leaf) +
    path("M26 48v9m25-9v9") + ellipse(40,42,18,11,clay) + ellipse(40,39,18,10,linen) +
    path("M32 39l8-4 8 4-8 4Z",cream) + ellipse(36,53,4,4,leaf) + ellipse(47,53,4,4,coral));
  picture("crown", "#f5e8cd", brass,
    path("M19 29l11 8 10-16 10 16 11-9-5 23H24Z",gold) +
    path("M24 48q15-3 32 0v6q-17-3-32 0Z",cream) +
    path("M36 39l4-5 4 5-4 5Z",coral) + dot(28,41,1.5,lake)+dot(52,41,1.5,lake)+
    ellipse(20,28,2,2,cream)+ellipse(40,20,2,2,cream)+ellipse(60,27,2,2,cream));
  picture("canopy", "#ede2d8", plum,
    path("M18 34q13-6 21-17 10 12 23 17l-6 5-6-3-6 4-5-4-6 4-6-5-5 3Z",plum) +
    path("M24 38v17m31-17v17M21 56h38") + thin("M34 25l-5 9m15-9 5 9 M40 38v5") +
    path("M36 45l4-4 4 4-1 6h-6Z",gold) + path("M28 53h23v4H28Z",linen));
  picture("tower", "#e5e5dc", lake,
    path("M20 34h11v18H20Zm29-7h10v25H49Z",sky) + path("M33 28l7-8 7 8v25H33Z",linen) +
    path("M38 19v-5l9 3-8 2",coral) + path("M17 53h46v5H17Z",clay) +
    thin("M24 39h3m-3 6h3m10-14h6m-6 6h6m-6 6h6m10-10h3m-3 6h3"));
  picture("drum", "#eae4d6", coral,
    path("M23 38v12q14 11 30 0V38Z",coral) + ellipse(38,38,15,6,cream) +
    thin("M26 42l4 10 6-9 6 11 6-12 3 7 M21 28l27 8 M54 23L32 35") +
    ellipse(20,27,3,2,gold)+ellipse(55,22,3,2,gold)+path("M25 50q13 8 27 0v3q-13 8-27 0Z",gold));
  picture("seats", "#e5ebdf", pine,
    path("M16 47q0-25 24-26 23 1 24 26l-7 4q0-21-17-22-18 0-18 22Z",leaf) +
    path("M27 48q0-15 13-16 13 0 14 16l-6 3q0-10-8-11-8 0-9 12Z",gold) +
    thin("M24 29l5 5m8-12v6m14-3-2 6m8 4-4 3m-19 0 2 4m9-7-2 5") +
    path("M34 51l7-4 7 4-3 6H35Z",clay));
  picture("voices", "#e4ebdc", pine,
    path("M15 26q0-4 4-4h20q5 0 5 5v11q0 4-4 4h-9l-8 7v-7h-3q-5 0-5-4Z",cream) +
    thin("M21 29h15m-15 5h9") +
    path("M35 35q0-4 4-4h18q4 0 4 4v11q0 5-4 5h-1v6l-9-6h-8q-4 0-4-5Z",leaf) +
    dot(43,41,1.5,cream)+dot(49,41,1.5,cream)+dot(55,41,1.5,cream));
  picture("retort", "#e4ece1", leaf,
    path("M30 21h14v4l-3 1v9l12 15q4 7-5 8H25q-8-1-4-8l12-15v-9l-3-1Z",cream) +
    path("M25 46q6-3 12 0 5 1 10-2l6 8q1 4-5 4H25q-6 0-3-5Z",sky) +
    thin("M33 26h8 M27 50l3-4") + dot(37,51,1.8,cream)+dot(43,48,1.3,cream)+star(53,25,.7));
  picture("chip", "#e1e9e5", lake,
    path("M24 30l-5-3h-3m8 11h-9m9 8-7 4m39-20 5-3h3m-8 11h9m-9 8 7 4M32 24v-7m8 7v-9m8 9v-7m-16 37v7m8-7v9m8-9v7") +
    rect(24,24,32,30,5,leaf)+rect(29,29,22,20,4,cream)+
    thin("M32 42l5-5 5 4 5-7")+dot(37,37,1.8,coral)+dot(43,41,1.8,lake));
  picture("scale", "#f0e6cd", brass,
    path("M39 21v32m-8 2h18m-26-25 32-6") + ellipse(40,22,3,3,gold) +
    thin("M24 29l-6 14m6-14 7 14m22-18-6 13m6-13 7 13") +
    path("M16 43h17q-7 13-17 0Z",leaf)+path("M45 38h17q-7 13-17 0Z",coral)+
    path("M35 53h10l5 5H30Z",gold));
  picture("works", "#e5e7dc", lake,
    path("M20 54V35l8 4v-8l11 6v-9l12 8 3-17h5l2 36Z",coral)+
    path("M18 54h45v4H18Z",linen)+thin("M25 45h4m5 0h4m5 0h4m6 0h4 M26 49h4m5 0h4m6 0h4")+
    path("M54 15q-4-2-6 0-3 2-5 0",cream));
  picture("bridge", "#dfeae2", pine,
    tile(13,39,coral,cream)+tile(48,38,sky,linen)+
    path("M24 50q15-17 29-1v6h-4q-10-14-21 0h-4Z",clay)+thin("M30 40v5m6-10v6m6-6v6m5-2v4")+
    path("M24 43q15-17 29-1")+path("M28 58q5-3 10 0 5-3 11 0"));
  picture("hearth", "#e9e8d7", coral,
    path("M15 48l10-18 11 18Z",linen)+path("M19 48l6-9 6 9Z",clay)+
    path("M44 47l10-19 12 19Z",leaf)+path("M49 47l5-8 6 8Z",pine)+
    path("M32 53q-3-5 2-10l2 3q5-6 3-13 11 8 8 16-1 5-6 7Z",coral)+
    path("M37 53q-1-3 3-7 5 6 2 8Z",gold)+thin("M30 58l17-3 M32 55l15 4"));
  picture("law", "#e7e9d8", leaf,
    path("M25 24h29v28l-3 3H23l3-6Z",cream)+ellipse(26,25,4,3,linen)+
    path("M25 22h27q5 0 4 6h-6q2-5-1-5H26Z",linen)+
    path("M23 50h25q-2 6 1 7H24q-5-1-4-5Z",gold)+thin("M32 32h14m-15 5h11m-10 5h9")+
    path("M46 48l1 11 4-3 4 1-2-11Z",plum)+ellipse(49,45,5,5,coral));
  picture("market", "#f0e6d2", brass,
    path("M18 34l6-11h31l7 11v5H18Z",cream)+
    path("M25 24h8l-3 12h-9Z M42 24h7l3 12h-10Z",coral)+thin("M21 39v14m37-14v14")+
    ellipse(29,46,4,4,gold)+ellipse(35,46,4,4,leaf)+ellipse(41,47,4,4,coral)+
    rect(19,49,41,7,2,clay)+thin("M24 53h30"));
  picture("telescope", "#e0e9e9", lake,
    path("M26 34l24-14 6 9-25 13Z",sky)+path("M23 36l5-3 5 7-6 4Z",gold)+
    path("M49 19l4-2 8 12-5 3Z",cream)+ellipse(40,39,4,4,gold)+
    path("M39 43l-12 14m13-14 1 15m0-16 12 13")+star(23,23,.65));
  picture("envoys", "#e5eadc", pine,
    path("M26 52V22q9-4 19 0l-2 14q-8-3-17-1Z",leaf)+path("M47 53V31q8-4 16 0l-1 11q-8-3-15-1Z",coral)+
    thin("M22 54h8m13 2h9")+ellipse(26,21,2,2,gold)+ellipse(47,29,2,2,gold));
  picture("weaver", "#f0e1d7", clay,
    path("M19 52l3-28h34l4 28Z",linen) + path("M23 24h5l-1 27h-6Z M51 24h5l4 27h-6Z",clay) +
    thin("M32 28v19m5-19v19m5-19v19m5-19v19") +
    path("M28 37h23v12H27Z",coral)+thin("M29 41l4-3 5 4 5-4 7 4m-22 3 5-3 5 4 6-4 7 4")+
    path("M17 52h46v5H17Z",clay));
  picture("belief", "#ece3e1", plum,
    path("M23 54h34 M39 49q-10-10-8-21 8 2 9 11 2-10 10-15 2 14-10 25Z",gold)+
    path("M24 39q13-2 16 11 5-13 16-11-4 15-16 16-11-2-16-16Z",leaf)+
    star(39,20,.8,cream));
  picture("fortune", "#eee9cb", brass,
    path("M35 56q9-13 12-31")+path("M43 35q-10-2-9-12 9 3 9 12Zm-4 12q-12-2-12-13 11 2 12 13Zm5-7q10-1 12-12-10 0-12 12Zm-4 12q11 0 14-11-11-1-14 11Z",gold)+
    path("M46 29q-4-7 5-14 4 9-5 14Z",leaf)+star(22,27,.7,cream)+star(60,42,.48,cream));
  picture("tempest", "#e3e6e7", lake,
    path("M22 40q-8-2-5-10 1-5 8-5 2-10 12-8 5 1 7 6 8-5 14 2 3 4 1 7 8 4 2 9Z",sky)+
    path("M39 36l-9 13h8l-3 11 14-18h-9l5-6Z",gold)+
    thin("M22 46l-3 6m36-5-4 8m10-8-2 4"));
  picture("shortage", "#f3e0d1", clay,
    path("M32 29l-4-10 8 2 4-3 4 4 7-2-5 10q14 16 10 22-13 12-31 1-5-8 7-24Z",coral)+
    path("M31 28h16v5H30Z",linen)+thin("M35 37l-2 5 M44 38l-5 6 4 2-6 7")+
    ellipse(55,56,7,3,gold));
  picture("regrowth", "#e1ebd8", leaf,
    path("M20 51q17-5 38 1l-2 5H22Z",clay)+path("M39 52q-1-15 3-23")+
    path("M39 44q-13-1-16-13 13 1 16 13Z",leaf)+path("M40 37q-2-14 13-17 1 12-13 17Z",leaf)+
    thin("M28 54h9 M46 53h4")+star(59,34,.6,gold));
  picture("portrait", "#efe3d6", coral,
    path("M22 56q2-14 16-16 15 0 21 16Z",leaf)+path("M33 43l8 7 7-8",cream)+ellipse(40,32,10,12,linen)+
    path("M30 31q-3-14 8-15 10-2 14 8-3 4-9 1-3 6-13 6Z",clay)+
    dot(38,32,1.2)+dot(45,32,1.2)+thin("M40 38q2 1 4-1 M41 50v5"));
  picture("crossing", "#e9e8d6", pine,
    path("M37 20h5v37h-5Z",clay)+path("M20 26h27l5 6-6 4H20Z",leaf)+path("M31 39h29v9H31l-6-4Z",gold)+
    thin("M24 31h13M40 43h15m-24 14q7-3 17 0"));
  picture("wheel", "#ede3d4", brass,
    ellipse(39,39,16,16,linen)+ellipse(39,39,12,12,cream)+
    path("M39 27v24m-12-12h24m-20-8 16 16m0-16-16 16")+ellipse(39,39,3,3,gold)+star(57,23,.6,coral));

  const victories = {
    space: "lunar", democracy: "ballot", conquest: "world", economy: "tradefleet", culture: "anthology", religion: "pilgrimage",
  };
  const regimes = {
    council_rule: "roundtable", monarchy: "crown", theocracy: "canopy", totalitarian: "tower", military_rule: "drum",
    representative: "seats", democracy: "voices", technocracy: "retort", algorithmic: "chip", merchant_rule: "scale",
    corporate_rule: "works", federal_rule: "bridge",
  };
  const topics = {
    "社会": "weaver", "社会・文化": "weaver", "文化": "anthology", "社会改革": "voices",
    "政治・法律": "law", "政治": "law", "経済・産業": "market", "経済": "market",
    "科学・技術": "telescope", "科学": "telescope", "宗教・思想": "belief", "宗教": "belief",
    "外交・戦争": "envoys", "外交": "envoys", "戦争": "drum", "災害・特殊事件": "tempest", "災害": "tempest",
    "特殊・偶然": "wheel",
  };
  const moments = {
    luck: "fortune", disaster: "tempest", crisis: "shortage", recovery: "regrowth", person: "portrait",
    institution: "law", choice: "crossing", fortune: "fortune", calamity: "tempest", ambiguous: "wheel",
  };
  const endings = { victory: "keepsake", collapse: "remains", limit: "lastpage", ongoing: "journey" };
  const kinds = { victory: victories, regime: regimes, topic: topics, moment: moments, ending: endings };
  const defaults = { victory: "keepsake", regime: "hearth", topic: "book", moment: "crossing", ending: "journey" };
  picture("book", "#eee5d8", brass, book);

  // Engraved inner rings distinguish a civic shield, a seal of achievement, and a printed token.
  function frame(kind, {ground, accent}) {
    if (kind === "regime") {
      return path("M40 4q13 8 29 9v22q-1 24-29 41Q12 59 11 35V13q15-1 29-9Z", cream) +
        path("M40 10q11 6 23 8v17q-1 20-23 34-22-14-23-34V18q13-2 23-8Z", ground) +
        `<path d="M22 20q9-1 18-6 10 5 18 6M24 54q7 8 16 14 10-6 16-14" fill="none" stroke="${accent}" stroke-width="1.45"/>` + dot(40,61,1.6,accent);
    }
    if (kind === "victory" || kind === "ending") {
      return path("M40 3q5 0 8 4 6-2 10 2 5 2 6 7 6 1 8 7 4 4 1 10 5 4 3 10-1 6-6 9 0 6-6 9-2 6-8 7-5 5-11 3-5 5-11 2-5 1-9-4-6 0-9-6-6-2-7-8-5-4-4-10-4-5-1-11-1-5 4-9 1-6 7-8 2-6 8-6 5-5 11-3 3-5 6-5Z", cream) +
        ellipse(40,39,30.5,30.5,ground) +
        `<circle cx="40" cy="39" r="27.8" fill="none" stroke="${accent}" stroke-width="1.1" stroke-dasharray="1 4"/>`;
    }
    return rect(6,7,68,65,14,cream) + rect(11,12,58,55,10,ground) +
      `<rect x="14" y="15" width="52" height="49" rx="8" fill="none" stroke="${accent}" stroke-width="1.1" stroke-dasharray="1 4"/>`;
  }

  function draw(kind, id) {
    const group = Object.hasOwn(kinds, kind) ? kind : "topic";
    // Only our own pre-drawn paths enter the SVG, including for incomplete or older reports.
    const key = Object.hasOwn(kinds[group], id) ? kinds[group][id] : defaults[group];
    const motif = art[key];
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80" aria-hidden="true" focusable="false"><g stroke="${ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${frame(group, motif)}<g>${motif.drawing}</g></g></svg>`;
  }

  window.AlbumStamps = Object.freeze({ draw });
})();
