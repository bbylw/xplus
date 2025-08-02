# 🎨 长文转图片生成器

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Architecture](https://img.shields.io/badge/Architecture-Modular-blue.svg)](./ARCHITECTURE.md)
[![Performance](https://img.shields.io/badge/Performance-Optimized-green.svg)](./ARCHITECTURE.md)

一款采用**现代化模块化架构**的高性能Web应用，可以轻松地将您的长篇文本、笔记或代码片段转换为设计精美、适合社交媒体分享的图片。

![应用截图](https://s2.loli.net/2023/10/25/v1bF9fR2wzJ5jGZ.png)  
*(这是一个示例截图占位符，您可以替换为自己的应用截图)*

> 🚀 **最新更新**: 完成了完整的架构重构，采用模块化设计，大幅提升了性能和可维护性！详见 [架构说明](./ARCHITECTURE.md)

---

## ✨ 核心功能

我们将众多功能整合到一个简洁的界面中，旨在提供流畅且高效的创作体验。

#### ✍️ 内容与格式化
- **全功能Markdown支持**：内置实时`marked.js`渲染，支持标题、列表、表格、代码块等所有标准语法。
- **富文本工具栏**：提供加粗、斜体、下划线、删除线、高亮、引用和自定义文字颜色等快捷操作。
- **智能文本统计**：实时显示字符数、词数和行数。

#### 🎨 样式与模板
- **19种精美模板**：从简约的信纸风到炫酷的赛博朋克，一键切换，满足不同场景需求。
- **深度自定义**：自由调整字体（支持无衬线、衬线、等宽）、字号、行间距、文字颜色和背景色。
- **灵活布局控制**：自定义卡片宽度和内容区域的内边距。

#### 🖼️ 图像与导出
- **高质量图片导出**：支持1x到4x的导出倍率，确保图片在任何设备上都清晰锐利。
- **多种格式支持**：可导出为PNG（推荐）、JPEG或WebP格式。
- **智能多页面分割**：长文可以自动或手动分割为多个页面，并支持批量生成为ZIP压缩包。
- **自定义水印**：为您的作品添加专属水印，支持调整文字、位置、透明度、大小和颜色。

#### ⚙️ 工作流与性能
- **品牌化定制**：轻松上传品牌Logo，并添加您的社交媒体用户名（如X/Twitter）。
- **快捷键支持**：提供`Ctrl+S`（生成）、`Ctrl+Shift+C`（复制）等快捷键，提升操作效率。
- **本地存储**：所有设置将自动保存在浏览器中，下次访问时无缝恢复。
- **性能优化**：采用智能防抖和节流技术，确保在实时编辑和预览时的流畅体验。

---

## 🎨 模板一览

我们提供丰富多样的模板，分为基础和扩展两大类，以适应您的各种创意需求。

| 基础模板 | 扩展模板 |
| :--- | :--- |
| 📄 **默认** (Default) | ✨ **极简风** (Minimal) |
| 💻 **代码风** (Code) | 🌈 **渐变背景** (Gradient) |
| 💌 **信纸风** (Letter) | 📜 **纸张纹理** (Paper) |
| 🌃 **霓虹渐变** (Neon) | 🌙 **暗黑主题** (Dark) |
| 📰 **杂志报头** (Magazine) | 🕰️ **复古风** (Retro) |
| 📌 **卡片便签** (Sticky) | 🤖 **赛博朋克** (Cyberpunk) |
| 💎 **玻璃拟态** (Glass) | 🌿 **自然风** (Nature) |
| ⌨️ **VSCode风格** (Terminal) | 👔 **商务风** (Business) |
| | 🎨 **创意风** (Creative) |
| | 📱 **社交媒体风** (Social) |
| | 🃏 **现代卡片** (Modern) |

---

## 🚀 快速上手

### 本地运行
在本地运行此项目非常简单：

1.  **克隆仓库**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```
    *(请将 `your-username/your-repo-name.git` 替换为您的仓库地址)*

2.  **直接运行**
    ```bash
    # 方式1: 直接在浏览器中打开
    open index.html
    
    # 方式2: 使用本地服务器（推荐）
    python -m http.server 8000
    # 或者使用 Node.js
    npx serve .
    ```

3.  **开始使用**
    在浏览器中访问 `http://localhost:8000`（如果使用本地服务器）或直接打开 `index.html` 文件。

### 🔧 开发环境
对于开发者，推荐的工作流程：

```bash
# 推荐使用支持 Live Server 的编辑器
# VS Code + Live Server 扩展
# 或者使用任何支持热重载的本地服务器
```

### 📁 项目结构
```
text-to-image-generator/
├── 📄 index.html              # 主页面入口
├── 📄 styles.css              # 样式入口文件
├── 📄 README.md               # 项目说明
├── 📄 ARCHITECTURE.md         # 架构设计文档
│
├── 🧠 JavaScript 模块/
│   ├── core.js                # 核心应用管理器
│   ├── services.js            # 核心服务层
│   ├── ui-components.js       # UI组件层
│   ├── generator.js           # 图片生成功能
│   └── app-init.js            # 应用初始化
│
└── 🎨 CSS 模块/
    ├── core.css               # 核心样式系统
    ├── layout.css             # 布局和响应式
    ├── forms.css              # 表单控件样式
    ├── buttons.css            # 按钮组件样式
    ├── components.css         # 功能组件样式
    ├── notifications.css      # 通知系统样式
    └── templates.css          # 图片模板样式
```

### ⚡ 性能提示
- 首次加载时会自动下载必要的字体和依赖
- 所有设置都会保存在浏览器本地存储中
- 使用现代浏览器以获得最佳性能体验

---

## 🛠️ 技术栈与架构

### 核心技术
-   **前端框架**: HTML5, CSS3, JavaScript (ES6+)
-   **图片生成**: [html2canvas](https://html2canvas.hertzen.com/)
-   **Markdown解析**: [Marked.js](https://marked.js.org/)
-   **多页打包**: [JSZip](https://stuk.github.io/jszip/)
-   **字体库**: [Google Fonts](https://fonts.google.com/) (Inter, Fira Code, Lora)

### 🏗️ 现代化架构设计

#### JavaScript 模块化架构
```
📁 JavaScript 模块/
├── core.js                # 🧠 核心应用管理器、事件总线、工具函数
├── services.js            # ⚙️ 状态管理、配置服务、存储服务、通知服务
├── ui-components.js       # 🎨 UI组件管理器、文本编辑器、样式控制、预览组件
├── generator.js           # 🖼️ 图片生成器、历史管理器
└── app-init.js            # 🚀 应用初始化、模块注册、事件绑定
```

#### CSS 模块化架构
```
📁 CSS 模块/
├── core.css               # 🎯 核心变量、基础样式、工具类
├── layout.css             # 📐 布局系统、响应式设计
├── forms.css              # 📝 表单控件、输入组件
├── buttons.css            # 🔘 按钮组件样式
├── components.css         # 🧩 功能组件（预览、导出、历史等）
├── notifications.css      # 🔔 通知和状态样式
└── templates.css          # 🎨 所有19个图片生成模板
```

### 🚀 架构优势
- **📦 模块化设计**: 职责单一，易于维护和扩展
- **🔗 依赖注入**: 松耦合的组件设计
- **📡 事件驱动**: 组件间通过事件总线通信
- **⚡ 性能优化**: GPU加速、防抖节流、队列管理
- **🔧 错误处理**: 完整的错误捕获和恢复机制
- **📱 响应式**: 完美适配各种设备尺寸

> 📖 **详细架构说明**: 查看 [ARCHITECTURE.md](./ARCHITECTURE.md) 了解完整的技术架构设计

---

## 🤝 参与贡献

我们欢迎各种形式的贡献！如果您有任何想法、建议或发现Bug，请随时提交 [Issues](https://github.com/your-username/your-repo-name/issues) 或 [Pull Requests](https://github.com/your-username/your-repo-name/pulls)。

### 🛠️ 贡献指南
1. **Fork** 本仓库
2. 创建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 **Pull Request**

### 🐛 报告问题
- 使用 [Issues](https://github.com/your-username/your-repo-name/issues) 报告 Bug
- 提供详细的复现步骤和环境信息
- 包含截图或错误信息会很有帮助

### 💡 功能建议
- 通过 Issues 提出新功能建议
- 详细描述功能需求和使用场景
- 欢迎提供设计草图或原型

### 🔧 开发贡献
- 遵循现有的代码风格和架构模式
- 为新功能添加适当的注释和文档
- 确保代码兼容现有的模块化架构
- 测试您的更改是否影响现有功能

---

## 📄 许可证

该项目基于 [MIT License](https://opensource.org/licenses/MIT) 授权。

---

## 🌟 致谢

感谢所有为这个项目做出贡献的开发者和用户！

### 核心依赖
- [html2canvas](https://html2canvas.hertzen.com/) - 强大的HTML转图片库
- [Marked.js](https://marked.js.org/) - 轻量级Markdown解析器
- [JSZip](https://stuk.github.io/jszip/) - JavaScript ZIP库
- [Google Fonts](https://fonts.google.com/) - 优质Web字体服务

### 设计灵感
- GitHub 的现代化设计语言
- VSCode 的终端界面风格
- 各大社交媒体平台的视觉规范

---

<div align="center">

**🎨 让文字变得更美 | 让分享变得更简单**

[⭐ 给个Star](https://github.com/your-username/your-repo-name) • [🐛 报告问题](https://github.com/your-username/your-repo-name/issues) • [💡 功能建议](https://github.com/your-username/your-repo-name/issues/new)

</div>
