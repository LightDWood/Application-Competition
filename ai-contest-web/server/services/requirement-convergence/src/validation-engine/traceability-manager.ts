/**
 * 需求 - 测试追溯链管理模块
 * 
 * 建立需求与测试用例的双向追溯链接，包括：
 * - 需求 → 测试用例（覆盖度检查）
 * - 测试用例 → 需求（来源追溯）
 * - 输出追溯矩阵
 * 
 * @packageDocumentation
 */

/**
 * 追溯链接类型
 */
export type TraceabilityLinkType = 
  | 'requirement_to_test'    // 需求到测试
  | 'test_to_requirement'    // 测试到需求
  | 'requirement_to_requirement'  // 需求到需求
  | 'test_to_test'            // 测试到测试

/**
 * 追溯链接状态
 */
export type TraceabilityLinkStatus = 
  | 'active'      // 活跃
  | 'deprecated'  // 已废弃
  | 'broken'      // 已断裂
  | 'pending'     // 待确认

/**
 * 追溯链接
 */
export interface TraceabilityLink {
  /** 链接 ID */
  id: string
  /** 源实体 ID */
  sourceId: string
  /** 目标实体 ID */
  targetId: string
  /** 链接类型 */
  type: TraceabilityLinkType
  /** 链接状态 */
  status: TraceabilityLinkStatus
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 创建者 */
  createdBy?: string
  /** 备注 */
  comment?: string
  /** 置信度（0-1） */
  confidence: number
}

/**
 * 需求实体
 */
export interface RequirementEntity {
  /** 需求 ID */
  id: string
  /** 需求标题 */
  title: string
  /** 需求描述 */
  description: string
  /** 需求类型 */
  type: 'functional' | 'non_functional' | 'constraint' | 'interface'
  /** 优先级 */
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  /** 状态 */
  status: 'draft' | 'approved' | 'in_progress' | 'completed' | 'rejected'
  /** 父需求 ID */
  parentId?: string
  /** 关联的测试用例 ID 列表 */
  linkedTestIds: string[]
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 测试用例实体
 */
export interface TestCaseEntity {
  /** 测试用例 ID */
  id: string
  /** 测试用例标题 */
  title: string
  /** 测试描述 */
  description: string
  /** 测试类型 */
  type: 'unit' | 'integration' | 'system' | 'acceptance' | 'regression'
  /** 优先级 */
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  /** 状态 */
  status: 'draft' | 'approved' | 'executed' | 'passed' | 'failed'
  /** 关联的需求 ID 列表 */
  linkedRequirementIds: string[]
  /** 关联的验收场景 ID 列表 */
  acceptanceScenarioIds: string[]
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 追溯矩阵
 */
export interface TraceabilityMatrix {
  /** 矩阵 ID */
  id: string
  /** 矩阵名称 */
  name: string
  /** 描述 */
  description: string
  /** 需求列表 */
  requirements: RequirementEntity[]
  /** 测试用例列表 */
  testCases: TestCaseEntity[]
  /** 追溯链接列表 */
  links: TraceabilityLink[]
  /** 覆盖度统计 */
  coverageStatistics: CoverageStatistics
  /** 生成时间 */
  generatedAt: string
}

/**
 * 覆盖度统计
 */
export interface CoverageStatistics {
  /** 总需求数 */
  totalRequirements: number
  /** 已覆盖需求数 */
  coveredRequirements: number
  /** 未覆盖需求数 */
  uncoveredRequirements: number
  /** 需求覆盖度（0-100） */
  requirementCoverage: number
  /** 总测试用例数 */
  totalTestCases: number
  /** 有效测试用例数 */
  validTestCases: number
  /** 无效测试用例数（无需求来源） */
  orphanedTestCases: number
  /** 测试用例有效率（0-100） */
  testCaseValidity: number
  /** 链接总数 */
  totalLinks: number
  /** 活跃链接数 */
  activeLinks: number
  /** 断裂链接数 */
  brokenLinks: number
  /** 链接健康度（0-100） */
  linkHealth: number
  /** 每个需求的测试用例数 */
  testsPerRequirement: Record<string, number>
  /** 每个测试用例的需求数 */
  requirementsPerTest: Record<string, number>
}

/**
 * 覆盖度分析报告
 */
export interface CoverageAnalysisReport {
  /** 需求 ID */
  requirementId: string
  /** 需求标题 */
  requirementTitle: string
  /** 关联的测试用例数 */
  linkedTestCaseCount: number
  /** 关联的测试用例 ID 列表 */
  linkedTestCaseIds: string[]
  /** 覆盖状态 */
  coverageStatus: 'fully_covered' | 'partially_covered' | 'not_covered'
  /** 覆盖度评分（0-100） */
  coverageScore: number
  /** 未覆盖的原因 */
  uncoveredReasons: string[]
  /** 建议的测试类型 */
  recommendedTestTypes: string[]
  /** 建议的测试场景 */
  recommendedTestScenarios: string[]
}

/**
 * 追溯链健康度检查
 */
export interface TraceabilityHealthCheck {
  /** 总体健康度（0-100） */
  overallHealth: number
  /** 健康等级 */
  healthGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  /** 检查项列表 */
  checks: HealthCheckItem[]
  /** 问题列表 */
  issues: TraceabilityIssue[]
  /** 改进建议 */
  recommendations: string[]
  /** 检查时间 */
  checkedAt: string
}

/**
 * 健康检查项
 */
export interface HealthCheckItem {
  /** 检查项 ID */
  id: string
  /** 检查项名称 */
  name: string
  /** 检查结果 */
  passed: boolean
  /** 得分（0-100） */
  score: number
  /** 发现 */
  findings: string[]
}

/**
 * 追溯问题
 */
export interface TraceabilityIssue {
  /** 问题 ID */
  id: string
  /** 问题类型 */
  type: 'missing_link' | 'broken_link' | 'orphaned_test' | 'low_coverage' | 'inconsistent'
  /** 严重程度 */
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  /** 问题描述 */
  description: string
  /** 影响范围 */
  impact: string
  /** 建议修复方案 */
  remediation: string
  /** 相关实体 ID */
  relatedEntityIds: string[]
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 追溯链管理器类
 */
export class TraceabilityManager {
  private requirements: Map<string, RequirementEntity> = new Map()
  private testCases: Map<string, TestCaseEntity> = new Map()
  private links: Map<string, TraceabilityLink> = new Map()

  /**
   * 添加需求
   */
  addRequirement(requirement: RequirementEntity): void {
    this.requirements.set(requirement.id, requirement)
  }

  /**
   * 批量添加需求
   */
  addRequirements(requirements: RequirementEntity[]): void {
    requirements.forEach(req => this.addRequirement(req))
  }

  /**
   * 添加测试用例
   */
  addTestCase(testCase: TestCaseEntity): void {
    this.testCases.set(testCase.id, testCase)
  }

  /**
   * 批量添加测试用例
   */
  addTestCases(testCases: TestCaseEntity[]): void {
    testCases.forEach(tc => this.addTestCase(tc))
  }

  /**
   * 创建追溯链接
   */
  createLink(
    sourceId: string,
    targetId: string,
    type: TraceabilityLinkType,
    confidence: number = 1.0,
    comment?: string
  ): TraceabilityLink {
    const now = new Date().toISOString()
    const link: TraceabilityLink = {
      id: generateId(),
      sourceId,
      targetId,
      type,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      confidence,
      comment
    }

    this.links.set(link.id, link)

    // 更新实体的关联关系
    this.updateEntityLinks(link)

    return link
  }

  /**
   * 更新实体链接
   */
  private updateEntityLinks(link: TraceabilityLink): void {
    if (link.status !== 'active') return

    // 需求到测试的链接
    if (link.type === 'requirement_to_test') {
      const requirement = this.requirements.get(link.sourceId)
      const testCase = this.testCases.get(link.targetId)

      if (requirement && !requirement.linkedTestIds.includes(link.targetId)) {
        requirement.linkedTestIds.push(link.targetId)
        requirement.updatedAt = link.updatedAt
      }

      if (testCase && !testCase.linkedRequirementIds.includes(link.sourceId)) {
        testCase.linkedRequirementIds.push(link.sourceId)
        testCase.updatedAt = link.updatedAt
      }
    }

    // 测试到需求的链接
    if (link.type === 'test_to_requirement') {
      const testCase = this.testCases.get(link.sourceId)
      const requirement = this.requirements.get(link.targetId)

      if (testCase && !testCase.linkedRequirementIds.includes(link.targetId)) {
        testCase.linkedRequirementIds.push(link.targetId)
        testCase.updatedAt = link.updatedAt
      }

      if (requirement && !requirement.linkedTestIds.includes(link.sourceId)) {
        requirement.linkedTestIds.push(link.sourceId)
        requirement.updatedAt = link.updatedAt
      }
    }
  }

  /**
   * 删除追溯链接
   */
  removeLink(linkId: string): boolean {
    const link = this.links.get(linkId)
    if (!link) return false

    link.status = 'deprecated'
    link.updatedAt = new Date().toISOString()

    // 清除实体关联
    this.clearEntityLinks(link)

    return true
  }

  /**
   * 清除实体链接
   */
  private clearEntityLinks(link: TraceabilityLink): void {
    if (link.type === 'requirement_to_test' || link.type === 'test_to_requirement') {
      const reqId = link.type === 'requirement_to_test' ? link.sourceId : link.targetId
      const testId = link.type === 'requirement_to_test' ? link.targetId : link.sourceId

      const requirement = this.requirements.get(reqId)
      const testCase = this.testCases.get(testId)

      if (requirement) {
        requirement.linkedTestIds = requirement.linkedTestIds.filter(id => id !== testId)
        requirement.updatedAt = link.updatedAt
      }

      if (testCase) {
        testCase.linkedRequirementIds = testCase.linkedRequirementIds.filter(id => id !== reqId)
        testCase.updatedAt = link.updatedAt
      }
    }
  }

  /**
   * 获取需求的测试覆盖度
   */
  getRequirementCoverage(requirementId: string): CoverageAnalysisReport {
    const requirement = this.requirements.get(requirementId)
    if (!requirement) {
      throw new Error(`Requirement ${requirementId} not found`)
    }

    const linkedTestCaseIds = requirement.linkedTestIds
    const linkedTestCases = linkedTestCaseIds
      .map(id => this.testCases.get(id))
      .filter((tc): tc is TestCaseEntity => !!tc)

    let coverageStatus: CoverageAnalysisReport['coverageStatus'] = 'not_covered'
    let coverageScore = 0

    if (linkedTestCaseIds.length === 0) {
      coverageStatus = 'not_covered'
      coverageScore = 0
    } else if (linkedTestCaseIds.length >= 3) {
      coverageStatus = 'fully_covered'
      coverageScore = 100
    } else {
      coverageStatus = 'partially_covered'
      coverageScore = linkedTestCaseIds.length * 33
    }

    // 推荐测试类型
    const recommendedTestTypes = this.recommendTestTypes(requirement)
    const existingTestTypes = new Set(linkedTestCases.map(tc => tc.type))
    const missingTestTypes = recommendedTestTypes.filter(t => !existingTestTypes.has(t))

    return {
      requirementId,
      requirementTitle: requirement.title,
      linkedTestCaseCount: linkedTestCaseIds.length,
      linkedTestCaseIds,
      coverageStatus,
      coverageScore,
      uncoveredReasons: this.analyzeUncoveredReasons(requirement, linkedTestCases),
      recommendedTestTypes,
      recommendedTestScenarios: this.recommendTestScenarios(requirement, missingTestTypes)
    }
  }

  /**
   * 获取测试用例的需求来源
   */
  getTestSources(testCaseId: string): {
    testCase: TestCaseEntity
    linkedRequirements: RequirementEntity[]
    hasValidSource: boolean
    sourceCoverage: number
  } {
    const testCase = this.testCases.get(testCaseId)
    if (!testCase) {
      throw new Error(`TestCase ${testCaseId} not found`)
    }

    const linkedRequirements = testCase.linkedRequirementIds
      .map(id => this.requirements.get(id))
      .filter((req): req is RequirementEntity => !!req)

    const hasValidSource = linkedRequirements.length > 0
    const sourceCoverage = hasValidSource ? 100 : 0

    return {
      testCase,
      linkedRequirements,
      hasValidSource,
      sourceCoverage
    }
  }

  /**
   * 生成追溯矩阵
   */
  generateMatrix(name: string, description?: string): TraceabilityMatrix {
    const requirements = Array.from(this.requirements.values())
    const testCases = Array.from(this.testCases.values())
    const links = Array.from(this.links.values())

    const coverageStatistics = this.calculateCoverageStatistics(requirements, testCases, links)

    return {
      id: generateId(),
      name,
      description: description || '需求 - 测试追溯矩阵',
      requirements,
      testCases,
      links,
      coverageStatistics,
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * 计算覆盖度统计
   */
  private calculateCoverageStatistics(
    requirements: RequirementEntity[],
    testCases: TestCaseEntity[],
    links: TraceabilityLink[]
  ): CoverageStatistics {
    const coveredRequirements = requirements.filter(r => r.linkedTestIds.length > 0)
    const orphanedTestCases = testCases.filter(t => t.linkedRequirementIds.length === 0)
    const activeLinks = links.filter(l => l.status === 'active')
    const brokenLinks = links.filter(l => l.status === 'broken')

    const testsPerRequirement: Record<string, number> = {}
    requirements.forEach(req => {
      testsPerRequirement[req.id] = req.linkedTestIds.length
    })

    const requirementsPerTest: Record<string, number> = {}
    testCases.forEach(tc => {
      requirementsPerTest[tc.id] = tc.linkedRequirementIds.length
    })

    return {
      totalRequirements: requirements.length,
      coveredRequirements: coveredRequirements.length,
      uncoveredRequirements: requirements.length - coveredRequirements.length,
      requirementCoverage: requirements.length > 0
        ? Math.round((coveredRequirements.length / requirements.length) * 100)
        : 0,
      totalTestCases: testCases.length,
      validTestCases: testCases.filter(t => t.linkedRequirementIds.length > 0).length,
      orphanedTestCases: orphanedTestCases.length,
      testCaseValidity: testCases.length > 0
        ? Math.round(((testCases.length - orphanedTestCases.length) / testCases.length) * 100)
        : 0,
      totalLinks: links.length,
      activeLinks: activeLinks.length,
      brokenLinks: brokenLinks.length,
      linkHealth: links.length > 0
        ? Math.round((activeLinks.length / links.length) * 100)
        : 0,
      testsPerRequirement,
      requirementsPerTest
    }
  }

  /**
   * 健康度检查
   */
  performHealthCheck(): TraceabilityHealthCheck {
    const checks: HealthCheckItem[] = []
    const issues: TraceabilityIssue[] = []
    const recommendations: string[] = []

    const requirements = Array.from(this.requirements.values())
    const testCases = Array.from(this.testCases.values())
    const links = Array.from(this.links.values())

    // 检查 1: 需求覆盖度
    const coveredReqs = requirements.filter(r => r.linkedTestIds.length > 0)
    const coverageRate = requirements.length > 0
      ? (coveredReqs.length / requirements.length) * 100
      : 0
    
    checks.push({
      id: 'check-1',
      name: '需求测试覆盖度',
      passed: coverageRate >= 80,
      score: Math.round(coverageRate),
      findings: [
        `已覆盖需求：${coveredReqs.length}/${requirements.length}`,
        `覆盖度：${Math.round(coverageRate)}%`
      ]
    })

    if (coverageRate < 80) {
      const uncoveredReqs = requirements.filter(r => r.linkedTestIds.length === 0)
      issues.push({
        id: generateId(),
        type: 'low_coverage',
        severity: coverageRate < 50 ? 'CRITICAL' : 'HIGH',
        description: `需求测试覆盖度不足：${Math.round(coverageRate)}%`,
        impact: `${uncoveredReqs.length}个需求没有对应的测试用例`,
        remediation: '为未覆盖的需求创建测试用例',
        relatedEntityIds: uncoveredReqs.map(r => r.id)
      })
      recommendations.push(`为${uncoveredReqs.length}个未覆盖的需求创建测试用例`)
    }

    // 检查 2: 测试用例来源
    const orphanedTests = testCases.filter(t => t.linkedRequirementIds.length === 0)
    const orphanedRate = testCases.length > 0
      ? (orphanedTests.length / testCases.length) * 100
      : 0
    
    checks.push({
      id: 'check-2',
      name: '测试用例来源追溯',
      passed: orphanedRate <= 10,
      score: Math.round(100 - orphanedRate),
      findings: [
        `孤立测试用例：${orphanedTests.length}/${testCases.length}`,
        `孤立率：${Math.round(orphanedRate)}%`
      ]
    })

    if (orphanedRate > 10) {
      issues.push({
        id: generateId(),
        type: 'orphaned_test',
        severity: orphanedRate > 30 ? 'HIGH' : 'MEDIUM',
        description: `存在${orphanedTests.length}个孤立测试用例（无需求来源）`,
        impact: '测试用例缺乏来源追溯，可能导致无效测试',
        remediation: '为测试用例关联需求来源或删除无效测试',
        relatedEntityIds: orphanedTests.map(t => t.id)
      })
      recommendations.push(`审查${orphanedTests.length}个孤立测试用例的有效性`)
    }

    // 检查 3: 链接健康度
    const activeLinks = links.filter(l => l.status === 'active')
    const brokenLinks = links.filter(l => l.status === 'broken')
    const linkHealth = links.length > 0
      ? (activeLinks.length / links.length) * 100
      : 0
    
    checks.push({
      id: 'check-3',
      name: '追溯链接健康度',
      passed: linkHealth >= 90,
      score: Math.round(linkHealth),
      findings: [
        `活跃链接：${activeLinks.length}`,
        `断裂链接：${brokenLinks.length}`,
        `健康度：${Math.round(linkHealth)}%`
      ]
    })

    if (brokenLinks.length > 0) {
      issues.push({
        id: generateId(),
        type: 'broken_link',
        severity: brokenLinks.length > 5 ? 'HIGH' : 'MEDIUM',
        description: `存在${brokenLinks.length}个断裂的追溯链接`,
        impact: '追溯关系不完整，影响影响分析',
        remediation: '修复或删除断裂的链接',
        relatedEntityIds: brokenLinks.map(l => l.id)
      })
      recommendations.push(`修复${brokenLinks.length}个断裂的追溯链接`)
    }

    // 检查 4: 链接缺失
    const missingLinks = requirements.filter(r => r.linkedTestIds.length === 0)
    if (missingLinks.length > 0) {
      issues.push({
        id: generateId(),
        type: 'missing_link',
        severity: 'HIGH',
        description: `${missingLinks.length}个需求缺少测试链接`,
        impact: '需求无法验证，质量无法保证',
        remediation: '为每个需求创建至少一个测试用例',
        relatedEntityIds: missingLinks.map(r => r.id)
      })
    }

    // 计算总体健康度
    const totalScore = checks.reduce((sum, check) => sum + check.score, 0)
    const overallHealth = Math.round(totalScore / checks.length)
    const healthGrade = this.calculateHealthGrade(overallHealth)

    return {
      overallHealth,
      healthGrade,
      checks,
      issues,
      recommendations,
      checkedAt: new Date().toISOString()
    }
  }

  /**
   * 计算健康等级
   */
  private calculateHealthGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  /**
   * 推荐测试类型
   */
  private recommendTestTypes(requirement: RequirementEntity): string[] {
    const testTypes: string[] = []

    // 功能需求
    if (requirement.type === 'functional') {
      testTypes.push('unit', 'integration', 'system', 'acceptance')
    }

    // 非功能需求
    if (requirement.type === 'non_functional') {
      testTypes.push('system', 'performance', 'security')
    }

    // 接口需求
    if (requirement.type === 'interface') {
      testTypes.push('integration', 'contract')
    }

    // 约束需求
    if (requirement.type === 'constraint') {
      testTypes.push('compliance', 'security')
    }

    return testTypes
  }

  /**
   * 分析未覆盖原因
   */
  private analyzeUncoveredReasons(
    requirement: RequirementEntity,
    testCases: TestCaseEntity[]
  ): string[] {
    const reasons: string[] = []

    if (testCases.length === 0) {
      reasons.push('未创建任何测试用例')
    }

    if (requirement.status === 'draft') {
      reasons.push('需求仍处于草稿状态')
    }

    if (requirement.priority === 'LOW') {
      reasons.push('需求优先级较低')
    }

    if (requirement.description.length < 50) {
      reasons.push('需求描述过于简单，难以设计测试')
    }

    return reasons
  }

  /**
   * 推荐测试场景
   */
  private recommendTestScenarios(
    requirement: RequirementEntity,
    missingTestTypes: string[]
  ): string[] {
    const scenarios: string[] = []

    if (missingTestTypes.includes('acceptance')) {
      scenarios.push('创建验收测试场景（Given-When-Then 格式）')
    }

    if (missingTestTypes.includes('integration')) {
      scenarios.push('创建集成测试场景（与其他模块交互）')
    }

    if (missingTestTypes.includes('unit')) {
      scenarios.push('创建单元测试场景（测试核心逻辑）')
    }

    return scenarios
  }

  /**
   * 获取所有需求
   */
  getAllRequirements(): RequirementEntity[] {
    return Array.from(this.requirements.values())
  }

  /**
   * 获取所有测试用例
   */
  getAllTestCases(): TestCaseEntity[] {
    return Array.from(this.testCases.values())
  }

  /**
   * 获取所有链接
   */
  getAllLinks(): TraceabilityLink[] {
    return Array.from(this.links.values())
  }

  /**
   * 清除所有数据
   */
  clear(): void {
    this.requirements.clear()
    this.testCases.clear()
    this.links.clear()
  }
}

/**
 * 创建追溯链管理器实例
 */
export function createTraceabilityManager(): TraceabilityManager {
  return new TraceabilityManager()
}

export default {
  TraceabilityManager,
  createTraceabilityManager
}
