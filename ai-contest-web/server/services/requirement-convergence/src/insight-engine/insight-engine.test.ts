/**
 * 智能需求洞察引擎 - 单元测试文件
 * 
 * 使用方法:
 * 1. 安装 ts-node: npm install -g ts-node
 * 2. 运行测试：ts-node insight-engine.test.ts
 */

import {
  analyzeRequirement,
  evaluateCompleteness,
  analyzeRisks,
  discoverDependencies,
  generateRecommendations,
  type CompletenessResult,
  type RiskWarningResult,
  type DependencyResult,
  type RecommendationResult
} from './insight-engine';

// ==================== 测试工具函数 ====================

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ ${message}`);
    failedTests++;
  }
}

function assertEquals<T>(actual: T, expected: T, message: string): void {
  if (actual === expected) {
    console.log(`  ✓ ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ ${message}`);
    console.error(`    期望：${expected}, 实际：${actual}`);
    failedTests++;
  }
}

function assertTrue(condition: boolean, message: string): void {
  assert(condition, message);
}

function assertFalse(condition: boolean, message: string): void {
  assert(!condition, message);
}

// ==================== 测试用例 ====================

/**
 * 测试 SubTask 1.1: 完整性评估算法
 */
function testCompletenessEvaluation(): void {
  console.log('\n=== 测试 SubTask 1.1: 完整性评估算法 ===\n');
  
  // 测试用例 1.1.1: 完整的需求应该获得高分
  console.log('测试 1.1.1: 完整需求的评分');
  const completeReq = '为了提升用户体验 (Why)，我们需要为企业管理员 (Who) 在 PC 端 (Where) 实现一个用户管理模块 (What)。' +
    '通过 React 框架 (How) 在 2026 年 Q2 前完成 (When)，预算 5 万元 (How Much)。';
  const result1 = evaluateCompleteness(completeReq);
  
  assertTrue(result1.score.totalScore > 50, '综合评分应该大于 50 分');
  assertTrue(result1.score.who > 0, 'Who 维度应该有分数');
  assertTrue(result1.score.what > 0, 'What 维度应该有分数');
  assertTrue(result1.score.why > 0, 'Why 维度应该有分数');
  assertTrue(result1.score.when > 0, 'When 维度应该有分数');
  assertTrue(result1.score.where > 0, 'Where 维度应该有分数');
  assertTrue(result1.score.how > 0, 'How 维度应该有分数');
  assertTrue(result1.score.howMuch > 0, 'How Much 维度应该有分数');
  assertEquals(result1.missingElements.length, 0, '完整需求不应该有缺失要素');
  
  // 测试用例 1.1.2: 不完整的需求应该识别缺失项
  console.log('\n测试 1.1.2: 不完整需求的识别');
  const incompleteReq = '需要一个功能';
  const result2 = evaluateCompleteness(incompleteReq);
  
  assertTrue(result2.score.totalScore < 50, '不完整需求评分应该较低');
  assertTrue(result2.missingElements.length > 0, '应该识别出缺失要素');
  assertTrue(result2.suggestions.length > 0, '应该提供改进建议');
  
  // 测试用例 1.1.3: 5W2H 各维度独立评分
  console.log('\n测试 1.1.3: 各维度独立评分');
  const whoOnlyReq = '管理员需要使用系统';
  const result3 = evaluateCompleteness(whoOnlyReq);
  
  assertTrue(result3.score.who > result3.score.when, 'Who 维度分数应该高于 When 维度');
  assertTrue(result3.score.who > result3.score.howMuch, 'Who 维度分数应该高于 How Much 维度');
  
  console.log('\n✓ SubTask 1.1 测试完成\n');
}

/**
 * 测试 SubTask 1.2: 风险预警模块
 */
function testRiskWarning(): void {
  console.log('\n=== 测试 SubTask 1.2: 风险预警模块 ===\n');
  
  // 测试用例 1.2.1: 模糊词汇检测
  console.log('测试 1.2.1: 模糊词汇检测');
  const vagueReq = '这个功能大概需要快速完成，应该要友好一些';
  const result1 = analyzeRisks(vagueReq);
  
  assertTrue(result1.risks.length > 0, '应该检测到风险');
  assertTrue(result1.risks.some(r => r.type === 'vague'), '应该包含模糊词汇风险');
  assertTrue(
    result1.risks.some(r => r.description.includes('大概') || r.description.includes('快速')),
    '应该检测到具体的模糊词汇'
  );
  
  // 测试用例 1.2.2: 冲突检测
  console.log('\n测试 1.2.2: 冲突检测');
  const conflictReq = '需要快速实现高质量的功能，同时保持低成本和高性能';
  const result2 = analyzeRisks(conflictReq);
  
  assertTrue(result2.risks.some(r => r.type === 'conflict'), '应该检测到冲突风险');
  assertTrue(result2.overallRiskLevel === 'high', '包含高风险时整体风险应该是 high');
  
  // 测试用例 1.2.3: 无风险需求
  console.log('\n测试 1.2.3: 无风险需求检测');
  const clearReq = '使用 Java 语言开发用户管理模块，支持增删改查功能';
  const result3 = analyzeRisks(clearReq);
  
  // 这个需求相对清晰，风险应该较少
  console.log(`  检测到 ${result3.risks.length} 个风险`);
  
  // 测试用例 1.2.4: 风险等级统计
  console.log('\n测试 1.2.4: 风险等级统计');
  assertTrue(
    result1.riskCount.high + result1.riskCount.medium + result1.riskCount.low === result1.risks.length,
    '各级别风险数量之和应该等于总风险数'
  );
  
  console.log('\n✓ SubTask 1.2 测试完成\n');
}

/**
 * 测试 SubTask 1.3: 依赖发现引擎
 */
function testDependencyDiscovery(): void {
  console.log('\n=== 测试 SubTask 1.3: 依赖发现引擎 ===\n');
  
  // 测试用例 1.3.1: 外部系统识别
  console.log('测试 1.3.1: 外部系统识别');
  const extSysReq = '需要集成微信支付 API 和支付宝支付，对接短信服务';
  const result1 = discoverDependencies(extSysReq);
  
  assertTrue(result1.externalSystems.length > 0, '应该识别到外部系统');
  assertTrue(
    result1.externalSystems.some(e => e.name.includes('微信') || e.name.includes('支付')),
    '应该识别到微信支付相关系统'
  );
  
  // 测试用例 1.3.2: 数据源识别
  console.log('\n测试 1.3.2: 数据源识别');
  const dataReq = '需要从 MySQL 数据库读取用户数据，导出为 Excel 文件';
  const result2 = discoverDependencies(dataReq);
  
  assertTrue(result2.dataSources.length > 0, '应该识别到数据源');
  assertTrue(
    result2.dataSources.some(d => d.name.includes('MySQL') || d.name.includes('数据库')),
    '应该识别到 MySQL 数据库'
  );
  
  // 测试用例 1.3.3: 前置条件识别
  console.log('\n测试 1.3.3: 前置条件识别');
  const precondReq = '在完成用户认证之前，需要先配置好数据库连接';
  const result3 = discoverDependencies(precondReq);
  
  assertTrue(result3.preconditions.length > 0, '应该识别到前置条件');
  
  // 测试用例 1.3.4: 后置依赖识别
  console.log('\n测试 1.3.4: 后置依赖识别');
  const postcondReq = '功能开发完成后，需要进行测试和部署';
  const result4 = discoverDependencies(postcondReq);
  
  assertTrue(result4.postconditions.length > 0, '应该识别到后置依赖');
  
  // 测试用例 1.3.5: 综合依赖识别
  console.log('\n测试 1.3.5: 综合依赖识别');
  const complexReq = '需要集成微信支付 API，先从 MySQL 读取数据，完成后发送邮件通知';
  const result5 = discoverDependencies(complexReq);
  
  assertTrue(result5.dependencies.length >= 3, '应该识别到多个依赖');
  assertTrue(result5.externalSystems.length > 0, '应该包含外部系统');
  assertTrue(result5.dataSources.length > 0, '应该包含数据源');
  assertTrue(result5.postconditions.length > 0, '应该包含后置条件');
  
  console.log('\n✓ SubTask 1.3 测试完成\n');
}

/**
 * 测试 SubTask 1.4: 智能推荐系统
 */
function testRecommendation(): void {
  console.log('\n=== 测试 SubTask 1.4: 智能推荐系统 ===\n');
  
  // 测试用例 1.4.1: 用户相关需求推荐
  console.log('测试 1.4.1: 用户相关需求推荐');
  const userReq = '需要实现用户注册和登录功能，支持手机号验证';
  const result1 = generateRecommendations(userReq);
  
  assertTrue(result1.recommendations.length > 0, '应该有推荐需求');
  assertTrue(
    result1.recommendations.some(r => r.title.includes('用户') || r.title.includes('注册')),
    '应该推荐用户相关的历史需求'
  );
  
  // 测试用例 1.4.2: 最佳实践推荐
  console.log('\n测试 1.4.2: 最佳实践推荐');
  assertTrue(result1.bestPractices.length > 0, '应该提供最佳实践建议');
  console.log(`  推荐了 ${result1.bestPractices.length} 条最佳实践`);
  
  // 测试用例 1.4.3: 支付相关需求推荐
  console.log('\n测试 1.4.3: 支付相关需求推荐');
  const paymentReq = '需要集成支付功能，支持微信和支付宝';
  const result2 = generateRecommendations(paymentReq);
  
  assertTrue(
    result2.recommendations.some(r => r.title.includes('支付')),
    '应该推荐支付相关的历史需求'
  );
  
  // 测试用例 1.4.4: 相似度排序
  console.log('\n测试 1.4.4: 相似度排序');
  if (result1.recommendations.length > 1) {
    const sorted = result1.recommendations.every((rec, index, arr) => 
      index === 0 || arr[index - 1].similarity >= rec.similarity
    );
    assertTrue(sorted, '推荐结果应该按相似度降序排列');
  } else {
    console.log('  只有一个推荐结果，跳过排序测试');
  }
  
  console.log('\n✓ SubTask 1.4 测试完成\n');
}

/**
 * 测试主洞察引擎 API
 */
function testMainAPI(): void {
  console.log('\n=== 测试主洞察引擎 API ===\n');
  
  // 测试用例：完整洞察分析
  console.log('测试：完整洞察分析');
  const requirement = '为了提升转化率 (Why)，我们需要为电商用户 (Who) 在移动端 (Where) ' +
    '实现快速支付功能 (What)。通过集成微信支付和支付宝 (How)，在 3 个月内完成 (When)，' +
    '预算 20 万 (How Much)。需要大概优化用户体验。';
  
  const result = analyzeRequirement(requirement);
  
  // 验证返回结果结构
  assertTrue(result !== undefined, '应该返回洞察结果');
  assertTrue(result.completeness !== undefined, '应该包含完整性评估结果');
  assertTrue(result.riskWarning !== undefined, '应该包含风险预警结果');
  assertTrue(result.dependencies !== undefined, '应该包含依赖发现结果');
  assertTrue(result.recommendations !== undefined, '应该包含智能推荐结果');
  
  // 验证各模块结果
  assertTrue(result.completeness.score.totalScore > 0, '完整性评分应该大于 0');
  assertTrue(result.riskWarning.risks.length > 0, '应该检测到风险（包含"大概"）');
  assertTrue(result.dependencies.dependencies.length > 0, '应该识别到依赖');
  
  console.log(`  完整性评分：${result.completeness.score.totalScore}`);
  console.log(`  风险数量：${result.riskWarning.risks.length}`);
  console.log(`  依赖数量：${result.dependencies.dependencies.length}`);
  console.log(`  推荐数量：${result.recommendations.recommendations.length}`);
  
  console.log('\n✓ 主 API 测试完成\n');
}

/**
 * 边界测试
 */
function testEdgeCases(): void {
  console.log('\n=== 边界测试 ===\n');
  
  // 测试用例：空字符串
  console.log('测试：空字符串输入');
  const emptyResult = analyzeRequirement('');
  assertTrue(emptyResult !== undefined, '空字符串应该返回有效结果');
  
  // 测试用例：超长文本
  console.log('\n测试：超长文本输入');
  const longText = '需要实现功能 '.repeat(1000);
  const longResult = analyzeRequirement(longText);
  assertTrue(longResult !== undefined, '超长文本应该正常处理');
  
  // 测试用例：特殊字符
  console.log('\n测试：特殊字符输入');
  const specialChars = '需要实现功能！@#$%^&*()_+-=[]{}|;:\'",.<>?/';
  const specialResult = analyzeRequirement(specialChars);
  assertTrue(specialResult !== undefined, '特殊字符应该正常处理');
  
  // 测试用例：中英文混合
  console.log('\n测试：中英文混合输入');
  const mixedLang = '需要实现 user management 功能，支持 CRUD 操作';
  const mixedResult = analyzeRequirement(mixedLang);
  assertTrue(mixedResult !== undefined, '中英文混合应该正常处理');
  
  console.log('\n✓ 边界测试完成\n');
}

// ==================== 运行所有测试 ====================

function runAllTests(): void {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║         智能需求洞察引擎 - 单元测试套件                 ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  try {
    testCompletenessEvaluation();
    testRiskWarning();
    testDependencyDiscovery();
    testRecommendation();
    testMainAPI();
    testEdgeCases();
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                      测试统计                          ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`\n  通过：${passedTests}`);
    console.log(`  失败：${failedTests}`);
    console.log(`  总计：${passedTests + failedTests}\n`);
    
    if (failedTests === 0) {
      console.log('✓ 所有测试通过！\n');
    } else {
      console.error(`✗ 有 ${failedTests} 个测试失败，请检查上面的错误信息\n`);
    }
    
  } catch (error) {
    console.error('\n✗ 测试执行出错:', error);
  }
}

// 导出测试运行函数
export { runAllTests };

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  runAllTests();
}
