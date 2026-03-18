/**
 * AI 增强模块使用示例
 * 
 * 本文件演示如何使用 ai-enhancement 模块的各项功能
 */

import {
  detectAmbiguity,
  polishRequirement,
  splitRequirement,
  recommendPriority,
  generateUserStories,
  assessCompleteness,
  identifyRisks,
  discoverDependencies,
} from './ai-enhancement';

/**
 * 示例 1: 歧义检测
 */
export function exampleAmbiguityDetection() {
  const requirement = '我们需要一个快速的登录功能，用户应该能方便地注册账号';

  const result = detectAmbiguity(requirement);

  console.log('=== 歧义检测结果 ===');
  console.log('原始文本:', result.originalText);
  console.log('完整性评分:', result.completenessScore);
  console.log('模糊词汇:', result.ambiguousWords);
  console.log('缺失要素:', result.missingElements);
  console.log('建议澄清的问题:', result.clarificationQuestions);
}

/**
 * 示例 2: 需求润色
 */
export function exampleRequirementPolishing() {
  const requirement = '系统需要快速响应用户请求，大概 1 秒左右，界面要美观友好';

  const result = polishRequirement(requirement);

  console.log('=== 需求润色结果 ===');
  console.log('原始需求:', result.original);
  console.log('润色后:', result.polished);
  console.log('修改说明:', result.changes);
  console.log('质量提升评分:', result.improvementScore);
}

/**
 * 示例 3: 智能拆分需求
 */
export function exampleRequirementSplitting() {
  const requirement = '用户管理系统需要支持用户注册、登录、个人信息管理、密码找回等功能。管理员可以查看用户列表、禁用用户账号、导出用户数据。';

  // 按功能模块拆分
  const functionalSplit = splitRequirement(requirement, 'functional');
  console.log('=== 按功能拆分 ===');
  functionalSplit.forEach(sub => {
    console.log(`- ${sub.title}`);
    console.log(`  描述：${sub.description}`);
    console.log(`  INVEST 检查：${sub.investCheck.overall ? '通过' : '未通过'}`);
  });

  // 按用户角色拆分
  const roleSplit = splitRequirement(requirement, 'role');
  console.log('\n=== 按角色拆分 ===');
  roleSplit.forEach(sub => {
    console.log(`- ${sub.title}`);
    console.log(`  描述：${sub.description}`);
  });
}

/**
 * 示例 4: 优先级推荐
 */
export function examplePriorityRecommendation() {
  const requirements = [
    { id: 'req-1', description: '用户登录功能，支持账号密码登录和手机验证码登录' },
    { id: 'req-2', description: '用户个人信息页面，可以修改头像和昵称' },
    { id: 'req-3', description: '核心支付功能，支持支付宝和微信支付' },
    { id: 'req-4', description: '深色主题切换功能' },
    { id: 'req-5', description: '用户数据安全加密存储，符合 GDPR 合规要求' },
  ];

  const recommendations = recommendPriority(requirements);

  console.log('=== 优先级推荐结果 ===');
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec.description.substring(0, 30)}...`);
    console.log(`   优先级：${rec.moscowPriority.toUpperCase()}`);
    console.log(`   业务价值：${rec.businessValue}/10`);
    console.log(`   实现成本：${rec.implementationCost}/10`);
    console.log(`   风险等级：${rec.riskLevel}/10`);
    console.log(`   理由：${rec.rationale}`);
    console.log('');
  });
}

/**
 * 示例 5: 用户故事生成
 */
export function exampleUserStoryGeneration() {
  const requirement = '作为电商平台，我们需要商品搜索功能，以便用户快速找到想要的商品，提升购物体验。';

  const stories = generateUserStories(requirement);

  console.log('=== 用户故事生成结果 ===');
  stories.forEach((story, index) => {
    console.log(`${index + 1}. ${story.fullStory}`);
    console.log('   验收标准:');
    story.acceptanceCriteria.forEach(criteria => {
      console.log(`   - ${criteria}`);
    });
    console.log('');
  });
}

/**
 * 示例 6: 完整性评估
 */
export function exampleCompletenessAssessment() {
  const requirement = '系统需要支持用户注册功能';

  const result = assessCompleteness(requirement);

  console.log('=== 完整性评估结果 ===');
  console.log('总分:', result.score);
  console.log('维度检查:');
  Object.entries(result.dimensions).forEach(([dim, passed]) => {
    console.log(`  ${dim.toUpperCase()}: ${passed ? '✓' : '✗'}`);
  });
  console.log('改进建议:');
  result.suggestions.forEach(suggestion => {
    console.log(`  - ${suggestion}`);
  });
}

/**
 * 示例 7: 风险预警
 */
export function exampleRiskIdentification() {
  const requirement = '系统需要立即响应用户请求，实现零延迟的完美体验，这需要集成第三方 API';

  const risks = identifyRisks(requirement);

  console.log('=== 风险预警结果 ===');
  risks.forEach(risk => {
    console.log(`类型：${risk.type}`);
    console.log(`等级：${risk.level}`);
    console.log(`描述：${risk.description}`);
    console.log(`建议：${risk.suggestion}`);
    console.log('');
  });
}

/**
 * 示例 8: 依赖发现
 */
export function exampleDependencyDiscovery() {
  const requirement = '用户注册前需要先验证手机号，注册后数据需要存储到数据库，并集成短信 API 发送验证码';

  const dependencies = discoverDependencies(requirement);

  console.log('=== 依赖发现结果 ===');
  dependencies.forEach(dep => {
    console.log(`类型：${dep.type}`);
    console.log(`描述：${dep.description}`);
    console.log(`关键程度：${dep.criticality}`);
    console.log('');
  });
}

/**
 * 综合示例：完整的需求增强流程
 */
export function exampleComprehensiveWorkflow() {
  console.log('========== 完整需求增强流程 ==========\n');

  // 原始需求
  const originalRequirement = '我们需要一个快速友好的用户管理系统，大概需要支持注册、登录、个人信息管理等功能，用户应该能方便地操作';

  console.log('1. 原始需求:');
  console.log(originalRequirement);
  console.log('');

  // 步骤 1: 歧义检测
  console.log('2. 歧义检测:');
  const ambiguity = detectAmbiguity(originalRequirement);
  console.log(`   完整性：${ambiguity.completenessScore}%`);
  console.log(`   模糊词汇：${ambiguity.ambiguousWords.map(w => w.word).join(', ')}`);
  console.log('');

  // 步骤 2: 需求润色
  console.log('3. 需求润色:');
  const polished = polishRequirement(originalRequirement);
  console.log(polished.polished);
  console.log('');

  // 步骤 3: 完整性评估
  console.log('4. 完整性评估:');
  const completeness = assessCompleteness(polished.polished);
  console.log(`   评分：${completeness.score}`);
  console.log('');

  // 步骤 4: 风险识别
  console.log('5. 风险识别:');
  const risks = identifyRisks(polished.polished);
  if (risks.length > 0) {
    risks.forEach(risk => {
      console.log(`   [${risk.level}] ${risk.description}`);
    });
  } else {
    console.log('   无明显风险');
  }
  console.log('');

  // 步骤 5: 需求拆分
  console.log('6. 需求拆分:');
  const splits = splitRequirement(polished.polished, 'functional');
  splits.forEach((sub, index) => {
    console.log(`   ${index + 1}. ${sub.title}`);
  });
  console.log('');

  // 步骤 6: 用户故事生成
  console.log('7. 用户故事生成:');
  const stories = generateUserStories(polished.polished);
  stories.slice(0, 2).forEach(story => {
    console.log(`   ${story.fullStory}`);
  });
  console.log('');

  // 步骤 7: 优先级推荐
  console.log('8. 优先级推荐:');
  const priorityReqs = splits.map(s => ({ id: s.id, description: s.description }));
  const priorities = recommendPriority(priorityReqs);
  priorities.slice(0, 3).forEach((rec, index) => {
    console.log(`   ${index + 1}. [${rec.moscowPriority.toUpperCase()}] ${rec.description.substring(0, 30)}...`);
  });
  console.log('');

  console.log('========== 流程结束 ==========');
}

// 运行示例
if (require.main === module) {
  console.log('AI 增强模块使用示例\n');
  console.log('=====================================\n');

  // 运行综合示例
  exampleComprehensiveWorkflow();
}
