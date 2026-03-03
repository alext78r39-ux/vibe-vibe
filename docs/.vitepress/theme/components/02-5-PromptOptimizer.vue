<script setup lang="ts">
import { ref, computed } from 'vue'

const errorLog = ref('')
const steps = ref('')
const expected = ref('')

interface Check {
  label: string
  test: (log: string, steps: string, expected: string) => boolean
  weight: number
}

const checks: Check[] = [
  { label: '包含错误日志', test: (l) => l.length > 10, weight: 20 },
  { label: '有文件路径', test: (l) => /[\/\\][\w.-]+\.\w+/.test(l) || /\w+\.\w+:\d+/.test(l), weight: 15 },
  { label: '有堆栈信息', test: (l) => /at\s|Error:|stack|trace|line\s?\d/i.test(l), weight: 15 },
  { label: '描述了操作步骤', test: (_, s) => s.length > 10, weight: 15 },
  { label: '步骤有序号', test: (_, s) => /[1-9][\.\)、]/.test(s), weight: 10 },
  { label: '有预期结果', test: (_, __, e) => e.length > 5, weight: 15 },
  { label: '描述了实际 vs 预期', test: (_, s, e) => s.length > 5 && e.length > 5, weight: 10 },
]

const score = computed(() => {
  let total = 0
  for (const check of checks) {
    if (check.test(errorLog.value, steps.value, expected.value)) {
      total += check.weight
    }
  }
  return total
})

const passedChecks = computed(() =>
  checks.filter(c => c.test(errorLog.value, steps.value, expected.value))
)

const failedChecks = computed(() =>
  checks.filter(c => !c.test(errorLog.value, steps.value, expected.value))
)

const scoreColor = computed(() => {
  if (score.value >= 80) return '#34c759'
  if (score.value >= 50) return '#ff9500'
  return '#ff3b30'
})

const scoreLabel = computed(() => {
  if (score.value >= 80) return '优秀'
  if (score.value >= 50) return '一般'
  return '需改进'
})
</script>

<template>
  <div class="po-root">
    <div class="po-form">
      <div class="po-field">
        <label class="po-label">🔴 错误日志</label>
        <textarea v-model="errorLog" class="po-textarea" rows="3"
          placeholder="粘贴完整的错误信息、堆栈跟踪..."></textarea>
      </div>
      <div class="po-field">
        <label class="po-label">📝 你做了什么（操作步骤）</label>
        <textarea v-model="steps" class="po-textarea" rows="3"
          placeholder="1. 运行了 pnpm dev&#10;2. 点击了登录按钮&#10;3. 出现了错误"></textarea>
      </div>
      <div class="po-field">
        <label class="po-label">✅ 预期结果</label>
        <textarea v-model="expected" class="po-textarea" rows="2"
          placeholder="我期望看到登录成功后跳转到首页"></textarea>
      </div>
    </div>

    <div class="po-dashboard">
      <div class="po-score-ring">
        <svg viewBox="0 0 120 120" class="po-ring-svg">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--vp-c-divider)" stroke-width="8" />
          <circle cx="60" cy="60" r="52" fill="none"
            :stroke="scoreColor" stroke-width="8" stroke-linecap="round"
            :stroke-dasharray="`${score * 3.27} 327`"
            transform="rotate(-90 60 60)"
            style="transition: stroke-dasharray 0.5s ease" />
        </svg>
        <div class="po-score-text">
          <span class="po-score-num" :style="{ color: scoreColor }">{{ score }}</span>
          <span class="po-score-label">{{ scoreLabel }}</span>
        </div>
      </div>

      <div class="po-checklist">
        <div class="po-check-title">检查清单</div>
        <div v-for="check in passedChecks" :key="check.label" class="po-check-item passed">
          <span class="po-check-icon">✅</span>
          <span>{{ check.label }}</span>
        </div>
        <div v-for="check in failedChecks" :key="check.label" class="po-check-item failed">
          <span class="po-check-icon">⬜</span>
          <span>{{ check.label }}</span>
        </div>
      </div>
    </div>

    <div v-if="failedChecks.length > 0 && score < 80" class="po-tips">
      <div class="po-tips-title">💡 改进建议</div>
      <ul class="po-tips-list">
        <li v-if="!checks[0].test(errorLog, steps, expected)">粘贴完整的错误日志，不要只描述"报错了"</li>
        <li v-if="!checks[1].test(errorLog, steps, expected)">在日志中包含文件路径（如 src/App.tsx:42）</li>
        <li v-if="!checks[2].test(errorLog, steps, expected)">包含堆栈跟踪信息，帮助 AI 定位问题</li>
        <li v-if="!checks[3].test(errorLog, steps, expected)">描述你执行了哪些操作步骤</li>
        <li v-if="!checks[5].test(errorLog, steps, expected)">说明你期望的正确结果是什么</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.po-root { margin: 24px 0; }
.po-form { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }
.po-field { display: flex; flex-direction: column; gap: 6px; }
.po-label { font-size: 13px; font-weight: 600; color: var(--vp-c-text-2); }
.po-textarea {
  width: 100%; padding: 12px; border-radius: 10px;
  border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg);
  color: var(--vp-c-text-1); font-size: 14px;
  font-family: 'SF Mono', Monaco, monospace;
  resize: vertical; outline: none; transition: border-color 0.2s;
  box-sizing: border-box;
}
.po-textarea:focus { border-color: #007aff; }
.po-dashboard {
  display: flex; gap: 24px; align-items: flex-start;
  padding: 20px; border-radius: 12px; background: var(--vp-c-bg-soft);
}
.po-score-ring {
  position: relative; width: 120px; height: 120px; flex-shrink: 0;
}
.po-ring-svg { width: 100%; height: 100%; }
.po-score-text {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.po-score-num { font-size: 32px; font-weight: 700; font-variant-numeric: tabular-nums; }
.po-score-label { font-size: 12px; color: var(--vp-c-text-3); }
.po-checklist { flex: 1; }
.po-check-title {
  font-size: 14px; font-weight: 600; color: var(--vp-c-text-1); margin-bottom: 10px;
}
.po-check-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 0; font-size: 13px; color: var(--vp-c-text-2);
}
.po-check-item.passed { color: var(--vp-c-text-1); }
.po-check-item.failed { opacity: 0.5; }
.po-check-icon { font-size: 14px; }
.po-tips {
  margin-top: 16px; padding: 16px; border-radius: 10px;
  background: rgba(255, 149, 0, 0.06); border: 1px solid rgba(255, 149, 0, 0.2);
}
.po-tips-title { font-size: 14px; font-weight: 600; color: var(--vp-c-text-1); margin-bottom: 8px; }
.po-tips-list {
  margin: 0; padding-left: 20px; font-size: 13px;
  color: var(--vp-c-text-2); line-height: 1.8;
}
@media (max-width: 640px) {
  .po-dashboard { flex-direction: column; align-items: center; }
}
</style>
