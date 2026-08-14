const SEED = [
  { nick: "站长", text: "欢迎来到小站！可以留言，也可以画个涂鸦 ✿", time: "2026-08-12 00:00", doodle: "" }
];
const STORE_KEY = "wuju59-guestbook-v1";

let entries = [];
let mode = "local";
let doodleActive = false;

async function loadEntries() {
  if (DB.ready()) {
    try {
      entries = await DB.select("guestbook");
      mode = "db";
      return;
    } catch (e) {
      console.warn("留言板数据库读取失败，回退本地：", e);
    }
  }
  mode = "local";
  try {
    const raw = localStorage.getItem(STORE_KEY);
    entries = raw ? JSON.parse(raw) : [...SEED];
  } catch (e) {
    entries = [...SEED];
  }
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

function fmtDate(d) {
  return d ? String(d).slice(0, 10) : "";
}

function renderEntries() {
  const list = $("#entries");
  if (!list) return;
  list.innerHTML = "";
  [...entries].reverse().forEach(e => {
    const card = document.createElement("div");
    card.className = "guest-entry";
    const doodle = e.doodle ? `<img class="doodle-img" src="${e.doodle}" alt="涂鸦">` : "";
    const time = e.created_at ? fmtDate(e.created_at) : (e.time || "");
    const del = mode === "local"
      ? `<button class="del" title="删除这条留言">[删除]</button>`
      : "";
    card.innerHTML = `
      <div class="meta">
        <span class="nick">${esc(e.nick)}</span>
        <span><time>${esc(time)}</time>${del}</span>
      </div>
      <p>${esc(e.text)}</p>
      ${doodle}`;
    if (mode === "local") {
      card.querySelector(".del").addEventListener("click", () => {
        entries = entries.filter(x => x !== e);
        saveEntries();
        renderEntries();
        toast("已删除一条留言");
      });
    }
    list.appendChild(card);
  });
}

function initDoodle() {
  const canvas = $("#doodle");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = 640;
  canvas.height = 280;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  let color = "#33302a";
  let drawing = false;

  const pos = (e) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  canvas.addEventListener("pointerdown", (e) => {
    drawing = true;
    doodleActive = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = color;
    ctx.stroke();
  });
  canvas.addEventListener("pointerup", () => { drawing = false; });
  canvas.addEventListener("pointercancel", () => { drawing = false; });

  document.querySelectorAll(".swatch").forEach(sw => {
    sw.addEventListener("click", () => {
      color = sw.dataset.color;
      document.querySelectorAll(".swatch").forEach(x => x.classList.remove("active"));
      sw.classList.add("active");
    });
  });

  $("#doodle-clear").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    doodleActive = false;
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadEntries();
  renderEntries();
  initDoodle();

  $("#guest-form").addEventListener("submit", async ev => {
    ev.preventDefault();
    const text = $("#message").value.trim();
    if (!text) {
      toast("写点什么再提交吧");
      return;
    }
    const entry = {
      nick: $("#nick").value.trim() || "匿名访客",
      text,
      doodle: ""
    };
    if (doodleActive) {
      try { entry.doodle = $("#doodle").toDataURL("image/png"); } catch (e) { /* 忽略 */ }
    }

    if (mode === "db") {
      try {
        await DB.insert("guestbook", entry);
        await loadEntries();
        renderEntries();
        ev.target.reset();
        doodleActive = false;
        toast("已留下脚印 ✿");
      } catch (e) {
        toast("提交失败，请稍后再试");
      }
    } else {
      entry.time = nowStr();
      entries.push(entry);
      saveEntries();
      renderEntries();
      ev.target.reset();
      doodleActive = false;
      toast("已留下脚印 ✿");
    }
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
