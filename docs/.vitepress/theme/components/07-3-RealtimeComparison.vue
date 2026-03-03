<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const timers: number[] = []
function later(fn: () => void, ms: number) {
  const id = window.setTimeout(fn, ms)
  timers.push(id)
  return id
}
onUnmounted(() => timers.forEach(clearTimeout))

// ─── Method Definitions ───
interface Arrow {
  direction: 'right' | 'left'
  label: string
  delay: number
}

interface Method {
  name: string
  label: string
  complexity: number
  scenario: string
  color: string
  arrows: Arrow[]
}

const methods: Method[] = [
  {
    name: '轮询',
    label: '每隔几秒问一次',
    complexity: 1,
    scenario: '简单状态检查、低频更新',
    color: '#D4952C',
    arrows: [
      { direction: 'right', label: '有新数据吗？', delay: 0 },
      { direction: 'left', label: '没有', delay: 500 },
      { direction: 'right', label: '有新数据吗？', delay: 1200 },
      { direction: 'left', label: '没有', delay: 1700 },
      { direction: 'right', label: '有新数据吗？', delay: 2400 },
      { direction: 'left', label: '有！这是数据', delay: 2900 },
    ],
  },
  {
    name: 'SSE',
    label: '服务器主动推送',
    complexity: 2,
    scenario: '实时通知、股票行情、日志流',
    color: '#15a051',
    arrows: [
      { direction: 'right', label: '建立连接', delay: 0 },
      { direction: 'left', label: '连接已建立', delay: 500 },
      { direction: 'left', label: '推送: 新消息', delay: 1200 },
      { direction: 'left', label: '推送: 价格更新', delay: 2000 },
      { direction: 'left', label: '推送: 状态变更', delay: 2800 },
    ],
  },
  {
    name: 'WebSocket',
    label: '双向实时通信',
    complexity: 3,
    scenario: '聊天、协同编辑、游戏',
    color: '#9333ea',
    arrows: [
      { direction: 'right', label: '握手升级', delay: 0 },
      { direction: 'left', label: '连接已建立', delay: 500 },
      { direction: 'right', label: '发送消息', delay: 1100 },
      { direction: 'left', label: '收到回复', delay: 1600 },
      { direction: 'right', label: '发送操作', delay: 2200 },
      { direction: 'left', label: '广播更新', delay: 2700 },
    ],
  },
]

// ─── Animation State ───
interface AnimState {
  playing: boolean
  visibleArrows: number
}

const animStates = ref<AnimState[]>(
  methods.map(() => ({ playing: false, visibleArrows: 0 }))
)

function play(idx: number) {
  const state = animStates.value[idx]
  if (state.playing) return
  state.playing = true
  state.visibleArrows = 0

  const arrows = methods[idx].arrows
  arrows.forEach((arrow, i) => {
    later(() => {
      animStates.value[idx].visibleArrows = i + 1
      if (i === arrows.length - 1) {
        later(() => { animStates.value[idx].playing = false }, 800)
      }
    }, arrow.delay)
  })
}
</script>

<template>
  <div class="rc-container">
    <div class="rc-header">实时通信方式对比</div>
    <div class="rc-columns">
      <div
        v-for="(m, mi) in methods" :key="m.name"
        class="rc-col"
        :style="{ '--mc': m.color }"
      >
        <div class="rc-col-title" :style="{ color: m.color }">{{ m.name }}</div>
        <div class="rc-col-label">{{ m.label }}</div>

        <!-- Animation area -->
        <div class="rc-anim">
          <div class="rc-endpoints">
            <div class="rc-endpoint">Client</div>
            <div class="rc-endpoint">Server</div>
          </div>
          <div class="rc-track">
            <div class="rc-rail"></div>
            <div
              v-for="(arrow, ai) in m.arrows" :key="ai"
              :class="[
                'rc-arrow',
                arrow.direction === 'right' ? 'rc-arrow-right' : 'rc-arrow-left',
                { 'rc-arrow-visible': ai < animStates[mi].visibleArrows }
              ]"
            >
              <span class="rc-arrow-text">{{ arrow.label }}</span>
            </div>
          </div>
        </div>

        <!-- Meta info -->
        <div class="rc-meta">
          <div class="rc-meta-row">
            <span class="rc-meta-label">复杂度</span>
            <span class="rc-stars">
              <span v-for="s in 3" :key="s" :class="['rc-star', { filled: s <= m.complexity }]">&#9733;</span>
            </span>
          </div>
          <div class="rc-meta-row">
            <span class="rc-meta-label">适用场景</span>
            <span class="rc-meta-val">{{ m.scenario }}</span>
          </div>
        </div>

        <button
          class="rc-play-btn"
          :style="{ background: m.color }"
          :disabled="animStates[mi].playing"
          @click="play(mi)"
        >{{ animStates[mi].playing ? '播放中...' : '播放' }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rc-container {
  margin: 1.5rem 0;
  max-width: 688px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg);
}
.rc-header {
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

/* ─── Columns ─── */
.rc-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
}
.rc-col {
  padding: 16px;
  border-right: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.rc-col:last-child { border-right: none; }
.rc-col-title {
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 2px;
}
.rc-col-label {
  font-size: 11px;
  color: var(--vp-c-text-3);
  margin-bottom: 12px;
}

/* ─── Animation Area ─── */
.rc-anim {
  width: 100%;
  min-height: 180px;
  margin-bottom: 12px;
}
.rc-endpoints {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.rc-endpoint {
  font-size: 10px;
  font-weight: 700;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  padding: 3px 8px;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
}
.rc-track {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 150px;
}
.rc-rail {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background: var(--vp-c-divider);
}

/* ─── Arrows ─── */
.rc-arrow {
  display: flex;
  align-items: center;
  padding: 3px 0;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity .3s, transform .3s;
}
.rc-arrow-visible {
  opacity: 1;
  transform: none;
}
.rc-arrow-right {
  justify-content: flex-start;
  padding-left: 4px;
}
.rc-arrow-left {
  justify-content: flex-end;
  padding-right: 4px;
}
.rc-arrow-text {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  font-weight: 500;
}
.rc-arrow-right .rc-arrow-text {
  background: color-mix(in srgb, var(--mc) 15%, transparent);
  color: var(--mc);
  border-left: 2px solid var(--mc);
}
.rc-arrow-left .rc-arrow-text {
  background: color-mix(in srgb, var(--mc) 10%, transparent);
  color: var(--vp-c-text-2);
  border-right: 2px solid var(--mc);
}

/* ─── Meta Info ─── */
.rc-meta {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}
.rc-meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}
.rc-meta-label {
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  min-width: 48px;
}
.rc-meta-val {
  color: var(--vp-c-text-2);
  font-size: 11px;
}
.rc-stars { display: flex; gap: 2px; }
.rc-star {
  font-size: 14px;
  color: var(--vp-c-divider);
}
.rc-star.filled { color: var(--mc); }

/* ─── Play Button ─── */
.rc-play-btn {
  padding: 6px 20px;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity .15s;
  margin-top: auto;
}
.rc-play-btn:hover { opacity: .85; }
.rc-play-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ─── Dark Mode ─── */
:global(html.dark) .rc-endpoint { background: #1a1a2e; }

/* ─── Responsive ─── */
@media (max-width: 640px) {
  .rc-columns { grid-template-columns: 1fr; }
  .rc-col {
    border-right: none;
    border-bottom: 1px solid var(--vp-c-divider);
    padding: 14px;
  }
  .rc-col:last-child { border-bottom: none; }
  .rc-anim { min-height: 140px; }
  .rc-col-title { font-size: 14px; }
  .rc-arrow-text { font-size: 9px; }
}
</style>
