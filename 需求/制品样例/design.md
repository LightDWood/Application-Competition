# **1. 实现模型**

## **1.1 上下文视图**

本系统采用**微服务架构**，基于华为云基础设施构建深度检索能力。系统核心由以下模块组成：

- **检索网关服务**：统一入口，负责请求路由、认证鉴权、限流熔断
- **意图理解服务**：基于LLM的意图识别、查询改写、指代消解
- **检索执行引擎**：多路检索策略编排、结果融合、重排序
- **答案生成服务**：基于RAG范式的答案生成、溯源标注
- **知识库管理服务**：文档上传、向量化、索引管理
- **对话管理服务**：会话状态管理、上下文维护
- **反馈分析服务**：用户反馈收集、检索效果优化

## **1.2 服务/组件总体架构**

```
┌─────────────────────────────────────────────────────────────────┐
│                         飞书开放平台                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      检索网关服务 (Gateway)                       │
│  - 请求路由  - 认证鉴权  - 限流熔断  - 日志审计                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 意图理解服务  │  │ 对话管理服务  │  │ 知识库管理    │
│ (Intent)     │  │ (Dialog)     │  │ (Knowledge)  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └────────┬────────┴────────┬────────┘
                │                 │
                ▼                 ▼
        ┌──────────────┐  ┌──────────────┐
        │ 检索执行引擎  │  │ 反馈分析服务  │
        │ (Search)     │  │ (Feedback)   │
        └──────┬───────┘  └──────────────┘
               │
               ▼
        ┌──────────────┐
        │ 答案生成服务  │
        │ (Generator)  │
        └──────────────┘
```

**技术栈选型**：

| 层次 | 技术选型 | 说明 |
|------|---------|------|
| 网关层 | 华为云APIG + Spring Cloud Gateway | API网关、流量控制 |
| 服务层 | Spring Boot 3.x + Kotlin | 微服务开发框架 |
| LLM | 华为云盘古大模型 API | 意图理解、答案生成 |
| 向量数据库 | 华为云DWS + pgvector | 向量存储与检索 |
| 知识图谱 | 华为云GES | 图谱存储与推理 |
| 对象存储 | 华为云OBS | 文档存储 |
| 消息队列 | 华为云DMS (Kafka) | 异步任务处理 |
| 缓存 | 华为云DCS (Redis) | 会话缓存、热点数据 |
| 函数计算 | 华为云FunctionGraph | 向量化任务 |
| 容器编排 | 华为云CCE (Kubernetes) | 服务部署与编排 |

## **1.3 实现设计文档**

### **1.3.1 检索网关服务**

**职责**：
- 接收飞书平台的Webhook请求
- 验证请求签名和用户身份
- 路由请求到对应的服务
- 限流、熔断、降级保护
- 记录审计日志

**核心类设计**：

```kotlin
// 请求处理器
class SearchGatewayController {
    fun handleFeishuEvent(request: FeishuRequest): ResponseEntity<FeishuResponse>
    fun handleSearchQuery(query: SearchQuery): ResponseEntity<SearchResult>
    fun handleFeedback(feedback: UserFeedback): ResponseEntity<Void>
}

// 认证过滤器
class AuthenticationFilter {
    fun verifySignature(request: HttpServletRequest): Boolean
    fun extractUserInfo(token: String): UserInfo
}

// 限流器
class RateLimiter {
    fun tryAcquire(userId: String): Boolean
    fun getRemainingQuota(userId: String): Int
}
```

**配置**：
- 限流策略：每用户100次/分钟
- 熔断阈值：错误率>50%触发熔断
- 超时时间：网关层30秒，下游服务10秒

### **1.3.2 意图理解服务**

**职责**：
- 识别用户查询意图（事实查询、操作指引、对比分析等）
- 查询语义改写
- 指代消解
- 查询扩展

**核心类设计**：

```kotlin
// 意图识别器
class IntentRecognizer(private val llmClient: LLMClient) {
    fun recognizeIntent(query: String, context: DialogContext): Intent
    fun rewriteQuery(query: String, intent: Intent): String
    fun resolveCoreference(query: String, history: List<Message>): String
}

// 意图类型
enum class Intent {
    FACT_QUERY,        // 事实查询
    HOW_TO_GUIDE,      // 操作指引
    COMPARISON,        // 对比分析
    TROUBLESHOOTING,   // 故障排查
    CHITCHAT          // 闲聊
}

// LLM客户端
class PanguLLMClient {
    fun chat(messages: List<Message>, temperature: Float): String
    fun embed(text: String): FloatArray
}
```

**Prompt模板**：

```
你是一个意图识别助手。请分析用户查询的意图。

用户查询：{query}
对话历史：{history}

请输出：
1. 意图类型（事实查询/操作指引/对比分析/故障排查/闲聊）
2. 改写后的查询（更清晰、更具体）
3. 关键实体（如产品名、功能名）
```

### **1.3.3 检索执行引擎**

**职责**：
- 编排多路检索策略
- 并行执行向量检索、关键词检索、知识图谱查询
- 结果融合与重排序
- 检索路径记录

**核心类设计**：

```kotlin
// 检索编排器
class SearchOrchestrator(
    private val vectorSearcher: VectorSearcher,
    private val keywordSearcher: KeywordSearcher,
    private val graphSearcher: GraphSearcher,
    private val reranker: Reranker
) {
    fun search(query: ProcessedQuery): SearchContext {
        // 并行执行多路检索
        val vectorResults = async { vectorSearcher.search(query) }
        val keywordResults = async { keywordSearcher.search(query) }
        val graphResults = async { graphSearcher.search(query) }
        
        // 结果融合
        val merged = mergeResults(vectorResults, keywordResults, graphResults)
        
        // 重排序
        val reranked = reranker.rerank(query, merged)
        
        return SearchContext(reranked, searchPath)
    }
}

// 向量检索器
class VectorSearcher(private val dwsClient: DWSClient) {
    fun search(query: ProcessedQuery): List<SearchResult> {
        val embedding = query.embedding
        val sql = """
            SELECT doc_id, content, 1 - (embedding <=> ?::vector) as score
            FROM document_vectors
            ORDER BY embedding <=> ?::vector
            LIMIT ?
        """
        return dwsClient.query(sql, embedding, embedding, query.topK)
    }
}

// 重排序器
class Reranker(private val llmClient: LLMClient) {
    fun rerank(query: ProcessedQuery, results: List<SearchResult>): List<SearchResult> {
        // 使用Cross-Encoder模型重排序
        val scores = results.map { calculateRelevance(query, it) }
        return results.zip(scores).sortedByDescending { it.second }.map { it.first }
    }
}
```

**检索策略配置**：

```yaml
search_strategies:
  vector_search:
    enabled: true
    weight: 0.5
    top_k: 20
  keyword_search:
    enabled: true
    weight: 0.3
    top_k: 20
  graph_search:
    enabled: true
    weight: 0.2
    max_depth: 3

rerank:
  model: bge-reranker-large
  top_k: 5
```

### **1.3.4 答案生成服务**

**职责**：
- 基于检索结果生成自然语言答案
- 溯源标注
- 置信度评估
- 推荐问题生成

**核心类设计**：

```kotlin
// 答案生成器
class AnswerGenerator(private val llmClient: LLMClient) {
    fun generate(query: ProcessedQuery, context: SearchContext): GeneratedAnswer {
        val prompt = buildPrompt(query, context)
        val response = llmClient.chat(prompt, temperature = 0.3)
        
        return GeneratedAnswer(
            answer = response,
            sources = extractSources(context),
            confidence = calculateConfidence(context),
            relatedQuestions = generateRelatedQuestions(query, context)
        )
    }
    
    private fun buildPrompt(query: ProcessedQuery, context: SearchContext): String {
        return """
            你是一个专业的问答助手。请基于以下检索结果回答用户问题。
            
            用户问题：${query.text}
            
            检索结果：
            ${context.results.mapIndexed { i, r -> "[${i+1}] ${r.content}" }.joinToString("\n")}
            
            要求：
            1. 答案必须基于检索结果，不要编造信息
            2. 在答案中标注引用来源，如"根据[1]..."
            3. 如果检索结果不足，明确告知用户
            4. 答案简洁清晰，不超过500字
        """.trimIndent()
    }
}
```

### **1.3.5 知识库管理服务**

**职责**：
- 文档上传与解析
- 文档分块
- 触发向量化任务
- 索引管理

**核心类设计**：

```kotlin
// 文档管理器
class DocumentManager(
    private val obsClient: OBSClient,
    private val fgClient: FunctionGraphClient,
    private val metadataRepo: DocumentMetadataRepository
) {
    fun uploadDocument(file: MultipartFile, metadata: DocumentMetadata): String {
        // 存储原始文档
        val docId = generateDocId()
        obsClient.putObject(bucket, docId, file.inputStream)
        
        // 保存元数据
        metadataRepo.save(metadata.copy(docId = docId, status = VectorStatus.PENDING))
        
        // 触发向量化任务
        fgClient.invokeFunction("document-vectorizer", mapOf("docId" to docId))
        
        return docId
    }
    
    fun deleteDocument(docId: String) {
        // 删除向量索引
        dwsClient.execute("DELETE FROM document_vectors WHERE doc_id = ?", docId)
        
        // 删除原始文档
        obsClient.deleteObject(bucket, docId)
        
        // 删除元数据
        metadataRepo.delete(docId)
    }
}

// 文档解析器
class DocumentParser {
    fun parse(file: MultipartFile): List<DocumentChunk> {
        return when (file.contentType) {
            "application/pdf" -> PdfParser().parse(file)
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" -> WordParser().parse(file)
            "text/markdown" -> MarkdownParser().parse(file)
            else -> throw UnsupportedFormatException(file.contentType)
        }
    }
}

// 文档分块器
class DocumentChunker {
    fun chunk(content: String, maxChunkSize: Int = 500): List<String> {
        // 按段落分块，保持语义完整性
        val paragraphs = content.split("\n\n")
        val chunks = mutableListOf<String>()
        var currentChunk = StringBuilder()
        
        for (para in paragraphs) {
            if (currentChunk.length + para.length > maxChunkSize) {
                if (currentChunk.isNotEmpty()) chunks.add(currentChunk.toString())
                currentChunk = StringBuilder(para)
            } else {
                currentChunk.append("\n\n").append(para)
            }
        }
        
        if (currentChunk.isNotEmpty()) chunks.add(currentChunk.toString())
        return chunks
    }
}
```

**向量化任务（FunctionGraph）**：

```python
# document_vectorizer.py
import json
import requests
import psycopg2
from obs import ObsClient

def handler(event, context):
    doc_id = event['docId']
    
    # 从OBS读取文档
    obs_client = ObsClient(access_key, secret_key, server)
    content = obs_client.getObject(bucket, doc_id).body
    
    # 解析文档
    chunks = parse_document(content)
    
    # 调用Embedding API
    embeddings = []
    for chunk in chunks:
        response = requests.post(
            'https://pangu-api.huaweicloud.com/v1/embeddings',
            json={'input': chunk, 'model': 'text-embedding-3-large'}
        )
        embeddings.append(response.json()['embedding'])
    
    # 写入DWS
    conn = psycopg2.connect(dws_connection_string)
    cursor = conn.cursor()
    for chunk, embedding in zip(chunks, embeddings):
        cursor.execute(
            "INSERT INTO document_vectors (doc_id, content, embedding) VALUES (%s, %s, %s)",
            (doc_id, chunk, embedding)
        )
    conn.commit()
    
    # 更新元数据状态
    cursor.execute(
        "UPDATE document_metadata SET status = 'COMPLETED' WHERE doc_id = %s",
        (doc_id,)
    )
    conn.commit()
    
    return {'statusCode': 200, 'body': json.dumps({'docId': doc_id, 'status': 'completed'})}
```

### **1.3.6 对话管理服务**

**职责**：
- 会话创建与维护
- 对话历史存储
- 上下文管理
- 会话超时处理

**核心类设计**：

```kotlin
// 对话管理器
class DialogManager(private val redisClient: RedisClient) {
    fun createSession(userId: String): String {
        val sessionId = generateSessionId()
        val session = DialogSession(
            sessionId = sessionId,
            userId = userId,
            messages = emptyList(),
            createdAt = Instant.now(),
            status = SessionStatus.ACTIVE
        )
        redisClient.setex("session:$sessionId", SESSION_TTL, session.toJson())
        return sessionId
    }
    
    fun addMessage(sessionId: String, message: Message): DialogSession {
        val session = getSession(sessionId)
        val updatedMessages = (session.messages + message).takeLast(MAX_HISTORY_SIZE)
        val updatedSession = session.copy(messages = updatedMessages, updatedAt = Instant.now())
        redisClient.setex("session:$sessionId", SESSION_TTL, updatedSession.toJson())
        return updatedSession
    }
    
    fun getSession(sessionId: String): DialogSession {
        val json = redisClient.get("session:$sessionId")
            ?: throw SessionNotFoundException(sessionId)
        return DialogSession.fromJson(json)
    }
    
    companion object {
        const val SESSION_TTL = 3600L  // 1小时
        const val MAX_HISTORY_SIZE = 10
    }
}
```

### **1.3.7 反馈分析服务**

**职责**：
- 收集用户反馈
- 分析检索效果
- 生成优化建议
- A/B测试支持

**核心类设计**：

```kotlin
// 反馈收集器
class FeedbackCollector(private val feedbackRepo: FeedbackRepository) {
    fun collectFeedback(feedback: UserFeedback) {
        feedbackRepo.save(feedback)
        
        // 实时更新检索效果指标
        updateMetrics(feedback)
    }
}

// 效果分析器
class EffectAnalyzer(private val feedbackRepo: FeedbackRepository) {
    fun analyzeWeekly(): EffectReport {
        val feedbacks = feedbackRepo.findByDateRange(lastWeek, now)
        
        return EffectReport(
            totalQueries = feedbacks.size,
            usefulRate = feedbacks.count { it.rating == Rating.USEFUL } / feedbacks.size,
            zeroResultQueries = findZeroResultQueries(),
            topQueries = findTopQueries(100),
            suggestions = generateOptimizationSuggestions()
        )
    }
}
```

# **2. 接口设计**

## **2.1 总体设计**

系统对外提供RESTful API，遵循以下设计原则：

1. **统一响应格式**：所有接口返回统一的JSON结构
2. **错误码规范**：使用标准HTTP状态码 + 业务错误码
3. **版本控制**：URL路径包含版本号，如`/v1/search`
4. **认证方式**：Bearer Token (JWT)

**统一响应格式**：

```json
{
  "code": 0,
  "message": "success",
  "data": { ... },
  "traceId": "abc123"
}
```

**错误响应格式**：

```json
{
  "code": 10001,
  "message": "查询内容不能为空",
  "traceId": "abc123",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## **2.2 接口清单**

### **2.2.1 检索接口**

**POST /v1/search**

请求：
```json
{
  "query": "如何配置华为云ECS安全组",
  "userId": "user123",
  "sessionId": "session456",
  "context": [
    {"role": "user", "content": "华为云ECS是什么"},
    {"role": "assistant", "content": "华为云ECS是弹性云服务器..."}
  ],
  "filters": {
    "sources": ["obs", "ges"],
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-12-31"
    }
  },
  "topK": 5
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "answer": "配置华为云ECS安全组的步骤如下：\n1. 登录华为云控制台...\n根据[1]，安全组是虚拟防火墙...",
    "sources": [
      {
        "docId": "doc123",
        "title": "ECS安全组配置指南",
        "snippet": "安全组是虚拟防火墙，用于控制ECS实例的出入流量...",
        "url": "https://obs.huaweicloud.com/doc123",
        "confidence": 0.95
      }
    ],
    "confidence": 0.92,
    "relatedQuestions": [
      "如何修改安全组规则",
      "安全组最佳实践",
      "安全组与网络ACL的区别"
    ],
    "searchPath": [
      {"step": "intent_recognition", "duration": 120, "status": "success"},
      {"step": "vector_search", "duration": 350, "resultCount": 15, "status": "success"},
      {"step": "rerank", "duration": 200, "status": "success"},
      {"step": "answer_generation", "duration": 800, "status": "success"}
    ],
    "timestamp": "2024-01-01T00:00:00Z"
  },
  "traceId": "trace789"
}
```

### **2.2.2 反馈接口**

**POST /v1/feedback**

请求：
```json
{
  "queryId": "query123",
  "userId": "user123",
  "rating": "useful",
  "comment": "答案很详细，解决了我的问题"
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "feedbackId": "feedback456"
  },
  "traceId": "trace789"
}
```

### **2.2.3 文档上传接口**

**POST /v1/documents**

请求（multipart/form-data）：
```
file: <binary>
title: "ECS使用指南"
format: "pdf"
permission: "public"
tags: ["ecs", "guide"]
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "docId": "doc789",
    "status": "pending",
    "estimatedTime": 300
  },
  "traceId": "trace789"
}
```

### **2.2.4 文档状态查询接口**

**GET /v1/documents/{docId}**

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "docId": "doc789",
    "title": "ECS使用指南",
    "format": "pdf",
    "permission": "public",
    "status": "completed",
    "chunkCount": 25,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:05:00Z"
  },
  "traceId": "trace789"
}
```

### **2.2.5 会话管理接口**

**POST /v1/sessions**

请求：
```json
{
  "userId": "user123"
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "sessionId": "session789",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "traceId": "trace789"
}
```

**GET /v1/sessions/{sessionId}**

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "sessionId": "session789",
    "userId": "user123",
    "messages": [
      {"role": "user", "content": "华为云ECS是什么", "timestamp": "2024-01-01T00:00:00Z"},
      {"role": "assistant", "content": "华为云ECS是弹性云服务器...", "timestamp": "2024-01-01T00:00:05Z"}
    ],
    "status": "active"
  },
  "traceId": "trace789"
}
```

# **3. 数据模型**

## **3.1 设计目标**

1. **高性能**：支持高并发检索，向量检索延迟<500ms
2. **可扩展**：支持水平扩展，数据分片
3. **一致性**：保证元数据与向量索引的一致性
4. **可追溯**：完整的审计日志和检索路径记录

## **3.2 模型实现**

### **3.2.1 向量索引表（DWS）**

```sql
CREATE TABLE document_vectors (
    id BIGSERIAL PRIMARY KEY,
    doc_id VARCHAR(64) NOT NULL,
    chunk_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 向量索引
CREATE INDEX ON document_vectors USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 文档ID索引
CREATE INDEX idx_doc_id ON document_vectors(doc_id);

-- 组合索引
CREATE INDEX idx_doc_chunk ON document_vectors(doc_id, chunk_id);
```

### **3.2.2 文档元数据表**

```sql
CREATE TABLE document_metadata (
    doc_id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    format VARCHAR(20) NOT NULL,
    source VARCHAR(50) NOT NULL,
    permission VARCHAR(20) NOT NULL DEFAULT 'public',
    tags TEXT[],
    chunk_count INTEGER DEFAULT 0,
    vector_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    file_size BIGINT,
    created_by VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 状态索引
CREATE INDEX idx_vector_status ON document_metadata(vector_status);

-- 创建者索引
CREATE INDEX idx_created_by ON document_metadata(created_by);
```

### **3.2.3 检索日志表**

```sql
CREATE TABLE search_logs (
    id BIGSERIAL PRIMARY KEY,
    query_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    session_id VARCHAR(64),
    query_text TEXT NOT NULL,
    intent VARCHAR(50),
    rewritten_query TEXT,
    result_count INTEGER,
    confidence FLOAT,
    duration_ms INTEGER,
    search_path JSONB,
    feedback_rating VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 用户索引
CREATE INDEX idx_user_id ON search_logs(user_id);

-- 时间索引
CREATE INDEX idx_created_at ON search_logs(created_at);

-- 查询ID索引
CREATE UNIQUE INDEX idx_query_id ON search_logs(query_id);
```

### **3.2.4 用户反馈表**

```sql
CREATE TABLE user_feedbacks (
    id BIGSERIAL PRIMARY KEY,
    feedback_id VARCHAR(64) NOT NULL UNIQUE,
    query_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    rating VARCHAR(20) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 查询ID索引
CREATE INDEX idx_feedback_query_id ON user_feedbacks(query_id);

-- 用户索引
CREATE INDEX idx_feedback_user_id ON user_feedbacks(user_id);
```

### **3.2.5 会话表（Redis）**

```json
{
  "sessionId": "session789",
  "userId": "user123",
  "messages": [
    {
      "role": "user",
      "content": "华为云ECS是什么",
      "timestamp": "2024-01-01T00:00:00Z"
    },
    {
      "role": "assistant",
      "content": "华为云ECS是弹性云服务器...",
      "timestamp": "2024-01-01T00:00:05Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:05Z",
  "status": "active"
}
```

**Redis Key设计**：
- 会话数据：`session:{sessionId}`
- 用户会话列表：`user:sessions:{userId}` (Set)
- TTL：3600秒（1小时）

### **3.2.6 知识图谱（GES）**

**顶点类型**：
- `Document`：文档节点
- `Entity`：实体节点（产品、功能、概念）
- `User`：用户节点

**边类型**：
- `CONTAINS`：文档包含实体
- `RELATES_TO`：实体关联关系
- `CREATED_BY`：文档创建者

**图查询示例**：

```sql
-- 查询与"ECS"相关的所有实体
MATCH (e:Entity {name: 'ECS'})-[:RELATES_TO]->(related:Entity)
RETURN related.name, related.type

-- 查询包含"ECS"的所有文档
MATCH (d:Document)-[:CONTAINS]->(e:Entity {name: 'ECS'})
RETURN d.title, d.docId
```

# **4. 部署架构**

## **4.1 容器化部署**

所有服务打包为Docker镜像，部署在华为云CCE（Kubernetes）上。

**Deployment示例**：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: search-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: search-gateway
  template:
    metadata:
      labels:
        app: search-gateway
    spec:
      containers:
      - name: gateway
        image: registry.huaweicloud.com/deep-search/gateway:v1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: DWS_HOST
          valueFrom:
            secretKeyRef:
              name: dws-credentials
              key: host
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 2
            memory: 4Gi
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

## **4.2 服务网格**

使用Istio进行服务治理：

- **流量管理**：A/B测试、金丝雀发布
- **安全**：mTLS加密、RBAC
- **可观测性**：分布式追踪、监控指标

## **4.3 监控告警**

**监控指标**（Prometheus）：

```yaml
# 检索请求QPS
- alert: HighQPS
  expr: rate(search_requests_total[5m]) > 100
  for: 1m
  annotations:
    summary: "检索请求QPS过高"

# 响应时间P95
- alert: HighLatency
  expr: histogram_quantile(0.95, rate(search_duration_seconds_bucket[5m])) > 5
  for: 1m
  annotations:
    summary: "检索响应时间过长"

# 错误率
- alert: HighErrorRate
  expr: rate(search_errors_total[5m]) / rate(search_requests_total[5m]) > 0.05
  for: 1m
  annotations:
    summary: "检索错误率过高"
```

**日志收集**（Loki）：

所有服务日志输出到标准输出，由Fluent Bit收集到Loki，支持通过TraceID查询完整调用链路。

# **5. 性能优化**

## **5.1 向量检索优化**

1. **索引选择**：使用IVFFlat索引，lists=100（适合百万级数据）
2. **预计算**：热点查询结果缓存到Redis
3. **批量检索**：支持批量向量检索，减少网络开销
4. **分区策略**：按文档类型分区，减少检索范围

## **5.2 LLM调用优化**

1. **Prompt缓存**：相同Prompt复用结果
2. **流式输出**：支持SSE流式返回，提升用户体验
3. **Token优化**：精简Prompt，减少Token消耗
4. **异步调用**：非关键路径异步调用LLM

## **5.3 数据库优化**

1. **连接池**：使用HikariCP，最大连接数=CPU核心数*2+1
2. **读写分离**：DWS主库写入，从库读取
3. **分库分表**：检索日志按月分表
4. **冷热分离**：历史日志归档到OBS

## **5.4 缓存策略**

1. **多级缓存**：本地缓存（Caffeine） + 分布式缓存（Redis）
2. **缓存预热**：启动时加载热点数据
3. **缓存失效**：文档更新时主动失效相关缓存
4. **缓存穿透**：空结果缓存短时间（30秒）

# **6. 安全设计**

## **6.1 认证鉴权**

1. **JWT认证**：用户登录后颁发JWT Token
2. **权限校验**：基于RBAC的权限控制
3. **数据隔离**：租户级数据隔离，SQL查询自动添加租户条件

## **6.2 数据安全**

1. **传输加密**：全链路HTTPS
2. **存储加密**：OBS、DWS数据加密存储
3. **敏感信息脱敏**：答案中自动脱敏身份证、手机号等
4. **审计日志**：所有数据访问记录审计日志

## **6.3 防护措施**

1. **SQL注入防护**：使用参数化查询
2. **XSS防护**：输入输出HTML转义
3. **限流防护**：用户级、IP级限流
4. **熔断降级**：依赖服务故障时自动降级
