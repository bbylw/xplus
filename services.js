/**
 * 状态管理和核心服务模块
 */

// =============================================================================
// 1. 状态管理器
// =============================================================================

class StateManager {
  constructor() {
    this.state = new Proxy({}, {
      set: (target, property, value) => {
        const oldValue = target[property];
        target[property] = value;
        this.notifySubscribers(property, value, oldValue);
        return true;
      }
    });
    
    this.subscribers = new Map();
    this.middleware = [];
    this.history = [];
    this.maxHistory = 50;
  }

  // 添加中间件
  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function');
    }
    this.middleware.push(middleware);
  }

  // 订阅状态变化
  subscribe(path, callback) {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }
    this.subscribers.get(path).add(callback);
    
    // 返回取消订阅函数
    return () => {
      const callbacks = this.subscribers.get(path);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(path);
        }
      }
    };
  }

  // 通知订阅者
  notifySubscribers(path, newValue, oldValue) {
    // 记录历史
    this.history.push({
      timestamp: Date.now(),
      path,
      oldValue: Utils.deepClone(oldValue),
      newValue: Utils.deepClone(newValue)
    });
    
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // 应用中间件
    for (const middleware of this.middleware) {
      try {
        middleware(path, newValue, oldValue);
      } catch (error) {
        console.error('State middleware error:', error);
      }
    }

    // 通知精确匹配的订阅者
    const exactCallbacks = this.subscribers.get(path);
    if (exactCallbacks) {
      exactCallbacks.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          console.error('State subscription callback error:', error);
        }
      });
    }

    // 通知通配符订阅者
    const wildcardCallbacks = this.subscribers.get('*');
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          console.error('State wildcard callback error:', error);
        }
      });
    }
  }

  // 获取状态
  get(path) {
    if (!path) return this.state;
    return this.getNestedValue(this.state, path);
  }

  // 设置状态
  set(path, value) {
    if (typeof path === 'object') {
      // 批量设置
      Object.keys(path).forEach(key => {
        this.setNestedValue(this.state, key, path[key]);
      });
    } else {
      this.setNestedValue(this.state, path, value);
    }
  }

  // 获取嵌套值
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // 设置嵌套值
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  // 重置状态
  reset(path) {
    if (path) {
      this.set(path, undefined);
    } else {
      Object.keys(this.state).forEach(key => {
        delete this.state[key];
      });
    }
  }

  // 获取历史记录
  getHistory() {
    return [...this.history];
  }

  // 清除历史记录
  clearHistory() {
    this.history = [];
  }
}

// =============================================================================
// 2. 配置管理服务
// =============================================================================

class ConfigService {
  constructor() {
    this.defaults = {
      // 文本设置
      text: {
        content: '',
        enableMarkdown: false,
        autoFormat: false
      },
      
      // 样式设置
      style: {
        fontSize: 20,
        lineHeight: 1.7,
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans SC, Arial, sans-serif",
        textColor: "#111111",
        bgColor: "#ffffff",
        cardWidth: 960,
        contentPadding: 32
      },
      
      // 导出设置
      export: {
        scale: 3,
        format: "png",
        quality: 0.9
      },
      
      // 品牌设置
      brand: {
        username: "",
        logoUrl: "",
        showBrand: true
      },
      
      // 模板设置
      template: {
        current: "template-default",
        history: []
      },
      
      // 多页面设置
      multiPage: {
        enabled: false,
        maxCharsPerPage: 800,
        currentPage: 0
      },
      
      // 水印设置
      watermark: {
        enabled: false,
        text: "",
        position: "bottom-right",
        opacity: 0.5,
        size: 14,
        color: "#888888"
      },
      
      // 性能设置
      performance: {
        enableMonitoring: false,
        debounceDelay: 150,
        throttleDelay: 50
      },
      
      // 用户界面设置
      ui: {
        theme: 'auto',
        language: 'zh-CN',
        showTips: true,
        compactMode: false
      }
    };
    
    this.current = Utils.deepClone(this.defaults);
    this.storageKey = 'textToImageConfig';
  }

  async init() {
    await this.load();
    this.setupAutoSave();
  }

  // 获取配置
  get(path) {
    if (!path) return this.current;
    return Utils.deepClone(this.getNestedValue(this.current, path));
  }

  // 设置配置
  set(path, value) {
    if (typeof path === 'object') {
      // 批量设置
      Object.keys(path).forEach(key => {
        this.setNestedValue(this.current, key, value[key]);
      });
    } else {
      this.setNestedValue(this.current, path, value);
    }
    this.save();
  }

  // 重置配置
  reset(path) {
    if (path) {
      const defaultValue = this.getNestedValue(this.defaults, path);
      this.set(path, Utils.deepClone(defaultValue));
    } else {
      this.current = Utils.deepClone(this.defaults);
      this.save();
    }
  }

  // 合并配置
  merge(config) {
    this.current = this.deepMerge(this.current, config);
    this.save();
  }

  // 深度合并
  deepMerge(target, source) {
    const result = Utils.deepClone(target);
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  // 保存到本地存储
  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.current));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  // 从本地存储加载
  async load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.current = this.deepMerge(this.defaults, parsed);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      this.current = Utils.deepClone(this.defaults);
    }
  }

  // 设置自动保存
  setupAutoSave() {
    // 监听页面卸载事件
    window.addEventListener('beforeunload', () => this.save());
    window.addEventListener('visibilitychange', () => {
      if (document.hidden) this.save();
    });
  }

  // 导出配置
  export() {
    const config = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      config: this.current
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-to-image-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // 导入配置
  async import(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (imported.config) {
            this.merge(imported.config);
            resolve(imported);
          } else {
            reject(new Error('Invalid config file format'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  // 工具方法
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }
}

// =============================================================================
// 3. 存储服务
// =============================================================================

class StorageService {
  constructor() {
    this.prefix = 'textToImage_';
    this.maxItems = {
      history: 50,
      templates: 20,
      drafts: 10
    };
  }

  // 设置项目
  set(key, value, options = {}) {
    const fullKey = this.prefix + key;
    const item = {
      value,
      timestamp: Date.now(),
      expires: options.expires ? Date.now() + options.expires : null,
      version: options.version || '1.0.0'
    };

    try {
      if (options.maxItems && this.getKeys(key).length >= options.maxItems) {
        this.cleanup(key, options.maxItems);
      }
      
      localStorage.setItem(fullKey, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  // 获取项目
  get(key, defaultValue = null) {
    const fullKey = this.prefix + key;
    
    try {
      const stored = localStorage.getItem(fullKey);
      if (!stored) return defaultValue;
      
      const item = JSON.parse(stored);
      
      // 检查过期时间
      if (item.expires && Date.now() > item.expires) {
        this.remove(key);
        return defaultValue;
      }
      
      return item.value;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  }

  // 删除项目
  remove(key) {
    const fullKey = this.prefix + key;
    try {
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  // 清理过期项目
  cleanup(keyPattern, maxItems) {
    const keys = this.getKeys(keyPattern);
    const items = keys.map(key => ({
      key,
      item: JSON.parse(localStorage.getItem(key))
    }));

    // 删除过期项目
    const now = Date.now();
    items.forEach(({ key, item }) => {
      if (item.expires && now > item.expires) {
        localStorage.removeItem(key);
      }
    });

    // 如果还是太多，删除最旧的项目
    if (maxItems) {
      const validItems = items.filter(({ item }) => 
        !item.expires || now <= item.expires
      );
      
      if (validItems.length > maxItems) {
        validItems
          .sort((a, b) => a.item.timestamp - b.item.timestamp)
          .slice(0, validItems.length - maxItems)
          .forEach(({ key }) => localStorage.removeItem(key));
      }
    }
  }

  // 获取所有匹配的键
  getKeys(pattern) {
    const prefix = this.prefix + pattern;
    return Object.keys(localStorage).filter(key => key.startsWith(prefix));
  }

  // 获取存储使用情况
  getUsage() {
    let total = 0;
    let items = 0;
    
    for (let key in localStorage) {
      if (key.startsWith(this.prefix)) {
        total += localStorage[key].length;
        items++;
      }
    }
    
    return {
      items,
      bytes: total,
      kb: Math.round(total / 1024 * 100) / 100,
      mb: Math.round(total / 1024 / 1024 * 100) / 100
    };
  }

  // 清空所有数据
  clear() {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.prefix)
    );
    
    keys.forEach(key => localStorage.removeItem(key));
    return keys.length;
  }
}

// =============================================================================
// 4. 通知服务
// =============================================================================

class NotificationService {
  constructor() {
    this.notifications = [];
    this.maxNotifications = 5;
    this.defaultDuration = 4000;
    this.container = null;
    this.init();
  }

  init() {
    // 创建通知容器
    this.container = document.createElement('div');
    this.container.className = 'notification-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  show(message, type = 'info', options = {}) {
    const notification = this.create(message, type, options);
    this.notifications.push(notification);
    
    // 限制通知数量
    while (this.notifications.length > this.maxNotifications) {
      const oldest = this.notifications.shift();
      this.remove(oldest);
    }
    
    // 自动移除
    const duration = options.duration !== undefined ? options.duration : this.defaultDuration;
    if (duration > 0) {
      setTimeout(() => this.remove(notification), duration);
    }
    
    return notification;
  }

  create(message, type, options) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const closeButton = options.closable !== false ? 
      '<button class="notification-close" aria-label="关闭">×</button>' : '';
    
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        ${closeButton}
      </div>
    `;
    
    // 样式
    notification.style.cssText = `
      background: ${this.getTypeColor(type)};
      color: white;
      padding: 12px 16px;
      margin-bottom: 8px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateX(100%);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: auto;
      max-width: 350px;
      word-wrap: break-word;
    `;
    
    // 关闭事件
    if (options.closable !== false) {
      const closeBtn = notification.querySelector('.notification-close');
      if (closeBtn) {
        closeBtn.style.cssText = `
          background: none;
          border: none;
          color: white;
          float: right;
          font-size: 18px;
          cursor: pointer;
          margin-left: 8px;
          opacity: 0.8;
        `;
        closeBtn.addEventListener('click', () => this.remove(notification));
      }
    }
    
    this.container.appendChild(notification);
    
    // 触发进入动画
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });
    
    return notification;
  }

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
    }, 300);
  }

  getTypeColor(type) {
    const colors = {
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336'
    };
    return colors[type] || colors.info;
  }

  clear() {
    this.notifications.forEach(notification => this.remove(notification));
    this.notifications = [];
  }

  // 便捷方法
  info(message, options) { return this.show(message, 'info', options); }
  success(message, options) { return this.show(message, 'success', options); }
  warning(message, options) { return this.show(message, 'warning', options); }
  error(message, options) { return this.show(message, 'error', options); }
}

// 导出服务类
window.StateManager = StateManager;
window.ConfigService = ConfigService;
window.StorageService = StorageService;
window.NotificationService = NotificationService;