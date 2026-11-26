(() => {
  "use strict";

  const fields = ["政治・法律", "外交・戦争", "経済・産業", "社会・文化", "宗教・思想", "科学・技術", "災害・特殊事件", "特殊・偶然"];
  const keys = { S: "order", K: "knowledge", W: "wealth", C: "culture", P: "power" };
  const names = { S: "安定度", K: "科学力", W: "経済力", C: "文化力", P: "軍事力" };
  const changes = value => Object.fromEntries(value.trim().split(/ +/).map(term => [keys[term[0]], Number(term.slice(1))]));
  const pick = (title, stats, result, rules = {}, summary = null) => ({
    public: { title, result, summary: summary ?? stats.split(" ").map(term => names[term[0]] + term.slice(1)).join("、") },
    rules: { flags: [], delta: changes(stats), ...rules },
  });
  const define = (id, era, field, title, body, rules, options, info = {}) =>
    ({ id, era, field: fields[field], public: { title, category: fields[field], body }, rules, choices: options, ...info });
  const person = (name, role, stage = "登場") => ({ name, role, stage });
  const needs = (...ids) => ({ needs: ids, weight: 3.5 });
  const trait = (...tags) => ({ tags, weight: 2.3 });
  const flag = (...flags) => ({ flags });
  const protect = (id, delta) => ({ when: { needs: [id] }, delta: changes(delta) });
  const jeopardy = (goal, flag, open, reason, protectedBy) => ({ goal, flag, open, reason, protectedBy });
  const shock = (id, era, field, title, body, kind, severity, impact, options, extra = {}) =>
    define(id, era, field, title, body, extra.scheduling ?? {}, options, {
      incident: { kind, severity, delta: changes(impact), narrative: body,
        protections: extra.protections, disruptions: extra.disruptions, scar: extra.scar },
      ...(extra.person ? { person: extra.person } : {}),
    });
  const kindLabels = { fortune: "幸運", calamity: "災厄", ambiguous: "予期せぬ変化" };
  const flags = {
    reed_mechanism: "葦の連動装置", geared_weights: "軸と分銅の工房記録", millwrights: "水車職人の規格帳", loom_industry: "交換部品による織機産業",
    river_poem: "渡し守の詩", ballad_archive: "詩人の写本", shared_edition: "都市を巡った詩集", civic_readings: "朗読会の連携",
    lantern_fair: "灯籠を流す祭り", river_calendar: "街道の祭日暦", festival_hosts: "祭礼宿の相互規約", festival_assembly: "祭りの都市連絡会",
    beacon_chart: "岬と風の道標", island_guide: "島の航路記録", navigator_school: "航路を教える工房",
    flood_scar: "流域の堆積と洪水被害", harbour_scar: "港の焼失と荷の散逸", route_scar: "山越えの街道の断絶", orbital_scar: "管制設備の損傷",
    patronage_archive: "芸術家の共同保管契約", copper_register: "赤い石の分布記録", mutual_grain: "沿岸の非常米協定",
    responsive_council: "持ち回りの連絡会", epidemic_records: "地域の療養記録", credit_letters: "市場間の信用札",
    public_readers: "公開朗読と印刷の会", alpine_fund: "山道復旧の共同基金", night_patrol: "夜間の共同巡回",
    regional_bargain: "地域ごとの裁量協定", salt_contract: "塩の共同交換契約", apprentice_charter: "見習いの相互認定",
    border_languages: "隣国の言葉の通訳網", textile_brokers: "布の共同仕入れ組合", neutral_testing: "共同実地試験",
  };
  const lineage = ["reed_mechanism", "geared_weights", "millwrights", "loom_industry", "river_poem", "ballad_archive", "shared_edition",
    "civic_readings", "lantern_fair", "river_calendar", "festival_hosts", "festival_assembly", "beacon_chart", "island_guide", "navigator_school"];
  const events = [
    // 原始
    define("camp_quorum",0,0,"夜番の決め方","川べりの寝床が増え、夜番を誰が引き受けるか各家が相談した。",{},[
      pick("家ごとに順番を回す","S5 W-3","家の持ち回りで夜番が始まった。",{governance:"communal"}),
      pick("夜に詳しい人へ一任する","P6 C-3","夜番の担当者を狩りの経験で選んだ。",{tags:["merit"]}),
      pick("渡し場を共同で見張る","S4 C3 W-4","集落を超えた夜番の会合が置かれた。",flag("night_patrol"))]),
    define("inheritance_tools",0,0,"亡き人の道具","使い手を失った石刃と縄を、家に返すか、次の使い手へ譲るかで意見が割れた。",{},[
      pick("使う人へ譲る","K5 S-3","道具を使う者に引き継ぐ慣行になった。",{tags:["merit"]}),
      pick("家の棚に残す","S5 K-2","家々の継承順で道具が配られた。",{tags:["estates"]}),
      pick("木札で貸し出す","W5 C-3","貸し出しの印を残すようにした。",flag("assembly"))]),
    define("dry_bank_hearing",0,0,"割れた土手の裁定","水路の土手を直す責任をめぐり、上流と下流の家が争った。",needs("canals"),[
      pick("下流にも意見を述べる席を設ける","S5 W-3","下流も出席する水の集会が開かれた。",flag("assembly")),
      pick("上流に補修を一任する","W6 C-3","上流の家が補修順を決めることになった。",{tags:["estates"]}),
      pick("流れを共同で測る","K6 W-4","土手の修理前に流量を測る日取りが決まった。",{tags:["open_science"]})]),
    define("interpreter_child",0,0,"二つの言葉を話す子","子どもが対岸の話し方を覚え、家々の伝言を引き受けるようになった。",{},[
      pick("伝言役に食料を出す","C6 W-4","対岸との伝言に共通の通訳役がついた。",flag("border_languages")),
      pick("短い印だけを共有する","K5 C-2","通行を示す印が両岸に置かれた。",flag("accord")),
      pick("各家で使う言葉を守る","S5 C-3","家の伝言は引き続き家族が担った。",{tags:["local_first"]})]),
    define("tracks_on_ridge",0,1,"尾根の足跡","狩りの境界を越えた足跡が見つかった。近隣の家にも同じ尾根が必要だという。",{},[
      pick("季節で狩場を分ける","S6 P-4","双方が狩りに入る季節を分けた。",flag("accord")),
      pick("境界の目印を増やす","P6 W-3","尾根の目印を見回る人が置かれた。",flag("night_patrol")),
      pick("獲物を共同で分ける","W5 S-3","獲物の持ち帰りを双方で分けた。",{tags:["pacifism"]})]),
    define("fog_markers",0,1,"霧に浮かぶ岬","舟で帰れなかった行商人が、岬ごとの風と音を地面に描いた。",{},[
      pick("道標を刻んで写しを渡す","K5 W-4","岬と風の道標を複数の集落で共有した。",flag("beacon_chart")),
      pick("漁の仲間だけに教える","W6 C-3","漁の仲間が新しい目印を覚えた。",{tags:["isolation"]}),
      pick("渡し舟を一か所に集める","S5 C-3","舟の発着が同じ渡し場にそろった。",flag("market"))]),
    define("stray_herd",0,1,"群れの貸し借り","隣の家の家畜が混じり、どの群れを誰が世話するか決めることになった。",{},[
      pick("冬の間だけ共同で飼う","W5 S-3","両家が同じ囲いを交互に管理した。",{tags:["collective"]}),
      pick("目印を付けて返す","S6 W-3","群れを見分ける結び目が決まった。",flag("accord")),
      pick("移動を監視する人を雇う","P5 C-3","放牧地に世話役を派遣した。",flag("night_patrol"))]),
    define("shell_currency",0,2,"貝殻の束","数えやすい貝殻を、食料や器との交換の目安にする案が出た。",{},[
      pick("同じ長さの束にする","W6 S-3","市場で貝殻の束を数え始めた。",flag("market")),
      pick("不足時の支払い札を置く","W5 C-3","食料を受け渡せる日を記した札が使われた。",flag("credit_letters")),
      pick("貝殻を祭礼にだけ使う","C6 W-3","共通の貝殻は祭礼の席で配られた。",{tags:["polytheism"]})]),
    define("clay_roof",0,2,"雨よけの乾燥棚","乾く前の器がたびたび雨に濡れる。作り手は屋根を作るなら誰が材料を出すか話し合った。",{},[
      pick("共同の棚を作る","W5 S-3","器を乾かす棚をまとめて使った。",{tags:["collective"]}),
      pick("工房が材料代を負担する","K6 W-4","工房ごとに屋根の作り方が改良された。",flag("apprentice_charter")),
      pick("器の交換収入で直す","W6 C-3","交換品の一部を棚の修理に充てた。",flag("market"))]),
    define("salt_guarantee",0,2,"塩の返し日","保存用の塩を先に借りて、漁のあとに返す契約が育ち始めた。",{},[
      pick("両岸で返す日をそろえる","W6 S-4","塩の引き渡し予定を両岸で共有した。",flag("salt_contract")),
      pick("返済を収穫に合わせる","S6 W-3","返済の期日を家の収穫に合わせた。",{tags:["local_first"]}),
      pick("共同倉から貸し出す","S4 W-3","倉に保管した塩を当番が貸した。",flag("granary"))]),
    define("reed_poet",0,3,"渡し守の詩","渡し守のミラが、岸で待つ人々の声を短い詩にして、舟の板に刻んだ。",{weight:1.8},[
      pick("他の渡し場にも詩を伝える","C5 W-3","別の渡し場でもミラの詩が語られた。",flag("river_poem","tales")),
      pick("舟の合図に借りる","S5 C-2","詩の一節を舟を呼ぶ合図に使った。",{tags:["collective"]}),
      pick("板はミラの家に返す","S4 C-2","詩の板は写されず、ミラの家に置かれた。")],{person:person("ミラ","詩人・渡し守")}),
    define("mending_circle",0,3,"針を持ち寄る夜","服をつくろう夜の集まりに、作業が得意でない子どもも集まった。",{},[
      pick("縫い方を皆で教える","K5 C3 W-4","作業を交代しながら子どもにも縫い方を教えた。",flag("apprentice_charter")),
      pick("頼まれた服だけを直す","W5 C-2","針を持つ家が依頼ごとに服を直した。",flag("market")),
      pick("歌を練習する時間も設ける","C7 W-4","縫い物の後で歌を覚える会が続いた。",flag("tales"))]),
    define("braided_names",0,3,"編み紐に残す名前","長い旅に出た家族の名前を、色の違う紐で覚えている人がいた。",{},[
      pick("共通の色を教える","C6 W-3","集落をまたいで紐の色の意味が伝わった。",flag("tales")),
      pick("家ごとの文様を認める","C5 S-2","色への意味付けは家ごとに残った。",{tags:["individual"]}),
      pick("道具の所有印にも使う","W6 C-3","編み紐が借りた道具の目印に使われた。",flag("credit_letters"))]),
    define("new_cooking_hearth",0,3,"料理の分け前","集まった家族の間で、似た穀物を別の方法で調理する人がいた。",{},[
      pick("手順を交互に教える","C5 K3 W-4","異なる調理法を伝え合った。",{tags:["open_science"]}),
      pick("保存できる方法に絞る","W6 C-3","長く貯蔵できる料理が倉に入った。",flag("granary")),
      pick("子どもに取り分を決めさせる","S6 W-3","子どもが配膳を受け持った。",{tags:["collective"]})]),
    define("first_lanterns",0,4,"川に流す灯り","ある村が、川の水位が落ちる晩に初めて灯籠を流した。対岸でも灯りを見た人々が集まった。",{},[
      pick("対岸も毎年招く","C6 W-4","灯籠を流す祭りが両岸で繰り返された。",flag("lantern_fair")),
      pick("祖先の小さな祭りとして残す","S6 C-3","灯りは家族だけで流す習慣になった。",{tags:["polytheism"]}),
      pick("夜の舟の目印にも使う","K5 W-3","舟は灯りを渡し場の目印にした。",flag("beacon_chart"))]),
    define("stones_for_the_missing",0,4,"帰らなかった人の石","外へ旅立った人のため、家々が道端に小石を積んだ。並べ方には違いがある。",{},[
      pick("家の異なる石の並べ方を認める","C6 S-3","異なる追悼の形が同じ場所に残った。",{tags:["polytheism"]}),
      pick("石のそばで季節の祈りを始める","S5 W-3","集落の人が季節ごとに石のそばに集まった。",flag("lantern_fair")),
      pick("石に旅の方向を記す","K5 C-2","石の並びで旅の方向を伝えた。",flag("beacon_chart"))]),
    define("moon_shelter",0,4,"月を待つ雨宿り","月が見えるはずの晩に雲が残り、祭礼を延ばすか予定どおり集まるか話し合った。",trait("moon_cult"),[
      pick("雲を記して日を改める","K6 W-4","祭礼とともに空の記録が残った。",flag("shared_sky")),
      pick("集まった人で祭礼を続ける","C6 S-3","月が見えない晩にも同じ歌が歌われた。",flag("lantern_fair")),
      pick("水場の仕事に集会を使う","S6 C-3","参加者が増水に備えた水場の仕事を分けた。",flag("canals"))]),
    define("reed_tinker",0,5,"葦で動く小さな仕掛け","職人のルクが、一本の葦を押すと別の棒が動く小さな仕掛けをつくった。",{weight:1.8},[
      pick("寸法を土板に残す","K5 W-3","ルクの仕掛けの寸法が保存された。",flag("reed_mechanism")),
      pick("魚の網だけに使う","W6 K-3","網を引く作業が少し楽になった。",flag("market")),
      pick("子どもの玩具にする","C6 W-3","仕掛けは遊び道具として残った。",{tags:["open_science"]})],{person:person("ルク","地方の職人・発明家")}),
    define("winter_sunline",0,5,"冬の日の線","同じ石に日陰の線を刻んでいた人と、雲で刻めなかった日の扱いを決めることになった。",{},[
      pick("空白も記録する","K6 W-3","観測できなかった日も印が付いた。",flag("shared_sky")),
      pick("暖かくなった日を目印にする","W5 K-2","種まきの目安を暖かさで決めた。",{tags:["merit"]}),
      pick("影と祭礼を別に決める","C6 S-3","祭日の決定を日陰の観測から分けた。",flag("lantern_fair"))]),
    define("cloth_measuring",0,5,"編み目を数える板","網の編み目を数える板が作られ、捕れる魚の大きさが区別できるようになった。",{},[
      pick("細かい目を比較する","K6 W-3","異なる網で取れた魚を比べた。",{tags:["open_science"]}),
      pick("大きな目の網を主に使う","S5 W-3","小魚が抜ける網を共同漁に使った。",flag("assembly")),
      pick("板を交換品にする","W6 C-3","交換市で編み目の板が売られた。",flag("market"))]),
    shock("sudden_river",0,6,"一晩で変わった川筋","上流の斜面が崩れ、夜のうちに川が古い集落へ流れ込んだ。", "calamity","ordinary","W-13 S-8",[
      pick("高台に臨時の住まいをつくる","S8 W-5","高台の家を水の引くまで共同で使った。",{tags:["collective"]}),
      pick("倉の残りを家々で分ける","W6 C-3","水を免れた食料が家々に渡った。",flag("granary")),
      pick("新しい川筋を記録する","K7 S-3","次の増水に備えて水の流れを刻んだ。",flag("canals"))],{protections:[protect("granary","W5"),protect("canals","S4")],scar:"flood_scar"}),
    shock("embers_in_reeds",0,6,"葦屋根を走る火","乾いた晩に川風が急に変わり、炉の火の粉が葦で葺いた屋根に燃え移った。", "calamity","ordinary","W-10 C-6",[
      pick("空地にいくつかの小屋を建てる","S6 W-4","火の届かなかった空地に仮の小屋が立った。",{tags:["collective"]}),
      pick("焼け跡を交換市にする","W7 S-4","使えない家の跡で臨時の交換が始まった。",flag("market")),
      pick("火を隔てる道幅を調べる","K6 W-4","屋根の間に確保する幅を決めた。",flag("roads"))],{protections:[protect("night_patrol","W4")]}),
    define("first_bank_recovery",0,6,"堆積土の使いみち","増水が引いた後、畑には砂と泥が残った。何を耕地として戻すか、被害を受けた家が集まった。",needs("flood_scar"),[
      pick("泥の残る畑に種を戻す","W9 S-4","農地の一部で収穫が再開した。",{revoke:["flood_scar"],reconstruction:"堆積土を耕し、浸水した畑の一部を再開"}),
      pick("丘に移り水路を引く","S8 W-5","新しい居住地と水路を高台に整えた。",{flags:["canals"],revoke:["flood_scar"],reconstruction:"高台へ移住し、水路を確保"}),
      pick("川辺を季節だけ使う","K6 W-4","川の増水期を記録し、一部を季節の漁場にした。",flag("shared_sky"))]),
    shock("straw_bumper",0,7,"倒れない穂","風雨を免れた一角で穀物が予想より多く実った。もとの取り分を超えた収穫の行き先を決める。","fortune","ordinary","W10",[
      pick("余分の種と食料を貯蔵する","S7 W-4","食料と翌年の種が分けて保管された。",flag("granary")),
      pick("対岸へ交換品として送る","W7 C-3","対岸に余った穀物が送られた。",flag("market")),
      pick("違う土地にも種を植える","K6 W-4","穀物を別の地形で育てて結果を比べた。",{tags:["open_science"]})]),
    shock("copper_in_root",0,7,"根が引き出した赤い石","倒木の根から、熱を加えると表面が変わる赤い石が露出した。","fortune","ordinary","K7 W4",[
      pick("見つけた場所を石板に記す","K5 W-4","赤い石の出る場所が記録された。",flag("copper_register")),
      pick("見つけた塊を対岸へ渡す","W8 K-3","塊を布や塩と交換した。",flag("market")),
      pick("祖先の火に供える","C7 W-3","赤い石は祭礼の火のそばに置かれた。",{tags:["polytheism"]})]),
    shock("shore_caravan",0,7,"舟を失った一団","遠い岸から来た一団が、舟を失って助けを求めた。集落にはない編み方と言葉を知っている。","ambiguous","ordinary","C5 W-4",[
      pick("食料と作業場を分け合う","K7 W-5","新しい編み方が集落の工房で教えられた。",flag("apprentice_charter")),
      pick("次の岸まで送り届ける","S7 P-4","別の岸まで案内する約束が交わされた。",flag("accord")),
      pick("言葉を覚える人を選ぶ","C7 W-4","新しい言葉を話す通訳役が生まれた。",flag("border_languages"))]),
    // 古代
    define("market_disputes",1,0,"債務札の法廷","市場の信用札に異なる記号が刻まれ、貸し手と借り手が残高を争った。",needs("credit_letters"),[
      pick("公開の照合所を置く","S6 W-4","誰でも札を照合できる法廷ができた。",flag("trade_court")),
      pick("商家が証人になる","W7 C-4","法廷は登録商家の証言を採用した。",flag("guild_credit")),
      pick("地区の仲裁に戻す","C6 P-3","債務は各地区の慣行で裁かれた。",{tags:["local_first"]})]),
    define("reed_petitioners",1,0,"門の外の請願","門の外で、都市の住民として登録されていない人々が水を使える権利を求めた。",{},[
      pick("住所にかかわらず請願を受ける","S7 W-4","門外の人にも請願が受理された。",flag("civic_law")),
      pick("地区が使用枠を割り当てる","C5 S-3","地区ごとの使用予定が掲示された。",{tags:["local_first"]}),
      pick("水汲みの仕事を契約にする","W6 C-3","登録商人が門外にも水を運んだ。",flag("market"))]),
    define("broken_royal_seal",1,0,"欠けた王印","遠方の村に届いた命令の印が欠けていた。誰が正式な命令か確かめるのか定まっていない。",trait("monarchy"),[
      pick("王印と記録を二人で確認する","S7 W-4","役人の署名を照合する帳簿が作られた。",flag("audits")),
      pick("地方に独自の確認印を任せる","C6 P-3","命令の確認印が地域ごとに作られた。",{tags:["local_first"]}),
      pick("王の使者の宣言だけを認める","P7 C-4","使者が広場で命令を読み上げた。",{tags:["estates"]})]),
    define("rotating_council",1,0,"代表の席順","共同の会議に新しい地区が加わった。前列の古い代表が発言の順も決めている。",{},[
      pick("議長を地区の持ち回りにする","C6 S-3","議長が会合ごとに変わる慣行が成立した。",flag("responsive_council")),
      pick("人口ごとに発言枠を配る","S7 W-4","地区の人数を数えて発言枠を決めた。",flag("civic_law")),
      pick("関係者だけの会合にする","W6 C-4","争点ごとに代表を招くようになった。",{tags:["individual"]})]),
    define("island_log",1,1,"風待ちの島","前に刻まれた岬の目印を頼りに、探検家アズが風を待てる島を見つけた。",{...needs("beacon_chart"),priority:1.55},[
      pick("寄港できる場所を航路に記す","K6 W-3","島の安全な寄港地を記録した。",flag("island_guide")),
      pick("近隣の船に先に知らせる","S6 P-3","互いの緊急寄港を認める協定が結ばれた。",flag("accord")),
      pick("島の港で休憩商を営む","W7 C-4","風を待つ舟が島で物資を買うようになった。",flag("market"))],{person:person("アズ","探検家")}),
    define("guards_at_hostel",1,1,"宿の兵と荷主","守備隊と隊商が同じ宿を使い、兵のために荷主が部屋を空けるよう求められた。",{},[
      pick("負担を宿代に明示する","W6 S-4","兵と隊商の負担額が契約に記載された。",flag("trade_court")),
      pick("守備隊用の宿を分ける","P7 W-5","隊商と守備隊が別の場所に泊まった。",flag("army")),
      pick("いずれの客にも空室を保証する","S7 C-4","宿は同じ順番で部屋を用意した。",{tags:["pacifism"]})]),
    define("returning_envoys",1,1,"帰国した使者の言葉","長く国外にいた使者が隣国の言葉で報告し、一部の広場では話の意味が伝わらなかった。",{},[
      pick("地元と国外の報告を対照する","C6 W-4","双方の言葉で書いた報告が公開された。",flag("border_languages")),
      pick("代表だけが報告を読む","K6 C-3","外交の報告は会議で審理された。",{tags:["controlled_tech"]}),
      pick("両国に通訳の窓口を作る","S6 P-3","国境に伝言の窓口が開いた。",flag("accord"))]),
    define("salt_default",1,2,"塩の未払い","貸した塩が期日までに戻らず、共同交換契約のいくつかが止まった。",needs("salt_contract"),[
      pick("期日を収穫ごとに設定する","S6 W-3","収穫日を基準に塩の期日を決め直した。",flag("guild_credit")),
      pick("違う品で清算する","W7 C-4","保存食や器でも未払いを清算できるようになった。",flag("trade_court")),
      pick("次回から共同倉だけで貸す","S6 W-4","塩の貸出を一か所で扱った。",flag("public_store"))]),
    define("dye_makers",1,2,"色をそろえる布市場","布の模様に値段がつくようになったが、色をそろえるための仕入れが家ごとに高くつく。",{},[
      pick("染料を共同で買う","W7 S-4","染料の共同仕入れを行う組合ができた。",flag("textile_brokers")),
      pick("布地の違いを売りにする","C7 W-4","地区ごとに異なる染め柄が売られた。",{tags:["individual"]}),
      pick("色を記録し工房間で比べる","K6 W-3","色の見本が工房同士で交換された。",{tags:["open_science"]})]),
    define("wharf_dues",1,2,"二重の船着き料","下流から来た船が荷を積み替え、同じ荷に二度の料金がかかった。",{},[
      pick("荷に領収印を付ける","W7 S-3","すでに支払い済みの荷には別の印を付けた。",flag("trade_court")),
      pick("二つの港で料金を分ける","S6 W-4","船着き料を上下流の港で配分した。",flag("accord")),
      pick("小船の料金を先に免除する","C6 W-4","少量の荷は無料で積み替えられるようになった。",{tags:["federation"]})]),
    define("poet_scraps",1,3,"板から写本に移る詩","渡し場で語られたミラの詩を集めた書記が、断片ごとに異なる結末を写そうとしている。",{...needs("river_poem"),priority:1.55},[
      pick("異なる結末も写しに残す","C7 W-4","ミラの詩は地区ごとの結末とともに書き写された。",flag("ballad_archive")),
      pick("祭礼用の一冊だけを残す","S6 C-3","祭礼で朗読する一つの版が選ばれた。",{tags:["state_faith"]}),
      pick("原板を各地へ返す","C5 K-3","板は渡し場ごとに保管され、共通の版は作られなかった。",flag("tales"))],{person:person("ミラ","詩人・渡し守","作品の継承")}),
    define("student_boarding",1,3,"学舎の寄宿先","遠方から通う若者の泊まる場所を、学舎と近くの家が相談した。",{},[
      pick("寄宿先を学舎が持つ","K7 W-5","遠方の学生が学舎の隣で暮らした。",flag("academy")),
      pick("各家が異なる日だけ受け入れる","S6 W-3","近所の家が日ごとに学生を泊めた。",{tags:["collective"]}),
      pick("商人が下宿を登録する","W7 C-4","市場の近くに学生向けの宿ができた。",flag("market"))]),
    define("pottery_mark",1,3,"器の裏の印","無名の作者の器が遠い村に渡り、使う人は裏に押された小さな鳥の印を真似した。",{},[
      pick("誰でも鳥を使えるようにする","C7 S-3","各地の器に違う鳥の印が広がった。",{tags:["individual"]}),
      pick("作者に由来を掲示する","C6 W-4","市で器の作者を紹介した。",flag("patronage_archive")),
      pick("印を品質の証にする","W7 C-3","工房組合が鳥の印を審査の証にした。",flag("apprentice_charter"))]),
    define("street_recitations",1,3,"仕事帰りの朗読台","書き手が仕事を終えた人へ歴史や法律を読んでいる。夜の場所を市が管理する案が出た。",{},[
      pick("照明と広場を公開する","C7 W-4","夕方ごとに公開朗読が行われた。",flag("public_readers")),
      pick("法律と交通だけを知らせる","S7 C-3","法令と翌日の通行情報が読み上げられた。",flag("civic_law")),
      pick("演者が寄付を集める","W6 C-3","書き手が公演ごとに寄付で運営した。",flag("patronage_archive"))]),
    define("fair_nights",1,4,"街道に広がる灯籠","川辺の灯籠で集まる習慣が、荷を運ぶ人々に伴って別の町にも伝わった。",{...needs("lantern_fair"),priority:1.55},[
      pick("各都の祭りの日を暦にする","C7 W-4","街道の複数の都が灯籠の祭日を共有した。",flag("river_calendar")),
      pick("祭礼を川に面する村に任せる","S6 C-3","灯籠の祭りは村の自治で続けられた。",{tags:["local_first"]}),
      pick("旅人の安全を祈る習慣にする","C6 P-3","祭りで道を通る旅人の無事を願った。",flag("accord"))]),
    define("gate_of_vows",1,4,"門に置かれた誓い","売り手が門の前で品物への誓いを立て、その言葉が礼拝でも唱えられるようになった。",{},[
      pick("異なる神への誓いを認める","C7 S-3","複数の形式で同じ取引が扱われた。",{tags:["polytheism"]}),
      pick("唯一の神への短い誓いにする","S7 C-4","取引の誓いが一つの手順になった。",{tags:["monotheism"]}),
      pick("誓いと証文を分ける","K6 W-4","取引は証文、礼拝は誓いで扱われた。",flag("trade_court"))]),
    define("incense_guild",1,4,"香を運ぶ組合","礼拝所に香を届ける組合が、調達先と祭りで使う香の規則を定めようとした。",{},[
      pick("祭日ごとに違う香を使う","C7 W-4","香の種類が祭日によって分けられた。",{tags:["polytheism"]}),
      pick("香の供給を国の年中行事にする","S7 C-4","香の納入が公的な行事に組み込まれた。",{tags:["state_faith"]}),
      pick("産地の違いを台帳に残す","K6 W-3","香の産地と材料を組合が記録した。",flag("script"))]),
    define("counterweight_shop",1,5,"小さな仕掛けを秤に使う","保存された葦の仕掛けの寸法を読んだ工房が、重りの動きを調整して試している。",{...needs("reed_mechanism"),priority:1.55},[
      pick("軸と分銅の動きを記録する","K7 W-4","軸と分銅を一緒に使う工房記録が残った。",flag("geared_weights")),
      pick("注文を受けて秤を作る","W8 K-4","仕掛けを組み込んだ秤が売れた。",flag("market")),
      pick("細工師だけで寸法を守る","K6 C-3","寸法は工房内の見習いへ伝えられた。",flag("apprentice_charter"))]),
    define("copper_survey",1,5,"赤い石の採掘記録","以前の赤い石の分布記録をもとに、採掘する岩場と水路の距離を調べに行く。",needs("copper_register"),[
      pick("掘った場所を新しい地図に残す","K7 W-4","採掘場所と水路を記す地図が残った。",flag("script")),
      pick("鉱石の運搬を市場で契約する","W8 S-4","鉱石を定期的に運ぶ契約が成立した。",flag("trade_court")),
      pick("水場を残して掘る量を抑える","S7 W-4","水場の周辺は採掘域から外された。",flag("canals"))]),
    define("shadow_wells",1,5,"井戸に映る日","深い井戸の底に日が届く時刻が季節で異なる。町の観測役がそれを利用しようとしている。",{},[
      pick("複数の町で時刻を比較する","K7 W-4","同じ日の時刻を町の観測役が比べた。",flag("shared_sky")),
      pick("井戸の使用順に使う","S7 W-3","井戸を使う順番を日射で知らせた。",flag("assembly")),
      pick("祭日の計算を見直す","C7 K-3","一部の祭日が井戸に日が入る時期へ移った。",flag("river_calendar"))]),
    shock("old_quay_fire",1,6,"帆布倉からの延焼","夜半に帆布倉から火が出て、風下の二つの荷揚げ場が焼失した。","calamity","ordinary","W-14 C-5",[
      pick("荷揚げを別の岸に移す","W7 S-4","対岸で暫定の荷揚げが始まった。",flag("accord")),
      pick("焼け残った倉を共有する","S7 W-5","共同の保管場所が臨時に使われた。",flag("public_store")),
      pick("港の修繕を市場で募る","W6 C-4","商人が荷揚げ場の再建に資金を出した。",flag("guild_credit"))],{protections:[protect("night_patrol","W5")],scar:"harbour_scar"}),
    shock("deep_river_flood",1,6,"二つの流路が重なる","山の水と大河の増水が重なり、低地の作物と倉の大半が水をかぶった。","calamity","major","W-28 S-15",[
      pick("高台の倉から配給を始める","S10 W-5","高台の倉が被災した地区へ穀物を送った。",flag("mutual_grain")),
      pick("近隣の船の便を借りる","W9 P-5","避難者と道具を船で運んだ。",flag("accord")),
      pick("使えない水路を閉じる","S7 C-5","壊れた水路を閉じて新しい流れを記録した。",flag("canals"))],{protections:[protect("granary","W8"),protect("canals","W5 S6")],scar:"flood_scar"}),
    define("quay_rebuilding",1,6,"黒くなった岸壁の再建","荷揚げ場の被害を受け、港を同じ場所に戻すか、別の岸に分散させるか決める。",{...needs("harbour_scar"),fromEra:1,priority:3.2},[
      pick("二つの岸に荷揚げを分ける","W11 P-6","港の荷揚げを二岸へ分けて再開した。",{revoke:["harbour_scar"],flags:["accord"],reconstruction:"二岸に分散して港を再開"}),
      pick("共同の費用で別の倉を建てる","S9 W-6","代わりの倉ができ、荷の受け入れが戻った。",{revoke:["harbour_scar"],flags:["guild_credit"],reconstruction:"共同基金で倉を再建"}),
      pick("港の外の市場を維持する","W7 S-4","港の代わりに陸の市場が使われ続けた。",flag("roads"))]),
    shock("sealed_river_clay",1,7,"河床から出た粘土板","渇水で川底が露出し、失われた古い町の粘土板がまとまって見つかった。","fortune","ordinary","K8 C3",[
      pick("複数の読み手に写しを渡す","K7 W-5","読み手がそれぞれ粘土板の写しを調べた。",flag("script")),
      pick("町の資料館で公開する","C8 W-4","粘土板を市民が見られる場所に置いた。",flag("patronage_archive")),
      pick("持ち主を探していったん保管する","S7 C-3","資料は持ち主を確認する間、別の倉へ移された。",flag("audits"))]),
    shock("glass_maker",1,7,"溶け残った透明な粒","工房のガラス職人ニラが焼き損じた器を片付けると、部屋に落ちた光を丸い粒が集めていた。","fortune","ordinary","K8",[
      pick("光が集まる距離を記録する","K8 W-4","ニラが透明な粒の厚さと光の距離を比べた。",flag("open_data")),
      pick("小さな飾りとして売りに出す","W8 K-3","透明な粒が装飾に使われた。",flag("market")),
      pick("天体を読む学舎に預ける","C7 W-4","粒を扱う実習が学舎に設けられた。",flag("academy"))],{person:person("ニラ","ガラス職人・発明家")}),
    shock("law_traveller",1,7,"旅の仲裁人","旅をするテオが訪れ、訴えを口頭だけで扱う都市でも紙の記録を使えると唱え始めた。","ambiguous","ordinary","C6 S-4",[
      pick("最初の審理をテオと試す","S8 W-4","テオと書記が審理の記録を別の町にも伝えた。",flag("civic_law")),
      pick("いくつかの地区だけを試す","C7 P-3","地区によって口頭と書面の審理を使い分けた。",{tags:["local_first"]}),
      pick("公開の討論会として招く","C8 W-4","裁定制度を変えず、広場で論を聞く会を開いた。",flag("public_readers"))],{person:person("テオ","旅の思想家・仲裁人")}),
    // 中世
    define("sealed_offices",2,0,"役所の鍵を預かる者","役所を引き継ぐ際、以前の担当者が部屋の鍵を返さず、台帳が読めなくなった。",{},[
      pick("台帳を二か所に預ける","S7 W-4","台帳の写しが二つの役所へ分けられた。",flag("audits")), pick("失われた記録だけを調べ直す","K6 W-4","各地区の記録を集めて台帳を補った。",flag("open_data")), pick("地元に鍵を管理させる","C6 S-3","文書の鍵は地域の会議が管理した。",{tags:["local_first"]})]),
    define("emergency_meeting",2,0,"代表が届くまで","遠方の地区が到着する前に決めた議事を有効とするか、持ち回り会議で異議が出た。",needs("responsive_council"),[
      pick("仮決定に期限を設ける","S8 W-4","全代表が再承認する期限が決められた。",flag("audits")), pick("臨時の議長が決める","P7 C-4","議長が緊急時に執行できるようになった。",{tags:["controlled_tech"]}), pick("各地区が個別に対応する","C7 S-4","地区がそれぞれ実施の時期を決めた。",flag("regional_bargain"))]),
    define("citadel_preferences",2,0,"壁の内の裁判","城壁内の役人は、郊外の商いも壁内の法廷で扱う案を出した。",{},[
      pick("郊外にも巡回法廷を出す","S7 W-4","郊外でも定期的に審理が行われた。",flag("civic_law")), pick("商事だけ専用の法廷にする","W7 C-4","商品取引の案件が専用の窓口に集まった。",flag("trade_court")), pick("地区の慣習で扱う","C7 P-4","郊外の地区は独自の手続きで裁いた。",{tags:["local_first"]})]),
    define("registrar_eira",2,0,"記録係エイラの異議","記録係のエイラが、同じ違反で納める罰金が地域ごとに違うと会議で指摘した。",trait("estates"),[
      pick("罰金の異議を公開審理にする","S8 W-5","エイラが記録した不服を公開法廷が扱った。",flag("civic_law")), pick("各領の罰金を併記する","K7 W-4","記録で地域ごとの負担額を比較できるようにした。",flag("audits")), pick("領有権に合わせた制度を維持する","P7 C-5","異議は従来の領主の扱いに戻った。",{tags:["estates"]})],{person:person("エイラ","記録係・改革者")}),
    define("ocean_pilots",2,1,"島の水先案内","島の航路記録を持つ舟が増えた。暗礁のある航路を誰に教えるか、舟の持ち主が話し合った。",{...needs("island_guide"),priority:1.55},[
      pick("各国の舟が学べる工房を開く","K7 W-4","共同で水先案内を学べる工房ができた。",flag("navigator_school","accord")), pick("自国の舟の案内を優先する","P7 C-4","自国の輸送船へ優先して水先案内がついた。",{tags:["isolation"]}), pick("対岸と航路ごとに分担する","W7 P-4","両方の岸の舟が別の航路の案内を担当した。",flag("accord"))]),
    define("winter_hostages",2,1,"冬を共に過ごす代表","雪で閉じる峠の合意を守るため、双方が代表を相手の街に滞在させる案が出た。",{},[
      pick("双方の旅費を折半する","S8 W-5","代表は冬の間、互いの宿に滞在した。",flag("accord")), pick("商人が伝文だけを預かる","W7 C-4","代表を派遣せず、商家が文書を運んだ。",flag("market")), pick("道の修繕を先に共同で進める","K7 W-4","雪が解けたときの補修範囲が定められた。",flag("roads"))]),
    define("quartermaster_sana",2,1,"倉を開けた補給官","補給官サナが、峠の古い倉を開き、商人と兵が互いに荷を融通できると示した。",needs("army"),[
      pick("倉を両者で監査する","S7 P-4","サナが商人と兵の共同監査を始めた。",flag("audits")), pick("補給官の権限で保管をまとめる","P9 W-5","補給官が峠の複数の倉の運用を引き受けた。",{tags:["military_rule"]}), pick("倉の空き枠を取引に回す","W8 C-4","平時の空き枠が隊商に貸し出された。",flag("roads"))],{person:person("サナ","補給官")}),
    define("asynchronous_fairs",2,2,"すれ違う市の日","新しい街道沿いの市が同じ日になり、出店者が続けて売れないと訴えた。",{},[
      pick("市の日を互いにずらす","W8 S-4","この市の後に次の町へ移れる日程になった。",flag("market")), pick("出店場所を街道沿いに分ける","C7 W-4","街道沿いに市がいくつか分かれた。",flag("roads")), pick("小売の札を地区ごとにする","S7 C-4","札の有効範囲は地区ごとになった。",{tags:["local_first"]})]),
    define("letters_of_credit",2,2,"峠を越える信用状","古い信用札を使ってきた店が、同じ金額を別の町でも支払える証書を試したいという。",needs("credit_letters"),[
      pick("複数の町で証書を清算する","W9 S-4","証書の残高を複数の町で相殺した。",flag("guild_credit")), pick("不払いを共同の法廷で審理する","S7 W-4","支払いに異議のある証書は同じ法廷が審理した。",flag("trade_court")), pick("引き換えは発行した町だけにする","S6 W-3","証書の交換先は発行した町に限定された。",{tags:["isolation"]})]),
    define("cloth_orders",2,2,"布商の共同注文","染料の仕入れ組合が、同じ寸法の注文を複数の工房に分ける方法を提案した。",needs("textile_brokers"),[
      pick("小さな工房にも注文を回す","W8 S-4","注文を受けた工房が寸法表を共有した。",flag("guild_credit")), pick("上質品だけ別に受注する","C8 W-4","上質品は異なる模様で販売された。",flag("patronage_archive")), pick("納品の検査をまとめる","K7 W-4","色と寸法の検査所が開いた。",flag("neutral_testing"))]),
    define("ballad_caravan",2,3,"旅芸人が持ち出した写本","ミラの詩の写本が旅芸人の荷に入り、祭りのたびに違う町で朗読された。",{...needs("ballad_archive"),priority:1.8},[
      pick("複数の町で同じ詩集を印行する","C8 W-5","詩集が写本の町を越えて読み継がれた。",flag("shared_edition")), pick("地元の言葉だけで歌う","C7 S-4","町ごとに詩を歌い直す習慣になった。",flag("tales")), pick("興行の契約書をまとめる","W8 C-4","詩の公演は旅行する一座の契約になった。",flag("trade_court"))],{person:person("ミラ","詩人・渡し守","作品の継承")}),
    define("looms_for_apprentices",2,3,"職人の見習い証","見習いの技術が町の外で認められず、旅をして仕事を覚えにくくなっている。",needs("apprentice_charter"),[
      pick("町を越えて通用する証を出す","K8 W-4","見習いが別の町でも仕事を学べるようになった。",flag("neutral_testing")), pick("工房が独自に腕前を証明する","W7 C-4","工房の推薦状が同行に使われた。",{tags:["merit"]}), pick("見習いの宿を学舎が引き受ける","C7 W-4","学舎が旅の見習いに宿を出した。",flag("academy"))]),
    define("scribe_ren",2,3,"仕事をやめた写字生","写字生レンが図書の保管にたずさわる人の報酬を見直すため、同じ職の人を集めた。",{},[
      pick("保管と写本の費用を共同で負う","C8 W-5","レンらが目録と報酬の共同契約を作った。",flag("patronage_archive")), pick("安い写しを市場に出す","W8 C-4","写字工房が安価な写しを販売した。",flag("market")), pick("資料を学舎に寄進する","K8 W-4","資料をもとに写字生の授業が始まった。",flag("academy"))],{person:person("レン","写字生・芸術家")}),
    define("painted_city_map",2,3,"職人の描く町の絵","屋台や橋を描いた街の絵が、初めて来た訪問者にもよく売れた。",{},[
      pick("橋の補修の案内に使う","S7 W-3","橋の通れる日が絵と一緒に広場に置かれた。",flag("roads")), pick("商会が案内図を販売する","W8 C-4","市場で名所と宿を載せた図が売られた。",flag("market")), pick("子どもが町の変化を描く","C8 W-4","学舎が通りの変化を絵に残した。",flag("patronage_archive"))]),
    define("calendar_hosts",2,4,"祭日を迎える宿の規約","街道の祭日暦を使う町が増え、同じ旅人を順に迎える宿ごとの負担を決めなければならない。",{...needs("river_calendar"),priority:1.8},[
      pick("旅人の費用を宿同士で分ける","C8 W-5","祭礼の日に宿を助け合う規約ができた。",flag("festival_hosts")), pick("古い誓いの読み方をそろえる","S7 C-4","宿が誓いを読む順番を共通にした。",{tags:["state_faith"]}), pick("広場の祭りだけを共有する","C7 W-4","祭りを共有しながら、宿は個別に運営した。",flag("river_calendar"))]),
    define("courtyard_disputes",2,4,"祭場に重なる礼拝","同じ広場の隣で違う時刻に礼拝があり、祭りの音を抑えるよう要請が出た。",trait("polytheism","monotheism"),[
      pick("時刻を分けて場所を共有する","S8 W-4","各団体が違う時刻に広場を使う協定を結んだ。",flag("ritual_treaty")), pick("別々の入口を整える","C8 W-5","双方の礼拝所に別の入口が作られた。",{tags:["local_first"]}), pick("地区外の礼拝も交代で招く","C9 S-5","複数の習慣を公開する日を設けた。",{tags:["polytheism"]})]),
    define("travelling_mentor",2,4,"薬草帳を携えた説教師","旅の説教師ナマが学舎をめぐり、体調を記した帳面を祭礼所にも置きたいと申し出た。",{},[
      pick("救護と記録を兼ねる場を設ける","S8 K3 W-6","祭礼所に救護と記録の窓口が開いた。",flag("temple_schools","epidemic_records")), pick("ナマに地方へ教えを伝えてもらう","C8 W-5","ナマの教えは旅の道沿いの町に伝わった。",{tags:["research_faith"]}), pick("公の学舎だけで記録を扱う","K8 C-4","症状の記録は学舎の書架に集められた。",flag("academy"))],{person:person("ナマ","説教師・宗教指導者")}),
    define("millwrights_council",2,5,"水車の軸を持ち寄る会","古い分銅の工房記録を読んだ職人が、村ごとに動きの違う水車の軸を比較した。",{...needs("geared_weights"),priority:1.8},[
      pick("交換できる軸を規格帳にする","K8 W-5","水車職人は交換部品の寸法を規格帳に記した。",flag("millwrights")), pick("村ごとの流速に合わせる","K7 C-4","水車は川ごとに異なる形で改良された。",flag("open_data")), pick("図面を注文のある工房に売る","W8 K-4","水車の図面を工房間で取引した。",flag("guild_credit"))]),
    define("aligned_magnets",2,5,"箱の中の方位石","港で使う方位石が、別の箱に入れると違う向きを指すという報告が出た。",{},[
      pick("箱と石を別に試験する","K8 W-5","箱と石を一つずつ交換して結果を比べた。",flag("neutral_testing")), pick("舟の案内に地元の標を使う","S7 P-4","方位石以外の目印も航路へ記された。",flag("accord")), pick("輸出向けの箱の工房を開く","W8 C-4","方位石の箱が港から出荷された。",flag("market"))]),
    define("written_recipes",2,5,"同じ釉薬を試す","工房が残した釉薬の記録を見比べると、使う温度と容器が町ごとに違った。",{},[
      pick("条件も書いた記録を交換する","K8 W-4","温度と容器を含めた記録が工房で読まれた。",flag("open_data")), pick("町ごとの器を交換市場に出す","W8 C-4","違う色の器を町ごとの品として流通させた。",flag("market")), pick("学舎で作り方を再現する","K7 W-3","地元の工房が学舎の実習に協力した。",flag("academy"))]),
    shock("pass_landslide",2,6,"山道の消えた朝","未明に斜面が崩れ、谷を越える荷の街道と宿が土に埋まった。","calamity","major","W-24 P-12 S-10",[
      pick("反対の谷から救援を回す","S9 W-5","旅人と荷を反対側の谷へ退避させた。",flag("accord")), pick("村の道を暫定路として借りる","W8 P-5","村の細い道を使って輸送が再開した。",flag("roads")), pick("崩れた地形を測る","K8 W-5","谷の変化と別の路線の候補を記録した。",flag("open_data"))],{protections:[protect("roads","W6"),protect("mutual_grain","W5 S3")],scar:"route_scar"}),
    shock("pestilence_crossing",2,6,"旅路を横切った流行","停留地の利用者に同じ病が相次ぎ、宿が閉じて交易と連絡が途絶えた。","calamity","ordinary","W-15 S-10",[
      pick("療養に使える宿を貸し切る","S8 W-5","営業を止めた宿に休養の場所を確保した。",flag("epidemic_records")),
      pick("必需品の取引便だけを続ける","W7 S-6","生活に必要な荷の便に限って取引が続いた。",flag("mutual_grain")),
      pick("複数の地区の状況を記録する","K8 W-4","地区ごとに休業期間と支援の記録を集めた。",flag("epidemic_records"))],{protections:[protect("epidemic_records","S4"),protect("temple_schools","W4")]}),
    define("ravine_recovery",2,6,"山越えの積み替え所","崩れた街道を無理に戻さず、荷を別の場所で積み替える道を整える案が出た。",{...needs("route_scar"),fromEra:2,priority:3.3},[
      pick("尾根を避ける通路をつなぐ","W11 P-6","谷を避ける輸送路を開いた。",{flags:["roads","alpine_fund"],revoke:["route_scar"],reconstruction:"崩れた谷を避けて輸送を再開"}), pick("村の負担を共同基金で支える","S9 W-4","復旧する村へ共同基金から補助が届いた。",{flags:["alpine_fund"],revoke:["route_scar"],reconstruction:"被害を受けた村の補修費を共同で負担"}), pick("商会に代替路を委ねる","W7 C-4","商会が別の道の管理を引き受けた。",flag("trade_court"))]),
    shock("lost_market_year",2,7,"市場表が偶然そろった年","別々に出発した遠方の隊商が同じ週に到着し、長く品切れだった荷が出揃った。","fortune","ordinary","W12 C4",[
      pick("三つの市で共同の取引会を開く","W8 S-5","隊商の商談会が定期契約に育った。",flag("market","accord")), pick("学舎が荷と原料を調べる","K8 W-4","初めて扱う原料が学舎に記録された。",flag("open_data")), pick("貯蔵所を安く貸す","S7 W-3","商人の荷の保管料を一定期間引き下げた。",flag("public_store"))]),
    shock("hill_bells_ruins",2,7,"鐘楼の下の石室","鐘楼を修理する途中、古い遺跡に通じる部屋が見つかり、読めない記号の石板が現れた。","ambiguous","ordinary","C8 W-3",[
      pick("地元の書き手と測量人を招く","K8 W-5","石室の寸法と記号を測り直した。",flag("open_data")), pick("公開の祭場を地上に設ける","C8 S-4","遺跡の入口を守ったまま祭場が開かれた。",flag("festival_hosts")), pick("保管費を来訪者の案内料で払う","W8 C-4","来訪者向けの案内が始まった。",flag("patronage_archive"))]),
    shock("anonymous_commentary",2,7,"作者のない注釈","各地に送られた写本に、土地を持たない人でも議論に加われるとする注釈が紛れていた。","ambiguous","ordinary","C8 S-5",[
      pick("注釈と原本を並べて読ませる","C7 W-4","書店と学舎で双方の文が読まれた。",flag("public_readers")), pick("地方の代表の議題にする","S7 P-4","町ごとに注釈の扱いを議題にした。",flag("responsive_council")), pick("原本の管理を学舎に限定する","K7 C-4","学舎が写本の由来を照合した。",{tags:["controlled_tech"]})]),
    // 近代
    define("district_ballot_rolls",3,0,"転居者の投票資格","工場や鉄道へ移った世帯を、元の町と新しい町のどちらの名簿に置くかが争点になった。",trait("local_first"),[
      pick("州をまたぐ住所の確認手順を作る","S8 W-5","州の事務局が名簿を相互に確認した。",flag("local_ballot")), pick("工場地区で先に集会を開く","C8 S-4","移住者の多い地区で新しい投票資格が検討された。",flag("civic_law")), pick("移動前の資格を維持する","S7 C-4","旧住所がしばらく投票の基準になった。",{tags:["local_first"]})]),
    define("patent_notebooks",3,0,"工房と発明者の証書","発明者が工房を移る際、記録を誰が持ち出せるのか雇い主と役所が争った。",{},[
      pick("発明者の登録と使用許諾を分ける","K8 W-5","発明者の名と使用権を別々に登録した。",flag("civic_law")), pick("工房同士で訴えを審理する","W8 C-4","工房の契約を商事法廷が扱った。",flag("trade_court")), pick("公費の成果を公開する","K8 S-4","公費の研究記録だけは誰でも閲覧できた。",flag("open_data"))]),
    define("readers_petition",3,0,"詩の朗読会が持ち込んだ請願","ミラの詩を読む会が町を越えて連携し、代表を選ぶ規則を変更する請願を持ち込んだ。",{...needs("shared_edition"),fromEra:3,priority:3.25,ages:{shared_edition:6}},[
      pick("公開審理から選挙法を見直す","C8 W-6","朗読会が提出した請願を公開で審理した。",flag("civic_readings","civic_law")), pick("暫定会議を調停に招く","C9 S-7","朗読会の一部が暫定の代表会議を開き、選挙法の改正案を出した。",flag("civic_readings","revolution")), pick("朗読会への助成だけを行う","C8 W-4","朗読会は続いたが、代表の規則は変わらなかった。",flag("public_readers"))],{person:person("ミラ","詩人・渡し守","作品が改革請願に引用される")}),
    define("infrastructure_directors",3,0,"運送会社の取締役席","企業連合の下で遠方の路線が縮小され、取締役会に地方の席を渡す案が出た。",{...trait("corporate_rule"),fromEra:3},[
      pick("地方代表が路線の配分に加わる","S8 W-5","遠方の路線を持つ代表が役員会議に加わった。",flag("regional_bargain")), pick("運賃だけを公開監査にかける","K7 W-5","路線の判断は企業に残り、運賃の決め方が公表された。",flag("audits")), pick("経営側の投資判断に委ねる","W8 C-5","利益の小さい路線へ配る予算が減った。",flag("industry"))]),
    define("navigator_exchange",3,1,"同じ海図の練習航海","島の工房が育てた水先案内人から、隣国の舟と合同で航路を確かめる提案が来た。",{...needs("navigator_school"),priority:2.1},[
      pick("海図を双方の船に配る","K8 P-4","両国の船が新しい海図で合同航海を行った。",flag("accord","shared_sky")), pick("救援の寄港だけを共同化する","S8 W-5","遭難時の入港を双方で認めた。",flag("rescue_trade")), pick("航路を測る器具を販売する","W8 C-4","合同航海の器具が他国の港で売られた。",flag("market"))]),
    define("arms_budget_signature",3,1,"兵站費に必要な印","議会が常設軍の追加予算を止めた。保安上、誰が帳簿を読めるのかを軍と議員が争っている。",{...needs("army","civic_law"),weight:2.3},[
      pick("非公開審査と公開決算を分ける","S8 W-5","議会が非公開に審査し、総額を公開できる手続きにした。",flag("civilian_command")), pick("補給を地区ごとの契約にする","W8 P-5","補給路ごとに自治体が契約窓口を持った。",flag("regional_compact")), pick("臨時の軍予算を承認する","P9 S-5","限られた期間だけ追加予算を軍が執行した。",{tags:["military_rule"]})]),
    define("language_pact",3,1,"条約の翻訳は二冊","同じ条約を二つの言葉で読んだところ、関税の解釈が違っていた。どちらの文も署名済みだ。",needs("border_languages"),[
      pick("両言語の合同審理を始める","S8 W-5","双方の文書を同時に扱う合同法廷を開いた。",flag("accord","civic_law")), pick("通商条項だけを取り直す","W8 C-5","問題の品目についてだけ新しい税率を採用した。",flag("trade_court")), pick("共同翻訳の実習をつくる","C8 W-5","国外の書記も参加する通訳の学舎ができた。",flag("academy"))]),
    define("late_wages",3,2,"給金が工場に届かない","工場は注文を受けているが、受渡しの遅れで働く人の給金が止まった。",{},[
      pick("工場同士で短期の立替をする","W8 S-5","工場間で給金を先払いする仕組みができた。",flag("guild_credit")), pick("給金の支払い順を公開する","S8 W-5","支払いの順と期日を監査できるようにした。",flag("audits")), pick("職場の代表に交渉を任せる","C8 W-4","職場ごとに給金の交渉窓口が常設された。",flag("labor_contract"))]),
    define("repair_market",3,2,"部品だけを買える市場","使えなくなった機械を捨てずに部品を交換する工房が増え、修理部品の取引を定める。",{},[
      pick("互換部品の取引を開く","W8 S-5","修理部品だけを扱う市場が開いた。",flag("industry")), pick("修理手順を記録する","K8 W-4","異なる機械の修理手順を工房が共有した。",flag("open_data")), pick("修理の保証を制度にする","S8 W-4","契約書に修理の保証が記された。",flag("trade_court"))]),
    define("merchant_iloa",3,2,"商人イロアの期限つき融資","商人イロアが複数の小さな工房を支える期限つき融資を提案した。支払う側も彼女に経営権を求められる。",trait("merchant_rule"),[
      pick("出資と経営の審査を分ける","S8 W-5","工房が別の監査人を任命できる融資になった。",flag("guild_credit","audits")), pick("商館に経営の議決権を認める","W9 C-6","イロアの商館が共同出資と経営の場に入った。",flag("private_clearing")), pick("小規模な自治金融に切り替える","C8 W-5","地区ごとの基金が期限つき融資を引き受けた。",flag("pension"))],{person:person("イロア","商人・金融事業家")}),
    define("artist_rented_stages",3,3,"家賃の上がった舞台","駅前の劇場が人気を集め、古くからの小劇団が会場の家賃を払えなくなった。",{},[
      pick("安く借りられる時間を設ける","C8 W-5","劇場が小劇団用の公演枠を作った。",flag("patronage_archive")), pick("収入に合わせて出番を割り当てる","W8 C-5","劇場は観客数に応じた出演契約を結んだ。",flag("market")), pick("駅の貨物館を別の舞台にする","C8 P-4","使われない時間の貨物館で芝居が行われた。",flag("public_readers"))]),
    define("untranslated_plays",3,3,"旅役者の長い字幕","隣国へ送った上演が、方言の含まれる台詞で理解されにくかった。",needs("border_languages"),[
      pick("地元の役者と訳文を直す","C8 W-5","国外の役者も参加した上演台本が作られた。",flag("public_readers")), pick("台詞を標準語で書き直す","C9 S-5","共通語で演じる上演版ができた。",flag("official_medium")), pick("歌だけで伝わる演目にする","C7 K-4","言葉を使わず歌と動作で上演した。",flag("patronage_archive"))]),
    define("school_open_sunday",3,3,"日曜の公開講義","学校の授業を働く人にも聞けるよう、休日の教室を借りたいという申請が届いた。",{},[
      pick("講義と技術実習を公開する","K8 W-5","休日の教室で公開講義と実習が始まった。",flag("academy")), pick("町の聞き書きを残す","C8 W-5","町の仕事や暮らしが授業で記録された。",flag("public_readers")), pick("資格講義だけで教室を使う","W8 C-5","教室は職場で要る資格の講義に貸された。",{tags:["merit"]})]),
    define("ballad_yards",3,3,"詩集を囲む工場の中庭","かつて都市を巡った詩集の朗読が、別々の職場にも伝わった。印刷を支える組織が要る。",needs("shared_edition"),[
      pick("共同で安い版を印行する","C9 W-5","工場と市の共同出資で安価な版が出た。",flag("press","public_readers")), pick("地元の版をそれぞれ続ける","C8 S-4","町ごとの詩の朗読が続いた。",{tags:["local_first"]}), pick("詩を仕事の合図に編み直す","S8 C-5","朗読で使った節が作業の合図に変わった。",{tags:["collective"]})]),
    define("river_pilgrim_congress",3,4,"灯籠の町の代表会議","祭礼宿の規約を使う町が遠くまで増え、異なる習慣を持つ町も次の代表会議への参加を求めている。",{...needs("festival_hosts"),priority:3.05,ages:{festival_hosts:6}},[
      pick("祭りの連絡会を作る","C9 W-6","異なる町の代表で常設の連絡会ができた。",flag("festival_assembly")), pick("宿と祭りの管理を分ける","S8 W-5","宿の規約を共通にし、祭りは町に任せた。",flag("ritual_treaty")), pick("最初の町でだけ祭りを続ける","C7 S-4","灯籠の日は原郷の町にのみ残った。",{tags:["local_first"]})]),
    define("older_prayer_print",3,4,"写し直された祈りの本","印刷された祈りの本で、原本にない言葉が見つかった。学舎と宗教団体はどの版を配るか議論した。",needs("press"),[
      pick("原典と異説を一冊に収める","K8 W-5","異なる読み方を並べて刊行した。",{tags:["research_faith"]}), pick("共通の礼拝版だけを公認する","S8 C-5","公の礼拝で読む文章をそろえた。",{tags:["state_faith"]}), pick("地区が自由に刷る","C8 S-4","各地区の版が引き続き印刷された。",flag("ritual_treaty"))]),
    define("province_faith_funds",3,4,"州が持つ礼拝費","地方財政に礼拝所の維持費が含まれ、住民の信仰と州の支出の間に隔たりが出ている。",trait("state_faith","local_first"),[
      pick("礼拝と公共の会計を分ける","S8 W-5","礼拝所に使う会計が別に公開された。",flag("secular_jurisdiction")), pick("複数の信仰の窓口を置く","C8 W-5","州の支援に複数の団体が申請できるようになった。",flag("ritual_treaty")), pick("地区が会計を個別に扱う","S7 C-4","支援手順が地区の判断に戻った。",flag("regional_bargain"))]),
    define("interchangeable_loom",3,5,"水車の規格帳から織機工場へ","昔の水車の規格帳を読んだ機械工が、織機の複数の部品も交換できると気づいた。",{...needs("millwrights"),priority:3.25,ages:{millwrights:6}},[
      pick("交換部品で織機を量産する","W9 K6 C-6","水車の軸から始まった規格が織機の量産に使われ、産業が広がった。",flag("loom_industry","industry")), pick("規格を工業学校で教える","K9 W-6","学校に部品の互換性を教える工房ができた。",flag("academy")), pick("古い道具を活かして注文生産する","C8 W-5","工房は新しい規格を小規模な注文だけに使った。",flag("patronage_archive"))]),
    define("bridge_trial_loads",3,5,"二台の重り車","新しい橋の試験で設計者と利用者が、異なる荷重の条件を要求した。",{},[
      pick("条件を変えて二度試す","K8 W-5","軽荷と重荷の両方で試験が行われた。",flag("neutral_testing")), pick("荷を小分けにして早く開通する","W8 P-4","一度に通れる荷を制限して通行を始めた。",flag("roads")), pick("試験記録を沿道に公開する","S8 W-4","通行前に試験結果が沿道の掲示板に出た。",flag("open_data"))]),
    define("observation_restart",3,5,"予測表の空欄","観測所で以前の数値が欠けていることが判明し、補った値を実測と一緒に使えるか問われた。",{},[
      pick("空欄を明記して刊行する","K8 W-4","予測表で実測と推定を区別した。",flag("audit_research")), pick("現地の観測を追加で委託する","K7 W-5","複数の町が空欄の時期を改めて測った。",flag("shared_sky")), pick("補った表を商品として使う","W8 K-4","用途を限定して補完済みの表を販売した。",flag("market"))]),
    shock("modern_epidemic",3,6,"海港に広がった流行","数港で同じ時期に病が広がり、客船と労働の往来が突然途絶えた。","calamity","ordinary","W-17 S-11",[
      pick("公の施設を休養に開く","S8 W-5","公の施設で休養できる場所を確保した。",flag("epidemic_records")),
      pick("生活に必要な輸送を残す","W7 S-7","生活物資の輸送だけを確保した。",flag("mutual_grain")),
      pick("港と街道の連絡を公開する","C7 W-4","連絡の届かない地区へ運航状況を伝えた。",flag("audits")),
      pick("研究機関に観察と対応を委ねる","K9 W-5","研究評議会が療養施設からの記録を照合した。",{when:trait("technocracy"),flags:["epidemic_records","open_data"]}),
      pick("宗教組織の宿と炊き出しを使う","S9 C3 W-6","祭礼所が療養用の宿と食事を用意した。",{when:trait("theocracy"),flags:["temple_schools"]}),
      pick("商会に供給を任せ港を分けて運用する","W8 S-5","商会が荷と客の使う埠頭を分けた。",{when:trait("merchant_rule"),flags:["rescue_trade"]}),
      pick("軍が街道の移動枠を管理する","S9 P-6","補給を残しながら軍が移動枠を管理した。",{when:trait("military_rule"),flags:["civilian_command"]}),
      pick("州の窓口が個別に対策を決める","C8 S-5","各州が地元に合わせて宿と交通を手配した。",{when:trait("federal_rule"),flags:["regional_compact"]}),
      pick("予測結果を人間の審査にも渡す","K8 S-4","演算結果を現場と人間の会議で確認した。",{when:trait("algorithmic"),flags:["human_oversight"]}),
    ],{protections:[protect("epidemic_records","S5"),protect("mutual_grain","W5")],scheduling:{fromEra:3}}),
    shock("foundry_explosion",3,6,"鋳造地区の大火","夕刻に炉が破損し、風に乗った火が工場と周囲の倉を焼いた。","calamity","major","W-31 P-10 K-7",[
      pick("操業を分散して他の工房に頼む","W9 P-6","生産を複数の遠い工房へ移した。",flag("guild_credit")), pick("被災した区画に共同の資金を出す","S9 W-5","近隣の工房が被災区の生活と補修を支援した。",flag("pension")), pick("破損の経緯を調査して記録する","K9 W-6","再開前に炉と設備の記録がまとめられた。",flag("audit_research"))],{protections:[protect("neutral_testing","K5"),protect("pension","W10")],scar:"harbour_scar"}),
    define("modern_embankments",3,6,"古い流域を取り戻す","川筋が変わった地域で、かつての畑と移転先をどう結び直すか決める。",{...needs("flood_scar"),fromEra:2,priority:3.1},[
      pick("高台と畑をつなぐ路線を造る","W10 P-5","元の耕地と移転した住まいを別の道で結んだ。",{flags:["roads"],revoke:["flood_scar"],reconstruction:"高台と旧耕地を結ぶ生活路を再建"}), pick("元の集落を段階的に戻す","S9 W-6","水位を測りながら住まいが順に戻った。",{revoke:["flood_scar"],reconstruction:"浸水した集落を段階的に復旧"}), pick("跡地を水の観測区域にする","K9 W-5","古い山水の流れを記す観測区域が開いた。",flag("open_data"))]),
    shock("unexpected_rubber_lot",3,7,"寄港しなかった積み荷","遠洋の船が予定外の港へ寄り、工場が入手できなかった原料を売りに出した。","fortune","ordinary","W14 K4",[
      pick("短期の購入を長期の供給契約にする","W8 S-5","船主と工場が定期の供給契約を結んだ。",flag("accord")), pick("少量を複数の研究所で試す","K9 W-5","各研究所が新しい原料の性質を測った。",flag("neutral_testing")), pick("港の市へ小分けして卸す","W8 C-5","港の小工房も原料を購入できた。",flag("market"))]),
    shock("exile_printrooms",3,7,"国境を越えてきた印刷工","遠い国の印刷工が急に移住し、町で見たことのない活字と政治の論説を携えてきた。","ambiguous","ordinary","C9 S-6",[
      pick("工房を貸して共同版を刷る","C8 W-5","移住者と地元の工房が新しい文章を共同で刷った。",flag("press","public_readers")), pick("技術の実習だけを受け入れる","K8 W-5","印刷技術が地元の見習いに教えられた。",flag("academy")), pick("州へ受け入れの裁量を渡す","S8 C-4","滞在地ごとに工房の認定を行った。",flag("regional_bargain"))]),
    shock("premier_sudden_death",3,7,"調印を待たずに空いた執行席","各国との調整を担っていた首席交渉官ユンが急死し、署名文書の引き継ぎが止まった。","calamity","major","S-18 C-7",[
      pick("暫定の代表会合で文書を引き継ぐ","S9 W-5","代表会合が条項ごとの引き継ぎに着手した。",flag("audits")), pick("当面は地方の窓口を残す","C8 P-5","地方ごとの窓口が連絡を続けた。",flag("regional_compact")), pick("補給官へ執行権を移す案を出す","P9 S-6","補給官が代表への移管案を提出した。",{tags:["military_rule"]})],
      {person:person("ユン","首席交渉官","死去"),protections:[protect("civilian_command","S7")],
        disruptions:[jeopardy("conquest","union_terms","union_delay","交渉官の死去で留保権の確認と署名が失効した","audits")]}),
    // 未来
    define("appeal_windows",4,0,"演算機の異議受付","名前を読み違えた演算記録のせいで、予算の順を変えられた自治体が審査を求めた。",trait("algorithmic"),[
      pick("自治体と人間の再審を常設する","S9 W-6","自治体ごとに出せる再審の窓口ができた。",flag("human_oversight")), pick("解釈違いだけを再計算する","K8 S-5","資料の読取りが争われた件だけを再計算する。",flag("audit_research")), pick("評価の目安を地方へ委ねる","C8 P-5","各地区が評価の目安を別々に定めた。",flag("regional_compact"))]),
    define("interim_successor",4,0,"調印文書の引継ぎ","交渉が中断している間に、複数の言葉で書かれた合意文書の扱いを決め直す。",needs("union_delay","border_languages"),[
      pick("翻訳者に食い違いを公開させる","C8 W-6","翻訳者が争点ごとの異なる解釈を公開した。",flag("audits")), pick("暫定の代表が各国を訪ねる","S8 P-5","暫定代表が口頭で各国の意向を確認した。",flag("accord")), pick("取引条項だけを先に使う","W9 S-5","署名の済んだ取引条項を先行して施行した。",flag("trade_court"))]),
    define("citizen_ledgers",4,0,"公共台帳の読み手","登録された住民以外にも公的な統計を読ませるよう、図書館や記録係が申し入れた。",{},[
      pick("個人の情報を除いて公開する","K8 W-5","個人の欄を見せずに統計を公開した。",flag("open_data")), pick("図書館で閲覧を補助する","C8 W-5","図書館に検索と説明を助ける係が置かれた。",flag("academy")), pick("照会を地方窓口に任せる","S8 K-5","住民が近くの窓口で台帳を照会できた。",{tags:["local_first"]})]),
    define("forestry_citizenship",4,0,"保全地を運営する住民票","保全地に季節ごとに住む人も管理会議に参加すべきか、住民との間で議論になった。",{},[
      pick("滞在者の席を会議に作る","C8 W-5","季節滞在者が保全地の管理会議に議席を持った。",flag("local_ballot")), pick("現場の任務ごとに意見を求める","S8 K-5","保全の仕事を担う人が任務別に会議へ参加した。",{tags:["merit"]}), pick("土地の古い慣習を確認する","S8 C-5","管理会議は従来の地元の取決めを併記した。",{governance:"custom"})]),
    define("customs_corridor",4,1,"一枚の通行証で通る回廊","複数の国を横切る貨物便で、どの国の危険物検査を相互に認めるか議論が始まった。",needs("accord"),[
      pick("合同の検査記録を公開する","W9 S-5","輸送国が合同の検査を通行証に記録した。",flag("roads","audits")), pick("荷の中身に応じて相互承認する","S8 W-5","一部の品目だけ再検査を省略した。",flag("trade_court")), pick("危機時の生活物資に絞る","W8 P-5","生活物資用の共通通行証が発行された。",flag("rescue_trade"))]),
    define("general_after_armistice",4,1,"休戦後の将軍の請願","休戦の功績で知られた将軍ライオが、現地の物流を自らの指揮で続けたいと要請した。",needs("army","continental_rule"),[
      pick("文民と共同で物流を監督する","S8 P-6","将軍の提案をもとに文民が物流監査に加わった。",flag("civilian_command")), pick("将軍を輸送の執行官に推薦する","P9 S-7","ライオを執行官として軍が推薦した。",{tags:["military_rule"]}), pick("物流を各都市の契約に戻す","W9 P-5","都市の運送会社が物流を引き受けた。",flag("regional_compact"))],{person:person("ライオ","将軍")}),
    define("boats_for_distant_harbours",4,1,"遠い港の救援枠","港を失った国が臨時の荷揚げ枠を求めている。国際便と自国の漁船がすでに枠を使っている。",{},[
      pick("双方の時間枠を組み替える","C8 W-5","国際便と漁船の間に救援用の枠を設けた。",flag("accord")), pick("受入費を共同基金で賄う","S8 W-6","港を使う国が救援便の費用を共同で出した。",flag("rescue_trade")), pick("小型船で沖合に届ける","W8 P-5","沖合で荷を積み替えて別の国へ運んだ。",flag("roads"))]),
    define("surplus_plant_shares",4,2,"余った工場時間の市場","予約のない工場を他の会社が小口で使い始め、故障や遅延を負担する規則が必要になった。",needs("industry"),[
      pick("共同で故障費を積み立てる","W8 S-5","企業が少量ずつ故障の準備金を出した。",flag("pension")), pick("複数の工場の予約を仲介する","W9 C-5","取引所が空いている工場の時間を集めた。",flag("market")), pick("技術者を共同で育てる","K8 W-5","同じ設備を扱える工場の技術者が育った。",flag("academy"))]),
    define("clearing_small_ports",4,2,"小港の決済窓口","地方に残った小さな清算窓口が閉鎖を求められ、商人は小口取引が扱えなくなると訴えた。",needs("banking_network"),[
      pick("小口の窓口を共同で支える","S8 W-6","複数の港が小口の清算窓口を共同運営した。",flag("antitrust")), pick("大口の窓口へ荷もまとめる","W9 S-6","小口の荷は都市の窓口でまとめて清算された。",flag("industry")), pick("利用者が窓口を引き受ける","C8 W-5","地方の利用組合が窓口を運営した。",flag("guild_credit"))]),
    define("public_index_cost",4,2,"指標を公開する費用","公費で作った輸送物価の資料を事業者が引用し、詳しい記録を誰が支払うか議論になった。",{},[
      pick("元の記録を共同資金で公開する","K8 W-5","共同の資金で輸送の価格記録を公開した。",flag("open_data")), pick("事業者に追加集計を販売する","W9 C-5","標準資料に加え、有料の詳細資料が販売された。",flag("guild_credit")), pick("業種ごとの窓口に任せる","C8 S-5","業種ごとに別々の価格資料が作られた。",flag("market"))]),
    define("world_ballad_nights",4,3,"国境を越えた詩の朗読週間","渡し守の詩を引用した請願がよその国にも伝わり、翻訳者が各地の同時朗読を提案した。",{...needs("civic_readings"),priority:4.8,fiscal:true},[
      pick("都市ごとに朗読と翻訳の館を開く","C9 W-6","詩を起点に翻訳者と都市が共同の文化館を設けた。",flag("cultural_houses")), pick("請願と詩を同じ資料として公開する","S8 W-5","議会の文書と詩が、誰でも照合できるようになった。",flag("public_readers")), pick("地域の朗読会のまま続ける","C8 S-4","詩は国外へ出展せず、各地の朗読で継がれた。",flag("patronage_archive"))],{person:person("ミラ","詩人・渡し守","作品が各国で翻訳される")}),
    define("family_voices",4,3,"消える前の生活の声","仕事のやり方が変わり、聞き手のいなくなった家庭の言葉を記録する活動が始まった。",{},[
      pick("各地の家庭の録音を資料にする","C8 W-5","家で使うことばの録音が共同で保管された。",flag("patronage_archive")), pick("学舎の音声辞典を作る","K8 W-5","学舎が教材として音声辞典を刊行した。",flag("academy")), pick("演劇と歌の素材にする","C8 S-4","録音を使った上演が市の広場で行われた。",flag("public_readers"))]),
    define("tactile_exhibition",4,3,"触れられる展覧会","展示物に触れて鑑賞したいという要望が集まり、作品の保全と体験を分ける場を作ることになった。",{},[
      pick("複製を共同で学習に使う","C9 W-5","複製が各地の学校と展示館に貸し出された。",flag("patronage_archive")), pick("制作の実演を公開する","K8 W-5","制作工程の実演が公開された。",flag("public_readers")), pick("保管庫を見学できるようにする","C8 S-4","原作品の保管方法が訪問者に説明された。",flag("audits"))]),
    define("collaborative_translators",4,3,"翻訳者の名が抜けた版","共同版を配った後、翻訳者の名が印刷物から落ちていると各国で気づいた。",needs("plural_medium"),[
      pick("氏名と地域を新版に戻す","C8 W-5","全ての参加者を記した訂正版が配布された。",flag("border_languages")), pick("展示館で翻訳の過程を見せる","C8 W-5","原稿と注記を見比べる展示が巡回した。",flag("patronage_archive")), pick("刊行の記録を公に監査する","S8 W-5","編集の決裁記録が外部から検査された。",flag("audits"))]),
    define("world_festival_council",4,4,"灯籠の祭りが結ぶ会議","川辺の灯籠から始まった連絡会に、国外の団体がそれぞれ異なる祭りのまま参加したいと申し込んだ。",{...needs("festival_assembly"),priority:4.8,fiscal:true},[
      pick("異なる祭りが参加する信仰会議を開く","C9 W-6","灯籠の町が世話をし、国外にも開かれた信仰組織の会議が始まった。",flag("faith_council","faith_plural","ritual_treaty")), pick("旅人の宿だけを共同で運営する","S8 W-5","国外の祭りへ行く旅人にも共通の宿の規約が使われた。",flag("accord")), pick("祭りの由来を国際資料に残す","C9 S-5","川の町から各国までの祭りの広がりを図に残した。",flag("patronage_archive"))]),
    define("synthetic_calendar",4,4,"異なる暦の祝日交換","各地で異なる祝日を使う労働者が同じ研究施設で働く。祝日の費用と当直を調整することになった。",{},[
      pick("使う暦を本人が選ぶ","C8 S-5","働く人は地区や信仰に合わせて休日を申請した。",flag("ritual_treaty")), pick("縮小運転の日を共通にする","S8 W-5","暦が違っても施設の当直を割り当てた。",flag("labor_contract")), pick("古い暦と運転暦を記す","K8 W-5","施設が両方の暦の日付を台帳に記録した。",flag("open_data"))]),
    define("memory_of_old_sites",4,4,"旧礼拝所の保存順","役割を終えた幾つかの礼拝所を、地元では建物として残すか、道具と記録を保存するかで意見が割れた。",{},[
      pick("地元の団体が保存地を分け合う","C9 W-5","地元の異なる団体が建物と道具を分けて保管した。",flag("ritual_treaty")), pick("記録をまとめ公開する","K8 W-5","建物が変わる前の測定値と記録が公開された。",flag("open_data")), pick("現役の祭場の予算を優先する","S8 C-5","予算は今も使う祭場の改修に配られた。",{tags:["state_faith"]})]),
    define("transferable_space_parts",4,5,"交換できる実験棟の部品","織機の頃から受け継いだ互換寸法の考え方を、別々の研究所が作る実験棟に使う案が出た。",needs("loom_industry"),[
      pick("各研究所で交換試験を行う","K9 W-5","各研究所の部品を入れ替えて同じ条件で試験した。",flag("neutral_testing","audit_research")), pick("少量の規格品を市場に出す","W9 C-5","規格の同じ部品が工房の間で流通した。",flag("market")), pick("地上で共通の訓練を始める","K8 W-5","共通規格を教える地上の実習が始まった。",flag("academy"))]),
    define("dry_lab_network",4,5,"測定機を離して置く","同じ谷で複数の測定機が止まったため、置き場所と配線を分けて故障を比べる案が出た。",{},[
      pick("別の谷でも同じ測定をする","K8 W-5","離れた研究所の測定値を比較できるようになった。",flag("neutral_testing")), pick("中継記録を共有する","K8 S-5","中継局の信号と故障記録が公開された。",flag("open_data")), pick("地方の小規模装置を併用する","C8 W-5","地方の装置が広域観測を補った。",flag("human_oversight"))]),
    define("shore_ecology_models",4,5,"同じ海岸の別々の予測","同じ干潟を調べた研究班が、異なる式で未来の水位を予測した。住民は避難計画にどちらを使うか尋ねた。",{},[
      pick("両方の予測と現地の観測を公開する","K9 W-6","予測の違いと実測を住民が確認できた。",flag("audit_research","open_data")), pick("住民が調査地点を選ぶ","C8 W-5","住民が自分たちの場所の水位を継続して測った。",flag("shared_sky")), pick("高くなる予測に合わせ備蓄する","S8 W-5","より危険な予測に合わせて地元の備蓄を増やした。",flag("mutual_grain"))]),
    shock("tracking_blackout",4,6,"追跡局が沈黙した夜","未明に電源設備が故障し、直後に遠隔の追跡局も同じ系統で止まった。管制と各国への通信が途絶えた。","calamity","major","W-22 K-16 S-9",[
      pick("地上の代替局だけで受信を再開する","K9 W-6","別の場所の地上局が弱い信号を拾い始めた。",flag("shared_sky")), pick("民間の回線を短期で借りる","W8 C-5","臨時回線を借り、港と研究所への通信を再開した。",flag("accord")), pick("記録を回収し再審査に備える","S8 W-5","試験の記録と故障箇所を共有する委員会が開かれた。",flag("audit_research"))],
      {protections:[protect("neutral_testing","K7"),protect("shared_sky","W5")],scar:"orbital_scar",
        disruptions:[jeopardy("space","flight_clearance","space_delay","追跡局が失われ、打ち上げ許可の運用条件を満たせなくなった","audit_research")]}),
    shock("great_basin_wave",4,6,"盆地を越えた水","沖の海底が大きく動き、想定していた堤防を越えて、川口の居住地と輸送拠点へ水が押し寄せた。","calamity","exceptional","W-67 S-43 C-15",[
      pick("高い土地の倉と生活路をつなぐ","S12 W-5","高台の住まいと開いている倉を救援路で結んだ。",flag("mutual_grain")),
      pick("域外に生活の補給と輸送を求める","W14 P-8","域外の船と工房から生活を支える荷が届き始めた。",flag("rescue_trade")),
      pick("安全な区域を選び行政機関を移す","S12 C-7","共同体の事務と配給の窓口が高台へ移った。",flag("regional_compact"))],
      {protections:[protect("mutual_grain","W12"),protect("roads","S8"),protect("rescue_trade","W8")],scar:"flood_scar"}),
    define("tracking_rebuilt",4,6,"管制を二つの場所に分ける","追跡局が故障した後、同じ電源を共有しない管制を共同で運用する案がまとまった。",{...needs("orbital_scar"),priority:4.5},[
      pick("二つの系統の独立試験を行う","K10 W-6","別々の電源で管制局を試験し直した。",{flags:["neutral_testing","shared_sky"],revoke:["orbital_scar"],reconstruction:"別電源の管制設備を復旧し、測定を再開"}), pick("測定網を大学と共同で復元する","K8 W-5","大学も担当する測定網へ移行した。",{flags:["academy","open_data"],revoke:["orbital_scar"],reconstruction:"大学と共に測定網を復元"}), pick("現在使える局だけで観測を続ける","S8 K-5","既存の局だけで利用できる時間を公開した。",flag("audits"))]),
    shock("accidental_storage_breakthrough",4,7,"欠陥品が残した長寿命の記録","工房の試験中、欠陥品として保管された試料ひとつだけが、他の試料より長く情報を保持した。","fortune","ordinary","K12 W5",[
      pick("発見を他の研究所と検証する","K8 W-5","複数の研究所が同じ加工条件を試した。",flag("neutral_testing")), pick("地方の記録保管に試す","C8 W-5","地域資料の小規模な複製に試料を使った。",flag("patronage_archive")), pick("保存装置の契約を開く","W9 K-5","複数の工房が試料の利用契約を結んだ。",flag("trade_court"))]),
    shock("coastal_city_exodus",4,7,"行き先を変えた船団","遠い海の船団が利用する寄港地を急に変え、多くの住民が新しい住まいと雇用を求めて到着した。","ambiguous","ordinary","C9 S-7 W-5",[
      pick("地元の代表と仕事の窓口を開く","S8 W-5","到着した人を迎える雇用の窓口が地区にできた。",flag("labor_contract")), pick("各地へ希望する行き先を聞く","C9 P-5","住む場所を到着した人と受入地区で調整した。",flag("regional_compact")), pick("外国語と造船の講習を始める","K8 W-5","船の仕事と通訳を教える講習が共同で開いた。",flag("border_languages","academy"))]),
    shock("network_devotion",4,7,"遠隔の祭りが同時に広がる","連絡網で偶然同じ時刻に行われた儀式の記録が交換され、既存組織と無関係な新しい集会が各地にできた。","ambiguous","ordinary","C11 S-6",[
      pick("独立した集会と儀礼を相互に認める","C8 W-5","既存団体と新しい集会が相互の礼拝を認めた。",flag("ritual_treaty")), pick("観測の共有会として受け入れる","K9 C-5","国境をまたぐ集会が同時刻の観測を記録した。",{tags:["research_faith"]}), pick("継続する集会に地元の窓口を置く","S8 W-5","各地で集会の届け出と会場の相談を扱った。",{tags:["local_first"]})]),
  ];

  window.CivHistory = { events, flags, lineage, kindLabels };
})();
