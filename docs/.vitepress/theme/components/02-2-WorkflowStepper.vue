<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

interface Step {
  id: number
  title: string
  icon: string
  purpose: string
  prompt: string
  aiAction: string
  mistake: string
}

const steps: Step[] = [
  {
    id: 1, title: '探索', icon: '🔍',
    purpose: '了解项目结构，避免重复造轮子',
    prompt: '请先阅读项目结构，了解现有的组件和工具函数',
    aiAction: '扫描目录、读取关键文件、理解代码风格',
    mistake: '跳过探索直接写代码，导致和现有代码风格不一致'
  },
  {
    id: 2, title: '规划', icon: '📋',
    purpose: '制定实现方案，确认方向正确',
    prompt: '基于你对项目的了解，给出实现方案，不要写代码',
    aiAction: '分析需求、列出步骤、标注风险点',
    mistake: '没有规划就开始写，写到一半发现方向错了'
  },
  {
    id: 3, title: '执行', icon: '⚡',
    purpose: '按计划逐步实现功能',
    prompt: '按照方案的第一步开始实现',
    aiAction: '创建/修改文件、安装依赖、编写代码',
    mistake: '一次性让 AI 实现所有功能，结果太多错误'
  },
  {
    id: 4, title: '验证', icon: '✅',
    purpose: '确认功能正常，没有引入新问题',
    prompt: '运行测试，检查是否有类型错误或 lint 问题',
    aiAction: '运行命令、检查输出、修复问题',
    mistake: '不验证就继续下一步，错误越积越多'
  },
  {
    id: 5, title: '提交', icon: '📦',
    purpose: '保存进度，留下清晰的变更记录',
    prompt: '提交这次的改动，写清楚做了什么',
    aiAction: 'git add、git commit、生成提交信息',
    mistake: '改了很多东西才提交，回滚困难'
  },
]

const currentStep = ref(0)
const isPlaying = ref(false)
let playTimer: number | null = null

function goTo(index: number) {
  currentStep.value = index
  stopPlay()
}

function next() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

function prev() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function togglePlay() {
  if (isPlaying.value) {
    stopPlay()
  } else {
    startPlay()
  }
}

function startPlay() {
  isPlaying.value = true
  playTimer = window.setInterval(() => {
    if (currentStep.value < steps.length - 1) {
      currentStep.value++
    } else {
      stopPlay()
    }
  }, 3000)
}

function stopPlay() {
  isPlaying.value = false
  if (playTimer) {
    clearInterval(playTimer)
    playTimer = null
  }
}

onUnmounted(() => stopPlay())
</script>

<template>
  <div class="ws-root">
    <div class="ws-stepper">
      <div
        v-for="(step, i) in steps" :key="step.id"
        class="ws-step"
        :class="{ active: i === currentStep, done: i < currentStep }"
        @click="goTo(i)"
      >
        <span class="ws-step-icon">{{ step.icon }}</span>
        <span class="ws-step-title">{{ step.title }}</span>
        <div v-if="i < steps.length - 1" class="ws-step-line" :class="{ filled: i < currentStep }"></div>
      </div>
    </div>

    <div class="ws-content" :key="currentStep">
      <div class="ws-content-header">
        <span class="ws-content-num">{{ steps[currentStep].id }}/{{ steps.length }}</span>
        <h3 class="ws-content-title">{{ steps[currentStep].icon }} {{ steps[currentStep].title }}</h3>
      </div>

      <div class="ws-cards">
        <div class="ws-card">
          <div class="ws-card-label">🎯 目的</div>
          <div class="ws-card-text">{{ steps[currentStep].purpose }}</div>
        </div>
        <div class="ws-card">
          <div class="ws-card-label">💬 示例提示词</div>
          <code class="ws-card-code">{{ steps[currentStep].prompt }}</code>
        </div>
        <div class="ws-card">
          <div class="ws-card-label">🤖 AI 自动行为</div>
          <div class="ws-card-text">{{ steps[currentStep].aiAction }}</div>
        </div>
        <div class="ws-card ws-card-warn">
          <div class="ws-card-label">⚠️ 常见错误</div>
          <div class="ws-card-text">{{ steps[currentStep].mistake }}</div>
        </div>
      </div>
    </div>

    <div class="ws-controls">
      <button class="ws-btn" :disabled="currentStep === 0" @click="prev">← 上一步</button>
      <button class="ws-btn ws-btn-play" @click="togglePlay">
        {{ isPlaying ? '⏸ 暂停' : '▶ 自动播放' }}
      </button>
      <button class="ws-btn" :disabled="currentStep === steps.length - 1" @click="next">下一步 →</button>
    </div>
  </div>
</template>

<style scoped>
.ws-root { margin: 24px 0; }
.ws-stepper {
  display: flex; align-items: center; justify-content: center;
  gap: 0; margin-bottom: 24px; overflow-x: auto; padding: 4px 0;
}
.ws-step {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  cursor: pointer; position: relative; padding: 0 16px; transition: all 0.2s;
}
.ws-step:hover { transform: translateY(-2px); }
.ws-step-icon {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; background: var(--vp-c-bg-soft);
  border: 2px solid var(--vp-c-divider); transition: all 0.3s;
}
.ws-step.active .ws-step-icon {
  border-color: #007aff; background: rgba(0, 122, 255, 0.1);
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}
.ws-step.done .ws-step-icon {
  border-color: #34c759; background: rgba(52, 199, 89, 0.1);
}
.ws-step-title {
  font-size: 12px; font-weight: 600; color: var(--vp-c-text-3);
}
.ws-step.active .ws-step-title { color: #007aff; }
.ws-step.done .ws-step-title { color: #34c759; }
.ws-step-line {
  position: absolute; top: 22px; left: calc(50% + 28px);
  width: calc(100% - 24px); height: 2px;
  background: var(--vp-c-divider); z-index: 0;
}
.ws-step-line.filled { background: #34c759; }
.ws-content {
  padding: 20px; border-radius: 12px;
  background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider);
  animation: wsFade 0.3s ease;
}
@keyframes wsFade {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.ws-content-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
}
.ws-content-num {
  font-size: 12px; font-weight: 600; color: var(--vp-c-text-3);
  padding: 2px 8px; border-radius: 4px; background: var(--vp-c-bg);
}
.ws-content-title {
  font-size: 18px; font-weight: 700; color: var(--vp-c-text-1); margin: 0;
}
.ws-cards {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
}
.ws-card {
  padding: 14px; border-radius: 10px; background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}
.ws-card-warn {
  border-color: rgba(255, 149, 0, 0.3);
  background: rgba(255, 149, 0, 0.04);
}
.ws-card-label {
  font-size: 12px; font-weight: 600; color: var(--vp-c-text-3);
  margin-bottom: 6px;
}
.ws-card-text { font-size: 14px; color: var(--vp-c-text-1); line-height: 1.5; }
.ws-card-code {
  display: block; font-size: 13px; color: #007aff;
  font-family: 'SF Mono', Monaco, monospace; line-height: 1.5;
  background: none; padding: 0;
}
.ws-controls {
  display: flex; justify-content: center; gap: 10px; margin-top: 20px;
}
.ws-btn {
  padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.2s; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); color: var(--vp-c-text-2);
}
.ws-btn:hover:not(:disabled) { border-color: var(--vp-c-text-3); }
.ws-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ws-btn-play { color: #007aff; border-color: #007aff; }
.ws-btn-play:hover { background: rgba(0, 122, 255, 0.06); }
@media (max-width: 640px) {
  .ws-stepper { gap: 0; }
  .ws-step { padding: 0 8px; }
  .ws-step-title { font-size: 10px; }
  .ws-step-icon { width: 36px; height: 36px; font-size: 16px; }
  .ws-step-line { top: 18px; left: calc(50% + 22px); }
  .ws-cards { grid-template-columns: 1fr; }
}
</style>
