<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{ mode: 'index' | 'pool' | 'diagnose' }>(), { mode: 'index' })

// ─── Index Mode ───
const TARGET_CELL = 73
const TOTAL_CELLS = 100
const dataSize = ref(1000)
const dataSizes = [100, 1000, 10000, 100000]
const indexRunning = ref(false)
const seqScanned = ref(0)
const seqDone = ref(false)
const idxPhase = ref(0) // 0=idle, 1..4=tree nodes lighting, 5=done
const idxDone = ref(false)
let seqTimer = 0
let idxTimers: number[] = []

const seqTime = computed(() => {
  const map: Record<number, number> = { 100: 5, 1000: 45, 10000: 420, 100000: 3800 }
  return map[dataSize.value] ?? 45
})
const idxTime = computed(() => {
  const map: Record<number, number> = { 100: 0.5, 1000: 1, 10000: 1.5, 100000: 2 }
  return map[dataSize.value] ?? 1
})
const idxJumps = computed(() => Math.ceil(Math.log2(dataSize.value)))
const speedup = computed(() => Math.round(seqTime.value / idxTime.value))

function selectSize(s: number) {
  if (indexRunning.value) return
  dataSize.value = s
  resetIndex()
}

function resetIndex() {
  clearTimeout(seqTimer)
  idxTimers.forEach(t => clearTimeout(t))
  idxTimers = []
  seqScanned.value = 0
  seqDone.value = false
  idxPhase.value = 0
  idxDone.value = false
  indexRunning.value = false
}

function runIndexDemo() {
  resetIndex()
  indexRunning.value = true
  // Sequential scan: light cells one by one up to TARGET_CELL
  const stepDelay = 3000 / TARGET_CELL
  let count = 0
  const tickSeq = () => {
    count++
    seqScanned.value = count
    if (count < TARGET_CELL) {
      seqTimer = window.setTimeout(tickSeq, stepDelay)
    } else {
      seqDone.value = true
      indexRunning.value = false
    }
  }
  seqTimer = window.setTimeout(tickSeq, stepDelay)
  // B-tree index: 4 phases with short delays
  const phases = [1, 2, 3, 4, 5]
  phases.forEach((p, i) => {
    const t = window.setTimeout(() => {
      idxPhase.value = p
      if (p === 5) idxDone.value = true
    }, 120 * (i + 1))
    idxTimers = [...idxTimers, t]
  })
}

// ─── Pool Mode ───
const poolSize = ref(5)
const poolAuto = ref(false)
let poolInterval = 0
interface LaneState {
  status: 'idle' | 'busy'
  requestId: number
  progress: number
  duration: number
  elapsed: number
}
const lanes = ref<LaneState[]>([])
const waitQueue = ref<number[]>([])
const poolLog = ref<string[]>([])
const completedCount = ref(0)
let reqCounter = 0
let laneTimers: number[] = []

function initPool() {
  laneTimers.forEach(t => clearTimeout(t))
  laneTimers = []
  lanes.value = Array.from({ length: poolSize.value }, (): LaneState => ({
    status: 'idle', requestId: 0, progress: 0, duration: 0, elapsed: 0
  }))
  waitQueue.value = []
  poolLog.value = ['连接池已初始化，' + poolSize.value + ' 个空闲连接']
  completedCount.value = 0
  reqCounter = 0
}
initPool()

function tickLaneProgress(idx: number) {
  const lane = lanes.value[idx]
  if (lane.status !== 'busy') return
  const newElapsed = lane.elapsed + 50
  const newProgress = Math.min(newElapsed / lane.duration, 1)
  lanes.value = lanes.value.map((l, i) =>
    i === idx ? { ...l, elapsed: newElapsed, progress: newProgress } : l
  )
  if (newProgress < 1) {
    const t = window.setTimeout(() => tickLaneProgress(idx), 50)
    laneTimers = [...laneTimers, t]
  } else {
    const t = window.setTimeout(() => releaseConn(idx), 200)
    laneTimers = [...laneTimers, t]
  }
}

function sendRequest() {
  reqCounter++
  const id = reqCounter
  const idle = lanes.value.findIndex(c => c.status === 'idle')
  if (idle >= 0) {
    const dur = 1500 + Math.random() * 2000
    lanes.value = lanes.value.map((c, i) =>
      i === idle ? { status: 'busy' as const, requestId: id, progress: 0, duration: dur, elapsed: 0 } : c
    )
    poolLog.value = [`#${id} -> 连接 ${idle + 1}`, ...poolLog.value.slice(0, 14)]
    const t = window.setTimeout(() => tickLaneProgress(idle), 50)
    laneTimers = [...laneTimers, t]
  } else {
    waitQueue.value = [...waitQueue.value, id]
    poolLog.value = [`#${id} -> 排队等待 (${waitQueue.value.length}个)`, ...poolLog.value.slice(0, 14)]
  }
}

function releaseConn(idx: number) {
  completedCount.value = completedCount.value + 1
  if (waitQueue.value.length > 0) {
    const nextId = waitQueue.value[0]
    waitQueue.value = waitQueue.value.slice(1)
    const dur = 1500 + Math.random() * 2000
    lanes.value = lanes.value.map((c, i) =>
      i === idx ? { status: 'busy' as const, requestId: nextId, progress: 0, duration: dur, elapsed: 0 } : c
    )
    poolLog.value = [`连接 ${idx + 1} 完成 -> 分配 #${nextId}`, ...poolLog.value.slice(0, 14)]
    const t = window.setTimeout(() => tickLaneProgress(idx), 50)
    laneTimers = [...laneTimers, t]
  } else {
    lanes.value = lanes.value.map((c, i) =>
      i === idx ? { status: 'idle' as const, requestId: 0, progress: 0, duration: 0, elapsed: 0 } : c
    )
    poolLog.value = [`连接 ${idx + 1} 完成 -> 空闲`, ...poolLog.value.slice(0, 14)]
  }
}

function toggleAutoPool() {
  poolAuto.value = !poolAuto.value
  if (poolAuto.value) {
    poolInterval = window.setInterval(() => sendRequest(), 500 + Math.random() * 600)
  } else {
    clearInterval(poolInterval)
  }
}

function resetPool() {
  poolAuto.value = false
  clearInterval(poolInterval)
  initPool()
}

const activeLanes = computed(() => lanes.value.filter(l => l.status === 'busy').length)

// ─── Diagnose Mode ───
interface DiagNode {
  question: string
  icon: string
  yes: number | string
  no: number | string
}
const diagTree: DiagNode[] = [
  { question: '页面加载慢，是数据库查询慢吗？', icon: '🔍', yes: 1, no: '检查前端渲染、图片大小、网络延迟' },
  { question: '慢查询有没有使用索引？', icon: '📑', yes: 2, no: '给 WHERE / JOIN / ORDER BY 列加索引' },
  { question: '是不是一个页面发了很多次查询？（N+1）', icon: '🔄', yes: '改成 JOIN 或批量查询，减少数据库往返', no: 3 },
  { question: '连接数接近上限？有长事务阻塞？', icon: '🔌', yes: '确认使用连接池，检查并终止长事务', no: '考虑分页优化、缓存热数据、升级数据库配置' },
]
const diagPath = ref<{ step: number; answer: boolean | null }[]>([{ step: 0, answer: null }])
const diagResult = ref<string | null>(null)

function diagAnswer(isYes: boolean) {
  const last = diagPath.value[diagPath.value.length - 1]
  diagPath.value = diagPath.value.map((p, i) =>
    i === diagPath.value.length - 1 ? { ...p, answer: isYes } : p
  )
  const next = isYes ? diagTree[last.step].yes : diagTree[last.step].no
  if (typeof next === 'string') {
    diagResult.value = next
  } else {
    diagPath.value = [...diagPath.value, { step: next, answer: null }]
  }
}

function diagReset() {
  diagPath.value = [{ step: 0, answer: null }]
  diagResult.value = null
}

// ─── Cleanup ───
onUnmounted(() => {
  clearTimeout(seqTimer)
  idxTimers.forEach(t => clearTimeout(t))
  clearInterval(poolInterval)
  laneTimers.forEach(t => clearTimeout(t))
})
</script>
<template>
  <div class="ov-root">
    <!-- ═══ Index Mode ═══ -->
    <template v-if="props.mode === 'index'">
      <div class="ov-controls">
        <span class="ov-label">数据量：</span>
        <button v-for="s in dataSizes" :key="s"
          :class="['ov-size-btn', { active: dataSize === s }]"
          @click="selectSize(s)">
          {{ s >= 1000 ? (s / 1000) + 'K' : s }}
        </button>
        <button class="ov-run-btn" @click="runIndexDemo" :disabled="indexRunning">开始查找</button>
      </div>
      <div class="ov-index-arena">
        <!-- Left: Sequential Scan -->
        <div class="ov-scan-panel">
          <div class="ov-panel-title bad">全表扫描（逐行查找）</div>
          <div class="ov-grid">
            <div v-for="i in TOTAL_CELLS" :key="'seq-'+i"
              :class="['ov-cell', {
                scanned: i <= seqScanned,
                target: i === TARGET_CELL && seqDone
              }]">
              <span class="ov-cell-num">{{ i }}</span>
            </div>
          </div>
          <div class="ov-scan-info">
            <span>已扫描: <strong>{{ seqScanned }}/{{ TOTAL_CELLS }}</strong> 行</span>
            <span v-if="seqDone" class="ov-found-tag">找到了!</span>
          </div>
        </div>
        <!-- Right: B-tree Index -->
        <div class="ov-scan-panel">
          <div class="ov-panel-title good">索引查找（B-tree 跳转）</div>
          <div class="ov-tree">
            <div class="ov-tree-level">
              <div :class="['ov-tree-node root', { lit: idxPhase >= 1 }]">根节点</div>
            </div>
            <div class="ov-tree-arrows">
              <svg width="100%" height="24" class="ov-arrow-svg">
                <line x1="50%" y1="0" x2="30%" y2="24" :class="{ 'ov-arrow-lit': idxPhase >= 2 }" />
                <line x1="50%" y1="0" x2="70%" y2="24" class="ov-arrow-dim" />
              </svg>
            </div>
            <div class="ov-tree-level">
              <div :class="['ov-tree-node mid', { lit: idxPhase >= 2 }]">50-99</div>
              <div class="ov-tree-node mid dim">0-49</div>
            </div>
            <div class="ov-tree-arrows">
              <svg width="100%" height="24" class="ov-arrow-svg">
                <line x1="30%" y1="0" x2="25%" y2="24" :class="{ 'ov-arrow-lit': idxPhase >= 3 }" />
                <line x1="30%" y1="0" x2="45%" y2="24" class="ov-arrow-dim" />
              </svg>
            </div>
            <div class="ov-tree-level">
              <div :class="['ov-tree-node leaf', { lit: idxPhase >= 3 }]">70-79</div>
              <div class="ov-tree-node leaf dim">80-99</div>
            </div>
            <div class="ov-tree-arrows">
              <svg width="100%" height="24" class="ov-arrow-svg">
                <line x1="25%" y1="0" x2="25%" y2="24" :class="{ 'ov-arrow-lit': idxPhase >= 4 }" />
              </svg>
            </div>
            <div class="ov-tree-level">
              <div :class="['ov-tree-node target-node', { lit: idxPhase >= 4 }]">
                #{{ TARGET_CELL }}
              </div>
            </div>
          </div>
          <div class="ov-scan-info">
            <span>索引跳转: 仅访问 <strong>{{ idxDone ? 4 : idxPhase }}</strong> 个节点</span>
            <span v-if="idxDone" class="ov-found-tag">找到了!</span>
          </div>
        </div>
      </div>
      <div v-if="seqDone && idxDone" class="ov-result-banner">
        <div class="ov-result-row">
          <span class="ov-result-item bad">全表扫描: {{ TARGET_CELL }}行, {{ seqTime }}ms</span>
          <span class="ov-result-divider">|</span>
          <span class="ov-result-item good">索引查找: {{ idxJumps }}次跳转, {{ idxTime }}ms</span>
          <span class="ov-result-divider">|</span>
          <span class="ov-result-item highlight">快了 {{ speedup }}x</span>
        </div>
      </div>
    </template>
    <!-- ═══ Pool Mode ═══ -->
    <template v-if="props.mode === 'pool'">
      <div class="ov-controls">
        <span class="ov-label">池大小：</span>
        <input type="range" :min="3" :max="8" v-model.number="poolSize" @input="resetPool()" class="ov-slider" />
        <span class="ov-val">{{ poolSize }}</span>
        <button class="ov-run-btn" @click="sendRequest">发送请求</button>
        <button :class="['ov-run-btn', { active: poolAuto }]" @click="toggleAutoPool()">
          {{ poolAuto ? '停止自动' : '自动模式' }}
        </button>
        <button class="ov-reset-btn" @click="resetPool">重置</button>
      </div>
      <div class="ov-pool-stats">
        活跃连接: <strong>{{ activeLanes }}/{{ poolSize }}</strong>
        &nbsp;|&nbsp; 排队: <strong :class="{ 'ov-warn': waitQueue.length > 0 }">{{ waitQueue.length }}</strong>
        &nbsp;|&nbsp; 已完成: <strong class="ov-good-num">{{ completedCount }}</strong>
      </div>
      <div class="ov-highway">
        <div class="ov-highway-label left">请求入口</div>
        <div class="ov-lanes">
          <div v-for="(lane, i) in lanes" :key="i" :class="['ov-lane', lane.status]">
            <div class="ov-lane-label">连接 {{ i + 1 }}</div>
            <div class="ov-lane-track">
              <div class="ov-lane-fill" :style="{ width: (lane.progress * 100) + '%' }"></div>
              <div v-if="lane.status === 'busy'" class="ov-lane-car" :style="{ left: (lane.progress * 85) + '%' }">
                <span class="ov-car-id">#{{ lane.requestId }}</span>
              </div>
            </div>
            <div :class="['ov-lane-status', lane.status]">
              {{ lane.status === 'idle' ? '空闲' : '忙碌' }}
            </div>
          </div>
        </div>
        <div class="ov-highway-label right">完成出口</div>
      </div>
      <div v-if="waitQueue.length" class="ov-queue-visual">
        <span class="ov-queue-label">排队中:</span>
        <span v-for="w in waitQueue" :key="w" class="ov-queue-dot">#{{ w }}</span>
      </div>
      <div class="ov-log">
        <div v-for="(l, i) in poolLog" :key="i" class="ov-log-line">{{ l }}</div>
      </div>
    </template>

    <!-- ═══ Diagnose Mode ═══ -->
    <template v-if="props.mode === 'diagnose'">
      <div class="ov-flowchart">
        <template v-for="(entry, i) in diagPath" :key="i">
          <div v-if="i > 0" class="ov-flow-arrow">
            <svg width="24" height="32"><line x1="12" y1="0" x2="12" y2="24" class="ov-flow-line" /><polygon points="6,24 12,32 18,24" class="ov-flow-tri" /></svg>
          </div>
          <div :class="['ov-flow-card', {
            current: i === diagPath.length - 1 && !diagResult,
            answered: entry.answer !== null
          }]">
            <div class="ov-flow-icon">{{ diagTree[entry.step].icon }}</div>
            <div class="ov-flow-body">
              <div class="ov-flow-step">步骤 {{ i + 1 }}</div>
              <div class="ov-flow-question">{{ diagTree[entry.step].question }}</div>
              <div v-if="entry.answer !== null" class="ov-flow-badge-row">
                <span :class="['ov-flow-badge', entry.answer ? 'yes' : 'no']">
                  {{ entry.answer ? '是' : '否' }}
                </span>
              </div>
              <div v-if="i === diagPath.length - 1 && !diagResult && entry.answer === null" class="ov-flow-actions">
                <button class="ov-ans-btn yes" @click="diagAnswer(true)">是</button>
                <button class="ov-ans-btn no" @click="diagAnswer(false)">否</button>
              </div>
            </div>
          </div>
        </template>
        <template v-if="diagResult">
          <div class="ov-flow-arrow">
            <svg width="24" height="32"><line x1="12" y1="0" x2="12" y2="24" class="ov-flow-line" /><polygon points="6,24 12,32 18,24" class="ov-flow-tri" /></svg>
          </div>
          <div class="ov-flow-result">
            <div class="ov-flow-result-icon">💡</div>
            <div class="ov-flow-result-text">{{ diagResult }}</div>
          </div>
        </template>
      </div>
      <div class="ov-diag-actions">
        <button class="ov-reset-btn" @click="diagReset">重新诊断</button>
      </div>
    </template>
  </div>
</template>
<style scoped>
.ov-root {
  margin: 1.5rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
  background: var(--vp-c-bg);
}
.ov-controls {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;
}
.ov-label { font-size: 13px; color: var(--vp-c-text-2); }
.ov-size-btn {
  padding: 4px 12px; border: 1px solid var(--vp-c-divider); border-radius: 8px;
  background: var(--vp-c-bg); cursor: pointer; font-size: 12px; color: var(--vp-c-text-2); transition: all .2s;
}
.ov-size-btn.active {
  background: var(--vp-c-brand-soft); border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1); font-weight: 600;
}
.ov-run-btn {
  padding: 6px 16px; border: 1px solid #2eb3df; border-radius: 8px;
  background: #2eb3df; color: #fff; cursor: pointer; font-size: 12px; font-weight: 600; transition: all .2s;
}
.ov-run-btn:hover { opacity: .85; }
.ov-run-btn:disabled { opacity: .5; cursor: not-allowed; }
.ov-run-btn.active { background: #ff3b30; border-color: #ff3b30; }
.ov-reset-btn {
  padding: 6px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px;
  background: var(--vp-c-bg); cursor: pointer; font-size: 12px; color: var(--vp-c-text-2); transition: all .2s;
}
.ov-reset-btn:hover { border-color: var(--vp-c-text-3); }
.ov-slider { flex: 0 0 100px; }
.ov-val { font-size: 14px; font-weight: 700; color: var(--vp-c-text-1); min-width: 20px; }

/* ═══ Index Mode ═══ */
.ov-index-arena { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.ov-scan-panel {
  border: 1px solid var(--vp-c-divider); border-radius: 12px; padding: 16px;
  background: var(--vp-c-bg-soft);
}
.ov-panel-title { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
.ov-panel-title.bad { color: #ff3b30; }
.ov-panel-title.good { color: #15a051; }
/* Grid cells */
.ov-grid {
  display: grid; grid-template-columns: repeat(10, 1fr); gap: 3px;
}
.ov-cell {
  aspect-ratio: 1; border-radius: 4px; display: flex; align-items: center; justify-content: center;
  background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider); transition: all .08s;
  position: relative;
}
.ov-cell-num { font-size: 9px; color: var(--vp-c-text-3); }
.ov-cell.scanned {
  background: #ff3b3030; border-color: #ff3b3060;
}
.ov-cell.scanned .ov-cell-num { color: #ff3b30; }
.ov-cell.target {
  background: #15a051; border-color: #15a051;
  animation: ovCellPop .3s ease;
}
.ov-cell.target .ov-cell-num { color: #fff; font-weight: 700; }
.ov-scan-info {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 10px; font-size: 12px; color: var(--vp-c-text-2);
}
.ov-scan-info strong { color: var(--vp-c-text-1); }
.ov-found-tag {
  background: #15a051; color: #fff; padding: 2px 10px; border-radius: 8px;
  font-size: 11px; font-weight: 600; animation: ovCellPop .3s ease;
}

/* B-tree */
.ov-tree { padding: 8px 0; }
.ov-tree-level { display: flex; justify-content: center; gap: 12px; }
.ov-tree-node {
  padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 600;
  border: 2px solid var(--vp-c-divider); background: var(--vp-c-bg);
  color: var(--vp-c-text-2); transition: all .2s;
}
.ov-tree-node.dim { opacity: .4; }
.ov-tree-node.lit {
  border-color: #15a051; background: #15a05118; color: #15a051;
  box-shadow: 0 0 12px #15a05130;
}
.ov-tree-node.target-node.lit {
  background: #15a051; color: #fff; border-color: #15a051;
  animation: ovCellPop .3s ease;
}
.ov-tree-arrows { display: flex; justify-content: center; }
.ov-arrow-svg { overflow: visible; }
.ov-arrow-svg line {
  stroke: var(--vp-c-divider); stroke-width: 2;
}
.ov-arrow-lit { stroke: #15a051 !important; stroke-width: 2.5 !important; }
.ov-arrow-dim { stroke: var(--vp-c-divider); }

/* Result banner */
.ov-result-banner {
  margin-top: 14px; padding: 12px 16px; border-radius: 8px;
  background: linear-gradient(135deg, #15a05112, #2eb3df12);
  border: 1px solid #15a05130; animation: ovFadeIn .4s ease;
}
.ov-result-row {
  display: flex; justify-content: center; align-items: center; gap: 12px;
  flex-wrap: wrap; font-size: 13px;
}
.ov-result-item.bad { color: #ff3b30; }
.ov-result-item.good { color: #15a051; }
.ov-result-item.highlight {
  color: #D4952C; font-weight: 700; font-size: 15px;
}
.ov-result-divider { color: var(--vp-c-divider); }
/* ═══ Pool Mode ═══ */
.ov-pool-stats {
  font-size: 13px; color: var(--vp-c-text-2); margin-bottom: 14px;
  padding: 8px 12px; background: var(--vp-c-bg-soft); border-radius: 8px;
}
.ov-pool-stats strong { color: var(--vp-c-text-1); }
.ov-warn { color: #ff3b30 !important; }
.ov-good-num { color: #15a051 !important; }
.ov-highway {
  display: flex; align-items: stretch; gap: 0; margin-bottom: 14px;
  border: 1px solid var(--vp-c-divider); border-radius: 12px; overflow: hidden;
  background: var(--vp-c-bg-soft);
}
.ov-highway-label {
  writing-mode: vertical-lr; text-orientation: mixed;
  display: flex; align-items: center; justify-content: center;
  padding: 8px 6px; font-size: 11px; font-weight: 600; color: var(--vp-c-text-3);
  background: var(--vp-c-bg); min-width: 28px;
}
.ov-highway-label.left { border-right: 1px solid var(--vp-c-divider); }
.ov-highway-label.right { border-left: 1px solid var(--vp-c-divider); }
.ov-lanes { flex: 1; padding: 8px 10px; display: flex; flex-direction: column; gap: 6px; }
.ov-lane {
  display: flex; align-items: center; gap: 8px; padding: 4px 0;
  border-bottom: 1px dashed var(--vp-c-divider);
}
.ov-lane:last-child { border-bottom: none; }
.ov-lane-label { font-size: 11px; color: var(--vp-c-text-3); min-width: 48px; font-weight: 600; }
.ov-lane-track {
  flex: 1; height: 22px; background: var(--vp-c-bg); border-radius: 6px;
  position: relative; overflow: hidden; border: 1px solid var(--vp-c-divider);
}
.ov-lane-fill {
  position: absolute; top: 0; left: 0; height: 100%; border-radius: 6px;
  transition: width .06s linear;
}
.ov-lane.idle .ov-lane-fill { background: transparent; }
.ov-lane.busy .ov-lane-fill {
  background: linear-gradient(90deg, #D4952C40, #D4952C80);
}
.ov-lane-car {
  position: absolute; top: 1px; width: 28px; height: 18px;
  background: #D4952C; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  transition: left .06s linear; z-index: 1;
}
.ov-car-id { font-size: 9px; color: #fff; font-weight: 700; }
.ov-lane-status {
  font-size: 10px; font-weight: 600; min-width: 32px; text-align: center;
  padding: 2px 6px; border-radius: 6px;
}
.ov-lane-status.idle { color: #15a051; background: #15a05115; }
.ov-lane-status.busy { color: #D4952C; background: #D4952C15; animation: ovPulse 1.2s infinite; }
.ov-queue-visual {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  margin-bottom: 12px; padding: 8px 12px;
  background: #ff3b3008; border: 1px solid #ff3b3025; border-radius: 8px;
}
.ov-queue-label { font-size: 12px; color: #ff3b30; font-weight: 600; }
.ov-queue-dot {
  width: 28px; height: 28px; border-radius: 50%;
  background: #ff3b30; color: #fff; font-size: 9px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  animation: ovBounce .5s ease;
}
.ov-log {
  max-height: 140px; overflow-y: auto;
  border: 1px solid var(--vp-c-divider); border-radius: 8px;
  padding: 8px 12px; background: var(--vp-c-bg-soft);
}
.ov-log-line {
  font-size: 11px; font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-2); padding: 2px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.ov-log-line:last-child { border-bottom: none; }
/* ═══ Diagnose Mode ═══ */
.ov-flowchart {
  display: flex; flex-direction: column; align-items: center; gap: 0;
}
.ov-flow-arrow { display: flex; justify-content: center; }
.ov-flow-line { stroke: #9333ea; stroke-width: 2; }
.ov-flow-tri { fill: #9333ea; }
.ov-flow-card {
  display: flex; gap: 12px; align-items: flex-start;
  border: 2px solid var(--vp-c-divider); border-radius: 12px;
  padding: 16px; width: 100%; max-width: 480px;
  background: var(--vp-c-bg); transition: all .3s;
  animation: ovFadeIn .3s ease;
}
.ov-flow-card.current {
  border-color: #9333ea; box-shadow: 0 0 0 3px #9333ea20;
  animation: ovPulseBorder 2s infinite;
}
.ov-flow-card.answered { border-color: var(--vp-c-divider); opacity: .75; }
.ov-flow-icon { font-size: 28px; flex-shrink: 0; }
.ov-flow-body { flex: 1; }
.ov-flow-step { font-size: 11px; color: #9333ea; font-weight: 600; margin-bottom: 4px; }
.ov-flow-question { font-size: 14px; color: var(--vp-c-text-1); line-height: 1.5; }
.ov-flow-badge-row { margin-top: 8px; }
.ov-flow-badge {
  display: inline-block; padding: 2px 12px; border-radius: 8px;
  font-size: 12px; font-weight: 600;
}
.ov-flow-badge.yes { background: #15a05120; color: #15a051; }
.ov-flow-badge.no { background: #ff3b3020; color: #ff3b30; }
.ov-flow-actions { display: flex; gap: 10px; margin-top: 12px; }
.ov-ans-btn {
  padding: 8px 28px; border: 2px solid; border-radius: 8px;
  cursor: pointer; font-size: 14px; font-weight: 600;
  transition: all .2s; background: var(--vp-c-bg);
}
.ov-ans-btn.yes { border-color: #15a051; color: #15a051; }
.ov-ans-btn.yes:hover { background: #15a05115; }
.ov-ans-btn.no { border-color: #ff3b30; color: #ff3b30; }
.ov-ans-btn.no:hover { background: #ff3b3015; }
.ov-flow-result {
  width: 100%; max-width: 480px; text-align: center;
  border: 2px solid #15a051; border-radius: 12px;
  padding: 20px; background: #15a05108;
  animation: ovFadeIn .4s ease;
}
.ov-flow-result-icon { font-size: 36px; margin-bottom: 8px; }
.ov-flow-result-text {
  font-size: 15px; color: var(--vp-c-text-1); line-height: 1.6; font-weight: 500;
}
.ov-diag-actions { display: flex; justify-content: center; margin-top: 16px; }

/* ═══ Animations ═══ */
@keyframes ovFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}
@keyframes ovCellPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
@keyframes ovPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .6; }
}
@keyframes ovBounce {
  0% { transform: scale(0); }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
@keyframes ovPulseBorder {
  0%, 100% { box-shadow: 0 0 0 3px #9333ea20; }
  50% { box-shadow: 0 0 0 6px #9333ea30; }
}

/* ═══ Responsive ═══ */
@media (max-width: 640px) {
  .ov-index-arena { grid-template-columns: 1fr; }
  .ov-controls { flex-direction: column; align-items: flex-start; }
  .ov-highway { flex-direction: column; }
  .ov-highway-label { writing-mode: horizontal-tb; padding: 6px 12px; min-width: auto; }
  .ov-highway-label.left { border-right: none; border-bottom: 1px solid var(--vp-c-divider); }
  .ov-highway-label.right { border-left: none; border-top: 1px solid var(--vp-c-divider); }
  .ov-result-row { flex-direction: column; gap: 4px; }
  .ov-result-divider { display: none; }
  .ov-flow-card { max-width: 100%; }
  .ov-flow-result { max-width: 100%; }
}
</style>
