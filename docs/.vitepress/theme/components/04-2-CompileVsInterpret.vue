<script setup lang="ts">
interface ExecutionModel {
  title: string
  langs: string
  steps: string[]
  color: string
}

const models: ExecutionModel[] = [
  {
    title: '编译型',
    langs: 'C, Go, Rust',
    steps: ['源代码', '编译器', '机器码', '执行'],
    color: '#007aff',
  },
  {
    title: '解释型',
    langs: 'Python, JS',
    steps: ['源代码', '解释器', '逐行执行'],
    color: '#34c759',
  },
  {
    title: '混合型',
    langs: 'Java, C#',
    steps: ['源代码', '编译器', '字节码', '虚拟机', '执行'],
    color: '#ff9500',
  },
]
</script>

<template>
  <div class="cvi-root">
    <div class="cvi-grid">
      <div v-for="m in models" :key="m.title" class="cvi-col">
        <div class="cvi-header" :style="{ borderColor: m.color }">
          <div class="cvi-title" :style="{ color: m.color }">{{ m.title }}</div>
          <div class="cvi-langs">{{ m.langs }}</div>
        </div>
        <div class="cvi-flow">
          <template v-for="(step, i) in m.steps" :key="i">
            <div class="cvi-step" :style="{ borderColor: m.color + '60', background: m.color + '10' }">
              {{ step }}
            </div>
            <div v-if="i < m.steps.length - 1" class="cvi-arrow" :style="{ color: m.color }">
              ↓
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cvi-root { margin: 24px 0; max-width: 688px; margin-left: auto; margin-right: auto; }
.cvi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.cvi-col { display: flex; flex-direction: column; align-items: center; }
.cvi-header {
  width: 100%; text-align: center; padding: 12px 8px; border-radius: 10px;
  border: 2px solid var(--vp-c-divider); background: var(--vp-c-bg-soft); margin-bottom: 12px;
}
.cvi-title { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
.cvi-langs { font-size: 11px; color: var(--vp-c-text-3); }
.cvi-flow { display: flex; flex-direction: column; align-items: center; gap: 0; width: 100%; }
.cvi-step {
  width: 100%; padding: 8px 6px; border-radius: 8px; border: 1.5px solid;
  text-align: center; font-size: 12px; font-weight: 600; color: var(--vp-c-text-1);
}
.cvi-arrow { font-size: 16px; line-height: 1; padding: 2px 0; font-weight: 700; }
@media (max-width: 640px) {
  .cvi-grid { grid-template-columns: 1fr; max-width: 260px; margin: 0 auto; gap: 20px; }
}
</style>
