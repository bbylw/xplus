/**
 * 图片生成和历史管理模块
 */

// =============================================================================
// 1. 图片生成器
// =============================================================================

class ImageGenerator {
  constructor(app) {
    this.app = app;
    this.isGenerating = false;
    this.queue = [];
    this.defaultOptions = {
      scale: 3,
      format: 'png',
      quality: 0.9,
      timeout: 30000,
      backgroundColor: null,
      useCORS: true,
      allowTaint: false,
      foreignObjectRendering: false,
      removeContainer: true,
      pixelRatio: 1
    };
  }

  // 生成单张图片
  async generate(element = null, options = {}) {
    if (this.isGenerating) {
      return this.queueGeneration(element, options);
    }

    const mergedOptions = { ...this.defaultOptions, ...options };
    const targetElement = element || this.app.getService('ui').get('preview').getCaptureElement();
    
    if (!targetElement) {
      throw new Error('No element to capture');
    }

    this.isGenerating = true;
    this.app.eventBus.emit('generation:start');

    try {
      // 预处理
      await this.preProcess(targetElement, mergedOptions);
      
      // 生成图片
      const canvas = await this.generateCanvas(targetElement, mergedOptions);
      
      // 后处理
      const result = await this.postProcess(canvas, mergedOptions);
      
      // 保存到历史
      this.saveToHistory(result, mergedOptions);
      
      this.app.eventBus.emit('generation:success', result);
      return result;

    } catch (error) {
      this.app.logger.error('Image generation failed:', error);
      this.app.eventBus.emit('generation:error', error);
      throw error;
    } finally {
      this.isGenerating = false;
      this.app.eventBus.emit('generation:end');
      this.processQueue();
    }
  }

  // 队列生成请求
  queueGeneration(element, options) {
    return new Promise((resolve, reject) => {
      this.queue.push({ element, options, resolve, reject });
    });
  }

  // 处理队列
  async processQueue() {
    if (this.queue.length === 0 || this.isGenerating) return;

    const { element, options, resolve, reject } = this.queue.shift();
    
    try {
      const result = await this.generate(element, options);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  }

  // 预处理
  async preProcess(element, options) {
    // 确保所有字体已加载
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // 确保内容是最新的
    await this.ensureContentVisible(element);
    
    // 滚动到顶部
    element.scrollTop = 0;
    
    // 临时样式调整
    this.applyTemporaryStyles(element, options);
  }

  // 确保内容可见
  async ensureContentVisible(element) {
    const contentEl = element.querySelector('#content-text');
    if (!contentEl) return;

    const config = this.app.getService('config');
    const content = config.get('text.content');
    
    if (!content) return;

    const currentContent = contentEl.textContent || contentEl.innerHTML;
    
    if (!currentContent || currentContent.includes('在左侧输入你的内容')) {
      try {
        const enableMarkdown = config.get('text.enableMarkdown');
        if (enableMarkdown && typeof marked !== 'undefined') {
          contentEl.innerHTML = marked.parse(content);
        } else {
          contentEl.textContent = content;
        }
        
        // 等待DOM更新
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        this.app.logger.warn('Content fix failed:', error);
        contentEl.textContent = content;
      }
    }
  }

  // 应用临时样式
  applyTemporaryStyles(element, options) {
    const config = this.app.getService('config');
    const width = config.get('style.cardWidth');
    
    // 保存原始样式
    this.originalStyles = {
      visibility: element.style.visibility,
      width: element.style.width,
      minHeight: element.style.minHeight
    };

    // 应用临时样式
    element.style.visibility = 'visible';
    element.style.width = `${width}px`;
    
    // 计算高度
    const rect = element.getBoundingClientRect();
    const height = Math.max(
      rect.height || 0,
      element.offsetHeight || 0,
      element.scrollHeight || 0,
      540
    );
    element.style.minHeight = `${height}px`;
    
    // 强制重排
    element.offsetHeight;
  }

  // 生成画布
  async generateCanvas(element, options) {
    const config = this.app.getService('config');
    const width = config.get('style.cardWidth');
    
    const rect = element.getBoundingClientRect();
    const height = Math.max(
      rect.height || 0,
      element.offsetHeight || 0,
      element.scrollHeight || 0,
      540
    );

    const html2canvasOptions = {
      ...options,
      windowWidth: width,
      windowHeight: height,
      height: height,
      onclone: (clonedDoc) => {
        this.setupClonedDocument(clonedDoc, element, width, height);
      }
    };

    this.app.eventBus.emit('generation:rendering');
    
    const canvas = await html2canvas(element, html2canvasOptions);
    
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Generated canvas is empty');
    }

    return canvas;
  }

  // 设置克隆文档
  setupClonedDocument(clonedDoc, originalElement, width, height) {
    // 创建离屏容器
    const offscreen = clonedDoc.createElement('div');
    offscreen.style.cssText = `
      position: fixed;
      left: -100000px;
      top: 0;
      width: ${width}px;
      min-height: ${height}px;
      display: block;
      visibility: visible;
      overflow: visible;
      background: ${getComputedStyle(originalElement).backgroundColor || 'transparent'};
    `;
    clonedDoc.body.appendChild(offscreen);

    const clonedElement = clonedDoc.querySelector('#capture-area');
    if (clonedElement) {
      // 锁定尺寸
      clonedElement.style.width = `${width}px`;
      clonedElement.style.minHeight = `${height}px`;
      clonedElement.style.display = 'block';
      clonedElement.style.visibility = 'visible';
      clonedElement.style.overflow = 'visible';

      // 同步内容
      const originalContent = originalElement.querySelector('#content-text');
      const clonedContent = clonedElement.querySelector('#content-text');
      if (originalContent && clonedContent) {
        clonedContent.innerHTML = originalContent.innerHTML;
        clonedContent.style.display = 'block';
        clonedContent.style.visibility = 'visible';
      }

      // 移除有问题的元素
      clonedElement.querySelectorAll('script, iframe, object, embed').forEach(el => el.remove());

      // 移动到离屏容器
      offscreen.appendChild(clonedElement);
    }
  }

  // 后处理
  async postProcess(canvas, options) {
    // 恢复原始样式
    if (this.originalStyles) {
      const element = this.app.getService('ui').get('preview').getCaptureElement();
      Object.entries(this.originalStyles).forEach(([prop, value]) => {
        if (value) {
          element.style[prop] = value;
        } else {
          element.style[prop] = '';
        }
      });
    }

    // 转换为数据URL
    const dataURL = this.canvasToDataURL(canvas, options);
    
    return {
      canvas,
      dataURL,
      blob: await this.dataURLToBlob(dataURL),
      width: canvas.width,
      height: canvas.height,
      format: options.format,
      scale: options.scale,
      timestamp: Date.now()
    };
  }

  // 画布转数据URL
  canvasToDataURL(canvas, options) {
    const mimeType = this.getMimeType(options.format);
    const quality = options.format === 'jpeg' ? options.quality : undefined;
    
    try {
      return canvas.toDataURL(mimeType, quality);
    } catch (error) {
      if (error.message.includes('memory') || error.message.includes('size')) {
        // 降级处理
        const smallerCanvas = document.createElement('canvas');
        const ctx = smallerCanvas.getContext('2d');
        const ratio = 0.8;
        smallerCanvas.width = canvas.width * ratio;
        smallerCanvas.height = canvas.height * ratio;
        ctx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
        
        this.app.getService('notification').warning('图片过大，已自动压缩');
        return smallerCanvas.toDataURL(mimeType, quality);
      }
      throw error;
    }
  }

  // 数据URL转Blob
  dataURLToBlob(dataURL) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(resolve);
      };
      
      img.src = dataURL;
    });
  }

  // 获取MIME类型
  getMimeType(format) {
    const types = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      webp: 'image/webp'
    };
    return types[format] || types.png;
  }

  // 下载图片
  download(result, filename = null) {
    const name = filename || this.generateFilename(result);
    
    const a = document.createElement('a');
    a.href = result.dataURL;
    a.download = name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);

    this.app.eventBus.emit('image:downloaded', { result, filename: name });
  }

  // 复制到剪贴板
  async copyToClipboard(result) {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('Clipboard API not supported');
    }

    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': result.blob })
      ]);
      
      this.app.eventBus.emit('image:copied', result);
      this.app.getService('notification').success('图片已复制到剪贴板');
    } catch (error) {
      this.app.logger.error('Copy to clipboard failed:', error);
      throw new Error('复制失败，请重试');
    }
  }

  // 生成文件名
  generateFilename(result) {
    const config = this.app.getService('config');
    const template = config.get('template.current') || 'default';
    const templateName = template.replace('template-', '');
    const date = new Date().toISOString().split('T')[0];
    
    return `share-image-${templateName}-${date}.${result.format}`;
  }

  // 保存到历史
  saveToHistory(result, options) {
    const history = this.app.getService('history');
    const config = this.app.getService('config');
    
    const item = {
      id: Utils.generateId('img_'),
      content: config.get('text.content'),
      template: config.get('template.current'),
      style: config.get('style'),
      thumbnail: this.generateThumbnail(result.canvas),
      timestamp: result.timestamp,
      filename: this.generateFilename(result),
      options: {
        format: result.format,
        scale: result.scale,
        width: result.width,
        height: result.height
      }
    };
    
    history.add(item);
  }

  // 生成缩略图
  generateThumbnail(canvas, maxSize = 200) {
    const thumbnailCanvas = document.createElement('canvas');
    const ctx = thumbnailCanvas.getContext('2d');
    
    const ratio = Math.min(maxSize / canvas.width, maxSize / canvas.height);
    thumbnailCanvas.width = canvas.width * ratio;
    thumbnailCanvas.height = canvas.height * ratio;
    
    ctx.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
    
    return thumbnailCanvas.toDataURL('image/jpeg', 0.7);
  }

  // 批量生成
  async generateBatch(contents, options = {}) {
    if (!Array.isArray(contents) || contents.length === 0) {
      throw new Error('Invalid contents for batch generation');
    }

    this.app.eventBus.emit('batch:start', { count: contents.length });
    
    const results = [];
    const errors = [];
    
    try {
      for (let i = 0; i < contents.length; i++) {
        const content = contents[i];
        
        try {
          // 更新内容
          this.app.getService('config').set('text.content', content);
          this.app.eventBus.emit('text:changed', content);
          
          // 等待预览更新
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // 生成图片
          const result = await this.generate(null, {
            ...options,
            filename: `batch-${i + 1}-${this.generateFilename({ format: options.format || 'png' })}`
          });
          
          results.push(result);
          this.app.eventBus.emit('batch:progress', { 
            current: i + 1, 
            total: contents.length,
            result 
          });
          
        } catch (error) {
          errors.push({ index: i, content, error });
          this.app.logger.error(`Batch generation failed for item ${i}:`, error);
        }
      }
      
      this.app.eventBus.emit('batch:complete', { results, errors });
      return { results, errors };
      
    } catch (error) {
      this.app.eventBus.emit('batch:error', error);
      throw error;
    }
  }
}

// =============================================================================
// 2. 历史管理器
// =============================================================================

class HistoryManager {
  constructor(app) {
    this.app = app;
    this.storage = app.getService('storage');
    this.maxItems = 50;
    this.storageKey = 'history';
  }

  // 添加历史项目
  add(item) {
    const history = this.getAll();
    
    // 避免重复
    const exists = history.find(h => 
      h.content === item.content && 
      h.template === item.template
    );
    
    if (exists) {
      this.app.logger.info('Duplicate history item, skipping');
      return;
    }
    
    // 添加到开头
    history.unshift({
      ...item,
      id: item.id || Utils.generateId('hist_'),
      timestamp: item.timestamp || Date.now()
    });
    
    // 限制数量
    if (history.length > this.maxItems) {
      history.splice(this.maxItems);
    }
    
    this.save(history);
    this.app.eventBus.emit('history:added', item);
  }

  // 获取所有历史
  getAll() {
    return this.storage.get(this.storageKey, []);
  }

  // 获取单个历史项目
  get(id) {
    const history = this.getAll();
    return history.find(item => item.id === id);
  }

  // 删除历史项目
  remove(id) {
    const history = this.getAll();
    const index = history.findIndex(item => item.id === id);
    
    if (index > -1) {
      const removed = history.splice(index, 1)[0];
      this.save(history);
      this.app.eventBus.emit('history:removed', removed);
      return removed;
    }
    
    return null;
  }

  // 清空历史
  clear() {
    this.storage.remove(this.storageKey);
    this.app.eventBus.emit('history:cleared');
  }

  // 恢复历史项目
  restore(id) {
    const item = this.get(id);
    if (!item) {
      throw new Error('History item not found');
    }
    
    const config = this.app.getService('config');
    
    // 恢复配置
    config.set('text.content', item.content);
    config.set('template.current', item.template);
    config.set('style', item.style);
    
    // 触发更新事件
    this.app.eventBus.emit('text:changed', item.content);
    this.app.eventBus.emit('template:changed', item.template);
    this.app.eventBus.emit('style:changed', { styles: item.style });
    
    this.app.eventBus.emit('history:restored', item);
    this.app.getService('notification').success('历史记录已恢复');
  }

  // 搜索历史
  search(query) {
    if (!query || query.trim() === '') {
      return this.getAll();
    }
    
    const history = this.getAll();
    const lowerQuery = query.toLowerCase();
    
    return history.filter(item => 
      item.content.toLowerCase().includes(lowerQuery) ||
      item.template.toLowerCase().includes(lowerQuery) ||
      (item.filename && item.filename.toLowerCase().includes(lowerQuery))
    );
  }

  // 按日期分组
  groupByDate() {
    const history = this.getAll();
    const grouped = {};
    
    history.forEach(item => {
      const date = new Date(item.timestamp).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    
    return grouped;
  }

  // 获取统计信息
  getStats() {
    const history = this.getAll();
    const templates = {};
    const formats = {};
    
    history.forEach(item => {
      // 模板统计
      const template = item.template || 'unknown';
      templates[template] = (templates[template] || 0) + 1;
      
      // 格式统计
      const format = item.options?.format || 'unknown';
      formats[format] = (formats[format] || 0) + 1;
    });
    
    return {
      total: history.length,
      templates,
      formats,
      oldestTimestamp: history.length > 0 ? Math.min(...history.map(h => h.timestamp)) : null,
      newestTimestamp: history.length > 0 ? Math.max(...history.map(h => h.timestamp)) : null
    };
  }

  // 导出历史
  export() {
    const history = this.getAll();
    const exportData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      count: history.length,
      data: history
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // 导入历史
  async import(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (imported.data && Array.isArray(imported.data)) {
            const current = this.getAll();
            const merged = [...imported.data, ...current];
            
            // 去重
            const unique = merged.filter((item, index, self) =>
              index === self.findIndex(i => i.content === item.content && i.template === item.template)
            );
            
            // 限制数量
            if (unique.length > this.maxItems) {
              unique.splice(this.maxItems);
            }
            
            this.save(unique);
            this.app.eventBus.emit('history:imported', { count: imported.data.length });
            resolve(imported);
          } else {
            reject(new Error('Invalid history file format'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  // 保存历史
  save(history) {
    this.storage.set(this.storageKey, history, {
      maxItems: this.maxItems
    });
  }
}

// 导出类
window.ImageGenerator = ImageGenerator;
window.HistoryManager = HistoryManager;