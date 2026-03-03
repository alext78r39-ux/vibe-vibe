<script setup lang="ts">
const steps = [
  { icon: '🌿', label: 'main', sub: '稳定主分支' },
  { icon: '🔀', label: '创建分支', sub: 'feature/recommend' },
  { icon: '💻', label: '开发', sub: '写代码 + 提交' },
  { icon: '📋', label: 'PR', sub: '请求审查' },
  { icon: '👀', label: 'Review', sub: '朋友审查代码' },
  { icon: '✅', label: 'Merge', sub: '合并到 main' },
]
</script>

<template>
  <div class="pw-root">
    <div class="pw-flow">
      <template v-for="(s, i) in steps" :key="s.label">
        <div class="pw-step">
          <div class="pw-icon">{{ s.icon }}</div>
          <div class="pw-label">{{ s.label }}</div>
          <div class="pw-sub">{{ s.sub }}</div>
        </div>
        <div v-if="i < steps.length - 1" class="pw-arrow">→</div>
      </template>
    </div>
    <div class="pw-result">
      <span class="pw-result-dot" />
      <span class="pw-result-text">main 现在包含推荐功能，分支可以删除</span>
    </div>
  </div>
</template>
<style scoped>
.pw-root { margin: 24px 0; padding: 20px; border-radius: 12px; border: 1.5px solid var(--vp-c-divider); background: var(--vp-c-bg-soft); }
.pw-flow {
  display: flex; align-items: flex-start; gap: 0; overflow-x: auto; padding-bottom: 8px;
}
.pw-step {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  min-width: 72px; flex-shrink: 0; padding: 8px 4px;
}
.pw-icon { font-size: 24px; }
.pw-label { font-size: 13px; font-weight: 700; color: var(--vp-c-text-1); text-align: center; }
.pw-sub { font-size: 11px; color: var(--vp-c-text-3); text-align: center; line-height: 1.4; }
.pw-arrow {
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; color: var(--vp-c-text-3);
  padding: 8px 2px 0; flex-shrink: 0;
}
.pw-result {
  display: flex; align-items: center; gap: 8px;
  margin-top: 14px; padding: 8px 14px; border-radius: 8px;
  background: rgba(52,199,89,0.08); border: 1px solid rgba(52,199,89,0.2);
}
.pw-result-dot { width: 8px; height: 8px; border-radius: 50%; background: #34c759; flex-shrink: 0; }
.pw-result-text { font-size: 12px; color: #34c759; font-weight: 600; }
@media (max-width: 640px) {
  .pw-step { min-width: 56px; }
  .pw-icon { font-size: 20px; }
  .pw-label { font-size: 11px; }
  .pw-sub { font-size: 10px; }
}
</style>
