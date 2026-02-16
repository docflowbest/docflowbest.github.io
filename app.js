// app.js
const questions = window.QUIZ_QUESTIONS || [];
const total = questions.length;

// ---------- DOM ----------
const qnum = document.getElementById("qnum");
const qtotal = document.getElementById("qtotal");
const bar = document.getElementById("bar");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");

const btnBack = document.getElementById("btnBack");
const btnRestart = document.getElementById("btnRestart");
const btnNext = document.getElementById("btnNext");
let selectedAnswerIndex = null;

const videoWrap = document.getElementById("videoWrap");
const qVideo = document.getElementById("qVideo");
const qImage = document.getElementById("qImage");
const videoCaption = document.getElementById("videoCaption");
const noVideo = document.getElementById("noVideo");

const resultScreen = document.getElementById("resultScreen");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const btnAgain = document.getElementById("btnAgain");
const btnCopy = document.getElementById("btnCopy");

const headerEl = document.querySelector(".header");
const layoutEl = document.querySelector(".layout");
if (qtotal) qtotal.textContent = String(total || 0);

// ---------- state ----------
let idx = 0;
let history = [];

// score оставляем, но он необязательный: points можно не использовать вообще
let score = { debug: 0, zen: 0, optimize: 0, strategy: 0 };

function resetScore() {
  score = { debug: 0, zen: 0, optimize: 0, strategy: 0 };
}
function applyPoints(points, sign = 1) {
  if (!points) return;
  for (const k of Object.keys(points)) {
    score[k] = (score[k] ?? 0) + sign * points[k];
  }
}

function setAnswersEnabled(enabled) {
  if (!answersEl) return;
  [...answersEl.querySelectorAll("button.choice")].forEach((b) => {
    b.disabled = !enabled;
  });
}

// ---------- media ----------
function setVideo(q) {
  const captionText = (q?.caption ?? "").toString().trim();

  // подпись
  if (videoCaption) {
    if (captionText) {
      videoCaption.style.display = "block";
      videoCaption.textContent = captionText;
    } else {
      videoCaption.style.display = "none";
      videoCaption.textContent = "";
    }
  }

  // почистить видео
  if (qVideo) {
    qVideo.pause();
    qVideo.removeAttribute("src");
    qVideo.load();
    qVideo.style.display = "none";
  }

  // почистить картинку
  if (qImage) {
    qImage.removeAttribute("src");
    qImage.style.display = "none";
  }

  // прячем/показываем контейнер
  if (videoWrap) videoWrap.style.display = "none";
  if (noVideo) noVideo.style.display = "none";

  if (!q) return;

  // видео
  if (q.video) {
    if (videoWrap) videoWrap.style.display = "block";
    if (qVideo) {
      qVideo.style.display = "block";
      qVideo.src = q.video;
      qVideo.load();
    }
    return;
  }

  // картинка
  if (q.image) {
    if (videoWrap) videoWrap.style.display = "block";
    if (qImage) {
      qImage.style.display = "block";
      qImage.src = q.image;
    }
    return;
  }

  // ничего
  if (noVideo) noVideo.style.display = "block";
}
// ---------- render ----------
function render() {
  if (!questions.length) {
    selectedAnswerIndex = null;
    if (btnNext) btnNext.disabled = true;
    if (questionEl)
      questionEl.textContent = "Вопросы не найдены (проверь questions.js)";
    if (answersEl) answersEl.innerHTML = "";
    if (noVideo) noVideo.style.display = "block";
    return;
  }

  selectedAnswerIndex = null;
  if (btnNext) btnNext.disabled = true;

  if (qnum) qnum.textContent = String(idx + 1);
  if (bar) bar.style.width = Math.round((idx / total) * 100) + "%";

  if (btnBack) {
    if (idx === 0) {
      btnBack.style.display = "none";
    } else {
      btnBack.style.display = "inline-block";
    }
  }

  const q = questions[idx];

  if (questionEl) questionEl.textContent = q.q || "";

  setVideo(q);

  if (answersEl) {
    answersEl.innerHTML = "";

    (q.a || []).forEach((opt, i) => {
      const b = document.createElement("button");
      b.className = "btn choice";
      b.textContent = opt.t ?? "";

      b.onclick = () => {
        [...answersEl.querySelectorAll(".choice")].forEach((btn) =>
          btn.classList.remove("selected"),
        );
        b.classList.add("selected");
        selectedAnswerIndex = i;
        if (btnNext) btnNext.disabled = false;
      };

      answersEl.appendChild(b);
    });
  }

  if (resultScreen) resultScreen.style.display = "none";
}

// ---------- action Next  ----------
btnNext?.addEventListener("click", () => {
  if (selectedAnswerIndex === null) return;
  pick(selectedAnswerIndex);
});
// ---------- actions ----------
function pick(i) {
  const q = questions[idx];
  const opt = (q.a || [])[i];
  if (!opt) return;

  // начисление очков (можно вообще не использовать)
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
    const q = questions[idx];
    const opt = (q.a || [])[prevPick];
    if (opt) applyPoints(opt.points, -1);
    history[idx] = undefined;
  }
  render();
}

function restart() {
  idx = 0;
  history = [];
  resetScore();

  // вернуть основной экран
  if (resultScreen) resultScreen.style.display = "none";
  if (layoutEl) layoutEl.style.display = "flex";
  if (headerEl) headerEl.style.display = "block";

  render();
}

// Контент вынесен отдельно от логики
const QUEST_CONTENT = {
  titles: {
    debug: "🛠️ Debug-боец",
    zen: "🧘 Дзен-боец",
    optimize: "⚙️ Оптимизатор-боец",
    strategy: "♟️ Стратег-боец",
  },
  blurbs: {
    debug:
      "Ты не паникуешь,ты дебажишь. Когда другие видят хаос, ты видишь стек вызовов.",
    zen: "Ты сохраняешь спокойствие, даже когда горит прод. Дебажить для тебя это медтировать.",
    optimize:
      "Ты не драматизируешь, ты оптимизируешь. В твоём мире нет лишних строк и лишних движений.",
    strategy:
      "Ты думаешь на два спринта вперёд. Пока другие тушат пожары, ты строишь архитектуру победы.",
  },
  greeting:
    "С 23 февраля! Пусть прод стоит, баги боятся, сервера не падают, релизы проходят спокойно.",
  hq: {
    title: "Важная информация от Штаба:",
    email: "📧 Ищи подтверждение на своей электронной почте.",
    belarus:
      "Спецзадание для коллег из Беларуси: <br> 📦 Посылка ждёт вас в почтовом отделении. Обязательно загляните туда в ближайшее время!",
  },
};

function showResult() {
  const entries = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const winner = entries[0]?.[0] || "debug";

  // Заголовок
  if (resultTitle) {
    resultTitle.textContent =
      QUEST_CONTENT.titles[winner] || "🎉 Миссия выполнена!";
  }

  // Основной блок
  if (resultText) {
    resultText.innerHTML = `
      <div class="blurb-text">${QUEST_CONTENT.blurbs[winner]}</div>
      
      <div class="greeting-text">${QUEST_CONTENT.greeting}</div>
      
      <div class="hq-block">
        <span class="hq-title">${QUEST_CONTENT.hq.title}</span>
        Подарок в честь праздника уже отправлен!<br>
        ${QUEST_CONTENT.hq.email}<br><br>
        <span class="by-highlight">BY</span> ${QUEST_CONTENT.hq.belarus}
      </div>
    `;
  }

  if (resultScreen) {
    if (layoutEl) layoutEl.style.display = "none";
    if (headerEl) headerEl.style.display = "none";

    if (resultScreen) {
      resultScreen.style.display = "block";
    }
    requestAnimationFrame(() => {
      resultScreen.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
}

function copyResult() {
  const txt =
    (resultTitle?.textContent || "") + "\n\n" + (resultText?.textContent || "");
  navigator.clipboard
    ?.writeText(txt)
    .then(() => alert("Скопировано!"))
    .catch(() => alert("Не получилось скопировать — выдели вручную 🙂"));
}

// ---------- events ----------
btnBack?.addEventListener("click", goBack);
btnRestart?.addEventListener("click", restart);
btnAgain?.addEventListener("click", restart);
btnCopy?.addEventListener("click", copyResult);

// ---------- stars (не ломают ничего) ----------
const starsRoot = document.querySelector(".stars");
function spawnStar() {
  if (!starsRoot) return;
  const s = document.createElement("div");
  s.className = "star" + (Math.random() > 0.55 ? " alt" : "");
  s.style.left = Math.random() * 100 + "vw";
  s.style.animationDuration = 5.0 + Math.random() * 2.6 + "s";
  starsRoot.appendChild(s);
  setTimeout(() => s.remove(), 9000);
}
setInterval(() => {
  if (Math.random() < 0.7) spawnStar();
}, 420);

// старт
restart();
