<script setup lang="ts">
import { ref, computed } from 'vue'

interface Question {
  title: string
  placeholder: string
  antiPatterns: string[]
  badExample: string
  goodExample: string
  shortWarning: string
}

const questions: Question[] = [
  {
    title: '用户是谁？',
    placeholder: '描述你的目标用户群体...',
    antiPatterns: ['所有人', '每个人', '大家', '任何人', '所有用户'],
    badExample: '所有需要管理时间的人',
    goodExample: '每天处理5-10个任务的职场人士，25-35岁，习惯用电脑工作',
    shortWarning: '描述太简短，试着加入年龄、职业、使用场景等细节',
  },
  {
    title: '痛点在哪？',
    placeholder: '描述用户当前遇到的具体问题...',
    antiPatterns: ['我觉得', '应该', '可能', '也许', '大概'],
    badExample: '我觉得大家应该需要一个更好的待办工具',
    goodExample: '现有便签纸容易丢失，手机备忘录打开步骤多（解锁→找App→打开），每天浪费5分钟',
    shortWarning: '试着描述具体场景：用户现在怎么做？哪里痛苦？浪费多少时间/金钱？',
  },
  {
    title: '为什么选你？',
    placeholder: '你的方案比现有方案好在哪里...',
    antiPatterns: ['更好', '最好', '独特', '创新', '颠覆'],
    badExample: '我们的产品更好用、更创新',
    goodExample: '打开网页就能用，不需要下载App，3秒内添加任务（竞品需要8秒）',
    shortWarning: '避免空洞形容词，用具体数据或对比说明优势',
  },
]

const currentStep = ref(0)
const answers = ref(['', '', ''])
const showExamples = ref([false, false, false])

type Level = 'red' | 'yellow' | 'green' | 'none'

function getLevel(index: number): Level {
  const answer = answers.value[index].trim()
  if (!answer) return 'none'
  const q = questions[index]
  if (q.antiPatterns.some(p => answer.includes(p))) return 'red'
  if (answer.length < 15) return 'yellow'
  return 'green'
}

const currentLevel = computed(() => getLevel(currentStep.value))

function getFeedback(index: number): string {
  const level = getLevel(index)
  const q = questions[index]
  if (level === 'none') return ''
  if (level === 'red') {
    const found = q.antiPatterns.find(p => answers.value[index].includes(p))
    return `🔴 检测到模糊词「${found}」— 这类表述无法指导产品决策`
  }
  if (level === 'yellow') return `🟡 ${q.shortWarning}`
  return '🟢 具体且可验证，这是好的回答！'
}

const canNext = computed(() => answers.value[currentStep.value].trim().length > 0)
const isComplete = computed(() => currentStep.value >= 3)

const scoreText = computed(() => {
  const greens = [0, 1, 2].filter(i => getLevel(i) === 'green').length
  if (greens === 3) return '🎉 三项全绿！你的想法定义清晰，可以开始写 PRD 了'
  if (greens >= 2) return '👍 基本清晰，建议优化标黄/标红的回答后再继续'
  return '⚠️ 多项回答需要改进，建议重新思考后再写 PRD'
})

function nextStep() {
  if (currentStep.value < 3) currentStep.value++
}
function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}
function reset() {
  currentStep.value = 0
  answers.value = ['', '', '']
  showExamples.value = [false, false, false]
}
</script>
<!-- PLACEHOLDER_TEMPLATE -->

<template>
  <div class="soul-questions">
    <div class="sq-header">
      <span class="sq-title">🔮 灵魂三问自评</span>
      <div class="step-dots">
        <span v-for="i in 3" :key="i" class="dot" :class="{ active: currentStep === i - 1, done: currentStep > i - 1 || (isComplete && getLevel(i-1) !== 'none') }" @click="currentStep = i - 1">{{ i }}</span>
        <span class="dot" :class="{ active: isComplete }">✓</span>
      </div>
    </div>

    <template v-if="!isComplete">
      <div class="question-card">
        <h3 class="question-title">问题 {{ currentStep + 1 }}：{{ questions[currentStep].title }}</h3>
        <textarea class="answer-input" v-model="answers[currentStep]" :placeholder="questions[currentStep].placeholder" rows="3"></textarea>
        <div v-if="currentLevel !== 'none'" class="feedback" :class="currentLevel">
          {{ getFeedback(currentStep) }}
        </div>
        <button class="example-toggle" @click="showExamples[currentStep] = !showExamples[currentStep]">
          {{ showExamples[currentStep] ? '隐藏示例' : '查看好/坏示例' }}
        </button>
        <div v-if="showExamples[currentStep]" class="examples">
          <div class="example bad"><span class="ex-label">❌ 坏回答</span><p>{{ questions[currentStep].badExample }}</p></div>
          <div class="example good"><span class="ex-label">✅ 好回答</span><p>{{ questions[currentStep].goodExample }}</p></div>
        </div>
      </div>
      <div class="nav-buttons">
        <button v-if="currentStep > 0" class="nav-btn secondary" @click="prevStep">← 上一步</button>
        <div v-else></div>
        <button class="nav-btn primary" :disabled="!canNext" @click="nextStep">
          {{ currentStep < 2 ? '下一步 →' : '查看结果' }}
        </button>
      </div>
    </template>

    <template v-else>
      <div class="scorecard">
        <div class="score-summary">{{ scoreText }}</div>
        <div v-for="(q, i) in questions" :key="i" class="score-item">
          <span class="score-light" :class="getLevel(i)"></span>
          <div class="score-info">
            <span class="score-q">{{ q.title }}</span>
            <span class="score-a">{{ answers[i] }}</span>
          </div>
        </div>
        <button class="nav-btn secondary" @click="reset">重新评估</button>
      </div>
    </template>
  </div>
</template>
<!-- PLACEHOLDER_STYLE -->

<style scoped>
.soul-questions { background: linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%); border-radius: 20px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8); font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif; }
.sq-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.sq-title { font-size: 16px; font-weight: 600; color: #1d1d1f; }
.step-dots { display: flex; gap: 8px; }
.dot { width: 32px; height: 32px; border-radius: 50%; background: white; border: 2px solid #d1d1d6; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #86868b; cursor: pointer; transition: all 0.2s; }
.dot.active { border-color: #007aff; color: #007aff; background: #e8f0fe; }
.dot.done { border-color: #34c759; color: white; background: #34c759; }
.question-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin-bottom: 16px; }
.question-title { margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1d1d1f; }
.answer-input { width: 100%; padding: 12px 16px; border: 2px solid #e8e8ed; border-radius: 12px; font-size: 14px; font-family: inherit; resize: vertical; transition: border-color 0.2s; background: #fafafa; box-sizing: border-box; }
.answer-input:focus { outline: none; border-color: #007aff; background: white; }
.feedback { padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 500; margin-top: 12px; }
.feedback.red { background: #fff0f0; color: #ff3b30; }
.feedback.yellow { background: #fff8e6; color: #ff9500; }
.feedback.green { background: #f0fff4; color: #34c759; }
.example-toggle { background: none; border: none; color: #007aff; font-size: 13px; cursor: pointer; margin-top: 12px; padding: 0; font-weight: 500; }
.example-toggle:hover { text-decoration: underline; }
.examples { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
.example { padding: 12px; border-radius: 10px; font-size: 13px; }
.example.bad { background: #fff5f5; border-left: 3px solid #ff3b30; }
.example.good { background: #f0fff4; border-left: 3px solid #34c759; }
.ex-label { font-weight: 600; font-size: 12px; display: block; margin-bottom: 6px; }
.example p { margin: 0; color: #3a3a3c; line-height: 1.5; }
.nav-buttons { display: flex; justify-content: space-between; align-items: center; }
.nav-btn { padding: 10px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
.nav-btn.primary { background: linear-gradient(135deg, #007aff, #5856d6); color: white; box-shadow: 0 2px 8px rgba(0,122,255,0.3); }
.nav-btn.primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,122,255,0.4); }
.nav-btn.primary:disabled { opacity: 0.5; cursor: not-allowed; }
.nav-btn.secondary { background: #f5f5f7; color: #1d1d1f; }
.nav-btn.secondary:hover { background: #e8e8ed; }
.scorecard { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.score-summary { font-size: 15px; font-weight: 600; color: #1d1d1f; margin-bottom: 16px; padding: 12px; background: #f5f5f7; border-radius: 10px; }
.score-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f5f5f7; }
.score-light { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
.score-light.red { background: #ff3b30; box-shadow: 0 0 6px rgba(255,59,48,0.4); }
.score-light.yellow { background: #ff9500; box-shadow: 0 0 6px rgba(255,149,0,0.4); }
.score-light.green { background: #34c759; box-shadow: 0 0 6px rgba(52,199,89,0.4); }
.score-info { display: flex; flex-direction: column; gap: 4px; }
.score-q { font-size: 13px; font-weight: 600; color: #1d1d1f; }
.score-a { font-size: 13px; color: #86868b; }
@media (prefers-color-scheme: dark) {
  .soul-questions { background: linear-gradient(180deg, #1c1c1e 0%, #2c2c2e 100%); }
  .sq-title, .question-title, .score-q { color: #f5f5f7; }
  .question-card, .scorecard { background: #2c2c2e; }
  .answer-input { background: #1c1c1e; border-color: #3a3a3c; color: #f5f5f7; }
  .answer-input:focus { background: #2c2c2e; }
  .dot { background: #2c2c2e; border-color: #48484a; color: #8e8e93; }
  .score-summary { background: #3a3a3c; color: #f5f5f7; }
  .score-a { color: #8e8e93; }
  .score-item { border-bottom-color: #3a3a3c; }
  .nav-btn.secondary { background: #3a3a3c; color: #f5f5f7; }
  .example.bad { background: #3a1c1c; }
  .example.good { background: #1c3a1c; }
  .example p { color: #aeaeb2; }
}
@media (max-width: 640px) {
  .soul-questions { padding: 16px; }
  .examples { grid-template-columns: 1fr; }
  .question-title { font-size: 16px; }
}
</style>
