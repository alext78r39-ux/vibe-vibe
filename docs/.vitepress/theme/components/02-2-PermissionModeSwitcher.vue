<script setup lang="ts">
import { ref, computed } from 'vue'

type Mode = 'default' | 'plan' | 'accept-edits'

interface Operation {
  name: string
  icon: string
  results: Record<Mode, 'auto' | 'confirm' | 'blocked'>
}

const activeMode = ref<Mode>('default')
const activeOp = ref<string | null>(null)
const opResult = ref<'auto' | 'confirm' | 'blocked' | null>(null)

const modes: { id: Mode; label: string; desc: string; color: string }[] = [
  { id: 'default', label: 'Default', desc: '读自动，写询问', color: '#007aff' },
  { id: 'plan', label: 'Plan', desc: '只读不写', color: '#ff9500' },
  { id: 'accept-edits', label: 'Accept Edits', desc: '写需确认，其他自动', color: '#34c759' },
]

const operations: Operation[] = [
  { name: '读取文件', icon: '📖', results: { default: 'auto', plan: 'auto', 'accept-edits': 'auto' } },
  { name: '编辑文件', icon: '✏️', results: { default: 'confirm', plan: 'blocked', 'accept-edits': 'confirm' } },
  { name: '运行命令', icon: '⚡', results: { default: 'confirm', plan: 'blocked', 'accept-edits': 'auto' } },
  { name: 'Git Push', icon: '🚀', results: { default: 'confirm', plan: 'blocked', 'accept-edits': 'confirm' } },
  { name: '删除文件', icon: '🗑️', results: { default: 'confirm', plan: 'blocked', 'accept-edits': 'confirm' } },
]

const resultLabels: Record<string, { text: string; icon: string; cls: string }> = {
  auto: { text: '自动通过', icon: '✅', cls: 'res-auto' },
  confirm: { text: '需要确认', icon: '⚠️', cls: 'res-confirm' },
  blocked: { text: '被阻止', icon: '❌', cls: 'res-blocked' },
}

const currentModeInfo = computed(() => modes.find(m => m.id === activeMode.value)!)

function simulateOp(op: Operation) {
  activeOp.value = op.name
  opResult.value = null
  setTimeout(() => {
    opResult.value = op.results[activeMode.value]
  }, 400)
}

function switchMode(mode: Mode) {
  activeMode.value = mode
  activeOp.value = null
  opResult.value = null
}
</script>

<template>
  <div class="pms-root">
    <div class="pms-modes">
      <button
        v-for="mode in modes" :key="mode.id"
        class="pms-mode-btn"
        :class="{ active: activeMode === mode.id }"
        :style="activeMode === mode.id ? { borderColor: mode.color, background: mode.color + '0f' } : {}"
        @click="switchMode(mode.id)"
      >
        <span class="pms-mode-label">{{ mode.label }}</span>
        <span class="pms-mode-desc">{{ mode.desc }}</span>
      </button>
    </div>

    <div class="pms-panel">
      <div class="pms-panel-header">
        <span class="pms-mode-indicator" :style="{ background: currentModeInfo.color }"></span>
        <span class="pms-panel-title">{{ currentModeInfo.label }} 模式</span>
        <span class="pms-panel-hint">点击操作查看结果</span>
      </div>

      <div class="pms-ops">
        <button
          v-for="op in operations" :key="op.name"
          class="pms-op"
          :class="{ active: activeOp === op.name, [op.results[activeMode]]: true }"
          @click="simulateOp(op)"
        >
          <span class="pms-op-icon">{{ op.icon }}</span>
          <span class="pms-op-name">{{ op.name }}</span>
          <span
            v-if="activeOp === op.name && opResult"
            class="pms-op-result"
            :class="resultLabels[opResult].cls"
          >
            {{ resultLabels[opResult].icon }} {{ resultLabels[opResult].text }}
          </span>
          <span
            v-else-if="activeOp === op.name && !opResult"
            class="pms-op-loading"
          >处理中...</span>
          <span v-else class="pms-op-hint">
            {{ resultLabels[op.results[activeMode]].icon }}
          </span>
        </button>
      </div>
    </div>

    <div class="pms-tip">
      <span class="pms-tip-icon">💡</span>
      <span>不确定用哪个？选 <strong>Default</strong> 就对了 —— 安全又不影响效率。</span>
    </div>
  </div>
</template>

<style scoped>
.pms-root { margin: 24px 0; }
.pms-modes {
  display: flex; gap: 8px; margin-bottom: 16px;
}
.pms-mode-btn {
  flex: 1; padding: 12px; border-radius: 12px;
  border: 2px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);
  cursor: pointer; transition: all 0.2s; text-align: center;
}
.pms-mode-btn:hover { transform: translateY(-1px); }
.pms-mode-label { display: block; font-size: 14px; font-weight: 700; color: var(--vp-c-text-1); }
.pms-mode-desc { display: block; font-size: 11px; color: var(--vp-c-text-3); margin-top: 4px; }
.pms-panel {
  border-radius: 12px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); overflow: hidden;
}
.pms-panel-header {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-bottom: 1px solid var(--vp-c-divider);
}
.pms-mode-indicator { width: 8px; height: 8px; border-radius: 50%; }
.pms-panel-title { font-size: 14px; font-weight: 600; color: var(--vp-c-text-1); }
.pms-panel-hint { margin-left: auto; font-size: 11px; color: var(--vp-c-text-3); }
.pms-ops { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.pms-op {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-radius: 10px;
  border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg);
  cursor: pointer; transition: all 0.2s;
}
.pms-op:hover { border-color: var(--vp-c-text-3); }
.pms-op.active { border-color: #007aff; box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1); }
.pms-op-icon { font-size: 20px; }
.pms-op-name { font-size: 14px; font-weight: 500; color: var(--vp-c-text-1); }
.pms-op-result {
  margin-left: auto; font-size: 12px; font-weight: 600;
  padding: 3px 10px; border-radius: 6px;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.res-auto { background: rgba(52, 199, 89, 0.12); color: #34c759; }
.res-confirm { background: rgba(255, 149, 0, 0.12); color: #ff9500; }
.res-blocked { background: rgba(255, 59, 48, 0.12); color: #ff3b30; }
.pms-op-loading { margin-left: auto; font-size: 12px; color: var(--vp-c-text-3); }
.pms-op-hint { margin-left: auto; font-size: 14px; }
.pms-tip {
  display: flex; align-items: center; gap: 8px; margin-top: 16px;
  padding: 12px 16px; border-radius: 10px;
  background: rgba(0, 122, 255, 0.06); font-size: 13px; color: var(--vp-c-text-2);
}
.pms-tip-icon { font-size: 16px; }
@media (max-width: 640px) {
  .pms-modes { flex-direction: column; }
  .pms-mode-btn { padding: 10px; }
}
</style>
