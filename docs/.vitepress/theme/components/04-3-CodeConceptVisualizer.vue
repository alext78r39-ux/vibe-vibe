<script setup lang="ts">
import { ref, computed } from 'vue'

type Tab = 'variable' | 'function' | 'condition' | 'loop'

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'variable', label: '变量', icon: '📦' },
  { id: 'function', label: '函数', icon: '⚙️' },
  { id: 'condition', label: '条件', icon: '🔀' },
  { id: 'loop', label: '循环', icon: '🔄' },
]

const activeTab = ref<Tab>('variable')

// Variable tab
const varName = ref('username')
const varValue = ref('张三')
const varHistory = ref<{ name: string; value: string }[]>([])

function setVar() {
  varHistory.value = [...varHistory.value, { name: varName.value, value: varValue.value }]
}

// Function tab
const fnInput = ref(100)
const fnQuantity = ref(2)
const fnResult = ref<number | null>(null)
const fnRunning = ref(false)

function runFn() {
  fnRunning.value = true
  fnResult.value = null
  setTimeout(() => {
    fnResult.value = fnInput.value * fnQuantity.value
    fnRunning.value = false
  }, 500)
}

// Condition tab
const isLoggedIn = ref(true)

// Loop tab
const loopItems = ['🍎 苹果', '🍌 香蕉', '🍇 葡萄', '🍊 橙子', '🍓 草莓']
const loopIndex = ref(-1)
const loopRunning = ref(false)
const loopResults = ref<string[]>([])

function runLoop() {
  loopRunning.value = true
  loopIndex.value = -1
  loopResults.value = []
  let i = 0
  const timer = setInterval(() => {
    loopIndex.value = i
    loopResults.value = [...loopResults.value, `处理了 ${loopItems[i]}`]
    i++
    if (i >= loopItems.length) {
      clearInterval(timer)
      loopRunning.value = false
    }
  }, 600)
}
</script>

<template>
  <div class="ccv-root">
    <div class="ccv-tabs">
      <button v-for="t in tabs" :key="t.id"
        :class="['ccv-tab', { active: activeTab === t.id }]"
        @click="activeTab = t.id">
        <span class="ccv-tab-icon">{{ t.icon }}</span>
        <span class="ccv-tab-label">{{ t.label }}</span>
      </button>
    </div>

    <!-- Variable Tab -->
    <div v-if="activeTab === 'variable'" class="ccv-panel">
      <div class="ccv-desc">变量就像贴了标签的盒子，里面装着数据</div>
      <div class="ccv-var-form">
        <div class="ccv-input-group">
          <label class="ccv-input-label">变量名</label>
          <input v-model="varName" class="ccv-input" placeholder="变量名" />
        </div>
        <div class="ccv-input-group">
          <label class="ccv-input-label">值</label>
          <input v-model="varValue" class="ccv-input" placeholder="值" />
        </div>
        <button class="ccv-btn" @click="setVar">赋值</button>
      </div>
      <div class="ccv-var-boxes">
        <div v-for="(v, i) in varHistory" :key="i" class="ccv-var-box">
          <div class="ccv-var-label">{{ v.name }}</div>
          <div class="ccv-var-value">{{ v.value }}</div>
        </div>
        <div v-if="varHistory.length === 0" class="ccv-empty">点击"赋值"创建变量</div>
      </div>
      <div class="ccv-code-hint">
        <code>let {{ varName }} = "{{ varValue }}"</code>
      </div>
    </div>

    <!-- Function Tab -->
    <div v-if="activeTab === 'function'" class="ccv-panel">
      <div class="ccv-desc">函数是一台机器：输入参数 → 处理 → 输出结果</div>
      <div class="ccv-fn-machine">
        <div class="ccv-fn-input">
          <div class="ccv-fn-title">输入</div>
          <div class="ccv-input-group">
            <label class="ccv-input-label">单价</label>
            <input v-model.number="fnInput" type="number" class="ccv-input ccv-input-sm" />
          </div>
          <div class="ccv-input-group">
            <label class="ccv-input-label">数量</label>
            <input v-model.number="fnQuantity" type="number" class="ccv-input ccv-input-sm" />
          </div>
        </div>
        <div class="ccv-fn-process">
          <button class="ccv-btn" @click="runFn" :disabled="fnRunning">
            {{ fnRunning ? '运行中...' : '▶ 运行' }}
          </button>
          <div class="ccv-fn-formula">单价 × 数量</div>
        </div>
        <div class="ccv-fn-output">
          <div class="ccv-fn-title">输出</div>
          <div class="ccv-fn-result" :class="{ show: fnResult !== null }">
            {{ fnResult !== null ? fnResult : '?' }}
          </div>
        </div>
      </div>
      <div class="ccv-code-hint">
        <code>function calcPrice(price, qty) {{ '{' }} return price * qty {{ '}' }}</code>
      </div>
    </div>

    <!-- Condition Tab -->
    <div v-if="activeTab === 'condition'" class="ccv-panel">
      <div class="ccv-desc">条件判断让程序根据不同情况走不同路径</div>
      <div class="ccv-cond-toggle">
        <span>用户已登录？</span>
        <button :class="['ccv-switch', { on: isLoggedIn }]" @click="isLoggedIn = !isLoggedIn">
          <span class="ccv-switch-dot"></span>
        </button>
        <span class="ccv-cond-val">{{ isLoggedIn }}</span>
      </div>
      <div class="ccv-cond-flow">
        <div class="ccv-cond-node ccv-cond-check">if (用户已登录)</div>
        <div class="ccv-cond-branches">
          <div :class="['ccv-cond-branch', { active: isLoggedIn }]">
            <div class="ccv-cond-label">✅ true</div>
            <div class="ccv-cond-action">显示"欢迎回来！"</div>
          </div>
          <div :class="['ccv-cond-branch', { active: !isLoggedIn }]">
            <div class="ccv-cond-label">❌ false</div>
            <div class="ccv-cond-action">显示"请登录"按钮</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loop Tab -->
    <div v-if="activeTab === 'loop'" class="ccv-panel">
      <div class="ccv-desc">循环让程序对列表中的每一项重复执行操作</div>
      <div class="ccv-loop-area">
        <div class="ccv-loop-list">
          <div v-for="(item, i) in loopItems" :key="i"
            :class="['ccv-loop-item', { processing: i === loopIndex, done: i < loopIndex }]">
            {{ item }}
          </div>
        </div>
        <button class="ccv-btn" @click="runLoop" :disabled="loopRunning">
          {{ loopRunning ? `处理中 (${loopIndex + 1}/${loopItems.length})` : '▶ 开始循环' }}
        </button>
        <div v-if="loopResults.length > 0" class="ccv-loop-log">
          <div v-for="(r, i) in loopResults" :key="i" class="ccv-loop-log-line">{{ r }}</div>
        </div>
      </div>
      <div class="ccv-code-hint">
        <code>for (const item of list) {{ '{' }} process(item) {{ '}' }}</code>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ccv-root { margin: 24px 0; }
.ccv-tabs { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.ccv-tab {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
  color: var(--vp-c-text-2);
}
.ccv-tab.active { border-color: var(--vp-c-brand); color: var(--vp-c-brand); background: var(--vp-c-brand-dimm); }
.ccv-tab:hover { transform: translateY(-1px); }
.ccv-tab-icon { font-size: 16px; }
.ccv-panel { animation: ccvFade 0.25s ease; }
.ccv-desc { font-size: 13px; color: var(--vp-c-text-2); margin-bottom: 16px; }
.ccv-input-group { display: flex; flex-direction: column; gap: 2px; }
.ccv-input-label { font-size: 11px; font-weight: 600; color: var(--vp-c-text-3); }
.ccv-input {
  padding: 6px 10px; border-radius: 6px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); font-size: 13px; color: var(--vp-c-text-1);
  outline: none; transition: border-color 0.2s; width: 120px;
}
.ccv-input:focus { border-color: var(--vp-c-brand); }
.ccv-input-sm { width: 80px; }
.ccv-btn {
  padding: 7px 18px; border-radius: 8px; border: none; font-size: 13px;
  font-weight: 600; cursor: pointer; background: var(--vp-c-brand); color: #fff;
  transition: all 0.2s;
}
.ccv-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
.ccv-btn:disabled { opacity: 0.5; cursor: default; }
.ccv-code-hint {
  margin-top: 14px; padding: 8px 12px; border-radius: 6px;
  background: var(--vp-c-default-soft); font-size: 12px;
  font-family: 'SF Mono', Monaco, monospace; color: var(--vp-c-text-2);
}
/* Variable */
.ccv-var-form { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 14px; }
.ccv-var-boxes { display: flex; gap: 10px; flex-wrap: wrap; min-height: 60px; }
.ccv-var-box {
  padding: 10px 16px; border-radius: 10px; border: 2px dashed var(--vp-c-brand);
  background: var(--vp-c-brand-dimm); text-align: center; animation: ccvPop 0.3s ease;
}
.ccv-var-label { font-size: 11px; font-weight: 600; color: var(--vp-c-text-3); }
.ccv-var-value { font-size: 16px; font-weight: 700; color: var(--vp-c-text-1); margin-top: 2px; }
.ccv-empty { font-size: 13px; color: var(--vp-c-text-3); font-style: italic; padding: 16px; }
/* Function */
.ccv-fn-machine { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.ccv-fn-input, .ccv-fn-output {
  padding: 14px; border-radius: 12px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.ccv-fn-input { display: flex; flex-direction: column; gap: 8px; }
.ccv-fn-title { font-size: 12px; font-weight: 700; color: var(--vp-c-text-3); margin-bottom: 4px; }
.ccv-fn-process { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.ccv-fn-formula { font-size: 11px; color: var(--vp-c-text-3); }
.ccv-fn-result {
  font-size: 28px; font-weight: 700; color: var(--vp-c-brand); text-align: center;
  min-width: 60px; transition: all 0.3s;
}
.ccv-fn-result.show { animation: ccvPop 0.3s ease; }
/* Condition */
.ccv-cond-toggle { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; font-size: 14px; color: var(--vp-c-text-1); }
.ccv-switch {
  width: 44px; height: 24px; border-radius: 12px; border: none; padding: 2px;
  background: var(--vp-c-divider); cursor: pointer; transition: background 0.2s; position: relative;
}
.ccv-switch.on { background: #34c759; }
.ccv-switch-dot {
  display: block; width: 20px; height: 20px; border-radius: 50%; background: #fff;
  transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.ccv-switch.on .ccv-switch-dot { transform: translateX(20px); }
.ccv-cond-val { font-family: 'SF Mono', Monaco, monospace; font-size: 13px; font-weight: 600; color: var(--vp-c-text-2); }
.ccv-cond-flow { text-align: center; }
.ccv-cond-check {
  display: inline-block; padding: 8px 20px; border-radius: 8px;
  background: var(--vp-c-default-soft); font-size: 13px; font-weight: 600;
  font-family: 'SF Mono', Monaco, monospace; color: var(--vp-c-text-1); margin-bottom: 12px;
}
.ccv-cond-branches { display: flex; gap: 12px; justify-content: center; }
.ccv-cond-branch {
  flex: 1; max-width: 200px; padding: 14px; border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);
  opacity: 0.35; transition: all 0.3s; text-align: center;
}
.ccv-cond-branch.active { opacity: 1; border-color: var(--vp-c-brand); background: var(--vp-c-brand-dimm); }
.ccv-cond-label { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.ccv-cond-action { font-size: 12px; color: var(--vp-c-text-2); }
/* Loop */
.ccv-loop-area { display: flex; flex-direction: column; gap: 12px; }
.ccv-loop-list { display: flex; gap: 8px; flex-wrap: wrap; }
.ccv-loop-item {
  padding: 8px 14px; border-radius: 8px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); font-size: 14px; transition: all 0.3s;
}
.ccv-loop-item.processing { border-color: #ff9500; background: rgba(255,149,0,0.1); transform: scale(1.05); }
.ccv-loop-item.done { border-color: #34c759; background: rgba(52,199,89,0.08); opacity: 0.6; }
.ccv-loop-log {
  padding: 10px 14px; border-radius: 8px; background: var(--vp-c-default-soft);
  font-size: 12px; font-family: 'SF Mono', Monaco, monospace; color: var(--vp-c-text-2);
}
.ccv-loop-log-line { line-height: 1.7; }
@keyframes ccvFade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes ccvPop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@media (max-width: 640px) {
  .ccv-fn-machine { flex-direction: column; align-items: stretch; }
  .ccv-cond-branches { flex-direction: column; align-items: center; }
  .ccv-cond-branch { max-width: 100%; }
}
</style>
