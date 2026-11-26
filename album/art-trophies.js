/* CivRogue album illustrations. All marks are drawn in a 120 × 96 coordinate space. */
(() => {
  "use strict";
  const ink = "#584337", milk = "#fff1ce", sand = "#e7bd76", ochre = "#c69459";
  const honey = "#efa94f", copper = "#c57a55", red = "#ce735d", berry = "#a6676a";
  const jade = "#77aa93", deep = "#518779", mint = "#b9d0a7", blue = "#8eb9c7";
  const slate = "#6d8b98", gray = "#a2aba0", stone = "#c9c4aa", wood = "#93684e";

  const path = (d, fill = "none") => `<path d="${d}" fill="${fill}"/>`;
  const detail = d => `<path d="${d}" fill="none" stroke-width="1.25"/>`;
  const light = d => `<path d="${d}" fill="none" stroke="#fff2cc" stroke-width="1.7"/>`;
  const dot = (x, y, r, fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
  const oval = (x, y, rx, ry, fill) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
  const rect = (x,y,w,h,r,fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
  const placed = (x,y,art,scale=1) => `<g transform="translate(${x} ${y}) scale(${scale})">${art}</g>`;
  const spin = (x,y,angle,art) => `<g transform="rotate(${angle} ${x} ${y})">${art}</g>`;
  const star = (x,y,s=1) => placed(x,y,path("M0 -5 Q1 -1 5 0 Q1 1 0 5 Q-1 1 -5 0 Q-1 -1 0 -5Z", honey),s);
  const tuft = (x,y,s=1) => placed(x,y,path("M-6 0 Q-8 -5 -5 -4 L-2 -1 Q-3 -9 0 -8 Q2 -8 2 -2 Q6 -6 7 -4 L4 1Z",mint),s);
  const leaf = (x,y,angle=0) => spin(x,y,angle,placed(x,y,path("M0 0 Q-10 -2 -11 -10 Q0 -11 0 0Z", jade)));
  const lines = (x,y,w,count,spacing=5) => Array.from({length:count},(_,i) => detail(`M${x} ${y+i*spacing}h${w-(i%2)*3}`)).join("");
  function wheel(x,y,r) {
    return dot(x,y,r,wood) + dot(x,y,r*.72,sand) +
      detail(`M${x-r*.66} ${y}h${r*1.32}M${x} ${y-r*.66}v${r*1.32}m${-r*.48} ${-r*1.14}l${r*.96} ${r*.96}m0 ${-r*.96}l${-r*.96} ${r*.96}`) + dot(x,y,r*.19,honey);
  }
  function book(x,y,color,scale=1) {
    return placed(x,y,path("M0 0 Q10 -3 21 0 V6 Q10 4 0 7Z",milk) +
      path("M0 0 Q10 -4 22 -1 L22 1 Q11 0 0 4Z",color) + detail("M3 5 Q12 2 20 3"),scale);
  }
  function building(x,y,face,roof) {
    return placed(x,y,path("M0 13 L16 9 31 15 31 37 14 40 0 34Z",face) +
      path("M15 12 L31 15 31 37 15 40Z",sand) + path("M-3 13 L9 0 24 2 35 15 15 18Z",roof) +
      path("M9 0 L15 18 35 15 24 2Z",roof) + path("M4 34 V24 Q7 18 10 23 V37Z",wood) +
      path("M19 23 L26 22 26 28 19 29Z",blue) + light("M17 14 L28 12"));
  }
  function coin(x,y,scale=1) {
    return placed(x,y,oval(0,2,12,5,ochre) + oval(0,0,12,4,honey) + oval(0,0,7,2,sand),scale);
  }
  function flag(x,y,color,scale=1) {
    return placed(x,y,detail("M0 19 V0") + path("M0 1 Q5 -2 13 1 L10 4 13 6 Q8 4 0 7Z",color),scale);
  }
  // A soft unoutlined shadow seats each object on the page even without a card background.
  function vignette(art) {
    return `<g fill="none" stroke="${ink}" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="60" cy="80" rx="44" ry="6" fill="#9b916f" opacity=".2" stroke="none"/>${art}</g>`;
  }
  const art = {};

  art.megalith = path("M15 76 Q24 64 49 68 Q70 62 99 71 L109 77 Q63 87 15 76Z",mint) +
    path("M29 72 L32 32 39 26 47 31 45 73 38 76Z",gray) +
    path("M39 26 L41 39 38 76 29 72 32 32Z",stone) +
    path("M68 73 L70 33 78 27 84 33 87 69 78 75Z",gray) +
    path("M70 33 L78 27 79 70 71 74Z",stone) +
    path("M24 31 L29 23 74 18 90 22 89 31 37 38Z",gray) +
    path("M24 31 L29 23 74 18 86 22 36 30Z",stone) + light("M31 25 L49 23 M72 38 L72 50") +
    detail("M49 32 L61 30 M35 53 l4 -3 -2 9") + tuft(23,75,.7)+tuft(92,73,.9);

  art.pyramid = path("M9 74 L58 60 110 74 65 85Z",sand) +
    path("M18 71 L58 15 77 69 64 79Z",honey) + path("M58 15 L104 70 64 79Z",ochre) +
    path("M51 25 L58 15 66 25 58 27Z",milk) +
    detail("M43 35 L59 39 78 36 M34 48 L61 54 89 48 M25 61 L63 68 98 60 M42 47 l5 -9 M50 63 l3 -11 M74 65 l-4 -11 M82 49 l-5 -12") +
    path("M38 74 L44 64 51 66 47 76Z",wood) + light("M26 60 L32 52 M42 38 l5 -7") +
    path("M86 76 L97 60 110 75 100 79Z",sand) + detail("M97 60 L100 79") + star(29,28,.62);

  art.library = path("M17 75 L73 71 104 77 57 84Z",sand) +
    path("M22 39 L71 30 97 40 97 73 51 80 22 69Z",milk) +
    path("M70 31 L97 40 97 73 69 68Z",sand) +
    path("M17 40 L42 19 72 17 102 40 70 37 51 49Z",jade) +
    path("M17 40 L42 19 69 37 51 49Z",deep) +
    path("M23 40 L42 25 60 38 50 44Z",milk) + dot(42,35,3,honey) +
    path("M29 67 V51 Q32 47 35 51 V69 M40 71 V54 Q44 49 47 54 V74",blue) +
    path("M54 76 V54 Q60 46 65 53 V73Z",wood) + detail("M75 48 l17 5 M75 57 l17 5 M79 50 v6 m4 -5 1 6 m4 -4 v6") +
    book(77,71,red,.95) + book(76,66,jade,.88);

  art.cathedral = path("M17 75 L70 68 105 76 61 84Z",stone) +
    path("M28 64 L61 31 92 50 92 73 61 80 28 70Z",sand) +
    path("M46 50 L64 27 91 41 95 52 64 44Z",deep) +
    path("M30 74 V42 L40 38 48 42 48 77Z",milk) +
    path("M26 43 L38 14 50 43 39 47Z",jade) +
    path("M72 75 V39 L82 35 91 41 92 72Z",milk) +
    path("M69 41 L80 10 94 41 83 45Z",jade) +
    path("M46 77 V52 L60 37 75 52 75 76 60 80Z",milk) +
    path("M52 78 V67 Q59 54 66 66 V78Z",wood) + dot(60,51,5.2,blue) +
    detail("M55 51 h10 M60 46 v10 M34 60 V54 Q38 46 41 54 V60Z M78 59 V52 Q81 46 85 52 V59Z") +
    light("M34 32 l4 -11 M79 27 l2 -11");

  art.skyline = path("M11 74 L68 62 108 73 62 85Z",stone) +
    path("M20 72 V46 L36 42 48 46 48 74 32 78Z",jade) +
    path("M45 76 V30 L52 28 52 19 61 15 72 19 72 30 77 33 77 74 60 80Z",blue) +
    path("M61 15 L72 19 V30 L77 33 V74 L61 79Z",slate) + detail("M61 15 V7 M48 38 l11 -3 m5 0 9 3 M48 44 l11 -3 m5 0 9 3 M48 50 l11 -3 m5 0 9 3 M48 56 l11 -3") +
    path("M74 76 V49 L82 45 V37 L91 35 99 39 99 72 87 78Z",milk) +
    detail("M22 51 l11 3 m-11 4 11 3 m-11 4 11 3 M83 52 l11 -2 m-11 8 11 -2 m-11 8 11 -2") + tuft(18,75,.63);

  art.calendar = path("M25 76 L40 67 83 65 95 73 77 79 37 81Z",sand) +
    spin(59,45,-16,oval(59,44,31,28,ochre) + oval(57,42,29,27,milk) + oval(57,42,21,19,sand) +
      [0,30,60,90,120,150,180,210,240,270,300,330].map(a=>spin(57,42,a,detail("M57 18 v4"))).join("") +
      path("M50 47 L66 24 60 49Z",deep) + dot(54,48,3,copper)) +
    path("M35 76 L41 62 45 68 43 77Z",wood) + path("M74 74 L76 61 82 68 82 76Z",wood) +
    star(90,30,.91) + path("M24 26 Q13 25 16 15 Q8 23 15 30 Q19 33 24 26Z",honey);

  art.writing = path("M25 75 Q19 75 20 69 L27 33 Q28 27 35 26 L75 29 Q79 30 78 37 L72 75 Q71 80 65 80Z",ochre) +
    path("M25 69 L32 34 Q33 31 37 31 L74 34 67 73 Q67 76 63 75Z",sand) +
    detail("M38 42 l4 2 -3 4 m10 -8 4 4 -4 3 m9 -6 3 2 -3 5 M37 54 l5 1 -3 5 m8 -7 5 3 -4 4 m8 -5 4 2 -2 4 M36 65 l8 1 m6 0 8 1") +
    path("M62 61 L91 19 96 22 68 65 61 70Z",copper) +
    path("M61 70 L63 62 69 64Z",wood) + detail("M90 23 l5 3") + star(89,50,.63);

  art.written_law = path("M23 72 L75 66 96 74 95 79 53 84 22 77Z",gray) +
    path("M34 72 L34 37 Q34 22 49 19 Q62 14 75 20 L83 25 82 68 75 76Z",gray) +
    path("M33 71 L33 36 Q33 24 48 21 Q62 18 73 24 L74 74Z",stone) +
    path("M40 33 Q55 25 66 30 L66 35 40 39Z",sand) + detail("M41 46 l23 -4 M41 51 l18 -3 M42 57 l21 -3 M43 63 l13 -2") +
    path("M72 81 L76 69 85 65 91 72 96 76 88 80Z",milk) + detail("M76 70 L85 72 91 69") + tuft(26,76,.75);

  art.coinage = [0,1,2,3].map(i=>coin(35,75-i*4,1.12)).join("") +
    [0,1,2].map(i=>coin(81,75-i*4,1)).join("") +
    spin(65,51,13,oval(65,51,19,24,ochre) + oval(62,50,17,23,honey) + oval(62,50,13,17,sand) +
      path("M62 40 l6 10 -6 9 -6 -9Z",honey) + detail("M62 43 l3 7 -3 5")) +
    light("M45 47 q2 -10 7 -14") + star(84,29,.83);

  art.trade = path("M10 74 Q28 66 44 71 T87 65 Q99 65 108 71", "none") +
    path("M17 49 L64 49 61 68 24 70Z",wood) + path("M19 45 L66 43 68 50 19 54Z",copper) +
    path("M22 46 L27 33 54 32 62 44Z",sand) + detail("M31 34 L29 46 M49 33 l6 11") +
    path("M23 34 Q24 22 34 20 L52 21 Q59 22 62 34 L58 44 27 44Z",milk) +
    detail("M35 21 Q29 32 33 43 M49 21 Q45 32 48 43") + wheel(30,69,9) + wheel(58,67,9) +
    path("M64 56 l15 -4 M79 72 l4 -16 M92 69 l-1 -13", "none") +
    path("M74 52 Q71 46 77 44 Q87 40 91 43 L95 35 95 28 100 32 105 30 103 37 108 42 106 45 100 45 96 55 82 57Z",ochre) +
    dot(101,38,1,ink) + detail("M78 57 l-3 13 M94 55 l4 11") + tuft(15,75,.62);

  art.university = path("M16 70 L51 63 82 70 82 76 46 82 16 77Z",sand) +
    path("M22 68 V44 L46 35 68 43 V70 L45 75Z",milk) +
    path("M15 44 L46 28 76 44 47 49Z",slate) +
    path("M33 69 V57 Q38 48 43 56 V72Z",wood) + detail("M49 55 l10 -3 M50 61 l10 -3") +
    path("M55 32 L57 45 Q69 52 81 44 L84 31Z",deep) +
    path("M42 29 L70 17 98 27 70 40Z",jade) + detail("M70 27 l16 4 v17") + path("M86 46 q4 3 3 10 l-6 1 q0 -8 3 -11Z",honey) +
    book(76,72,red,.93);

  art.printing = path("M14 73 L78 65 104 72 103 77 42 84 14 78Z",wood) +
    path("M25 73 L25 29 33 25 35 72Z",ochre) + path("M79 71 L80 24 88 25 88 68Z",ochre) +
    path("M22 26 L78 18 94 22 93 29 37 37 22 33Z",copper) + path("M53 32 L62 30 62 51 54 53Z",slate) +
    detail("M53 35 l10 -3 M53 40 l10 -3 M53 45 l10 -3") +
    path("M34 55 L68 49 81 53 80 58 45 64 34 60Z",wood) +
    path("M34 66 L67 60 81 65 48 72Z",milk) + detail("M43 65 l15 -2 M47 68 l14 -3 M60 63 l10 -1") +
    path("M59 39 L91 34 92 38 59 43Z",ochre) + dot(93,35,3,copper) +
    book(80,73,jade,.78);

  art.powder = path("M15 71 L29 46 40 44 48 31 59 39 67 66 52 77Z",gray) +
    path("M18 69 L32 51 40 56 47 39 56 44 58 63 68 68 51 77Z",stone) +
    detail("M29 65 l7 -6 5 3 M47 53 l6 -7 M36 73 l6 -5") +
    path("M65 42 Q75 35 86 39 Q91 55 87 73 Q78 79 64 73 Q60 58 65 42Z",ochre) +
    oval(76,41,11,4,sand) + path("M63 48 Q75 54 89 47 L89 52 Q76 60 63 53Z",slate) +
    path("M63 65 Q76 71 88 64 L87 69 Q77 75 64 70Z",slate) + detail("M68 55 v10 M83 55 v10") +
    path("M52 78 L60 69 66 73 72 77 61 81Z",gray) + tuft(22,75,.68);

  art.firearms = path("M13 74 L79 24 99 36 37 84Z",ochre) + path("M18 72 L79 30 92 36 36 78Z",jade) +
    path("M28 67 L47 56 Q47 52 54 50 L63 47 68 49 Q60 57 51 60 L37 73Z",copper) +
    path("M53 50 L87 27 90 31 61 53Z",slate) + path("M47 59 Q54 62 59 55", "none") +
    detail("M69 41 l3 3 M80 33 l3 3") + dot(26,71,1.4,honey) + dot(83,37,1.4,honey) +
    path("M66 74 L75 61 99 62 93 76Z",milk) + detail("M77 66 l14 0 m-17 4 h11");

  art.banking = path("M13 72 L68 66 96 73 96 79 43 84 13 78Z",stone) +
    path("M21 69 V43 L65 38 86 43 V70 L43 76Z",sand) +
    path("M17 40 L46 22 69 20 92 38 62 43 43 48Z",deep) +
    path("M16 40 L45 22 65 38 41 45Z",milk) + dot(44,34,3.4,honey) +
    [25,37,50,63].map((x,i)=>placed(x,44-(i===3?2:0),rect(0,0,5,24,1,milk) + rect(-1,0,7,3,1,stone) + rect(-1,23,7,3,1,stone))).join("") +
    detail("M72 48 l10 3 m-10 4 10 3") + coin(89,74,.87) + coin(89,71,.87) + coin(89,68,.87);

  art.sailing = path("M10 74 Q21 70 30 74 T52 74 T74 74 T98 72 Q105 71 111 74 M23 80 Q32 76 41 80 M79 81 Q89 77 100 80", "none") +
    path("M14 60 Q45 70 90 57 L103 51 Q98 66 85 72 Q49 83 25 70Z",wood) +
    path("M15 60 Q49 67 97 56 L94 61 Q51 72 22 66Z",sand) +
    path("M52 62 V19 M77 60 V28", "none") + flag(52,13,red,.9) +
    path("M30 29 Q43 33 65 27 Q63 40 68 51 Q50 58 29 50 Q36 39 30 29Z",milk) +
    path("M69 36 Q79 37 91 31 Q88 42 92 48 Q81 54 69 53 Q75 42 69 36Z",sand) +
    detail("M51 32 Q47 43 49 51 M79 38 l-1 10 M26 58 L51 21 M87 56 l12 -7");

  art.reform = path("M17 76 L70 66 99 75 56 83Z",sand) +
    path("M26 73 V39 L51 35 68 42 V71 L46 77Z",milk) +
    path("M21 40 L43 20 54 20 73 40 50 46Z",red) +
    path("M36 72 V54 Q43 44 50 52 V74Z",wood) +
    path("M53 46 L76 41 82 64 59 70Z",milk) + detail("M59 49 l13 -3 m-12 8 13 -3 m-12 8 9 -2") +
    path("M68 73 Q77 67 84 70 Q91 64 102 64 L99 74 Q91 74 84 79 Q77 76 67 79Z",jade) +
    path("M69 71 Q76 65 84 68 Q90 61 101 61 L99 71 Q91 70 84 77 Q77 73 68 77Z",milk) +
    detail("M84 68 v8") + star(82,27,.8);

  art.atlas = path("M14 44 L39 31 61 36 84 26 103 57 79 71 54 67 30 80Z",milk) +
    path("M39 31 L61 36 79 71 54 67Z",sand) + detail("M39 32 L54 67 M61 37 L79 71") +
    path("M22 46 L32 40 40 44 42 52 35 54 33 62 28 60Z M49 45 l11 -3 8 9 -9 5 -6 -4Z M72 38 l9 -5 9 8 -2 8 -6 -2 -3 -6Z",jade) +
    detail("M34 66 q9 -7 15 -8 m15 -2 5 -2 M75 62 q6 -7 10 -9") +
    placed(89,68,oval(0,0,12,10,ochre)+oval(0,-1,9,8,milk)+path("M-6 4 L1 -6 6 -5 0 4Z",red)+dot(0,0,1.4,wood));

  art.industry = path("M13 73 L73 65 108 72 104 78 49 84Z",stone) +
    path("M69 57 L73 21 83 21 86 58Z",copper) + rect(70,19,15,5,1.3,sand) +
    path("M76 15 Q67 17 68 12 Q60 12 63 7 Q67 3 72 7 Q75 4 80 8 Q84 12 78 15Z",milk) +
    path("M18 69 V45 L30 40 31 32 42 39 44 30 56 38 58 27 68 38 68 71 44 78Z",sand) +
    path("M68 38 L97 46 97 70 68 76Z",ochre) + detail("M20 47 L43 51 67 42 M74 48 l15 4") +
    [25,34,47,56].map((x,i)=>rect(x,51+(i%2)*2,5,10,1,blue)).join("") +
    path("M76 70 V59 Q83 48 89 58 V72Z",wood) + wheel(90,70,10) + light("M74 28 v8");

  art.rails = path("M13 78 L103 65 M20 83 L110 70", "none") +
    detail("M19 74 l8 8 m4 -10 8 8 m5 -10 8 8 m6 -10 8 7 m6 -10 8 7 m8 -10 8 7") +
    path("M24 68 L25 43 45 40 51 61 91 56 99 62 96 69 42 79Z",wood) +
    path("M22 41 L40 36 50 39 50 43 24 48Z",deep) + path("M26 46 L46 43 46 60 26 64Z",jade) +
    path("M29 48 L40 46 40 54 29 56Z",blue) +
    path("M46 54 Q48 44 60 44 L82 42 Q94 43 93 55 Q92 61 83 63 L47 68Z",jade) +
    oval(84,53,8,10,deep) + path("M68 46 L67 36 64 34 64 31 78 29 80 32 75 36 76 44Z",copper) +
    path("M64 26 Q57 24 60 20 Q52 18 57 13 Q61 10 65 14 Q72 10 75 16 Q81 19 76 23Z",milk) +
    wheel(36,68,8) + wheel(55,69,7) + wheel(71,66,7) + wheel(86,64,6) + detail("M55 69 L85 64");

  art.charter = path("M25 68 L37 25 Q39 18 47 20 L88 25 Q96 26 92 33 L81 67 Q78 77 71 77 L29 74Z",sand) +
    path("M31 65 L41 27 Q42 22 49 23 L89 29 77 69 Q73 73 69 72Z",milk) +
    path("M22 65 Q28 61 34 65 L73 71 Q78 70 81 71 Q83 76 76 79 L31 75 Q19 74 22 65Z",sand) +
    lines(48,35,26,3,5) + detail("M42 54 q8 -5 14 1 m-11 4 q7 -3 13 1") +
    path("M65 65 L63 81 68 77 73 82 76 66Z",red) + dot(71,63,9,copper)+dot(71,63,5.7,honey) +
    path("M69 64 l2 -4 3 3 -2 3Z",milk) + star(29,34,.72);

  art.education = path("M14 74 L75 65 105 74 64 84Z",mint) +
    path("M22 69 L22 43 79 38 94 47 94 70 48 78Z",milk) +
    path("M17 44 L31 28 76 24 99 45 77 43 48 52Z",red) +
    path("M45 76 V39 L58 28 70 39 70 74 57 79Z",sand) +
    path("M42 39 L58 23 74 38 69 41 58 31 46 43Z",copper) + dot(58,42,4.2,milk) + detail("M58 39 v3 l3 1") +
    path("M52 76 V59 Q57 52 63 58 V76Z",wood) +
    [28,36,74,83].map((x,i)=>rect(x,52-i%2*2,5,8,1,blue)).join("") + flag(59,7,jade,.9) + tuft(19,74,.6);

  art.expo = path("M12 74 L66 66 108 74 68 84Z",ochre) +
    path("M19 72 V49 L100 44 V72 L61 80Z",milk) +
    path("M16 50 Q23 27 38 33 L47 47Z",jade) + path("M75 45 Q85 22 98 34 L105 46Z",jade) +
    path("M36 47 Q39 23 59 19 Q74 20 82 44 L62 52Z",blue) +
    detail("M59 20 Q45 29 45 47 M59 20 Q52 31 55 48 M59 20 Q67 30 70 46 M41 35 Q60 40 77 33") +
    path("M33 49 L61 52 83 46 83 51 61 58 33 54Z",sand) +
    path("M51 76 V64 Q58 50 66 62 V77Z",deep) +
    [24,36,73,88].map((x,i)=>path(`M${x} ${68-i%2*3}v-9 q3 -6 6 -1 v9Z`,blue)).join("") +
    flag(59,8,red,.75) + flag(26,23,honey,.53) + flag(92,21,red,.57);

  art.aviation = path("M14 78 Q32 72 49 77 T82 75", "none") +
    path("M29 55 L23 41 33 43 41 52Z",red) +
    path("M36 54 L74 40 91 39 Q100 41 99 46 Q97 50 88 53 L46 64 Q30 67 20 62Z",sand) +
    path("M57 49 L48 26 56 23 73 43Z",jade) + path("M55 53 L70 70 65 75 45 58Z",deep) +
    path("M76 43 Q78 32 86 35 L91 39Z",blue) + detail("M82 36 l1 5 M35 58 l7 -2") +
    path("M91 40 Q99 39 100 45 Q99 50 95 50Z",red) + path("M102 44 Q100 28 105 28 Q110 31 104 44 Q108 55 105 59 Q101 58 102 44Z",wood) +
    dot(103,44,2.2,honey) + detail("M64 60 l4 8 M81 56 l4 8") + dot(68,69,3.5,slate)+dot(86,64,3.5,slate) +
    path("M13 45 Q15 41 19 43 Q21 35 28 38", "none");

  art.literature = path("M13 65 Q31 54 52 61 Q69 46 89 51 L94 68 Q75 65 56 80 Q35 73 18 79Z",red) +
    path("M14 61 Q34 52 51 58 Q67 43 88 47 L92 66 Q73 63 54 76 Q36 69 18 75Z",milk) +
    detail("M51 59 l3 17 M22 65 q12 -5 23 -2 M24 69 q11 -4 18 -2 M59 62 q12 -9 23 -9 M62 66 q10 -7 18 -8") +
    path("M56 53 Q61 31 81 19 Q92 13 98 15 Q97 30 84 40 L76 41 77 46 68 46 60 54Z",jade) +
    path("M55 59 Q69 38 93 20", "none") + detail("M72 39 l1 -8 M79 33 l1 -7 M74 38 l8 -1") + star(34,35,.75);

  art.global_finance = path("M13 75 L61 63 102 73 60 84Z",sand) +
    dot(65,43,24,blue) + path("M48 27 L57 24 64 29 62 36 53 39 51 49 43 45Z M73 41 L81 38 87 43 83 51 76 53 73 61 68 58 70 51Z",jade) +
    detail("M47 55 Q63 68 80 57 M47 31 Q61 42 84 32") +
    path("M30 53 Q15 40 37 29 L33 24 48 25 43 37 40 33 Q26 40 34 45Z",honey) +
    path("M91 37 Q108 49 90 61 L94 66 81 65 85 54 88 58 Q97 51 88 45Z",red) +
    [0,1,2].map(i=>coin(38,74-i*4,.92)).join("") + coin(66,77,.8);

  art.heritage = path("M18 75 L71 66 103 74 58 84Z",mint) +
    path("M23 70 L28 47 40 40 56 43 56 71 40 76Z",stone) +
    path("M28 47 L42 45 55 48 M29 55 l20 -2 M29 62 l8 -1 m6 0 9 -2") +
    path("M39 44 L39 25 48 22 56 25 55 46Z",sand) + rect(37,22,21,5,1.5,stone) +
    path("M38 21 L47 12 59 18 57 22Z",gray) +
    path("M61 40 Q76 41 89 33 Q94 38 103 38 L101 56 Q97 71 85 76 Q68 73 62 58Z",deep) +
    path("M67 45 Q77 46 89 39 Q94 43 97 43 L96 55 Q93 65 85 70 Q73 66 69 56Z",mint) +
    path("M76 58 L85 47 92 55 89 57 89 62 78 63 78 57Z",milk) + tuft(26,75,.73);

  art.scholarly = path("M17 70 L77 60 104 69 104 73 48 82 17 75Z",wood) +
    path("M41 29 L66 20 72 28 47 39Z",jade) + path("M63 19 L70 16 77 26 70 31Z",ochre) +
    path("M35 32 L42 29 47 38 40 42Z",slate) + detail("M49 40 L52 47 L45 66 M52 47 l10 15 M52 47 l1 18") +
    path("M72 44 V39 H80 V44 L89 59 Q86 65 74 65 Q63 65 62 60Z",milk) +
    path("M67 55 Q74 57 84 54 L88 60 Q79 68 63 61Z",blue) + dot(77,52,1.3,jade) +
    book(24,70,red,1.15)+book(25,63,blue,1.05) +
    path("M70 68 L87 66 94 69 77 73Z",milk) + star(85,24,.75);

  art.computer = path("M17 73 L69 67 104 72 59 82Z",gray) +
    path("M24 70 L24 28 61 23 80 30 80 68 44 76Z",jade) +
    path("M61 23 L80 30 80 69 61 73Z",deep) +
    path("M28 33 L55 29 55 48 28 51Z",slate) +
    dot(35,40,4.8,milk) + dot(47,38,4.8,milk) + dot(35,40,1.4,wood) + dot(47,38,1.4,wood) +
    detail("M34 45 Q40 48 48 42 M29 59 l24 -3 M29 64 l24 -3 M66 39 l9 2 M66 44 l9 2 M66 49 l9 2") +
    path("M55 75 L67 59 87 57 98 63 97 73 72 79Z",sand) + path("M60 72 L69 62 89 61 94 65 73 72Z",milk) +
    detail("M69 66 l12 -2 m-13 5 15 -3") + dot(88,69,1.8,red);

  art.information = path("M25 67 L58 48 88 62 M58 45 L52 33 M26 68 Q53 84 89 65","none") +
    placed(34,13,path("M0 9 L24 4 35 10 35 29 10 34 0 28Z",jade) +
      path("M5 12 L24 9 24 23 5 27Z",slate) + light("M9 19 l3 1 3 -4 4 0") +
      path("M12 33 L12 37 7 39 25 41 29 38 22 36 22 31Z",stone)) +
    placed(17,55,path("M0 4 L13 0 25 4 25 16 12 20 0 16Z",milk)+path("M0 4 l12 8 13 -8","none")) +
    placed(79,45,path("M0 7 L16 0 25 5 25 25 8 30 0 25Z",blue)+detail("M4 11 l12 -4 M5 15 l12 -4 M5 19 l8 -3")) +
    dot(58,48,4,honey) + dot(57,73,3,copper) + star(89,26,.65);

  art.ai = path("M22 59 L59 43 94 52 96 67 61 81 24 69Z",slate) +
    path("M23 55 L59 40 95 50 95 58 61 73 23 62Z",jade) +
    path("M37 54 V39 Q37 22 57 21 Q76 16 85 35 L85 49 Q65 61 37 54Z",milk) +
    path("M43 40 Q47 34 70 33 Q78 32 79 39 V44 Q77 50 49 51 Q44 51 43 45Z",deep) +
    oval(53,42,2,3,milk) + oval(70,39,2,3,milk) + detail("M59 44 q3 2 5 -1") +
    path("M58 20 v-7","none") + dot(58,11,3,honey) +
    detail("M26 66 l-7 4 m15 -2 -7 5 m18 -2 -6 5 M76 71 l5 4 m3 -8 6 4 M41 31 l5 -4") + star(92,30,.65);

  art.station = spin(61,48,-17,
    path("M15 42 H103 V51 H15Z",stone) +
    rect(8,31,30,28,2,slate) + rect(83,33,29,27,2,slate) +
    detail("M12 35 h22 m-22 7 h22 m-22 8 h22 M18 33 v24 M27 33 v24 M87 37 h21 m-21 7 h21 m-21 8 h21 M92 35 v23 M101 35 v23") +
    rect(46,34,31,22,8,milk) + path("M50 35 V24 Q55 18 61 23 V34Z",sand) +
    path("M62 56 V65 Q68 73 73 65 V55Z",blue) + oval(54,45,4,4,blue) + oval(68,45,4,4,blue) +
    detail("M76 39 h5 M76 52 h5 M49 26 h11 M64 62 h8")) +
    path("M18 76 Q35 65 51 73 M25 77 Q31 74 39 75", "none") + star(86,20,.75)+star(31,22,.48);

  art.peace = path("M18 64 Q36 47 57 54 Q77 37 94 42 L101 63 Q82 61 64 80 Q45 72 27 82Z",jade) +
    path("M18 60 Q35 46 57 49 Q75 34 93 38 L99 59 Q81 58 63 75 Q45 69 26 77Z",milk) +
    detail("M57 50 l6 25 M30 59 q13 -7 20 -5 M33 64 q13 -6 20 -3 M69 51 q9 -7 16 -8 M72 55 q8 -6 15 -7") +
    path("M47 50 Q60 44 67 22 Q70 17 75 15","none") +
    leaf(56,41,-14) + leaf(64,31,-15) +
    path("M58 40 Q66 32 73 36 Q69 43 58 40Z M67 25 Q71 16 79 19 Q78 27 67 25Z",jade) +
    dot(85,61,6,copper)+dot(85,61,3.3,honey);

  art.faith_council = path("M14 72 Q48 86 100 72 L94 79 Q54 87 25 79Z",sand) +
    [ [32,38,copper], [52,29,deep], [73,29,berry], [93,37,jade] ].map(([x,y,color]) =>
      placed(x,y,path("M-8 15 Q-7 3 0 3 Q8 3 8 15Z",color) + dot(0,0,4.4,sand))).join("") +
    path("M20 56 Q20 44 59 41 Q96 40 101 53 V58 Q99 70 59 73 Q23 73 20 62Z",wood) +
    oval(60,54,41,12,sand) + oval(60,53,30,7,milk) +
    path("M60 54 Q51 49 58 41 Q59 46 63 40 Q70 49 60 54Z",honey) +
    [ [42,70,slate], [77,68,red] ].map(([x,y,color]) =>
      placed(x,y,path("M-8 8 Q-8 -1 0 -2 Q8 -1 8 7 L1 11Z",color) + dot(0,-4,4.7,sand))).join("");

  art.city_league = path("M9 66 Q25 56 49 61 L67 65 98 55 112 63 Q84 78 65 78 Q34 66 13 76Z",blue) +
    placed(11,29,building(0,0,milk,red),.92) + placed(73,23,building(0,0,milk,jade),.94) +
    path("M35 66 Q53 49 78 59 L79 65 Q56 58 38 73Z",ochre) +
    detail("M39 63 V55 M49 58 V50 M61 55 V47 M73 57 V49 M39 56 Q55 45 74 50") +
    placed(41,55,building(0,0,milk,slate),.59) + flag(42,16,honey,.65) + tuft(19,74,.65);

  art.global_culture = path("M15 62 Q24 82 52 77 M64 76 Q86 77 101 60","none") +
    dot(63,40,24,blue) + path("M45 27 L55 22 62 26 64 33 57 35 53 43 44 40Z M71 39 L81 36 85 43 80 47 75 46 74 57 68 53Z",jade) +
    detail("M44 49 Q57 59 77 54") + path("M16 60 L15 42 33 38 40 54 36 65Z",sand) +
    path("M19 43 L31 41 35 53 21 57Z",milk) + path("M20 54 l5 -8 8 6Z",jade) +
    path("M82 66 L80 49 101 44 106 62Z",red) + path("M83 51 L99 48 102 59 86 63Z",milk) +
    detail("M87 54 l10 -3 M88 58 l6 -2") +
    path("M45 73 Q54 67 60 70 Q68 63 78 64 L77 71 Q68 70 61 78 Q53 74 45 79Z",milk) +
    detail("M60 70 l1 7") + star(29,23,.72);

  window.AlbumTrophyArt = Object.freeze(Object.fromEntries(
    Object.entries(art).map(([id, drawing]) => [id, vignette(drawing)])
  ));
})();
