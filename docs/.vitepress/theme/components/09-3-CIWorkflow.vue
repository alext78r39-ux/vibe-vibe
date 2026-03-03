<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

/* ── Git Hooks ── */
interface HookStep {
  label: string
  isHook: boolean
  hookColor?: string
}

const gitHookSteps: HookStep[] = [
  { label: 'git add', isHook: false },
  { label: 'pre-commit', isHook: true, hookColor: '#15a051' },
  { label: 'git commit', isHook: false },
  { label: 'commit-msg', isHook: true, hookColor: '#2eb3df' },
  { label: 'git push', isHook: false },
  { label: 'pre-push', isHook: true, hookColor: '#9333ea' },
]

const hookDescs: Record<string, string> = {
  'pre-commit': 'lint + format',
  'commit-msg': '检查格式',
  'pre-push': '运行测试',
}

/* ── CI Pipeline ── */
const ciSteps = ['Push/PR', '安装依赖', 'Lint 检查', '类型检查', '单元测试', '构建', '部署']
const ciActive = ref(-1)
const ciRunning = ref(false)
const ciTimers = ref<number[]>([])

async function runCI() {
  if (ciRunning.value) return
  ciRunning.value = true
  ciActive.value = -1
  for (let i = 0; i < ciSteps.length; i++) {
    ciActive.value = i
    await new Promise<void>(resolve => {
      const id = window.setTimeout(resolve, 500)
      ciTimers.value = [...ciTimers.value, id]
    })
  }
  ciRunning.value = false
}

function resetCI() {
  ciActive.value = -1
  ciRunning.value = false
}

onUnmounted(() => { ciTimers.value.forEach(id => clearTimeout(id)) })

/* ── TDD Cycle ── */
const tddNodes = [
  { label: 'Red', desc: '写失败的测试', color: '#e53935', emoji: '🔴' },
  { label: 'Green', desc: '写最少代码通过', color: '#15a051', emoji: '🟢' },
  { label: 'Refactor', desc: '重构优化', color: '#2eb3df', emoji: '🔵' },
]
const tddActive = ref(0)
const tddRunning = ref(false)
const tddTimers = ref<number[]>([])

async function runTDD() {
  if (tddRunning.value) return
  tddRunning.value = true
  for (let round = 0; round < 2; round++) {
    for (let i = 0; i < 3; i++) {
      tddActive.value = i
      await new Promise<void>(resolve => {
        const id = window.setTimeout(resolve, 800)
        tddTimers.value = [...tddTimers.value, id]
      })
    }
  }
  tddRunning.value = false
}

onUnmounted(() => { tddTimers.value.forEach(id => clearTimeout(id)) })
</script>

<template>
  <div class="ci-root">
    <!-- Section 1: Git Hooks -->
    <div class="ci-section">
      <h4 class="ci-section-title">Git Hooks 位置</h4>
      <div class="ci-hooks-flow">
        <template v-for="(step, i) in gitHookSteps" :key="i">
          <div :class="['ci-hook-node', { 'ci-hook-badge': step.isHook }]"
            :style="step.isHook ? { '--hook-color': step.hookColor } : {}">
            <span class="ci-hook-label">{{ step.label }}</span>
            <span v-if="step.isHook" class="ci-hook-desc">{{ hookDescs[step.label] }}</span>
          </div>
          <span v-if="i < gitHookSteps.length - 1" class="ci-hook-arrow">→</span>
        </template>
      </div>
    </div>

    <!-- Section 2: GitHub Actions -->
    <div class="ci-section">
      <h4 class="ci-section-title">GitHub Actions 流水线</h4>
      <div class="ci-pipeline-controls">
        <button class="ci-btn" @click="runCI" :disabled="ciRunning">
          {{ ciActive >= 0 ? '运行中...' : '模拟运行' }}
        </button>
        <button v-if="ciActive >= ciSteps.length - 1 && !ciRunning" class="ci-btn ci-btn-outline" @click="resetCI">重置</button>
      </div>
      <div class="ci-pipeline">
        <div v-for="(step, i) in ciSteps" :key="i"
          :class="['ci-pipe-step', { done: ciActive >= i, current: ciActive === i, optional: i === ciSteps.length - 1 }]">
          <span class="ci-pipe-check">{{ ciActive >= i ? '✅' : (i === ciSteps.length - 1 ? '⚙️' : '⬜') }}</span>
          <span class="ci-pipe-label">{{ step }}</span>
          <span v-if="i === ciSteps.length - 1" class="ci-pipe-optional">(可选)</span>
        </div>
      </div>
    </div>

    <!-- Section 3: TDD Cycle -->
    <div class="ci-section">
      <h4 class="ci-section-title">TDD 循环</h4>
      <div class="ci-tdd-area">
        <div class="ci-tdd-cycle">
          <div v-for="(node, i) in tddNodes" :key="i"
            :class="['ci-tdd-node', { active: tddActive === i }]"
            :style="{ '--node-color': node.color }">
            <span class="ci-tdd-emoji">{{ node.emoji }}</span>
            <span class="ci-tdd-label">{{ node.label }}</span>
            <span class="ci-tdd-desc">{{ node.desc }}</span>
          </div>
          <!-- Arrows between nodes -->
          <svg class="ci-tdd-arrows" viewBox="0 0 300 60" aria-hidden="true">
            <defs>
              <marker id="ci-arrow-r" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6" fill="#e53935" />
              </marker>
              <marker id="ci-arrow-g" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6" fill="#15a051" />
              </marker>
              <marker id="ci-arrow-b" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6" fill="#2eb3df" />
              </marker>
            </defs>
            <!-- Red → Green -->
            <line x1="60" y1="30" x2="115" y2="30" stroke="#e53935" stroke-width="2" marker-end="url(#ci-arrow-r)" />
            <!-- Green → Blue -->
            <line x1="185" y1="30" x2="240" y2="30" stroke="#15a051" stroke-width="2" marker-end="url(#ci-arrow-g)" />
            <!-- Blue → Red (curved) -->
            <path d="M270,20 Q150,-20 30,20" fill="none" stroke="#2eb3df" stroke-width="2" marker-end="url(#ci-arrow-b)" />
          </svg>
        </div>
        <button class="ci-btn" @click="runTDD" :disabled="tddRunning">
          {{ tddRunning ? '循环中...' : '演示循环' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ci-root { margin: 24px 0; max-width: 688px; margin-left: auto; margin-right: auto; }
.ci-section {
  margin-bottom: 28px; padding: 20px; border-radius: 12px;
  border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);
}
.ci-section-title {
  margin: 0 0 16px; font-size: 16px; font-weight: 700;
  color: var(--vp-c-text-1);
}
.ci-btn {
  padding: 8px 20px; border: none; border-radius: 8px;
  background: #15a051; color: #fff; font-size: 13px;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.ci-btn:hover:not(:disabled) { background: #128a44; }
.ci-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ci-btn-outline {
  background: transparent; border: 1.5px solid var(--vp-c-divider);
  color: var(--vp-c-text-2); margin-left: 8px;
}
.ci-btn-outline:hover:not(:disabled) { border-color: var(--vp-c-text-3); }

/* Git Hooks */
.ci-hooks-flow {
  display: flex; align-items: flex-start; gap: 6px;
  flex-wrap: wrap; justify-content: center;
}
.ci-hook-node {
  display: flex; flex-direction: column; align-items: center;
  padding: 8px 12px; border-radius: 8px;
  background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider);
  min-width: 72px;
}
.ci-hook-badge {
  border-color: var(--hook-color);
  background: color-mix(in srgb, var(--hook-color) 8%, var(--vp-c-bg));
}
.ci-hook-label {
  font-size: 12px; font-weight: 700; color: var(--vp-c-text-1);
  font-family: 'Fira Code', monospace;
}
.ci-hook-badge .ci-hook-label { color: var(--hook-color); }
.ci-hook-desc {
  font-size: 10px; color: var(--vp-c-text-3); margin-top: 2px;
}
.ci-hook-arrow {
  font-size: 16px; color: var(--vp-c-text-3); font-weight: 700;
  align-self: center; margin-top: -4px;
}

/* CI Pipeline */
.ci-pipeline-controls { margin-bottom: 12px; }
.ci-pipeline {
  display: flex; gap: 4px; flex-wrap: wrap; align-items: center;
}
.ci-pipe-step {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 10px; border-radius: 6px;
  background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider);
  transition: all 0.3s; font-size: 12px;
}
.ci-pipe-step.done {
  border-color: #15a051;
  background: rgba(21, 160, 81, 0.08);
}
.ci-pipe-step.current {
  box-shadow: 0 0 0 2px rgba(21, 160, 81, 0.25);
}
.ci-pipe-step.optional { border-style: dashed; }
.ci-pipe-check { font-size: 12px; }
.ci-pipe-label { font-weight: 600; color: var(--vp-c-text-1); }
.ci-pipe-optional { font-size: 10px; color: var(--vp-c-text-3); }

/* TDD Cycle */
.ci-tdd-area { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.ci-tdd-cycle {
  display: flex; align-items: center; gap: 0;
  position: relative; padding: 32px 16px 16px;
  width: 100%; justify-content: center;
}
.ci-tdd-node {
  display: flex; flex-direction: column; align-items: center;
  padding: 12px 16px; border-radius: 12px;
  border: 2px solid var(--vp-c-divider); background: var(--vp-c-bg);
  transition: all 0.3s; min-width: 80px; z-index: 1;
  margin: 0 12px;
}
.ci-tdd-node.active {
  border-color: var(--node-color);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--node-color) 20%, transparent);
  transform: scale(1.08);
}
.ci-tdd-emoji { font-size: 20px; }
.ci-tdd-label { font-size: 14px; font-weight: 700; color: var(--node-color); margin-top: 4px; }
.ci-tdd-desc { font-size: 11px; color: var(--vp-c-text-3); margin-top: 2px; text-align: center; }
.ci-tdd-arrows {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 300px; height: 60px; pointer-events: none;
}

@media (max-width: 640px) {
  .ci-hooks-flow { gap: 4px; }
  .ci-hook-node { padding: 6px 8px; min-width: 56px; }
  .ci-hook-label { font-size: 10px; }
  .ci-hook-arrow { font-size: 12px; }
  .ci-pipeline { gap: 3px; }
  .ci-pipe-step { padding: 4px 6px; font-size: 10px; }
  .ci-tdd-node { padding: 8px 10px; min-width: 64px; margin: 0 4px; }
  .ci-tdd-arrows { width: 240px; }
  .ci-tdd-arrows line:first-of-type { x2: 90; }
  .ci-tdd-arrows line:nth-of-type(2) { x1: 150; x2: 200; }
}
</style>
