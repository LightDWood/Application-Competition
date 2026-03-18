/**
 * 需求图谱模块统一导出
 * 
 * @module knowledge-graph
 * @description 动态需求图谱系统，包括关系发现、影响分析、版本对比和复用发现功能
 */

// ==================== 数据模型 ====================
export {
  RequirementType,
  RequirementStatus,
  Priority,
  RelationshipType,
  ImpactLevel,
  RequirementNode,
  RelationshipEdge,
  KnowledgeGraph,
  VersionHistory,
  ImpactAnalysisResult,
  ImpactPath,
  VersionComparisonResult,
  ReuseRecommendation,
  GraphBuilderConfig,
  createId,
  createRequirementNode,
  createRelationshipEdge,
  createEmptyGraph,
} from './graph-model';

// ==================== 关系发现 ====================
export {
  RelationshipDiscoverer,
  RelationshipDiscoveryConfig,
  buildGraphWithRelationships,
} from './relationship-discovery';

// ==================== 影响分析 ====================
export {
  ImpactAnalyzer,
  ImpactAnalysisConfig,
  analyzeRequirementImpact,
  analyzeMultipleImpacts,
  getChangePropagation,
} from './impact-analysis';

// ==================== 版本对比 ====================
export {
  VersionStore,
  InMemoryVersionStore,
  VersionComparator,
  VersionManager,
  VersionComparisonResult,
  generateVersionComparisonReport,
  createVersionComparator,
  createVersionManager,
} from './version-comparison';

// ==================== 复用发现 ====================
export {
  ReuseDiscoverer,
  ReuseDiscoveryConfig,
  findReusableRequirements,
  discoverAllReuseRelationships,
  findReusablePatterns,
  calculateCrossProjectReusePotential,
} from './reuse-discovery';

// ==================== 使用示例 ====================

/**
 * 使用示例代码
 * 
 * @example
 * // 1. 创建需求节点
 * import {
 *   createRequirementNode,
 *   RequirementType,
 *   RequirementStatus,
 *   Priority,
 * } from './knowledge-graph';
 * 
 * const l1Req = createRequirementNode(
 *   '用户管理系统',
 *   '提供完整的用户管理功能',
 *   RequirementType.FUNCTIONAL,
 *   1,
 *   { status: RequirementStatus.APPROVED, priority: Priority.HIGH }
 * );
 * 
 * const l2Req = createRequirementNode(
 *   '用户注册功能',
 *   '支持用户通过邮箱注册',
 *   RequirementType.FUNCTIONAL,
 *   2,
 *   { projectId: 'PROJECT_001' }
 * );
 * 
 * @example
 * // 2. 构建图谱并发现关系
 * import {
 *   buildGraphWithRelationships,
 *   RelationshipDiscoverer,
 * } from './knowledge-graph';
 * 
 * const nodes = [l1Req, l2Req, ...];
 * const graph = buildGraphWithRelationships(nodes, {
 *   dependencyThreshold: 0.6,
 *   detectConflicts: true,
 * });
 * 
 * console.log(`图谱包含 ${graph.nodes.length} 个节点，${graph.edges.length} 条关系`);
 * 
 * @example
 * // 3. 影响分析
 * import { analyzeRequirementImpact } from './knowledge-graph';
 * 
 * const impactResult = analyzeRequirementImpact(l1Req.id, graph);
 * console.log(impactResult.report);
 * 
 * // 输出影响报告：
 * // # 需求影响分析报告
 * // ## 被分析需求
 * // - ID: REQ_xxx
 * // - 标题：用户管理系统
 * // ## 影响等级：🔴 高影响
 * // ## 直接影响：...
 * 
 * @example
 * // 4. 版本管理
 * import {
 *   createVersionManager,
 *   createVersionComparator,
 *   generateVersionComparisonReport,
 * } from './knowledge-graph';
 * 
 * const versionManager = createVersionManager();
 * versionManager.createRequirement(l1Req, 'admin');
 * 
 * // 更新需求
 * const updatedReq = { ...l1Req, title: '用户管理系统 V2', version: 2 };
 * versionManager.updateRequirement(updatedReq, l1Req, 'admin', ['title']);
 * 
 * // 对比版本
 * const comparator = createVersionManager();
 * const comparison = comparator.compareVersions(l1Req.id, 1, 2);
 * const report = generateVersionComparisonReport(comparison);
 * 
 * @example
 * // 5. 复用发现
 * import {
 *   findReusableRequirements,
 *   discoverAllReuseRelationships,
 *   findReusablePatterns,
 * } from './knowledge-graph';
 * 
 * // 查找与某需求相似的可复用需求
 * const recommendations = findReusableRequirements(targetReq, allReqs, {
 *   minSimilarityThreshold: 0.6,
 *   maxRecommendations: 5,
 * });
 * 
 * // 发现所有复用关系
 * const allReuseRels = discoverAllReuseRelationships(allReqs);
 * 
 * // 查找可复用模式
 * const patterns = findReusablePatterns(allReqs, 3);
 * console.log('常见模式:', patterns.map(p => p.pattern));
 * 
 * @example
 * // 6. 跨项目复用分析
 * import { calculateCrossProjectReusePotential } from './knowledge-graph';
 * 
 * const reusePotential = calculateCrossProjectReusePotential(
 *   projectA_Reqs,
 *   projectB_Reqs
 * );
 * 
 * console.log(`复用潜力分数：${reusePotential.potentialScore}`);
 * console.log(`共同模式：${reusePotential.commonPatterns.join(', ')}`);
 */

/**
 * API 快速参考
 * 
 * ## 数据模型
 * - `RequirementType`: 需求类型枚举
 * - `RequirementStatus`: 需求状态枚举
 * - `Priority`: 优先级枚举
 * - `RelationshipType`: 关系类型枚举
 * - `ImpactLevel`: 影响等级枚举
 * - `RequirementNode`: 需求节点接口
 * - `RelationshipEdge`: 关系边接口
 * - `KnowledgeGraph`: 图谱数据模型
 * 
 * ## 关系发现
 * - `RelationshipDiscoverer`: 关系发现器类
 * - `buildGraphWithRelationships()`: 构建包含关系的图谱
 * 
 * ## 影响分析
 * - `ImpactAnalyzer`: 影响分析器类
 * - `analyzeRequirementImpact()`: 分析单个需求的影响
 * - `analyzeMultipleImpacts()`: 分析多个需求的影响
 * - `getChangePropagation()`: 获取变更传播范围
 * 
 * ## 版本对比
 * - `VersionManager`: 版本管理器
 * - `VersionComparator`: 版本对比器
 * - `generateVersionComparisonReport()`: 生成对比报告
 * 
 * ## 复用发现
 * - `ReuseDiscoverer`: 复用发现器
 * - `findReusableRequirements()`: 查找可复用需求
 * - `discoverAllReuseRelationships()`: 发现所有复用关系
 * - `findReusablePatterns()`: 查找可复用模式
 * - `calculateCrossProjectReusePotential()`: 计算跨项目复用潜力
 */
