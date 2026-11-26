(() => {
  "use strict";

  const ALPHA_EVENTS = window.CivEvents;
  const ideology = window.CivIdeologies;
  const chronicle = window.CivChronicle;
  const crossroads = window.CivCrossroads;
  const historyData = window.CivHistory;
  const achievements = window.CivAchievements;
  const balance = window.CivBalance;
  const CURRENT_VERSION = 8;
  const GROUPS = Object.fromEntries(Object.entries(ideology.groups).map(([id, group]) =>
    [id, { ...group, tags: { ...group.tags, ...chronicle.extraGroups[id] } }]));
  const TAGS = Object.fromEntries(Object.entries(GROUPS).flatMap(([group, info]) =>
    Object.entries(info.tags).map(([id, name]) => [id, { group, name }])));
  const LEGACY_LIMIT = 30;
  const PRIOR_LIMIT = 60;
  const LIMIT = 90;
  const ERA_DURATIONS = [12, 14, 15, 15, 34];
  const ERA_STARTS = [0, 12, 26, 41, 56];
  const eraLength = version => version < 3 ? 6 : 12;
  const limitFor = version => version < 3 ? LEGACY_LIMIT : version < 6 ? PRIOR_LIMIT : LIMIT;
  const EVENTS = [...ALPHA_EVENTS, ...ideology.events].map(event => ({
    ...event,
    public: { ...event.public, body: ideology.eventRules[event.id]?.body ?? event.public.body },
    rules: { ...event.rules, ...ideology.eventRules[event.id] },
    choices: [...event.choices, ...(ideology.additions[event.id] ?? [])].map((choice, index) => ({
      ...choice, rules: { ...choice.rules, ...ideology.choices[`${event.id}:${index + 1}`] },
    })),
  }));
  const V3_EVENTS = [...EVENTS, ...chronicle.events].map(event => {
    const { body, choiceRules, ...rules } = chronicle.eventRules[event.id] ?? {};
    return {
      ...event,
      field: event.field ?? chronicle.fields[event.public.category],
      public: { ...event.public, body: body ?? event.public.body },
      rules: { ...event.rules, ...rules },
      choices: event.choices.map((choice, index) => ({
        ...choice, rules: { ...choice.rules, ...choiceRules?.[index + 1] },
      })),
    };
  });
  const V4_EVENTS = [...V3_EVENTS, ...crossroads.events].map(event => {
    const { body, choiceRules, choiceText, ...rules } = crossroads.eventRules[event.id] ?? {};
    const choices = event.rules.crisis && event.id.startsWith("recovery_") ? crossroads.recoveryChoices :
      [...event.choices, ...(crossroads.additions[event.id] ?? [])];
    return {
      ...event, rules: { ...event.rules, ...rules },
      public: { ...event.public, body: body ?? event.public.body },
      choices: choices.map((choice, index) => ({
        public: { ...choice.public, ...choiceText?.[index + 1] },
        rules: { ...choice.rules, ...choiceRules?.[index + 1] },
      })),
    };
  });
  const V5_EVENTS = [
    ...V4_EVENTS.map(event => event.id === "communal_compact" ? {
      ...event, rules: { ...event.rules, fromEra: 3 },
    } : event),
    ...historyData.events,
  ];
  const V6_EVENTS = [...V5_EVENTS.map(event => achievements.eventRules[event.id] ? {
    ...event, rules: { ...event.rules, ...achievements.eventRules[event.id] },
  } : event), ...achievements.events];
  const V7_EVENTS = [...V6_EVENTS.map(event => {
    const { rules, choiceRules, choices } = balance.overrides[event.id] ?? {};
    if (!rules && !choiceRules && !choices) return event;
    return { ...event, rules: { ...event.rules, ...rules },
      choices: [...event.choices.map((choice, index) => ({
        ...choice, rules: { ...choice.rules, ...choiceRules?.[index + 1] },
      })), ...(choices ?? [])] };
  }), ...balance.events];
  const V8_EVENTS = V7_EVENTS.map(event => ({
    ...event, choices: event.choices.map((choice, index) => {
      const id = `${event.id}:${index + 1}`;
      const heritage = balance.legaciesV8[id];
      if (id === "moon:3") return { ...choice, public: { ...choice.public, title: "打ち上げを見送って予算を戻す" } };
      if (id === "first_full_election:3") return { ...choice, public: { ...choice.public, summary: "短期の行政負担を抑える。今回の全国投票は行わない。" } };
      return heritage ? { ...choice, rules: { ...choice.rules, heritage } } : choice;
    }),
  }));
  const catalogs = { 1: ALPHA_EVENTS, 2: EVENTS, 3: V3_EVENTS, 4: V4_EVENTS, 5: V5_EVENTS, 6: V6_EVENTS, 7: V7_EVENTS, 8: V8_EVENTS };
  const finalEvents = Object.fromEntries([6, 7, 8].map(version => [version,
    Object.fromEntries(Object.entries(balance.finalFlags).map(([goal, flag]) => [goal,
      catalogs[version].filter(event => event.choices.some(choice => choice.rules.flags.includes(flag)))]))]));
  const finalGoal = new Map(Object.entries(finalEvents[8]).flatMap(([goal, events]) =>
    events.map(event => [event.id, goal])));
  const flagSources = new Map();
  const revocableFlags = new Set();
  for (const event of V8_EVENTS) {
    const addSource = flag => {
      if (!flagSources.has(flag)) flagSources.set(flag, new Set());
      flagSources.get(flag).add(event);
    };
    for (const choice of event.choices) {
      for (const rules of [choice.rules, choice.rules.heritage, ...(choice.rules.risk ?? []).map(risk => risk.rules)].filter(Boolean)) {
        for (const flag of rules.flags ?? []) addSource(flag);
        for (const flag of rules.revoke ?? []) revocableFlags.add(flag);
      }
    }
    for (const effect of event.incident?.disruptions ?? []) {
      revocableFlags.add(effect.flag);
      if (effect.open) addSource(effect.open);
    }
    if (event.incident?.scar) addSource(event.incident.scar);
  }
  const trophyRoutes = new Map();
  for (const [id, item] of Object.entries(achievements.trophies)) {
    for (const [index, route] of item.routes.entries()) {
      for (const choice of route.choices) {
        if (!trophyRoutes.has(choice)) trophyRoutes.set(choice, []);
        trophyRoutes.get(choice).push({ id, routeId: `${id}:${index + 1}`, ...route });
      }
    }
  }
  for (const [id, routes] of Object.entries(balance.trophyRoutes)) {
    for (const [index, route] of routes.entries()) {
      for (const choice of route.choices) {
        if (!trophyRoutes.has(choice)) trophyRoutes.set(choice, []);
        trophyRoutes.get(choice).push({ id, routeId: `${id}:extra:${index + 1}`, since: 7, ...route });
      }
    }
  }
  const byVersion = Object.fromEntries(Object.entries(catalogs).map(([version, items]) => [
    version, Object.fromEntries(items.map(event => [event.id, event])),
  ]));
  const eventsFor = state => catalogs[state.version];
  const eventFor = state => byVersion[state.version][state.current];
  const ALPHA_BY_ID = byVersion[1];
  const ERAS = [
    { name: "原始", english: "PRIMITIVE", years: [-10000, -8700, -7400, -6100, -4800, -3500] },
    { name: "古代", english: "ANCIENT", years: [-3000, -2400, -1800, -1200, -600, 100] },
    { name: "中世", english: "MEDIEVAL", years: [500, 680, 860, 1040, 1220, 1400] },
    { name: "近代", english: "MODERN", years: [1500, 1600, 1700, 1800, 1900, 1980] },
    { name: "未来", english: "FUTURE", years: [2035, 2060, 2085, 2110, 2135, 2160] },
  ];
  const METRICS = {
    order: { name: "安定度", initial: 58, color: "#52755b", icon: "◆" },
    knowledge: { name: "科学力", initial: 35, color: "#607e9a", icon: "✺" },
    wealth: { name: "経済力", initial: 52, color: "#ab8550", icon: "▤" },
    culture: { name: "文化力", initial: 42, color: "#a27678", icon: "✿" },
    power: { name: "軍事力", initial: 32, color: "#77748c", icon: "✦" },
  };
  const FLAGS = {
    granary: "共同貯蔵庫", hunters: "狩猟団", tales: "口承の伝統", canals: "灌漑水路",
    market: "交易市場", accord: "通行協定", assembly: "代表集会", script: "公的な文字記録",
    civic_law: "公開の法と代表制", public_store: "穀物税による公的備蓄", army: "常設軍",
    academy: "公開教育・研究機関", press: "活字出版", industry: "産業基盤",
    constitution: "全国憲法", lunar_program: "月探査計画", continental_rule: "北嶺国・西湾国の編入",
    moon_landing: "月面到達", universal_vote: "完全普通選挙", world_rule: "南原国・東洋国の編入",
    ...ideology.flags, ...chronicle.flags, ...crossroads.flags, ...historyData.flags, ...achievements.flags, ...balance.flags,
  };
  const ORIGINAL_VICTORIES = {
    space: { title: "宇宙勝利", detail: "ロケットで月面に到達する", icon: "↗", epithet: "月へ届いた文明" },
    democracy: { title: "民主主義勝利", detail: "完全普通選挙を制定し、定着させる", icon: "◇", epithet: "一票を守り抜いた文明" },
    conquest: { title: "征服勝利", detail: "すべての独立国を支配する", icon: "⚑", epithet: "世界を統べた文明" },
  };
  const VICTORIES = {
    ...ORIGINAL_VICTORIES, conquest: { ...ORIGINAL_VICTORIES.conquest, title: "世界統一勝利", detail: "二段階の加盟・併合で四国を統合する" },
    ...crossroads.victories,
  };
  const victoryDefinitions = version => version < 4 ? ORIGINAL_VICTORIES : VICTORIES;
  const NATIONS = {
    north: "北嶺国", west: "西湾国", south: "南原国", east: "東洋国",
  };
  const LABELS = { collapse: "文明の崩壊", victory: "勝利による終幕", limit: "歴史の完結" };
  const freshMetrics = () => Object.fromEntries(Object.entries(METRICS).map(([key, value]) => [key, value.initial]));
  const eraAt = (turn, version = CURRENT_VERSION) => version >= 6
    ? Math.max(0, ERA_STARTS.findLastIndex(start => start <= turn)) : Math.min(4, Math.floor(turn / eraLength(version)));
  const slotAt = (turn, version) => version >= 6 ? turn - ERA_STARTS[eraAt(turn, version)] : turn % eraLength(version);
  function yearAt(turn, version = CURRENT_VERSION) {
    const era = eraAt(turn, version);
    const slot = slotAt(turn, version);
    const years = ERAS[era].years;
    if (version >= 6) {
      const end = ERAS[era + 1]?.years[0] ?? 2490;
      const points = era === 4 ? [2035, 2060, 2100, 2170, 2265, 2370, end] : [...years, end];
      const position = 6 * slot / ERA_DURATIONS[era];
      const index = Math.floor(position);
      return Math.floor(points[index] + (points[index + 1] - points[index]) * (position - index));
    }
    if (version < 3) return years[slot];
    const year = years[Math.floor(slot / 2)];
    const next = years[Math.floor(slot / 2) + 1] ?? ERAS[era + 1]?.years[0] ?? 2210;
    return slot % 2 === 0 ? year : Math.floor((year + next) / 2);
  }
  const regimeOf = tags => Object.keys(tags ?? {}).find(id => TAGS[id].group === "politics") ?? null;
  const availableLegacy = (state, expected = true) => Object.entries(state.legacies ?? {}).find(([id, legacy]) =>
    (expected === true || id === expected) && state.history.length >= legacy.transition + 2);
  const activeCrisis = state => state.crises?.findLast(crisis => crisis.recoveredAt == null);
  const mayRecur = (id, version) => version >= 7 && Boolean(byVersion[version][id]?.rules.crisisExchange);
  const depletedBy = metrics => ["order", "wealth"].filter(key => metrics[key] === 0);
  const yearLabel = year => year < 0 ? `紀元前${Math.abs(year).toLocaleString("ja-JP")}年` : `西暦${year.toLocaleString("ja-JP")}年`;
  const clamp = value => Math.min(100, Math.max(0, value));
  // The first part of a gain is unchanged. Mature indicators rise more slowly above 72 and 90.
  function metricAfter(version, value, delta) {
    if (version < 6 || delta <= 0) return clamp(value + delta);
    const linear = Math.min(delta, Math.max(0, 72 - value));
    const middle = Math.min(delta - linear, Math.max(0, 90 - value - linear));
    const tail = delta - linear - middle;
    return clamp(value + Math.max(1, Math.round(linear + middle * 0.58 + tail * 0.31)));
  }

  function availableChoices(state, event) {
    return event.choices.flatMap((choice, index) => {
      const path = conditionPath(state, choice.rules.when);
      if (!path) return [];
      const warning = choice.rules.risk?.some(item => conditionPath(state, item.when))
        ? " 現在の条件では合意・認可が難しい。" : "";
      return [{
        choice, path, option: { id: `${event.id}:${index + 1}`, title: choice.public.title, summary: choice.public.summary + warning },
      }];
    });
  }

  // Return the satisfied clauses so the cause links use only the route actually available.
  function proposalMatches(state, expected) {
    const proposal = state.proposal;
    if (!proposal || state.history.length < proposal.turn + 1) return false;
    return expected === "restoration" ? proposal.restoring :
      expected === "democracy" ? proposal.id === "democracy" && !proposal.restoring :
      proposal.id !== "democracy" && !proposal.restoring;
  }

  function conditionPath(state, condition) {
    if (!condition) return [];
    if (!(condition.needs ?? []).every(id => Object.hasOwn(state.flags, id)) ||
        (condition.lacks ?? []).some(id => Object.hasOwn(state.flags, id)) ||
        !(condition.tags ?? []).every(id => Object.hasOwn(state.tags, id)) ||
        !Object.entries(condition.minimum ?? {}).every(([key, value]) => state.metrics[key] >= value) ||
        !Object.entries(condition.maximum ?? {}).every(([key, value]) => state.metrics[key] <= value) ||
        (condition.proposal && !proposalMatches(state, condition.proposal)) ||
        (condition.crisis && !activeCrisis(state)) ||
        (condition.crisisAge && state.history.length - activeCrisis(state)?.startedAt < condition.crisisAge) ||
        (condition.fiscal && activeCrisis(state)) ||
        (condition.burden && !state.burdens?.[condition.burden]) ||
        (condition.flagsSeen ?? []).some(id => !state.history.some(entry => entry.selected?.id === id)) ||
        !Object.entries(condition.ages ?? {}).every(([id, age]) =>
          Object.hasOwn(state.flags, id) && state.history.length + 1 - state.flags[id] >= age) ||
        (condition.legacy && (!availableLegacy(state, condition.legacy) || state.proposal)) ||
        (condition.lastSlot != null && slotAt(state.history.length, state.version) > condition.lastSlot) ||
        (condition.afterTurn != null && state.history.length + 1 < condition.afterTurn) ||
        (condition.trophies ?? []).some(id => !state.trophies?.[id]) ||
        !Object.entries(condition.trophyAge ?? {}).every(([id, age]) =>
          state.trophies?.[id] && state.history.length + 1 - state.trophies[id].turn >= age) ||
        !Object.entries(condition.trophyContext ?? {}).every(([id, context]) => state.trophies?.[id]?.contextId === context) ||
        Object.entries(condition.lacksLegacy ?? {}).some(([id, status]) => state.trophyLegacy?.[id]?.status === status)) return null;
    if (!condition.any) return [condition];
    for (const alternative of condition.any) {
      const path = conditionPath(state, alternative);
      if (path) return [condition, ...path];
    }
    return null;
  }

  function hash(seed) {
    let value = 2166136261;
    for (const character of seed) value = Math.imul(value ^ character.codePointAt(0), 16777619);
    return value >>> 0;
  }

  function random(state) {
    state.rng = (state.rng + 0x6D2B79F5) >>> 0;
    let value = Math.imul(state.rng ^ (state.rng >>> 15), state.rng | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  function inEra(state, event) {
    const era = eraAt(state.history.length, state.version);
    return event.rules.fromEra != null ? era >= event.rules.fromEra :
      event.era === era || (state.version >= 3 && event.era == null && !event.rules.fallback);
  }

  function selectEvent(state, audit) {
    const all = eventsFor(state);
    const seen = new Set(state.history.map(entry => entry.eventId));
    const crisis = activeCrisis(state);
    const candidates = all.filter(event => inEra(state, event) &&
      (!seen.has(event.id) || mayRecur(event.id, state.version) && crisis &&
        !state.history.some(entry => entry.eventId === event.id && entry.turn >= crisis.startedAt)));
    const eligible = candidates.filter(event => !event.incident && conditionPath(state, event.rules) && availableChoices(state, event).length >= 3);
    if (state.version >= 4 && activeCrisis(state)) {
      const crisis = activeCrisis(state);
      const delayed = candidates.filter(event => event.rules.fiscal &&
        conditionPath(state, { ...event.rules, fiscal: false }) && availableChoices(state, event).length >= 3);
      for (const event of delayed) {
        if (!crisis.delays.some(item => item.eventId === event.id)) crisis.delays.push({
          turn: state.history.length + 1, eventId: event.id, title: event.public.title,
        });
      }
    }
    const priorities = new Map(eligible.map(event => [event, event.rules.heritagePriority && conditionPath(state, event.rules.heritagePriority.when) ?
      event.rules.heritagePriority.value : event.rules.priority ?? 0]));
    const priorityOf = event => priorities.get(event);
    const priority = Math.max(0, ...eligible.map(priorityOf));
    const incident = state.version >= 5 ? drawIncident(state, candidates, priority) : null;
    // Urgent commitments retain their precedence. Contemporaneous civic events can vary in order.
    const spread = state.version >= 6 && priority <= 3 ? 1.2 :
      state.version >= 5 && priority >= 4.4 && priority < 7 ? 0.5 : 0;
    const pool = eligible.filter(item => priorityOf(item) >= priority - spread);
    let selected = incident ?? all.find(item => item.rules.fallback);
    if (!incident && pool.length) {
      let weight = random(state) * pool.reduce((sum, item) => sum + (item.rules.weight ?? 1), 0);
      selected = pool.find(item => (weight -= item.rules.weight ?? 1) < 0) ?? pool.at(-1);
    }
    if (audit && state.version >= 6) audit({
      turn: state.history.length + 1, selected: selected.id, incident: Boolean(incident),
      finals: inspectFinals(state, seen, eligible, pool, selected),
      crisis: activeCrisis(state)?.startedAt ?? null,
      religion: crossroads.projects.religion.filter(id => state.flags[id]),
      democracyStability: Boolean(electionStart(state)),
    });
    return selected.id;
  }

  function inspectFinals(state, seen, eligible, pool, selected) {
    return Object.fromEntries(Object.entries(finalEvents[state.version]).map(([goal, events]) => [goal,
      events.map(event => {
        const status = seen.has(event.id) ? "used" : selected.id === event.id ? "shown" :
          pool.includes(event) ? "pool" : eligible.includes(event) ? "eligible" : finalGate(state, event).status;
        return { id: event.id, status };
      })]));
  }

  function finalGate(state, event) {
    const { needs, lacks, afterTurn, lastSlot, ages, fiscal, minimum, maximum, any } = event.rules;
    if (!conditionPath(state, { needs, lacks })) return { status: "prerequisites" };
    if (!inEra(state, event) || !conditionPath(state, { afterTurn, lastSlot })) return { status: "calendar" };
    if (!conditionPath(state, { ages })) return { status: "maturation" };
    if (fiscal && activeCrisis(state)) return { status: "crisis" };
    const shortOf = Object.keys({ ...minimum, ...maximum }).filter(key =>
      !conditionPath(state, { minimum: minimum?.[key] == null ? null : { [key]: minimum[key] },
        maximum: maximum?.[key] == null ? null : { [key]: maximum[key] } }));
    if (shortOf.length) return { status: "metrics", metrics: shortOf };
    if (conditionPath(state, event.rules) && availableChoices(state, event).length >= 3) return { status: "eligible" };
    // Alternatives often distinguish different routes, so describe the missing requirement as a group.
    const indicators = [...new Set((any ?? []).flatMap(route => Object.keys(route.minimum ?? {})))];
    return { status: "institution", ...(indicators.length ? { metrics: indicators } : {}) };
  }

  function finalReadiness(state, goal, details, used) {
    if (details.achievedAt) return { status: "achieved", text: "達成" };
    if (state.version >= 8 && state.end) return { status: "ended", text: "終幕時に未達成" };
    if (goal === "democracy" && state.flags.election_held) {
      if (!electionStart(state)) return { status: "institution", text: "現体制での選挙執行の根拠が不足" };
      if (activeCrisis(state)) return { status: "crisis", text: "経済危機で選挙制度の定着を保留中" };
      if (state.metrics.order < details.stabilityFloor) return { status: "metrics", text: "選挙制度の定着には安定度が必要" };
      return { status: "stability", text: `選挙制度を定着中 ${Math.min(details.consecutiveStability, 3)} / 3` };
    }
    const finals = finalEvents[state.version][goal].filter(event => !used.has(event.id));
    if (finals.some(event => event.id === state.current)) return { status: "shown", text: "最終段階を審議中" };
    if (state.version >= 8 && state.history.some(entry => entry.selected?.finalProcedure?.goal === goal &&
        entry.selected.finalProcedure.action === "pass")) {
      const outlook = retryOutlook(state, goal);
      if (outlook === "closed") return { status: "used", text: "見送り後に実施できる最終手続きは終了" };
      if (outlook === "horizon") return { status: "calendar", text: "見送り後に再挑戦して達成できる期間は終了" };
    }
    const stages = finals.map(event => finalGate(state, event));
    for (const status of ["eligible", "crisis", "metrics", "maturation", "institution", "calendar"]) {
      const stage = stages.find(item => item.status === status);
      if (!stage) continue;
      const text = {
        eligible: "最終段階の条件を満たし、議題入りを待機中",
        crisis: "経済危機で最終段階の審議を保留中",
        metrics: `最終段階に必要な${stage.metrics?.map(id => METRICS[id].name).join("・")}が不足`,
        maturation: "合意後の試行期間が必要",
        institution: `最終段階の審査・制度条件${stage.metrics ? "または実行条件" : ""}が未成立`,
        calendar: "最終段階を扱える時期の条件が未成立",
      }[status];
      return { ...stage, text };
    }
    const next = details.milestones.find(item => !item.turn);
    if (!finals.length) return { status: "used", text: "今期に成立できる最終手続きは終了" };
    return { status: "prerequisites", text: next ? `次の主要条件　${next.label}` : "前段の制度や手続きが必要" };
  }

  // A turn-local random stream is independent of policy selection and the regular event draw.
  function drawIncident(state, candidates, priority) {
    const turn = state.history.length + 1;
    const past = state.history.filter(entry => entry.incident);
    if (turn < 3 || priority >= 9 || past.at(-1)?.turn >= turn - 2) return null;
    const stream = { rng: hash(`${state.seed}|incident|${turn}`) };
    const roll = random(stream);
    const exceptional = 0.00045;
    const major = 0.009;
    const ordinary = priority >= 7 ? 0.025 : priority >= 4.5 ? 0.085 : 0.155;
    if (roll >= ordinary) return null;
    const rank = roll < exceptional ? "exceptional" : roll < major ? "major" : "ordinary";
    const pool = candidates.filter(event => event.incident?.severity === rank);
    return pool.length ? pool[Math.floor(random(stream) * pool.length)] : null;
  }

  function applyIncident(state, event) {
    const { incident } = event;
    const turn = state.history.length + 1;
    const before = { ...state.metrics };
    const after = { ...before };
    const newProtections = state.version >= 7 ? balance.protections[event.id] ?? [] : [];
    const protections = [...(incident.protections ?? []), ...newProtections].filter(item => conditionPath(state, item.when));
    const protectionLinks = prerequisites(state, protections.flatMap(item => conditionPath(state, item.when)));
    for (const [metric, amount] of Object.entries(incident.delta)) {
      const offset = protections.reduce((sum, item) => sum + (item.delta[metric] ?? 0), 0);
      // Institutions can absorb losses, without turning a loss into an automatic windfall.
      const effect = amount < 0 ? Math.min(0, amount + offset) : amount;
      after[metric] = clamp(before[metric] + effect);
    }
    state.metrics = after;
    const changes = Object.fromEntries(Object.keys(METRICS).map(key => [key, after[key] - before[key]]));
    const prevented = Object.fromEntries(Object.entries(incident.delta).flatMap(([metric, amount]) => {
      const saved = after[metric] - clamp(before[metric] + amount);
      return saved > 0 ? [[metric, saved]] : [];
    }));
    const revoked = [];
    const raised = [];
    const setbacks = [];
    for (const disruption of incident.disruptions ?? []) {
      if (!state.flags[disruption.flag] || (disruption.protectedBy && state.flags[disruption.protectedBy])) continue;
      revoked.push({ id: disruption.flag, foundedAt: state.flags[disruption.flag] });
      delete state.flags[disruption.flag];
      if (disruption.open && !state.flags[disruption.open]) {
        state.flags[disruption.open] = turn;
        raised.push(disruption.open);
      }
      setbacks.push({ goal: disruption.goal, outcome: disruption.reason });
    }
    if (incident.scar && !state.flags[incident.scar]) {
      state.flags[incident.scar] = turn;
      raised.push(incident.scar);
    }
    const record = {
      source: "chance", kind: incident.kind, severity: incident.severity, narrative: incident.narrative,
      before, after: { ...after }, changes, prevented, protections: protectionLinks, raised, revoked, setbacks,
    };
    const entry = {
      turn, era: eraAt(turn - 1, state.version), year: yearAt(turn - 1, state.version),
      eventId: event.id, eventTitle: event.public.title, category: event.public.category, body: event.public.body,
      actor: "chance", selected: null, alternatives: [], result: incident.narrative,
      before, after: { ...after }, changes, institutions: [], institutionsEnded: [], nations: [], victories: [],
      causes: protectionLinks.filter(link => link.turn < turn), government: [], legacy: [],
      ideology: { formed: [], ended: [] }, obligations: [], conflicts: [], incident: record,
    };
    updateCrisis(state, entry);
    if (entry.crisis) record.crisis = entry.crisis;
    state.incident = record;
    const depleted = depletedBy(state.metrics);
    if (depleted.length) {
      if (event.person) entry.people = [event.person];
      state.history.push(entry);
      state.incident = null;
      state.current = null;
      state.end = { reason: "collapse", turn, depleted, source: "chance", eventId: event.id, direct: incident.narrative };
    }
  }

  function create(seed = "CIV-1042", version = CURRENT_VERSION) {
    const cleanSeed = String(seed).trim().slice(0, 64) || "CIV-1042";
    const names = ["アウレリア", "セレニア", "アステリア", "ヴァレリア", "エルディア", "ルミナ"];
    return {
      version, seed: cleanSeed, rng: hash(cleanSeed),
      name: names[hash(cleanSeed) % names.length],
      metrics: freshMetrics(), flags: {}, ...(version === 1 ? {} : { tags: {} }),
      ...(version < 3 ? {} : { proposal: null, legacies: {}, crises: [] }),
      ...(version < 4 ? {} : { governance: null, burdens: {} }),
      ...(version < 5 ? {} : { incident: null }),
      ...(version < 6 ? {} : { trophies: {}, trophyLegacy: {} }), nations: {}, victories: {}, history: [],
      current: EVENTS.find(item => item.rules.opening).id, pendingVictory: false, end: null,
    };
  }

  // An unplayed alternative is a conditional possibility, never a promise of a draw.
  // Reject routes ruled out by dates, permanent exclusions or exhausted sources of a required flag.
  function retryOutlook(state, goal, enacted = null) {
    const turn = state.history.length + (enacted ? 1 : 0);
    const deadline = limitFor(state.version) - (goal === "democracy" ? 2 : 0);
    if (turn >= deadline) return "horizon";
    const flags = new Set([...Object.keys(state.flags), ...(enacted?.flags ?? [])]);
    for (const flag of enacted?.revoke ?? []) flags.delete(flag);
    const used = new Set(state.history.map(entry => entry.eventId));
    if (enacted) used.add(state.current);
    function hasWindow(event, latest) {
      if (used.has(event.id) && !mayRecur(event.id, state.version)) return false;
      if (event.rules.lacks?.some(flag => flags.has(flag) && !revocableFlags.has(flag))) return false;
      const era = event.rules.fromEra ?? event.era;
      const first = Math.max(turn + 1, event.rules.afterTurn ?? 1, (ERA_STARTS[era] ?? 0) + 1);
      const last = event.rules.fromEra == null && event.era != null ? ERA_STARTS[era] + ERA_DURATIONS[era] : LIMIT;
      return first <= Math.min(last, latest) && (event.rules.lastSlot == null || slotAt(first - 1, state.version) <= event.rules.lastSlot);
    }
    function possible(condition, target) {
      if (condition.needs?.some(flag => !flags.has(flag) &&
          !Array.from(flagSources.get(flag) ?? []).some(source => source !== target && hasWindow(source, deadline - 1)))) return false;
      return !condition.any || condition.any.some(branch => possible(branch, target));
    }
    return finalEvents[state.version][goal].some(event => hasWindow(event, deadline) && possible(event.rules, event))
      ? "conditional" : "closed";
  }

  function procedureView(state, goal, enacted) {
    const advances = enacted.flags.includes(balance.finalFlags[goal]);
    if (advances) {
      const text = goal === "democracy" ? (state.history.length + 3 > LIMIT
        ? "全国投票を実施する。残り期間では制度の定着に必要なターン数に届かない。"
        : "全国投票の後、経済危機を脱し、安定した運用が続くと制度が定着する。") : null;
      return { goal, action: "advance", text };
    }
    const outlook = retryOutlook(state, goal, enacted);
    const text = {
      conditional: "この手続きは今回限り。別の手続きで再び審議できるかは、残りの期間と条件による。",
      closed: `この手続きを見送ると、今期の${VICTORIES[goal].title}の最終機会は終了する。`,
      horizon: `この手続きを見送ると、残りターンで${VICTORIES[goal].title}に届く機会は終了する。`,
    }[outlook];
    return { goal, action: "pass", outlook, text };
  }

  function trophyInfluences(state, path, kind, choiceId = null) {
    const ids = new Set(path.flatMap(rule =>
      [...rule.trophies ?? [], ...Object.keys(rule.trophyAge ?? {}), ...Object.keys(rule.trophyContext ?? {})]));
    return [...ids].map(id => ({ id, name: achievements.trophies[id].name, turn: state.trophies[id].turn, kind, choiceId }));
  }
  const origins = links => links.map(link => `第${link.turn}ターンの「${link.name}」`).join("・");

  function publicEvent(state) {
    if (!state.current || state.end) return null;
    const event = eventFor(state);
    const available = availableChoices(state, event);
    const context = event.rules.proposal ? `提案中の体制は${TAGS[state.proposal.id].name}。` :
      event.rules.legacy ? `争点は${chronicle.legacyNames[availableLegacy(state, event.rules.legacy)[0]]}。` : "";
    const costs = state.version >= 4 ? projectBurden(state, event) : [];
    const options = available.map(({ choice, option, path }) => state.version >= 7 ? choiceView(state, choice, option, costs, path) : option);
    const influences = [];
    if (state.version >= 8) {
      influences.push(...trophyInfluences(state, conditionPath(state, event.rules) ?? [], "event"));
      const priority = event.rules.heritagePriority;
      if (priority && priority.value !== (event.rules.priority ?? 0)) {
        influences.push(...trophyInfluences(state, conditionPath(state, priority.when) ?? [], "priority"));
      }
    }
    const background = influences.length ? " " + origins(influences) +
      (influences.some(link => link.kind === "event") ? "がこの議題の背景にある。" : "を受け、この議題が優先された。") : "";
    const notice = costs.length ? ` 危機対応の負担が事業費に反映される（${costs.map(id => crossroads.burdens[id].name).join("・")}）。` : "";
    const remembered = state.version >= 6 && event.id === "pyramid_attribution"
      ? ` 完成当時の位置づけは「${state.trophies.pyramid.context}」。` : "";
    const body = state.version >= 8 && event.id === "recovery_unfunded_services" ? (
      "公の支払いが長く滞り、担当者は公共資産の賃貸、配給、国外からの取引信用を提示した。" +
      (options.some(option => option.id === "recovery_unfunded_services:4") ? "月探査設備を売却すれば追加の資金を確保できる。" : "")
    ) : event.public.body;
    return { id: event.id, ...event.public, body: body + context + notice + remembered + background, options,
      ...(influences.length ? { trophyInfluences: influences } : {}),
      ...(state.incident ? { incident: state.incident } : {}) };
  }

  function choiceView(state, choice, option, costs, path) {
    const preview = enactment(state, choice, costs);
    const depleted = depletedBy(preview.after);
    const warning = depleted.length ? `この選択を実行すると、${depleted.map(id => METRICS[id].name).join("と")}が尽き、文明が崩壊します。` : null;
    if (state.version >= 8) {
      const available = trophyInfluences(state, path, "option", option.id);
      const effects = trophyInfluences(state, conditionPath(state, preview.heritage?.when), "effect", option.id);
      const evidence = [...available, ...effects];
      const goal = finalGoal.get(state.current);
      const procedure = goal ? procedureView(state, goal, preview.rules) : null;
      const notes = [option.summary];
      if (available.length) notes.push(origins(available) + "を通じて選べる方針。");
      if (effects.length) notes.push(origins(effects) + "の影響。" + preview.heritage.description);
      if (procedure?.text) notes.push(procedure.text);
      if (warning) notes.push("警告　" + warning);
      return { ...option, summary: notes.join(" "), ...(evidence.length ? { trophyInfluences: evidence } : {}),
        ...(procedure ? { finalProcedure: procedure } : {}), ...(warning ? { warning, depleted } : {}) };
    }
    const context = preview.heritage ? " " + preview.heritage.description : "";
    return { ...option, summary: option.summary + context + (warning ? " 警告　" + warning : ""),
      ...(warning ? { warning, depleted } : {}) };
  }

  function prerequisites(state, path) {
    const links = [];
    for (const condition of path) {
      const trophies = new Set([...(condition.trophies ?? []),
        ...Object.keys(condition.trophyAge ?? {}), ...Object.keys(condition.trophyContext ?? {})]);
      for (const id of trophies) links.push({
        turn: state.trophies[id].turn, type: "trophy", id, label: achievements.trophies[id].name,
      });
      for (const flag of condition.needs ?? []) links.push({
        turn: state.flags[flag],
        type: state.history[state.flags[flag] - 1]?.incident?.raised.includes(flag) ? "incident" : "institution",
        id: flag, label: FLAGS[flag],
      });
      for (const tag of condition.tags ?? []) links.push({
        turn: state.tags[tag], type: "ideology", id: tag, label: TAGS[tag].name,
      });
      if (condition.proposal) links.push({
        turn: state.proposal.turn, type: "proposal", id: state.proposal.id, label: `${TAGS[state.proposal.id].name}への権限移管案`,
      });
      if (condition.legacy) {
        const [id, legacy] = availableLegacy(state, condition.legacy);
        links.push({ turn: legacy.transition, type: "legacy", id, label: chronicle.legacyNames[id] });
        links.push({ turn: legacy.formedAt, type: "former_regime", id, label: TAGS[id].name });
      }
      if (condition.crisis) links.push({
        turn: activeCrisis(state).startedAt, type: "crisis", id: "economic", label: "経済危機の発生",
      });
      for (const id of condition.flagsSeen ?? []) links.push({
        turn: state.history.find(entry => entry.selected?.id === id).turn,
        type: "choice", id, label: state.history.find(entry => entry.selected?.id === id).selected.title,
      });
      if (condition.burden) links.push({
        turn: state.burdens[condition.burden].turn, type: "burden", id: condition.burden, label: crossroads.burdens[condition.burden].name,
      });
      for (const [key, maximum] of Object.entries(state.version >= 4 ? condition.maximum ?? {} : {})) {
        const crossing = state.history.findLast(entry => entry.before[key] > maximum && entry.after[key] <= maximum);
        if (crossing) links.push({
          turn: crossing.turn, type: "threshold", id: key, label: `${METRICS[key].name}が${maximum}以下になった`,
        });
      }
      for (const [key, minimum] of Object.entries(condition.minimum ?? {})) {
        const crossing = state.history.findLast(entry => entry.before[key] < minimum && entry.after[key] >= minimum);
        if (crossing) links.push({
          turn: crossing.turn, type: "threshold", id: key, label: `${METRICS[key].name}が${minimum}に到達`,
        });
      }
    }
    return links.filter((link, index) => links.findIndex(other =>
      other.turn === link.turn && other.type === link.type && other.id === link.id && other.label === link.label) === index);
  }

  function applyIdeology(state, entry, rules) {
    const changes = { formed: [], ended: [] };
    const incomingPolitics = (rules.tags ?? []).find(id => TAGS[id].group === "politics");
    for (const id of Object.keys(state.tags)) {
      if (rules.remove?.includes(id) || (incomingPolitics && incomingPolitics !== id && TAGS[id].group === "politics")) {
        changes.ended.push({ id, formedAt: state.tags[id] });
        delete state.tags[id];
      }
    }
    for (const id of rules.tags ?? []) {
      if (Object.hasOwn(state.tags, id)) continue;
      state.tags[id] = entry.turn;
      changes.formed.push(id);
    }
    return changes;
  }

  function applyGovernment(state, entry, rules, event) {
    const current = regimeOf(state.tags);
    const requested = rules.tags?.find(id => TAGS[id].group === "politics");
    const policies = { ...rules, tags: (rules.tags ?? []).filter(id => TAGS[id].group !== "politics") };
    entry.government = [];
    entry.legacy = [];
    if (rules.government) {
      const { id, turn } = state.proposal;
      entry.government.push({ action: rules.government, id, turn, previous: current });
      if (rules.government === "approve") {
        policies.tags.push(id);
        if (current) {
          const legacy = { formedAt: state.tags[current], transition: entry.turn };
          state.legacies[current] = legacy;
          entry.legacy.push({ id: current, action: "retained", ...legacy });
        }
        if (state.legacies[id]) {
          entry.legacy.push({ id, action: "restored", ...state.legacies[id] });
          delete state.legacies[id];
        }
      }
      state.proposal = null;
    } else if (rules.legacyAction) {
      const [id, legacy] = availableLegacy(state, event.rules.legacy);
      if (rules.legacyAction === "settle") {
        delete state.legacies[id];
        entry.legacy.push({ id, action: "settled", ...legacy });
      } else if (rules.legacyAction === "limit") {
        legacy.expiresAt = entry.turn + 4;
        entry.legacy.push({ id, action: "limited", ...legacy });
      } else {
        delete legacy.expiresAt;
        state.proposal = { id, turn: entry.turn, restoring: true };
        entry.government.push({ action: "proposed", id, turn: entry.turn, previous: current });
      }
    } else if (requested && requested !== current) {
      if (!state.proposal || (requested === "democracy" && state.proposal.id !== "democracy")) {
        if (state.proposal) entry.government.push({ action: "superseded", ...state.proposal, previous: current });
        state.proposal = { id: requested, turn: entry.turn, restoring: Object.hasOwn(state.legacies, requested) && requested !== "democracy" };
        entry.government.push({ action: "proposed", id: requested, turn: entry.turn, previous: current });
        const enacted = entry.institutions.includes("universal_vote") ? "全成人に選挙権を認める法律が採択された。" : "";
        entry.result = `${enacted}${TAGS[requested].name}への権限移管案が提出された。`;
      } else {
        entry.result = `${TAGS[requested].name}への移管案は次の審議に持ち越された。`;
        entry.government.push({ action: "deferred", id: requested, turn: entry.turn, previous: current });
      }
    }
    if (state.proposal && entry.turn >= state.proposal.turn + 5) {
      entry.government.push({ action: "expired", ...state.proposal, previous: current });
      state.proposal = null;
    }
    for (const [id, legacy] of Object.entries(state.legacies)) {
      if (legacy.expiresAt === entry.turn) {
        entry.legacy.push({ id, action: "expired", ...legacy });
        entry.causes.push({ turn: legacy.expiresAt - 4, type: "legacy", id, label: "旧制度の期限到来" });
        delete state.legacies[id];
      }
    }
    entry.ideology = applyIdeology(state, entry, policies);
  }

  function updateCrisis(state, entry, response, sacrifice) {
    let crisis = activeCrisis(state);
    const wealth = entry.after.wealth;
    if (!crisis && wealth <= 24) {
      crisis = { startedAt: entry.turn, wealthBefore: entry.before.wealth, lowestWealth: wealth, recoveredAt: null, responses: [] };
      if (state.version >= 4) crisis.delays = [];
      state.crises.push(crisis);
      entry.crisis = { action: "started", since: entry.turn };
    }
    if (!crisis) return;
    crisis.lowestWealth = Math.min(wealth, crisis.lowestWealth);
    if (response) {
      crisis.responses.push({ turn: entry.turn, choiceId: entry.selected.id, method: response, ...(sacrifice ? { sacrifice } : {}) });
      entry.crisis = { action: "response", since: crisis.startedAt, method: response, ...(sacrifice ? { sacrifice } : {}) };
    }
    if (wealth >= (state.version >= 4 ? 45 : 38)) {
      crisis.recoveredAt = entry.turn;
      crisis.recoveredBy = entry.selected?.id ?? null;
      if (state.version >= 5) crisis.recoverySource = entry.actor === "chance" ? "chance" : "choice";
      entry.crisis = { action: "recovered", since: crisis.startedAt, ...(response ? { method: response, ...(sacrifice ? { sacrifice } : {}) } : {}) };
      if (crisis.startedAt < entry.turn && !entry.causes.some(link => link.type === "crisis")) entry.causes.push({
        turn: crisis.startedAt, type: "crisis", id: "economic", label: "経済危機からの回復",
      });
    }
  }

  function projectBurden(state, event) {
    return Object.keys(state.burdens).filter(id => {
      if (id === "austerity") return event.rules.fiscal && event.field === "科学・技術";
      if (id === "tax") return event.field === "政治・法律" && (event.rules.fiscal || event.rules.proposal);
      if (id === "reform") return event.rules.fiscal && event.field === "経済・産業";
      return event.rules.fiscal && event.field === "外交・戦争";
    });
  }

  function enactment(state, choice, costs) {
    const base = choice.rules;
    const risk = base.risk?.find(item => conditionPath(state, item.when));
    const adjustment = risk ? null : base.adjustments?.find(item => conditionPath(state, item.when));
    const heritage = state.version >= 7 && !risk && base.heritage && conditionPath(state, base.heritage.when) ? base.heritage : null;
    const rules = heritage ? { ...base, flags: [...base.flags, ...heritage.flags ?? []],
      legacy: [...base.legacy ?? [], ...heritage.legacy ?? []] } : risk ? { ...base, ...risk.rules } : base;
    const delta = Object.fromEntries(Object.keys(METRICS).map(key => {
      const surcharge = costs.reduce((total, id) => total + (crossroads.burdens[id].cost[key] ?? 0), 0);
      return [key, (adjustment?.delta[key] ?? rules.delta[key] ?? 0) + (heritage?.delta[key] ?? 0) + surcharge];
    }));
    const after = Object.fromEntries(Object.keys(METRICS).map(key => [key, metricAfter(state.version, state.metrics[key], delta[key])]));
    const result = risk?.result ?? adjustment?.result ?? choice.public.result;
    return { rules, after, condition: risk?.when ?? adjustment?.when, heritage,
      result: result + (heritage ? " " + heritage.result : ""), failure: risk?.failure };
  }

  function noteCrossroads(state, entry, event, rules, costs, failed) {
    entry.conflicts = [];
    entry.obligations = [];
    if (rules.governance) {
      state.governance = { id: rules.governance, name: crossroads.governance[rules.governance], turn: entry.turn };
      entry.governance = state.governance;
    }
    for (const id of costs) {
      const { name, cost } = crossroads.burdens[id];
      entry.obligations.push({ id, name, action: "applied", sourceTurn: state.burdens[id].turn, cost });
      entry.causes.push({ turn: state.burdens[id].turn, type: "burden", id, label: name });
    }
    if (rules.burden && !state.burdens[rules.burden]) {
      const id = rules.burden;
      state.burdens[id] = { turn: entry.turn, crisisTurn: activeCrisis(state)?.startedAt };
      entry.obligations.push({ id, name: crossroads.burdens[id].name, action: "incurred", sourceTurn: entry.turn });
    }
    for (const id of rules.forgive ?? []) {
      if (!state.burdens[id]) continue;
      entry.obligations.push({ id, name: crossroads.burdens[id].name, action: "settled", sourceTurn: state.burdens[id].turn });
      delete state.burdens[id];
    }
    const goal = rules.goal ?? event.rules.critical;
    const declined = event.rules.critical && !rules.goal &&
      !(event.id === "democratic_ratification" && rules.government === "approve") &&
      !rules.flags.some(flag => crossroads.projects[event.rules.critical].includes(flag));
    const setback = failed ?? rules.outcome ?? (declined ? "この機会に実施・批准を見送った" : null);
    if (rules.missed) entry.conflicts.push({
      topic: event.rules.challenge, goal: rules.missed.goal, status: "setback", outcome: rules.missed.reason, choice: entry.selected.title,
    });
    if (event.rules.challenge || setback) entry.conflicts.push({
      topic: event.rules.challenge ?? victoryDefinitions(4)[goal]?.title,
      goal: goal ?? null, status: setback ? "setback" : "response",
      outcome: setback ?? entry.result, choice: entry.selected.title,
    });
  }

  const stabilityForDemocracy = version => version === 1 ? 40 : version === 2 ? 55 : 51;

  function electionStart(state) {
    const turn = state.flags.election_held;
    if (!turn) return null;
    if (state.tags.democracy) return Math.max(turn, state.tags.democracy);
    const framework = state.electoralFramework;
    return framework && framework.regime === regimeOf(state.tags) ? turn : null;
  }

  function updateVictories(state, entry) {
    const { flags, victories, nations } = state;
    const stability = stabilityForDemocracy(state.version);
    const regimeTurn = state.version === 1 ? flags.universal_vote : state.tags.democracy;
    const reformedAt = state.version < 4 ? regimeTurn : electionStart(state);
    const candidates = {
      space: flags.moon_landing != null,
      democracy: flags.universal_vote != null && reformedAt != null && entry.turn >= reformedAt + 2 &&
        (state.version < 4 || !activeCrisis(state)) &&
        [entry, ...state.history.slice(-2)].every(item => item.after.order >= stability),
      conquest: Object.keys(NATIONS).every(key => Object.hasOwn(nations, key)) &&
        (state.version < 4 || Boolean(flags.union_clearance)),
      economy: Boolean(flags.stable_economy), culture: Boolean(flags.cultural_convention),
      religion: Boolean(flags.faith_community),
    };
    for (const key of Object.keys(victoryDefinitions(state.version))) {
      if (!candidates[key] || Object.hasOwn(victories, key)) continue;
      victories[key] = entry.turn;
      entry.victories.push(key);
      if (key === "democracy") {
        entry.causes.push({
          turn: reformedAt, type: "victory", id: "universal_vote",
          label: `${state.version >= 4 ? "全国投票の実施後" : state.version < 3 ? "施行後" : "民主制成立後"}に安定度${stability}以上を3イベント維持し、完全普通選挙が定着`,
        });
        if (state.version >= 3 && flags.universal_vote !== reformedAt) entry.causes.push({
          turn: flags.universal_vote, type: "institution", id: "universal_vote", label: FLAGS.universal_vote,
        });
      }
    }
  }

  function monumentContext(state, choice) {
    const regime = regimeOf(state.tags);
    if (regime === "theocracy") return "sacred";
    if (regime === "monarchy") return "dynasty";
    if (["merchant_rule", "corporate_rule"].includes(regime) || choice.id === "pyramid_completion:2") return "commerce";
    if (["democracy", "representative", "council_rule", "federal_rule"].includes(regime) || state.governance) return "civic";
    if (state.tags.state_faith) return "sacred";
    return "local";
  }

  function recordAchievements(state, entry, awards, rules) {
    entry.trophies = [];
    entry.trophyChanges = [];
    for (const { route, links } of awards) {
      const { id, routeId, label } = route;
      if (state.trophies[id]) continue;
      const contextId = id === "pyramid" ? monumentContext(state, entry.selected) : null;
      const regime = regimeOf(state.tags);
      const institutions = [...new Set([...entry.institutions,
        ...[...entry.causes, ...links].filter(link => link.type === "institution" || link.type === "incident").map(link => link.id)])];
      const meaning = balance.meanings[id];
      const record = {
        id, turn: entry.turn, year: entry.year, eventId: entry.eventId, eventTitle: entry.eventTitle,
        choiceId: entry.selected.id, choiceTitle: entry.selected.title,
        regime: regime ? { id: regime, name: TAGS[regime].name } : null,
        governance: state.governance?.name ?? null,
        route: { id: routeId, label },
        contextId, context: contextId ? achievements.contexts[contextId] : (rules.intent ?? label),
        ...(state.version >= 7 ? { meaning: typeof meaning === "string" ? meaning : meaning[contextId] } : {}),
        institutions: institutions.map(id => ({ id, name: FLAGS[id], turn: state.flags[id] ?? null })),
        causes: [...entry.causes, ...links.filter(link => !entry.causes.some(other =>
          other.turn === link.turn && other.id === link.id && other.type === link.type))],
      };
      state.trophies[id] = record;
      entry.trophies.push(id);
      for (const link of links) {
        if (!entry.causes.some(other => other.turn === link.turn && other.id === link.id && other.type === link.type)) {
          entry.causes.push(link);
        }
      }
    }
    for (const legacy of rules.legacy ?? []) {
      if (!state.trophies[legacy.id]) continue;
      const update = { ...legacy, turn: entry.turn, eventId: entry.eventId, choiceId: entry.selected.id };
      state.trophyLegacy[legacy.id] = update;
      entry.trophyChanges.push(update);
    }
  }

  function choose(state, index, actor = "manual", audit) {
    if (state.end || state.pendingVictory || !state.current) return false;
    const event = eventFor(state);
    const available = availableChoices(state, event);
    const selected = available[index];
    if (!selected) return false;
    const { choice } = selected;
    const costs = state.version >= 4 ? projectBurden(state, event) : [];
    const { rules: enacted, after, condition, result, failure, heritage } = enactment(state, choice, costs);
    const path = [...conditionPath(state, event.rules), ...selected.path, ...conditionPath(state, condition), ...conditionPath(state, heritage?.when)];
    const turn = state.history.length + 1;
    const view = publicEvent(state);
    const awards = state.version >= 6 && !failure ? (trophyRoutes.get(selected.option.id) ?? []).flatMap(route => {
      if (state.trophies[route.id] || (route.since ?? 6) > state.version) return [];
      const evidence = conditionPath(state, route.when);
      return evidence ? [{ route, links: prerequisites(state, evidence).filter(link => link.turn < turn) }] : [];
    }) : [];
    const entry = {
      turn, era: eraAt(turn - 1, state.version), year: yearAt(turn - 1, state.version),
      eventId: event.id, eventTitle: event.public.title, category: event.public.category, body: view.body,
      selected: view.options[index], alternatives: view.options.filter((_, position) => position !== index),
      actor, result, before: { ...state.metrics }, after: {}, changes: {}, institutions: [], nations: [], victories: [],
      causes: prerequisites(state, path).filter(link => state.version < 5 || link.turn < turn),
    };
    if (state.version >= 7) {
      entry.trophyBranches = available.flatMap(({ path, option }) => prerequisites(state, path)
        .filter(link => link.type === "trophy" && link.turn < turn)
        .map(link => ({ id: link.id, sourceTurn: link.turn, choiceId: option.id, selected: option.id === entry.selected.id })));
      for (const branch of entry.trophyBranches) {
        if (!entry.causes.some(link => link.type === "trophy" && link.id === branch.id)) entry.causes.push({
          turn: branch.sourceTurn, type: "trophy", id: branch.id, label: achievements.trophies[branch.id].name + "による選択肢",
        });
      }
    }
    if (state.version >= 8) {
      const influences = [...view.trophyInfluences ?? [], ...view.options.flatMap(option => option.trophyInfluences ?? [])];
      if (influences.length) entry.trophyInfluences = influences;
      for (const link of view.trophyInfluences ?? []) {
        if (!entry.causes.some(cause => cause.type === "trophy" && cause.id === link.id)) {
          entry.causes.push({ turn: link.turn, type: "trophy", id: link.id, label: link.name });
        }
      }
      if (entry.selected.finalProcedure) {
        const goal = entry.selected.finalProcedure.goal;
        const prior = state.history.findLast(item => item.selected?.finalProcedure?.goal === goal &&
          item.selected.finalProcedure.action === "pass");
        if (prior) entry.causes.push({ turn: prior.turn, type: "retry", id: goal, label: "前の最終手続きの見送り" });
      }
    }
    if (state.version >= 5) {
      if (state.incident) {
        entry.incident = state.incident;
        entry.causes.push(...state.incident.protections.filter(link => link.turn < turn && !entry.causes.some(other =>
          other.turn === link.turn && other.id === link.id && other.type === link.type)));
        if (state.incident.crisis) entry.crisis = state.incident.crisis;
        state.incident = null;
      }
      if (event.person) entry.people = [event.person];
      if (enacted.reconstruction) entry.reconstruction = enacted.reconstruction;
    }
    for (const key of Object.keys(METRICS)) {
      const value = after[key];
      state.metrics[key] = value;
      entry.after[key] = value;
      entry.changes[key] = value - entry.before[key];
    }
    for (const flag of enacted.flags) {
      if (Object.hasOwn(state.flags, flag)) continue;
      state.flags[flag] = turn;
      entry.institutions.push(flag);
    }
    if (state.version >= 4 && entry.institutions.includes("constitutional_ballot")) {
      state.electoralFramework = { turn: entry.turn, regime: regimeOf(state.tags) };
    }
    if (state.version >= 3) {
      entry.institutionsEnded = [];
      for (const id of enacted.revoke ?? []) {
        if (!Object.hasOwn(state.flags, id)) continue;
        entry.institutionsEnded.push({ id, foundedAt: state.flags[id] });
        delete state.flags[id];
      }
      applyGovernment(state, entry, enacted, event);
      if (state.version >= 4) noteCrossroads(state, entry, event, enacted, costs, failure);
      const sacrifice = state.version >= 7 && enacted.recovery ?
        enacted.sacrifice ?? crossroads.burdens[enacted.burden]?.name : null;
      updateCrisis(state, entry, enacted.recovery, sacrifice);
      if (state.version >= 6) recordAchievements(state, entry, awards, enacted);
    } else if (state.version === 2) {
      entry.ideology = applyIdeology(state, entry, choice.rules);
    }
    const controlled = { continental_rule: ["north", "west"], world_rule: ["south", "east"] };
    for (const flag of entry.institutions) {
      for (const key of controlled[flag] ?? []) {
        state.nations[key] = turn;
        entry.nations.push(key);
      }
    }

    const depleted = depletedBy(state.metrics);
    if (state.version >= 3 && (state.version < 7 || !depleted.length)) updateVictories(state, entry);
    if (state.version >= 3 && entry.victories.length) {
      state.end = { reason: "victory", turn };
    } else if (depleted.length) {
      state.end = { reason: "collapse", turn, depleted,
        ...(state.version >= 5 ? { source: "choice", eventId: event.id, direct: entry.result } : {}) };
    } else {
      if (state.version < 3) updateVictories(state, entry);
      if (turn === limitFor(state.version) || Object.keys(state.victories).length === Object.keys(victoryDefinitions(state.version)).length) {
        state.end = { reason: Object.keys(state.victories).length ? "victory" : "limit", turn };
      }
    }
    state.history.push(entry);
    state.current = state.end ? null : selectEvent(state, audit);
    if (state.version >= 5 && state.current && eventFor(state).incident) applyIncident(state, eventFor(state));
    state.pendingVictory = !state.end && entry.victories.length > 0;
    return true;
  }

  function resolveVictory(state, finish) {
    if (!state.pendingVictory) return;
    state.pendingVictory = false;
    if (finish) {
      state.end = { reason: "victory", turn: state.history.length };
      state.current = null;
    }
  }

  const STRATEGIES = {
    balanced: { name: "バランス型", weights: [1.25, 1.15, 1.3, 1, .95], goals: ["space", "democracy", "conquest"] },
    space: { name: "宇宙を目指す", weights: [1, 1.75, 1.45, .7, .55], goals: ["space"] },
    democracy: { name: "民主主義を目指す", weights: [1.45, .8, 1.35, 1.6, .55], goals: ["democracy"] },
    conquest: { name: "征服を目指す", weights: [1.25, .6, 1.4, .7, 1.95], goals: ["conquest"] },
    dynastic: { name: "王朝の継承を重視", weights: [1.3, .8, 1.4, .95, 1.75], goals: ["conquest"], tags: ["monarchy", "estates"] },
    ritual: { name: "祭祀と観測を重視", weights: [1.2, 1.45, 1.35, 1.3, .55], goals: ["space"], tags: ["moon_cult", "theocracy", "state_faith"] },
    central: { name: "中央集権と動員を重視", weights: [1.4, .85, 1.25, .65, 1.65], goals: ["conquest"], tags: ["totalitarian", "controlled_tech", "expansion"] },
    research: { name: "研究機関を重視", weights: [1, 1.85, 1.4, .8, .55], goals: ["space"], tags: ["science_first", "technocracy", "algorithmic"] },
    federal: { name: "地方連合を重視", weights: [1.35, .75, 1.45, 1.55, .55], goals: ["conquest"], tags: ["federation", "pacifism"] },
    reformist: { name: "革命からの民主化を重視", weights: [.65, .8, 1.3, 1.85, .60], goals: ["democracy"], tags: ["individual"] },
    commercial: { name: "商業と企業を重視", weights: [1.2, .8, 1.7, 1.1, .55], goals: ["conquest"], tags: ["merchant_rule", "corporate_rule"] },
    local: { name: "地方自治を重視", weights: [1.3, .75, 1.45, 1.55, .55], goals: ["democracy"], tags: ["federal_rule", "local_first"] },
    economy: { name: "国際経済を目指す", weights: [1.2, .95, 1.65, .85, .45], goals: ["economy"] },
    culture: { name: "文化交流を目指す", weights: [1.15, .95, 1.4, 1.65, .4], goals: ["culture"] },
    religion: { name: "信仰共同体を目指す", weights: [1.2, .75, 1.4, 1.7, .35], goals: ["religion"], tags: ["polytheism", "monotheism", "state_faith", "research_faith"] },
    adaptive: { name: "文明の機会に合わせる", weights: [1.2, 1, 1.45, 1.25, .75], goals: Object.keys(VICTORIES) },
  };
  const GOAL_FLAGS = {
    space: ["lunar_program", "launch_ready", "moon_landing", "shared_sky"],
    democracy: ["civic_law", "constitution", "civic_constitution", "universal_vote"],
    conquest: ["army", "continental_rule", "military_logistics", "federal_integration", "world_rule"],
  };

  function alphaAgentChoice(state, strategy) {
    const weights = {
      balanced: { order: 1.25, knowledge: 1.15, wealth: 1.3, culture: 1, power: 0.95 },
      space: { order: 1, knowledge: 1.95, wealth: 1.45, culture: 0.7, power: 0.5 },
      democracy: { order: 1.5, knowledge: 0.8, wealth: 1.35, culture: 1.65, power: 0.5 },
      conquest: { order: 1.25, knowledge: 0.6, wealth: 1.35, culture: 0.6, power: 1.95 },
    }[strategy] ?? null;
    const goals = {
      balanced: ["lunar_program", "moon_landing", "civic_law", "constitution", "universal_vote", "army", "continental_rule", "world_rule"],
      space: ["lunar_program", "moon_landing"],
      democracy: ["civic_law", "constitution", "universal_vote"],
      conquest: ["army", "continental_rule", "world_rule"],
    }[strategy] ?? null;
    if (!weights) return alphaAgentChoice(state, "balanced");
    const scores = ALPHA_BY_ID[state.current].choices.map(({ rules }) => {
      let score = 0;
      for (const [key, start] of Object.entries(state.metrics)) {
        const value = clamp(start + (rules.delta[key] ?? 0));
        if (value === 0 && (key === "order" || key === "wealth")) return -Infinity;
        const risk = (key === "order" || key === "wealth") && start < 36 ? (36 - start) / 5 : 0;
        score += (value - start) * (weights[key] + risk);
      }
      const progress = strategy === "balanced"
        ? 1.15 * (Math.min(57, clamp(state.metrics.power + (rules.delta.power ?? 0))) - Math.min(57, state.metrics.power))
        : 0;
      return score + progress + rules.flags.filter(flag => goals.includes(flag) && !Object.hasOwn(state.flags, flag)).length * 38;
    });
    return scores.indexOf(Math.max(...scores));
  }

  function agentChoice(state, strategy) {
    if (state.version === 1) return alphaAgentChoice(state, strategy);
    const profile = STRATEGIES[strategy] ?? STRATEGIES.balanced;
    const priorities = state.version >= 4 && strategy === "balanced" ? Object.keys(VICTORIES) : profile.goals;
    const goalFlags = goal => [
      ...(GOAL_FLAGS[goal] ?? []), ...(state.version >= 3 ? chronicle.goals[goal] ?? [] : []),
      ...(state.version >= 4 ? crossroads.projects[goal] ?? [] : []),
    ];
    const goals = priorities.flatMap(goalFlags);
    let focus = strategy === "balanced" ? priorities[hash(state.seed) % priorities.length] : priorities[0];
    if (state.version >= 5 && strategy === "adaptive") {
      const progress = victoryProgress(state);
      const priority = id => progress[id].milestones.filter(item => item.turn).length / progress[id].milestones.length;
      const rotation = hash(state.seed) % priorities.length;
      focus = [...priorities.slice(rotation), ...priorities.slice(0, rotation)]
        .reduce((best, id) => priority(id) > priority(best) ? id : best);
    }
    const current = eventFor(state);
    const era = eraAt(state.history.length, state.version);
    const costs = state.version >= 4 ? projectBurden(state, current) : [];
    const scores = availableChoices(state, current).map(({ choice }) => {
      const { rules, after } = enactment(state, choice, costs);
      let score = 0;
      for (const [index, [key, start]] of Object.entries(state.metrics).entries()) {
        const value = after[key];
        if (value === 0 && (key === "order" || key === "wealth")) return -Infinity;
        const risk = key === "order" || key === "wealth" ? Math.max(0, 38 - start) / 5 : 0;
        score += (value - start) * (profile.weights[index] + risk);
        if (key === "wealth") {
          const reserve = era >= 3 ? (profile.goals.length === 1 ? 62 : 52) : 42;
          score += 1.6 * (Math.min(reserve, value) - Math.min(reserve, start));
        }
        if (key === "order" && state.tags.democracy && start < 62) {
          score += 2 * (Math.min(62, value) - Math.min(62, start));
        }
      }
      const opensGoal = rules.flags.filter(flag => goals.includes(flag) && !Object.hasOwn(state.flags, flag));
      const focused = opensGoal.filter(flag => goalFlags(focus).includes(flag));
      const milestones = focused.some(flag => ["launch_ready", "moon_landing", "military_logistics", "federal_integration", "world_rule", "universal_vote"].includes(flag));
      const changesRegime = rules.tags?.some(id => TAGS[id].group === "politics" && !state.tags[id]);
      const leavesPreferredRegime = changesRegime && profile.tags?.some(id => TAGS[id].group === "politics" && state.tags[id]);
      const preferred = rules.tags?.filter(id => profile.tags?.includes(id) && !Object.hasOwn(state.tags ?? {}, id)).length ?? 0;
      const government = state.version >= 3 && rules.government === "approve"
        ? state.proposal.id === "democracy" ? (focus === "democracy" ? 55 : 8)
          : profile.tags?.includes(state.proposal.id) ? 46 : 21
        : 0;
      const recovery = state.version >= 3 && rules.recovery ? 8 : 0;
      const legacyPolicy = state.version >= 3 && rules.legacyAction === "restore" &&
        profile.tags?.includes(availableLegacy(state, current.rules.legacy)[0]) ? 28 : 0;
      const breakthrough = strategy === "reformist" && rules.flags.includes("revolution") ? 24 : 0;
      const support = state.version >= 4 ? (rules.goal === focus ? 15 : rules.goal ? -9 : 0) : 0;
      let pathBonus = 0;
      if (state.version >= 4 && focus === "conquest") {
        if (["conquest", "central", "dynastic"].includes(strategy) && rules.flags.includes("war_mandate")) pathBonus += 68;
        if (strategy === "commercial" && rules.flags.includes("civil_mandate")) pathBonus += 58;
        if (strategy === "federal" && rules.flags.includes("world_plan")) pathBonus += 18;
      }
      if (state.version >= 4 && strategy === "space" && current.id === "rocketry" &&
          rules.flags.includes("lunar_program") && !rules.flags.includes("launch_compact")) pathBonus += 55;
      if (state.version >= 4 && strategy === "space" && rules.flags.includes("flight_clearance")) pathBonus += 24;
      if (state.version >= 4 && strategy === "space" && current.id === "sky_compact" &&
          state.metrics.knowledge >= 60 && rules.flags.includes("lunar_program")) pathBonus -= 140;
      if (state.version >= 4 && strategy === "local" && rules.flags.includes("constitutional_ballot")) pathBonus += 100;
      if (state.version >= 4 && rules.missed?.goal === focus) pathBonus -= 50;
      if (state.version >= 5 && focus === "conquest" &&
          rules.flags.some(id => ["union_terms", "world_rule"].includes(id))) pathBonus += 27;
      return score + support + pathBonus + breakthrough + government + recovery + legacyPolicy + preferred * 27 - (leavesPreferredRegime ? 18 : 0) + focused.length * 35 +
        (opensGoal.length - focused.length) * 7 + (milestones ? 18 : 0);
    });
    return scores.indexOf(Math.max(...scores));
  }

  function victoryProgress(state) {
    const flag = id => state.flags[id] ?? null;
    const historyEntry = turn => state.history[turn - 1];
    const selectedAt = id => historyEntry(flag(id));
    const origin = (id, label, turn = flag(id)) => ({ id, label, turn });
    const suffrageTurn = flag("universal_vote");
    const regimeTurn = state.tags.democracy ?? null;
    const electionTurn = state.version >= 4 ? electionStart(state) : regimeTurn;
    let stability = 0;
    if (suffrageTurn && electionTurn) {
      for (const entry of [...state.history].reverse()) {
        if (entry.turn < Math.max(suffrageTurn, electionTurn) || entry.after.order < stabilityForDemocracy(state.version)) break;
        stability++;
      }
    }
    const eligibility = selectedAt("universal_vote")?.causes ?? [];
    const democracyRoutes = [
      { id: "gradual", name: "段階的な政治改革", when: eligibility.some(ref => ["constitution", "civic_constitution"].includes(ref.id)) },
      { id: "revolution", name: "革命による民主化", when: eligibility.some(ref => ref.id === "revolution") },
      { id: "local", name: "地方自治からの連邦民主制", when: Boolean(flag("federal_ballot")) },
    ];
    const spaceEntry = selectedAt("moon_landing");
    const conquestEntry = selectedAt("world_rule");
    const spaceRoute = !spaceEntry ? null : ["shared_module_landing", "spare_lunar_window"].includes(spaceEntry.eventId) ? "国際共同計画による再挑戦" : spaceEntry.eventId === "sanctuary_launch" ? "奉納月探査" :
      spaceEntry.causes.some(ref => ref.id === "launch_compact") ? "国際共同計画" : "国家主導";
    const conquestRoute = !conquestEntry ? null : conquestEntry.eventId === "revised_union_signatures"
      ? "限定権限の修正条約" : conquestEntry.eventId === "diplomatic_completion" ? "外交的統合" :
      conquestEntry.eventId === "world_ratification" ? "世界共通政府" :
      conquestEntry.selected.id === "world_treaty:4" ? "政治的併合" : "軍事征服";
    const progress = {
      space: {
        milestones: [origin("lunar_program", "月探査計画"), origin("launch_ready", "打ち上げ体制"), origin("moon_landing", "月面到達")],
        route: spaceRoute, achievedAt: state.victories.space ?? null,
      },
      democracy: {
        milestones: [origin("universal_vote", "完全普通選挙"), origin("democracy", "民主制の成立", regimeTurn),
          origin("stability", "制度の定着", state.victories.democracy ?? null)],
        route: state.version >= 4 && ["second_civic_ballot","late_ballot_accommodations"].includes(selectedAt("election_held")?.eventId) ? "地方自治からの選挙再建" :
          democracyRoutes.find(item => item.when)?.name ?? null,
        consecutiveStability: stability, requiredStability: 3, stabilityFloor: stabilityForDemocracy(state.version),
        achievedAt: state.victories.democracy ?? null,
      },
      conquest: {
        milestones: [origin("continental_rule", "北嶺国・西湾国の編入"), origin("military_logistics", "統合補給網"),
          origin("federal_integration", "統合評議会"), origin("world_plan", "世界統一憲章"), origin("world_rule", "南原国・東洋国の編入")],
        route: conquestRoute, controlled: Object.keys(state.nations).length, total: Object.keys(NATIONS).length,
        achievedAt: state.victories.conquest ?? null,
      },
    };
    if (state.version >= 4) {
      const newRoutes = {
        economy: flag("public_clearing") && selectedAt("banking_network")?.institutions.includes("public_clearing") ? "公共清算所の国際協約" : "商会共同出資の国際協約",
        culture: flag("plural_medium") ? "多言語出版と共同運営" : "公定版と国際協約",
        religion: flag("faith_canon") ? "共通聖典からの信仰協約" : "多元的な典礼からの信仰協約",
      };
      const used = state.version >= 7 ? new Set(state.history.map(entry => entry.eventId)) : null;
      for (const [id, sequence] of Object.entries(crossroads.projects)) {
        const details = progress[id] ?? { achievedAt: state.victories[id] ?? null };
        details.milestones = sequence.map(key => origin(key, FLAGS[key]));
        if (id === "democracy") details.milestones.push(origin("stability", "制度の定着", state.victories.democracy ?? null));
        if (newRoutes[id]) details.route = state.victories[id] ? newRoutes[id] : null;
        details.blockedByCrisis = Boolean(activeCrisis(state));
        if (used) details.readiness = finalReadiness(state, id, details, used);
        progress[id] = details;
      }
    }
    return progress;
  }

  function chronicleReport(state, timeline, turningPoints) {
    const origin = entry => ({ turn: entry.turn, eventId: entry.eventId, eventTitle: entry.eventTitle,
      choiceId: entry.selected?.id ?? null, choiceTitle: entry.selected?.title ?? null });
    const incidentOrigin = turn => {
      const entry = timeline[turn - 1];
      const source = entry ? origin(entry) : { turn, eventId: state.current, eventTitle: eventFor(state).public.title };
      return { ...source, choiceId: null, choiceTitle: null, source: "chance" };
    };
    return {
      politicalHistory: timeline.flatMap(entry => entry.government.map(item => ({
        ...origin(entry), action: item.action, regimeId: item.id, regime: TAGS[item.id].name,
        proposalTurn: item.turn, previousRegime: item.previous ? TAGS[item.previous].name : null,
      }))),
      ideaHistory: timeline.flatMap(entry => [
        ...entry.ideology.formed.map(id => ({ ...origin(entry), id, name: TAGS[id].name, action: "formed" })),
        ...entry.ideology.ended.map(({ id, formedAt }) => ({ ...origin(entry), id, name: TAGS[id].name, action: "ended", formedAt })),
      ]),
      institutionHistory: timeline.flatMap(entry => [
        ...entry.institutions.map(id => ({ ...origin(entry), id, name: FLAGS[id], action: "formed" })),
        ...(entry.incident?.raised ?? []).map(id => ({ ...origin(entry), choiceId: null, choiceTitle: null,
          source: "chance", id, name: FLAGS[id], action: "formed" })),
        ...(entry.incident?.revoked ?? []).map(({ id, foundedAt }) => ({ ...origin(entry), choiceId: null, choiceTitle: null,
          source: "chance", id, name: FLAGS[id], action: "ended", foundedAt })),
        ...entry.institutionsEnded.map(({ id, foundedAt }) => ({ ...origin(entry), id, name: FLAGS[id], action: "ended", foundedAt })),
      ]),
      legacyHistory: timeline.flatMap(entry => entry.legacy.map(item => ({
        ...origin(entry), ...item, name: chronicle.legacyNames[item.id],
      }))),
      remainingLegacies: Object.entries(state.legacies).map(([id, data]) => ({
        id, name: chronicle.legacyNames[id], ...data,
      })),
      victoryProgress: victoryProgress(state),
      crises: state.crises.map(crisis => ({
        ...crisis,
        ...(state.version >= 4 ? {
          duration: (crisis.recoveredAt ?? (timeline.length + Number(Boolean(state.incident)))) - crisis.startedAt + 1,
        } : {}),
        origin: (timeline[crisis.startedAt - 1]?.incident?.crisis?.action === "started" ||
          (crisis.startedAt > timeline.length && state.incident?.crisis?.action === "started"))
          ? incidentOrigin(crisis.startedAt)
          : origin(timeline[crisis.startedAt - 1]),
        recovery: !crisis.recoveredAt ? null : crisis.recoverySource === "chance"
          ? incidentOrigin(crisis.recoveredAt)
          : origin(timeline[crisis.recoveredAt - 1]),
        responses: crisis.responses.map(response => ({ ...origin(timeline[response.turn - 1]), ...response })),
      })),
      definingChoices: turningPoints.map(point => ({ ...origin(timeline[point.turn - 1]), reasons: point.reasons })),
    };
  }

  function crossroadsReport(state, timeline) {
    const origin = entry => ({ turn: entry.turn, eventId: entry.eventId, eventTitle: entry.eventTitle, choiceId: entry.selected?.id ?? null });
    const obligations = timeline.flatMap(entry => entry.obligations.map(item => ({ ...origin(entry), ...item })));
    return {
      actualGovernance: state.governance ? { ...state.governance, isCurrentArrangement: !regimeOf(state.tags) } : null,
      conflicts: timeline.flatMap(entry => entry.conflicts.map(item => ({ ...origin(entry), ...item }))),
      victorySetbacks: timeline.flatMap(entry => entry.conflicts.filter(item => item.goal && item.status === "setback")
        .map(item => ({ ...origin(entry), ...item }))),
      obligations,
      activeObligations: Object.entries(state.burdens).map(([id, data]) => ({ id, name: crossroads.burdens[id].name, ...data })),
      accessionHistory: timeline.flatMap(entry => entry.nations.map(id => ({
        ...origin(entry), id, name: NATIONS[id],
        method: ({ continental_war: "軍事編入", communal_compact: "政治的併合" })[entry.eventId] ??
          (entry.selected.id === "world_treaty:1" ? "軍事編入" : entry.selected.id === "world_treaty:4" ? "政治的併合" : "条約加盟"),
      }))),
    };
  }

  function incidentReport(state, timeline) {
    const origin = entry => ({
      turn: entry.turn, eventId: entry.eventId, title: entry.eventTitle, choiceId: entry.selected?.id ?? null,
    });
    const incidents = timeline.filter(entry => entry.incident).map(entry => ({
      ...origin(entry), choiceId: null, ...entry.incident,
      response: entry.selected ? { choiceId: entry.selected.id, title: entry.selected.title, result: entry.result,
        changes: entry.changes } : null,
    }));
    const forks = timeline.flatMap(entry => entry.causes.filter(link => historyData.lineage.includes(link.id))
      .map(link => ({ ...origin(entry), fromTurn: link.turn, fromEventId: timeline[link.turn - 1].eventId, link: link.label })));
    return {
      incidents,
      pendingIncident: state.incident ? { ...state.incident, turn: state.history.length + 1, eventId: state.current } : null,
      people: timeline.flatMap(entry => (entry.people ?? []).map(person => ({
        ...origin(entry), ...(entry.incident ? { source: "chance", choiceId: null } : { source: "event" }), ...person,
      }))),
      historicalForks: forks,
      unexpectedSetbacks: incidents.flatMap(item => item.setbacks.map(change => ({
        turn: item.turn, eventId: item.eventId, title: item.title, source: "chance", ...change,
      }))),
      reconstructions: timeline.filter(entry => entry.reconstruction).map(entry => ({
        ...origin(entry), result: entry.reconstruction, causes: entry.causes,
      })),
      ...(state.end?.reason === "collapse" ? { collapseCause: {
        turn: state.end.turn, source: state.end.source, eventId: state.end.eventId, description: state.end.direct,
        depleted: state.end.depleted,
        ...(state.version >= 7 ? {
          eventTitle: timeline.at(-1).eventTitle, choiceId: timeline.at(-1).selected?.id ?? null,
          choiceTitle: timeline.at(-1).selected?.title ?? null,
          before: timeline.at(-1).before, loss: timeline.at(-1).changes,
        } : {}),
      } } : {}),
    };
  }

  function report(state) {
    const definitions = victoryDefinitions(state.version);
    const victories = Object.entries(state.victories)
      .sort(([, a], [, b]) => a - b)
      .map(([id, turn]) => ({ id, title: definitions[id].title, turn }));
    const ranked = Object.keys(state.metrics).sort((a, b) => state.metrics[b] - state.metrics[a]);
    const titles = { order: "秩序を築いた文明", knowledge: "知を継ぐ文明", wealth: "交易に栄えた文明", culture: "文化を紡いだ文明", power: "守りを固めた文明" };
    let title = titles[ranked[0]];
    if (victories.length > 1) title = "幾つもの頂に達した文明";
    if (victories.length === 1) title = definitions[victories[0].id].epithet;
    if (state.end?.reason === "collapse") title = "途絶えた文明";
    const traits = Object.entries(state.tags ?? {}).map(([id, turn]) => ({
      id, name: TAGS[id].name, group: TAGS[id].group, turn,
      eventId: state.history[turn - 1].eventId, choiceId: state.history[turn - 1].selected.id,
      eventTitle: state.history[turn - 1].eventTitle, choiceTitle: state.history[turn - 1].selected.title,
    }));
    const regime = traits.find(item => item.group === "politics") ?? null;
    const character = traits.find(item => item.id === "moon_cult")
      ?? traits.find(item => item.id === "science_first")
      ?? traits.findLast(item => item.group !== "politics");
    const characterTitles = { moon_cult: "月暦を継ぐ", science_first: "観測を礎とする", federation: "諸邦を結ぶ", collective: "共同事業を育てた" };
    if (state.end?.reason !== "collapse" && (regime || character)) {
      const descriptor = characterTitles[character?.id] ?? (character ? `${character.name}を掲げる` : "");
      title = `${descriptor}${regime?.name ?? "文明"}`;
    }
    const consequences = new Map();
    for (const entry of state.history) {
      for (const cause of entry.causes) {
        if (!consequences.has(cause.turn)) consequences.set(cause.turn, []);
        consequences.get(cause.turn).push({
          ...cause, turn: entry.turn, sourceTurn: cause.turn, eventId: entry.eventId, eventTitle: entry.eventTitle,
        });
      }
    }
    const timeline = state.history.map(entry => ({ ...entry, consequences: consequences.get(entry.turn) ?? [] }));
    const milestones = state.version >= 3 ? new Set(Object.values(victoryProgress(state))
      .flatMap(progress => progress.milestones.filter(item => item.turn).map(item => item.id))) : new Set();
    const turningPoints = timeline.filter((entry, index) =>
      entry.victories.length || entry.consequences.length || entry.nations.length ||
      entry.ideology?.formed.length || entry.ideology?.ended.length ||
      entry.trophies?.length || entry.trophyChanges?.length || entry.incident || entry.people?.length || entry.reconstruction || entry.conflicts?.length || entry.governance || entry.legacy?.length || entry.crisis || entry.institutionsEnded?.length ||
      entry.institutions.some(id => milestones.has(id)) ||
      (index > 0 && timeline[index - 1].era !== entry.era) ||
      (state.end?.reason === "collapse" && state.end.turn === entry.turn))
      .map(entry => ({
        turn: entry.turn, eventId: entry.eventId, title: entry.eventTitle,
        reasons: [
          ...(entry.ideology?.formed ?? []).map(id => `${TAGS[id].name}が成立`),
          ...(entry.ideology?.ended ?? []).map(item => `${TAGS[item.id].name}を廃止（第${item.formedAt}イベントで成立）`),
          ...(entry.legacy ?? []).map(item => {
            const action = { retained: "が残存", settled: "を廃止", restored: "を復活", limited: "に期限を設定", expired: "が期限切れ" }[item.action];
            return chronicle.legacyNames[item.id] + action;
          }),
          ...entry.institutions.filter(id => milestones.has(id)).map(id => FLAGS[id] + "が成立"),
          ...(entry.institutionsEnded ?? []).map(item => FLAGS[item.id] + "を廃止"),
          ...(entry.crisis ? [{ started: "経済危機の発生", response: "経済危機への対応", recovered: "経済危機から回復" }[entry.crisis.action]] : []),
          ...(entry.conflicts ?? []).map(item => item.topic + (item.status === "setback" ? "で停滞" : "への対応")),
          ...(entry.governance ? [entry.governance.name + "を選択"] : []),
          ...(entry.trophies ?? []).map(id => achievements.trophies[id].name + "を達成"),
          ...(entry.trophyChanges ?? []).map(change => achievements.trophies[change.id].name + "：" + change.status),
          ...(entry.incident ? [historyData.kindLabels[entry.incident.kind] + "が発生"] : []),
          ...(entry.people ?? []).map(person => person.name + "（" + person.role + "）"),
          ...(entry.reconstruction ? [entry.reconstruction] : []),
          ...entry.victories.map(id => definitions[id].title),
          ...entry.nations.map(id => `${NATIONS[id]}を編入`),
          ...entry.consequences.map(item => `${item.eventTitle}（${item.label}）につながった`),
          ...(entry.turn > 1 && slotAt(entry.turn - 1, state.version) === 0 ? [`${ERAS[entry.era].name}時代への移行`] : []),
          ...(state.end?.reason === "collapse" && state.end.turn === entry.turn ? ["文明の崩壊"] : []),
        ],
      }));
    return {
      version: state.version, seed: state.seed, civilization: state.name, title,
      end: state.end ? { ...state.end, label: LABELS[state.end.reason] } : null,
      victories,
      ...(state.version === 1 ? {} : { regime, traits }),
      metrics: { ...state.metrics },
      institutions: Object.entries(state.flags).map(([id, turn]) => ({ id, name: FLAGS[id], turn })),
      nations: Object.entries(NATIONS).map(([id, name]) => ({ id, name, controlledAt: state.nations[id] ?? null })),
      series: [{ turn: 0, ...freshMetrics() }, ...timeline.map(entry => ({ turn: entry.turn, ...entry.after }))],
      turningPoints, timeline,
      ...(state.version >= 3 ? chronicleReport(state, timeline, turningPoints) : {}),
      ...(state.version >= 4 ? crossroadsReport(state, timeline) : {}),
      ...(state.version >= 5 ? incidentReport(state, timeline) : {}),
      ...(state.version >= 6 ? { achievements: achievementReport(state, timeline) } : {}),
      ...(state.version >= 8 ? { finalProcedures: timeline.filter(entry => entry.selected?.finalProcedure).map(entry => ({
        turn: entry.turn, eventId: entry.eventId, eventTitle: entry.eventTitle, choiceId: entry.selected.id,
        choiceTitle: entry.selected.title, ...entry.selected.finalProcedure, retryOfTurn: entry.causes.find(link => link.type === "retry")?.turn ?? null,
      })) } : {}),
    };
  }

  function achievementReport(state, timeline = state.history) {
    return Object.values(state.trophies ?? {}).map(record => {
      const { name, type, fields } = achievements.trophies[record.id];
      const effects = timeline.flatMap(entry => entry.causes
        .filter(link => link.type === "trophy" && link.id === record.id)
        .map(link => ({ turn: entry.turn, eventId: entry.eventId, eventTitle: entry.eventTitle,
          choiceId: entry.selected?.id ?? null, sourceTurn: link.turn,
          ...(state.version >= 7 ? { branches: (entry.trophyBranches ?? []).filter(branch => branch.id === record.id) } : {}),
        })));
      const legacy = timeline.flatMap(entry => (entry.trophyChanges ?? []).filter(change => change.id === record.id));
      return { ...record, name, type, typeName: achievements.types[type], fields,
        currentStatus: state.trophyLegacy[record.id] ?? null, legacy, effects };
    });
  }

  function restore(saved) {
    if (!Number.isInteger(saved?.version) || !Object.hasOwn(catalogs, saved.version) || typeof saved.seed !== "string" ||
        !Array.isArray(saved.history) || saved.history.length > limitFor(saved.version)) return null;
    const restored = create(saved.seed, saved.version);
    for (const [position, entry] of saved.history.entries()) {
      if (entry.actor === "chance") {
        if (restored.history[position]?.eventId !== entry.eventId || restored.history[position]?.actor !== "chance") return null;
        continue;
      }
      resolveVictory(restored, false);
      const index = publicEvent(restored)?.options.findIndex(option => option.id === entry.selected?.id);
      if (!(index >= 0) || !choose(restored, index, entry.actor === "ai" ? "ai" : "manual")) return null;
    }
    if (!saved.pendingVictory) resolveVictory(restored, saved.end?.reason === "victory");
    return restored;
  }

  function catalogFor(version) {
    return catalogs[version].map(({ id, field, era, rules, choices }) => ({
      id, field, era,
      unconditional: Object.keys(rules).every(key => ["priority", "weight", "opening"].includes(key)) &&
        choices.filter(choice => !choice.rules.when).length >= 3,
    }));
  }

  window.CivGame = {
    LIMIT, CURRENT_VERSION, ERAS, METRICS, FLAGS, VICTORIES, NATIONS, LABELS, STRATEGIES, TAGS, GROUPS, limitFor, legacyNames: chronicle.legacyNames,
    victoryDefinitions, achievementReport, achievementCount: Object.keys(achievements.trophies).length,
    achievementName: id => achievements.trophies[id].name,
    catalogFor, catalog: catalogFor(CURRENT_VERSION), incidentLabels: historyData.kindLabels,
    create, restore, choose, publicEvent, mayRecur, resolveVictory, agentChoice, report, victoryProgress, eraAt, yearAt, yearLabel,
  };
})();
