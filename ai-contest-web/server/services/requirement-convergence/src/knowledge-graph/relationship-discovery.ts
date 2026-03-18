/**
 * 关系自动发现算法
 * 基于规则和分析自动发现需求间的各种关系
 */

import {
  RequirementNode,
  RelationshipEdge,
  RelationshipType,
  KnowledgeGraph,
  createRelationshipEdge,
} from './graph-model';

/**
 * 关键词依赖映射表
 */
const DEPENDENCY_KEYWORDS: Record<string, string[]> = {
  '需要': ['需要', '依赖', '要求', '必须'],
  '前提': ['前提', '前置', '先决条件', '基础'],
  '之后': ['之后', '然后', '随后', '接着'],
  '基于': ['基于', '根据', '依据', '参照'],
  '集成': ['集成', '整合', '对接', '连接'],
  '使用': ['使用', '采用', '应用', '利用'],
};

/**
 * 冲突检测关键词
 */
const CONFLICT_KEYWORDS = [
  '禁止', '不允许', '不得', '不能',
  '必须不', '严禁', '避免', '排除',
];

/**
 * 关系发现配置接口
 */
export interface RelationshipDiscoveryConfig {
  /** 依赖关系检测阈值 */
  dependencyThreshold: number;
  
  /** 冲突检测阈值 */
  conflictThreshold: number;
  
  /** 是否使用关键词匹配 */
  useKeywordMatching: boolean;
  
  /** 是否使用语义分析 */
  useSemanticAnalysis: boolean;
  
  /** 自定义依赖关键词 */
  customDependencyKeywords?: Record<string, string[]>;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: RelationshipDiscoveryConfig = {
  dependencyThreshold: 0.6,
  conflictThreshold: 0.7,
  useKeywordMatching: true,
  useSemanticAnalysis: false,
};

/**
 * 关系发现器类
 */
export class RelationshipDiscoverer {
  private config: RelationshipDiscoveryConfig;

  constructor(config?: Partial<RelationshipDiscoveryConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 发现所有关系
   */
  discoverAllRelationships(nodes: RequirementNode[]): RelationshipEdge[] {
    const edges: RelationshipEdge[] = [];

    // 发现父子关系
    const parentChildEdges = this.discoverParentChildRelationships(nodes);
    edges.push(...parentChildEdges);

    // 发现依赖关系
    const dependencyEdges = this.discoverDependencyRelationships(nodes);
    edges.push(...dependencyEdges);

    // 发现冲突关系
    const conflictEdges = this.discoverConflictRelationships(nodes);
    edges.push(...conflictEdges);

    return edges;
  }

  /**
   * 发现父子关系（基于 L1/L2/L3 层级）
   * 
   * 规则：
   * - L1 节点可以作为 L2 节点的父节点
   * - L2 节点可以作为 L3 节点的父节点
   * - 基于标题关键词匹配确定具体父子关系
   */
  discoverParentChildRelationships(nodes: RequirementNode[]): RelationshipEdge[] {
    const edges: RelationshipEdge[] = [];
    const l1Nodes = nodes.filter(n => n.level === 1);
    const l2Nodes = nodes.filter(n => n.level === 2);
    const l3Nodes = nodes.filter(n => n.level === 3);

    // 为 L2 节点查找父节点（L1）
    for (const l2Node of l2Nodes) {
      const parent = this.findBestParent(l2Node, l1Nodes);
      if (parent) {
        edges.push(
          createRelationshipEdge(parent.id, l2Node.id, RelationshipType.PARENT_CHILD, {
            description: `层级分解：${parent.title} → ${l2Node.title}`,
          })
        );
      }
    }

    // 为 L3 节点查找父节点（L2）
    for (const l3Node of l3Nodes) {
      const parent = this.findBestParent(l3Node, l2Nodes);
      if (parent) {
        edges.push(
          createRelationshipEdge(parent.id, l3Node.id, RelationshipType.PARENT_CHILD, {
            description: `层级分解：${parent.title} → ${l3Node.title}`,
          })
        );
      }
    }

    return edges;
  }

  /**
   * 为节点查找最佳父节点
   */
  private findBestParent(
    child: RequirementNode,
    potentialParents: RequirementNode[]
  ): RequirementNode | null {
    if (potentialParents.length === 0) return null;

    // 计算与每个潜在父节点的相似度
    const scores = potentialParents.map(parent => ({
      parent,
      score: this.calculateParentChildScore(parent, child),
    }));

    // 按分数排序
    scores.sort((a, b) => b.score - a.score);

    // 如果最高分数超过阈值，则认为是父节点
    const threshold = 0.3;
    if (scores[0].score >= threshold) {
      return scores[0].parent;
    }

    // 如果没有找到合适的父节点，返回 ID 最接近的（可能是同一模块）
    return scores[0].parent;
  }

  /**
   * 计算父子关系分数
   */
  private calculateParentChildScore(parent: RequirementNode, child: RequirementNode): number {
    let score = 0;

    // 标题关键词匹配
    const parentKeywords = this.extractKeywords(parent.title);
    const childKeywords = this.extractKeywords(child.title);
    
    const commonKeywords = parentKeywords.filter(k => 
      childKeywords.includes(k)
    );
    
    if (commonKeywords.length > 0) {
      score += 0.4 * (commonKeywords.length / Math.max(parentKeywords.length, 1));
    }

    // 描述包含关系
    if (child.description.includes(parent.title)) {
      score += 0.3;
    }

    // 项目相同加分
    if (parent.projectId && parent.projectId === child.projectId) {
      score += 0.2;
    }

    // 标签重叠加分
    const commonTags = parent.tags.filter(t => child.tags.includes(t));
    if (commonTags.length > 0) {
      score += 0.1 * (commonTags.length / Math.max(parent.tags.length, 1));
    }

    return Math.min(score, 1.0);
  }

  /**
   * 提取标题中的关键词
   */
  private extractKeywords(text: string): string[] {
    // 简单的中文分词（按字符）
    const stopwords = ['的', '了', '和', '与', '及', '或', '等', '一个', '一种', '基于', '系统', '功能'];
    
    // 提取 2-4 个字符的词语
    const keywords: string[] = [];
    for (let i = 0; i < text.length - 1; i++) {
      for (let len = 2; len <= 4 && i + len <= text.length; len++) {
        const word = text.substring(i, i + len);
        if (!stopwords.includes(word) && /^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(word)) {
          keywords.push(word);
        }
      }
    }
    
    return [...new Set(keywords)];
  }

  /**
   * 发现依赖关系
   * 
   * 基于关键词匹配和语义分析识别依赖关系
   */
  discoverDependencyRelationships(nodes: RequirementNode[]): RelationshipEdge[] {
    const edges: RelationshipEdge[] = [];
    const keywords = this.config.customDependencyKeywords || DEPENDENCY_KEYWORDS;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;

        const source = nodes[i];
        const target = nodes[j];

        // 检查是否存在依赖关系
        const dependencyScore = this.calculateDependencyScore(source, target, keywords);

        if (dependencyScore >= this.config.dependencyThreshold) {
          edges.push(
            createRelationshipEdge(source.id, target.id, RelationshipType.DEPENDS_ON, {
              strength: dependencyScore,
              description: `依赖关系：${source.title} 依赖 ${target.title}`,
              attributes: {
                detectionMethod: 'keyword_matching',
                score: dependencyScore,
              },
            })
          );
        }
      }
    }

    return edges;
  }

  /**
   * 计算依赖关系分数
   */
  private calculateDependencyScore(
    source: RequirementNode,
    target: RequirementNode,
    keywords: Record<string, string[]>
  ): number {
    let score = 0;

    // 检查源需求描述中是否包含对目标需求的引用
    const sourceText = `${source.title} ${source.description}`.toLowerCase();
    const targetTitle = target.title.toLowerCase();

    // 直接标题引用
    if (sourceText.includes(targetTitle)) {
      score += 0.5;
    }

    // 关键词匹配
    for (const [category, words] of Object.entries(keywords)) {
      for (const word of words) {
        const pattern = `${word}.*${targetTitle}`;
        const regex = new RegExp(pattern, 'i');
        if (regex.test(sourceText)) {
          score += 0.3;
          break;
        }
      }
    }

    // 标签重叠
    const commonTags = source.tags.filter(t => target.tags.includes(t));
    if (commonTags.length > 0) {
      score += 0.1 * (commonTags.length / Math.max(source.tags.length, 1));
    }

    // 项目相同且类型相关
    if (source.projectId === target.projectId) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * 发现冲突关系
   * 
   * 检测资源冲突、逻辑冲突等
   */
  discoverConflictRelationships(nodes: RequirementNode[]): RelationshipEdge[] {
    const edges: RelationshipEdge[] = [];

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];

        // 跳过同一层级分解下的节点
        if (this.hasCommonParent(node1, node2, nodes)) {
          continue;
        }

        const conflictScore = this.calculateConflictScore(node1, node2);

        if (conflictScore >= this.config.conflictThreshold) {
          edges.push(
            createRelationshipEdge(node1.id, node2.id, RelationshipType.CONFLICTS_WITH, {
              strength: conflictScore,
              description: `潜在冲突：${node1.title} ↔ ${node2.title}`,
              attributes: {
                conflictType: this.detectConflictType(node1, node2),
                score: conflictScore,
              },
            })
          );
        }
      }
    }

    return edges;
  }

  /**
   * 计算冲突分数
   */
  private calculateConflictScore(node1: RequirementNode, node2: RequirementNode): number {
    let score = 0;

    const text1 = `${node1.title} ${node1.description}`.toLowerCase();
    const text2 = `${node2.title} ${node2.description}`.toLowerCase();

    // 检测冲突关键词
    for (const keyword of CONFLICT_KEYWORDS) {
      if ((text1.includes(keyword) && text2.includes(keyword)) ||
          (text1.includes(keyword) && this.isOppositeConcept(text1, text2))) {
        score += 0.3;
      }
    }

    // 资源竞争检测（都提到相同资源）
    const resources1 = this.extractResources(node1.description);
    const resources2 = this.extractResources(node2.description);
    const commonResources = resources1.filter(r => resources2.includes(r));
    
    if (commonResources.length > 0) {
      // 如果都需要同一个稀缺资源，可能存在冲突
      score += 0.2 * commonResources.length;
    }

    // 约束条件冲突
    const constraints1 = this.extractConstraints(node1.description);
    const constraints2 = this.extractConstraints(node2.description);
    
    if (this.hasConflictingConstraints(constraints1, constraints2)) {
      score += 0.4;
    }

    return Math.min(score, 1.0);
  }

  /**
   * 检测冲突类型
   */
  private detectConflictType(node1: RequirementNode, node2: RequirementNode): string {
    const resources1 = this.extractResources(node1.description);
    const resources2 = this.extractResources(node2.description);
    const commonResources = resources1.filter(r => resources2.includes(r));

    if (commonResources.length > 0) {
      return 'RESOURCE_CONFLICT';
    }

    const constraints1 = this.extractConstraints(node1.description);
    const constraints2 = this.extractConstraints(node2.description);

    if (this.hasConflictingConstraints(constraints1, constraints2)) {
      return 'CONSTRAINT_CONFLICT';
    }

    return 'LOGIC_CONFLICT';
  }

  /**
   * 提取资源名称
   */
  private extractResources(text: string): string[] {
    const resourcePatterns = [
      /服务器/gi, /数据库/gi, /内存/gi, /存储/gi,
      /带宽/gi, /CPU/gi, /GPU/gi, /接口/gi,
      /API/gi, /服务/gi, /模块/gi, /组件/gi,
    ];

    const resources: string[] = [];
    for (const pattern of resourcePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        resources.push(...matches);
      }
    }

    return [...new Set(resources)];
  }

  /**
   * 提取约束条件
   */
  private extractConstraints(text: string): string[] {
    const constraintPatterns = [
      /必须.*秒/gi,
      /不超过.*秒/gi,
      /至少.*个/gi,
      /最多.*个/gi,
      /大于.*%/gi,
      /小于.*%/gi,
      /在.*范围内/gi,
    ];

    const constraints: string[] = [];
    for (const pattern of constraintPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        constraints.push(...matches);
      }
    }

    return [...new Set(constraints)];
  }

  /**
   * 检测是否存在冲突的约束条件
   */
  private hasConflictingConstraints(constraints1: string[], constraints2: string[]): boolean {
    // 简单的冲突检测：一个要求"至少 X"，另一个要求"最多 Y"，且 X > Y
    const minRegex = /至少.*?(\d+)/;
    const maxRegex = /最多.*?(\d+)/;

    for (const c1 of constraints1) {
      for (const c2 of constraints2) {
        const minMatch = c1.match(minRegex);
        const maxMatch = c2.match(maxRegex);

        if (minMatch && maxMatch) {
          const minValue = parseInt(minMatch[1]);
          const maxValue = parseInt(maxMatch[1]);
          if (minValue > maxValue) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * 检测是否是相反概念
   */
  private isOppositeConcept(text1: string, text2: string): boolean {
    const opposites: [string, string][] = [
      ['增加', '减少'],
      ['提高', '降低'],
      ['扩大', '缩小'],
      ['开启', '关闭'],
      ['启用', '禁用'],
      ['允许', '禁止'],
      ['公开', '私有'],
      ['同步', '异步'],
    ];

    for (const [word1, word2] of opposites) {
      if ((text1.includes(word1) && text2.includes(word2)) ||
          (text1.includes(word2) && text2.includes(word1))) {
        return true;
      }
    }

    return false;
  }

  /**
   * 检查两个节点是否有共同父节点
   */
  private hasCommonParent(node1: RequirementNode, node2: RequirementNode, nodes: RequirementNode[]): boolean {
    const parents1 = nodes.filter(n => n.level < node1.level && node1.title.includes(n.title));
    const parents2 = nodes.filter(n => n.level < node2.level && node2.title.includes(n.title));

    return parents1.some(p1 => parents2.some(p2 => p1.id === p2.id));
  }

  /**
   * 发现复用关系（基于相似度）
   */
  discoverReuseRelationships(nodes: RequirementNode[], threshold: number = 0.7): RelationshipEdge[] {
    const edges: RelationshipEdge[] = [];

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];

        // 跳过已有父子关系或依赖关系的节点
        if (node1.level !== node2.level) {
          continue;
        }

        const similarity = this.calculateSimilarity(node1, node2);

        if (similarity >= threshold) {
          edges.push(
            createRelationshipEdge(node1.id, node2.id, RelationshipType.REUSES, {
              strength: similarity,
              description: `可复用：${node1.title} ≈ ${node2.title}`,
              attributes: {
                similarityScore: similarity,
              },
            })
          );
        }
      }
    }

    return edges;
  }

  /**
   * 计算两个节点的相似度
   */
  private calculateSimilarity(node1: RequirementNode, node2: RequirementNode): number {
    // 文本相似度
    const textSim = this.calculateTextSimilarity(node1, node2);

    // 结构相似度
    const structSim = this.calculateStructureSimilarity(node1, node2);

    // 加权平均
    return 0.7 * textSim + 0.3 * structSim;
  }

  /**
   * 计算文本相似度
   */
  private calculateTextSimilarity(node1: RequirementNode, node2: RequirementNode): number {
    const text1 = `${node1.title} ${node1.description}`;
    const text2 = `${node2.title} ${node2.description}`;

    // 使用 Jaccard 相似度
    const set1 = new Set(this.extractKeywords(text1));
    const set2 = new Set(this.extractKeywords(text2));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  /**
   * 计算结构相似度
   */
  private calculateStructureSimilarity(node1: RequirementNode, node2: RequirementNode): number {
    let score = 0;

    // 层级相同
    if (node1.level === node2.level) {
      score += 0.3;
    }

    // 类型相同
    if (node1.type === node2.type) {
      score += 0.3;
    }

    // 项目相同
    if (node1.projectId && node1.projectId === node2.projectId) {
      score += 0.2;
    }

    // 标签重叠
    const commonTags = node1.tags.filter(t => node2.tags.includes(t));
    if (commonTags.length > 0) {
      score += 0.2 * (commonTags.length / Math.max(node1.tags.length, 1));
    }

    return Math.min(score, 1.0);
  }
}

/**
 * 构建包含关系的图谱
 */
export function buildGraphWithRelationships(
  nodes: RequirementNode[],
  config?: Partial<RelationshipDiscoveryConfig>
): KnowledgeGraph {
  const discoverer = new RelationshipDiscoverer(config);
  const edges = discoverer.discoverAllRelationships(nodes);

  // 添加复用关系
  const reuseEdges = discoverer.discoverReuseRelationships(nodes);
  edges.push(...reuseEdges);

  const projectIds = [...new Set(nodes.filter(n => n.projectId).map(n => n.projectId!))];

  return {
    id: `GRAPH_${Date.now()}`,
    name: '需求图谱',
    nodes,
    edges,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      projectIds,
      nodeCount: nodes.length,
      edgeCount: edges.length,
    },
  };
}
