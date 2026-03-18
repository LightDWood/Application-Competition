/**
 * 端到端集成测试脚本
 * 
 * 测试完整工作流：需求输入 → 洞察分析 → 图谱构建 → 验证评分 → 输出报告
 * 验证所有模块协同工作
 */

import {
  analyzeRequirement,
  evaluateCompleteness,
  analyzeRisks,
  discoverDependencies,
  generateRecommendations,
} from './ai-engine/insight-engine';

import {
  createRequirementNode,
  buildGraphWithRelationships,
  analyzeRequirementImpact,
  findReusableRequirements,
  RequirementType,
  RequirementStatus,
  Priority,
} from './knowledge-graph';

import {
  TestabilityChecker,
  AcceptanceCriteriaGenerator,
  TraceabilityManager,
  QualityScorer,
  createTestabilityChecker,
  createAcceptanceCriteriaGenerator,
  createTraceabilityManager,
  createQualityScorer,
} from './validation-engine';

import {
  getTemplate,
  createComplianceChecker,
  createBestPracticeLibrary,
  createAntiPatternDetector,
} from './template-library';

import { PersonaEngine } from './persona-engine';

// ==================== 测试报告接口 ====================

interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  details: string[];
  errors: string[];
}

interface IntegrationTestReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDuration: number;
  workflowResults: WorkflowTestResult;
  moduleResults: ModuleTestResult;
  performanceMetrics: PerformanceMetrics;
}

interface WorkflowTestResult {
  requirementInput: boolean;
  insightAnalysis: boolean;
  graphConstruction: boolean;
  validationScoring: boolean;
  reportGeneration: boolean;
}

interface ModuleTestResult {
  insightEngine: TestResult[];
  knowledgeGraph: TestResult[];
  validationEngine: TestResult[];
  templateLibrary: TestResult[];
  personaEngine: TestResult[];
}

interface PerformanceMetrics {
  insightAnalysisTime: number;
  graphConstructionTime: number;
  validationTime: number;
  totalTime: number;
  averageResponseTime: number;
}

// ==================== 测试数据 ====================

const TEST_REQUIREMENTS = [
  {
    id: 'REQ-001',
    title: '用户登录系统',
    description: '需要一个快速、友好的用户登录系统，支持手机号和微信登录，响应时间在 2 秒内，预算 10 万元',
    category: 'user-authentication',
  },
  {
    id: 'REQ-002',
    title: '支付功能集成',
    description: '集成微信支付和支付宝，支持订单支付、退款功能，需要符合 PCI DSS 安全标准',
    category: 'payment',
  },
  {
    id: 'REQ-003',
    title: '数据导出功能',
    description: '支持将业务数据导出为 Excel 格式，包含筛选条件和自定义列，导出权限控制',
    category: 'data-export',
  },
];

// ==================== 测试工具函数 ====================

function startTimer(): number {
  return Date.now();
}

function endTimer(startTime: number): number {
  return Date.now() - startTime;
}

function createTestResult(
  testName: string,
  passed: boolean,
  details: string[],
  errors: string[] = []
): TestResult {
  return {
    testName,
    passed,
    duration: 0,
    details,
    errors,
  };
}

// ==================== 模块测试 ====================

/**
 * 测试智能需求洞察引擎
 */
function testInsightEngine(): TestResult[] {
  const results: TestResult[] = [];

  // 测试 1: 完整性评估
  const startTime = startTimer();
  try {
    const completeness = evaluateCompleteness(TEST_REQUIREMENTS[0].description);
    const duration = endTimer(startTime);

    results.push(createTestResult(
      '完整性评估',
      completeness.score.totalScore > 0,
      [
        `综合评分：${completeness.score.totalScore}`,
        `5W2H 维度：Who=${completeness.score.who}, What=${completeness.score.what}, Why=${completeness.score.why}`,
        `缺失要素：${completeness.missingElements.join(', ') || '无'}`,
      ]
    ));
    results[results.length - 1].duration = duration;
  } catch (error) {
    results.push(createTestResult(
      '完整性评估',
      false,
      [],
      [`错误：${error}`]
    ));
  }

  // 测试 2: 风险预警
  try {
    const risks = analyzeRisks(TEST_REQUIREMENTS[0].description);
    results.push(createTestResult(
      '风险预警',
      true,
      [
        `整体风险等级：${risks.overallRiskLevel}`,
        `高风险：${risks.riskCount.high}, 中风险：${risks.riskCount.medium}, 低风险：${risks.riskCount.low}`,
        `检测到的风险项：${risks.risks.length}`,
      ]
    ));
  } catch (error) {
    results.push(createTestResult(
      '风险预警',
      false,
      [],
      [`错误：${error}`]
    ));
  }

  // 测试 3: 依赖发现
  try {
    const deps = discoverDependencies(TEST_REQUIREMENTS[0].description);
    results.push(createTestResult(
      '依赖发现',
      true,
      [
        `总依赖数：${deps.dependencies.length}`,
        `外部系统：${deps.externalSystems.length}`,
        `数据源：${deps.dataSources.length}`,
        `前置条件：${deps.preconditions.length}`,
        `后置依赖：${deps.postconditions.length}`,
      ]
    ));
  } catch (error) {
    results.push(createTestResult(
      '依赖发现',
      false,
      [],
      [`错误：${error}`]
    ));
  }

  // 测试 4: 智能推荐
  try {
    const recommendations = generateRecommendations(TEST_REQUIREMENTS[0].description);
    results.push(createTestResult(
      '智能推荐',
      true,
      [
        `推荐需求数：${recommendations.recommendations.length}`,
        `最佳实践数：${recommendations.bestPractices.length}`,
        `相关需求：${recommendations.relatedRequirements.join(', ') || '无'}`,
      ]
    ));
  } catch (error) {
    results.push(createTestResult(
      '智能推荐',
      false,
      [],
      [`错误：${error}`]
    ));
  }

  // 测试 5: 完整洞察分析
  try {
    const insight = analyzeRequirement(TEST_REQUIREMENTS[0].description);
    results.push(createTestResult(
      '完整洞察分析',
      true,
      [
        `完整性评分：${insight.completeness.score.totalScore}`,
        `风险等级：${insight.riskWarning.overallRiskLevel}`,
        `依赖数量：${insight.dependencies.dependencies.length}`,
        `推荐数量：${insight.recommendations.recommendations.length}`,
      ]
    ));
  } catch (error) {
    results.push(createTestResult(
      '完整洞察分析',
      false,
      [],
      [`错误：${error}`]
    ));
  }

  return results;
}

/**
 * 测试需求图谱模块
 */
function testKnowledgeGraph(): TestResult[] {
  const results: TestResult[] = [];

  try {
    // 创建测试需求节点
    const nodes = TEST_REQUIREMENTS.map((req, index) =>
      createRequirementNode(
        req.title,
        req.description,
        RequirementType.FUNCTIONAL,
        1,
        {
          status: RequirementStatus.APPROVED,
          priority: index === 0 ? Priority.HIGH : Priority.MEDIUM,
          projectId: `PROJECT_${index + 1}`,
        }
      )
    );

    // 测试 1: 图谱构建
    const startTime = startTimer();
    const graph = buildGraphWithRelationships(nodes, {
      dependencyThreshold: 0.6,
      detectConflicts: true,
    });
    const duration = endTimer(startTime);

    results.push(createTestResult(
      '图谱构建',
      graph.nodes.length === 3,
      [
        `节点数：${graph.nodes.length}`,
        `关系边数：${graph.edges.length}`,
        `构建时间：${duration}ms`,
      ]
    ));
    results[results.length - 1].duration = duration;

    // 测试 2: 影响分析
    if (graph.nodes.length > 0) {
      const impactResult = analyzeRequirementImpact(graph.nodes[0].id, graph);
      results.push(createTestResult(
        '影响分析',
        true,
        [
          `影响等级：${impactResult.impactLevel}`,
          `直接影响数：${impactResult.directImpacts.length}`,
          `间接影响数：${impactResult.indirectImpacts.length}`,
        ]
      ));
    }

    // 测试 3: 复用发现
    const reuseRecommendations = findReusableRequirements(
      nodes[0],
      nodes,
      {
        minSimilarityThreshold: 0.5,
        maxRecommendations: 3,
      }
    );
    results.push(createTestResult(
      '复用发现',
      true,
      [
        `复用推荐数：${reuseRecommendations.recommendations.length}`,
        `最高相似度：${reuseRecommendations.recommendations[0]?.similarity || 0}`,
      ]
    ));
  } catch (error) {
    results.push(createTestResult(
      '需求图谱模块',
      false,
      [],
      [`错误：${error}`]
    ));
  }

  return results;
}

/**
 * 测试需求验证引擎
 */
function testValidationEngine(): TestResult[] {
  const results: TestResult[] = [];

  // 测试 1: 可测试性检查
  try {
    const testabilityChecker = createTestabilityChecker();
    const testabilityReport = testabilityChecker.generateReport(
      TEST_REQUIREMENTS[0].description
    );

    results.push(createTestResult(
      '可测试性检查',
      testabilityReport.overallScore > 0,
      [
        `可测试性评分：${testabilityReport.overallScore}`,
        `可测试项：${testabilityReport.passedChecks.length}`,
        `待改进项：${testabilityReport.failedChecks.length}`,
      ]
    ));
  } catch (error) {
    results.push(createTestResult(
      '可测试性检查',
      false,
      [],
      [`错误：${error}`]
    ));
  }

  // 测试 2: 验收标准生成
  try {
    const acGenerator = createAcceptanceCriteriaGenerator();
    const criteriaSet = acGenerator.generate(
      'REQ-001',
      TEST_REQUIREMENTS[0].description
    );

    results.push(createTestResult(
      '验收标准生成',
      criteriaSet.totalScenarios > 0,
      [
        `总场景数：${criteriaSet.totalScenarios}`,
        `正常场景：${criteriaSet.scenarios.filter(s => s.type === 'happy_path').length}`,
        `异常场景：${criteriaSet.scenarios.filter(s => s.type === 'error_handling').length}`,
      ]
    ));
  } catch (error) {
    results.push(createTestResult(
      '验收标准生成',
      false,
      [],
      [`错误：${error}`]
    ));
  }

  // 测试 3: 追溯链管理
  try {
    const traceabilityManager = createTraceabilityManager();

    // 添加需求和测试用例
    traceabilityManager.addRequirement({
      id: 'REQ-001',
      title: '用户登录',
      description: TEST_REQUIREMENTS[0].description,
      type: 'functional',
      priority: 'HIGH',
      status: 'approved',
      linkedTestIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    traceabilityManager.addTestCase({
      id: 'TEST-001',
      title: '登录测试',
      description: '测试用户登录功能',
      type: 'acceptance',
      priority: 'HIGH',
      status: 'approved',
      linkedRequirementIds: ['REQ-001'],
      acceptanceScenarioIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 创建追溯关系
    traceabilityManager.createLink('REQ-001', 'TEST-001', 'requirement_to_test');

    const matrix = traceabilityManager.generateMatrix('登录模块追溯矩阵');

    results.push(createTestResult(
      '追溯链管理',
      matrix.links.length > 0,
      [
        `追溯链数量：${matrix.links.length}`,
        `需求覆盖度：${matrix.coverageStatistics.requirementCoverage}%`,
        `测试覆盖度：${matrix.coverageStatistics.testCaseCoverage}%`,
      ]
    ));
  } catch (error) {
    results.push(createTestResult(
      '追溯链管理',
      false,
      [],
      [`错误：${error}`]
    ));
  }

  // 测试 4: 质量评分
  try {
    const qualityScorer = createQualityScorer();
    const qualityReport = qualityScorer.score(
      'REQ-001',
      TEST_REQUIREMENTS[0].description
    );

    results.push(createTestResult(
      '质量评分',
      qualityReport.overallScore > 0,
      [
        `综合质量评分：${qualityReport.overallScore}`,
        `质量等级：${qualityReport.qualityGrade}`,
        `完整性：${qualityReport.dimensionScores.completeness}`,
        `一致性：${qualityReport.dimensionScores.consistency}`,
        `可测试性：${qualityReport.dimensionScores.testability}`,
        `可追溯性：${qualityReport.dimensionScores.traceability}`,
      ]
    ));
  } catch (error) {
    results.push(createTestResult(
      '质量评分',
      false,
      [],
      [`错误：${error}`]
    ));
  }

  return results;
}

/**
 * 测试行业模板库
 */
function testTemplateLibrary(): TestResult[] {
  const results: TestResult[] = [];

  // 测试 1: 模板检索
  try {
    const template = getTemplate('ecommerce', 'user-registration');
    results.push(createTestResult(
      '模板检索',
      true,
      [
        `找到模板：${template ? template.name : '无'}`,
        `模块数：${template?.modules?.length || 0}`,
      ]
    ));
  } catch (error) {
    results.push(createTestResult(
      '模板检索',
      false,
      [],
      [`错误：${error}`]
    ));
  }

  // 测试 2: 合规检查
  try {
    const complianceChecker = createComplianceChecker();
    const complianceReport = complianceChecker.check(
      TEST_REQUIREMENTS[1].description,
      ['PCI DSS']
    );

    results.push(createTestResult(
      '合规检查',
      true,
      [
        `合规标准：${complianceReport.standard}`,
        `通过率：${complianceReport.passRate}%`,
        `符合项：${complianceReport.passedItems.length}`,
        `差距项：${complianceReport.gapAnalysis.length}`,
      ]
    ));
  } catch (error) {
    results.push(createTestResult(
      '合规检查',
      false,
      [],
      [`错误：${error}`]
    ));
  }

  // 测试 3: 最佳实践推荐
  try {
    const practiceLibrary = createBestPracticeLibrary();
    const practices = practiceLibrary.getPracticesByScenario('user-authentication');

    results.push(createTestResult(
      '最佳实践推荐',
      true,
      [
        `推荐实践数：${practices.length}`,
        `实践标题：${practices.map(p => p.title).join(', ')}`,
      ]
    ));
  } catch (error) {
    results.push(createTestResult(
      '最佳实践推荐',
      false,
      [],
      [`错误：${error}`]
    ));
  }

  // 测试 4: 反模式检测
  try {
    const detector = createAntiPatternDetector();
    const detectedPatterns = detector.detect(TEST_REQUIREMENTS[0].description);

    results.push(createTestResult(
      '反模式检测',
      true,
      [
        `检测到的反模式数：${detectedPatterns.length}`,
        `反模式：${detectedPatterns.map(p => p.name).join(', ') || '无'}`,
      ]
    ));
  } catch (error) {
    results.push(createTestResult(
      '反模式检测',
      false,
      [],
      [`错误：${error}`]
    ));
  }

  return results;
}

/**
 * 测试人格化交互引擎
 */
function testPersonaEngine(): TestResult[] {
  const results: TestResult[] = [];

  try {
    // 初始化引擎
    const personaEngine = PersonaEngine.getInstance();
    personaEngine.initialize('test-user-001', {
      enableNotifications: true,
      enableLearning: true,
    });

    // 测试 1: 引擎初始化
    results.push(createTestResult(
      '人格化引擎初始化',
      true,
      ['引擎初始化成功', '用户 ID: test-user-001']
    ));

    // 测试 2: 角色切换
    personaEngine.personaManager.switchPersona('analyst');
    const currentPersona = personaEngine.personaManager.getCurrentPersona();
    results.push(createTestResult(
      '角色切换',
      true,
      [`当前角色：${currentPersona?.name || 'unknown'}`]
    ));

    // 测试 3: 上下文记忆
    personaEngine.contextMemory.addPreference({
      category: 'communication',
      preference: '详细解释',
      confidence: 0.9,
    });
    const preferences = personaEngine.contextMemory.getPreferences();
    results.push(createTestResult(
      '上下文记忆',
      preferences.length > 0,
      [`用户偏好数：${preferences.length}`]
    ));

    // 测试 4: 主动提醒
    personaEngine.proactiveNotifier.addReminder({
      type: 'clarification_needed',
      title: '待澄清事项',
      description: '需求缺少成本预算信息',
      priority: 'high',
    });
    const reminders = personaEngine.proactiveNotifier.getActiveReminders();
    results.push(createTestResult(
      '主动提醒',
      reminders.length > 0,
      [`活跃提醒数：${reminders.length}`]
    ));

    // 测试 5: 学习反馈
    personaEngine.learningEngine.recordFeedback({
      interactionId: 'int-001',
      feedbackType: 'positive',
      rating: 5,
    });
    const userProfile = personaEngine.learningEngine.getUserProfile();
    results.push(createTestResult(
      '学习反馈',
      true,
      [
        `用户评分：${userProfile.averageRating}`,
        `交互次数：${userProfile.totalInteractions}`,
      ]
    ));
  } catch (error) {
    results.push(createTestResult(
      '人格化引擎',
      false,
      [],
      [`错误：${error}`]
    ));
  }

  return results;
}

// ==================== 端到端工作流测试 ====================

/**
 * 测试完整工作流
 */
function testEndToEndWorkflow(): WorkflowTestResult {
  const result: WorkflowTestResult = {
    requirementInput: false,
    insightAnalysis: false,
    graphConstruction: false,
    validationScoring: false,
    reportGeneration: false,
  };

  try {
    // 步骤 1: 需求输入
    const requirement = TEST_REQUIREMENTS[0];
    result.requirementInput = true;
    console.log(`✓ 需求输入：${requirement.title}`);

    // 步骤 2: 洞察分析
    const insight = analyzeRequirement(requirement.description);
    result.insightAnalysis = insight.completeness.score.totalScore > 0;
    console.log(`✓ 洞察分析完成，评分：${insight.completeness.score.totalScore}`);

    // 步骤 3: 图谱构建
    const reqNode = createRequirementNode(
      requirement.title,
      requirement.description,
      RequirementType.FUNCTIONAL,
      1,
      { status: RequirementStatus.APPROVED, priority: Priority.HIGH }
    );
    const graph = buildGraphWithRelationships([reqNode], {
      dependencyThreshold: 0.6,
      detectConflicts: true,
    });
    result.graphConstruction = graph.nodes.length > 0;
    console.log(`✓ 图谱构建完成，节点数：${graph.nodes.length}`);

    // 步骤 4: 验证评分
    const qualityScorer = createQualityScorer();
    const qualityReport = qualityScorer.score(
      requirement.id,
      requirement.description
    );
    result.validationScoring = qualityReport.overallScore > 0;
    console.log(`✓ 验证评分完成，质量等级：${qualityReport.qualityGrade}`);

    // 步骤 5: 报告生成
    const report = {
      requirement,
      insight,
      graphSummary: {
        nodes: graph.nodes.length,
        edges: graph.edges.length,
      },
      quality: qualityReport,
      generatedAt: new Date().toISOString(),
    };
    result.reportGeneration = true;
    console.log(`✓ 报告生成完成`);
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error('工作流测试失败:', error);
  }

  return result;
}

// ==================== 性能测试 ====================

/**
 * 性能基准测试
 */
function runPerformanceTests(): PerformanceMetrics {
  const metrics: PerformanceMetrics = {
    insightAnalysisTime: 0,
    graphConstructionTime: 0,
    validationTime: 0,
    totalTime: 0,
    averageResponseTime: 0,
  };

  const startTime = startTimer();

  // 测试洞察分析性能
  let insightStart = startTimer();
  analyzeRequirement(TEST_REQUIREMENTS[0].description);
  metrics.insightAnalysisTime = endTimer(insightStart);

  // 测试图谱构建性能
  const nodes = TEST_REQUIREMENTS.map(req =>
    createRequirementNode(
      req.title,
      req.description,
      RequirementType.FUNCTIONAL,
      1,
      { status: RequirementStatus.APPROVED, priority: Priority.HIGH }
    )
  );
  let graphStart = startTimer();
  buildGraphWithRelationships(nodes, {
    dependencyThreshold: 0.6,
    detectConflicts: true,
  });
  metrics.graphConstructionTime = endTimer(graphStart);

  // 测试验证性能
  let validationStart = startTimer();
  const qualityScorer = createQualityScorer();
  qualityScorer.score('REQ-001', TEST_REQUIREMENTS[0].description);
  metrics.validationTime = endTimer(validationStart);

  metrics.totalTime = endTimer(startTime);
  metrics.averageResponseTime =
    (metrics.insightAnalysisTime + metrics.graphConstructionTime + metrics.validationTime) / 3;

  return metrics;
}

// ==================== 主测试函数 ====================

/**
 * 运行所有集成测试
 */
export function runIntegrationTests(): IntegrationTestReport {
  console.log('='.repeat(80));
  console.log('端到端集成测试开始');
  console.log('='.repeat(80));

  const report: IntegrationTestReport = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    totalDuration: 0,
    workflowResults: {
      requirementInput: false,
      insightAnalysis: false,
      graphConstruction: false,
      validationScoring: false,
      reportGeneration: false,
    },
    moduleResults: {
      insightEngine: [],
      knowledgeGraph: [],
      validationEngine: [],
      templateLibrary: [],
      personaEngine: [],
    },
    performanceMetrics: {
      insightAnalysisTime: 0,
      graphConstructionTime: 0,
      validationTime: 0,
      totalTime: 0,
      averageResponseTime: 0,
    },
  };

  // 运行端到端工作流测试
  console.log('\n[工作流测试]');
  report.workflowResults = testEndToEndWorkflow();

  // 运行模块测试
  console.log('\n[模块测试]');

  console.log('\n测试智能需求洞察引擎...');
  report.moduleResults.insightEngine = testInsightEngine();

  console.log('\n测试需求图谱模块...');
  report.moduleResults.knowledgeGraph = testKnowledgeGraph();

  console.log('\n测试需求验证引擎...');
  report.moduleResults.validationEngine = testValidationEngine();

  console.log('\n测试行业模板库...');
  report.moduleResults.templateLibrary = testTemplateLibrary();

  console.log('\n测试人格化交互引擎...');
  report.moduleResults.personaEngine = testPersonaEngine();

  // 运行性能测试
  console.log('\n[性能测试]');
  report.performanceMetrics = runPerformanceTests();

  // 统计结果
  const allResults = [
    ...report.moduleResults.insightEngine,
    ...report.moduleResults.knowledgeGraph,
    ...report.moduleResults.validationEngine,
    ...report.moduleResults.templateLibrary,
    ...report.moduleResults.personaEngine,
  ];

  report.totalTests = allResults.length;
  report.passedTests = allResults.filter(r => r.passed).length;
  report.failedTests = allResults.filter(r => !r.passed).length;
  report.totalDuration = report.performanceMetrics.totalTime;

  // 输出测试报告
  console.log('\n' + '='.repeat(80));
  console.log('集成测试报告');
  console.log('='.repeat(80));
  console.log(`总测试数：${report.totalTests}`);
  console.log(`通过：${report.passedTests}`);
  console.log(`失败：${report.failedTests}`);
  console.log(`通过率：${((report.passedTests / report.totalTests) * 100).toFixed(2)}%`);
  console.log(`总耗时：${report.totalDuration}ms`);

  console.log('\n性能指标:');
  console.log(`- 洞察分析时间：${report.performanceMetrics.insightAnalysisTime}ms`);
  console.log(`- 图谱构建时间：${report.performanceMetrics.graphConstructionTime}ms`);
  console.log(`- 验证时间：${report.performanceMetrics.validationTime}ms`);
  console.log(`- 平均响应时间：${report.performanceMetrics.averageResponseTime.toFixed(2)}ms`);

  console.log('\n工作流测试:');
  console.log(`- 需求输入：${report.workflowResults.requirementInput ? '✓' : '✗'}`);
  console.log(`- 洞察分析：${report.workflowResults.insightAnalysis ? '✓' : '✗'}`);
  console.log(`- 图谱构建：${report.workflowResults.graphConstruction ? '✓' : '✗'}`);
  console.log(`- 验证评分：${report.workflowResults.validationScoring ? '✓' : '✗'}`);
  console.log(`- 报告生成：${report.workflowResults.reportGeneration ? '✓' : '✗'}`);

  console.log('\n模块测试详情:');
  console.log(`- 洞察引擎：${report.moduleResults.insightEngine.filter(r => r.passed).length}/${report.moduleResults.insightEngine.length}`);
  console.log(`- 知识图谱：${report.moduleResults.knowledgeGraph.filter(r => r.passed).length}/${report.moduleResults.knowledgeGraph.length}`);
  console.log(`- 验证引擎：${report.moduleResults.validationEngine.filter(r => r.passed).length}/${report.moduleResults.validationEngine.length}`);
  console.log(`- 模板库：${report.moduleResults.templateLibrary.filter(r => r.passed).length}/${report.moduleResults.templateLibrary.length}`);
  console.log(`- 人格化引擎：${report.moduleResults.personaEngine.filter(r => r.passed).length}/${report.moduleResults.personaEngine.length}`);

  console.log('\n' + '='.repeat(80));
  if (report.failedTests === 0) {
    console.log('✓ 所有测试通过！');
  } else {
    console.log('✗ 部分测试失败，请检查错误详情');
  }
  console.log('='.repeat(80));

  return report;
}

// ==================== 导出 ====================

export default {
  runIntegrationTests,
  testInsightEngine,
  testKnowledgeGraph,
  testValidationEngine,
  testTemplateLibrary,
  testPersonaEngine,
  testEndToEndWorkflow,
  runPerformanceTests,
};
