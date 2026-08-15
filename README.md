# WuJu59Web · 五九的小站

一个"现代 × 复古"风格的个人网站，参考了 periwinkle 模板的可爱博客排版（页头横幅、双线边框、彩色投影卡片、侧边栏），主题色为橘色，背景是星星花纹，配了原创的可爱装饰（chibi 头像、星星挂件）。无渐变。
100% 纯 HTML/CSS/JS，零依赖、零构建，双击即可打开。

## 快速开始

双击 `index.html` → 点击中间方框进入主站。

## 页面

| 文件 | 说明 |
| --- | --- |
| `index.html` | 入口页：中间方框（彩蛋触发器占位）+ 四周公告小盒 |
| `home.html` | 真首页：侧边栏（头像/简介/信息）+ 关于五九 + 最新说说 + 更新日志 |
| `shuoshuo.html` | 说说（QQ 空间风格，可点赞） |
| `album.html` | 相册（照片占位） |
| `ask.html` | 匿名提问箱 |
| `ask-lite.html` | 简易提问箱（极简、无导航，与主站数据一致） |
| `guestbook.html` | 留言板 + 涂鸦画板 |
| `admin.html` | 管理台：登录后管理提问箱与留言板 |
| `game.html` | 小游戏（独立单页，无站点导航，可直接分享链接） |
| `ear-tab.html` | 耳扒：管理员上传的视频 |
| `bug.html` | Bug 反馈：访客提交问题 |

## 项目结构

```
WuJu59Web/
├── index.html
├── home.html
├── shuoshuo.html
├── album.html
├── ask.html
├── guestbook.html
├── admin.html          # 管理台
├── css/
│   └── base.css        # 基础结构样式（与主题无关）
├── assets/             # 原创装饰图片（chibi.svg、星星）
├── themes/
│   └── retro/          # 当前主题（橘色，参考 periwinkle）
├── js/
│   ├── config.js       # 站点信息、公告、管理密码
│   ├── shuoshuo.js     # 说说数据
│   ├── album.js        # 相册数据
│   ├── main.js         # 通用逻辑
│   ├── askbox.js       # 提问箱逻辑
│   ├── guestbook.js    # 留言板 + 涂鸦逻辑
│   └── admin.js        # 管理台逻辑
└── README.md
```

## 管理台

页面底部「⚙ 管理」进入，或用浏览器打开 `admin.html`。
默认密码 `j12345678`，请在 `js/config.js` 的 `adminPassword` 里修改。账号系统开发中，暂时只用密码登录。

> ⚠️ 临时权限说明：因为管理页还没接入账号系统，需要到 Supabase 运行一次
> [supabase/temp-anon-manage.sql](supabase/temp-anon-manage.sql)，
> 否则管理页的删除/回答会被数据库权限拒绝。这是临时方案（匿名可改数据），
> 账号系统做好后会恢复严格权限（重新运行 `supabase/schema.sql` 即可）。

**v0.8 回答图片**：管理台回答问题时可上传图片（存在 Supabase Storage 的公开桶 `answer-images`）。
现有数据库需要运行一次 [supabase/migration-v0.8.sql](supabase/migration-v0.8.sql)（加一列 + 建存储桶 + 权限），新装数据库直接跑 `schema.sql` 即可。

**v0.10 耳扒视频 + Bug 反馈**：现有数据库需要再运行一次 [supabase/migration-v0.10.sql](supabase/migration-v0.10.sql)
（建 `videos`、`bug_reports` 两张表 + `videos` 存储桶），之后管理员就能在管理台上传视频，访客也能提交 Bug 反馈了。

> 注意：目前所有数据都存在浏览器 localStorage，管理台与公共页面共用同一份数据；换浏览器或清除缓存会丢失。

## 当主题用 / 当彩蛋用

主题 = `themes/<名字>/` 目录。换主题时改页面里引用的两行即可：

```html
<link rel="stylesheet" href="themes/新主题/theme.css">
<script src="themes/新主题/theme.js"></script>
```

配色主要通过 CSS 变量控制（`--accent-color`、`--header-bg`、`--border-color` 等）。
整站是自包含的静态站，部署到 GitHub Pages / Vercel / Netlify 即可，也可以作为彩蛋子目录挂到别的网站。

## 改内容

| 想改什么 | 改哪里 |
| --- | --- |
| 名字 / 签名 / 状态 / 公告 / 管理密码 | `js/config.js` |
| 说说 | `js/shuoshuo.js` |
| 相册 | `js/album.js` |
| 主题样式 | `themes/retro/theme.css` |

## 路线图

- [ ] 中间方框的彩蛋触发
- [ ] 真实照片与头像
- [ ] 评论、说说配图
- [ ] 数据联网同步（Supabase 等）
- [ ] 部署 + 自定义域名

## 上线（让别人看到你的网站）

这是一个纯静态网站，任选一个免费静态托管即可：

1. **Vercel / Netlify（最简单）**：注册账号后，把整个 WuJu59Web 文件夹直接拖进网页，自动部署，几分钟后得到一个免费网址。
2. **GitHub Pages**：把文件夹上传到 GitHub 仓库 → 仓库 Settings → Pages → 选分支，即可获得 `https://用户名.github.io/仓库名`。
3. **Cloudflare Pages**：同样免费，连接 GitHub 或直接上传。

> 注意：目前留言板、提问箱的数据都存在访客自己的浏览器 localStorage 里（管理台看到的也是本机数据）。上线后大家能看到页面、能留言（各留各的），但想让大家的数据集中到你自己这边，需要接一个数据库后端（比如 Supabase），这是路线图里的下一步。

## 实时更新（每次提交自动上线）

网站是纯静态的，只要开启自动部署，以后**改完代码 push 一次，线上 1-3 分钟内自动更新**，不用再手动传文件。

1. **开启 GitHub Pages**：GitHub 仓库 → Settings → Pages → Source 选「Deploy from a branch」→ 分支选 `main`、目录选 `/ (root)` → Save。开启后你会拿到一个 `https://用户名.github.io/仓库名` 的网址。
2. **连接本地仓库**（一次性）：在 WuJu59Web 文件夹里运行：
   ```bash
   git remote add origin https://github.com/你的用户名/WuJu59Web.git
   ```
   如果 GitHub 上的仓库已经有内容（比如网页上传的），第一次推送需要先合并或强推，我可以在你提供仓库地址后帮你处理。
3. **以后每次更新**：改完文件后运行一键脚本：
   ```powershell
   powershell -ExecutionPolicy Bypass -File push-update.ps1
   ```
   或者用 GitHub Desktop：打开项目 → Commit → Push origin，效果一样。

想边改边看本地效果（不发布）的话，用 VS Code 的 Live Server 插件打开项目，或运行 `npx serve` 即可。

## 接数据库（Supabase，在线存储）

目前不配置也能用（数据存在浏览器本地）。想让访客的留言/提问真正汇总到你这边，按下面 4 步做：

1. **注册并新建项目**：打开 <https://supabase.com> → Sign in → New project（免费额度够用），记下项目地址。
2. **建表**：进入项目 → 左侧 SQL Editor → New query → 把项目里的 [supabase/schema.sql](supabase/schema.sql) 全部粘贴进去 → Run。表、权限和示例数据都会自动建好。
3. **填配置**：项目 → Settings → API，复制 Project URL 和 anon public key，填到 [js/config.js](js/config.js) 的 `SUPABASE` 里：
   ```js
   const SUPABASE = {
     url: "https://你的项目.supabase.co",
     anonKey: "eyJhbGciOi..."
   };
   ```
4. **建管理员账号**：项目 → Authentication → Users → Add user，填一个邮箱+密码（管理台登录用）。建议在 Authentication → Sign In / Providers → Email 里关闭「Allow new users」（防止别人注册）。

> 如果你只用密码登录管理台（v0.7 默认），可以跳过第 4 步，改为运行一次
> `supabase/temp-anon-manage.sql`（见上文"临时权限说明"）。

完成后再 push 一次，线上就自动生效：
   - 公共页面：留言、提问、点赞都进数据库，全网互通；
   - 管理台：用邮箱+密码登录，可管理说说、相册、提问箱、留言板；
   - 数据库连不上时自动回退到本地存储，网站不会挂。

> 安全提醒：`anonKey` 可以公开（本来就要给浏览器用）；**`service_role` 密钥绝不能放进前端**。
