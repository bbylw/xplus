// 统一获取元素 - 增加安全检查
const $ = (sel) => {
  const element = document.querySelector(sel);
  if (!element) {
    console.warn(`Element not found: ${sel}`);
  }
  return element;
};
const $$ = (sel) => document.querySelectorAll(sel);

// 控件
const inputText = $('#input-text');
const fontFamily = $('#font-family');
const fontSize = $('#font-size');
const fontSizeVal = $('#font-size-val');
const lineHeight = $('#line-height');
const lineHeightVal = $('#line-height-val');
const textColor = $('#text-color');
const bgColor = $('#bg-color');
const logoUpload = $('#logo-upload');
const xUsername = $('#x-username');
const templateSel = $('#template');
const generateBtn = $('#generate-btn');
const copyBtn = $('#copy-btn');
const resetBtn = $('#reset-btn');
const exportScale = $('#export-scale');
const exportScaleVal = $('#export-scale-val');
const exportFormat = $('#export-format');
const cardWidth = $('#card-width');
const cardWidthVal = $('#card-width-val');
const contentPadding = $('#content-padding');
const contentPaddingVal = $('#content-padding-val');
const imageDimensions = $('#image-dimensions');
const fullscreenBtn = $('#fullscreen-btn');
const zoomFitBtn = $('#zoom-fit-btn');

// 新功能元素
const charCount = $('#char-count');
const wordCount = $('#word-count');
const lineCount = $('#line-count');
const historyBtn = $('#history-btn');
const historyPanel = $('#history-panel');
const historyList = $('#history-list');
const clearHistoryBtn = $('#clear-history-btn');
const presetBtns = $$('.preset-btn');

// 格式化工具栏元素
const formatBtns = $$('.format-btn');
const enableMarkdown = $('#enable-markdown');
const autoFormat = $('#auto-format');
const textFormatColor = $('#text-format-color');

// 多页面功能元素
const enableMultiPage = $('#enable-multi-page');
const pageSettings = $('#page-settings');
const maxCharsPerPage = $('#max-chars-per-page');
const prevPageBtn = $('#prev-page-btn');
const nextPageBtn = $('#next-page-btn');
const pageIndicator = $('#page-indicator');
const multiPageExport = $('#multi-page-export');
const generateAllPagesBtn = $('#generate-all-pages-btn');
const generateCurrentPageBtn = $('#generate-current-page-btn');

// 水印功能元素
const enableWatermark = $('#enable-watermark');
const watermarkOptions = $('#watermark-options');
const watermarkText = $('#watermark-text');
const watermarkPosition = $('#watermark-position');
const watermarkOpacity = $('#watermark-opacity');
const watermarkOpacityVal = $('#watermark-opacity-val');
const watermarkSize = $('#watermark-size');
const watermarkSizeVal = $('#watermark-size-val');
const watermarkColor = $('#watermark-color');
const watermarkElement = $('#watermark');

// 预览区域
const captureArea = $('#capture-area');
const contentText = $('#content-text');
const brandLogo = $('#brand-logo');
const brandName = $('#brand-name');
let brandNameVisible = true; // 控制是否显示用户名

// 应用状态
let isGenerating = false;
let currentPage = 0;
let totalPages = 1;
let pages = [];
let settings = {
  fontSize: 20,
  lineHeight: 1.7,
  fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans SC, Arial, sans-serif",
  textColor: "#111111",
  bgColor: "#ffffff",
  template: "template-default",
  cardWidth: 960,
  contentPadding: 32,
  exportScale: 3,
  exportFormat: "png",
  xUsername: "",
  inputText: "",
  enableMarkdown: false,
  autoFormat: false,
  enableMultiPage: false,
  maxCharsPerPage: 800,
  enableWatermark: false,
  watermarkText: "",
  watermarkPosition: "bottom-right",
  watermarkOpacity: 0.5,
  watermarkSize: 14,
  watermarkColor: "#888888"
};

// 设置管理模块
const SettingsManager = {
  // 默认设置
  defaultSettings: {
    fontSize: 20,
    lineHeight: 1.7,
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans SC, Arial, sans-serif",
    textColor: "#111111",
    bgColor: "#ffffff",
    template: "template-default",
    cardWidth: 960,
    contentPadding: 32,
    exportScale: 3,
    exportFormat: "png",
    xUsername: "",
    inputText: "",
    enableMarkdown: false,
    autoFormat: false,
    enableMultiPage: false,
    maxCharsPerPage: 800,
    enableWatermark: false,
    watermarkText: "",
    watermarkPosition: "bottom-right",
    watermarkOpacity: 0.5,
    watermarkSize: 14,
    watermarkColor: "#888888"
  },

  // 保存设置到本地存储
  saveSettings: function() {
    localStorage.setItem('textToImageSettings', JSON.stringify(settings));
  },

  // 从本地存储加载设置
  loadSettings: function() {
    try {
      const saved = localStorage.getItem('textToImageSettings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        // 合并设置，确保新字段有默认值
        settings = { ...this.defaultSettings, ...settings, ...parsedSettings };
        this.applySettingsToUI();
      }
    } catch (error) {
      console.warn('加载设置失败:', error);
      // 如果加载失败，使用默认设置
      settings = { ...this.defaultSettings };
    }
  },

  // 将设置应用到UI
  applySettingsToUI: function() {
    fontSize.value = settings.fontSize;
    lineHeight.value = settings.lineHeight;
    fontFamily.value = settings.fontFamily;
    textColor.value = settings.textColor;
    bgColor.value = settings.bgColor;
    templateSel.value = settings.template;
    cardWidth.value = settings.cardWidth;
    contentPadding.value = settings.contentPadding;
    exportScale.value = settings.exportScale;
    exportFormat.value = settings.exportFormat;
    xUsername.value = settings.xUsername;
    inputText.value = settings.inputText;
  },

  // 重置设置
  resetSettings: function() {
    settings = { ...this.defaultSettings };
    this.applySettingsToUI();
    updatePreview();
    this.saveSettings();
  }
};

// 防抖函数优化版 - 支持立即执行
function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

// 节流函数优化版 - 支持尾部执行
function throttle(func, limit, trailing = true) {
  let inThrottle;
  let lastFunc;
  let lastRan;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;
    } else if (trailing) {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// 请求动画帧优化的函数
function rafThrottle(func) {
  let ticking = false;
  return function(...args) {
    if (!ticking) {
      requestAnimationFrame(() => {
        func.apply(this, args);
        ticking = false;
      });
      ticking = true;
    }
  };
}

// 通知管理器 - 支持队列和更好的管理
const NotificationManager = {
  notifications: [],
  maxNotifications: 3,
  
  show(message, type = 'info', duration = 3000) {
    // 如果通知过多，移除最旧的
    if (this.notifications.length >= this.maxNotifications) {
      const oldest = this.notifications.shift();
      this.remove(oldest);
    }
    
    const notification = this.create(message, type);
    this.notifications.push(notification);
    
    // 自动移除
    setTimeout(() => {
      this.remove(notification);
    }, duration);
    
    return notification;
  },
  
  create(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span class="notification-message">${message}</span>
      <button class="notification-close" aria-label="关闭">×</button>
    `;
    
    // 计算位置
    const topOffset = 20 + this.notifications.length * 70;
    notification.style.cssText = `
      position: fixed;
      top: ${topOffset}px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      font-size: 14px;
      z-index: 10000;
      transform: translateX(100%);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 300px;
      ${type === 'success' ? 'background: var(--success);' : ''}
      ${type === 'error' ? 'background: var(--danger);' : ''}
      ${type === 'info' ? 'background: var(--primary);' : ''}
      ${type === 'warning' ? 'background: var(--warning);' : ''}
    `;
    
    // 关闭按钮事件
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      margin-left: auto;
      opacity: 0.7;
      transition: opacity 0.2s;
    `;
    closeBtn.addEventListener('click', () => this.remove(notification));
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.7');
    
    document.body.appendChild(notification);
    
    // 进入动画
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });
    
    return notification;
  },
  
  remove(notification) {
    if (!notification || !notification.parentNode) return;
    
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
    
    // 退出动画
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      // 重新排列剩余通知
      this.rearrange();
    }, 300);
  },
  
  rearrange() {
    this.notifications.forEach((notification, index) => {
      const topOffset = 20 + index * 70;
      notification.style.top = `${topOffset}px`;
    });
  },
  
  clear() {
    this.notifications.forEach(notification => this.remove(notification));
    this.notifications = [];
  }
};

// 兼容旧的通知函数
function showNotification(message, type = 'info', duration = 3000) {
  return NotificationManager.show(message, type, duration);
}

// 更新图片尺寸显示
function updateImageDimensions() {
  const width = parseInt(cardWidth.value);
  const scale = parseInt(exportScale.value);
  const height = Math.round(width * 0.5625); // 16:9 比例的粗略估算
  const finalWidth = width * scale;
  const finalHeight = height * scale;
  imageDimensions.textContent = `预计尺寸：${finalWidth} × ${finalHeight}px`;
}

// 更新文本统计
function updateTextStats() {
  const text = inputText.value || '';
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text.split('\n').length;
  
  charCount.textContent = `${chars} 字符`;
  wordCount.textContent = `${words} 词`;
  lineCount.textContent = `${lines} 行`;
}

// 增强的性能监控器
const PerformanceMonitor = {
  startTime: 0,
  isEnabled: false,
  metrics: {
    previewUpdateTime: 0,
    memoryUsage: 0,
    fps: 0
  },
  fpsCounter: {
    frames: 0,
    lastTime: 0,
    fps: 0
  },
  
  enable() {
    this.isEnabled = true;
    this.startFPSMonitoring();
    this.startMemoryMonitoring();
  },
  
  disable() {
    this.isEnabled = false;
    if (this.fpsAnimationId) {
      cancelAnimationFrame(this.fpsAnimationId);
    }
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }
  },
  
  start(label) {
    this.startTime = performance.now();
    if (window.console && console.time && this.isEnabled) {
      console.time(label);
    }
  },
  
  end(label) {
    const duration = performance.now() - this.startTime;
    if (window.console && console.timeEnd && this.isEnabled) {
      console.timeEnd(label);
    }
    
    // 更新指标
    if (label === 'updatePreview') {
      this.metrics.previewUpdateTime = duration;
      this.updateUI();
    }
    
    return duration;
  },
  
  startFPSMonitoring() {
    const measureFPS = (currentTime) => {
      if (this.fpsCounter.lastTime) {
        this.fpsCounter.frames++;
        const delta = currentTime - this.fpsCounter.lastTime;
        
        if (delta >= 1000) { // 每秒更新一次
          this.fpsCounter.fps = Math.round((this.fpsCounter.frames * 1000) / delta);
          this.metrics.fps = this.fpsCounter.fps;
          this.fpsCounter.frames = 0;
          this.fpsCounter.lastTime = currentTime;
          this.updateUI();
        }
      } else {
        this.fpsCounter.lastTime = currentTime;
      }
      
      if (this.isEnabled) {
        this.fpsAnimationId = requestAnimationFrame(measureFPS);
      }
    };
    
    this.fpsAnimationId = requestAnimationFrame(measureFPS);
  },
  
  startMemoryMonitoring() {
    if (!('memory' in performance)) return;
    
    this.memoryInterval = setInterval(() => {
      if (!this.isEnabled) return;
      
      const memory = performance.memory;
      this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      this.updateUI();
    }, 2000);
  },
  
  updateUI() {
    if (!this.isEnabled) return;
    
    const previewTimeEl = document.getElementById('preview-time');
    const memoryUsageEl = document.getElementById('memory-usage');
    const renderFpsEl = document.getElementById('render-fps');
    
    if (previewTimeEl) {
      previewTimeEl.textContent = `${this.metrics.previewUpdateTime.toFixed(1)}ms`;
    }
    
    if (memoryUsageEl) {
      memoryUsageEl.textContent = `${this.metrics.memoryUsage}MB`;
    }
    
    if (renderFpsEl) {
      renderFpsEl.textContent = `${this.metrics.fps}fps`;
    }
  },
  
  getReport() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString()
    };
  }
};

// 修复分页逻辑 - 延迟到MultiPageManager定义后调用
function splitText(text) {
  if (!settings.enableMultiPage || !text) {
    return [text || ''];
  }
  
  // 检查MultiPageManager是否已定义
  if (typeof MultiPageManager !== 'undefined' && MultiPageManager.splitTextIntoPages) {
    return MultiPageManager.splitTextIntoPages(text, settings.maxCharsPerPage);
  }
  
  // 降级处理：简单按字符数分割
  const maxChars = settings.maxCharsPerPage || 800;
  if (text.length <= maxChars) {
    return [text];
  }
  
  const pages = [];
  let currentPage = '';
  const sentences = text.split(/([。！？.!?])/);
  
  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i] + (sentences[i + 1] || '');
    if (currentPage.length + sentence.length <= maxChars) {
      currentPage += sentence;
    } else {
      if (currentPage) {
        pages.push(currentPage);
        currentPage = sentence;
      } else {
        pages.push(sentence.substring(0, maxChars));
        currentPage = sentence.substring(maxChars);
      }
    }
  }
  
  if (currentPage) {
    pages.push(currentPage);
  }
  
  return pages.length > 0 ? pages : [text];
}

// 修复更新预览函数 - 简化逻辑
function updatePreview() {
  try {
    PerformanceMonitor.start('updatePreview');
    
    const inputValue = inputText?.value || '';
    
    // 处理多页面逻辑
    if (settings.enableMultiPage && inputValue) {
      if (inputValue !== settings.inputText) {
        if (typeof MultiPageManager !== 'undefined' && MultiPageManager.splitText) {
          pages = MultiPageManager.splitText(inputValue);
        } else {
          pages = splitText(inputValue);
        }
        settings.inputText = inputValue;
      }
    } else {
      pages = [inputValue];
      totalPages = 1;
      currentPage = 0;
    }
    
    // 确定显示文本
    let displayText = inputValue;
    if (settings.enableMultiPage && pages.length > 0) {
      currentPage = Math.min(currentPage, pages.length - 1);
      displayText = pages[currentPage] || '';
    }
    
    if (!displayText.trim()) {
      displayText = '在左侧输入你的内容，右侧将实时更新预览。';
    }
    
    // 更新内容显示
    if (contentText) {
      try {
        if (settings.enableMarkdown && typeof marked !== 'undefined') {
          contentText.innerHTML = marked.parse(displayText);
        } else {
          contentText.textContent = displayText;
        }
      } catch (error) {
        console.warn('渲染失败，使用纯文本:', error);
        contentText.textContent = displayText;
      }
    }
    
    // 应用样式
    updateStyles();
    
    // 更新UI显示
    updateUIDisplays();
    
    PerformanceMonitor.end('updatePreview');
  } catch (error) {
    console.error('更新预览失败:', error);
  }
}

// 分离样式更新逻辑
function updateStyles() {
  if (!captureArea || !contentText) return;
  
  const styles = {
    fontFamily: fontFamily?.value || settings.fontFamily,
    fontSize: Number(fontSize?.value || settings.fontSize),
    lineHeight: Number(lineHeight?.value || settings.lineHeight),
    textColor: textColor?.value || settings.textColor,
    bgColor: bgColor?.value || settings.bgColor,
    cardWidth: Number(cardWidth?.value || settings.cardWidth),
    contentPadding: Number(contentPadding?.value || settings.contentPadding)
  };
  
  // 应用样式
  captureArea.style.fontFamily = styles.fontFamily;
  captureArea.style.color = styles.textColor;
  captureArea.style.backgroundColor = styles.bgColor;
  captureArea.style.width = `${styles.cardWidth}px`;
  
  contentText.style.fontFamily = styles.fontFamily;
  contentText.style.fontSize = `${styles.fontSize}px`;
  contentText.style.lineHeight = styles.lineHeight.toString();
  
  // 更新CSS变量
  document.documentElement.style.setProperty('--preview-width', `${styles.cardWidth}px`);
  document.documentElement.style.setProperty('--preview-padding', `${styles.contentPadding}px`);
  
  // 更新设置
  Object.assign(settings, styles);
  
  // 更新用户名显示
  updateBrandName();
  
  // 应用模板
  updateTemplate();
}

// 分离品牌名更新逻辑
function updateBrandName() {
  if (!brandName || !xUsername) return;
  
  const handle = xUsername.value?.trim();
  const formattedHandle = handle ? (handle.startsWith('@') ? handle : `@${handle}`) : '';
  brandName.textContent = formattedHandle;
  brandName.style.display = formattedHandle ? 'inline-block' : 'none';
  settings.xUsername = handle;
}

// 分离模板更新逻辑
function updateTemplate() {
  if (!captureArea || !templateSel) return;
  
  const currentTemplate = templateSel.value;
  if (!captureArea.classList.contains(currentTemplate)) {
    captureArea.className = captureArea.className.replace(/template-\w+/g, '');
    captureArea.classList.add(currentTemplate);
  }
  settings.template = currentTemplate;
}

// 简化的内容验证函数
function ensureContentIsVisible() {
  if (!inputText || !contentText) return false;
  
  const inputValue = inputText.value?.trim();
  if (!inputValue) return false;
  
  let expectedText = inputValue;
  if (settings.enableMultiPage && pages.length > 0 && pages[currentPage] !== undefined) {
    expectedText = pages[currentPage];
  }
  
  const currentContent = contentText.textContent || contentText.innerHTML;
  
  if (!currentContent || currentContent.includes('在左侧输入你的内容')) {
    try {
      if (settings.enableMarkdown && typeof marked !== 'undefined') {
        contentText.innerHTML = marked.parse(expectedText);
      } else {
        contentText.textContent = expectedText;
      }
      return true;
    } catch (error) {
      console.warn('内容修复失败:', error);
      contentText.textContent = expectedText;
      return true;
    }
  }
  
  return false;
}

// applyChanges函数已经整合到updatePreview中，不再需要

// updateSettings函数已经整合到updatePreview中，不再需要

// 更新UI显示
function updateUIDisplays() {
  updateImageDimensions();
  updateTextStats();
  
  // 安全地更新页面导航
  if (settings.enableMultiPage && typeof MultiPageManager !== 'undefined' && MultiPageManager.updatePageNavigation) {
    MultiPageManager.updatePageNavigation();
    if (multiPageExport) {
      multiPageExport.style.display = 'block';
    }
  } else if (multiPageExport) {
    multiPageExport.style.display = 'none';
  }
  
  // 安全地更新水印
  if (settings.enableWatermark && typeof WatermarkManager !== 'undefined' && WatermarkManager.update) {
    WatermarkManager.update();
  }
  
  // 更新UI显示值
  if (fontSizeVal) fontSizeVal.textContent = settings.fontSize + 'px';
  if (lineHeightVal) lineHeightVal.textContent = settings.lineHeight.toFixed(2).replace(/\.00$/, '');
  if (cardWidthVal) cardWidthVal.textContent = settings.cardWidth + 'px';
  if (contentPaddingVal) contentPaddingVal.textContent = settings.contentPadding + 'px';
}

// 节流版本的保存设置函数
const saveSettingsThrottled = throttle(SettingsManager.saveSettings, 1000);

// 预设配置
const presets = {
  social: {
    template: 'template-default',
    fontSize: 18,
    lineHeight: 1.6,
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans SC, Arial, sans-serif",
    textColor: '#111111',
    bgColor: '#ffffff',
    cardWidth: 800,
    contentPadding: 40
  },
  blog: {
    template: 'template-letter',
    fontSize: 16,
    lineHeight: 1.8,
    fontFamily: "Lora, Georgia, 'Times New Roman', Times, serif",
    textColor: '#2c3e50',
    bgColor: '#f8f9fa',
    cardWidth: 900,
    contentPadding: 48
  },
  quote: {
    template: 'template-magazine',
    fontSize: 24,
    lineHeight: 1.5,
    fontFamily: "Lora, Georgia, 'Times New Roman', Times, serif",
    textColor: '#1a1a1a',
    bgColor: '#ffffff',
    cardWidth: 800,
    contentPadding: 60
  },
  code: {
    template: 'template-code',
    fontSize: 14,
    lineHeight: 1.6,
    fontFamily: "'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    textColor: '#e1e4e8',
    bgColor: '#0d1117',
    cardWidth: 1000,
    contentPadding: 32
  }
};

// 应用预设
function applyPreset(presetName) {
  const preset = presets[presetName];
  if (!preset) return;
  
  // 更新设置
  Object.assign(settings, preset);
  
  // 更新UI
  SettingsManager.applySettingsToUI();
  
  // 更新预览
  updatePreview();
  
  showNotification(`已应用"${getPresetDisplayName(presetName)}"预设`, 'success');
}

function getPresetDisplayName(presetName) {
  const names = {
    social: '社交媒体',
    blog: '博客文章', 
    quote: '名言引用',
    code: '代码分享'
  };
  return names[presetName] || presetName;
}

// 历史记录管理
const HistoryManager = {
  maxItems: 20,
  
  // 获取历史记录
  getHistory: function() {
    const history = localStorage.getItem('textToImageHistory');
    return history ? JSON.parse(history) : [];
  },
  
  // 保存到历史记录
  saveToHistory: function(text, settings) {
    if (!text.trim()) return;
    
    const history = this.getHistory();
    const item = {
      id: Date.now(),
      text: text.trim(),
      settings: { ...settings },
      timestamp: new Date().toISOString()
    };
    
    // 避免重复保存相同内容
    const exists = history.find(h => h.text === item.text);
    if (exists) return;
    
    // 添加到开头
    history.unshift(item);
    
    // 限制数量
    if (history.length > this.maxItems) {
      history.splice(this.maxItems);
    }
    
    localStorage.setItem('textToImageHistory', JSON.stringify(history));
    this.renderHistory();
  },
  
  // 从历史记录加载
  loadFromHistory: function(id) {
    const history = this.getHistory();
    const item = history.find(h => h.id === id);
    if (!item) return;
    
    // 恢复文本
    inputText.value = item.text;
    settings.inputText = item.text;
    
    // 恢复设置
    Object.assign(settings, item.settings);
    SettingsManager.applySettingsToUI();
    
    // 更新预览
    updatePreview();
    updateTextStats();
    
    showNotification('已加载历史记录', 'success');
  },
  
  // 删除历史记录项
  deleteHistoryItem: function(id) {
    const history = this.getHistory();
    const filtered = history.filter(h => h.id !== id);
    localStorage.setItem('textToImageHistory', JSON.stringify(filtered));
    this.renderHistory();
  },
  
  // 清空历史记录
  clearHistory: function() {
    localStorage.removeItem('textToImageHistory');
    this.renderHistory();
    showNotification('历史记录已清空', 'info');
  },
  
  // 渲染历史记录列表
  renderHistory: function() {
    const history = this.getHistory();
    
    if (history.length === 0) {
      historyList.innerHTML = '<p class="empty-history">暂无历史记录</p>';
      return;
    }
    
    const html = history.map(item => {
      const date = new Date(item.timestamp).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return `
        <div class="history-item" data-id="${item.id}">
          <div class="history-item-text">${item.text}</div>
          <div class="history-item-meta">
            <span>${date}</span>
            <button class="history-item-delete" data-id="${item.id}">删除</button>
          </div>
        </div>
      `;
    }).join('');
    
    historyList.innerHTML = html;
  }
};

// 应用模板（确保只有一个模板类存在）
function applyTemplate(templateClass) {
  const templates = [
    'template-default', 
    'template-code', 
    'template-letter', 
    'template-neon', 
    'template-magazine', 
    'template-sticky',
    'template-glass',
    'template-terminal'
  ];
  templates.forEach(c => captureArea.classList.remove(c));
  
  // 若仍旧从存量数据加载到黑金模板，则回退到默认模板
  if (templateClass === 'template-blackgold') {
    templateClass = 'template-default';
  }
  
  captureArea.classList.add(templateClass);
}

// 处理 Logo 上传
function handleLogoUpload(file) {
  if (!file) {
    brandLogo.src = '';
    brandLogo.style.display = 'none';
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    brandLogo.src = e.target.result;
    brandLogo.style.display = 'inline-block';
  };
  reader.readAsDataURL(file);
}

// 增强的错误处理器
const ErrorHandler = {
  logError(error, context) {
    console.error(`[${context}] 错误:`, error);
    
    // 在生产环境中可以添加错误上报
    if (window.gtag) {
      gtag('event', 'exception', {
        description: `${context}: ${error.message}`,
        fatal: false
      });
    }
  },
  
  handleCanvasError(error) {
    const errorMessages = {
      'tainted': '图片包含跨域资源，请使用本地图片',
      'timeout': '生成超时，请尝试减小图片尺寸',
      'memory': '内存不足，请降低导出倍率',
      'empty': '生成的图片为空，请检查内容',
      'network': '网络错误，请检查网络连接',
      'parse': '内容解析失败，请检查文本格式'
    };
    
    const errorType = Object.keys(errorMessages).find(type => 
      error.message.toLowerCase().includes(type)
    );
    
    return errorMessages[errorType] || '图片生成失败，请重试';
  },
  
  // 添加全局错误捕获
  setupGlobalHandlers() {
    window.addEventListener('error', (e) => {
      this.logError(e.error, 'global');
      showNotification('应用遇到错误，请刷新页面重试', 'error');
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      this.logError(e.reason, 'unhandledPromise');
      showNotification('操作失败，请重试', 'error');
    });
  }
};

// 优化的图片生成函数
async function generateImage() {
  if (isGenerating) return;

  const startTime = performance.now();

  try {
    isGenerating = true;
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="loading-spinner"></span><span>生成中...</span>';
    document.body.classList.add('generating');

    // 预检查
    const text = inputText.value?.trim();
    if (!text) {
      throw new Error('请输入要转换的文本内容');
    }

    // 🔧 关键修复：确保预览内容是最新的
    console.log('生成图片前，强制更新预览内容...');

    // 强制更新预览内容
    updatePreview();

    // 等待DOM更新完成
    await new Promise(resolve => setTimeout(resolve, 200));

    // 使用专门的内容验证函数
    const wasFixed = ensureContentIsVisible();
    if (wasFixed) {
      // 如果内容被修复，再等待一下
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // 读取导出倍率和格式
    const scale = Math.min(Math.max(Number(exportScale.value) || 3, 1), 4);
    const format = exportFormat.value || 'png';
    const width = parseInt(cardWidth.value);

    // 更稳健的高度计算：优先真实像素高度，逐级回退，最后兜底
    const rect = captureArea.getBoundingClientRect();
    const heightPx = Math.floor(
      Math.max(
        rect.height || 0,
        captureArea.offsetHeight || 0,
        captureArea.scrollHeight || 0,
        540
      )
    );

    // 内存预估
    const estimatedMemory = width * heightPx * scale * scale * 4; // RGBA
    if (estimatedMemory > 100 * 1024 * 1024) { // 100MB
      showNotification('图片尺寸过大，正在降低质量...', 'warning', 2000);
    }

    // 优化的 html2canvas 配置
    const opts = {
      backgroundColor: null,
      scale: scale,
      useCORS: true,
      allowTaint: false,
      logging: true, // 开启日志帮助调试
      windowWidth: width,
      windowHeight: heightPx,
      height: heightPx, // 明确指定渲染高度
      imageTimeout: 20000,
      // 关键修复：禁用 foreignObject，统一用内联 SVG 路径，避免某些环境空白
      foreignObjectRendering: false,
      removeContainer: true,
      pixelRatio: 1,
      // 重要：按内容尺寸创建离屏容器，挂载克隆节点再渲染，避免 body 样式或缩放干扰
      onclone: (clonedDoc) => {
        console.log('html2canvas 克隆文档...');
        // 创建离屏容器
        const offscreen = clonedDoc.createElement('div');
        offscreen.style.cssText = `
          position: fixed;
          left: -100000px;
          top: 0;
          width: ${width}px;
          min-height: ${heightPx}px;
          display: block;
          visibility: visible;
          overflow: visible;
          background: ${getComputedStyle(captureArea).backgroundColor || 'transparent'};
        `;
        clonedDoc.body.appendChild(offscreen);

        const clonedElement = clonedDoc.querySelector('#capture-area');
        if (clonedElement) {
          // 锁定克隆节点尺寸，避免高度塌陷
          clonedElement.style.width = `${width}px`;
          clonedElement.style.minHeight = `${heightPx}px`;
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.overflow = 'visible';

          // 同步内容
          const clonedContent = clonedElement.querySelector('#content-text');
          if (clonedContent) {
            clonedContent.innerHTML = contentText.innerHTML;
            clonedContent.style.display = 'block';
            clonedContent.style.visibility = 'visible';
          }

          // 移除可能导致问题的元素
          clonedElement.querySelectorAll('script, iframe, object, embed').forEach(el => el.remove());

          // 将克隆节点移动到离屏容器，确保以确定布局渲染
          offscreen.appendChild(clonedElement);
        }
      }
    };

    // 预处理：确保所有字体已加载
    await document.fonts.ready;

    // 滚动到顶部避免滚动条截断
    captureArea.scrollTop = 0;

    // 在渲染前临时强制显示并锁定尺寸，避免克隆时内容塌陷导致空白
    const prevVisibility = captureArea.style.visibility;
    const prevWidthStyle = captureArea.style.width;
    const prevMinHeightStyle = captureArea.style.minHeight;
    captureArea.style.visibility = 'visible';
    captureArea.style.width = `${width}px`;
    captureArea.style.minHeight = `${heightPx}px`;

    // 强制重排以确保样式正确应用
    // eslint-disable-next-line no-unused-expressions
    captureArea.offsetHeight;
    
    // 最终内容验证 - 关键修复点
    // 用 innerHTML 作为最终内容的判断依据，避免 Markdown 情况下被 textContent 误判
    const finalContent = contentText.innerHTML || contentText.textContent;
    console.log('生成前最终内容验证:', {
      contentLength: finalContent.length,
      isEmpty: !finalContent || finalContent.trim() === '',
      isDefault: finalContent.includes('在左侧输入你的内容'),
      preview: finalContent.substring(0, 100) + '...'
    });
    
    // 如果最终内容仍然有问题，强制再次设置
    if (!finalContent || finalContent.trim() === '' || finalContent.includes('在左侧输入你的内容')) {
      console.warn('最终验证发现内容问题，强制设置...');
      const inputValue = inputText.value?.trim();
      if (inputValue) {
        let displayText = inputValue;
        if (settings.enableMultiPage && pages.length > 0 && pages[currentPage] !== undefined) {
          displayText = pages[currentPage];
        }
        
        try {
          if (settings.enableMarkdown && typeof marked !== 'undefined') {
            contentText.innerHTML = marked.parse(displayText);
          } else {
            contentText.textContent = displayText;
          }
        } catch (e) {
          contentText.textContent = displayText;
        }
        
        // 再次强制重排
        captureArea.offsetHeight;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // 生成进度提示
    showNotification('正在渲染图片...', 'info', 1000);

    // 生成
    console.log('开始 html2canvas 渲染...');
    const canvas = await html2canvas(captureArea, opts);

    // 渲染后恢复临时样式
    captureArea.style.visibility = prevVisibility || '';
    captureArea.style.width = prevWidthStyle || '';
    captureArea.style.minHeight = prevMinHeightStyle || '';
    
    // 检查生成结果（增加调试输出）
    if (!canvas) {
      throw new Error('生成的图片无效: canvas 为 null/undefined');
    }
    if (canvas.width === 0 || canvas.height === 0) {
      console.error('空白图调试: canvas 尺寸为 0', { w: canvas.width, h: canvas.height, width, heightPx, scale });
      // 尝试一次降级重渲染：强制 scale=1 并移除 height 选项
      const fallbackOpts = {
        ...opts,
        scale: 1,
        height: undefined,
        windowHeight: heightPx
      };
      const fallback = await html2canvas(captureArea, fallbackOpts);
      if (!fallback || fallback.width === 0 || fallback.height === 0) {
        throw new Error('生成的图片无效: 经过降级重试后仍为空');
      }
      // 使用降级结果
      canvas.width = fallback.width;
      canvas.height = fallback.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(fallback, 0, 0);
    }

    const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
    const quality = format === 'jpeg' ? 0.9 : undefined;
    
    // 分块处理大图片
    let dataURL;
    try {
      dataURL = canvas.toDataURL(mimeType, quality);
    } catch (error) {
      if (error.message.includes('memory') || error.message.includes('size')) {
        // 降级处理：减小尺寸重试
        const smallerCanvas = document.createElement('canvas');
        const ctx = smallerCanvas.getContext('2d');
        const ratio = 0.8;
        smallerCanvas.width = canvas.width * ratio;
        smallerCanvas.height = canvas.height * ratio;
        ctx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
        dataURL = smallerCanvas.toDataURL(mimeType, quality);
        showNotification('图片过大，已自动压缩', 'warning');
      } else {
        throw error;
      }
    }

    // 触发下载
    const a = document.createElement('a');
    const time = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const templateName = templateSel.options[templateSel.selectedIndex].text;
    a.href = dataURL;
    a.download = `share-image-${templateName}-${time}.${format}`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    // 延迟移除以确保下载完成
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);

    // 保存到历史记录
    HistoryManager.saveToHistory(inputText.value, settings);

    const duration = Math.round(performance.now() - startTime);
    showNotification(`图片生成成功！耗时 ${duration}ms`, 'success');
    
  } catch (error) {
    ErrorHandler.logError(error, 'generateImage');
    const message = ErrorHandler.handleCanvasError(error);
    showNotification(message, 'error');
  } finally {
    isGenerating = false;
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span>🖼️ 生成图片并下载</span>';
    document.body.classList.remove('generating');
  }
}

// 复制图片到剪贴板
async function copyImageToClipboard() {
  if (isGenerating) return;
  
  if (!navigator.clipboard || !navigator.clipboard.write) {
    showNotification('当前浏览器不支持复制到剪贴板', 'error');
    return;
  }
  
  try {
    isGenerating = true;
    copyBtn.disabled = true;
    copyBtn.innerHTML = '<span class="loading-spinner"></span><span>复制中...</span>';

    // 🔧 确保内容是最新的
    console.log('复制前，强制更新预览内容...');
    updatePreview();
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 使用专门的内容验证函数
    const wasFixed = ensureContentIsVisible();
    if (wasFixed) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const scale = Number(exportScale.value) || 3;
    const width = parseInt(cardWidth.value);

    // 一致的稳健高度计算
    const rect2 = captureArea.getBoundingClientRect();
    const heightPx2 = Math.floor(
      Math.max(
        rect2.height || 0,
        captureArea.offsetHeight || 0,
        captureArea.scrollHeight || 0,
        540
      )
    );

    const opts = {
      backgroundColor: null,
      scale: Math.min(Math.max(scale, 1), 4),
      useCORS: true,
      allowTaint: true,
      logging: true,
      windowWidth: width,
      windowHeight: heightPx2,
      height: heightPx2,
      // 关键修复：禁用 foreignObject 并放入离屏容器，复制路径与生成路径保持一致
      foreignObjectRendering: false,
      removeContainer: true,
      pixelRatio: 1,
      onclone: (clonedDoc) => {
        console.log('复制时克隆文档...');
        const offscreen = clonedDoc.createElement('div');
        offscreen.style.cssText = `
          position: fixed;
          left: -100000px;
          top: 0;
          width: ${width}px;
          min-height: ${heightPx2}px;
          display: block;
          visibility: visible;
          overflow: visible;
          background: ${getComputedStyle(captureArea).backgroundColor || 'transparent'};
        `;
        clonedDoc.body.appendChild(offscreen);

        const clonedElement = clonedDoc.querySelector('#capture-area');
        if (clonedElement) {
          // 锁定尺寸
          clonedElement.style.width = `${width}px`;
          clonedElement.style.minHeight = `${heightPx2}px`;
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.overflow = 'visible';
          const clonedContent = clonedElement.querySelector('#content-text');
          if (clonedContent) {
            clonedContent.innerHTML = contentText.innerHTML;
            clonedContent.style.display = 'block';
            clonedContent.style.visibility = 'visible';
          }
          clonedElement.querySelectorAll('script, iframe, object, embed').forEach(el => el.remove());

          offscreen.appendChild(clonedElement);
        }
      }
    };

    captureArea.scrollTop = 0;

    // 复制前临时强制显示并锁定尺寸，避免克隆空白
    const prevVisibility2 = captureArea.style.visibility;
    const prevWidthStyle2 = captureArea.style.width;
    const prevMinHeightStyle2 = captureArea.style.minHeight;
    captureArea.style.visibility = 'visible';
    captureArea.style.width = `${width}px`;
    captureArea.style.minHeight = `${heightPx2}px`;

    console.log('开始复制渲染...');
    const canvas = await html2canvas(captureArea, opts);

    // 渲染后恢复
    captureArea.style.visibility = prevVisibility2 || '';
    captureArea.style.width = prevWidthStyle2 || '';
    captureArea.style.minHeight = prevMinHeightStyle2 || '';
    
    canvas.toBlob(async (blob) => {
      try {
        if (!blob) {
          console.error('复制调试: canvas.toBlob 返回空 blob', { w: canvas.width, h: canvas.height, width, height: heightPx2 });
          throw new Error('复制失败：生成的图片数据为空');
        }
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showNotification('图片已复制到剪贴板！', 'success');
      } catch (error) {
        console.error('复制失败:', error);
        showNotification('复制失败，请重试', 'error');
      } finally {
        isGenerating = false;
        copyBtn.disabled = false;
        copyBtn.innerHTML = '<span>📋 复制到剪贴板</span>';
      }
    }, 'image/png');
  } catch (error) {
    console.error('生成图片失败:', error);
    showNotification('复制失败，请重试', 'error');
    isGenerating = false;
    copyBtn.disabled = false;
    copyBtn.innerHTML = '<span>📋 复制到剪贴板</span>';
  }
}

// 智能事件处理器
const EventHandler = {
  // 使用单一的更新函数，避免冲突
  textUpdateDebounced: debounce(updatePreview, 150), // 文本输入较快响应
  styleUpdateThrottled: rafThrottle(updatePreview), // 样式更新使用RAF
  rangeUpdateThrottled: throttle(updatePreview, 50), // 滑块更新高频但节流
  
  // 智能选择更新策略
  handleTextInput(e) {
    // 文本输入使用防抖
    this.textUpdateDebounced();
    // 文本统计立即更新
    updateTextStats();
  },
  
  handleStyleChange(e) {
    // 样式变更使用RAF节流
    this.styleUpdateThrottled();
  },
  
  handleRangeInput(e) {
    // 滑块输入使用高频节流
    this.rangeUpdateThrottled();
  },
  
  handleTemplateChange(e) {
    // 模板切换立即执行
    applyTemplate(templateSel.value);
    updatePreview();
  }
};

// 优化的事件绑定
function bindEvents() {
  // 文本输入事件 - 修复重复调用
  inputText.addEventListener('input', () => {
    EventHandler.handleTextInput();
  });
  
  inputText.addEventListener('paste', (e) => {
    // 粘贴后延迟更新以确保内容已插入
    setTimeout(() => {
      EventHandler.handleTextInput();
    }, 10);
  });
  
  // 样式控件事件
  [fontFamily, textColor, bgColor, xUsername].forEach(element => {
    element.addEventListener('change', EventHandler.handleStyleChange.bind(EventHandler));
  });
  
  // 滑块控件事件
  [fontSize, lineHeight, cardWidth, contentPadding].forEach(element => {
    element.addEventListener('input', EventHandler.handleRangeInput.bind(EventHandler));
    element.addEventListener('change', EventHandler.handleStyleChange.bind(EventHandler));
  });
  
  // 模板选择事件
  templateSel.addEventListener('change', EventHandler.handleTemplateChange.bind(EventHandler));
  
  // 性能监控
  if (window.performance && performance.mark) {
    inputText.addEventListener('input', () => {
      performance.mark('text-input-start');
    });
  }
}

// 调用事件绑定
bindEvents();

// 性能监控事件
document.getElementById('show-performance')?.addEventListener('click', () => {
  const panel = document.getElementById('performance-panel');
  const btn = document.getElementById('show-performance');
  
  if (panel && btn) {
    panel.style.display = 'block';
    btn.style.display = 'none';
    PerformanceMonitor.enable();
    showNotification('性能监控已启用', 'info', 2000);
  }
});

document.getElementById('toggle-performance')?.addEventListener('click', () => {
  const panel = document.getElementById('performance-panel');
  const btn = document.getElementById('show-performance');
  
  if (panel && btn) {
    panel.style.display = 'none';
    btn.style.display = 'inline-block';
    PerformanceMonitor.disable();
    showNotification('性能监控已关闭', 'info', 2000);
  }
});

// 预设按钮事件
presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const preset = btn.dataset.preset;
    applyPreset(preset);
  });
});

// 历史记录相关事件
historyBtn.addEventListener('click', () => {
  const isVisible = historyPanel.style.display !== 'none';
  historyPanel.style.display = isVisible ? 'none' : 'block';
  historyBtn.innerHTML = isVisible ? 
    '<span>📚 历史记录</span>' : 
    '<span>📚 隐藏历史</span>';
  
  if (!isVisible) {
    HistoryManager.renderHistory();
  }
});

clearHistoryBtn.addEventListener('click', () => {
  if (confirm('确定要清空所有历史记录吗？')) {
    HistoryManager.clearHistory();
  }
});

// 历史记录列表事件委托
historyList.addEventListener('click', (e) => {
  const historyItem = e.target.closest('.history-item');
  const deleteBtn = e.target.closest('.history-item-delete');
  
  if (deleteBtn) {
    e.stopPropagation();
    const id = parseInt(deleteBtn.dataset.id);
    HistoryManager.deleteHistoryItem(id);
  } else if (historyItem) {
    const id = parseInt(historyItem.dataset.id);
    HistoryManager.loadFromHistory(id);
  }
});

logoUpload.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  handleLogoUpload(file);
});

// 导出相关事件
exportScale.addEventListener('input', () => {
  exportScaleVal.textContent = String(exportScale.value) + 'x';
  settings.exportScale = Number(exportScale.value);
  updateImageDimensions();
  SettingsManager.saveSettings();
});

exportFormat.addEventListener('change', () => {
  settings.exportFormat = exportFormat.value;
  SettingsManager.saveSettings();
});

// 按钮事件
generateBtn.addEventListener('click', () => {
  updatePreview();
  generateImage();
});

copyBtn.addEventListener('click', () => {
  updatePreview();
  copyImageToClipboard();
});

resetBtn.addEventListener('click', () => {
  if (confirm('确定要重置所有设置吗？这将清除当前的所有配置。')) {
    SettingsManager.resetSettings();
    showNotification('设置已重置', 'info');
  }
});

// 全屏预览功能
fullscreenBtn.addEventListener('click', () => {
  const previewCard = $('.preview-card');
  if (document.fullscreenElement) {
    document.exitFullscreen();
    fullscreenBtn.innerHTML = '<span>⛶</span>';
    fullscreenBtn.title = '全屏预览';
  } else {
    previewCard.requestFullscreen().then(() => {
      fullscreenBtn.innerHTML = '<span>❌</span>';
      fullscreenBtn.title = '退出全屏';
    }).catch(() => {
      showNotification('全屏功能不可用', 'error');
    });
  }
});

// 监听全屏状态变化以正确更新按钮状态
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    fullscreenBtn.innerHTML = '<span>⛶</span>';
    fullscreenBtn.title = '全屏预览';
  }
});

// 适应窗口功能
zoomFitBtn.addEventListener('click', () => {
  const container = $('.container');
  const currentCols = container.style.gridTemplateColumns;
  
  if (currentCols === '1fr') {
    container.style.gridTemplateColumns = '380px 1fr';
    zoomFitBtn.innerHTML = '<span>⊞</span>';
    zoomFitBtn.title = '适应窗口';
  } else {
    container.style.gridTemplateColumns = '1fr';
    zoomFitBtn.innerHTML = '<span>⊡</span>';
    zoomFitBtn.title = '显示侧边栏';
  }
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
  // 避免在输入框中触发快捷键
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
    return;
  }
  
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 's':
        e.preventDefault();
        generateImage();
        break;
      case 'c':
        if (e.shiftKey) {
          e.preventDefault();
          copyImageToClipboard();
        }
        break;
      case 'r':
        if (e.shiftKey) {
          e.preventDefault();
          SettingsManager.resetSettings();
        }
        break;
      case 'f':
        if (e.shiftKey) {
          e.preventDefault();
          fullscreenBtn.click();
        }
        break;
    }
  }
});

// 加载状态管理器
const LoadingManager = {
  isLoading: false,
  loadingElements: new Set(),
  
  show(element, text = '加载中...') {
    if (this.loadingElements.has(element)) return;
    
    this.loadingElements.add(element);
    element.disabled = true;
    element.dataset.originalText = element.innerHTML;
    element.innerHTML = `<span class="loading-spinner"></span><span>${text}</span>`;
    element.classList.add('loading');
  },
  
  hide(element) {
    if (!this.loadingElements.has(element)) return;
    
    this.loadingElements.delete(element);
    element.disabled = false;
    element.innerHTML = element.dataset.originalText || element.innerHTML;
    element.classList.remove('loading');
    delete element.dataset.originalText;
  },
  
  hideAll() {
    this.loadingElements.forEach(element => this.hide(element));
  }
};

// 应用初始化器
const AppInitializer = {
  async init() {
    try {
      // 设置全局错误处理
      ErrorHandler.setupGlobalHandlers();
      
      // 显示初始化加载
      document.body.classList.add('app-loading');
      
      // 预加载字体
      await this.preloadFonts();
      
      // 加载设置
      SettingsManager.loadSettings();
      
      // 初始化UI
      this.initializeUI();
      
      // 绑定事件
      this.bindGlobalEvents();
      
      // 初始化预览
      updatePreview();
      updateImageDimensions();
      
      // 渲染历史记录
      HistoryManager.renderHistory();
      
      // 移除加载状态
      document.body.classList.remove('app-loading');
      
      // 显示欢迎信息
      setTimeout(() => {
        showNotification('欢迎使用长文转图片工具！快捷键：Ctrl+S 生成图片', 'info', 4000);
      }, 500);
      
    } catch (error) {
      console.error('应用初始化失败:', error);
      showNotification('应用初始化失败，请刷新页面重试', 'error');
    }
  },
  
  async preloadFonts() {
    const fonts = [
      'Inter',
      'Fira Code', 
      'Lora'
    ];
    
    const fontPromises = fonts.map(font => {
      return document.fonts.load(`16px ${font}`).catch(() => {
        console.warn(`字体 ${font} 加载失败`);
      });
    });
    
    await Promise.allSettled(fontPromises);
  },
  
  initializeUI() {
    // 初始化导出倍率显示
    exportScaleVal.textContent = String(exportScale.value) + 'x';
    
    // 初始化文本统计
    updateTextStats();
    
    // 设置默认焦点
    if (inputText.value.trim() === '') {
      inputText.focus();
    }
  },
  
  bindGlobalEvents() {
    // 页面可见性变化处理
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 页面隐藏时保存设置
        SettingsManager.saveSettings();
      }
    });
    
    // 页面卸载前保存
    window.addEventListener('beforeunload', () => {
      SettingsManager.saveSettings();
    });
    
    // 错误处理
    window.addEventListener('error', (e) => {
      ErrorHandler.logError(e.error, 'global');
    });
    
    // 未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (e) => {
      ErrorHandler.logError(e.reason, 'unhandledPromise');
    });
    
    // 网络状态变化
    if ('onLine' in navigator) {
      window.addEventListener('online', () => {
        showNotification('网络连接已恢复', 'success', 2000);
      });
      
      window.addEventListener('offline', () => {
        showNotification('网络连接已断开，功能可能受限', 'warning', 3000);
      });
    }
  }
};

// 性能优化的初始化
function optimizedInit() {
  // 使用 requestIdleCallback 在浏览器空闲时初始化
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      AppInitializer.init();
    }, { timeout: 2000 });
  } else {
    // 降级到 setTimeout
    setTimeout(() => {
      AppInitializer.init();
    }, 100);
  }
}

// 修复loadSettings调用
function loadSettings() {
  SettingsManager.loadSettings();
}

// ========== 新功能模块 ==========

// Markdown 渲染模块
const MarkdownRenderer = {
  // 配置 marked.js
  init() {
    if (typeof marked !== 'undefined') {
      marked.setOptions({
        breaks: true,
        gfm: true,
        sanitize: false,
        smartLists: true,
        smartypants: true
      });
    }
  },
  
  // 渲染 Markdown 文本
  render(text) {
    if (typeof marked === 'undefined' || !settings.enableMarkdown) {
      return this.escapeHtml(text);
    }
    
    try {
      return marked.parse(text);
    } catch (error) {
      console.warn('Markdown 渲染失败:', error);
      return this.escapeHtml(text);
    }
  },
  
  // HTML 转义
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// 文本格式化模块
const TextFormatter = {
  // 应用格式化到选中文本
  applyFormat(format, value = null) {
    const textarea = inputText;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
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
        formattedText = selectedText.includes('\n') ? `\`\`\`\n${selectedText}\n\`\`\`` : `\`${selectedText}\``;
        break;
      case 'color':
        formattedText = `<span style="color: ${value}">${selectedText}</span>`;
        break;
      default:
        return;
    }
    
    // 替换选中文本
    const newValue = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    textarea.value = newValue;
    
    // 更新光标位置
    const newCursorPos = start + formattedText.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    
    // 触发更新
    updatePreview();
    updateTextStats();
  },
  
  // 自动格式化文本
  autoFormat(text) {
    if (!settings.autoFormat) return text;
    
    return text
      // 自动添加段落间距
      .replace(/\n\n+/g, '\n\n')
      // 自动修正标点符号
      .replace(/([。！？])([a-zA-Z])/g, '$1 $2')
      .replace(/([a-zA-Z])([。！？])/g, '$1$2')
      // 自动添加列表格式
      .replace(/^(\d+)\.\s/gm, '$1. ')
      .replace(/^[-*]\s/gm, '- ');
  }
};

// 多页面管理模块
const MultiPageManager = {
  // 分割文本为多页
  splitTextIntoPages(text, maxChars) {
    if (!settings.enableMultiPage) {
      return [text];
    }
    
    const pages = [];
    const paragraphs = text.split('\n\n');
    let currentPage = '';
    
    for (const paragraph of paragraphs) {
      if (currentPage.length + paragraph.length + 2 <= maxChars) {
        currentPage += (currentPage ? '\n\n' : '') + paragraph;
      } else {
        if (currentPage) {
          pages.push(currentPage);
          currentPage = paragraph;
        } else {
          // 段落太长，强制分割
          const chunks = this.splitLongParagraph(paragraph, maxChars);
          pages.push(...chunks.slice(0, -1));
          currentPage = chunks[chunks.length - 1];
        }
      }
    }
    
    if (currentPage) {
      pages.push(currentPage);
    }
    
    return pages.length > 0 ? pages : [text];
  },
  
  // 分割长段落
  splitLongParagraph(paragraph, maxChars) {
    const chunks = [];
    let current = '';
    const sentences = paragraph.split(/([。！？.!?])/);
    
    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i] + (sentences[i + 1] || '');
      if (current.length + sentence.length <= maxChars) {
        current += sentence;
      } else {
        if (current) {
          chunks.push(current);
          current = sentence;
        } else {
          // 句子太长，按字符分割
          chunks.push(sentence.substring(0, maxChars));
          current = sentence.substring(maxChars);
        }
      }
    }
    
    if (current) {
      chunks.push(current);
    }
    
    return chunks;
  },
  
  // 更新页面导航
  updatePageNavigation() {
    const inputValue = inputText.value || '';
    
    if (!settings.enableMultiPage || !inputValue) {
      totalPages = 1;
      currentPage = 0;
      pages = [inputValue];
    } else {
      pages = this.splitTextIntoPages(inputValue, settings.maxCharsPerPage);
      totalPages = pages.length;
      currentPage = Math.min(currentPage, totalPages - 1);
    }
    
    // 更新UI
    if (pageIndicator) {
      pageIndicator.textContent = `第 ${currentPage + 1} 页，共 ${totalPages} 页`;
    }
    if (prevPageBtn) {
      prevPageBtn.disabled = currentPage === 0;
    }
    if (nextPageBtn) {
      nextPageBtn.disabled = currentPage === totalPages - 1;
    }
    
    // 注意：不在这里直接更新contentText，让updatePreview函数处理
  },
  
  // 切换到指定页面
  goToPage(pageIndex) {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      currentPage = pageIndex;
      this.updatePageNavigation();
      // 立即更新预览显示
      updatePreview();
    }
  }
};

// 添加splitText方法到MultiPageManager
MultiPageManager.splitText = function(text) {
  pages = this.splitTextIntoPages(text, settings.maxCharsPerPage || 800);
  totalPages = pages.length;
  currentPage = Math.min(currentPage, totalPages - 1);
  
  if (this.updatePageNavigation) {
    this.updatePageNavigation();
  }
  return pages;
};

// 水印管理模块
const WatermarkManager = {
  // 更新水印
  update() {
    if (!settings.enableWatermark || !settings.watermarkText.trim()) {
      watermarkElement.style.display = 'none';
      return;
    }
    
    watermarkElement.textContent = settings.watermarkText;
    watermarkElement.style.display = 'block';
    watermarkElement.style.fontSize = `${settings.watermarkSize}px`;
    watermarkElement.style.color = settings.watermarkColor;
    watermarkElement.style.opacity = settings.watermarkOpacity;
    
    // 清除所有位置类
    watermarkElement.className = 'watermark';
    
    // 添加位置类
    watermarkElement.classList.add(settings.watermarkPosition);
  }
};

// 事件绑定模块
const EventBindings = {
  init() {
    this.bindFormatToolbar();
    this.bindMultiPageControls();
    this.bindWatermarkControls();
    this.bindMarkdownControls();
  },
  
  // 绑定格式化工具栏事件
  bindFormatToolbar() {
    formatBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const format = btn.dataset.format;
        if (format) {
          TextFormatter.applyFormat(format);
          btn.classList.add('active');
          setTimeout(() => btn.classList.remove('active'), 200);
        }
      });
    });
    
    // 颜色选择器
    if (textFormatColor) {
      textFormatColor.addEventListener('change', (e) => {
        TextFormatter.applyFormat('color', e.target.value);
      });
    }
    
    // 快捷键支持
    inputText.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            TextFormatter.applyFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            TextFormatter.applyFormat('italic');
            break;
          case 'u':
            e.preventDefault();
            TextFormatter.applyFormat('underline');
            break;
        }
      }
    });
  },
  
  // 绑定多页面控制事件
  bindMultiPageControls() {
    if (enableMultiPage) {
      enableMultiPage.addEventListener('change', (e) => {
        settings.enableMultiPage = e.target.checked;
        pageSettings.style.display = e.target.checked ? 'block' : 'none';
        multiPageExport.style.display = e.target.checked ? 'block' : 'none';
        // 重置页面状态
        currentPage = 0;
        // 更新页面导航和预览
        updatePreview();
        SettingsManager.saveSettings();
      });
    }
    
    if (maxCharsPerPage) {
      maxCharsPerPage.addEventListener('input', (e) => {
        settings.maxCharsPerPage = parseInt(e.target.value);
        // 重置到第一页
        currentPage = 0;
        // 更新页面导航和预览
        updatePreview();
        SettingsManager.saveSettings();
      });
    }
    
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        MultiPageManager.goToPage(currentPage - 1);
      });
    }
    
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        MultiPageManager.goToPage(currentPage + 1);
      });
    }
    
    if (generateAllPagesBtn) {
      generateAllPagesBtn.addEventListener('click', () => {
        this.generateAllPages();
      });
    }
    
    if (generateCurrentPageBtn) {
      generateCurrentPageBtn.addEventListener('click', () => {
        generateImage();
      });
    }
  },
  
  // 绑定水印控制事件
  bindWatermarkControls() {
    if (enableWatermark) {
      enableWatermark.addEventListener('change', (e) => {
        settings.enableWatermark = e.target.checked;
        watermarkOptions.style.display = e.target.checked ? 'block' : 'none';
        WatermarkManager.update();
        SettingsManager.saveSettings();
      });
    }
    
    if (watermarkText) {
      watermarkText.addEventListener('input', (e) => {
        settings.watermarkText = e.target.value;
        WatermarkManager.update();
        SettingsManager.saveSettings();
      });
    }
    
    if (watermarkPosition) {
      watermarkPosition.addEventListener('change', (e) => {
        settings.watermarkPosition = e.target.value;
        WatermarkManager.update();
        SettingsManager.saveSettings();
      });
    }
    
    if (watermarkOpacity) {
      watermarkOpacity.addEventListener('input', (e) => {
        settings.watermarkOpacity = parseFloat(e.target.value);
        watermarkOpacityVal.textContent = Math.round(settings.watermarkOpacity * 100) + '%';
        WatermarkManager.update();
        SettingsManager.saveSettings();
      });
    }
    
    if (watermarkSize) {
      watermarkSize.addEventListener('input', (e) => {
        settings.watermarkSize = parseInt(e.target.value);
        watermarkSizeVal.textContent = settings.watermarkSize + 'px';
        WatermarkManager.update();
        SettingsManager.saveSettings();
      });
    }
    
    if (watermarkColor) {
      watermarkColor.addEventListener('change', (e) => {
        settings.watermarkColor = e.target.value;
        WatermarkManager.update();
        SettingsManager.saveSettings();
      });
    }
  },
  
  // 绑定Markdown控制事件
  bindMarkdownControls() {
    if (enableMarkdown) {
      enableMarkdown.addEventListener('change', (e) => {
        settings.enableMarkdown = e.target.checked;
        updatePreview();  // 使用统一的更新函数
        SettingsManager.saveSettings();
      });
    }
    
    if (autoFormat) {
      autoFormat.addEventListener('change', (e) => {
        settings.autoFormat = e.target.checked;
        if (e.target.checked) {
          inputText.value = TextFormatter.autoFormat(inputText.value);
          updatePreview();
        }
        SettingsManager.saveSettings();
      });
    }
  },
  
  // 更新内容显示（这个函数现在由updatePreview统一处理，保留作为备用）
  updateContentDisplay() {
    // 这个函数的功能已经整合到updatePreview中
    // 保留作为独立调用的备用方法
    const text = settings.enableMultiPage && pages.length > 0 && pages[currentPage] !== undefined ? pages[currentPage] : inputText.value;
    
    if (settings.enableMarkdown && typeof MarkdownRenderer !== 'undefined') {
      contentText.innerHTML = MarkdownRenderer.render(text);
    } else {
      contentText.textContent = text || '在左侧输入你的内容，右侧将实时更新预览。';
    }
  },
  
  // 生成所有页面
  async generateAllPages() {
    if (!settings.enableMultiPage || pages.length <= 1) {
      generateImage();
      return;
    }
    
    // 检查JSZip是否可用
    if (typeof JSZip === 'undefined') {
      showNotification('多页面导出功能需要JSZip库，请刷新页面重试', 'error');
      return;
    }
    
    try {
      generateAllPagesBtn.classList.add('loading');
      generateAllPagesBtn.disabled = true;
      
      const zip = new JSZip();
      const originalPage = currentPage;
      
      for (let i = 0; i < pages.length; i++) {
        MultiPageManager.goToPage(i);
        await new Promise(resolve => setTimeout(resolve, 100)); // 等待渲染
        
        const canvas = await html2canvas(captureArea, {
          scale: settings.exportScale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null
        });
        
        const blob = await new Promise(resolve => {
          canvas.toBlob(resolve, `image/${settings.exportFormat}`, 0.9);
        });
        
        zip.file(`page-${i + 1}.${settings.exportFormat}`, blob);
      }
      
      // 恢复原页面
      MultiPageManager.goToPage(originalPage);
      
      // 下载ZIP文件
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `share-images-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      
      showNotification('所有页面已生成并下载', 'success');
    } catch (error) {
      console.error('生成所有页面失败:', error);
      showNotification('生成失败，请重试', 'error');
    } finally {
      generateAllPagesBtn.classList.remove('loading');
      generateAllPagesBtn.disabled = false;
    }
  }
};

// 主更新函数 - 修复后的简化版本
function enhancedUpdatePreview() {
  // 直接调用统一的updatePreview函数，避免重复逻辑
  updatePreview();
}

// 设置管理器已经在上面更新了默认设置，这里不需要重复扩展

// 扩展应用初始化器
const originalInit = AppInitializer.init;
AppInitializer.init = async function() {
  // 调用原始初始化
  await originalInit.call(this);
  
  // 初始化新功能
  MarkdownRenderer.init();
  EventBindings.init();
  
  // 应用保存的设置
  if (enableMarkdown) enableMarkdown.checked = settings.enableMarkdown;
  if (autoFormat) autoFormat.checked = settings.autoFormat;
  if (enableMultiPage) enableMultiPage.checked = settings.enableMultiPage;
  if (maxCharsPerPage) maxCharsPerPage.value = settings.maxCharsPerPage;
  if (enableWatermark) enableWatermark.checked = settings.enableWatermark;
  if (watermarkText) watermarkText.value = settings.watermarkText;
  if (watermarkPosition) watermarkPosition.value = settings.watermarkPosition;
  if (watermarkOpacity) {
    watermarkOpacity.value = settings.watermarkOpacity;
    watermarkOpacityVal.textContent = Math.round(settings.watermarkOpacity * 100) + '%';
  }
  if (watermarkSize) {
    watermarkSize.value = settings.watermarkSize;
    watermarkSizeVal.textContent = settings.watermarkSize + 'px';
  }
  if (watermarkColor) watermarkColor.value = settings.watermarkColor;
  
  // 初始化UI状态
  if (pageSettings) pageSettings.style.display = settings.enableMultiPage ? 'block' : 'none';
  if (multiPageExport) multiPageExport.style.display = settings.enableMultiPage ? 'block' : 'none';
  if (watermarkOptions) watermarkOptions.style.display = settings.enableWatermark ? 'block' : 'none';
  
  // 初始更新
  if (typeof MultiPageManager !== 'undefined') {
    MultiPageManager.updatePageNavigation();
  }
  if (typeof WatermarkManager !== 'undefined') {
    WatermarkManager.update();
  }
};

// 初始化应用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', optimizedInit);
} else {
  optimizedInit();
}