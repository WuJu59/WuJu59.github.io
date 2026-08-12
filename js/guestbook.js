const SEED = [
  { nick: "站长☆", text: "欢迎来到我的小站！！记得常来玩 ✿", time: "2026-08-12 00:00" }
];
const STORE_KEY = "y2k-guestbook-v1";

let entries = loadEntries();

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* 忽略损坏数据 */ }
  return [...SEED];
}

function saveEntries() {
  localStorage.setItem(STORE_KEY, JSON.stringify(entries));
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function nowStr() {
  return new Date().toLocaleString("zh-CN", { hour12: false });
}

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2200);
}

function renderEntries() {
  const list = $("#entries");
  if (!list) return;
  list.innerHTML = "";
  [...entries].reverse().forEach(e => {
    const card = document.createElement("div");
    card.className = "guest-entry";
    card.innerHTML = `
      <div class="meta">
        <span class="nick">${esc(e.nick)}</span>
        <span><time>${esc(e.time)}</time><button class="del" title="删除这条留言">[删除]</button></span>
      </div>
      <p>${esc(e.text)}</p>`;
    card.querySelector(".del").addEventListener("click", () => {
      entries = entries.filter(x => x !== e);
      saveEntries();
      renderEntries();
      toast("已删除一条留言");
    });
    list.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderEntries();

  const form = $("#guest-form");
  form.addEventListener("submit", ev => {
    ev.preventDefault();
    const text = $("#message").value.trim();
    if (!text) {
      toast("写点什么再提交吧");
      return;
    }
    entries.push({
      nick: $("#nick").value.trim() || "匿名访客",
      text,
      time: nowStr()
    });
    saveEntries();
    renderEntries();
    form.reset();
    toast("已留下脚印 ✿");
  });

  $("#export-btn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "留言板备份-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
  });
});
