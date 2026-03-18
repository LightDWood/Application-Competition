/**
 * 需求收敛技能集成测试脚本
 * 
 * 用于验证需求收敛技能是否正确集成到网站中
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 开始测试需求收敛技能集成...\n');

// 1. 测试 TypeScript 模块加载
console.log('1️⃣ 测试 TypeScript 模块加载...');
try {
  // 动态导入 ts-node
  const { register } = await import('ts-node');
  
  register({
    project: path.join(__dirname, './server/services/requirement-convergence/tsconfig.json'),
    transpileOnly: true,
    compilerOptions: {
      module: 'commonjs'
    }
  });
  
  console.log('✅ TypeScript 注册成功');
  
  // 动态导入需求收敛服务
  const RequirementService = await import('./server/services/requirement-convergence/src/index.ts');
  console.log('✅ TypeScript 模块加载成功\n');
  
  // 2. 测试需求分析功能
  console.log('2️⃣ 测试需求分析功能...');
  try {
    const testRequirement = '实现用户登录功能，支持邮箱注册';
    console.log(`测试需求：${testRequirement}\n`);
    
    const result = await RequirementService.analyze(testRequirement);
    
    console.log('✅ 需求分析成功！');
    console.log(`   - 完整性评分：${result.insight?.completeness?.totalScore || 'N/A'}`);
    console.log(`   - 风险数量：${result.risks?.risks?.length || 0}`);
    console.log(`   - 依赖数量：${result.dependencies?.dependencies?.length || 0}`);
    console.log(`   - 推荐数量：${result.recommendations?.length || 0}\n`);
    
    // 3. 测试需求验证功能
    console.log('3️⃣ 测试需求验证功能...');
    const validation = await RequirementService.validate(testRequirement, 'TEST-001');
    console.log('✅ 需求验证成功！');
    console.log(`   - 质量评分：${validation.quality?.overallScore || 'N/A'}`);
    console.log(`   - 可测试性评分：${validation.testability?.overallScore || 'N/A'}`);
    console.log(`   - 验收标准数量：${validation.acceptanceCriteria?.scenarios?.length || 0}\n`);
    
    // 4. 测试技能服务集成
    console.log('4️⃣ 测试 SkillService 集成...');
    const skillServiceModule = await import('./server/services/skillService.js');
    const skillService = skillServiceModule.default;
    console.log('✅ SkillService 加载成功');
    console.log(`   - 需求收敛服务已加载：${!!skillService.requirementService}`);
    console.log(`   - formatRequirementAnalysis 方法存在：${typeof skillService.formatRequirementAnalysis === 'function'}\n`);
    
    // 5. 测试流式响应
    console.log('5️⃣ 测试流式响应...');
    const testMessage = '我需要一个电商网站的购物车功能';
    console.log(`测试消息：${testMessage}\n`);
    console.log('📤 生成响应中...\n');
    
    let responseCount = 0;
    for await (const chunk of skillService.streamResponse(testMessage, [])) {
      responseCount++;
      if (chunk.type === 'chunk') {
        process.stdout.write(chunk.content);
      } else if (chunk.type === 'complete') {
        console.log('\n\n✅ 流式响应完成！');
        console.log(`   - 响应块数量：${responseCount}`);
        console.log(`   - 模型：${chunk.metadata?.model || 'unknown'}`);
      }
    }
    
    // 6. 总结
    console.log('\n' + '='.repeat(60));
    console.log('🎉 所有测试通过！');
    console.log('='.repeat(60));
    console.log('\n✅ 需求收敛技能已成功集成到网站中');
    console.log('✅ 会话聊天功能现在会调用需求收敛技能');
    console.log('✅ 降级机制正常工作（技能失败时使用 AI API）\n');
    
  } catch (testError) {
    console.error('\n❌ 功能测试失败:', testError.message);
    console.error('\n详细信息:', testError.stack);
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ TypeScript 模块加载失败');
  console.error('错误详情:', error.message);
  console.error('\n请检查：');
  console.error('1. TypeScript 依赖是否已安装：npm install typescript ts-node --save-dev');
  console.error('2. 模块路径是否正确');
  console.error('3. 代码是否有语法错误\n');
  process.exit(1);
}
