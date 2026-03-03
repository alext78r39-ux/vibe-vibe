<script setup lang="ts">
const ogTitle = '如何用 AI 构建你的第一个 Web 应用'
const ogDesc = '从零开始，用 Claude Code 搭建一个完整的...'
const ogSite = 'example.com'
const ogUrl = 'https://example.com/blog/my-post'

const platforms = [
  { name: 'Twitter / X', titleSize: '14px', showImage: true, layout: 'vertical' },
  { name: '微信分享', titleSize: '13px', showImage: true, layout: 'horizontal' },
  { name: 'Slack', titleSize: '13px', showImage: false, layout: 'vertical' },
]
</script>

<template>
  <div class="og-root">
    <!-- Main comparison -->
    <div class="og-compare">
      <!-- No OG -->
      <div class="og-card og-card-bad">
        <div class="og-card-label">❌ 没有 OG 标签</div>
        <div class="og-preview-bad">
          <div class="og-bare-link">
            <span class="og-link-icon">🔗</span>
            <span class="og-link-url">{{ ogUrl }}</span>
          </div>
          <div class="og-bare-hint">只显示一行链接，没有预览</div>
        </div>
      </div>

      <!-- With OG -->
      <div class="og-card og-card-good">
        <div class="og-card-label">✅ 配置了 OG 标签</div>
        <div class="og-preview-good">
          <div class="og-rich-image">
            <span class="og-rich-icon">📸</span>
          </div>
          <div class="og-rich-body">
            <div class="og-rich-title">{{ ogTitle }}</div>
            <div class="og-rich-desc">{{ ogDesc }}</div>
            <div class="og-rich-site">{{ ogSite }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Platform previews -->
    <div class="og-platforms-title">不同平台的展示效果</div>
    <div class="og-platforms">
      <div v-for="p in platforms" :key="p.name" class="og-platform">
        <div class="og-platform-name">{{ p.name }}</div>
        <div :class="['og-platform-card', `og-layout-${p.layout}`]">
          <div v-if="p.showImage" class="og-plat-image">
            <span>📸</span>
          </div>
          <div class="og-plat-body">
            <div class="og-plat-title" :style="{ fontSize: p.titleSize }">{{ ogTitle }}</div>
            <div class="og-plat-desc">{{ ogDesc }}</div>
            <div class="og-plat-site">{{ ogSite }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.og-root { margin: 24px 0; max-width: 688px; margin-left: auto; margin-right: auto; }
.og-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.og-card {
  border-radius: 10px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); overflow: hidden;
}
.og-card-label {
  padding: 10px 14px; font-size: 14px; font-weight: 700;
  color: var(--vp-c-text-1); border-bottom: 1px solid var(--vp-c-divider);
}
/* Bad preview */
.og-preview-bad { padding: 20px 14px; }
.og-bare-link {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 12px; border-radius: 6px;
  background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider);
}
.og-link-icon { font-size: 14px; opacity: 0.5; }
.og-link-url {
  font-size: 12px; color: var(--vp-c-text-3); font-family: monospace;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.og-bare-hint {
  margin-top: 10px; font-size: 12px; color: var(--vp-c-text-3);
  text-align: center; font-style: italic;
}
/* Good preview */
.og-preview-good { padding: 14px; }
.og-rich-image {
  width: 100%; height: 100px; border-radius: 8px 8px 0 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex; align-items: center; justify-content: center;
  font-size: 32px;
}
.og-rich-body { padding: 10px 0 0; }
.og-rich-title {
  font-size: 14px; font-weight: 700; color: var(--vp-c-text-1);
  line-height: 1.4; margin-bottom: 4px;
}
.og-rich-desc { font-size: 12px; color: var(--vp-c-text-3); line-height: 1.4; }
.og-rich-site { font-size: 11px; color: var(--vp-c-text-3); margin-top: 6px; opacity: 0.7; }

/* Platforms */
.og-platforms-title {
  margin-top: 24px; margin-bottom: 12px; font-size: 14px;
  font-weight: 600; color: var(--vp-c-text-2); text-align: center;
}
.og-platforms { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.og-platform {
  border-radius: 8px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); overflow: hidden;
}
.og-platform-name {
  padding: 6px 10px; font-size: 11px; font-weight: 700;
  color: var(--vp-c-text-3); border-bottom: 1px solid var(--vp-c-divider);
  text-align: center;
}
.og-platform-card { padding: 8px; }
.og-layout-vertical { display: flex; flex-direction: column; gap: 6px; }
.og-layout-horizontal { display: flex; gap: 8px; align-items: flex-start; }
.og-plat-image {
  width: 100%; height: 48px; border-radius: 4px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
}
.og-layout-horizontal .og-plat-image { width: 56px; height: 56px; }
.og-plat-body { min-width: 0; }
.og-plat-title {
  font-weight: 700; color: var(--vp-c-text-1); line-height: 1.3;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.og-plat-desc {
  font-size: 11px; color: var(--vp-c-text-3); line-height: 1.3;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.og-plat-site { font-size: 10px; color: var(--vp-c-text-3); opacity: 0.6; margin-top: 2px; }

@media (max-width: 640px) {
  .og-compare { grid-template-columns: 1fr; }
  .og-platforms { grid-template-columns: 1fr; }
}
</style>
