/* Y2K 主题特效：星光、光标闪光、访客计数器 */
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stars = ["✦", "✧", "❀", "★", "☆", "✿"];
  const colors = ["#ff2fb3", "#8f5bff", "#00b8ff", "#ffd400", "#00d68f"];

  if (!reduced) {
    /* 背景星光 */
    for (let i = 0; i < 26; i++) {
      const s = document.createElement("span");
      s.className = "star";
      s.textContent = stars[Math.floor(Math.random() * stars.length)];
      s.style.left = Math.random() * 100 + "vw";
      s.style.top = Math.random() * 100 + "vh";
      s.style.fontSize = 10 + Math.random() * 14 + "px";
      s.style.color = colors[Math.floor(Math.random() * colors.length)];
      s.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
      document.body.appendChild(s);
    }

    /* 光标闪光尾巴 */
    const trail = ["✦", "✧", "♥", "☆", "✿"];
    let last = 0;
    document.addEventListener("mousemove", (e) => {
      const now = Date.now();
      if (now - last < 70) return;
      last = now;
      const t = document.createElement("span");
      t.className = "trail";
      t.textContent = trail[Math.floor(Math.random() * trail.length)];
      t.style.left = e.clientX + "px";
      t.style.top = e.clientY + "px";
      t.style.color = colors[Math.floor(Math.random() * colors.length)];
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 900);
    });
  }

  /* 访客计数器（本地模拟，之后可换真实统计） */
  const KEY = "y2k-visitor-count";
  let count = 1;
  try {
    count = Number(localStorage.getItem(KEY)) || 1;
    count += 1;
    localStorage.setItem(KEY, String(count));
  } catch (e) {
    /* 隐私模式等场景忽略 */
  }
  const pad = String(count).padStart(7, "0");
  document.querySelectorAll("#visitor-counter").forEach((el) => {
    el.textContent = pad;
  });
})();
