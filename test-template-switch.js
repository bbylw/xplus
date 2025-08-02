// 模板切换功能测试脚本
// 在浏览器控制台中运行此脚本来测试模板切换功能

console.log('=== 模板切换功能测试 ===');

// 1. 检查必要的元素是否存在
const templateSelect = document.getElementById('template');
const captureArea = document.getElementById('capture-area');

if (!templateSelect) {
    console.error('❌ 模板选择器未找到');
} else {
    console.log('✅ 模板选择器已找到');
}

if (!captureArea) {
    console.error('❌ 捕获区域未找到');
} else {
    console.log('✅ 捕获区域已找到');
    console.log('当前CSS类:', captureArea.className);
}

// 2. 测试模板切换功能
function testTemplateSwitch(templateValue) {
    console.log(`\n--- 测试切换到: ${templateValue} ---`);
    
    // 模拟用户选择
    templateSelect.value = templateValue;
    
    // 触发change事件
    const changeEvent = new Event('change', { bubbles: true });
    templateSelect.dispatchEvent(changeEvent);
    
    // 检查结果
    setTimeout(() => {
        console.log('切换后CSS类:', captureArea.className);
        console.log('是否包含目标模板类:', captureArea.classList.contains(templateValue));
    }, 100);
}

// 3. 执行测试
console.log('\n=== 开始测试各个模板 ===');
const testTemplates = [
    'template-default',
    'template-code', 
    'template-letter',
    'template-neon',
    'template-glass'
];

testTemplates.forEach((template, index) => {
    setTimeout(() => testTemplateSwitch(template), index * 200);
});

console.log('\n=== 测试脚本已启动，请查看控制台输出 ===');