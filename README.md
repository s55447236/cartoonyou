# CartoonYou

将您的照片转换成独特的卡通形象 - 完美适用于头像、表情包等。

## 功能特点

- 🎨 AI 驱动的卡通头像生成
- 😊 多种表情动画支持
- 🎬 支持多种动画格式 (WebP, MP4, WebM)
- 📱 响应式设计，支持移动端
- ⚡ 实时预览和编辑
- 💾 一键下载和分享

## 技术栈

- HTML5
- CSS3 (动画, Flexbox, Grid)
- JavaScript (原生)
- 支持现代浏览器的动画格式

## 本地开发

1. 克隆仓库

```bash
git clone https://github.com/s55447236/cartoonyou.git
cd cartoonyou
```

2. 使用本地服务器运行项目

```bash
# 如果你有 Python
python -m http.server 8000

# 或者使用 Node.js 的 http-server
npx http-server
```

3. 在浏览器中访问 `http://localhost:8000`

## 项目结构

```
cartoonyou/
├── animations/       # 动画文件 (WebP, MP4, WebM)
├── images/          # 静态图片资源
│   ├── avatars/     # 示例头像
│   ├── emotion/     # 表情图标
│   └── icon/        # UI图标
├── index.html       # 主页面
├── styles.css       # 样式文件
└── script.js        # JavaScript逻辑
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可

MIT License
