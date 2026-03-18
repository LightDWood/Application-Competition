/**
 * 版本对比功能
 * 对比需求版本差异，提供变更高亮和时间线可视化
 */

import {
  RequirementNode,
  VersionHistory,
  VersionComparisonResult,
  createId,
} from './graph-model';

/**
 * 版本存储接口
 */
export interface VersionStore {
  /** 获取所有版本历史 */
  getHistory(requirementId: string): VersionHistory[];
  
  /** 获取指定版本 */
  getVersion(requirementId: string, version: number): RequirementNode | null;
  
  /** 添加版本记录 */
  addVersion(history: VersionHistory): void;
}

/**
 * 内存版本存储实现
 */
export class InMemoryVersionStore implements VersionStore {
  private historyMap: Map<string, VersionHistory[]> = new Map();

  getHistory(requirementId: string): VersionHistory[] {
    return this.historyMap.get(requirementId) || [];
  }

  getVersion(requirementId: string, version: number): RequirementNode | null {
    const history = this.getHistory(requirementId);
    const record = history.find(h => h.version === version);
    return record ? (record.newData || null) : null;
  }

  addVersion(history: VersionHistory): void {
    const { requirementId } = history.newData || history.previousData || {};
    if (!requirementId) return;

    if (!this.historyMap.has(requirementId)) {
      this.historyMap.set(requirementId, []);
    }
    this.historyMap.get(requirementId)!.push(history);
  }

  /**
   * 清除存储
   */
  clear(): void {
    this.historyMap.clear();
  }
}

/**
 * 版本对比器类
 */
export class VersionComparator {
  private store: VersionStore;

  constructor(store: VersionStore) {
    this.store = store;
  }

  /**
   * 对比两个版本的差异
   */
  compareVersions(
    requirementId: string,
    oldVersion: number,
    newVersion: number
  ): VersionComparisonResult | null {
    const oldNode = this.store.getVersion(requirementId, oldVersion);
    const newNode = this.store.getVersion(requirementId, newVersion);

    if (!oldNode && !newNode) {
      return null;
    }

    // 获取版本历史
    const history = this.store.getHistory(requirementId);
    const timeline = history
      .filter(h => h.version >= oldVersion && h.version <= newVersion)
      .sort((a, b) => a.version - b.version);

    // 如果只有新版本（创建）
    if (!oldNode && newNode) {
      return {
        oldVersion,
        newVersion,
        added: [newNode],
        removed: [],
        modified: [],
        statistics: {
          addedCount: 1,
          removedCount: 0,
          modifiedCount: 0,
          totalChanges: 1,
        },
        timeline,
      };
    }

    // 如果只有旧版本（删除）
    if (oldNode && !newNode) {
      return {
        oldVersion,
        newVersion,
        added: [],
        removed: [oldNode],
        modified: [],
        statistics: {
          addedCount: 0,
          removedCount: 1,
          modifiedCount: 0,
          totalChanges: 1,
        },
        timeline,
      };
    }

    // 对比两个版本
    const changedFields = this.findChangedFields(oldNode!, newNode!);

    return {
      oldVersion,
      newVersion,
      added: [],
      removed: [],
      modified: changedFields.length > 0 ? [{
        old: oldNode!,
        new: newNode!,
        changedFields,
      }] : [],
      statistics: {
        addedCount: 0,
        removedCount: 0,
        modifiedCount: changedFields.length > 0 ? 1 : 0,
        totalChanges: changedFields.length,
      },
      timeline,
    };
  }

  /**
   * 查找变更的字段
   */
  private findChangedFields(oldNode: RequirementNode, newNode: RequirementNode): string[] {
    const changedFields: string[] = [];

    const fields: (keyof RequirementNode)[] = [
      'title',
      'description',
      'type',
      'status',
      'priority',
      'level',
      'projectId',
      'createdBy',
      'version',
      'tags',
      'attributes',
      'acceptanceCriteria',
      'references',
    ];

    for (const field of fields) {
      const oldValue = oldNode[field];
      const newValue = newNode[field];

      if (!this.areEqual(oldValue, newValue)) {
        changedFields.push(field);
      }
    }

    return changedFields;
  }

  /**
   * 判断两个值是否相等
   */
  private areEqual(a: any, b: any): boolean {
    if (a === b) return true;

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => this.areEqual(item, b[index]));
    }

    if (typeof a === 'object' && typeof b === 'object') {
      if (a === null || b === null) return a === b;
      
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      return keysA.every(key => this.areEqual(a[key], b[key]));
    }

    return false;
  }

  /**
   * 对比两个需求集合的差异
   */
  compareRequirementSets(
    oldNodes: RequirementNode[],
    newNodes: RequirementNode[]
  ): VersionComparisonResult {
    const oldMap = new Map(oldNodes.map(n => [n.id, n]));
    const newMap = new Map(newNodes.map(n => [n.id, n]));

    const added: RequirementNode[] = [];
    const removed: RequirementNode[] = [];
    const modified: { old: RequirementNode; new: RequirementNode; changedFields: string[] }[] = [];

    // 查找新增和修改的
    for (const newNode of newNodes) {
      const oldNode = oldMap.get(newNode.id);
      if (!oldNode) {
        added.push(newNode);
      } else {
        const changedFields = this.findChangedFields(oldNode, newNode);
        if (changedFields.length > 0) {
          modified.push({ old: oldNode, new: newNode, changedFields });
        }
      }
    }

    // 查找删除的
    for (const oldNode of oldNodes) {
      if (!newMap.has(oldNode.id)) {
        removed.push(oldNode);
      }
    }

    return {
      oldVersion: 0,
      newVersion: 0,
      added,
      removed,
      modified,
      statistics: {
        addedCount: added.length,
        removedCount: removed.length,
        modifiedCount: modified.length,
        totalChanges: added.length + removed.length + modified.length,
      },
      timeline: [],
    };
  }

  /**
   * 生成变更高亮显示
   */
  highlightChanges(
    oldNode: RequirementNode,
    newNode: RequirementNode
  ): { field: string; old: any; new: any; changeType: 'MODIFIED' | 'UNCHANGED' }[] {
    const fields: (keyof RequirementNode)[] = [
      'title',
      'description',
      'type',
      'status',
      'priority',
      'level',
      'projectId',
      'tags',
      'acceptanceCriteria',
    ];

    return fields.map(field => {
      const oldValue = oldNode[field];
      const newValue = newNode[field];
      const changed = !this.areEqual(oldValue, newValue);

      return {
        field,
        old: oldValue,
        new: newValue,
        changeType: changed ? 'MODIFIED' : 'UNCHANGED',
      };
    });
  }

  /**
   * 获取版本历史时间线
   */
  getTimeline(requirementId: string): VersionHistory[] {
    const history = this.store.getHistory(requirementId);
    return history.sort((a, b) => a.version - b.version);
  }

  /**
   * 获取版本差异摘要
   */
  getVersionSummary(requirementId: string): {
    totalVersions: number;
    firstVersion: Date | null;
    lastVersion: Date | null;
    changeCount: number;
  } {
    const history = this.store.getHistory(requirementId);
    
    if (history.length === 0) {
      return {
        totalVersions: 0,
        firstVersion: null,
        lastVersion: null,
        changeCount: 0,
      };
    }

    const sorted = history.sort((a, b) => a.version - b.version);
    const createCount = history.filter(h => h.changeType === 'CREATE').length;
    const updateCount = history.filter(h => h.changeType === 'UPDATE').length;
    const deleteCount = history.filter(h => h.changeType === 'DELETE').length;

    return {
      totalVersions: sorted.length,
      firstVersion: sorted[0].timestamp,
      lastVersion: sorted[sorted.length - 1].timestamp,
      changeCount: createCount + updateCount + deleteCount,
    };
  }
}

/**
 * 版本管理器
 * 管理需求的版本创建和记录
 */
export class VersionManager {
  private store: VersionStore;

  constructor(store: VersionStore) {
    this.store = store;
  }

  /**
   * 创建新版本记录
   */
  createVersion(
    requirement: RequirementNode,
    changedBy: string,
    changeType: 'CREATE' | 'UPDATE' | 'DELETE',
    description: string,
    previousData?: RequirementNode
  ): VersionHistory {
    const version = this.getNextVersion(requirement.id);

    const history: VersionHistory = {
      version,
      timestamp: new Date(),
      changedBy,
      changeType,
      description,
      previousData,
      newData: changeType !== 'DELETE' ? requirement : undefined,
    };

    this.store.addVersion(history);
    return history;
  }

  /**
   * 获取下一个版本号
   */
  private getNextVersion(requirementId: string): number {
    const history = this.store.getHistory(requirementId);
    if (history.length === 0) return 1;
    
    const maxVersion = Math.max(...history.map(h => h.version));
    return maxVersion + 1;
  }

  /**
   * 创建需求（初始版本）
   */
  createRequirement(
    requirement: RequirementNode,
    createdBy: string
  ): VersionHistory {
    return this.createVersion(
      requirement,
      createdBy,
      'CREATE',
      `创建需求：${requirement.title}`,
      undefined
    );
  }

  /**
   * 更新需求
   */
  updateRequirement(
    newRequirement: RequirementNode,
    oldRequirement: RequirementNode,
    updatedBy: string,
    changes: string[]
  ): VersionHistory {
    const updatedReq = { ...newRequirement, version: this.getNextVersion(newRequirement.id) };
    
    return this.createVersion(
      updatedReq,
      updatedBy,
      'UPDATE',
      `更新需求：${changes.join(', ')}`,
      oldRequirement
    );
  }

  /**
   * 删除需求
   */
  deleteRequirement(
    requirement: RequirementNode,
    deletedBy: string,
    reason: string
  ): VersionHistory {
    return this.createVersion(
      requirement,
      deletedBy,
      'DELETE',
      `删除需求：${reason}`,
      requirement
    );
  }

  /**
   * 获取版本历史
   */
  getHistory(requirementId: string): VersionHistory[] {
    return this.store.getHistory(requirementId);
  }

  /**
   * 获取指定版本
   */
  getVersion(requirementId: string, version: number): RequirementNode | null {
    return this.store.getVersion(requirementId, version);
  }

  /**
   * 回滚到指定版本
   */
  rollbackToVersion(
    requirementId: string,
    targetVersion: number,
    rolledBackBy: string
  ): RequirementNode | null {
    const targetNode = this.store.getVersion(requirementId, targetVersion);
    if (!targetNode) return null;

    const currentHistory = this.store.getHistory(requirementId);
    const currentVersion = currentHistory.length > 0 
      ? Math.max(...currentHistory.map(h => h.version))
      : 0;

    // 创建回滚版本
    const rolledBackNode: RequirementNode = {
      ...targetNode,
      id: requirementId,
      version: currentVersion + 1,
      updatedAt: new Date(),
    };

    this.createVersion(
      rolledBackNode,
      rolledBackBy,
      'UPDATE',
      `回滚到版本 ${targetVersion}`,
      currentHistory.find(h => h.version === currentVersion)?.newData
    );

    return rolledBackNode;
  }
}

/**
 * 生成版本对比报告
 */
export function generateVersionComparisonReport(
  result: VersionComparisonResult
): string {
  const lines: string[] = [];

  lines.push(`# 版本对比报告`);
  lines.push(``);
  lines.push(`## 版本信息`);
  lines.push(`- 旧版本：v${result.oldVersion}`);
  lines.push(`- 新版本：v${result.newVersion}`);
  lines.push(``);

  lines.push(`## 变更统计`);
  lines.push(`- 新增：${result.statistics.addedCount}`);
  lines.push(`- 删除：${result.statistics.removedCount}`);
  lines.push(`- 修改：${result.statistics.modifiedCount}`);
  lines.push(`- 总变更数：${result.statistics.totalChanges}`);
  lines.push(``);

  if (result.added.length > 0) {
    lines.push(`## 新增需求`);
    for (const node of result.added) {
      lines.push(`- [${node.id}] ${node.title}`);
    }
    lines.push(``);
  }

  if (result.removed.length > 0) {
    lines.push(`## 删除需求`);
    for (const node of result.removed) {
      lines.push(`- [${node.id}] ${node.title}`);
    }
    lines.push(``);
  }

  if (result.modified.length > 0) {
    lines.push(`## 修改需求`);
    for (const mod of result.modified) {
      lines.push(`### ${mod.new.id}`);
      lines.push(`**变更字段**: ${mod.changedFields.join(', ')}`);
      lines.push(``);
      
      for (const field of mod.changedFields) {
        const key = field as keyof RequirementNode;
        lines.push(`- **${field}**:`);
        lines.push(`  - 旧：${JSON.stringify(mod.old[key])}`);
        lines.push(`  - 新：${JSON.stringify(mod.new[key])}`);
      }
      lines.push(``);
    }
  }

  if (result.timeline.length > 0) {
    lines.push(`## 变更时间线`);
    for (const record of result.timeline) {
      const dateStr = record.timestamp.toLocaleString('zh-CN');
      lines.push(`- v${record.version} (${dateStr}) - ${record.changeType}: ${record.description}`);
    }
    lines.push(``);
  }

  return lines.join('\n');
}

/**
 * 创建版本对比器
 */
export function createVersionComparator(store?: VersionStore): VersionComparator {
  return new VersionComparator(store || new InMemoryVersionStore());
}

/**
 * 创建版本管理器
 */
export function createVersionManager(store?: VersionStore): VersionManager {
  return new VersionManager(store || new InMemoryVersionStore());
}
