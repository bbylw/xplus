/* ============================================
   TextCard - 数据存储模块
   负责LocalStorage数据持久化
   ============================================ */

const STORAGE_KEY = 'textcard_settings';

/**
 * 默认设置
 */
const defaultSettings = {
    template: 'minimal',
    fontSize: 16,
    watermark: {
        enabled: false,
        text: '',
        logo: null
    },
    lastContent: ''
};

/**
 * 保存设置到LocalStorage
 */
function saveSettings() {
    const settings = {
        template: getCurrentTemplate()?.id || 'minimal',
        fontSize: document.getElementById('font-size')?.value || 16,
        watermark: {
            enabled: document.getElementById('watermark-toggle')?.checked || false,
            text: document.getElementById('watermark-text')?.value || '',
            logo: getWatermarkLogo()
        },
        lastContent: document.getElementById('editor')?.value || ''
    };
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        console.warn('保存设置失败:', e);
    }
}

/**
 * 从LocalStorage加载设置
 * @returns {Object} 设置对象
 */
function loadSettings() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return { ...defaultSettings, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.warn('加载设置失败:', e);
    }
    return defaultSettings;
}

/**
 * 应用设置到UI
 */
function applySettings() {
    const settings = loadSettings();
    
    // 应用模板
    if (settings.template) {
        selectTemplate(settings.template);
    }
    
    // 应用字体大小
    const fontSizeSelect = document.getElementById('font-size');
    if (fontSizeSelect && settings.fontSize) {
        fontSizeSelect.value = settings.fontSize;
    }
    
    // 应用水印设置
    const watermarkToggle = document.getElementById('watermark-toggle');
    const watermarkSettings = document.getElementById('watermark-settings');
    const watermarkText = document.getElementById('watermark-text');
    const watermarkDisplay = document.getElementById('watermark-display');
    const cardWatermark = document.getElementById('card-watermark');
    
    if (settings.watermark) {
        if (watermarkToggle) {
            watermarkToggle.checked = settings.watermark.enabled;
        }
        if (watermarkSettings) {
            watermarkSettings.classList.toggle('hidden', !settings.watermark.enabled);
        }
        if (watermarkText && settings.watermark.text) {
            watermarkText.value = settings.watermark.text;
        }
        if (watermarkDisplay && settings.watermark.text) {
            watermarkDisplay.textContent = settings.watermark.text;
        }
        if (cardWatermark) {
            cardWatermark.classList.toggle('hidden', !settings.watermark.enabled);
        }
        
        // 加载Logo
        if (settings.watermark.logo) {
            loadWatermarkLogo(settings.watermark.logo);
        }
    }
    
    // 应用上次内容
    const editor = document.getElementById('editor');
    if (editor && settings.lastContent) {
        editor.value = settings.lastContent;
        // 触发渲染
        if (typeof renderMarkdown === 'function') {
            renderMarkdown(settings.lastContent, { fontSize: settings.fontSize });
        }
        // 更新字数统计
        if (typeof updateWordCount === 'function') {
            updateWordCount(settings.lastContent);
        }
    }
}

/**
 * 存储的水印Logo（base64）
 */
let storedLogo = null;

/**
 * 设置水印Logo
 * @param {string} base64 - Logo的base64数据
 */
function setWatermarkLogo(base64) {
    storedLogo = base64;
    saveSettings();
}

/**
 * 获取水印Logo
 * @returns {string|null} Logo的base64数据
 */
function getWatermarkLogo() {
    return storedLogo;
}

/**
 * 加载水印Logo到UI
 * @param {string} base64 - Logo的base64数据
 */
function loadWatermarkLogo(base64) {
    const cardWatermark = document.getElementById('card-watermark');
    if (!cardWatermark) return;
    
    // 创建Logo图片元素
    let logoImg = cardWatermark.querySelector('img');
    if (!logoImg) {
        logoImg = document.createElement('img');
        const watermarkDisplay = document.getElementById('watermark-display');
        cardWatermark.insertBefore(logoImg, watermarkDisplay);
    }
    
    logoImg.src = base64;
    storedLogo = base64;
}

/**
 * 清除设置
 */
function clearSettings() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        storedLogo = null;
    } catch (e) {
        console.warn('清除设置失败:', e);
    }
}

// 导出函数
window.saveSettings = saveSettings;
window.loadSettings = loadSettings;
window.applySettings = applySettings;
window.setWatermarkLogo = setWatermarkLogo;
window.getWatermarkLogo = getWatermarkLogo;
window.loadWatermarkLogo = loadWatermarkLogo;
window.clearSettings = clearSettings;
