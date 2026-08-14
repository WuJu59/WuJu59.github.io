/* ============================================================
   数据库访问层（默认 Supabase REST API，无需 SDK）
   未配置（js/config.js 的 SUPABASE 为空）时，页面自动回退本地存储。
   注意：anon key 可以公开；service_role key 绝不能放进前端。
   ============================================================ */
const DB = {
  token: null,

  ready() {
    return !!(typeof SUPABASE !== "undefined" && SUPABASE.url && SUPABASE.anonKey);
  },

  authHeaders() {
    return {
      "apikey": SUPABASE.anonKey,
      "Authorization": "Bearer " + (this.token || SUPABASE.anonKey),
      "Content-Type": "application/json"
    };
  },

  async request(method, path, body) {
    const r = await fetch(SUPABASE.url + path, {
      method,
      headers: this.authHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });
    if (!r.ok) throw new Error(method + " " + path + " -> " + r.status);
    /* PostgREST 的插入/更新默认返回空响应体，这里兼容空体 */
    const text = await r.text();
    if (!text) return null;
    return JSON.parse(text);
  },

  select(table, order = "created_at") {
    return this.request("GET", "/rest/v1/" + table + "?select=*&order=" + order + ".desc");
  },

  insert(table, row) {
    return this.request("POST", "/rest/v1/" + table, row);
  },

  update(table, id, patch) {
    return this.request("PATCH", "/rest/v1/" + table + "?id=eq." + encodeURIComponent(id), patch);
  },

  remove(table, id) {
    return this.request("DELETE", "/rest/v1/" + table + "?id=eq." + encodeURIComponent(id));
  },

  incrementLike(id) {
    return this.request("POST", "/rest/v1/rpc/increment_like", { row_id: id });
  },

  /* 上传图片到 Supabase Storage（公开桶 answer-images） */
  async uploadImage(file) {
    const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
    const name = Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
    const path = encodeURIComponent(name);
    const r = await fetch(SUPABASE.url + "/storage/v1/object/answer-images/" + path, {
      method: "POST",
      headers: {
        "apikey": SUPABASE.anonKey,
        "Authorization": "Bearer " + (this.token || SUPABASE.anonKey)
      },
      body: file
    });
    if (!r.ok) throw new Error("upload " + r.status);
    return SUPABASE.url + "/storage/v1/object/public/answer-images/" + path;
  },

  async login(email, password) {
    const r = await fetch(SUPABASE.url + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { "apikey": SUPABASE.anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!r.ok) throw new Error("login failed " + r.status);
    const data = await r.json();
    this.token = data.access_token;
    return this.token;
  }
};

/* 完整时间显示：有具体时刻就显示 年-月-日 时:分，只有日期就显示日期 */
function fmtDateTime(d) {
  if (!d) return "";
  const s = String(d);
  if (s.includes("T") || s.includes(" ")) {
    const dt = new Date(d);
    if (!isNaN(dt)) {
      const p = n => String(n).padStart(2, "0");
      return dt.getFullYear() + "-" + p(dt.getMonth() + 1) + "-" + p(dt.getDate()) +
        " " + p(dt.getHours()) + ":" + p(dt.getMinutes());
    }
  }
  return s.slice(0, 10);
}
