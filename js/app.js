import { SET_ORDER, SETS, allPhrases, clozeFrom } from "./data/sets.js";
import { afterRemove, buildDeck, clampIndex } from "./deck.js";
import { gradeChoice, makeSession } from "./quiz.js";
import { GRADE, GRADE_LABELS, intervalLabel, qualityFromChoice } from "./srs.js";
import { PLAZA_SCENES, mountPlaza, questProgress, sceneList } from "./scene.js";
import { applyReview, canUndo, loadSave, parseImport, persistSave, statsFor, takeRemoteIfNewer, undoLastReview } from "./store.js";
import { pickSpanishVoice, scoreUtterance } from "./speech.js";
import { escapeHtml, fillName } from "./util.js";

const MODES = [
  { id: "cards", label: "Cards" },
  { id: "quiz", label: "Quiz" },
  { id: "listen", label: "Listen" },
  { id: "speak", label: "Speak" },
  { id: "cloze", label: "Cloze" },
  { id: "plaza", label: "Plaza" }
];

const FILTERS = [
  { id: "due", label: "Due today" },
  { id: "learning", label: "Still learning" },
  { id: "all", label: "All" }
];

let save = loadSave();
let show = false;
let session = [];
let qi = 0;
let picked = null;
let typed = "";
let heard = "";
let plazaId = "cafe";
let plazaFound = [];
let plazaHandle = null;
let plazaPicked = null;
let focusName = false;

function persist() {
  save = persistSave(save);
}

function syncFromOtherTabs() {
  const next = takeRemoteIfNewer(save);
  if (next.updatedAt === save.updatedAt) return false;
  save = next;
  return true;
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("on"), 1600);
}

function fill(text) {
  return fillName(text, save.displayName);
}

function deck() {
  return buildDeck(save);
}

function currentPhrase() {
  const words = deck();
  const index = clampIndex(save.index, words.length);
  return words[index] || allPhrases()[0];
}

function voices() {
  return window.speechSynthesis ? speechSynthesis.getVoices() : [];
}

export function speak(text) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(fill(text));
  const voice = pickSpanishVoice(voices());
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang || "es-MX";
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
}

function startSession(kind) {
  const filterDeck = save.filter === "all" ? allPhrases().filter((word) => word.set === save.set) : deck();
  session = makeSession(filterDeck.length ? filterDeck : allPhrases(), {
    kind,
    setName: save.set,
    limit: 8
  });
  qi = 0;
  picked = null;
  typed = "";
  heard = "";
}

function recognitionEngine() {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

function listenNow() {
  const engine = recognitionEngine();
  const phrase = session[qi];
  if (!engine || !phrase) {
    toast("Type the Spanish if the mic is busy");
    return;
  }
  engine.lang = "es-MX";
  engine.interimResults = false;
  engine.maxAlternatives = 3;
  engine.onresult = (event) => {
    heard = Array.from(event.results[0] || []).map((item) => item.transcript).join(" ");
    render();
  };
  engine.onerror = () => toast("Mic did not catch that. Type it instead.");
  engine.start();
  toast("Listening…");
}

function rateCurrent(quality) {
  const phrase = currentPhrase();
  const words = deck();
  save = applyReview(save, phrase.id, quality);
  const nextDeck = deck();
  if (save.filter === "due" || save.filter === "learning") {
    save.index = afterRemove(save.index, nextDeck.length);
  } else {
    save.index = (words.indexOf(phrase) + 1) % Math.max(1, words.length);
  }
  show = false;
  persist();
  render();
  const next = deck()[save.index];
  if (next) speak(next.es);
}

function exportProgress() {
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "habla-progress.json";
  link.click();
}

function importProgress() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;
    file.text()
      .then((text) => {
        save = parseImport(text);
        persist();
        render();
        toast("Imported");
      })
      .catch((error) => toast(error.message || "Could not import"));
  };
  input.click();
}

function shareApp() {
  const url = location.href;
  if (navigator.share) {
    navigator.share({ title: "Habla", text: "Learn a little Spanish with this trainer.", url }).catch(() => {});
    return;
  }
  navigator.clipboard.writeText(url).then(() => toast("Link copied")).catch(() => toast(url));
}

function statsTiles(stats) {
  return `
    <span class="stat"><strong>${stats.streak}</strong>streak</span>
    <span class="stat"><strong>${stats.xp}</strong>XP</span>
    <span class="stat"><strong>${stats.today}/${stats.goal}</strong>today</span>
    <span class="stat"><strong>${stats.due}</strong>due</span>`;
}

function chromeHtml(stats) {
  const tabs = SET_ORDER.map((name) => {
    const count = stats.bySet[name];
    return `<button data-set="${escapeHtml(name)}" class="${name === save.set ? "on" : ""}">${escapeHtml(name)} <small>${count.mastered}/${count.total}</small></button>`;
  }).join("");
  const modes = MODES.map((mode) =>
    `<button data-mode="${mode.id}" class="${save.mode === mode.id ? "on" : ""}">${mode.label}</button>`
  ).join("");
  const filters = FILTERS.map((filter) =>
    `<button data-filter="${filter.id}" class="${save.filter === filter.id ? "on" : ""}">${filter.label}</button>`
  ).join("");
  const goalPct = Math.min(100, Math.round((stats.today / stats.goal) * 100));
  const masterPct = Math.round((stats.mastered / stats.total) * 100);
  return `
    <div class="head">
      <div>
        <h1>Habla</h1>
        <p class="sub">Latin American Spanish. ${masterPct}% mastered. Stays on this device.</p>
      </div>
      <div class="head-actions">
        ${canUndo(save) ? `<button class="icon" data-undo>Undo</button>` : ""}
        <button class="icon" data-share>Share</button>
      </div>
    </div>
    <div class="stats" data-stats>${statsTiles(stats)}</div>
    <div class="goal" aria-label="Daily goal"><span style="width:${goalPct}%"></span></div>
    <div class="scroll-tabs" role="tablist" aria-label="Phrase sets">${tabs}</div>
    <div class="segment modes" role="tablist" aria-label="Study mode">${modes}</div>
    <div class="segment filters" role="tablist" aria-label="Deck filter">${filters}</div>`;
}

function paintChromeStats() {
  const host = document.querySelector("[data-stats]");
  if (!host) return;
  const stats = statsFor(save);
  host.innerHTML = statsTiles(stats);
  const goal = document.querySelector(".goal span");
  if (goal) goal.style.width = `${Math.min(100, Math.round((stats.today / stats.goal) * 100))}%`;
  const undo = document.querySelector("[data-undo]");
  if (canUndo(save) && !undo) {
    const actions = document.querySelector(".head-actions");
    if (actions) actions.insertAdjacentHTML("afterbegin", `<button class="icon" data-undo>Undo</button>`);
  }
  if (!canUndo(save) && undo) undo.remove();
}

function cardBody() {
  const words = deck();
  save.index = clampIndex(save.index, words.length);
  const word = currentPhrase();
  const card = save.cards[word.id];
  const grades = GRADE_LABELS.map((grade) =>
    `<button class="grade ${grade.id}" data-grade="${grade.id}"><span>${grade.label}</span><small>${grade.hint}</small></button>`
  ).join("");
  return `
    <div class="top"><span>${save.index + 1} / ${words.length}${save.filter !== "all" ? " in this pile" : ""}</span><button class="speak" data-say="${escapeHtml(word.es)}">Play</button></div>
    <button class="card" data-flip>
      <div class="es">${escapeHtml(fill(word.es))}</div>
      ${show ? `<div class="en">${escapeHtml(fill(word.en))}</div><div class="hint">${escapeHtml(word.hint)}</div><div class="ex">${escapeHtml(fill(word.exampleEs))}<span>${escapeHtml(fill(word.exampleEn))}</span></div><p class="muted">Next look: ${escapeHtml(intervalLabel(card))}</p>` : `<div class="muted">Recall it, then tap for English and an example</div>`}
    </button>
    <div class="row">
      <button data-prev>Back</button>
      <button data-next>Skip</button>
    </div>
    ${show ? `<div class="grades">${grades}</div>` : ""}`;
}

function drillBody(kind) {
  if (!session.length) {
    const copy = {
      quiz: "Eight mixed questions from this set. Wrong answers come back sooner.",
      listen: "Hear the Spanish first, then pick the meaning.",
      speak: "Say or type the Spanish. Accents can be off and still count.",
      cloze: "Fill the missing word in a real sentence."
    };
    return `<p class="sub">${copy[kind]}</p><div class="row"><button class="primary" data-start="${kind}">Start</button></div>`;
  }
  if (qi >= session.length) {
    const score = session.filter((item) => item.correct).length;
    return `<div class="card"><div class="es">${score} / ${session.length}</div><div class="muted">Misses return in a few minutes. Mastered cards wait longer.</div></div><div class="row"><button class="primary" data-start="${kind}">Again</button></div>`;
  }
  const question = session[qi];
  const choices = question.options.map((option) => {
    let cls = "choice";
    if (picked) cls += option === question.answer ? " ok" : option === picked ? " no" : "";
    return `<button class="${cls}" data-choice="${escapeHtml(option)}" ${picked ? "disabled" : ""}>${escapeHtml(fill(option))}</button>`;
  }).join("");
  const produce = kind === "speak";
  const verdict = heard ? scoreUtterance(question.say, heard) : typed ? scoreUtterance(question.answer || question.say, typed) : null;
  return `
    <div class="top"><span>${qi + 1} / ${session.length}</span><button class="speak" data-say="${escapeHtml(question.say)}">Play</button></div>
    <div class="card">
      <div class="es">${escapeHtml(fill(kind === "listen" ? "Listen, then choose" : question.prompt))}</div>
      ${kind === "cloze" ? `<p class="muted">Full line after you answer.</p>` : ""}
      ${verdict ? `<p class="muted">${verdict.ok ? (verdict.accentOnly ? "Right words. Watch the accents next time." : "Close enough.") : "Not yet. Compare and try again."}</p>` : ""}
    </div>
      ${produce ? `<p class="muted">Say or type the Spanish for that line.</p><div class="typebox"><input id="typed" value="${escapeHtml(typed)}" placeholder="Type the Spanish" autocomplete="off" /><button data-listen>Mic</button><button class="primary" data-check>Check</button></div>` : `<div class="choices">${choices}</div>`}
    ${picked || (produce && verdict) ? `<div class="row"><button class="primary" data-qnext>${qi + 1 === session.length ? "Score" : "Next"}</button></div>` : ""}`;
}

function plazaBody() {
  const progress = questProgress(plazaId, plazaFound);
  const scenes = sceneList().map((scene) =>
    `<button data-plaza="${scene.id}" class="${scene.id === plazaId ? "on" : ""}">${scene.title}</button>`
  ).join("");
  const scene = PLAZA_SCENES[plazaId];
  const pickedHtml = plazaPicked
    ? `<div class="quest"><strong>${escapeHtml(plazaPicked.es)}</strong><div class="hint">${escapeHtml(plazaPicked.hint || "")}</div><div>${escapeHtml(plazaPicked.en)}</div></div>`
    : `<div class="quest">${progress.complete ? "Mission done. Tap another scene or keep exploring." : `Next: ${escapeHtml(progress.next ? (progress.next.phraseId.split("::")[1] || "look around") : "explore")}`}</div>`;
  return `
    <div class="tabs">${scenes}</div>
    <p class="sub">${escapeHtml(scene.blurb)} Drag to look around. Tap an object to hear it.</p>
    <div id="plaza" class="plaza-host"></div>
    ${pickedHtml}
    <p class="muted">${progress.done} / ${progress.total} mission steps</p>`;
}

function render() {
  const stats = statsFor(save);
  const app = document.getElementById("app");
  let body = "";
  if (save.mode === "cards") body = cardBody();
  else if (save.mode === "plaza") body = plazaBody();
  else body = drillBody(save.mode);
  app.innerHTML = `${chromeHtml(stats)}${body}
    <details><summary>Progress, name, and sharing</summary>
      <div class="namebox">
        <label class="sr-only" for="name">Display name for examples</label>
        <input id="name" placeholder="Your name, for examples" value="${escapeHtml(save.displayName)}" autocomplete="nickname" />
      </div>
      <div class="row"><button data-export>Export</button><button data-import>Import</button></div>
      <p class="muted">Each device keeps its own progress. Export a file to continue somewhere else, or send the link so someone else starts fresh.</p>
    </details>`;

  const input = document.getElementById("name");
  if (input) {
    if (focusName) input.focus();
    input.addEventListener("input", () => {
      save.displayName = input.value.trim();
    });
    input.addEventListener("change", () => {
      persist();
    });
    input.addEventListener("focus", () => { focusName = true; });
    input.addEventListener("blur", () => { focusName = false; persist(); });
  }
  const typedInput = document.getElementById("typed");
  if (typedInput) {
    typedInput.addEventListener("input", () => { typed = typedInput.value; });
    typedInput.focus();
  }
  if (save.mode === "plaza") mountScene();
}

async function mountScene() {
  plazaHandle?.dispose?.();
  const host = document.getElementById("plaza");
  if (!host) return;
  plazaHandle = await mountPlaza(host, {
    sceneId: plazaId,
    onPick(item) {
      plazaPicked = item;
      if (item?.es) speak(item.es);
      const progressBefore = questProgress(plazaId, plazaFound);
      if (progressBefore.next && item.key === progressBefore.next.key && !plazaFound.includes(item.key)) {
        plazaFound = [...plazaFound, item.key];
        if (item.phrase?.id) save = applyReview(save, item.phrase.id, GRADE.good);
        const progress = questProgress(plazaId, plazaFound);
        if (progress.complete) toast("Mission complete");
        persist();
        paintChromeStats();
      }
      const overlay = host.parentElement.querySelector(".quest");
      if (overlay && item) {
        overlay.innerHTML = `<strong>${escapeHtml(item.es)}</strong><div class="hint">${escapeHtml(item.hint || "")}</div><div>${escapeHtml(item.en)}</div>`;
      }
    }
  });
}

function finishChoice(choice) {
  const question = session[qi];
  picked = choice;
  const ok = gradeChoice(question, choice);
  question.correct = ok;
  save = applyReview(save, question.id, qualityFromChoice(ok));
  persist();
  render();
}

function finishProduce() {
  const question = session[qi];
  const field = document.getElementById("typed");
  const attempt = (field?.value || typed || heard).trim();
  typed = attempt;
  const verdict = scoreUtterance(question.say, attempt);
  question.correct = verdict.ok;
  picked = attempt || " ";
  save = applyReview(save, question.id, verdict.ok ? (verdict.accentOnly ? GRADE.hard : GRADE.good) : GRADE.again);
  persist();
  render();
}

function undoReview() {
  if (!canUndo(save)) {
    toast("Nothing to undo");
    return;
  }
  save = undoLastReview(save);
  show = save.mode === "cards";
  persist();
  render();
  toast("Last review undone");
}

function onClick(event) {
  const target = event.target.closest("[data-set],[data-mode],[data-filter],[data-flip],[data-prev],[data-next],[data-say],[data-start],[data-choice],[data-qnext],[data-grade],[data-share],[data-export],[data-import],[data-plaza],[data-listen],[data-check],[data-undo]");
  if (!target) return;
  if (target.dataset.undo !== undefined) {
    undoReview();
    return;
  }
  if (target.dataset.set) {
    save.set = target.dataset.set;
    save.index = 0;
    show = false;
    session = [];
    persist();
    render();
    return;
  }
  if (target.dataset.mode) {
    save.mode = target.dataset.mode;
    session = [];
    picked = null;
    persist();
    render();
    return;
  }
  if (target.dataset.filter) {
    save.filter = target.dataset.filter;
    save.index = 0;
    show = false;
    persist();
    render();
    return;
  }
  if (target.dataset.flip !== undefined) {
    show = !show;
    render();
    return;
  }
  if (target.dataset.prev !== undefined) {
    const words = deck();
    save.index = (save.index - 1 + words.length) % Math.max(1, words.length);
    show = false;
    persist();
    render();
    return;
  }
  if (target.dataset.next !== undefined) {
    const words = deck();
    save.index = (save.index + 1) % Math.max(1, words.length);
    show = false;
    persist();
    render();
    return;
  }
  if (target.dataset.grade) {
    const grade = GRADE_LABELS.find((item) => item.id === target.dataset.grade);
    if (grade) rateCurrent(grade.quality);
    return;
  }
  if (target.dataset.say) {
    speak(target.dataset.say);
    return;
  }
  if (target.dataset.start) {
    startSession(target.dataset.start);
    render();
    if (session[0] && target.dataset.start !== "speak") speak(session[0].say);
    return;
  }
  if (target.dataset.choice && !picked) {
    finishChoice(target.dataset.choice);
    return;
  }
  if (target.dataset.check !== undefined) {
    finishProduce();
    return;
  }
  if (target.dataset.listen !== undefined) {
    listenNow();
    return;
  }
  if (target.dataset.qnext !== undefined) {
    qi += 1;
    picked = null;
    typed = "";
    heard = "";
    render();
    if (session[qi] && save.mode !== "speak") speak(session[qi].say);
    return;
  }
  if (target.dataset.plaza) {
    plazaId = target.dataset.plaza;
    plazaFound = [];
    plazaPicked = null;
    render();
    return;
  }
  if (target.dataset.share !== undefined) {
    shareApp();
    return;
  }
  if (target.dataset.export !== undefined) {
    exportProgress();
    return;
  }
  if (target.dataset.import !== undefined) {
    importProgress();
  }
}

function onKey(event) {
  if (event.target.matches("input")) return;
  if ((event.key === "z" || event.key === "Z") && (event.metaKey || event.ctrlKey || !event.shiftKey)) {
    if (event.metaKey || event.ctrlKey) event.preventDefault();
    undoReview();
    return;
  }
  if (save.mode === "cards") {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      show = !show;
      render();
    }
    if (show && ["1", "2", "3", "4"].includes(event.key)) {
      rateCurrent(GRADE_LABELS[Number(event.key) - 1].quality);
    }
    if (event.key === "ArrowRight") {
      save.index = (save.index + 1) % Math.max(1, deck().length);
      show = false;
      persist();
      render();
    }
    if (event.key === "ArrowLeft") {
      save.index = (save.index - 1 + deck().length) % Math.max(1, deck().length);
      show = false;
      persist();
      render();
    }
  }
}

export function boot() {
  if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => {};
  document.body.addEventListener("click", onClick);
  document.body.addEventListener("keydown", onKey);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    if (syncFromOtherTabs()) render();
  });
  window.addEventListener("focus", () => {
    if (syncFromOtherTabs()) render();
  });
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  render();
}

if (typeof document !== "undefined" && document.getElementById("app")) {
  boot();
}
