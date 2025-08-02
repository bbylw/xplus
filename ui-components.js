/**
 * UI组件和预览模块
 */

// =============================================================================
// 1. UI组件管理器
// =============================================================================

class UIComponentManager {
  constructor(app) {
    this.app = app;
    this.components = new Map();
    this.eventBus = app.eventBus;
    this.logger = app.logger;
    this.state = app.getService('state');
    this.config = app.getService('config');
  }

  // 注册组件
  register(name, component) {
    if (this.components.has(name)) {
      throw new Error(`Component '${name}' already registered`);
    }
    
    component.name = name;
    component.app = this.app;
    this.components.set(name, component);
    this.logger.info(`UI Component registered: ${name}`);
  }

  // 获取组件
  get(name) {
    const component = this.components.get(name);
    if (!component) {
      throw new Error(`Component '${name}' not found`);
    }
    return component;
  }

  // 初始化所有组件
  async initAll() {
    for (const [name, component] of this.components) {
      try {
        if (component.init && typeof component.init === 'function') {
          await component.init();
          this.logger.info(`UI Component initialized: ${name}`);
        }
      } catch (error) {
        this.logger.error(`Failed to initialize component '${name}':`, error);
      }
    }
  }

  // 销毁所有组件
  async destroyAll() {
    for (const [name, component] of this.components) {
      try {
        if (component.destroy && typeof component.destroy === 'function') {
          await component.destroy();
          this.logger.info(`UI Component destroyed: ${name}`);
        }
      } catch (error) {
        this.logger.error(`Failed to destroy component '${name}':`, error);
      }
    }
    this.components.clear();
  }
}

// =============================================================================
// 2. 文本编辑器组件
// =============================================================================

class TextEditorComponent {
  constructor() {
    this.element = null;
    this.toolbar = null;
    this.statsDisplay = null;
    this.formatCallbacks = new Map();
  }

  async init() {
    this.element = Utils.$('#input-text');
    this.toolbar = Utils.$('.format-toolbar');
    this.statsDisplay = Utils.$('.text-stats');
    
    if (!this.element) {
      throw new Error('Text editor element not found');
    }

    this.setupToolbar();
    this.setupTextStats();
    this.bindEvents();
    this.loadContent();
  }

  // 设置工具栏
  setupToolbar() {
    if (!this.toolbar) return;

    const formatButtons = this.toolbar.querySelectorAll('.format-btn');
    formatButtons.forEach(btn => {
      const format = btn.dataset.format;
      if (format) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.applyFormat(format);
          this.highlightButton(btn);
        });
      }
    });

    // 颜色选择器
    const colorPicker = Utils.$('#text-format-color');
    if (colorPicker) {
      colorPicker.addEventListener('change', (e) => {
        this.applyFormat('color', e.target.value);
      });
    }
  }

  // 应用格式
  applyFormat(format, value = null) {
    const start = this.element.selectionStart;
    const end = this.element.selectionEnd;
    const selectedText = this.element.value.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'highlight':
        formattedText = `<mark>${selectedText}</mark>`;
        break;
      case 'strikethrough':
        formattedText = `~~${selectedText}~~`;
        break;
      case 'h1':
        formattedText = `# ${selectedText}`;
        break;
      case 'h2':
        formattedText = `## ${selectedText}`;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      case 'code':
        formattedText = selectedText.includes('\n') ? 
          `\`\`\`\n${selectedText}\n\`\`\`` : 
          `\`${selectedText}\``;
        break;
      case 'color':
        formattedText = `<span style="color: ${value}">${selectedText}</span>`;
        break;
      default:
        return;
    }
    
    // 替换选中文本
    const newValue = this.element.value.substring(0, start) + 
                    formattedText + 
                    this.element.value.substring(end);
    
    this.element.value = newValue;
    this.updateContent(newValue);
    
    // 更新光标位置
    const newCursorPos = start + formattedText.length;
    this.element.setSelectionRange(newCursorPos, newCursorPos);
  }

  // 高亮按钮
  highlightButton(button) {
    button.classList.add('active');
    setTimeout(() => button.classList.remove('active'), 200);
  }

  // 设置文本统计
  setupTextStats() {
    if (!this.statsDisplay) return;

    this.updateStats = Utils.throttle(() => {
      const text = this.element.value;
      const chars = text.length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const lines = text.split('\n').length;
      
      const charEl = this.statsDisplay.querySelector('#char-count');
      const wordEl = this.statsDisplay.querySelector('#word-count');
      const lineEl = this.statsDisplay.querySelector('#line-count');
      
      if (charEl) charEl.textContent = `${chars} 字符`;
      if (wordEl) wordEl.textContent = `${words} 词`;
      if (lineEl) lineEl.textContent = `${lines} 行`;
    }, 100);
  }

  // 绑定事件
  bindEvents() {
    // 输入事件
    this.element.addEventListener('input', (e) => {
      this.updateContent(e.target.value);
      if (this.updateStats) this.updateStats();
    });

    // 粘贴事件
    this.element.addEventListener('paste', () => {
      setTimeout(() => {
        this.updateContent(this.element.value);
        if (this.updateStats) this.updateStats();
      }, 10);
    });

    // 快捷键
    this.element.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            this.applyFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            this.applyFormat('italic');
            break;
          case 'u':
            e.preventDefault();
            this.applyFormat('underline');
            break;
        }
      }
    });
  }

  // 更新内容到状态
  updateContent(content) {
    this.app.getService('state').set('text.content', content);
    this.app.eventBus.emit('text:changed', content);
  }

  // 加载内容
  loadContent() {
    const content = this.app.getService('config').get('text.content');
    if (content && this.element) {
      this.element.value = content;
      if (this.updateStats) this.updateStats();
    }
  }

  // 设置内容
  setContent(content) {
    if (this.element) {
      this.element.value = content;
      this.updateContent(content);
      if (this.updateStats) this.updateStats();
    }
  }

  // 获取内容
  getContent() {
    return this.element ? this.element.value : '';
  }

  // 清空内容
  clear() {
    this.setContent('');
  }

  // 销毁组件
  destroy() {
    // 清理事件监听器会由组件管理器处理
  }
}

// =============================================================================
// 3. 样式控制组件
// =============================================================================

class StyleControlComponent {
  constructor() {
    this.controls = new Map();
    this.debounceDelay = 150;
  }

  async init() {
    this.setupControls();
    this.bindEvents();
    this.loadSettings();
  }

  // 设置控件
  setupControls() {
    const controlSelectors = {
      fontFamily: '#font-family',
      fontSize: '#font-size',
      lineHeight: '#line-height',
      textColor: '#text-color',
      bgColor: '#bg-color',
      cardWidth: '#card-width',
      contentPadding: '#content-padding',
      template: '#template'
    };

    Object.entries(controlSelectors).forEach(([name, selector]) => {
      const element = Utils.$(selector);
      if (element) {
        this.controls.set(name, {
          element,
          type: this.getControlType(element),
          lastValue: element.value
        });
      }
    });

    // 设置显示值元素
    this.displayElements = {
      fontSize: Utils.$('#font-size-val'),
      lineHeight: Utils.$('#line-height-val'),
      cardWidth: Utils.$('#card-width-val'),
      contentPadding: Utils.$('#content-padding-val')
    };
  }

  // 获取控件类型
  getControlType(element) {
    if (element.type === 'range') return 'range';
    if (element.type === 'color') return 'color';
    if (element.tagName === 'SELECT') return 'select';
    return 'input';
  }

  // 绑定事件
  bindEvents() {
    this.controls.forEach((control, name) => {
      const { element, type } = control;
      
      // 创建防抖更新函数
      const debouncedUpdate = Utils.debounce((value) => {
        this.updateStyle(name, value);
      }, this.debounceDelay);

      // 根据控件类型绑定事件
      if (type === 'range') {
        element.addEventListener('input', (e) => {
          this.updateDisplayValue(name, e.target.value);
          debouncedUpdate(e.target.value);
        });
      } else {
        element.addEventListener('change', (e) => {
          debouncedUpdate(e.target.value);
        });
      }
    });
  }

  // 更新显示值
  updateDisplayValue(name, value) {
    const displayEl = this.displayElements[name];
    if (!displayEl) return;

    switch (name) {
      case 'fontSize':
      case 'cardWidth':
      case 'contentPadding':
        displayEl.textContent = value + 'px';
        break;
      case 'lineHeight':
        displayEl.textContent = parseFloat(value).toFixed(2).replace(/\.00$/, '');
        break;
    }
  }

  // 更新样式
  updateStyle(name, value) {
    const numericValue = this.parseValue(name, value);
    
    // 特殊处理模板变更
    if (name === 'template') {
      // 更新配置
      this.app.getService('config').set('template.current', value);
      
      // 触发模板更新事件
      this.app.eventBus.emit('template:changed', value);
      return;
    }
    
    // 更新状态
    this.app.getService('state').set(`style.${name}`, numericValue);
    
    // 更新配置
    this.app.getService('config').set(`style.${name}`, numericValue);
    
    // 触发样式更新事件
    this.app.eventBus.emit('style:changed', { property: name, value: numericValue });
    
    // 更新显示值
    this.updateDisplayValue(name, value);
  }

  // 解析值
  parseValue(name, value) {
    const numericFields = ['fontSize', 'lineHeight', 'cardWidth', 'contentPadding'];
    if (numericFields.includes(name)) {
      return parseFloat(value);
    }
    return value;
  }

  // 加载设置
  loadSettings() {
    const config = this.app.getService('config');
    
    this.controls.forEach((control, name) => {
      let value;
      
      // 特殊处理模板
      if (name === 'template') {
        value = config.get('template.current');
      } else {
        value = config.get(`style.${name}`);
      }
      
      if (value !== undefined) {
        control.element.value = value;
        this.updateDisplayValue(name, value);
      }
    });
  }

  // 设置样式值
  setStyle(name, value) {
    const control = this.controls.get(name);
    if (control) {
      control.element.value = value;
      this.updateStyle(name, value);
    }
  }

  // 批量设置样式
  setStyles(styles) {
    Object.entries(styles).forEach(([name, value]) => {
      this.setStyle(name, value);
    });
  }

  // 获取当前样式
  getStyles() {
    const styles = {};
    this.controls.forEach((control, name) => {
      styles[name] = this.parseValue(name, control.element.value);
    });
    return styles;
  }

  // 重置样式
  reset() {
    const defaults = this.app.getService('config').defaults.style;
    this.setStyles(defaults);
  }
}

// =============================================================================
// 4. 预览组件
// =============================================================================

class PreviewComponent {
  constructor() {
    this.container = null;
    this.captureArea = null;
    this.contentElement = null;
    this.brandElement = null;
    this.watermarkElement = null;
    this.isUpdating = false;
    this.updateQueue = [];
  }

  async init() {
    this.setupElements();
    this.bindEvents();
    this.setupInitialContent();
  }

  // 设置元素
  setupElements() {
    this.container = Utils.$('.preview-card');
    this.captureArea = Utils.$('#capture-area');
    this.contentElement = Utils.$('#content-text');
    this.brandElement = Utils.$('#brand-name');
    this.watermarkElement = Utils.$('#watermark');
    
    if (!this.captureArea || !this.contentElement) {
      throw new Error('Preview elements not found');
    }
  }

  // 绑定事件
  bindEvents() {
    // 监听文本变化
    this.app.eventBus.on('text:changed', (content) => {
      this.queueUpdate('content', content);
    });

    // 监听样式变化
    this.app.eventBus.on('style:changed', ({ property, value }) => {
      this.queueUpdate('style', { property, value });
    });

    // 监听模板变化
    this.app.eventBus.on('template:changed', (template) => {
      this.queueUpdate('template', template);
    });

    // 监听品牌变化
    this.app.eventBus.on('brand:changed', (brand) => {
      this.queueUpdate('brand', brand);
    });

    // 监听水印变化
    this.app.eventBus.on('watermark:changed', (watermark) => {
      this.queueUpdate('watermark', watermark);
    });
  }

  // 队列更新
  queueUpdate(type, data) {
    this.updateQueue.push({ type, data, timestamp: Date.now() });
    
    if (!this.isUpdating) {
      this.processUpdateQueue();
    }
  }

  // 处理更新队列
  async processUpdateQueue() {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    
    try {
      while (this.updateQueue.length > 0) {
        const updates = this.updateQueue.splice(0);
        await this.applyUpdates(updates);
        
        // 小延迟避免过于频繁的更新
        await new Promise(resolve => setTimeout(resolve, 16));
      }
    } finally {
      this.isUpdating = false;
    }
  }

  // 应用更新
  async applyUpdates(updates) {
    const batched = this.batchUpdates(updates);
    
    // 按优先级处理更新
    const priorities = ['template', 'style', 'content', 'brand', 'watermark'];
    
    for (const type of priorities) {
      if (batched[type]) {
        await this.applyUpdate(type, batched[type]);
      }
    }
  }

  // 批处理更新
  batchUpdates(updates) {
    const batched = {};
    
    updates.forEach(({ type, data }) => {
      if (type === 'style') {
        if (!batched.style) batched.style = {};
        batched.style[data.property] = data.value;
      } else {
        batched[type] = data;
      }
    });
    
    return batched;
  }

  // 应用单个更新
  async applyUpdate(type, data) {
    switch (type) {
      case 'content':
        this.updateContent(data);
        break;
      case 'style':
        this.updateStyles(data);
        break;
      case 'template':
        this.updateTemplate(data);
        break;
      case 'brand':
        this.updateBrand(data);
        break;
      case 'watermark':
        this.updateWatermark(data);
        break;
    }
  }

  // 更新内容
  updateContent(content) {
    if (!this.contentElement) return;
    
    try {
      const config = this.app.getService('config');
      const enableMarkdown = config.get('text.enableMarkdown');
      
      if (enableMarkdown && typeof marked !== 'undefined') {
        this.contentElement.innerHTML = marked.parse(content || '');
      } else {
        this.contentElement.textContent = content || '在左侧输入你的内容，右侧将实时更新预览。';
      }
    } catch (error) {
      this.app.logger.error('Content update failed:', error);
      this.contentElement.textContent = content || '内容渲染失败';
    }
  }

  // 更新样式
  updateStyles(styles) {
    if (!this.captureArea || !this.contentElement) return;
    
    Object.entries(styles).forEach(([property, value]) => {
      switch (property) {
        case 'fontFamily':
          this.captureArea.style.fontFamily = value;
          this.contentElement.style.fontFamily = value;
          break;
        case 'fontSize':
          this.contentElement.style.fontSize = `${value}px`;
          break;
        case 'lineHeight':
          this.contentElement.style.lineHeight = value.toString();
          break;
        case 'textColor':
          this.captureArea.style.color = value;
          break;
        case 'bgColor':
          this.captureArea.style.backgroundColor = value;
          break;
        case 'cardWidth':
          this.captureArea.style.width = `${value}px`;
          document.documentElement.style.setProperty('--preview-width', `${value}px`);
          break;
        case 'contentPadding':
          document.documentElement.style.setProperty('--preview-padding', `${value}px`);
          break;
      }
    });
  }

  // 更新模板
  updateTemplate(template) {
    if (!this.captureArea) return;
    
    // 移除所有模板类
    const currentClasses = this.captureArea.className.split(' ');
    const filteredClasses = currentClasses.filter(cls => !cls.startsWith('template-'));
    
    // 设置新的类名
    this.captureArea.className = filteredClasses.join(' ');
    
    // 添加新模板类
    if (template) {
      this.captureArea.classList.add(template);
    }
    
    // 强制重排以确保样式生效
    this.captureArea.offsetHeight;
  }

  // 更新品牌
  updateBrand(brand) {
    if (!this.brandElement) return;
    
    const username = brand.username || '';
    const formattedUsername = username ? 
      (username.startsWith('@') ? username : `@${username}`) : '';
    
    this.brandElement.textContent = formattedUsername;
    this.brandElement.style.display = formattedUsername ? 'inline-block' : 'none';
  }

  // 更新水印
  updateWatermark(watermark) {
    if (!this.watermarkElement) return;
    
    if (!watermark.enabled || !watermark.text) {
      this.watermarkElement.style.display = 'none';
      return;
    }
    
    this.watermarkElement.textContent = watermark.text;
    this.watermarkElement.style.display = 'block';
    this.watermarkElement.style.fontSize = `${watermark.size}px`;
    this.watermarkElement.style.color = watermark.color;
    this.watermarkElement.style.opacity = watermark.opacity;
    
    // 更新位置
    this.watermarkElement.className = 'watermark';
    this.watermarkElement.classList.add(watermark.position);
  }

  // 设置初始内容
  setupInitialContent() {
    const config = this.app.getService('config');
    const content = config.get('text.content');
    const styles = config.get('style');
    const template = config.get('template.current');
    const brand = config.get('brand');
    const watermark = config.get('watermark');
    
    this.updateContent(content);
    this.updateStyles(styles);
    this.updateTemplate(template);
    this.updateBrand(brand);
    this.updateWatermark(watermark);
  }

  // 获取预览元素
  getCaptureElement() {
    return this.captureArea;
  }

  // 强制更新
  forceUpdate() {
    this.setupInitialContent();
  }
}

// 导出组件类
window.UIComponentManager = UIComponentManager;
window.TextEditorComponent = TextEditorComponent;
window.StyleControlComponent = StyleControlComponent;
window.PreviewComponent = PreviewComponent;