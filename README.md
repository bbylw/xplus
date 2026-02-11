# TextCard

> 长文转长图工具 - 一键生成精美长图，轻松分享到 X/社交媒体

![TextCard Preview](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Platform](https://img.shields.io/badge/platform-Web-orange)

## ✨ 功能特性

### 🎯 核心功能

- **📝 文本编辑** - 支持富文本输入，粘贴/手动输入长文
- **🎨 模板选择** - 5 套精美预设样式模板
  - 极简风格 - 简洁清新
  - 暗黑风格 - 深邃神秘
  - 商务风格 - 专业稳重
  - 文艺风格 - 优雅文艺
  - 科技风格 - 现代科技感
- **👁️ 实时预览** - 输入即渲染，所见即所得
- **📐 自动排版** - 标题/正文智能识别与排版
- **💾 一键导出** - PNG 格式导出，支持 1x/2x/3x 清晰度
- **🏷️ 水印设置** - 可添加文字水印和 Logo 图片

### 🚀 增强功能

- **📖 Markdown 支持** - 支持完整 Markdown 语法
  - 标题（H1-H6）
  - 加粗、斜体
  - 有序/无序列表
  - 引用块
  - 代码块（带语法高亮）
- **📊 字数统计** - 实时显示字数
- **💾 本地存储** - 自动保存用户设置
- **📱 响应式设计** - 完美适配 PC 和移动端

## 🛠️ 技术栈

- **前端框架**: 原生 HTML + CSS + JavaScript
- **样式**: Tailwind CSS
- **Markdown 解析**: [marked.js](https://marked.js.org/)
- **代码高亮**: [highlight.js](https://highlightjs.org/)
- **图片导出**: [html2canvas](https://html2canvas.hertzen.com/)
- **字体**: Noto Sans SC + JetBrains Mono

## 📦 项目结构

```
opencode/
├── index.html           # 主页面
├── css/
│   ├── style.css       # 主样式（布局、组件）
│   └── templates.css   # 模板样式（5套主题）
└── js/
    ├── app.js          # 主逻辑（初始化、事件绑定）
    ├── markdown.js     # Markdown 解析模块
    ├── templates.js    # 模板管理模块
    ├── export.js       # 图片导出模块
    └── storage.js      # 本地存储模块
```

## 🚀 快速开始

### 方式一：直接打开

1. 克隆或下载项目
2. 直接在浏览器中打开 `index.html`

### 方式二：本地服务器

```bash
# 使用 Python
python -m http.server 8080

# 使用 Node.js (需安装 http-server)
npx http-server -p 8080

# 使用 PHP
php -S localhost:8080
```

然后访问 `http://localhost:8080`

## 📖 使用指南

### 基本使用

1. **输入文本** - 在左侧编辑区输入或粘贴长文内容
2. **选择模板** - 点击喜欢的模板样式
3. **调整设置** - 根据需要调整字号、添加水印
4. **导出图片** - 选择清晰度，点击"导出图片"按钮

### Markdown 语法支持

```markdown
# 一级标题
## 二级标题
### 三级标题

**加粗文本**
*斜体文本*

- 无序列表项 1
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2

> 引用文本

`行内代码`

​```javascript
// 代码块
function hello() {
  console.log('Hello, TextCard!');
}
​```
```

### 水印设置

1. 开启水印开关
2. 输入水印文字（如 @your_id）
3. 可选：上传个人 Logo 图片

### 清晰度选择

| 清晰度 | 适用场景 |
|--------|----------|
| 1x | 网页浏览、快速分享 |
| 2x | 社交媒体发布（推荐）|
| 3x | 高质量打印、大屏展示 |

## 🎨 模板预览

### 极简风格
简约清新，适合日常分享、笔记整理

### 暗黑风格
深邃神秘，适合技术文章、深夜发文

### 商务风格
专业稳重，适合工作报告、商业内容

### 文艺风格
优雅文艺，适合诗歌散文、心情记录

### 科技风格
现代科技感，适合技术分享、产品介绍

## 🔧 自定义配置

### 修改模板

编辑 `css/templates.css` 文件，可以自定义模板样式：

```css
.template-custom {
  --bg-primary: #your-color;
  --text-primary: #your-color;
  /* ... */
}
```

### 添加新模板

在 `js/templates.js` 中添加模板配置：

```javascript
{
  id: 'custom',
  name: '自定义',
  className: 'template-custom',
  preview: { /* 预览样式 */ }
}
```

## 🌐 浏览器支持

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📝 更新日志

### v1.0.0 (2026-02-12)

- ✨ 初始版本发布
- ✨ 实现 P0 全部核心功能
- ✨ 支持 Markdown 语法
- ✨ 5 套预设模板
- ✨ 响应式设计

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [marked.js](https://marked.js.org/) - Markdown 解析
- [html2canvas](https://html2canvas.hertzen.com/) - 截图导出
- [highlight.js](https://highlightjs.org/) - 代码高亮
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Google Fonts](https://fonts.google.com/) - 字体服务

## 📮 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 [Issue](../../issues)
- 发送邮件至 your-email@example.com

---

**Made with ❤️ by TextCard Team**
