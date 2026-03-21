# Tasks

## 任务列表

- [x] Task 1: 修改后端API返回完整URL
  - [x] SubTask 1.1: 修改 `v2.js` 第815-818行，使 `requirementDoc.downloadUrl` 返回完整URL
  - [x] SubTask 1.2: 修改 `v2.js` 第543行，使归档响应消息中的下载链接使用完整URL
  - [x] SubTask 1.3: 修改 `v2.js` 第819-824行，使 artifacts 列表中的 downloadUrl 也返回完整URL

- [x] Task 2: 修复前端下载功能
  - [x] SubTask 2.1: 修复 `DocumentList.vue` 中 `downloadArtifact` 方法的路径拼接错误（`.json` → `.md`）
  - [x] SubTask 2.2: 修改 `downloadDocument` 方法使用API返回的完整URL，不再拼接 host
  - [x] SubTask 2.3: 修改 `fetchDocumentContent` 方法使用完整URL
  - [x] SubTask 2.4: 确保所有下载相关方法能适配环境变量 `VITE_API_BASE_URL`

- [x] Task 3: 验证修复
  - [x] SubTask 3.1: 本地环境测试归档和下载功能
  - [x] SubTask 3.2: 验证错误修复后的下载路径正确性

## 任务依赖
- Task 2 依赖 Task 1 完成（后端API修改完成后前端才能正确使用）

## 完成情况
- Task 1、Task 2 和 Task 3 全部完成
