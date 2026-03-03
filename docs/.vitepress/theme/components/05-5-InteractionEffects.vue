<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

// Copy functionality
const copiedIndex = ref<number | null>(null)
function copyPrompt(text: string, index: number) {
  navigator.clipboard.writeText(text).then(() => {
    copiedIndex.value = index
    setTimeout(() => { copiedIndex.value = null }, 1500)
  })
}

const prompts = [
  '做一个图片对比滑块组件，左右两张图片用一条可拖动的分割线分隔，拖动分割线可以对比前后效果',
  '做一个聚光灯效果，页面是暗色的，鼠标位置产生一个圆形光圈照亮下方内容，像手电筒一样，用 radial-gradient + mousemove 实现',
  '做一个手风琴图片切换效果，4-5 个竖条并排，每个有渐变背景和图标标签，hover 时当前条展开其他收缩，用 CSS flex-grow + transition 实现',
  '做一个 FAQ 折叠展开组件，4 个问答项，点击展开答案并收起其他项，带 chevron 图标旋转动画，用 max-height transition 实现',
  '做一个搜索框展开效果，默认只显示搜索图标按钮，点击后平滑展开为完整搜索输入框，点击外部或按 Escape 收回，用 width transition 实现',
  '给卡片加鼠标跟随效果，鼠标移到卡片上时根据位置微微倾斜，产生 3D 感',
  '做一个自定义光标互动效果，隐藏默认光标，用一个 div 跟随鼠标，在按钮上变大，在文字上变成竖线，在链接上变成指针圆环',
  '做一个悬浮媒体预览效果，文字列表项悬停时在光标附近显示浮动的渐变色块（模拟图片预览），跟随鼠标移动',
  '做一个 3D 模型交互效果，用 CSS 3D transform 构建一个立方体（preserve-3d），支持拖拽旋转，空闲时自动旋转',
  '做一个物理引擎交互布局，用 Canvas 实现多个彩色小球，有重力和弹跳效果，支持拖拽抛掷和碰撞检测',
]

// ==================== 2. Image Comparison Slider ====================
const sliderRef = ref<HTMLElement | null>(null)
const sliderPosition = ref(50)
const isDragging = ref(false)

function updateSliderPosition(clientX: number) {
  if (!sliderRef.value) return
  const rect = sliderRef.value.getBoundingClientRect()
  const x = clientX - rect.left
  const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
  sliderPosition.value = pct
}

function onSliderMouseDown(e: MouseEvent) {
  e.preventDefault()
  isDragging.value = true
  updateSliderPosition(e.clientX)
}

function onSliderTouchStart(e: TouchEvent) {
  isDragging.value = true
  if (e.touches.length > 0) {
    updateSliderPosition(e.touches[0].clientX)
  }
}

function onDocumentMouseMove(e: MouseEvent) {
  if (isDragging.value) updateSliderPosition(e.clientX)
}

function onDocumentTouchMove(e: TouchEvent) {
  if (isDragging.value && e.touches.length > 0) {
    updateSliderPosition(e.touches[0].clientX)
  }
}

function onDocumentUp() {
  isDragging.value = false
}

onMounted(() => {
  document.addEventListener('mousemove', onDocumentMouseMove)
  document.addEventListener('mouseup', onDocumentUp)
  document.addEventListener('touchmove', onDocumentTouchMove, { passive: true })
  document.addEventListener('touchend', onDocumentUp)
  document.addEventListener('click', onClickOutsideSearch)
  document.addEventListener('keydown', onSearchEscape)
  startCubeAutoRotate()
  initPhysicsCanvas()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDocumentMouseMove)
  document.removeEventListener('mouseup', onDocumentUp)
  document.removeEventListener('touchmove', onDocumentTouchMove)
  document.removeEventListener('touchend', onDocumentUp)
  document.removeEventListener('click', onClickOutsideSearch)
  document.removeEventListener('keydown', onSearchEscape)
  stopCubeAutoRotate()
  if (cubeIdleTimer.value !== null) clearTimeout(cubeIdleTimer.value)
  if (physicsRafId.value) cancelAnimationFrame(physicsRafId.value)
})

// ==================== 4. Spotlight / Torch Effect ====================
const spotlightRef = ref<HTMLElement | null>(null)
const spotlightX = ref(0)
const spotlightY = ref(0)
const spotlightActive = ref(false)
const spotlightHintVisible = ref(true)

function handleSpotlightMove(e: MouseEvent) {
  if (!spotlightRef.value) return
  const rect = spotlightRef.value.getBoundingClientRect()
  spotlightX.value = e.clientX - rect.left
  spotlightY.value = e.clientY - rect.top
  spotlightActive.value = true
  spotlightHintVisible.value = false
}

function handleSpotlightLeave() {
  spotlightActive.value = false
  spotlightHintVisible.value = true
}

const spotlightOverlayStyle = computed(() => {
  if (!spotlightActive.value) {
    return { background: '#0e1117' }
  }
  return {
    background: `radial-gradient(circle 120px at ${spotlightX.value}px ${spotlightY.value}px, transparent 0%, #0e1117 100%)`,
  }
})

// ==================== 6. FAQ Accordion ====================
const activeAccordionIndex = ref(-1)

const faqItems = [
  {
    question: 'Vibe Coding 适合完全不会编程的人吗？',
    answer: '当然！Vibe Coding 的核心理念就是用自然语言描述需求，让 AI 来写代码。你需要的是清晰的思维和好的产品感觉，而不是编程经验。',
  },
  {
    question: 'AI 生成的代码质量怎么样？',
    answer: '在合理的 prompt 引导下，AI 生成的代码质量相当高。关键在于你的需求描述是否清晰、是否加载了对应的 Skills。',
  },
  {
    question: '需要什么开发环境？',
    answer: '一台电脑、Node.js 环境、一个趁手的编辑器（推荐 VS Code 或 Cursor），以及 Claude Code CLI。详见第一章环境搭建。',
  },
  {
    question: '部署上线难吗？',
    answer: '一点都不难。现代部署平台（Vercel、Netlify）支持一键部署，连接 GitHub 仓库后每次 push 自动更新。',
  },
]

function toggleFaq(index: number) {
  activeAccordionIndex.value = activeAccordionIndex.value === index ? -1 : index
}

// ==================== 7. Expandable Search ====================
const searchExpanded = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)

function toggleSearch() {
  searchExpanded.value = !searchExpanded.value
  if (searchExpanded.value) {
    setTimeout(() => {
      searchInputRef.value?.focus()
    }, 50)
  }
}

function onClickOutsideSearch(e: MouseEvent) {
  if (!searchExpanded.value) return
  const target = e.target as HTMLElement
  if (!target.closest('.search-expand-wrapper')) {
    searchExpanded.value = false
  }
}

function onSearchEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && searchExpanded.value) {
    searchExpanded.value = false
  }
}

// ==================== 8. Cursor Follow ====================
const cardRef = ref<HTMLElement | null>(null)
const cardTransform = reactive({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 })
function handleCardMove(e: MouseEvent) {
  const el = cardRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  cardTransform.rotateY = ((x - centerX) / centerX) * 12
  cardTransform.rotateX = ((centerY - y) / centerY) * 12
  cardTransform.glareX = (x / rect.width) * 100
  cardTransform.glareY = (y / rect.height) * 100
}
function handleCardLeave() {
  cardTransform.rotateX = 0
  cardTransform.rotateY = 0
  cardTransform.glareX = 50
  cardTransform.glareY = 50
}

// ==================== 9. Custom Cursor Interaction ====================
const customCursorAreaRef = ref<HTMLElement | null>(null)
const customCursorRef = ref<HTMLElement | null>(null)
const cursorX = ref(0)
const cursorY = ref(0)
const cursorVisible = ref(false)
const cursorType = ref<'default' | 'button' | 'text' | 'link'>('default')

function handleCustomCursorMove(e: MouseEvent) {
  if (!customCursorAreaRef.value) return
  const rect = customCursorAreaRef.value.getBoundingClientRect()
  cursorX.value = e.clientX - rect.left
  cursorY.value = e.clientY - rect.top
  cursorVisible.value = true
  const target = e.target as HTMLElement
  if (target.closest('.custom-cursor-btn')) {
    cursorType.value = 'button'
  } else if (target.closest('.custom-cursor-link')) {
    cursorType.value = 'link'
  } else if (target.closest('.custom-cursor-text')) {
    cursorType.value = 'text'
  } else {
    cursorType.value = 'default'
  }
}

function handleCustomCursorLeave() {
  cursorVisible.value = false
}

// ==================== 10. Hover Media Preview ====================
const hoverPreviewItems = [
  { label: '极光之旅 — 冰岛摄影集', gradient: 'linear-gradient(135deg, #43a047, #00bcd4)' },
  { label: '东京霓虹 — 城市夜景', gradient: 'linear-gradient(135deg, #e53935, #ff7043)' },
  { label: '深海探索 — 水下世界', gradient: 'linear-gradient(135deg, #1565c0, #7c4dff)' },
  { label: '沙漠星空 — 银河延时', gradient: 'linear-gradient(135deg, #f59e0b, #ec407a)' },
  { label: '雨林秘境 — 自然纪录', gradient: 'linear-gradient(135deg, #2e7d32, #66bb6a)' },
]
const hoverPreviewActive = ref(false)
const hoverPreviewIndex = ref(-1)
const hoverPreviewX = ref(0)
const hoverPreviewY = ref(0)
const hoverListRef = ref<HTMLElement | null>(null)

function handlePreviewEnter(idx: number) {
  hoverPreviewActive.value = true
  hoverPreviewIndex.value = idx
}

function handlePreviewMove(e: MouseEvent) {
  if (!hoverListRef.value) return
  const rect = hoverListRef.value.getBoundingClientRect()
  hoverPreviewX.value = e.clientX - rect.left + 16
  hoverPreviewY.value = e.clientY - rect.top - 60
}

function handlePreviewLeave() {
  hoverPreviewActive.value = false
  hoverPreviewIndex.value = -1
}

// ==================== 11. 3D Cube Interaction ====================
const cubeRef = ref<HTMLElement | null>(null)
const cubeRotateX = ref(-25)
const cubeRotateY = ref(35)
const cubeDragging = ref(false)
const cubeLastX = ref(0)
const cubeLastY = ref(0)
const cubeAutoTimer = ref<number | null>(null)
const cubeIdleTimer = ref<number | null>(null)
const cubeAutoAngle = ref(35)

const cubeFaces = [
  { label: '前', icon: '🚀', bg: 'linear-gradient(135deg, #7c4dff, #536dfe)' },
  { label: '后', icon: '🌐', bg: 'linear-gradient(135deg, #00bcd4, #4dd0e1)' },
  { label: '右', icon: '⚡', bg: 'linear-gradient(135deg, #ff7043, #ff8a65)' },
  { label: '左', icon: '🎨', bg: 'linear-gradient(135deg, #43a047, #66bb6a)' },
  { label: '上', icon: '💎', bg: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
  { label: '下', icon: '🔧', bg: 'linear-gradient(135deg, #ec407a, #f48fb1)' },
]

const cubeRotateSpeed = ref(0.6)
const cubeRampStart = ref(0)
const CUBE_RAMP_DURATION = 300
const CUBE_TARGET_SPEED = 0.6

function startCubeAutoRotate() {
  stopCubeAutoRotate()
  cubeRampStart.value = performance.now()
  cubeRotateSpeed.value = 0
  cubeAutoTimer.value = window.setInterval(() => {
    const elapsed = performance.now() - cubeRampStart.value
    const t = Math.min(elapsed / CUBE_RAMP_DURATION, 1)
    cubeRotateSpeed.value = CUBE_TARGET_SPEED * t * t
    cubeAutoAngle.value += cubeRotateSpeed.value
    cubeRotateY.value = cubeAutoAngle.value
  }, 30)
}

function stopCubeAutoRotate() {
  if (cubeAutoTimer.value !== null) {
    clearInterval(cubeAutoTimer.value)
    cubeAutoTimer.value = null
  }
}

function resetCubeIdleTimer() {
  if (cubeIdleTimer.value !== null) clearTimeout(cubeIdleTimer.value)
  cubeIdleTimer.value = window.setTimeout(() => {
    cubeAutoAngle.value = cubeRotateY.value
    startCubeAutoRotate()
  }, 500)
}

function onCubePointerDown(e: PointerEvent) {
  cubeDragging.value = true
  cubeLastX.value = e.clientX
  cubeLastY.value = e.clientY
  stopCubeAutoRotate()
  if (cubeIdleTimer.value !== null) clearTimeout(cubeIdleTimer.value)
  ;(e.currentTarget as HTMLElement)?.setPointerCapture(e.pointerId)
}

function onCubePointerMove(e: PointerEvent) {
  if (!cubeDragging.value) return
  const dx = e.clientX - cubeLastX.value
  const dy = e.clientY - cubeLastY.value
  cubeRotateY.value += dx * 0.6
  cubeRotateX.value -= dy * 0.6
  cubeLastX.value = e.clientX
  cubeLastY.value = e.clientY
}

function onCubePointerUp() {
  cubeDragging.value = false
  resetCubeIdleTimer()
}

// ==================== 12. Physics Engine Layout ====================
const physicsCanvasRef = ref<HTMLCanvasElement | null>(null)
const physicsRafId = ref(0)

interface PhysBall {
  x: number; y: number; vx: number; vy: number
  r: number; color: string; dragging: boolean
}

const physicsBalls = ref<PhysBall[]>([])
const physicsDragIndex = ref(-1)
const physicsDragOffset = reactive({ x: 0, y: 0 })
const physicsLastDrag = reactive({ x: 0, y: 0, time: 0 })

const ballColors = [
  '#7c4dff', '#536dfe', '#43a047', '#66bb6a', '#ff7043',
  '#ff8a65', '#00bcd4', '#4dd0e1', '#f59e0b', '#fbbf24',
  '#ec407a', '#f48fb1', '#e53935', '#1565c0', '#8d6e63',
]

function initPhysicsBalls(w: number, h: number) {
  const balls: PhysBall[] = []
  for (let i = 0; i < 15; i++) {
    const r = 12 + Math.random() * 14
    balls.push({
      x: r + Math.random() * (w - 2 * r),
      y: r + Math.random() * (h * 0.5),
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 2,
      r,
      color: ballColors[i % ballColors.length],
      dragging: false,
    })
  }
  physicsBalls.value = balls
}

function physicsStep(w: number, h: number) {
  const gravity = 0.25
  const damping = 0.985
  const bounce = 0.7
  const balls = physicsBalls.value
  for (let i = 0; i < balls.length; i++) {
    const b = balls[i]
    if (b.dragging) continue
    b.vy += gravity
    b.vx *= damping
    b.vy *= damping
    b.x += b.vx
    b.y += b.vy
    // Wall collisions
    if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx) * bounce }
    if (b.x + b.r > w) { b.x = w - b.r; b.vx = -Math.abs(b.vx) * bounce }
    if (b.y - b.r < 0) { b.y = b.r; b.vy = Math.abs(b.vy) * bounce }
    if (b.y + b.r > h) { b.y = h - b.r; b.vy = -Math.abs(b.vy) * bounce }
    // Ball-ball collisions
    for (let j = i + 1; j < balls.length; j++) {
      const o = balls[j]
      if (o.dragging) continue
      const dx = o.x - b.x
      const dy = o.y - b.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const minDist = b.r + o.r
      if (dist < minDist && dist > 0) {
        const nx = dx / dist
        const ny = dy / dist
        const overlap = minDist - dist
        b.x -= nx * overlap * 0.5
        b.y -= ny * overlap * 0.5
        o.x += nx * overlap * 0.5
        o.y += ny * overlap * 0.5
        const dvx = b.vx - o.vx
        const dvy = b.vy - o.vy
        const dot = dvx * nx + dvy * ny
        if (dot > 0) {
          b.vx -= dot * nx * bounce
          b.vy -= dot * ny * bounce
          o.vx += dot * nx * bounce
          o.vy += dot * ny * bounce
        }
      }
    }
  }
}

function drawPhysics() {
  const canvas = physicsCanvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)
  for (const b of physicsBalls.value) {
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fillStyle = b.color
    ctx.fill()
    // Highlight
    ctx.beginPath()
    ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.35, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fill()
  }
}

function physicsLoop() {
  const canvas = physicsCanvasRef.value
  if (!canvas) return
  physicsStep(canvas.width, canvas.height)
  drawPhysics()
  physicsRafId.value = requestAnimationFrame(physicsLoop)
}

function getPhysicsCanvasPos(e: MouseEvent | Touch) {
  const canvas = physicsCanvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  }
}

function onPhysicsPointerDown(e: PointerEvent) {
  const pos = getPhysicsCanvasPos(e)
  for (let i = physicsBalls.value.length - 1; i >= 0; i--) {
    const b = physicsBalls.value[i]
    const dx = pos.x - b.x
    const dy = pos.y - b.y
    if (dx * dx + dy * dy <= b.r * b.r) {
      physicsDragIndex.value = i
      b.dragging = true
      b.vx = 0
      b.vy = 0
      physicsDragOffset.x = dx
      physicsDragOffset.y = dy
      physicsLastDrag.x = pos.x
      physicsLastDrag.y = pos.y
      physicsLastDrag.time = Date.now()
      ;(e.currentTarget as HTMLElement)?.setPointerCapture(e.pointerId)
      break
    }
  }
}

function onPhysicsPointerMove(e: PointerEvent) {
  if (physicsDragIndex.value < 0) return
  const pos = getPhysicsCanvasPos(e)
  const b = physicsBalls.value[physicsDragIndex.value]
  b.x = pos.x - physicsDragOffset.x
  b.y = pos.y - physicsDragOffset.y
  physicsLastDrag.x = pos.x
  physicsLastDrag.y = pos.y
  physicsLastDrag.time = Date.now()
}

function onPhysicsPointerUp(e: PointerEvent) {
  if (physicsDragIndex.value < 0) return
  const b = physicsBalls.value[physicsDragIndex.value]
  const pos = getPhysicsCanvasPos(e)
  const dt = Math.max(1, Date.now() - physicsLastDrag.time) / 16
  b.vx = (pos.x - physicsLastDrag.x) / dt * 0.8
  b.vy = (pos.y - physicsLastDrag.y) / dt * 0.8
  b.dragging = false
  physicsDragIndex.value = -1
}

function initPhysicsCanvas() {
  const canvas = physicsCanvasRef.value
  if (!canvas) return
  const parent = canvas.parentElement
  if (!parent) return
  canvas.width = parent.clientWidth
  canvas.height = 300
  initPhysicsBalls(canvas.width, canvas.height)
  physicsLoop()
}


</script>

<template>
  <div class="interaction-effects-showcase">

    <!-- ==================== 2. Image Comparison Slider ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>图片对比滑块</h3>
          <span class="effect-name-en">Image Comparison Slider</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">纯 JS</span>
          <span class="tag-scene">产品展示、设计对比</span>
        </div>
      </div>
      <div class="effect-demo">
        <div
          ref="sliderRef"
          class="comparison-slider"
        >
          <!-- After (right / full background) -->
          <div class="comparison-after">
            <div class="comparison-card comparison-card--after">
              <div class="comp-card-header comp-card-header--after">
                <div class="comp-card-dot" /><div class="comp-card-dot" /><div class="comp-card-dot" />
              </div>
              <div class="comp-card-hero comp-card-hero--after">
                <span class="comp-card-icon">✦</span>
                <h4>VibeCoder Pro</h4>
                <p>用 AI 构建你的下一个产品</p>
              </div>
              <div class="comp-card-features comp-card-features--after">
                <div class="comp-feat comp-feat--after"><span class="comp-feat-check">✓</span> 智能代码补全</div>
                <div class="comp-feat comp-feat--after"><span class="comp-feat-check">✓</span> 一键部署上线</div>
                <div class="comp-feat comp-feat--after"><span class="comp-feat-check">✓</span> 实时协作编辑</div>
              </div>
              <button class="comp-cta comp-cta--after">立即体验</button>
            </div>
            <span class="comparison-label comparison-label--after">优化后</span>
          </div>
          <!-- Before (left / clipped overlay) -->
          <div class="comparison-before" :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }">
            <div class="comparison-card comparison-card--before">
              <div class="comp-card-header comp-card-header--before">
                <div class="comp-card-dot comp-card-dot--muted" /><div class="comp-card-dot comp-card-dot--muted" /><div class="comp-card-dot comp-card-dot--muted" />
              </div>
              <div class="comp-card-hero comp-card-hero--before">
                <span class="comp-card-icon comp-card-icon--muted">◇</span>
                <h4>VibeCoder Pro</h4>
                <p>用 AI 构建你的下一个产品</p>
              </div>
              <div class="comp-card-features comp-card-features--before">
                <div class="comp-feat comp-feat--before"><span class="comp-feat-check comp-feat-check--muted">✓</span> 智能代码补全</div>
                <div class="comp-feat comp-feat--before"><span class="comp-feat-check comp-feat-check--muted">✓</span> 一键部署上线</div>
                <div class="comp-feat comp-feat--before"><span class="comp-feat-check comp-feat-check--muted">✓</span> 实时协作编辑</div>
              </div>
              <button class="comp-cta comp-cta--before">立即体验</button>
            </div>
            <span class="comparison-label comparison-label--before">优化前</span>
          </div>
          <!-- Divider handle -->
          <div class="comparison-divider" :style="{ left: sliderPosition + '%' }">
            <div class="comparison-handle">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 4L3 10L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13 4L17 10L13 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <!-- Transparent event layer on top -->
          <div
            class="comparison-event-layer"
            @mousedown="onSliderMouseDown"
            @touchstart.prevent="onSliderTouchStart"
          />
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

    <!-- ==================== 3. Spotlight / Torch Effect ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>聚光灯效果</h3>
          <span class="effect-name-en">Spotlight / Torch Effect</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #f59e0b">中</span>
          <span class="tag-lib">JS + CSS</span>
          <span class="tag-scene">暗色主题、产品揭示</span>
        </div>
      </div>
      <div class="effect-demo spotlight-demo-outer">
        <div
          ref="spotlightRef"
          class="spotlight-container"
          @mousemove="handleSpotlightMove"
          @mouseleave="handleSpotlightLeave"
        >
          <!-- Hidden content layer -->
          <div class="spotlight-content">
            <div class="spotlight-grid">
              <div class="spotlight-card" style="background: linear-gradient(135deg, #7c4dff, #536dfe)">
                <span class="spotlight-card-icon">🚀</span>
                <span class="spotlight-card-label">快速部署</span>
              </div>
              <div class="spotlight-card" style="background: linear-gradient(135deg, #43a047, #66bb6a)">
                <span class="spotlight-card-icon">🔒</span>
                <span class="spotlight-card-label">安全可靠</span>
              </div>
              <div class="spotlight-card" style="background: linear-gradient(135deg, #ff7043, #ff8a65)">
                <span class="spotlight-card-icon">⚡</span>
                <span class="spotlight-card-label">极致性能</span>
              </div>
              <div class="spotlight-card" style="background: linear-gradient(135deg, #00bcd4, #4dd0e1)">
                <span class="spotlight-card-icon">🎨</span>
                <span class="spotlight-card-label">精美设计</span>
              </div>
              <div class="spotlight-card" style="background: linear-gradient(135deg, #f59e0b, #fbbf24)">
                <span class="spotlight-card-icon">🧩</span>
                <span class="spotlight-card-label">模块化</span>
              </div>
              <div class="spotlight-card" style="background: linear-gradient(135deg, #ec407a, #f48fb1)">
                <span class="spotlight-card-icon">🌐</span>
                <span class="spotlight-card-label">全球化</span>
              </div>
            </div>
          </div>
          <!-- Dark overlay with spotlight hole -->
          <div class="spotlight-overlay" :style="spotlightOverlayStyle" />
          <!-- Hint text -->
          <div class="spotlight-hint" :class="{ 'spotlight-hint--hidden': !spotlightHintVisible }">
            移动鼠标探索隐藏内容
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

    <!-- ==================== 5. Accordion Image Switch ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>手风琴图片切换</h3>
          <span class="effect-name-en">Accordion Image Switch</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">产品展示、作品集</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="accordion-strips">
          <div class="accordion-strip" style="background: linear-gradient(180deg, #7c4dff, #536dfe)">
            <span class="accordion-strip-icon">🎨</span>
            <span class="accordion-strip-label">设计</span>
          </div>
          <div class="accordion-strip" style="background: linear-gradient(180deg, #43a047, #66bb6a)">
            <span class="accordion-strip-icon">💻</span>
            <span class="accordion-strip-label">开发</span>
          </div>
          <div class="accordion-strip" style="background: linear-gradient(180deg, #ff7043, #ff8a65)">
            <span class="accordion-strip-icon">🚀</span>
            <span class="accordion-strip-label">部署</span>
          </div>
          <div class="accordion-strip" style="background: linear-gradient(180deg, #00bcd4, #4dd0e1)">
            <span class="accordion-strip-icon">📊</span>
            <span class="accordion-strip-label">分析</span>
          </div>
          <div class="accordion-strip" style="background: linear-gradient(180deg, #f59e0b, #fbbf24)">
            <span class="accordion-strip-icon">🔧</span>
            <span class="accordion-strip-label">运维</span>
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

    <!-- ==================== 6. FAQ Accordion ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>FAQ 折叠展开</h3>
          <span class="effect-name-en">FAQ Accordion</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">JS + CSS</span>
          <span class="tag-scene">帮助中心、产品页</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="faq-list">
          <div
            v-for="(item, i) in faqItems"
            :key="i"
            class="faq-item"
            :class="{ 'faq-item--open': activeAccordionIndex === i }"
          >
            <button class="faq-question" @click="toggleFaq(i)">
              <span>{{ item.question }}</span>
              <svg class="faq-chevron" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M5 7L9 11L13 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="faq-answer-wrapper">
              <div class="faq-answer">{{ item.answer }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[3], 3)">{{ copiedIndex === 3 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[3] }}</div>
      </div>
    </div>

    <!-- ==================== 7. Expandable Search ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>搜索框展开</h3>
          <span class="effect-name-en">Expandable Search</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">JS + CSS</span>
          <span class="tag-scene">导航栏、工具栏</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="search-expand-wrapper" :class="{ 'search-expand-wrapper--expanded': searchExpanded }">
          <button class="search-expand-btn" @click="toggleSearch">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="2"/>
              <path d="M12.5 12.5L16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <input
            ref="searchInputRef"
            class="search-expand-input"
            type="text"
            placeholder="搜索效果、组件、提示词..."
          />
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

    <!-- ==================== 8. Cursor Follow ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>鼠标跟随</h3>
          <span class="effect-name-en">Cursor Follow</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #f59e0b">中</span>
          <span class="tag-lib">Motion/JS</span>
          <span class="tag-scene">产品展示、作品集</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="cursor-demo">
          <div
            ref="cardRef"
            class="cursor-card"
            :style="{
              transform: `perspective(800px) rotateX(${cardTransform.rotateX}deg) rotateY(${cardTransform.rotateY}deg)`,
            }"
            @mousemove="handleCardMove"
            @mouseleave="handleCardLeave"
          >
            <div
              class="cursor-card-glare"
              :style="{
                background: `radial-gradient(circle at ${cardTransform.glareX}% ${cardTransform.glareY}%, rgba(255,255,255,0.25) 0%, transparent 60%)`,
              }"
            />
            <div class="cursor-card-img" />
            <div class="cursor-card-body">
              <h4>智能降噪耳机</h4>
              <p>沉浸式音频体验，40dB 主动降噪</p>
              <div class="cursor-card-price">¥1,299</div>
            </div>
          </div>
          <p class="cursor-hint">将鼠标移到卡片上试试</p>
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

    <!-- ==================== 9. Custom Cursor Interaction ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>自定义光标互动</h3>
          <span class="effect-name-en">Custom Cursor Interaction</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #f59e0b">中</span>
          <span class="tag-lib">JS + CSS</span>
          <span class="tag-scene">创意网站、作品集</span>
        </div>
      </div>
      <div class="effect-demo custom-cursor-demo-outer">
        <div
          ref="customCursorAreaRef"
          class="custom-cursor-area"
          @mousemove="handleCustomCursorMove"
          @mouseleave="handleCustomCursorLeave"
        >
          <div
            ref="customCursorRef"
            class="custom-cursor-dot"
            :class="{
              'custom-cursor-dot--visible': cursorVisible,
              'custom-cursor-dot--button': cursorType === 'button',
              'custom-cursor-dot--text': cursorType === 'text',
              'custom-cursor-dot--link': cursorType === 'link',
            }"
            :style="{ left: cursorX + 'px', top: cursorY + 'px' }"
          />
          <p class="custom-cursor-text">移动鼠标到不同元素上，观察光标变化</p>
          <div class="custom-cursor-row">
            <button class="custom-cursor-btn">悬停按钮</button>
            <a href="javascript:void(0)" class="custom-cursor-link">悬停链接</a>
          </div>
          <p class="custom-cursor-text custom-cursor-text--sub">光标会根据悬停目标自动切换形态</p>
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

    <!-- ==================== 10. Hover Media Preview ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>悬浮媒体预览</h3>
          <span class="effect-name-en">Hover Media Preview</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #f59e0b">中</span>
          <span class="tag-lib">JS + CSS</span>
          <span class="tag-scene">文章列表、作品集</span>
        </div>
      </div>
      <div class="effect-demo">
        <div ref="hoverListRef" class="hover-preview-list">
          <div
            v-for="(item, i) in hoverPreviewItems"
            :key="i"
            class="hover-preview-item"
            @mouseenter="handlePreviewEnter(i)"
            @mousemove="handlePreviewMove"
            @mouseleave="handlePreviewLeave"
          >
            <span class="hover-preview-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="hover-preview-label">{{ item.label }}</span>
            <span class="hover-preview-arrow">→</span>
          </div>
          <div
            class="hover-preview-card"
            :class="{ 'hover-preview-card--active': hoverPreviewActive }"
            :style="{
              left: hoverPreviewX + 'px',
              top: hoverPreviewY + 'px',
              background: hoverPreviewIndex >= 0 ? hoverPreviewItems[hoverPreviewIndex].gradient : '',
            }"
          >
            <span class="hover-preview-card-text">Preview</span>
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

    <!-- ==================== 11. 3D Cube Interaction ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>3D 模型交互</h3>
          <span class="effect-name-en">3D Model Interaction</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #e53935">高</span>
          <span class="tag-lib">JS + CSS</span>
          <span class="tag-scene">产品展示、创意项目</span>
        </div>
      </div>
      <div class="effect-demo cube3d-demo-outer">
        <div class="cube3d-scene">
          <div
            ref="cubeRef"
            class="cube3d-cube"
            :style="{ transform: `rotateX(${cubeRotateX}deg) rotateY(${cubeRotateY}deg)` }"
            @pointerdown="onCubePointerDown"
            @pointermove="onCubePointerMove"
            @pointerup="onCubePointerUp"
            @pointercancel="onCubePointerUp"
          >
            <div
              v-for="(face, i) in cubeFaces"
              :key="i"
              class="cube3d-face"
              :class="'cube3d-face--' + ['front','back','right','left','top','bottom'][i]"
              :style="{ background: face.bg }"
            >
              <span class="cube3d-face-icon">{{ face.icon }}</span>
              <span class="cube3d-face-label">{{ face.label }}</span>
            </div>
          </div>
        </div>
        <p class="cube3d-hint">拖拽旋转立方体，松手后自动旋转</p>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[8], 8)">{{ copiedIndex === 8 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[8] }}</div>
      </div>
    </div>

    <!-- ==================== 12. Physics Engine Layout ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>物理引擎交互布局</h3>
          <span class="effect-name-en">Physics Engine Layout</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #e53935">高</span>
          <span class="tag-lib">Canvas + JS</span>
          <span class="tag-scene">创意首页、游戏化界面</span>
        </div>
      </div>
      <div class="effect-demo physics-demo-outer">
        <div class="physics-wrapper">
          <canvas
            ref="physicsCanvasRef"
            class="physics-canvas"
            @pointerdown="onPhysicsPointerDown"
            @pointermove="onPhysicsPointerMove"
            @pointerup="onPhysicsPointerUp"
            @pointercancel="onPhysicsPointerUp"
          />
          <p class="physics-hint">拖拽并抛掷小球，观察物理碰撞效果</p>
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

  </div>
</template>

<style scoped>
/* ===== Base Layout ===== */
.interaction-effects-showcase {
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

/* ===== 2. Image Comparison Slider ===== */
.comparison-slider {
  position: relative;
  width: 100%;
  max-width: 480px;
  aspect-ratio: 4 / 3;
  border-radius: 10px;
  overflow: hidden;
}
.comparison-after,
.comparison-before {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.comparison-after {
  background: linear-gradient(135deg, #f0fdf4 0%, #e0f7fa 100%);
}
.comparison-before {
  background: #e8e8e8;
  z-index: 1;
}
.comparison-card {
  width: 280px;
  border-radius: 12px;
  overflow: hidden;
  text-align: center;
}
.comparison-card--after {
  background: #fff;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06);
}
.comparison-card--before {
  background: #f5f5f5;
  border: 1px solid #ddd;
}
.comp-card-header {
  display: flex;
  gap: 6px;
  padding: 10px 14px;
}
.comp-card-header--after {
  background: linear-gradient(135deg, #43a047, #00bcd4);
}
.comp-card-header--before {
  background: #bbb;
}
.comp-card-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
}
.comp-card-dot--muted {
  background: rgba(255, 255, 255, 0.35);
}
.comp-card-hero {
  padding: 20px 16px 12px;
}
.comp-card-hero--after h4 {
  margin: 8px 0 4px;
  font-size: 18px;
  font-weight: 800;
  color: #1a1a1a;
}
.comp-card-hero--after p {
  margin: 0;
  font-size: 12px;
  color: #555;
}
.comp-card-hero--before h4 {
  margin: 8px 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #888;
}
.comp-card-hero--before p {
  margin: 0;
  font-size: 12px;
  color: #aaa;
}
.comp-card-icon {
  font-size: 28px;
  color: var(--vp-c-brand);
}
.comp-card-icon--muted {
  color: #bbb;
  font-size: 24px;
}
.comp-card-features {
  padding: 0 20px 12px;
  text-align: left;
}
.comp-feat {
  padding: 5px 0;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.comp-feat--after {
  color: #333;
}
.comp-feat--before {
  color: #999;
}
.comp-feat-check {
  color: var(--vp-c-brand);
  font-weight: 700;
}
.comp-feat-check--muted {
  color: #ccc;
}
.comp-cta {
  margin: 4px 20px 16px;
  width: calc(100% - 40px);
  padding: 10px 0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: default;
}
.comp-cta--after {
  background: linear-gradient(135deg, #43a047, #00bcd4);
  color: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(67, 160, 71, 0.3);
}
.comp-cta--before {
  background: #ddd;
  color: #999;
  border: 1px solid #ccc;
}
.comparison-label {
  position: absolute;
  bottom: 12px;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 99px;
}
.comparison-label--after {
  right: 12px;
  background: rgba(67, 160, 71, 0.85);
  color: #fff;
}
.comparison-label--before {
  left: 12px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
}
.comparison-divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #fff;
  z-index: 2;
  transform: translateX(-50%);
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}
.comparison-event-layer {
  position: absolute;
  inset: 0;
  z-index: 5;
  cursor: ew-resize;
  touch-action: none;
}
.comparison-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-text-2);
}

/* ===== 4. Spotlight / Torch Effect ===== */
.spotlight-demo-outer {
  padding: 0;
  min-height: 300px;
}
.spotlight-container {
  position: relative;
  width: 100%;
  min-height: 300px;
  background: #0e1117;
  overflow: hidden;
  cursor: none;
}
.spotlight-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  pointer-events: none;
}
.spotlight-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 400px;
}
.spotlight-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 12px;
  border-radius: 10px;
  color: #fff;
}
.spotlight-card-icon {
  font-size: 28px;
  line-height: 1;
}
.spotlight-card-label {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}
.spotlight-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  transition: background 0.05s ease;
}
.spotlight-hint {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
  transition: opacity 0.4s ease;
}
.spotlight-hint--hidden {
  opacity: 0;
}

/* ===== 5. Accordion Image Switch ===== */
.accordion-strips {
  display: flex;
  width: 100%;
  max-width: 560px;
  height: 220px;
  border-radius: 10px;
  overflow: hidden;
  gap: 3px;
}
.accordion-strip {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: flex 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  min-width: 0;
}
.accordion-strips:hover .accordion-strip {
  flex: 0.6;
}
.accordion-strips .accordion-strip:hover {
  flex: 3;
}
.accordion-strip-icon {
  font-size: 32px;
  line-height: 1;
  transition: transform 0.4s ease;
}
.accordion-strip:hover .accordion-strip-icon {
  transform: scale(1.3);
}
.accordion-strip-label {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  opacity: 0.8;
  transition: opacity 0.3s ease, font-size 0.3s ease;
}
.accordion-strip:hover .accordion-strip-label {
  opacity: 1;
  font-size: 16px;
}

/* ===== 6. FAQ Accordion ===== */
.faq-list {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.faq-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.3s;
}
.faq-item--open {
  border-color: var(--vp-c-brand);
}
.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  gap: 12px;
  position: relative;
  z-index: 1;
  pointer-events: auto;
}
.faq-question:hover {
  color: var(--vp-c-brand);
}
.faq-chevron {
  flex-shrink: 0;
  color: var(--vp-c-text-3);
  transition: transform 0.3s ease;
}
.faq-item--open .faq-chevron {
  transform: rotate(180deg);
  color: var(--vp-c-brand);
}
.faq-answer-wrapper {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.faq-item--open .faq-answer-wrapper {
  max-height: 200px;
}
.faq-answer {
  padding: 0 18px 16px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

/* ===== 7. Expandable Search ===== */
.search-expand-wrapper {
  display: flex;
  align-items: center;
  width: 44px;
  height: 44px;
  border-radius: 22px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s;
}
.search-expand-wrapper--expanded {
  width: 340px;
  border-color: var(--vp-c-brand);
}
.search-expand-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--vp-c-text-2);
  transition: color 0.2s;
  position: relative;
  z-index: 1;
  pointer-events: auto;
}
.search-expand-btn:hover {
  color: var(--vp-c-brand);
}
.search-expand-wrapper--expanded .search-expand-btn {
  color: var(--vp-c-brand);
}
.search-expand-input {
  flex: 1;
  height: 100%;
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
  color: var(--vp-c-text-1);
  padding-right: 16px;
  min-width: 0;
  opacity: 0;
  transition: opacity 0.2s ease 0.15s;
}
.search-expand-wrapper--expanded .search-expand-input {
  opacity: 1;
}
.search-expand-input::placeholder {
  color: var(--vp-c-text-3);
}

/* ===== 8. Cursor Follow ===== */
.cursor-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.cursor-card {
  width: 280px;
  border-radius: 14px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  transition: transform 0.15s ease-out;
  position: relative;
  cursor: pointer;
}
.cursor-card-glare {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  border-radius: 14px;
}
.cursor-card-img {
  height: 160px;
  background: linear-gradient(135deg, #43a047, #00bcd4, #7c4dff);
  position: relative;
}
.cursor-card-body {
  padding: 16px;
}
.cursor-card-body h4 {
  margin: 0 0 6px;
  font-size: 16px;
  color: var(--vp-c-text-1);
}
.cursor-card-body p {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}
.cursor-card-price {
  font-size: 22px;
  font-weight: 800;
  color: var(--vp-c-brand);
}
.cursor-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin: 0;
}

/* ===== 9. Custom Cursor Interaction ===== */
.custom-cursor-demo-outer {
  padding: 0;
  min-height: 240px;
}
.custom-cursor-area {
  position: relative;
  width: 100%;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  cursor: none;
  overflow: hidden;
  padding: 32px 24px;
}
.custom-cursor-dot {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--vp-c-brand);
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: width 0.2s, height 0.2s, border-radius 0.2s, background 0.2s, border 0.2s, opacity 0.15s;
  z-index: 10;
  opacity: 0;
}
.custom-cursor-dot--visible {
  opacity: 1;
}
.custom-cursor-dot--button {
  width: 48px;
  height: 48px;
  background: rgba(124, 77, 255, 0.15);
  border: 2px solid var(--vp-c-brand);
}
.custom-cursor-dot--text {
  width: 3px;
  height: 28px;
  border-radius: 2px;
  background: var(--vp-c-brand);
}
.custom-cursor-dot--link {
  width: 36px;
  height: 36px;
  background: transparent;
  border: 2px solid #f59e0b;
  border-radius: 50%;
}
.custom-cursor-text {
  margin: 0;
  font-size: 15px;
  color: var(--vp-c-text-1);
  font-weight: 600;
  pointer-events: none;
}
.custom-cursor-text--sub {
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-weight: 400;
}
.custom-cursor-row {
  display: flex;
  gap: 20px;
  align-items: center;
}
.custom-cursor-btn {
  padding: 10px 28px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #7c4dff, #536dfe);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: none;
}
.custom-cursor-link {
  font-size: 14px;
  color: #f59e0b;
  text-decoration: underline;
  text-underline-offset: 3px;
  font-weight: 600;
  cursor: none;
}

/* ===== 10. Hover Media Preview ===== */
.hover-preview-list {
  position: relative;
  width: 100%;
  max-width: 480px;
}
.hover-preview-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--vp-c-divider);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.hover-preview-item:last-child {
  border-bottom: none;
}
.hover-preview-item:hover {
  background: var(--vp-c-bg-soft);
}
.hover-preview-num {
  font-size: 13px;
  font-weight: 700;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
}
.hover-preview-label {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.hover-preview-item:hover .hover-preview-label {
  color: var(--vp-c-brand);
}
.hover-preview-arrow {
  font-size: 16px;
  color: var(--vp-c-text-3);
  transition: transform 0.2s, color 0.2s;
}
.hover-preview-item:hover .hover-preview-arrow {
  transform: translateX(4px);
  color: var(--vp-c-brand);
}
.hover-preview-card {
  position: absolute;
  width: 160px;
  height: 110px;
  border-radius: 12px;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.85);
  transition: opacity 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
  z-index: 5;
}
.hover-preview-card--active {
  opacity: 1;
  transform: scale(1);
}
.hover-preview-card-text {
  font-size: 18px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* ===== 11. 3D Cube Interaction ===== */
.cube3d-demo-outer {
  flex-direction: column;
  gap: 12px;
  min-height: 320px;
}
.cube3d-scene {
  width: 180px;
  height: 180px;
  perspective: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cube3d-cube {
  width: 120px;
  height: 120px;
  position: relative;
  transform-style: preserve-3d;
  cursor: grab;
  touch-action: none;
}
.cube3d-cube:active {
  cursor: grabbing;
}
.cube3d-face {
  position: absolute;
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backface-visibility: visible;
}
.cube3d-face--front  { transform: translateZ(60px); }
.cube3d-face--back   { transform: rotateY(180deg) translateZ(60px); }
.cube3d-face--right  { transform: rotateY(90deg) translateZ(60px); }
.cube3d-face--left   { transform: rotateY(-90deg) translateZ(60px); }
.cube3d-face--top    { transform: rotateX(90deg) translateZ(60px); }
.cube3d-face--bottom { transform: rotateX(-90deg) translateZ(60px); }
.cube3d-face-icon {
  font-size: 32px;
  line-height: 1;
}
.cube3d-face-label {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}
.cube3d-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin: 0;
}

/* ===== 12. Physics Engine Layout ===== */
.physics-demo-outer {
  padding: 0;
  min-height: 300px;
}
.physics-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.physics-canvas {
  width: 100%;
  height: 300px;
  display: block;
  touch-action: none;
  cursor: pointer;
  background: linear-gradient(180deg, var(--vp-c-bg) 0%, var(--vp-c-bg-soft) 100%);
}
.physics-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin: 8px 0 12px;
}

/* ===== Responsive ===== */
@media (max-width: 640px) {
  .comparison-card {
    width: 220px;
  }
  .comp-card-hero--after h4,
  .comp-card-hero--before h4 {
    font-size: 15px;
  }
  .spotlight-grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 280px;
  }
  .spotlight-card {
    padding: 14px 8px;
  }
  .spotlight-card-icon {
    font-size: 22px;
  }
  .spotlight-card-label {
    font-size: 11px;
  }
  .accordion-strips {
    height: 180px;
  }
  .accordion-strip-icon {
    font-size: 24px;
  }
  .accordion-strip-label {
    font-size: 12px;
  }
  .faq-question {
    font-size: 13px;
    padding: 12px 14px;
  }
  .faq-answer {
    font-size: 12px;
    padding: 0 14px 14px;
  }
  .search-expand-wrapper--expanded {
    width: 260px;
  }
  .search-expand-input {
    font-size: 13px;
  }
  .custom-cursor-area {
    min-height: 200px;
    padding: 24px 16px;
  }
  .custom-cursor-text {
    font-size: 13px;
  }
  .custom-cursor-btn {
    padding: 8px 20px;
    font-size: 13px;
  }
  .hover-preview-item {
    padding: 10px 14px;
  }
  .hover-preview-label {
    font-size: 13px;
  }
  .hover-preview-card {
    width: 120px;
    height: 80px;
  }
  .cube3d-scene {
    width: 150px;
    height: 150px;
  }
  .cube3d-cube,
  .cube3d-face {
    width: 100px;
    height: 100px;
  }
  .cube3d-face--front  { transform: translateZ(50px); }
  .cube3d-face--back   { transform: rotateY(180deg) translateZ(50px); }
  .cube3d-face--right  { transform: rotateY(90deg) translateZ(50px); }
  .cube3d-face--left   { transform: rotateY(-90deg) translateZ(50px); }
  .cube3d-face--top    { transform: rotateX(90deg) translateZ(50px); }
  .cube3d-face--bottom { transform: rotateX(-90deg) translateZ(50px); }
  .cube3d-face-icon {
    font-size: 24px;
  }
  .cube3d-face-label {
    font-size: 12px;
  }
  .physics-canvas {
    height: 240px;
  }
}
</style>
