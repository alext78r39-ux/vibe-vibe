<script setup lang="ts">
import { ref } from 'vue'

const mode = ref<'traditional' | 'separated'>('traditional')
const animStep = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function switchMode(m: 'traditional' | 'separated') {
  mode.value = m
  animStep.value = 0
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    animStep.value++
    if (animStep.value >= 4) {
      if (timer) clearInterval(timer)
      timer = null
    }
  }, 700)
}

switchMode('traditional')

import { onUnmounted } from 'vue'
onUnmounted(() => { if (timer) clearInterval(timer) })

const traditionalSteps = [
  { label: '浏览器请求页面', from: 'browser', to: 'server' },
  { label: '服务器查询数据库 + 生成 HTML', from: 'server', to: 'server' },
  { label: '返回完整 HTML 页面', from: 'server', to: 'browser' },
  { label: '浏览器直接显示', from: 'browser', to: 'browser' },
]

const separatedSteps = [
  { label: '浏览器加载前端框架', from: 'browser', to: 'browser' },
  { label: '前端请求 JSON 数据', from: 'browser', to: 'server' },
  { label: '服务器返回 JSON', from: 'server', to: 'browser' },
  { label: '前端渲染页面', from: 'browser', to: 'browser' },
]
</script>

<template>
  <div class="fba-root">
    <div class="fba-toggle">
      <button :class="['fba-mode', { active: mode === 'traditional' }]" @click="switchMode('traditional')">
        🏛️ 传统模式
      </button>
      <button :class="['fba-mode', { active: mode === 'separated' }]" @click="switchMode('separated')">
        🔀 前后端分离
      </button>
    </div>

    <div class="fba-stage">
      <div class="fba-box fba-browser" :class="{ highlight: animStep >= 0 && (mode === 'separated' ? separatedSteps : traditionalSteps)[Math.min(animStep, 3)]?.from === 'browser' || (mode === 'separated' ? separatedSteps : traditionalSteps)[Math.min(animStep, 3)]?.to === 'browser' }">
        <div class="fba-box-icon">🌐</div>
        <div class="fba-box-label">浏览器</div>
        <div class="fba-box-sub">{{ mode === 'traditional' ? '只负责显示' : 'React / Next.js' }}</div>
      </div>

      <div class="fba-channel">
        <div class="fba-channel-line"></div>
        <div :class="['fba-data-packet', { active: animStep === 1 || animStep === 2 }]"
          :style="{ transform: animStep === 1 ? 'translateX(40px)' : animStep === 2 ? 'translateX(-40px)' : '' }">
          {{ mode === 'traditional' ? 'HTML' : 'JSON' }}
        </div>
      </div>

      <div class="fba-box fba-server" :class="{ highlight: (mode === 'separated' ? separatedSteps : traditionalSteps)[Math.min(animStep, 3)]?.from === 'server' || (mode === 'separated' ? separatedSteps : traditionalSteps)[Math.min(animStep, 3)]?.to === 'server' }">
        <div class="fba-box-icon">🖥️</div>
        <div class="fba-box-label">服务器</div>
        <div class="fba-box-sub">{{ mode === 'traditional' ? '生成完整页面' : '只提供 API' }}</div>
      </div>
    </div>

    <div class="fba-steps">
      <div v-for="(step, i) in (mode === 'traditional' ? traditionalSteps : separatedSteps)" :key="i"
        :class="['fba-step', { active: i <= animStep, current: i === animStep }]">
        <span class="fba-step-num">{{ i + 1 }}</span>
        <span class="fba-step-text">{{ step.label }}</span>
      </div>
    </div>

    <div class="fba-comparison">
      <div v-if="mode === 'traditional'" class="fba-note">
        ⚠️ 每次页面切换都需要服务器重新生成完整 HTML，体验较慢
      </div>
      <div v-else class="fba-note fba-note-good">
        ✅ 前后端独立开发部署，页面切换无需重新加载，体验流畅
      </div>
    </div>
  </div>
</template>

<style scoped>
.fba-root { margin: 24px 0; }
.fba-toggle { display: flex; gap: 8px; margin-bottom: 20px; }
.fba-mode {
  padding: 8px 20px; border-radius: 10px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; color: var(--vp-c-text-2);
}
.fba-mode.active { border-color: var(--vp-c-brand); color: var(--vp-c-brand); background: var(--vp-c-brand-dimm); }
.fba-mode:hover { transform: translateY(-1px); }
.fba-stage { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px; }
.fba-box {
  flex: 1; max-width: 200px; padding: 20px; border-radius: 14px;
  border: 2px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);
  text-align: center; transition: all 0.3s;
}
.fba-box.highlight { border-color: var(--vp-c-brand); background: var(--vp-c-brand-dimm); }
.fba-box-icon { font-size: 32px; margin-bottom: 6px; }
.fba-box-label { font-size: 15px; font-weight: 700; color: var(--vp-c-text-1); }
.fba-box-sub { font-size: 11px; color: var(--vp-c-text-3); margin-top: 4px; }
.fba-channel { flex: 0 0 100px; display: flex; align-items: center; justify-content: center; position: relative; }
.fba-channel-line { width: 100%; height: 2px; background: var(--vp-c-divider); }
.fba-data-packet {
  position: absolute; padding: 3px 10px; border-radius: 6px; font-size: 11px;
  font-weight: 700; font-family: 'SF Mono', Monaco, monospace;
  background: var(--vp-c-brand); color: #fff; transition: transform 0.5s ease; opacity: 0;
}
.fba-data-packet.active { opacity: 1; }
.fba-steps { display: flex; flex-direction: column; gap: 6px; }
.fba-step {
  display: flex; align-items: center; gap: 10px; padding: 8px 14px;
  border-radius: 8px; transition: all 0.3s; opacity: 0.35;
}
.fba-step.active { opacity: 1; }
.fba-step.current { background: var(--vp-c-brand-dimm); }
.fba-step-num {
  width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center;
  justify-content: center; font-size: 12px; font-weight: 700;
  background: var(--vp-c-default-soft); color: var(--vp-c-text-2); flex-shrink: 0;
}
.fba-step.active .fba-step-num { background: var(--vp-c-brand); color: #fff; }
.fba-step-text { font-size: 13px; color: var(--vp-c-text-1); }
.fba-note {
  margin-top: 14px; padding: 10px 16px; border-radius: 8px;
  font-size: 13px; line-height: 1.5; background: rgba(255,149,0,0.08); color: #ff9500;
}
.fba-note-good { background: rgba(52,199,89,0.08); color: #34c759; }
.fba-comparison { margin-top: 4px; }
@media (max-width: 640px) {
  .fba-stage { flex-direction: column; gap: 10px; }
  .fba-box { max-width: 100%; }
  .fba-channel { flex: 0 0 40px; transform: rotate(90deg); }
}
</style>
