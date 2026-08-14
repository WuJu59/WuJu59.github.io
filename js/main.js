/* ===== 全站通用逻辑 ===== */
const $ = (sel, root = document) => root.querySelector(sel);

function toast(msg) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2200);
}

function fmtDate(d) {
  return fmtDateTime(d);
}

/* ---------- 说说 ---------- */
async function loadShuoshuo() {
  if (DB.ready()) {
    try {
      const rows = await DB.select("shuoshuo");
      return rows.map(r => ({
        id: r.id,
        text: r.text,
        mood: r.mood || "日常",
        likes: r.likes || 0,
        date: fmtDate(r.created_at)
      }));
    } catch (e) {
      console.warn("说说数据库读取失败，回退本地：", e);
    }
  }
  if (typeof SHUOSHUO !== "undefined") {
    return SHUOSHUO.map((s, i) => ({
      id: "local-" + i,
      text: s.text,
      mood: s.mood,
      likes: s.likes,
      date: s.date
    }));
  }
  return [];
}

function renderShuoshuo(container, items, dbMode) {
  const likedKey = dbMode ? "wuju59-liked-db" : "wuju59-liked";
  let liked = [];
  try { liked = JSON.parse(localStorage.getItem(likedKey) || "[]"); } catch (e) { /* 忽略 */ }

  container.innerHTML = items.map(it => {
    const isLiked = liked.includes(it.id);
    return `
      <article class="shuoshuo-item">
        <div class="shuoshuo-body">
          <div class="shuoshuo-meta">
            <span>@${SITE.name}</span>
            <span class="mood">${it.mood}</span>
            <time>${it.date}</time>
          </div>
          <p class="shuoshuo-text">${it.text}</p>
          <div class="shuoshuo-actions">
            <button type="button" class="like ${isLiked ? "liked" : ""}" data-id="${it.id}" data-likes="${it.likes}">♥ ${it.likes}</button>
            <button type="button" class="comment">评论</button>
          </div>
        </div>
      </article>`;
  }).join("");

  container.querySelectorAll(".like").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const likes = Number(btn.dataset.likes);
      if (liked.includes(id)) return;
      liked.push(id);
      try { localStorage.setItem(likedKey, JSON.stringify(liked)); } catch (e) { /* 忽略 */ }
      if (dbMode) {
        try { await DB.incrementLike(id); } catch (e) { console.warn("点赞失败：", e); }
      } else {
        try {
          const likesStore = JSON.parse(localStorage.getItem("wuju59-likes") || "{}");
          const idx = String(id).replace("local-", "");
          likesStore[idx] = likes + 1;
          localStorage.setItem("wuju59-likes", JSON.stringify(likesStore));
        } catch (e) { /* 忽略 */ }
      }
      const it = items.find(x => x.id === id);
      if (it) it.likes = likes + 1;
      renderShuoshuo(container, items, dbMode);
    });
  });
  container.querySelectorAll(".comment").forEach(btn => {
    btn.addEventListener("click", () => toast("评论功能开发中，先点个赞吧 ✿"));
  });
}

/* ---------- 相册 ---------- */
async function loadAlbums() {
  if (DB.ready()) {
    try {
      const rows = await DB.select("albums");
      return rows.map(r => ({
        title: r.title,
        note: r.note || "",
        url: r.url || "",
        emoji: r.emoji || "✿",
        color: r.color || "#f5b06e",
        date: fmtDate(r.created_at)
      }));
    } catch (e) {
      console.warn("相册数据库读取失败，回退本地：", e);
    }
  }
  if (typeof ALBUMS !== "undefined") {
    return ALBUMS.map(a => ({ ...a }));
  }
  return [];
}

document.addEventListener("DOMContentLoaded", async () => {
  const fill = (id, text) => {
    const el = $(id);
    if (el) el.textContent = text;
  };
  fill("#whoami-name", SITE.name);
  fill("#whoami-name2", SITE.name);
  fill("#profile-name", SITE.name);
  fill("#footer-name", SITE.name);
  fill("#tagline", SITE.tagline);
  fill("#status-text", SITE.status);
  fill("#since", SITE.since);
  fill("#version", SITE.version);

  /* 页脚管理入口 */
  const webring = $(".webring");
  if (webring && !$(".admin-link", webring)) {
    const a = document.createElement("a");
    a.className = "admin-link";
    a.href = "admin.html";
    a.textContent = "⚙ 管理";
    webring.appendChild(a);
  }

  /* 时钟 */
  const clock = $("#clock");
  if (clock) {
    const tick = () => {
      clock.textContent = new Date().toLocaleString("zh-CN", { hour12: false });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* 入口页公告 */
  const boxes = $("#gate-boxes");
  if (boxes) {
    boxes.innerHTML = ANNOUNCEMENTS.map((a, i) => `
      <article class="gate-box gate-box-${i + 1} card">
        <p class="card-title">${a.tag}</p>
        <h3>${a.title}</h3>
        <p class="t-dim">${a.text}</p>
      </article>`).join("");
  }

  /* 说说 */
  if (DB.ready() || typeof SHUOSHUO !== "undefined") {
    const items = await loadShuoshuo();
    const dbMode = DB.ready();
    const latest = $("#latest-shuoshuo");
    if (latest) renderShuoshuo(latest, items.slice(0, 3), dbMode);
    const feed = $("#shuoshuo-list");
    if (feed) {
      const count = $("#shuoshuo-count");
      if (count) count.textContent = `共 ${items.length} 条说说`;
      renderShuoshuo(feed, items, dbMode);
    }
  }

  /* 相册 */
  const grid = $("#album-grid");
  if (grid && (DB.ready() || typeof ALBUMS !== "undefined")) {
    const albums = await loadAlbums();
    grid.innerHTML = albums.map(a => {
      const photo = a.url
        ? `<img class="album-photo" src="${a.url}" alt="${a.title}">`
        : `<div class="album-photo" style="background:${a.color}">${a.emoji}</div>`;
      return `
        <figure class="album-card">
          ${photo}
          <figcaption class="album-info">
            <h3>${a.title}</h3>
            <time>${a.date || ""}</time>
            <p class="t-dim">${a.note}</p>
          </figcaption>
        </figure>`;
    }).join("");
  }
});
