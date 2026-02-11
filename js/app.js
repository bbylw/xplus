/* ============================================
   TextCard - 主应用逻辑
   状态管理和事件绑定
   ============================================ */

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 更新字数统计
function updateWordCount(text) {
    const wordCountElement = document.getElementById('word-count');
    if (wordCountElement) {
        const count = countWords(text);
        wordCountElement.textContent = `${count} 字`;
    }
}

// 更新水印显示
function updateWatermark(text) {
    const watermarkDisplay = document.getElementById('watermark-display');
    if (watermarkDisplay) {
        watermarkDisplay.textContent = text || '@your_id';
    }
}

// 处理编辑器输入（防抖）
const handleEditorInput = debounce((text) => {
    const fontSize = document.getElementById('font-size')?.value || 16;
    renderMarkdown(text, { fontSize: parseInt(fontSize) });
    updateWordCount(text);
    saveSettings();
}, 300);

// 初始化应用
function initApp() {
    // 初始化模板
    initTemplates();
    
    // 获取DOM元素
    const editor = document.getElementById('editor');
    const exportBtn = document.getElementById('export-btn');
    const scaleSelect = document.getElementById('scale-select');
    const watermarkToggle = document.getElementById('watermark-toggle');
    const watermarkSettings = document.getElementById('watermark-settings');
    const watermarkText = document.getElementById('watermark-text');
    const watermarkLogo = document.getElementById('watermark-logo');
    const cardWatermark = document.getElementById('card-watermark');
    const fontSizeSelect = document.getElementById('font-size');
    
    // 编辑器输入事件
    if (editor) {
        editor.addEventListener('input', (e) => {
            handleEditorInput(e.target.value);
        });
    }
    
    // 导出按钮事件
    if (exportBtn && scaleSelect) {
        exportBtn.addEventListener('click', () => {
            const scale = parseInt(scaleSelect.value);
            exportImage(scale);
        });
    }
    
    // 水印开关事件
    if (watermarkToggle && watermarkSettings && cardWatermark) {
        watermarkToggle.addEventListener('change', (e) => {
            watermarkSettings.classList.toggle('hidden', !e.target.checked);
            cardWatermark.classList.toggle('hidden', !e.target.checked);
            saveSettings();
        });
    }
    
    // 水印文本输入事件
    if (watermarkText) {
        watermarkText.addEventListener('input', (e) => {
            updateWatermark(e.target.value);
            saveSettings();
        });
    }
    
    // 水印Logo上传事件
    if (watermarkLogo) {
        watermarkLogo.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target.result;
                    loadWatermarkLogo(base64);
                    
                    // 更新文件名显示
                    const filenameElement = document.getElementById('logo-filename');
                    if (filenameElement) {
                        filenameElement.textContent = file.name;
                    }
                    
                    saveSettings();
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // 字体大小选择事件
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', (e) => {
            const fontSize = parseInt(e.target.value);
            const text = editor?.value || '';
            renderMarkdown(text, { fontSize });
            saveSettings();
        });
    }
    
    // 加载并应用设置
    applySettings();
    
    // 页面关闭前保存
    window.addEventListener('beforeunload', () => {
        saveSettings();
    });
    
    console.log('TextCard 初始化完成');
}

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// 导出函数
window.initApp = initApp;
window.updateWordCount = updateWordCount;
