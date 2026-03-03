<script setup lang="ts">
import { ref, reactive } from 'vue'

// Copy functionality
const copiedIndex = ref<number | null>(null)
function copyPrompt(text: string, index: number) {
  navigator.clipboard.writeText(text).then(() => {
    copiedIndex.value = index
    setTimeout(() => { copiedIndex.value = null }, 1500)
  })
}

const prompts = [
  '做一个灯光追踪按钮，鼠标在按钮上移动时，按钮边缘有一个光点跟随鼠标移动，用 radial-gradient + mousemove 实现',
  '做三种填充滑动按钮：从左填充、从下填充、从中心扩展，hover 时背景色平滑滑入，纯 CSS transition 实现',
  '做一个双开门按钮效果，hover 时文字从中间分成上下两半向两侧滑开，露出底层不同颜色的背景',
  '做线条滑动按钮，hover 时上方出现一条从左滑入的线，下方出现一条从右滑入的线，纯 CSS 实现',
  '做一个弹性按钮，点击时有弹跳缩放动画（先放大再缩小再恢复），用 CSS keyframes 实现 Q 弹效果',
  '做一个发光脉冲按钮，持续呼吸式发光，hover 时光晕增强变色，用 box-shadow + animation 实现',
  '做文字逐字变色按钮，hover 时每个字符从左到右依次变色形成波浪效果，用 transition-delay 递增实现',
  '做一个磁吸按钮效果，鼠标靠近按钮时按钮微微向光标方向移动，离开时弹回原位，用 mousemove 事件 + transform 实现',
]

// ==================== 1. Light Trail Button ====================
const lightTrailRef = ref<HTMLElement | null>(null)
const lightPos = reactive({ x: 0, y: 0, active: false })

function handleLightTrailMove(e: MouseEvent) {
  if (!lightTrailRef.value) return
  const rect = lightTrailRef.value.getBoundingClientRect()
  lightPos.x = e.clientX - rect.left
  lightPos.y = e.clientY - rect.top
  lightPos.active = true
}

function handleLightTrailLeave() {
  lightPos.active = false
}

// ==================== 5. Elastic Button ====================
const elasticActive = reactive<boolean[]>([false, false, false])

function triggerElastic(index: number) {
  elasticActive[index] = true
  setTimeout(() => { elasticActive[index] = false }, 600)
}

// ==================== 7. Text Color Wave ====================
const waveText = '探索无限可能'
const waveChars = waveText.split('')

// ==================== 8. Magnetic Button ====================
const magneticZones = ref<HTMLElement[]>([])
const btnOffsets = reactive<{ x: number; y: number }[]>([
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
])

function setMagneticZone(el: HTMLElement | null, index: number) {
  if (el) magneticZones.value[index] = el
}

function handleMagneticMove(e: MouseEvent, index: number) {
  const zone = magneticZones.value[index]
  if (!zone) return
  const btn = zone.querySelector('.magnetic-btn') as HTMLElement
  if (!btn) return
  const rect = btn.getBoundingClientRect()
  const btnCenterX = rect.left + rect.width / 2
  const btnCenterY = rect.top + rect.height / 2
  const dx = e.clientX - btnCenterX
  const dy = e.clientY - btnCenterY
  const distance = Math.sqrt(dx * dx + dy * dy)
  const maxRadius = 120
  const maxDisplacement = 18
  if (distance < maxRadius) {
    const strength = 1 - distance / maxRadius
    btnOffsets[index] = {
      x: dx * strength * (maxDisplacement / maxRadius),
      y: dy * strength * (maxDisplacement / maxRadius),
    }
  } else {
    btnOffsets[index] = { x: 0, y: 0 }
  }
}

function handleMagneticLeave(index: number) {
  btnOffsets[index] = { x: 0, y: 0 }
}
</script>

<template>
  <div class="btn-fx-showcase">

    <!-- ==================== 1. Light Trail Button ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>灯光追踪按钮</h3>
          <span class="effect-name-en">Light Trail Button</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #f59e0b">中</span>
          <span class="tag-lib">JS + CSS</span>
          <span class="tag-scene">CTA 按钮、产品首页</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="btn-fx-center-row">
          <button
            ref="lightTrailRef"
            class="btn-fx-light-trail"
            @mousemove="handleLightTrailMove"
            @mouseleave="handleLightTrailLeave"
          >
            <span
              class="btn-fx-light-trail__glow"
              :style="{
                opacity: lightPos.active ? 1 : 0,
                left: lightPos.x + 'px',
                top: lightPos.y + 'px',
              }"
            />
            <span class="btn-fx-light-trail__text">开始体验</span>
          </button>
          <p class="btn-fx-hint">移动鼠标到按钮上，观察边缘光点</p>
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

    <!-- ==================== 2. Fill Slide Button ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>填充滑动按钮</h3>
          <span class="effect-name-en">Fill Slide Button</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">导航菜单、操作按钮</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="btn-fx-center-row">
          <button class="btn-fx-fill btn-fx-fill--left">从左填充</button>
          <button class="btn-fx-fill btn-fx-fill--bottom">从下填充</button>
          <button class="btn-fx-fill btn-fx-fill--center">中心扩展</button>
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

    <!-- ==================== 3. Split Door Button ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>双开门按钮</h3>
          <span class="effect-name-en">Split Door Button</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #f59e0b">中</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">创意页面、作品集</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="btn-fx-center-row">
          <button class="btn-fx-split-door">
            <span class="btn-fx-split-door__bg">EXPLORE</span>
            <span class="btn-fx-split-door__top">查看作品</span>
            <span class="btn-fx-split-door__bottom">查看作品</span>
          </button>
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

    <!-- ==================== 4. Line Slide Button ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>线条滑动按钮</h3>
          <span class="effect-name-en">Line Slide Button</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">极简风格、文字链接</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="btn-fx-center-row">
          <button class="btn-fx-line-slide">
            <span class="btn-fx-line-slide__top" />
            <span class="btn-fx-line-slide__label">了解更多</span>
            <span class="btn-fx-line-slide__bottom" />
          </button>
          <button class="btn-fx-line-slide btn-fx-line-slide--alt">
            <span class="btn-fx-line-slide__top" />
            <span class="btn-fx-line-slide__label">联系我们</span>
            <span class="btn-fx-line-slide__bottom" />
          </button>
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

    <!-- ==================== 5. Elastic Button ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>弹性按钮</h3>
          <span class="effect-name-en">Elastic Button</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">游戏化界面、趣味交互</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="btn-fx-center-row">
          <button
            v-for="(item, i) in [
              { label: '点我弹跳', variant: 'primary' },
              { label: '戳一下', variant: 'secondary' },
              { label: '弹！', variant: 'accent' },
            ]"
            :key="i"
            :class="[
              'btn-fx-elastic',
              `btn-fx-elastic--${item.variant}`,
              { 'btn-fx-elastic--active': elasticActive[i] },
            ]"
            @click="triggerElastic(i)"
          >
            {{ item.label }}
          </button>
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

    <!-- ==================== 6. Glow Pulse Button ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>发光脉冲按钮</h3>
          <span class="effect-name-en">Glow Pulse Button</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #43a047">低</span>
          <span class="tag-lib">纯 CSS</span>
          <span class="tag-scene">重要操作、引导点击</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="btn-fx-center-row">
          <button class="btn-fx-glow">立即购买</button>
          <button class="btn-fx-glow btn-fx-glow--cyan">免费试用</button>
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

    <!-- ==================== 7. Text Color Wave Button ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>文字逐字变色按钮</h3>
          <span class="effect-name-en">Text Color Wave Button</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #f59e0b">中</span>
          <span class="tag-lib">CSS + JS</span>
          <span class="tag-scene">创意标题、品牌展示</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="btn-fx-center-row">
          <button class="btn-fx-wave">
            <span
              v-for="(char, i) in waveChars"
              :key="i"
              class="btn-fx-wave__char"
              :style="{ '--i': i }"
            >{{ char }}</span>
          </button>
          <button class="btn-fx-wave btn-fx-wave--alt">
            <span
              v-for="(char, i) in '立即开始'.split('')"
              :key="'alt-' + i"
              class="btn-fx-wave__char"
              :style="{ '--i': i }"
            >{{ char }}</span>
          </button>
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

    <!-- ==================== 8. Magnetic Button ==================== -->
    <div class="effect-block">
      <div class="effect-header">
        <div class="effect-title">
          <h3>磁吸按钮</h3>
          <span class="effect-name-en">Magnetic Button</span>
        </div>
        <div class="effect-tags">
          <span class="tag-difficulty" style="color: #f59e0b">中</span>
          <span class="tag-lib">JS + CSS</span>
          <span class="tag-scene">CTA、导航</span>
        </div>
      </div>
      <div class="effect-demo">
        <div class="magnetic-demo-row">
          <div
            v-for="(label, i) in ['开始体验', '了解更多', '联系我们']"
            :key="i"
            :ref="(el: any) => setMagneticZone(el as HTMLElement, i)"
            class="magnetic-zone"
            @mousemove="handleMagneticMove($event, i)"
            @mouseleave="handleMagneticLeave(i)"
          >
            <button
              class="magnetic-btn"
              :style="{ transform: `translate(${btnOffsets[i].x}px, ${btnOffsets[i].y}px)` }"
            >{{ label }}</button>
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

  </div>
</template>

<style scoped>
/* ===== Base Layout ===== */
.btn-fx-showcase {
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
  min-height: 160px;
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

/* ===== Shared ===== */
.btn-fx-center-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 24px;
  width: 100%;
}
.btn-fx-hint {
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin: 8px 0 0;
}

/* ===== 1. Light Trail Button ===== */
.btn-fx-light-trail {
  position: relative;
  padding: 16px 40px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.3s;
}
.btn-fx-light-trail:hover {
  border-color: var(--vp-c-brand);
}
.btn-fx-light-trail__glow {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--vp-c-brand) 0%, transparent 70%);
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: opacity 0.2s;
  opacity: 0;
  mix-blend-mode: screen;
  filter: blur(8px);
}
.btn-fx-light-trail__text {
  position: relative;
  z-index: 1;
}

/* ===== 2. Fill Slide Button ===== */
.btn-fx-fill {
  position: relative;
  padding: 14px 32px;
  border-radius: 10px;
  border: 2px solid var(--vp-c-brand);
  background: transparent;
  color: var(--vp-c-brand);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: color 0.35s;
  z-index: 0;
}
.btn-fx-fill::before {
  content: '';
  position: absolute;
  z-index: -1;
  background: var(--vp-c-brand);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-fx-fill:hover {
  color: #fff;
}
.btn-fx-fill--left::before {
  inset: 0;
  transform: scaleX(0);
  transform-origin: left center;
}
.btn-fx-fill--left:hover::before {
  transform: scaleX(1);
}
.btn-fx-fill--bottom::before {
  inset: 0;
  transform: scaleY(0);
  transform-origin: bottom center;
}
.btn-fx-fill--bottom:hover::before {
  transform: scaleY(1);
}
.btn-fx-fill--center::before {
  inset: 0;
  transform: scale(0);
  border-radius: 50%;
  transform-origin: center center;
}
.btn-fx-fill--center:hover::before {
  transform: scale(1.5);
  border-radius: 0;
}

/* ===== 3. Split Door Button ===== */
.btn-fx-split-door {
  position: relative;
  padding: 16px 48px;
  border: none;
  border-radius: 10px;
  background: var(--vp-c-brand);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  overflow: hidden;
  min-height: 56px;
}
.btn-fx-split-door__bg {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 4px;
  color: #fff;
  background: linear-gradient(135deg, #7c4dff, #536dfe);
  opacity: 0;
  transition: opacity 0.35s;
}
.btn-fx-split-door:hover .btn-fx-split-door__bg {
  opacity: 1;
}
.btn-fx-split-door__top,
.btn-fx-split-door__bottom {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-brand);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}
.btn-fx-split-door__top {
  clip-path: inset(0 0 50% 0);
}
.btn-fx-split-door__bottom {
  clip-path: inset(50% 0 0 0);
}
.btn-fx-split-door:hover .btn-fx-split-door__top {
  transform: translateY(-100%);
}
.btn-fx-split-door:hover .btn-fx-split-door__bottom {
  transform: translateY(100%);
}

/* ===== 4. Line Slide Button ===== */
.btn-fx-line-slide {
  position: relative;
  padding: 14px 36px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.btn-fx-line-slide__top,
.btn-fx-line-slide__bottom {
  position: absolute;
  left: 0;
  height: 2px;
  width: 0;
  background: var(--vp-c-brand);
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-fx-line-slide__top {
  top: 0;
  left: 0;
}
.btn-fx-line-slide__bottom {
  bottom: 0;
  right: 0;
  left: auto;
}
.btn-fx-line-slide:hover .btn-fx-line-slide__top,
.btn-fx-line-slide:hover .btn-fx-line-slide__bottom {
  width: 100%;
}
.btn-fx-line-slide--alt .btn-fx-line-slide__top {
  left: auto;
  right: 0;
}
.btn-fx-line-slide--alt .btn-fx-line-slide__bottom {
  right: auto;
  left: 0;
}
.btn-fx-line-slide__label {
  position: relative;
  z-index: 1;
}

/* ===== 5. Elastic Button ===== */
.btn-fx-elastic {
  padding: 14px 32px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s;
  user-select: none;
}
.btn-fx-elastic--primary {
  background: var(--vp-c-brand);
  color: #fff;
}
.btn-fx-elastic--secondary {
  background: linear-gradient(135deg, #7c4dff, #536dfe);
  color: #fff;
}
.btn-fx-elastic--accent {
  background: linear-gradient(135deg, #ff7043, #ff8a65);
  color: #fff;
}
.btn-fx-elastic--active {
  animation: btn-fx-bounce 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
@keyframes btn-fx-bounce {
  0% { transform: scale(1); }
  15% { transform: scale(1.15, 0.9); }
  30% { transform: scale(0.9, 1.1); }
  45% { transform: scale(1.05, 0.95); }
  60% { transform: scale(0.97, 1.02); }
  75% { transform: scale(1.01, 0.99); }
  100% { transform: scale(1); }
}

/* ===== 6. Glow Pulse Button ===== */
.btn-fx-glow {
  padding: 16px 40px;
  border: none;
  border-radius: 12px;
  background: var(--vp-c-brand);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  animation: btn-fx-pulse 2.5s ease-in-out infinite;
  transition: box-shadow 0.3s, background 0.3s;
}
.btn-fx-glow:hover {
  animation: none;
  box-shadow: 0 0 20px color-mix(in srgb, var(--vp-c-brand) 60%, transparent),
              0 0 40px color-mix(in srgb, var(--vp-c-brand) 30%, transparent),
              0 0 60px color-mix(in srgb, var(--vp-c-brand) 15%, transparent);
}
.btn-fx-glow--cyan {
  background: linear-gradient(135deg, #00bcd4, #4dd0e1);
  animation-name: btn-fx-pulse-cyan;
}
.btn-fx-glow--cyan:hover {
  box-shadow: 0 0 20px rgba(0, 188, 212, 0.6),
              0 0 40px rgba(0, 188, 212, 0.3),
              0 0 60px rgba(0, 188, 212, 0.15);
}
@keyframes btn-fx-pulse {
  0%, 100% {
    box-shadow: 0 0 8px color-mix(in srgb, var(--vp-c-brand) 25%, transparent),
                0 0 16px color-mix(in srgb, var(--vp-c-brand) 10%, transparent);
  }
  50% {
    box-shadow: 0 0 16px color-mix(in srgb, var(--vp-c-brand) 45%, transparent),
                0 0 32px color-mix(in srgb, var(--vp-c-brand) 20%, transparent);
  }
}
@keyframes btn-fx-pulse-cyan {
  0%, 100% {
    box-shadow: 0 0 8px rgba(0, 188, 212, 0.25),
                0 0 16px rgba(0, 188, 212, 0.1);
  }
  50% {
    box-shadow: 0 0 16px rgba(0, 188, 212, 0.45),
                0 0 32px rgba(0, 188, 212, 0.2);
  }
}

/* ===== 7. Text Color Wave Button ===== */
.btn-fx-wave {
  padding: 14px 36px;
  border: 2px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  gap: 2px;
  transition: border-color 0.3s;
}
.btn-fx-wave:hover {
  border-color: var(--vp-c-brand);
}
.btn-fx-wave__char {
  color: var(--vp-c-text-1);
  transition: color 0.3s ease;
  transition-delay: calc(var(--i) * 0.06s);
}
.btn-fx-wave:hover .btn-fx-wave__char {
  color: var(--vp-c-brand);
}
.btn-fx-wave--alt .btn-fx-wave__char {
  transition-delay: calc(var(--i) * 0.08s);
}
.btn-fx-wave--alt:hover .btn-fx-wave__char {
  color: #7c4dff;
}

/* ===== 8. Magnetic Button ===== */
.magnetic-demo-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
}
.magnetic-zone {
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.magnetic-btn {
  padding: 14px 32px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: var(--vp-c-brand);
  color: #fff;
  transition: transform 0.25s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.magnetic-btn:hover {
  box-shadow: 0 4px 16px color-mix(in srgb, var(--vp-c-brand) 35%, transparent);
}

/* ===== Responsive ===== */
@media (max-width: 640px) {
  .btn-fx-center-row {
    gap: 16px;
  }
  .btn-fx-fill,
  .btn-fx-elastic,
  .btn-fx-glow {
    padding: 12px 24px;
    font-size: 13px;
  }
  .btn-fx-light-trail {
    padding: 14px 28px;
    font-size: 14px;
  }
  .btn-fx-split-door {
    padding: 14px 36px;
    font-size: 14px;
  }
  .btn-fx-wave {
    padding: 12px 24px;
    font-size: 16px;
  }
  .magnetic-zone {
    padding: 20px;
  }
  .magnetic-btn {
    padding: 12px 24px;
    font-size: 13px;
  }
}
</style>
