<script setup lang="ts">
interface FlowRow {
  label: string
  safe: boolean
  nodes: { text: string; icon: string; warning?: string }[]
  arrowLabels: string[]
}

const rows: FlowRow[] = [
  {
    label: '前端直调（API Key 暴露）',
    safe: false,
    nodes: [
      { text: 'Browser', icon: '🌐' },
      { text: 'External API', icon: '☁️' },
    ],
    arrowLabels: ['API Key 在 F12 可见'],
  },
  {
    label: '后端代理（安全）',
    safe: true,
    nodes: [
      { text: 'Browser', icon: '🌐' },
      { text: 'Your Server', icon: '🖥️', warning: 'API Key 安全存储' },
      { text: 'External API', icon: '☁️' },
    ],
    arrowLabels: ['普通请求', 'API Key 仅在服务端'],
  },
]
</script>

<template>
  <div class="pa-root">
    <div v-for="row in rows" :key="row.label" :class="['pa-row', { safe: row.safe }]">
      <div class="pa-row-label">
        <span class="pa-row-icon">{{ row.safe ? '✅' : '❌' }}</span>
        <span>{{ row.label }}</span>
      </div>
      <div class="pa-flow">
        <template v-for="(node, i) in row.nodes" :key="i">
          <div :class="['pa-node', { danger: !row.safe && i === 1, server: row.safe && i === 1 }]">
            <span class="pa-node-icon">{{ node.icon }}</span>
            <span class="pa-node-text">{{ node.text }}</span>
            <span v-if="node.warning" class="pa-node-badge safe">{{ node.warning }}</span>
          </div>
          <div v-if="i < row.nodes.length - 1" class="pa-arrow-wrap">
            <div :class="['pa-arrow-line', { danger: !row.safe }]"></div>
            <div :class="['pa-arrow-label', { danger: !row.safe }]">
              {{ row.arrowLabels[i] }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pa-root { margin: 24px 0; max-width: 688px; margin-left: auto; margin-right: auto; display: flex; flex-direction: column; gap: 16px; }
.pa-row {
  padding: 16px; border-radius: 12px; border: 2px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.pa-row:not(.safe) { border-color: rgba(255,59,48,0.3); background: rgba(255,59,48,0.04); }
.pa-row.safe { border-color: rgba(52,199,89,0.3); background: rgba(52,199,89,0.04); }
:global(html.dark) .pa-row:not(.safe) { background: rgba(255,59,48,0.06); }
:global(html.dark) .pa-row.safe { background: rgba(52,199,89,0.06); }
.pa-row-label {
  display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700;
  color: var(--vp-c-text-1); margin-bottom: 14px;
}
.pa-row-icon { font-size: 16px; }
.pa-flow { display: flex; align-items: center; justify-content: center; gap: 0; flex-wrap: wrap; }
.pa-node {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 12px 16px; border-radius: 10px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg); min-width: 90px; position: relative;
}
.pa-node.server { border-color: rgba(52,199,89,0.4); }
.pa-node-icon { font-size: 24px; }
.pa-node-text { font-size: 11px; font-weight: 600; color: var(--vp-c-text-1); }
.pa-node-badge {
  position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);
  padding: 1px 8px; border-radius: 999px; font-size: 9px; font-weight: 700;
  white-space: nowrap;
}
.pa-node-badge.safe { background: rgba(52,199,89,0.15); color: #34c759; }
.pa-arrow-wrap {
  display: flex; flex-direction: column; align-items: center; padding: 0 8px;
}
.pa-arrow-line {
  width: 50px; height: 2px; background: var(--vp-c-divider); position: relative;
}
.pa-arrow-line::after {
  content: ''; position: absolute; right: -1px; top: -4px;
  border: 5px solid transparent; border-left-color: var(--vp-c-divider);
}
.pa-arrow-line.danger { background: #ff3b30; }
.pa-arrow-line.danger::after { border-left-color: #ff3b30; }
.pa-arrow-label {
  font-size: 9px; color: var(--vp-c-text-3); margin-top: 4px;
  text-align: center; max-width: 100px; line-height: 1.3;
}
.pa-arrow-label.danger { color: #ff3b30; font-weight: 600; }
@media (max-width: 640px) {
  .pa-node { padding: 10px 12px; min-width: 70px; }
  .pa-node-icon { font-size: 20px; }
  .pa-arrow-line { width: 30px; }
}
</style>
