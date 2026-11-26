(() => {
  "use strict";

  const game = window.CivGame;
  const byId = id => document.getElementById(id);
  const saveKey = "civrogue.alpha.v1";
  const metricEntries = Object.entries(game.METRICS);
  const eraSymbols = ["◈", "▥", "♜", "✺", "✦"];
  let running = false;
  let timer = null;
  let activeView = "game";
  let albumFrame = null;
  let state = load();
  let storageWarning = "";

  function node(tag, content, className) {
    const element = document.createElement(tag);
    if (content != null) element.textContent = content;
    if (className) element.className = className;
    return element;
  }

  function button(label, className, callback) {
    const element = node("button", label, className);
    element.type = "button";
    element.addEventListener("click", callback);
    return element;
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(saveKey));
      if (saved) {
        const restored = game.restore(saved);
        if (restored) return restored;
        throw new Error("Invalid history");
      }
    } catch (error) {
      console.warn("CivRogue save could not be restored.", error);
    }
    return game.create();
  }

  function save() {
    try {
      localStorage.setItem(saveKey, JSON.stringify(state));
      storageWarning = "";
    } catch {
      storageWarning = "保存できません";
    }
  }

  function renderJourney() {
    const turn = state.history.length;
    const current = state.end ? state.end.turn - 1 : turn;
    const eraIndex = game.eraAt(current, state.version);
    const year = game.yearAt(current, state.version);
    byId("civilization-name").textContent = `${state.name}文明`;
    byId("hero-year").textContent = game.yearLabel(year);
    byId("hero-era").textContent = `${game.ERAS[eraIndex].name}時代`;
    byId("seed-label").textContent = state.seed;
    byId("rules-version").textContent = state.version === 1 ? "αルール" : `v0.${state.version}`;
    byId("history-count").textContent = turn;
    const saveState = byId("save-state");
    saveState.classList.toggle("error", Boolean(storageWarning));
    saveState.replaceChildren(node("i"), storageWarning || "自動保存済み");
    const displayTurn = String(state.end ? turn : turn + 1).padStart(2, "0");
    byId("journey-progress").replaceChildren(node("strong", displayTurn), ` / ${game.limitFor(state.version)} イベント`);
    byId("eras").replaceChildren(...game.ERAS.map((era, index) => {
      const item = node("li", null, `era ${index === eraIndex ? "active" : index < eraIndex ? "past" : ""}`);
      if (index === eraIndex) item.setAttribute("aria-current", "step");
      const icon = node("span", eraSymbols[index], "era-symbol");
      icon.setAttribute("aria-hidden", "true");
      const labels = node("span");
      labels.append(node("strong", era.name), node("small", era.english));
      item.append(icon, labels);
      return item;
    }));
  }

  function incidentSummary(incident) {
    const effects = metricEntries.filter(([id]) => incident.changes[id])
      .map(([id, metric]) => metric.name + signed(incident.changes[id]));
    const protection = incident.protections.length ? ` ／ 備え　${incident.protections.map(link => link.label).join("・")}` : "";
    const severity = incident.severity === "exceptional" ? "異例の規模" : incident.severity === "major" ? "大規模" : "";
    const status = effects.length ? effects.join("・") : "指標変化なし";
    return `${severity}${game.incidentLabels[incident.kind]}　発生時 ${status}${protection}`;
  }

  function renderEvent() {
    const event = game.publicEvent(state);
    const previous = state.history.at(-1);
    const category = byId("event-category");
    const heading = byId("event-title");
    const body = byId("event-body");
    const counter = byId("event-counter");
    const last = byId("last-result");
    const action = byId("action-label");
    const choices = byId("choices");
    choices.replaceChildren();
    const incidentNote = byId("event-incident");
    incidentNote.hidden = !event?.incident;
    if (event?.incident) incidentNote.textContent = incidentSummary(event.incident);

    last.hidden = !previous;
    if (previous) {
      last.replaceChildren(node("strong", "前の結果"), previous.result);
      for (const id of previous.trophies ?? []) {
        const record = state.trophies[id];
        const text = `歴史的偉業　${game.achievementName(id)}`;
        last.append(node("p", record.meaning ? `${text}。${record.meaning}` : text));
      }
    }
    counter.textContent = event && !state.pendingVictory ? `EVENT ${String(state.history.length + 1).padStart(2, "0")}` : `EVENT ${state.history.length} / ${game.limitFor(state.version)}`;
    if (state.end) {
      category.textContent = "終了";
      heading.textContent = game.LABELS[state.end.reason];
      const total = Object.keys(state.victories).length;
      const trophies = state.trophies ? ` 歴史的偉業 ${Object.keys(state.trophies).length}件。` : "";
      const recap = `${state.history.length}件の出来事を記録しました。達成した勝利は${total}件です。${trophies}`;
      const exhausted = state.end.depleted?.map(key => game.METRICS[key].name).join("・");
      body.textContent = state.end.reason !== "collapse" ? recap : state.version >= 7 ?
        `${collapseText({ ...state.end, eventTitle: previous.eventTitle, choiceTitle: previous.selected?.title, description: state.end.direct })} ${recap}` :
        `${state.end.source === "chance" ? state.end.direct + " " : ""}${exhausted}が底をつき、文明は崩壊しました。${recap}`;
      action.textContent = "歴史を振り返る";
      choices.append(button("年代記を開く", "primary", () => show("report")));
      return;
    }
    if (state.pendingVictory) {
      category.textContent = "勝利達成";
      heading.textContent = previous.victories.map(key => game.victoryDefinitions(state.version)[key].title).join("・");
      body.textContent = "ここで歴史を締めくくるか、年代を進めて別の勝利を目指せます。";
      action.textContent = "これからの歴史";
      choices.append(
        button("歴史を続ける", "primary", () => finishVictory(false)),
        button("勝利で終える", "secondary", () => finishVictory(true)),
      );
      return;
    }

    category.textContent = event.category;
    heading.textContent = event.title;
    body.textContent = event.body;
    action.textContent = "文明の方針を選ぶ";
    for (const [index, option] of event.options.entries()) {
      const element = byId("choice-template").content.firstElementChild.cloneNode(true);
      const letter = element.querySelector(".choice-letter");
      letter.textContent = "ABCD"[index];
      letter.setAttribute("aria-hidden", "true");
      element.querySelector("strong").textContent = option.title;
      element.querySelector(".choice-text span").textContent = option.summary;
      if (option.warning) element.dataset.risk = "collapse";
      element.dataset.choiceId = option.id;
      element.addEventListener("click", () => {
        stopAgent();
        choose(index, "manual");
        heading.focus({ preventScroll: true });
      });
      choices.append(element);
    }
  }

  function renderSidebar() {
    const previous = state.history.at(-1);
    byId("metrics").replaceChildren(...metricEntries.map(([key, metric]) => {
      const wrapper = node("div", null, "metric");
      wrapper.style.setProperty("--metric", metric.color);
      wrapper.style.setProperty("--value", `${state.metrics[key]}%`);
      const line = node("div", null, "metric-line");
      const icon = node("i", metric.icon);
      icon.setAttribute("aria-hidden", "true");
      line.append(icon, node("span", metric.name), node("strong", state.metrics[key]));
      const change = previous?.changes[key];
      if (change) line.append(node("span", signed(change), `metric-change ${change < 0 ? "loss" : ""}`));
      const bar = node("div", null, "metric-bar");
      bar.setAttribute("aria-hidden", "true");
      bar.append(node("span"));
      wrapper.append(line, bar);
      return wrapper;
    }));
    const flags = Object.keys(state.flags).map(id => game.FLAGS[id]);
    const nations = Object.keys(state.nations).map(id => game.NATIONS[id]);
    const activeTags = Object.keys(state.tags ?? {}).map(id => game.TAGS[id]);
    const regime = activeTags.find(tag => tag.group === "politics");
    byId("current-regime").textContent = state.version === 1 ? "α版のルールで続行中" : `政治体制　${regime?.name ?? "未形成"}`;
    if (state.version >= 4 && !regime) {
      byId("current-regime").textContent = `中央体制 未成立 ／ ${state.governance?.name ?? "運営形態の記録なし"}`;
    }
    if (state.crises?.some(item => item.recoveredAt == null)) {
      byId("current-regime").append(state.version >= 4 ? " ／ 経済危機（大規模事業を停止中）" : " ／ 経済危機");
    }
    if (state.proposal) byId("current-regime").append(` ／ 審議中　${game.TAGS[state.proposal.id].name}`);
    const ideologyRows = Object.entries(game.GROUPS).flatMap(([id, group]) => {
      const names = activeTags.filter(tag => tag.group === id && id !== "politics").map(tag => tag.name);
      return names.length ? [node("p", `${group.name}　${names.join("・")}`)] : [];
    });
    byId("institution-content").replaceChildren(
      ...ideologyRows,
      node("p", flags.length ? flags.join("・") : "設立された制度はまだありません。"),
      node("p", `支配国 ${nations.length} / ${Object.keys(game.NATIONS).length}${nations.length ? `（${nations.join("・")}）` : ""}`),
    );
    const progress = state.version >= 3 ? game.victoryProgress(state) : null;
    const definitions = game.victoryDefinitions(state.version);
    byId("victory-count").textContent = `${Object.keys(state.victories).length} / ${Object.keys(definitions).length}`;
    byId("victories").dataset.layout = state.version >= 4 ? "six" : "three";
    byId("victories").replaceChildren(...Object.entries(definitions).map(([id, victory]) => {
      const item = node("div", null, "victory-item");
      const icon = node("span", victory.icon, "victory-symbol");
      icon.setAttribute("aria-hidden", "true");
      const description = node("div");
      let hint = victory.detail;
      if (progress && id === "space" && state.flags.lunar_program) hint = state.flags.launch_ready ? "打ち上げ体制が完成" : "月探査計画を承認済み";
      if (progress && id === "democracy" && state.flags.universal_vote) {
        hint = `普通選挙を施行済み・定着 ${Math.min(progress.democracy.consecutiveStability, 3)} / 3`;
      }
      if (progress && id === "conquest" && progress.conquest.controlled) hint = `統合 ${progress.conquest.controlled} / ${progress.conquest.total} か国`;
      if (state.version >= 4) {
        const next = progress[id].milestones.find(item => !item.turn);
        hint = progress[id].readiness?.text ?? (state.victories[id] ? "達成" : next ? `次の主要条件　${next.label}` : "安定運用を確認中");
      }
      description.append(node("strong", victory.title), node("p", hint));
      item.append(icon, description);
      if (state.victories[id]) item.append(node("span", "達成", "done"));
      return item;
    }));
    byId("achievement-panel").hidden = !state.trophies;
    if (state.trophies) {
      const records = game.achievementReport(state, []);
      byId("achievement-count").textContent = `${records.length} / ${game.achievementCount}`;
      byId("achievement-list").replaceChildren(records.length ? achievementList(records) : node("p", "獲得した偉業はまだありません。"));
    }
    byId("agent-status").textContent = state.end ? "終了" : running ? "実行中" : "待機中";
    byId("toggle-agent").textContent = running ? "一時停止" : "自動プレー";
    byId("toggle-agent").disabled = Boolean(state.end);
    byId("step-agent").disabled = running || Boolean(state.end);
    const strategy = byId("strategy");
    const values = Object.keys(game.STRATEGIES).slice(0, ({ 1: 4, 2: 9, 3: 12, 4: 15 })[state.version]);
    if (strategy.options.length !== values.length) {
      const previousValue = strategy.value;
      strategy.replaceChildren(...values.map(id => {
        const option = node("option", game.STRATEGIES[id].name);
        option.value = id;
        return option;
      }));
      if (values.includes(previousValue)) strategy.value = previousValue;
    }
    strategy.disabled = running || Boolean(state.end);
  }

  function signed(value) {
    return value > 0 ? `+${value}` : String(value);
  }

  function collapseText(cause) {
    const source = cause.source === "chance" ? `対応前の偶然「${cause.eventTitle}」` : `選択「${cause.choiceTitle}」の負担`;
    const exhausted = cause.depleted.map(id => game.METRICS[id].name).join("・");
    return `${source}で${exhausted}が尽き、文明が崩壊しました。 ${cause.description}`;
  }

  function achievementList(records) {
    const result = node("ol", null, "achievement-list");
    for (const record of records) {
      const row = node("li");
      const source = `第${record.turn}　${record.eventTitle} ／ ${record.choiceTitle}`;
      row.append(node("strong", record.name), node("p", record.fields.join("・")),
        node("p", source), node("p", record.route.label));
      if (record.context !== record.route.label) row.append(node("p", record.context));
      if (record.meaning) row.append(node("p", record.meaning));
      if (record.currentStatus) row.append(node("p", `現在　${record.currentStatus.status}`));
      result.append(row);
    }
    return result;
  }

  function sendAlbum() {
    const origin = location.origin === "null" ? "*" : location.origin;
    albumFrame?.contentWindow?.postMessage({ type: "civrogue-album-report", report: game.report(state) }, origin);
  }

  function renderReport() {
    if (albumFrame) { sendAlbum(); return; }
    albumFrame = node("iframe");
    albumFrame.title = "文明史アルバム";
    albumFrame.src = "album.html?game";
    byId("report-view").replaceChildren(albumFrame);
  }

  window.addEventListener("message", event => {
    if (!albumFrame || event.source !== albumFrame.contentWindow || event.origin !== location.origin) return;
    if (event.data?.type === "civrogue-album-ready") sendAlbum();
    if (event.data?.type === "civrogue-album-close") {
      show("game");
      byId("report-tab").focus();
    }
  });

  function render() {
    renderJourney();
    renderEvent();
    renderSidebar();
    if (activeView === "report") renderReport();
  }

  function show(view) {
    if (view === "report" && running) {
      stopAgent();
      renderSidebar();
    }
    activeView = view;
    document.body.classList.toggle("reading-album", view === "report");
    for (const name of ["game", "report"]) {
      byId(`${name}-view`).hidden = name !== view;
      byId(`${name}-tab`).setAttribute("aria-pressed", String(name === view));
    }
    if (view === "report") {
      renderReport();
      albumFrame.focus({ preventScroll: true });
    }
  }

  function choose(index, actor) {
    if (!game.choose(state, index, actor)) return;
    if (state.end) stopAgent();
    save();
    render();
  }

  function finishVictory(finish) {
    game.resolveVictory(state, finish);
    save();
    render();
    byId("event-title").focus({ preventScroll: true });
  }

  function stopAgent() {
    running = false;
    clearTimeout(timer);
    timer = null;
  }

  function agentStep() {
    if (state.pendingVictory) {
      game.resolveVictory(state, false);
      save();
    }
    if (!state.end) choose(game.agentChoice(state, byId("strategy").value), "ai");
    if (running) timer = setTimeout(agentStep, 450);
  }

  function showSettings(open) {
    byId("seed-settings").hidden = !open;
    byId("toggle-settings").setAttribute("aria-expanded", String(open));
    if (open) {
      byId("seed-input").value = state.seed;
      byId("seed-input").focus();
    }
  }

  byId("game-tab").addEventListener("click", () => show("game"));
  byId("report-tab").addEventListener("click", () => show("report"));
  byId("toggle-settings").addEventListener("click", () => {
    if (running) {
      stopAgent();
      renderSidebar();
    }
    showSettings(byId("seed-settings").hidden);
  });
  byId("random-seed").addEventListener("click", () => {
    const [value] = crypto.getRandomValues(new Uint32Array(1));
    byId("seed-input").value = `CIV-${value.toString(36).toUpperCase()}`;
  });
  byId("seed-settings").addEventListener("submit", event => {
    event.preventDefault();
    stopAgent();
    state = game.create(byId("seed-input").value);
    save();
    showSettings(false);
    show("game");
    render();
  });
  byId("step-agent").addEventListener("click", agentStep);
  byId("toggle-agent").addEventListener("click", () => {
    if (running) {
      stopAgent();
      renderSidebar();
    } else {
      running = true;
      agentStep();
    }
  });
  window.addEventListener("storage", event => {
    if (event.key !== saveKey || !event.newValue) return;
    stopAgent();
    state = load();
    render();
  });

  save();
  render();
})();
