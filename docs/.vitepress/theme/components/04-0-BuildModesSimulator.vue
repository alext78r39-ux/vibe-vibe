<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

interface Stage {
  id: 'dev' | 'build' | 'prod'
  label: string
  icon: string
  command: string
  color: string
  features: string[]
  terminalLines: string[]
  tip?: string
}

const stages: Stage[] = [
  {
    id: 'dev', label: '开发模式', icon: '🔧', command: 'pnpm dev', color: '#007aff',
    features: ['热重载', '详细报错', '快速迭代', '源码映射'],
    terminalLines: [
      '$ pnpm dev',
      '',
      '  ▲ Next.js 16.0.0',
      '  - Local:    http://localhost:3000',
      '',
      ' ✓ Ready in 1.2s',
      ' ○ Compiling / ...',
      ' ✓ Compiled / in 320ms',
    ],
    tip: '改了 .env 但没效果？重启 dev 服务器！'
  },
  {
    id: 'build', label: '构建', icon: '📦', command: 'pnpm build', color: '#ff9500',
    features: ['代码压缩', '树摇优化', '静态分析', '产物生成'],
    terminalLines: [
      '$ pnpm build',
      '',
      '   Creating an optimized production build...',
      '   ✓ Compiled successfully',
      '   ✓ Linting and checking validity',
      '   ✓ Collecting page data',
      '   ✓ Generating static pages (8/8)',
      '   ✓ Finalizing page optimization',
      '',
      '   Route     Size     First Load JS',
      '   ┌ ○ /      5.2 kB   89.1 kB',
      '   └ ○ /api   0 B      83.9 kB',
      '   ✓ Build completed in 12.3s',
    ],
  },
  {
    id: 'prod', label: '生产模式', icon: '🚀', command: 'pnpm start', color: '#34c759',
    features: ['性能最优', '无调试信息', '缓存策略', '准备部署'],
    terminalLines: [
      '$ pnpm start',
      '',
      '  ▲ Next.js 16.0.0',
      '  - Local:    http://localhost:3000',
      '  - Network:  http://192.168.1.100:3000',
      '',
      ' ✓ Ready in 0.4s',
    ],
  },
]

const active = ref<'dev' | 'build' | 'prod'>('dev')
const animating = ref(false)
const visibleLines = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function selectStage(id: 'dev' | 'build' | 'prod') {
  if (animating.value) return
  active.value = id
  visibleLines.value = 0
  animating.value = true
  const total = stages.find(s => s.id === id)!.terminalLines.length
  let count = 0
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    count++
    visibleLines.value = count
    if (count >= total) {
      if (timer) clearInterval(timer)
      timer = null
      animating.value = false
    }
  }, 120)
}

selectStage('dev')

onUnmounted(() => { if (timer) clearInterval(timer) })

const currentStage = () => stages.find(s => s.id === active.value)!
</script>

<template>
  <div class="bms-root">
    <div class="bms-pipeline">
      <button v-for="(s, i) in stages" :key="s.id"
        :class="['bms-stage', { active: active === s.id }]"
        :style="active === s.id ? { borderColor: s.color, background: s.color + '10' } : {}"
        @click="selectStage(s.id)">
        <span class="bms-stage-icon">{{ s.icon }}</span>
        <span class="bms-stage-label">{{ s.label }}</span>
        <span v-if="i < stages.length - 1" class="bms-arrow">→</span>
      </button>
    </div>

    <div class="bms-content">
      <div class="bms-info">
        <div class="bms-features">
          <span v-for="f in currentStage().features" :key="f" class="bms-feature"
            :style="{ background: currentStage().color + '15', color: currentStage().color }">
            {{ f }}
          </span>
        </div>
        <div v-if="currentStage().tip" class="bms-tip">
          💡 {{ currentStage().tip }}
        </div>
      </div>

      <div class="bms-terminal">
        <div class="bms-terminal-bar">
          <span class="bms-dot" style="background:#ff5f57"></span>
          <span class="bms-dot" style="background:#febc2e"></span>
          <span class="bms-dot" style="background:#28c840"></span>
          <span class="bms-terminal-title">Terminal</span>
        </div>
        <div class="bms-terminal-body">
          <div v-for="(line, i) in currentStage().terminalLines" :key="i"
            class="bms-line" :class="{ visible: i < visibleLines }">
            <span v-if="line.startsWith('$')" class="bms-prompt">{{ line }}</span>
            <span v-else-if="line.includes('✓')" class="bms-success">{{ line }}</span>
            <span v-else-if="line.includes('✗') || line.includes('Error')" class="bms-error">{{ line }}</span>
            <span v-else>{{ line }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bms-root { margin: 24px 0; }
.bms-pipeline { display: flex; align-items: center; gap: 0; margin-bottom: 16px; flex-wrap: wrap; }
.bms-stage {
  display: flex; align-items: center; gap: 6px; padding: 10px 18px;
  border-radius: 10px; border: 1.5px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);
  cursor: pointer; transition: all 0.2s; font-size: 14px; font-weight: 600;
  color: var(--vp-c-text-2);
}
.bms-stage.active { color: var(--vp-c-text-1); }
.bms-stage:hover { transform: translateY(-1px); }
.bms-stage-icon { font-size: 18px; }
.bms-arrow { margin: 0 4px; color: var(--vp-c-text-3); font-size: 16px; pointer-events: none; }
.bms-content { display: flex; gap: 16px; flex-wrap: wrap; }
.bms-info { flex: 1; min-width: 200px; }
.bms-features { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.bms-feature {
  padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
}
.bms-tip {
  padding: 10px 14px; border-radius: 8px; background: rgba(255,149,0,0.08);
  font-size: 13px; color: #ff9500; line-height: 1.5;
}
.bms-terminal {
  flex: 2; min-width: 300px; border-radius: 10px; overflow: hidden;
  border: 1px solid var(--vp-c-divider); background: #1a1a2e;
}
.bms-terminal-bar {
  display: flex; align-items: center; gap: 6px; padding: 8px 12px;
  background: #16162a; border-bottom: 1px solid #2a2a4a;
}
.bms-dot { width: 10px; height: 10px; border-radius: 50%; }
.bms-terminal-title { font-size: 11px; color: #666; margin-left: auto; }
.bms-terminal-body {
  padding: 12px 16px; font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 12px; line-height: 1.7; min-height: 160px; color: #a0a0c0;
}
.bms-line { opacity: 0; transition: opacity 0.15s ease; white-space: pre; }
.bms-line.visible { opacity: 1; }
.bms-prompt { color: #7dd3fc; }
.bms-success { color: #4ade80; }
.bms-error { color: #f87171; }
@media (max-width: 640px) {
  .bms-pipeline { gap: 6px; }
  .bms-stage { padding: 8px 12px; font-size: 13px; }
  .bms-arrow { display: none; }
  .bms-content { flex-direction: column; }
  .bms-terminal { min-width: auto; }
}
</style>
