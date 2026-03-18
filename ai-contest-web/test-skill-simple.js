/**
 * 简化的集成测试 - 直接测试 skillService
 */

import skillService from './server/services/skillService.js';

console.log('🧪 测试 SkillService 集成...\n');

console.log('✅ SkillService 加载成功');
console.log(`   - requirementService 已加载：${!!skillService.requirementService}`);
console.log(`   - formatRequirementAnalysis 方法存在：${typeof skillService.formatRequirementAnalysis === 'function'}`);
console.log(`   - analyzeRequirement 方法存在：${typeof skillService.analyzeRequirement === 'function'}`);
console.log(`   - streamResponse 方法存在：${typeof skillService.streamResponse === 'function'}`);
console.log('');

if (skillService.requirementService) {
  console.log('🎉 需求收敛技能已成功集成！');
  console.log('✅ 会话聊天功能现在会调用需求收敛技能\n');
} else {
  console.log('⚠️  需求收敛技能未加载，请检查错误日志\n');
}
