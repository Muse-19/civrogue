(() => {
  "use strict";

  const groups = {
    religion: { name: "宗教", tags: { polytheism: "多神教", monotheism: "唯一神信仰", state_faith: "国家宗教", moon_cult: "月崇拝" } },
    politics: { name: "政治", tags: { council_rule: "評議会制", monarchy: "君主制", theocracy: "神権政治", totalitarian: "全体主義", military_rule: "軍事政権", representative: "議会制", democracy: "民主制", technocracy: "科学者統治", algorithmic: "AI統治" } },
    society: { name: "社会", tags: { estates: "身分制", merit: "能力主義", collective: "集団主義", individual: "個人主義" } },
    science: { name: "科学", tags: { open_science: "科学振興", controlled_tech: "技術統制", science_first: "科学至上主義" } },
    foreign: { name: "外交", tags: { isolation: "孤立主義", expansion: "拡張主義", pacifism: "平和主義", federation: "連邦主義" } },
  };

  const tags = Object.fromEntries(Object.entries(groups).flatMap(([group, { tags }]) =>
    Object.entries(tags).map(([id, name]) => [id, { group, name }])));

  // α版の選択肢IDを保持し、v0.2のプレーにだけ作用する規則を重ねる。
  const choices = {
    "winter:1": {
      adjustments: [{ when: { tags: ["collective"] }, delta: { order: 13, wealth: -7 },
        result: "共同作業で使っていた当番制を配給にも用い、各家族に蓄えが届いた。" }],
    },
    "telegraph:1": {
      adjustments: [{ when: { tags: ["controlled_tech"] }, delta: { knowledge: 8, wealth: -4 },
        result: "許可を持つ研究機関が専用回線を共有し、測定結果を交換した。" }],
    },
    "hearth:1": { tags: ["collective"] },
    "hearth:2": { tags: ["merit"] },
    "hearth:3": { tags: ["polytheism"] },
    "floodplain:1": { tags: ["collective"] },
    "flint:1": { tags: ["merit"] },
    "ford:2": { tags: ["pacifism"] },
    "ford:3": { tags: ["isolation"] },
    "boundary:1": { tags: ["council_rule"] },
    "boundary:2": { tags: ["monarchy", "estates"] },
    "boundary:3": { tags: ["individual"] },
    "paint:3": { tags: ["polytheism"] },
    "writing:1": { tags: ["open_science"] },
    "writing:3": { tags: ["state_faith"] },
    "laws:1": { tags: ["individual"] },
    "council:1": { tags: ["representative"] },
    "council:3": { tags: ["monarchy"] },
    "bronze:1": { tags: ["expansion"] },
    "harbor:2": { tags: ["expansion"] },
    "scriptorium:1": { tags: ["open_science"] },
    "scriptorium:2": { tags: ["controlled_tech"] },
    "treaty:1": { tags: ["federation"] },
    "charter:1": { tags: ["individual"] },
    "frontier:1": { tags: ["expansion"] },
    "frontier:2": { tags: ["pacifism"] },
    "schools:2": { tags: ["merit"] },
    "constitution:1": { tags: ["representative"] },
    "constitution:2": { tags: ["totalitarian", "controlled_tech"] },
    "suffrage:1": { tags: ["democracy"] },
  };

  const flags = {
    shared_sky: "暦の共同観測", launch_compact: "共同打ち上げ協定", launch_ready: "打ち上げ体制",
    civic_constitution: "自治連合憲章", military_logistics: "統合補給網", federal_integration: "統合評議会",
    oversight: "監督制度", oracle_archive: "観測記録の公開", surveillance: "国民監視制度",
  };

  // 複数の経路を持つ条件は、実際に使われた経路だけを年代記に記録する。
  const eventRules = {
    rocketry: { minimum: { knowledge: 55, wealth: 34 } },
    continental_war: { minimum: { power: 62, wealth: 31 } },
    suffrage: {
      needs: [], minimum: { order: 54, culture: 60, wealth: 31 },
      any: [{ needs: ["constitution"] }, { needs: ["civic_constitution"] }], lastSlot: 3,
    },
    moon: {
      needs: ["lunar_program", "launch_ready"], minimum: {},
      any: [
        { needs: ["launch_compact"], minimum: { knowledge: 67, wealth: 29 } },
        { minimum: { knowledge: 73, wealth: 49 } },
      ], priority: 8,
    },
    world_treaty: {
      needs: ["continental_rule"], minimum: {}, priority: 8,
      any: [
        { needs: ["military_logistics"], minimum: { power: 78, order: 47, wealth: 41 } },
        { needs: ["federal_integration"], minimum: { culture: 64, order: 53, wealth: 36 } },
      ],
      body: "四つの独立国のうち二国はすでに編入された。残る南原国と東洋国が世界会議に入り、最終的な統合条約の扱いが問われている。",
    },
  };

  const c = (title, summary, result, delta, rules = {}) =>
    ({ public: { title, summary, result }, rules: { delta, flags: [], ...rules } });
  const e = (id, era, category, title, body, rules, ...choices) =>
    ({ id, era, public: { category, title, body }, choices, rules: { weight: 2.7, ...rules } });

  const events = [
    e("moon_calendar", 0, "宗教", "月の暦",
      "川の氾濫、祭礼、狩りの時期をそろえるため、一族が月の満ち欠けを記録し始めた。暦の意味を決める役目は誰が担うだろうか。",
      {},
      c("月を祭る暦を作る", "祭礼を結びつける。供物の蓄えが要る。", "月ごとの祭礼が各集落に伝わった。", { culture: 9, wealth: -5 }, { tags: ["moon_cult"] }),
      c("農作業のための暦を作る", "収穫の時期をそろえる。観測に人手を割く。", "耕作の時期を示す月暦が配られた。", { knowledge: 7, wealth: 6, power: -4 }, { tags: ["open_science"] }),
      c("村ごとに祭りの時期を決める", "土地ごとの慣習を守る。共同作業は調整しづらい。", "集落ごとの暦が使われ続けた。", { culture: 7, order: -5 }, { tags: ["polytheism", "individual"] })),
    e("eclipse", 1, "宗教", "月食をめぐる論争",
      "祭礼の夜に月が影に入った。月を祭る人々の間で、観測の日付を公表すべきか、祭祀で扱うべきかが議論になった。",
      { tags: ["moon_cult"] },
      c("神官と観測者が暦を共有する", "予測が正確になる。観測所に資金を回す。", "神官は月食の記録を観測者と共有した。", { knowledge: 13, culture: 5, wealth: -7 }, { flags: ["shared_sky"], tags: ["open_science"] }),
      c("神官に暦と裁定を任せる", "祭礼の調整が進む。観測の裁量は狭まる。", "神官が暦を定め、祭礼と取引の日取りを裁定した。", { order: 11, culture: 7, knowledge: -6 }, { tags: ["theocracy", "state_faith"] }),
      c("宗教と暦の運用を分ける", "独自の調査が可能になる。従来の結束が弱まる。", "役所は祭礼日と学術観測の暦を分けた。", { knowledge: 10, order: -7 }, { remove: ["moon_cult"], tags: ["open_science"] })),
    e("temple_court", 1, "政治", "神殿の裁判",
      "各地の祭司が持ち寄った誓約を、都市の裁判に使うかどうかが争点になった。",
      { any: [{ tags: ["polytheism"] }, { tags: ["state_faith"] }] },
      c("唯一神への誓約に統一する", "判例がそろう。地方の祭礼との摩擦が増す。", "裁判所に共通の誓約が定められた。", { order: 10, culture: -5 }, { tags: ["monotheism", "state_faith"], remove: ["polytheism"] }),
      c("神殿に裁判権を認める", "遠隔地にも裁定が届く。異なる慣習の調整は難しい。", "神殿が各地の紛争を仲裁するようになった。", { order: 8, culture: 7, wealth: -6 }, { tags: ["theocracy", "state_faith"] }),
      c("祭司と別に市民の法廷を置く", "裁判の利用が広がる。並行する制度の維持費がかかる。", "市民が使える法廷が都市に開かれた。", { order: 6, culture: 8, wealth: -7 }, { flags: ["civic_law"], tags: ["council_rule"] })),
    e("astronomers", 2, "科学", "観測者と神官",
      "従来の祭礼日と天体の予測が合わなくなった。観測者と神官が、観測記録の扱いをめぐって議論している。",
      { tags: ["moon_cult"] },
      c("異なる予測を同じ台帳に載せる", "比較できる記録が残る。台帳の管理に費用がかかる。", "台帳には両者の予測と実測値が載った。", { knowledge: 11, culture: 5, wealth: -6 }, { tags: ["open_science"], flags: ["shared_sky", "oracle_archive"] }),
      c("神官が観測を統括する", "財源と人員を一つにできる。独立した観測所が減る。", "神殿が観測事業を管理した。", { order: 10, wealth: 6, knowledge: -7 }, { tags: ["theocracy", "controlled_tech"] }),
      c("都市に別々の観測所を置く", "独自の研究が進む。予算分配で対立する。", "学都と祭都が別々の観測所を持った。", { knowledge: 10, order: -7 }, { tags: ["merit"] })),
    e("succession", 2, "政治", "継承の空白",
      "統治者の死後、新たな徴税令に誰が署名できるかが分からなくなった。各地で異なる後継者が推されている。",
      { any: [{ tags: ["monarchy"] }, { tags: ["theocracy"] }, { tags: ["military_rule"] }] },
      c("継承の順序を公布する", "徴税が再開する。地方候補の発言権が弱まる。", "法定された順番で新統治者が承認された。", { order: 12, culture: -5 }, { tags: ["estates"] }),
      c("選出会議を常設する", "対立を制度で扱える。会議の維持費がかかる。", "各地の代表が次の統治者を選ぶ手順を定めた。", { culture: 10, order: 4, wealth: -7 }, { tags: ["council_rule"], flags: ["civic_law"] }),
      c("非常権限を集中する", "行政が素早く動く。地方の自治が弱まる。", "継承は中央の執行機関が管理することになった。", { power: 10, order: 5, culture: -8 }, { tags: ["totalitarian", "controlled_tech"] })),
    e("officer_cabinet", 2, "政治", "常設軍と評議会",
      "辺境の常設軍は、街道の維持と租税を直接管理するよう求めている。代表者たちは統治の分担を議論した。",
      { needs: ["army"] },
      c("将校を政府の責任者に任命する", "調達がそろう。民間事業の予算が減る。", "常設軍の将校が行政の責任者になった。", { power: 12, order: 5, wealth: -7 }, { tags: ["military_rule", "expansion"] }),
      c("会計を市会に公開する", "各地が負担を見直せる。軍の裁量が減る。", "徴税と調達の記録が市会に送られた。", { order: 8, wealth: 7, power: -6 }, { tags: ["council_rule"], flags: ["oversight"] }),
      c("守備隊ごとに予算を分ける", "地域の調達が進む。統合動員は難しくなる。", "地方の備蓄から守備隊に資金が供給された。", { wealth: 9, power: -5 }, { tags: ["isolation"] })),
    e("scientific_patronage", 2, "科学", "研究機関の独立",
      "観測機器を共同で使う研究者が増え、資金配分を誰が決めるべきか意見が割れた。",
      { any: [{ tags: ["open_science"] }, { needs: ["academy"] }] },
      c("研究成果を政策の基準とする", "技術開発が進む。地元の慣習とは摩擦が生じる。", "執行機関が研究機関の報告を予算配分の基準にした。", { knowledge: 13, order: -6 }, { tags: ["science_first", "merit"] }),
      c("公募で研究を支援する", "参加できる人が増える。審査に資金がかかる。", "研究計画を提出できる公募制度ができた。", { knowledge: 8, culture: 8, wealth: -6 }, { tags: ["individual", "open_science"] }),
      c("設備の使用を許可制にする", "投資先が明確になる。利用できる研究者は限られる。", "設備を使うには行政の許可が必要になった。", { wealth: 8, order: 6, culture: -6 }, { tags: ["controlled_tech"] })),
    e("population_registry", 3, "政治", "全国住民台帳",
      "中央機関が住民の移動と配給を一つの台帳にまとめようとしている。公共目的を越えた利用の範囲が争点になった。",
      { tags: ["totalitarian"] },
      c("行政と警備が台帳を共有する", "配給と動員を調整しやすい。住民の協力を得にくい地域も出る。", "行政機関と警備機関が共通の住民台帳を使い始めた。", { order: 9, power: 8, culture: -9 }, { flags: ["surveillance"], tags: ["controlled_tech"] }),
      c("期限と監査を設ける", "紛争を抑える。運用には独立した監査の費用がかかる。", "台帳の閲覧履歴を調べる監査官が置かれた。", { order: 8, culture: 5, wealth: -6 }, { flags: ["oversight"] }),
      c("地方の台帳を残す", "地域ごとの事情を扱える。広域の集計は遅れる。", "全国統合は見送られ、地方ごとの台帳が残った。", { culture: 9, power: -6 }, { tags: ["individual"] })),
    e("communal_compact", 3, "外交", "自治連合の総会",
      "自治都市と交易圏の代表が、議席を確保しながら条約を共通化する方法を話し合っている。",
      { any: [{ tags: ["federation"] }, { needs: ["civic_law"], tags: ["individual"] }], priority: 3 },
      c("住民代表の連合憲章を結ぶ", "参加権の共通基盤を作る。各都市が運営費を負担する。", "住民代表の議会と共通の権利を定めた連合憲章が成立した。", { culture: 9, order: 5, wealth: -7 }, { flags: ["civic_constitution"], tags: ["representative"] }),
      c("北嶺国と西湾国を連邦に統合する", "共通政府が二国の主権を引き受ける。中央の支出が増える。", "北嶺国と西湾国は加盟条約により主権の行使を連邦政府に委ねた。", { culture: 9, wealth: -8, power: -4 }, { when: { lacks: ["continental_rule"], minimum: { culture: 54, order: 47, wealth: 31 } }, flags: ["continental_rule"], tags: ["federation"] }),
      c("通商の取り決めだけを結ぶ", "物流が伸びる。政治的な決定は各都市に残る。", "物流規格と関税の取り決めが整った。", { wealth: 12, power: -6 }, { tags: ["federation"] }),
      c("独自制度を優先する", "地元の制度を維持する。域内の交流は縮む。", "自治都市は個別に協定する方式を続けた。", { order: 9, culture: -6 }, { tags: ["isolation"] })),
    e("sky_compact", 3, "科学", "空を見上げる共同事業",
      "複数の都市が、観測施設や大学の知見を持ち寄って宇宙研究の共同事業を提案した。",
      { minimum: { knowledge: 51, wealth: 24 }, any: [{ needs: ["shared_sky"] }, { tags: ["federation", "open_science"] }], priority: 3 },
      c("資金と研究設備を持ち寄って月を目指す", "単独負担を減らせる。計画の裁量を共有する。", "加盟都市が設備を提供し、共同月探査計画が設立された。", { knowledge: 8, culture: 4, wealth: -6 }, { flags: ["lunar_program", "launch_compact"] }),
      c("地上観測の共同事業にする", "観測網が広がる。発射設備への投資は見送る。", "既存の観測所を結ぶ研究網が開設された。", { knowledge: 10, order: 5, power: -5 }, { tags: ["open_science"] }),
      c("成果の利用料を財源にする", "観測成果が収益になる。無料利用の枠は縮む。", "事業のデータ利用料が財源になった。", { wealth: 12, culture: -6 })),
    e("scientists_cabinet", 3, "政治", "科学者による内閣",
      "工業や衛生を担ってきた研究者たちが、技術予算を決定する執行権を求めた。",
      { tags: ["science_first"] },
      c("研究評議会に執行権を渡す", "長期計画を立てやすい。専門外の代表の権限は縮む。", "研究評議会が行政予算の執行を担った。", { knowledge: 13, order: 4, culture: -7 }, { tags: ["technocracy"] }),
      c("助言と行政を分ける", "審査に異なる立場を含められる。承認までの費用が増える。", "研究者の報告を行政と市民が審査する制度ができた。", { culture: 8, knowledge: 6, wealth: -6 }, { flags: ["oversight"] }),
      c("研究を民間の契約に委ねる", "事業収入が増える。長期の基礎研究は減る。", "研究予算の一部が企業との契約に移った。", { wealth: 12, knowledge: -6 }, { remove: ["science_first"] })),
    e("launch_facility", 4, "科学", "打ち上げ施設の整備",
      "月探査計画には、地上の追跡局、発射施設と試験費用が必要だ。資金の出し方によって、計画の指揮と設備の利用権が変わる。",
      { needs: ["lunar_program"], minimum: { knowledge: 60 }, priority: 5 },
      c("公費で発射施設と追跡局を整える", "指揮を一元化できる。整備に大きな予算がかかる。", "発射施設と追跡局の試験が終わった。", { knowledge: 7, wealth: -10 }, { when: { minimum: { wealth: 44 } }, flags: ["launch_ready"] }),
      c("観測協定の設備を共同利用する", "建設費を抑えられる。共同意思決定に人員を割く。", "加盟都市の施設をつないだ発射体制ができた。", { knowledge: 6, wealth: -5, order: -4 }, { when: { needs: ["launch_compact"], minimum: { wealth: 27 } }, flags: ["launch_ready"] }),
      c("観測通信を商用に開放する", "資金を確保できる。月面用の設備は次の予算を待つ。", "地上通信設備に利用料が入るようになった。", { wealth: 13, culture: -6 }),
      c("地上での長期試験に切り替える", "試験データは増える。発射の準備が遅れる。", "施設の一部が地上試験に使われた。", { knowledge: 10, wealth: -5 })),
    e("integration", 4, "外交", "編入地の統治",
      "北嶺国と西湾国の旧機関は、共通政府と予算を分け合っている。残る二国と交渉する前に、新しい支配領域の統治方法を定める必要がある。",
      { needs: ["continental_rule"], priority: 5 },
      c("統合補給網を整備する", "遠隔地まで行政と軍を維持できる。費用と摩擦が増える。", "共通政府が新領域の補給拠点と輸送を管理し始めた。", { power: 9, order: -7, wealth: -8 }, { when: { needs: ["army"], minimum: { power: 68, wealth: 36 } }, flags: ["military_logistics"] }),
      c("連邦の統合評議会を設ける", "編入地が共通政府に参加する。議席と予算の調整に費用がかかる。", "旧二国の機関が共通政府の一部に組み込まれた。", { culture: 8, order: 6, wealth: -9 }, { when: { minimum: { culture: 57, order: 48, wealth: 34 }, any: [{ tags: ["federation"] }, { needs: ["civic_law"] }] }, flags: ["federal_integration"], tags: ["federation"] }),
      c("地域に日常行政を委ねる", "行政負担が減る。次の統合に使える資源も限られる。", "日常の行政を引き続き旧二国の地域機関が担った。", { wealth: 9, power: -5 }),
      c("中央の規則を順次整理する", "法の適用が安定する。新たな領域の統合には手を付けない。", "中央の法規を土地ごとに整理した。", { order: 10, wealth: -5 })),
    e("lunar_sanctuary", 4, "宗教", "月面神殿計画",
      "月を祭る共同体が、探査が実現したときに備え、月面に何を残すべきか提案を集めた。",
      { tags: ["moon_cult"] },
      c("祭祀の基金を研究と共有する", "計画の財源が広がる。祭祀側と設備の運用を分担する。", "基金が共同観測と打ち上げのための資金を拠出した。", { wealth: 8, knowledge: 7, order: -6 }, { flags: ["launch_compact"] }),
      c("地上に月の神殿を築く", "祭礼の場が増える。建設費を使う。", "月の暦を記した神殿が地上に建立された。", { culture: 12, order: 5, wealth: -8 }, { tags: ["state_faith"] }),
      c("月面を観測のために保全する", "観測の合意が進む。従来の祭礼を守る地区では反発が出る。", "月面設備の用途を観測と記録に限る協定ができた。", { knowledge: 10, culture: -6 }, { tags: ["open_science"] })),
    e("official_history", 4, "文化", "国史の改訂",
      "国家の展示と教科書で、過去の決定について異なる記録が見つかった。編纂局はどの史料を出すか決めることになった。",
      { tags: ["totalitarian"] },
      c("単一の国史を編纂する", "行政の説明がそろう。地方の史料へのアクセスは狭まる。", "政府の定めた一冊が全国の課程で使われた。", { order: 11, culture: -7 }, { tags: ["collective"] }),
      c("異なる史料も閲覧できるようにする", "記録の研究が進む。公的な説明をめぐる論争が増える。", "正史と原史料の両方が公開された。", { culture: 10, knowledge: 5, order: -7 }, { flags: ["oversight"] }),
      c("編纂権を各地に戻す", "地方の記録が残る。行政で共通の見解を作りにくい。", "地方の研究機関が各地の史料を編纂し始めた。", { culture: 9, order: -6 }, { tags: ["representative"] })),
    e("missing_reports", 4, "政治", "届かなかった報告書",
      "中央には事業の数字がそろっているが、現地の担当者が送った失敗の報告がいくつか欠落していた。",
      { tags: ["totalitarian"], needs: ["surveillance"] },
      c("現地監査の結果を収集する", "情報の精度が上がる。現地への監査に資金を使う。", "事業の実績は監査結果と突き合わせて修正された。", { knowledge: 10, order: 6, wealth: -8 }, { flags: ["oversight"] }),
      c("統計の提出を中央局に一本化する", "処理が早まる。現地の異論を拾いにくくなる。", "中央の統計局だけが政府の資料を作るようになった。", { order: 8, wealth: 5, knowledge: -8 }),
      c("地方に報告の公開権を戻す", "欠測が減る。中央は情報公開の裁量を失う。", "地方機関は欠測を含む元資料を公開した。", { knowledge: 9, culture: 6, order: -7 }, { tags: ["council_rule"] })),
    e("leader_succession", 4, "政治", "中央の後継者",
      "長く予算と人事を裁定してきた指導者が退いた。後継者を誰が選ぶか、中央機関の間で解釈が分かれた。",
      { tags: ["totalitarian"] },
      c("執行機関の内部で後継者を選ぶ", "行政を早く再開できる。地方から異議が出る。", "中央の執行機関が後継者を選んだ。", { order: 10, power: 4, culture: -7 }),
      c("地方代表に選出を委ねる", "地方の合意を得やすい。候補者の調整が長引く。", "地方代表の評議会が後継者を選ぶ手続きを定めた。", { culture: 10, order: -6 }, { tags: ["representative"] }),
      c("各機関の暫定協議会を開く", "集団で職務を引き継げる。協議と監査の費用が増える。", "複数の中央機関が暫定協議会で権限を分担した。", { order: 7, knowledge: 6, wealth: -8 }, { flags: ["oversight"] })),
    e("algorithmic_policy", 4, "科学", "政策を決める演算機",
      "多数の政策案から資材の配分を選ぶシステムが試験を終えた。試験では処理が速い一方、想定外の地域差も観測された。",
      { any: [{ tags: ["science_first"] }, { tags: ["technocracy"] }] },
      c("配分の執行を演算機に任せる", "配分を素早く更新できる。例外申請に時間がかかる。", "配分の執行権が公共の演算機に移された。", { knowledge: 10, wealth: 7, order: -8 }, { tags: ["algorithmic"] }),
      c("試算だけに使い審査を続ける", "試算を比較できる。人による審査の費用が続く。", "計算の結果を審査会に提出する運用が始まった。", { knowledge: 9, order: 5, wealth: -6 }, { flags: ["oversight"] }),
      c("自治体ごとに別の方式を試す", "土地に適した制度を比較できる。広域の集計は遅れる。", "各地で異なる配分方式の試用が始まった。", { culture: 9, order: -5 }, { tags: ["individual"] })),
    e("augmentation", 4, "社会改革", "身体拡張の規則",
      "補助機器を職場で使う人が増えた。職業上の利点と、導入費や身体の情報をどう扱うかが論点になっている。",
      { tags: ["science_first"] },
      c("補助機器を公共事業に導入する", "生産が増える。支給対象をめぐって調整が必要になる。", "公費で補助機器を提供する事業が始まった。", { knowledge: 8, wealth: 8, order: -7 }, { tags: ["collective"] }),
      c("本人の選択と互換規格を保障する", "異なる機器を選びやすくなる。規格の検査が必要になる。", "本人の同意と互換規格が利用の条件になった。", { culture: 11, order: 5, wealth: -7 }, { tags: ["individual"] }),
      c("利用を限定し影響を記録する", "影響を比較できる。普及による収入は先送りになる。", "同意を得た試験の範囲内で利用が続いた。", { knowledge: 11, wealth: -6 }, { tags: ["controlled_tech"] })),
  ];

  Object.assign(choices, {
    "rocketry:4": { tags: ["science_first"], flags: ["lunar_program", "launch_compact"], when: { minimum: { wealth: 34 }, any: [{ tags: ["technocracy"] }, { tags: ["science_first"] }] } },
  });
  const additions = {
    rocketry: [c("研究機関の共同出資で進める", "初期費用を分担する。設備を他の研究にも開放する。", "複数の研究機関が共同で月探査に出資した。", { knowledge: 7, wealth: -5, power: -4 })],
    world_treaty: [c("残る二国を参加国として統合する", "共通政府が二国の主権を引き受ける。議席と予算の再配分が必要になる。", "南原国と東洋国は連邦条約を批准し、主権を共通政府に委ねた。", { culture: 6, order: -7, wealth: -10 },
      { when: { needs: ["federal_integration"], minimum: { culture: 64, order: 53, wealth: 36 } }, flags: ["world_rule"] })],
  };

  choices["world_treaty:1"] = { when: { needs: ["military_logistics"], minimum: { power: 78, order: 47, wealth: 41 } } };
  // 条件付き統合案が片方しか成立しない場合でも、代案を含めて3つ表示される。
  choices["moon:1"] = {
    adjustments: [
      { when: { needs: ["launch_compact"] }, delta: { wealth: -7 }, result: "各拠点が追跡を分担し、打ち上げた着陸機は月面への到達を報告した。" },
    ],
  };
  eventRules.rocketry.lacks = ["lunar_program"];
  eventRules.continental_war.lacks = ["continental_rule"];
  eventRules.sky_compact = { lacks: ["lunar_program"] };

  window.CivIdeologies = { tags, groups, choices, flags, eventRules, events, additions };
})();
