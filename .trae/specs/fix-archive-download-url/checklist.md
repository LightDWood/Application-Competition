# Checklist

## 后端API修改
- [x] `v2.js` 第815-818行：`requirementDoc.downloadUrl` 使用完整URL格式 `${req.protocol}://${req.get('host')}/artifacts/...`
- [x] `v2.js` 第543行：归档响应消息中的下载链接使用完整URL
- [x] `v2.js` 第819-824行：artifacts列表中每个item的downloadUrl使用完整URL格式

## 前端下载功能修复
- [x] `DocumentList.vue` 第144-146行：`downloadDocument` 方法使用API返回的完整URL
- [x] `DocumentList.vue` 第148-151行：`downloadArtifact` 方法修复路径（`.json` → `.md`）
- [x] `DocumentList.vue` 第166-168行：`fetchDocumentContent` 方法使用完整URL

## 功能验证
- [x] 本地环境归档后文档列表API返回完整URL
- [x] 本地环境下载链接可正常打开文件
- [x] 服务器环境（当VITE_API_BASE_URL配置后）下载链接同样有效

## 验证结果
- 后端API已确认使用完整URL格式返回 downloadUrl
- 前端已确认使用 API 返回的完整 URL，不再拼接 host
- 修复了 downloadArtifact 的路径错误（从 `.json` 改为使用 API 返回的 `.md` 路径）
