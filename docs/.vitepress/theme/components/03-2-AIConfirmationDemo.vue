<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

interface Message {
  role: 'user' | 'ai'
  text: string
  highlights?: { text: string; type: 'bad' | 'good' }[]
}

const leftMessages: Message[] = [
  { role: 'user', text: '帮我做一个待办清单。' },
  { role: 'ai', text: '好的，我来帮你做一个完整的待办清单应用！我会包含：用户登录注册、云端同步、分类标签、优先级设置、截止日期提醒、团队协作...', highlights: [{ text: '登录注册', type: 'bad' }, { text: '云端同步', type: 'bad' }, { text: '分类标签', type: 'bad' }, { text: '团队协作', type: 'bad' }] },
  { role: 'user', text: '太复杂了...我只要简单的。' },
  { role: 'ai', text: '好的，我简化一下。我会做：任务添加、完成标记、分类功能、搜索过滤...', highlights: [{ text: '分类功能', type: 'bad' }, { text: '搜索过滤', type: 'bad' }] },
  { role: 'user', text: '还是太多了...😩' },
]

const rightMessages: Message[] = [
  { role: 'user', text: '帮我做一个待办清单。在开始之前，请先确认你的理解。' },
  { role: 'ai', text: '好的！在开始之前我想确认几个问题：\n1. 这是个人用还是团队用？\n2. 需要登录功能吗？\n3. 核心功能有哪些？', highlights: [{ text: '确认几个问题', type: 'good' }] },
  { role: 'user', text: '个人用，不需要登录，只要：添加任务、勾选完成、删除任务。' },
  { role: 'ai', text: '明白了，让我确认：\n✅ 个人使用的极简待办\n✅ 三个核心功能：添加、勾选、删除\n❌ 不做：登录、云同步、分类标签\n理解正确吗？', highlights: [{ text: '✅', type: 'good' }, { text: '❌ 不做', type: 'good' }] },
  { role: 'user', text: '完全正确！开始吧。' },
  { role: 'ai', text: '好的，生成精准的极简待办清单...', highlights: [{ text: '精准', type: 'good' }] },
]

const leftVisible = ref(0)
const rightVisible = ref(0)
const isPlaying = ref(false)
const showSummary = ref(false)
let timers: number[] = []

function clearTimers() { timers.forEach(t => clearTimeout(t)); timers = [] }

function play() {
  if (isPlaying.value) return
  reset()
  isPlaying.value = true
  const delay = 1200
  const maxLen = Math.max(leftMessages.length, rightMessages.length)
  for (let i = 0; i < maxLen; i++) {
    timers.push(window.setTimeout(() => {
      if (i < leftMessages.length) leftVisible.value = i + 1
      if (i < rightMessages.length) rightVisible.value = i + 1
    }, delay * (i + 1)))
  }
  timers.push(window.setTimeout(() => { showSummary.value = true; isPlaying.value = false }, delay * (maxLen + 1)))
}

function reset() {
  clearTimers(); leftVisible.value = 0; rightVisible.value = 0; showSummary.value = false; isPlaying.value = false
}

function highlightText(msg: Message): string {
  let t = msg.text
  if (!msg.highlights) return t
  for (const h of msg.highlights) {
    const cls = h.type === 'bad' ? 'hl-bad' : 'hl-good'
    t = t.replaceAll(h.text, `<span class="${cls}">${h.text}</span>`)
  }
  return t
}

onUnmounted(() => clearTimers())
</script>
<!-- PLACEHOLDER_T -->

<template>
  <div class="confirm-demo">
    <div class="demo-header">
      <span class="demo-title">💬 对话对比演示</span>
      <div class="controls">
        <button class="ctrl-btn" @click="play" :disabled="isPlaying">▶ 播放</button>
        <button class="ctrl-btn" @click="reset">↺ 重置</button>
      </div>
    </div>
    <div class="columns">
      <div class="column bad-col">
        <div class="col-header bad">❌ 无确认</div>
        <div class="chat-area">
          <div v-for="(msg, i) in leftMessages.slice(0, leftVisible)" :key="'l'+i" class="msg" :class="msg.role">
            <span class="msg-label">{{ msg.role === 'user' ? '你' : 'AI' }}</span>
            <div class="msg-bubble" :class="msg.role" v-html="highlightText(msg)"></div>
          </div>
        </div>
        <div v-if="showSummary" class="summary bad-summary">❌ 3轮对话仍未对齐</div>
      </div>
      <div class="column good-col">
        <div class="col-header good">✅ 有确认</div>
        <div class="chat-area">
          <div v-for="(msg, i) in rightMessages.slice(0, rightVisible)" :key="'r'+i" class="msg" :class="msg.role">
            <span class="msg-label">{{ msg.role === 'user' ? '你' : 'AI' }}</span>
            <div class="msg-bubble" :class="msg.role" v-html="highlightText(msg)"></div>
          </div>
        </div>
        <div v-if="showSummary" class="summary good-summary">✅ 2轮确认后精准执行</div>
      </div>
    </div>
  </div>
</template>
<!-- PLACEHOLDER_S -->

<style scoped>
.confirm-demo { background: linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%); border-radius: 20px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8); font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif; }
.demo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.demo-title { font-size: 16px; font-weight: 600; color: #1d1d1f; }
.controls { display: flex; gap: 8px; }
.ctrl-btn { padding: 8px 18px; border-radius: 10px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; background: linear-gradient(135deg, #007aff, #5856d6); color: white; box-shadow: 0 2px 6px rgba(0,122,255,0.3); }
.ctrl-btn:hover:not(:disabled) { transform: translateY(-1px); }
.ctrl-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ctrl-btn:last-child { background: #f5f5f7; color: #1d1d1f; box-shadow: none; }
.columns { display: flex; gap: 16px; }
.column { flex: 1; min-width: 0; }
.col-header { padding: 10px 16px; border-radius: 12px 12px 0 0; font-size: 14px; font-weight: 600; text-align: center; }
.col-header.bad { background: #fff0f0; color: #ff3b30; }
.col-header.good { background: #f0fff4; color: #34c759; }
.chat-area { background: white; border-radius: 0 0 12px 12px; padding: 16px; min-height: 280px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.msg { display: flex; flex-direction: column; gap: 4px; animation: fadeUp 0.3s ease; }
.msg.user { align-items: flex-end; }
.msg.ai { align-items: flex-start; }
.msg-label { font-size: 11px; color: #86868b; font-weight: 500; padding: 0 4px; }
.msg-bubble { padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.6; max-width: 90%; white-space: pre-line; }
.msg-bubble.user { background: #007aff; color: white; border-bottom-right-radius: 4px; }
.msg-bubble.ai { background: #f5f5f7; color: #1d1d1f; border-bottom-left-radius: 4px; }
:deep(.hl-bad) { background: rgba(255,59,48,0.15); color: #ff3b30; font-weight: 600; padding: 1px 4px; border-radius: 4px; }
:deep(.hl-good) { background: rgba(52,199,89,0.15); color: #34c759; font-weight: 600; padding: 1px 4px; border-radius: 4px; }
.summary { padding: 12px; border-radius: 10px; text-align: center; font-size: 14px; font-weight: 600; margin-top: 12px; animation: fadeUp 0.4s ease; }
.bad-summary { background: #fff0f0; color: #ff3b30; }
.good-summary { background: #f0fff4; color: #34c759; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-color-scheme: dark) {
  .confirm-demo { background: linear-gradient(180deg, #1c1c1e 0%, #2c2c2e 100%); }
  .demo-title { color: #f5f5f7; }
  .chat-area { background: #2c2c2e; }
  .msg-bubble.ai { background: #3a3a3c; color: #f5f5f7; }
  .col-header.bad { background: #3a1c1c; }
  .col-header.good { background: #1c3a1c; }
  .bad-summary { background: #3a1c1c; }
  .good-summary { background: #1c3a1c; }
  .ctrl-btn:last-child { background: #3a3a3c; color: #f5f5f7; }
}
@media (max-width: 640px) {
  .confirm-demo { padding: 16px; }
  .columns { flex-direction: column; }
  .chat-area { min-height: 200px; }
}
</style>
