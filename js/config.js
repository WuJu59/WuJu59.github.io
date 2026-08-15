/* ===== 站点配置：所有个人信息都改这里 ===== */
const SITE = {
  name: "五九",
  tagline: "记录生活 · 收集快乐 · 橘色狂热爱好者",
  status: "在线，欢迎来坐坐",
  since: "2026.08.12",
  version: "v0.22",
  email: "hello@example.com",
  adminPassword: "j12345678"
};

/* 数据库配置（可选）：Supabase 免费项目
   留空 = 使用本地存储（localStorage）；填好后自动切换为在线存储。
   设置方法见 README「接数据库」一节。 */
const SUPABASE = {
  /* 注意：这里只填项目根地址，不要带 /rest/v1/ */
  url: "https://cnvakfvfwztotnqmhxag.supabase.co",
  /* 在 Supabase → Settings → API 里复制 anon public key（很长，eyJ… 开头） */
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNudmFrZnZmd3p0b3RucW1oeGFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2ODQ3MzUsImV4cCI6MjEwMjI2MDczNX0.bCSLhjkPAcJadRL0zVNDrxFVM9yCw1-Bre0Q5G63TwY"
};

/* 入口页公告：想改公告内容就改这里 */
const ANNOUNCEMENTS = [
  { tag: "v0.22", title: "版本更新", text: "恐龙巴快跑：失败后音乐暂停、只能按钮重开、按钮方框化、Misaki 字体。" },
  { tag: "彩蛋", title: "神秘方框", text: "首页中间那个方框，以后会藏一个彩蛋，敬请期待。" },
  { tag: "关于", title: "关于本站", text: "五九的小站：纯 HTML/CSS/JS 手工打造，零框架、零依赖。" },
  { tag: "提示", title: "使用说明", text: "点击中间方框进入主站；页面底部有管理入口。" }
];
