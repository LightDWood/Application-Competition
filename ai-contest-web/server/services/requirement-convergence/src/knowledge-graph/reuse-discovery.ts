/**
 * 跨项目复用发现
 * 基于文本相似度和结构相似度计算，推荐可复用需求模式
 */

import {
  RequirementNode,
  ReuseRecommendation,
  RelationshipType,
  createRelationshipEdge,
} from './graph-model';

/**
 * TF-IDF 计算器
 */
class TfIdfCalculator {
  private documentFrequency: Map<string, number> = new Map();
  private totalDocuments: number = 0;

  /**
   * 构建索引
   */
  buildIndex(documents: string[]): void {
    this.totalDocuments = documents.length;
    this.documentFrequency.clear();

    for (const doc of documents) {
      const terms = this.tokenize(doc);
      const uniqueTerms = new Set(terms);

      for (const term of uniqueTerms) {
        const df = this.documentFrequency.get(term) || 0;
        this.documentFrequency.set(term, df + 1);
      }
    }
  }

  /**
   * 计算 TF-IDF 向量
   */
  calculateTfIdf(document: string): Map<string, number> {
    const terms = this.tokenize(document);
    const termFrequency = new Map<string, number>();

    // 计算词频 (TF)
    for (const term of terms) {
      const tf = termFrequency.get(term) || 0;
      termFrequency.set(term, tf + 1);
    }

    // 归一化 TF
    const maxFreq = Math.max(...termFrequency.values(), 1);
    for (const [term, freq] of termFrequency.entries()) {
      termFrequency.set(term, freq / maxFreq);
    }

    // 计算 IDF 并应用
    const tfidf = new Map<string, number>();
    for (const [term, tf] of termFrequency.entries()) {
      const df = this.documentFrequency.get(term) || 0;
      const idf = Math.log((this.totalDocuments + 1) / (df + 1)) + 1;
      tfidf.set(term, tf * idf);
    }

    return tfidf;
  }

  /**
   * 分词（简单的中文分词）
   */
  private tokenize(text: string): string[] {
    // 移除标点符号和停用词
    const stopwords = new Set([
      '的', '了', '和', '与', '及', '或', '等', '一个', '一种',
      '基于', '系统', '功能', '实现', '提供', '支持', '包括',
      '这个', '那个', '我们', '他们', '它们',
    ]);

    const terms: string[] = [];
    
    // 提取 2-4 个字符的词语
    for (let i = 0; i < text.length - 1; i++) {
      for (let len = 2; len <= 4 && i + len <= text.length; len++) {
        const word = text.substring(i, i + len);
        if (!stopwords.has(word) && /^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(word)) {
          terms.push(word);
        }
      }
    }

    return terms;
  }

  /**
   * 获取词汇表
   */
  getVocabulary(): string[] {
    return Array.from(this.documentFrequency.keys());
  }
}

/**
 * 复用发现配置接口
 */
export interface ReuseDiscoveryConfig {
  /** 最小相似度阈值 */
  minSimilarityThreshold: number;
  
  /** 文本相似度权重 */
  textWeight: number;
  
  /** 结构相似度权重 */
  structureWeight: number;
  
  /** 是否跨项目复用 */
  crossProject: boolean;
  
  /** 最大推荐数量 */
  maxRecommendations: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: ReuseDiscoveryConfig = {
  minSimilarityThreshold: 0.5,
  textWeight: 0.6,
  structureWeight: 0.4,
  crossProject: true,
  maxRecommendations: 10,
};

/**
 * 复用发现器类
 */
export class ReuseDiscoverer {
  private config: ReuseDiscoveryConfig;
  private tfidfCalculator: TfIdfCalculator = new TfIdfCalculator();

  constructor(config?: Partial<ReuseDiscoveryConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 发现可复用需求
   */
  discoverReuse(
    sourceRequirement: RequirementNode,
    candidateRequirements: RequirementNode[]
  ): ReuseRecommendation[] {
    // 构建 TF-IDF 索引
    const documents = candidateRequirements.map(r => `${r.title} ${r.description}`);
    this.tfidfCalculator.buildIndex(documents);

    const recommendations: ReuseRecommendation[] = [];

    for (const candidate of candidateRequirements) {
      // 跳过同一个需求
      if (candidate.id === sourceRequirement.id) {
        continue;
      }

      // 如果不跨项目，跳过不同项目的需求
      if (!this.config.crossProject && 
          sourceRequirement.projectId !== candidate.projectId) {
        continue;
      }

      // 计算文本相似度
      const textSimilarity = this.calculateTextSimilarity(
        sourceRequirement,
        candidate
      );

      // 计算结构相似度
      const structureSimilarity = this.calculateStructureSimilarity(
        sourceRequirement,
        candidate
      );

      // 综合相似度
      const similarityScore = 
        this.config.textWeight * textSimilarity +
        this.config.structureWeight * structureSimilarity;

      // 如果超过阈值，添加推荐
      if (similarityScore >= this.config.minSimilarityThreshold) {
        const reasons = this.generateRecommendationReasons(
          sourceRequirement,
          candidate,
          textSimilarity,
          structureSimilarity
        );

        recommendations.push({
          sourceId: sourceRequirement.id,
          targetId: candidate.id,
          similarityScore,
          textSimilarity,
          structureSimilarity,
          reasons,
        });
      }
    }

    // 按相似度排序并限制数量
    recommendations.sort((a, b) => b.similarityScore - a.similarityScore);
    return recommendations.slice(0, this.config.maxRecommendations);
  }

  /**
   * 计算文本相似度（余弦相似度）
   */
  private calculateTextSimilarity(
    req1: RequirementNode,
    req2: RequirementNode
  ): number {
    const text1 = `${req1.title} ${req1.description}`;
    const text2 = `${req2.title} ${req2.description}`;

    const vector1 = this.tfidfCalculator.calculateTfIdf(text1);
    const vector2 = this.tfidfCalculator.calculateTfIdf(text2);

    return this.cosineSimilarity(vector1, vector2);
  }

  /**
   * 计算余弦相似度
   */
  private cosineSimilarity(
    vector1: Map<string, number>,
    vector2: Map<string, number>
  ): number {
    const allTerms = new Set([...vector1.keys(), ...vector2.keys()]);
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (const term of allTerms) {
      const v1 = vector1.get(term) || 0;
      const v2 = vector2.get(term) || 0;

      dotProduct += v1 * v2;
      norm1 += v1 * v1;
      norm2 += v2 * v2;
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * 计算结构相似度
   */
  private calculateStructureSimilarity(
    req1: RequirementNode,
    req2: RequirementNode
  ): number {
    let score = 0;
    let weightSum = 0;

    // 层级相同（权重 0.3）
    if (req1.level === req2.level) {
      score += 0.3;
    }
    weightSum += 0.3;

    // 类型相同（权重 0.25）
    if (req1.type === req2.type) {
      score += 0.25;
    }
    weightSum += 0.25;

    // 状态相同（权重 0.15）
    if (req1.status === req2.status) {
      score += 0.15;
    }
    weightSum += 0.15;

    // 优先级相同（权重 0.1）
    if (req1.priority === req2.priority) {
      score += 0.1;
    }
    weightSum += 0.1;

    // 标签重叠（权重 0.2）
    if (req1.tags.length > 0 && req2.tags.length > 0) {
      const commonTags = req1.tags.filter(t => req2.tags.includes(t));
      const maxTags = Math.max(req1.tags.length, req2.tags.length);
      score += 0.2 * (commonTags.length / maxTags);
    }
    weightSum += 0.2;

    return score / weightSum;
  }

  /**
   * 生成推荐原因
   */
  private generateRecommendationReasons(
    req1: RequirementNode,
    req2: RequirementNode,
    textSimilarity: number,
    structureSimilarity: number
  ): string[] {
    const reasons: string[] = [];

    // 文本相似度高
    if (textSimilarity >= 0.7) {
      reasons.push('文本描述高度相似');
    } else if (textSimilarity >= 0.5) {
      reasons.push('文本描述中度相似');
    }

    // 结构相似
    if (req1.level === req2.level) {
      reasons.push(`同为 L${req1.level} 层级需求`);
    }

    if (req1.type === req2.type) {
      reasons.push(`同为 ${req1.type} 类型`);
    }

    // 标签重叠
    const commonTags = req1.tags.filter(t => req2.tags.includes(t));
    if (commonTags.length > 0) {
      reasons.push(`共享标签：${commonTags.join(', ')}`);
    }

    // 项目相同
    if (req1.projectId && req1.projectId === req2.projectId) {
      reasons.push('同一项目');
    } else if (req1.projectId && req2.projectId) {
      reasons.push('跨项目复用');
    }

    return reasons;
  }

  /**
   * 批量发现复用关系
   */
  discoverReuseForAll(
    requirements: RequirementNode[]
  ): ReuseRecommendation[] {
    const allRecommendations: ReuseRecommendation[] = [];

    for (let i = 0; i < requirements.length; i++) {
      const source = requirements[i];
      const candidates = requirements.filter((_, index) => index !== i);
      
      const recommendations = this.discoverReuse(source, candidates);
      allRecommendations.push(...recommendations);
    }

    // 去重（A->B 和 B->A 只保留一个）
    const seen = new Set<string>();
    const unique: ReuseRecommendation[] = [];

    for (const rec of allRecommendations) {
      const key = [rec.sourceId, rec.targetId].sort().join('-');
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(rec);
      }
    }

    // 按相似度排序
    unique.sort((a, b) => b.similarityScore - a.similarityScore);
    return unique;
  }

  /**
   * 查找可复用模式
   */
  findReusablePatterns(
    requirements: RequirementNode[],
    minOccurrences: number = 2
  ): { pattern: string; occurrences: number; examples: string[] }[] {
    // 基于标题和描述的公共模式
    const patternMap = new Map<string, { count: number; examples: string[] }>();

    // 提取公共词语
    for (const req of requirements) {
      const words = this.extractSignificantWords(`${req.title} ${req.description}`);
      
      for (const word of words) {
        if (word.length >= 2) {
          if (!patternMap.has(word)) {
            patternMap.set(word, { count: 0, examples: [] });
          }
          const entry = patternMap.get(word)!;
          entry.count++;
          if (entry.examples.length < 3) {
            entry.examples.push(req.title);
          }
        }
      }
    }

    // 过滤出现次数足够的模式
    const patterns: { pattern: string; occurrences: number; examples: string[] }[] = [];
    
    for (const [pattern, data] of patternMap.entries()) {
      if (data.count >= minOccurrences) {
        patterns.push({
          pattern,
          occurrences: data.count,
          examples: data.examples,
        });
      }
    }

    // 按出现次数排序
    patterns.sort((a, b) => b.occurrences - a.occurrences);
    return patterns.slice(0, 20);
  }

  /**
   * 提取显著词语
   */
  private extractSignificantWords(text: string): string[] {
    const stopwords = new Set([
      '的', '了', '和', '与', '及', '或', '等', '一个', '一种',
      '基于', '系统', '功能', '实现', '提供', '支持', '包括',
    ]);

    const words: string[] = [];
    
    for (let i = 0; i < text.length - 1; i++) {
      for (let len = 2; len <= 4 && i + len <= text.length; len++) {
        const word = text.substring(i, i + len);
        if (!stopwords.has(word) && /^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(word)) {
          words.push(word);
        }
      }
    }

    return [...new Set(words)];
  }

  /**
   * 计算项目间复用潜力
   */
  calculateCrossProjectReusePotential(
    project1Reqs: RequirementNode[],
    project2Reqs: RequirementNode[]
  ): {
    potentialScore: number;
    commonPatterns: string[];
    recommendations: ReuseRecommendation[];
  } {
    // 发现两个项目间的复用关系
    const recommendations: ReuseRecommendation[] = [];

    for (const req1 of project1Reqs) {
      const recs = this.discoverReuse(req1, project2Reqs);
      recommendations.push(...recs);
    }

    // 计算平均相似度
    const avgSimilarity = recommendations.length > 0
      ? recommendations.reduce((sum, r) => sum + r.similarityScore, 0) / recommendations.length
      : 0;

    // 提取公共模式
    const allReqs = [...project1Reqs, ...project2Reqs];
    const patterns = this.findReusablePatterns(allReqs, 2);
    const commonPatterns = patterns.slice(0, 10).map(p => p.pattern);

    // 复用潜力分数
    const potentialScore = avgSimilarity * (recommendations.length / Math.min(project1Reqs.length, project2Reqs.length));

    return {
      potentialScore: Math.min(potentialScore, 1.0),
      commonPatterns,
      recommendations: recommendations.slice(0, 10),
    };
  }
}

/**
 * 便捷函数：发现可复用需求
 */
export function findReusableRequirements(
  sourceRequirement: RequirementNode,
  candidateRequirements: RequirementNode[],
  config?: Partial<ReuseDiscoveryConfig>
): ReuseRecommendation[] {
  const discoverer = new ReuseDiscoverer(config);
  return discoverer.discoverReuse(sourceRequirement, candidateRequirements);
}

/**
 * 便捷函数：批量发现复用关系
 */
export function discoverAllReuseRelationships(
  requirements: RequirementNode[],
  config?: Partial<ReuseDiscoveryConfig>
): ReuseRecommendation[] {
  const discoverer = new ReuseDiscoverer(config);
  return discoverer.discoverReuseForAll(requirements);
}

/**
 * 便捷函数：查找可复用模式
 */
export function findReusablePatterns(
  requirements: RequirementNode[],
  minOccurrences?: number
): { pattern: string; occurrences: number; examples: string[] }[] {
  const discoverer = new ReuseDiscoverer();
  return discoverer.findReusablePatterns(requirements, minOccurrences);
}

/**
 * 便捷函数：计算跨项目复用潜力
 */
export function calculateCrossProjectReusePotential(
  project1Reqs: RequirementNode[],
  project2Reqs: RequirementNode[],
  config?: Partial<ReuseDiscoveryConfig>
): {
  potentialScore: number;
  commonPatterns: string[];
  recommendations: ReuseRecommendation[];
} {
  const discoverer = new ReuseDiscoverer(config);
  return discoverer.calculateCrossProjectReusePotential(project1Reqs, project2Reqs);
}
