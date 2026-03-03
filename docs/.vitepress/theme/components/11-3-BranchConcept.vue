<script setup lang="ts">
import { ref } from 'vue'

const hovering = ref<string | null>(null)
</script>

<template>
  <div class="bc-root">
    <div class="bc-track">
      <!-- main branch -->
      <div class="bc-branch bc-main">
        <div class="bc-line bc-line-main" />
        <div class="bc-label-row">
          <span class="bc-dot bc-dot-main" />
          <span class="bc-name">main</span>
          <span class="bc-tag bc-tag-stable">稳定版，不受影响</span>
        </div>
      </div>

      <!-- fork indicator -->
      <div class="bc-fork">
        <svg width="32" height="48" viewBox="0 0 32 48">
          <path d="M16 0 V16 Q16 28 28 28" fill="none" stroke="var(--vp-c-brand)" stroke-width="2.5" stroke-linecap="round" />
        </svg>
      </div>

      <!-- feature branch -->
      <div class="bc-branch bc-feature">
        <div class="bc-label-row">
          <span class="bc-dot bc-dot-feature" />
          <span class="bc-name">feature/recommend</span>
          <span class="bc-tag bc-tag-dev">开发中</span>
        </div>
        <div class="bc-outcomes">
          <div class="bc-outcome"
            :class="{ active: hovering === 'fail' }"
            @mouseenter="hovering = 'fail'"
            @mouseleave="hovering = null">
            <span class="bc-outcome-icon">↩</span>
            <span class="bc-outcome-text">改坏了？切回 main，一切如初</span>
          </div>
          <div class="bc-outcome"
            :class="{ active: hovering === 'ok' }"
            @mouseenter="hovering = 'ok'"
            @mouseleave="hovering = null">
            <span class="bc-outcome-icon">✓</span>
            <span class="bc-outcome-text">改好了？合并到 main，功能上线</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.bc-root { margin: 24px 0; padding: 20px; border-radius: 12px; border: 1.5px solid var(--vp-c-divider); background: var(--vp-c-bg-soft); }
.bc-track { display: flex; flex-direction: column; gap: 0; }
.bc-branch { padding: 0 8px; }
.bc-label-row { display: flex; align-items: center; gap: 8px; }
.bc-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.bc-dot-main { background: #34c759; }
.bc-dot-feature { background: var(--vp-c-brand); }
.bc-name { font-size: 14px; font-weight: 700; font-family: 'SF Mono', Monaco, Consolas, monospace; color: var(--vp-c-text-1); }
.bc-tag { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
.bc-tag-stable { background: rgba(52,199,89,0.12); color: #34c759; }
.bc-tag-dev { background: rgba(var(--vp-c-brand-rgb, 100,108,255),0.12); color: var(--vp-c-brand); }
.bc-fork { padding-left: 12px; line-height: 0; }
.bc-outcomes { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; margin-left: 20px; }
.bc-outcome {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  border-radius: 8px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg); transition: all 0.2s; cursor: default;
}
.bc-outcome.active { border-color: var(--vp-c-brand); background: rgba(var(--vp-c-brand-rgb, 100,108,255),0.06); }
.bc-outcome-icon { font-size: 14px; flex-shrink: 0; width: 20px; text-align: center; }
.bc-outcome-text { font-size: 13px; color: var(--vp-c-text-2); }
.bc-outcome.active .bc-outcome-text { color: var(--vp-c-text-1); }
</style>
