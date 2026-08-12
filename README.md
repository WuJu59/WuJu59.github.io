# WuJu59Web · 千禧小站（Retro × Y2K）

一个"现代 × 复古"风格的个人网站，100% 纯 HTML/CSS/JS，零依赖、零构建，双击即可打开。
既可以当个人网站，也可以作为「主题」复用，或者当彩蛋网页挂在别的地方。

## 快速开始

双击 `index.html` → 点击中间方框进入主站。

## 页面

| 文件 | 说明 |
| --- | --- |
| `index.html` | 入口页：中间方框（彩蛋触发器占位）+ 四周公告小盒 |
| `home.html` | 真首页：关于我（已合并）+ 最新说说 + 更新日志 |
| `shuoshuo.html` | 说说（QQ 空间风格，可点赞） |
| `album.html` | 相册（照片占位） |
| `ask.html` | 匿名提问箱 |
| `guestbook.html` | 留言板 + 涂鸦画板 |

## 项目结构

```
WuJu59Web/
├── index.html            # 入口页
├── home.html             # 真首页
├── shuoshuo.html         # 说说
├── album.html            # 相册
├── ask.html              # 提问箱
├── guestbook.html        # 留言板
├── css/
│   └── base.css          # 基础结构样式（与主题无关）
├── themes/
│   └── retro/            # 当前主题（theme.css + theme.js）
├── js/
│   ├── config.js         # 站点信息 + 入口页公告
│   ├── shuoshuo.js       # 说说数据
│   ├── album.js          # 相册数据
│   ├── main.js           # 通用逻辑
│   ├── askbox.js         # 提问箱逻辑
│   └── guestbook.js      # 留言板 + 涂鸦逻辑
└── README.md
```

## 当主题用

主题 = `themes/<名字>/` 目录，包含 `theme.css` 和 `theme.js`。
换主题时，把页面里引用的两行换成新主题即可：

```html
<link rel="stylesheet" href="themes/新主题/theme.css">
<script src="themes/新主题/theme.js"></script>
```

配色主要通过 CSS 变量控制（`--accent`、`--bg`、`--font-display` 等）。复制一份 `retro` 改名，再改变量，就能做出新主题。

## 当彩蛋网页用

整个目录是自包含的静态站，部署到任何静态托管（GitHub Pages / Vercel / Netlify）即可；
也可以把整站放进主站的子目录，作为隐藏彩蛋入口。

## 改内容

| 想改什么 | 改哪里 |
| --- | --- |
| 名字 / 签名 / 状态 / 公告 | `js/config.js` |
| 说说 | `js/shuoshuo.js` |
| 相册 | `js/album.js` |
| 主题样式 | `themes/retro/theme.css` |
| 留言板 / 提问箱数据 | 浏览器 localStorage（留言板有「备份留言」按钮） |

## 路线图

- [ ] 中间方框的彩蛋触发
- [ ] 真实照片与头像
- [ ] 评论、说说配图
- [ ] 留言板 / 提问箱联网同步（Supabase 等）
- [ ] 部署 + 自定义域名
