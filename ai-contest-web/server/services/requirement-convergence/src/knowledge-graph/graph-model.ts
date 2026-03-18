/**
 * 需求图谱数据模型
 * 定义需求节点、边和图谱的核心数据结构
 */

/**
 * 需求类型枚举
 */
export enum RequirementType {
  FUNCTIONAL = 'FUNCTIONAL',           // 功能需求
  NON_FUNCTIONAL = 'NON_FUNCTIONAL',   // 非功能需求
  BUSINESS = 'BUSINESS',               // 业务需求
  USER = 'USER',                       // 用户需求
  SYSTEM = 'SYSTEM',                   // 系统需求
  INTERFACE = 'INTERFACE',             // 接口需求
  CONSTRAINT = 'CONSTRAINT',           // 约束需求
}

/**
 * 需求状态枚举
 */
export enum RequirementStatus {
  DRAFT = 'DRAFT',                     // 草稿
  PROPOSED = 'PROPOSED',               // 已提议
  APPROVED = 'APPROVED',               // 已批准
  IN_PROGRESS = 'IN_PROGRESS',         // 进行中
  IMPLEMENTED = 'IMPLEMENTED',         // 已实现
  VERIFIED = 'VERIFIED',               // 已验证
  REJECTED = 'REJECTED',               // 已拒绝
  OBSOLETE = 'OBSOLETE',               // 已废弃
}

/**
 * 优先级枚举
 */
export enum Priority {
  CRITICAL = 'CRITICAL',               // 关键
  HIGH = 'HIGH',                       // 高
  MEDIUM = 'MEDIUM',                   // 中
  LOW = 'LOW',                         // 低
}

/**
 * 关系类型枚举
 */
export enum RelationshipType {
  PARENT_CHILD = 'PARENT_CHILD',       // 父子关系（层级分解）
  DEPENDS_ON = 'DEPENDS_ON',           // 依赖关系
  CONFLICTS_WITH = 'CONFLICTS_WITH',   // 冲突关系
  REUSES = 'REUSES',                   // 复用关系
  SIMILAR_TO = 'SIMILAR_TO',           // 相似关系
  REPLACES = 'REPLACES',               // 替代关系
  DUPLICATE_OF = 'DUPLICATE_OF',       // 重复关系
}

/**
 * 影响等级枚举
 */
export enum ImpactLevel {
  HIGH = 'HIGH',                       // 高影响
  MEDIUM = 'MEDIUM',                   // 中影响
  LOW = 'LOW',                         // 低影响
}

/**
 * 需求节点接口
 */
export interface RequirementNode {
  /** 唯一标识符 */
  id: string;
  
  /** 需求标题 */
  title: string;
  
  /** 需求详细描述 */
  description: string;
  
  /** 需求类型 */
  type: RequirementType;
  
  /** 当前状态 */
  status: RequirementStatus;
  
  /** 优先级 */
  priority: Priority;
  
  /** 层级（L1: 史诗，L2: 特性，L3: 用户故事） */
  level: 1 | 2 | 3;
  
  /** 所属项目 ID */
  projectId?: string;
  
  /** 创建者 */
  createdBy?: string;
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 最后更新时间 */
  updatedAt: Date;
  
  /** 版本号 */
  version: number;
  
  /** 标签列表 */
  tags: string[];
  
  /** 自定义属性（支持扩展） */
  attributes: Record<string, any>;
  
  /** 验收标准 */
  acceptanceCriteria?: string[];
  
  /** 关联的文档或资源 */
  references?: string[];
}

/**
 * 边的接口
 */
export interface RelationshipEdge {
  /** 唯一标识符 */
  id: string;
  
  /** 源节点 ID */
  sourceId: string;
  
  /** 目标节点 ID */
  targetId: string;
  
  /** 关系类型 */
  type: RelationshipType;
  
  /** 关系强度（0-1，用于相似、复用关系） */
  strength?: number;
  
  /** 关系描述 */
  description?: string;
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 自定义属性 */
  attributes?: Record<string, any>;
}

/**
 * 图谱数据模型
 */
export interface KnowledgeGraph {
  /** 图谱 ID */
  id: string;
  
  /** 图谱名称 */
  name: string;
  
  /** 节点集合 */
  nodes: RequirementNode[];
  
  /** 边集合 */
  edges: RelationshipEdge[];
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 最后更新时间 */
  updatedAt: Date;
  
  /** 图谱元数据 */
  metadata: {
    /** 项目 ID 列表 */
    projectIds: string[];
    /** 节点总数 */
    nodeCount: number;
    /** 边总数 */
    edgeCount: number;
    /** 自定义元数据 */
    [key: string]: any;
  };
}

/**
 * 版本历史接口
 */
export interface VersionHistory {
  /** 版本号 */
  version: number;
  
  /** 变更时间 */
  timestamp: Date;
  
  /** 变更者 */
  changedBy: string;
  
  /** 变更类型 */
  changeType: 'CREATE' | 'UPDATE' | 'DELETE';
  
  /** 变更描述 */
  description: string;
  
  /** 变更前的数据（更新/删除时） */
  previousData?: RequirementNode;
  
  /** 变更后的数据（创建/更新时） */
  newData?: RequirementNode;
}

/**
 * 影响分析结果接口
 */
export interface ImpactAnalysisResult {
  /** 被分析的需求 ID */
  requirementId: string;
  
  /** 直接影响列表 */
  directImpacts: RequirementNode[];
  
  /** 间接影响列表 */
  indirectImpacts: RequirementNode[];
  
  /** 影响等级 */
  impactLevel: ImpactLevel;
  
  /** 影响路径 */
  impactPaths: ImpactPath[];
  
  /** 影响报告 */
  report: string;
}

/**
 * 影响路径接口
 */
export interface ImpactPath {
  /** 路径起点 */
  from: string;
  
  /** 路径终点 */
  to: string;
  
  /** 路径中的节点 ID 列表 */
  path: string[];
  
  /** 路径长度 */
  length: number;
}

/**
 * 版本对比结果接口
 */
export interface VersionComparisonResult {
  /** 旧版本号 */
  oldVersion: number;
  
  /** 新版本号 */
  newVersion: number;
  
  /** 新增的需求 */
  added: RequirementNode[];
  
  /** 删除的需求 */
  removed: RequirementNode[];
  
  /** 修改的需求 */
  modified: {
    /** 旧需求 */
    old: RequirementNode;
    /** 新需求 */
    new: RequirementNode;
    /** 变更字段列表 */
    changedFields: string[];
  }[];
  
  /** 变更统计 */
  statistics: {
    addedCount: number;
    removedCount: number;
    modifiedCount: number;
    totalChanges: number;
  };
  
  /** 变更时间线 */
  timeline: VersionHistory[];
}

/**
 * 复用推荐结果接口
 */
export interface ReuseRecommendation {
  /** 源需求 ID */
  sourceId: string;
  
  /** 推荐的需求 ID */
  targetId: string;
  
  /** 综合相似度分数 */
  similarityScore: number;
  
  /** 文本相似度分数 */
  textSimilarity: number;
  
  /** 结构相似度分数 */
  structureSimilarity: number;
  
  /** 推荐原因 */
  reasons: string[];
}

/**
 * 图谱构建配置接口
 */
export interface GraphBuilderConfig {
  /** 是否自动发现父子关系 */
  autoDetectParentChild: boolean;
  
  /** 是否自动发现依赖关系 */
  autoDetectDependencies: boolean;
  
  /** 是否检测冲突关系 */
  detectConflicts: boolean;
  
  /** 是否发现复用关系 */
  detectReuse: boolean;
  
  /** 依赖关系检测阈值 */
  dependencyThreshold: number;
  
  /** 复用关系检测阈值 */
  reuseThreshold: number;
}

/**
 * 辅助函数：创建唯一 ID
 */
export function createId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * 辅助函数：创建需求节点
 */
export function createRequirementNode(
  title: string,
  description: string,
  type: RequirementType,
  level: 1 | 2 | 3,
  overrides?: Partial<RequirementNode>
): RequirementNode {
  const now = new Date();
  return {
    id: createId('REQ'),
    title,
    description,
    type,
    status: RequirementStatus.DRAFT,
    priority: Priority.MEDIUM,
    level,
    createdAt: now,
    updatedAt: now,
    version: 1,
    tags: [],
    attributes: {},
    ...overrides,
  };
}

/**
 * 辅助函数：创建关系边
 */
export function createRelationshipEdge(
  sourceId: string,
  targetId: string,
  type: RelationshipType,
  overrides?: Partial<RelationshipEdge>
): RelationshipEdge {
  return {
    id: createId('REL'),
    sourceId,
    targetId,
    type,
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * 辅助函数：创建空图谱
 */
export function createEmptyGraph(
  name: string,
  id?: string
): KnowledgeGraph {
  const now = new Date();
  return {
    id: id || createId('GRAPH'),
    name,
    nodes: [],
    edges: [],
    createdAt: now,
    updatedAt: now,
    metadata: {
      projectIds: [],
      nodeCount: 0,
      edgeCount: 0,
    },
  };
}
