(() => {
  "use strict";

  const finalFlags = {
    space: "moon_landing", democracy: "election_held", conquest: "union_clearance",
    economy: "stable_economy", culture: "cultural_convention", religion: "faith_community",
  };
  const flags = {
    ration_rosters: "地区別の配給台帳と予備輸送枠",
    estate_leases: "公有資産の長期賃借契約",
    emergency_cargo_terms: "緊急交易の優先供給契約",
    fiscal_launch_pause: "財政危機による発射設備の売却",
  };
  const remember = (id, age = 3, rest = {}) => ({ trophyAge: { [id]: age }, ...rest });
  const status = (id, value) => [{ id, status: value }];
  const route = (label, choices, when) => ({ label, choices, when });
  const metrics = { S: "order", W: "wealth", K: "knowledge", C: "culture", P: "power" };
  const change = codes => Object.fromEntries(codes.split(" ").map(code => [metrics[code[0]], Number(code.slice(1))]));
  const pick = (title, summary, result, codes, rules = {}) => ({
    public: { title, summary, result }, rules: { delta: change(codes), flags: [], ...rules },
  });
  const event = (id, field, title, body, rules, ...choices) =>
    ({ id, era: null, field, public: { title, category: field, body }, rules, choices });
  const rescue = (recovery, sacrifice, rules = {}) => ({ recovery, sacrifice, ...rules });
  const heritage = (id, description, result, codes, rules) => ({
    when: remember(id), description, result, delta: change(codes), ...rules,
  });

  const events = [
    event("recovery_unfunded_services", "経済・産業", "二度目の支払期限",
      "公の支払いが長く滞り、担当者は公共資産の賃貸、配給、国外からの取引信用を提示した。止めている月探査設備を売れば、より大きな資金を確保できる。",
      { crisis: true, crisisAge: 6, crisisExchange: true, priority: 9.55 },
      pick("公有地を賃貸し前払金を取る", "当面の支払いに回せる。市が土地を自由に使えなくなる。",
        "複数の公有地を長期で貸し、最初の賃料を支払いに回した。", "W18 C-9",
        rescue("公有地の長期賃貸", "公有地の利用裁量を譲った", { flags: ["estate_leases"], burden: "tax" })),
      pick("購入を集約し地区別の配給に切り替える", "各地区に最低限の物資を送る。地域で自由に使える物資が減る。",
        "地区別の配給台帳を作り、購入と輸送をまとめた。", "W14 S-8",
        rescue("非常時の配給", "地区の配分や移動に制約を加えた", { flags: ["ration_rosters"], burden: "austerity" })),
      pick("前払いや保証つきの緊急輸入を契約する", "取引を再開できる。国外の契約に供給の優先権を渡す。",
        "国外の取引相手に優先供給を約束し、立替金で決済を再開した。", "W20 P-10",
        rescue("国外との緊急交易", "国外の契約相手に供給の優先権を渡した", { flags: ["emergency_cargo_terms"], burden: "aid" })),
      pick("打ち上げ設備を売り月探査を凍結する", "支払いに回せる。機材と現行の審査を失う。",
        "月探査の設備を売却し、発射体制の承認を取り消した。", "W24 K-10",
        rescue("月探査設備の売却", "現在の発射体制と審査認可を失った", {
          when: { needs: ["lunar_program"], any: [{ needs: ["launch_ready"] }, { needs: ["flight_clearance"] }] },
          flags: ["space_delay", "fiscal_launch_pause"], revoke: ["launch_ready", "flight_clearance", "rescue_mission"], burden: "austerity",
          missed: { goal: "space", reason: "経済危機に対応するため発射設備と審査を手放した" },
        }))),
    event("recovery_bridge_credits", "経済・産業", "支払いをつなぐ臨時信用",
      "資金不足が長期化し、既存の手形が更新されなくなった。配給、期限の延期、商人からの借入には、それぞれ代償がある。",
      { crisis: true, crisisAge: 11, crisisExchange: true, priority: 9.5 },
      pick("償還期限を延ばし将来の歳入を充てる", "今期の支払額は減る。次期には手数料と監査が残る。",
        "返済期限を延ばし、将来の歳入の一部を手数料に充てた。", "W17 S-7",
        rescue("返済期限の再編", "将来の歳入の一部と金融移行費を約束した", { burden: "reform" })),
      pick("商家の供給契約を公費で裏書きする", "在庫が市に戻る。価格と供給先の裁量を一部渡す。",
        "商家の在庫が市に戻る代わりに、公共調達の優先契約を結んだ。", "W16 C-9",
        rescue("優先契約つきのつなぎ融資", "公的契約の優先枠を商家に渡した", { flags: ["guild_credit"], burden: "tax" })),
      pick("予備輸送と配給を組み直す", "維持費を減らせる。遠い地区への輸送を削る。",
        "支払える範囲で共同購入を残し、一部の遠距離輸送を縮小した。", "W15 P-8",
        rescue("配給と輸送の再編", "遠い地区の輸送枠を縮小した", { flags: ["ration_rosters"], burden: "austerity" }))),
    event("post_crisis_tracking", "科学・技術", "売却した発射枠を借り直す",
      "財政難で失った設備は戻らなかったが、他の研究機関が使用枠を貸せると申し出た。研究や観測の権限をどこまで共有するかが論点だ。",
      { fiscal: true, fromEra: 4, priority: 5.8, needs: ["fiscal_launch_pause", "space_delay"], lacks: ["flight_clearance"],
        minimum: { wealth: 48, knowledge: 63 }, any: [{ needs: ["open_data"] }, { needs: ["shared_sky"] }, { needs: ["accord", "academy"] }] },
      pick("追跡データを公開し共同審査を受ける", "別の施設で発射体制を再建できる。機器利用と公開監査の費用を負う。",
        "機関が追跡と発射の枠を提供し、共同で新しい審査を完了した。", "K7 W-14 P-5",
        { flags: ["rescue_mission", "launch_ready", "flight_clearance"], goal: "space" }),
      pick("追跡装置は地上観測にだけ借りる", "観測は再開する。着陸審査は保留する。",
        "観測装置は地上観測だけに使われた。", "K9 W-5"),
      pick("施設を借りず支払いを優先する", "手元の財源を守る。探査は凍結したままになる。",
        "研究枠を買わず、資金を他の支払いに回した。", "W9 K-5")),
    event("charter_review", "政治・法律", "憲法に期限をつける",
      "以前制定した憲法の非常権限について、地方と中央が異なる解釈を示した。公布した条文が今の制度にも適用できるか争われている。",
      { fromEra: 3, ...remember("charter", 5), priority: 3.25, weight: 2, challenge: "成文憲法の非常権限" },
      pick("非常権の期限と地方の審査を定める", "執行の手順が明確になる。地方と公開審査の費用を負う。",
        "公布した憲法に非常権の期限と地方による審査を追加した。", "S9 W-8",
        { flags: ["regional_compact", "audits"], legacy: status("charter", "非常権の期限と地方審査を追加") }),
      pick("中央の措置を事後承認とする", "発令が速くなる。地方の審査は措置の後になる。",
        "施行時の憲法は残し、地方による非常権の審査は事後になった。", "P8 C-6",
        { legacy: status("charter", "非常権の審査は事後承認") }),
      pick("州ごとに異なる合意を認める", "旧来の運用が続く。州境で手続きが食い違う。",
        "中央の憲法に加えて州ごとの許可を参照する運用になった。", "C8 S-6",
        { legacy: status("charter", "地方の慣例と併用") })),
    event("coin_redemption", "経済・産業", "同じ貨幣が二つの値を持つ",
      "流通してきた貨幣を別々の市が違う値で受け取るようになった。古い貸付契約でどちらの値を使うか争いが起きた。",
      { fromEra: 2, ...remember("coinage", 6), priority: 2.65, weight: 2, challenge: "貨幣制度と債務の換算" },
      pick("公開された交換比率で古い債務を換算する", "契約を引き継ぎやすい。審査と交換に準備金を出す。",
        "異なる額面を公開された比率で換算する両替所が設立された。", "W-7 S9",
        { flags: ["guild_credit"], legacy: status("coinage", "公開交換比率による運用") }),
      pick("小口の流通には各市の額を認める", "市場は続く。大きな債務を持つ取引に換算費がかかる。",
        "各市の小口決済は続き、都市間の債務は個別に審理された。", "W9 S-6",
        { flags: ["trade_court"], legacy: status("coinage", "国内市場で額面が分立") }),
      pick("公の支払いだけ新貨に替える", "国庫の会計を揃えられる。既存の取引では貨幣をすぐ替えられない。",
        "国庫が新貨に移行したが、商家は旧貨でも債務を扱った。", "K8 C-5",
        { legacy: status("coinage", "公私で異なる貨幣を併用") })),
  ];

  const overrides = {
    pyramid_completion: { rules: { priority: 2.35 } },
    chairs_of_learning: { rules: { priority: 2.0 } },
    workshop_firearms: { rules: { priority: 1.65 } },
    early_airfields: { rules: { fromEra: 3, priority: 1.65, any: [
      { needs: ["industry", "neutral_testing"] }, { needs: ["industry", "shared_sky"] },
      { needs: ["industry", "accord"], trophies: ["rails"] },
    ] } },
    literary_letters: { rules: { priority: 1.85 } },
    pyramid_attribution: { rules: { priority: 3.35 } },
    edicts_and_broadsheets: { rules: { priority: 3.6 } },
    arms_export_dispute: { rules: { priority: 3.3 } },
    wages_of_standardization: { rules: { priority: 3.5 } },
    collection_disaster_drill: { rules: { priority: 3.45 } },
    model_disagreement: { rules: { priority: 3.4 } },
    heritage_register: { rules: { priority: 3.25 } },
    regional_teacher_licences: { choices: [
      pick("学舎の研究課程と学位を相互に認める", "教員と学生が他地域に移れる。学位の共同審査を負担する。",
        "研究を教える学舎が共同憲章を公布して学位の相互授与を始めた。", "K10 W-8",
        { when: { needs: ["academy", "civic_law"] }, flags: ["university_charter"] }),
    ] },
    museum_exchanges: { choices: [
      pick("翻訳誌と批評を各国の展示館で交換する", "作品が離れた地域で読まれる。訳者と編集部を支える費用を負う。",
        "複数の国の館に翻訳誌と批評が並び、各地の読書会が批評を交換した。", "C10 W-8",
        { when: { needs: ["press", "border_languages"], any: [{ needs: ["public_readers"] }, { needs: ["plural_medium"] }] }, flags: ["public_readers"] }),
    ] },
    tactile_exhibition: { choices: [
      pick("芸術と工業の国際展示を共同開催する", "各国の工房と学校が展示に参加する。輸送費と会場費を持ち合う。",
        "各国の芸術家と工房が同じ会場に集まり、作品と製造技術を世界博覧会で展示した。", "C10 W-8",
        { when: { needs: ["cultural_exchange", "accord"], any: [{ needs: ["industry"] }, { needs: ["academy", "patronage_archive"] }] }, flags: ["global_archives"] }),
    ] },
    synthetic_calendar: { rules: { heritagePriority: { when: remember("faith_council", 4), value: 3.5 } }, choices: [
      pick("世界宗教会議の団体で休日と当直を調整する", "教義が違っても勤務を続けられる。代表と出す代替要員の費用が増える。",
        "世界宗教会議の代表が代替要員を融通し、それぞれの祝いの日に休める共同規則を定めた。", "S9 W-7",
        { when: remember("faith_council", 4), flags: ["ritual_treaty"], legacy: status("faith_council", "職場の祝日と勤務を共同調整") }),
    ] },
    archives: { choices: [
      pick("旧大図書館の目録を複写し各地に預ける", "原本の所在と来歴を守る。複写の費用を公に負う。",
        "大図書館の目録と閲覧用の複写が複数の施設へ移され、原本は館に残った。", "K9 C5 W-9",
        { when: remember("library"), flags: ["global_archives"], legacy: status("library", "目録と複写を各地に保管") }),
    ] },
    calendar_schools: { choices: [
      pick("大聖堂を巡る日と学校の日程を分ける", "巡礼と教室の両方を続けられる。会場や案内を運営する費用が増える。",
        "巡礼日程を学校と共同で調整し、大聖堂の祭礼時も授業を続けた。", "C9 W-6",
        { when: remember("cathedral"), flags: ["ritual_treaty"], legacy: status("cathedral", "学校と巡礼の日程を調整") }),
    ] },
    schism_conference: { choices: [
      pick("過去の世界宗教会議の代表を仲裁に招く", "旧会議の調停手順を使える。本部と地方が議決権を分ける。",
        "以前の宗教会議の代表が仲裁し、地方の議席と共同体の規約を改定した。", "C7 P-8 W-7",
        { when: remember("faith_council", 2), flags: ["faith_terms", "ritual_treaty"], goal: "religion",
          legacy: status("faith_council", "国外団体の対立を仲裁") }),
    ] },
    clearing_treaty: { choices: [
      pick("以前の貨幣規格を基に小口の交換枠を共通化する", "少額の取引がしやすい。換算差額の保証を負う。",
        "以前の貨幣の規格をもとに、小口の通貨交換を参加国で共同運用した。", "C6 W-10",
        { when: remember("coinage"), flags: ["foreign_clearing"], goal: "economy",
          legacy: status("coinage", "国際清算の小口交換へ継承") }),
    ] },
    algorithm_appeals: { choices: [
      pick("初期の演算機関から配分記録を取り寄せる", "判断経緯を復元できる。機関ごとに違う記録を監査する費用が要る。",
        "初期の演算機関の記録から配分の経緯を復元し、再審に使うことになった。", "S10 W-8",
        { when: remember("ai"), flags: ["audit_research", "human_oversight"], legacy: status("ai", "配分記録を公開審査に保存") }),
    ] },
    factory_board: { choiceRules: { 2: { heritage: heritage("industry", "量産の時から続く工場間の台帳を使うため、交渉の窓口も共同になる。",
      "量産の工場では共通の労働窓口を維持した。", "W-3", { flags: ["labor_contract"], legacy: status("industry", "企業間の交渉窓口を共同運用") }) } } },
    ritual_reform_assembly: { choiceRules: { 1: { heritage: heritage("printing", "既存の印刷所が別々の典礼を刷り分けるため、監督の費用が増える。",
      "印刷所が地域ごとに異なる典礼を刊行した。", "W-3", { legacy: status("printing", "各地で異なる典礼の刊行に利用") }) } } },
  };
  // Each entry changes a particular response when an earlier achievement is in evidence.
  const legaciesV8 = {
    "calendar_schools:3": heritage("calendar", "天文暦に残る過去の観測と、教室で測った星の位置を比較できる。",
      "学校は天文暦の観測系列を授業に取り入れた。", "K2", { legacy: status("calendar", "学校で観測の教材に採用") }),
    "state_faith_courts:1": heritage("written_law", "成文法に残る判例を参照できる。管轄を決める共同審理が短くなる。",
      "管轄を分ける協定には、既存の成文法の判例が引かれた。", "W2", { legacy: status("written_law", "祭礼と民事の管轄協定に引用") }),
    "pilgrimage_treaty:1": heritage("trade", "古代の交易網に沿って巡礼宿へ物資を届けられる。補給の費用が軽くなる。",
      "巡礼宿への補給に古くからの交易路が使われた。", "W2", { legacy: status("trade", "巡礼宿の補給に利用") }),
    "clearing_treaty:1": heritage("banking", "銀行制度の帳簿を国外の清算に使える。各行の記帳方式を照合する費用が加わる。",
      "各行の記帳方式を照合して清算台帳に組み入れた。", "W-2", { legacy: status("banking", "国外の清算台帳に接続") }),
    "regional_teacher_licences:3": heritage("university", "大学制度で認められた履修記録を使い、養成講義の重複を減らせる。",
      "学位の記録から、他の学舎で履修済みの講義を認定した。", "K2", { legacy: status("university", "教員養成で単位を相互認定") }),
    "archive_equipment_return:1": heritage("heritage", "世界遺産保護条約の来歴目録が原資料の返却先を示す。照合にかかる費用が軽くなる。",
      "保護条約に添付された目録に沿って、原資料を元の地域へ届けた。", "W2", { legacy: status("heritage", "原資料の返還に適用") }),
    "algorithm_appeals:1": heritage("computer", "電子計算機に残る配分の記録を再審会で照合できる。記録の読み替えに費用がかかる。",
      "演算記録を読める形式に移して、人間による再審に用いた。", "W-2", { legacy: status("computer", "過去の演算記録を再審に利用") }),
    "museum_exchanges:1": heritage("literature", "世界的文学運動でつながった訳者が展示資料を読み合わせる。作品の来歴を他国にも伝えられる。",
      "文学誌の訳者が各館の目録に作品の来歴を添えた。", "C2", { legacy: status("literature", "国外の展示館へ訳者の協力が広がった") }),
  };
  const protections = {
    modern_epidemic: [
      { when: { needs: ["ration_rosters"] }, delta: { wealth: 5, order: 3 } },
      { when: { needs: ["temple_schools", "mutual_grain"] }, delta: { order: 3 } },
    ],
    tracking_blackout: [
      { when: { needs: ["ration_rosters", "audits"] }, delta: { wealth: 4 } },
      { when: { needs: ["neutral_testing", "open_data"] }, delta: { wealth: 2, knowledge: 2 } },
    ],
  };
  const trophyRoutes = {
    university: [route("学舎の研究課程と学位の相互認定を制度化", ["regional_teacher_licences:4"])],
    literature: [route("翻訳した作品と批評を各国の館で共同刊行", ["museum_exchanges:4"])],
    expo: [route("国際文化交流を世界規模の工業・芸術展示に発展", ["tactile_exhibition:4"])],
  };
  const meanings = {
    megalith: "季節や共同作業を、代替わりしても参照できる場所に刻んだ。",
    pyramid: {
      sacred: "祭祀を支える石段が完成し、神殿を訪ねる人々の拠点ができた。",
      dynasty: "王家の権限を記す建造物が完成した。後世は残された碑文から当時の統治を読み取れる。",
      commerce: "複数の市と工房の資金で大きな建物が完成し、管理を共同で担うことになった。",
      civic: "共同の費用で記念碑が完成し、地区が行事に使える場所ができた。",
      local: "地域が資材と人手を集め、土地の来歴を残す建造物を完成させた。",
    },
    library: "手稿や史料を共有し、散在する記録を照合できるようになった。",
    cathedral: "地域を越えて祭礼を開ける礼拝所ができ、利用日や費用を共同で決めることになった。",
    skyline: "住居と仕事場を縦に重ねる街区が完成し、通路や設備を共同で管理するようになった。",
    calendar: "地域の観測を同じ暦にまとめ、作付けと祭礼の日を照合できるようになった。",
    writing: "貸し借りや役所の仕事が、同じ記号で後から確認できるようになった。",
    written_law: "裁定が文書になり、何が認められるかを手続きに照らして争えるようになった。",
    coinage: "離れた市が同じ単位で取引できるようになり、換算比率や新貨の管理も公の争点になった。",
    trade: "定期市や寄港先が結ばれ、商家が地元以外の供給に依存するようになった。",
    university: "学舎が教える内容や資格を認め合い、研究者と学生が地域を越えて移動できるようになった。",
    printing: "文章を大量に複製できるようになった。思想や技術が広がる一方、何を刊行できるかが争点になった。",
    powder: "発破を工事に取り入れ、利用できる作業場と監査の範囲が定められた。",
    firearms: "製造品の採用が公の記録に残り、保管・供給の規則を決める必要が生まれた。",
    banking: "預金と融資をつなぐ窓口ができ、信用で事業を支えられるようになった。",
    sailing: "遠い港を定期的に訪ねられるようになり、航海の費用と収益を分ける契約が生まれた。",
    reform: "教えを伝える手段と役職を認める権限が組み替わり、複数の地域で新しい運用が始まった。",
    atlas: "各地の地名や測量が一枚の地図で使えるようになり、外交と航行で同じ記録を参照できるようになった。",
    industry: "研究や金融を量産につなげたことで、仕事場、住居、輸送を一緒に見直す必要が生まれた。",
    rails: "離れていた路線が同じ時刻表でつながり、人と貨物を複数の地域へ運べるようになった。",
    charter: "公の権限が文書で定められ、政権が替わっても各機関が根拠を示して議論できるようになった。",
    education: "地区をまたいで教室と資格を維持できるようになり、費用と教材を誰が決めるかが争点になった。",
    expo: "異なる地域や国が成果を持ち寄り、工業・芸術・復旧の知恵を同じ会場で交換した。",
    aviation: "空の運輸が定期化し、遠方への郵便や救援に飛行場を使うようになった。",
    literature: "作品と批評が複数の言語で読まれ、地元の刊行物が国境を越えて読者を得た。",
    global_finance: "遠隔地の信用と決済がつながり、ある港の損失が別の市場にも及びうるようになった。",
    heritage: "建物や史料を共同で守る約束を結び、保存と現地利用の両方を各国が扱うようになった。",
    scholarly: "研究費や成果を互いに監査できる共同事業が生まれ、観測と検証を国の外へ広げた。",
    computer: "計算設備が測定や事務を支え、従来は手で処理していた記録をまとめられるようになった。",
    information: "図書と市場や観測所が通信網で接続し、距離にかかわらず記録をやり取りできるようになった。",
    ai: "機関が演算の提案を実務に使い始めた。判断を覆せるのは誰かが、実際の制度の問題になった。",
    station: "複数の機関が軌道上の実験設備を共同で維持し、地上との通信と当番を分け合った。",
    peace: "停戦後も調停や監査を続ける枠組みができ、次の紛争を共同で扱えるようになった。",
    faith_council: "別々の教義を持つ代表が同じ会議に集まり、復旧や巡礼の費用を相談できるようになった。",
    city_league: "都市が自治を保ちながら共通資産を運営し、個別に負担できない事業を引き継いだ。",
    global_culture: "翻訳、教育、展示を支える組織がつながり、各国が資料と運営を継続して担うようになった。",
  };
  window.CivBalance = { legaciesV8, finalFlags, flags, events, overrides, trophyRoutes, meanings, protections };
})();
