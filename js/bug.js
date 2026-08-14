/* Bug 反馈：数据库优先，连不上/没建表时暂存本地 */
const BUG_KEY = "wuju59-bug-reports-v1";

function bugEsc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function saveLocalBug(list) {
  localStorage.setItem(BUG_KEY, JSON.stringify(list));
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bug-form");
  const status = document.getElementById("bug-status");

  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const message = document.getElementById("bug-message").value.trim();
    if (!message) {
      status.textContent = "请先描述一下问题。";
      return;
    }
    const report = {
      message,
      page: document.getElementById("bug-page").value.trim(),
      contact: document.getElementById("bug-contact").value.trim()
    };
    let local = false;
    if (DB.ready()) {
      try {
        await DB.insert("bug_reports", report);
      } catch (e) {
        console.warn("bug 反馈写入数据库失败，暂存本地：", e);
        local = true;
      }
    } else {
      local = true;
    }
    if (local) {
      try {
        const list = JSON.parse(localStorage.getItem(BUG_KEY) || "[]");
        report.time = new Date().toLocaleString("zh-CN", { hour12: false });
        list.push(report);
        saveLocalBug(list);
      } catch (e) { /* 忽略 */ }
    }
    form.reset();
    status.textContent = local ? "已提交 ✓（数据库未就绪，已暂存本地）" : "已提交 ✓ 站长会看到你的反馈";
  });
});
