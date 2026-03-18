/**
 * 影响范围分析引擎
 * 分析需求变更的直接影响和间接影响
 */

import {
  RequirementNode,
  RelationshipEdge,
  RelationshipType,
  ImpactAnalysisResult,
  ImpactPath,
  ImpactLevel,
  KnowledgeGraph,
} from './graph-model';

/**
 * 影响分析配置接口
 */
export interface ImpactAnalysisConfig {
  /** 最大传播深度 */
  maxDepth: number;
  
  /** 影响等级阈值 */
  highImpactThreshold: number;
  mediumImpactThreshold: number;
  
  /** 是否考虑间接影响 */
  considerIndirectImpacts: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: ImpactAnalysisConfig = {
  maxDepth: 5,
  highImpactThreshold: 3,
  mediumImpactThreshold: 1,
  considerIndirectImpacts: true,
};

/**
 * 影响分析引擎类
 */
export class ImpactAnalyzer {
  private config: ImpactAnalysisConfig;
  private adjacencyList: Map<string, string[]> = new Map();

  constructor(config?: Partial<ImpactAnalysisConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 构建邻接表
   */
  private buildAdjacencyList(edges: RelationshipEdge[]): void {
    this.adjacencyList.clear();

    // 只考虑依赖关系（A 依赖 B，则 B 变更会影响 A）
    const dependencyEdges = edges.filter(e => e.type === RelationshipType.DEPENDS_ON);

    for (const edge of dependencyEdges) {
      // source 依赖 target，所以 target 变更会影响 source
      const targetId = edge.targetId;
      const sourceId = edge.sourceId;

      if (!this.adjacencyList.has(targetId)) {
        this.adjacencyList.set(targetId, []);
      }
      this.adjacencyList.get(targetId)!.push(sourceId);
    }
  }

  /**
   * 分析需求变更的影响范围
   */
  analyzeImpact(
    requirementId: string,
    nodes: RequirementNode[],
    edges: RelationshipEdge[]
  ): ImpactAnalysisResult {
    // 构建邻接表
    this.buildAdjacencyList(edges);

    // 查找被分析的需求节点
    const requirement = nodes.find(n => n.id === requirementId);
    if (!requirement) {
      throw new Error(`需求节点不存在：${requirementId}`);
    }

    // 收集直接影响
    const directImpacts = this.findDirectImpacts(requirementId, nodes);

    // 收集间接影响
    const indirectImpacts = this.config.considerIndirectImpacts
      ? this.findIndirectImpacts(requirementId, nodes)
      : [];

    // 计算影响等级
    const impactLevel = this.calculateImpactLevel(directImpacts.length, indirectImpacts.length);

    // 生成影响路径
    const impactPaths = this.findImpactPaths(requirementId, nodes);

    // 生成影响报告
    const report = this.generateImpactReport(
      requirement,
      directImpacts,
      indirectImpacts,
      impactLevel,
      impactPaths
    );

    return {
      requirementId,
      directImpacts,
      indirectImpacts,
      impactLevel,
      impactPaths,
      report,
    };
  }

  /**
   * 查找直接影响（直接依赖该需求的需求）
   */
  private findDirectImpacts(requirementId: string, nodes: RequirementNode[]): RequirementNode[] {
    const directImpactIds = this.adjacencyList.get(requirementId) || [];
    return nodes.filter(n => directImpactIds.includes(n.id));
  }

  /**
   * 查找间接影响（通过依赖链传递的影响）
   */
  private findIndirectImpacts(
    requirementId: string,
    nodes: RequirementNode[]
  ): RequirementNode[] {
    const visited = new Set<string>([requirementId]);
    const queue: string[] = [requirementId];
    const indirectImpactIds = new Set<string>();

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const neighbors = this.adjacencyList.get(currentId) || [];

      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          indirectImpactIds.add(neighborId);
          
          // 如果未达到最大深度，继续传播
          const depth = this.calculateDepth(requirementId, neighborId, nodes);
          if (depth < this.config.maxDepth) {
            queue.push(neighborId);
          }
        }
      }
    }

    // 排除直接影响
    const directImpactIds = new Set(this.adjacencyList.get(requirementId) || []);
    const trueIndirectIds = [...indirectImpactIds].filter(id => !directImpactIds.has(id));

    return nodes.filter(n => trueIndirectIds.includes(n.id));
  }

  /**
   * 计算从起点到终点的深度
   */
  private calculateDepth(
    startId: string,
    endId: string,
    nodes: RequirementNode[]
  ): number {
    const visited = new Set<string>([startId]);
    const queue: [string, number][] = [[startId, 0]];

    while (queue.length > 0) {
      const [currentId, depth] = queue.shift()!;

      if (currentId === endId) {
        return depth;
      }

      const neighbors = this.adjacencyList.get(currentId) || [];
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push([neighborId, depth + 1]);
        }
      }
    }

    return -1; // 未找到路径
  }

  /**
   * 计算影响等级
   */
  private calculateImpactLevel(directCount: number, indirectCount: number): ImpactLevel {
    const totalCount = directCount + indirectCount;

    if (totalCount >= this.config.highImpactThreshold) {
      return ImpactLevel.HIGH;
    }

    if (totalCount >= this.config.mediumImpactThreshold) {
      return ImpactLevel.MEDIUM;
    }

    return ImpactLevel.LOW;
  }

  /**
   * 查找所有影响路径
   */
  private findImpactPaths(requirementId: string, nodes: RequirementNode[]): ImpactPath[] {
    const paths: ImpactPath[] = [];
    const visited = new Set<string>();

    const dfs = (currentId: string, path: string[]): void => {
      const neighbors = this.adjacencyList.get(currentId) || [];

      if (neighbors.length === 0 && path.length > 1) {
        // 到达叶子节点，记录路径
        paths.push({
          from: requirementId,
          to: currentId,
          path: [...path],
          length: path.length - 1,
        });
        return;
      }

      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          path.push(neighborId);
          dfs(neighborId, path);
          path.pop();
          visited.delete(neighborId);
        }
      }
    };

    visited.add(requirementId);
    dfs(requirementId, [requirementId]);

    return paths;
  }

  /**
   * 生成影响报告
   */
  private generateImpactReport(
    requirement: RequirementNode,
    directImpacts: RequirementNode[],
    indirectImpacts: RequirementNode[],
    impactLevel: ImpactLevel,
    impactPaths: ImpactPath[]
  ): string {
    const lines: string[] = [];

    lines.push(`# 需求影响分析报告`);
    lines.push(``);
    lines.push(`## 被分析需求`);
    lines.push(`- **ID**: ${requirement.id}`);
    lines.push(`- **标题**: ${requirement.title}`);
    lines.push(`- **类型**: ${requirement.type}`);
    lines.push(`- **状态**: ${requirement.status}`);
    lines.push(``);

    lines.push(`## 影响等级`);
    lines.push(`**${this.getImpactLevelText(impactLevel)}**`);
    lines.push(``);

    lines.push(`## 影响统计`);
    lines.push(`- 直接影响数量：${directImpacts.length}`);
    lines.push(`- 间接影响数量：${indirectImpacts.length}`);
    lines.push(`- 总影响数量：${directImpacts.length + indirectImpacts.length}`);
    lines.push(`- 影响路径数量：${impactPaths.length}`);
    lines.push(``);

    if (directImpacts.length > 0) {
      lines.push(`## 直接影响`);
      lines.push(`以下需求直接依赖于 "${requirement.title}"：`);
      lines.push(``);
      for (const impact of directImpacts) {
        lines.push(`- [${impact.id}] ${impact.title} (${impact.status})`);
      }
      lines.push(``);
    }

    if (indirectImpacts.length > 0) {
      lines.push(`## 间接影响`);
      lines.push(`以下需求通过依赖链间接受到影响：`);
      lines.push(``);
      for (const impact of indirectImpacts) {
        lines.push(`- [${impact.id}] ${impact.title} (${impact.status})`);
      }
      lines.push(``);
    }

    if (impactPaths.length > 0) {
      lines.push(`## 影响路径示例`);
      lines.push(`前 5 条影响路径：`);
      lines.push(``);
      for (let i = 0; i < Math.min(5, impactPaths.length); i++) {
        const path = impactPaths[i];
        lines.push(`${i + 1}. ${path.path.join(' → ')}`);
      }
      lines.push(``);
    }

    lines.push(`## 建议`);
    lines.push(this.generateRecommendations(requirement, directImpacts, indirectImpacts, impactLevel));

    return lines.join('\n');
  }

  /**
   * 获取影响等级的文本描述
   */
  private getImpactLevelText(level: ImpactLevel): string {
    switch (level) {
      case ImpactLevel.HIGH:
        return '🔴 高影响 - 需要仔细评估变更风险';
      case ImpactLevel.MEDIUM:
        return '🟡 中影响 - 需要关注相关需求';
      case ImpactLevel.LOW:
        return '🟢 低影响 - 变更风险可控';
    }
  }

  /**
   * 生成建议
   */
  private generateRecommendations(
    requirement: RequirementNode,
    directImpacts: RequirementNode[],
    indirectImpacts: RequirementNode[],
    impactLevel: ImpactLevel
  ): string {
    const recommendations: string[] = [];

    if (impactLevel === ImpactLevel.HIGH) {
      recommendations.push('1. **变更评审**: 建议组织变更评审会议，邀请所有受影响需求的负责人参与');
      recommendations.push('2. **回归测试**: 制定全面的回归测试计划，覆盖所有受影响的功能');
      recommendations.push('3. **分阶段实施**: 考虑分阶段实施变更，降低风险');
    } else if (impactLevel === ImpactLevel.MEDIUM) {
      recommendations.push('1. **通知相关方**: 通知受影响需求的负责人和利益相关者');
      recommendations.push('2. **影响评估**: 详细评估变更对每个受影响需求的具体影响');
    } else {
      recommendations.push('1. **常规变更流程**: 按照标准变更流程执行');
      recommendations.push('2. **文档更新**: 确保相关文档得到及时更新');
    }

    // 根据状态提供建议
    const implementedCount = [...directImpacts, ...indirectImpacts].filter(
      n => n.status === 'IMPLEMENTED' || n.status === 'VERIFIED'
    ).length;

    if (implementedCount > 0) {
      recommendations.push(`3. **已实现需求**: 有 ${implementedCount} 个受影响需求已实现，需要特别注意回归测试`);
    }

    return recommendations.join('\n');
  }

  /**
   * 分析多个需求的变更影响
   */
  analyzeMultipleImpacts(
    requirementIds: string[],
    nodes: RequirementNode[],
    edges: RelationshipEdge[]
  ): ImpactAnalysisResult[] {
    return requirementIds.map(id => this.analyzeImpact(id, nodes, edges));
  }

  /**
   * 获取变更传播范围（BFS）
   */
  getChangePropagation(
    requirementId: string,
    nodes: RequirementNode[],
    edges: RelationshipEdge[],
    maxDepth: number = 3
  ): { level: number; nodes: RequirementNode[] }[] {
    this.buildAdjacencyList(edges);

    const result: { level: number; nodes: RequirementNode[] }[] = [];
    const visited = new Set<string>([requirementId]);
    const queue: [string, number][] = [[requirementId, 0]];

    while (queue.length > 0) {
      const [currentId, depth] = queue.shift()!;

      if (depth > maxDepth) continue;

      if (!result[depth]) {
        result[depth] = { level: depth, nodes: [] };
      }

      if (depth > 0) {
        const node = nodes.find(n => n.id === currentId);
        if (node) {
          result[depth].nodes.push(node);
        }
      }

      const neighbors = this.adjacencyList.get(currentId) || [];
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push([neighborId, depth + 1]);
        }
      }
    }

    return result.filter(r => r.nodes.length > 0);
  }
}

/**
 * 便捷函数：分析单个需求的影响
 */
export function analyzeRequirementImpact(
  requirementId: string,
  graph: KnowledgeGraph,
  config?: Partial<ImpactAnalysisConfig>
): ImpactAnalysisResult {
  const analyzer = new ImpactAnalyzer(config);
  return analyzer.analyzeImpact(requirementId, graph.nodes, graph.edges);
}

/**
 * 便捷函数：分析多个需求的影响
 */
export function analyzeMultipleImpacts(
  requirementIds: string[],
  graph: KnowledgeGraph,
  config?: Partial<ImpactAnalysisConfig>
): ImpactAnalysisResult[] {
  const analyzer = new ImpactAnalyzer(config);
  return analyzer.analyzeMultipleImpacts(requirementIds, graph.nodes, graph.edges);
}

/**
 * 便捷函数：获取变更传播范围
 */
export function getChangePropagation(
  requirementId: string,
  graph: KnowledgeGraph,
  maxDepth?: number
): { level: number; nodes: RequirementNode[] }[] {
  const analyzer = new ImpactAnalyzer();
  return analyzer.getChangePropagation(requirementId, graph.nodes, graph.edges, maxDepth);
}
