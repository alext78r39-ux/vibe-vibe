<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Effect {
  id: string
  name: string
  nameEn: string
  category: 'scroll' | 'transition' | 'loading' | 'visual'
  difficulty: '低' | '中' | '高'
  lib: string
  scene: string
  prompt: string
  demo: string
}

const effects: Effect[] = [
  {
    id: 'parallax', name: '视差滚动', nameEn: 'Parallax Scrolling',
    category: 'scroll', difficulty: '中', lib: 'GSAP', scene: '产品首页、营销页',
    prompt: '给首页 Hero 区域加视差滚动效果，背景图片滚动速度是内容的 0.5 倍，用 GSAP ScrollTrigger 实现',
    demo: 'parallax'
  },
  {
    id: 'fade', name: '滚动触发动画', nameEn: 'Scroll-triggered',
    category: 'scroll', difficulty: '低', lib: 'Motion', scene: '任何长页面',
    prompt: '让每个功能卡片在滚动到视口时从下方淡入，用 Motion 的 whileInView，每个卡片延迟 0.1 秒',
    demo: 'fade'
  },
  {
    id: 'progress', name: '滚动进度条', nameEn: 'Scroll Progress',
    category: 'scroll', difficulty: '低', lib: '纯 JS', scene: '长文章页面',
    prompt: '在页面顶部加一个滚动进度条，用主题色，宽度随滚动进度变化',
    demo: 'progress'
  },
  {
    id: 'marquee', name: '无限滚动', nameEn: 'Infinite Marquee',
    category: 'scroll', difficulty: '低', lib: '纯 CSS', scene: '品牌展示、合作伙伴',
    prompt: '做一个无限滚动的品牌 Logo 展示条，从右向左匀速滚动，无缝循环',
    demo: 'marquee'
  },
  {
    id: 'flip', name: '3D 翻转', nameEn: 'Card Flip',
    category: 'transition', difficulty: '低', lib: '纯 CSS', scene: '团队介绍、功能展示',
    prompt: '做一个 3D 翻转卡片，正面显示头像和名字，鼠标悬停时翻转到背面显示简介，用 CSS perspective + transform',
    demo: 'flip'
  },
  {
    id: 'counter', name: '数字滚动', nameEn: 'Counter Animation',
    category: 'transition', difficulty: '中', lib: 'Motion', scene: '数据展示页',
    prompt: '做一个数字滚动动画组件，数字从 0 增长到目标值，滚动到视口时触发，持续 2 秒',
    demo: 'counter'
  },
  {
    id: 'hover-lift', name: '悬浮抬起', nameEn: 'Hover Lift',
    category: 'transition', difficulty: '低', lib: '纯 CSS', scene: '卡片列表、功能展示',
    prompt: '给卡片加悬浮抬起效果，hover 时向上移动 8px 并加深阴影，用 CSS transition',
    demo: 'hover-lift'
  },
  {
    id: 'stagger', name: '交错入场', nameEn: 'Stagger Animation',
    category: 'transition', difficulty: '低', lib: 'CSS/Motion', scene: '网格布局、列表页',
    prompt: '让网格中的卡片依次交错入场，每个延迟 0.05 秒，从透明+缩小到正常状态',
    demo: 'stagger'
  },
  {
    id: 'typewriter', name: '打字机效果', nameEn: 'Typewriter',
    category: 'transition', difficulty: '低', lib: '纯 CSS', scene: '首页标语、介绍文字',
    prompt: '给标题加打字机效果，文字逐字出现，末尾有闪烁的光标',
    demo: 'typewriter'
  },
  {
    id: 'text-reveal', name: '文字揭示', nameEn: 'Text Reveal',
    category: 'transition', difficulty: '中', lib: '纯 CSS', scene: '标题、Slogan',
    prompt: '做一个文字从左到右逐渐揭示的动画，用 clip-path 或 overflow hidden 实现',
    demo: 'text-reveal'
  },
  {
    id: 'skeleton', name: '骨架屏', nameEn: 'Skeleton Screen',
    category: 'loading', difficulty: '低', lib: 'shadcn/ui', scene: '数据加载页面',
    prompt: '给用户列表加骨架屏，数据加载时显示灰色占位块，用 shadcn/ui 的 Skeleton 组件',
    demo: 'skeleton'
  },
  {
    id: 'glass', name: '毛玻璃', nameEn: 'Frosted Glass',
    category: 'visual', difficulty: '低', lib: '纯 CSS', scene: '导航栏、弹窗',
    prompt: '给导航栏加毛玻璃效果，用 backdrop-blur-md + bg-white/70，滚动时固定在顶部',
    demo: 'glass'
  },
  {
    id: 'gradient', name: '渐变边框', nameEn: 'Gradient Border',
    category: 'visual', difficulty: '低', lib: '纯 CSS', scene: '定价卡片、高亮区域',
    prompt: '给推荐套餐的卡片加渐变边框，从绿色到青色，用 CSS gradient border 技巧',
    demo: 'gradient'
  },
  {
    id: 'glow', name: '光晕效果', nameEn: 'Glow Effect',
    category: 'visual', difficulty: '低', lib: '纯 CSS', scene: '暗色模式按钮',
    prompt: '给 CTA 按钮加光晕效果，用主题色的 box-shadow，hover 时光晕变大',
    demo: 'glow'
  },
  {
    id: 'cursor', name: '鼠标跟随', nameEn: 'Cursor Follow',
    category: 'visual', difficulty: '中', lib: 'Motion/JS', scene: '产品展示、作品集',
    prompt: '给卡片加鼠标跟随效果，鼠标移到卡片上时根据位置微微倾斜，产生 3D 感',
    demo: 'cursor'
  },
  {
    id: 'gradient-text', name: '渐变文字', nameEn: 'Gradient Text',
    category: 'visual', difficulty: '低', lib: '纯 CSS', scene: '标题、品牌名',
    prompt: '给标题加渐变色效果，从绿色到青色，用 background-clip: text 实现',
    demo: 'gradient-text'
  },
  {
    id: 'neon', name: '霓虹灯文字', nameEn: 'Neon Text',
    category: 'visual', difficulty: '低', lib: '纯 CSS', scene: '暗色主题、游戏风格',
    prompt: '做一个霓虹灯发光文字效果，用 text-shadow 多层叠加，加闪烁动画',
    demo: 'neon'
  },
  {
    id: 'ripple', name: '涟漪效果', nameEn: 'Ripple Effect',
    category: 'visual', difficulty: '中', lib: 'JS', scene: 'Material 风格按钮',
    prompt: '给按钮加点击涟漪效果，从点击位置向外扩散的圆形波纹，类似 Material Design',
    demo: 'ripple'
  },
  {
    id: 'border-anim', name: '流光边框', nameEn: 'Animated Border',
    category: 'visual', difficulty: '中', lib: '纯 CSS', scene: '高亮卡片、特色区域',
    prompt: '给卡片加流光边框效果，渐变色沿边框旋转流动，用 conic-gradient + animation',
    demo: 'border-anim'
  },
  {
    id: 'wave', name: '波浪动画', nameEn: 'Wave Animation',
    category: 'visual', difficulty: '低', lib: '纯 CSS/SVG', scene: '页面分隔、背景装饰',
    prompt: '在两个区域之间加波浪形分隔线，用 SVG path 做波浪，加缓慢起伏动画',
    demo: 'wave'
  }
]

const categories = [
  { key: 'all', label: '全部' },
  { key: 'scroll', label: '滚动效果' },
  { key: 'transition', label: '过渡效果' },
  { key: 'loading', label: '加载体验' },
  { key: 'visual', label: '视觉特效' }
] as const

const activeCategory = ref<string>('all')
const selectedEffect = ref<Effect | null>(null)
const copiedId = ref<string | null>(null)
const counterValue = ref(0)
let counterTimer: number | null = null
const cursorX = ref(0)
const cursorY = ref(0)
const progressValue = ref(0)
let progressTimer: number | null = null
const rippleKey = ref(0)
const ripplePos = ref({ x: 0, y: 0 })
const filteredEffects = computed(() => {
  if (activeCategory.value === 'all') return effects
  return effects.filter(e => e.category === activeCategory.value)
})

function selectEffect(effect: Effect) {
  selectedEffect.value = effect
  stopAllDemos()
  startDemo(effect)
}

function copyPrompt(effect: Effect) {
  navigator.clipboard.writeText(effect.prompt)
  copiedId.value = effect.id
  setTimeout(() => { copiedId.value = null }, 1500)
}

function startDemo(effect: Effect) {
  if (effect.demo === 'counter') {
    counterValue.value = 0
    counterTimer = window.setInterval(() => {
      counterValue.value += 137
      if (counterValue.value >= 10000) {
        counterValue.value = 10000
        if (counterTimer) clearInterval(counterTimer)
      }
    }, 30)
  }
  if (effect.demo === 'progress') {
    progressValue.value = 0
    progressTimer = window.setInterval(() => {
      progressValue.value += 1
      if (progressValue.value >= 100) progressValue.value = 0
    }, 50)
  }
}

function stopAllDemos() {
  if (counterTimer) { clearInterval(counterTimer); counterTimer = null }
  if (progressTimer) { clearInterval(progressTimer); progressTimer = null }
  counterValue.value = 0
  progressValue.value = 0
}

function handleCursorMove(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  cursorX.value = ((e.clientX - rect.left) / rect.width - 0.5) * 20
  cursorY.value = ((e.clientY - rect.top) / rect.height - 0.5) * -20
}

function handleCursorLeave() { cursorX.value = 0; cursorY.value = 0 }
function handleRipple(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  ripplePos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  rippleKey.value++
}

const difficultyColor = (d: string) => {
  if (d === '低') return '#43a047'
  if (d === '中') return '#f59e0b'
  return '#e53935'
}

onMounted(() => { if (effects.length > 0) selectEffect(effects[0]) })
onUnmounted(() => stopAllDemos())
</script>

<template>
  <div class="fx-root">
    <div class="fx-tabs">
      <button v-for="cat in categories" :key="cat.key"
        :class="['fx-tab', { active: activeCategory === cat.key }]"
        @click="activeCategory = cat.key"
      >{{ cat.label }}</button>
    </div>

    <div class="fx-layout">
      <div class="fx-list">
        <button v-for="effect in filteredEffects" :key="effect.id"
          :class="['fx-item', { active: selectedEffect?.id === effect.id }]"
          @click="selectEffect(effect)"
        >
          <div class="fx-item-name">{{ effect.name }}</div>
          <div class="fx-item-meta">
            <span class="fx-badge" :style="{ color: difficultyColor(effect.difficulty) }">{{ effect.difficulty }}</span>
            <span class="fx-lib">{{ effect.lib }}</span>
          </div>
        </button>
      </div>

      <div class="fx-detail" v-if="selectedEffect">
        <div class="fx-detail-header">
          <h3>{{ selectedEffect.name }}</h3>
          <span class="fx-name-en">{{ selectedEffect.nameEn }}</span>
        </div>

        <div class="fx-demo">
          <div v-if="selectedEffect.demo === 'parallax'" class="demo-parallax">
            <div class="demo-parallax-bg">🏔️</div>
            <div class="demo-parallax-fg">前景内容以正常速度滚动</div>
          </div>
          <div v-if="selectedEffect.demo === 'fade'" class="demo-fade">
            <div class="demo-fade-card" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.15}s` }">卡片 {{ i }}</div>
          </div>

          <div v-if="selectedEffect.demo === 'progress'" class="demo-progress">
            <div class="demo-progress-bar" :style="{ width: progressValue + '%' }"></div>
            <span class="demo-progress-text">{{ progressValue }}%</span>
          </div>

          <div v-if="selectedEffect.demo === 'marquee'" class="demo-marquee">
            <div class="demo-marquee-track">
              <span v-for="i in 8" :key="i" class="demo-marquee-item">Brand {{ i }}</span>
              <span v-for="i in 8" :key="'d'+i" class="demo-marquee-item">Brand {{ i }}</span>
            </div>
          </div>

          <div v-if="selectedEffect.demo === 'flip'" class="demo-flip">
            <div class="demo-flip-inner">
              <div class="demo-flip-front">👤 正面</div>
              <div class="demo-flip-back">📝 背面简介</div>
            </div>
          </div>

          <div v-if="selectedEffect.demo === 'counter'" class="demo-counter">
            <span class="demo-counter-num">{{ counterValue.toLocaleString() }}</span>
            <span class="demo-counter-label">已服务用户</span>
          </div>

          <div v-if="selectedEffect.demo === 'hover-lift'" class="demo-hover-lift">
            <div class="demo-lift-card" v-for="i in 3" :key="i">卡片 {{ i }}</div>
          </div>

          <div v-if="selectedEffect.demo === 'stagger'" class="demo-stagger">
            <div class="demo-stagger-item" v-for="i in 9" :key="i" :style="{ animationDelay: `${i * 0.06}s` }"></div>
          </div>

          <div v-if="selectedEffect.demo === 'typewriter'" class="demo-typewriter">
            <span class="demo-tw-text">Hello, Vibe Coding!</span>
          </div>

          <div v-if="selectedEffect.demo === 'text-reveal'" class="demo-text-reveal">
            <span class="demo-reveal-text">让页面更高级</span>
          </div>
          <div v-if="selectedEffect.demo === 'skeleton'" class="demo-skeleton">
            <div class="demo-sk-row" v-for="i in 3" :key="i">
              <div class="demo-sk-avatar"></div>
              <div class="demo-sk-lines">
                <div class="demo-sk-line" style="width:60%"></div>
                <div class="demo-sk-line" style="width:40%"></div>
              </div>
            </div>
          </div>

          <div v-if="selectedEffect.demo === 'glass'" class="demo-glass">
            <div class="demo-glass-bg">🎨🌈✨🎭</div>
            <div class="demo-glass-panel">毛玻璃导航栏</div>
          </div>

          <div v-if="selectedEffect.demo === 'gradient'" class="demo-gradient">
            <div class="demo-gradient-card">推荐套餐</div>
          </div>

          <div v-if="selectedEffect.demo === 'glow'" class="demo-glow">
            <button class="demo-glow-btn">立即开始</button>
          </div>

          <div v-if="selectedEffect.demo === 'cursor'" class="demo-cursor"
            @mousemove="handleCursorMove" @mouseleave="handleCursorLeave">
            <div class="demo-cursor-card" :style="{
              transform: `perspective(600px) rotateY(${cursorX}deg) rotateX(${cursorY}deg)`
            }">移动鼠标试试</div>
          </div>

          <div v-if="selectedEffect.demo === 'gradient-text'" class="demo-gradient-text">
            <span class="demo-gt-text">Vibe Coding</span>
          </div>

          <div v-if="selectedEffect.demo === 'neon'" class="demo-neon">
            <span class="demo-neon-text">NEON</span>
          </div>

          <div v-if="selectedEffect.demo === 'ripple'" class="demo-ripple" @click="handleRipple">
            <span class="demo-ripple-label">点击我</span>
            <span class="demo-ripple-wave" :key="rippleKey"
              :style="{ left: ripplePos.x + 'px', top: ripplePos.y + 'px' }"></span>
          </div>
          <div v-if="selectedEffect.demo === 'border-anim'" class="demo-border-anim">
            <div class="demo-ba-card">流光边框</div>
          </div>

          <div v-if="selectedEffect.demo === 'wave'" class="demo-wave">
            <svg class="demo-wave-svg" viewBox="0 0 400 80" preserveAspectRatio="none">
              <path class="demo-wave-path" d="M0,40 C100,80 200,0 300,40 C350,60 380,30 400,40 L400,80 L0,80 Z" />
              <path class="demo-wave-path2" d="M0,50 C80,20 160,70 240,40 C320,10 360,50 400,40 L400,80 L0,80 Z" />
            </svg>
          </div>
        </div>

        <div class="fx-prompt">
          <div class="fx-prompt-label">
            <span>📋 提示词</span>
            <button class="fx-copy" @click="copyPrompt(selectedEffect)">
              {{ copiedId === selectedEffect.id ? '✓ 已复制' : '复制' }}
            </button>
          </div>
          <div class="fx-prompt-text">{{ selectedEffect.prompt }}</div>
        </div>
        <div class="fx-scene">适合场景：{{ selectedEffect.scene }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fx-root { margin: 24px 0; }
.fx-tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.fx-tab {
  padding: 6px 16px; border-radius: 999px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); font-size: 13px;
  cursor: pointer; transition: all 0.2s;
}
.fx-tab.active { background: var(--vp-c-brand); color: #fff; border-color: var(--vp-c-brand); }
.fx-layout { display: grid; grid-template-columns: 200px 1fr; gap: 16px; min-height: 360px; }
.fx-list { display: flex; flex-direction: column; gap: 4px; max-height: 520px; overflow-y: auto; }
.fx-item {
  text-align: left; padding: 10px 12px; border-radius: 8px;
  border: 1px solid transparent; background: var(--vp-c-bg-soft);
  cursor: pointer; transition: all 0.2s;
}
.fx-item:hover { border-color: var(--vp-c-divider); }
.fx-item.active { border-color: var(--vp-c-brand); background: var(--vp-c-brand-soft, rgba(21, 160, 81, 0.08)); }
.fx-item-name { font-size: 14px; font-weight: 600; color: var(--vp-c-text-1); }
.fx-item-meta { display: flex; gap: 8px; margin-top: 4px; font-size: 12px; }
.fx-badge { font-weight: 600; }
.fx-lib { color: var(--vp-c-text-3); }
.fx-detail {
  border: 1px solid var(--vp-c-divider); border-radius: 12px;
  background: var(--vp-c-bg-soft); padding: 20px; display: flex; flex-direction: column; gap: 16px;
}
.fx-detail-header h3 { margin: 0; font-size: 18px; color: var(--vp-c-text-1); }
.fx-name-en { font-size: 13px; color: var(--vp-c-text-3); }
.fx-demo {
  min-height: 160px; border-radius: 8px; background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider); display: flex; align-items: center;
  justify-content: center; overflow: hidden; position: relative;
}
.fx-prompt { background: var(--vp-c-bg); border-radius: 8px; padding: 12px; border: 1px solid var(--vp-c-divider); }
.fx-prompt-label {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 12px; color: var(--vp-c-text-3); margin-bottom: 8px;
}
.fx-copy {
  padding: 2px 10px; border-radius: 6px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); font-size: 12px; cursor: pointer; color: var(--vp-c-text-2); transition: all 0.2s;
}
.fx-copy:hover { border-color: var(--vp-c-brand); color: var(--vp-c-brand); }
.fx-prompt-text { font-size: 14px; color: var(--vp-c-text-1); line-height: 1.6; }
.fx-scene { font-size: 13px; color: var(--vp-c-text-3); }

/* Parallax */
.demo-parallax { width: 100%; height: 200px; position: relative; overflow: hidden; }
.demo-parallax-bg {
  position: absolute; inset: -60px; font-size: 100px; display: flex;
  align-items: center; justify-content: center; animation: parallax-float 4s ease-in-out infinite; opacity: 0.3;
}
.demo-parallax-fg {
  position: relative; z-index: 1; font-size: 14px; color: var(--vp-c-text-1);
  font-weight: 600; animation: parallax-slide 4s ease-in-out infinite;
}
@keyframes parallax-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
@keyframes parallax-slide { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-60px); } }

/* Fade */
.demo-fade { display: flex; gap: 12px; padding: 16px; }
.demo-fade-card {
  padding: 16px 24px; border-radius: 8px; background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider); font-size: 14px; font-weight: 600;
  animation: fade-up 0.6s ease-out both; color: var(--vp-c-text-1);
}
@keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
/* Progress */
.demo-progress { width: 100%; height: 160px; position: relative; display: flex; align-items: center; justify-content: center; }
.demo-progress-bar {
  position: absolute; top: 0; left: 0; height: 4px;
  background: var(--vp-c-brand); transition: width 0.05s linear; border-radius: 0 2px 2px 0;
}
.demo-progress-text { font-size: 32px; font-weight: 700; color: var(--vp-c-text-1); font-variant-numeric: tabular-nums; }

/* Marquee */
.demo-marquee { width: 100%; overflow: hidden; padding: 16px 0; position: absolute; inset: 0; display: flex; align-items: center; }
.demo-marquee-track {
  display: flex; gap: 24px; animation: marquee-scroll 12s linear infinite;
  flex-shrink: 0; white-space: nowrap;
}
.demo-marquee-track > * { flex-shrink: 0; }
.demo-marquee-item {
  padding: 8px 20px; border-radius: 8px; background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider); font-size: 13px; font-weight: 600;
  color: var(--vp-c-text-2); white-space: nowrap;
}
@keyframes marquee-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-50% - 12px)); } }

/* Flip */
.demo-flip { width: 120px; height: 120px; perspective: 600px; cursor: pointer; }
.demo-flip-inner { width: 100%; height: 100%; position: relative; transition: transform 0.6s; transform-style: preserve-3d; }
.demo-flip:hover .demo-flip-inner { transform: rotateY(180deg); }
.demo-flip-front, .demo-flip-back {
  position: absolute; inset: 0; backface-visibility: hidden; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600;
}
.demo-flip-front { background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-1); }
.demo-flip-back { background: var(--vp-c-brand); color: #fff; transform: rotateY(180deg); }

/* Counter */
.demo-counter { text-align: center; }
.demo-counter-num { font-size: 40px; font-weight: 800; color: var(--vp-c-brand); font-variant-numeric: tabular-nums; display: block; }
.demo-counter-label { font-size: 13px; color: var(--vp-c-text-3); }

/* Hover Lift */
.demo-hover-lift { display: flex; gap: 12px; padding: 16px; }
.demo-lift-card {
  padding: 20px 24px; border-radius: 10px; background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider); font-size: 14px; font-weight: 600;
  color: var(--vp-c-text-1); transition: transform 0.3s, box-shadow 0.3s; cursor: pointer;
}
.demo-lift-card:hover { transform: translateY(-8px); box-shadow: 0 12px 24px rgba(0,0,0,0.12); }
/* Stagger */
.demo-stagger { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 16px; width: 100%; }
.demo-stagger-item {
  aspect-ratio: 1; border-radius: 8px; background: var(--vp-c-brand);
  opacity: 0; animation: stagger-in 0.4s ease-out forwards;
}
@keyframes stagger-in { from { opacity: 0; transform: scale(0.6); } to { opacity: 0.7; transform: scale(1); } }

/* Typewriter */
.demo-typewriter { padding: 24px; }
.demo-tw-text {
  font-size: 20px; font-weight: 700; color: var(--vp-c-text-1);
  border-right: 2px solid var(--vp-c-brand); white-space: nowrap; overflow: hidden;
  display: inline-block; animation: tw-type 2.5s steps(20) forwards, tw-blink 0.6s step-end infinite;
  width: 0; max-width: 100%;
}
@keyframes tw-type { to { width: 20ch; } }
@keyframes tw-blink { 50% { border-color: transparent; } }

/* Text Reveal */
.demo-text-reveal { padding: 24px; overflow: hidden; }
.demo-reveal-text {
  font-size: 28px; font-weight: 800; color: var(--vp-c-text-1);
  display: inline-block; clip-path: inset(0 100% 0 0);
  animation: text-clip 1.2s ease-out forwards;
}
@keyframes text-clip { to { clip-path: inset(0 0 0 0); } }

/* Skeleton */
.demo-skeleton { padding: 16px; width: 100%; display: flex; flex-direction: column; gap: 16px; }
.demo-sk-row { display: flex; gap: 12px; align-items: center; }
.demo-sk-avatar {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(90deg, var(--vp-c-divider) 25%, var(--vp-c-bg-soft) 50%, var(--vp-c-divider) 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.demo-sk-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.demo-sk-line {
  height: 12px; border-radius: 6px;
  background: linear-gradient(90deg, var(--vp-c-divider) 25%, var(--vp-c-bg-soft) 50%, var(--vp-c-divider) 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Glass */
.demo-glass { width: 100%; height: 160px; position: relative; overflow: hidden; }
.demo-glass-bg {
  position: absolute; inset: 0; font-size: 48px; display: flex; align-items: center;
  justify-content: center; gap: 8px; letter-spacing: 16px;
}
.demo-glass-panel {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  padding: 12px 32px; border-radius: 12px; font-size: 14px; font-weight: 600;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  background: rgba(255,255,255,0.25); border: 1px solid rgba(255,255,255,0.3);
  color: var(--vp-c-text-1);
}

/* Gradient border — green to teal */
.demo-gradient { padding: 24px; }
.demo-gradient-card {
  padding: 24px 40px; border-radius: 12px; font-size: 16px; font-weight: 700;
  background: var(--vp-c-bg); position: relative; color: var(--vp-c-text-1);
  border: 2px solid transparent; background-clip: padding-box;
  box-shadow: 0 0 0 2px var(--vp-c-bg), 0 0 0 4px transparent;
  background-image: linear-gradient(var(--vp-c-bg), var(--vp-c-bg)), linear-gradient(135deg, #15a051, #2eb3df);
  background-origin: border-box; background-clip: padding-box, border-box;
}

/* Glow — green */
.demo-glow { padding: 24px; background: #111a14; border-radius: 8px; width: 100%; display: flex; justify-content: center; }
.demo-glow-btn {
  padding: 12px 32px; border-radius: 8px; border: none; font-size: 15px; font-weight: 600;
  background: #15a051; color: #fff; cursor: pointer;
  box-shadow: 0 0 20px rgba(21, 160, 81, 0.5); transition: box-shadow 0.3s;
}
.demo-glow-btn:hover { box-shadow: 0 0 40px rgba(21, 160, 81, 0.8), 0 0 80px rgba(21, 160, 81, 0.3); }

/* Cursor follow */
.demo-cursor { width: 100%; height: 160px; display: flex; align-items: center; justify-content: center; cursor: crosshair; }
.demo-cursor-card {
  padding: 24px 40px; border-radius: 12px; background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider); font-size: 14px; font-weight: 600;
  transition: transform 0.1s ease-out; color: var(--vp-c-text-1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

/* Gradient text — green to teal */
.demo-gradient-text { padding: 24px; }
.demo-gt-text {
  font-size: 36px; font-weight: 800;
  background: linear-gradient(135deg, #15a051, #2eb3df);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}

/* Neon — green glow */
.demo-neon { padding: 24px; background: #111a14; border-radius: 8px; width: 100%; display: flex; justify-content: center; }
.demo-neon-text {
  font-size: 40px; font-weight: 900; color: #4ade80; letter-spacing: 8px;
  text-shadow: 0 0 7px #4ade80, 0 0 10px #4ade80, 0 0 21px #4ade80, 0 0 42px #15a051, 0 0 82px #15a051;
  animation: neon-flicker 2s infinite alternate;
}
@keyframes neon-flicker { 0%,19%,21%,23%,25%,54%,56%,100% { opacity: 1; } 20%,24%,55% { opacity: 0.6; } }
/* Ripple */
.demo-ripple {
  position: relative; overflow: hidden; padding: 16px 40px; border-radius: 8px;
  background: var(--vp-c-brand); color: #fff; font-weight: 600; cursor: pointer;
  font-size: 15px;
}
.demo-ripple-label { position: relative; z-index: 1; }
.demo-ripple-wave {
  position: absolute; width: 200px; height: 200px; border-radius: 50%;
  background: rgba(255,255,255,0.4); transform: translate(-50%, -50%) scale(0);
  animation: ripple-expand 0.6s ease-out forwards; pointer-events: none;
}
@keyframes ripple-expand { to { transform: translate(-50%, -50%) scale(2); opacity: 0; } }

/* Animated border — green/teal conic */
.demo-border-anim { padding: 24px; }
.demo-ba-card {
  padding: 24px 40px; border-radius: 12px; font-size: 16px; font-weight: 700;
  color: var(--vp-c-text-1); position: relative; background: var(--vp-c-bg); z-index: 0;
}
.demo-ba-card::before {
  content: ''; position: absolute; inset: -3px; border-radius: 14px; z-index: -1;
  background: conic-gradient(from var(--ba-angle, 0deg), #15a051, #2eb3df, #D4952C, #15a051);
  animation: ba-rotate 3s linear infinite;
}
.demo-ba-card::after {
  content: ''; position: absolute; inset: 0; border-radius: 12px; z-index: -1;
  background: var(--vp-c-bg);
}
@property --ba-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
@keyframes ba-rotate { to { --ba-angle: 360deg; } }

/* Wave */
.demo-wave { width: 100%; height: 160px; position: relative; background: var(--vp-c-bg-soft); }
.demo-wave-svg { position: absolute; bottom: 0; left: 0; width: 100%; height: 80px; }
.demo-wave-path { fill: var(--vp-c-brand); opacity: 0.3; animation: wave-move 4s ease-in-out infinite; }
.demo-wave-path2 { fill: var(--vp-c-brand); opacity: 0.15; animation: wave-move 5s ease-in-out infinite reverse; }
@keyframes wave-move { 0%,100% { d: path('M0,40 C100,80 200,0 300,40 C350,60 380,30 400,40 L400,80 L0,80 Z'); } 50% { d: path('M0,50 C80,20 180,70 280,30 C340,10 370,50 400,40 L400,80 L0,80 Z'); } }

/* Responsive */
@media (max-width: 640px) {
  .fx-layout { grid-template-columns: 1fr; }
  .fx-list { flex-direction: row; overflow-x: auto; max-height: none; }
  .fx-item { white-space: nowrap; flex-shrink: 0; }
}
</style>
