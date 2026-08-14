/* 简易提问箱：与主站共用同一份数据（Supabase / 本地回退），
   没有导航、没有其他入口，保持简陋。 */
const STORE_KEY = "wuju59-askbox-v1";
const SEED = [
  { q: "你是怎么学会做网站的？", a: "用 vibe coding：我把想法说清楚，AI 帮我写代码，我再慢慢改。", time: "2026-08-12" },
  { q: "为什么叫 WuJu59Web？", a: "自己起的项目名，没有特别含义，顺口就好。", time: "2026-08-12" }
];

let questions = [];
let mode = "local";

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function fmtDate(d) {
  return fmtDateTime(d);
}

async function load() {
  if (DB.ready()) {
    try {
      questions = await DB.select("asks");
      mode = "db";
      return;
    } catch (e) {
      console.warn("数据库读取失败，回退本地：", e);
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

function render() {
  const list = document.getElementById("ask-list");
  if (!list) return;
  list.innerHTML = "";
  [...questions].reverse().forEach(q => {
    const question = q.question || q.q;
    const answer = q.answer || q.a || "";
    const imgUrl = q.answer_image || "";
    const time = q.created_at ? fmtDate(q.created_at) : (q.time || "");
    const div = document.createElement("div");
    div.className = "q";
    const a = answer
      ? `<div class="a">答：${esc(answer)}</div>`
      : `<div class="a">（等待回答…）</div>`;
    const img = imgUrl ? `<img src="${esc(imgUrl)}" alt="回答图片">` : "";
    div.innerHTML = `<div class="meta">${esc(time)}</div><div>问：${esc(question)}</div>${a}${img}`;
    list.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await load();
  render();

  document.getElementById("ask-submit").addEventListener("click", async () => {
    const input = document.getElementById("ask-text");
    const status = document.getElementById("status");
    const text = input.value.trim();
    if (!text) {
      status.textContent = "写点什么再提交吧。";
      return;
    }
    try {
      if (mode === "db") {
        await DB.insert("asks", { question: text, answer: "" });
      } else {
        questions.push({
          q: text,
          a: "",
          time: new Date().toLocaleString("zh-CN", { hour12: false })
        });
        localStorage.setItem(STORE_KEY, JSON.stringify(questions));
      }
      input.value = "";
      status.textContent = "已提交 ✓";
      await load();
      render();
    } catch (e) {
      status.textContent = "提交失败，请稍后再试。";
    }
  });
});
