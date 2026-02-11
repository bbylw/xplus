/* ============================================
   TextCard - 模板管理模块
   负责模板定义、切换和样式应用
   ============================================ */

// 模板配置
const templates = [
    {
        id: 'minimal',
        name: '极简',
        description: '干净利落，突出内容',
        class: 'template-minimal'
    },
    {
        id: 'dark',
        name: '暗黑',
        description: '深邃神秘，科技感',
        class: 'template-dark'
    },
    {
        id: 'business',
        name: '商务',
        description: '专业稳重，信任感',
        class: 'template-business'
    },
    {
        id: 'literary',
        name: '文艺',
        description: '温柔雅致，诗意',
        class: 'template-literary'
    },
    {
        id: 'tech',
        name: '科技',
        description: '未来科技，赛博',
        class: 'template-tech'
    }
];

// 当前选中的模板
let currentTemplate = templates[0];

/**
 * 初始化模板选择器
 */
function initTemplates() {
    const templateGrid = document.getElementById('template-grid');
    if (!templateGrid) return;
    
    // 渲染模板卡片
    templates.forEach((template, index) => {
        const card = document.createElement('div');
        card.className = `template-card ${index === 0 ? 'active' : ''}`;
        card.setAttribute('data-template', template.id);
        card.setAttribute('data-name', template.name);
        card.setAttribute('title', template.description);
        
        // 点击切换模板
        card.addEventListener('click', () => selectTemplate(template.id));
        
        templateGrid.appendChild(card);
    });
}

/**
 * 选择模板
 * @param {string} templateId - 模板ID
 */
function selectTemplate(templateId) {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    currentTemplate = template;
    
    // 更新UI
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.toggle('active', card.dataset.template === templateId);
    });
    
    // 应用模板样式到预览区
    const preview = document.getElementById('preview');
    if (preview) {
        // 移除所有模板类
        templates.forEach(t => preview.classList.remove(t.class));
        // 添加当前模板类
        preview.classList.add(template.class);
    }
    
    // 保存设置
    saveSettings();
}

/**
 * 获取当前模板
 * @returns {Object} 当前模板对象
 */
function getCurrentTemplate() {
    return currentTemplate;
}

/**
 * 根据ID获取模板
 * @param {string} templateId - 模板ID
 * @returns {Object|undefined} 模板对象
 */
function getTemplateById(templateId) {
    return templates.find(t => t.id === templateId);
}

// 导出函数
window.initTemplates = initTemplates;
window.selectTemplate = selectTemplate;
window.getCurrentTemplate = getCurrentTemplate;
window.getTemplateById = getTemplateById;
