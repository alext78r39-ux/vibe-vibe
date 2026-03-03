<script setup lang="ts">
const steps = [
  { icon: '⬇️', action: '拉取最新代码', detail: 'pull — 确保本地是最新的', color: '#007aff' },
  { icon: '🌿', action: '创建功能分支', detail: '隔离你的工作', color: '#34c759' },
  { icon: '💻', action: '开发 + 提交', detail: '小步快跑，频繁 commit', color: '#ff9500' },
  { icon: '⬆️', action: '推送到 GitHub', detail: 'push — 备份 + 让别人看到', color: '#5856d6' },
  { icon: '📋', action: '创建 PR', detail: '请求审查', color: '#af52de' },
  { icon: '✅', action: 'Review + 合并', detail: '代码进入主分支', color: '#ff2d55' },
  { icon: '🗑️', action: '删除功能分支', detail: '保持整洁', color: '#8e8e93' },
]
</script>

<template>
  <div class="dr-root">
    <div class="dr-list">
      <div v-for="(s, i) in steps" :key="s.action" class="dr-item">
        <div class="dr-left">
          <div class="dr-circle" :style="{ borderColor: s.color }">
            <span class="dr-icon">{{ s.icon }}</span>
          </div>
          <div v-if="i < steps.length - 1" class="dr-connector" />
        </div>
        <div class="dr-content">
          <div class="dr-action">{{ s.action }}</div>
          <div class="dr-detail">{{ s.detail }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.dr-root { margin: 24px 0; padding: 20px; border-radius: 12px; border: 1.5px solid var(--vp-c-divider); background: var(--vp-c-bg-soft); }
.dr-list { display: flex; flex-direction: column; gap: 0; }
.dr-item { display: flex; gap: 14px; }
.dr-left { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
.dr-circle {
  width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center;
  justify-content: center; border: 2px solid var(--vp-c-divider); background: var(--vp-c-bg);
  flex-shrink: 0;
}
.dr-icon { font-size: 16px; }
.dr-connector { width: 2px; flex: 1; min-height: 16px; background: var(--vp-c-divider); }
.dr-content { padding: 6px 0 18px; }
.dr-action { font-size: 14px; font-weight: 700; color: var(--vp-c-text-1); }
.dr-detail { font-size: 12px; color: var(--vp-c-text-3); margin-top: 2px; }
</style>
