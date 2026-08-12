/* ===== 管理台：提问箱 + 留言板 ===== */
const ASK_KEY = "wuju59-askbox-v1";
const GB_KEY = "wuju59-guestbook-v1";
const SEED_ASKS = [
  { q: "你是怎么学会做网站的？", a: "用 vibe coding：我把想法说清楚，AI 帮我写代码，我再慢慢改。像种花一样，先埋种子。", time: "2026-08-12" },
  { q: "为什么叫 WuJu59Web？", a: "这是我自己起的项目名，没有特别含义，顺口就好。", time: "2026-08-12" }
];
const SEED_GB = [
  { nick: "站长", text: "欢迎来到小站！可以留言，也可以画个涂鸦 ✿", time: "2026-08-12 00:00", doodle: "" }
];

let asks = [];
let entries = [];

function load(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* 忽略损坏数据 */ }
  return [...seed];
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function renderAsks() {
  const box = $("#admin-asks");
  if (!box) return;
  box.innerHTML = "";
  [...asks].reverse().forEach(q => {
    const item = document.createElement("div");
    item.className = "admin-item";
    const answer = q.a
      ? `<p class="ask-a">${esc(q.a)}</p>`
      : `<form class="ask-answer-form">
          <input type="text" maxlength="200" placeholder="写回答……">
          <button class="btn" type="submit">回答</button>
        </form>`;
    item.innerHTML = `
      <div class="admin-meta">
        <span>匿名提问</span>
        <time>${esc(q.time)}</time>
        <button type="button" class="admin-del">[删除]</button>
      </div>
      <p class="ask-q">Q：${esc(q.q)}</p>
      ${answer}`;
    item.querySelector(".admin-del").addEventListener("click", () => {
      asks = asks.filter(x => x !== q);
      save(ASK_KEY, asks);
      renderAll();
      toast("已删除问题");
    });
    const form = item.querySelector(".ask-answer-form");
    if (form) {
      form.addEventListener("submit", ev => {
        ev.preventDefault();
        const v = form.querySelector("input").value.trim();
        if (!v) return;
        q.a = v;
        save(ASK_KEY, asks);
        renderAll();
        toast("已回答 ✿");
      });
    }
    box.appendChild(item);
  });
}

function renderEntries() {
  const box = $("#admin-entries");
  if (!box) return;
  box.innerHTML = "";
  [...entries].reverse().forEach(e => {
    const item = document.createElement("div");
    item.className = "admin-item";
    const doodle = e.doodle ? `<img class="doodle-img" src="${e.doodle}" alt="涂鸦">` : "";
    item.innerHTML = `
      <div class="admin-meta">
        <span>${esc(e.nick)}</span>
        <time>${esc(e.time)}</time>
        <button type="button" class="admin-del">[删除]</button>
      </div>
      <p>${esc(e.text)}</p>
      ${doodle}`;
    item.querySelector(".admin-del").addEventListener("click", () => {
      entries = entries.filter(x => x !== e);
      save(GB_KEY, entries);
      renderAll();
      toast("已删除留言");
    });
    box.appendChild(item);
  });
}

function renderAll() {
  asks = load(ASK_KEY, SEED_ASKS);
  entries = load(GB_KEY, SEED_GB);
  $("#stat-asks").textContent = asks.length;
  $("#stat-entries").textContent = entries.length;
  renderAsks();
  renderEntries();
}

function showPanel() {
  $("#admin-login").hidden = true;
  $("#admin-panel").hidden = false;
  renderAll();
}

document.addEventListener("DOMContentLoaded", () => {
  const authed = sessionStorage.getItem("wuju59-admin") === "1";
  if (authed) {
    showPanel();
  } else {
    $("#admin-login").hidden = false;
    $("#admin-panel").hidden = true;
  }

  $("#login-form").addEventListener("submit", ev => {
    ev.preventDefault();
    if ($("#admin-password").value === SITE.adminPassword) {
      sessionStorage.setItem("wuju59-admin", "1");
      showPanel();
      toast("欢迎回来，五九 ✿");
    } else {
      toast("密码不对哦");
    }
  });

  $("#logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem("wuju59-admin");
    location.reload();
  });

  $("#export-entries").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "留言板备份-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $("#clear-entries").addEventListener("click", () => {
    if (!confirm("确定要清空全部留言吗？此操作不可撤销。")) return;
    entries = [];
    save(GB_KEY, entries);
    renderAll();
    toast("已清空留言板");
  });
});
