<script setup lang="ts">
import { ref, computed } from 'vue'

interface Question {
  id: string
  text: string
  options: { label: string; icon: string; next?: string; result?: string }[]
}

interface Result {
  id: string
  name: string
  badge: string
  badgeClass: string
  reason: string
  command: string
}

const questions: Question[] = [
  {
    id: 'goal', text: '你想让 AI 做什么？',
    options: [
      { label: '连接外部服务', icon: '🔌', next: 'service' },
      { label: '增强 AI 能力', icon: '🧠', next: 'enhance' },
      { label: '自动化工作流', icon: '⚡', next: 'auto' },
      { label: '不确定', icon: '🤔', result: 'mcp' },
    ]
  },
  {
    id: 'service', text: '你要连接什么类型的服务？',
    options: [
      { label: '数据库/API', icon: '💾', result: 'mcp' },
      { label: '设计工具 (Figma)', icon: '🎨', result: 'mcp' },
      { label: '浏览器自动化', icon: '🌐', result: 'mcp' },
      { label: '代码仓库 (GitHub)', icon: '📦', result: 'mcp' },
    ]
  },
  {
    id: 'enhance', text: '你想增强哪方面的能力？',
    options: [
      { label: '代码生成质量', icon: '✨', result: 'skills' },
      { label: '特定领域知识', icon: '📚', result: 'skills' },
      { label: '项目规范约束', icon: '📏', result: 'commands' },
      { label: '重复任务模板', icon: '📋', result: 'commands' },
    ]
  },
  {
    id: 'auto', text: '你想自动化什么？',
    options: [
      { label: '提交/部署流程', icon: '🚀', result: 'commands' },
      { label: '代码审查', icon: '🔍', result: 'skills' },
      { label: '外部数据获取', icon: '📡', result: 'mcp' },
      { label: '项目初始化', icon: '🏗️', result: 'skills' },
    ]
  },
]

const results: Record<string, Result> = {
  mcp: {
    id: 'mcp', name: 'MCP Server', badge: '外部连接', badgeClass: 'badge-blue',
    reason: 'MCP 让 AI 能调用外部工具和服务，如数据库、API、浏览器等。它是 AI 与外部世界的桥梁。',
    command: '在 settings.json 中配置 mcpServers'
  },
  skills: {
    id: 'skills', name: 'Skills', badge: '能力增强', badgeClass: 'badge-green',
    reason: 'Skills 通过 SKILL.md 定义特定能力，AI 根据请求自动判断是否使用。适合增强代码生成质量和领域知识。',
    command: '创建 .claude/skills/your-skill/SKILL.md'
  },
  commands: {
    id: 'commands', name: '斜杠命令', badge: '用户触发', badgeClass: 'badge-purple',
    reason: '斜杠命令由用户显式输入触发，适合标准化的重复流程，如提交、部署、代码审查等。',
    command: '创建 .claude/commands/your-command.md'
  },
}

const currentQ = ref('goal')
const history = ref<string[]>([])
const finalResult = ref<Result | null>(null)

const question = computed(() => questions.find(q => q.id === currentQ.value))
const progress = computed(() => {
  if (finalResult.value) return 100
  return Math.round((history.value.length / 3) * 100)
})

function choose(opt: { next?: string; result?: string }) {
  history.value = [...history.value, currentQ.value]
  if (opt.result) {
    finalResult.value = results[opt.result]
  } else if (opt.next) {
    currentQ.value = opt.next
  }
}

function goBack() {
  if (finalResult.value) {
    finalResult.value = null
    currentQ.value = history.value[history.value.length - 1]
    history.value = history.value.slice(0, -1)
    return
  }
  if (history.value.length > 0) {
    currentQ.value = history.value[history.value.length - 1]
    history.value = history.value.slice(0, -1)
  }
}

function reset() {
  currentQ.value = 'goal'
  history.value = []
  finalResult.value = null
}
</script>

<template>
  <div class="mdt-root">
    <div class="mdt-progress">
      <div class="mdt-progress-bar" :style="{ width: progress + '%' }"></div>
    </div>

    <div class="mdt-breadcrumb" v-if="history.length > 0 || finalResult">
      <button class="mdt-crumb" @click="reset">开始</button>
      <template v-for="(hid, i) in history" :key="i">
        <span class="mdt-crumb-sep">›</span>
        <span class="mdt-crumb-text">{{ questions.find(q => q.id === hid)?.text.slice(0, 6) }}…</span>
      </template>
    </div>

    <div v-if="!finalResult && question" class="mdt-question">
      <h3 class="mdt-q-text">{{ question.text }}</h3>
      <div class="mdt-options">
        <button v-for="opt in question.options" :key="opt.label"
          class="mdt-option" @click="choose(opt)">
          <span class="mdt-opt-icon">{{ opt.icon }}</span>
          <span class="mdt-opt-label">{{ opt.label }}</span>
        </button>
      </div>
    </div>

    <div v-if="finalResult" class="mdt-result">
      <div class="mdt-result-header">
        <span class="mdt-result-icon">🎯</span>
        <span class="mdt-result-title">推荐方案</span>
      </div>
      <div class="mdt-result-card">
        <div class="mdt-result-name">
          {{ finalResult.name }}
          <span :class="['mdt-badge', finalResult.badgeClass]">{{ finalResult.badge }}</span>
        </div>
        <div class="mdt-result-reason">{{ finalResult.reason }}</div>
        <div class="mdt-result-cmd">
          <span class="mdt-cmd-label">快速开始：</span>
          <code class="mdt-cmd-code">{{ finalResult.command }}</code>
        </div>
      </div>
    </div>

    <div class="mdt-actions">
      <button v-if="history.length > 0 || finalResult" class="mdt-btn mdt-btn-back" @click="goBack">← 上一步</button>
      <button v-if="finalResult" class="mdt-btn mdt-btn-reset" @click="reset">重新选择</button>
    </div>
  </div>
</template>

<style scoped>
.mdt-root { margin: 24px 0; }
.mdt-progress {
  height: 4px; border-radius: 2px; background: var(--vp-c-divider);
  margin-bottom: 16px; overflow: hidden;
}
.mdt-progress-bar {
  height: 100%; background: #007aff; border-radius: 2px;
  transition: width 0.3s ease;
}
.mdt-breadcrumb {
  display: flex; align-items: center; gap: 6px; margin-bottom: 16px;
  font-size: 12px; color: var(--vp-c-text-3); flex-wrap: wrap;
}
.mdt-crumb {
  padding: 2px 8px; border-radius: 4px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); font-size: 12px; cursor: pointer;
  color: var(--vp-c-text-2); transition: all 0.2s;
}
.mdt-crumb:hover { border-color: #007aff; color: #007aff; }
.mdt-crumb-sep { color: var(--vp-c-text-3); }
.mdt-crumb-text { color: var(--vp-c-text-3); }
.mdt-question { text-align: center; }
.mdt-q-text { font-size: 18px; color: var(--vp-c-text-1); margin: 0 0 20px; }
.mdt-options {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
  max-width: 480px; margin: 0 auto;
}
.mdt-option {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 20px 16px; border-radius: 12px; border: 2px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); cursor: pointer; transition: all 0.2s;
}
.mdt-option:hover { border-color: #007aff; background: rgba(0, 122, 255, 0.06); transform: translateY(-2px); }
.mdt-opt-icon { font-size: 28px; }
.mdt-opt-label { font-size: 14px; font-weight: 600; color: var(--vp-c-text-1); }
.mdt-result { text-align: center; }
.mdt-result-header { margin-bottom: 16px; }
.mdt-result-icon { font-size: 32px; }
.mdt-result-title { font-size: 16px; font-weight: 600; color: var(--vp-c-text-1); margin-left: 8px; }
.mdt-result-card {
  max-width: 440px; margin: 0 auto; padding: 24px;
  border-radius: 12px; border: 2px solid #007aff;
  background: rgba(0, 122, 255, 0.06); text-align: left;
}
.mdt-result-name { font-size: 20px; font-weight: 700; color: var(--vp-c-text-1); margin-bottom: 8px; }
.mdt-badge {
  display: inline-block; padding: 2px 8px; border-radius: 999px;
  font-size: 11px; font-weight: 600; margin-left: 8px; vertical-align: middle;
}
.badge-blue { background: rgba(0, 122, 255, 0.15); color: #007aff; }
.badge-green { background: rgba(21, 160, 81, 0.15); color: #15a051; }
.badge-purple { background: rgba(88, 86, 214, 0.15); color: #5856d6; }
.mdt-result-reason { font-size: 14px; color: var(--vp-c-text-2); line-height: 1.6; margin-bottom: 12px; }
.mdt-result-cmd {
  padding: 10px 14px; border-radius: 8px;
  background: var(--vp-c-bg); font-size: 13px;
}
.mdt-cmd-label { color: var(--vp-c-text-3); }
.mdt-cmd-code {
  font-family: 'SF Mono', Monaco, monospace; color: var(--vp-c-text-1);
  background: none; padding: 0;
}
.mdt-actions { display: flex; justify-content: center; gap: 10px; margin-top: 20px; }
.mdt-btn {
  padding: 6px 16px; border-radius: 8px; font-size: 13px;
  cursor: pointer; transition: all 0.2s; border: 1px solid var(--vp-c-divider);
}
.mdt-btn-back { background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); }
.mdt-btn-back:hover { border-color: var(--vp-c-text-3); }
.mdt-btn-reset { background: var(--vp-c-bg-soft); color: #007aff; border-color: #007aff; }
.mdt-btn-reset:hover { background: rgba(0, 122, 255, 0.06); }
@media (max-width: 640px) {
  .mdt-options { grid-template-columns: 1fr; max-width: 100%; }
  .mdt-option { padding: 14px 12px; flex-direction: row; gap: 10px; }
  .mdt-opt-icon { font-size: 22px; }
}
</style>
