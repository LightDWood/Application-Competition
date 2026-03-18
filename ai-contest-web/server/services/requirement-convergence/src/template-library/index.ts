/**
 * 行业模板库统一导出
 * 
 * @module template-library
 */

// 行业模板
export {
  INDUSTRY_TEMPLATES,
  getTemplate,
  listTemplates,
  getTemplateModules,
  searchTemplates,
  type IndustryTemplate,
  type TemplateModule,
  type ComplianceRequirement,
  type TypicalScenario
} from './industry-templates'

// 合规检查
export {
  ComplianceChecker,
  createComplianceChecker,
  COMPLIANCE_CHECK_ITEMS,
  type ComplianceStandard,
  type CheckResult,
  type CheckItem,
  type CheckResultDetail,
  type ComplianceReport,
  type GapAnalysis,
  type GapItem
} from './compliance-checker'

// 最佳实践
export {
  BEST_PRACTICES,
  PRACTICE_CATEGORIES,
  BestPracticeLibrary,
  createBestPracticeLibrary,
  getPractice,
  getPracticesByIndustry,
  getPracticesByScenario,
  getPracticesByLevel,
  searchPractices,
  getPracticesByTags,
  getRelatedPractices,
  type BestPractice,
  type IndustryType,
  type BusinessScenario,
  type PracticeLevel,
  type ImplementationStep,
  type Reference,
  type PracticeCategory
} from './best-practices'

// 反模式
export {
  ANTI_PATTERNS,
  ANTI_PATTERN_CATEGORIES,
  AntiPatternDetector,
  createAntiPatternDetector,
  getAntiPattern,
  getPatternsByCategory,
  getPatternsBySeverity,
  searchPatterns,
  detectPatterns,
  type AntiPattern,
  type AntiPatternCategory,
  type SeverityLevel,
  type DetectionMethod,
  type Solution,
  type Example
} from './anti-patterns'
