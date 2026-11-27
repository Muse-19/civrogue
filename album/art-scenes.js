// Original vector landscapes for the album. All coordinates are in illustration space.
(() => {
  "use strict";

  const ink = "#574d43";
  const roof = "#c56e54";
  const roofLight = "#e8956e";
  const plaster = "#ffdfad";
  const side = "#d6a774";
  const jade = "#518b75";
  const sage = "#80ac84";
  const brass = "#e7b74f";
  const paper = "#fff4d2";
  const river = "#94c9c1";

  const path = (d, fill, stroke = "none", width = 1.6) =>
    `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
  const line = (d, color = ink, width = 1.5) => path(d, "none", color, width);
  const shape = (d, fill, width = 1.7) => path(d, fill, ink, width);
  const oval = (x, y, rx, ry, fill, stroke = "none", width = 1.4) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
  const circle = (x, y, radius, fill, stroke = "none", width = 1.4) =>
    oval(x, y, radius, radius, fill, stroke, width);
  const group = (x, y, scale, content) =>
    `<g transform="translate(${x} ${y}) scale(${scale})">${content}</g>`;
  const svg = (width, height, label, content) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}" stroke-linejoin="round" stroke-linecap="round">${content}</svg>`;

  function seedNumber(text) {
    let value = 2166136261;
    for (const ch of String(text ?? "")) value = Math.imul(value ^ ch.codePointAt(0), 16777619);
    return value >>> 0;
  }
  function dots(count, width, height, salt) {
    let s = salt >>> 0;
    const next = () => (s = (Math.imul(1664525, s) + 1013904223) >>> 0) / 4294967296;
    let strokes = "";
    for (let i = 0; i < count; i++) {
      const x = Math.floor(next() * width), y = Math.floor(next() * height);
      strokes += `M${x} ${y}l${i % 5 ? ".55 .2" : "1.7 -.35"}`;
    }
    return `<g opacity=".23">${line(strokes, "#805d46", .78)}</g>`;
  }

  function cloud(x, y, scale) {
    const silhouette = "M-43 3q-3-10 11-10 3-13 18-10 7-15 23-11 13 3 15 14 12-3 18 8 18-2 20 8 1 6-10 6h-87q-11 0-8-5Z";
    return group(x, y, scale, path(silhouette, "#f8edcc", "#93aea1", 1.1) +
      path("M-40 0q3-7 12-6 4-11 15-7 9-15 21-12 13 2 14 14 10-4 17 6 12-2 17 4-20-3-46-1T-40 0Z", "#fff9e4") +
      line("M-23 3h20m7 1h10m14-1h13", "#d4c9aa", .95));
  }

  function tree(x, y, scale, type = 0) {
    const shadow = oval(2, 1, 16, 4, "#7b9a70");
    const trunk = shape("M-2 1l1-21h3L4 2Z", "#a47f52", 1.25);
    const pine = shape("M0-52l11 14-4 1 11 14-6 1 9 12q-18 7-42 0l10-14-5 1 11-15h-3Z", "#638f69", 1.4) +
      path("M0-50 1-11q-9 2-18 0l9-12-3 1 9-15h-3Z", "#88ab78") +
      line("m3-34 5 4m-10 8-8 6m13-3 7 4", "#416c59", 1);
    const canopy = shape("M-13-10q-10-1-11-11-2-9 6-13-2-11 10-13 5-11 16-6 10 2 10 12 12 3 10 12 7 9-1 15-5 6-16 4-5 5-12 0Z", type === 2 ? "#bbba6e" : "#83a879", 1.4) +
      path("M-19-29q6-10 11-9-1-7 6-8 8-5 13 4-9-2-12 6-10-1-14 9Z", type === 2 ? "#d9ca83" : "#adc493") +
      line("M-6-19l5 5 9-9m-9 9 1-12m11 9q4 1 7-3", "#527353", 1.3);
    return group(x, y, scale, shadow + trunk + (type === 1 ? pine : canopy));
  }

  function cottage(x, y, scale, paint = roof, mirror = false) {
    const building = oval(2, 1, 35, 7, "#829871") +
      shape("M-26-30l28 3 21-8v33L2 7-26 0Z", plaster) +
      shape("M2-27l21-8v33L2 7Z", side, 1.3) +
      shape("M-23-30l13-22 22 5 15 13-25 8Z", paint) +
      shape("M-31-29l16-26 17 28-4 2-13-18-11 16Z", paint) +
      path("M-24-30l9-15 12 18Z", "#f9cf8c") +
      shape("M4-27l-16-27 23-7 18 24Z", paint) +
      line("m-7-50 20-6m-15 13 20-6m-15 13 20-6", "#774a40", .95) +
      line("m-9-50 4 6m10-10 4 6m-3 4 4 5", "#e8aa7e", 1.1) +
      shape("M-19 1v-13q4-5 8 0V3Z", "#89664f", 1.25) +
      shape("M-7-18l7 1v7l-7-1Z", "#799d95", 1.25) +
      shape("M8-17l8-3v8l-8 3Z", "#77928a", 1.25) +
      line("m-26-4 4 1m7-1 1-5m32 1 4-2m-31-29 3 1", "#b99969", 1);
    return group(x, y, scale, mirror ? `<g transform="scale(-1 1)">${building}</g>` : building);
  }

  function hut(x, y, scale) {
    return group(x, y, scale, oval(2, 1, 35, 7, "#91a27b") +
      shape("M-25-23q26-7 52-2l-3 23q-24 10-48 1Z", "#e4bb82") +
      shape("M-33-21Q-15-39-3-55q2-5 5 0 15 15 33 32-30 12-68 2Z", "#d8ab60") +
      line("m-2-53-18 29m25-26L-3-23m13-20 5 16m-26 2-2 3m29-4 6 1", "#a27948", 1.5) +
      shape("M-10 1v-13q5-12 13-5l4 18Z", "#845e49") +
      line("m-5-56 9-4m-9-2 7 5m-22 46 6-1m28-3 6-1", "#846847", 1.25));
  }

  function tower(x, y, scale, flagColor = roof) {
    return group(x, y, scale, oval(1, 1, 27, 6, "#899a72") +
      shape("M-16-60 5-64 21-57 19-2 0 5-17 0Z", "#f0cd98") +
      shape("M4-62 21-57 19-2 0 5Z", "#ceaa7c", 1.4) +
      shape("M-20-62l3-13 6 2v6l6-1v-6l6-1 1 6 5-1v-6l6 2v6l5 2 1-6 6 3-1 14-21 7Z", "#f4d9a4") +
      shape("M-9-39v-9q3-7 6-1v9Z", "#698a82", 1.1) +
      shape("M7-44v-8l6 2-1 9Z", "#6d8175", 1.1) +
      line("m-16-14 8-2m-5-9 7-1m18 9 6 2M-1-63v-35", "#836d51", 1.4) +
      shape("M-1-97q9-4 19 2l-5 3 4 4q-9-5-18-1Z", flagColor, 1.2));
  }

  function market(x, y, scale) {
    return group(x, y, scale, oval(2, 1, 42, 9, "#8b9a6d") +
      shape("M-30-26l48-8 16 9-47 12Z", "#d49b61") +
      shape("M-30-26l3 20 14 8v-15Z", "#b78c62") +
      shape("M-13-13l47-12-1 18L-13 3Z", "#e4ad71") +
      line("m-26-8-2-40m59 39 1-40M-13-4l-1-38", "#725440", 2.3) +
      shape("M-38-40l9-15 38-8 30 19-54 12Z", "#fff0c9") +
      path("m-29-54 7-2 21 20-11 2Zm15-4 7-1 22 20-10 2Zm15-3 8-2 28 18-11 3Z", roof) +
      shape("M-38-40l23 8 54-12-1 6q-3 5-8 2-4 5-9 2-4 5-9 2-5 5-10 2-6 5-12 2-4 0-6-4-6 3-10-3-7 2-14-5Z", "#e8b16d", 1.2) +
      oval(-10,-21,5,3,"#c56d4d",ink,1) + oval(2,-23,5,3,brass,ink,1) + oval(14,-26,5,3,"#92ac6c",ink,1) +
      line("m-7-7 10-2m5-1 13-3", "#ae7e53", 1.1));
  }

  function observatory(x,y,scale) {
    return group(x,y,scale, oval(0,1,43,10,"#869872") +
      shape("M-32-48q30 12 62-2l-2 47q-28 15-58 1Z", "#f1cf98") +
      path("M5-42q16 0 25-8l-2 47Q16 3 3 5Z", side) +
      shape("M-34-48q-1-35 28-39 28-5 39 27l1 11q-29 14-68 1Z", "#83b7ae") +
      line("M-24-46q0-28 17-40m12-1q16 10 20 40m-58 0q38 12 67-2", "#537d77", 1.5) +
      shape("M4-74 29-95l4 4-25 24Z", brass) +
      shape("m24-94 9-8 8 10-9 8Z", "#8bb7ac") +
      shape("M-9 4v-17q7-13 15-1V4Z","#89745c") +
      shape("M-24-26q4-7 8 0v8l-8-1Z", "#799c93", 1.2) +
      shape("M14-25q4-8 8-3v9l-8 3Z","#799c93",1.2) +
      line("m-29-8 8 2m39-1 9-3m-2-28 4-2", "#b39265", 1.2));
  }

  function skyCourt(x,y,scale) {
    return group(x,y,scale,oval(0,0,42,9,"#8f9f77")+
      shape("M-38-7l23-10 46 5 8 8-24 10-48-5Z","#cead7f")+
      shape("M-26-10l8-15 13-2 4 12 14 6-20 6Z","#ead49f")+
      shape("M-18-25l5-12 8-2 3 13-8 5Z","#e4c996")+
      shape("M-13-36l2-18 5-1 3 18-6 3Z","#e8cf91")+
      line("M13-8v-29m-8-4 16 4m-13 4 9-10m-5 34 4 1",ink,1.5)+
      circle(14,-34,8,"none","#997e52",1.4));
  }

  function shrine(x,y,scale) {
    return group(x,y,scale, oval(2,1,48,10,"#899b73") +
      shape("M-39-15l53-11 28 12-55 17Z", "#dfbb84") +
      shape("M-39-15l26 11 55-10-1 6-54 16-26-13Z", "#c9a172") +
      shape("M-31-49l48-8 15 6-48 14Z", "#d8ac78") +
      shape("M-29-46l5 2v29l-6-1Zm12 5 5 1v30l-6-2Zm15-3 5-1v29l-5 2Zm14-4 5-1v30l-5 2Zm14-4 5-1v31l-5 1Z", "#fae3b0", 1.25) +
      shape("M-40-51l18-27 29 8 30 19-55 15Z", roofLight) +
      shape("M-21-78 3-84l40 30-36-16Z", roof) +
      shape("M-40-51l19-27 26 18Z", "#f0d295") +
      shape("M-29-55l8-13 12 9Z", "#cda675", 1.1) +
      line("M-40-50l23 11 58-15m-37-24 26 19", "#9f6551", 1.5));
  }

  function hall(x,y,scale, flagColor) {
    return group(x,y,scale,
      cottage(-9,-2,1.17,"#7eaaa2") + tower(12,-27,.65,flagColor) +
      shape("M-28-8l35 8 18-6-1 4L7 5l-35-8Z", "#d5b584",1.1));
  }

  function windmill(x,y,scale) {
    return group(x,y,scale, oval(2,1,23,5,"#94a17a") +
      shape("M-16 0l6-44 13-4 12 45-10 8Z","#f0d9b0") +
      shape("M-15-44l9-14 12-4 8 15-12 5Z", roof) +
      shape("M-4 2v-10q4-5 7 0v12Z","#956e54",1) +
      [0,90,180,270].map(degree => `<g transform="rotate(${degree + 25} -2 -37)">` +
        shape("M-2-37v-30h6v23l-5 6Z","#f0cf91",1.2) + line("M-2-61h6m-6 6h6m-6 6h6","#a78c60",.9) + "</g>").join("") +
      circle(-2,-37,3,brass,ink,1));
  }

  function theatre(x,y,scale) {
    return group(x,y,scale, oval(0,0,37,8,"#91a078") +
      shape("M-32-34l36-10 28 11-36 10Z","#dfbd80") +
      shape("M-33-34l29 11 36-10-2 27L-5 5-31-6Z", plaster) +
      shape("M-4-23l36-10-2 27L-5 5Z",side) +
      shape("M-36-33q4-16 8-28l36-8 30 28-40 15Z","#77a69a") +
      path("M-28-61q12 7 24 35l-9-3q-6-17-18-22Z", "#abcaad") +
      line("m-27-57 37-8m-30 18 38-11m-33 16 38-10","#54847c",1.1) +
      shape("M-25-25l16 6v18l-17-7Z","#845c53",1.1) +
      path("M-25-25l7 3q1 8-7 12Zm17 6-6-2q-1 8 6 14Z",roofLight) +
      line("m5-13 18-5m-16 10 13-4","#937451",1.2));
  }

  function ship(x,y,scale,paint=roofLight) {
    return group(x,y,scale, oval(-1,3,22,3,"#79ada6") +
      shape("M-24-5q24 5 47-4-4 11-13 12-18 5-28-2Z","#a37658",1.5) +
      line("M-1-5v-37",ink,1.8) +
      shape("M-3-37q-5 15-18 24l17-1Z", paper,1.4) +
      shape("M2-36q11 8 15 19l-14 4Z", paint,1.4) +
      line("m-17-10 13-1m8-15 7 7", "#b99d73",1));
  }

  function fields(x,y,scale) {
    const tiles = [
      ["M-53 3l34-14 29 8L-26 14Z","#d8b76f"],
      ["M12-4l16-5 30 7-15 7Z","#ecce8a"],
      ["M-23 17l33-15 28 8L5 26Z","#dbb76d"],
      ["M-49 7l20 9-12 5-15-8Z","#a7b37d"]
    ];
    return group(x,y,scale, tiles.map(([d,c])=>path(d,c,"#a39767",1)).join("")+
      line("m-40 4 27-11m-15 15L-4-3m-9 20 26-11m-18 15 29-12m0-12 7-2m1 5 9-3", "#a78e56",1.7));
  }

  function person(x,y,scale,paint) {
    return group(x,y,scale,
      oval(1,1,4.2,1.5,"#97a17c") + line("m-2-3-.4 4m4-4 1 4",ink,1.5) +
      shape("M-3-9q3-3 6-1l1 8h-8Z",paint,1) + circle(0,-13,3.1,"#d8ad81",ink,.9) +
      path("M-4-14q0-6 6-3l2 3-4-1-2 2Z","#805f48"));
  }

  function petals(x,y,scale) {
    return group(x,y,scale,line("M0 0q1-7-2-12m2 8q4-7 7-10m-6 8-6-4", "#627d5c",1.2) +
      circle(-2,-12,2.5,paper)+circle(7,-14,2.6,"#e8a37d")+circle(-5,-9,2,brass));
  }

  function reed(x,y,scale) {
    return group(x,y,scale,line("M0 0q-4-15-10-20M1 0q1-15 8-27M3 1q5-11 11-13M-2 0-11-9", "#577b62",1.6) +
      path("M1-7q-1-14 8-20-2 12-8 20Zm-4-4q-9-4-10-14 7 3 10 14Z", "#7b9c6d"));
  }

  function bridge(x,y,scale) {
    return group(x,y,scale,shape("M-54-5Q0-30 55-7l-1 12-8-3q0-11-9-12-8-1-9 7l-6-1q-2-12-11-13-9-1-11 10l-8 1q-2-11-10-9-9 1-10 14l-7 3q-1-10-7-7l-10 4Z","#d5b38a",1.4) +
      line("M-53-8Q0-32 56-10m-103 5v-7m14 2v-8m18 4v-8m17 7v-8m18 8v-7m19 12v-8m15 13v-6", "#957d61",1.7));
  }

  function train(x,y,scale) {
    return group(x,y,scale,line("M-53 5q61 3 106-2","#806b53",2.4) +
      shape("M-43-16h28v16h-28Zm33-3 13-1v17h-13Z","#87a79a",1.5) +
      shape("M4-19h22q8 1 8 13l7 2v5H3Z","#8fae9c") +
      shape("M17-19l-2-11h9l-1 12Z", "#826d55") +
      shape("M-11-21l12-1 4 3-17 2Z",roof) +
      [-36,-26,-6].map(k=>shape(`M${k}-13h4v5h-4Z`,paper,.8)).join("")+
      [-36,-20,-5,9,24].map(k=>circle(k,1,4,ink)+circle(k,1,1.5,"#c6a880")).join("") +
      oval(13,-35,7,4,"#e5ddbd") + oval(-2,-41,11,5,"#e9e6cb"));
  }

  function campfire(x,y,scale) {
    return group(x,y,scale,oval(0,1,17,4,"#a49a75") +
      shape("M-14 1l24-8 2 3-24 9Z","#997452",1.3) +
      shape("M-12-8l26 8-2 4-25-8Z","#b28a62",1.2) +
      shape("M-7-4q-5-8 4-15-1 5 1 6 6-7 5-16 12 13 7 23-5 8-17 2Z","#df8155",1.2) +
      path("M-2-4q-4-4 2-9 1 3 2 3l4-8q3 11-1 14Z","#f5cc70"));
  }

  function paperMill(x,y,scale) {
    return group(x,y,scale,cottage(-10,-1,1.05,roof)+
      shape("M11-28l3-45 7-2 3 42-5 5Z","#c08a69")+
      shape("M11-72l12-4 1 5-12 4Z","#ad765c",1.2)+
      line("m15-30 5-1m-4-18 5-1m-5-12 4-1","#996a56",1.1)+
      oval(11,-82,8,4,"#e4debf")+oval(-4,-87,10,5,"#e7e4ca"));
  }

  function solarArray(x,y,scale) {
    return group(x,y,scale,oval(2,1,23,5,"#8fa483") +
      line("m-10-12-1 12m27-15 1 12","#776b57",2.6) +
      shape("M-23-15l9-14 35-5-6 15Z","#7da6a4",1.4) +
      line("m-10-26-7 12m17-14-7 12m16-14-6 12m-21-4 34-5", "#d5d7af",.9));
  }

  function riverbank() {
    return path("M465 160q-33 14 15 29 75 22 21 38-23 9-107 18-89 11-69 33 16 17 100 31 88 14 55 34-22 13-114 37H160q55-26 127-44 42-11 23-21-102-35-92-59 8-24 116-34 129-12 117-27-4-8-27-18-20-10 15-17Z", "#88b2a3") +
      path("M458 160q-30 15 18 30 73 21 18 36-33 10-112 18-75 8-79 27-7 27 105 43 79 13 51 26-30 18-115 40H177q51-25 129-45 31-11 9-23-106-36-89-55 12-17 110-29 133-13 122-29-2-10-26-21-21-9 14-18Z", river) +
      line("M442 182q16 7 21 11m-7 28 15-3m-161 27 32-4m-97 26 17-4m5 18 19 4m-9-32 13-2m16 44 29 8m19 5 16 2m41 26 19-7m-89 28 23-5m-101 19 46-11m137-161 9-1", "#d0e8d3",2.2);
  }

  function hillside(palette) {
    return path("M0 146q44-22 81-19 41-3 75-25l43-31 43 28q17 19 34 18l42-32q9-5 17 2l37 34q23 8 55-15l44-25 43 28q17 8 26-2l49-39 49 13q17 5 40 23l28 14 54-20v85H0Z", palette.far) +
      path("M0 151q48-26 83-13 28 5 67-18l48-38-19 38 39-18 24 20 35 7 38-34-14 27 26-17 37 27 36 5 44-26 26-17-13 24 20-9 30 13 21-5 53-38-17 29 29-18 29 8 18 18 29 8 33-9 22 4v53H0Z", palette.mid) +
      line("M186 98l-20 18m27-21-8 10m148-6 15 14m219-15 11-8m-19 15 9-7m68 2 15 12m-211 4 9-6", "#d1d8bb",1.3) +
      path("M0 145q66-10 135 7 61 16 142 3 122-23 216-16 80 8 150-10 61-17 117-6v66H0Z", "#a5c09d") +
      path("M0 156q77-15 140 6 92 23 163 3 94-23 166-14 148 14 224-15 31-10 67-7v65H0Z","#b3ca9e");
  }

  function landmark(data) {
    const trophies = new Set(Array.isArray(data.trophies) ? data.trophies : []);
    const ordered = [
      ["pyramid", () => shape("M-32-1 2-44 30-5 8 3Z", "#e8c785") + shape("M2-44 8 3 30-5Z","#c5a16c") + line("m-24-10 29 3m-23-12 22 3m-15-12 17 3","#b69864",1)],
      ["station", () => solarArray(0,0,1.2)],
      ["rails", () => train(0,0,.84)],
      ["library", () => hall(0,0,.68,brass)],
      ["cathedral", () => tower(0,0,.72,"#80a699")+shrine(9,2,.64)],
      ["industry", () => paperMill(0,0,.85)],
      ["megalith", () => shape("M-18-1l3-34 9-1 3 35Zm23 0 1-34 8-1 5 32Z","#bdac8c")+shape("M-20-31l1-10 33-4 6 5-2 7-30 5Z","#d4c5a5")]
    ];
    const match = ordered.find(([id]) => trophies.has(id));
    return match ? match[1]() : null;
  }

  const regimeFlags = { democracy: "#6e9c92", monarchy: "#c77353", theocracy: "#a7839a",
    merchant_rule: "#d8ac55", corporate_rule: "#bd915d", federal_rule: "#8da86e", military_rule: "#9b7560",
    totalitarian: "#b7755b", technocracy: "#7faeb0", representative: "#8395a1", council_rule: "#8fa680",
    algorithmic: "#8c8cae" };

  function cover(options = {}) {
    const era = Number.isInteger(options.era) ? Math.min(4,Math.max(0,options.era)) : 0;
    const seed = seedNumber(options.seed), variant = seed % 5;
    const dusk = options.ending === "collapse";
    const palette = dusk ? {sky:"#eed7bd",far:"#b6bcb0",mid:"#afbcab"} :
      {sky:"#c4e1e1",far:"#b3cec2",mid:"#a8c4b5"};
    const focus = options.focus;
    const flagColor = Object.hasOwn(regimeFlags, options.regime) ? regimeFlags[options.regime] : roof;
    const center = era === 0 ? hut(0,0,1.22) :
      focus === "religion" ? shrine(0,0,1.44) : focus === "knowledge" ? (era < 3 ? skyCourt(0,0,1.38) : observatory(0,0,1.25)) :
      focus === "wealth" ? market(0,0,1.23) : focus === "power" ? tower(0,0,1.26,flagColor) :
      focus === "culture" ? theatre(0,0,1.35) : hall(0,0,1.16,flagColor);
    const home = era === 0 ? hut : cottage;
    const special = landmark(options);
    let content = path("M0 0h760v380H0Z",palette.sky);
    content += circle(132+variant*11,63,28,dusk?"#efb17d":"#f5cf85") +
      circle(132+variant*11,63,22,dusk?"#f4c493":"#f8da98") +
      cloud(56+variant*3,55,.7)+cloud(240+variant*6,47-(seed%8),.64)+cloud(473-variant*5,66,.8)+cloud(702,26+variant*2,.68) +
      line("m358 49q5-3 8 2 4-5 8-3m-34 9q4-1 6 2 3-4 7-2m184 12q5-3 9 2 4-6 10-4", "#739b96",1.6) +
      hillside(palette) + path("M0 182q112-27 211-4t206-9q116-25 219-16 68 6 124-15v242H0Z","#ccd09a");
    for (let i=0;i<13;i++) {
      const x = 22 + i*59 + (i%3)*8;
      content += tree(x,166-(i%4)*4,.27+(i%3)*.055,i%3===0?1:0);
    }
    content += path("M0 188q111-22 203 13 79 29 161 20-81 8-138 1-171-30-226 2Z","#b8c18a") +
      path("M531 178q103-20 229-12v40q-97-12-178-2l-50-7Z","#aebc87") +
      fields(206,200,.97) + fields(674,173,.6) +
      path("M760 230q-61 7-121 26-83 24-158 0l-56-27q-69-24-113-9-77 31-132 35-85 7-180-7v16q99 17 181 7 88-14 135-37 47-14 88 1l70 33q98 34 196 0l90-22Z","#e6cb97") +
      riverbank()+bridge(371,237,.94) +
      home(84,181,.49,roof)+home(123,182,.4,"#89a799") +
      home(604,180,.52,roof)+home(631,177,.4,"#88a397") +
      tree(58,195,.61,1)+tree(30,202,.78)+tree(739,187,.7,1)+tree(707,191,.65,2);
    content += path("M409 256q16-28 70-40 49-14 101-4l62 22-6 13q-65 19-76 32-40 16-105 1Z", "#daca9c");
    content += home(445,218,.71,"#719f92") + home(593,220,.68,roof,true);
    if (era >= 1 && focus === "wealth") content += cottage(508,218,.84,"#8ca89b") + market(566,237,.67);
    content += group(512,254,1,center) + home(616,244,.77,"#bb7556") +
      tree(666,230,.79,variant%2?2:0)+tree(685,225,.54,1);
    const leftFeature = special ?? (era===0 ? campfire(0,0,.98) : era < 3 ? windmill(0,0,.9) : paperMill(0,0,.88));
    content += group(157,244,.95,leftFeature) + home(103,254,.82,roof,true) +
      tree(53,252,.62,2)+tree(71,256,.53,1);
    if (era > 0 && focus==="wealth") content += ship(320,305,.82,roofLight);
    if (options.trophies?.includes("aviation") || options.trophies?.includes("station")) content += birds(554,99,.87);
    if (era >= 2) content += cottage(583,189,.43,"#b48566") + cottage(638,215,.57,"#88a397",true);
    if (options.trophies?.includes("skyline")) content += cityBlock(650,174,.54,119,"#7494a8",false);
    if (era >= 3 && focus==="knowledge") content += solarArray(575,257,.69);
    const residents = [[440,256,.75,roof],[450,260,.65,jade],[547,264,.84,brass],[558,270,.72,roof],[369,223,.48,roof]];
    for(const [x,y,size,coat] of residents) content+=person(x,y,size,coat);
    content += path("M0 267q74-9 130 18 53 24 117 20l35 8q-121 31-194-4-45-19-88-8Z","#b5bd83") +
      path("M760 278q-70 12-142 2-37-5-87 5 51-22 91-19 82 6 138-9Z","#b4c18a") +
      fields(601,298,1.23)+fields(650,319,.8)+
      line("M26 283q26-1 51 6m-43-11 33 4m93 29 27 2m408-43 19-3m80 21 32-4m-587-37 13-3", "#9fab74",1.7) +
      tree(24,329,1.02)+tree(52,332,.68,1)+tree(722,299,.83,2)+tree(742,305,.91,1);
    // Scalloped foreground banks frame the village, with open water between them.
    content += path("M0 337q39-13 80-5 57 14 111 10 41-3 77-9-76 30-117 47H0Z","#a9b77e")+
      path("M0 351q56-18 99-4 42 13 95 4-37 17-68 29H0Z","#90a876")+
      path("M411 380q74-27 123-43 69-21 124-12 52 8 102-4v59Z","#a5b580") +
      path("M531 380q61-28 121-24 63 6 108-11v35Z","#91a674");
    for(const [x,y,s] of [[75,350,.78],[113,359,.91],[184,337,.72],[508,361,.75],[622,344,.86],[705,356,.82]]) content+=petals(x,y,s);
    content += reed(164,372,.9) + reed(404,378,.91) + reed(475,353,.59)+
      line("M266 372q14-5 23-5m4-1 7-2m156-18 15-4m-29 38 20-6", "#85b5ac",1.3);
    content += deer(96,325,.66) + birds(483,103,.75) + petals(664,359,.82);
    return svg(760,380,"文明の発展分野と記録をもとにした表紙の象徴風景",content+dots(740,760,380,seed));
  }

  const chapterNames = ["原始","古代","中世","近代","未来"];
  const chapterSubtitles = ["川辺の暮らし","運河と交易の町","城壁の内と外","煙突の向こうの街","星空に灯る都市"];
  const ground = color => path("M0 0H720V380H0Z",color);
  const marks = (d, color) => line(d,color,2.7);
  const glow = (x,y,r,color) => circle(x,y,r*1.8,color+"20")+circle(x,y,r,color);
  const birds = (x,y,s) => group(x,y,s,line("M0 5q8-7 15 1 5-8 14-5m16 14q6-6 12 0 5-6 11-5","#68736a",2));
  const lantern = (x,y,s) => group(x,y,s,
    line("M0 0v-43q0-8 9-8h9v7","#524d53",2.8)+
    shape("M12-43h12l-2 10h-8Z","#fbe0a2",1.2)+circle(18,-37,4,"#fff2bd"));
  function cart(x,y,s) {
    return group(x,y,s,oval(0,2,27,5,"#9e8e71")+
      shape("M-23-19h36l-3 14h-28Z","#bc8662")+line("M10-9l20-5m-45 1h24",ink,2)+
      [-13,7].map(k=>circle(k,-3,6,"#705f4b",ink)+circle(k,-3,2,plaster)).join(""));
  }
  function deer(x,y,s) {
    return group(x,y,s,oval(0,1,25,4,"#698e62")+
      line("M-14-12l-2 12m11-12-2 11m18-12 5 12m-11-12 4 11","#79563f",2.6)+
      shape("M-22-15q-1-12 18-11l14 2 4-11q5-5 11 1l5 5-7 4-5-1-2 14q-18 8-37-3Z","#c09565",1.5)+
      line("M17-35v-9l-5-6m8 15 3-10 6-4m-7 3-4-4M-21-19l-8-7",ink,1.6)+circle(24,-32,1.4,ink));
  }
  function wall(x,y,s,flag) {
    return group(x,y,s,shape("M-103-51l194-14 13 9v43L-103 1Z","#cac0a6")+
      shape("M-103-51l194-14 13 9-200 15Z","#e1d2b5")+
      path("M-103-43 104-58v12L-103-31Z","#b3a98f")+
      [-84,-58,-32,-6,20,46,72].map((k,i)=>shape(`M${k} ${-54-i*2}h12v-9h-12Z`,"#dbccae",1.2)).join("")+
      shape("M-18-5v-20q0-19 17-20 20 0 21 17v21Z","#80635b")+
      line("M-82-28l36-3m-15 9 21-2m84-11 32-3m-48 14 19-2m7 9 24-2","#948974",1.8)+
      tower(-102,1,.79,flag)+tower(102,-10,.86,flag));
  }
  function clock(x,y,s) {
    return group(x,y,s,shape("M-24 0v-104l48-1V0Z","#dfad91")+
      shape("M-30-103 0-145l30 42Z","#9b555b")+
      shape("M24 0v-105l14 10v90Z","#bc8176")+
      circle(0,-86,16,"#fff1c9",ink,2)+line("M0-96v10l7 3M-20-57h39m-40 8h39",ink,2)+
      shape("M-8 0v-33q7-13 16 0V0Z","#819c9d"));
  }
  function cityBlock(x,y,s,height,color,modern) {
    const windows = Array.from({length:Math.floor((height-18)/15)},(_,i) => {
      const y=-height+14+i*15;
      return path(`M-16 ${y}h8v8h-8Zm18 0h8v8h-8Z`,modern?"#efca9c":"#aee7db");
    }).join("");
    return group(x,y,s,shape(`M-24 0v-${height}l41-8 16 9V-4L17 5Z`,color)+
      shape(`M17 5v-${height+13}l16 9V-4Z`,modern?"#a98180":"#596f9b",1.25)+windows+
      line(`M-24 ${-height}l41-8m0 ${height+13}v-${height+13}`,modern?"#875f67":"#c6dcf2",1.3)+
      (modern?"":line(`M-19 ${-height+4}l27-5`,"#aaf3e3",2.4)));
  }
  function dome(x,y,s) {
    return group(x,y,s,oval(0,2,65,11,"#567b99")+
      shape("M-56-13v-19q0-51 56-56 56 5 56 56v15L0 3Z","#86c2cb",2)+
      path("M-46-34q8-28 31-40 10-5 23-4-22 11-32 47Z","#bde9da")+
      line("M-39-22q0-53 39-66 39 13 39 66m-83-20q43 13 91-3m-47-39v81","#587e9a",1.7)+
      shape("M-56-13q56 19 112-5v15Q0 15-56 1Z","#cde1de",2)+
      line("M-50-7q47 15 100-3","#ffe5ab",3));
  }
  const village = (art) => {
    let s=ground("#eadab5")+circle(156,78,43,"#f9c879")+cloud(542,61,.84)+cloud(329,49,.55)+birds(247,100,.9);
    s+=path("M0 126Q46 123 112 67q16-13 42 5l111 94q51-4 116-53 32-26 59-2 56 39 122 40l85-55 73 7v231H0Z","#a2baa0");
    s+=path("M0 193q120-80 240-24 92 48 210-7 119-38 270 18v200H0Z","#8eab7d");
    s+=path("M0 228q136-53 275 1 107 39 201-26 133-61 244 4v173H0Z","#abc182");
    s+=path("M403 201q-100 9-56 36 42 25 151 33 126 13 85 49-28 26-174 61H185q67-33 167-51 121-22 64-35-130-22-146-50-22-32 100-43Z","#6eaa9c")+
      path("M398 203q-103 13-57 36 41 23 157 36 115 12 78 42-25 22-177 63H210q62-31 147-48 119-21 62-38-130-24-142-51-15-27 106-40Z","#9bd1bd")+
      marks("M317 235q4 11 28 20m123 24 30 3m-21 44 38-10m-180 43 39-10m88-100 33 3","#deeed1");
    s+=tree(58,251,1.56,1)+tree(97,225,.9,1)+tree(153,225,.78)+hut(212,243,1.03)+hut(246,218,.66)+campfire(274,265,1.17);
    s+=person(252,269,.91,jade)+person(303,268,.86,roof)+deer(626,249,.84)+deer(669,227,.64);
    return s+person(571,279,1.06,"#927c57")+line("M568 272l20-9q-5-10-11-7m11 7-9 7",ink,1.5)+
      tree(677,349,1.7,1)+tree(50,373,1.84)+petals(119,350,1.2)+reed(220,375,1.65)+reed(564,349,1.5)+petals(615,364,1.0);
  };
  const port = (art) => {
    let s=ground("#f1ce9a")+circle(561,78,63,"#fce3ad")+cloud(554,54,.76)+birds(457,106,.73);
    s+=path("M0 142l107-48 65 32 100-41 113 63 80-24 125 24 130-53v119H0Z","#d9ad86")+
      path("M0 175q117-35 235-5l203 28 282-46v201H0Z","#e5bb81");
    s+=path("M720 195 402 207 285 262 0 300v80h720Z","#7fbcb5")+
      path("m720 227-284 4-130 60L3 348v32h717Z","#94cec1")+
      shape("m0 280 273-45 119-53 328-13v26l-320 19-115 55L0 320Z","#efd096",1.7)+
      marks("m0 301 277-45 120-54 323-19M95 315l34-5m370-105 39-2m-179 59 28-12m173 66 43-2m-105 38 34-5m-314-7 63-11","#e6ebca");
    s+=fields(505,174,1.25)+fields(607,166,.9)+tree(52,214,1.14,2)+tree(274,177,.9,2);
    s+=shrine(190,220,1.78)+hut(302,197,.6)+cottage(352,202,.63,"#ba7d5e")+cottage(377,195,.52,"#ac815d");
    if (!art.crisis && (art.flags.includes("market")||art.generic)) s+=market(101,261,1.1)+market(276,239,.72);
    if (art.flags.some(f=>["market","accord","beacon_chart"].includes(f))||art.generic) s+=ship(457,318,1.45)+ship(601,247,.76,"#f3c477");
    return s+person(129,262,.88,roof)+person(147,259,.67,jade)+cart(337,241,.91)+
      path("M0 360q86-12 156-11l-60 31H0Z","#ca9464")+reed(34,368,1.2)+line("m601 353 23-1m14-37 39-1m-157 55 54-5","#5daba9",2.4);
  };
  const stronghold = (art) => {
    let s=ground("#c5d6d1")+cloud(92,59,.92)+cloud(575,47,.72)+birds(563,90,1.3);
    s+=path("M0 162 93 75l87 36 48-25 111 57 112-38 119 38 150-63v251H0Z","#9fb8a8")+
      path("M0 224q123-114 266-135 115-63 268 9 101 82 186 98v184H0Z","#839675")+
      path("M0 274q235-36 352-126 80-36 177 2 52 35 191 58v172H0Z","#a4af80")+
      path("M0 370q118-53 231-50 110 5 160-73 26-41-11-60l-38-16 42-9 44 23q67 53 5 127-42 47-105 68H0Z","#e5cfab")+
      marks("M66 346q75-20 162-22m160-30 19-25m-43-84 8 4","#c2ab8a");
    const flag=art.flags.includes("army")||art.generic?"#983f60":"#729283";
    s+=wall(370,190,1.25,flag)+cottage(252,276,.83,"#a95f64")+cottage(547,228,.87,"#6b8e82",true)+
      cottage(615,240,.94,"#b9695e")+windmill(131,270,1.23)+cart(455,311,.95)+person(350,328,1.19,"#a05962")+person(368,332,.95,jade)+person(507,283,.86,brass);
    return s+tree(677,340,1.7,1)+tree(602,367,1.35,1)+tree(29,346,1.59,1)+tree(59,337,1.05)+petals(165,359,1.37)+petals(516,370,1.22);
  };
  const railCity = (art) => {
    let s=ground("#e8b5a6")+circle(569,67,46,"#f2cf9d")+cloud(100,52,.61)+cloud(333,56,.77)+
      path("M0 169q130-61 231-11 112 50 198 1 151-75 291-14v181H0Z","#bd9d9a");
    for(const [x,y,scale,height,color] of [[49,192,.88,77,"#ba8f7c"],[101,179,.77,89,"#cfaa80"],[148,183,.8,62,"#bb8480"],[307,183,.9,80,"#c68b7c"],[355,187,.88,93,"#e0b494"],[520,185,.88,97,"#ba8e87"],[576,192,.92,54,"#c78c78"],[622,199,.99,105,"#d8a793"],[677,187,.8,73,"#ae8b88"]])
      s+=cityBlock(x,y,scale,height,color,true);
    s+=path("M0 189q192 28 376-6 187-28 344 1v196H0Z","#c7aa9b")+
      path("M720 220q-128 29-175 109l-25 51H257q64-63 156-107 83-35 211-56Z","#83a5a5");
    s+=clock(459,225,1.22)+cottage(543,207,.64,"#914e62");
    s+=art.flags.includes("industry")||art.trophies.includes("industry")||art.generic?paperMill(197,221,1.65)+paperMill(109,236,.97):cottage(181,223,1.18,"#955968")+cottage(104,231,1,"#b78a6e");
    s+=path("M0 270q149-12 349 3l198-42q94-23 173-6v21q-77-4-178 25l-189 55q-198-17-353 9Z","#897674")+
      path("M0 260q194-3 352 17l190-49q97-26 178-13v18q-92-6-179 20l-188 58q-209-25-353-8Z","#c5a596")+
      bridge(492,282,1.59);
    if(art.flags.includes("rail_network")||art.trophies.includes("rails")||art.generic)
      s+=line("M0 285Q127 273 299 291m-299 0q141-11 299 7","#685a60",2.5)+train(171,278,1.59);
    else s+=cart(202,274,1.14);
    return s+lantern(22,315,1.5)+lantern(305,322,1.34)+lantern(638,255,.91)+person(245,322,1.17,"#a66170")+
      person(266,319,1.04,"#697d8c")+path("M0 366q114-25 279-11l-29 25H0Z","#ae8a82")+marks("m596 317 58-11m-87 36 40-5m-80 27 30-3","#c7d2b8");
  };
  const starlitCity = (art) => {
    let s=ground("#303756")+circle(562,79,54,"#dbd2a8")+circle(578,64,54,"#303756")+
      path("M0 107q139 15 255 9 134-13 211-60 47-29 146-25-114 0-149 48Q290 194 0 137Z","#7e7eb16a")+
      path("M0 101q168 26 291-4 99-13 175-66 48-29 151-18-95-4-143 37Q261 181 0 124Z","#78b4bb42");
    s+=Array.from({length:40},(_,i)=>glow(7+i*83%704,7+i*47%134,i%8===0?2.1:1,"#ede2b4")).join("")+
      path("M0 185q117-62 207-38 96 24 190 7 166-49 323-12v238H0Z","#486080");
    const skyline=art.trophies.includes("skyline")||art.generic;
    for(const [x,y,height,scale] of [[34,211,88,.77],[92,201,125,.88],[142,208,72,.9],[216,218,93,.9],[456,202,104,1.11],[503,205,141,.94],[622,211,132,.96],[672,221,87,.84]]) {
      s+=cityBlock(x,y,scale,skyline?height:height*.63,"#849db3",false);
    }
    s+=path("M0 215q107-33 204 0 100 31 214 6 130-45 302-11v170H0Z","#63849a")+
      path("M0 329q112-60 238-25 93 24 171 8 99-25 167-87l56-15q-39 111-154 170H0Z","#91beb5")+
      marks("M0 338q112-64 238-26 93 24 171 8 99-25 167-87l56-15","#d6ebc7");
    s+=dome(327,259,1.5)+dome(185,292,.75)+dome(558,274,.79)+tree(48,273,.92,1);
    if (art.flags.some(f=>["shared_sky","lunar_program"].includes(f))||art.generic) s+=observatory(108,263,.99);
    s+=glow(64,309,5,"#c8f3da")+glow(211,307,5,"#c8f3da")+glow(311,325,5,"#c8f3da")+glow(492,282,5,"#c8f3da")+glow(627,269,5,"#c8f3da");
    return s+person(232,303,.98,"#9a7eac")+person(251,307,1.16,"#edb780")+person(452,323,1.2,"#a9c5bf")+
      path("M0 361q126-22 246 19H0Zm532 19q106-49 188-24v24Z","#456676")+reed(52,376,1.4)+reed(657,373,1.6);
  };

  function feature(art, n) {
    const {focus,flags,trophies}=art;
    if (n===0) {
      if (trophies.includes("megalith")) return group(470,246,1.45,landmark({trophies:["megalith"]}));
      if (focus==="order" && flags.includes("assembly")) return hut(201,291,.56)+person(239,291,1.06,brass);
      if (focus==="wealth" && flags.includes("market")) return market(152,291,.7);
      if (focus==="knowledge" && flags.includes("academy")) return skyCourt(480,250,.76);
      if (flags.includes("canals")) return fields(118,304,1.28);
      return "";
    }
    const slot=[[0,0,0],[540,226,1.02],[505,261,.78],[632,307,1.08],[631,320,1.06]][n];
    const flag = Object.hasOwn(regimeFlags,art.regime)?regimeFlags[art.regime]:brass;
    let picture;
    if (focus==="knowledge" && flags.some(f=>["academy","shared_sky","open_data"].includes(f))) picture=n===4?solarArray(...slot):skyCourt(...slot);
    if (focus==="wealth" && flags.some(f=>["market","guild_credit","banking_network"].includes(f))) picture=market(...slot);
    if (focus==="religion" && (trophies.includes("cathedral") || flags.includes("faith_practice"))) {
      picture=trophies.includes("cathedral")?group(slot[0],slot[1],slot[2],tower(-23,1,.8,flag)+shrine(9,3,.95)):shrine(...slot);
    }
    if (focus==="culture" && trophies.includes("library")) picture=hall(...slot,brass);
    if (focus==="culture" && !picture && flags.includes("cultural_houses")) picture=theatre(...slot);
    if (focus==="power" && flags.includes("army")) picture=tower(...slot,flag);
    if (focus==="order" && flags.some(f=>["assembly","civic_law","responsive_council","constitution"].includes(f))) picture=hall(...slot,flag);
    return picture??"";
  }

  function era(index, snapshot) {
    const n = Number.isInteger(index) && index >= 0 && index < 5 ? index : 0;
    const art = snapshot ?? {flags:[],trophies:[],generic:true};
    const scenes = [village,port,stronghold,railCity,starlitCity];
    const content = scenes[n](art) + feature(art,n) + dots(520,720,380,seedNumber(art.seed)+n*79);
    return svg(720,380,chapterNames[n]+"時代の象徴図",content);
  }

  function finale(status, goal) {
    const celebrations = {
      space: () => circle(219,57,32,"#f6d89d")+shape("M157 102q-5-43 34-61 6 39-22 67Z","#fbecd2")+shape("m171 85 24 8-28 13-14 10 1-20Z","#cc826b")+circle(177,71,6,"#93bdc4",ink),
      democracy: () => shape("M139 73h77v38h-77Z","#8db399")+line("M155 77h44",ink,2.5)+shape("M160 47l41-6 7 25-41 9Z","#fff1c9")+line("m173 56 7 7 9-12","#618475",2.5),
      conquest: () => [136,174,211].map((x,i)=>group(x,102,.95,line("M0 2v-54",ink,2.5)+shape("M0-50q14-6 24 0l-5 6 5 6q-14-5-24 0Z",[roof,brass,jade][i],1.5))).join(""),
      economy: () => ship(182,103,1.46,roofLight)+[143,153,164].map((x,i)=>circle(x,110-i%2*3,6,"#eac477",ink,1)).join(""),
      culture: () => shape("M178 61q-17-16-42-9v46q16-6 42 9 25-16 42-9V52q-25-7-42 9Z","#fff0c7")+line("M178 61v46m-33-36 22 6m-22 3 22 6m21-9 22-6m-22 15 22-6",ink,1.8),
      religion: () => shrine(181,108,.85)+glow(180,39,8,"#f6d590"),
    };
    const collapse = status==="collapse", victory=status==="victory";
    const sky=collapse?"#e4c4b7":victory?"#cee1c4":"#d2d6e6";
    let art=path("M0 0H360V136H0Z",sky)+circle(179,65,70,"#fff5d35c")+
      path("M0 97q48-42 111-24 70 20 103 9 68-23 146 11v43H0Z",collapse?"#b99082":victory?"#b4c59a":"#aeb6ce")+
      path("M0 111q94-24 167-3 95 19 193-5v33H0Z",collapse?"#c8ad92":victory?"#9eb797":"#95adba");
    if(victory && Object.hasOwn(celebrations,goal)) art+=celebrations[goal]();
    else if(collapse) art+=shape("M127 111v-49l18-5 12 10 17-5 8 12v38Zm66 0v-34l16-15 24 8v40Z","#dbc2a5")+
      line("M162 70l-11 18 10 8-6 14m53-41-6 14 8 7-3 17",ink,2)+reed(169,119,.66)+petals(211,121,.61);
    else art+=shape("M148 103q22-22 31-9 10-13 32 9-15 0-32 12-15-11-31-12Z","#fff2ce")+campfire(178,97,.79)+birds(221,53,.8);
    art+=tree(49,128,.81,1)+tree(307,129,.78)+petals(96,128,.8)+petals(255,129,.83)+dots(184,360,136,197);
    return svg(360,136,"文明の終幕を表す象徴図",art);
  }

  // Small overlays on the five chapter landscapes. Simulation data only selects drawings.
  function live(index, state) {
    const era = [0,1,2,3,4].includes(index) ? index : 0;
    const scene = [village,port,stronghold,railCity,starlitCity][era];
    const has = id => state.flags.includes(id);
    const earned = id => state.trophies.includes(id);
    const flag = Object.hasOwn(regimeFlags,state.regime) ? regimeFlags[state.regime] : jade;
    const x = [450,523,510,622,638][era];
    const y = [227,204,246,262,253][era];
    const movement = (name, content) => `<g class="live-${name}">${content}</g>`;
    let details = "";
    if (has("academy") || has("shared_sky")) details += era>=3?observatory(x,y,.75):skyCourt(x,y,.9);
    if (earned("pyramid")) details += group(354,213,1.95,landmark({trophies:["pyramid"]}));
    if (earned("library")) details += hall(385,233,.77,brass);
    if (earned("cathedral")) details += tower(584,185,.72,flag)+shrine(608,194,.74);
    else if (has("faith_practice")) details += shrine(588,193,.79);
    if (earned("printing")) {
      details += cottage(114,246,.88,"#a9786f")+group(145,235,.78,shape("M-13-13l23-1 4 15-23 2Z","#fff1c7")+line("m-7-8 13-1m-11 5 12-1",ink,1.6));
    }
    if (has("army")) details += tower(163,224,.86,flag);
    if (has("assembly") || has("constitution") || has("responsive_council")) {
      details += era===0?hut(137,235,.8):hall(239,231,.64,flag);
    }
    if (has("cultural_houses") && !earned("library")) details+=theatre(325,230,.74);
    if (has("market") || has("guild_credit")) {
      if (state.crisis) details += group(92,294,.93,cottage(0,0,.83,"#8d8575")+shape("M-10-18h19v17h-19Z","#976e54")+line("M-11-10h20",ink,1.8));
      else details += market(91,292,.84)+person(126,299,.7,brass);
    }
    if (has("banking_network")) details += hall(650,284,.69,brass);
    if (state.metrics.wealth >= 67 && !state.crisis) {
      details += movement("cart",cart(288,306,1)+person(312,309,.88,roof));
      if (era===1 && has("market")) details += movement("ship",ship(542,346,1.02,jade));
    }
    if (earned("megalith") && era===0) details += group(452,240,1.48,landmark({trophies:["megalith"]}));
    if (earned("rails")) {
      details += line("M-40 319Q90 299 273 322m-308 7q130-20 308 2","#675e51",2.2);
      details += movement("train",train(102,310,1.04));
    }
    if (earned("station")) {
      details += movement("orbit",group(290,76,1.1,
        shape("M-49-12h33v24h-33Zm66 0h33v24H17Z","#8bb2c3",1.9)+
        line("M-50 0h101m-84-11v22m16-22v22m50-22v22m17-22v22",ink,1.1)+
        shape("M-17-7h34l9 7-9 8h-35Z","#f9edcf")+circle(5,0,4,"#96bfbb",ink)));
    }
    if (state.regime) details += group(658,284,1,line("M0 0v-53",ink,2.4)+movement("flag",shape("M1-52q18-5 35 2l-8 8 9 8q-17-5-36 0Z",flag,1.5)));
    if (state.metrics.order <= 28 && !state.ending) details += person(479,319,.99,"#b98c69")+person(458,326,.92,"#ad7561");
    if (state.recovery) {
      details += group(546,333,.94,path("M-28-2 34-5 44 9-21 10Z","#e6c99b")+
        shape("M-23-7h27v9h-27Zm16-8h29v7H-7Zm15 7h22v7H8Z","#c69b6c")+person(41,3,.9,jade));
    }
    if (state.disaster) details += path("M0 0H720V380H0Z","#53487442")+
      marks("M18 29l-7 20m62-12-9 19m90-38-11 23m397-20-11 23m58 38-8 17m86-52-10 21m37 37-8 18","#a9cad5");
    if (state.crisis) details += path("M0 0H720V380H0Z","#685f471d");
    if (state.ending==="collapse") details += path("M0 0H720V380H0Z","#74534f45");
    const light = era===4?"#d4f0d674":"#f8f6d788";
    if (era===0) details += movement("smoke",circle(270,223,4,light)+circle(265,211,7,light));
    if (has("industry") && era===3) details += movement("smoke",circle(213,81,7,light)+circle(206,69,9,light));
    return svg(720,380,"現在の文明を表すミニチュア景観",scene(state)+details+dots(360,720,380,seedNumber(state.seed)+era*79));
  }

  window.AlbumScenes = { cover, era, live, finale, chapterSubtitles };
})();
