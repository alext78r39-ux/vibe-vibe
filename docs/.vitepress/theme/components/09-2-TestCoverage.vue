<script setup lang="ts">
import { ref } from 'vue'

interface PathItem {
  id: string
  label: string
  color: string
  colorBg: string
  icon: string
  steps: string[]
}

const paths: PathItem[] = [
  {
    id: 'happy', label: '正常路径', color: '#15a051', colorBg: 'rgba(21,160,81,0.1)',
    icon: '✅',
    steps: ['有效评分 (1-5)', '保存成功', '返回 201'],
  },
  {
    id: 'edge', label: '边界路径', color: '#D4952C', colorBg: 'rgba(212,149,44,0.1)',
    icon: '⚠️',
    steps: ['评分为 0 或 6 → 校验失败 → 返回 422', '重复评分 → 更新旧评分 → 返回 200'],
  },
  {
    id: 'error', label: '错误路径', color: '#e53935', colorBg: 'rgba(229,57,53,0.1)',
    icon: '❌',
    steps: ['未登录 → 返回 401', '电影不存在 → 返回 404'],
  },
]

const hoveredId = ref<string | null>(null)
</script>

<template>
  <div class="tc-root">
    <!-- Center function box -->
    <div class="tc-source">
      <div class="tc-source-icon">📡</div>
      <div class="tc-source-label">评分接口</div>
      <code class="tc-source-code">POST /api/ratings</code>
    </div>

    <!-- Paths -->
    <div class="tc-paths">
      <div
        v-for="p in paths"
        :key="p.id"
        :class="['tc-path', { hovered: hoveredId === p.id }]"
        :style="{ '--path-color': p.color, '--path-bg': p.colorBg }"
        @mouseenter="hoveredId = p.id"
        @mouseleave="hoveredId = null"
      >
        <div class="tc-path-header">
          <span class="tc-path-icon">{{ p.icon }}</span>
          <span class="tc-path-title">{{ p.label }}</span>
        </div>
        <div class="tc-path-flow">
          <div v-for="(step, i) in p.steps" :key="i" class="tc-step-row">
            <span class="tc-arrow" :style="{ color: p.color }">→</span>
            <span class="tc-step-text">{{ step }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Coverage meter -->
    <div class="tc-meter">
      <div class="tc-meter-bar">
        <div class="tc-meter-fill"></div>
      </div>
      <div class="tc-meter-label">覆盖这三类路径 = 高质量测试</div>
    </div>
  </div>
</template>

<style scoped>
.tc-root { margin: 24px 0; max-width: 688px; margin-left: auto; margin-right: auto; }
.tc-source {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 16px 24px; border-radius: 10px;
  background: var(--vp-c-bg-soft); border: 2px solid var(--vp-c-divider);
  margin-bottom: 20px; width: fit-content; margin-left: auto; margin-right: auto;
}
.tc-source-icon { font-size: 24px; }
.tc-source-label { font-size: 15px; font-weight: 700; color: var(--vp-c-text-1); }
.tc-source-code {
  font-size: 13px; font-family: 'Fira Code', monospace;
  background: var(--vp-c-bg); padding: 2px 10px; border-radius: 4px;
  color: var(--vp-c-text-2); border: 1px solid var(--vp-c-divider);
}
.tc-paths { display: flex; flex-direction: column; gap: 10px; }
.tc-path {
  padding: 14px 18px; border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);
  transition: all 0.25s; cursor: default;
}
.tc-path.hovered {
  border-color: var(--path-color);
  background: var(--path-bg);
}
.tc-path-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.tc-path-icon { font-size: 16px; }
.tc-path-title { font-size: 15px; font-weight: 700; color: var(--path-color); }
.tc-path-flow { display: flex; flex-direction: column; gap: 4px; padding-left: 4px; }
.tc-step-row { display: flex; align-items: center; gap: 8px; }
.tc-arrow { font-weight: 700; font-size: 14px; flex-shrink: 0; }
.tc-step-text { font-size: 13px; color: var(--vp-c-text-2); }
.tc-meter { margin-top: 20px; text-align: center; }
.tc-meter-bar {
  height: 8px; border-radius: 4px; background: var(--vp-c-divider);
  overflow: hidden; margin-bottom: 8px;
}
.tc-meter-fill {
  height: 100%; border-radius: 4px; width: 100%;
  background: linear-gradient(90deg, #15a051, #2eb3df, #e67e22);
  animation: tc-fill 1.5s ease-out;
}
@keyframes tc-fill { from { width: 0; } to { width: 100%; } }
.tc-meter-label {
  font-size: 14px; font-weight: 600; color: var(--vp-c-text-1);
}

@media (max-width: 640px) {
  .tc-path { padding: 10px 14px; }
  .tc-path-title { font-size: 13px; }
  .tc-step-text { font-size: 12px; }
}
</style>
