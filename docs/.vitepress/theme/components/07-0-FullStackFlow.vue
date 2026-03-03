<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{ mode?: 'dataflow' | 'rest' | 'params' }>(), { mode: 'dataflow' })

// ─── Timer cleanup ───
const timers: number[] = []
function later(fn: () => void, ms: number) {
  const id = window.setTimeout(fn, ms)
  timers.push(id)
  return id
}
onUnmounted(() => timers.forEach(clearTimeout))

// ─── MODE 1: Data Flow Animation ───
interface Operation {
  label: string; color: string; http: string; sql: string; response: string
}
const ops: Operation[] = [
  { label: '创建', color: '#2eb3df', http: 'POST /api/todos', sql: "INSERT INTO todos (title) VALUES ('学习API')", response: "{ id: 1, title: '学习API' }" },
  { label: '查询', color: '#15a051', http: 'GET /api/todos', sql: 'SELECT * FROM todos', response: "[{ id: 1, title: '学习API' }]" },
  { label: '更新', color: '#D4952C', http: 'PATCH /api/todos/1', sql: 'UPDATE todos SET completed = true WHERE id = 1', response: '{ id: 1, completed: true }' },
  { label: '删除', color: '#ff3b30', http: 'DELETE /api/todos/1', sql: 'DELETE FROM todos WHERE id = 1', response: '{ success: true }' },
]
const nodes = [
  { icon: '👤', name: '用户' },
  { icon: '📱', name: '前端' },
  { icon: '⚙️', name: 'API' },
  { icon: '🗄️', name: '数据库' },
]
const bubbles = [
  (op: Operation) => `发送 ${op.http}`,
  (_op: Operation) => `转发请求到服务器`,
  (op: Operation) => op.sql,
  (op: Operation) => op.response,
]
const dfOp = ref(0)
const dfStep = ref(-1)
const dfReturning = ref(false)
const dfBusy = ref(false)
const dfBubble = ref('')

function dfStart() {
  if (dfBusy.value) return
  dfBusy.value = true
  dfStep.value = -1
  dfReturning.value = false
  dfBubble.value = ''
  const op = ops[dfOp.value]
  let step = 0
  const forward = () => {
    if (step < 4) {
      dfStep.value = step
      dfReturning.value = false
      dfBubble.value = bubbles[step](op)
      step++
      later(forward, 700)
    } else {
      step = 3
      dfReturning.value = true
      const backward = () => {
        if (step >= 0) {
          dfStep.value = step
          dfBubble.value = step === 0 ? '收到响应: ' + op.response : '返回数据...'
          step--
          later(backward, 600)
        } else {
          dfBusy.value = false
        }
      }
      later(backward, 300)
    }
  }
  later(forward, 200)
}

// ─── MODE 2: REST Method Explorer ───
interface RestCard {
  method: string; color: string; crud: string; url: string; summary: string
  request: string; response: string
}
const restCards: RestCard[] = [
  { method: 'GET', color: '#2eb3df', crud: '读取 (Read)', url: 'GET /api/posts', summary: '读取数据，不修改任何东西',
    request: '// 无请求体', response: '[\n  { "id": 1, "title": "Hello" },\n  { "id": 2, "title": "World" }\n]' },
  { method: 'POST', color: '#15a051', crud: '创建 (Create)', url: 'POST /api/posts', summary: '创建新资源，服务器分配 ID',
    request: '{\n  "title": "新文章",\n  "content": "正文内容"\n}', response: '{\n  "id": 3,\n  "title": "新文章",\n  "createdAt": "2026-02-23"\n}' },
  { method: 'PATCH', color: '#D4952C', crud: '更新 (Update)', url: 'PATCH /api/posts/1', summary: '部分更新已有资源的字段',
    request: '{\n  "title": "修改后的标题"\n}', response: '{\n  "id": 1,\n  "title": "修改后的标题",\n  "updatedAt": "2026-02-23"\n}' },
  { method: 'DELETE', color: '#ff3b30', crud: '删除 (Delete)', url: 'DELETE /api/posts/1', summary: '删除指定资源，通常无返回体',
    request: '// 无请求体', response: '{\n  "success": true\n}' },
]
const restSelected = ref(-1)

// ─── MODE 3: Parameter Source Visualization ───
interface ParamScene {
  label: string; method: string; url: string; pathParam?: string; pathLabel?: string
  queryParams?: { key: string; val: string }[]; body?: string
}
const paramScenes: ParamScene[] = [
  { label: '获取文章', method: 'GET', url: '/api/posts', queryParams: [{ key: 'page', val: '1' }] },
  { label: '获取单篇', method: 'GET', url: '/api/posts/123', pathParam: '123', pathLabel: '路径参数 params.id' },
  { label: '创建文章', method: 'POST', url: '/api/posts', body: '{\n  "title": "新文章",\n  "content": "正文..."\n}' },
]
const paramIdx = ref(0)
const activeScene = computed(() => paramScenes[paramIdx.value])
</script>

<template>
  <div class="ff-container">
    <!-- MODE: dataflow -->
    <div v-if="props.mode === 'dataflow'" class="ff-body">
      <div class="ff-op-bar">
        <button v-for="(op, i) in ops" :key="i"
          :class="['ff-op-btn', { active: dfOp === i }]"
          :style="{ '--op-color': op.color }"
          @click="dfOp = i">{{ op.label }}</button>
        <button class="ff-go-btn" @click="dfStart" :disabled="dfBusy">发起请求</button>
      </div>
      <div class="ff-flow-track">
        <div class="ff-nodes">
          <template v-for="(node, i) in nodes" :key="i">
            <div :class="['ff-node', { 'ff-node-active': dfStep === i }]">
              <div class="ff-node-icon">{{ node.icon }}</div>
              <div class="ff-node-name">{{ node.name }}</div>
              <div v-if="dfStep === i" class="ff-bubble" :style="{ borderColor: dfReturning ? '#15a051' : ops[dfOp].color }">
                {{ dfBubble }}
              </div>
            </div>
            <div v-if="i < nodes.length - 1" class="ff-connector">
              <div class="ff-line"></div>
              <div v-if="dfBusy && dfStep === (dfReturning ? i + 1 : i)"
                class="ff-ball"
                :class="{ 'ff-ball-return': dfReturning }"
                :style="{ background: dfReturning ? '#15a051' : ops[dfOp].color }"></div>
            </div>
          </template>
        </div>
      </div>
      <div v-if="dfStep >= 0" class="ff-info-bar">
        <div class="ff-info-item"><span class="ff-info-label">HTTP</span><code>{{ ops[dfOp].http }}</code></div>
        <div class="ff-info-item"><span class="ff-info-label">SQL</span><code>{{ ops[dfOp].sql }}</code></div>
      </div>
    </div>

    <!-- MODE: rest -->
    <div v-if="props.mode === 'rest'" class="ff-body">
      <div class="ff-rest-cards">
        <div v-for="(card, i) in restCards" :key="i"
          :class="['ff-rest-card', { 'ff-rest-selected': restSelected === i }]"
          :style="{ '--card-color': card.color }"
          @click="restSelected = restSelected === i ? -1 : i">
          <div class="ff-rest-method" :style="{ color: card.color }">{{ card.method }}</div>
          <div class="ff-rest-crud">{{ card.crud }}</div>
        </div>
      </div>
      <transition name="ff-slide">
        <div v-if="restSelected >= 0" class="ff-rest-detail" :style="{ '--card-color': restCards[restSelected].color }">
          <div class="ff-rest-url"><code>{{ restCards[restSelected].url }}</code> → {{ restCards[restSelected].crud }}</div>
          <div class="ff-rest-summary">{{ restCards[restSelected].summary }}</div>
          <div class="ff-rest-panels">
            <div class="ff-rest-panel">
              <div class="ff-rest-panel-title">请求体</div>
              <pre class="ff-code">{{ restCards[restSelected].request }}</pre>
            </div>
            <div class="ff-rest-panel">
              <div class="ff-rest-panel-title">响应体</div>
              <pre class="ff-code">{{ restCards[restSelected].response }}</pre>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- MODE: params -->
    <div v-if="props.mode === 'params'" class="ff-body">
      <div class="ff-param-toggles">
        <button v-for="(s, i) in paramScenes" :key="i"
          :class="['ff-param-btn', { active: paramIdx === i }]"
          @click="paramIdx = i">{{ s.label }}</button>
      </div>
      <div class="ff-url-bar">
        <span class="ff-url-method" :style="{ color: activeScene.method === 'POST' ? '#15a051' : '#2eb3df' }">{{ activeScene.method }}</span>
        <span class="ff-url-text">
          <span class="ff-url-base">/api/posts</span>
          <span v-if="activeScene.pathParam" class="ff-url-path">/<span class="ff-url-highlight ff-url-path-hl">{{ activeScene.pathParam }}</span></span>
          <span v-if="activeScene.queryParams" class="ff-url-query">?<template v-for="(q, qi) in activeScene.queryParams" :key="qi"><span v-if="qi > 0">&amp;</span><span class="ff-url-highlight ff-url-query-hl">{{ q.key }}={{ q.val }}</span></template></span>
        </span>
      </div>
      <div class="ff-param-labels">
        <div v-if="activeScene.pathParam" class="ff-param-tag ff-param-tag-path">
          <span class="ff-param-dot" style="background:#2eb3df"></span>
          路径参数 <code>params.id</code> = {{ activeScene.pathParam }}
        </div>
        <div v-if="activeScene.queryParams" class="ff-param-tag ff-param-tag-query">
          <span class="ff-param-dot" style="background:#15a051"></span>
          查询参数 <code>searchParams</code>: <span v-for="(q, qi) in activeScene.queryParams" :key="qi">{{ q.key }}={{ q.val }}<span v-if="qi < activeScene.queryParams!.length - 1">, </span></span>
        </div>
      </div>
      <div v-if="activeScene.body" class="ff-param-body">
        <div class="ff-param-body-label"><span class="ff-param-dot" style="background:#D4952C"></span>请求体 <code>request.json()</code></div>
        <pre class="ff-code ff-code-body">{{ activeScene.body }}</pre>
      </div>
      <div v-if="!activeScene.body && !activeScene.pathParam && activeScene.queryParams" class="ff-param-note">
        此请求没有请求体和路径参数，仅通过查询参数筛选数据
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ─── Root ─── */
.ff-container { margin: 1.5rem 0; max-width: 688px; }
.ff-body { padding: 0; }

/* ─── Shared ─── */
.ff-code {
  font-size: 11px; font-family: var(--vp-font-family-mono); line-height: 1.5;
  background: var(--vp-c-bg-soft); padding: 8px 10px; border-radius: 6px;
  margin: 4px 0 0; overflow-x: auto; color: var(--vp-c-text-1); white-space: pre;
}

/* ─── Dataflow: Op Bar ─── */
.ff-op-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.ff-op-btn {
  padding: 5px 14px; border-radius: 8px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); font-size: 12px; cursor: pointer;
  color: var(--vp-c-text-2); transition: all .2s; font-weight: 500;
}
.ff-op-btn.active { border-color: var(--op-color); color: var(--op-color); background: color-mix(in srgb, var(--op-color) 8%, transparent); font-weight: 600; }
.ff-op-btn:hover { border-color: var(--op-color); }
.ff-go-btn {
  padding: 5px 18px; border: none; border-radius: 8px;
  background: var(--vp-c-brand-1); color: #fff; font-size: 12px;
  font-weight: 600; cursor: pointer; transition: opacity .15s; margin-left: auto;
}
.ff-go-btn:hover { opacity: .85; }
.ff-go-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ─── Dataflow: Flow Track ─── */
.ff-flow-track { padding: 52px 0 20px; overflow: visible; }
.ff-nodes { display: flex; align-items: flex-start; justify-content: center; gap: 0; min-width: 500px; }
.ff-node {
  display: flex; flex-direction: column; align-items: center; position: relative;
  min-width: 72px; transition: transform .2s;
}
.ff-node-active { transform: translateY(-3px); }
.ff-node-icon {
  width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center;
  justify-content: center; font-size: 22px; background: var(--vp-c-bg-soft);
  border: 2px solid var(--vp-c-divider); transition: all .3s;
}
.ff-node-active .ff-node-icon { border-color: var(--vp-c-brand-1); box-shadow: 0 0 12px var(--vp-c-brand-soft); }
.ff-node-name { font-size: 12px; font-weight: 600; color: var(--vp-c-text-1); margin-top: 6px; }
.ff-bubble {
  position: absolute; top: -42px; left: 50%; transform: translateX(-50%);
  background: var(--vp-c-bg); border: 1.5px solid var(--vp-c-brand-1);
  border-radius: 8px; padding: 4px 10px; font-size: 10px; color: var(--vp-c-text-1);
  white-space: nowrap; animation: ffFadeIn .25s; box-shadow: 0 2px 8px rgba(0,0,0,.08);
  max-width: 220px; overflow: hidden; text-overflow: ellipsis;
}
/* ─── Dataflow: Connector + Ball ─── */
.ff-connector {
  display: flex; align-items: center; position: relative;
  width: 60px; height: 48px; flex-shrink: 0;
}
.ff-line { width: 100%; height: 2px; background: var(--vp-c-divider); border-radius: 1px; }
.ff-ball {
  position: absolute; width: 12px; height: 12px; border-radius: 50%;
  top: 50%; transform: translateY(-50%); animation: ffBallForward .5s ease forwards;
  box-shadow: 0 0 8px currentColor;
}
.ff-ball-return { animation: ffBallBackward .5s ease forwards; }

/* ─── Dataflow: Info Bar ─── */
.ff-info-bar {
  display: flex; gap: 12px; flex-wrap: wrap; margin-top: 12px; padding: 10px 14px;
  background: var(--vp-c-bg-soft); border-radius: 8px; border: 1px solid var(--vp-c-divider);
  animation: ffFadeIn .3s;
}
.ff-info-item { font-size: 12px; display: flex; align-items: center; gap: 6px; }
.ff-info-label {
  padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;
  background: var(--vp-c-default-soft); color: var(--vp-c-text-3);
}
.ff-info-item code { font-size: 11px; color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }

/* ─── REST: Cards ─── */
.ff-rest-cards { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
.ff-rest-card {
  flex: 1; min-width: 100px; padding: 16px 12px; border-radius: 12px; text-align: center;
  border: 2px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);
  cursor: pointer; transition: all .25s;
}
.ff-rest-card:hover { border-color: var(--card-color); transform: translateY(-2px); }
.ff-rest-selected { border-color: var(--card-color); transform: scale(1.03); box-shadow: 0 4px 16px color-mix(in srgb, var(--card-color) 20%, transparent); }
.ff-rest-method { font-size: 18px; font-weight: 800; font-family: var(--vp-font-family-mono); }
.ff-rest-crud { font-size: 11px; color: var(--vp-c-text-2); margin-top: 4px; }

/* ─── REST: Detail Panel ─── */
.ff-rest-detail {
  border: 1.5px solid var(--card-color); border-radius: 12px; padding: 16px;
  background: var(--vp-c-bg-soft);
}
.ff-rest-url { font-size: 13px; font-weight: 600; color: var(--vp-c-text-1); margin-bottom: 6px; }
.ff-rest-url code { font-family: var(--vp-font-family-mono); color: var(--card-color); }
.ff-rest-summary { font-size: 12px; color: var(--vp-c-text-2); margin-bottom: 12px; }
.ff-rest-panels { display: flex; gap: 10px; }
.ff-rest-panel { flex: 1; min-width: 0; }
.ff-rest-panel-title { font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); margin-bottom: 4px; }
.ff-slide-enter-active { animation: ffSlideDown .3s ease; }
.ff-slide-leave-active { animation: ffSlideDown .2s ease reverse; }

/* ─── Params: URL Bar ─── */
.ff-param-toggles { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.ff-param-btn {
  padding: 5px 14px; border-radius: 8px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); font-size: 12px; cursor: pointer;
  color: var(--vp-c-text-2); transition: all .2s; font-weight: 500;
}
.ff-param-btn.active { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); font-weight: 600; }
.ff-url-bar {
  display: flex; align-items: center; gap: 10px; padding: 10px 16px;
  background: var(--vp-c-bg-soft); border: 1.5px solid var(--vp-c-divider);
  border-radius: 10px; font-family: var(--vp-font-family-mono); font-size: 13px;
  margin-bottom: 12px; overflow-x: auto;
}
.ff-url-method { font-weight: 700; flex-shrink: 0; }
.ff-url-text { color: var(--vp-c-text-1); }
.ff-url-base { color: var(--vp-c-text-2); }
.ff-url-highlight { font-weight: 600; }
.ff-url-path-hl { color: #2eb3df; border-bottom: 2px solid #2eb3df; padding-bottom: 1px; }
.ff-url-query-hl { color: #15a051; border-bottom: 2px solid #15a051; padding-bottom: 1px; }

/* ─── Params: Labels ─── */
.ff-param-labels { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.ff-param-tag {
  display: flex; align-items: center; gap: 8px; font-size: 12px;
  color: var(--vp-c-text-1); padding: 6px 12px; border-radius: 8px;
  background: var(--vp-c-bg-soft); animation: ffFadeIn .25s;
}
.ff-param-tag code { font-family: var(--vp-font-family-mono); font-size: 11px; color: var(--vp-c-text-2); }
.ff-param-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

/* ─── Params: Body ─── */
.ff-param-body { animation: ffFadeIn .25s; }
.ff-param-body-label { font-size: 12px; color: var(--vp-c-text-1); display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.ff-param-body-label code { font-family: var(--vp-font-family-mono); font-size: 11px; color: var(--vp-c-text-2); }
.ff-code-body { border: 1.5px solid #D4952C40; }
.ff-param-note { font-size: 12px; color: var(--vp-c-text-3); font-style: italic; padding: 8px 0; }

/* ─── Animations ─── */
@keyframes ffFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes ffBallForward { from { left: 0; } to { left: calc(100% - 12px); } }
@keyframes ffBallBackward { from { left: calc(100% - 12px); } to { left: 0; } }
@keyframes ffSlideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }

/* ─── Dark Mode ─── */
:global(html.dark) .ff-bubble { box-shadow: 0 2px 12px rgba(0,0,0,.3); }
:global(html.dark) .ff-node-icon { background: #1a1a2e; }
:global(html.dark) .ff-code { background: #1a1a2e; }
:global(html.dark) .ff-url-bar { background: #1a1a2e; }

/* ─── Responsive ─── */
@media (max-width: 640px) {
  .ff-nodes { min-width: 0; flex-wrap: wrap; justify-content: center; gap: 4px; }
  .ff-connector { width: 36px; }
  .ff-bubble { font-size: 9px; max-width: 140px; }
  .ff-rest-cards { flex-wrap: wrap; }
  .ff-rest-card { min-width: 70px; padding: 10px 8px; }
  .ff-rest-method { font-size: 14px; }
  .ff-rest-panels { flex-direction: column; }
  .ff-info-bar { flex-direction: column; gap: 6px; }
  .ff-op-bar { gap: 6px; }
  .ff-op-btn { padding: 4px 10px; font-size: 11px; }
  .ff-url-bar { font-size: 11px; padding: 8px 10px; }
}
</style>
