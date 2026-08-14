/* ===== 管理台：说说 / 相册 / 提问箱 / 留言板 ===== */
const ASK_KEY = "wuju59-askbox-v1";
const GB_KEY = "wuju59-guestbook-v1";
const SEED_ASKS = [
  { q: "你是怎么学会做网站的？", a: "用 vibe coding：我把想法说清楚，AI 帮我写代码，我再慢慢改。像种花一样，先埋种子。", time: "2026-08-12" },
  { q: "为什么叫 WuJu59Web？", a: "这是我自己起的项目名，没有特别含义，顺口就好。", time: "2026-08-12" }
];
const SEED_GB = [
  { nick: "站长", text: "欢迎来到小站！可以留言，也可以画个涂鸦 ✿", time: "2026-08-12 00:00", doodle: "" }
];

let mode = "local";
let asks = [];
let entries = [];
let shuoshuo = [];
let albums = [];

function loadLocal(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* 忽略损坏数据 */ }
  return [...seed];
}

function saveLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function fmtDate(d) {
  return d ? String(d).slice(0, 10) : "";
}

function renderAsks() {
  const box = $("#admin-asks");
  if (!box) return;
  box.innerHTML = "";
  [...asks].reverse().forEach(q => {
    const item = document.createElement("div");
    item.className = "admin-item";
    const question = q.question || q.q;
    const answer = q.answer || q.a || "";
    const time = q.created_at ? fmtDate(q.created_at) : (q.time || "");
    const answerHtml = answer
      ? `<p class="ask-a">${esc(answer)}</p>`
      : `<form class="ask-answer-form">
          <input type="text" maxlength="200" placeholder="写回答……">
          <button class="btn" type="submit">回答</button>
        </form>`;
    item.innerHTML = `
      <div class="admin-meta">
        <span>匿名提问</span>
        <time>${esc(time)}</time>
        <button type="button" class="admin-del">[删除]</button>
      </div>
      <p class="ask-q">Q：${esc(question)}</p>
      ${answerHtml}`;

    item.querySelector(".admin-del").addEventListener("click", async () => {
      if (mode === "db") {
        try { await DB.remove("asks", q.id); } catch (e) { toast("删除失败"); return; }
      } else {
        asks = asks.filter(x => x !== q);
        saveLocal(ASK_KEY, asks);
      }
      await loadAll();
      toast("已删除问题");
    });
    const form = item.querySelector(".ask-answer-form");
    if (form) {
      form.addEventListener("submit", async ev => {
        ev.preventDefault();
        const v = form.querySelector("input").value.trim();
        if (!v) return;
        if (mode === "db") {
          try { await DB.update("asks", q.id, { answer: v }); } catch (e) { toast("保存失败"); return; }
        } else {
          q.a = v;
          saveLocal(ASK_KEY, asks);
        }
        await loadAll();
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
    const time = e.created_at ? fmtDate(e.created_at) : (e.time || "");
    item.innerHTML = `
      <div class="admin-meta">
        <span>${esc(e.nick)}</span>
        <time>${esc(time)}</time>
        <button type="button" class="admin-del">[删除]</button>
      </div>
      <p>${esc(e.text)}</p>
      ${doodle}`;
    item.querySelector(".admin-del").addEventListener("click", async () => {
      if (mode === "db") {
        try { await DB.remove("guestbook", e.id); } catch (err) { toast("删除失败"); return; }
      } else {
        entries = entries.filter(x => x !== e);
        saveLocal(GB_KEY, entries);
      }
      await loadAll();
      toast("已删除留言");
    });
    box.appendChild(item);
  });
}

function renderShuoshuoAdmin() {
  const box = $("#admin-shuoshuo");
  if (!box) return;
  box.innerHTML = "";
  [...shuoshuo].reverse().forEach(s => {
    const item = document.createElement("div");
    item.className = "admin-item";
    item.innerHTML = `
      <div class="admin-meta">
        <span>@${SITE.name} · ${esc(s.mood || "日常")}</span>
        <time>${fmtDate(s.created_at)}</time>
        <button type="button" class="admin-del">[删除]</button>
      </div>
      <p>${esc(s.text)}</p>`;
    item.querySelector(".admin-del").addEventListener("click", async () => {
      try { await DB.remove("shuoshuo", s.id); } catch (e) { toast("删除失败"); return; }
      await loadAll();
      toast("已删除说说");
    });
    box.appendChild(item);
  });
}

function renderAlbumsAdmin() {
  const box = $("#admin-albums");
  if (!box) return;
  box.innerHTML = "";
  [...albums].reverse().forEach(a => {
    const item = document.createElement("div");
    item.className = "admin-item";
    item.innerHTML = `
      <div class="admin-meta">
        <span>${esc(a.emoji || "✿")} ${esc(a.title)}</span>
        <time>${fmtDate(a.created_at)}</time>
        <button type="button" class="admin-del">[删除]</button>
      </div>
      <p class="t-dim">${esc(a.url || a.note || "占位")}</p>`;
    item.querySelector(".admin-del").addEventListener("click", async () => {
      try { await DB.remove("albums", a.id); } catch (e) { toast("删除失败"); return; }
      await loadAll();
      toast("已删除相册");
    });
    box.appendChild(item);
  });
}

async function loadAll() {
  if (DB.ready()) {
    mode = "db";
    try {
      [asks, entries, shuoshuo, albums] = await Promise.all([
        DB.select("asks"), DB.select("guestbook"), DB.select("shuoshuo"), DB.select("albums")
      ]);
      $("#db-only-sections").hidden = false;
      $("#stat-db").hidden = false;
      $("#mode-note").textContent = "当前：在线数据库模式（Supabase）。";
    } catch (e) {
      console.warn("数据库读取失败，回退本地：", e);
      mode = "local";
      asks = loadLocal(ASK_KEY, SEED_ASKS);
      entries = loadLocal(GB_KEY, SEED_GB);
      $("#db-only-sections").hidden = true;
      $("#stat-db").hidden = true;
      $("#mode-note").textContent = "当前：本地存储模式（数据库连接失败，已回退）。";
    }
  } else {
    mode = "local";
    asks = loadLocal(ASK_KEY, SEED_ASKS);
    entries = loadLocal(GB_KEY, SEED_GB);
    $("#db-only-sections").hidden = true;
    $("#stat-db").hidden = true;
    $("#mode-note").textContent = "当前：本地存储模式（未接数据库）。";
  }

  $("#stat-asks").textContent = asks.length;
  $("#stat-entries").textContent = entries.length;
  $("#stat-shuoshuo").textContent = shuoshuo.length;
  $("#stat-albums").textContent = albums.length;
  renderAsks();
  renderEntries();
  renderShuoshuoAdmin();
  renderAlbumsAdmin();
}

function showPanel() {
  $("#admin-login").hidden = true;
  $("#admin-panel").hidden = false;
  loadAll();
}

document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("wuju59-admin") === "1") {
    showPanel();
  } else {
    $("#admin-login").hidden = false;
    $("#admin-panel").hidden = true;
  }

  $("#login-form").addEventListener("submit", async ev => {
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
  });

  $("#clear-entries").addEventListener("click", async () => {
    if (!confirm("确定要清空全部留言吗？此操作不可撤销。")) return;
    if (mode === "db") {
      try {
        for (const e of entries) await DB.remove("guestbook", e.id);
      } catch (err) {
        toast("清空失败，请重试");
        return;
      }
    } else {
      entries = [];
      saveLocal(GB_KEY, entries);
    }
    await loadAll();
    toast("已清空留言板");
  });

  $("#admin-shuoshuo-form").addEventListener("submit", async ev => {
    ev.preventDefault();
    const text = $("#admin-shuoshuo-text").value.trim();
    if (!text) return;
    try {
      await DB.insert("shuoshuo", {
        text,
        mood: $("#admin-shuoshuo-mood").value.trim() || "日常",
        likes: 0
      });
      ev.target.reset();
      await loadAll();
      toast("说说已发布 ✿");
    } catch (e) {
      toast("发布失败，请重试");
    }
  });

  $("#admin-album-form").addEventListener("submit", async ev => {
    ev.preventDefault();
    const title = $("#admin-album-title").value.trim();
    if (!title) return;
    try {
      await DB.insert("albums", {
        title,
        emoji: $("#admin-album-emoji").value.trim() || "✿",
        color: $("#admin-album-color").value.trim() || "#f5b06e",
        url: $("#admin-album-url").value.trim(),
        note: $("#admin-album-note").value.trim()
      });
      ev.target.reset();
      await loadAll();
      toast("相册已添加 ✿");
    } catch (e) {
      toast("添加失败，请重试");
    }
  });
});
