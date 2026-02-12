// app.js
const qImage = document.getElementById("qImage");
const questions = window.QUIZ_QUESTIONS;
const total = questions.length;

// UI
const qnum = document.getElementById("qnum");
const qtotal = document.getElementById("qtotal");
const bar = document.getElementById("bar");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");

const btnBack = document.getElementById("btnBack");
const btnRestart = document.getElementById("btnRestart");

const videoWrap = document.getElementById("videoWrap");
const noVideo = document.getElementById("noVideo");
const qVideo = document.getElementById("qVideo");

const resultScreen = document.getElementById("resultScreen");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const btnAgain = document.getElementById("btnAgain");
const btnCopy = document.getElementById("btnCopy");
qtotal.textContent = String(total);

// scoring (можно потом заменить на твою логику)
let idx = 0;
let history = [];
let score = { vadim: 0, vlad: 0, oleg: 0, andrey: 0 };

function resetScore() {
  score = { vadim: 0, vlad: 0, oleg: 0, andrey: 0 };
}
function applyPoints(points, sign = 1) {
  if (!points) return;
  for (const k of Object.keys(points)) {
    score[k] = (score[k] ?? 0) + sign * points[k];
  }
}
const videoCaption = document.getElementById("videoCaption");

function setVideo(q) {
  const captionText = (q.caption ?? "").toString().trim();

  // показываем правую панель
  videoWrap.style.display = "block";

  // скрываем оба элемента
  qVideo.style.display = "none";
  qImage.style.display = "none";

  // чистим видео
  qVideo.pause();
  qVideo.removeAttribute("src");
  qVideo.load();

  qImage.removeAttribute("src");
  if (captionText) {
    videoCaption.style.display = "block";
    videoCaption.textContent = captionText;
  } else {
    videoCaption.style.display = "none";
  }
  if (q.video) {
    qVideo.style.display = "block";
    qVideo.src = q.video;
    qVideo.load();
    return;
  }
  if (q.image) {
    qImage.style.display = "block";
    qImage.src = q.image;
    return;
  }

  videoWrap.style.display = "none";
}

function render() {
  // hide result
  resultScreen.style.display = "none";

  // back button
  btnBack.disabled = idx === 0;

  // progress
  qnum.textContent = String(idx + 1);
  bar.style.width = Math.round((idx / total) * 100) + "%";

  // question
  const q = questions[idx];
  questionEl.textContent = q.q;

  // right panel
  setVideo(q);

  // answers
  answersEl.innerHTML = "";
  q.a.forEach((opt, i) => {
    const b = document.createElement("button");
    b.className = "btn choice";
    b.textContent = opt.t;
    b.onclick = () => pick(i);
    answersEl.appendChild(b);
  });

  // Если хочешь правило "сначала досмотри" — оставь включенным:
  /* if (q.video){
    setAnswersEnabled(false);
    qVideo.onended = () => setAnswersEnabled(true);
  } else {
    setAnswersEnabled(true);
    qVideo.onended = null;
  }
}*/

  setAnswersEnabled(true);
  qVideo.onended = null;
}

function setAnswersEnabled(enabled) {
  [...answersEl.querySelectorAll("button.choice")].forEach(
    (b) => (b.disabled = !enabled),
  );
}

function pick(i) {
  const q = questions[idx];
  const opt = q.a[i];

  applyPoints(opt.points, +1);
  history[idx] = i;

  idx++;
  if (idx >= total) {
    showResult();
  } else {
    render();
  }
}

function goBack() {
  if (idx <= 0) return;

  idx--;
  const prevPick = history[idx];
  if (prevPick !== undefined) {
    applyPoints(questions[idx].a[prevPick].points, -1);
    history[idx] = undefined;
  }
  render();
}

function restart() {
  idx = 0;
  history = [];
  resetScore();
  render();
}

function showResult() {
  bar.style.width = "100%";

  const entries = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const winner = entries[0]?.[0] || "vadim";

  const titles = {
    vadim: "🛠️ Debug-боец",
    vlad: "🧘 Логический дзен-боец",
    oleg: "⚙️ Оптимизатор-боец",
    andrey: "♟️ Стратег-боец",
  };

  resultTitle.textContent = titles[winner] || "Результат";
  resultText.textContent =
    "С 23 февраля! Пусть прод стоит, баги боятся, а переменные называются по-человечески 😄";

  resultScreen.style.display = "block";
}

function copyResult() {
  const txt = resultTitle.textContent + "\n\n" + resultText.textContent;
  navigator.clipboard
    ?.writeText(txt)
    .then(() => alert("Скопировано!"))
    .catch(() => alert("Не получилось скопировать, выдели вручную 🙂"));
}

// ===== Stars background =====
const starsRoot = document.querySelector(".stars");

function spawnStar() {
  const s = document.createElement("div");
  s.className = "star" + (Math.random() > 0.55 ? " alt" : "");
  s.style.left = Math.random() * 100 + "vw";
  s.style.animationDuration = 5.0 + Math.random() * 2.6 + "s";
  s.style.opacity = "0";
  starsRoot.appendChild(s);

  // удалить после анимации
  setTimeout(() => s.remove(), 9000);
}

// небольшой поток "падающих" звёздочек
setInterval(() => {
  if (Math.random() < 0.75) spawnStar();
}, 420);

// events
btnBack.addEventListener("click", goBack);
btnRestart.addEventListener("click", restart);
btnAgain.addEventListener("click", restart);
btnCopy.addEventListener("click", copyResult);

// start
restart();
