# WuJu59Web · 五九的小站

一个"现代 × 复古"风格的个人网站，参考了 periwinkle 模板的可爱博客排版（页头横幅、双线边框、彩色投影卡片、侧边栏），主题色为橘色。
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
| `guestbook.html` | 留言板 + 涂鸦画板 |
| `admin.html` | 管理台：登录后管理提问箱与留言板 |

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
默认密码 `wuju59`，请在 `js/config.js` 的 `adminPassword` 里修改。

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
