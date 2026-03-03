<script setup lang="ts">
const columns = [
  {
    title: '自然语言',
    icon: '💬',
    color: '#007aff',
    content: '检查购物车里每件商品，如果库存不足就标红，最后算出总价',
    isCode: false,
  },
  {
    title: '伪代码',
    icon: '📝',
    color: '#ff9500',
    content: `对于 购物车中的每件商品：
  如果 商品库存 < 购买数量：
    标记为"库存不足"
  总价 += 商品单价 × 购买数量
返回 总价`,
    isCode: true,
  },
  {
    title: 'TypeScript',
    icon: '🔷',
    color: '#34c759',
    content: `function calculateTotal(cart: CartItem[]) {
  let total = 0
  for (const item of cart) {
    if (item.stock < item.quantity) {
      item.status = 'insufficient'
    }
    total += item.price * item.quantity
  }
  return total
}`,
    isCode: true,
  },
]
</script>

<template>
  <div class="pct-root">
    <div class="pct-grid">
      <template v-for="(col, i) in columns" :key="col.title">
        <div class="pct-col">
          <div class="pct-header" :style="{ borderBottomColor: col.color }">
            <span class="pct-icon">{{ col.icon }}</span>
            <span class="pct-title">{{ col.title }}</span>
          </div>
          <div :class="['pct-body', { code: col.isCode }]">
            <pre v-if="col.isCode">{{ col.content }}</pre>
            <p v-else>{{ col.content }}</p>
          </div>
        </div>
        <div v-if="i < columns.length - 1" class="pct-arrow">→</div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.pct-root { margin: 24px 0; max-width: 688px; margin-left: auto; margin-right: auto; }
.pct-grid {
  display: flex; align-items: stretch; gap: 0;
}
.pct-col { flex: 1; min-width: 0; }
.pct-header {
  display: flex; align-items: center; gap: 6px; padding: 8px 10px;
  border-bottom: 2.5px solid var(--vp-c-divider); margin-bottom: 10px;
}
.pct-icon { font-size: 16px; }
.pct-title { font-size: 13px; font-weight: 700; color: var(--vp-c-text-1); }
.pct-body {
  padding: 10px; border-radius: 8px; background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider); min-height: 120px;
}
.pct-body p {
  margin: 0; font-size: 13px; color: var(--vp-c-text-1); line-height: 1.7;
}
.pct-body.code {
  font-family: 'SF Mono', Monaco, Consolas, monospace;
}
.pct-body pre {
  margin: 0; font-size: 11px; line-height: 1.7; color: var(--vp-c-text-1);
  white-space: pre-wrap; word-break: break-word;
}
.pct-arrow {
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 700; color: var(--vp-c-text-3);
  padding: 0 6px; flex-shrink: 0; padding-top: 30px;
}
@media (max-width: 640px) {
  .pct-grid { flex-direction: column; gap: 0; }
  .pct-arrow {
    padding: 4px 0; font-size: 18px; padding-top: 0;
    transform: rotate(90deg);
  }
}
</style>
