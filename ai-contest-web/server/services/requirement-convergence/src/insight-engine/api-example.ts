/**
 * 智能需求洞察引擎 - API 使用示例
 * 
 * 本文件展示如何使用 insight-engine 提供的 API
 */

import {
  analyzeRequirement,
  evaluateCompleteness,
  analyzeRisks,
  discoverDependencies,
  generateRecommendations
} from './insight-engine';

// ==================== 示例 1: 完整的需求洞察分析 ====================

function example1FullAnalysis(): void {
  console.log('=== 示例 1: 完整的需求洞察分析 ===\n');
  
  const requirement = `
    为了提升电商平台的转化率 (Why)，我们需要为平台商家 (Who) 
    在 PC 管理后台 (Where) 实现一个批量商品管理功能 (What)。
    
    具体包括：
    - 支持 Excel 导入导出商品数据
    - 批量修改价格、库存、上下架状态
    - 批量设置商品分类和标签
    
    技术方案 (How)：
    - 前端使用 Vue3 + Element Plus
    - 后端使用 Node.js + MySQL
    - 使用异步队列处理大批量操作
    
    时间计划 (When)：
    - 2026 年 4 月完成开发
    - 2026 年 5 月上线
    
    资源预算 (How Much)：
    - 开发人力：2 名前端 + 2 名后端
    - 预算：15 万元
    - 性能要求：支持单次导入 10000 条商品
  `;
  
  const result = analyzeRequirement(requirement);
  
  // 输出完整性评估
  console.log('【完整性评估】');
  console.log(`综合评分：${result.completeness.score.totalScore}/100`);
  console.log('各维度得分:');
  console.log(`  - Who (目标用户): ${result.completeness.score.who}`);
  console.log(`  - What (功能需求): ${result.completeness.score.what}`);
  console.log(`  - Why (业务价值): ${result.completeness.score.why}`);
  console.log(`  - When (时间节点): ${result.completeness.score.when}`);
  console.log(`  - Where (使用场景): ${result.completeness.score.where}`);
  console.log(`  - How (实现方式): ${result.completeness.score.how}`);
  console.log(`  - How Much (成本资源): ${result.completeness.score.howMuch}`);
  
  if (result.completeness.missingElements.length > 0) {
    console.log('\n缺失要素:');
    result.completeness.missingElements.forEach((elem, i) => {
      console.log(`  ${i + 1}. ${elem}`);
    });
  }
  
  if (result.completeness.suggestions.length > 0) {
    console.log('\n改进建议:');
    result.completeness.suggestions.forEach((sug, i) => {
      console.log(`  ${i + 1}. ${sug}`);
    });
  }
  
  // 输出风险预警
  console.log('\n【风险预警】');
  console.log(`整体风险等级：${result.riskWarning.overallRiskLevel.toUpperCase()}`);
  console.log(`高风险：${result.riskWarning.riskCount.high} 个`);
  console.log(`中风险：${result.riskWarning.riskCount.medium} 个`);
  console.log(`低风险：${result.riskWarning.riskCount.low} 个`);
  
  if (result.riskWarning.risks.length > 0) {
    console.log('\n风险详情:');
    result.riskWarning.risks.forEach((risk, i) => {
      console.log(`  ${i + 1}. [${risk.level.toUpperCase()}] ${risk.description}`);
      console.log(`     建议：${risk.suggestion}`);
    });
  }
  
  // 输出依赖发现
  console.log('\n【依赖发现】');
  console.log(`总依赖数：${result.dependencies.dependencies.length}`);
  
  if (result.dependencies.externalSystems.length > 0) {
    console.log('\n外部系统:');
    result.dependencies.externalSystems.forEach((sys, i) => {
      console.log(`  ${i + 1}. ${sys.name} ${sys.isRequired ? '(必需)' : '(可选)'}`);
    });
  }
  
  if (result.dependencies.dataSources.length > 0) {
    console.log('\n数据源:');
    result.dependencies.dataSources.forEach((ds, i) => {
      console.log(`  ${i + 1}. ${ds.name}`);
    });
  }
  
  if (result.dependencies.preconditions.length > 0) {
    console.log('\n前置条件:');
    result.dependencies.preconditions.forEach((pre, i) => {
      console.log(`  ${i + 1}. ${pre.name}`);
    });
  }
  
  if (result.dependencies.postconditions.length > 0) {
    console.log('\n后置依赖:');
    result.dependencies.postconditions.forEach((post, i) => {
      console.log(`  ${i + 1}. ${post.name}`);
    });
  }
  
  // 输出智能推荐
  console.log('\n【智能推荐】');
  console.log(`相关需求数：${result.recommendations.recommendations.length}`);
  
  result.recommendations.recommendations.forEach((rec, i) => {
    console.log(`\n  推荐 ${i + 1}: ${rec.title}`);
    console.log(`    相似度：${rec.similarity}%`);
    console.log(`    来源：${rec.sourceFile}`);
    console.log(`    内容：${rec.content}`);
  });
  
  if (result.recommendations.bestPractices.length > 0) {
    console.log('\n最佳实践建议:');
    result.recommendations.bestPractices.forEach((bp, i) => {
      console.log(`  ${i + 1}. ${bp}`);
    });
  }
}

// ==================== 示例 2: 仅评估需求完整性 ====================

function example2CompletenessOnly(): void {
  console.log('\n\n=== 示例 2: 仅评估需求完整性 ===\n');
  
  const requirement = '需要一个用户管理系统';
  
  const result = evaluateCompleteness(requirement);
  
  console.log(`需求："${requirement}"`);
  console.log(`\n综合评分：${result.score.totalScore}/100`);
  
  console.log('\n缺失要素:');
  result.missingElements.forEach((elem, i) => {
    console.log(`  ${i + 1}. ${elem}`);
  });
  
  console.log('\n改进建议:');
  result.suggestions.forEach((sug, i) => {
    console.log(`  ${i + 1}. ${sug}`);
  });
}

// ==================== 示例 3: 仅分析风险 ====================

function example3RiskAnalysis(): void {
  console.log('\n\n=== 示例 3: 仅分析风险 ===\n');
  
  const requirement = '这个功能大概需要快速完成，应该要简单但高质量，成本要低但性能要好';
  
  const result = analyzeRisks(requirement);
  
  console.log(`需求："${requirement}"`);
  console.log(`\n整体风险等级：${result.overallRiskLevel.toUpperCase()}`);
  console.log(`发现 ${result.risks.length} 个风险\n`);
  
  result.risks.forEach((risk, i) => {
    console.log(`${i + 1}. [${risk.type}] [${risk.level.toUpperCase()}]`);
    console.log(`   描述：${risk.description}`);
    console.log(`   建议：${risk.suggestion}`);
    if (risk.position) {
      console.log(`   位置：${risk.position.start}-${risk.position.end}`);
    }
    console.log();
  });
}

// ==================== 示例 4: 仅发现依赖 ====================

function example4DependencyDiscovery(): void {
  console.log('\n\n=== 示例 4: 仅发现依赖 ===\n');
  
  const requirement = `
    需要集成微信支付和支付宝 API，
    先从 MySQL 数据库读取订单数据，
    在调用支付接口之前需要完成用户认证，
    支付成功后需要发送短信通知并更新库存。
  `;
  
  const result = discoverDependencies(requirement);
  
  console.log(`需求："${requirement}"\n`);
  
  console.log('外部系统:');
  result.externalSystems.forEach((sys, i) => {
    console.log(`  ${i + 1}. ${sys.name} - ${sys.description}`);
  });
  
  console.log('\n数据源:');
  result.dataSources.forEach((ds, i) => {
    console.log(`  ${i + 1}. ${ds.name} - ${ds.description}`);
  });
  
  console.log('\n前置条件:');
  result.preconditions.forEach((pre, i) => {
    console.log(`  ${i + 1}. ${pre.name} - ${pre.description}`);
  });
  
  console.log('\n后置依赖:');
  result.postconditions.forEach((post, i) => {
    console.log(`  ${i + 1}. ${post.name} - ${post.description}`);
  });
}

// ==================== 示例 5: 仅生成推荐 ====================

function example5Recommendation(): void {
  console.log('\n\n=== 示例 5: 仅生成推荐 ===\n');
  
  const requirement = '需要实现用户注册功能，支持手机号和邮箱注册，包含验证码';
  
  const result = generateRecommendations(requirement);
  
  console.log(`需求："${requirement}"\n`);
  
  console.log('推荐的历史需求:');
  result.recommendations.forEach((rec, i) => {
    console.log(`\n  ${i + 1}. ${rec.title} (相似度：${rec.similarity}%)`);
    console.log(`     来源：${rec.sourceFile}`);
    console.log(`     内容：${rec.content}`);
  });
  
  console.log('\n最佳实践:');
  result.bestPractices.forEach((bp, i) => {
    console.log(`  ${i + 1}. ${bp}`);
  });
  
  console.log('\n相关需求:');
  result.relatedRequirements.forEach((req, i) => {
    console.log(`  ${i + 1}. ${req}`);
  });
}

// ==================== 示例 6: 在 SKILL 中集成使用 ====================

/**
 * 示例：在 SKILL 中如何调用洞察引擎
 */
async function example6SkillIntegration(): Promise<void> {
  console.log('\n\n=== 示例 6: 在 SKILL 中集成使用 ===\n');
  
  // 模拟从用户对话中提取的需求
  const userRequirement = `
    我想做一个电商小程序，让用户可以在线购买商品。
    需要有商品展示、购物车、下单支付这些基本功能。
    大概 3 个月内要上线，预算不是很多。
  `;
  
  console.log('收到用户需求:', userRequirement);
  console.log('\n开始分析...\n');
  
  // 调用洞察引擎
  const insight = analyzeRequirement(userRequirement);
  
  // 生成分析报告
  const report = {
    summary: {
      completeness: insight.completeness.score.totalScore,
      riskLevel: insight.riskWarning.overallRiskLevel,
      dependencyCount: insight.dependencies.dependencies.length,
      recommendationCount: insight.recommendations.recommendations.length
    },
    details: {
      completeness: insight.completeness,
      risks: insight.riskWarning,
      dependencies: insight.dependencies,
      recommendations: insight.recommendations
    }
  };
  
  console.log('洞察分析报告:');
  console.log(JSON.stringify(report.summary, null, 2));
  
  // 根据分析结果给出反馈
  console.log('\n【给用户的反馈建议】');
  
  if (report.summary.completeness < 60) {
    console.log('\n⚠ 需求完整性不足，建议补充以下信息:');
    insight.completeness.missingElements.forEach(elem => {
      console.log(`  - ${elem}`);
    });
  }
  
  if (report.summary.riskLevel === 'high') {
    console.log('\n⚠ 需求存在较高风险:');
    insight.riskWarning.risks
      .filter(r => r.level === 'high')
      .forEach(risk => {
        console.log(`  - ${risk.description}`);
        console.log(`    建议：${risk.suggestion}`);
      });
  }
  
  if (report.summary.dependencyCount > 0) {
    console.log('\n📋 识别到的依赖:');
    insight.dependencies.dependencies.forEach(dep => {
      console.log(`  - ${dep.name} (${dep.type})`);
    });
  }
  
  if (report.summary.recommendationCount > 0) {
    console.log('\n💡 推荐参考的历史需求:');
    insight.recommendations.recommendations.slice(0, 3).forEach(rec => {
      console.log(`  - ${rec.title} (相似度：${rec.similarity}%)`);
    });
  }
}

// ==================== 运行示例 ====================

function runExamples(): void {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║         智能需求洞察引擎 - API 使用示例                 ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  try {
    example1FullAnalysis();
    example2CompletenessOnly();
    example3RiskAnalysis();
    example4DependencyDiscovery();
    example5Recommendation();
    example6SkillIntegration();
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                    所有示例运行完成                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n示例运行出错:', error);
  }
}

// 导出示例函数
export {
  example1FullAnalysis,
  example2CompletenessOnly,
  example3RiskAnalysis,
  example4DependencyDiscovery,
  example5Recommendation,
  example6SkillIntegration,
  runExamples
};

// 如果直接运行此文件，则执行所有示例
if (require.main === module) {
  runExamples();
}
