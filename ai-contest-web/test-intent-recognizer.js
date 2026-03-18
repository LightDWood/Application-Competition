/**
 * 意图识别修复验证测试
 * 测试 BUG-IR-001 和 BUG-IR-002 的修复效果
 */

import { recognizeIntent } from './server/services/intentRecognizer.js';

// 测试用例
const testCases = [
  // QA 意图测试
  {
    category: 'QA 意图',
    tests: [
      { input: '你用的是什么模型？', expected: 'QA', description: '模型询问' },
      { input: '你有什么能力？', expected: 'QA', description: '能力询问（修复点）' },
      { input: '你能做什么？', expected: 'QA', description: '功能询问（修复点）' },
      { input: '介绍一下你自己', expected: 'QA', description: '自我介绍（修复点）' },
      { input: '你会什么？', expected: 'QA', description: '技能询问（修复点）' },
      { input: '为什么选择你？', expected: 'QA', description: '原因询问' },
      { input: '如何使用该功能？', expected: 'QA', description: '使用方法' },
      { input: '你的功能是什么？', expected: 'QA', description: '功能说明（修复点）' },
    ]
  },
  
  // REQUIREMENT 意图测试
  {
    category: 'REQUIREMENT 意图',
    tests: [
      { input: '我要做一个合同审查系统', expected: 'REQUIREMENT', description: '标准需求表达' },
      { input: '我想做一个咨询订阅的工具', expected: 'REQUIREMENT', description: '咨询工具（修复点）' },
      { input: '我需要一个电商小程序', expected: 'REQUIREMENT', description: '小程序（修复点）' },
      { input: '帮我弄个网站', expected: 'REQUIREMENT', description: '口语化表达（修复点）' },
      { input: '搞个 APP', expected: 'REQUIREMENT', description: '口语化表达（修复点）' },
      { input: '整个系统', expected: 'REQUIREMENT', description: '口语化表达（修复点）' },
      { input: '想要一个 CRM 系统', expected: 'REQUIREMENT', description: '管理系统（修复点）' },
      { input: '开发一个管理平台', expected: 'REQUIREMENT', description: '管理平台（修复点）' },
      { input: '创建一个订阅工具', expected: 'REQUIREMENT', description: '订阅工具（修复点）' },
    ]
  },
  
  // CHAT 意图测试
  {
    category: 'CHAT 意图',
    tests: [
      { input: '你好', expected: 'CHAT', description: '问候' },
      { input: '在吗', expected: 'CHAT', description: '打招呼' },
      { input: '今天天气不错', expected: 'CHAT', description: '闲聊' },
      { input: '谢谢', expected: 'CHAT', description: '感谢' },
    ]
  }
];

// 运行测试
console.log('🧪 意图识别修复验证测试\n');
console.log('='.repeat(70));

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

for (const category of testCases) {
  console.log(`\n📋 ${category.category}\n`);
  
  for (const test of category.tests) {
    totalTests++;
    const result = recognizeIntent(test.input);
    const passed = result.type === test.expected;
    
    if (passed) {
      passedTests++;
      console.log(`  ✅ ${test.description}`);
      console.log(`     输入："${test.input}"`);
      console.log(`     识别：${result.type} (置信度：${result.confidence})\n`);
    } else {
      failedTests.push({
        category: category.category,
        ...test,
        actual: result.type
      });
      console.log(`  ❌ ${test.description}`);
      console.log(`     输入："${test.input}"`);
      console.log(`     期望：${test.expected}, 实际：${result.type}\n`);
    }
  }
  
  console.log('-'.repeat(70));
}

// 汇总报告
console.log('\n📊 测试汇总报告\n');
console.log('='.repeat(70));
console.log(`总测试数：${totalTests}`);
console.log(`通过：${passedTests} ✅`);
console.log(`失败：${failedTests.length} ❌`);
console.log(`通过率：${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

if (failedTests.length > 0) {
  console.log('❌ 失败用例详情:\n');
  for (const test of failedTests) {
    console.log(`  ${test.category} - ${test.description}`);
    console.log(`    输入："${test.input}"`);
    console.log(`    期望：${test.expected}, 实际：${test.actual}\n`);
  }
} else {
  console.log('🎉 所有测试通过！意图识别修复成功！\n');
}

console.log('='.repeat(70));
