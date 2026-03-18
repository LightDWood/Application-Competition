/**
 * 需求验证引擎统一导出
 * 
 * 提供完整的需求质量验证能力，包括：
 * - 可测试性检查：检查需求是否可测试，输出评分和改进建议
 * - 验收标准生成：自动生成 Given-When-Then 格式的验收标准
 * - 追溯链管理：建立需求与测试的双向追溯关系
 * - 质量评分：综合评估需求质量（完整性、一致性、可测试性、可追溯性）
 * 
 * @packageDocumentation
 */

// ==================== 可测试性检查 ====================
export {
  TestabilityChecker,
  createTestabilityChecker,
  TESTABILITY_CHECK_RULES,
  type TestabilityCheckType,
  type TestabilitySeverity,
  type TestabilityCheckItem,
  type TestabilityCheckDetail,
  type TestabilityReport,
  type PrioritizedRecommendation
} from './testability-checker'

// ==================== 验收标准生成 ====================
export {
  AcceptanceCriteriaGenerator,
  createAcceptanceCriteriaGenerator,
  SCENARIO_GENERATION_RULES,
  type AcceptanceScenarioType,
  type AcceptanceScenario,
  type AcceptanceCriteriaSet,
  type ScenarioGenerationRule
} from './acceptance-criteria'

// ==================== 追溯链管理 ====================
export {
  TraceabilityManager,
  createTraceabilityManager,
  type TraceabilityLinkType,
  type TraceabilityLinkStatus,
  type TraceabilityLink,
  type RequirementEntity,
  type TestCaseEntity,
  type TraceabilityMatrix,
  type CoverageStatistics,
  type CoverageAnalysisReport,
  type TraceabilityHealthCheck,
  type HealthCheckItem,
  type TraceabilityIssue
} from './traceability-manager'

// ==================== 质量评分 ====================
export {
  QualityScorer,
  createQualityScorer,
  DEFAULT_WEIGHTS,
  type QualityDimension,
  type QualityWeights,
  type FiveW2HElements,
  type CompletenessScore,
  type ConsistencyCheck,
  type Contradiction,
  type TestabilityScoreDetail,
  type TraceabilityScoreDetail,
  type QualityScoreReport,
  type BatchQualityReport,
  type PrioritizedRecommendation as QualityRecommendation
} from './quality-scorer'

/**
 * 使用示例
 * 
 * @example
 * ```typescript
 * import {
 *   TestabilityChecker,
 *   AcceptanceCriteriaGenerator,
 *   TraceabilityManager,
 *   QualityScorer
 * } from './validation-engine'
 * 
 * // 1. 可测试性检查
 * const testabilityChecker = createTestabilityChecker()
 * const testabilityReport = testabilityChecker.generateReport(
 *   '用户需要快速登录系统，响应时间应该在 2 秒内'
 * )
 * console.log(`可测试性评分：${testabilityReport.overallScore}`)
 * 
 * // 2. 生成验收标准
 * const acGenerator = createAcceptanceCriteriaGenerator()
 * const criteriaSet = acGenerator.generate(
 *   'REQ-001',
 *   '用户需要快速登录系统，响应时间应该在 2 秒内'
 * )
 * console.log(`生成了${criteriaSet.totalScenarios}个验收场景`)
 * 
 * // 3. 追溯链管理
 * const traceabilityManager = createTraceabilityManager()
 * traceabilityManager.addRequirement({
 *   id: 'REQ-001',
 *   title: '用户登录',
 *   description: '用户需要快速登录系统',
 *   type: 'functional',
 *   priority: 'HIGH',
 *   status: 'approved',
 *   linkedTestIds: [],
 *   createdAt: new Date().toISOString(),
 *   updatedAt: new Date().toISOString()
 * })
 * traceabilityManager.addTestCase({
 *   id: 'TEST-001',
 *   title: '登录测试',
 *   description: '测试用户登录功能',
 *   type: 'acceptance',
 *   priority: 'HIGH',
 *   status: 'approved',
 *   linkedRequirementIds: ['REQ-001'],
 *   acceptanceScenarioIds: [],
 *   createdAt: new Date().toISOString(),
 *   updatedAt: new Date().toISOString()
 * })
 * traceabilityManager.createLink('REQ-001', 'TEST-001', 'requirement_to_test')
 * const matrix = traceabilityManager.generateMatrix('登录模块追溯矩阵')
 * console.log(`需求覆盖度：${matrix.coverageStatistics.requirementCoverage}%`)
 * 
 * // 4. 质量评分
 * const qualityScorer = createQualityScorer()
 * const qualityReport = qualityScorer.score(
 *   'REQ-001',
 *   '用户需要快速登录系统，响应时间应该在 2 秒内'
 * )
 * console.log(`综合质量评分：${qualityReport.overallScore} (${qualityReport.qualityGrade})`)
 * console.log('改进建议:')
 * qualityReport.prioritizedRecommendations.forEach(rec => {
 *   console.log(`  - [${rec.priority}] ${rec.recommendation}`)
 * })
 * ```
 * 
 * @example
 * ```typescript
 * // 批量评分示例
 * import { createQualityScorer } from './validation-engine'
 * 
 * const qualityScorer = createQualityScorer({
 *   completeness: 0.3,
 *   consistency: 0.25,
 *   testability: 0.25,
 *   traceability: 0.2
 * })
 * 
 * const requirements = [
 *   { id: 'REQ-001', description: '用户需要快速登录系统' },
 *   { id: 'REQ-002', description: '系统应该支持 1000 并发用户' },
 *   { id: 'REQ-003', description: '数据需要加密存储' }
 * ]
 * 
 * const batchReport = qualityScorer.scoreBatch(requirements)
 * console.log(`平均质量评分：${batchReport.averageScore}`)
 * console.log(`质量分布：A=${batchReport.qualityDistribution.A}, B=${batchReport.qualityDistribution.B}`)
 * ```
 */

// 默认导出
export default {
  TestabilityChecker: () => createTestabilityChecker(),
  AcceptanceCriteriaGenerator: () => createAcceptanceCriteriaGenerator(),
  TraceabilityManager: () => createTraceabilityManager(),
  QualityScorer: (weights?: any) => createQualityScorer(weights),
  DEFAULT_WEIGHTS
}
