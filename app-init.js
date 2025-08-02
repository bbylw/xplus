/**
 * 应用初始化脚本 - 使用新的模块化架构
 */

// =============================================================================
// 应用初始化和模块注册
// =============================================================================

(async function initializeApp() {
  'use strict';

  const app = window.TextToImageApp;
  
  try {
    // 注册核心服务
    app.registerService('state', new StateManager());
    app.registerService('config', new ConfigService());
    app.registerService('storage', new StorageService());
    app.registerService('notification', new NotificationService());
    
    // 注册UI组件管理器
    app.registerService('ui', new UIComponentManager(app));
    
    // 注册功能服务
    app.registerService('generator', new ImageGenerator(app));
    app.registerService('history', new HistoryManager(app));
    
    // 注册UI组件
    const uiManager = app.getService('ui');
    uiManager.register('textEditor', new TextEditorComponent());
    uiManager.register('styleControl', new StyleControlComponent());
    uiManager.register('preview', new PreviewComponent());
    
    // 创建应用模块
    const modules = {
      config: {
        async init(app) {
          await app.getService('config').init();
          app.logger.info('Config module initialized');
        }
      },
      
      storage: {
        async init(app) {
          // 存储服务无需特殊初始化
          app.logger.info('Storage module initialized');
        }
      },
      
      theme: {
        async init(app) {
          const config = app.getService('config');
          const theme = config.get('ui.theme');
          
          if (theme === 'auto') {
            // 检测系统主题
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            
            // 监听主题变化
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
              document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            });
          } else {
            document.documentElement.setAttribute('data-theme', theme);
          }
          
          app.logger.info('Theme module initialized');
        }
      },
      
      ui: {
        async init(app) {
          const uiManager = app.getService('ui');
          await uiManager.initAll();
          app.logger.info('UI module initialized');
        }
      },
      
      preview: {
        async init(app) {
          // 预览组件已在UI模块中初始化
          // 设置预览更新监听器
          const preview = app.getService('ui').get('preview');
          
          // 监听配置变化并更新预览
          app.eventBus.on('config:changed', () => {
            preview.forceUpdate();
          });
          
          app.logger.info('Preview module initialized');
        }
      },
      
      generator: {
        async init(app) {
          const generator = app.getService('generator');
          const notification = app.getService('notification');
          
          // 监听生成事件并显示通知
          app.eventBus.on('generation:start', () => {
            notification.info('开始生成图片...', { duration: 0, closable: false });
          });
          
          app.eventBus.on('generation:success', (result) => {
            notification.clear();
            notification.success('图片生成成功！');
          });
          
          app.eventBus.on('generation:error', (error) => {
            notification.clear();
            notification.error('图片生成失败：' + error.message);
          });
          
          app.logger.info('Generator module initialized');
        }
      },
      
      history: {
        async init(app) {
          // 历史管理器无需特殊初始化
          app.logger.info('History module initialized');
        }
      },
      
      analytics: {
        async init(app) {
          // 简单的使用统计
          const startTime = Date.now();
          
          // 记录应用启动
          window.addEventListener('beforeunload', () => {
            const sessionTime = Date.now() - startTime;
            console.log(`Session time: ${sessionTime}ms`);
          });
          
          app.logger.info('Analytics module initialized');
        }
      }
    };
    
    // 注册所有模块
    Object.entries(modules).forEach(([name, module]) => {
      app.registerModule(name, module);
    });
    
    // 设置全局事件处理
    setupGlobalHandlers(app);
    
    // 设置快捷键
    setupKeyboardShortcuts(app);
    
    // 设置按钮事件
    setupButtonEvents(app);
    
    // 初始化应用
    await app.initialize();
    
    // 显示初始化完成
    app.logger.info('Application initialized successfully');
    
  } catch (error) {
    console.error('Application initialization failed:', error);
    
    // 显示错误信息
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #f44336;
      color: white;
      padding: 20px;
      border-radius: 8px;
      z-index: 10000;
      max-width: 400px;
      text-align: center;
    `;
    errorDiv.innerHTML = `
      <h3>应用初始化失败</h3>
      <p>${error.message}</p>
      <button onclick="location.reload()" style="
        background: white;
        color: #f44336;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
      ">重新加载</button>
    `;
    document.body.appendChild(errorDiv);
  }
})();

// =============================================================================
// 全局事件处理设置
// =============================================================================

function setupGlobalHandlers(app) {
  // 页面卸载前保存配置
  window.addEventListener('beforeunload', () => {
    app.getService('config').save();
  });
  
  // 页面可见性变化时保存配置
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      app.getService('config').save();
    }
  });
  
  // 全局错误处理
  window.addEventListener('error', (e) => {
    app.logger.error('Global error:', e.error);
    app.getService('notification').error('应用遇到错误，请刷新页面重试');
  });
  
  // 未处理的Promise拒绝
  window.addEventListener('unhandledrejection', (e) => {
    app.logger.error('Unhandled promise rejection:', e.reason);
    app.getService('notification').error('操作失败，请重试');
  });
  
  // 网络状态变化
  if ('onLine' in navigator) {
    window.addEventListener('online', () => {
      app.getService('notification').success('网络连接已恢复', { duration: 2000 });
    });
    
    window.addEventListener('offline', () => {
      app.getService('notification').warning('网络连接已断开，功能可能受限', { duration: 3000 });
    });
  }
}

// =============================================================================
// 快捷键设置
// =============================================================================

function setupKeyboardShortcuts(app) {
  document.addEventListener('keydown', (e) => {
    // 避免在输入框中触发快捷键
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
      return;
    }
    
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          generateImage(app);
          break;
        case 'c':
          if (e.shiftKey) {
            e.preventDefault();
            copyToClipboard(app);
          }
          break;
        case 'r':
          if (e.shiftKey) {
            e.preventDefault();
            resetSettings(app);
          }
          break;
        case 'e':
          e.preventDefault();
          exportConfig(app);
          break;
        case 'h':
          e.preventDefault();
          toggleHistory(app);
          break;
      }
    }
  });
}

// =============================================================================
// 按钮事件设置
// =============================================================================

function setupButtonEvents(app) {
  // 生成按钮
  const generateBtn = Utils.$('#generate-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => generateImage(app));
  }
  
  // 复制按钮
  const copyBtn = Utils.$('#copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => copyToClipboard(app));
  }
  
  // 重置按钮
  const resetBtn = Utils.$('#reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => resetSettings(app));
  }
  
  // 历史记录按钮
  const historyBtn = Utils.$('#history-btn');
  if (historyBtn) {
    historyBtn.addEventListener('click', () => toggleHistory(app));
  }
  
  // 导出配置按钮
  const exportConfigBtn = Utils.$('#export-config-btn');
  if (exportConfigBtn) {
    exportConfigBtn.addEventListener('click', () => exportConfig(app));
  }
  
  // 导入配置按钮
  const importConfigBtn = Utils.$('#import-config');
  if (importConfigBtn) {
    importConfigBtn.addEventListener('change', (e) => importConfig(app, e.target.files[0]));
  }
  
  // 全屏按钮
  const fullscreenBtn = Utils.$('#fullscreen-btn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullscreen);
  }
  
  // 预设按钮
  const presetBtns = Utils.$$('.preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      applyPreset(app, preset);
    });
  });
}

// =============================================================================
// 功能函数
// =============================================================================

async function generateImage(app) {
  try {
    const generator = app.getService('generator');
    const result = await generator.generate();
    generator.download(result);
  } catch (error) {
    app.logger.error('Generate image failed:', error);
    app.getService('notification').error('图片生成失败：' + error.message);
  }
}

async function copyToClipboard(app) {
  try {
    const generator = app.getService('generator');
    const result = await generator.generate();
    await generator.copyToClipboard(result);
  } catch (error) {
    app.logger.error('Copy to clipboard failed:', error);
    app.getService('notification').error('复制失败：' + error.message);
  }
}

function resetSettings(app) {
  if (confirm('确定要重置所有设置吗？这将清除当前的所有配置。')) {
    app.getService('config').reset();
    app.getService('notification').info('设置已重置');
    location.reload(); // 重新加载页面以应用重置
  }
}

function exportConfig(app) {
  app.getService('config').export();
  app.getService('notification').success('配置已导出');
}

async function importConfig(app, file) {
  if (!file) return;
  
  try {
    await app.getService('config').import(file);
    app.getService('notification').success('配置已导入');
    setTimeout(() => location.reload(), 1000);
  } catch (error) {
    app.logger.error('Import config failed:', error);
    app.getService('notification').error('配置导入失败：' + error.message);
  }
}

function toggleHistory(app) {
  const historyPanel = Utils.$('#history-panel');
  const historyBtn = Utils.$('#history-btn');
  
  if (historyPanel && historyBtn) {
    const isVisible = historyPanel.style.display !== 'none';
    historyPanel.style.display = isVisible ? 'none' : 'block';
    historyBtn.innerHTML = isVisible ? 
      '<span>📚 历史记录</span>' : 
      '<span>📚 隐藏历史</span>';
    
    if (!isVisible) {
      renderHistory(app);
    }
  }
}

function renderHistory(app) {
  const historyList = Utils.$('#history-list');
  if (!historyList) return;
  
  const history = app.getService('history').getAll();
  
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
        <div class="history-item-text">${item.content.substring(0, 100)}${item.content.length > 100 ? '...' : ''}</div>
        <div class="history-item-meta">
          <span>${date}</span>
          <button class="history-item-delete" data-id="${item.id}">删除</button>
        </div>
      </div>
    `;
  }).join('');
  
  historyList.innerHTML = html;
  
  // 绑定事件
  historyList.addEventListener('click', (e) => {
    const historyItem = e.target.closest('.history-item');
    const deleteBtn = e.target.closest('.history-item-delete');
    
    if (deleteBtn) {
      e.stopPropagation();
      const id = deleteBtn.dataset.id;
      app.getService('history').remove(id);
      renderHistory(app);
    } else if (historyItem) {
      const id = historyItem.dataset.id;
      app.getService('history').restore(id);
    }
  });
}

function toggleFullscreen() {
  const previewCard = Utils.$('.preview-card');
  if (!previewCard) return;
  
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    previewCard.requestFullscreen().catch(() => {
      console.warn('Fullscreen not supported');
    });
  }
}

function applyPreset(app, presetName) {
  const presets = {
    social: {
      'style.fontSize': 18,
      'style.lineHeight': 1.6,
      'style.cardWidth': 800,
      'style.contentPadding': 40,
      'template.current': 'template-default'
    },
    blog: {
      'style.fontSize': 16,
      'style.lineHeight': 1.8,
      'style.cardWidth': 900,
      'style.contentPadding': 48,
      'template.current': 'template-letter'
    },
    quote: {
      'style.fontSize': 24,
      'style.lineHeight': 1.5,
      'style.cardWidth': 800,
      'style.contentPadding': 60,
      'template.current': 'template-magazine'
    },
    code: {
      'style.fontSize': 14,
      'style.lineHeight': 1.6,
      'style.cardWidth': 1000,
      'style.contentPadding': 32,
      'template.current': 'template-code'
    }
  };
  
  const preset = presets[presetName];
  if (preset) {
    const config = app.getService('config');
    Object.entries(preset).forEach(([key, value]) => {
      config.set(key, value);
    });
    
    app.getService('notification').success(`已应用"${presetName}"预设`);
    
    // 刷新页面以应用预设
    setTimeout(() => location.reload(), 500);
  }
}

// 导出调试接口
if (typeof window.DEBUG !== 'undefined') {
  window.DEBUG.generateImage = () => generateImage(window.TextToImageApp);
  window.DEBUG.copyToClipboard = () => copyToClipboard(window.TextToImageApp);
  window.DEBUG.resetSettings = () => resetSettings(window.TextToImageApp);
}