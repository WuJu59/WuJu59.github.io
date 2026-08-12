/* Retro 主题：访客计数器（本地模拟，之后可换真实统计） */
(function () {
  const KEY = "wuju59-visitor-count";
  let count = 1;
  try {
    count = Number(localStorage.getItem(KEY)) || 1;
    count += 1;
    localStorage.setItem(KEY, String(count));
  } catch (e) { /* 隐私模式等场景忽略 */ }
  const pad = String(count).padStart(7, "0");
  document.querySelectorAll("#visitor-counter").forEach((el) => {
    el.textContent = pad;
  });
})();
