/* ============================================
   TextCard - 图片导出模块
   负责html2canvas导出功能
   ============================================ */

/**
 * 导出图片
 * @param {number} scale - 缩放比例 (1, 2, 3)
 */
async function exportImage(scale = 2) {
    const preview = document.getElementById('preview');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    if (!preview || typeof html2canvas === 'undefined') {
        alert('导出失败：缺少必要组件');
        return;
    }
    
    // 显示加载动画
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.classList.add('flex');
    }
    
    try {
        // 配置html2canvas
        const canvas = await html2canvas(preview, {
            scale: scale,
            backgroundColor: null,
            logging: false,
            useCORS: true,
            allowTaint: true,
            // 提高渲染质量
            imageTimeout: 0,
            removeContainer: true
        });
        
        // 转换为图片并下载
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        link.download = `textcard_${timestamp}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        
    } catch (error) {
        console.error('导出失败:', error);
        alert('导出失败，请重试');
    } finally {
        // 隐藏加载动画
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            loadingOverlay.classList.remove('flex');
        }
    }
}

/**
 * 导出为Blob（用于上传等场景）
 * @param {number} scale - 缩放比例
 * @returns {Promise<Blob>} 图片Blob
 */
async function exportAsBlob(scale = 2) {
    const preview = document.getElementById('preview');
    
    if (!preview || typeof html2canvas === 'undefined') {
        throw new Error('缺少必要组件');
    }
    
    const canvas = await html2canvas(preview, {
        scale: scale,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true
    });
    
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Blob转换失败'));
            }
        }, 'image/png', 1.0);
    });
}

/**
 * 复制图片到剪贴板
 * @param {number} scale - 缩放比例
 */
async function copyToClipboard(scale = 2) {
    try {
        const blob = await exportAsBlob(scale);
        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]);
        alert('图片已复制到剪贴板');
    } catch (error) {
        console.error('复制失败:', error);
        alert('复制失败，请尝试导出下载');
    }
}

// 导出函数
window.exportImage = exportImage;
window.exportAsBlob = exportAsBlob;
window.copyToClipboard = copyToClipboard;
