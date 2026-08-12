# WuJu59Web · 千禧小站（Y2K Personal Site）

一个千禧年（Y2K）风格的复古个人网站，100% 纯 HTML/CSS/JS，零依赖、零构建，双击就能打开。

既可以当个人网站，也可以作为「主题」复用，或者当彩蛋网页挂在别的地方。

## 快速开始

直接双击 `index.html`。或者用任意静态服务器（例如 `npx serve`）。

## 项目结构

```
WuJu59Web/
├── index.html        # 首页
├── about.html        # 关于我
├── journal.html      # 日记（记录）
├── guestbook.html    # 留言板
├── css/
│   └── base.css      # 基础结构样式（与主题无关）
├── themes/
│   └── y2k/          # 千禧年主题（theme.css + theme.js）
├── js/
│   ├── config.js     # 站点信息（名字、签名、状态）
│   ├── posts.js      # 日记数据
│   ├── main.js       # 通用逻辑
│   └── guestbook.js  # 留言板逻辑（localStorage）
└── README.md
```

## 当主题用

主题 = `themes/<名字>/` 目录，包含 `theme.css` 和 `theme.js`。
换主题时，把页面里引用的两行换成新主题即可：

```html
<link rel="stylesheet" href="themes/新主题/theme.css">
<script src="themes/新主题/theme.js"></script>
```

配色主要通过 CSS 变量控制（`--accent`、`--bg`、`--font-body` 等）。复制一份 `y2k` 改名，再改变量，就能做出新主题。

## 当彩蛋网页用

整个目录是自包含的静态站，部署到任何静态托管（GitHub Pages / Vercel / Netlify）即可；也可以把整站放进主站的子目录，作为隐藏彩蛋入口。

## 改内容

| 想改什么 | 改哪里 |
| --- | --- |
| 名字 / 签名 / 状态 | `js/config.js` |
| 日记 | `js/posts.js` |
| 主题样式 | `themes/y2k/theme.css` |
| 留言板数据 | 浏览器 localStorage（页面有「备份留言」按钮） |

## 路线图

- [ ] 更多主题（像素游戏风、笔记本手账风…）
- [ ] 留言板联网同步（Supabase 等）
- [ ] 相册页
- [ ] 部署 + 自定义域名
