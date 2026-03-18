# Skill 替换影响评估 Spec

## Why
为支持需求收敛技能的迭代升级，需要明确 Skill 替换的影响范围和修改内容，确保新 Skill 能够平滑替换现有实现，降低系统风险。

## What Changes
- 创建 Skill 替换影响评估文档，明确需要修改的文件和接口
- 定义 Skill 标准接口规范，确保不同实现可以互换
- 提供 Skill 迁移指南和测试清单

## Impact
- **Affected specs**: 无
- **Affected code**: 
  - `server/services/skillService.js` - 核心服务层
  - `server/services/intentRecognizer.js` - 意图识别模块
  - `server/routes/requirement.js` - API 路由层
  - `server/config/skill.js` - 技能配置文件
  - `server/services/requirement-convergence/` - TypeScript 技能实现目录

## ADDED Requirements

### Requirement: Skill 标准接口定义
系统 SHALL 定义标准的 Skill 接口，确保不同实现可以互换：

```typescript
interface ISkill {
  // 技能元数据
  metadata: {
    id: string;
    name: string;
    version: string;
    description: string;
  };
  
  // 生命周期方法
  initialize(): Promise<boolean>;
  destroy(): Promise<void>;
  
  // 核心能力接口
  analyze(requirement: string): Promise<AnalysisResult>;
  validate(requirement: string, requirementId?: string): Promise<ValidationResult>;
  buildGraph(requirements: Array<any>, operation?: string): Promise<GraphResult>;
  recommend(requirement: string, limit?: number): Promise<RecommendationResult>;
  
  // 流式对话接口
  chatStream(userMessage: string, conversationHistory?: Array<any>): AsyncIterator<ChatChunk>;
}
```

#### Scenario: 新 Skill 替换旧 Skill
- **WHEN** 开发者创建新的需求收敛 Skill 实现
- **THEN** 只需实现标准接口，无需修改调用方代码

### Requirement: Skill 配置管理
系统 SHALL 支持通过配置文件切换 Skill 实现：

```javascript
// server/config/skill.js
export default {
  // 当前使用的 Skill 实现
  activeSkill: 'requirement-convergence-v2',
  
  // Skill 实现注册表
  skills: {
    'requirement-convergence-v1': {
      module: '../services/requirement-convergence-v1/index.js',
      config: { /* 配置参数 */ }
    },
    'requirement-convergence-v2': {
      module: '../services/requirement-convergence-v2/index.js',
      config: { /* 配置参数 */ }
    },
    'requirement-convergence-local': {
      module: '../services/skillService.js',  // 本地简化版
      config: { /* 配置参数 */ }
    }
  },
  
  // 降级策略
  fallback: {
    enabled: true,
    fallbackSkill: 'requirement-convergence-local',
    maxRetries: 2
  }
};
```

#### Scenario: Skill 切换
- **WHEN** 修改配置文件的 `activeSkill` 字段
- **THEN** 系统重启后使用新的 Skill 实现

### Requirement: Skill 健康检查
系统 SHALL 提供 Skill 健康检查接口：

```javascript
GET /api/requirement/health

Response:
{
  "success": true,
  "status": "ok",
  "skill": {
    "id": "requirement-convergence-v2",
    "name": "需求收敛技能",
    "version": "2.0.0",
    "loaded": true,
    "capabilities": ["analyze", "validate", "buildGraph", "recommend"]
  },
  "timestamp": "2026-03-18T10:30:00.000Z"
}
```

#### Scenario: 健康检查
- **WHEN** 调用健康检查接口
- **THEN** 返回当前 Skill 的加载状态和能力列表

## MODIFIED Requirements

### Requirement: skillService.js 重构
将当前的硬编码实现改为基于配置的动态加载：

**当前实现：**
```javascript
let RequirementService = null;
try {
  RequirementService = createLocalRequirementService();
} catch (error) {
  // 降级处理
}
```

**修改为：**
```javascript
import SKILL_CONFIG from '../config/skill.js';

class SkillService {
  constructor() {
    this.config = SKILL_CONFIG;
    this.activeSkill = null;
    this.fallbackSkill = null;
  }
  
  async initialize() {
    // 1. 加载配置的 Skill
    try {
      const SkillModule = await this.loadSkillModule(this.config.activeSkill);
      this.activeSkill = new SkillModule(this.config.skills[this.config.activeSkill].config);
      await this.activeSkill.initialize();
      console.log(`✅ Skill 加载成功：${this.config.activeSkill}`);
      return true;
    } catch (error) {
      console.error('❌ 主 Skill 加载失败:', error);
      
      // 2. 尝试加载降级 Skill
      if (this.config.fallback?.enabled) {
        try {
          const FallbackModule = await this.loadSkillModule(this.config.fallback.fallbackSkill);
          this.fallbackSkill = new FallbackModule();
          await this.fallbackSkill.initialize();
          console.log('⚠️  使用降级 Skill:', this.config.fallback.fallbackSkill);
          return true;
        } catch (fallbackError) {
          console.error('❌ 降级 Skill 也失败了:', fallbackError);
        }
      }
      
      return false;
    }
  }
  
  async loadSkillModule(skillId) {
    const skillConfig = this.config.skills[skillId];
    if (!skillConfig) {
      throw new Error(`Skill 未注册：${skillId}`);
    }
    
    // 动态导入模块
    const module = await import(skillConfig.module);
    return module.default || module;
  }
  
  // 代理方法调用
  async analyze(requirement) {
    const skill = this.activeSkill || this.fallbackSkill;
    if (!skill) {
      throw new Error('Skill 未加载');
    }
    return skill.analyze(requirement);
  }
  
  // ... 其他方法类似
}
```

#### Scenario: Skill 动态加载
- **WHEN** SkillService 初始化时
- **THEN** 根据配置动态加载 Skill 模块，失败时自动降级

### Requirement: requirement.js 路由适配
修改路由文件以支持新的 Skill 接口：

**当前实现：**
```javascript
let RequirementService;
try {
  require('ts-node').register({...});
  RequirementService = require('../services/requirement-convergence/src/index');
} catch (error) {
  // 降级处理
}
```

**修改为：**
```javascript
import skillService from '../services/skillService.js';

// 不需要直接引用 RequirementService
// 所有调用通过 skillService 代理

router.post('/analyze', async (req, res) => {
  try {
    const { requirement } = req.body;
    const result = await skillService.analyze(requirement);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

#### Scenario: 路由调用
- **WHEN** API 路由接收到请求
- **THEN** 通过 skillService 代理调用，不直接引用具体实现

## REMOVED Requirements

### Requirement: ts-node 动态加载
**Reason**: 增加系统复杂度，TypeScript 模块加载容易出错
**Migration**: 使用编译后的 JavaScript 或纯 JavaScript 实现

### Requirement: 硬编码的 createLocalRequirementService
**Reason**: 不利于 Skill 替换和升级
**Migration**: 使用基于配置的动态加载机制

---

## 影响评估清单

### 1. 核心文件修改 (必须)

| 文件 | 修改类型 | 影响范围 | 优先级 |
|------|----------|----------|--------|
| `server/config/skill.js` | 新增 | 配置管理 | P0 |
| `server/services/skillService.js` | 重构 | 核心服务层 | P0 |
| `server/routes/requirement.js` | 修改 | API 路由层 | P0 |

### 2. 新 Skill 实现文件 (必须)

| 文件 | 说明 | 优先级 |
|------|------|--------|
| `server/services/new-skill/index.js` | 新 Skill 入口 | P0 |
| `server/services/new-skill/analyzer.js` | 分析引擎 | P0 |
| `server/services/new-skill/validator.js` | 验证引擎 | P1 |
| `server/services/new-skill/graph-builder.js` | 图谱构建 | P1 |
| `server/services/new-skill/recommender.js` | 推荐引擎 | P1 |

### 3. 配置文件修改 (必须)

| 文件 | 修改内容 | 优先级 |
|------|----------|--------|
| `server/config/skill.js` | 注册新 Skill | P0 |
| `.env` | 添加 Skill 配置项 | P1 |
| `package.json` | 添加新依赖 | P1 |

### 4. 测试文件 (推荐)

| 文件 | 说明 | 优先级 |
|------|------|--------|
| `tests/skill-interface.test.js` | 接口测试 | P1 |
| `tests/skill-switch.test.js` | 切换测试 | P2 |
| `tests/skill-fallback.test.js` | 降级测试 | P2 |

### 5. 文档更新 (推荐)

| 文件 | 说明 | 优先级 |
|------|------|--------|
| `docs/SKILL_MIGRATION.md` | 迁移指南 | P2 |
| `docs/SKILL_API.md` | API 文档 | P2 |
| `README.md` | 更新说明 | P3 |

---

## Skill 替换步骤

### Phase 1: 准备工作
1. 定义 Skill 标准接口
2. 创建配置文件 `server/config/skill.js`
3. 编写测试用例

### Phase 2: 重构核心层
1. 重构 `skillService.js` 支持动态加载
2. 修改 `requirement.js` 使用 skillService 代理
3. 测试降级机制

### Phase 3: 实现新 Skill
1. 创建新 Skill 目录结构
2. 实现标准接口
3. 单元测试

### Phase 4: 切换验证
1. 修改配置指向新 Skill
2. 重启服务器
3. 运行集成测试
4. 验证业务功能

### Phase 5: 清理优化
1. 移除旧 Skill 代码 (可选)
2. 性能测试
3. 文档更新

---

## 风险评估

### 高风险项
1. **接口不兼容**: 新 Skill 接口与现有调用方不匹配
   - 缓解：严格遵循标准接口定义
   - 检测：完整的单元测试覆盖

2. **性能下降**: 新 Skill 性能不如预期
   - 缓解：性能基准测试
   - 检测：监控接口响应时间

3. **降级失败**: 主 Skill 失败时无法降级
   - 缓解：实现多级降级机制
   - 检测：定期演练降级场景

### 中风险项
1. **配置错误**: 配置文件格式错误或路径错误
   - 缓解：配置文件验证
   - 检测：启动时检查配置

2. **依赖冲突**: 新 Skill 依赖与现有依赖冲突
   - 缓解：使用依赖隔离
   - 检测：依赖树检查

### 低风险项
1. **日志格式变化**: 日志输出格式不一致
   - 缓解：统一日志规范
   - 检测：日志审查

---

## 验证标准

### 功能验证
- [ ] 新 Skill 能够正常加载
- [ ] 所有 API 接口返回正确
- [ ] 降级机制工作正常
- [ ] 流式输出正常

### 性能验证
- [ ] 响应时间 < 500ms
- [ ] 并发支持 > 10 QPS
- [ ] 内存占用 < 200MB

### 兼容性验证
- [ ] 前端界面无异常
- [ ] 现有功能不受影响
- [ ] 数据库无异常

---

## 回滚方案

如果新 Skill 上线后出现问题，执行以下回滚步骤：

1. **立即回滚配置**:
   ```bash
   # 修改 server/config/skill.js
   activeSkill: 'requirement-convergence-local'  # 切换回本地简化版
   ```

2. **重启服务器**:
   ```bash
   # 停止当前服务
   npm stop
   
   # 启动服务
   npm start
   ```

3. **验证回滚**:
   ```bash
   # 检查健康状态
   curl http://localhost:3000/api/requirement/health
   ```

4. **问题排查**:
   - 查看日志文件
   - 分析错误原因
   - 修复后重新执行上线流程

---

## 总结

Skill 替换的核心是**接口标准化**和**配置驱动**，通过以下机制确保平滑替换：

1. **标准接口**: 定义清晰的 ISkill 接口，所有实现必须遵循
2. **动态加载**: 基于配置动态加载 Skill 模块，不硬编码
3. **降级机制**: 主 Skill 失败时自动降级到备用 Skill
4. **健康检查**: 提供健康检查接口监控 Skill 状态
5. **完整测试**: 单元测试 + 集成测试 + 性能测试

预计工作量：
- 核心层重构：4 小时
- 新 Skill 实现：8-16 小时 (取决于功能复杂度)
- 测试验证：4 小时
- 文档编写：2 小时

**总计**: 18-26 小时
