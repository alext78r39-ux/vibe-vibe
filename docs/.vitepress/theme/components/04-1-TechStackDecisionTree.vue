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
  stack: string[]
  reason: string
}

const questions: Question[] = [
  {
    id: 'backend', text: '你的项目需要后端吗？',
    options: [
      { label: '需要（用户登录、数据库）', icon: '🖥️', next: 'seo' },
      { label: '不需要（纯展示）', icon: '📄', next: 'static' },
      { label: '不确定', icon: '🤔', result: 'nextjs-full' },
    ]
  },
  {
    id: 'seo', text: '需要搜索引擎优化（SEO）吗？',
    options: [
      { label: '需要（博客、官网）', icon: '🔍', result: 'nextjs-full' },
      { label: '不需要（后台系统）', icon: '📊', next: 'db' },
    ]
  },
  {
    id: 'db', text: '需要数据库吗？',
    options: [
      { label: '需要', icon: '💾', result: 'nextjs-db' },
      { label: '不需要', icon: '📁', result: 'nextjs-light' },
    ]
  },
  {
    id: 'static', text: '页面有交互功能吗？',
    options: [
      { label: '有（表单、动画）', icon: '✨', result: 'vite-react' },
      { label: '纯静态展示', icon: '📰', result: 'static-html' },
    ]
  },
]

const results: Record<string, Result> = {
  'nextjs-full': {
    id: 'nextjs-full', name: 'Next.js 全栈方案', badge: '推荐', badgeClass: 'badge-green',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Vercel'],
    reason: '全栈统一语言，AI 友好度最高，适合大多数项目'
  },
  'nextjs-db': {
    id: 'nextjs-db', name: 'Next.js + 数据库', badge: '全栈', badgeClass: 'badge-blue',
    stack: ['Next.js', 'TypeScript', 'Supabase/Neon', 'Vercel'],
    reason: '后台系统首选，Supabase 提供开箱即用的数据库和认证'
  },
  'nextjs-light': {
    id: 'nextjs-light', name: 'Next.js 轻量版', badge: '轻量', badgeClass: 'badge-purple',
    stack: ['Next.js', 'TypeScript', 'Vercel'],
    reason: '不需要数据库的全栈应用，API Routes 处理业务逻辑'
  },
  'vite-react': {
    id: 'vite-react', name: 'Vite + React', badge: '前端', badgeClass: 'badge-cyan',
    stack: ['Vite', 'React', 'TypeScript'],
    reason: '纯前端应用，构建速度快，适合 SPA 单页应用'
  },
  'static-html': {
    id: 'static-html', name: '纯 HTML/CSS', badge: '极简', badgeClass: 'badge-gray',
    stack: ['HTML', 'CSS', 'JavaScript'],
    reason: '最简单的方案，适合个人主页、活动页等纯展示场景'
  },
}

const currentQ = ref('backend')
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
  currentQ.value = 'backend'
  history.value = []
  finalResult.value = null
}
</script>

<template>
  <div class="tsd-root">
    <div class="tsd-progress">
      <div class="tsd-progress-bar" :style="{ width: progress + '%' }"></div>
    </div>

    <div class="tsd-breadcrumb" v-if="history.length > 0 || finalResult">
      <button class="tsd-crumb" @click="reset">开始</button>
      <template v-for="(hid, i) in history" :key="i">
        <span class="tsd-crumb-sep">›</span>
        <span class="tsd-crumb-text">{{ questions.find(q => q.id === hid)?.text.slice(0, 8) }}…</span>
      </template>
    </div>

    <div v-if="!finalResult && question" class="tsd-question">
      <h3 class="tsd-q-text">{{ question.text }}</h3>
      <div class="tsd-options">
        <button v-for="opt in question.options" :key="opt.label"
          class="tsd-option" @click="choose(opt)">
          <span class="tsd-opt-icon">{{ opt.icon }}</span>
          <span class="tsd-opt-label">{{ opt.label }}</span>
        </button>
      </div>
    </div>

    <div v-if="finalResult" class="tsd-result">
      <div class="tsd-result-header">
        <span class="tsd-result-icon">🎯</span>
        <span class="tsd-result-title">推荐方案</span>
      </div>
      <div class="tsd-result-card">
        <div class="tsd-result-name">
          {{ finalResult.name }}
          <span :class="['tsd-badge', finalResult.badgeClass]">{{ finalResult.badge }}</span>
        </div>
        <div class="tsd-result-stack">
          <span v-for="s in finalResult.stack" :key="s" class="tsd-stack-tag">{{ s }}</span>
        </div>
        <div class="tsd-result-reason">{{ finalResult.reason }}</div>
      </div>
    </div>

    <div class="tsd-actions">
      <button v-if="history.length > 0 || finalResult" class="tsd-btn tsd-btn-back" @click="goBack">← 上一步</button>
      <button v-if="finalResult" class="tsd-btn tsd-btn-reset" @click="reset">重新选择</button>
    </div>
  </div>
</template>

<style scoped>
.tsd-root { margin: 24px 0; }
.tsd-progress { height: 4px; border-radius: 2px; background: var(--vp-c-divider); margin-bottom: 16px; overflow: hidden; }
.tsd-progress-bar { height: 100%; background: var(--vp-c-brand); border-radius: 2px; transition: width 0.3s ease; }
.tsd-breadcrumb {
  display: flex; align-items: center; gap: 6px; margin-bottom: 16px;
  font-size: 12px; color: var(--vp-c-text-3); flex-wrap: wrap;
}
.tsd-crumb {
  padding: 2px 8px; border-radius: 4px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); font-size: 12px; cursor: pointer;
  color: var(--vp-c-text-2); transition: all 0.2s;
}
.tsd-crumb:hover { border-color: var(--vp-c-brand); color: var(--vp-c-brand); }
.tsd-crumb-sep { color: var(--vp-c-text-3); }
.tsd-crumb-text { color: var(--vp-c-text-3); }
.tsd-question { text-align: center; }
.tsd-q-text { font-size: 18px; color: var(--vp-c-text-1); margin: 0 0 20px; }
.tsd-options { display: flex; flex-direction: column; gap: 10px; max-width: 480px; margin: 0 auto; }
.tsd-option {
  display: flex; align-items: center; gap: 10px; padding: 14px 20px;
  border-radius: 12px; border: 2px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);
  cursor: pointer; transition: all 0.2s; text-align: left;
}
.tsd-option:hover { border-color: var(--vp-c-brand); background: var(--vp-c-brand-dimm); transform: translateY(-2px); }
.tsd-opt-icon { font-size: 22px; flex-shrink: 0; }
.tsd-opt-label { font-size: 14px; font-weight: 600; color: var(--vp-c-text-1); }
.tsd-result { text-align: center; }
.tsd-result-header { margin-bottom: 16px; }
.tsd-result-icon { font-size: 32px; }
.tsd-result-title { font-size: 16px; font-weight: 600; color: var(--vp-c-text-1); margin-left: 8px; }
.tsd-result-card {
  max-width: 420px; margin: 0 auto; padding: 24px; border-radius: 12px;
  border: 2px solid var(--vp-c-brand); background: var(--vp-c-brand-dimm);
}
.tsd-result-name { font-size: 20px; font-weight: 700; color: var(--vp-c-text-1); margin-bottom: 10px; }
.tsd-badge {
  display: inline-block; padding: 2px 8px; border-radius: 999px;
  font-size: 11px; font-weight: 600; margin-left: 8px; vertical-align: middle;
}
.badge-green { background: rgba(52,199,89,0.15); color: #34c759; }
.badge-blue { background: rgba(0,122,255,0.15); color: #007aff; }
.badge-purple { background: rgba(88,86,214,0.15); color: #5856d6; }
.badge-cyan { background: rgba(46,179,223,0.15); color: #2eb3df; }
.badge-gray { background: var(--vp-c-default-soft); color: var(--vp-c-text-2); }
.tsd-result-stack { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px; }
.tsd-stack-tag {
  padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
  background: var(--vp-c-bg); color: var(--vp-c-text-2);
}
.tsd-result-reason { font-size: 14px; color: var(--vp-c-text-2); line-height: 1.6; }
.tsd-actions { display: flex; justify-content: center; gap: 10px; margin-top: 20px; }
.tsd-btn {
  padding: 6px 16px; border-radius: 8px; font-size: 13px;
  cursor: pointer; transition: all 0.2s; border: 1px solid var(--vp-c-divider);
}
.tsd-btn-back { background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); }
.tsd-btn-back:hover { border-color: var(--vp-c-text-3); }
.tsd-btn-reset { background: var(--vp-c-bg-soft); color: var(--vp-c-brand); border-color: var(--vp-c-brand); }
.tsd-btn-reset:hover { background: var(--vp-c-brand-dimm); }
@media (max-width: 640px) {
  .tsd-options { max-width: 100%; }
  .tsd-option { padding: 12px 14px; }
}
</style>
