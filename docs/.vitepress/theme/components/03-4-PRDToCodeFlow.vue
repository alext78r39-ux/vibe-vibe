<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

type StageId = 0 | 1 | 2 | 3 | 4 | 5
type AnimationState = 'idle' | 'playing' | 'complete'

interface Stage {
  id: StageId
  icon: string
  title: string
  input: string
  output: string
  degradedOutput: string
}

const stages: Stage[] = [
  {
    id: 0,
    icon: '📄',
    title: '接收PRD',
    input: `# 在线书店 PRD\n## 目标用户\n大学生群体\n## 核心功能\n- 图书搜索与浏览\n- 购物车与下单\n- 用户评价系统`,
    output: `✅ 文档结构解析完成\n\n识别到:\n- 标题层级: 3 层\n- 功能模块: 3 个\n- 用户角色: 1 类`,
    degradedOutput: `✅ 文档结构解析完成\n\n识别到:\n- 标题层级: 3 层\n- 功能模块: 3 个\n- 用户角色: 1 类`,
  },
  {
    id: 1,
    icon: '🔍',
    title: '提取关键信息',
    input: `解析后的 PRD 文档结构\n含 3 个功能模块定义`,
    output: `用户画像: 大学生, 18-25岁\n\n核心功能:\n  1. 图书搜索 (关键词/分类)\n  2. 购物车 (增删改查)\n  3. 评价系统 (评分+文字)\n\n业务流程:\n  搜索 → 加购 → 下单 → 评价`,
    degradedOutput: `用户画像: 未明确 ⚠️\n\n核心功能:\n  1. 图书搜索\n  2. 购物车\n  3. 评价系统\n  4. 社交分享 ← 🔴 臆造\n  5. AI推荐 ← 🔴 臆造\n\n业务流程: 不清晰 ⚠️`,
  },
  {
    id: 2,
    icon: '🏗️',
    title: '构建数据模型',
    input: `提取的关键信息:\n- 图书、用户、订单、评价\n- 搜索/购物车/评价流程`,
    output: `interface Book {\n  id: string\n  title: string\n  author: string\n  price: number\n  category: string\n}\n\ninterface Order {\n  id: string\n  userId: string\n  items: OrderItem[]\n  status: OrderStatus\n}`,
    degradedOutput: `interface Book {\n  id: any       // ⚠️ 类型不明\n  title: string\n  data: object  // 🔴 含糊字段\n}\n\ninterface Order {\n  id: any\n  stuff: any[]  // 🔴 结构不清\n  // 缺少 status, userId\n}`,
  },
  {
    id: 3,
    icon: '🔌',
    title: '设计API',
    input: `数据模型:\nBook, Order, Review, User\n各含完整字段定义`,
    output: `GET    /api/books?q=&cat=\nGET    /api/books/:id\nPOST   /api/cart/items\nDELETE /api/cart/items/:id\nPOST   /api/orders\nGET    /api/orders/:id\nPOST   /api/reviews\nGET    /api/books/:id/reviews`,
    degradedOutput: `GET    /api/getData     // 🔴 语义不清\nPOST   /api/doAction   // 🔴 万能接口\nGET    /api/books\nPOST   /api/submit\n\n// ⚠️ 缺少 RESTful 规范\n// ⚠️ 无版本控制\n// ⚠️ 缺少分页参数`,
  },
  {
    id: 4,
    icon: '🎨',
    title: '生成前端',
    input: `API 规范:\n8 个 RESTful 端点\n含请求/响应类型定义`,
    output: `<template>\n  <div class="book-list">\n    <SearchBar v-model="query" />\n    <BookCard\n      v-for="book in books"\n      :key="book.id"\n      :book="book"\n      @add-to-cart="addToCart"\n    />\n  </div>\n</template>`,
    degradedOutput: `<template>\n  <div>\n    <!-- 🔴 无组件拆分 -->\n    <input v-model="x" />\n    <div v-for="i in data">\n      {{ i }}\n    </div>\n    <!-- ⚠️ 无类型, 无错误处理 -->\n  </div>\n</template>`,
  },
  {
    id: 5,
    icon: '⚙️',
    title: '生成后端',
    input: `API 规范:\n8 个 RESTful 端点\n含数据模型与验证规则`,
    output: `router.get('/api/books', async (req, res) => {\n  const { q, cat, page = 1 } = req.query\n  const books = await Book.find({\n    ...(q && { title: new RegExp(q, 'i') }),\n    ...(cat && { category: cat }),\n  })\n  .skip((page - 1) * 20)\n  .limit(20)\n  res.json({ success: true, data: books })\n})`,
    degradedOutput: `router.get('/api/getData', (req, res) => {\n  // 🔴 无参数验证\n  // 🔴 无分页\n  // 🔴 SQL 注入风险\n  db.query(\`SELECT * FROM books\n    WHERE title = '\${req.query.q}'\`)\n  .then(d => res.send(d))\n})`,
  },
]

const animationState = ref<AnimationState>('idle')
const activeStage = ref<StageId | null>(null)
const selectedStage = ref<StageId | null>(null)
const isFuzzyMode = ref(false)
const packetPos = ref<{ from: StageId; progress: number } | null>(null)
let timers: number[] = []
const isPlaying = computed(() => animationState.value === 'playing')

const phaseText = computed(() => {
  if (animationState.value === 'idle') return '点击播放，观看 AI 处理 PRD 全流程'
  if (animationState.value === 'complete') return '✅ 全部阶段完成！点击任意节点查看详情'
  if (activeStage.value !== null) return `⏳ 阶段 ${activeStage.value + 1}/6: ${stages[activeStage.value].title}...`
  return '处理中...'
})

function clearTimers() {
  timers.forEach(t => clearTimeout(t))
  timers = []
}

function resetState() {
  clearTimers()
  animationState.value = 'idle'
  activeStage.value = null
  packetPos.value = null
}

function startAnimation() {
  if (isPlaying.value) return
  resetState()
  selectedStage.value = null
  animationState.value = 'playing'
  const stageDelay = 1200
  const packetDuration = 400

  stages.forEach((stage, i) => {
    const activateTime = i * (stageDelay + packetDuration)
    timers.push(window.setTimeout(() => { activeStage.value = stage.id }, activateTime))
    if (i < stages.length - 1) {
      const packetStart = activateTime + stageDelay
      const steps = 20
      const stepTime = packetDuration / steps
      for (let s = 0; s <= steps; s++) {
        timers.push(window.setTimeout(() => {
          packetPos.value = { from: stage.id, progress: s / steps }
        }, packetStart + s * stepTime))
      }
      timers.push(window.setTimeout(() => { packetPos.value = null }, packetStart + packetDuration + 10))
    }
  })

  timers.push(window.setTimeout(() => {
    animationState.value = 'complete'
    activeStage.value = null
    packetPos.value = null
  }, stages.length * (stageDelay + packetDuration)))
}

function selectStage(id: StageId) {
  selectedStage.value = selectedStage.value === id ? null : id
}

function getStageStatus(id: StageId): 'pending' | 'active' | 'done' {
  if (animationState.value === 'idle') return 'pending'
  if (animationState.value === 'complete') return 'done'
  if (activeStage.value === null) return 'pending'
  if (id === activeStage.value) return 'active'
  if (id < activeStage.value) return 'done'
  return 'pending'
}

onUnmounted(() => { clearTimers() })
</script>
<!-- PLACEHOLDER_TEMPLATE -->

<template>
  <div class="prd-flow">
    <div class="flow-header">
      <div class="phase-indicator" :class="animationState">
        <span class="phase-text">{{ phaseText }}</span>
      </div>
      <div class="header-actions">
        <label class="fuzzy-toggle" :class="{ active: isFuzzyMode }">
          <input type="checkbox" v-model="isFuzzyMode" />
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
          <span class="toggle-label">PRD 模糊时</span>
        </label>
        <button class="play-button" :class="{ playing: isPlaying }" :disabled="isPlaying" @click="startAnimation">
          <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="31.4 31.4" class="spinner-circle"/>
          </svg>
          <span>{{ isPlaying ? '处理中...' : '播放演示' }}</span>
        </button>
      </div>
    </div>

    <div class="pipeline">
      <div v-for="(stage, i) in stages" :key="stage.id" class="pipeline-item">
        <div class="stage-node" :class="[getStageStatus(stage.id), { selected: selectedStage === stage.id }]" @click="selectStage(stage.id)">
          <span class="stage-icon">{{ stage.icon }}</span>
          <span class="stage-title">{{ stage.title }}</span>
          <span class="stage-number">{{ i + 1 }}/6</span>
          <div v-if="getStageStatus(stage.id) === 'active'" class="processing-bar"></div>
        </div>
        <div v-if="i < stages.length - 1" class="stage-connector">
          <svg class="arrow-svg" viewBox="0 0 32 24" fill="none">
            <path d="M0 12h28m0 0l-6-6m6 6l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div v-if="packetPos && packetPos.from === stage.id" class="data-packet" :style="{ left: (packetPos.progress * 100) + '%' }">📦</div>
        </div>
      </div>
    </div>

    <Transition name="slide">
      <div v-if="selectedStage !== null" class="detail-panel" :class="{ degraded: isFuzzyMode && selectedStage > 0 }">
        <div class="panel-header">
          <span class="panel-title">
            {{ stages[selectedStage].icon }} {{ stages[selectedStage].title }}
            <span v-if="isFuzzyMode && selectedStage > 0" class="degraded-badge">模糊模式</span>
          </span>
          <button class="close-btn" @click="selectedStage = null">✕</button>
        </div>
        <div class="panel-body">
          <div class="io-section">
            <div class="io-block">
              <div class="io-label"><span class="io-icon">📥</span> 输入</div>
              <pre class="io-content">{{ stages[selectedStage].input }}</pre>
            </div>
            <div class="io-arrow">→</div>
            <div class="io-block">
              <div class="io-label">
                <span class="io-icon">📤</span> 输出
                <span v-if="isFuzzyMode && selectedStage > 0" class="warning-tag">⚠️ 降级</span>
              </div>
              <pre class="io-content" :class="{ 'degraded-text': isFuzzyMode && selectedStage > 0 }">{{ isFuzzyMode && selectedStage > 0 ? stages[selectedStage].degradedOutput : stages[selectedStage].output }}</pre>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
<!-- PLACEHOLDER_STYLE -->

<style scoped>
.prd-flow {
  background: linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
}
.flow-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.phase-indicator { flex: 1; min-width: 200px; padding: 12px 20px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.3s ease; border-left: 4px solid transparent; }
.phase-indicator.playing { border-left-color: #007aff; }
.phase-indicator.complete { border-left-color: #34c759; background: #f0fff4; }
.phase-text { font-size: 14px; font-weight: 500; color: #1d1d1f; }
.header-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.fuzzy-toggle { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
.fuzzy-toggle input { display: none; }
.toggle-track { position: relative; width: 44px; height: 24px; background: #d1d1d6; border-radius: 12px; transition: background 0.2s; }
.fuzzy-toggle.active .toggle-track { background: #ff3b30; }
.toggle-thumb { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: white; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.fuzzy-toggle.active .toggle-thumb { transform: translateX(20px); }
.toggle-label { font-size: 13px; font-weight: 500; color: #1d1d1f; }
.play-button { display: flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(135deg, #007aff 0%, #5856d6 100%); color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,122,255,0.3); }
.play-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,122,255,0.4); }
.play-button:disabled { opacity: 0.7; cursor: not-allowed; }
.play-button svg { width: 20px; height: 20px; }
.spinner-circle { transform-origin: center; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.pipeline { display: flex; align-items: center; margin-bottom: 24px; overflow-x: auto; padding: 8px 0; }
.pipeline-item { display: flex; align-items: center; flex-shrink: 0; }
.stage-node { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 20px; background: white; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); cursor: pointer; transition: all 0.3s ease; border: 2px solid transparent; min-width: 100px; overflow: hidden; }
.stage-node:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.stage-node.selected { border-color: #007aff; box-shadow: 0 0 0 4px rgba(0,122,255,0.1); }
.stage-node.active { border-color: #007aff; animation: pulse-node 1.5s infinite; }
.stage-node.done { border-color: #34c759; background: #f0fff4; }
@keyframes pulse-node { 0%, 100% { box-shadow: 0 0 0 0 rgba(0,122,255,0.4); } 50% { box-shadow: 0 0 0 8px rgba(0,122,255,0); } }
.stage-icon { font-size: 28px; }
.stage-title { font-size: 12px; font-weight: 600; color: #1d1d1f; text-align: center; white-space: nowrap; }
.stage-number { font-size: 10px; color: #86868b; font-weight: 500; }
.processing-bar { position: absolute; bottom: 0; left: 0; height: 3px; background: linear-gradient(90deg, #007aff, #5856d6); border-radius: 0 0 16px 16px; animation: progress-sweep 1.2s ease-in-out infinite; }
@keyframes progress-sweep { 0% { width: 0; left: 0; } 50% { width: 100%; left: 0; } 100% { width: 0; left: 100%; } }
.stage-connector { position: relative; display: flex; align-items: center; width: 40px; height: 24px; flex-shrink: 0; }
.arrow-svg { width: 32px; height: 24px; color: #c7c7cc; margin: 0 auto; }
.data-packet { position: absolute; top: 50%; transform: translate(-50%, -50%); font-size: 16px; transition: left 0.05s linear; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15)); z-index: 2; }
.detail-panel { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.detail-panel.degraded { border: 2px solid #ff3b30; background: #fff5f5; }
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(10px); }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.panel-title { font-size: 16px; font-weight: 600; color: #1d1d1f; display: flex; align-items: center; gap: 8px; }
.degraded-badge { font-size: 11px; background: #ff3b30; color: white; padding: 2px 8px; border-radius: 6px; font-weight: 500; }
.close-btn { width: 28px; height: 28px; border-radius: 50%; border: none; background: #f5f5f7; color: #86868b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.close-btn:hover { background: #e8e8ed; color: #1d1d1f; }
.io-section { display: flex; align-items: stretch; gap: 16px; }
.io-block { flex: 1; min-width: 0; }
.io-label { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #1d1d1f; margin-bottom: 8px; }
.io-icon { font-size: 14px; }
.warning-tag { font-size: 11px; color: #ff3b30; font-weight: 500; }
.io-content { background: #f5f5f7; border-radius: 10px; padding: 14px; font-size: 12px; line-height: 1.6; font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; color: #1d1d1f; white-space: pre-wrap; word-break: break-word; margin: 0; overflow-x: auto; border: 1px solid #e8e8ed; }
.io-content.degraded-text { background: #fff0f0; border-color: #ffcccc; }
.io-arrow { display: flex; align-items: center; font-size: 24px; color: #c7c7cc; flex-shrink: 0; padding-top: 28px; }
@media (prefers-color-scheme: dark) {
  .prd-flow { background: linear-gradient(180deg, #1c1c1e 0%, #2c2c2e 100%); }
  .phase-indicator, .stage-node, .detail-panel { background: #2c2c2e; }
  .phase-indicator.complete { background: #1c3a1c; }
  .phase-text, .stage-title, .panel-title, .io-label, .toggle-label { color: #f5f5f7; }
  .stage-number { color: #8e8e93; }
  .stage-node.done { background: #1c3a1c; border-color: #34c759; }
  .io-content { background: #1c1c1e; color: #f5f5f7; border-color: #3a3a3c; }
  .io-content.degraded-text { background: #3a1c1c; border-color: #5a2c2c; }
  .detail-panel.degraded { background: #2e1c1c; border-color: #ff3b30; }
  .close-btn { background: #3a3a3c; color: #8e8e93; }
  .close-btn:hover { background: #48484a; color: #f5f5f7; }
  .arrow-svg { color: #48484a; }
  .io-arrow { color: #48484a; }
  .toggle-track { background: #48484a; }
}
@media (max-width: 640px) {
  .prd-flow { padding: 16px; }
  .flow-header { flex-direction: column; align-items: stretch; }
  .header-actions { justify-content: space-between; }
  .phase-indicator { min-width: auto; }
  .pipeline { flex-wrap: wrap; justify-content: center; gap: 8px; }
  .stage-connector { width: 24px; }
  .stage-node { min-width: 80px; padding: 12px 14px; }
  .stage-icon { font-size: 22px; }
  .stage-title { font-size: 11px; }
  .io-section { flex-direction: column; }
  .io-arrow { transform: rotate(90deg); padding-top: 0; justify-content: center; }
}
</style>
