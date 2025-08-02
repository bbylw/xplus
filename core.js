/**
 * 长文转图片生成器 - 核心架构模块
 * 采用现代化模块化设计，实现松耦合、高内聚的代码结构
 */

// =============================================================================
// 1. 核心应用管理器
// =============================================================================

class AppCore {
  constructor() {
    this.services = new Map();
    this.modules = new Map();
    this.state = {
      initialized: false,
      loading: false,
      error: null
    };
    this.eventBus = new EventBus();
    this.logger = new Logger();
  }

  // 服务注册和依赖注入
  registerService(name, service) {
    if (this.services.has(name)) {
      throw new Error(`Service '${name}' already registered`);
    }
    this.services.set(name, service);
    this.logger.info(`Service registered: ${name}`);
    return this;
  }

  getService(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not found`);
    }
    return service;
  }

  // 模块管理
  registerModule(name, module) {
    if (this.modules.has(name)) {
      throw new Error(`Module '${name}' already registered`);
    }
    this.modules.set(name, module);
    this.logger.info(`Module registered: ${name}`);
    return this;
  }

  async initializeModule(name) {
    const module = this.modules.get(name);
    if (!module) {
      throw new Error(`Module '${name}' not found`);
    }
    
    try {
      if (module.init && typeof module.init === 'function') {
        await module.init(this);
      }
      this.logger.info(`Module initialized: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to initialize module '${name}':`, error);
      throw error;
    }
  }

  // 应用初始化
  async initialize() {
    if (this.state.initialized) {
      this.logger.warn('App already initialized');
      return;
    }

    try {
      this.state.loading = true;
      this.eventBus.emit('app:initializing');

      // 按依赖顺序初始化模块
      const initOrder = [
        'config',
        'storage',
        'theme',
        'ui',
        'preview',
        'generator',
        'history',
        'analytics'
      ];

      for (const moduleName of initOrder) {
        if (this.modules.has(moduleName)) {
          await this.initializeModule(moduleName);
        }
      }

      this.state.initialized = true;
      this.state.loading = false;
      this.eventBus.emit('app:initialized');
      this.logger.info('App initialized successfully');

    } catch (error) {
      this.state.error = error;
      this.state.loading = false;
      this.eventBus.emit('app:error', error);
      this.logger.error('App initialization failed:', error);
      throw error;
    }
  }

  // 优雅关闭
  async destroy() {
    try {
      this.eventBus.emit('app:destroying');
      
      // 反向销毁模块
      for (const [name, module] of [...this.modules.entries()].reverse()) {
        if (module.destroy && typeof module.destroy === 'function') {
          await module.destroy();
          this.logger.info(`Module destroyed: ${name}`);
        }
      }

      this.services.clear();
      this.modules.clear();
      this.eventBus.removeAllListeners();
      this.logger.info('App destroyed successfully');

    } catch (error) {
      this.logger.error('App destruction failed:', error);
      throw error;
    }
  }
}

// =============================================================================
// 2. 事件总线
// =============================================================================

class EventBus {
  constructor() {
    this.listeners = new Map();
    this.maxListeners = 50;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    const callbacks = this.listeners.get(event);
    if (callbacks.length >= this.maxListeners) {
      console.warn(`Max listeners (${this.maxListeners}) exceeded for event: ${event}`);
    }
    
    callbacks.push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, ...args) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      // 创建副本避免在执行过程中修改原数组
      [...callbacks].forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for '${event}':`, error);
        }
      });
    }
  }

  once(event, callback) {
    const onceCallback = (...args) => {
      this.off(event, onceCallback);
      callback(...args);
    };
    this.on(event, onceCallback);
  }

  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// =============================================================================
// 3. 日志系统
// =============================================================================

class Logger {
  constructor(level = 'info') {
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    this.currentLevel = this.levels[level] || 1;
    this.history = [];
    this.maxHistory = 100;
  }

  log(level, message, ...args) {
    if (this.levels[level] >= this.currentLevel) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level,
        message,
        args,
        stack: level === 'error' ? new Error().stack : null
      };

      this.history.push(logEntry);
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }

      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
      console[level === 'debug' ? 'log' : level](prefix, message, ...args);
    }
  }

  debug(message, ...args) { this.log('debug', message, ...args); }
  info(message, ...args) { this.log('info', message, ...args); }
  warn(message, ...args) { this.log('warn', message, ...args); }
  error(message, ...args) { this.log('error', message, ...args); }

  getHistory() {
    return [...this.history];
  }

  clearHistory() {
    this.history = [];
  }

  setLevel(level) {
    if (level in this.levels) {
      this.currentLevel = this.levels[level];
    }
  }
}

// =============================================================================
// 4. 工具函数集合
// =============================================================================

class Utils {
  // 防抖函数
  static debounce(func, wait, immediate = false) {
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

  // 节流函数
  static throttle(func, limit, trailing = true) {
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

  // 深拷贝
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = Utils.deepClone(obj[key]);
      });
      return cloned;
    }
  }

  // 安全的JSON解析
  static safeJSONParse(str, fallback = null) {
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  }

  // 生成唯一ID
  static generateId(prefix = '') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 安全的元素选择器
  static $(selector, context = document) {
    try {
      return context.querySelector(selector);
    } catch (error) {
      console.warn(`Invalid selector: ${selector}`, error);
      return null;
    }
  }

  static $$(selector, context = document) {
    try {
      return context.querySelectorAll(selector);
    } catch (error) {
      console.warn(`Invalid selector: ${selector}`, error);
      return [];
    }
  }
}

// =============================================================================
// 5. 全局应用实例
// =============================================================================

// 创建全局应用实例
window.TextToImageApp = new AppCore();

// 导出到全局
window.EventBus = EventBus;
window.Logger = Logger;
window.Utils = Utils;

// 开发模式下暴露更多调试接口
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.DEBUG = {
    app: window.TextToImageApp,
    services: () => [...window.TextToImageApp.services.keys()],
    modules: () => [...window.TextToImageApp.modules.keys()],
    state: () => window.TextToImageApp.state,
    logs: () => window.TextToImageApp.logger.getHistory()
  };
}