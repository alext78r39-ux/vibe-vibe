<script setup lang="ts">
import { ref, computed } from 'vue'

const activeTab = ref<'estimate' | 'compare'>('estimate')
const textInput = ref('')
const inputPrice = ref(4)
const outputPrice = ref(12)
const outputRatio = ref(3)

const compareA = ref('')
const compareB = ref('')

function estimateTokens(text: string): number {
  if (!text) return 0
  let tokens = 0
  for (const char of text) {
    if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(char)) {
      tokens += 1
    } else if (/[a-zA-Z]/.test(char)) {
      tokens += 0.25
    } else if (/\d/.test(char)) {
      tokens += 0.25
    } else if (/\s/.test(char)) {
      tokens += 0.1
    } else {
      tokens += 0.5
    }
  }
  return Math.ceil(tokens)
}

const tokenCount = computed(() => estimateTokens(textInput.value))
const estimatedCost = computed(() => {
  const inputTokens = tokenCount.value
  const outputTokens = inputTokens * outputRatio.value
  const cost = (inputTokens * inputPrice.value + outputTokens * outputPrice.value) / 1000000
  return cost.toFixed(6)
})

const compareATokens = computed(() => estimateTokens(compareA.value))
const compareBTokens = computed(() => estimateTokens(compareB.value))
const savings = computed(() => {
  if (compareATokens.value === 0 || compareBTokens.value === 0) return 0
  const diff = compareATokens.value - compareBTokens.value
  return Math.round((diff / compareATokens.value) * 100)
})

const charCount = computed(() => textInput.value.length)
const lineCount = computed(() => textInput.value ? textInput.value.split('\n').length : 0)
</script>

<template>
  <div class="tc-root">
    <div class="tc-tabs">
      <button class="tc-tab" :class="{ active: activeTab === 'estimate' }" @click="activeTab = 'estimate'">
        <span>🔢</span> Token 估算
      </button>
      <button class="tc-tab" :class="{ active: activeTab === 'compare' }" @click="activeTab = 'compare'">
        <span>⚖️</span> 对比模式
      </button>
    </div>

    <div v-if="activeTab === 'estimate'" class="tc-panel">
      <textarea
        v-model="textInput"
        class="tc-textarea"
        placeholder="粘贴文本或代码，实时估算 Token 数量..."
        rows="5"
      ></textarea>
      <div class="tc-stats">
        <div class="tc-stat">
          <span class="tc-stat-value">{{ tokenCount }}</span>
          <span class="tc-stat-label">Token</span>
        </div>
        <div class="tc-stat">
          <span class="tc-stat-value">{{ charCount }}</span>
          <span class="tc-stat-label">字符</span>
        </div>
        <div class="tc-stat">
          <span class="tc-stat-value">{{ lineCount }}</span>
          <span class="tc-stat-label">行</span>
        </div>
      </div>
      <div class="tc-cost">
        <div class="tc-cost-header">成本估算</div>
        <div class="tc-sliders">
          <label class="tc-slider-row">
            <span>输入价格 (¥/百万Token)</span>
            <input type="range" v-model.number="inputPrice" min="1" max="60" step="0.5" />
            <span class="tc-slider-val">¥{{ inputPrice }}</span>
          </label>
          <label class="tc-slider-row">
            <span>输出价格 (¥/百万Token)</span>
            <input type="range" v-model.number="outputPrice" min="1" max="120" step="0.5" />
            <span class="tc-slider-val">¥{{ outputPrice }}</span>
          </label>
          <label class="tc-slider-row">
            <span>输出倍率</span>
            <input type="range" v-model.number="outputRatio" min="1" max="10" step="0.5" />
            <span class="tc-slider-val">×{{ outputRatio }}</span>
          </label>
        </div>
        <div class="tc-cost-result">
          预估花费：<strong>¥{{ estimatedCost }}</strong>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'compare'" class="tc-panel">
      <div class="tc-compare">
        <div class="tc-compare-col">
          <div class="tc-compare-label">提示词 A</div>
          <textarea v-model="compareA" class="tc-textarea" placeholder="粘贴第一个提示词..." rows="4"></textarea>
          <div class="tc-compare-count">{{ compareATokens }} Token</div>
        </div>
        <div class="tc-compare-vs">VS</div>
        <div class="tc-compare-col">
          <div class="tc-compare-label">提示词 B</div>
          <textarea v-model="compareB" class="tc-textarea" placeholder="粘贴第二个提示词..." rows="4"></textarea>
          <div class="tc-compare-count">{{ compareBTokens }} Token</div>
        </div>
      </div>
      <div v-if="compareATokens > 0 && compareBTokens > 0" class="tc-compare-result" :class="{ saving: savings > 0 }">
        <span v-if="savings > 0">提示词 B 比 A 节省 <strong>{{ savings }}%</strong> Token</span>
        <span v-else-if="savings < 0">提示词 A 比 B 节省 <strong>{{ -savings }}%</strong> Token</span>
        <span v-else>两个提示词 Token 数量相同</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tc-root { margin: 24px 0; }
.tc-tabs {
  display: flex; gap: 8px; margin-bottom: 16px;
  background: var(--vp-c-bg-soft); padding: 4px; border-radius: 12px;
}
.tc-tab {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 16px; border: none; border-radius: 10px;
  background: transparent; color: var(--vp-c-text-3); font-size: 14px;
  font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.tc-tab:hover { background: var(--vp-c-bg); }
.tc-tab.active {
  background: var(--vp-c-bg); color: #007aff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.tc-panel { animation: tcFade 0.3s ease; }
@keyframes tcFade {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.tc-textarea {
  width: 100%; padding: 14px; border-radius: 10px;
  border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg);
  color: var(--vp-c-text-1); font-size: 14px; font-family: 'SF Mono', Monaco, monospace;
  resize: vertical; outline: none; transition: border-color 0.2s;
  box-sizing: border-box;
}
.tc-textarea:focus { border-color: #007aff; }
.tc-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  margin: 16px 0;
}
.tc-stat {
  text-align: center; padding: 16px 8px; border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.tc-stat-value {
  display: block; font-size: 28px; font-weight: 700; color: #007aff;
  font-variant-numeric: tabular-nums;
}
.tc-stat-label {
  display: block; font-size: 11px; color: var(--vp-c-text-3);
  text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;
}
.tc-cost {
  padding: 16px; border-radius: 12px; background: var(--vp-c-bg-soft);
}
.tc-cost-header {
  font-size: 14px; font-weight: 600; color: var(--vp-c-text-1); margin-bottom: 12px;
}
.tc-sliders { display: flex; flex-direction: column; gap: 10px; }
.tc-slider-row {
  display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--vp-c-text-2);
}
.tc-slider-row span:first-child { flex: 1; min-width: 0; }
.tc-slider-row input[type="range"] { width: 120px; accent-color: #007aff; }
.tc-slider-val {
  min-width: 40px; text-align: right; font-weight: 600;
  font-variant-numeric: tabular-nums; color: var(--vp-c-text-1);
}
.tc-cost-result {
  margin-top: 14px; padding: 10px 14px; border-radius: 8px;
  background: var(--vp-c-bg); font-size: 14px; color: var(--vp-c-text-2);
}
.tc-cost-result strong { color: #007aff; }
.tc-compare { display: flex; gap: 12px; align-items: stretch; }
.tc-compare-col { flex: 1; }
.tc-compare-vs {
  display: flex; align-items: center; font-size: 16px; font-weight: 700;
  color: var(--vp-c-text-3); padding: 0 4px;
}
.tc-compare-label {
  font-size: 13px; font-weight: 600; color: var(--vp-c-text-2); margin-bottom: 8px;
}
.tc-compare-count {
  text-align: center; margin-top: 8px; font-size: 18px; font-weight: 700;
  color: #007aff; font-variant-numeric: tabular-nums;
}
.tc-compare-result {
  margin-top: 16px; padding: 12px 16px; border-radius: 10px;
  text-align: center; font-size: 14px; color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
}
.tc-compare-result.saving { background: rgba(52, 199, 89, 0.08); }
.tc-compare-result strong { color: #34c759; }
@media (max-width: 640px) {
  .tc-compare { flex-direction: column; }
  .tc-compare-vs { justify-content: center; padding: 8px 0; }
  .tc-stats { grid-template-columns: repeat(3, 1fr); }
  .tc-slider-row { flex-wrap: wrap; }
  .tc-slider-row input[type="range"] { width: 100%; order: 3; }
}
</style>
