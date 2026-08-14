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
    if (method === "DELETE") return null;
    return r.json();
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
