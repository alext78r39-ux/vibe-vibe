<script setup lang="ts">
import { ref } from 'vue'

type Mode = 'decision' | 'compare'

interface AnimOption {
  id: string
  name: string
  nameEn: string
  complexity: '低' | '中' | '高'
  performance: '高' | '中' | '低'
  needLib: boolean
  lib: string
  scene: string
  prompt: string
  demoClass: string
}

const mode = ref<Mode>('decision')
const selectedId = ref<string | null>(null)
const copiedId = ref<string | null>(null)

const decisionQ = '你需要什么动画？'
const options: AnimOption[] = [
  {
    id: 'css', name: '纯 CSS / Tailwind', nameEn: 'CSS Transitions',
    complexity: '低', performance: '高', needLib: false, lib: '无',
    scene: '按钮悬停、淡入淡出、简单滑入',
    prompt: '给这个按钮加一个悬停效果，用纯 CSS transition，不要引入额外的库',
    demoClass: 'demo-css'
  },
  {
    id: 'motion', name: 'Motion', nameEn: 'Framer Motion',
    complexity: '中', performance: '高', needLib: true, lib: 'motion',
    scene: '列表动画、页面切换、拖拽排序',
    prompt: '用 Motion 给这个卡片加淡入动画，用 whileInView 在元素进入视口时触发',
    demoClass: 'demo-motion'
  },
  {
    id: 'gsap', name: 'GSAP', nameEn: 'GreenSock',
    complexity: '中', performance: '高', needLib: true, lib: 'gsap',
    scene: '滚动视差、时间线动画、SVG 动画',
    prompt: '用 GSAP 的 ScrollTrigger 做一个滚动视差效果，背景图片比内容滚动慢',
    demoClass: 'demo-gsap'
  },
  {
    id: 'threejs', name: 'Three.js', nameEn: '3D Library',
    complexity: '高', performance: '低', needLib: true, lib: 'three',
    scene: '3D 产品展示、粒子效果、交互式 3D 场景',
    prompt: '用 @react-three/fiber 做一个 3D 产品展示，支持鼠标拖拽旋转查看',
    demoClass: 'demo-three'
  },
]

function select(id: string) {
  selectedId.value = selectedId.value === id ? null : id
}

function getOption(id: string) {
  return options.find(o => o.id === id)!
}

function copyPrompt(opt: AnimOption) {
  navigator.clipboard.writeText(opt.prompt)
  copiedId.value = opt.id
  setTimeout(() => { copiedId.value = null }, 1500)
}

const complexityColor = (c: string) => c === '低' ? '#15a051' : c === '中' ? '#D4952C' : '#e53935'
const perfColor = (p: string) => p === '高' ? '#15a051' : p === '中' ? '#D4952C' : '#e53935'
</script>

<template>
  <div class="adt-root">
    <div class="adt-mode-switch">
      <button :class="['adt-mode', { active: mode === 'decision' }]" @click="mode = 'decision'">决策模式</button>
      <button :class="['adt-mode', { active: mode === 'compare' }]" @click="mode = 'compare'">对比模式</button>
    </div>

    <!-- Decision Mode -->
    <div v-if="mode === 'decision'" class="adt-decision">
      <h3 class="adt-q">{{ decisionQ }}</h3>
      <div class="adt-branches">
        <button v-for="opt in options" :key="opt.id"
          :class="['adt-branch', { active: selectedId === opt.id }]"
          @click="select(opt.id)">
          <div class="adt-branch-name">{{ opt.name }}</div>
          <div class="adt-branch-scene">{{ opt.scene }}</div>
        </button>
      </div>

      <div v-if="selectedId" class="adt-detail">
        <div class="adt-detail-header">
          <h4>{{ getOption(selectedId).name }}</h4>
          <span class="adt-name-en">{{ getOption(selectedId).nameEn }}</span>
        </div>

        <div class="adt-demo" :class="getOption(selectedId).demoClass">
          <div v-if="selectedId === 'css'" class="demo-css-inner">
            <div class="demo-css-btn">Hover me</div>
          </div>
          <div v-if="selectedId === 'motion'" class="demo-motion-inner">
            <div class="demo-motion-card" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.12}s` }">{{ i }}</div>
          </div>
          <div v-if="selectedId === 'gsap'" class="demo-gsap-inner">
            <div class="demo-gsap-bg">🏔️</div>
            <div class="demo-gsap-fg">视差滚动</div>
          </div>
          <div v-if="selectedId === 'threejs'" class="demo-three-inner">
            <div class="demo-three-cube"></div>
          </div>
        </div>

        <div class="adt-meta">
          <span>复杂度：<b :style="{ color: complexityColor(getOption(selectedId).complexity) }">{{ getOption(selectedId).complexity }}</b></span>
          <span>性能：<b :style="{ color: perfColor(getOption(selectedId).performance) }">{{ getOption(selectedId).performance }}</b></span>
          <span>需要库：{{ getOption(selectedId).needLib ? getOption(selectedId).lib : '不需要' }}</span>
        </div>

        <div class="adt-prompt">
          <div class="adt-prompt-top">
            <span class="adt-prompt-label">📋 提示词</span>
            <button class="adt-copy" @click="copyPrompt(getOption(selectedId))">
              {{ copiedId === selectedId ? '✓ 已复制' : '复制' }}
            </button>
          </div>
          <div class="adt-prompt-text">{{ getOption(selectedId).prompt }}</div>
        </div>
      </div>
    </div>

    <!-- Compare Mode -->
    <div v-if="mode === 'compare'" class="adt-compare">
      <div class="adt-cards">
        <div v-for="opt in options" :key="opt.id" class="adt-card">
          <div class="adt-card-name">{{ opt.name }}</div>
          <div class="adt-card-en">{{ opt.nameEn }}</div>
          <div class="adt-card-metrics">
            <div class="adt-metric">
              <span class="adt-metric-label">复杂度</span>
              <span class="adt-metric-val" :style="{ color: complexityColor(opt.complexity) }">{{ opt.complexity }}</span>
            </div>
            <div class="adt-metric">
              <span class="adt-metric-label">性能</span>
              <span class="adt-metric-val" :style="{ color: perfColor(opt.performance) }">{{ opt.performance }}</span>
            </div>
            <div class="adt-metric">
              <span class="adt-metric-label">需要库</span>
              <span class="adt-metric-val">{{ opt.needLib ? '是' : '否' }}</span>
            </div>
          </div>
          <div class="adt-card-scene">{{ opt.scene }}</div>
          <button class="adt-card-copy" @click="copyPrompt(opt)">
            {{ copiedId === opt.id ? '✓ 已复制' : '复制提示词' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.adt-root { margin: 24px 0; }
.adt-mode-switch { display: flex; gap: 4px; margin-bottom: 16px; background: var(--vp-c-bg-soft); border-radius: 10px; padding: 4px; width: fit-content; }
.adt-mode {
  padding: 6px 18px; border-radius: 8px; border: none;
  background: transparent; color: var(--vp-c-text-2); font-size: 13px;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.adt-mode.active { background: #15a051; color: #fff; }
.adt-q { font-size: 18px; color: var(--vp-c-text-1); margin: 0 0 16px; text-align: center; }
.adt-branches { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-width: 560px; margin: 0 auto; }
.adt-branch {
  padding: 16px; border-radius: 10px; border: 2px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); cursor: pointer; transition: all 0.2s; text-align: left;
}
.adt-branch:hover { border-color: #2eb3df; }
.adt-branch.active { border-color: #15a051; background: rgba(21, 160, 81, 0.06); }
.adt-branch-name { font-size: 15px; font-weight: 700; color: var(--vp-c-text-1); }
.adt-branch-scene { font-size: 12px; color: var(--vp-c-text-3); margin-top: 4px; }
.adt-detail {
  margin-top: 16px; padding: 20px; border-radius: 12px;
  border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);
}
.adt-detail-header h4 { margin: 0; font-size: 16px; color: var(--vp-c-text-1); display: inline; }
.adt-name-en { font-size: 13px; color: var(--vp-c-text-3); margin-left: 8px; }
.adt-demo {
  margin: 14px 0; min-height: 120px; border-radius: 8px; background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider); display: flex; align-items: center;
  justify-content: center; overflow: hidden; position: relative;
}
.adt-meta { display: flex; gap: 16px; font-size: 13px; color: var(--vp-c-text-2); margin-bottom: 12px; flex-wrap: wrap; }
.adt-meta b { font-weight: 700; }
.adt-prompt { background: var(--vp-c-bg); border-radius: 8px; padding: 12px; border: 1px solid var(--vp-c-divider); }
.adt-prompt-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.adt-prompt-label { font-size: 12px; color: var(--vp-c-text-3); }
.adt-copy {
  padding: 2px 10px; border-radius: 6px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); font-size: 12px; cursor: pointer;
  color: var(--vp-c-text-2); transition: all 0.2s;
}
.adt-copy:hover { border-color: #15a051; color: #15a051; }
.adt-prompt-text { font-size: 14px; color: var(--vp-c-text-1); line-height: 1.6; }

/* CSS demo */
.demo-css-inner { padding: 24px; }
.demo-css-btn {
  display: inline-block; padding: 12px 32px; border-radius: 8px;
  background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider);
  font-weight: 600; color: var(--vp-c-text-1); cursor: pointer;
  transition: all 0.3s ease;
}
.demo-css-btn:hover { background: #15a051; color: #fff; border-color: #15a051; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(21,160,81,0.3); }

/* Motion demo */
.demo-motion-inner { display: flex; gap: 10px; padding: 16px; }
.demo-motion-card {
  width: 48px; height: 48px; border-radius: 10px; background: #15a051;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 700; font-size: 16px;
  animation: adt-fade-up 0.5s ease-out both;
}
@keyframes adt-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

/* GSAP demo */
.demo-gsap-inner { width: 100%; height: 120px; position: relative; overflow: hidden; }
.demo-gsap-bg {
  position: absolute; inset: -30px; font-size: 80px; display: flex;
  align-items: center; justify-content: center; opacity: 0.25;
  animation: adt-parallax 3s ease-in-out infinite;
}
.demo-gsap-fg {
  position: relative; z-index: 1; font-size: 14px; font-weight: 700;
  color: var(--vp-c-text-1); animation: adt-parallax-fg 3s ease-in-out infinite;
}
@keyframes adt-parallax { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
@keyframes adt-parallax-fg { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }

/* Three.js demo */
.demo-three-inner { perspective: 400px; }
.demo-three-cube {
  width: 60px; height: 60px; background: linear-gradient(135deg, #15a051, #2eb3df);
  border-radius: 8px; animation: adt-rotate 4s linear infinite;
}
@keyframes adt-rotate { from { transform: rotateY(0deg) rotateX(15deg); } to { transform: rotateY(360deg) rotateX(15deg); } }

/* Compare mode */
.adt-compare { }
.adt-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.adt-card {
  padding: 16px; border-radius: 12px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); display: flex; flex-direction: column; gap: 8px;
}
.adt-card-name { font-size: 16px; font-weight: 700; color: var(--vp-c-text-1); }
.adt-card-en { font-size: 12px; color: var(--vp-c-text-3); }
.adt-card-metrics { display: flex; flex-direction: column; gap: 4px; }
.adt-metric { display: flex; justify-content: space-between; font-size: 13px; }
.adt-metric-label { color: var(--vp-c-text-3); }
.adt-metric-val { font-weight: 600; }
.adt-card-scene { font-size: 12px; color: var(--vp-c-text-2); line-height: 1.5; }
.adt-card-copy {
  margin-top: auto; padding: 6px 12px; border-radius: 6px;
  border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg);
  font-size: 12px; cursor: pointer; color: var(--vp-c-text-2); transition: all 0.2s;
}
.adt-card-copy:hover { border-color: #15a051; color: #15a051; }

@media (max-width: 640px) {
  .adt-branches { grid-template-columns: 1fr; }
  .adt-cards { grid-template-columns: 1fr; }
}
</style>
