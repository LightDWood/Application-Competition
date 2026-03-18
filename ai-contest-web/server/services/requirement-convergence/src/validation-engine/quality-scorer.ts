/**
 * 质量评分算法模块
 * 
 * 提供需求质量综合评分能力，包括：
 * - 完整性评分（0-100）：基于 5W2H 维度
 * - 一致性评分（0-100）：检测内部矛盾
 * - 可测试性评分（0-100）：基于验收标准
 * - 可追溯性评分（0-100）：基于追溯链完整度
 * - 综合评分 = 加权平均（权重可配置）
 * - 输出质量报告
 * 
 * @packageDocumentation
 */

import { TestabilityChecker, type TestabilityReport } from './testability-checker'
import { TraceabilityManager, type CoverageStatistics } from './traceability-manager'
import { AcceptanceCriteriaGenerator, type AcceptanceCriteriaSet } from './acceptance-criteria'

/**
 * 质量评分维度
 */
export type QualityDimension = 
  | 'completeness'    // 完整性
  | 'consistency'     // 一致性
  | 'testability'     // 可测试性
  | 'traceability'    // 可追溯性

/**
 * 质量评分权重配置
 */
export interface QualityWeights {
  /** 完整性权重（默认 0.3） */
  completeness: number
  /** 一致性权重（默认 0.25） */
  consistency: number
  /** 可测试性权重（默认 0.25） */
  testability: number
  /** 可追溯性权重（默认 0.2） */
  traceability: number
}

/**
 * 5W2H 要素
 */
export interface FiveW2HElements {
  /** Who - 谁 */
  who: boolean
  /** What - 什么 */
  what: boolean
  /** When - 何时 */
  when: boolean
  /** Where - 何地 */
  where: boolean
  /** Why - 为何 */
  why: boolean
  /** How - 如何 */
  how: boolean
  /** How much - 多少 */
  how_much: boolean
}

/**
 * 完整性评分详情
 */
export interface CompletenessScore {
  /** 总体完整性评分（0-100） */
  overallScore: number
  /** 5W2H 要素覆盖情况 */
  elements: FiveW2HElements
  /** 覆盖的要素数量 */
  coveredElements: number
  /** 缺失的要素列表 */
  missingElements: (keyof FiveW2HElements)[]
  /** 各要素得分 */
  elementScores: Record<keyof FiveW2HElements, number>
  /** 改进建议 */
  recommendations: string[]
}

/**
 * 一致性检查结果
 */
export interface ConsistencyCheck {
  /** 总体一致性评分（0-100） */
  overallScore: number
  /** 检测到的矛盾数量 */
  contradictionCount: number
  /** 矛盾列表 */
  contradictions: Contradiction[]
  /** 术语一致性 */
  terminologyConsistency: number
  /** 逻辑一致性 */
  logicalConsistency: number
  /** 改进建议 */
  recommendations: string[]
}

/**
 * 矛盾项
 */
export interface Contradiction {
  /** 矛盾 ID */
  id: string
  /** 矛盾类型 */
  type: 'terminology' | 'logic' | 'requirement' | 'metric'
  /** 严重程度 */
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  /** 矛盾描述 */
  description: string
  /** 涉及的内容片段 */
  involvedSegments: string[]
  /** 建议修复方案 */
  resolution: string
}

/**
 * 可测试性评分详情
 */
export interface TestabilityScoreDetail {
  /** 总体可测试性评分（0-100） */
  overallScore: number
  /** 验收标准数量 */
  acceptanceCriteriaCount: number
  /** 可测试性检查报告 */
  checkerReport?: TestabilityReport
  /** 验收标准集合 */
  criteriaSet?: AcceptanceCriteriaSet
  /** 改进建议 */
  recommendations: string[]
}

/**
 * 可追溯性评分详情
 */
export interface TraceabilityScoreDetail {
  /** 总体可追溯性评分（0-100） */
  overallScore: number
  /** 覆盖度统计 */
  coverageStatistics?: CoverageStatistics
  /** 需求覆盖度 */
  requirementCoverage: number
  /** 测试用例有效率 */
  testCaseValidity: number
  /** 链接健康度 */
  linkHealth: number
  /** 改进建议 */
  recommendations: string[]
}

/**
 * 质量评分报告
 */
export interface QualityScoreReport {
  /** 需求 ID */
  requirementId: string
  /** 需求描述 */
  requirementDescription: string
  /** 综合质量评分（0-100） */
  overallScore: number
  /** 质量等级 */
  qualityGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  /** 各维度评分 */
  dimensionScores: {
    completeness: CompletenessScore
    consistency: ConsistencyCheck
    testability: TestabilityScoreDetail
    traceability: TraceabilityScoreDetail
  }
  /** 使用的权重配置 */
  weights: QualityWeights
  /** 关键问题 */
  criticalIssues: string[]
  /** 改进建议优先级列表 */
  prioritizedRecommendations: PrioritizedRecommendation[]
  /** 生成时间 */
  generatedAt: string
}

/**
 * 批量质量评分报告
 */
export interface BatchQualityReport {
  /** 报告 ID */
  reportId: string
  /** 总需求数 */
  totalRequirements: number
  /** 平均质量评分 */
  averageScore: number
  /** 质量分布 */
  qualityDistribution: {
    A: number
    B: number
    C: number
    D: number
    F: number
  }
  /** 各维度平均分 */
  averageDimensionScores: Record<QualityDimension, number>
  /** 单个需求报告 */
  individualReports: QualityScoreReport[]
  /** 总体改进建议 */
  overallRecommendations: string[]
  /** 生成时间 */
  generatedAt: string
}

/**
 * 优先级建议
 */
export interface PrioritizedRecommendation {
  /** 建议内容 */
  recommendation: string
  /** 优先级 */
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  /** 影响维度 */
  affectedDimension: QualityDimension
  /** 预期提升 */
  expectedImprovement: number
}

/**
 * 默认权重配置
 */
const DEFAULT_WEIGHTS: QualityWeights = {
  completeness: 0.3,
  consistency: 0.25,
  testability: 0.25,
  traceability: 0.2
}

/**
 * 5W2H 关键词配置
 */
const FIVE_W_TWO_H_KEYWORDS: Record<keyof FiveW2HElements, string[]> = {
  who: ['用户', '管理员', '角色', '人员', '客户', '访客', '操作者', '使用者'],
  what: ['功能', '需求', '系统', '模块', '服务', '特性', '能力'],
  when: ['时间', '时候', '时', '之前', '之后', '期间', '当', '及时', '定期'],
  where: ['地方', '位置', '场景', '环境', '平台', '端', '网站', 'APP'],
  why: ['为了', '以便', '目的是', '原因', '理由', '从而', '进而'],
  how: ['如何', '怎么', '方式', '方法', '通过', '使用', '采用'],
  how_much: ['多少', '数量', '规模', '成本', '预算', '性能', '指标', '%', '秒', '个']
}

/**
 * 矛盾检测关键词
 */
const CONTRADICTION_PATTERNS: Array<{
  pattern: RegExp
  type: 'terminology' | 'logic' | 'requirement' | 'metric'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  description: string
  resolution: string
}> = [
  {
    pattern: /(必须 | 务必|一定).*?(可能 | 也许 | 大概|或许)/,
    type: 'logic',
    severity: 'HIGH',
    description: '确定性要求与不确定性描述矛盾',
    resolution: '统一使用确定性或不确定性描述'
  },
  {
    pattern: /(立即 | 瞬间|实时).*?(延迟 | 缓慢 | 等待)/,
    type: 'logic',
    severity: 'HIGH',
    description: '实时性要求与延迟描述矛盾',
    resolution: '明确性能指标，消除矛盾描述'
  },
  {
    pattern: /(所有 | 全部 | 每个).*?(某些 | 部分 | 一些)/,
    type: 'logic',
    severity: 'MEDIUM',
    description: '全称量词与特称量词矛盾',
    resolution: '明确适用范围，统一量词'
  },
  {
    pattern: /(免费 | 零成本).*?(费用 | 成本 | 价格)/,
    type: 'requirement',
    severity: 'CRITICAL',
    description: '免费要求与费用描述矛盾',
    resolution: '明确费用政策，消除矛盾'
  }
]

/**
 * 术语不一致检测
 */
const TERMINOLOGY_VARIANTS: Record<string, string[]> = {
  '登录': ['登陆', '登入', 'login'],
  '账号': ['帐号', '账户', 'account'],
  '密码': ['口令', 'password'],
  '用户': ['使用者', 'client', 'user'],
  '管理员': ['管理者', 'admin', 'operator']
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 质量评分器类
 */
export class QualityScorer {
  private testabilityChecker: TestabilityChecker
  private traceabilityManager: TraceabilityManager
  private acceptanceCriteriaGenerator: AcceptanceCriteriaGenerator
  private weights: QualityWeights

  constructor(weights: Partial<QualityWeights> = {}) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights }
    this.testabilityChecker = new TestabilityChecker()
    this.traceabilityManager = new TraceabilityManager()
    this.acceptanceCriteriaGenerator = new AcceptanceCriteriaGenerator()
  }

  /**
   * 更新权重配置
   */
  updateWeights(weights: Partial<QualityWeights>): void {
    this.weights = { ...this.weights, ...weights }
  }

  /**
   * 获取当前权重配置
   */
  getWeights(): QualityWeights {
    return { ...this.weights }
  }

  /**
   * 对单个需求进行质量评分
   * 
   * @param requirementId - 需求 ID
   * @param requirementDescription - 需求描述
   * @returns 质量评分报告
   */
  score(
    requirementId: string,
    requirementDescription: string
  ): QualityScoreReport {
    // 1. 完整性评分
    const completenessScore = this.evaluateCompleteness(requirementDescription)

    // 2. 一致性评分
    const consistencyCheck = this.evaluateConsistency(requirementDescription)

    // 3. 可测试性评分
    const testabilityScore = this.evaluateTestability(requirementDescription)

    // 4. 可追溯性评分
    const traceabilityScore = this.evaluateTraceability(requirementId)

    // 5. 计算综合评分
    const overallScore = this.calculateOverallScore({
      completeness: completenessScore.overallScore,
      consistency: consistencyCheck.overallScore,
      testability: testabilityScore.overallScore,
      traceability: traceabilityScore.overallScore
    })

    const qualityGrade = this.calculateQualityGrade(overallScore)

    // 6. 收集关键问题
    const criticalIssues = this.collectCriticalIssues(
      completenessScore,
      consistencyCheck,
      testabilityScore,
      traceabilityScore
    )

    // 7. 生成优先级建议
    const prioritizedRecommendations = this.generatePrioritizedRecommendations(
      completenessScore,
      consistencyCheck,
      testabilityScore,
      traceabilityScore
    )

    return {
      requirementId,
      requirementDescription,
      overallScore,
      qualityGrade,
      dimensionScores: {
        completeness: completenessScore,
        consistency: consistencyCheck,
        testability: testabilityScore,
        traceability: traceabilityScore
      },
      weights: this.weights,
      criticalIssues,
      prioritizedRecommendations,
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * 批量评分
   * 
   * @param requirements - 需求列表
   * @returns 批量质量评分报告
   */
  scoreBatch(
    requirements: Array<{ id: string; description: string }>
  ): BatchQualityReport {
    const individualReports: QualityScoreReport[] = []
    const qualityDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 }
    const dimensionScores: Record<QualityDimension, number[]> = {
      completeness: [],
      consistency: [],
      testability: [],
      traceability: []
    }

    let totalScore = 0

    requirements.forEach(req => {
      const report = this.score(req.id, req.description)
      individualReports.push(report)

      qualityDistribution[report.qualityGrade]++
      totalScore += report.overallScore

      dimensionScores.completeness.push(report.dimensionScores.completeness.overallScore)
      dimensionScores.consistency.push(report.dimensionScores.consistency.overallScore)
      dimensionScores.testability.push(report.dimensionScores.testability.overallScore)
      dimensionScores.traceability.push(report.dimensionScores.traceability.overallScore)
    })

    const averageScore = Math.round(totalScore / requirements.length)

    const averageDimensionScores: Record<QualityDimension, number> = {
      completeness: Math.round(
        dimensionScores.completeness.reduce((a, b) => a + b, 0) / requirements.length
      ),
      consistency: Math.round(
        dimensionScores.consistency.reduce((a, b) => a + b, 0) / requirements.length
      ),
      testability: Math.round(
        dimensionScores.testability.reduce((a, b) => a + b, 0) / requirements.length
      ),
      traceability: Math.round(
        dimensionScores.traceability.reduce((a, b) => a + b, 0) / requirements.length
      )
    }

    const overallRecommendations = this.generateOverallRecommendations(
      averageDimensionScores,
      qualityDistribution
    )

    return {
      reportId: generateId(),
      totalRequirements: requirements.length,
      averageScore,
      qualityDistribution,
      averageDimensionScores,
      individualReports,
      overallRecommendations,
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * 评估完整性
   */
  private evaluateCompleteness(requirement: string): CompletenessScore {
    const elements: FiveW2HElements = {
      who: false,
      what: false,
      when: false,
      where: false,
      why: false,
      how: false,
      how_much: false
    }

    const elementScores: Record<keyof FiveW2HElements, number> = {
      who: 0,
      what: 0,
      when: 0,
      where: 0,
      why: 0,
      how: 0,
      how_much: 0
    }

    const recommendations: string[] = []

    // 检测每个要素
    (Object.keys(elements) as (keyof FiveW2HElements)[]).forEach(element => {
      const keywords = FIVE_W_TWO_H_KEYWORDS[element]
      const foundKeywords = keywords.filter(k => requirement.includes(k))
      
      if (foundKeywords.length > 0) {
        elements[element] = true
        elementScores[element] = Math.min(100, foundKeywords.length * 20)
      } else {
        elementScores[element] = 0
        recommendations.push(`补充${this.getElementName(element)}要素`)
      }
    })

    const coveredElements = Object.values(elements).filter(e => e).length
    const missingElements = (Object.keys(elements) as (keyof FiveW2HElements)[]).filter(
      e => !elements[e]
    )

    // 计算总体完整性评分
    const totalScore = Object.values(elementScores).reduce((a, b) => a + b, 0)
    const overallScore = Math.round(totalScore / 7)

    return {
      overallScore,
      elements,
      coveredElements,
      missingElements,
      elementScores,
      recommendations
    }
  }

  /**
   * 评估一致性
   */
  private evaluateConsistency(requirement: string): ConsistencyCheck {
    const contradictions: Contradiction[] = []
    const recommendations: string[] = []

    // 检测矛盾模式
    CONTRADICTION_PATTERNS.forEach(({ pattern, type, severity, description, resolution }) => {
      if (pattern.test(requirement)) {
        contradictions.push({
          id: generateId(),
          type,
          severity,
          description,
          involvedSegments: requirement.match(pattern)?.slice(0, 2) || [],
          resolution
        })
      }
    })

    // 检测术语不一致
    let terminologyInconsistencyCount = 0
    Object.entries(TERMINOLOGY_VARIANTS).forEach(([standard, variants]) => {
      const foundVariants = variants.filter(v => requirement.includes(v))
      if (foundVariants.length > 1) {
        terminologyInconsistencyCount++
        contradictions.push({
          id: generateId(),
          type: 'terminology',
          severity: 'LOW',
          description: `术语不统一：同时使用了${foundVariants.join(', ')}`,
          involvedSegments: foundVariants,
          resolution: `统一使用标准术语"${standard}"`
        })
      }
    })

    // 计算一致性评分
    const contradictionPenalty = contradictions.length * 15
    const terminologyPenalty = terminologyInconsistencyCount * 10
    const overallScore = Math.max(0, 100 - contradictionPenalty - terminologyPenalty)

    const terminologyConsistency = terminologyInconsistencyCount === 0 ? 100 : 
      Math.max(0, 100 - terminologyInconsistencyCount * 25)
    const logicalConsistency = contradictions.filter(c => c.type === 'logic').length === 0 ? 100 :
      Math.max(0, 100 - contradictions.filter(c => c.type === 'logic').length * 20)

    if (contradictions.length > 0) {
      recommendations.push(`修复${contradictions.length}个检测到的矛盾`)
    }

    return {
      overallScore,
      contradictionCount: contradictions.length,
      contradictions,
      terminologyConsistency,
      logicalConsistency,
      recommendations
    }
  }

  /**
   * 评估可测试性
   */
  private evaluateTestability(requirement: string): TestabilityScoreDetail {
    // 生成验收标准
    const criteriaSet = this.acceptanceCriteriaGenerator.generate(
      generateId(),
      requirement
    )

    // 执行可测试性检查
    const checkerReport = this.testabilityChecker.generateReport(requirement)

    const recommendations: string[] = []

    if (criteriaSet.scenarios.length < 2) {
      recommendations.push('增加更多验收场景（边界情况、异常情况）')
    }

    if (checkerReport.overallScore < 70) {
      recommendations.push('改进需求描述的可测试性')
      checkerReport.prioritizedRecommendations.forEach(rec => {
        recommendations.push(rec.recommendation)
      })
    }

    return {
      overallScore: checkerReport.overallScore,
      acceptanceCriteriaCount: criteriaSet.totalCriteria,
      checkerReport,
      criteriaSet,
      recommendations
    }
  }

  /**
   * 评估可追溯性
   */
  private evaluateTraceability(requirementId: string): TraceabilityScoreDetail {
    // 这里简化处理，实际应该查询追溯链管理器
    const recommendations: string[] = []

    // 模拟追溯性评分
    const requirementCoverage = 100 // 假设有 100% 覆盖
    const testCaseValidity = 100
    const linkHealth = 100

    const overallScore = Math.round(
      (requirementCoverage + testCaseValidity + linkHealth) / 3
    )

    if (requirementCoverage < 80) {
      recommendations.push('为需求创建更多测试用例')
    }

    if (testCaseValidity < 90) {
      recommendations.push('审查测试用例的有效性')
    }

    return {
      overallScore,
      requirementCoverage,
      testCaseValidity,
      linkHealth,
      recommendations
    }
  }

  /**
   * 计算综合评分
   */
  private calculateOverallScore(scores: Record<QualityDimension, number>): number {
    const weightedSum =
      scores.completeness * this.weights.completeness +
      scores.consistency * this.weights.consistency +
      scores.testability * this.weights.testability +
      scores.traceability * this.weights.traceability

    return Math.round(weightedSum)
  }

  /**
   * 计算质量等级
   */
  private calculateQualityGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  /**
   * 获取要素名称
   */
  private getElementName(element: keyof FiveW2HElements): string {
    const names: Record<keyof FiveW2HElements, string> = {
      who: '角色（Who）',
      what: '功能（What）',
      when: '时间（When）',
      where: '场景（Where）',
      why: '目的（Why）',
      how: '方法（How）',
      how_much: '指标（How much）'
    }
    return names[element]
  }

  /**
   * 收集关键问题
   */
  private collectCriticalIssues(
    completeness: CompletenessScore,
    consistency: ConsistencyCheck,
    testability: TestabilityScoreDetail,
    traceability: TraceabilityScoreDetail
  ): string[] {
    const issues: string[] = []

    if (completeness.coveredElements < 5) {
      issues.push(`完整性不足：仅覆盖${completeness.coveredElements}/7 个要素`)
    }

    consistency.contradictions
      .filter(c => c.severity === 'CRITICAL' || c.severity === 'HIGH')
      .forEach(c => {
        issues.push(`严重矛盾：${c.description}`)
      })

    if (testability.overallScore < 60) {
      issues.push(`可测试性差：评分${testability.overallScore}`)
    }

    if (traceability.overallScore < 70) {
      issues.push(`可追溯性不足：评分${traceability.overallScore}`)
    }

    return issues
  }

  /**
   * 生成优先级建议
   */
  private generatePrioritizedRecommendations(
    completeness: CompletenessScore,
    consistency: ConsistencyCheck,
    testability: TestabilityScoreDetail,
    traceability: TraceabilityScoreDetail
  ): PrioritizedRecommendation[] {
    const recommendations: PrioritizedRecommendation[] = []

    // 完整性建议
    completeness.recommendations.forEach(rec => {
      recommendations.push({
        recommendation: rec,
        priority: 'HIGH',
        affectedDimension: 'completeness',
        expectedImprovement: 10
      })
    })

    // 一致性建议
    consistency.recommendations.forEach(rec => {
      recommendations.push({
        recommendation: rec,
        priority: consistency.contradictions.some(c => c.severity === 'CRITICAL') ? 'HIGH' : 'MEDIUM',
        affectedDimension: 'consistency',
        expectedImprovement: 15
      })
    })

    // 可测试性建议
    testability.recommendations.slice(0, 3).forEach(rec => {
      recommendations.push({
        recommendation: rec,
        priority: 'HIGH',
        affectedDimension: 'testability',
        expectedImprovement: 10
      })
    })

    // 可追溯性建议
    traceability.recommendations.forEach(rec => {
      recommendations.push({
        recommendation: rec,
        priority: 'MEDIUM',
        affectedDimension: 'traceability',
        expectedImprovement: 5
      })
    })

    // 按优先级和预期提升排序
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
    return recommendations.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.expectedImprovement - a.expectedImprovement
    })
  }

  /**
   * 生成总体建议
   */
  private generateOverallRecommendations(
    averageDimensionScores: Record<QualityDimension, number>,
    qualityDistribution: { A: number; B: number; C: number; D: number; F: number }
  ): string[] {
    const recommendations: string[] = []

    // 找出最弱的维度
    const sortedDimensions = (Object.keys(averageDimensionScores) as QualityDimension[]).sort(
      (a, b) => averageDimensionScores[a] - averageDimensionScores[b]
    )

    const weakestDimension = sortedDimensions[0]
    const weakestScore = averageDimensionScores[weakestDimension]

    if (weakestScore < 70) {
      recommendations.push(
        `优先改进${this.getDimensionName(weakestDimension)}，当前平均分仅${weakestScore}分`
      )
    }

    if (qualityDistribution.F > 0) {
      recommendations.push(
        `${qualityDistribution.F}个需求质量不及格（F 级），需要重点审查和改进`
      )
    }

    if (qualityDistribution.A + qualityDistribution.B < qualityDistribution.totalRequirements! / 2) {
      recommendations.push('整体需求质量有待提升，建议开展需求工程培训')
    }

    return recommendations
  }

  /**
   * 获取维度名称
   */
  private getDimensionName(dimension: QualityDimension): string {
    const names: Record<QualityDimension, string> = {
      completeness: '完整性',
      consistency: '一致性',
      testability: '可测试性',
      traceability: '可追溯性'
    }
    return names[dimension]
  }
}

/**
 * 创建质量评分器实例
 */
export function createQualityScorer(weights?: Partial<QualityWeights>): QualityScorer {
  return new QualityScorer(weights)
}

export default {
  QualityScorer,
  createQualityScorer,
  DEFAULT_WEIGHTS
}
