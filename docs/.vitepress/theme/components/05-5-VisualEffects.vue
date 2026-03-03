<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'

// Copy functionality
const copiedIndex = ref<number | null>(null)
function copyPrompt(text: string, index: number) {
  navigator.clipboard.writeText(text).then(() => {
    copiedIndex.value = index
    setTimeout(() => { copiedIndex.value = null }, 1500)
  })
}

// Effect 1: Skeleton toggle
const skeletonLoaded = ref(false)

// Effect 8: Ripple
function createRipple(e: MouseEvent) {
  const btn = e.currentTarget as HTMLElement
  const rect = btn.getBoundingClientRect()
  const ripple = document.createElement('span')
  const size = Math.max(rect.width, rect.height) * 2
  ripple.style.width = ripple.style.height = size + 'px'
  ripple.style.left = (e.clientX - rect.left - size / 2) + 'px'
  ripple.style.top = (e.clientY - rect.top - size / 2) + 'px'
  ripple.className = 'ripple-circle'
  btn.appendChild(ripple)
  ripple.addEventListener('animationend', () => ripple.remove())
}

// Prompts data
const prompts = [
  '给用户列表加骨架屏，数据加载时显示灰色占位块，用 shadcn/ui 的 Skeleton 组件',
  '给导航栏加毛玻璃效果，用 backdrop-blur-md + bg-white/70，滚动时固定在顶部',
  '给推荐套餐的卡片加渐变边框，从绿色到青色，用 CSS gradient border 技巧',
  '给 CTA 按钮加光晕效果，用主题色的 box-shadow，hover 时光晕变大',
  '给标题加渐变色效果，从绿色到青色，用 background-clip: text 实现',
  '做一个霓虹灯发光文字效果，用 text-shadow 多层叠加，加闪烁动画',
  '给按钮加点击涟漪效果，从点击位置向外扩散的圆形波纹，类似 Material Design',
  '给卡片加流光边框效果，渐变色沿边框旋转流动，用 conic-gradient + animation',
  '在两个区域之间加波浪形分隔线，用 SVG path 做波浪，加缓慢起伏动画',
  '给首页加极光背景效果，用多个模糊渐变色块独立漂浮移动，营造北极光氛围，用 CSS filter blur + animation 实现',
  '给 Hero 区域加流动渐变背景，多个颜色缓慢过渡流动，用 CSS background-size + animation 实现，类似 Apple 官网风格',
  '做一个视频文字遮罩效果，大号文字用 background-clip: text 配合动态渐变背景模拟视频效果，文字内部显示流动的色彩',
  '做一个暗色模式无缝切换效果，点击按钮时从点击位置用 clip-path circle 向外扩展切换主题色，过渡流畅自然',
  '做一个动态噪点叠加效果，用 SVG feTurbulence 滤镜生成噪点，通过动画改变 seed 值实现动态胶片颗粒感',
  '做一个流体扭曲效果，用 SVG feDisplacementMap 滤镜，鼠标悬停时动画改变 scale 值从 0 到 30，产生液态扭曲感',
  '做一个混合模式反色效果，一个白色圆形跟随鼠标移动，用 mix-blend-mode: difference 让经过区域颜色反转',
  '做一个动态色板提取效果，用 Canvas 绘制渐变预设图案，采样像素提取主要颜色，展示提取出的调色板',
]

// Effect 13: Dark Mode Toggle
const darkmodeIsDark = ref(false)
const darkmodeClipStyle = reactive({ clipPath: 'circle(150% at 50% 50%)' })
const darkmodeTransitioning = ref(false)

function darkmodeToggle(e: MouseEvent) {
  if (darkmodeTransitioning.value) return
  const container = (e.currentTarget as HTMLElement).closest('.darkmode-demo') as HTMLElement
  if (!container) return
  const rect = container.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const maxDist = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y))
  darkmodeTransitioning.value = true
  darkmodeClipStyle.clipPath = `circle(0px at ${x}px ${y}px)`
  // Force reflow then expand
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      darkmodeClipStyle.clipPath = `circle(${maxDist}px at ${x}px ${y}px)`
      setTimeout(() => {
        darkmodeIsDark.value = !darkmodeIsDark.value
        darkmodeClipStyle.clipPath = 'circle(150% at 50% 50%)'
        darkmodeTransitioning.value = false
      }, 500)
    })
  })
}

// Effect 14: Noise Overlay
const noiseRef = ref<SVGAnimateElement | null>(null)

// Effect 15: Fluid Distortion
const fluidRef = ref<HTMLElement | null>(null)
const fluidScale = ref(0)
let fluidRaf = 0
let fluidTarget = 0

function fluidAnimate() {
  fluidScale.value += (fluidTarget - fluidScale.value) * 0.08
  if (Math.abs(fluidScale.value - fluidTarget) > 0.1) {
    fluidRaf = requestAnimationFrame(fluidAnimate)
  } else {
    fluidScale.value = fluidTarget
  }
}
function fluidEnter() {
  fluidTarget = 30
  cancelAnimationFrame(fluidRaf)
  fluidRaf = requestAnimationFrame(fluidAnimate)
}
function fluidLeave() {
  fluidTarget = 0
  cancelAnimationFrame(fluidRaf)
  fluidRaf = requestAnimationFrame(fluidAnimate)
}

// Effect 16: Blend Mode Invert
const blendRef = ref<HTMLElement | null>(null)
const blendPos = reactive({ x: -100, y: -100 })

function blendMove(e: MouseEvent) {
  const container = blendRef.value
  if (!container) return
  const rect = container.getBoundingClientRect()
  blendPos.x = e.clientX - rect.left
  blendPos.y = e.clientY - rect.top
}
function blendLeave() {
  blendPos.x = -100
  blendPos.y = -100
}

// Effect 17: Dynamic Color Palette
const paletteCanvasRef = ref<HTMLCanvasElement | null>(null)
const paletteColors = ref<string[]>([])
const palettePresetIndex = ref(0)
const palettePresets = [
  { name: '日落', colors: ['#ff6b35', '#f7c59f', '#efefd0', '#004e89', '#1a659e'] },
  { name: '森林', colors: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#b7e4c7'] },
  { name: '极光', colors: ['#7400b8', '#6930c3', '#5e60ce', '#5390d9', '#4ea8de'] },
  { name: '珊瑚', colors: ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557'] },
]

function paletteDrawAndExtract() {
  const canvas = paletteCanvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height
  const preset = palettePresets[palettePresetIndex.value]

  // Draw gradient pattern
  ctx.clearRect(0, 0, w, h)
  const grad = ctx.createLinearGradient(0, 0, w, h)
  preset.colors.forEach((c, i) => {
    grad.addColorStop(i / (preset.colors.length - 1), c)
  })
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Add radial accents
  for (let i = 0; i < preset.colors.length; i++) {
    const rx = (w / (preset.colors.length + 1)) * (i + 1)
    const ry = h / 2 + Math.sin(i * 1.5) * (h * 0.25)
    const rg = ctx.createRadialGradient(rx, ry, 0, rx, ry, w * 0.25)
    rg.addColorStop(0, preset.colors[i] + 'aa')
    rg.addColorStop(1, 'transparent')
    ctx.fillStyle = rg
    ctx.fillRect(0, 0, w, h)
  }

  // Sample colors
  const samples: string[] = []
  const step = Math.floor(w / 6)
  for (let sx = step; sx < w; sx += step) {
    const pixel = ctx.getImageData(sx, Math.floor(h / 2), 1, 1).data
    samples.push(`rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`)
  }
  paletteColors.value = samples.slice(0, 5)
}

function paletteSwitchPreset() {
  palettePresetIndex.value = (palettePresetIndex.value + 1) % palettePresets.length
  paletteDrawAndExtract()
}

// Lifecycle
onMounted(() => {
  paletteDrawAndExtract()
})

onUnmounted(() => {
  cancelAnimationFrame(fluidRaf)
})
</script>

<template>
  <div class="visual-effects-showcase">

    <!-- ==================== 1. Skeleton Screen ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>骨架屏</h3>
          <span class="effect-name-en">Skeleton Screen</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">shadcn/ui</span>
          <span class="tag-scene">数据加载页面</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="skeleton-demo">
          <button class="skeleton-toggle" @click="skeletonLoaded = !skeletonLoaded">
            {{ skeletonLoaded ? '显示骨架屏' : '显示加载完成' }}
          </button>
          <div class="skeleton-container">
            <!-- Header skeleton -->
            <div v-if="!skeletonLoaded" class="skel-header">
              <div class="skel-block skel-shimmer" style="width: 40%; height: 24px; border-radius: 6px;" />
              <div class="skel-block skel-shimmer" style="width: 20%; height: 16px; border-radius: 4px; margin-top: 8px;" />
            </div>
            <div v-else class="skel-header-loaded">
              <h4>用户列表</h4>
              <span>共 3 位用户</span>
            </div>
            <!-- User list items -->
            <div v-for="i in 3" :key="i" class="skel-user-row">
              <template v-if="!skeletonLoaded">
                <div class="skel-avatar skel-shimmer" />
                <div class="skel-text-group">
                  <div class="skel-block skel-shimmer" style="width: 60%; height: 16px; border-radius: 4px;" />
                  <div class="skel-block skel-shimmer" style="width: 40%; height: 12px; border-radius: 4px; margin-top: 8px;" />
                </div>
              </template>
              <template v-else>
                <div class="skel-avatar-loaded">{{ ['A', 'B', 'C'][i - 1] }}</div>
                <div class="skel-text-group">
                  <div class="skel-name">{{ ['Alice Chen', 'Bob Wang', 'Carol Li'][i - 1] }}</div>
                  <div class="skel-email">{{ ['alice@example.com', 'bob@example.com', 'carol@example.com'][i - 1] }}</div>
                </div>
              </template>
            </div>
            <!-- Button skeleton -->
            <div v-if="!skeletonLoaded" class="skel-block skel-shimmer" style="width: 120px; height: 36px; border-radius: 8px; margin-top: 16px;" />
            <button v-else class="skel-btn-loaded">加载更多</button>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[0], 0)">{{ copiedIndex === 0 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[0] }}</div>
      </div>
    </div>

    <!-- ==================== 2. Frosted Glass ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>毛玻璃</h3>
          <span class="effect-name-en">Frosted Glass</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">导航栏、弹窗</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="frost-demo">
          <div class="frost-bg">
            <div class="frost-shape frost-shape-1" />
            <div class="frost-shape frost-shape-2" />
            <div class="frost-shape frost-shape-3" />
            <div class="frost-shape frost-shape-4" />
          </div>
          <div class="frost-navbar">
            <div class="frost-logo">✦ VibeCoder</div>
            <div class="frost-links">
              <span>首页</span>
              <span>文档</span>
              <span>博客</span>
            </div>
            <button class="frost-btn">开始使用</button>
          </div>
          <div class="frost-card">
            <h4>毛玻璃弹窗</h4>
            <p>backdrop-filter: blur() 让背景模糊，配合半透明背景色，营造出磨砂质感。</p>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[1], 1)">{{ copiedIndex === 1 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[1] }}</div>
      </div>
    </div>

    <!-- ==================== 3. Gradient Border ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>渐变边框</h3>
          <span class="effect-name-en">Gradient Border</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">定价卡片、高亮区域</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="gradient-border-demo">
          <div v-for="(plan, idx) in [
            { name: '基础版', price: '¥0', features: ['1 个项目', '基础模板', '社区支持'], cta: '免费开始' },
            { name: '专业版', price: '¥99/月', features: ['无限项目', '高级模板', '优先支持', 'API 访问'], cta: '立即升级', recommended: true },
            { name: '企业版', price: '联系我们', features: ['定制部署', '专属顾问', 'SLA 保障', '私有化'], cta: '联系销售' },
          ]" :key="idx" :class="['gb-card', { 'gb-card-recommended': plan.recommended }]">
            <div v-if="plan.recommended" class="gb-badge">推荐</div>
            <h4 class="gb-plan-name">{{ plan.name }}</h4>
            <div class="gb-price">{{ plan.price }}</div>
            <ul class="gb-features">
              <li v-for="f in plan.features" :key="f">✓ {{ f }}</li>
            </ul>
            <button :class="['gb-cta', { 'gb-cta-primary': plan.recommended }]">{{ plan.cta }}</button>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[2], 2)">{{ copiedIndex === 2 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[2] }}</div>
      </div>
    </div>

    <!-- ==================== 4. Glow Effect ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>光晕效果</h3>
          <span class="effect-name-en">Glow Effect</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">暗色模式按钮</span>
        </div>
      </div>
      <div class="effect-demo glow-demo-outer">
        <div class="glow-demo">
          <button class="glow-btn glow-rose">开始体验</button>
          <button class="glow-btn glow-sage">了解更多</button>
          <button class="glow-btn glow-lavender glow-pulse">联系我们</button>
        </div>
        <div class="glow-hint">光晕效果需要深色背景才能凸显，hover 按钮查看增强效果</div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[3], 3)">{{ copiedIndex === 3 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[3] }}</div>
      </div>
    </div>

    <!-- ==================== 6. Gradient Text ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>渐变文字</h3>
          <span class="effect-name-en">Gradient Text</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">标题、品牌名</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="grad-text-demo">
          <h2 class="grad-text grad-text-hero">用 AI 构建未来</h2>
          <h3 class="grad-text grad-text-sub">Vibe Coding 新范式</h3>
          <span class="grad-text grad-text-badge">🔥 热门技术</span>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[4], 4)">{{ copiedIndex === 4 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[4] }}</div>
      </div>
    </div>

    <!-- ==================== 7. Neon Text ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>霓虹灯文字</h3>
          <span class="effect-name-en">Neon Text</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">暗色主题、游戏风格</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="neon-demo">
          <div class="neon-line neon-rose">NEON</div>
          <div class="neon-line neon-mauve neon-sub">霓虹灯效果</div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[5], 5)">{{ copiedIndex === 5 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[5] }}</div>
      </div>
    </div>

    <!-- ==================== 8. Ripple Effect ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>涟漪效果</h3>
          <span class="effect-name-en">Ripple Effect</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #f59e0b">中</span>
          <span class="tag-lib">JS</span>
          <span class="tag-scene">Material 风格按钮</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="ripple-demo">
          <button class="ripple-btn ripple-filled" @click="createRipple">确认提交</button>
          <button class="ripple-btn ripple-outlined" @click="createRipple">了解详情</button>
          <button class="ripple-btn ripple-text" @click="createRipple">取消操作</button>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[6], 6)">{{ copiedIndex === 6 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[6] }}</div>
      </div>
    </div>

    <!-- ==================== 9. Animated Border ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>流光边框</h3>
          <span class="effect-name-en">Animated Border</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #f59e0b">中</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">高亮卡片、特色区域</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="anim-border-demo">
          <div class="anim-border-card">
            <div class="anim-border-glow" />
            <div class="anim-border-content">
              <div class="anim-border-icon">✦</div>
              <h4>Pro 功能已解锁</h4>
              <p>享受无限项目、优先支持和高级模板。流光边框用 conic-gradient 旋转实现。</p>
            </div>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[7], 7)">{{ copiedIndex === 7 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[7] }}</div>
      </div>
    </div>

    <!-- ==================== 10. Wave Animation ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>波浪动画</h3>
          <span class="effect-name-en">Wave Animation</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">纯 CSS/SVG</span>
          <span class="tag-scene">页面分隔、背景装饰</span>
        </div>
      </div>
      <div class="effect-demo wave-demo-wrapper">
        <div class="wave-top-section">
          <h4>上方内容区域</h4>
          <p>品牌色背景</p>
        </div>
        <svg class="wave-svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <rect width="1440" height="120" fill="var(--vp-c-brand)" />
          <path class="wave-1" d="M0,40 C360,100 1080,0 1440,40 L1440,120 L0,120 Z" />
          <path class="wave-2" d="M0,55 C320,10 1120,100 1440,55 L1440,120 L0,120 Z" />
          <path class="wave-3" d="M0,70 C480,120 960,20 1440,70 L1440,120 L0,120 Z" />
        </svg>
        <div class="wave-bottom-section">
          <h4>下方内容区域</h4>
          <p>默认背景色</p>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[8], 8)">{{ copiedIndex === 8 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[8] }}</div>
      </div>
    </div>

    <!-- ==================== 11. Aurora Background ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>极光背景</h3>
          <span class="effect-name-en">Aurora Background</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">暗色主题首页、Hero 区域</span>
        </div>
      </div>
      <div class="effect-demo aurora-demo-wrapper">
        <div class="aurora-demo">
          <div class="aurora-blob aurora-blob-1" />
          <div class="aurora-blob aurora-blob-2" />
          <div class="aurora-blob aurora-blob-3" />
          <div class="aurora-blob aurora-blob-4" />
          <div class="aurora-blob aurora-blob-5" />
          <div class="aurora-content">
            <h2>Welcome to the Future</h2>
            <p>用 AI 构建下一代 Web 应用，从这里开始</p>
            <button class="aurora-cta">开始探索</button>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[9], 9)">{{ copiedIndex === 9 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[9] }}</div>
      </div>
    </div>

    <!-- ==================== 12. Animated Gradient Background ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>渐变背景流动</h3>
          <span class="effect-name-en">Animated Gradient Background</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">Hero 区域、登录页背景</span>
        </div>
      </div>
      <div class="effect-demo gradient-bg-demo-outer">
        <div class="gradient-bg-demo">
          <div class="gradient-bg-noise" />
          <div class="gradient-bg-content">
            <h2 class="gradient-bg-title">Build Something Amazing</h2>
            <p class="gradient-bg-subtitle">用 AI 和创造力，构建下一个改变世界的产品</p>
            <button class="gradient-bg-cta">开始构建 →</button>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[10], 10)">{{ copiedIndex === 10 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[10] }}</div>
      </div>
    </div>

    <!-- ==================== 13. Video Text Mask ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>视频文字遮罩</h3>
          <span class="effect-name-en">Video Text Mask</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">Hero 区域、品牌展示</span>
        </div>
      </div>
      <div class="effect-demo video-mask-demo-outer">
        <div class="video-mask-demo">
          <div class="video-mask-text">VIBE</div>
          <div class="video-mask-sub">流动色彩文字遮罩</div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[11], 11)">{{ copiedIndex === 11 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[11] }}</div>
      </div>
    </div>

    <!-- ==================== 14. Dark Mode Seamless Toggle ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>暗色模式无缝切换</h3>
          <span class="effect-name-en">Dark Mode Seamless Toggle</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #e53935">高</span>
          <span class="tag-lib">JS+CSS</span>
          <span class="tag-scene">主题切换、设置页</span>
        </div>
      </div>
      <div class="effect-demo darkmode-demo-outer">
        <div class="darkmode-demo" :class="{ 'darkmode-dark': darkmodeIsDark }">
          <div class="darkmode-page">
            <div class="darkmode-nav">
              <span class="darkmode-logo">MyApp</span>
              <button class="darkmode-toggle-btn" @click="darkmodeToggle">
                {{ darkmodeIsDark ? '☀️' : '🌙' }}
              </button>
            </div>
            <div class="darkmode-body">
              <div class="darkmode-card">
                <div class="darkmode-card-title">欢迎回来</div>
                <div class="darkmode-card-text">点击右上角按钮切换主题，观察 clip-path 圆形扩展效果</div>
              </div>
              <div class="darkmode-card">
                <div class="darkmode-card-title">今日数据</div>
                <div class="darkmode-card-text">访问量 1,234 · 转化率 5.6%</div>
              </div>
            </div>
          </div>
          <!-- Overlay for clip-path transition -->
          <div
            v-if="darkmodeTransitioning"
            class="darkmode-overlay"
            :class="{ 'darkmode-overlay-dark': !darkmodeIsDark }"
            :style="{ clipPath: darkmodeClipStyle.clipPath }"
          />
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[12], 12)">{{ copiedIndex === 12 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[12] }}</div>
      </div>
    </div>

    <!-- ==================== 15. Dynamic Noise Overlay ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>动态噪点叠加</h3>
          <span class="effect-name-en">Dynamic Noise Overlay</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #f59e0b">中</span>
          <span class="tag-lib">SVG+CSS</span>
          <span class="tag-scene">复古风格、电影质感</span>
        </div>
      </div>
      <div class="effect-demo noise-demo-outer">
        <div class="noise-demo">
          <div class="noise-bg" />
          <svg class="noise-svg" width="0" height="0">
            <filter id="noise-filter">
              <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch">
                <animate ref="noiseRef" attributeName="seed" from="0" to="100" dur="1s" repeatCount="indefinite" />
              </feTurbulence>
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </svg>
          <div class="noise-grain" />
          <div class="noise-content">
            <div class="noise-title">FILM GRAIN</div>
            <div class="noise-subtitle">动态胶片颗粒感</div>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[13], 13)">{{ copiedIndex === 13 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[13] }}</div>
      </div>
    </div>

    <!-- ==================== 16. Fluid Distortion ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>流体扭曲</h3>
          <span class="effect-name-en">Fluid Distortion</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #e53935">高</span>
          <span class="tag-lib">SVG+JS</span>
          <span class="tag-scene">创意首页、艺术展示</span>
        </div>
      </div>
      <div class="effect-demo fluid-demo-outer">
        <div class="fluid-demo" ref="fluidRef" @mouseenter="fluidEnter" @mouseleave="fluidLeave">
          <svg class="fluid-svg" width="0" height="0">
            <filter id="fluid-filter">
              <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="3" result="turbulence" seed="2" />
              <feDisplacementMap in="SourceGraphic" in2="turbulence" :scale="fluidScale" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </svg>
          <div class="fluid-content" :style="{ filter: `url(#fluid-filter)` }">
            <div class="fluid-image">
              <div class="fluid-gradient" />
              <div class="fluid-text">FLUID</div>
              <div class="fluid-sub">悬停查看扭曲效果</div>
            </div>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[14], 14)">{{ copiedIndex === 14 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[14] }}</div>
      </div>
    </div>

    <!-- ==================== 17. Blend Mode Invert ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>混合模式反色</h3>
          <span class="effect-name-en">Blend Mode Invert</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #f59e0b">中</span>
          <span class="tag-lib">JS+CSS</span>
          <span class="tag-scene">创意光标、艺术效果</span>
        </div>
      </div>
      <div class="effect-demo blend-demo-outer">
        <div class="blend-demo" ref="blendRef" @mousemove="blendMove" @mouseleave="blendLeave">
          <div class="blend-content">
            <div class="blend-block blend-block-1">Hello</div>
            <div class="blend-block blend-block-2">World</div>
            <div class="blend-block blend-block-3">Vibe</div>
            <div class="blend-block blend-block-4">Code</div>
          </div>
          <div
            class="blend-cursor"
            :style="{ left: blendPos.x + 'px', top: blendPos.y + 'px' }"
          />
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[15], 15)">{{ copiedIndex === 15 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[15] }}</div>
      </div>
    </div>

    <!-- ==================== 18. Dynamic Color Palette ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>动态色板提取</h3>
          <span class="effect-name-en">Dynamic Color Palette</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #e53935">高</span>
          <span class="tag-lib">Canvas+JS</span>
          <span class="tag-scene">设计工具、图片处理</span>
        </div>
      </div>
      <div class="effect-demo palette-demo-outer">
        <div class="palette-demo">
          <canvas ref="paletteCanvasRef" class="palette-canvas" width="400" height="120" />
          <div class="palette-swatches">
            <div
              v-for="(color, i) in paletteColors"
              :key="i"
              class="palette-swatch"
              :style="{ background: color }"
            >
              <span class="palette-swatch-label">{{ color }}</span>
            </div>
          </div>
          <div class="palette-controls">
            <button class="palette-btn" @click="paletteSwitchPreset">
              切换预设：{{ palettePresets[palettePresetIndex].name }}
            </button>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[16], 16)">{{ copiedIndex === 16 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[16] }}</div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ===== Base Layout ===== */
.visual-effects-showcase {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.effect-block {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}
.effect-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.effect-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.effect-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.effect-name-en {
  font-size: 13px;
  color: var(--vp-c-text-3);
}
.effect-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tag-difficulty,
.tag-lib,
.tag-scene {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 99px;
  font-weight: 600;
}
.tag-difficulty {
  background: color-mix(in srgb, currentColor 12%, transparent);
}
.tag-lib {
  color: var(--vp-c-brand);
  background: color-mix(in srgb, var(--vp-c-brand) 10%, transparent);
}
.tag-scene {
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
}

/* ===== Demo & Prompt shared ===== */
.effect-demo {
  min-height: 200px;
  background: var(--vp-c-bg);
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
}
.effect-prompt {
  padding: 0;
}
.prompt-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}
.prompt-bar button {
  font-size: 12px;
  padding: 4px 14px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}
.prompt-bar button:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}
.prompt-text {
  padding: 0 20px 14px;
  font-size: 13px;
  color: var(--vp-c-text-1);
  line-height: 1.6;
  font-family: var(--vp-font-family-mono);
}

/* ===== 1. Skeleton ===== */
.skeleton-demo {
  width: 100%;
  max-width: 400px;
}
.skeleton-toggle {
  margin-bottom: 16px;
  padding: 6px 16px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-brand);
  background: transparent;
  color: var(--vp-c-brand);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.skeleton-toggle:hover {
  background: var(--vp-c-brand);
  color: #fff;
}
.skeleton-container {
  padding: 20px;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}
.skel-header { margin-bottom: 20px; }
.skel-header-loaded {
  margin-bottom: 20px;
}
.skel-header-loaded h4 {
  margin: 0 0 4px;
  font-size: 16px;
  color: var(--vp-c-text-1);
}
.skel-header-loaded span {
  font-size: 13px;
  color: var(--vp-c-text-3);
}
.skel-block {
  background: var(--vp-c-divider);
}
.skel-shimmer {
  background: linear-gradient(90deg, var(--vp-c-divider) 25%, color-mix(in srgb, var(--vp-c-divider) 60%, transparent) 50%, var(--vp-c-divider) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.skel-user-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
}
.skel-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}
.skel-avatar-loaded {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--vp-c-brand);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}
.skel-text-group { flex: 1; }
.skel-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.skel-email {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-top: 4px;
}
.skel-btn-loaded {
  margin-top: 16px;
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: var(--vp-c-brand);
  color: #fff;
  cursor: pointer;
  font-size: 13px;
}

/* ===== 2. Frosted Glass ===== */
.frost-demo {
  width: 100%;
  position: relative;
  min-height: 260px;
  border-radius: 10px;
  overflow: hidden;
}
.frost-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #43a047, #00bcd4, #7c4dff, #ff5722);
  background-size: 300% 300%;
  animation: frostBg 8s ease infinite;
}
@keyframes frostBg {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.frost-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;
}
.frost-shape-1 { width: 120px; height: 120px; background: #ffeb3b; top: 10%; left: 10%; }
.frost-shape-2 { width: 80px; height: 80px; background: #e91e63; top: 50%; left: 60%; }
.frost-shape-3 { width: 100px; height: 100px; background: #2196f3; top: 20%; right: 10%; }
.frost-shape-4 { width: 60px; height: 60px; background: #4caf50; bottom: 15%; left: 35%; }
.frost-navbar {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.25);
}
.frost-logo {
  font-weight: 700;
  font-size: 15px;
  color: #fff;
}
.frost-links {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}
.frost-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}
.frost-card {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  padding: 20px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
}
.frost-card h4 {
  margin: 0 0 8px;
  font-size: 15px;
}
.frost-card p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
  line-height: 1.5;
}

/* ===== 3. Gradient Border ===== */
.gradient-border-demo {
  display: flex;
  gap: 20px;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
}
.gb-card {
  flex: 1;
  min-width: 180px;
  max-width: 240px;
  padding: 24px 20px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  text-align: center;
  position: relative;
  transition: transform 0.2s;
}
.gb-card:hover { transform: translateY(-2px); }
.gb-card-recommended {
  border: 2px solid transparent;
  background-image: linear-gradient(var(--vp-c-bg-soft), var(--vp-c-bg-soft)), linear-gradient(135deg, #43a047, #00bcd4);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}
.gb-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 14px;
  border-radius: 99px;
  background: linear-gradient(135deg, #43a047, #00bcd4);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}
.gb-plan-name {
  margin: 8px 0 4px;
  font-size: 16px;
  color: var(--vp-c-text-1);
}
.gb-price {
  font-size: 28px;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin: 8px 0 16px;
}
.gb-features {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  text-align: left;
}
.gb-features li {
  padding: 4px 0;
}
.gb-cta {
  width: 100%;
  padding: 8px 0;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.gb-cta:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}
.gb-cta-primary {
  background: linear-gradient(135deg, #43a047, #00bcd4);
  color: #fff;
  border: none;
}
.gb-cta-primary:hover {
  opacity: 0.9;
  color: #fff;
}

/* ===== 4. Glow Effect ===== */
.glow-demo {
  width: 100%;
  display: flex;
  gap: 24px;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  background: linear-gradient(180deg, #1a2332 0%, #0f1923 100%);
  border-radius: 10px;
  flex-wrap: wrap;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.glow-btn {
  padding: 12px 28px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  transition: box-shadow 0.3s, transform 0.2s;
}
.glow-rose {
  background: #c4a4a4;
  box-shadow: 0 0 16px rgba(196, 164, 164, 0.5), 0 0 40px rgba(196, 164, 164, 0.2);
}
.glow-rose:hover {
  box-shadow: 0 0 24px rgba(196, 164, 164, 0.7), 0 0 60px rgba(196, 164, 164, 0.35);
  transform: translateY(-1px);
}
.glow-sage {
  background: #a3b18a;
  box-shadow: 0 0 16px rgba(163, 177, 138, 0.5), 0 0 40px rgba(163, 177, 138, 0.2);
}
.glow-sage:hover {
  box-shadow: 0 0 24px rgba(163, 177, 138, 0.7), 0 0 60px rgba(163, 177, 138, 0.35);
  transform: translateY(-1px);
}
.glow-lavender {
  background: #b4a7d6;
  box-shadow: 0 0 16px rgba(180, 167, 214, 0.5), 0 0 40px rgba(180, 167, 214, 0.2);
}
.glow-lavender:hover {
  box-shadow: 0 0 24px rgba(180, 167, 214, 0.7), 0 0 60px rgba(180, 167, 214, 0.35);
  transform: translateY(-1px);
}
.glow-pulse {
  animation: glowPulse 2s ease-in-out infinite;
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 16px rgba(180, 167, 214, 0.5), 0 0 40px rgba(180, 167, 214, 0.2); }
  50% { box-shadow: 0 0 28px rgba(180, 167, 214, 0.8), 0 0 70px rgba(180, 167, 214, 0.4); }
}
.glow-demo-outer {
  flex-direction: column;
  gap: 16px;
  background: var(--vp-c-bg);
}
.glow-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
  text-align: center;
}

/* ===== 6. Gradient Text ===== */
.grad-text-demo {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.grad-text {
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  line-height: 1.2;
}
.grad-text-hero {
  font-size: 42px;
  font-weight: 900;
  background-image: linear-gradient(135deg, #43a047, #00bcd4);
}
.grad-text-sub {
  font-size: 26px;
  font-weight: 700;
  background-image: linear-gradient(135deg, #7c4dff, #e91e63);
}
.grad-text-badge {
  font-size: 14px;
  font-weight: 700;
  padding: 6px 18px;
  border-radius: 99px;
  background-image: linear-gradient(135deg, #ff9800, #e53935);
  border: 1px solid var(--vp-c-divider);
}

/* ===== 7. Neon Text ===== */
.neon-demo {
  width: 100%;
  padding: 40px 20px;
  background: #0e1117;
  border-radius: 10px;
  text-align: center;
}
.neon-line {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: 6px;
  line-height: 1.4;
}
.neon-rose {
  color: #d4a5a5;
  text-shadow:
    0 0 7px rgba(212, 165, 165, 0.6),
    0 0 20px rgba(212, 165, 165, 0.3),
    0 0 40px rgba(212, 165, 165, 0.15);
}
.neon-mauve {
  color: #b8a9c9;
  text-shadow:
    0 0 7px rgba(184, 169, 201, 0.6),
    0 0 20px rgba(184, 169, 201, 0.3),
    0 0 40px rgba(184, 169, 201, 0.15);
}
.neon-sub {
  font-size: 20px;
  letter-spacing: 8px;
  margin-top: 8px;
}

/* ===== 8. Ripple Effect ===== */
.ripple-demo {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}
.ripple-btn {
  position: relative;
  overflow: hidden;
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.ripple-filled {
  background: var(--vp-c-brand);
  color: #fff;
  border: none;
}
.ripple-outlined {
  background: transparent;
  color: var(--vp-c-brand);
  border: 2px solid var(--vp-c-brand);
}
.ripple-text {
  background: transparent;
  color: var(--vp-c-text-2);
  border: none;
}
.ripple-text:hover {
  background: var(--vp-c-bg-soft);
}
:deep(.ripple-circle) {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
  transform: scale(0);
  animation: rippleAnim 0.6s ease-out forwards;
  pointer-events: none;
}
.ripple-outlined :deep(.ripple-circle) {
  background: color-mix(in srgb, var(--vp-c-brand) 20%, transparent);
}
.ripple-text :deep(.ripple-circle) {
  background: color-mix(in srgb, var(--vp-c-text-2) 15%, transparent);
}
@keyframes rippleAnim {
  to { transform: scale(1); opacity: 0; }
}

/* ===== 9. Animated Border ===== */
.anim-border-demo {
  display: flex;
  justify-content: center;
  width: 100%;
}
.anim-border-card {
  position: relative;
  width: 340px;
  border-radius: 14px;
  padding: 3px;
  overflow: hidden;
}
.anim-border-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150%;
  aspect-ratio: 1;
  translate: -50% -50%;
  background: conic-gradient(from 0deg, #43a047, #00bcd4, #f59e0b, #e91e63, #43a047);
  animation: borderSpin 3s linear infinite;
}
@keyframes borderSpin {
  to { rotate: 360deg; }
}
.anim-border-content {
  position: relative;
  z-index: 1;
  background: var(--vp-c-bg);
  border-radius: 11px;
  padding: 28px 24px;
  text-align: center;
}
.anim-border-icon {
  font-size: 32px;
  margin-bottom: 12px;
  color: var(--vp-c-brand);
}
.anim-border-content h4 {
  margin: 0 0 10px;
  font-size: 18px;
  color: var(--vp-c-text-1);
}
.anim-border-content p {
  margin: 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

/* ===== 10. Wave Animation ===== */
.wave-demo-wrapper {
  flex-direction: column;
  padding: 0;
  min-height: 300px;
}
.wave-top-section {
  width: 100%;
  padding: 32px 24px 0;
  background: var(--vp-c-brand);
  color: #fff;
  text-align: center;
}
.wave-top-section h4 {
  margin: 0 0 4px;
  font-size: 16px;
}
.wave-top-section p {
  margin: 0;
  font-size: 13px;
  opacity: 0.8;
}
.wave-svg {
  width: 100%;
  height: 80px;
  display: block;
  margin-top: -1px;
}
.wave-1 {
  opacity: 0.3;
  fill: color-mix(in srgb, var(--vp-c-brand) 60%, var(--vp-c-bg));
  animation: waveMove1 4s ease-in-out infinite;
}
.wave-2 {
  opacity: 0.6;
  fill: color-mix(in srgb, var(--vp-c-brand) 30%, var(--vp-c-bg));
  animation: waveMove2 5s ease-in-out infinite;
}
.wave-3 {
  fill: var(--vp-c-bg);
  animation: waveMove3 6s ease-in-out infinite;
}
@keyframes waveMove1 {
  0%, 100% { d: path("M0,40 C360,100 1080,0 1440,40 L1440,120 L0,120 Z"); }
  50% { d: path("M0,60 C360,0 1080,100 1440,60 L1440,120 L0,120 Z"); }
}
@keyframes waveMove2 {
  0%, 100% { d: path("M0,55 C320,10 1120,100 1440,55 L1440,120 L0,120 Z"); }
  50% { d: path("M0,40 C320,100 1120,10 1440,40 L1440,120 L0,120 Z"); }
}
@keyframes waveMove3 {
  0%, 100% { d: path("M0,70 C480,120 960,20 1440,70 L1440,120 L0,120 Z"); }
  50% { d: path("M0,55 C480,10 960,110 1440,55 L1440,120 L0,120 Z"); }
}
.wave-bottom-section {
  width: 100%;
  padding: 16px 24px 32px;
  background: var(--vp-c-bg);
  text-align: center;
}
.wave-bottom-section h4 {
  margin: 0 0 4px;
  font-size: 16px;
  color: var(--vp-c-text-1);
}
.wave-bottom-section p {
  margin: 0;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

/* ===== 11. Aurora Background ===== */
.aurora-demo-wrapper {
  padding: 0;
}
.aurora-demo {
  width: 100%;
  min-height: 320px;
  background: #0a0a1a;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.aurora-blob {
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: screen;
  filter: blur(80px);
  opacity: 0.7;
}
.aurora-blob-1 {
  width: 280px;
  height: 280px;
  background: #4ade80;
  top: -40px;
  left: 10%;
  animation: auroraMove1 10s ease-in-out infinite;
}
.aurora-blob-2 {
  width: 240px;
  height: 240px;
  background: #2dd4bf;
  top: 20%;
  right: 15%;
  animation: auroraMove2 13s ease-in-out infinite;
}
.aurora-blob-3 {
  width: 260px;
  height: 260px;
  background: #a78bfa;
  bottom: -30px;
  left: 30%;
  animation: auroraMove3 11s ease-in-out infinite;
}
.aurora-blob-4 {
  width: 220px;
  height: 220px;
  background: #60a5fa;
  top: 10%;
  left: 50%;
  animation: auroraMove4 9s ease-in-out infinite;
}
.aurora-blob-5 {
  width: 200px;
  height: 200px;
  background: #f472b6;
  bottom: 10%;
  right: 10%;
  animation: auroraMove5 15s ease-in-out infinite;
}
@keyframes auroraMove1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(60px, 40px) scale(1.1); }
  66% { transform: translate(-30px, 20px) scale(0.95); }
}
@keyframes auroraMove2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-50px, 30px) scale(1.05); }
  66% { transform: translate(40px, -40px) scale(0.9); }
}
@keyframes auroraMove3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -50px) scale(1.15); }
  66% { transform: translate(-60px, 20px) scale(0.95); }
}
@keyframes auroraMove4 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-70px, 50px) scale(1.1); }
}
@keyframes auroraMove5 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -40px) scale(1.05); }
  50% { transform: translate(-40px, -20px) scale(0.9); }
  75% { transform: translate(50px, 30px) scale(1.1); }
}
.aurora-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #fff;
  padding: 24px;
}
.aurora-content h2 {
  margin: 0 0 12px;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 1px;
}
.aurora-content p {
  margin: 0 0 20px;
  font-size: 14px;
  opacity: 0.8;
}
.aurora-cta {
  padding: 10px 28px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}
.aurora-cta:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

/* ===== 12. Animated Gradient Background ===== */
.gradient-bg-demo-outer {
  padding: 0;
  min-height: 320px;
}
.gradient-bg-demo {
  position: relative;
  width: 100%;
  min-height: 320px;
  background: linear-gradient(-45deg, #43a047, #00897b, #7c4dff, #ff7043, #00bcd4);
  background-size: 300% 300%;
  animation: gradientFlow 12s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  25% { background-position: 50% 0%; }
  50% { background-position: 100% 50%; }
  75% { background-position: 50% 100%; }
  100% { background-position: 0% 50%; }
}
.gradient-bg-noise {
  position: absolute;
  inset: 0;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
  pointer-events: none;
  z-index: 1;
}
.gradient-bg-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 40px 24px;
}
.gradient-bg-title {
  margin: 0 0 12px;
  font-size: 36px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  line-height: 1.2;
}
.gradient-bg-subtitle {
  margin: 0 0 28px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.5;
}
.gradient-bg-cta {
  padding: 14px 36px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  transition: all 0.25s;
}
.gradient-bg-cta:hover {
  background: rgba(255, 255, 255, 0.32);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* ===== 13. Video Text Mask ===== */
.video-mask-demo-outer {
  background: #0e1117;
}
.video-mask-demo {
  text-align: center;
  padding: 40px 20px;
}
.video-mask-text {
  font-size: 96px;
  font-weight: 900;
  letter-spacing: 12px;
  line-height: 1;
  background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #ff6b6b);
  background-size: 300% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: videoMaskFlow 4s linear infinite;
}
.video-mask-sub {
  margin-top: 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 4px;
}
@keyframes videoMaskFlow {
  0% { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
}

/* ===== 14. Dark Mode Seamless Toggle ===== */
.darkmode-demo-outer {
  padding: 0;
}
.darkmode-demo {
  width: 100%;
  min-height: 280px;
  position: relative;
  overflow: hidden;
  border-radius: 0;
}
.darkmode-page {
  width: 100%;
  min-height: 280px;
  padding: 0;
  transition: background 0s, color 0s;
}
.darkmode-demo .darkmode-page {
  background: #f8f9fa;
  color: #1a1a2e;
}
.darkmode-demo.darkmode-dark .darkmode-page {
  background: #1a1a2e;
  color: #e8e8e8;
}
.darkmode-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
}
.darkmode-logo {
  font-weight: 700;
  font-size: 16px;
}
.darkmode-toggle-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(128, 128, 128, 0.2);
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}
.darkmode-toggle-btn:hover {
  transform: scale(1.1);
}
.darkmode-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.darkmode-card {
  padding: 16px;
  border-radius: 10px;
  border: 1px solid rgba(128, 128, 128, 0.15);
}
.darkmode-demo .darkmode-card {
  background: #fff;
}
.darkmode-demo.darkmode-dark .darkmode-card {
  background: #252540;
}
.darkmode-card-title {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 6px;
}
.darkmode-card-text {
  font-size: 13px;
  opacity: 0.7;
}
.darkmode-overlay {
  position: absolute;
  inset: 0;
  transition: clip-path 0.5s ease-in-out;
  pointer-events: none;
  z-index: 10;
  background: #1a1a2e;
}
.darkmode-overlay-dark {
  background: #f8f9fa;
}

/* ===== 15. Dynamic Noise Overlay ===== */
.noise-demo-outer {
  padding: 0;
}
.noise-demo {
  width: 100%;
  min-height: 260px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.noise-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%);
}
.noise-svg {
  position: absolute;
}
.noise-grain {
  position: absolute;
  inset: -50%;
  width: 200%;
  height: 200%;
  filter: url(#noise-filter);
  opacity: 0.12;
  pointer-events: none;
  z-index: 1;
}
.noise-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #fff;
}
.noise-title {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: 8px;
  opacity: 0.9;
}
.noise-subtitle {
  margin-top: 8px;
  font-size: 14px;
  opacity: 0.5;
  letter-spacing: 4px;
}

/* ===== 16. Fluid Distortion ===== */
.fluid-demo-outer {
  padding: 0;
}
.fluid-demo {
  width: 100%;
  min-height: 280px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}
.fluid-svg {
  position: absolute;
}
.fluid-content {
  width: 100%;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fluid-image {
  width: 100%;
  min-height: 280px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.fluid-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}
.fluid-text {
  position: relative;
  z-index: 1;
  font-size: 64px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 12px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
}
.fluid-sub {
  position: relative;
  z-index: 1;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8px;
}

/* ===== 17. Blend Mode Invert ===== */
.blend-demo-outer {
  padding: 0;
}
.blend-demo {
  width: 100%;
  min-height: 260px;
  position: relative;
  overflow: hidden;
  cursor: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.blend-content {
  display: contents;
}
.blend-block {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 800;
  min-height: 130px;
}
.blend-block-1 { background: #e53935; color: #fff; }
.blend-block-2 { background: #43a047; color: #fff; }
.blend-block-3 { background: #1e88e5; color: #fff; }
.blend-block-4 { background: #f59e0b; color: #fff; }
.blend-cursor {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #fff;
  mix-blend-mode: difference;
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: left 0.05s linear, top 0.05s linear;
  z-index: 10;
}

/* ===== 18. Dynamic Color Palette ===== */
.palette-demo-outer {
  flex-direction: column;
}
.palette-demo {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.palette-canvas {
  width: 100%;
  max-width: 400px;
  height: 120px;
  border-radius: 10px;
  display: block;
}
.palette-swatches {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}
.palette-swatch {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
  position: relative;
  overflow: hidden;
}
.palette-swatch:hover {
  transform: scale(1.1);
}
.palette-swatch-label {
  font-size: 8px;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  font-family: var(--vp-font-family-mono);
  white-space: nowrap;
}
.palette-controls {
  display: flex;
  gap: 8px;
}
.palette-btn {
  padding: 8px 20px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.palette-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

/* ===== Responsive ===== */
@media (max-width: 640px) {
  .gradient-border-demo {
    flex-direction: column;
    align-items: center;
  }
  .gb-card {
    max-width: 100%;
  }
  .glow-demo {
    flex-direction: column;
    align-items: center;
  }
  .neon-line {
    font-size: 28px;
    letter-spacing: 3px;
  }
  .neon-sub {
    font-size: 14px;
  }
  .grad-text-hero {
    font-size: 28px;
  }
  .grad-text-sub {
    font-size: 20px;
  }
  .frost-links {
    display: none;
  }
  .gradient-bg-title {
    font-size: 26px;
  }
  .gradient-bg-subtitle {
    font-size: 13px;
  }
  .video-mask-text {
    font-size: 48px;
    letter-spacing: 6px;
  }
  .noise-title {
    font-size: 28px;
    letter-spacing: 4px;
  }
  .fluid-text {
    font-size: 36px;
    letter-spacing: 6px;
  }
  .blend-block {
    font-size: 20px;
    min-height: 100px;
  }
  .blend-cursor {
    width: 60px;
    height: 60px;
  }
  .palette-swatch {
    width: 48px;
    height: 48px;
  }
  .palette-swatch-label {
    font-size: 6px;
  }
}
</style>
