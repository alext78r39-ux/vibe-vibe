<script setup lang="ts">
import { ref } from 'vue'

interface Layer {
  id: string
  label: string
  countDesc: string
  speedDesc: string
  costDesc: string
  color: string
  colorBg: string
  detail: string
  widthPct: number
}

const layers: Layer[] = [
  {
    id: 'e2e', label: 'E2E 测试', countDesc: '数量最少', speedDesc: '速度最慢', costDesc: '成本最高',
    color: '#e67e22', colorBg: 'rgba(230,126,34,0.12)',
    detail: '模拟真实用户操作，分钟级完成。例：用户注册→登录→创建文章',
    widthPct: 40,
  },
  {
    id: 'integration', label: '集成测试', countDesc: '数量适中', speedDesc: '速度中等', costDesc: '成本中等',
    color: '#2eb3df', colorBg: 'rgba(46,179,223,0.12)',
    detail: '测试模块间协作，秒级完成。例：API 端点正确读写数据库',
    widthPct: 68,
  },
  {
    id: 'unit', label: '单元测试', countDesc: '数量最多', speedDesc: '速度最快', costDesc: '成本最低',
    color: '#15a051', colorBg: 'rgba(21,160,81,0.12)',
    detail: '测试单个函数/组件，毫秒级完成。例：calculateTotal() 返回正确金额',
    widthPct: 100,
  },
]

const selectedId = ref<string | null>(null)

function toggle(id: string) {
  selectedId.value = selectedId.value === id ? null : id
}

function getLayer(id: string) {
  return layers.find(l => l.id === id)!
}
</script>

<template>
  <div class="tp-root">
    <div class="tp-pyramid-area">
      <!-- Left axis label -->
      <div class="tp-axis tp-axis-left">
        <span class="tp-axis-end">慢</span>
        <div class="tp-axis-line"></div>
        <span class="tp-axis-start">快</span>
        <span class="tp-axis-title">速度</span>
      </div>

      <!-- Pyramid -->
      <div class="tp-pyramid">
        <div
          v-for="layer in layers"
          :key="layer.id"
          :class="['tp-layer', { active: selectedId === layer.id }]"
          :style="{
            '--layer-color': layer.color,
            '--layer-bg': layer.colorBg,
            width: layer.widthPct + '%',
          }"
          @click="toggle(layer.id)"
        >
          <span class="tp-layer-label">{{ layer.label }}</span>
          <span class="tp-layer-sub">{{ layer.countDesc }} · {{ layer.speedDesc }} · {{ layer.costDesc }}</span>
        </div>
      </div>

      <!-- Right axis label -->
      <div class="tp-axis tp-axis-right">
        <span class="tp-axis-end">高</span>
        <div class="tp-axis-line"></div>
        <span class="tp-axis-start">低</span>
        <span class="tp-axis-title">成本</span>
      </div>
    </div>

    <!-- Detail panel -->
    <Transition name="tp-slide">
      <div v-if="selectedId" class="tp-detail" :style="{ borderColor: getLayer(selectedId).color }">
        <div class="tp-detail-title" :style="{ color: getLayer(selectedId).color }">
          {{ getLayer(selectedId).label }}
        </div>
        <div class="tp-detail-text">{{ getLayer(selectedId).detail }}</div>
      </div>
    </Transition>

    <p class="tp-hint">点击金字塔的每一层查看详情</p>
  </div>
</template>

<style scoped>
.tp-root { margin: 24px 0; max-width: 688px; margin-left: auto; margin-right: auto; }
.tp-pyramid-area {
  display: flex; align-items: stretch; gap: 16px;
  padding: 24px 0;
}
.tp-axis {
  display: flex; flex-direction: column; align-items: center;
  justify-content: space-between; min-width: 36px; padding: 8px 0;
  position: relative;
}
.tp-axis-line {
  flex: 1; width: 2px; background: var(--vp-c-divider); margin: 6px 0;
}
.tp-axis-start, .tp-axis-end {
  font-size: 12px; font-weight: 600; color: var(--vp-c-text-3);
}
.tp-axis-title {
  font-size: 11px; color: var(--vp-c-text-3); margin-top: 8px;
  writing-mode: horizontal-tb;
}
.tp-pyramid {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 6px;
}
.tp-layer {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 14px 12px;
  border-radius: 8px; cursor: pointer; transition: all 0.25s;
  border: 2px solid transparent;
  background: var(--layer-bg);
  min-height: 56px;
}
.tp-layer:hover { border-color: var(--layer-color); transform: scale(1.02); }
.tp-layer.active {
  border-color: var(--layer-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--layer-color) 20%, transparent);
}
.tp-layer-label {
  font-size: 15px; font-weight: 700;
  color: var(--layer-color);
}
.tp-layer-sub {
  font-size: 12px; color: var(--vp-c-text-3); margin-top: 2px;
}
.tp-detail {
  margin-top: 16px; padding: 16px 20px; border-radius: 10px;
  border: 2px solid; background: var(--vp-c-bg-soft);
}
.tp-detail-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.tp-detail-text { font-size: 14px; color: var(--vp-c-text-2); line-height: 1.7; }
.tp-hint {
  text-align: center; font-size: 12px; color: var(--vp-c-text-3);
  margin-top: 12px;
}
.tp-slide-enter-active, .tp-slide-leave-active { transition: all 0.3s ease; }
.tp-slide-enter-from, .tp-slide-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 640px) {
  .tp-pyramid-area { gap: 8px; padding: 16px 0; }
  .tp-axis { min-width: 24px; }
  .tp-axis-start, .tp-axis-end { font-size: 10px; }
  .tp-layer { padding: 10px 8px; min-height: 44px; }
  .tp-layer-label { font-size: 13px; }
  .tp-layer-sub { font-size: 10px; }
}
</style>
