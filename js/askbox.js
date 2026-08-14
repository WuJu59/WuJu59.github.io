const SEED = [
  { q: "你是怎么学会做网站的？", a: "用 vibe coding：我把想法说清楚，AI 帮我写代码，我再慢慢改。像种花一样，先埋种子。", time: "2026-08-12" },
  { q: "为什么叫 WuJu59Web？", a: "这是我自己起的项目名，没有特别含义，顺口就好。", time: "2026-08-12" }
];
const STORE_KEY = "wuju59-askbox-v1";

let questions = [];
let mode = "local";

async function loadQuestions() {
  if (DB.ready()) {
    try {
      questions = await DB.select("asks");
      mode = "db";
      return;
    } catch (e) {
      console.warn("提问箱数据库读取失败，回退本地：", e);
    }
  }
  mode = "local";
  try {
    const raw = localStorage.getItem(STORE_KEY);
    questions = raw ? JSON.parse(raw) : [...SEED];
  } catch (e) {
    questions = [...SEED];
  }
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

function fmtDate(d) {
  return d ? String(d).slice(0, 10) : "";
}

function renderQuestions() {
  const list = $("#ask-list");
  if (!list) return;
  list.innerHTML = "";
  [...questions].reverse().forEach(q => {
    const item = document.createElement("article");
    item.className = "ask-item";
    const question = q.question || q.q;
    const answer = q.answer || q.a || "";
    const imgUrl = q.answer_image || "";
    const time = q.created_at ? fmtDate(q.created_at) : (q.time || "");

    let answerHtml;
    if (answer) {
      answerHtml = `<p class="ask-a">${esc(answer)}</p>`;
    } else if (mode === "db") {
      answerHtml = `<p class="t-dim">站长正在认真思考中…</p>`;
    } else {
      answerHtml = `<form class="ask-answer-form">
        <input type="text" maxlength="200" placeholder="写回答……">
        <button class="btn" type="submit">回答</button>
      </form>`;
    }
    if (imgUrl) {
      answerHtml += `<img class="ask-img" src="${esc(imgUrl)}" alt="回答图片">`;
    }

    const del = mode === "local"
      ? `<button type="button" class="ask-del">[删除]</button>`
      : "";
    item.innerHTML = `
      <div class="ask-meta">
        <span>匿名提问</span>
        <time>${esc(time)}</time>
        ${del}
      </div>
      <p class="ask-q">Q：${esc(question)}</p>
      ${answerHtml}`;

    if (mode === "local") {
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
    }
    list.appendChild(item);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadQuestions();
  renderQuestions();

  $("#ask-form").addEventListener("submit", async ev => {
    ev.preventDefault();
    const text = $("#ask-text").value.trim();
    if (!text) {
      toast("写点什么再丢进提问箱吧");
      return;
    }
    if (mode === "db") {
      try {
        await DB.insert("asks", { question: text, answer: "" });
        await loadQuestions();
        renderQuestions();
        ev.target.reset();
        toast("已悄悄丢进提问箱 ✿");
      } catch (e) {
        toast("提交失败，请稍后再试");
      }
    } else {
      questions.push({ q: text, a: "", time: nowStr() });
      saveQuestions();
      renderQuestions();
      ev.target.reset();
      toast("已悄悄丢进提问箱 ✿");
    }
  });
});
