const SEED = [
  { q: "你是怎么学会做网站的？", a: "用 vibe coding：我把想法说清楚，AI 帮我写代码，我再慢慢改。像种花一样，先埋种子。", time: "2026-08-12" },
  { q: "为什么叫 WuJu59Web？", a: "这是我自己起的项目名，没有特别含义，顺口就好。", time: "2026-08-12" }
];
const STORE_KEY = "wuju59-askbox-v1";

let questions = loadQuestions();

function loadQuestions() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* 忽略损坏数据 */ }
  return [...SEED];
}

function saveQuestions() {
  localStorage.setItem(STORE_KEY, JSON.stringify(questions));
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function nowStr() {
  return new Date().toLocaleString("zh-CN", { hour12: false });
}

function renderQuestions() {
  const list = $("#ask-list");
  if (!list) return;
  list.innerHTML = "";
  [...questions].reverse().forEach(q => {
    const item = document.createElement("article");
    item.className = "ask-item";
    const answer = q.a
      ? `<p class="ask-a">${esc(q.a)}</p>`
      : `<form class="ask-answer-form">
          <input type="text" maxlength="200" placeholder="写回答……">
          <button class="btn" type="submit">回答</button>
        </form>`;
    item.innerHTML = `
      <div class="ask-meta">
        <span>匿名提问</span>
        <time>${esc(q.time)}</time>
        <button type="button" class="ask-del">[删除]</button>
      </div>
      <p class="ask-q">Q：${esc(q.q)}</p>
      ${answer}`;

    item.querySelector(".ask-del").addEventListener("click", () => {
      questions = questions.filter(x => x !== q);
      saveQuestions();
      renderQuestions();
      toast("已删除问题");
    });
    const form = item.querySelector(".ask-answer-form");
    if (form) {
      form.addEventListener("submit", ev => {
        ev.preventDefault();
        const v = form.querySelector("input").value.trim();
        if (!v) return;
        q.a = v;
        saveQuestions();
        renderQuestions();
        toast("已回答 ✿");
      });
    }
    list.appendChild(item);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderQuestions();

  $("#ask-form").addEventListener("submit", ev => {
    ev.preventDefault();
    const text = $("#ask-text").value.trim();
    if (!text) {
      toast("写点什么再丢进提问箱吧");
      return;
    }
    questions.push({ q: text, a: "", time: nowStr() });
    saveQuestions();
    renderQuestions();
    ev.target.reset();
    toast("已悄悄丢进提问箱 ✿");
  });
});
