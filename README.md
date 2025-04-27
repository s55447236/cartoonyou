# CartoonYou

一个将照片转换为卡通头像的 Web 应用。

🌐 [在线预览](https://s55447236.github.io/cartoonyou/)

## 功能特点

- 上传照片生成卡通头像
- 支持多种表情生成
- 生成动态表情包
- 支持下载静态和动态表情包

## 快速开始

### 前端部署

1. 克隆仓库：

```bash
git clone https://github.com/你的用户名/cartoonme.git
cd cartoonme
```

2. 安装依赖：

```bash
npm install
```

3. 启动开发服务器：

```bash
npm run dev
```

4. 在浏览器中访问：

```
http://localhost:5500
```

### 配置

在 `config.js` 文件中配置 API 服务器地址：

```javascript
const API_CONFIG = {
  BASE_URL: "http://你的服务器地址:端口",
  // ...
};
```

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API
- HTTP Server

## 项目结构

```
cartoonme/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # 主要JavaScript逻辑
├── apiService.js       # API服务
├── config.js           # 配置文件
└── components/         # 组件目录
    └── LoadingOverlay.js
```

## API 文档

详细的 API 文档请参考 [api_reference.md](api_reference.md)

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## Contact

- Your Name - [@yourusername](https://github.com/yourusername)
- Project Link: [https://github.com/yourusername/cartoonme](https://github.com/yourusername/cartoonme)
