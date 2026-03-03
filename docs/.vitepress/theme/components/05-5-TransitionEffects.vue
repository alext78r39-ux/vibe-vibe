<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

/* ── copy helper ── */
const copiedIdx = ref(-1)
function copyPrompt(text: string, idx: number) {
  navigator.clipboard.writeText(text).then(() => {
    copiedIdx.value = idx
    setTimeout(() => { copiedIdx.value = -1 }, 1500)
  })
}

/* ── prompts ── */
const prompts = [
  '做一个 3D 翻转卡片，正面显示头像和名字，鼠标悬停时翻转到背面显示简介，用 CSS perspective + transform',
  '做一个数字滚动动画组件，数字从 0 增长到目标值，滚动到视口时触发，持续 2 秒',
  '给卡片加悬浮抬起效果，hover 时向上移动 8px 并加深阴影，用 CSS transition',
  '让网格中的卡片依次交错入场，每个延迟 0.05 秒，从透明+缩小到正常状态',
  '给标题加打字机效果，文字逐字出现，末尾有闪烁的光标',
  '做一个文字从左到右逐渐揭示的动画，用 clip-path 或 overflow hidden 实现',
  '做一个文字解码效果，文字从随机字符逐个变成正确内容，像黑客电影里的解密画面，用 requestAnimationFrame 实现',
  '给标题做文字拆分动画，每个字符独立做入场动画（旋转+位移+透明度），用 GSAP SplitText 或手动拆分 span 实现',
  '做一个页面无缝过渡效果，两个面板堆叠，用 clip-path circle 从中心缩小退出旧页面，新页面从侧面滑入，纯 CSS 实现',
  '做一个动态排版艺术效果，用 SVG textPath 让文字沿圆形路径排列，两个同心圆环反向旋转，纯 CSS animation 驱动',
  '做一个类 Lottie 的矢量微动效，用 SVG 实现一个打勾成功动画：先画圆圈（stroke-dashoffset），再画对勾（stroke-dashoffset），纯 CSS animation',
  '做一个文字路径流动效果，用 SVG bezier path 定义曲线路径，textPath 让文字沿路径排列，用 animate 元素让 startOffset 持续变化实现流动',
  '做一个可变字体动画效果，鼠标水平位置控制字体粗细（font-variation-settings 的 wght 从 100 到 900），实时响应鼠标移动',
  '做一组 SVG 图标描边绘制动画，多个简单图标（星星、心形、闪电）依次用 stroke-dashoffset 从 0 画到完整路径，交错延迟',
  '做一个定制化全屏预加载效果，包含进度条和几何 Logo 动画，加载完成后用 clip-path circle 从中心向外展开揭示页面内容',
]

/* ── 1. Flip cards data ── */
const teamMembers = [
  { initials: '张', name: '张明远', role: '全栈工程师', color: '#6366f1', bio: '5 年 Web 开发经验，擅长 React 和 Node.js，热爱开源社区。', links: ['GitHub', 'Twitter'] },
  { initials: '李', name: '李思琪', role: 'UI/UX 设计师', color: '#ec4899', bio: '专注用户体验设计，Figma 深度用户，设计系统布道者。', links: ['Dribbble', 'Behance'] },
  { initials: '王', name: '王浩然', role: '后端架构师', color: '#14b8a6', bio: '分布式系统专家，Go 和 Rust 双修，性能优化狂热者。', links: ['GitHub', 'Blog'] },
]

/* ── 2. Counter animation ── */
const counters = [
  { target: 10000, suffix: '+', label: '活跃用户', icon: '👥' },
  { target: 99.9, suffix: '%', label: '可用性', icon: '🛡️', decimals: 1 },
  { target: 50, suffix: 'ms', label: '响应时间', icon: '⚡' },
  { target: 24, suffix: '/7', label: '全天候支持', icon: '🕐' },
]
const counterValues = ref<number[]>(counters.map(() => 0))
let counterRaf: number[] = []

function animateCounter(index: number) {
  const c = counters[index]
  const duration = 2000
  const start = performance.now()
  const animate = (now: number) => {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    counterValues.value[index] = c.decimals
      ? parseFloat((c.target * eased).toFixed(c.decimals))
      : Math.round(c.target * eased)
    if (progress < 1) counterRaf[index] = requestAnimationFrame(animate)
  }
  counterRaf[index] = requestAnimationFrame(animate)
}

function replayCounters() {
  counterRaf.forEach(id => cancelAnimationFrame(id))
  counterValues.value = counters.map(() => 0)
  nextTick(() => counters.forEach((_, i) => animateCounter(i)))
}

function formatCounter(val: number, c: typeof counters[0]) {
  if (c.decimals) return val.toFixed(c.decimals)
  return val >= 1000 ? val.toLocaleString() : String(val)
}

/* ── 3. Hover lift – data only ── */
const features = [
  { icon: '🚀', title: '极速部署', desc: '一键部署到全球 CDN，毫秒级响应，让用户无感等待。' },
  { icon: '🔒', title: '安全可靠', desc: '端到端加密传输，自动备份，数据安全无忧。' },
  { icon: '📊', title: '实时分析', desc: '内置数据看板，用户行为一目了然，驱动产品决策。' },
]

/* ── 4. Stagger grid ── */
const staggerColors = [
  '#fca5a5', '#fdba74', '#fcd34d', '#86efac',
  '#67e8f9', '#a5b4fc', '#c4b5fd', '#f9a8d4',
  '#fda4af', '#a3e635', '#38bdf8', '#818cf8',
]
const staggerKey = ref(0)
function replayStagger() { staggerKey.value++ }

/* ── 5. Typewriter ── */
const typewriterText = '用 AI 构建你的下一个产品'
const typewriterDisplay = ref('')
const typewriterDone = ref(false)
const subtitleVisible = ref(false)
let twTimer: ReturnType<typeof setTimeout> | null = null

function runTypewriter() {
  typewriterDisplay.value = ''
  typewriterDone.value = false
  subtitleVisible.value = false
  let i = 0
  const tick = () => {
    if (i < typewriterText.length) {
      typewriterDisplay.value = typewriterText.slice(0, i + 1)
      i++
      twTimer = setTimeout(tick, 90)
    } else {
      typewriterDone.value = true
      twTimer = setTimeout(() => { subtitleVisible.value = true }, 400)
    }
  }
  tick()
}

function replayTypewriter() {
  if (twTimer) clearTimeout(twTimer)
  runTypewriter()
}

/* ── 6. Text reveal ── */
const revealKey = ref(0)
function replayReveal() { revealKey.value++ }

/* ── 7. Text scramble ── */
const scrambleFinal1 = 'Vibe Coding 新时代'
const scrambleFinal2 = '用 AI 构建一切'
const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?<>{}[]'
const scrambleText1 = ref('')
const scrambleText2 = ref('')
const scrambleDone1 = ref<boolean[]>([])
const scrambleDone2 = ref<boolean[]>([])
let scrambleTimer1: ReturnType<typeof setInterval> | null = null
let scrambleTimer2: ReturnType<typeof setInterval> | null = null
let scrambleRaf: number | null = null

function randomChar() {
  return scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
}

function buildScrambleDisplay(final: string, done: boolean[]): string {
  return final.split('').map((ch, i) => (done[i] ? ch : randomChar())).join('')
}

function runScramble() {
  const len1 = scrambleFinal1.length
  const len2 = scrambleFinal2.length
  scrambleDone1.value = Array(len1).fill(false)
  scrambleDone2.value = Array(len2).fill(false)
  let resolved1 = 0
  let resolved2 = 0
  let line2Started = false

  // Rapid cycling for unresolved chars
  scrambleTimer1 = setInterval(() => {
    scrambleText1.value = buildScrambleDisplay(scrambleFinal1, scrambleDone1.value)
  }, 40)
  scrambleTimer2 = setInterval(() => {
    scrambleText2.value = buildScrambleDisplay(scrambleFinal2, scrambleDone2.value)
  }, 40)

  // Resolve chars one by one
  const resolveInterval = 100
  const resolveStep = () => {
    if (resolved1 < len1) {
      scrambleDone1.value[resolved1] = true
      scrambleDone1.value = [...scrambleDone1.value]
      resolved1++
    }
    // Start line 2 when line 1 is ~50% done
    if (resolved1 >= Math.floor(len1 * 0.5) && !line2Started) {
      line2Started = true
    }
    if (line2Started && resolved2 < len2) {
      scrambleDone2.value[resolved2] = true
      scrambleDone2.value = [...scrambleDone2.value]
      resolved2++
    }
    if (resolved1 >= len1 && resolved2 >= len2) {
      // Final display with correct text
      scrambleText1.value = scrambleFinal1
      scrambleText2.value = scrambleFinal2
      if (scrambleTimer1) { clearInterval(scrambleTimer1); scrambleTimer1 = null }
      if (scrambleTimer2) { clearInterval(scrambleTimer2); scrambleTimer2 = null }
      return
    }
    scrambleRaf = window.setTimeout(resolveStep, resolveInterval)
  }
  scrambleRaf = window.setTimeout(resolveStep, resolveInterval)
}

function clearScrambleTimers() {
  if (scrambleTimer1) { clearInterval(scrambleTimer1); scrambleTimer1 = null }
  if (scrambleTimer2) { clearInterval(scrambleTimer2); scrambleTimer2 = null }
  if (scrambleRaf) { clearTimeout(scrambleRaf); scrambleRaf = null }
}

function replayScramble() {
  clearScrambleTimers()
  runScramble()
}

/* ── 8. Text Split Animation ── */
const splitKey = ref(0)
function replaySplit() { splitKey.value++ }

const splitLine1 = '创造无限可能'.split('')
const splitLine2 = 'Vibe Coding'.split('')

/* ── 9. Page Seamless Transition ── */
const pageTransPanel = ref<'A' | 'B'>('A')
const pageTransPhase = ref<'idle' | 'exit' | 'enter'>('idle')
const pageTransBusy = ref(false)

function togglePageTrans() {
  if (pageTransBusy.value) return
  pageTransBusy.value = true
  // Phase 1: clip-path circle shrinks on current panel
  pageTransPhase.value = 'exit'
  setTimeout(() => {
    // Phase 2: swap panel, slide new one in from right
    pageTransPanel.value = pageTransPanel.value === 'A' ? 'B' : 'A'
    pageTransPhase.value = 'enter'
    setTimeout(() => {
      pageTransPhase.value = 'idle'
      pageTransBusy.value = false
    }, 500)
  }, 500)
}

function replayPageTrans() {
  pageTransBusy.value = false
  pageTransPhase.value = 'idle'
  pageTransPanel.value = 'A'
}

/* ── 10. Dynamic Typography Art – pure CSS rotation ── */

/* ── 11. Lottie-style Micro-animation ── */
const lottieKey = ref(0)
function replayLottie() { lottieKey.value++ }

/* ── 12. Text Path Flow – SVG animate, no JS needed ── */

/* ── 13. Variable Font Animation ── */
const varfontWeight = ref(400)
const varfontRef = ref<HTMLElement | null>(null)
function onVarfontMove(e: MouseEvent) {
  const el = varfontRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
  const ratio = x / rect.width
  varfontWeight.value = Math.round(100 + ratio * 800)
}

/* ── 14. SVG Path Stroke Drawing ── */
const strokeDrawKey = ref(0)
function replayStrokeDraw() { strokeDrawKey.value++ }

/* ── 15. Custom Fullscreen Preloader ── */
const preloaderKey = ref(0)
const preloaderProgress = ref(0)
const preloaderDone = ref(false)
let preloaderTimer: ReturnType<typeof setTimeout> | null = null
let preloaderRaf: number | null = null

function runPreloader() {
  preloaderProgress.value = 0
  preloaderDone.value = false
  const duration = 2500
  const start = performance.now()
  const tick = (now: number) => {
    const elapsed = now - start
    const p = Math.min(elapsed / duration, 1)
    preloaderProgress.value = Math.round(p * 100)
    if (p < 1) {
      preloaderRaf = requestAnimationFrame(tick)
    } else {
      preloaderTimer = setTimeout(() => { preloaderDone.value = true }, 300)
    }
  }
  preloaderRaf = requestAnimationFrame(tick)
}

function replayPreloader() {
  if (preloaderRaf) cancelAnimationFrame(preloaderRaf)
  if (preloaderTimer) clearTimeout(preloaderTimer)
  preloaderKey.value++
  nextTick(() => runPreloader())
}

/* ── lifecycle ── */
onMounted(() => {
  counters.forEach((_, i) => animateCounter(i))
  runTypewriter()
  runScramble()
  runPreloader()
})

onUnmounted(() => {
  counterRaf.forEach(id => cancelAnimationFrame(id))
  if (twTimer) clearTimeout(twTimer)
  clearScrambleTimers()
  if (preloaderRaf) cancelAnimationFrame(preloaderRaf)
  if (preloaderTimer) clearTimeout(preloaderTimer)
})
</script>

<template>
  <div class="transition-effects">

    <!-- ═══ 1. 3D Card Flip ═══ -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>3D 翻转</h3>
          <span class="effect-name-en">3D Card Flip</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color:#43a047">低</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">团队介绍、功能展示</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="flip-row">
          <div v-for="m in teamMembers" :key="m.name" class="flip-card">
            <div class="flip-inner">
              <div class="flip-front">
                <div class="avatar" :style="{ background: m.color }">{{ m.initials }}</div>
                <div class="flip-name">{{ m.name }}</div>
                <div class="flip-role">{{ m.role }}</div>
              </div>
              <div class="flip-back" :style="{ background: m.color }">
                <div class="flip-bio">{{ m.bio }}</div>
                <div class="flip-links">
                  <span v-for="l in m.links" :key="l" class="flip-link">{{ l }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[0], 0)">{{ copiedIdx === 0 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[0] }}</div>
      </div>
    </div>

    <!-- ═══ 2. Counter Animation ═══ -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>数字滚动</h3>
          <span class="effect-name-en">Counter Animation</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color:#f59e0b">中</span>
          <span class="tag-lib">Motion</span>
          <span class="tag-scene">数据展示页</span>
        </div>
      </div>
      <div class="effect-demo">
        <button class="replay-btn" @click="replayCounters">重播</button>
        <div class="counter-row">
          <div v-for="(c, i) in counters" :key="c.label" class="counter-card">
            <div class="counter-icon">{{ c.icon }}</div>
            <div class="counter-value">{{ formatCounter(counterValues[i], c) }}<span class="counter-suffix">{{ c.suffix }}</span></div>
            <div class="counter-label">{{ c.label }}</div>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[1], 1)">{{ copiedIdx === 1 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[1] }}</div>
      </div>
    </div>

    <!-- ═══ 3. Hover Lift ═══ -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>悬浮抬起</h3>
          <span class="effect-name-en">Hover Lift</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color:#43a047">低</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">卡片列表、功能展示</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="lift-row">
          <div v-for="f in features" :key="f.title" class="lift-card">
            <div class="lift-icon">{{ f.icon }}</div>
            <div class="lift-title">{{ f.title }}</div>
            <div class="lift-desc">{{ f.desc }}</div>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[2], 2)">{{ copiedIdx === 2 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[2] }}</div>
      </div>
    </div>

    <!-- ═══ 4. Stagger Animation ═══ -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>交错入场</h3>
          <span class="effect-name-en">Stagger Animation</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color:#43a047">低</span>
          <span class="tag-lib">CSS / Motion</span>
          <span class="tag-scene">网格布局、列表页</span>
        </div>
      </div>
      <div class="effect-demo">
        <button class="replay-btn" @click="replayStagger">重播</button>
        <div class="stagger-grid" :key="staggerKey">
          <div
            v-for="(color, i) in staggerColors"
            :key="i"
            class="stagger-tile"
            :style="{ '--bg': color, '--delay': `${i * 0.05}s` }"
          />
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[3], 3)">{{ copiedIdx === 3 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[3] }}</div>
      </div>
    </div>

    <!-- ═══ 5. Typewriter Effect ═══ -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>打字机效果</h3>
          <span class="effect-name-en">Typewriter Effect</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color:#43a047">低</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">首页标语、介绍文字</span>
        </div>
      </div>
      <div class="effect-demo typewriter-demo">
        <button class="replay-btn" @click="replayTypewriter">重播</button>
        <div class="typewriter-stage">
          <h2 class="typewriter-heading">
            {{ typewriterDisplay }}<span class="cursor" :class="{ blink: typewriterDone }">|</span>
          </h2>
          <p class="typewriter-sub" :class="{ visible: subtitleVisible }">
            从想法到上线，AI 帮你搞定每一步
          </p>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[4], 4)">{{ copiedIdx === 4 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[4] }}</div>
      </div>
    </div>

    <!-- ═══ 6. Text Reveal ═══ -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>文字揭示</h3>
          <span class="effect-name-en">Text Reveal</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color:#f59e0b">中</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">标题、Slogan</span>
        </div>
      </div>
      <div class="effect-demo reveal-demo">
        <button class="replay-btn" @click="replayReveal">重播</button>
        <div class="reveal-stage" :key="revealKey">
          <div class="reveal-line reveal-line-1">让页面更高级</div>
          <div class="reveal-line reveal-line-2">用动效传递品牌温度</div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[5], 5)">{{ copiedIdx === 5 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[5] }}</div>
      </div>
    </div>

    <!-- ═══ 7. Text Scramble ═══ -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>文字解码</h3>
          <span class="effect-name-en">Text Scramble</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color:#f59e0b">中</span>
          <span class="tag-lib">JS</span>
          <span class="tag-scene">暗色主题首页、科技风格</span>
        </div>
      </div>
      <div class="effect-demo scramble-demo">
        <button class="replay-btn replay-btn-dark" @click="replayScramble">重播</button>
        <div class="scramble-stage">
          <div class="scramble-line scramble-line-1">
            <span
              v-for="(ch, i) in scrambleText1.split('')"
              :key="'s1-' + i"
              :class="{ resolved: scrambleDone1[i] }"
            >{{ ch }}</span>
          </div>
          <div class="scramble-line scramble-line-2">
            <span
              v-for="(ch, i) in scrambleText2.split('')"
              :key="'s2-' + i"
              :class="{ resolved: scrambleDone2[i] }"
            >{{ ch }}</span>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[6], 6)">{{ copiedIdx === 6 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[6] }}</div>
      </div>
    </div>

    <!-- ═══ 8. Text Split Animation ═══ -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>文字拆分动画</h3>
          <span class="effect-name-en">Text Split Animation</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color:#f59e0b">中</span>
          <span class="tag-lib">GSAP SplitText / CSS</span>
          <span class="tag-scene">首页标题、品牌展示</span>
        </div>
      </div>
      <div class="effect-demo split-demo">
        <button class="replay-btn" @click="replaySplit">重播</button>
        <div class="split-stage" :key="splitKey">
          <div class="split-line split-line-1">
            <span
              v-for="(ch, i) in splitLine1"
              :key="'sp1-' + i"
              class="split-char split-char-cn"
              :style="{ '--delay': `${i * 0.06}s` }"
            >{{ ch }}</span>
          </div>
          <div class="split-line split-line-2">
            <span
              v-for="(ch, i) in splitLine2"
              :key="'sp2-' + i"
              class="split-char split-char-en"
              :style="{ '--delay': `${0.25 + i * 0.04}s` }"
            >{{ ch === ' ' ? '\u00a0' : ch }}</span>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[7], 7)">{{ copiedIdx === 7 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[7] }}</div>
      </div>
    </div>

    <!-- ═══ 9. Page Seamless Transition ═══ -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>页面无缝过渡</h3>
          <span class="effect-name-en">Page Seamless Transition</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color:#f59e0b">中</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">页面切换、路由过渡</span>
        </div>
      </div>
      <div class="effect-demo page-trans-demo">
        <button class="replay-btn" @click="replayPageTrans">重置</button>
        <div class="page-trans-container">
          <!-- Panel A: pink/rose gradient -->
          <div
            class="page-trans-panel"
            :class="{
              'page-trans-visible': pageTransPanel === 'A' && pageTransPhase === 'idle',
              'page-trans-exit': pageTransPanel !== 'A' && pageTransPhase === 'exit',
              'page-trans-enter': pageTransPanel === 'A' && pageTransPhase === 'enter',
            }"
          >
            <div class="page-trans-content" style="background: linear-gradient(135deg, #ec4899, #f43f5e);">
              <span class="page-trans-label">Panel A</span>
              <span class="page-trans-icon">☀️</span>
            </div>
          </div>
          <!-- Panel B: indigo/violet gradient -->
          <div
            class="page-trans-panel"
            :class="{
              'page-trans-visible': pageTransPanel === 'B' && pageTransPhase === 'idle',
              'page-trans-exit': pageTransPanel !== 'B' && pageTransPhase === 'exit',
              'page-trans-enter': pageTransPanel === 'B' && pageTransPhase === 'enter',
            }"
          >
            <div class="page-trans-content" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
              <span class="page-trans-label">Panel B</span>
              <span class="page-trans-icon">🌙</span>
            </div>
          </div>
          <button class="page-trans-btn" @click="togglePageTrans">切换页面</button>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[8], 8)">{{ copiedIdx === 8 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[8] }}</div>
      </div>
    </div>

    <!-- ═══ 10. Dynamic Typography Art ═══ -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>动态排版艺术</h3>
          <span class="effect-name-en">Dynamic Typography Art</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color:#f59e0b">中</span>
          <span class="tag-lib">SVG+CSS</span>
          <span class="tag-scene">品牌展示、创意首页</span>
        </div>
      </div>
      <div class="effect-demo typo-art-demo">
        <svg class="typo-art-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <path id="typo-art-outer" d="M 150,150 m -120,0 a 120,120 0 1,1 240,0 a 120,120 0 1,1 -240,0" fill="none" />
            <path id="typo-art-inner" d="M 150,150 m -75,0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" fill="none" />
          </defs>
          <circle cx="150" cy="150" r="120" fill="none" stroke="var(--vp-c-divider)" stroke-width="0.5" opacity="0.4" />
          <circle cx="150" cy="150" r="75" fill="none" stroke="var(--vp-c-divider)" stroke-width="0.5" opacity="0.4" />
          <text class="typo-art-text-outer">
            <textPath href="#typo-art-outer" startOffset="0%">
              VIBE CODING · CREATIVE DESIGN · VIBE CODING · CREATIVE DESIGN ·&#160;
            </textPath>
          </text>
          <text class="typo-art-text-inner">
            <textPath href="#typo-art-inner" startOffset="0%">
              用 AI 构建未来 · BUILD THE FUTURE · 用 AI 构建未来 · BUILD THE FUTURE ·&#160;
            </textPath>
          </text>
          <circle cx="150" cy="150" r="6" fill="var(--vp-c-brand)" opacity="0.8" />
        </svg>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[9], 9)">{{ copiedIdx === 9 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[9] }}</div>
      </div>
    </div>

    <!-- ═══ 11. Lottie-style Micro-animation ═══ -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>Lottie 矢量微动效</h3>
          <span class="effect-name-en">Lottie-style Micro-animation</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color:#f59e0b">中</span>
          <span class="tag-lib">SVG+CSS</span>
          <span class="tag-scene">成功提示、状态反馈</span>
        </div>
      </div>
      <div class="effect-demo lottie-demo">
        <button class="replay-btn" @click="replayLottie">重播</button>
        <svg :key="lottieKey" class="lottie-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle class="lottie-circle" cx="60" cy="60" r="48" fill="none" stroke="#43a047" stroke-width="4" stroke-linecap="round" />
          <polyline class="lottie-check" points="38,62 52,76 82,46" fill="none" stroke="#43a047" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <div class="lottie-label" :key="'ll-' + lottieKey">操作成功</div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[10], 10)">{{ copiedIdx === 10 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[10] }}</div>
      </div>
    </div>

    <!-- ═══ 12. Text Path Flow ═══ -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>文字路径流动</h3>
          <span class="effect-name-en">Text Path Flow</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color:#f59e0b">中</span>
          <span class="tag-lib">SVG+CSS</span>
          <span class="tag-scene">装饰性标题、创意排版</span>
        </div>
      </div>
      <div class="effect-demo text-path-demo">
        <svg class="text-path-svg" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <path id="text-path-wave" d="M 0,100 C 100,30 200,170 300,100 C 400,30 500,170 600,100" fill="none" />
          </defs>
          <path d="M 0,100 C 100,30 200,170 300,100 C 400,30 500,170 600,100" fill="none" stroke="var(--vp-c-divider)" stroke-width="0.5" opacity="0.3" />
          <text class="text-path-text">
            <textPath href="#text-path-wave">
              ✦ Vibe Coding · Build Amazing Things · Create With AI · ✦ Vibe Coding · Build Amazing Things · Create With AI ·&#160;
              <animate attributeName="startOffset" from="0%" to="100%" dur="12s" repeatCount="indefinite" />
            </textPath>
          </text>
        </svg>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[11], 11)">{{ copiedIdx === 11 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[11] }}</div>
      </div>
    </div>

    <!-- ═══ 13. Variable Font Animation ═══ -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>可变字体动画</h3>
          <span class="effect-name-en">Variable Font Animation</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color:#f59e0b">中</span>
          <span class="tag-lib">JS+CSS</span>
          <span class="tag-scene">创意标题、交互展示</span>
        </div>
      </div>
      <div class="effect-demo varfont-demo" ref="varfontRef" @mousemove="onVarfontMove">
        <div class="varfont-stage">
          <div class="varfont-text" :style="{ fontWeight: varfontWeight, fontVariationSettings: `'wght' ${varfontWeight}` }">Variable</div>
          <div class="varfont-weight">wght: {{ varfontWeight }}</div>
          <div class="varfont-hint">← 移动鼠标 →</div>
          <div class="varfont-bar">
            <div class="varfont-bar-fill" :style="{ width: ((varfontWeight - 100) / 800 * 100) + '%' }"></div>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[12], 12)">{{ copiedIdx === 12 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[12] }}</div>
      </div>
    </div>

    <!-- ═══ 14. SVG Path Stroke Drawing ═══ -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>SVG 路径描边绘制</h3>
          <span class="effect-name-en">SVG Path Stroke Drawing</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color:#43a047">低</span>
          <span class="tag-lib">SVG+CSS</span>
          <span class="tag-scene">图标动画、加载状态</span>
        </div>
      </div>
      <div class="effect-demo stroke-draw-demo">
        <button class="replay-btn" @click="replayStrokeDraw">重播</button>
        <div class="stroke-draw-row" :key="strokeDrawKey">
          <!-- Star -->
          <svg class="stroke-draw-icon" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <polygon class="stroke-draw-path stroke-draw-d0" points="40,8 48,30 72,30 52,44 60,68 40,54 20,68 28,44 8,30 32,30" fill="none" stroke="var(--vp-c-brand)" stroke-width="2.5" stroke-linejoin="round" />
          </svg>
          <!-- Heart -->
          <svg class="stroke-draw-icon" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <path class="stroke-draw-path stroke-draw-d1" d="M40,68 C20,50 8,38 8,26 C8,16 16,8 26,8 C32,8 37,11 40,16 C43,11 48,8 54,8 C64,8 72,16 72,26 C72,38 60,50 40,68Z" fill="none" stroke="#ec4899" stroke-width="2.5" stroke-linejoin="round" />
          </svg>
          <!-- Lightning -->
          <svg class="stroke-draw-icon" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <polyline class="stroke-draw-path stroke-draw-d2" points="48,8 24,42 40,42 32,72 56,38 40,38 48,8" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
          </svg>
          <!-- Code brackets -->
          <svg class="stroke-draw-icon" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <polyline class="stroke-draw-path stroke-draw-d3" points="30,18 12,40 30,62" fill="none" stroke="#14b8a6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            <polyline class="stroke-draw-path stroke-draw-d3b" points="50,18 68,40 50,62" fill="none" stroke="#14b8a6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <!-- Checkmark -->
          <svg class="stroke-draw-icon" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <circle class="stroke-draw-path stroke-draw-d4" cx="40" cy="40" r="30" fill="none" stroke="#6366f1" stroke-width="2.5" />
            <polyline class="stroke-draw-path stroke-draw-d4b" points="26,42 36,52 54,30" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[13], 13)">{{ copiedIdx === 13 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[13] }}</div>
      </div>
    </div>

    <!-- ═══ 15. Custom Fullscreen Preloader ═══ -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>定制化全屏预加载</h3>
          <span class="effect-name-en">Custom Fullscreen Preloader</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color:#e53935">高</span>
          <span class="tag-lib">JS+CSS</span>
          <span class="tag-scene">品牌首页、应用启动</span>
        </div>
      </div>
      <div class="effect-demo preloader-demo">
        <button class="replay-btn" @click="replayPreloader">重播</button>
        <div class="preloader-container" :key="preloaderKey">
          <div class="preloader-overlay" :class="{ 'preloader-reveal': preloaderDone }">
            <div class="preloader-logo">
              <div class="preloader-square preloader-sq1"></div>
              <div class="preloader-square preloader-sq2"></div>
              <div class="preloader-square preloader-sq3"></div>
            </div>
            <div class="preloader-bar-track">
              <div class="preloader-bar-fill" :style="{ width: preloaderProgress + '%' }"></div>
            </div>
            <div class="preloader-percent">{{ preloaderProgress }}%</div>
          </div>
          <div class="preloader-content">
            <div class="preloader-welcome">Welcome</div>
            <div class="preloader-sub">内容已加载完成</div>
          </div>
        </div>
      </div>
      <div class="effect-prompt">
        <div class="prompt-bar">
          <span>📋 AI 提示词</span>
          <button @click="copyPrompt(prompts[14], 14)">{{ copiedIdx === 14 ? '已复制' : '复制' }}</button>
        </div>
        <div class="prompt-text">{{ prompts[14] }}</div>
      </div>
    </div>

  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
</style>

<style scoped>
/* ── Layout ── */
.transition-effects {
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

.effect-tags span {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}

.tag-difficulty { font-weight: 700; }

/* ── Demo area ── */
.effect-demo {
  position: relative;
  min-height: 200px;
  padding: 32px 20px;
  background: var(--vp-c-bg);
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: center;
}

.replay-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 14px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
  z-index: 2;
  transition: background 0.2s, color 0.2s;
}
.replay-btn:hover {
  background: var(--vp-c-brand);
  color: #fff;
  border-color: var(--vp-c-brand);
}

/* ── Prompt area ── */
.effect-prompt {
  padding: 12px 20px 16px;
}

.prompt-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.prompt-bar button {
  padding: 2px 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.prompt-bar button:hover {
  background: var(--vp-c-brand);
  color: #fff;
}

.prompt-text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg);
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

/* ═══ 1. Flip Cards ═══ */
.flip-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.flip-card {
  width: 180px;
  height: 240px;
  perspective: 800px;
}

.flip-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.flip-card:hover .flip-inner {
  transform: rotateY(180deg);
}

.flip-front,
.flip-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
}

.flip-front {
  background: var(--vp-c-bg-soft);
}

.flip-back {
  transform: rotateY(180deg);
  color: #fff;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
}

.flip-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.flip-role {
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.flip-bio {
  font-size: 13px;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 16px;
}

.flip-links {
  display: flex;
  gap: 8px;
}

.flip-link {
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.2);
  font-size: 12px;
}

/* ═══ 2. Counter ═══ */
.counter-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.counter-card {
  text-align: center;
  min-width: 120px;
  flex: 1;
}

.counter-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.counter-value {
  font-size: 36px;
  font-weight: 800;
  color: var(--vp-c-brand);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.counter-suffix {
  font-size: 20px;
  font-weight: 600;
}

.counter-label {
  font-size: 14px;
  color: var(--vp-c-text-2);
  margin-top: 4px;
}

/* ═══ 3. Hover Lift ═══ */
.lift-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.lift-card {
  flex: 1;
  min-width: 160px;
  max-width: 240px;
  padding: 28px 20px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  text-align: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
}

.lift-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.12);
}

.lift-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.lift-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.lift-desc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-3);
}

/* ═══ 4. Stagger Grid ═══ */
.stagger-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 480px;
}

.stagger-tile {
  aspect-ratio: 1;
  border-radius: 10px;
  background: var(--bg);
  animation: staggerIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: var(--delay);
}

@keyframes staggerIn {
  from {
    opacity: 0;
    transform: scale(0.6) rotate(-6deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

/* ═══ 5. Typewriter ═══ */
.typewriter-demo {
  flex-direction: column;
  min-height: 220px;
  background: linear-gradient(135deg, var(--vp-c-bg) 0%, var(--vp-c-bg-soft) 100%);
}

.typewriter-stage {
  text-align: center;
}

.typewriter-heading {
  font-size: 32px;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin: 0 0 16px;
  min-height: 1.4em;
}

.cursor {
  color: var(--vp-c-brand);
  font-weight: 400;
}

.cursor.blink {
  animation: blink 0.8s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

.typewriter-sub {
  font-size: 16px;
  color: var(--vp-c-text-3);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.6s, transform 0.6s;
  margin: 0;
}

.typewriter-sub.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ═══ 6. Text Reveal ═══ */
.reveal-demo {
  flex-direction: column;
  min-height: 220px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.reveal-stage {
  text-align: center;
  padding: 16px 0;
}

.reveal-line {
  font-weight: 800;
  color: #fff;
  line-height: 1.4;
}

.reveal-line-1 {
  font-size: 40px;
  padding: 4px 0;
  animation: revealClip 1s cubic-bezier(0.4, 0, 0.2, 1) both;
  background: linear-gradient(90deg, #a78bfa, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.reveal-line-2 {
  font-size: 20px;
  padding: 4px 0;
  color: rgba(255,255,255,0.7);
  animation: revealClip 1s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both;
  margin-top: 12px;
}

@keyframes revealClip {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

/* ═══ 7. Text Scramble ═══ */
.scramble-demo {
  flex-direction: column;
  min-height: 220px;
  background: #0e1117;
}

.scramble-stage {
  text-align: center;
  padding: 16px 0;
  font-family: 'Courier New', 'Consolas', 'Monaco', monospace;
}

.scramble-line {
  line-height: 1.4;
  letter-spacing: 0.02em;
}

.scramble-line span {
  color: #4a5568;
  transition: color 0.15s;
}

.scramble-line span.resolved {
  color: #4ade80;
}

.scramble-line-1 {
  font-size: 36px;
  font-weight: 800;
}

.scramble-line-1 span.resolved {
  color: #4ade80;
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.3);
}

.scramble-line-2 {
  font-size: 20px;
  font-weight: 600;
  margin-top: 16px;
}

.scramble-line-2 span.resolved {
  color: #a78bfa;
  text-shadow: 0 0 8px rgba(167, 139, 250, 0.3);
}

.replay-btn-dark {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.6);
}

.replay-btn-dark:hover {
  background: var(--vp-c-brand);
  color: #fff;
  border-color: var(--vp-c-brand);
}

/* ═══ 8. Text Split Animation ═══ */
.split-demo {
  flex-direction: column;
  min-height: 220px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
}

.split-stage {
  text-align: center;
  padding: 16px 0;
  perspective: 800px;
}

.split-line {
  line-height: 1.4;
}

.split-line-1 {
  margin-bottom: 16px;
}

.split-char {
  display: inline-block;
}

.split-char-cn {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, #a78bfa, #6366f1, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  opacity: 0;
  transform: translateY(40px) rotateX(-90deg);
  animation: splitInCn 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  animation-delay: var(--delay);
}

.split-char-en {
  font-size: 28px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.05em;
  opacity: 0;
  transform: translateX(-20px) scale(0.5);
  animation: splitInEn 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  animation-delay: var(--delay);
}

@keyframes splitInCn {
  from {
    opacity: 0;
    transform: translateY(40px) rotateX(-90deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0deg);
  }
}

@keyframes splitInEn {
  from {
    opacity: 0;
    transform: translateX(-20px) scale(0.5);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* ═══ 9. Page Seamless Transition ═══ */
.page-trans-demo {
  min-height: 280px;
  padding: 32px 20px;
}

.page-trans-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 220px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.page-trans-panel {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  will-change: clip-path, transform, opacity;
}

.page-trans-panel.page-trans-visible {
  opacity: 1;
  pointer-events: auto;
  clip-path: circle(150% at 50% 50%);
  transform: translateX(0);
}

.page-trans-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #fff;
}

.page-trans-label {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.page-trans-icon {
  font-size: 40px;
}

/* Exit: clip-path circle shrinks from full to 0 at center */
.page-trans-exit {
  opacity: 1;
  pointer-events: none;
  z-index: 2;
  animation: pageTransExit 0.5s cubic-bezier(0.4, 0, 0.8, 1) forwards;
}

/* Enter: clip-path circle expands from center */
.page-trans-enter {
  opacity: 1;
  pointer-events: none;
  z-index: 1;
  animation: pageTransEnter 0.6s cubic-bezier(0.2, 0, 0.2, 1) forwards;
}

.page-trans-btn {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 24px;
  border-radius: 999px;
  border: none;
  background: rgba(255,255,255,0.25);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(4px);
  z-index: 5;
  transition: background 0.2s;
}

.page-trans-btn:hover {
  background: rgba(255,255,255,0.4);
}

@keyframes pageTransExit {
  from {
    clip-path: circle(100% at 50% 50%);
  }
  to {
    clip-path: circle(0% at 50% 50%);
  }
}

@keyframes pageTransEnter {
  from {
    clip-path: circle(0% at 50% 50%);
    opacity: 1;
  }
  to {
    clip-path: circle(100% at 50% 50%);
    opacity: 1;
  }
}

/* ═══ 10. Dynamic Typography Art ═══ */
.typo-art-demo {
  min-height: 320px;
  background: var(--vp-c-bg);
}


.typo-art-svg {
  width: 280px;
  height: 280px;
}

.typo-art-text-outer {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
  fill: var(--vp-c-brand);
  animation: typoArtRotateCW 20s linear infinite;
  transform-origin: 150px 150px;
}

.typo-art-text-inner {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.08em;
  fill: var(--vp-c-text-2);
  animation: typoArtRotateCCW 15s linear infinite;
  transform-origin: 150px 150px;
}

@keyframes typoArtRotateCW {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes typoArtRotateCCW {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

/* ═══ 11. Lottie-style Micro-animation ═══ */
.lottie-demo {
  flex-direction: column;
  gap: 16px;
  min-height: 240px;
  background: var(--vp-c-bg);
}

.lottie-svg {
  width: 100px;
  height: 100px;
}


.lottie-circle {
  stroke-dasharray: 302;
  stroke-dashoffset: 302;
  animation: lottieCircleDraw 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
}

.lottie-check {
  stroke-dasharray: 80;
  stroke-dashoffset: 80;
  animation: lottieCheckDraw 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.9s forwards;
}

@keyframes lottieCircleDraw {
  to { stroke-dashoffset: 0; }
}

@keyframes lottieCheckDraw {
  to { stroke-dashoffset: 0; }
}

.lottie-label {
  font-size: 16px;
  font-weight: 600;
  color: #43a047;
  opacity: 0;
  transform: translateY(8px);
  animation: lottieLabelIn 0.4s ease 1.4s forwards;
}

@keyframes lottieLabelIn {
  to { opacity: 1; transform: translateY(0); }
}

/* ═══ 12. Text Path Flow ═══ */
.text-path-demo {
  min-height: 200px;
  background: var(--vp-c-bg);
  overflow: hidden;
}

.text-path-svg {
  width: 100%;
  max-width: 600px;
  height: auto;
}


.text-path-text {
  font-size: 14px;
  font-weight: 600;
  fill: var(--vp-c-brand);
  letter-spacing: 0.05em;
}

/* ═══ 13. Variable Font Animation ═══ */
.varfont-demo {
  min-height: 240px;
  cursor: crosshair;
  background: linear-gradient(135deg, var(--vp-c-bg) 0%, var(--vp-c-bg-soft) 100%);
}

.varfont-stage {
  text-align: center;
  width: 100%;
  user-select: none;
}

.varfont-text {
  font-size: 64px;
  line-height: 1.2;
  color: var(--vp-c-text-1);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-weight: 400;
  transition: font-weight 0.05s ease-out, font-variation-settings 0.05s ease-out;
}

.varfont-weight {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand);
  margin-top: 12px;
  font-variant-numeric: tabular-nums;
}

.varfont-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-top: 4px;
}


.varfont-bar {
  width: 200px;
  height: 4px;
  background: var(--vp-c-divider);
  border-radius: 2px;
  margin: 12px auto 0;
  overflow: hidden;
}

.varfont-bar-fill {
  height: 100%;
  background: var(--vp-c-brand);
  border-radius: 2px;
  transition: width 0.05s ease-out;
}

/* ═══ 14. SVG Path Stroke Drawing ═══ */
.stroke-draw-demo {
  min-height: 200px;
  background: var(--vp-c-bg);
}

.stroke-draw-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.stroke-draw-icon {
  width: 64px;
  height: 64px;
}

.stroke-draw-path {
  stroke-dasharray: 300;
  stroke-dashoffset: 300;
  fill: none;
}

.stroke-draw-d0 { animation: strokeDraw 1s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards; }
.stroke-draw-d1 { animation: strokeDraw 1s cubic-bezier(0.4, 0, 0.2, 1) 0.35s forwards; }
.stroke-draw-d2 { animation: strokeDraw 1s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards; }


.stroke-draw-d3 { animation: strokeDraw 1s cubic-bezier(0.4, 0, 0.2, 1) 0.85s forwards; }
.stroke-draw-d3b { animation: strokeDraw 1s cubic-bezier(0.4, 0, 0.2, 1) 0.95s forwards; }
.stroke-draw-d4 { animation: strokeDraw 1s cubic-bezier(0.4, 0, 0.2, 1) 1.1s forwards; }
.stroke-draw-d4b { animation: strokeDraw 0.6s cubic-bezier(0.4, 0, 0.2, 1) 1.6s forwards; }

@keyframes strokeDraw {
  to { stroke-dashoffset: 0; }
}

/* ═══ 15. Custom Fullscreen Preloader ═══ */
.preloader-demo {
  min-height: 300px;
  background: #f8f9fb;
  padding: 0;
}

.preloader-container {
  position: relative;
  width: 100%;
  max-width: 480px;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  margin: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
}

.preloader-overlay {
  position: absolute;
  inset: 0;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  z-index: 2;
  clip-path: circle(100% at 50% 50%);
  transition: clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}


.preloader-overlay.preloader-reveal {
  clip-path: circle(0% at 50% 50%);
}

.preloader-logo {
  position: relative;
  width: 60px;
  height: 60px;
}

.preloader-square {
  position: absolute;
  border: 2px solid;
  border-radius: 4px;
}

.preloader-sq1 {
  width: 40px;
  height: 40px;
  top: 10px;
  left: 10px;
  border-color: #6366f1;
  animation: preloaderSpin 2s linear infinite;
}

.preloader-sq2 {
  width: 30px;
  height: 30px;
  top: 15px;
  left: 15px;
  border-color: #a78bfa;
  animation: preloaderSpin 2s linear infinite reverse;
  animation-delay: 0.3s;
}

.preloader-sq3 {
  width: 20px;
  height: 20px;
  top: 20px;
  left: 20px;
  border-color: #c4b5fd;
  animation: preloaderSpin 1.5s linear infinite;
  animation-delay: 0.6s;
}

@keyframes preloaderSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}


.preloader-bar-track {
  width: 200px;
  height: 3px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.preloader-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a78bfa);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.preloader-percent {
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
}

.preloader-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f0ff 0%, #e8eaff 50%, #f5f3ff 100%);
  z-index: 1;
}

.preloader-welcome {
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.preloader-sub {
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
}

/* ═══ Responsive ═══ */
@media (max-width: 640px) {
  .flip-row,
  .counter-row,
  .lift-row {
    flex-direction: column;
    align-items: center;
  }

  .flip-card {
    width: 100%;
    max-width: 220px;
  }

  .lift-card {
    max-width: 100%;
  }

  .stagger-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .typewriter-heading {
    font-size: 22px;
  }

  .reveal-line-1 {
    font-size: 28px;
  }

  .reveal-line-2 {
    font-size: 16px;
  }

  .counter-value {
    font-size: 28px;
  }

  .scramble-line-1 {
    font-size: 24px;
  }

  .scramble-line-2 {
    font-size: 16px;
  }

  .split-char-cn {
    font-size: 32px;
  }

  .split-char-en {
    font-size: 20px;
  }

  .effect-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-trans-container {
    height: 180px;
  }

  .page-trans-label {
    font-size: 18px;
  }

  .typo-art-svg {
    width: 220px;
    height: 220px;
  }

  .varfont-text {
    font-size: 40px;
  }

  .stroke-draw-icon {
    width: 48px;
    height: 48px;
  }

  .stroke-draw-row {
    gap: 16px;
  }

  .preloader-container {
    height: 220px;
  }

  .preloader-welcome {
    font-size: 28px;
  }
}
</style>
