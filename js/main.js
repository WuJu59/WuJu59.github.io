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

function renderShuoshuo(container, pairs) {
  let likes = {};
  let liked = [];
  try {
    likes = JSON.parse(localStorage.getItem("wuju59-likes") || "{}");
    liked = JSON.parse(localStorage.getItem("wuju59-liked") || "[]");
  } catch (e) { /* 忽略 */ }

  container.innerHTML = pairs.map(({ s, i }) => {
    const n = likes[i] != null ? likes[i] : s.likes;
    const isLiked = liked.includes(i);
    return `
      <article class="shuoshuo-item">
        <div class="shuoshuo-body">
          <div class="shuoshuo-meta">
            <span>@${SITE.name}</span>
            <span class="mood">${s.mood}</span>
            <time>${s.date}</time>
          </div>
          <p class="shuoshuo-text">${s.text}</p>
          <div class="shuoshuo-actions">
            <button type="button" class="like ${isLiked ? "liked" : ""}" data-i="${i}" data-n="${n}">♥ ${n}</button>
            <button type="button" class="comment">评论</button>
          </div>
        </div>
      </article>`;
  }).join("");

  container.querySelectorAll(".like").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.i);
      const n = Number(btn.dataset.n);
      liked = liked.includes(i) ? liked.filter(x => x !== i) : [...liked, i];
      likes[i] = liked.includes(i) ? n + 1 : Math.max(0, n - 1);
      try {
        localStorage.setItem("wuju59-likes", JSON.stringify(likes));
        localStorage.setItem("wuju59-liked", JSON.stringify(liked));
      } catch (e) { /* 忽略 */ }
      renderShuoshuo(container, pairs);
    });
  });
  container.querySelectorAll(".comment").forEach(btn => {
    btn.addEventListener("click", () => toast("评论功能开发中，先点个赞吧 ✿"));
  });
}

document.addEventListener("DOMContentLoaded", () => {
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

  /* 页脚加入管理入口 */
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

  /* 说说：首页最新 + 说说页完整列表 */
  if (typeof SHUOSHUO !== "undefined") {
    const withIndex = SHUOSHUO.map((s, i) => ({ s, i }));
    const latest = $("#latest-shuoshuo");
    if (latest) renderShuoshuo(latest, withIndex.slice(0, 3));
    const feed = $("#shuoshuo-list");
    if (feed) {
      const count = $("#shuoshuo-count");
      if (count) count.textContent = `共 ${SHUOSHUO.length} 条说说`;
      renderShuoshuo(feed, withIndex);
    }
  }

  /* 相册 */
  const grid = $("#album-grid");
  if (grid && typeof ALBUMS !== "undefined") {
    grid.innerHTML = ALBUMS.map(a => {
      const photo = a.url
        ? `<img class="album-photo" src="${a.url}" alt="${a.title}">`
        : `<div class="album-photo" style="background:${a.from}">${a.emoji}</div>`;
      return `
        <figure class="album-card">
          ${photo}
          <figcaption class="album-info">
            <h3>${a.title}</h3>
            <time>${a.date}</time>
            <p class="t-dim">${a.note}</p>
          </figcaption>
        </figure>`;
    }).join("");
  }
});
