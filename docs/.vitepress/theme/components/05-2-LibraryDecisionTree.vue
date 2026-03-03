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
  link: string
}

const questions: Question[] = [
  {
    id: 'type', text: '你的项目是什么类型？',
    options: [
      { label: '后台管理系统', icon: '📊', next: 'stack' },
      { label: '面向用户的产品', icon: '👥', next: 'custom' },
      { label: '多框架统一', icon: '🔗', result: 'tdesign' },
      { label: '不确定', icon: '🤔', result: 'shadcn' },
    ]
  },
  {
    id: 'stack', text: '你用什么技术栈？',
    options: [
      { label: 'React', icon: '⚛️', result: 'antd' },
      { label: 'Vue', icon: '💚', result: 'element' },
    ]
  },
  {
    id: 'custom', text: '你对定制化的需求？',
    options: [
      { label: '需要高度定制', icon: '🎨', result: 'shadcn' },
      { label: '开箱即用好看', icon: '✨', result: 'heroui' },
      { label: 'Material Design 风格', icon: '📐', result: 'mui' },
    ]
  },
]

const results: Record<string, Result> = {
  shadcn: { id: 'shadcn', name: 'shadcn/ui', badge: '推荐', badgeClass: 'badge-green', reason: '代码在你项目里，AI 可以直接读取和修改，最灵活', link: 'https://ui.shadcn.com/' },
  antd: { id: 'antd', name: 'Ant Design', badge: 'React', badgeClass: 'badge-blue', reason: '60+ 组件覆盖几乎所有后台场景，中文文档最完善', link: 'https://ant.design/' },
  element: { id: 'element', name: 'Element Plus', badge: 'Vue 3', badgeClass: 'badge-vue', reason: 'Vue 3 生态最主流，做后台管理的默认选择', link: 'https://element-plus.org/' },
  tdesign: { id: 'tdesign', name: 'TDesign', badge: '多框架', badgeClass: 'badge-multi', reason: '同时支持 React、Vue 2/3、小程序，一套设计规范统一多端', link: 'https://tdesign.tencent.com/' },
  heroui: { id: 'heroui', name: 'HeroUI', badge: 'React', badgeClass: 'badge-blue', reason: '基于 Tailwind CSS，开箱即用就好看，内置动画效果', link: 'https://www.heroui.com/' },
  mui: { id: 'mui', name: 'MUI (Material UI)', badge: 'React', badgeClass: 'badge-blue', reason: '基于 Google Material Design 规范的第三方 React 组件库，全球使用最广泛', link: 'https://mui.com/' },
}

const currentQ = ref('type')
const history = ref<string[]>([])
const finalResult = ref<Result | null>(null)

const question = computed(() => questions.find(q => q.id === currentQ.value))
const progress = computed(() => {
  if (finalResult.value) return 100
  const idx = questions.findIndex(q => q.id === currentQ.value)
  return Math.round(((history.value.length) / 3) * 100)
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
  currentQ.value = 'type'
  history.value = []
  finalResult.value = null
}
</script>

<template>
  <div class="ldt-root">
    <div class="ldt-progress">
      <div class="ldt-progress-bar" :style="{ width: progress + '%' }"></div>
    </div>

    <div class="ldt-breadcrumb" v-if="history.length > 0 || finalResult">
      <button class="ldt-crumb" @click="reset">开始</button>
      <template v-for="(hid, i) in history" :key="i">
        <span class="ldt-crumb-sep">›</span>
        <span class="ldt-crumb-text">{{ questions.find(q => q.id === hid)?.text.slice(0, 6) }}…</span>
      </template>
    </div>

    <div v-if="!finalResult && question" class="ldt-question">
      <h3 class="ldt-q-text">{{ question.text }}</h3>
      <div class="ldt-options">
        <button v-for="opt in question.options" :key="opt.label"
          class="ldt-option" @click="choose(opt)">
          <span class="ldt-opt-icon">{{ opt.icon }}</span>
          <span class="ldt-opt-label">{{ opt.label }}</span>
        </button>
      </div>
    </div>

    <div v-if="finalResult" class="ldt-result">
      <div class="ldt-result-header">
        <span class="ldt-result-icon">🎯</span>
        <span class="ldt-result-title">推荐</span>
      </div>
      <div class="ldt-result-card">
        <div class="ldt-result-name">
          {{ finalResult.name }}
          <span :class="['ldt-badge', finalResult.badgeClass]">{{ finalResult.badge }}</span>
        </div>
        <div class="ldt-result-reason">{{ finalResult.reason }}</div>
        <a :href="finalResult.link" target="_blank" rel="noopener" class="ldt-result-link">
          访问官网 →
        </a>
      </div>
    </div>

    <div class="ldt-actions">
      <button v-if="history.length > 0 || finalResult" class="ldt-btn ldt-btn-back" @click="goBack">← 上一步</button>
      <button v-if="finalResult" class="ldt-btn ldt-btn-reset" @click="reset">重新选择</button>
    </div>
  </div>
</template>

<style scoped>
.ldt-root { margin: 24px 0; }
.ldt-progress {
  height: 4px; border-radius: 2px; background: var(--vp-c-divider);
  margin-bottom: 16px; overflow: hidden;
}
.ldt-progress-bar {
  height: 100%; background: #15a051; border-radius: 2px;
  transition: width 0.3s ease;
}
.ldt-breadcrumb {
  display: flex; align-items: center; gap: 6px; margin-bottom: 16px;
  font-size: 12px; color: var(--vp-c-text-3); flex-wrap: wrap;
}
.ldt-crumb {
  padding: 2px 8px; border-radius: 4px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); font-size: 12px; cursor: pointer;
  color: var(--vp-c-text-2); transition: all 0.2s;
}
.ldt-crumb:hover { border-color: #15a051; color: #15a051; }
.ldt-crumb-sep { color: var(--vp-c-text-3); }
.ldt-crumb-text { color: var(--vp-c-text-3); }
.ldt-question { text-align: center; }
.ldt-q-text { font-size: 18px; color: var(--vp-c-text-1); margin: 0 0 20px; }
.ldt-options {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
  max-width: 480px; margin: 0 auto;
}
.ldt-option {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 20px 16px; border-radius: 12px; border: 2px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); cursor: pointer; transition: all 0.2s;
}
.ldt-option:hover { border-color: #15a051; background: rgba(21, 160, 81, 0.06); transform: translateY(-2px); }
.ldt-opt-icon { font-size: 28px; }
.ldt-opt-label { font-size: 14px; font-weight: 600; color: var(--vp-c-text-1); }
.ldt-result { text-align: center; }
.ldt-result-header { margin-bottom: 16px; }
.ldt-result-icon { font-size: 32px; }
.ldt-result-title { font-size: 16px; font-weight: 600; color: var(--vp-c-text-1); margin-left: 8px; }
.ldt-result-card {
  max-width: 400px; margin: 0 auto; padding: 24px;
  border-radius: 12px; border: 2px solid #15a051;
  background: rgba(21, 160, 81, 0.06);
}
.ldt-result-name { font-size: 20px; font-weight: 700; color: var(--vp-c-text-1); margin-bottom: 8px; }
.ldt-badge {
  display: inline-block; padding: 2px 8px; border-radius: 999px;
  font-size: 11px; font-weight: 600; margin-left: 8px; vertical-align: middle;
}
.badge-green { background: rgba(21, 160, 81, 0.15); color: #15a051; }
.badge-blue { background: rgba(46, 179, 223, 0.15); color: #2eb3df; }
.badge-vue { background: rgba(66, 184, 131, 0.15); color: #42b883; }
.badge-multi { background: rgba(212, 149, 44, 0.15); color: #D4952C; }
.ldt-result-reason { font-size: 14px; color: var(--vp-c-text-2); line-height: 1.6; margin-bottom: 12px; }
.ldt-result-link {
  display: inline-block; padding: 6px 16px; border-radius: 8px;
  background: #15a051; color: #fff; font-size: 13px; font-weight: 600;
  text-decoration: none; transition: opacity 0.2s;
}
.ldt-result-link:hover { opacity: 0.85; }
.ldt-actions { display: flex; justify-content: center; gap: 10px; margin-top: 20px; }
.ldt-btn {
  padding: 6px 16px; border-radius: 8px; font-size: 13px;
  cursor: pointer; transition: all 0.2s; border: 1px solid var(--vp-c-divider);
}
.ldt-btn-back { background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); }
.ldt-btn-back:hover { border-color: var(--vp-c-text-3); }
.ldt-btn-reset { background: var(--vp-c-bg-soft); color: #15a051; border-color: #15a051; }
.ldt-btn-reset:hover { background: rgba(21, 160, 81, 0.06); }
@media (max-width: 640px) {
  .ldt-options { grid-template-columns: 1fr; max-width: 100%; }
  .ldt-option { padding: 14px 12px; flex-direction: row; gap: 10px; }
  .ldt-opt-icon { font-size: 22px; }
}
</style>
