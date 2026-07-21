const app = document.querySelector("#app");
const photoInput = document.querySelector("#photoInput");

const PROBLEMS = {
  oil: {
    id: "oil",
    question: "一桶油用去 1/4 后，还剩36升。这桶油原来有多少升？",
    type: "分数应用题",
    key: "找准单位“1”，找出对应量和对应分率",
    unitOne: "这桶油原来的总量",
    conceptQuestion: "用去了总量的四分之一，那么剩下的油占总量的几分之几呢？",
    options: ["1/4", "3/4", "36升", "我不确定"],
    correctOption: "3/4",
    correspondingAmount: "剩下36升",
    correspondingRate: "1 − 1/4 = 3/4",
    stepOneTitle: "第一步：计算剩下的油对应的分率",
    stepOneFormula: "1 − 1/4 = 3/4",
    stepTwoTitle: "第二步：计算这桶油原来的总量",
    stepTwoFormula: "36 ÷ 3/4 = 36 × 4/3 = 48（升）",
    answerLead: "答：这桶油原来有",
    answer: "48升",
    summary: "分数应用题，首先要找准单位“1”，然后找到已知数量对应的分率，最后用除法求出单位“1”的量。",
    narration: {
      intro: "你好呀同学，我们一起来看看这道题。题目是，一桶油用去四分之一后，还剩三十六升。这桶油原来有多少升？",
      type: "这是一道分数应用题。解决这类问题的关键，是找准单位一，找出对应量和对应分率。",
      concept: "在这道题里，我们把这桶油原来的总量看作单位一。用去了总量的四分之一，那么剩下的油占总量的几分之几呢？",
      stepOne: "题目告诉我们，剩下的三十六升就是对应量。它对应的分率是一减四分之一，等于四分之三。",
      checkpoint: "我们已经算出，剩下的油占总量的四分之三。你明白了吗？",
      continue: "好的，我们继续。现在我们知道了三十六升对应的分率是四分之三，求单位一的量，用除法。",
      calculate: "三十六除以四分之三，等于三十六乘三分之四，最后结果是四十八升。",
      summary: "分数应用题，首先要找准单位一，然后找到已知数量对应的分率，最后用除法求出单位一的量。",
    },
  },
  apples: {
    id: "apples",
    question: "水果店运来180千克苹果。第一天卖出1/3，第二天卖出剩下苹果的1/4。还剩多少千克？",
    type: "分数应用题",
    key: "找准单位“1”，每一步都重新确认对应量",
    unitOne: "每一步开始前的苹果质量",
    conceptQuestion: "第一天卖出三分之一后，还剩总量的几分之几？",
    options: ["1/3", "2/3", "120千克", "我不确定"],
    correctOption: "2/3",
    correspondingAmount: "第一天后剩下的苹果",
    correspondingRate: "1 − 1/3 = 2/3",
    stepOneTitle: "第一步：计算第一天卖出后剩下的苹果质量",
    stepOneFormula: "180 × 2/3 = 120（千克）",
    stepTwoTitle: "第二步：计算第二天卖出后剩下的苹果质量",
    stepTwoFormula: "120 × 3/4 = 90（千克）",
    answerLead: "答：还剩",
    answer: "90千克",
    summary: "连续变化的分数应用题，要在每一步重新确认单位“1”，再根据对应分率逐步计算。",
  },
  books: {
    id: "books",
    question: "图书角有240本书，其中2/5是科普书。借出科普书的1/4后，还剩多少本科普书？",
    type: "分数乘法应用题",
    key: "找准单位“1”，先求科普书总数",
    unitOne: "图书角中书的总数",
    conceptQuestion: "科普书占图书总数的几分之几？",
    options: ["2/5", "1/4", "96本", "我不确定"],
    correctOption: "2/5",
    correspondingAmount: "科普书总数",
    correspondingRate: "2/5",
    stepOneTitle: "第一步：计算科普书的总数",
    stepOneFormula: "240 × 2/5 = 96（本）",
    stepTwoTitle: "第二步：计算剩下的科普书数量",
    stepTwoFormula: "96 × 3/4 = 72（本）",
    answerLead: "答：还剩",
    answer: "72本科普书",
    summary: "先找准每一步的单位“1”，再根据已知量对应的分率逐步计算。",
  },
};

const CLONE_CLIPS = {
  intro: "clone-intro",
  type: "clone-type",
  concept: "clone-concept",
  correct: "clone-correct",
  wrong: "clone-wrong",
  stepOne: "clone-step-one",
  checkpoint: "clone-checkpoint",
  continue: "clone-continue",
  calculate: "clone-calculate",
  summary: "clone-summary",
  interruption: "clone-interruption",
  typedReply: "clone-typed-reply",
};

const initialState = () => ({
  screen: "capture",
  processing: false,
  problem: PROBLEMS.oil,
  uploadedFile: null,
  captureImageUrl: "./assets/competitor/sample-camera-photo.png",
  uploadedPreview: false,
  stage: "capture",
  questionText: "",
  typeVisible: false,
  typeText: "",
  keyVisible: false,
  keyText: "",
  detailsVisible: false,
  stepOneVisible: false,
  stepTwoVisible: false,
  answerVisible: false,
  summaryVisible: false,
  summaryText: "",
  highlightsVisible: false,
  transcript: "",
  isPlaying: false,
  isPaused: false,
  quizVisible: false,
  quizBusy: false,
  quizSelected: null,
  quizStatus: "",
  quizFeedback: "",
  awaitingContinue: false,
  recording: false,
  recordingSeconds: 0,
  keyboardOpen: false,
  queryText: "",
  replyText: "",
  resumeAvailable: false,
  resumePoint: "intro",
  completed: false,
  toast: "",
});

let state = initialState();
let flowToken = 0;
let playbackToken = 0;
let playbackFinish = null;
let playbackMode = "none";
let currentStage = null;
let recordingTimer = null;
let toastTimer = null;
let lastCaption = "";

const audioPlayer = new Audio();
audioPlayer.preload = "auto";
let audioTimings = {};
const audioTimingsReady = fetch("./assets/audio/timings.json", { cache: "no-store" })
  .then((response) => response.json())
  .then((manifest) => {
    audioTimings = manifest.clips || {};
    document.documentElement.dataset.audioEngine = manifest.voice || "neural";
  })
  .catch(() => {
    document.documentElement.dataset.audioEngine = "browser-fallback";
  });

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function numberToChinese(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || number > 9999) return String(value);
  if (number === 0) return "零";
  const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const units = ["", "十", "百", "千"];
  const chars = String(number).split("").map(Number);
  let output = "";
  let zeroPending = false;
  chars.forEach((digit, index) => {
    const unitIndex = chars.length - index - 1;
    if (digit === 0) {
      if (output && chars.slice(index + 1).some((item) => item !== 0)) zeroPending = true;
      return;
    }
    if (zeroPending) {
      output += "零";
      zeroPending = false;
    }
    output += `${digits[digit]}${units[unitIndex]}`;
  });
  return output.startsWith("一十") ? output.slice(1) : output;
}

function normalizeForSpeech(value) {
  return String(value)
    .replace(/(\d+)\s*\/\s*(\d+)/g, (_, numerator, denominator) => `${numberToChinese(denominator)}分之${numberToChinese(numerator)}`)
    .replace(/÷/g, "除以")
    .replace(/×/g, "乘以")
    .replace(/[−-]/g, "减")
    .replace(/=/g, "等于")
    .replace(/\d+/g, (match) => numberToChinese(match))
    .replace(/单位[“”"]?一[“”"]?/g, "单位一");
}

function formatMath(value) {
  return escapeHtml(value).replace(/(\d+)\s*\/\s*(\d+)/g, (_, numerator, denominator) => (
    `<span class="fraction" aria-label="${denominator}分之${numerator}"><span>${numerator}</span><span>${denominator}</span></span>`
  ));
}

function formatQuestion(value) {
  let output = escapeHtml(value);
  if (state.highlightsVisible && state.problem.id === "oil") {
    output = output
      .replace(/用去\s*1\/4/, '<mark class="is-used">用去 1/4</mark>')
      .replace(/36\s*升/, '<mark class="is-remain">36升</mark>');
  }
  return output.replace(/(\d+)\s*\/\s*(\d+)/g, (_, numerator, denominator) => (
    `<span class="fraction" aria-label="${denominator}分之${numerator}"><span>${numerator}</span><span>${denominator}</span></span>`
  ));
}

function formatAnswer(value) {
  const match = String(value).match(/^(\d+)(.*)$/);
  if (!match) return `<strong>${escapeHtml(value)}</strong>`;
  return `<strong>${escapeHtml(match[1])}</strong>${escapeHtml(match[2])}`;
}

function icon(name, extra = "") {
  return `<i class="ph ph-${name} ${extra}" aria-hidden="true"></i>`;
}

function renderStatusBar() {
  return `
    <div class="ios-status" aria-hidden="true">
      <span>11:08</span>
      <span class="dynamic-island"><i class="recording-dot"></i></span>
      <span class="status-icons">${icon("cell-signal-high")}${icon("wifi-high")}${icon("battery-high")}</span>
    </div>
  `;
}

function renderCaptureScreen() {
  return `
    <section class="capture-screen" aria-label="相机拍题">
      <header class="capture-top">
        <button type="button" data-action="capture-close" aria-label="关闭相机">${icon("x")}</button>
        <strong>拍下需要讲解的题目</strong>
        <button type="button" data-action="choose-photo" aria-label="从相册选择">${icon("image-square")}</button>
      </header>
      <div class="capture-viewport">
        <img
          class="capture-photo ${state.uploadedPreview ? "is-uploaded" : ""}"
          src="${state.captureImageUrl}"
          alt="待识别的题目照片"
        />
        <div class="crop-frame" aria-hidden="true"></div>
        ${state.uploadedPreview ? '<span class="capture-file-note">已载入照片 · 请确认题目区域</span>' : ""}
      </div>
      <footer class="capture-controls">
        <p class="capture-hint">框选单题，识别更精确</p>
        <div class="capture-actions">
          <button class="capture-action" type="button" data-action="reset-photo" aria-label="恢复示例题">${icon("arrow-counter-clockwise")}</button>
          <button class="capture-action capture-confirm" type="button" data-action="confirm-crop" aria-label="确认框选">${icon("check")}</button>
          <button class="capture-action" type="button" data-action="choose-photo" aria-label="重新拍题">${icon("camera-rotate")}</button>
        </div>
        <span class="home-indicator" aria-hidden="true"></span>
      </footer>
      ${state.processing ? `
        <div class="processing-overlay" role="status">
          <div class="processing-card">${icon("spinner-gap")}<span>正在识别题目并生成讲解…</span></div>
        </div>
      ` : ""}
    </section>
  `;
}

function renderQuizOverlay() {
  if (!state.quizVisible) return "";
  const options = state.problem.options.map((option) => {
    const selected = state.quizSelected === option;
    const className = selected
      ? state.quizStatus === "correct"
        ? "is-correct"
        : "is-wrong"
      : option === "我不确定"
        ? "is-unsure"
        : "";
    return `
      <button
        class="quiz-option ${className}"
        type="button"
        data-action="quiz-option"
        data-value="${escapeHtml(option)}"
        ${state.quizBusy ? "disabled" : ""}
      >${formatMath(option)}</button>
    `;
  }).join("");

  return `
    <section class="question-overlay" aria-label="理解检查">
      <article class="quiz-card">
        <div class="quiz-top">
          <img class="quiz-avatar" src="./assets/competitor/teacher-avatar-source.png" alt="AI 老师" />
          <button class="quiz-close" type="button" data-action="quiz-close" aria-label="关闭问题">${icon("x")}</button>
        </div>
        <p class="quiz-question">${escapeHtml(state.problem.conceptQuestion)}</p>
        <div class="quiz-options">${options}</div>
        <p class="quiz-feedback" role="status">${escapeHtml(state.quizFeedback)}</p>
      </article>
      <span class="home-indicator" aria-hidden="true"></span>
    </section>
  `;
}

function renderKeyboardSheet() {
  if (!state.keyboardOpen) return "";
  return `
    <section class="keyboard-sheet" aria-label="文字追问">
      <div class="keyboard-heading">
        <strong>随时打断老师</strong>
        <button type="button" data-action="close-keyboard" aria-label="关闭输入">${icon("x")}</button>
      </div>
      <form class="keyboard-input-row" data-form="question">
        <textarea name="question" placeholder="输入你没听懂的地方，例如：为什么要用除法？" autofocus required></textarea>
        <button class="send-button" type="submit" aria-label="发送问题">${icon("paper-plane-right")}</button>
      </form>
    </section>
  `;
}

function renderFooter() {
  const transcript = state.recording
    ? `正在听你说话 ${state.recordingSeconds.toFixed(1)} 秒…`
    : state.summaryVisible
      ? ""
      : state.transcript || "老师会自动讲解，你可以随时打断";
  return `
    <footer class="tutor-footer">
      <div class="transcript-row">
        <span class="transcript">${escapeHtml(transcript)}</span>
        ${state.awaitingContinue ? `<button class="continue-pill" type="button" data-action="continue">${icon("play")}继续</button>` : ""}
        ${state.resumeAvailable ? `<button class="resume-pill" type="button" data-action="resume">${icon("play")}继续讲解</button>` : ""}
      </div>
      <div class="composer-row">
        <button class="round-control" type="button" data-action="change-problem" aria-label="重新拍题">${icon("camera")}</button>
        <div class="talk-control ${state.recording ? "is-recording" : ""}">
          <button class="talk-area" type="button" data-action="hold-talk">${state.recording ? "松开发送" : "按住说话"}</button>
          <button class="keyboard-control" type="button" data-action="open-keyboard" aria-label="打字追问">${icon("keyboard")}</button>
        </div>
        <button class="pause-control" type="button" data-action="toggle-pause" aria-label="${state.isPaused ? "继续播放" : "暂停讲解"}">
          ${icon(state.isPaused ? "play" : "pause")}
        </button>
      </div>
      <p class="ai-note">内容由AI生成</p>
      <span class="home-indicator" aria-hidden="true"></span>
    </footer>
  `;
}

function renderTutorScreen() {
  const p = state.problem;
  const currentScroll = app.querySelector("#lessonScroll")?.scrollTop || 0;
  app.innerHTML = `
    <section class="tutor-screen" aria-label="AI 老师讲解">
      ${renderStatusBar()}
      <header class="app-nav">
        <button class="nav-button" type="button" data-action="back-to-capture" aria-label="返回">${icon("caret-left")}</button>
        <strong>AI老师</strong>
        <div class="nav-actions">
          <button type="button" data-action="change-problem" aria-label="重新拍题">${icon("scan")}</button>
          <button type="button" data-action="edit-ocr" aria-label="修改识别结果">${icon("sliders-horizontal")}</button>
        </div>
      </header>
      <span class="side-handle" aria-hidden="true">${icon("caret-right")}</span>
      <main class="lesson-scroll" id="lessonScroll">
        <div class="question-card" id="questionText">${formatQuestion(state.questionText)}</div>
        <p class="type-line ${state.typeVisible ? "" : "is-hidden"}">题型：${escapeHtml(state.typeText || p.type)}</p>
        <article class="key-card ${state.keyVisible ? "" : "is-hidden"}">
          <p>${icon("lightbulb")}解题关键：${escapeHtml(state.keyText || p.key)}</p>
          ${state.detailsVisible ? `<p>对应量：${escapeHtml(p.correspondingAmount)}</p><p>对应分率：${formatMath(p.correspondingRate)}</p>` : ""}
        </article>
        <section class="step-block ${state.stepOneVisible ? "" : "is-hidden"}">
          <h2>${escapeHtml(p.stepOneTitle)}</h2>
          <div class="formula-card">${formatMath(p.stepOneFormula)}</div>
        </section>
        <section class="step-block ${state.stepTwoVisible ? "" : "is-hidden"}">
          <h2>${escapeHtml(p.stepTwoTitle)}</h2>
          <div class="formula-card">${formatMath(p.stepTwoFormula)}</div>
        </section>
        <div class="answer-card ${state.answerVisible ? "" : "is-hidden"}">${escapeHtml(p.answerLead)} ${formatAnswer(p.answer)}。</div>
        <p class="method-summary ${state.summaryVisible ? "" : "is-hidden"}">${escapeHtml(state.summaryText || p.summary)}</p>
      </main>
      ${state.queryText || state.replyText ? `
        <article class="query-toast">
          ${state.queryText ? `<strong>你：${escapeHtml(state.queryText)}</strong>` : ""}
          ${state.replyText ? `<p>AI老师：${escapeHtml(state.replyText)}</p>` : ""}
        </article>
      ` : ""}
      ${renderFooter()}
      ${renderQuizOverlay()}
      ${renderKeyboardSheet()}
      <div class="toast ${state.toast ? "is-visible" : ""}" role="status">${escapeHtml(state.toast)}</div>
    </section>
  `;
  const lessonScroll = app.querySelector("#lessonScroll");
  if (lessonScroll) lessonScroll.scrollTop = currentScroll;
  updateRuntimeDataset();
}

function render() {
  if (state.screen === "capture") app.innerHTML = renderCaptureScreen();
  else renderTutorScreen();
  updateRuntimeDataset();
}

function updateRuntimeDataset() {
  document.documentElement.dataset.cloneScreen = state.screen;
  document.documentElement.dataset.cloneStage = state.stage;
  document.documentElement.dataset.clonePlaying = String(state.isPlaying);
  document.documentElement.dataset.cloneQuiz = String(state.quizVisible);
  document.documentElement.dataset.cloneRecording = String(state.recording);
}

function showToast(message) {
  state.toast = message;
  renderTutorScreen();
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    state.toast = "";
    if (state.screen === "tutor") renderTutorScreen();
  }, 1800);
}

function pickChineseVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("zh"));
  return voices.find((voice) => /Xiaoxiao|Flo|Tingting|Sandy/i.test(voice.name)) || voices[0] || null;
}

function cancelNarration() {
  playbackToken += 1;
  audioPlayer.pause();
  audioPlayer.onended = null;
  audioPlayer.onerror = null;
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  if (playbackFinish) {
    const finish = playbackFinish;
    playbackFinish = null;
    finish(false);
  }
  playbackMode = "none";
  state.isPlaying = false;
  state.isPaused = false;
}

function playFallbackSpeech(text, onProgress, token, finish) {
  const spoken = normalizeForSpeech(text);
  const duration = Math.max(1000, spoken.length * 155);
  const start = Date.now();
  let frame;
  const tick = () => {
    if (token !== playbackToken) return;
    const ratio = Math.min(0.97, (Date.now() - start) / duration);
    const caption = text.slice(0, Math.max(1, Math.ceil(text.length * ratio)));
    if (caption !== lastCaption) {
      lastCaption = caption;
      onProgress(caption, ratio);
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  if (!("speechSynthesis" in window)) {
    setTimeout(() => {
      cancelAnimationFrame(frame);
      onProgress(text, 1);
      finish(true);
    }, duration);
    return;
  }

  playbackMode = "speech";
  const utterance = new SpeechSynthesisUtterance(spoken);
  const voice = pickChineseVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = "zh-CN";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.onend = () => {
    cancelAnimationFrame(frame);
    onProgress(text, 1);
    finish(true);
  };
  utterance.onerror = () => {
    cancelAnimationFrame(frame);
    finish(false);
  };
  speechSynthesis.speak(utterance);
}

function playNarration(stage, text, clipId, onProgress = () => {}) {
  cancelNarration();
  const token = playbackToken;
  currentStage = stage;
  state.stage = stage;
  state.resumePoint = stage;
  state.transcript = "";
  state.isPlaying = true;
  state.isPaused = false;
  lastCaption = "";
  renderTutorScreen();

  return new Promise((resolve) => {
    let finished = false;
    let frame;
    const complete = (didFinish) => {
      if (finished) return;
      finished = true;
      if (frame) cancelAnimationFrame(frame);
      if (playbackFinish === complete) playbackFinish = null;
      playbackMode = "none";
      state.isPlaying = false;
      state.isPaused = false;
      if (didFinish) {
        state.transcript = text;
        onProgress(text, 1);
      }
      if (state.screen === "tutor") renderTutorScreen();
      resolve(didFinish);
    };
    playbackFinish = complete;

    const useFixedClip = state.problem.id === "oil" && clipId && audioTimings[clipId];
    if (!useFixedClip) {
      playFallbackSpeech(text, (caption, ratio) => {
        if (token !== playbackToken) return;
        state.transcript = caption;
        onProgress(caption, ratio);
        renderTutorScreen();
      }, token, complete);
      return;
    }

    const timing = audioTimings[clipId];
    const update = () => {
      if (finished || token !== playbackToken || playbackMode !== "audio") return;
      const currentMs = audioPlayer.currentTime * 1000 + 75;
      const caption = timing.cues.filter((cue) => cue.startMs <= currentMs).map((cue) => cue.text).join("");
      if (caption && caption !== lastCaption) {
        lastCaption = caption;
        const ratio = timing.speech.length ? Math.min(1, caption.length / timing.speech.length) : 0;
        state.transcript = caption;
        onProgress(caption, ratio);
        renderTutorScreen();
      }
      frame = requestAnimationFrame(update);
    };

    audioPlayer.src = `./assets/audio/${clipId}.mp3`;
    document.documentElement.dataset.activeClip = clipId;
    document.documentElement.dataset.speechText = timing.speech;
    audioPlayer.currentTime = 0;
    audioPlayer.onended = () => complete(true);
    audioPlayer.onerror = () => playFallbackSpeech(text, onProgress, token, complete);
    playbackMode = "audio";
    frame = requestAnimationFrame(update);
    const promise = audioPlayer.play();
    if (promise) promise.catch(() => playFallbackSpeech(text, onProgress, token, complete));
  });
}

function dynamicNarration(problem) {
  if (problem.narration) return problem.narration;
  return {
    intro: `你好呀同学，我们一起来看看这道题。题目是，${problem.question}`,
    type: `这是一道${problem.type}。解决这类问题的关键，是${problem.key}。`,
    concept: `在这道题里，我们先把${problem.unitOne}看作单位一。${problem.conceptQuestion}`,
    stepOne: `题目告诉我们，先找到对应量和对应分率。第一步是，${problem.stepOneTitle.replace(/^第一步：/, "")}。`,
    checkpoint: `第一步已经完成。你明白了吗？`,
    continue: `好的，我们继续。接下来，${problem.stepTwoTitle.replace(/^第二步：/, "")}。`,
    calculate: `${normalizeForSpeech(problem.stepTwoFormula)}。最后答案是${problem.answer}。`,
    summary: problem.summary,
  };
}

async function runOpening(from = "intro") {
  const token = flowToken;
  const narration = dynamicNarration(state.problem);
  const stages = ["intro", "type", "concept"];
  const startIndex = Math.max(0, stages.indexOf(from));
  for (const stage of stages.slice(startIndex)) {
    if (token !== flowToken || state.screen !== "tutor") return;
    let completed = false;
    if (stage === "intro") {
      const prefix = "你好呀同学，我们一起来看看这道题。题目是，";
      completed = await playNarration(stage, narration.intro, CLONE_CLIPS.intro, (caption) => {
        const spokenQuestion = caption.startsWith(prefix) ? caption.slice(prefix.length) : "";
        const ratio = Math.min(1, spokenQuestion.length / Math.max(1, narration.intro.length - prefix.length));
        state.questionText = state.problem.question.slice(0, Math.ceil(state.problem.question.length * ratio));
      });
      if (completed) state.questionText = state.problem.question;
    }
    if (stage === "type") {
      state.typeVisible = true;
      completed = await playNarration(stage, narration.type, CLONE_CLIPS.type, (_caption, ratio) => {
        state.typeText = state.problem.type.slice(0, Math.max(1, Math.ceil(state.problem.type.length * Math.min(1, ratio * 2.4))));
        if (ratio > 0.38) {
          state.keyVisible = true;
          const keyRatio = Math.min(1, (ratio - 0.38) / 0.62);
          state.keyText = state.problem.key.slice(0, Math.max(1, Math.ceil(state.problem.key.length * keyRatio)));
        }
      });
      if (completed) {
        state.typeText = state.problem.type;
        state.keyVisible = true;
        state.keyText = state.problem.key;
      }
    }
    if (stage === "concept") {
      completed = await playNarration(stage, narration.concept, CLONE_CLIPS.concept);
    }
    if (!completed) return;
  }
  if (token !== flowToken) return;
  state.quizVisible = true;
  state.quizBusy = false;
  state.quizSelected = null;
  state.quizStatus = "";
  state.quizFeedback = "";
  state.stage = "quiz";
  renderTutorScreen();
}

async function runAfterQuiz(from = "stepOne") {
  const token = flowToken;
  const narration = dynamicNarration(state.problem);
  const stages = ["stepOne", "checkpoint"];
  const startIndex = Math.max(0, stages.indexOf(from));
  for (const stage of stages.slice(startIndex)) {
    if (token !== flowToken || state.screen !== "tutor") return;
    let completed = false;
    if (stage === "stepOne") {
      completed = await playNarration(stage, narration.stepOne, CLONE_CLIPS.stepOne, (_caption, ratio) => {
        state.highlightsVisible = true;
        if (ratio > 0.15) state.detailsVisible = true;
        if (ratio > 0.58) state.stepOneVisible = true;
      });
      if (completed) {
        state.detailsVisible = true;
        state.stepOneVisible = true;
      }
    }
    if (stage === "checkpoint") {
      completed = await playNarration(stage, narration.checkpoint, CLONE_CLIPS.checkpoint);
    }
    if (!completed) return;
  }
  if (token !== flowToken) return;
  state.awaitingContinue = true;
  state.stage = "checkpoint";
  renderTutorScreen();
}

async function runFinal(from = "continue") {
  const token = flowToken;
  const narration = dynamicNarration(state.problem);
  const stages = ["continue", "calculate", "summary"];
  const startIndex = Math.max(0, stages.indexOf(from));
  for (const stage of stages.slice(startIndex)) {
    if (token !== flowToken || state.screen !== "tutor") return;
    let completed = false;
    if (stage === "continue") {
      completed = await playNarration(stage, narration.continue, CLONE_CLIPS.continue, (_caption, ratio) => {
        if (ratio > 0.48) state.stepTwoVisible = true;
      });
      if (completed) state.stepTwoVisible = true;
    }
    if (stage === "calculate") {
      completed = await playNarration(stage, narration.calculate, CLONE_CLIPS.calculate, (_caption, ratio) => {
        if (ratio > 0.72) state.answerVisible = true;
      });
      if (completed) state.answerVisible = true;
    }
    if (stage === "summary") {
      state.summaryVisible = true;
      completed = await playNarration(stage, narration.summary, CLONE_CLIPS.summary, (_caption, ratio) => {
        state.summaryText = state.problem.summary.slice(0, Math.max(1, Math.ceil(state.problem.summary.length * ratio)));
      });
      if (completed) state.summaryText = state.problem.summary;
    }
    if (!completed) return;
  }
  if (token !== flowToken) return;
  state.completed = true;
  state.stage = "complete";
  renderTutorScreen();
}

function resumeTeaching() {
  state.resumeAvailable = false;
  state.queryText = "";
  state.replyText = "";
  renderTutorScreen();
  const point = state.resumePoint || "intro";
  if (["intro", "type", "concept"].includes(point)) runOpening(point);
  else if (["stepOne", "checkpoint"].includes(point)) runAfterQuiz(point);
  else if (["continue", "calculate", "summary"].includes(point)) runFinal(point);
  else if (point === "quiz") {
    state.quizVisible = true;
    renderTutorScreen();
  }
}

async function selectQuizOption(value) {
  if (state.quizBusy) return;
  state.quizSelected = value;
  state.quizBusy = true;
  if (value === state.problem.correctOption) {
    state.quizStatus = "correct";
    state.quizFeedback = "完全正确！";
    renderTutorScreen();
    const completed = await playNarration("quiz-correct", "完全正确！", CLONE_CLIPS.correct);
    if (!completed) {
      state.quizBusy = false;
      renderTutorScreen();
      return;
    }
    state.quizVisible = false;
    state.quizBusy = false;
    state.quizSelected = null;
    state.quizStatus = "";
    state.quizFeedback = "";
    state.highlightsVisible = true;
    flowToken += 1;
    renderTutorScreen();
    runAfterQuiz();
    return;
  }

  state.quizStatus = "wrong";
  state.quizFeedback = value === "我不确定" ? "没关系，听完提示后再选一次。" : "再想一想，听完提示后重新选择。";
  renderTutorScreen();
  await playNarration(
    "quiz-wrong",
    "再想一想。用去的是四分之一，剩下的应该比四分之一更多。你可以重新选择。",
    CLONE_CLIPS.wrong,
  );
  state.quizBusy = false;
  state.resumePoint = "quiz";
  renderTutorScreen();
}

function togglePause() {
  if (!state.isPlaying) {
    if (state.completed) runFinal("summary");
    return;
  }
  if (state.isPaused) {
    state.isPaused = false;
    if (playbackMode === "audio") audioPlayer.play();
    if (playbackMode === "speech" && "speechSynthesis" in window) speechSynthesis.resume();
  } else {
    state.isPaused = true;
    if (playbackMode === "audio") audioPlayer.pause();
    if (playbackMode === "speech" && "speechSynthesis" in window) speechSynthesis.pause();
  }
  renderTutorScreen();
}

function startRecording() {
  if (state.quizVisible || state.recording) return;
  state.resumePoint = currentStage || state.stage || "intro";
  flowToken += 1;
  cancelNarration();
  state.awaitingContinue = false;
  state.recording = true;
  state.recordingSeconds = 0;
  state.resumeAvailable = false;
  state.queryText = "";
  state.replyText = "";
  renderTutorScreen();
  window.clearInterval(recordingTimer);
  recordingTimer = window.setInterval(() => {
    state.recordingSeconds += 0.1;
    const transcript = app.querySelector(".transcript");
    if (transcript) transcript.textContent = `正在听你说话 ${state.recordingSeconds.toFixed(1)} 秒…`;
  }, 100);
}

async function finishRecording() {
  if (!state.recording) return;
  window.clearInterval(recordingTimer);
  state.recording = false;
  state.queryText = "我没听懂这里，可以再解释一下吗？";
  state.replyText = "";
  renderTutorScreen();
  const reply = "没关系。你随时可以打断我。我们先停在这里，你可以用语音或打字告诉我哪一步没听懂。";
  const completed = await playNarration("interruption", reply, CLONE_CLIPS.interruption, (caption) => {
    state.replyText = caption;
  });
  state.replyText = reply;
  state.resumeAvailable = true;
  if (!completed) state.resumeAvailable = true;
  renderTutorScreen();
}

async function submitTypedQuestion(value) {
  const question = value.trim();
  if (!question) return;
  state.resumePoint = currentStage || state.stage || "intro";
  flowToken += 1;
  cancelNarration();
  state.keyboardOpen = false;
  state.awaitingContinue = false;
  state.queryText = question;
  state.replyText = "";
  renderTutorScreen();
  const reply = "你问得很好。因为三十六升只是总量的四分之三，要求完整的单位一，就要用对应数量除以对应分率。";
  await playNarration("typed-reply", reply, CLONE_CLIPS.typedReply, (caption) => {
    state.replyText = caption;
  });
  state.replyText = reply;
  state.resumeAvailable = true;
  renderTutorScreen();
}

function problemFromText(rawText) {
  const text = rawText.replace(/\s+/g, "");
  if (/一桶油|还剩36升|油原来/.test(text)) return PROBLEMS.oil;
  if (/苹果|水果店/.test(text)) return PROBLEMS.apples;
  if (/科普书|图书角/.test(text)) return PROBLEMS.books;

  const question = rawText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)[0] || "已识别题目";
  return {
    ...PROBLEMS.oil,
    id: "recognized",
    question,
    type: /\d+\s*\/\s*\d+|分之/.test(rawText) ? "分数应用题" : "应用题",
    key: "找准题目中的单位“1”，再确认数量和分率的对应关系",
    unitOne: "题目中的总量",
    conceptQuestion: "这道题里，哪一个量最适合看作单位“1”？",
    options: ["题目中的总量", "已知部分量", "题目中的分率", "我不确定"],
    correctOption: "题目中的总量",
    correspondingAmount: "题目中的已知数量",
    correspondingRate: "对应的分率",
    stepOneTitle: "第一步：找出数量与分率的对应关系",
    stepOneFormula: "对应量 ↔ 对应分率",
    stepTwoTitle: "第二步：根据对应关系列式计算",
    stepTwoFormula: "对应量 ÷ 对应分率 = 单位“1”的量",
    answerLead: "答：",
    answer: "请根据识别题目计算",
    summary: "解分数应用题，要先确定单位“1”，再找清楚每个数量对应的分率。",
  };
}

async function recognizeUploadedProblem(file) {
  if (!file) return PROBLEMS.oil;
  try {
    const response = await fetch("/api/ocr", {
      method: "POST",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!response.ok) throw new Error("OCR request failed");
    const result = await response.json();
    if (result.text) return problemFromText(result.text);
  } catch {
    const name = file.name.toLowerCase();
    if (/apple|苹果/.test(name)) return PROBLEMS.apples;
    if (/book|科普|图书/.test(name)) return PROBLEMS.books;
  }
  return PROBLEMS.oil;
}

async function confirmCapture() {
  if (state.processing) return;
  state.processing = true;
  render();
  const recognizedProblem = await recognizeUploadedProblem(state.uploadedFile);
  state.problem = recognizedProblem;
  await new Promise((resolve) => setTimeout(resolve, 520));
  state.screen = "tutor";
  state.processing = false;
  state.stage = "intro";
  state.questionText = "";
  state.typeVisible = false;
  state.typeText = "";
  state.keyVisible = false;
  state.keyText = "";
  state.detailsVisible = false;
  state.stepOneVisible = false;
  state.stepTwoVisible = false;
  state.answerVisible = false;
  state.summaryVisible = false;
  state.summaryText = "";
  state.highlightsVisible = false;
  state.transcript = "";
  state.quizVisible = false;
  state.awaitingContinue = false;
  state.queryText = "";
  state.replyText = "";
  state.resumeAvailable = false;
  state.completed = false;
  flowToken += 1;
  render();
  await audioTimingsReady;
  runOpening();
}

function returnToCapture() {
  flowToken += 1;
  cancelNarration();
  state.screen = "capture";
  state.stage = "capture";
  state.processing = false;
  state.keyboardOpen = false;
  state.quizVisible = false;
  render();
}

function resetSamplePhoto() {
  if (state.captureImageUrl.startsWith("blob:")) URL.revokeObjectURL(state.captureImageUrl);
  state.captureImageUrl = "./assets/competitor/sample-camera-photo.png";
  state.uploadedPreview = false;
  state.uploadedFile = null;
  state.problem = PROBLEMS.oil;
  render();
}

function openOcrEditor() {
  const edited = window.prompt("修改识别结果", state.problem.question);
  if (!edited || edited.trim() === state.problem.question) return;
  state.problem = problemFromText(edited.trim());
  state.questionText = state.problem.question;
  renderTutorScreen();
  showToast("识别结果已更新");
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target || target.disabled) return;
  const action = target.dataset.action;
  if (action === "choose-photo" || action === "change-problem") photoInput.click();
  if (action === "reset-photo") resetSamplePhoto();
  if (action === "confirm-crop") confirmCapture();
  if (action === "capture-close" || action === "back-to-capture") returnToCapture();
  if (action === "quiz-option") selectQuizOption(target.dataset.value);
  if (action === "quiz-close") selectQuizOption("我不确定");
  if (action === "continue") {
    state.awaitingContinue = false;
    flowToken += 1;
    renderTutorScreen();
    runFinal();
  }
  if (action === "toggle-pause") togglePause();
  if (action === "open-keyboard") {
    if (state.quizVisible) return;
    state.resumePoint = currentStage || state.stage || "intro";
    flowToken += 1;
    cancelNarration();
    state.keyboardOpen = true;
    state.resumeAvailable = false;
    renderTutorScreen();
    requestAnimationFrame(() => app.querySelector("textarea")?.focus());
  }
  if (action === "close-keyboard") {
    state.keyboardOpen = false;
    state.resumeAvailable = true;
    renderTutorScreen();
  }
  if (action === "resume") resumeTeaching();
  if (action === "edit-ocr") openOcrEditor();
});

app.addEventListener("pointerdown", (event) => {
  const target = event.target.closest('[data-action="hold-talk"]');
  if (!target) return;
  event.preventDefault();
  startRecording();
});

window.addEventListener("pointerup", () => finishRecording());
window.addEventListener("pointercancel", () => finishRecording());

app.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.target.dataset.form !== "question") return;
  const value = new FormData(event.target).get("question")?.toString() || "";
  submitTypedQuestion(value);
});

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  if (!file) return;
  if (state.captureImageUrl.startsWith("blob:")) URL.revokeObjectURL(state.captureImageUrl);
  state.uploadedFile = file;
  state.captureImageUrl = URL.createObjectURL(file);
  state.uploadedPreview = true;
  if (state.screen !== "capture") {
    flowToken += 1;
    cancelNarration();
    state.screen = "capture";
  }
  render();
  photoInput.value = "";
});

window.addEventListener("pagehide", () => {
  flowToken += 1;
  cancelNarration();
  window.clearInterval(recordingTimer);
});

window.__competitorCloneState = () => JSON.parse(JSON.stringify(state));
window.__speechNormalize = normalizeForSpeech;

render();
