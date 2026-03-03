<script setup lang="ts">
import { ref } from 'vue'

interface Step {
  id: number
  label: string
  icon: string
  title: string
  description: string
  tip: string
}

const steps: Step[] = [
  { id: 1, label: '获取凭证', icon: '🔑', title: '获取 API Key',
    description: '在服务商的开发者平台注册账号，创建应用，生成 API Key。',
    tip: 'API Key 就像银行卡密码，不要泄露给任何人！' },
  { id: 2, label: '选择路线', icon: '🛤️', title: '选择 SDK 或 HTTP',
    description: '优先使用官方 SDK（类型完善、文档齐全），没有 SDK 时再用 HTTP 请求。',
    tip: 'SDK 自带 TypeScript 类型，AI 生成代码更准确。' },
  { id: 3, label: '配置环境', icon: '⚙️', title: '配置环境变量',
    description: '将 API Key 存入 .env 文件，通过 process.env 读取，不要硬编码在代码中。',
    tip: '修改 .env 后记得重启 dev 服务器！' },
  { id: 4, label: '最小测试', icon: '🧪', title: '编写最小测试',
    description: '写一个最简单的调用，验证 API Key 有效、网络连通、SDK 配置正确。',
    tip: '先跑通最简单的调用，再写复杂功能。' },
  { id: 5, label: '归档文档', icon: '📚', title: '归档参考文档',
    description: '保存官方文档为 Markdown，整理常用代码速查表，方便后续开发和 AI 参考。',
    tip: '把文档喂给 AI，它生成的代码更准确。' },
  { id: 6, label: '业务开发', icon: '🚀', title: '开发业务功能',
    description: '基础打好后，告诉 AI 你想实现的功能，配合归档的文档，开始正式开发。',
    tip: '注意限流和缓存，避免频繁调用浪费额度。' },
]

const activeStep = ref(1)
const completedSteps = ref<Set<number>>(new Set())

function selectStep(id: number) {
  activeStep.value = id
}

function toggleComplete(id: number) {
  const next = new Set(completedSteps.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  completedSteps.value = next
  if (id < 6 && next.has(id)) {
    activeStep.value = id + 1
  }
}

const currentStep = () => steps.find(s => s.id === activeStep.value)!
</script>

<template>
  <div class="aif-root">
    <div class="aif-stepper">
      <div v-for="s in steps" :key="s.id"
        :class="['aif-step', { active: activeStep === s.id, completed: completedSteps.has(s.id) }]"
        @click="selectStep(s.id)">
        <div class="aif-step-circle">
          <span v-if="completedSteps.has(s.id)">✓</span>
          <span v-else>{{ s.id }}</span>
        </div>
        <div class="aif-step-label">{{ s.label }}</div>
      </div>
    </div>

    <div class="aif-detail">
      <div class="aif-detail-header">
        <span class="aif-detail-icon">{{ currentStep().icon }}</span>
        <span class="aif-detail-title">{{ currentStep().title }}</span>
      </div>
      <div class="aif-detail-desc">{{ currentStep().description }}</div>
      <div class="aif-detail-tip">💡 {{ currentStep().tip }}</div>
      <button class="aif-check-btn" @click="toggleComplete(activeStep)">
        {{ completedSteps.has(activeStep) ? '↩ 取消完成' : '✓ 标记完成' }}
      </button>
    </div>

    <div class="aif-progress-text">
      已完成 {{ completedSteps.size }} / {{ steps.length }} 步
    </div>
  </div>
</template>

<style scoped>
.aif-root { margin: 24px 0; }
.aif-stepper {
  display: flex; gap: 4px; margin-bottom: 20px; overflow-x: auto;
  padding-bottom: 4px;
}
.aif-step {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 10px 14px; border-radius: 10px; cursor: pointer; transition: all 0.2s;
  min-width: 70px; flex-shrink: 0;
}
.aif-step:hover { background: var(--vp-c-bg-soft); }
.aif-step.active { background: var(--vp-c-brand-dimm); }
.aif-step-circle {
  width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center;
  justify-content: center; font-size: 13px; font-weight: 700;
  border: 2px solid var(--vp-c-divider); color: var(--vp-c-text-2);
  background: var(--vp-c-bg); transition: all 0.2s;
}
.aif-step.active .aif-step-circle { border-color: var(--vp-c-brand); color: var(--vp-c-brand); }
.aif-step.completed .aif-step-circle { border-color: #34c759; background: #34c759; color: #fff; }
.aif-step-label { font-size: 11px; font-weight: 600; color: var(--vp-c-text-3); text-align: center; }
.aif-step.active .aif-step-label { color: var(--vp-c-text-1); }
.aif-detail {
  padding: 20px; border-radius: 12px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); animation: aifFade 0.25s ease;
}
.aif-detail-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.aif-detail-icon { font-size: 24px; }
.aif-detail-title { font-size: 16px; font-weight: 700; color: var(--vp-c-text-1); }
.aif-detail-desc { font-size: 13px; color: var(--vp-c-text-2); line-height: 1.6; margin-bottom: 10px; }
.aif-detail-tip {
  padding: 8px 12px; border-radius: 6px; background: rgba(255,149,0,0.08);
  font-size: 12px; color: #ff9500; margin-bottom: 14px;
}
.aif-check-btn {
  padding: 6px 18px; border-radius: 8px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg); font-size: 13px; font-weight: 600; cursor: pointer;
  color: var(--vp-c-text-2); transition: all 0.2s;
}
.aif-check-btn:hover { border-color: #34c759; color: #34c759; }
.aif-progress-text { margin-top: 12px; font-size: 12px; color: var(--vp-c-text-3); text-align: center; }
@keyframes aifFade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 640px) {
  .aif-step { padding: 8px 10px; min-width: 56px; }
  .aif-step-circle { width: 28px; height: 28px; font-size: 12px; }
  .aif-step-label { font-size: 10px; }
}
</style>
