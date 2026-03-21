# Bug 修复计划：ChatWindow.vue Markdown 渲染错误

## 问题描述

当用户点击会话列表中的某个会话时，控制台报错：
```
Uncaught (in promise) Error: Input data should be a String
at MarkdownIt.parse (index.mjs:506:11)
at MarkdownIt.render (index.mjs:530:36)
at Proxy.formatContent (ChatWindow.vue:249:13)
```

## 根本原因

`ChatWindow.vue` 的 `formatContent` 函数（第247-250行）在渲染 Markdown 时没有对 `content` 类型进行检查：

```javascript
const formatContent = (content) => {
  if (!content) return ''
  return md.render(content)  // 如果 content 不是字符串则报错
}
```

当 API 返回的 `history` 数组中，某个消息的 `content` 字段是对象或其他非字符串类型时，`markdown-it` 的 `render()` 方法会抛出 "Input data should be a String" 错误。

## 修复步骤

1. 在 `formatContent` 函数中添加类型检查
2. 如果 `content` 不是字符串，将其转换为字符串或返回空字符串
3. 添加警告日志以便调试

## 修改文件

- `d:\DFX\Code\AIbisai-wangzhan - 副本\ai-contest-web\src\views\requirement\ChatWindow.vue`

## 具体修改

将 `formatContent` 函数（第247-250行）从：

```javascript
const formatContent = (content) => {
  if (!content) return ''
  return md.render(content)
}
```

修改为：

```javascript
const formatContent = (content) => {
  if (!content) return ''
  if (typeof content !== 'string') {
    console.warn('formatContent received non-string content:', typeof content, content)
    return String(content)
  }
  return md.render(content)
}
```
