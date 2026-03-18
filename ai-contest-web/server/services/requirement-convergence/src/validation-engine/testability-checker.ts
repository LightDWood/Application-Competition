/**
 * 可测试性检查规则引擎
 * 
 * 提供需求可测试性检查能力，包括：
 * - 明确的验收标准检查
 * - 可量化指标验证
 * - 模糊词汇检测
 * - 边界条件明确性检查
 * - 可测试性评分（0-100）
 * - 改进建议生成
 * 
 * @packageDocumentation
 */

/**
 * 可测试性检查项类型
 */
export type TestabilityCheckType = 
  | 'acceptance_criteria'
  | 'quantifiable_metrics'
  | 'no_ambiguous_words'
  | 'boundary_conditions'

/**
 * 检查项严重程度
 */
export type TestabilitySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

/**
 * 可测试性检查项
 */
export interface TestabilityCheckItem {
  /** 检查项 ID */
  id: string
  /** 检查项名称 */
  name: string
  /** 检查项描述 */
  description: string
  /** 检查类型 */
  type: TestabilityCheckType
  /** 严重程度 */
  severity: TestabilitySeverity
  /** 检查规则/模式 */
  pattern?: RegExp
  /** 检查关键词 */
  keywords?: string[]
  /** 权重（用于评分计算） */
  weight: number
}

/**
 * 检查结果详情
 */
export interface TestabilityCheckDetail {
  /** 检查项 ID */
  itemId: string
  /** 检查项名称 */
  itemName: string
  /** 是否通过 */
  passed: boolean
  /** 得分（0-100） */
  score: number
  /** 发现的问题 */
  findings: string[]
  /** 改进建议 */
  recommendations: string[]
  /** 证据/示例 */
  evidence?: string[]
}

/**
 * 可测试性评分报告
 */
export interface TestabilityReport {
  /** 原始需求文本 */
  requirementText: string
  /** 总体可测试性评分（0-100） */
  overallScore: number
  /** 评级（A/B/C/D/F） */
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  /** 总检查项数 */
  totalItems: number
  /** 通过的检查项数 */
  passedItems: number
  /** 失败的检查项数 */
  failedItems: number
  /** 各维度得分 */
  dimensionScores: Record<TestabilityCheckType, number>
  /** 详细检查结果 */
  details: TestabilityCheckDetail[]
  /** 关键问题 */
  criticalIssues: string[]
  /** 改进建议优先级列表 */
  prioritizedRecommendations: PrioritizedRecommendation[]
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
  /** 影响范围 */
  impact: string
  /** 实施难度 */
  effort: 'LOW' | 'MEDIUM' | 'HIGH'
}

/**
 * 可测试性检查规则定义
 */
const TESTABILITY_CHECK_RULES: TestabilityCheckItem[] = [
  // 验收标准检查
  {
    id: 'tc-ac-1',
    name: '明确的验收标准',
    description: '需求应包含明确的验收标准，用于判断需求是否完成',
    type: 'acceptance_criteria',
    severity: 'CRITICAL',
    keywords: ['验收标准', '验收条件', '完成标准', '定义为', 'Definition of Done'],
    weight: 25
  },
  {
    id: 'tc-ac-2',
    name: '验收标准可验证',
    description: '验收标准应该是可验证的，而非主观描述',
    type: 'acceptance_criteria',
    severity: 'HIGH',
    pattern: /应 (?:该 | 当)|必须 | 需要 | 支持 | 提供/,
    weight: 15
  },
  
  // 可量化指标检查
  {
    id: 'tc-qm-1',
    name: '包含量化指标',
    description: '需求应包含可量化的性能指标、数量指标等',
    type: 'quantifiable_metrics',
    severity: 'CRITICAL',
    pattern: /\d+%|\d+ 个|\d+ 秒|\d+ms|\d+QPS|\d+TPS|\d+GB|\d+MB/,
    weight: 20
  },
  {
    id: 'tc-qm-2',
    name: '性能指标明确',
    description: '性能相关需求应有明确的响应时间、吞吐量等指标',
    type: 'quantifiable_metrics',
    severity: 'HIGH',
    keywords: ['性能', '响应时间', '吞吐量', '并发', 'QPS', 'TPS'],
    weight: 15
  },
  {
    id: 'tc-qm-3',
    name: '容量指标明确',
    description: '容量相关需求应有明确的数据量、用户量等指标',
    type: 'quantifiable_metrics',
    severity: 'MEDIUM',
    keywords: ['容量', '规模', '用户量', '数据量', '存储'],
    weight: 10
  },
  
  // 模糊词汇检查
  {
    id: 'tc-aw-1',
    name: '无主观模糊词汇',
    description: '不应包含主观、模糊的形容词',
    type: 'no_ambiguous_words',
    severity: 'HIGH',
    keywords: ['友好', '美观', '好用', '简单', '灵活', '强大', '快速', '迅速'],
    weight: 15
  },
  {
    id: 'tc-aw-2',
    name: '无不确定性词汇',
    description: '不应包含不确定的副词',
    type: 'no_ambiguous_words',
    severity: 'CRITICAL',
    keywords: ['可能', '大概', '应该', '也许', '或许', '基本上', '几乎', '左右', '大约'],
    weight: 20
  },
  {
    id: 'tc-aw-3',
    name: '无未量化程度词',
    description: '程度词应有具体的量化说明',
    type: 'no_ambiguous_words',
    severity: 'MEDIUM',
    keywords: ['多', '少', '高', '低', '大', '小', '经常', '偶尔', '定期'],
    weight: 10
  },
  
  // 边界条件检查
  {
    id: 'tc-bc-1',
    name: '明确的输入边界',
    description: '应明确输入数据的边界条件',
    type: 'boundary_conditions',
    severity: 'HIGH',
    keywords: ['输入', '参数', '数据', '范围', '限制', '最大', '最小'],
    weight: 15
  },
  {
    id: 'tc-bc-2',
    name: '异常处理明确',
    description: '应明确异常情况的处理方式',
    type: 'boundary_conditions',
    severity: 'HIGH',
    keywords: ['异常', '错误', '失败', '超时', '无效', '边界', '极端'],
    weight: 15
  },
  {
    id: 'tc-bc-3',
    name: '前置条件明确',
    description: '应明确需求的前置条件',
    type: 'boundary_conditions',
    severity: 'MEDIUM',
    keywords: ['前提', '前置条件', '在...之前', '当...时', '如果'],
    weight: 10
  },
  {
    id: 'tc-bc-4',
    name: '后置条件明确',
    description: '应明确需求的后置条件/预期结果',
    type: 'boundary_conditions',
    severity: 'MEDIUM',
    keywords: ['然后', '之后', '结果', '后果', '导致', '产生'],
    weight: 10
  }
]

/**
 * 模糊词汇到具体描述的映射（用于生成改进建议）
 */
const AMBIGUOUS_WORD_SUGGESTIONS: Record<string, string[]> = {
  '友好': ['符合无障碍设计标准', '用户满意度>90%', '新手引导完整'],
  '美观': ['符合 Material Design 规范', '通过视觉设计评审', '用户评分>4.5'],
  '好用': ['用户任务完成率>95%', '学习成本<10 分钟', '操作步骤<3 步'],
  '简单': ['操作步骤<3 步', '无需培训即可使用', '界面元素<5 个'],
  '灵活': ['支持自定义配置', '支持插件扩展', '可配置参数>10 个'],
  '强大': ['支持 10+ 种功能', '性能提升 50%+', '支持高并发场景'],
  '快速': ['在 2 秒内响应', '响应时间<500ms', '并发支持 1000+ QPS'],
  '迅速': ['在 2 秒内响应', '响应时间<500ms'],
  '可能': ['明确条件', '给出概率', '说明前提'],
  '大概': ['给出具体数值', '明确范围', '提供准确描述'],
  '应该': ['明确责任方', '说明约束条件', '给出确定性描述'],
  '也许': ['明确条件', '给出确定性描述'],
  '或许': ['明确条件', '给出确定性描述'],
  '基本上': ['给出具体范围', '说明例外情况'],
  '几乎': ['给出具体比例', '如 99%', '说明例外'],
  '左右': ['明确范围', '如±5%', '给出精确值'],
  '大约': ['给出精确数值', '明确范围'],
  '多': ['具体数量', '如 1000 个', '明确上限'],
  '少': ['具体数量', '如<10 个', '明确下限'],
  '高': ['具体数值', '如>90%', '明确基准'],
  '低': ['具体数值', '如<5%', '明确基准'],
  '大': ['具体尺寸', '如 10GB', '明确范围'],
  '小': ['具体尺寸', '如<1MB', '明确范围'],
  '经常': ['频率', '如每天 3 次', '明确时间间隔'],
  '偶尔': ['频率', '如每月 1-2 次', '明确条件'],
  '定期': ['周期', '如每周一次', '明确时间点']
}

/**
 * 可测试性检查器类
 */
export class TestabilityChecker {
  private checkRules: Map<string, TestabilityCheckItem> = new Map()

  constructor() {
    TESTABILITY_CHECK_RULES.forEach(rule => {
      this.checkRules.set(rule.id, rule)
    })
  }

  /**
   * 获取所有检查项
   */
  getAllCheckItems(): TestabilityCheckItem[] {
    return Array.from(this.checkRules.values())
  }

  /**
   * 按类型获取检查项
   */
  getCheckItemsByType(type: TestabilityCheckType): TestabilityCheckItem[] {
    return Array.from(this.checkRules.values()).filter(item => item.type === type)
  }

  /**
   * 按严重程度获取检查项
   */
  getCheckItemsBySeverity(severity: TestabilitySeverity): TestabilityCheckItem[] {
    return Array.from(this.checkRules.values()).filter(item => item.severity === severity)
  }

  /**
   * 执行可测试性检查
   * 
   * @param requirementText - 需求描述文本
   * @returns 检查结果详情
   */
  check(requirementText: string): TestabilityCheckDetail[] {
    const details: TestabilityCheckDetail[] = []

    for (const rule of this.checkRules.values()) {
      const detail = this.performCheck(rule, requirementText)
      details.push(detail)
    }

    return details
  }

  /**
   * 执行单个检查项
   */
  private performCheck(
    rule: TestabilityCheckItem,
    requirementText: string
  ): TestabilityCheckDetail {
    const findings: string[] = []
    const recommendations: string[] = []
    const evidence: string[] = []
    let passed = true
    let score = 100

    // 基于关键词检查
    if (rule.keywords && rule.keywords.length > 0) {
      const foundKeywords: string[] = []
      const missingKeywords: string[] = []

      for (const keyword of rule.keywords) {
        if (requirementText.includes(keyword)) {
          foundKeywords.push(keyword)
          evidence.push(`包含关键词："${keyword}"`)
        }
      }

      // 对于需要包含关键词的检查项
      if (['acceptance_criteria', 'boundary_conditions'].includes(rule.type)) {
        if (foundKeywords.length === 0) {
          passed = false
          score = 0
          findings.push(`未检测到${rule.type === 'acceptance_criteria' ? '验收标准' : '边界条件'}相关描述`)
          recommendations.push(`添加${rule.type === 'acceptance_criteria' ? '明确的验收标准' : '清晰的边界条件'}说明`)
        }
      }
      // 对于不应包含关键词的检查项（模糊词汇）
      else if (rule.type === 'no_ambiguous_words') {
        if (foundKeywords.length > 0) {
          passed = false
          score = Math.max(0, 100 - foundKeywords.length * 20)
          findings.push(`检测到模糊词汇：${foundKeywords.join(', ')}`)
          
          // 生成改进建议
          foundKeywords.forEach(keyword => {
            const suggestions = AMBIGUOUS_WORD_SUGGESTIONS[keyword]
            if (suggestions && suggestions.length > 0) {
              recommendations.push(`将"${keyword}"替换为：${suggestions[0]}`)
            } else {
              recommendations.push(`将"${keyword}"替换为具体可量化的描述`)
            }
          })
        }
      }
    }

    // 基于正则表达式检查
    if (rule.pattern) {
      const matches = requirementText.match(rule.pattern)
      if (matches && matches.length > 0) {
        evidence.push(`匹配模式：${matches.slice(0, 3).join(', ')}${matches.length > 3 ? '...' : ''}`)
        
        // 对于量化指标检查
        if (rule.type === 'quantifiable_metrics') {
          if (matches.length >= 2) {
            score = 100
          } else if (matches.length === 1) {
            score = 70
            findings.push('仅包含少量量化指标，建议补充更多可衡量数据')
          }
        }
      } else {
        // 未匹配到预期模式
        if (rule.type === 'quantifiable_metrics') {
          passed = false
          score = 0
          findings.push('未检测到量化指标')
          recommendations.push('添加具体的性能指标、数量指标等可量化数据')
        }
      }
    }

    // 根据严重程度调整评分权重
    const severityWeight: Record<TestabilitySeverity, number> = {
      CRITICAL: 1.0,
      HIGH: 0.8,
      MEDIUM: 0.6,
      LOW: 0.4
    }
    score = Math.round(score * severityWeight[rule.severity])

    return {
      itemId: rule.id,
      itemName: rule.name,
      passed,
      score,
      findings,
      recommendations,
      evidence: evidence.length > 0 ? evidence : undefined
    }
  }

  /**
   * 生成完整的可测试性报告
   * 
   * @param requirementText - 需求描述文本
   * @returns 可测试性报告
   */
  generateReport(requirementText: string): TestabilityReport {
    const details = this.check(requirementText)
    
    // 计算各维度得分
    const dimensionScores: Record<TestabilityCheckType, number> = {
      acceptance_criteria: 0,
      quantifiable_metrics: 0,
      no_ambiguous_words: 0,
      boundary_conditions: 0
    }
    
    const dimensionCounts: Record<TestabilityCheckType, number> = {
      acceptance_criteria: 0,
      quantifiable_metrics: 0,
      no_ambiguous_words: 0,
      boundary_conditions: 0
    }

    let totalScore = 0
    let totalWeight = 0
    let passedItems = 0
    let failedItems = 0
    const criticalIssues: string[] = []
    const allRecommendations: PrioritizedRecommendation[] = []

    for (const detail of details) {
      const rule = this.checkRules.get(detail.itemId)!
      
      // 计算维度得分
      dimensionScores[rule.type] += detail.score
      dimensionCounts[rule.type]++
      
      // 计算总体得分（加权平均）
      totalScore += detail.score * rule.weight
      totalWeight += rule.weight
      
      // 统计通过/失败项
      if (detail.passed) {
        passedItems++
      } else {
        failedItems++
        if (rule.severity === 'CRITICAL') {
          criticalIssues.push(`${detail.itemName}: ${detail.findings.join('; ')}`)
        }
      }
      
      // 收集建议
      detail.recommendations.forEach(rec => {
        allRecommendations.push({
          recommendation: rec,
          priority: rule.severity === 'CRITICAL' || rule.severity === 'HIGH' ? 'HIGH' : 
                   rule.severity === 'MEDIUM' ? 'MEDIUM' : 'LOW',
          impact: detail.itemName,
          effort: rule.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM'
        })
      })
    }

    // 计算维度平均分
    (Object.keys(dimensionScores) as TestabilityCheckType[]).forEach(type => {
      if (dimensionCounts[type] > 0) {
        dimensionScores[type] = Math.round(dimensionScores[type] / dimensionCounts[type])
      }
    })

    const overallScore = Math.round(totalScore / totalWeight)
    const grade = this.calculateGrade(overallScore)
    
    // 按优先级排序建议
    const prioritizedRecommendations = this.prioritizeRecommendations(allRecommendations)

    return {
      requirementText,
      overallScore,
      grade,
      totalItems: details.length,
      passedItems,
      failedItems,
      dimensionScores,
      details,
      criticalIssues,
      prioritizedRecommendations,
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * 计算评级
   */
  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  /**
   * 优先级排序建议
   */
  private prioritizeRecommendations(
    recommendations: PrioritizedRecommendation[]
  ): PrioritizedRecommendation[] {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
    
    // 去重
    const uniqueRecs = Array.from(
      new Map(recommendations.map(rec => [rec.recommendation, rec])).values()
    )
    
    // 按优先级排序
    return uniqueRecs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }

  /**
   * 清除检查结果
   */
  clearResults(): void {
    this.checkRules.clear()
    TESTABILITY_CHECK_RULES.forEach(rule => {
      this.checkRules.set(rule.id, rule)
    })
  }
}

/**
 * 创建可测试性检查器实例
 */
export function createTestabilityChecker(): TestabilityChecker {
  return new TestabilityChecker()
}

export default {
  TestabilityChecker,
  createTestabilityChecker,
  TESTABILITY_CHECK_RULES
}
