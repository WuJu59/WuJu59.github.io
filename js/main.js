/* ===== 全站通用逻辑 ===== */
const $ = (sel, root = document) => root.querySelector(sel);

document.addEventListener("DOMContentLoaded", () => {
  const fill = (id, text) => {
    const el = $(id);
    if (el) el.textContent = text;
  };
  fill("#whoami-name", SITE.name);
  fill("#profile-name", SITE.name);
  fill("#footer-name", SITE.name);
  fill("#tagline", SITE.tagline);
  fill("#status-text", SITE.status);
  fill("#since", SITE.since);

  /* 时钟 */
  const clock = $("#clock");
  if (clock) {
    const tick = () => {
      clock.textContent = new Date().toLocaleString("zh-CN", { hour12: false });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* 首页：最新 3 篇日记 */
  const latest = $("#latest-posts");
  if (latest && typeof POSTS !== "undefined") {
    latest.innerHTML = POSTS.slice(0, 3).map((p, i) => `
      <a class="post" href="journal.html#post-${i}">
        <time>${p.date}</time>
        <h3>${p.title}</h3>
        <p>${p.excerpt}</p>
      </a>`).join("");
  }

  /* 日记页：完整列表 */
  const list = $("#post-list");
  if (list && typeof POSTS !== "undefined") {
    const count = $("#post-count");
    if (count) count.textContent = `共 ${POSTS.length} 篇日记`;
    list.innerHTML = POSTS.map((p, i) => `
      <details class="post" id="post-${i}">
        <summary>
          <time>${p.date}</time>
          <h3>${p.title}</h3>
          <span class="tags-inline">${p.tags.map(t => `<i>#${t}</i>`).join("")}</span>
        </summary>
        <div class="content">${p.content}</div>
      </details>`).join("");
  }
});
