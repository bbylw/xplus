/* ============================================
   TextCard - Markdown解析模块
   负责Markdown解析和渲染
   ============================================ */

// 配置 marked
if (typeof marked !== 'undefined') {
    marked.setOptions({
        breaks: true,          // 支持换行
        gfm: true,             // GitHub Flavored Markdown
        headerIds: false,      // 不生成header id
        mangle: false,         // 不混淆邮箱
        highlight: function(code, lang) {
            // 代码高亮
            if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (e) {}
            }
            return code;
        }
    });
}

/**
 * 解析Markdown文本
 * @param {string} markdown - Markdown文本
 * @returns {Object} 解析结果 { title, body }
 */
function parseMarkdown(markdown) {
    if (!markdown || typeof marked === 'undefined') {
        return { title: '', body: markdown || '' };
    }
    
    const lines = markdown.trim().split('\n');
    let title = '';
    let bodyStartIndex = 0;
    
    // 提取第一个标题作为卡片标题
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // 匹配 # 标题
        if (line.startsWith('# ')) {
            title = line.substring(2).trim();
            bodyStartIndex = i + 1;
            break;
        }
        
        // 如果第一行不是标题，使用第一行作为标题（如果不太长）
        if (i === 0 && line.length > 0 && line.length < 50) {
            title = line;
            bodyStartIndex = 1;
        } else if (i === 0) {
            // 第一行太长，不作为标题
            bodyStartIndex = 0;
        }
    }
    
    // 剩余部分作为正文
    const bodyMarkdown = lines.slice(bodyStartIndex).join('\n');
    const body = marked.parse(bodyMarkdown);
    
    return { title, body };
}

/**
 * 渲染Markdown到预览区
 * @param {string} markdown - Markdown文本
 * @param {Object} options - 渲染选项
 */
function renderMarkdown(markdown, options = {}) {
    const titleElement = document.getElementById('card-title');
    const bodyElement = document.getElementById('card-body');
    
    if (!titleElement || !bodyElement) return;
    
    const { title, body } = parseMarkdown(markdown);
    
    // 应用字体大小
    const fontSize = options.fontSize || 16;
    bodyElement.style.fontSize = `${fontSize}px`;
    
    // 渲染内容
    if (title) {
        titleElement.innerHTML = title;
        titleElement.style.display = 'block';
    } else {
        titleElement.innerHTML = '';
        titleElement.style.display = 'none';
    }
    
    bodyElement.innerHTML = body || '';
    
    // 代码块高亮（marked已经处理了highlight，这里处理未指定语言的代码块）
    if (typeof hljs !== 'undefined') {
        bodyElement.querySelectorAll('pre code').forEach((block) => {
            if (!block.classList.contains('hljs')) {
                hljs.highlightElement(block);
            }
        });
    }
}

/**
 * 统计文本字数
 * @param {string} text - 文本内容
 * @returns {number} 字数
 */
function countWords(text) {
    if (!text) return 0;
    
    // 移除Markdown标记
    const plainText = text
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*|__/g, '')
        .replace(/\*|_/g, '')
        .replace(/`{1,3}/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
        .replace(/^>\s/gm, '')
        .replace(/^[-*+]\s/gm, '')
        .replace(/^\d+\.\s/gm, '')
        .replace(/\n/g, '')
        .trim();
    
    // 中文字符 + 英文单词
    const chineseChars = (plainText.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (plainText.match(/[a-zA-Z]+/g) || []).length;
    
    return chineseChars + englishWords;
}

// 导出函数
window.parseMarkdown = parseMarkdown;
window.renderMarkdown = renderMarkdown;
window.countWords = countWords;
