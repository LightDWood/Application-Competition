const express = require('express');
const router = express.Router();

// 注意：由于需求收敛技能是 TypeScript 编写，需要通过 ts-node 加载
// 或者使用编译后的 JavaScript 文件
let RequirementService;

try {
  // 尝试使用 ts-node 动态加载 TypeScript 模块
  require('ts-node').register({
    project: require('path').join(__dirname, '../services/requirement-convergence/tsconfig.json'),
    transpileOnly: true
  });
  
  RequirementService = require('../services/requirement-convergence/src/index');
} catch (error) {
  console.warn('⚠️  TypeScript 模块加载失败，请确保已安装 ts-node 和 typescript');
  console.warn('运行：npm install typescript ts-node --save-dev');
  
  // 降级方案：使用空的 mock 服务
  RequirementService = {
    analyze: async () => ({ error: 'TypeScript 模块未编译' }),
    validate: async () => ({ error: 'TypeScript 模块未编译' }),
    buildGraph: async () => ({ error: 'TypeScript 模块未编译' }),
    recommend: async () => ({ error: 'TypeScript 模块未编译' })
  };
}

/**
 * @route POST /api/requirement/analyze
 * @desc 需求分析接口 - 完整性评估、风险预警、依赖发现、智能推荐
 * @access Public
 */
router.post('/analyze', async (req, res) => {
  try {
    const { requirement } = req.body;
    
    if (!requirement || typeof requirement !== 'string') {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数：requirement (string)'
      });
    }
    
    console.log(`📊 [需求分析] 收到需求：${requirement.substring(0, 100)}...`);
    
    const result = await RequirementService.analyze(requirement);
    
    console.log(`✅ [需求分析] 完成，完整性评分：${result.completeness?.totalScore || 'N/A'}`);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [需求分析] 错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '需求分析失败',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route POST /api/requirement/validate
 * @desc 需求验证接口 - 可测试性检查、验收标准生成、质量评分
 * @access Public
 */
router.post('/validate', async (req, res) => {
  try {
    const { requirement, requirementId = 'REQ-001' } = req.body;
    
    if (!requirement || typeof requirement !== 'string') {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数：requirement (string)'
      });
    }
    
    console.log(`✅ [需求验证] 验证需求：${requirementId}`);
    
    const result = await RequirementService.validate(requirement, requirementId);
    
    console.log(`✅ [需求验证] 完成，质量评分：${result.overallScore || 'N/A'}`);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [需求验证] 错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '需求验证失败',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route POST /api/requirement/graph
 * @desc 需求图谱接口 - 构建需求图谱、关系发现、影响分析
 * @access Public
 */
router.post('/graph', async (req, res) => {
  try {
    const { requirements, operation = 'build' } = req.body;
    
    if (!requirements || !Array.isArray(requirements)) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数：requirements (array)'
      });
    }
    
    console.log(`🔗 [需求图谱] 构建图谱，节点数：${requirements.length}`);
    
    const result = await RequirementService.buildGraph(requirements, operation);
    
    console.log(`✅ [需求图谱] 完成，边数：${result.edges?.length || 0}`);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [需求图谱] 错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '需求图谱构建失败',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route POST /api/requirement/recommend
 * @desc 智能推荐接口 - 基于历史需求库推荐最佳实践
 * @access Public
 */
router.post('/recommend', async (req, res) => {
  try {
    const { requirement, limit = 5 } = req.body;
    
    if (!requirement || typeof requirement !== 'string') {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数：requirement (string)'
      });
    }
    
    console.log(`💡 [智能推荐] 为需求寻找相似推荐`);
    
    const result = await RequirementService.recommend(requirement, limit);
    
    console.log(`✅ [智能推荐] 找到 ${result.recommendations?.length || 0} 条推荐`);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [智能推荐] 错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '智能推荐失败',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/requirement/health
 * @desc 健康检查接口
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'requirement-convergence',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
