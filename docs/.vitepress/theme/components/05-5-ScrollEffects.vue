<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, type Ref } from 'vue'

interface ScrollEffect {
  id: string
  name: string
  nameEn: string
  difficulty: '低' | '中' | '高'
  lib: string
  scene: string
  prompt: string
}

const effects: ScrollEffect[] = [
  {
    id: 'parallax', name: '视差滚动', nameEn: 'Parallax Scrolling',
    difficulty: '中', lib: 'GSAP', scene: '产品首页、营销页',
    prompt: '给首页 Hero 区域加视差滚动效果，背景图片滚动速度是内容的 0.5 倍，用 GSAP ScrollTrigger 实现'
  },
  {
    id: 'scroll-trigger', name: '滚动触发动画', nameEn: 'Scroll-triggered Animation',
    difficulty: '低', lib: 'Motion', scene: '任何长页面',
    prompt: '让每个功能卡片在滚动到视口时从下方淡入，用 Motion 的 whileInView，每个卡片延迟 0.1 秒'
  },
  {
    id: 'progress', name: '滚动进度条', nameEn: 'Scroll Progress Bar',
    difficulty: '低', lib: '纯 JS', scene: '长文章页面',
    prompt: '在页面顶部加一个滚动进度条，用主题色，宽度随滚动进度变化'
  },
  {
    id: 'marquee', name: '无限滚动', nameEn: 'Infinite Marquee',
    difficulty: '低', lib: '纯 CSS', scene: '品牌展示、合作伙伴',
    prompt: '做一个无限滚动的品牌 Logo 展示条，从右向左匀速滚动，无缝循环'
  },
  {
    id: 'scroll-pin', name: '滚动固定动画', nameEn: 'Scroll Pin + Animate',
    difficulty: '中', lib: 'GSAP ScrollTrigger', scene: '产品介绍、长页面叙事',
    prompt: '用 GSAP ScrollTrigger 的 pin 功能，让某个区域在滚动时固定住，内容在里面依次切换，实现沉浸式叙事效果'
  },
  {
    id: 'horizontal-scroll', name: '横向滚动', nameEn: 'Horizontal Scroll Section',
    difficulty: '中', lib: 'CSS / GSAP', scene: '作品集、产品展示',
    prompt: '做一个横向滚动展示区，用户垂直滚动时内容横向移动，用 CSS sticky + overflow 或 GSAP ScrollTrigger 实现'
  },
  {
    id: 'inertia-scroll', name: '惯性平滑滚动', nameEn: 'Inertia Smooth Scroll',
    difficulty: '高', lib: '纯 JS', scene: '自定义滚动体验',
    prompt: '做一个惯性平滑滚动效果，自定义拖拽滚动区域，追踪拖拽速度，松手后用 requestAnimationFrame 实现减速惯性滑动'
  },
  {
    id: 'infinite-zoom', name: '画布无限缩放', nameEn: 'Canvas Infinite Zoom',
    difficulty: '高', lib: 'JS+CSS', scene: '创意展示、艺术项目',
    prompt: '做一个画布无限缩放效果，多层嵌套框架在滚动时逐层放大，外层淡出揭示内层，产生无限缩放的视觉错觉'
  },
  {
    id: 'card-stack', name: '卡片堆叠滚动', nameEn: 'Card Stack Scroll',
    difficulty: '中', lib: 'CSS+JS', scene: '产品特性、时间线',
    prompt: '做一个卡片堆叠滚动效果，多张卡片用 sticky 定位堆叠，滚动时新卡片从下方滑入覆盖旧卡片，旧卡片缩小变暗'
  },
  {
    id: 'depth-parallax', name: '景深视差模糊', nameEn: 'Depth-of-field Parallax',
    difficulty: '高', lib: 'JS+CSS', scene: '摄影展示、沉浸式体验',
    prompt: '做一个景深视差模糊效果，多层元素以不同速度移动，非焦点层动态添加 filter: blur()，模拟相机景深效果'
  }
]

const copiedId = ref<string | null>(null)
const difficultyColor = (d: string) => d === '低' ? '#43a047' : d === '中' ? '#f59e0b' : '#e53935'

function copyPrompt(effect: ScrollEffect) {
  navigator.clipboard.writeText(effect.prompt)
  copiedId.value = effect.id
  setTimeout(() => { copiedId.value = null }, 1500)
}

/* --- Parallax demo --- */
const parallaxScrollEl = ref<HTMLElement | null>(null)
const parallaxY = ref(0)

function handleParallaxScroll(e: Event) {
  const el = e.target as HTMLElement
  const scrollTop = el.scrollTop
  const scrollHeight = el.scrollHeight - el.clientHeight
  if (scrollHeight <= 0) return
  parallaxY.value = (scrollTop / scrollHeight) * 300
}
/* --- Scroll-trigger demo --- */
const triggerCards = [
  { icon: '🚀', title: '极速部署', desc: '一键部署到全球 CDN 节点' },
  { icon: '🔒', title: '安全可靠', desc: '企业级安全防护体系' },
  { icon: '📊', title: '数据分析', desc: '实时监控与智能报表' },
  { icon: '🎨', title: '自由定制', desc: '灵活的主题与组件系统' },
  { icon: '⚡', title: '高性能', desc: '毫秒级响应，丝滑体验' },
  { icon: '🌐', title: '全球化', desc: '多语言与多地域支持' },
  { icon: '🔧', title: '易维护', desc: '模块化架构，清晰可扩展' },
  { icon: '🤖', title: 'AI 驱动', desc: '智能推荐与自动化工作流' },
]
const triggerVisible = ref<boolean[]>(new Array(8).fill(false))
let triggerTimer: ReturnType<typeof setTimeout> | null = null

function playTriggerAnimation() {
  triggerVisible.value = new Array(triggerCards.length).fill(false)
  triggerCards.forEach((_, i) => {
    setTimeout(() => {
      triggerVisible.value = triggerVisible.value.map((v, j) => j <= i ? true : v)
    }, 300 + i * 150)
  })
}

function replayTrigger() {
  triggerVisible.value = new Array(triggerCards.length).fill(false)
  if (triggerTimer) clearTimeout(triggerTimer)
  triggerTimer = setTimeout(() => playTriggerAnimation(), 100)
}

/* --- Visibility observers for lazy loading --- */
const triggerDemoRef = ref<HTMLElement | null>(null)
const progressDemoRef = ref<HTMLElement | null>(null)
const pinDemoRef = ref<HTMLElement | null>(null)

let observers: IntersectionObserver[] = []
let triggerAutoInterval: ReturnType<typeof setInterval> | null = null
let progressAutoInterval: ReturnType<typeof setInterval> | null = null
let progressPhaseTimer: ReturnType<typeof setTimeout> | null = null
let pinAutoInterval: ReturnType<typeof setInterval> | null = null

function createVisibilityObserver(
  elementRef: Ref<HTMLElement | null>,
  onVisible: () => void,
  onHidden: () => void
): IntersectionObserver {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) onVisible()
        else onHidden()
      })
    },
    { threshold: 0.3 }
  )
  if (elementRef.value) observer.observe(elementRef.value)
  return observer
}
/* --- Auto-replay: scroll-trigger --- */
function startTriggerAutoReplay() {
  if (triggerAutoInterval) return
  playTriggerAnimation()
  triggerAutoInterval = setInterval(() => replayTrigger(), 5000)
}
function stopTriggerAutoReplay() {
  if (triggerAutoInterval) { clearInterval(triggerAutoInterval); triggerAutoInterval = null }
}

/* --- Auto-replay: progress bar --- */
function runProgressCycle() {
  const el = progressScrollEl.value
  if (!el) return
  const maxScroll = el.scrollHeight - el.clientHeight
  if (maxScroll <= 0) return
  el.scrollTo({ top: maxScroll, behavior: 'smooth' })
  progressPhaseTimer = setTimeout(() => {
    el.scrollTo({ top: 0, behavior: 'smooth' })
  }, 3000)
}
function startProgressAutoReplay() {
  if (progressAutoInterval) return
  // 延迟 1s 再开始，让用户先看到初始状态
  progressPhaseTimer = setTimeout(() => {
    runProgressCycle()
    progressAutoInterval = setInterval(() => runProgressCycle(), 6000)
  }, 1000)
}
function stopProgressAutoReplay() {
  if (progressAutoInterval) { clearInterval(progressAutoInterval); progressAutoInterval = null }
  if (progressPhaseTimer) { clearTimeout(progressPhaseTimer); progressPhaseTimer = null }
}

/* --- Auto-replay: scroll pin --- */
let pinCycleStep = 0
function runPinCycle() {
  const el = pinScrollEl.value
  if (!el) return
  const maxScroll = el.scrollHeight - el.clientHeight
  if (maxScroll <= 0) return
  pinCycleStep = (pinCycleStep + 1) % (pinSteps.length + 1)
  const targetScroll = pinCycleStep === 0 ? 0 : (pinCycleStep / pinSteps.length) * maxScroll
  el.scrollTo({ top: targetScroll, behavior: 'smooth' })
}
function startPinAutoReplay() {
  if (pinAutoInterval) return
  pinCycleStep = 0
  // 延迟 1s 再开始
  setTimeout(() => {
    if (!pinAutoInterval) {
      pinAutoInterval = setInterval(() => runPinCycle(), 3000)
    }
  }, 1000)
}
function stopPinAutoReplay() {
  if (pinAutoInterval) { clearInterval(pinAutoInterval); pinAutoInterval = null }
  pinCycleStep = 0
}
/* --- Progress bar demo --- */
const progressScrollEl = ref<HTMLElement | null>(null)
const progressValue = ref(0)

function handleProgressScroll(e: Event) {
  const el = e.target as HTMLElement
  const scrollTop = el.scrollTop
  const scrollHeight = el.scrollHeight - el.clientHeight
  progressValue.value = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
}

/* --- Marquee brands --- */
const brands = [
  { emoji: '🍎', name: 'FruitOS' },
  { emoji: '🔷', name: 'DiamondDB' },
  { emoji: '🌊', name: 'WaveCloud' },
  { emoji: '⚡', name: 'FlashAPI' },
  { emoji: '🎯', name: 'TargetAI' },
  { emoji: '🔮', name: 'CrystalUI' },
  { emoji: '🛡️', name: 'ShieldAuth' },
  { emoji: '🌿', name: 'GreenStack' }
]

/* --- Scroll-pin demo --- */
const pinSteps = [
  { num: '01', title: '发现问题', desc: '用户调研揭示了核心痛点，数据驱动决策方向', color: '#6366f1' },
  { num: '02', title: '设计方案', desc: '从原型到高保真，每一步都经过反复验证与迭代', color: '#8b5cf6' },
  { num: '03', title: '构建产品', desc: '敏捷开发，持续集成，快速交付可用版本', color: '#a78bfa' },
  { num: '04', title: '持续优化', desc: '上线只是开始，数据反馈驱动产品不断进化', color: '#c4b5fd' }
]
const pinScrollEl = ref<HTMLElement | null>(null)
const pinActiveIndex = ref(0)

/* --- Horizontal scroll demo --- */
const hScrollProjects = [
  { title: 'Aurora Dashboard', desc: '数据可视化管理后台', tag: 'Web App', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { title: 'Breeze Commerce', desc: '轻量级电商解决方案', tag: 'E-Commerce', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { title: 'Coral Design', desc: '组件库与设计系统', tag: 'Design System', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { title: 'Drift Analytics', desc: '实时用户行为分析', tag: 'SaaS', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { title: 'Echo Social', desc: '社交媒体聚合平台', tag: 'Social', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
  { title: 'Flux Editor', desc: '在线协作文档编辑器', tag: 'Productivity', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' }
]
const hScrollEl = ref<HTMLElement | null>(null)
const hScrollOffset = ref(0)
function handleHScroll(e: Event) {
  const el = e.target as HTMLElement
  const scrollTop = el.scrollTop
  const scrollHeight = el.scrollHeight - el.clientHeight
  if (scrollHeight <= 0) return
  const ratio = scrollTop / scrollHeight
  const cardWidth = 220
  const gap = 16
  const totalWidth = hScrollProjects.length * (cardWidth + gap) - gap
  const viewportWidth = hScrollEl.value?.querySelector('.hscroll-viewport')?.clientWidth ?? 500
  const maxOffset = Math.max(0, totalWidth - viewportWidth)
  hScrollOffset.value = ratio * maxOffset
}

/* --- Effect 7: Inertia Smooth Scroll --- */
const inertiaDemoRef = ref<HTMLElement | null>(null)
const inertiaContainerRef = ref<HTMLElement | null>(null)
const inertiaItems = Array.from({ length: 20 }, (_, i) => ({
  label: `Item ${i + 1}`,
  color: `hsl(${i * 18}, 65%, 55%)`
}))
let inertiaDragging = false
let inertiaStartY = 0
let inertiaScrollStart = 0
let inertiaVelocity = 0
let inertiaLastY = 0
let inertiaLastTime = 0
let inertiaRafId: number | null = null

function inertiaPointerDown(e: PointerEvent) {
  const el = inertiaContainerRef.value
  if (!el) return
  inertiaDragging = true
  inertiaStartY = e.clientY
  inertiaScrollStart = el.scrollTop
  inertiaVelocity = 0
  inertiaLastY = e.clientY
  inertiaLastTime = performance.now()
  if (inertiaRafId !== null) { cancelAnimationFrame(inertiaRafId); inertiaRafId = null }
  el.setPointerCapture(e.pointerId)
  el.style.cursor = 'grabbing'
}

function inertiaPointerMove(e: PointerEvent) {
  if (!inertiaDragging) return
  const el = inertiaContainerRef.value
  if (!el) return
  const now = performance.now()
  const dy = e.clientY - inertiaStartY
  el.scrollTop = inertiaScrollStart - dy
  const dt = now - inertiaLastTime
  if (dt > 0) {
    inertiaVelocity = (inertiaLastY - e.clientY) / dt * 16
  }
  inertiaLastY = e.clientY
  inertiaLastTime = now
}

function inertiaPointerUp(e: PointerEvent) {
  if (!inertiaDragging) return
  inertiaDragging = false
  const el = inertiaContainerRef.value
  if (!el) return
  el.style.cursor = 'grab'
  el.releasePointerCapture(e.pointerId)
  // Start inertia animation
  const friction = 0.95
  function inertiaStep() {
    if (Math.abs(inertiaVelocity) < 0.5) { inertiaRafId = null; return }
    el!.scrollTop += inertiaVelocity
    inertiaVelocity *= friction
    inertiaRafId = requestAnimationFrame(inertiaStep)
  }
  inertiaRafId = requestAnimationFrame(inertiaStep)
}

/* --- Effect 8: Canvas Infinite Zoom --- */
const zoomDemoRef = ref<HTMLElement | null>(null)
const zoomScrollEl = ref<HTMLElement | null>(null)
const zoomLayers = [
  { color: '#a78bfa', bg: 'rgba(167,139,250,0.06)', label: '宇宙' },
  { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', label: '星系' },
  { color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', label: '星球' },
  { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: '大陆' },
  { color: '#f59e0b', bg: 'rgba(245,158,11,0.14)', label: '城市' }
]
const zoomScales = ref<number[]>(zoomLayers.map(() => 1))
const zoomOpacities = ref<number[]>(zoomLayers.map(() => 1))
const zoomLabelOpacities = ref<number[]>(zoomLayers.map((_, i) => i === 0 ? 1 : 0.35))

function handleZoomScroll(e: Event) {
  const el = e.target as HTMLElement
  const scrollTop = el.scrollTop
  const scrollHeight = el.scrollHeight - el.clientHeight
  if (scrollHeight <= 0) return
  const ratio = scrollTop / scrollHeight
  const totalProgress = ratio * zoomLayers.length
  const newScales: number[] = []
  const newOpacities: number[] = []
  const newLabelOpacities: number[] = []
  for (let i = 0; i < zoomLayers.length; i++) {
    const layerProgress = Math.max(0, totalProgress - i)
    const scale = 1 + layerProgress * 3
    const opacity = layerProgress > 0.7 ? Math.max(0, 1 - (layerProgress - 0.7) * 3.3) : 1
    newScales.push(scale)
    newOpacities.push(i === zoomLayers.length - 1 ? 1 : opacity)
    // Label: visible for the current active layer, fades as it scales away
    const isActive = layerProgress > 0.01 && layerProgress < 1.0
    const isWaiting = layerProgress <= 0.01 && (i === 0 || Math.max(0, totalProgress - (i - 1)) >= 0.5)
    const labelFade = layerProgress > 0.6 ? Math.max(0, 1 - (layerProgress - 0.6) * 2.5) : 1
    newLabelOpacities.push((isActive || isWaiting) ? labelFade : 0)
  }
  zoomScales.value = newScales
  zoomOpacities.value = newOpacities
  zoomLabelOpacities.value = newLabelOpacities
}

let zoomAutoInterval: ReturnType<typeof setInterval> | null = null
let zoomPhaseTimer: ReturnType<typeof setTimeout> | null = null

function runZoomCycle() {
  const el = zoomScrollEl.value
  if (!el) return
  const maxScroll = el.scrollHeight - el.clientHeight
  if (maxScroll <= 0) return
  el.scrollTo({ top: maxScroll, behavior: 'smooth' })
  zoomPhaseTimer = setTimeout(() => {
    el.scrollTo({ top: 0, behavior: 'smooth' })
  }, 4000)
}
function startZoomAutoReplay() {
  if (zoomAutoInterval) return
  zoomPhaseTimer = setTimeout(() => {
    runZoomCycle()
    zoomAutoInterval = setInterval(() => runZoomCycle(), 9000)
  }, 1000)
}
function stopZoomAutoReplay() {
  if (zoomAutoInterval) { clearInterval(zoomAutoInterval); zoomAutoInterval = null }
  if (zoomPhaseTimer) { clearTimeout(zoomPhaseTimer); zoomPhaseTimer = null }
}

/* --- Effect 9: Card Stack Scroll --- */
const cardstackDemoRef = ref<HTMLElement | null>(null)
const cardstackScrollEl = ref<HTMLElement | null>(null)
const cardstackCards = [
  { title: '洞察', desc: '在混沌中发现秩序', icon: '◈', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  { title: '构思', desc: '让灵感凝聚为蓝图', icon: '◇', gradient: 'linear-gradient(135deg, #0d2137, #1a3a4a)' },
  { title: '锻造', desc: '精雕细琢每一个细节', icon: '⬡', gradient: 'linear-gradient(135deg, #1c1c1c, #2d2d3d)' },
  { title: '绽放', desc: '作品自会说话', icon: '✦', gradient: 'linear-gradient(135deg, #2d1b2e, #3d1f3e)' }
]
const cardstackProgress = ref(0)

function handleCardstackScroll(e: Event) {
  const el = e.target as HTMLElement
  const scrollTop = el.scrollTop
  const scrollHeight = el.scrollHeight - el.clientHeight
  if (scrollHeight <= 0) return
  cardstackProgress.value = scrollTop / scrollHeight
}

function getCardstackStyle(index: number) {
  const total = cardstackCards.length
  const segmentSize = 1 / total
  const progress = cardstackProgress.value
  const cardStart = index * segmentSize
  const localProgress = Math.max(0, Math.min(1, (progress - cardStart) / segmentSize))
  // Current card slides up from bottom, previous cards shrink and darken
  if (progress < cardStart) {
    // Card hasn't appeared yet
    return { transform: 'translateY(100%)', opacity: 0, zIndex: index }
  }
  const scale = index < total - 1 ? 1 - Math.max(0, (progress - (index + 1) * segmentSize) / segmentSize) * 0.08 : 1
  const brightness = index < total - 1 ? 1 - Math.max(0, (progress - (index + 1) * segmentSize) / segmentSize) * 0.3 : 1
  const translateY = (1 - localProgress) * 100
  return {
    transform: `translateY(${progress > cardStart + segmentSize ? 0 : translateY}%) scale(${Math.max(0.85, scale)})`,
    opacity: 1,
    zIndex: index,
    filter: `brightness(${Math.max(0.6, brightness)})`
  }
}

let cardstackAutoInterval: ReturnType<typeof setInterval> | null = null
let cardstackPhaseTimer: ReturnType<typeof setTimeout> | null = null

function runCardstackCycle() {
  const el = cardstackScrollEl.value
  if (!el) return
  const maxScroll = el.scrollHeight - el.clientHeight
  if (maxScroll <= 0) return
  el.scrollTo({ top: maxScroll, behavior: 'smooth' })
  cardstackPhaseTimer = setTimeout(() => {
    el.scrollTo({ top: 0, behavior: 'smooth' })
  }, 3500)
}
function startCardstackAutoReplay() {
  if (cardstackAutoInterval) return
  cardstackPhaseTimer = setTimeout(() => {
    runCardstackCycle()
    cardstackAutoInterval = setInterval(() => runCardstackCycle(), 8000)
  }, 1000)
}
function stopCardstackAutoReplay() {
  if (cardstackAutoInterval) { clearInterval(cardstackAutoInterval); cardstackAutoInterval = null }
  if (cardstackPhaseTimer) { clearTimeout(cardstackPhaseTimer); cardstackPhaseTimer = null }
}

/* --- Effect 10: Depth-of-field Parallax --- */
const depthDemoRef = ref<HTMLElement | null>(null)
const depthScrollEl = ref<HTMLElement | null>(null)
const depthProgress = ref(0)
const depthFocalLayer = ref(1) // 0=bg, 1=mid, 2=fg

function handleDepthScroll(e: Event) {
  const el = e.target as HTMLElement
  const scrollTop = el.scrollTop
  const scrollHeight = el.scrollHeight - el.clientHeight
  if (scrollHeight <= 0) return
  const ratio = scrollTop / scrollHeight
  depthProgress.value = ratio
  // Shift focal layer based on scroll position
  if (ratio < 0.33) depthFocalLayer.value = 0
  else if (ratio < 0.66) depthFocalLayer.value = 1
  else depthFocalLayer.value = 2
}

function getDepthLayerStyle(layerIndex: number) {
  const speeds = [0.1, 0.5, 1.2]
  const range = 350
  const offset = depthProgress.value * range * speeds[layerIndex]
  const isFocal = depthFocalLayer.value === layerIndex
  const blurAmount = isFocal ? 0 : 3 + Math.abs(depthFocalLayer.value - layerIndex) * 2
  return {
    transform: `translateY(${-offset}px)`,
    filter: `blur(${blurAmount}px)`,
    opacity: isFocal ? 1 : 0.85
  }
}

let depthAutoInterval: ReturnType<typeof setInterval> | null = null
let depthPhaseTimer: ReturnType<typeof setTimeout> | null = null

function runDepthCycle() {
  const el = depthScrollEl.value
  if (!el) return
  const maxScroll = el.scrollHeight - el.clientHeight
  if (maxScroll <= 0) return
  el.scrollTo({ top: maxScroll, behavior: 'smooth' })
  depthPhaseTimer = setTimeout(() => {
    el.scrollTo({ top: 0, behavior: 'smooth' })
  }, 4000)
}
function startDepthAutoReplay() {
  if (depthAutoInterval) return
  depthPhaseTimer = setTimeout(() => {
    runDepthCycle()
    depthAutoInterval = setInterval(() => runDepthCycle(), 9000)
  }, 1000)
}
function stopDepthAutoReplay() {
  if (depthAutoInterval) { clearInterval(depthAutoInterval); depthAutoInterval = null }
  if (depthPhaseTimer) { clearTimeout(depthPhaseTimer); depthPhaseTimer = null }
}

function handlePinScroll(e: Event) {
  const el = e.target as HTMLElement
  const scrollTop = el.scrollTop
  const scrollHeight = el.scrollHeight - el.clientHeight
  if (scrollHeight <= 0) return
  const ratio = scrollTop / scrollHeight
  const idx = Math.min(Math.floor(ratio * pinSteps.length), pinSteps.length - 1)
  pinActiveIndex.value = idx
}

onMounted(() => {
  // 延迟 800ms 再启动 observer，避免和首次渲染冲突
  setTimeout(() => {
    if (triggerDemoRef.value) {
      observers.push(createVisibilityObserver(
        triggerDemoRef,
        () => startTriggerAutoReplay(),
        () => stopTriggerAutoReplay()
      ))
    }
    if (progressDemoRef.value) {
      observers.push(createVisibilityObserver(
        progressDemoRef,
        () => startProgressAutoReplay(),
        () => stopProgressAutoReplay()
      ))
    }
    if (pinDemoRef.value) {
      observers.push(createVisibilityObserver(
        pinDemoRef,
        () => startPinAutoReplay(),
        () => stopPinAutoReplay()
      ))
    }
    if (zoomDemoRef.value) {
      observers.push(createVisibilityObserver(
        zoomDemoRef,
        () => startZoomAutoReplay(),
        () => stopZoomAutoReplay()
      ))
    }
    if (cardstackDemoRef.value) {
      observers.push(createVisibilityObserver(
        cardstackDemoRef,
        () => startCardstackAutoReplay(),
        () => stopCardstackAutoReplay()
      ))
    }
    if (depthDemoRef.value) {
      observers.push(createVisibilityObserver(
        depthDemoRef,
        () => startDepthAutoReplay(),
        () => stopDepthAutoReplay()
      ))
    }
  }, 800)
})

onUnmounted(() => {
  if (triggerTimer) clearTimeout(triggerTimer)
  stopTriggerAutoReplay()
  stopProgressAutoReplay()
  stopPinAutoReplay()
  stopZoomAutoReplay()
  stopCardstackAutoReplay()
  stopDepthAutoReplay()
  if (inertiaRafId !== null) cancelAnimationFrame(inertiaRafId)
  observers.forEach(obs => obs.disconnect())
  observers = []
})
</script>

<template>
  <div class="se-root">
    <!-- Effect 1: Parallax -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>视差滚动</h3>
          <span class="effect-name-en">Parallax Scrolling</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" :style="{ color: difficultyColor('中'), borderColor: difficultyColor('中') }">中</span>
          <span class="tag-lib">GSAP</span>
          <span class="tag-scene">产品首页、营销页</span>
        </div>
      </div>
      <div class="effect-demo parallax-demo">
        <div class="parallax-wrapper">
          <div class="parallax-modes">
            <div class="parallax-mode">
              <div class="parallax-mode-label">经典视差</div>
              <div class="parallax-scene parallax-scene--classic">
                <div class="parallax-layer parallax-sky"
                  :style="{ transform: `translateY(${parallaxY * 0.1}px)` }">
                  <div class="sky-sun"></div>
                  <div class="sky-cloud cloud-1"></div>
                  <div class="sky-cloud cloud-2"></div>
                  <div class="sky-cloud cloud-3"></div>
                </div>
                <div class="parallax-layer parallax-mountains-back"
                  :style="{ transform: `translateY(${parallaxY * 0.25}px)` }">
                </div>
                <div class="parallax-layer parallax-mountains-front"
                  :style="{ transform: `translateY(${parallaxY * 0.4}px)` }">
                </div>
                <div class="parallax-layer parallax-trees"
                  :style="{ transform: `translateY(${parallaxY * 0.6}px)` }">
                </div>
                <div class="parallax-layer parallax-fg"
                  :style="{ transform: `translateY(${parallaxY * 0.85}px)` }">
                  <div class="parallax-text-box">
                    <span class="parallax-headline">Parallax</span>
                    <span class="parallax-sub">每层速度不同，产生深度感</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="parallax-mode">
              <div class="parallax-mode-label">固定背景</div>
              <div class="parallax-scene parallax-scene--fixed">
                <div class="parallax-layer parallax-sky"
                  :style="{ transform: 'translateY(0)' }">
                  <div class="sky-sun"></div>
                  <div class="sky-cloud cloud-1"></div>
                  <div class="sky-cloud cloud-2"></div>
                  <div class="sky-cloud cloud-3"></div>
                </div>
                <div class="parallax-layer parallax-mountains-back"
                  :style="{ transform: 'translateY(0)' }">
                </div>
                <div class="parallax-layer parallax-mountains-front"
                  :style="{ transform: 'translateY(0)' }">
                </div>
                <div class="parallax-layer parallax-trees"
                  :style="{ transform: 'translateY(0)' }">
                </div>
                <div class="parallax-layer parallax-fg"
                  :style="{ transform: `translateY(${parallaxY * 1.2}px)` }">
                  <div class="parallax-text-box">
                    <span class="parallax-headline">Fixed</span>
                    <span class="parallax-sub">背景固定，内容滑过</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="parallax-scroll-driver" ref="parallaxScrollEl" @scroll="handleParallaxScroll">
            <div class="parallax-scroll-spacer"></div>
          </div>
          <div class="parallax-hint">↕ 滚动查看视差效果</div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span class="prompt-label">📋 AI 提示词</span>
          <button class="prompt-copy" @click="copyPrompt(effects[0])">
            {{ copiedId === 'parallax' ? '已复制 ✓' : '复制' }}
          </button>
        </div>
        <div class="prompt-text">{{ effects[0].prompt }}</div>
      </div>
    </div>

    <!-- Effect 2: Scroll-triggered Animation -->
    <div class="effect-block" ref="triggerDemoRef">
      <div class="effect-header">
        <div class="effect-title">
          <h3>滚动触发动画</h3>
          <span class="effect-name-en">Scroll-triggered Animation</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" :style="{ color: difficultyColor('低'), borderColor: difficultyColor('低') }">低</span>
          <span class="tag-lib">Motion</span>
          <span class="tag-scene">任何长页面</span>
        </div>
      </div>
      <div class="effect-demo trigger-demo">
        <button class="replay-btn" @click="replayTrigger">↻ 重播动画</button>
        <div class="trigger-cards-grid">
          <div v-for="(card, i) in triggerCards" :key="i"
            :class="['trigger-card', { 'trigger-card-visible': triggerVisible[i] }]"
            :style="{ transitionDelay: `${i * 0.1}s` }">
            <div class="trigger-card-icon">{{ card.icon }}</div>
            <div class="trigger-card-title">{{ card.title }}</div>
            <div class="trigger-card-desc">{{ card.desc }}</div>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span class="prompt-label">📋 AI 提示词</span>
          <button class="prompt-copy" @click="copyPrompt(effects[1])">
            {{ copiedId === 'scroll-trigger' ? '已复制 ✓' : '复制' }}
          </button>
        </div>
        <div class="prompt-text">{{ effects[1].prompt }}</div>
      </div>
    </div>
    <!-- Effect 3: Scroll Progress Bar -->
    <div class="effect-block" ref="progressDemoRef">
      <div class="effect-header">
        <div class="effect-title">
          <h3>滚动进度条</h3>
          <span class="effect-name-en">Scroll Progress Bar</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" :style="{ color: difficultyColor('低'), borderColor: difficultyColor('低') }">低</span>
          <span class="tag-lib">纯 JS</span>
          <span class="tag-scene">长文章页面</span>
        </div>
      </div>
      <div class="effect-demo progress-demo">
        <div class="progress-mini-page">
          <div class="progress-bar-track">
            <div class="progress-bar-fill" :style="{ width: progressValue + '%' }"></div>
          </div>
          <div class="progress-mini-header">
            <div class="progress-mini-logo"></div>
            <div class="progress-mini-nav">
              <span></span><span></span><span></span>
            </div>
          </div>
          <div class="progress-scroll-area" ref="progressScrollEl" @scroll="handleProgressScroll">
            <div class="progress-article">
              <div class="progress-article-title">深入理解 Web 性能优化</div>
              <div class="progress-article-meta">2024-03-15 · 阅读约 8 分钟</div>
              <p>在现代 Web 开发中，性能优化是一个永恒的话题。用户对页面加载速度的期望越来越高，搜索引擎也将性能作为排名的重要因素。</p>
              <h4>1. 关键渲染路径</h4>
              <p>浏览器从接收 HTML 到渲染像素的过程称为关键渲染路径。优化这个路径是提升首屏性能的关键。减少关键资源数量、缩短关键路径长度、减小关键字节数是三个核心策略。</p>
              <h4>2. 资源加载优化</h4>
              <p>合理使用预加载（preload）、预连接（preconnect）和懒加载（lazy loading）可以显著改善资源加载效率。图片懒加载尤其重要，它可以减少首屏不必要的网络请求。</p>
              <h4>3. JavaScript 优化</h4>
              <p>代码分割（Code Splitting）和树摇（Tree Shaking）是现代打包工具的标配功能。合理使用动态导入可以将首屏 JS 体积减少 40% 以上。</p>
              <h4>4. 缓存策略</h4>
              <p>HTTP 缓存、Service Worker 缓存和 CDN 缓存构成了完整的缓存体系。合理配置缓存策略可以让回访用户几乎零等待地看到页面内容。</p>
              <div class="progress-article-end">— 全文完 —</div>
            </div>
          </div>
          <div class="progress-percent">{{ Math.round(progressValue) }}%</div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span class="prompt-label">📋 AI 提示词</span>
          <button class="prompt-copy" @click="copyPrompt(effects[2])">
            {{ copiedId === 'progress' ? '已复制 ✓' : '复制' }}
          </button>
        </div>
        <div class="prompt-text">{{ effects[2].prompt }}</div>
      </div>
    </div>
    <!-- Effect 4: Infinite Marquee -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>无限滚动</h3>
          <span class="effect-name-en">Infinite Marquee</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" :style="{ color: difficultyColor('低'), borderColor: difficultyColor('低') }">低</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">品牌展示、合作伙伴</span>
        </div>
      </div>
      <div class="effect-demo marquee-demo">
        <div class="marquee-wrapper">
          <div class="marquee-fade-left"></div>
          <div class="marquee-fade-right"></div>
          <div class="marquee-track">
            <div class="marquee-content">
              <div v-for="(brand, i) in brands" :key="'a-' + i" class="marquee-item">
                <span class="marquee-emoji">{{ brand.emoji }}</span>
                <span class="marquee-name">{{ brand.name }}</span>
              </div>
            </div>
            <div class="marquee-content" aria-hidden="true">
              <div v-for="(brand, i) in brands" :key="'b-' + i" class="marquee-item">
                <span class="marquee-emoji">{{ brand.emoji }}</span>
                <span class="marquee-name">{{ brand.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span class="prompt-label">📋 AI 提示词</span>
          <button class="prompt-copy" @click="copyPrompt(effects[3])">
            {{ copiedId === 'marquee' ? '已复制 ✓' : '复制' }}
          </button>
        </div>
        <div class="prompt-text">{{ effects[3].prompt }}</div>
      </div>
    </div>
    <!-- Effect 5: Scroll Pin + Animate -->
    <div class="effect-block" ref="pinDemoRef">
      <div class="effect-header">
        <div class="effect-title">
          <h3>滚动固定动画</h3>
          <span class="effect-name-en">Scroll Pin + Animate</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" :style="{ color: difficultyColor('中'), borderColor: difficultyColor('中') }">中</span>
          <span class="tag-lib">GSAP ScrollTrigger</span>
          <span class="tag-scene">产品介绍、长页面叙事</span>
        </div>
      </div>
      <div class="effect-demo pin-demo">
        <div class="pin-container">
          <div class="pin-progress-track">
            <div v-for="(step, i) in pinSteps" :key="'dot-' + i"
              :class="['pin-dot', { 'pin-dot-active': pinActiveIndex >= i }]"
              :style="{ background: pinActiveIndex >= i ? step.color : '' }">
            </div>
            <div class="pin-progress-line">
              <div class="pin-progress-fill"
                :style="{ height: pinSteps.length > 1 ? (pinActiveIndex / (pinSteps.length - 1)) * 100 + '%' : '0%' }">
              </div>
            </div>
          </div>
          <div class="pin-viewport">
            <div class="pin-scroll-area" ref="pinScrollEl" @scroll="handlePinScroll">
              <div class="pin-scroll-spacer">
                <div v-for="(step, i) in pinSteps" :key="'step-' + i" class="pin-step-anchor"></div>
              </div>
            </div>
            <div class="pin-display">
              <transition name="pin-fade" mode="out-in">
                <div class="pin-card" :key="pinActiveIndex">
                  <div class="pin-card-num" :style="{ color: pinSteps[pinActiveIndex].color }">
                    {{ pinSteps[pinActiveIndex].num }}
                  </div>
                  <div class="pin-card-title">{{ pinSteps[pinActiveIndex].title }}</div>
                  <div class="pin-card-desc">{{ pinSteps[pinActiveIndex].desc }}</div>
                  <div class="pin-card-accent" :style="{ background: pinSteps[pinActiveIndex].color }"></div>
                </div>
              </transition>
            </div>
            <div class="pin-hint">↕ 在此区域内滚动体验</div>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span class="prompt-label">📋 AI 提示词</span>
          <button class="prompt-copy" @click="copyPrompt(effects[4])">
            {{ copiedId === 'scroll-pin' ? '已复制 ✓' : '复制' }}
          </button>
        </div>
        <div class="prompt-text">{{ effects[4].prompt }}</div>
      </div>
    </div>
    <!-- Effect 6: Horizontal Scroll Section -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>横向滚动</h3>
          <span class="effect-name-en">Horizontal Scroll Section</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" :style="{ color: difficultyColor('中'), borderColor: difficultyColor('中') }">中</span>
          <span class="tag-lib">CSS / GSAP</span>
          <span class="tag-scene">作品集、产品展示</span>
        </div>
      </div>
      <div class="effect-demo hscroll-demo">
        <div class="hscroll-container" ref="hScrollEl">
          <div class="hscroll-viewport">
            <div class="hscroll-fade-left"></div>
            <div class="hscroll-fade-right"></div>
            <div class="hscroll-track" :style="{ transform: `translateX(-${hScrollOffset}px)` }">
              <div v-for="(project, i) in hScrollProjects" :key="'hs-' + i" class="hscroll-card">
                <div class="hscroll-card-visual" :style="{ background: project.gradient }">
                  <div class="hscroll-card-tag">{{ project.tag }}</div>
                </div>
                <div class="hscroll-card-body">
                  <div class="hscroll-card-title">{{ project.title }}</div>
                  <div class="hscroll-card-desc">{{ project.desc }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="hscroll-scroll-driver" @scroll="handleHScroll">
            <div class="hscroll-scroll-spacer"></div>
          </div>
          <div class="hscroll-hint">↕ 在此区域内垂直滚动，内容横向移动</div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span class="prompt-label">📋 AI 提示词</span>
          <button class="prompt-copy" @click="copyPrompt(effects[5])">
            {{ copiedId === 'horizontal-scroll' ? '已复制 ✓' : '复制' }}
          </button>
        </div>
        <div class="prompt-text">{{ effects[5].prompt }}</div>
      </div>
    </div>
    <!-- Effect 7: Inertia Smooth Scroll -->
    <div class="effect-block" ref="inertiaDemoRef">
      <div class="effect-header">
        <div class="effect-title">
          <h3>惯性平滑滚动</h3>
          <span class="effect-name-en">Inertia Smooth Scroll</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" :style="{ color: difficultyColor('高'), borderColor: difficultyColor('高') }">高</span>
          <span class="tag-lib">纯 JS</span>
          <span class="tag-scene">自定义滚动体验</span>
        </div>
      </div>
      <div class="effect-demo inertia-demo">
        <div class="inertia-wrapper">
          <div class="inertia-label">拖拽列表 — 松手后惯性滑动</div>
          <div class="inertia-container"
            ref="inertiaContainerRef"
            @pointerdown="inertiaPointerDown"
            @pointermove="inertiaPointerMove"
            @pointerup="inertiaPointerUp"
            @pointercancel="inertiaPointerUp">
            <div v-for="(item, i) in inertiaItems" :key="'inertia-' + i"
              class="inertia-item"
              :style="{ borderLeftColor: item.color }">
              <div class="inertia-item-dot" :style="{ background: item.color }"></div>
              <span class="inertia-item-label">{{ item.label }}</span>
              <span class="inertia-item-bar" :style="{ width: (30 + (i % 5) * 15) + '%', background: item.color + '33' }"></span>
            </div>
          </div>
          <div class="inertia-hint">↕ 拖拽列表，松手后观察惯性效果</div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span class="prompt-label">📋 AI 提示词</span>
          <button class="prompt-copy" @click="copyPrompt(effects[6])">
            {{ copiedId === 'inertia-scroll' ? '已复制 ✓' : '复制' }}
          </button>
        </div>
        <div class="prompt-text">{{ effects[6].prompt }}</div>
      </div>
    </div>
    <!-- Effect 8: Canvas Infinite Zoom -->
    <div class="effect-block" ref="zoomDemoRef">
      <div class="effect-header">
        <div class="effect-title">
          <h3>画布无限缩放</h3>
          <span class="effect-name-en">Canvas Infinite Zoom</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" :style="{ color: difficultyColor('高'), borderColor: difficultyColor('高') }">高</span>
          <span class="tag-lib">JS+CSS</span>
          <span class="tag-scene">创意展示、艺术项目</span>
        </div>
      </div>
      <div class="effect-demo zoom-demo">
        <div class="zoom-wrapper">
          <div class="zoom-viewport">
            <div v-for="(layer, i) in zoomLayers" :key="'zoom-' + i"
              class="zoom-frame"
              :style="{
                borderColor: layer.color,
                background: layer.bg,
                transform: `scale(${zoomScales[i]})`,
                opacity: zoomOpacities[i],
                zIndex: zoomLayers.length - i
              }">
              <span class="zoom-frame-label" :style="{ color: layer.color, opacity: zoomLabelOpacities[i] }">{{ layer.label }}</span>
            </div>
          </div>
          <div class="zoom-scroll-driver" ref="zoomScrollEl" @scroll="handleZoomScroll">
            <div class="zoom-scroll-spacer"></div>
          </div>
          <div class="zoom-hint">↕ 滚动查看无限缩放效果</div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span class="prompt-label">📋 AI 提示词</span>
          <button class="prompt-copy" @click="copyPrompt(effects[7])">
            {{ copiedId === 'infinite-zoom' ? '已复制 ✓' : '复制' }}
          </button>
        </div>
        <div class="prompt-text">{{ effects[7].prompt }}</div>
      </div>
    </div>
    <!-- Effect 9: Card Stack Scroll -->
    <div class="effect-block" ref="cardstackDemoRef">
      <div class="effect-header">
        <div class="effect-title">
          <h3>卡片堆叠滚动</h3>
          <span class="effect-name-en">Card Stack Scroll</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" :style="{ color: difficultyColor('中'), borderColor: difficultyColor('中') }">中</span>
          <span class="tag-lib">CSS+JS</span>
          <span class="tag-scene">产品特性、时间线</span>
        </div>
      </div>
      <div class="effect-demo cardstack-demo">
        <div class="cardstack-wrapper">
          <div class="cardstack-viewport">
            <div v-for="(card, i) in cardstackCards" :key="'cs-' + i"
              class="cardstack-card"
              :style="{ ...getCardstackStyle(i), background: card.gradient }">
              <div class="cardstack-card-icon">{{ card.icon }}</div>
              <div class="cardstack-card-title">{{ card.title }}</div>
              <div class="cardstack-card-desc">{{ card.desc }}</div>
            </div>
          </div>
          <div class="cardstack-scroll-driver" ref="cardstackScrollEl" @scroll="handleCardstackScroll">
            <div class="cardstack-scroll-spacer"></div>
          </div>
          <div class="cardstack-hint">↕ 滚动查看卡片堆叠效果</div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span class="prompt-label">📋 AI 提示词</span>
          <button class="prompt-copy" @click="copyPrompt(effects[8])">
            {{ copiedId === 'card-stack' ? '已复制 ✓' : '复制' }}
          </button>
        </div>
        <div class="prompt-text">{{ effects[8].prompt }}</div>
      </div>
    </div>
    <!-- Effect 10: Depth-of-field Parallax -->
    <div class="effect-block" ref="depthDemoRef">
      <div class="effect-header">
        <div class="effect-title">
          <h3>景深视差模糊</h3>
          <span class="effect-name-en">Depth-of-field Parallax</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" :style="{ color: difficultyColor('高'), borderColor: difficultyColor('高') }">高</span>
          <span class="tag-lib">JS+CSS</span>
          <span class="tag-scene">摄影展示、沉浸式体验</span>
        </div>
      </div>
      <div class="effect-demo depth-demo">
        <div class="depth-wrapper">
          <div class="depth-scene">
            <!-- Background layer: mountains -->
            <div class="depth-layer depth-bg" :style="getDepthLayerStyle(0)">
              <svg viewBox="0 0 400 200" class="depth-mountains">
                <polygon points="0,200 60,80 120,200" fill="#4a5568" opacity="0.6"/>
                <polygon points="80,200 160,50 240,200" fill="#2d3748" opacity="0.8"/>
                <polygon points="200,200 280,70 360,200" fill="#4a5568" opacity="0.6"/>
                <polygon points="300,200 380,90 460,200" fill="#2d3748" opacity="0.7"/>
              </svg>
              <div class="depth-layer-tag">远景 BG</div>
            </div>
            <!-- Midground layer: trees -->
            <div class="depth-layer depth-mid" :style="getDepthLayerStyle(1)">
              <svg viewBox="0 0 400 200" class="depth-trees">
                <polygon points="40,200 60,100 80,200" fill="#276749"/>
                <polygon points="100,200 125,80 150,200" fill="#22543d"/>
                <polygon points="180,200 200,110 220,200" fill="#276749"/>
                <polygon points="260,200 285,70 310,200" fill="#22543d"/>
                <polygon points="330,200 355,100 380,200" fill="#276749"/>
              </svg>
              <div class="depth-layer-tag">中景 MID</div>
            </div>
            <!-- Foreground layer: text -->
            <div class="depth-layer depth-fg" :style="getDepthLayerStyle(2)">
              <div class="depth-fg-content">
                <div class="depth-fg-title">Depth of Field</div>
                <div class="depth-fg-sub">景深视差模糊效果</div>
              </div>
              <div class="depth-layer-tag">前景 FG</div>
            </div>
          </div>
          <div class="depth-focal-indicator">
            焦点层: {{ ['远景', '中景', '前景'][depthFocalLayer] }}
          </div>
          <div class="depth-scroll-driver" ref="depthScrollEl" @scroll="handleDepthScroll">
            <div class="depth-scroll-spacer"></div>
          </div>
          <div class="depth-hint">↕ 滚动切换焦点层，观察景深模糊</div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span class="prompt-label">📋 AI 提示词</span>
          <button class="prompt-copy" @click="copyPrompt(effects[9])">
            {{ copiedId === 'depth-parallax' ? '已复制 ✓' : '复制' }}
          </button>
        </div>
        <div class="prompt-text">{{ effects[9].prompt }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.se-root {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
/* --- Shared block structure --- */
.effect-block {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.effect-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 20px;
}

.effect-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.effect-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.effect-name-en {
  font-size: 13px;
  color: var(--vp-c-text-3);
  font-weight: 400;
}

.effect-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-difficulty,
.tag-lib,
.tag-scene {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.6;
}

.tag-difficulty {
  border: 1px solid;
  background: transparent;
}

.tag-lib {
  background: var(--vp-c-brand);
  color: #fff;
  border: 1px solid var(--vp-c-brand);
}

.tag-scene {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
}

/* --- Demo area --- */
.effect-demo {
  min-height: 200px;
  background: var(--vp-c-bg);
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  position: relative;
  overflow: hidden;
}

/* --- Prompt section --- */
.effect-prompt {
  padding: 14px 20px;
}

.prompt-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.prompt-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.prompt-copy {
  padding: 3px 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.prompt-copy:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.prompt-text {
  font-size: 13px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace;
}
/* ========== Parallax Demo ========== */
.parallax-demo {
  min-height: 360px;
  background: linear-gradient(180deg, #1a1a3e 0%, #2d1b69 30%, #4a2c8a 60%, #1a1a3e 100%);
}

.parallax-wrapper {
  position: relative;
  width: 100%;
  height: 360px;
}

.parallax-modes {
  position: absolute;
  inset: 0;
  display: flex;
  gap: 2px;
  z-index: 1;
}

.parallax-mode {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.parallax-mode-label {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  padding: 3px 12px;
  border-radius: 99px;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.parallax-scene {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  flex: 1;
}

.parallax-layer {
  position: absolute;
  left: 0;
  right: 0;
  will-change: transform;
}

/* Sky layer */
.parallax-sky {
  top: 0;
  height: 360px;
}

.sky-sun {
  position: absolute;
  top: 40px;
  right: 20%;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffe082 0%, #ffb74d 60%, transparent 70%);
  box-shadow: 0 0 40px 10px rgba(255, 183, 77, 0.4);
}

.sky-cloud {
  position: absolute;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.15);
}

.cloud-1 {
  top: 50px;
  left: 10%;
  width: 80px;
  height: 24px;
  animation: cloud-drift 12s ease-in-out infinite;
}

.cloud-2 {
  top: 85px;
  left: 55%;
  width: 110px;
  height: 28px;
  animation: cloud-drift 16s ease-in-out infinite reverse;
}

.cloud-3 {
  top: 35px;
  left: 75%;
  width: 65px;
  height: 20px;
  animation: cloud-drift 10s ease-in-out infinite;
}

@keyframes cloud-drift {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(20px); }
}

/* Mountains back */
.parallax-mountains-back {
  bottom: 60px;
  height: 140px;
  background:
    linear-gradient(135deg, transparent 33%, #3d2b6b 33%, #3d2b6b 66%, transparent 66%),
    linear-gradient(225deg, transparent 33%, #4a3580 33%, #4a3580 66%, transparent 66%);
  background-size: 160px 140px;
  background-position: 0 bottom;
  background-repeat: repeat-x;
  opacity: 0.7;
}

/* Mountains front */
.parallax-mountains-front {
  bottom: 35px;
  height: 110px;
  background:
    linear-gradient(150deg, transparent 30%, #2a1f4e 30%, #2a1f4e 60%, transparent 60%),
    linear-gradient(210deg, transparent 30%, #352960 30%, #352960 60%, transparent 60%);
  background-size: 130px 110px;
  background-position: 40px bottom;
  background-repeat: repeat-x;
  opacity: 0.85;
}

/* Trees */
.parallax-trees {
  bottom: 0;
  height: 55px;
  background:
    radial-gradient(ellipse 18px 45px at 25px bottom, #1a3a2a 70%, transparent 70%),
    radial-gradient(ellipse 14px 36px at 60px bottom, #1a3a2a 70%, transparent 70%),
    radial-gradient(ellipse 20px 50px at 100px bottom, #1a3a2a 70%, transparent 70%),
    radial-gradient(ellipse 16px 40px at 150px bottom, #1a3a2a 70%, transparent 70%),
    radial-gradient(ellipse 18px 45px at 200px bottom, #1a3a2a 70%, transparent 70%),
    radial-gradient(ellipse 13px 34px at 240px bottom, #1a3a2a 70%, transparent 70%);
  background-repeat: repeat-x;
  background-size: 260px 55px;
}

/* Foreground text */
.parallax-fg {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.parallax-text-box {
  text-align: center;
}

.parallax-headline {
  display: block;
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
  letter-spacing: 3px;
}

.parallax-sub {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
}

/* Scroll driver overlay */
.parallax-scroll-driver {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  z-index: 3;
  overscroll-behavior: contain;
}

.parallax-scroll-driver::-webkit-scrollbar {
  width: 0;
}

.parallax-scroll-spacer {
  height: 1200px;
}

.parallax-hint {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  z-index: 4;
  pointer-events: none;
  white-space: nowrap;
}

/* Mode divider line */
.parallax-modes > .parallax-mode:first-child {
  border-right: 1px solid rgba(255, 255, 255, 0.15);
}
/* ========== Scroll-trigger Demo ========== */
.trigger-demo {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.replay-btn {
  padding: 6px 16px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-end;
}

.replay-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.trigger-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  width: 100%;
}

.trigger-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 20px 16px;
  text-align: center;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.trigger-card-visible {
  opacity: 1;
  transform: translateY(0);
}

.trigger-card-icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.trigger-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 6px;
}

.trigger-card-desc {
  font-size: 12px;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}
/* ========== Progress Bar Demo ========== */
.progress-demo {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.progress-mini-page {
  width: 100%;
  max-width: 480px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg);
  position: relative;
}

.progress-bar-track {
  height: 3px;
  background: var(--vp-c-divider);
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--vp-c-brand), var(--vp-c-brand-light, var(--vp-c-brand)));
  transition: width 0.1s linear;
  border-radius: 0 2px 2px 0;
}

.progress-mini-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.progress-mini-logo {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: var(--vp-c-brand);
  opacity: 0.7;
}

.progress-mini-nav {
  display: flex;
  gap: 10px;
}

.progress-mini-nav span {
  display: block;
  width: 32px;
  height: 8px;
  border-radius: 4px;
  background: var(--vp-c-divider);
}

.progress-scroll-area {
  height: 200px;
  overflow-y: auto;
  padding: 16px 20px;
  scroll-behavior: smooth;
  overscroll-behavior: contain;
}

.progress-scroll-area::-webkit-scrollbar {
  width: 4px;
}

.progress-scroll-area::-webkit-scrollbar-thumb {
  background: var(--vp-c-divider);
  border-radius: 4px;
}

.progress-article-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 6px;
}

.progress-article-meta {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-bottom: 14px;
}

.progress-article p {
  font-size: 13px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
  margin-bottom: 12px;
}

.progress-article h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 16px 0 8px;
}

.progress-article-end {
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 13px;
  padding: 20px 0 10px;
}

.progress-percent {
  position: absolute;
  top: 12px;
  right: 14px;
  font-size: 11px;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
}
/* ========== Marquee Demo ========== */
.marquee-demo {
  padding: 30px 0;
  display: flex;
  align-items: center;
  min-height: 120px;
}

.marquee-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.marquee-fade-left,
.marquee-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60px;
  z-index: 2;
  pointer-events: none;
}

.marquee-fade-left {
  left: 0;
  background: linear-gradient(90deg, var(--vp-c-bg), transparent);
}

.marquee-fade-right {
  right: 0;
  background: linear-gradient(270deg, var(--vp-c-bg), transparent);
}

.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee-scroll 20s linear infinite;
}

@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.marquee-content {
  display: flex;
  gap: 16px;
  padding: 0 8px;
}

.marquee-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
}

.marquee-emoji {
  font-size: 22px;
}

.marquee-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  letter-spacing: 0.5px;
}
/* ========== Scroll-Pin Demo ========== */
.pin-demo {
  padding: 20px;
  display: flex;
  justify-content: center;
  min-height: 280px;
}

.pin-container {
  width: 100%;
  max-width: 520px;
  display: flex;
  gap: 20px;
  align-items: stretch;
}

.pin-progress-track {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 24px 0;
  position: relative;
  width: 20px;
  flex-shrink: 0;
}

.pin-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--vp-c-divider);
  border: 2px solid var(--vp-c-bg);
  position: relative;
  z-index: 2;
  transition: all 0.4s ease;
  flex-shrink: 0;
}

.pin-dot-active {
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
}

.pin-dot:not(:last-child) {
  margin-bottom: calc((240px - 48px) / 3 - 12px);
}

.pin-progress-line {
  position: absolute;
  top: 30px;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  background: var(--vp-c-divider);
  z-index: 1;
  border-radius: 1px;
}

.pin-progress-fill {
  width: 100%;
  background: linear-gradient(180deg, #6366f1, #c4b5fd);
  border-radius: 1px;
  transition: height 0.4s ease;
}

.pin-viewport {
  flex: 1;
  position: relative;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg);
  height: 240px;
}

.pin-scroll-area {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  z-index: 3;
  opacity: 0;
  overscroll-behavior: contain;
}

.pin-scroll-spacer {
  height: 1920px;
}

.pin-step-anchor {
  height: 480px;
}

.pin-scroll-area::-webkit-scrollbar {
  width: 0;
}

.pin-display {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  padding: 24px;
}

.pin-card {
  text-align: center;
  width: 100%;
}

.pin-card-num {
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 12px;
  font-variant-numeric: tabular-nums;
}

.pin-card-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.pin-card-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  max-width: 280px;
  margin: 0 auto 16px;
}

.pin-card-accent {
  width: 40px;
  height: 3px;
  border-radius: 2px;
  margin: 0 auto;
  transition: background 0.4s ease;
}

.pin-hint {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: var(--vp-c-text-3);
  z-index: 4;
  pointer-events: none;
  opacity: 0.7;
  white-space: nowrap;
}

/* Pin fade transition */
.pin-fade-enter-active,
.pin-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.pin-fade-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.pin-fade-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
/* ========== Horizontal Scroll Demo ========== */
.hscroll-demo {
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 280px;
}

.hscroll-container {
  width: 100%;
  position: relative;
  height: 280px;
}

.hscroll-viewport {
  position: absolute;
  inset: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.hscroll-fade-left,
.hscroll-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40px;
  z-index: 2;
  pointer-events: none;
}

.hscroll-fade-left {
  left: 0;
  background: linear-gradient(90deg, var(--vp-c-bg), transparent);
}

.hscroll-fade-right {
  right: 0;
  background: linear-gradient(270deg, var(--vp-c-bg), transparent);
}

.hscroll-track {
  display: flex;
  gap: 16px;
  padding: 0 24px;
  will-change: transform;
  transition: transform 0.15s ease-out;
}

.hscroll-scroll-driver {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  z-index: 3;
  overscroll-behavior: contain;
}

.hscroll-scroll-driver::-webkit-scrollbar {
  width: 0;
}

.hscroll-scroll-spacer {
  height: 1200px;
}

.hscroll-card {
  flex-shrink: 0;
  width: 220px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.hscroll-card:hover {
  transform: scale(1.04);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.hscroll-card-visual {
  height: 110px;
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 10px 12px;
}

.hscroll-card-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.hscroll-card-body {
  padding: 12px 14px 14px;
}

.hscroll-card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.hscroll-card-desc {
  font-size: 12px;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}

.hscroll-hint {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: var(--vp-c-text-3);
  z-index: 4;
  pointer-events: none;
  opacity: 0.7;
  white-space: nowrap;
}
/* ========== Inertia Smooth Scroll Demo ========== */
.inertia-demo {
  padding: 20px;
  display: flex;
  justify-content: center;
  min-height: 320px;
}

.inertia-wrapper {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inertia-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-align: center;
}

.inertia-container {
  height: 260px;
  overflow-y: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  cursor: grab;
  user-select: none;
  touch-action: none;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--vp-c-divider) transparent;
}

.inertia-container::-webkit-scrollbar {
  width: 4px;
}

.inertia-container::-webkit-scrollbar-thumb {
  background: var(--vp-c-divider);
  border-radius: 4px;
}

.inertia-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--vp-c-divider);
  border-left: 3px solid transparent;
  position: relative;
  transition: background 0.15s;
}

.inertia-item:last-child {
  border-bottom: none;
}

.inertia-item:hover {
  background: var(--vp-c-bg);
}

.inertia-item-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.inertia-item-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  flex-shrink: 0;
  width: 60px;
}

.inertia-item-bar {
  height: 6px;
  border-radius: 3px;
  flex-shrink: 0;
}

.inertia-hint {
  font-size: 11px;
  color: var(--vp-c-text-3);
  text-align: center;
  opacity: 0.7;
}
/* ========== Canvas Infinite Zoom Demo ========== */
.zoom-demo {
  padding: 0;
  min-height: 340px;
}

.zoom-wrapper {
  position: relative;
  width: 100%;
  height: 340px;
  background: #0a0a1a;
  overflow: hidden;
}

.zoom-viewport {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-frame {
  position: absolute;
  width: 160px;
  height: 160px;
  border: 2px solid;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.12s ease-out, opacity 0.12s ease-out;
  will-change: transform, opacity;
  box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.02);
}

.zoom-frame-label {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 4px;
  pointer-events: none;
  text-shadow: 0 0 12px currentColor;
  transition: opacity 0.2s ease-out;
}

.zoom-scroll-driver {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  z-index: 3;
  overscroll-behavior: contain;
}

.zoom-scroll-driver::-webkit-scrollbar {
  width: 0;
}

.zoom-scroll-spacer {
  height: 3000px;
}

.zoom-hint {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  z-index: 4;
  pointer-events: none;
  white-space: nowrap;
}
/* ========== Card Stack Scroll Demo ========== */
.cardstack-demo {
  padding: 0;
  min-height: 320px;
}

.cardstack-wrapper {
  position: relative;
  width: 100%;
  height: 320px;
  overflow: hidden;
}

.cardstack-viewport {
  position: absolute;
  inset: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cardstack-card {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.95);
  transition: transform 0.3s ease-out, opacity 0.3s ease-out, filter 0.3s ease-out;
  will-change: transform, opacity, filter;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.cardstack-card-icon {
  font-size: 28px;
  opacity: 0.5;
  font-style: normal;
}

.cardstack-card-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 6px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.cardstack-card-desc {
  font-size: 13px;
  opacity: 0.6;
  letter-spacing: 1px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.cardstack-scroll-driver {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  z-index: 3;
  overscroll-behavior: contain;
}

.cardstack-scroll-driver::-webkit-scrollbar {
  width: 0;
}

.cardstack-scroll-spacer {
  height: 1600px;
}

.cardstack-hint {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: var(--vp-c-text-3);
  z-index: 4;
  pointer-events: none;
  opacity: 0.7;
  white-space: nowrap;
}
/* ========== Depth-of-field Parallax Demo ========== */
.depth-demo {
  padding: 0;
  min-height: 360px;
}

.depth-wrapper {
  position: relative;
  width: 100%;
  height: 360px;
  background: linear-gradient(180deg, #1a202c 0%, #2d3748 50%, #4a5568 100%);
  overflow: hidden;
}

.depth-scene {
  position: absolute;
  inset: 0;
}

.depth-layer {
  position: absolute;
  left: 0;
  right: 0;
  transition: transform 0.2s ease-out, filter 0.4s ease-out, opacity 0.4s ease-out;
  will-change: transform, filter, opacity;
}

.depth-bg {
  bottom: 60px;
  height: 200px;
}

.depth-mountains {
  width: 100%;
  height: 100%;
}

.depth-mid {
  bottom: 0;
  height: 200px;
}

.depth-trees {
  width: 100%;
  height: 100%;
}

.depth-fg {
  bottom: 20px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;
}

.depth-fg-content {
  text-align: center;
}

.depth-fg-title {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
  letter-spacing: 3px;
}

.depth-fg-sub {
  margin-top: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
}

.depth-layer-tag {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 8px;
  border-radius: 99px;
  pointer-events: none;
}

.depth-focal-indicator {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  padding: 4px 14px;
  border-radius: 99px;
  z-index: 5;
  white-space: nowrap;
  transition: all 0.3s;
}

.depth-scroll-driver {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  z-index: 3;
  overscroll-behavior: contain;
}

.depth-scroll-driver::-webkit-scrollbar {
  width: 0;
}

.depth-scroll-spacer {
  height: 1500px;
}

.depth-hint {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  z-index: 4;
  pointer-events: none;
  white-space: nowrap;
}

/* ========== Responsive ========== */
@media (max-width: 640px) {
  .effect-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 16px;
  }

  .effect-title h3 {
    font-size: 16px;
  }

  .trigger-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .parallax-modes {
    flex-direction: column;
  }

  .parallax-modes > .parallax-mode:first-child {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  }

  .parallax-headline {
    font-size: 22px;
  }

  .parallax-sub {
    font-size: 11px;
  }

  .progress-mini-page {
    max-width: 100%;
  }

  .effect-prompt {
    padding: 12px 16px;
  }

  .pin-container {
    max-width: 100%;
    gap: 12px;
  }

  .pin-card-num {
    font-size: 36px;
  }

  .pin-card-title {
    font-size: 17px;
  }

  .hscroll-card {
    width: 180px;
  }

  .hscroll-card-visual {
    height: 80px;
  }

  .inertia-wrapper {
    max-width: 100%;
  }

  .inertia-container {
    height: 220px;
  }

  .zoom-frame {
    width: 140px;
    height: 140px;
  }

  .zoom-frame-label {
    font-size: 12px;
  }

  .cardstack-card-title {
    font-size: 22px;
  }

  .cardstack-card-icon {
    font-size: 24px;
  }

  .depth-fg-title {
    font-size: 24px;
  }

  .depth-fg-sub {
    font-size: 12px;
  }
}
</style>
