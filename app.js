const KEY = "habla-v1";
const names = Object.keys(SETS);
let save = load();
let setName = save.set || names[0];
let i = save.i || 0;
let show = false;
let mode = "cards";
let quiz = [];
let qi = 0;
let picked = null;
let score = 0;
let reviewOnly = false;
let myName = save.name || "";

function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
function persist() { save.set = setName; save.i = i; save.name = myName; localStorage.setItem(KEY, JSON.stringify(save)); }
function knownMap() { return save.known || (save.known = {}); }
function idOf(set, es) { return set + "::" + es; }
function isKnown(set, es) { return !!knownMap()[idOf(set, es)]; }
function knownIn(set) { return SETS[set].filter(w => isKnown(set, w[0])).length; }
function allWords() { return names.flatMap(n => SETS[n].map(w => [n, ...w])); }
function deck() {
  const words = SETS[setName];
  if (!reviewOnly) return words;
  const weak = words.filter(w => !isKnown(setName, w[0]));
  return weak.length ? weak : words;
}
function fill(s) { return String(s).replaceAll("{name}", myName || "Leo"); }
function speak(text) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(fill(text));
  const voices = speechSynthesis.getVoices();
  const v = voices.find(x => /es-MX|es-US|es_MX/i.test(x.lang)) || voices.find(x => /^es/i.test(x.lang));
  if (v) u.voice = v;
  u.lang = (v && v.lang) || "es-MX";
  u.rate = 0.9;
  speechSynthesis.speak(u);
}
if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => {};
function shuffle(a) {
  a = a.slice();
  for (let n = a.length - 1; n > 0; n--) {
    const j = Math.floor(Math.random() * (n + 1));
    [a[n], a[j]] = [a[j], a[n]];
  }
  return a;
}
function esc(s) {
  return String(s).replace(/&/g, "\u0026amp;").replace(/</g, "\u0026lt;").replace(/>/g, "\u0026gt;").replace(/"/g, "\u0026quot;");
}
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg; el.classList.add("on");
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("on"), 1600);
}
function makeQuiz() {
  const pool = reviewOnly ? allWords().filter(w => !isKnown(w[0], w[1])) : SETS[setName].map(w => [setName, ...w]);
  const source = pool.length >= 4 ? pool : allWords();
  quiz = shuffle(source).slice(0, Math.min(6, source.length)).map(item => {
    const toEn = Math.random() < 0.55;
    const answer = toEn ? item[2] : item[1];
    const options = shuffle([answer, ...shuffle(source.filter(x => x[1] !== item[1])).slice(0, 3).map(x => toEn ? x[2] : x[1])]);
    return { prompt: toEn ? item[1] : item[2], say: item[1], answer, options, set: item[0], es: item[1] };
  });
  qi = 0; picked = null; score = 0;
}
function render() {
  const words = deck();
  if (i >= words.length) i = 0;
  const totalKnown = names.reduce((n, s) => n + knownIn(s), 0);
  const total = allWords().length;
  const pct = Math.round(totalKnown / total * 100);
  const tabs = names.map(n => `<button data-set="${esc(n)}" class="${n === setName ? "on" : ""}">${esc(n)} <small>${knownIn(n)}/${SETS[n].length}</small></button>`).join("");
  const modeBtns = `<div class="tabs">
    <button data-mode="cards" class="${mode === "cards" ? "on" : ""}">Cards</button>
    <button data-mode="quiz" class="${mode === "quiz" ? "on" : ""}">Quiz</button>
    <button data-review class="${reviewOnly ? "on" : ""}">Still learning</button>
  </div>`;
  let body = "";
  if (mode === "cards") {
    const w = words[i] || SETS[setName][0];
    const known = isKnown(setName, w[0]);
    body = `
      <div class="top"><span>${i + 1} / ${words.length}${reviewOnly ? " left" : ""}</span><button class="speak" data-say="${esc(w[0])}">Play</button></div>
      <button class="card" data-flip>
        <div class="es">${esc(fill(w[0]))}</div>
        ${show ? `<div class="en">${esc(fill(w[1]))}</div><div class="hint">${esc(w[2])}</div><div class="ex">${esc(fill(w[3]))}<span>${esc(fill(w[4]))}</span></div>` : `<div class="muted">Tap for English and an example</div>`}
      </button>
      <div class="row">
        <button data-prev>Back</button>
        <button data-again>Again</button>
        <button class="${known ? "soft" : "primary"}" data-got>${known ? "Known" : "Got it"}</button>
      </div>`;
  } else if (!quiz.length) {
    body = `<p class="sub">${reviewOnly ? "Quiz only the ones you haven't marked yet." : "Six questions from " + esc(setName) + "."}</p><div class="row"><button class="primary" data-start>Start</button></div>`;
  } else if (qi >= quiz.length) {
    body = `<div class="card"><div class="es">${score} / ${quiz.length}</div><div class="muted">Correct. Misses stay in Still learning.</div></div><div class="row"><button class="primary" data-start>Again</button></div>`;
  } else {
    const q = quiz[qi];
    body = `
      <div class="top"><span>${qi + 1} / ${quiz.length}</span><button class="speak" data-say="${esc(q.say)}">Play</button></div>
      <div class="card"><div class="es">${esc(fill(q.prompt))}</div></div>
      <div class="choices">${q.options.map(op => {
        let cls = "choice";
        if (picked) cls += op === q.answer ? " ok" : (op === picked ? " no" : "");
        return `<button class="${cls}" data-choice="${esc(op)}" ${picked ? "disabled" : ""}>${esc(fill(op))}</button>`;
      }).join("")}</div>
      ${picked ? `<div class="row"><button class="primary" data-qnext>${qi + 1 === quiz.length ? "Score" : "Next"}</button></div>` : ""}`;
  }
  document.getElementById("app").innerHTML = `
    <div class="head"><h1>Habla</h1><span><button class="icon" data-share>Share</button> <span class="count">${totalKnown}/${total}</span></span></div>
    <p class="sub">Latin American Spanish. ${pct}% known. Progress stays on this phone.</p>
    <div class="bar"><span style="width:${pct}%"></span></div>
    <div class="namebox"><input id="name" placeholder="Your name, for examples" value="${esc(myName)}" /></div>
    <div class="tabs">${tabs}</div>${modeBtns}${body}
    <details><summary>Move your progress</summary>
      <div class="row"><button data-export>Export</button><button data-import>Import</button></div>
      <p class="muted">Each phone keeps its own progress. Export a file to continue somewhere else, or send the link so a friend starts fresh.</p>
    </details>`;
  const input = document.getElementById("name");
  input.addEventListener("change", () => { myName = input.value.trim(); persist(); render(); });
}
document.body.addEventListener("click", e => {
  const t = e.target.closest("[data-set],[data-mode],[data-review],[data-flip],[data-prev],[data-say],[data-start],[data-choice],[data-qnext],[data-got],[data-again],[data-share],[data-export],[data-import]");
  if (!t) return;
  if (t.dataset.set) { setName = t.dataset.set; i = 0; show = false; quiz = []; mode = "cards"; persist(); render(); return; }
  if (t.dataset.mode) { mode = t.dataset.mode; quiz = []; render(); return; }
  if (t.dataset.review !== undefined) { reviewOnly = !reviewOnly; i = 0; show = false; quiz = []; render(); return; }
  if (t.dataset.flip !== undefined) { show = !show; render(); return; }
  if (t.dataset.prev !== undefined) { const words = deck(); i = (i - 1 + words.length) % words.length; show = false; persist(); render(); return; }
  if (t.dataset.again !== undefined) {
    const words = deck(); const w = words[i];
    delete knownMap()[idOf(setName, w[0])];
    i = (i + 1) % Math.max(1, deck().length); show = false; persist(); render(); speak(deck()[i][0]); return;
  }
  if (t.dataset.got !== undefined) {
    const words = deck(); const w = words[i];
    knownMap()[idOf(setName, w[0])] = 1;
    if (!reviewOnly) i = (words.indexOf(w) + 1) % words.length;
    else i = Math.min(i, Math.max(0, deck().length - 1));
    show = false; persist(); render();
    const next = deck()[i]; if (next) speak(next[0]); return;
  }
  if (t.dataset.say) { speak(t.dataset.say); return; }
  if (t.dataset.start !== undefined) { makeQuiz(); render(); if (quiz[0]) speak(quiz[0].say); return; }
  if (t.dataset.choice && !picked) {
    picked = t.dataset.choice; const q = quiz[qi];
    if (picked === q.answer) { score += 1; knownMap()[idOf(q.set, q.es)] = 1; }
    else delete knownMap()[idOf(q.set, q.es)];
    persist(); render(); return;
  }
  if (t.dataset.qnext !== undefined) { qi += 1; picked = null; render(); if (quiz[qi]) speak(quiz[qi].say); return; }
  if (t.dataset.share !== undefined) {
    const url = location.href;
    if (navigator.share) navigator.share({ title: "Habla", text: "Learn a little Spanish with me.", url }).catch(() => {});
    else navigator.clipboard.writeText(url).then(() => toast("Link copied")).catch(() => toast(url));
    return;
  }
  if (t.dataset.export !== undefined) {
    const blob = new Blob([JSON.stringify(save, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "habla-progress.json"; a.click();
    return;
  }
  if (t.dataset.import !== undefined) {
    const input = document.createElement("input"); input.type = "file"; input.accept = "application/json";
    input.onchange = () => {
      const file = input.files[0]; if (!file) return;
      file.text().then(text => { save = Object.assign(load(), JSON.parse(text)); myName = save.name || ""; setName = save.set || names[0]; i = save.i || 0; persist(); render(); toast("Imported"); }).catch(() => toast("Could not import"));
    };
    input.click();
  }
});
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
render();
