/**
 * 需求收敛技能统一导出入口
 * 
 * @module requirement-convergence
 * @description 世界级需求管理技能 - 提供完整的需求分析、验证、图谱构建和智能推荐能力
 */

// ============================================================================
// 核心模块导出
// ============================================================================

// 1. 智能需求洞察引擎
export {
  analyzeRequirement,
  evaluateCompleteness,
  analyzeRisks,
  discoverDependencies,
  generateRecommendations
} from './insight-engine/insight-engine';

// 2. 动态需求图谱
export {
  createRequirementNode,
  createRelationshipEdge,
  buildGraphWithRelationships,
  analyzeRequirementImpact,
  findReusableRequirements,
  RequirementType,
  RelationshipType
} from './knowledge-graph/index';

// 3. 需求验证引擎
export {
  createTestabilityChecker,
  createAcceptanceCriteriaGenerator,
  createTraceabilityManager,
  createQualityScorer,
  DEFAULT_WEIGHTS
} from './validation-engine/index';

// 4. AI 增强能力
export {
  detectAmbiguity,
  polishRequirement,
  splitRequirement,
  recommendPriority,
  generateUserStories,
  assessCompleteness,
  identifyRisks
} from './ai-enhancement/ai-enhancement';

// 5. 行业模板库
export {
  getTemplate,
  listTemplates,
  searchTemplates,
  createComplianceChecker,
  createBestPracticeLibrary,
  createAntiPatternDetector
} from './template-library/index';

// 6. 人格化交互
export {
  PersonaEngine,
  PersonaType
} from './persona-engine/index';

// ============================================================================
// 统一服务接口
// ============================================================================

/**
 * 需求分析服务
 * @param {string} requirement - 需求描述文本
 * @returns {Promise<Object>} 分析结果（完整性、风险、依赖、推荐）
 */
export async function analyze(requirement: string) {
  const insight = await analyzeRequirement(requirement);
  const risks = await analyzeRisks(requirement);
  const dependencies = await discoverDependencies(requirement);
  const recommendations = await generateRecommendations(requirement);
  
  return {
    insight,
    risks,
    dependencies,
    recommendations
  };
}

/**
 * 需求验证服务
 * @param {string} requirement - 需求描述文本
 * @param {string} requirementId - 需求 ID
 * @returns {Promise<Object>} 验证结果（可测试性、验收标准、质量评分）
 */
export async function validate(requirement: string, requirementId: string = 'REQ-001') {
  const testabilityChecker = createTestabilityChecker();
  const testabilityReport = testabilityChecker.generateReport(requirement);
  
  const acceptanceGenerator = createAcceptanceCriteriaGenerator();
  const acceptanceCriteria = acceptanceGenerator.generate(requirementId, requirement);
  
  const qualityScorer = createQualityScorer();
  const qualityReport = await qualityScorer.score(requirementId, requirement);
  
  return {
    testability: testabilityReport,
    acceptanceCriteria,
    quality: qualityReport
  };
}

/**
 * 需求图谱构建服务
 * @param {Array<Object>} requirements - 需求列表
 * @param {string} operation - 操作类型：'build' | 'analyze' | 'impact'
 * @returns {Promise<Object>} 图谱数据（节点、边、影响分析）
 */
export async function buildGraph(requirements: Array<any>, operation: string = 'build') {
  const graph = await buildGraphWithRelationships(requirements);
  
  if (operation === 'impact') {
    // 对每个需求进行影响分析
    const impactAnalysis = requirements.map(req => 
      analyzeRequirementImpact(req.id, graph)
    );
    
    return {
      ...graph,
      impactAnalysis
    };
  }
  
  return graph;
}

/**
 * 智能推荐服务
 * @param {string} requirement - 需求描述文本
 * @param {number} limit - 推荐数量限制
 * @returns {Promise<Object>} 推荐结果（相似需求、最佳实践）
 */
export async function recommend(requirement: string, limit: number = 5) {
  const recommendations = await generateRecommendations(requirement);
  
  // 获取最佳实践
  const bestPractices = createBestPracticeLibrary();
  const practices = bestPractices.searchPractices(requirement).slice(0, limit);
  
  return {
    recommendations: recommendations.slice(0, limit),
    bestPractices: practices,
    relatedTemplates: listTemplates()
  };
}

// ============================================================================
// 默认导出
// ============================================================================

export default {
  analyze,
  validate,
  buildGraph,
  recommend,
  // 核心模块
  insight: {
    analyzeRequirement,
    evaluateCompleteness,
    analyzeRisks,
    discoverDependencies,
    generateRecommendations
  },
  graph: {
    createRequirementNode,
    buildGraphWithRelationships,
    analyzeRequirementImpact,
    findReusableRequirements
  },
  validation: {
    createTestabilityChecker,
    createAcceptanceCriteriaGenerator,
    createTraceabilityManager,
    createQualityScorer
  },
  ai: {
    detectAmbiguity,
    polishRequirement,
    splitRequirement,
    recommendPriority,
    generateUserStories
  },
  templates: {
    getTemplate,
    listTemplates,
    searchTemplates,
    createComplianceChecker
  },
  persona: {
    PersonaEngine,
    PersonaType
  }
};
