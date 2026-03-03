<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref<'codes' | 'idempotent' | 'validation'>('codes')

// ─── Tab 1: Status Codes ───
interface StatusCode {
  code: number
  text: string
  desc: string
}
interface CodeGroup {
  label: string
  color: string
  bg: string
  codes: StatusCode[]
}

const codeGroups: CodeGroup[] = [
  {
    label: '2xx 成功',
    color: '#15a051',
    bg: '#15a05112',
    codes: [
      { code: 200, text: 'OK', desc: '请求成功，返回数据' },
      { code: 201, text: 'Created', desc: '资源创建成功' },
      { code: 204, text: 'No Content', desc: '成功但无返回体（如删除）' },
    ],
  },
  {
    label: '4xx 客户端错误',
    color: '#D4952C',
    bg: '#D4952C12',
    codes: [
      { code: 400, text: 'Bad Request', desc: '请求格式有误' },
      { code: 401, text: 'Unauthorized', desc: '未登录 / Token 过期' },
      { code: 403, text: 'Forbidden', desc: '已登录但没权限' },
      { code: 404, text: 'Not Found', desc: '资源不存在' },
      { code: 409, text: 'Conflict', desc: '数据冲突（如重复创建）' },
      { code: 422, text: 'Unprocessable', desc: '格式对但内容不合法' },
    ],
  },
  {
    label: '5xx 服务端错误',
    color: '#ef4444',
    bg: '#ef444412',
    codes: [
      { code: 500, text: 'Internal Server Error', desc: '服务器内部出错' },
      { code: 502, text: 'Bad Gateway', desc: '上游服务无响应' },
      { code: 503, text: 'Service Unavailable', desc: '服务暂时不可用' },
    ],
  },
]

// ─── Tab 2: Idempotency ───
interface IdempotentRow {
  method: string
  idempotent: boolean
  desc: string
  color: string
}

const idempotentRows: IdempotentRow[] = [
  { method: 'GET', idempotent: true, desc: '读取数据，调多少次结果一样', color: '#2eb3df' },
  { method: 'POST', idempotent: false, desc: '每次调用都创建新资源', color: '#15a051' },
  { method: 'PUT / PATCH', idempotent: true, desc: '更新为相同值，结果一样', color: '#D4952C' },
  { method: 'DELETE', idempotent: true, desc: '删除同一个资源，结果一样', color: '#ef4444' },
]

// ─── Tab 3: Validation Flow ───
interface FlowStep {
  label: string
  detail: string
  errorCode?: string
  errorLabel?: string
}

const flowSteps: FlowStep[] = [
  { label: '请求到达', detail: '客户端发送 HTTP 请求' },
  { label: '格式校验', detail: 'Zod Schema 验证字段类型和格式', errorCode: '422', errorLabel: '格式不合法' },
  { label: '业务校验', detail: '查数据库检查重复、权限等', errorCode: '409', errorLabel: '数据冲突' },
  { label: '执行操作', detail: '写入数据库 / 调用外部服务' },
  { label: '返回结果', detail: '200 / 201 成功响应' },
]
const activeFlowStep = ref<number | null>(null)
</script>

<template>
  <div class="eh-container">
    <div class="eh-tab-bar">
      <button
        :class="['eh-tab', { active: activeTab === 'codes' }]"
        @click="activeTab = 'codes'"
      >状态码速查</button>
      <button
        :class="['eh-tab', { active: activeTab === 'idempotent' }]"
        @click="activeTab = 'idempotent'"
      >幂等性对比</button>
      <button
        :class="['eh-tab', { active: activeTab === 'validation' }]"
        @click="activeTab = 'validation'"
      >校验流程</button>
    </div>

    <!-- Tab 1: Status Codes -->
    <div v-if="activeTab === 'codes'" class="eh-body">
      <p class="eh-intro">点击状态码查看说明。记住规律：2xx 成功、4xx 你的锅、5xx 服务器的锅。</p>
      <div v-for="group in codeGroups" :key="group.label" class="eh-group">
        <div class="eh-group-label" :style="{ color: group.color }">{{ group.label }}</div>
        <div class="eh-code-grid">
          <div
            v-for="sc in group.codes" :key="sc.code"
            class="eh-code-card"
            :style="{ '--gc': group.color, '--gb': group.bg }"
          >
            <div class="eh-code-num">{{ sc.code }}</div>
            <div class="eh-code-text">{{ sc.text }}</div>
            <div class="eh-code-desc">{{ sc.desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: Idempotency -->
    <div v-if="activeTab === 'idempotent'" class="eh-body">
      <p class="eh-intro">幂等 = 同一个请求发多次，效果和发一次一样。网络重试时，幂等的方法更安全。</p>
      <div class="eh-idem-list">
        <div
          v-for="row in idempotentRows" :key="row.method"
          class="eh-idem-card"
        >
          <div class="eh-idem-left">
            <span class="eh-idem-method" :style="{ color: row.color }">{{ row.method }}</span>
            <span
              :class="['eh-idem-badge', row.idempotent ? 'eh-idem-yes' : 'eh-idem-no']"
            >{{ row.idempotent ? '幂等' : '非幂等' }}</span>
          </div>
          <div class="eh-idem-desc">{{ row.desc }}</div>
        </div>
      </div>
    </div>

    <!-- Tab 3: Validation Flow -->
    <div v-if="activeTab === 'validation'" class="eh-body">
      <p class="eh-intro">请求从到达到返回，每一步都可能拦截。点击步骤查看详情。</p>
      <div class="eh-flow">
        <div
          v-for="(step, i) in flowSteps" :key="i"
          class="eh-flow-row"
        >
          <div
            :class="['eh-flow-step', { 'eh-flow-active': activeFlowStep === i }]"
            @click="activeFlowStep = activeFlowStep === i ? null : i"
          >
            <div class="eh-flow-num">{{ i + 1 }}</div>
            <div class="eh-flow-label">{{ step.label }}</div>
            <div v-if="activeFlowStep === i" class="eh-flow-detail">{{ step.detail }}</div>
          </div>
          <!-- Error branch -->
          <div v-if="step.errorCode" class="eh-flow-error">
            <div class="eh-flow-error-arrow">→</div>
            <div class="eh-flow-error-box">
              <span class="eh-flow-error-code">{{ step.errorCode }}</span>
              <span class="eh-flow-error-label">{{ step.errorLabel }}</span>
            </div>
          </div>
          <!-- Connector -->
          <div v-if="i < flowSteps.length - 1" class="eh-flow-connector">
            <div class="eh-flow-line"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.eh-container {
  margin: 1.5rem 0;
  max-width: 688px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

/* ─── Tab Bar ─── */
.eh-tab-bar {
  display: flex;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.eh-tab {
  flex: 1;
  padding: 12px 8px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: all .2s;
  border-bottom: 2px solid transparent;
}
.eh-tab.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
}
.eh-tab:hover:not(.active) { background: var(--vp-c-bg-mute); }

/* ─── Body ─── */
.eh-body { padding: 20px; }
.eh-intro { color: var(--vp-c-text-2); font-size: 13px; margin: 0 0 16px; }

/* ─── Status Codes ─── */
.eh-group { margin-bottom: 16px; }
.eh-group:last-child { margin-bottom: 0; }
.eh-group-label {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
}
.eh-code-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}
.eh-code-card {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--gb);
  border: 1px solid color-mix(in srgb, var(--gc) 20%, transparent);
  transition: transform .15s, box-shadow .15s;
}
.eh-code-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--gc) 15%, transparent);
}
.eh-code-num {
  font-size: 20px;
  font-weight: 800;
  font-family: var(--vp-font-family-mono);
  color: var(--gc);
}
.eh-code-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  margin: 2px 0 4px;
}
.eh-code-desc {
  font-size: 12px;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}

/* ─── Idempotency ─── */
.eh-idem-list { display: flex; flex-direction: column; gap: 10px; }
.eh-idem-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  transition: border-color .15s;
}
.eh-idem-card:hover { border-color: var(--vp-c-text-3); }
.eh-idem-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.eh-idem-method {
  font-size: 15px;
  font-weight: 800;
  font-family: var(--vp-font-family-mono);
  min-width: 90px;
}
.eh-idem-badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.eh-idem-yes { background: #15a05118; color: #15a051; }
.eh-idem-no { background: #ef444418; color: #ef4444; }
.eh-idem-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
  text-align: right;
}

/* ─── Validation Flow ─── */
.eh-flow {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  padding-left: 8px;
}
.eh-flow-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}
.eh-flow-step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  cursor: pointer;
  transition: all .2s;
  flex-wrap: wrap;
  min-width: 200px;
}
.eh-flow-step:hover { border-color: var(--vp-c-brand-1); }
.eh-flow-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.eh-flow-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.eh-flow-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.eh-flow-detail {
  width: 100%;
  font-size: 12px;
  color: var(--vp-c-text-2);
  padding: 4px 0 0 34px;
  animation: ehFadeIn .2s;
}
.eh-flow-error {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  margin-top: 8px;
}
.eh-flow-error-arrow {
  color: #ef4444;
  font-size: 16px;
  font-weight: 700;
}
.eh-flow-error-box {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  background: #ef444412;
  border: 1px solid #ef444433;
}
.eh-flow-error-code {
  font-size: 13px;
  font-weight: 800;
  font-family: var(--vp-font-family-mono);
  color: #ef4444;
}
.eh-flow-error-label {
  font-size: 12px;
  color: #ef4444;
}
.eh-flow-connector {
  display: flex;
  justify-content: flex-start;
  padding-left: 28px;
  height: 20px;
  align-items: center;
}
.eh-flow-line {
  width: 2px;
  height: 100%;
  background: var(--vp-c-divider);
  border-radius: 1px;
}

/* ─── Animations ─── */
@keyframes ehFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

/* ─── Dark Mode ─── */
:global(html.dark) .eh-code-card { border-color: color-mix(in srgb, var(--gc) 30%, transparent); }
:global(html.dark) .eh-flow-error-box { background: #ef444420; }

/* ─── Responsive ─── */
@media (max-width: 640px) {
  .eh-tab { font-size: 12px; padding: 10px 4px; }
  .eh-code-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
  .eh-idem-card { flex-direction: column; align-items: flex-start; gap: 6px; }
  .eh-idem-desc { text-align: left; }
  .eh-flow-row { flex-direction: column; gap: 4px; }
  .eh-flow-step { min-width: 0; width: 100%; }
  .eh-flow-error { padding-left: 28px; }
}
</style>
