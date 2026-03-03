<script setup lang="ts">
import { ref, computed } from 'vue'

interface StatusCode {
  code: number
  name: string
  category: '2xx' | '4xx' | '5xx'
  meaning: string
  scenario: string
  tip: string
}

const codes: StatusCode[] = [
  { code: 200, name: 'OK', category: '2xx', meaning: '请求成功', scenario: '获取数据、更新成功', tip: '最常见的成功状态码' },
  { code: 201, name: 'Created', category: '2xx', meaning: '资源已创建', scenario: 'POST 创建新用户/文章', tip: '创建操作成功时返回' },
  { code: 204, name: 'No Content', category: '2xx', meaning: '成功但无返回内容', scenario: 'DELETE 删除资源', tip: '操作成功但不需要返回数据' },
  { code: 400, name: 'Bad Request', category: '4xx', meaning: '请求参数错误', scenario: '表单验证失败、JSON 格式错误', tip: '检查请求体和参数格式' },
  { code: 401, name: 'Unauthorized', category: '4xx', meaning: '未认证', scenario: '未登录或 Token 过期', tip: '检查 Authorization Header' },
  { code: 403, name: 'Forbidden', category: '4xx', meaning: '无权限', scenario: '普通用户访问管理员接口', tip: '有身份但权限不足' },
  { code: 404, name: 'Not Found', category: '4xx', meaning: '资源不存在', scenario: 'URL 路径错误、资源已删除', tip: '检查请求路径是否正确' },
  { code: 429, name: 'Too Many Requests', category: '4xx', meaning: '请求过多', scenario: '触发 API 限流', tip: '降低请求频率或添加重试逻辑' },
  { code: 500, name: 'Internal Server Error', category: '5xx', meaning: '服务器内部错误', scenario: '后端代码 Bug、数据库异常', tip: '查看服务器日志排查' },
  { code: 502, name: 'Bad Gateway', category: '5xx', meaning: '网关错误', scenario: '反向代理无法连接后端', tip: '检查后端服务是否运行' },
  { code: 503, name: 'Service Unavailable', category: '5xx', meaning: '服务不可用', scenario: '服务器过载或维护中', tip: '等待服务恢复或扩容' },
]

const quizScenarios = [
  { question: '用户提交了一个格式错误的注册表单', answer: 400 },
  { question: '用户未登录就尝试访问个人主页 API', answer: 401 },
  { question: '成功获取了文章列表数据', answer: 200 },
  { question: '成功创建了一篇新文章', answer: 201 },
  { question: '请求的 /api/posts/999 不存在', answer: 404 },
  { question: '后端代码抛出了未捕获的异常', answer: 500 },
  { question: '普通用户尝试删除其他人的文章', answer: 403 },
  { question: '短时间内发送了太多请求', answer: 429 },
]

const filter = ref<'all' | '2xx' | '4xx' | '5xx'>('all')
const search = ref('')
const expanded = ref<number | null>(null)
const quizMode = ref(false)
const quizIndex = ref(0)
const quizAnswer = ref<number | null>(null)
const quizCorrect = ref<boolean | null>(null)
const quizScore = ref(0)
const quizTotal = ref(0)

const filtered = computed(() => {
  return codes.filter(c => {
    const matchCat = filter.value === 'all' || c.category === filter.value
    const q = search.value.toLowerCase()
    const matchSearch = !q || c.code.toString().includes(q) || c.name.toLowerCase().includes(q) || c.meaning.includes(q)
    return matchCat && matchSearch
  })
})

const currentQuiz = computed(() => quizScenarios[quizIndex.value])

function toggle(code: number) {
  expanded.value = expanded.value === code ? null : code
}

function categoryColor(cat: string) {
  if (cat === '2xx') return '#34c759'
  if (cat === '4xx') return '#ff9500'
  return '#ff3b30'
}

function startQuiz() {
  quizMode.value = true
  quizIndex.value = 0
  quizAnswer.value = null
  quizCorrect.value = null
  quizScore.value = 0
  quizTotal.value = 0
}

function submitQuiz(code: number) {
  quizAnswer.value = code
  quizCorrect.value = code === currentQuiz.value.answer
  quizTotal.value = quizTotal.value + 1
  if (quizCorrect.value) quizScore.value = quizScore.value + 1
}

function nextQuiz() {
  if (quizIndex.value < quizScenarios.length - 1) {
    quizIndex.value = quizIndex.value + 1
    quizAnswer.value = null
    quizCorrect.value = null
  } else {
    quizMode.value = false
  }
}
</script>

<template>
  <div class="sce-root">
    <div class="sce-header">
      <div class="sce-filters">
        <button v-for="f in (['all', '2xx', '4xx', '5xx'] as const)" :key="f"
          :class="['sce-filter', { active: filter === f }]"
          :style="f !== 'all' && filter === f ? { borderColor: categoryColor(f), color: categoryColor(f) } : {}"
          @click="filter = f; quizMode = false">
          {{ f === 'all' ? '全部' : f }}
        </button>
        <button :class="['sce-filter', 'sce-quiz-btn', { active: quizMode }]" @click="quizMode ? (quizMode = false) : startQuiz()">
          🎯 测验
        </button>
      </div>
      <input v-if="!quizMode" v-model="search" class="sce-search" placeholder="搜索状态码..." />
    </div>

    <div v-if="!quizMode" class="sce-grid">
      <div v-for="c in filtered" :key="c.code" class="sce-card" @click="toggle(c.code)">
        <div class="sce-card-head">
          <span class="sce-code" :style="{ background: categoryColor(c.category) + '18', color: categoryColor(c.category) }">
            {{ c.code }}
          </span>
          <span class="sce-name">{{ c.name }}</span>
          <span class="sce-expand">{{ expanded === c.code ? '▾' : '▸' }}</span>
        </div>
        <div class="sce-meaning">{{ c.meaning }}</div>
        <div v-if="expanded === c.code" class="sce-detail">
          <div class="sce-detail-row"><span class="sce-label">场景</span>{{ c.scenario }}</div>
          <div class="sce-detail-row"><span class="sce-label">排查</span>{{ c.tip }}</div>
        </div>
      </div>
    </div>

    <div v-if="quizMode" class="sce-quiz">
      <div class="sce-quiz-progress">{{ quizIndex + 1 }} / {{ quizScenarios.length }}</div>
      <div class="sce-quiz-question">{{ currentQuiz.question }}</div>
      <div class="sce-quiz-options">
        <button v-for="c in codes" :key="c.code"
          :class="['sce-quiz-opt', {
            correct: quizAnswer !== null && c.code === currentQuiz.answer,
            wrong: quizAnswer === c.code && !quizCorrect
          }]"
          :disabled="quizAnswer !== null"
          @click="submitQuiz(c.code)">
          {{ c.code }}
        </button>
      </div>
      <div v-if="quizAnswer !== null" class="sce-quiz-feedback" :class="quizCorrect ? 'is-correct' : 'is-wrong'">
        {{ quizCorrect ? '正确！' : `应该是 ${currentQuiz.answer}` }}
        <button class="sce-quiz-next" @click="nextQuiz">
          {{ quizIndex < quizScenarios.length - 1 ? '下一题 →' : `完成（${quizScore}/${quizTotal}）` }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sce-root { margin: 24px 0; }
.sce-header { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.sce-filters { display: flex; gap: 6px; flex-wrap: wrap; }
.sce-filter {
  padding: 4px 14px; border-radius: 8px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); font-size: 13px; cursor: pointer;
  color: var(--vp-c-text-2); transition: all 0.2s; font-weight: 600;
}
.sce-filter.active { border-color: var(--vp-c-brand); color: var(--vp-c-brand); background: var(--vp-c-brand-dimm); }
.sce-quiz-btn.active { border-color: #ff9500; color: #ff9500; background: rgba(255,149,0,0.08); }
.sce-search {
  flex: 1; min-width: 140px; padding: 6px 12px; border-radius: 8px;
  border: 1.5px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);
  font-size: 13px; color: var(--vp-c-text-1); outline: none; transition: border-color 0.2s;
}
.sce-search:focus { border-color: var(--vp-c-brand); }
.sce-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; }
.sce-card {
  padding: 14px 16px; border-radius: 12px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); cursor: pointer; transition: all 0.2s;
}
.sce-card:hover { border-color: var(--vp-c-text-3); transform: translateY(-1px); }
.sce-card-head { display: flex; align-items: center; gap: 8px; }
.sce-code {
  padding: 2px 10px; border-radius: 6px; font-size: 14px; font-weight: 700;
  font-family: 'SF Mono', Monaco, monospace;
}
.sce-name { font-size: 13px; font-weight: 600; color: var(--vp-c-text-1); }
.sce-expand { margin-left: auto; font-size: 12px; color: var(--vp-c-text-3); }
.sce-meaning { font-size: 12px; color: var(--vp-c-text-2); margin-top: 6px; }
.sce-detail {
  margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--vp-c-divider);
  animation: sceFadeIn 0.2s ease;
}
.sce-detail-row { font-size: 12px; color: var(--vp-c-text-2); line-height: 1.6; }
.sce-label {
  display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 11px;
  font-weight: 600; background: var(--vp-c-default-soft); color: var(--vp-c-text-3);
  margin-right: 6px;
}
.sce-quiz { text-align: center; }
.sce-quiz-progress { font-size: 12px; color: var(--vp-c-text-3); margin-bottom: 8px; }
.sce-quiz-question {
  font-size: 17px; font-weight: 600; color: var(--vp-c-text-1);
  margin-bottom: 20px; line-height: 1.5;
}
.sce-quiz-options { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.sce-quiz-opt {
  padding: 6px 16px; border-radius: 8px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); font-size: 14px; font-weight: 700; cursor: pointer;
  font-family: 'SF Mono', Monaco, monospace; transition: all 0.2s; color: var(--vp-c-text-1);
}
.sce-quiz-opt:not(:disabled):hover { border-color: var(--vp-c-brand); transform: translateY(-1px); }
.sce-quiz-opt:disabled { cursor: default; opacity: 0.5; }
.sce-quiz-opt.correct { border-color: #34c759; background: rgba(52,199,89,0.1); color: #34c759; opacity: 1; }
.sce-quiz-opt.wrong { border-color: #ff3b30; background: rgba(255,59,48,0.1); color: #ff3b30; opacity: 1; }
.sce-quiz-feedback {
  margin-top: 16px; padding: 12px 20px; border-radius: 10px; font-size: 14px;
  font-weight: 600; display: inline-flex; align-items: center; gap: 12px;
}
.sce-quiz-feedback.is-correct { background: rgba(52,199,89,0.1); color: #34c759; }
.sce-quiz-feedback.is-wrong { background: rgba(255,59,48,0.1); color: #ff3b30; }
.sce-quiz-next {
  padding: 4px 14px; border-radius: 6px; border: none; font-size: 13px;
  font-weight: 600; cursor: pointer; background: var(--vp-c-bg); color: var(--vp-c-text-1);
  transition: opacity 0.2s;
}
.sce-quiz-next:hover { opacity: 0.7; }
@keyframes sceFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 640px) {
  .sce-grid { grid-template-columns: 1fr; }
  .sce-header { flex-direction: column; align-items: stretch; }
  .sce-search { min-width: auto; }
}
</style>
