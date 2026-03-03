<script setup lang="ts">
import { ref, computed } from 'vue'

interface Scenario {
  method: string
  methodColor: string
  url: string
  headers: Record<string, string>
  body?: string
  status: number
  statusText: string
  statusColor: string
  responseBody: string
  description: string
}

const scenarios: Scenario[] = [
  {
    method: 'GET', methodColor: '#34c759', url: '/api/users', description: '获取用户列表',
    headers: { 'Accept': 'application/json' }, body: undefined,
    status: 200, statusText: 'OK', statusColor: '#34c759',
    responseBody: '{\n  "users": [\n    { "id": 1, "name": "张三" },\n    { "id": 2, "name": "李四" }\n  ],\n  "total": 2\n}'
  },
  {
    method: 'POST', methodColor: '#007aff', url: '/api/posts', description: '创建文章',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token...' },
    body: '{\n  "title": "新文章",\n  "content": "文章内容"\n}',
    status: 201, statusText: 'Created', statusColor: '#34c759',
    responseBody: '{\n  "id": "post_456",\n  "title": "新文章",\n  "createdAt": "2025-01-28"\n}'
  },
  {
    method: 'POST', methodColor: '#007aff', url: '/api/login', description: '参数错误',
    headers: { 'Content-Type': 'application/json' },
    body: '{\n  "email": "not-an-email"\n}',
    status: 400, statusText: 'Bad Request', statusColor: '#ff9500',
    responseBody: '{\n  "error": "参数错误",\n  "details": [\n    "email 格式不正确"\n  ]\n}'
  },
  {
    method: 'GET', methodColor: '#34c759', url: '/api/profile', description: '未授权',
    headers: {}, body: undefined,
    status: 401, statusText: 'Unauthorized', statusColor: '#ff9500',
    responseBody: '{\n  "error": "未认证",\n  "message": "请先登录"\n}'
  },
  {
    method: 'GET', methodColor: '#34c759', url: '/api/data', description: '服务器错误',
    headers: { 'Accept': 'application/json' }, body: undefined,
    status: 500, statusText: 'Internal Server Error', statusColor: '#ff3b30',
    responseBody: '{\n  "error": "服务器内部错误",\n  "message": "请稍后重试"\n}'
  },
]

const selected = ref(0)
const phase = ref<'idle' | 'sending' | 'processing' | 'done'>('idle')

const scenario = computed(() => scenarios[selected.value])

function send() {
  if (phase.value !== 'idle' && phase.value !== 'done') return
  phase.value = 'sending'
  setTimeout(() => { phase.value = 'processing' }, 600)
  setTimeout(() => { phase.value = 'done' }, 1200)
}

function selectScenario(i: number) {
  selected.value = i
  phase.value = 'idle'
}
</script>

<template>
  <div class="hrf-root">
    <div class="hrf-scenarios">
      <button v-for="(s, i) in scenarios" :key="i"
        :class="['hrf-scenario', { active: selected === i }]"
        @click="selectScenario(i)">
        <span class="hrf-method-tag" :style="{ color: s.methodColor }">{{ s.method }}</span>
        {{ s.description }}
      </button>
    </div>

    <div class="hrf-flow">
      <div class="hrf-side hrf-request">
        <div class="hrf-side-title">🌐 请求</div>
        <div class="hrf-field"><span class="hrf-label">Method</span><span class="hrf-method" :style="{ color: scenario.methodColor }">{{ scenario.method }}</span></div>
        <div class="hrf-field"><span class="hrf-label">URL</span><code class="hrf-url">{{ scenario.url }}</code></div>
        <div class="hrf-field"><span class="hrf-label">Headers</span>
          <div class="hrf-headers">
            <div v-for="(v, k) in scenario.headers" :key="k" class="hrf-header-line">{{ k }}: {{ v }}</div>
            <div v-if="Object.keys(scenario.headers).length === 0" class="hrf-empty">（无）</div>
          </div>
        </div>
        <div v-if="scenario.body" class="hrf-field"><span class="hrf-label">Body</span><pre class="hrf-code">{{ scenario.body }}</pre></div>
      </div>

      <div class="hrf-middle">
        <button class="hrf-send" @click="send" :disabled="phase === 'sending' || phase === 'processing'">
          {{ phase === 'idle' || phase === 'done' ? 'Send →' : '...' }}
        </button>
        <div class="hrf-anim-track">
          <div :class="['hrf-packet', phase]"></div>
        </div>
      </div>

      <div class="hrf-side hrf-response" :class="{ visible: phase === 'done' }">
        <div class="hrf-side-title">📥 响应</div>
        <div class="hrf-field">
          <span class="hrf-label">Status</span>
          <span class="hrf-status" :style="{ background: scenario.statusColor + '18', color: scenario.statusColor }">
            {{ scenario.status }} {{ scenario.statusText }}
          </span>
        </div>
        <div class="hrf-field"><span class="hrf-label">Body</span><pre class="hrf-code">{{ scenario.responseBody }}</pre></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hrf-root { margin: 24px 0; }
.hrf-scenarios { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
.hrf-scenario {
  padding: 5px 12px; border-radius: 8px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); font-size: 12px; cursor: pointer;
  color: var(--vp-c-text-2); transition: all 0.2s; display: flex; align-items: center; gap: 6px;
}
.hrf-scenario.active { border-color: var(--vp-c-brand); color: var(--vp-c-text-1); background: var(--vp-c-brand-dimm); }
.hrf-scenario:hover { border-color: var(--vp-c-text-3); }
.hrf-method-tag { font-weight: 700; font-family: 'SF Mono', Monaco, monospace; font-size: 11px; }
.hrf-flow { display: flex; gap: 12px; align-items: stretch; }
.hrf-side {
  flex: 1; padding: 14px; border-radius: 12px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); min-width: 0;
}
.hrf-response { opacity: 0.3; transition: opacity 0.3s ease; }
.hrf-response.visible { opacity: 1; }
.hrf-side-title { font-size: 14px; font-weight: 700; color: var(--vp-c-text-1); margin-bottom: 10px; }
.hrf-field { margin-bottom: 8px; }
.hrf-label {
  display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 10px;
  font-weight: 600; background: var(--vp-c-default-soft); color: var(--vp-c-text-3);
  margin-right: 6px; margin-bottom: 4px;
}
.hrf-method { font-weight: 700; font-family: 'SF Mono', Monaco, monospace; font-size: 14px; }
.hrf-url { font-size: 12px; background: var(--vp-c-default-soft); padding: 2px 6px; border-radius: 4px; }
.hrf-headers { font-size: 11px; color: var(--vp-c-text-2); font-family: 'SF Mono', Monaco, monospace; }
.hrf-header-line { line-height: 1.6; }
.hrf-empty { color: var(--vp-c-text-3); font-style: italic; }
.hrf-code {
  font-size: 11px; font-family: 'SF Mono', Monaco, monospace; line-height: 1.5;
  background: var(--vp-c-default-soft); padding: 8px 10px; border-radius: 6px;
  margin: 4px 0 0; overflow-x: auto; color: var(--vp-c-text-1); white-space: pre;
}
.hrf-status {
  display: inline-block; padding: 2px 10px; border-radius: 6px;
  font-size: 13px; font-weight: 700; font-family: 'SF Mono', Monaco, monospace;
}
.hrf-middle {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; min-width: 80px;
}
.hrf-send {
  padding: 8px 18px; border-radius: 10px; border: none; font-size: 13px;
  font-weight: 700; cursor: pointer; background: #007aff; color: #fff;
  transition: all 0.2s;
}
.hrf-send:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
.hrf-send:disabled { opacity: 0.5; cursor: default; }
.hrf-anim-track {
  width: 4px; height: 60px; background: var(--vp-c-divider); border-radius: 2px;
  position: relative; overflow: hidden;
}
.hrf-packet {
  width: 4px; height: 16px; border-radius: 2px; background: #007aff;
  position: absolute; left: 0; top: -16px; transition: top 0.5s ease;
}
.hrf-packet.sending { top: 20px; }
.hrf-packet.processing { top: 40px; background: #ff9500; }
.hrf-packet.done { top: 60px; background: #34c759; }
@media (max-width: 640px) {
  .hrf-flow { flex-direction: column; }
  .hrf-middle { flex-direction: row; min-width: auto; }
  .hrf-anim-track { width: 60px; height: 4px; }
  .hrf-packet { width: 16px; height: 4px; top: 0; left: -16px; transition: left 0.5s ease; }
  .hrf-packet.sending { left: 20px; top: 0; }
  .hrf-packet.processing { left: 40px; top: 0; }
  .hrf-packet.done { left: 60px; top: 0; }
}
</style>
