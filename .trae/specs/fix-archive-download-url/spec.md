# 归档文档下载链接修复 Spec

## Why
当前归档文档下载存在两个关键问题：1) 前端 `DocumentList.vue` 中 `downloadArtifact` 方法使用 `doc.id.json` 拼接路径，但实际归档文件是 `.md` 格式；2) 下载链接使用相对路径，前端硬编码 `localhost:3000` 导致服务器环境无法使用。

## What Changes
- 后端 API (`/api/v2/sessions/:id/artifacts`) 返回完整URL（包含协议和域名）
- 修复 `downloadArtifact` 方法的路径拼接错误
- 前端使用环境变量或API返回的完整URL替代硬编码

## Impact
- Affected specs: 归档功能、会话管理
- Affected code:
  - `server/routes/v2.js` (API响应修改)
  - `src/views/requirement/DocumentList.vue` (下载逻辑修复)

## ADDED Requirements

### Requirement: 归档文档API返回完整URL
归档文档列表API SHALL返回完整的、可直接访问的下载URL，格式为 `{protocol}://{host}/artifacts/{sessionId}/{fileName}`

#### Scenario: 获取归档文档列表
- **WHEN** 前端调用 `GET /api/v2/sessions/:id/artifacts`
- **THEN** API返回的 `requirementDoc.downloadUrl` 和每个artifact的 `downloadUrl` 应为完整URL，包含协议和域名

### Requirement: 前端下载功能环境适配
前端下载功能 SHALL能够根据当前环境自动选择正确的API基础地址，不再硬编码 localhost

#### Scenario: 本地环境下载文档
- **WHEN** 用户在本地环境点击下载按钮
- **THEN** 下载链接应能正常打开文件

#### Scenario: 服务器环境下载文档
- **WHEN** 用户在生产环境点击下载按钮
- **THEN** 下载链接应能正常打开文件，不应再使用 localhost

## MODIFIED Requirements

### Requirement: 归档响应消息
归档成功后的SSE响应消息 SHALL包含完整可点击的下载链接

#### Scenario: 归档完成
- **WHEN** 用户发送"归档"指令且归档成功
- **THEN** AI返回的消息中包含完整URL格式的下载链接，用户可直接点击

## REMOVED Requirements
无

## 技术细节

### 后端修改点
1. `v2.js` 第815-818行：构建完整URL
```javascript
downloadUrl: `${req.protocol}://${req.get('host')}/artifacts/${id}/${requirementDoc.fileName}`
```

2. `v2.js` 第543行：归档响应中的下载链接同样使用完整URL

### 前端修改点
1. `DocumentList.vue` 第145行：直接使用完整URL
2. `DocumentList.vue` 第148-151行：修复 `downloadArtifact` 方法的路径错误（`.json` → `.md`）
3. `DocumentList.vue` 第166-168行：预览时使用完整URL

### 环境变量配置
前端 `.env` 文件：
```
VITE_API_BASE_URL=http://localhost:3000
```
生产环境 `.env.production`：
```
VITE_API_BASE_URL=https://api.example.com
```
