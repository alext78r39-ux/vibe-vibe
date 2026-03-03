<script setup lang="ts">
import { ref } from 'vue'

interface Step {
  id: string
  label: string
  icon: string
  tools: { name: string; desc: string; link?: string }[]
}

interface UseCase {
  label: string
  stepIds: string[]
  toolNames: string[]
}

const steps: Step[] = [
  {
    id: 'inspire', label: '灵感收集', icon: '💡',
    tools: [
      { name: 'Awwwards', desc: '顶级网页设计奖', link: 'https://www.awwwards.com/' },
      { name: 'Dribbble', desc: '设计师社区', link: 'https://dribbble.com/' },
      { name: 'Mobbin', desc: '真实应用截图库', link: 'https://mobbin.com/' },
    ]
  },
  {
    id: 'prototype', label: '快速原型', icon: '🎨',
    tools: [
      { name: 'v0.app', desc: '自然语言生成 React 代码', link: 'https://v0.dev/' },
      { name: 'Google Stitch', desc: 'AI 原型设计', link: 'https://stitch.withgoogle.com/' },
      { name: 'Lovable', desc: '全栈应用生成', link: 'https://lovable.dev/' },
    ]
  },
  {
    id: 'code', label: '复制代码', icon: '📋',
    tools: [
      { name: 'v0.app', desc: '直接复制 shadcn/ui 代码' },
      { name: 'Google AI Studio', desc: '生成完整 Web 应用代码' },
    ]
  },
  {
    id: 'integrate', label: '集成逻辑', icon: '🔧',
    tools: [
      { name: 'Claude Code', desc: '业务逻辑集成 + 细节调整' },
      { name: 'Figma MCP', desc: '设计稿精确还原' },
    ]
  },
  {
    id: 'iterate', label: '迭代优化', icon: '🔄',
    tools: [
      { name: 'Claude Code', desc: '持续优化和调试' },
      { name: 'Figma', desc: '设计走查和修改' },
    ]
  },
]

const useCases: UseCase[] = [
  { label: '快速出一个组件', stepIds: ['prototype', 'code'], toolNames: ['v0.app'] },
  { label: '设计完整页面', stepIds: ['inspire', 'prototype', 'code', 'integrate'], toolNames: ['Google Stitch', 'Figma MCP'] },
  { label: '精确还原设计稿', stepIds: ['integrate'], toolNames: ['Figma MCP', 'Claude Code'] },
  { label: '快速验证产品想法', stepIds: ['prototype', 'code', 'integrate'], toolNames: ['Lovable', 'Claude Code'] },
  { label: '做 AI 驱动的应用', stepIds: ['prototype', 'code', 'integrate', 'iterate'], toolNames: ['Google AI Studio', 'Claude Code'] },
]

const activeStep = ref<string | null>(null)
const activeUseCase = ref<UseCase | null>(null)

function selectStep(id: string) {
  activeUseCase.value = null
  activeStep.value = activeStep.value === id ? null : id
}

function selectUseCase(uc: UseCase) {
  activeStep.value = null
  activeUseCase.value = activeUseCase.value === uc ? null : uc
}

function isStepHighlighted(id: string) {
  if (activeStep.value === id) return true
  return activeUseCase.value?.stepIds.includes(id) ?? false
}

function isToolHighlighted(name: string) {
  return activeUseCase.value?.toolNames.includes(name) ?? false
}

function getStep(id: string) {
  return steps.find(s => s.id === id)!
}
</script>

<template>
  <div class="dtw-root">
    <div class="dtw-section-label">工作流程</div>
    <div class="dtw-flow">
      <template v-for="(step, i) in steps" :key="step.id">
        <button
          :class="['dtw-node', { active: isStepHighlighted(step.id) }]"
          @click="selectStep(step.id)"
        >
          <span class="dtw-icon">{{ step.icon }}</span>
          <span class="dtw-label">{{ step.label }}</span>
        </button>
        <span v-if="i < steps.length - 1" :class="['dtw-arrow', { active: isStepHighlighted(steps[i+1].id) && isStepHighlighted(step.id) }]">→</span>
      </template>
    </div>

    <div class="dtw-detail" v-if="activeStep">
      <div class="dtw-detail-title">{{ getStep(activeStep).icon }} {{ getStep(activeStep).label }}</div>
      <div class="dtw-tools">
        <a v-for="tool in getStep(activeStep).tools" :key="tool.name"
          :href="tool.link" target="_blank" rel="noopener"
          :class="['dtw-tool', { highlight: isToolHighlighted(tool.name) }]"
        >
          <div class="dtw-tool-name">{{ tool.name }}</div>
          <div class="dtw-tool-desc">{{ tool.desc }}</div>
        </a>
      </div>
    </div>

    <div class="dtw-section-label" style="margin-top: 20px;">我想做什么？</div>
    <div class="dtw-cases">
      <button v-for="uc in useCases" :key="uc.label"
        :class="['dtw-case', { active: activeUseCase === uc }]"
        @click="selectUseCase(uc)"
      >{{ uc.label }}</button>
    </div>

    <div class="dtw-detail" v-if="activeUseCase">
      <div class="dtw-detail-title">推荐路径</div>
      <div class="dtw-rec-flow">
        <template v-for="(sid, i) in activeUseCase.stepIds" :key="sid">
          <span class="dtw-rec-step">{{ getStep(sid).icon }} {{ getStep(sid).label }}</span>
          <span v-if="i < activeUseCase.stepIds.length - 1" class="dtw-rec-arrow">→</span>
        </template>
      </div>
      <div class="dtw-rec-tools">
        <span class="dtw-rec-label">推荐工具：</span>
        <span v-for="name in activeUseCase.toolNames" :key="name" class="dtw-rec-tool">{{ name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dtw-root { margin: 24px 0; }
.dtw-section-label { font-size: 13px; font-weight: 600; color: var(--vp-c-text-3); margin-bottom: 10px; }
.dtw-flow {
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
  padding: 16px; background: var(--vp-c-bg-soft); border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}
.dtw-node {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 12px 16px; border-radius: 10px; border: 2px solid var(--vp-c-divider);
  background: var(--vp-c-bg); cursor: pointer; transition: all 0.25s;
  min-width: 80px;
}
.dtw-node:hover { border-color: #2eb3df; }
.dtw-node.active { border-color: #15a051; background: rgba(21, 160, 81, 0.08); }
.dtw-icon { font-size: 22px; }
.dtw-label { font-size: 12px; font-weight: 600; color: var(--vp-c-text-1); white-space: nowrap; }
.dtw-arrow { font-size: 18px; color: var(--vp-c-text-3); transition: color 0.25s; flex-shrink: 0; }
.dtw-arrow.active { color: #15a051; }
.dtw-detail {
  margin-top: 12px; padding: 16px; border-radius: 10px;
  border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);
}
.dtw-detail-title { font-size: 15px; font-weight: 600; color: var(--vp-c-text-1); margin-bottom: 12px; }
.dtw-tools { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; }
.dtw-tool {
  padding: 10px 14px; border-radius: 8px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg); transition: all 0.2s; text-decoration: none; cursor: pointer;
}
.dtw-tool:hover { border-color: #2eb3df; }
.dtw-tool.highlight { border-color: #15a051; background: rgba(21, 160, 81, 0.06); }
.dtw-tool-name { font-size: 14px; font-weight: 600; color: var(--vp-c-text-1); }
.dtw-tool-desc { font-size: 12px; color: var(--vp-c-text-3); margin-top: 2px; }
.dtw-cases { display: flex; gap: 8px; flex-wrap: wrap; }
.dtw-case {
  padding: 8px 16px; border-radius: 999px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); font-size: 13px;
  cursor: pointer; transition: all 0.2s;
}
.dtw-case:hover { border-color: #2eb3df; color: var(--vp-c-text-1); }
.dtw-case.active { background: #15a051; color: #fff; border-color: #15a051; }
.dtw-rec-flow { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.dtw-rec-step {
  padding: 4px 10px; border-radius: 6px; background: rgba(21, 160, 81, 0.1);
  font-size: 13px; font-weight: 600; color: var(--vp-c-text-1);
}
.dtw-rec-arrow { color: var(--vp-c-text-3); font-size: 14px; }
.dtw-rec-tools { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.dtw-rec-label { font-size: 12px; color: var(--vp-c-text-3); }
.dtw-rec-tool {
  padding: 3px 10px; border-radius: 6px; background: rgba(46, 179, 223, 0.1);
  font-size: 12px; font-weight: 600; color: #2eb3df;
}
@media (max-width: 640px) {
  .dtw-flow { gap: 6px; padding: 10px; }
  .dtw-node { padding: 8px 10px; min-width: 60px; }
  .dtw-icon { font-size: 18px; }
  .dtw-label { font-size: 11px; }
  .dtw-arrow { font-size: 14px; }
  .dtw-tools { grid-template-columns: 1fr; }
}
</style>
