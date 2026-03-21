<template>
  <div class="chat-window-page">
    <div class="chat-header">
      <button @click="goBack" class="back-btn">← 返回</button>
      <h2 class="chat-title">{{ session?.title || '加载中...' }}</h2>
      <button @click="showTitleEdit = true" class="edit-btn">✏️ 编辑</button>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="message in messages" :key="message.id" :class="['message', message.role]">
        <div class="message-avatar">{{ message.role === 'user' ? '👤' : '🤖' }}</div>
        <div class="message-content">
          <div class="message-text" v-html="formatContent(message.content)"></div>
          <div class="message-time">{{ formatTime(message.created_at) }}</div>
        </div>
      </div>
      
      <div v-if="isStreaming" class="message assistant">
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <div class="message-text streaming">
            <span v-html="formatContent(streamingContent)"></span><span class="cursor">|</span>
          </div>
        </div>
      </div>
      
      <div v-if="messages.length === 0 && !isStreaming" class="empty-chat">
        <p>👋 开始输入您的需求，AI 将帮助您收敛需求...</p>
      </div>
    </div>
    
    <div class="chat-input-area">
      <textarea v-model="inputMessage" placeholder="输入您的需求..." @keydown.enter.exact.prevent="sendMessage" class="chat-input" rows="3"></textarea>
      <div class="input-actions">
        <span class="hint">Shift + Enter 换行</span>
        <button @click="sendMessage" :disabled="!inputMessage.trim() || isStreaming" class="send-btn">
          {{ isStreaming ? '生成中...' : '发送' }}
        </button>
      </div>
    </div>
    
    <div v-if="showTitleEdit" class="modal-overlay" @click="showTitleEdit = false">
      <div class="modal-content" @click.stop>
        <h3>编辑会话标题</h3>
        <input type="text" v-model="editTitle" class="form-input" placeholder="会话标题">
        <div class="modal-actions">
          <button @click="showTitleEdit = false" class="btn btn-secondary">取消</button>
          <button @click="saveTitle" class="btn btn-primary">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { sessionApi } from '../../api/session.js'
import markdownit from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// 配置 markdown-it 实例，支持代码高亮
const md = markdownit({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    return md.utils.escapeHtml(str)
  }
})

const route = useRoute()
const router = useRouter()
const sessionId = route.params.id

const session = ref(null)
const messages = ref([])
const inputMessage = ref('')
const isStreaming = ref(false)
const streamingContent = ref('')
const messagesContainer = ref(null)
const showTitleEdit = ref(false)
const editTitle = ref('')
const errorMsg = ref('')

const fetchSession = async () => {
  try {
    const res = await sessionApi.v2.getById(sessionId)
    if (res.success) {
      session.value = res.data
      messages.value = res.data.history || []
      editTitle.value = res.data.title
      nextTick(() => scrollToBottom())
    } else if (res.code === 0) {
      session.value = res.data
      messages.value = res.data.history || []
      editTitle.value = res.data.title
      nextTick(() => scrollToBottom())
    }
  } catch (error) {
    console.error('获取会话失败:', error)
  }
}

const fetchMessages = async () => {
  try {
    const res = await sessionApi.v2.getById(sessionId)
    if (res.success) {
      messages.value = res.data.history || []
      nextTick(() => scrollToBottom())
    } else if (res.code === 0) {
      messages.value = res.data.history || []
      nextTick(() => scrollToBottom())
    }
  } catch (error) {
    console.error('获取消息失败:', error)
  }
}

const sendMessage = async () => {
  const content = inputMessage.value.trim()
  if (!content || isStreaming.value) return
  
  inputMessage.value = ''
  isStreaming.value = true
  streamingContent.value = ''
  
  let chunkCount = 0
  let totalContentLength = 0
  let lastChunkTime = Date.now()
  let buffer = ''
  
  try {
    const response = await sessionApi.v2.chat(sessionId, content)
    
    if (!response.ok) {
      console.error('Chat API error:', response.status, response.statusText)
      let errorMsg = '发送消息失败'
      try {
        const errorData = await response.json()
        errorMsg = errorData.error || errorMsg
      } catch {}
      throw new Error(errorMsg)
    }
    
    if (!response.body) {
      console.error('Response body is null')
      throw new Error('服务器响应无效')
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const now = Date.now()
      if (now - lastChunkTime > 5000) {
        console.warn('Chunk 间隔过长:', now - lastChunkTime, 'ms')
      }
      lastChunkTime = now
      chunkCount++
      
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'chunk') {
              streamingContent.value += data.content
              totalContentLength += data.content.length
              scrollToBottom()
            } else if (data.type === 'done' || data.type === 'complete') {
              await fetchMessages()
            } else if (data.type === 'error') {
              console.error('SSE error:', data.message)
              errorMsg.value = data.message || '处理消息失败'
            }
          } catch (parseError) {
            console.error('解析 SSE 数据失败:', parseError, 'line:', line)
          }
        }
      }
    }
    
    if (chunkCount === 0) {
      console.error('未收到任何 chunk')
    }
    
    if (buffer.trim()) {
      console.warn('存在未处理的缓冲区数据:', buffer)
      try {
        if (buffer.startsWith('data: ')) {
          const data = JSON.parse(buffer.slice(6))
          if (data.type === 'chunk') {
            streamingContent.value += data.content
            totalContentLength += data.content.length
          }
        }
      } catch (e) {
        console.error('处理剩余缓冲数据失败:', e)
      }
    }
    
    if (totalContentLength === 0) {
      console.warn('收到的内容总长度为 0')
    }
    
  } catch (error) {
    console.error('发送消息失败:', error)
    inputMessage.value = content
  } finally {
    isStreaming.value = false
    streamingContent.value = ''
    scrollToBottom()
  }
}

const saveTitle = async () => {
  try {
    const res = await sessionApi.v2.update(sessionId, { title: editTitle.value })
    if (res.code === 0) {
      session.value.title = editTitle.value
      showTitleEdit.value = false
    }
  } catch (error) {
    console.error('更新标题失败:', error)
  }
}

const goBack = () => router.push('/requirement/sessions')

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatContent = (content) => {
  if (!content) return ''
  if (typeof content !== 'string') {
    if (content && content.text) {
      return md.render(content.text)
    }
    console.warn('formatContent received non-string content:', typeof content, content)
    return String(content)
  }
  return md.render(content)
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  fetchSession()
  fetchMessages()
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchSession()
    fetchMessages()
  }
})
</script>

<style scoped>
.chat-window-page { display: flex; flex-direction: column; height: 100vh; background: #f5f7fa; }
.chat-header { display: flex; align-items: center; padding: 16px 24px; background: white; border-bottom: 1px solid #eee; }
.back-btn { background: none; border: none; color: #667eea; cursor: pointer; font-size: 14px; padding: 8px 12px; border-radius: 6px; }
.back-btn:hover { background: #f0f0f0; }
.chat-title { flex: 1; text-align: center; font-size: 18px; color: #333; }
.edit-btn { background: none; border: none; font-size: 14px; cursor: pointer; padding: 8px 12px; border-radius: 6px; }
.edit-btn:hover { background: #f0f0f0; }
.chat-messages { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.message { display: flex; gap: 12px; max-width: 80%; }
.message.user { align-self: flex-end; flex-direction: row-reverse; }
.message.assistant { align-self: flex-start; }
.message-avatar { width: 36px; height: 36px; border-radius: 50%; background: #e0e0e0; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.message.user .message-avatar { background: linear-gradient(135deg, #667eea, #764ba2); }
.message-content { background: white; padding: 12px 16px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.message.user .message-content { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
.message-text { font-size: 14px; line-height: 1.6; word-break: break-word; }
.message-text.streaming { min-height: 20px; }
/* Markdown 样式 */
.message-text :deep(h1), .message-text :deep(h2), .message-text :deep(h3), .message-text :deep(h4), .message-text :deep(h5), .message-text :deep(h6) { margin: 16px 0 8px 0; font-weight: 600; line-height: 1.4; }
.message-text :deep(h1) { font-size: 24px; }
.message-text :deep(h2) { font-size: 20px; }
.message-text :deep(h3) { font-size: 18px; }
.message-text :deep(h4) { font-size: 16px; }
.message-text :deep(h5) { font-size: 14px; }
.message-text :deep(h6) { font-size: 12px; }
.message-text :deep(p) { margin: 8px 0; }
.message-text :deep(strong) { font-weight: 600; }
.message-text :deep(em) { font-style: italic; }
.message-text :deep(ul), .message-text :deep(ol) { margin: 8px 0; padding-left: 24px; }
.message-text :deep(li) { margin: 4px 0; }
.message-text :deep(blockquote) { margin: 8px 0; padding: 8px 16px; border-left: 4px solid #667eea; background: #f9f9f9; border-radius: 4px; }
.message-text :deep(pre) { margin: 12px 0; padding: 16px; background: #f6f8fa; border-radius: 8px; overflow-x: auto; }
.message-text :deep(pre code) { font-family: 'Consolas', 'Monaco', monospace; font-size: 13px; }
.message-text :deep(code) { font-family: 'Consolas', 'Monaco', monospace; font-size: 13px; padding: 2px 6px; background: #f6f8fa; border-radius: 4px; }
.message-text :deep(pre code) { padding: 0; background: none; }
.message-text :deep(table) { margin: 12px 0; border-collapse: collapse; width: 100%; }
.message-text :deep(th), .message-text :deep(td) { border: 1px solid #ddd; padding: 8px 12px; }
.message-text :deep(th) { background: #f6f8fa; font-weight: 600; }
.message-text :deep(tr:nth-child(even)) { background: #f9f9f9; }
.message-text :deep(a) { color: #667eea; text-decoration: none; }
.message-text :deep(a:hover) { text-decoration: underline; }
.message-text :deep(hr) { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
.message-text :deep(img) { max-width: 100%; border-radius: 8px; }
.cursor { animation: blink 1s infinite; }
@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
.message-time { font-size: 11px; color: #999; margin-top: 4px; }
.message.user .message-time { color: rgba(255,255,255,0.7); }
.empty-chat { flex: 1; display: flex; align-items: center; justify-content: center; color: #888; font-size: 16px; }
.chat-input-area { padding: 16px 24px; background: white; border-top: 1px solid #eee; }
.chat-input { width: 100%; padding: 12px 16px; border: 2px solid #e0e0e0; border-radius: 12px; font-size: 14px; resize: none; font-family: inherit; box-sizing: border-box; }
.chat-input:focus { outline: none; border-color: #667eea; }
.input-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
.hint { font-size: 12px; color: #999; }
.send-btn { padding: 10px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 20px; font-size: 14px; cursor: pointer; }
.send-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
.send-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; padding: 24px; border-radius: 12px; width: 400px; max-width: 90%; }
.modal-content h3 { margin-bottom: 16px; color: #333; }
.form-input { width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; box-sizing: border-box; margin-bottom: 16px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
.btn { padding: 10px 20px; border-radius: 8px; font-size: 14px; cursor: pointer; border: none; }
.btn-primary { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
.btn-secondary { background: #f0f0f0; color: #666; }
</style>
