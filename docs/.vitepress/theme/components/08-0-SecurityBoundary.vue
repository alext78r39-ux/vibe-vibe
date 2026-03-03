<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{ mode?: 'boundary' | 'middleware' }>(), { mode: 'boundary' })

const timers: number[] = []
function later(fn: () => void, ms: number) {
  const id = window.setTimeout(fn, ms)
  timers.push(id)
  return id
}
onUnmounted(() => timers.forEach(clearTimeout))

// ─── MODE 1: BOUNDARY ───
interface EnvVar {
  key: string
  value: string
  public: boolean
  tip: string
}
const envVars: EnvVar[] = [
  { key: 'API_KEY', value: 'sk-proj-a8x...k9z', public: false, tip: '私密密钥只能在服务端使用，泄露意味着任何人都能以你的身份调用付费 API。' },
  { key: 'DATABASE_URL', value: 'postgres://user:pw@db:5432/app', public: false, tip: '数据库连接串包含账号密码，暴露后攻击者可直接读写你的数据库。' },
  { key: 'JWT_SECRET', value: 'super-secret-jwt-key', public: false, tip: '签名密钥泄露后，攻击者可以伪造任意用户的登录令牌。' },
  { key: 'NEXT_PUBLIC_SITE_URL', value: 'https://myapp.com', public: true, tip: '带 NEXT_PUBLIC_ 前缀的变量会被打包进客户端代码，适合放公开信息。' },
  { key: 'NEXT_PUBLIC_GA_ID', value: 'G-XXXXXXXXXX', public: true, tip: 'Google Analytics ID 本身就是公开的，放在客户端没有安全风险。' },
]
const activeTooltip = ref<string | null>(null)
function toggleTip(key: string) {
  activeTooltip.value = activeTooltip.value === key ? null : key
}

// ─── MODE 2: MIDDLEWARE ───
interface ReqBall {
  id: number
  path: string
  color: string
  state: 'queue' | 'flying' | 'passed' | 'blocked'
  message: string
}
const loggedIn = ref(false)
const isAdmin = ref(false)
const hasToken = ref(false)
const mwRunning = ref(false)
const reqBalls = ref<ReqBall[]>([])
let ballIdSeq = 0

const guardRule = computed(() => '拦截 /admin/* 和 /api/*')

function resetBalls() {
  ballIdSeq = 0
  reqBalls.value = [
    { id: ++ballIdSeq, path: '/home', color: '#2eb3df', state: 'queue', message: '' },
    { id: ++ballIdSeq, path: '/admin', color: '#D4952C', state: 'queue', message: '' },
    { id: ++ballIdSeq, path: '/api/data', color: '#9333ea', state: 'queue', message: '' },
  ]
}
resetBalls()

function evaluateRequest(ball: ReqBall): { pass: boolean; msg: string } {
  if (ball.path === '/home') return { pass: true, msg: '✅ 公开路由，直接放行' }
  if (ball.path === '/admin') {
    if (!loggedIn.value) return { pass: false, msg: '→ 重定向 /login' }
    if (!isAdmin.value) return { pass: false, msg: '403 Forbidden（需要 admin 角色）' }
    return { pass: true, msg: '✅ 已认证 admin，放行' }
  }
  if (ball.path === '/api/data') {
    if (!loggedIn.value || !hasToken.value) return { pass: false, msg: '401 Unauthorized' }
    return { pass: true, msg: '✅ Token 有效，放行' }
  }
  return { pass: true, msg: '✅ 放行' }
}

async function runMiddleware() {
  if (mwRunning.value) return
  mwRunning.value = true
  // reset states
  reqBalls.value = reqBalls.value.map(b => ({ ...b, state: 'queue' as const, message: '' }))
  await new Promise<void>(r => later(r, 300))

  for (let i = 0; i < reqBalls.value.length; i++) {
    // move to flying
    reqBalls.value = reqBalls.value.map((b, idx) =>
      idx === i ? { ...b, state: 'flying' as const } : b
    )
    await new Promise<void>(r => later(r, 600))

    // evaluate
    const result = evaluateRequest(reqBalls.value[i])
    reqBalls.value = reqBalls.value.map((b, idx) =>
      idx === i ? { ...b, state: result.pass ? 'passed' as const : 'blocked' as const, message: result.msg } : b
    )
    await new Promise<void>(r => later(r, 400))
  }
  mwRunning.value = false
}
</script>

<template>
  <div class="sb-container">
    <!-- ═══ BOUNDARY MODE ═══ -->
    <template v-if="props.mode === 'boundary'">
      <div class="sb-split">
        <div class="sb-zone sb-server">
          <div class="sb-zone-title">🔒 Server（安全区）</div>
          <div class="sb-file-label">.env</div>
          <ul class="sb-var-list">
            <li v-for="v in envVars" :key="v.key" class="sb-var-item" @click="toggleTip(v.key)">
              <span class="sb-var-key">{{ v.key }}</span>
              <span class="sb-var-eq">=</span>
              <span class="sb-var-val">{{ v.value }}</span>
              <span v-if="v.public" class="sb-badge sb-badge-pub">公开</span>
              <span v-else class="sb-badge sb-badge-priv">私密</span>
            </li>
          </ul>
        </div>
        <div class="sb-divider">
          <div class="sb-divider-line" />
          <span class="sb-divider-label">网络边界</span>
          <div class="sb-divider-line" />
        </div>
        <div class="sb-zone sb-client">
          <div class="sb-zone-title">👁️ Client（用户可见）</div>
          <div class="sb-file-label">浏览器 DevTools</div>
          <ul class="sb-var-list">
            <li v-for="v in envVars" :key="v.key" class="sb-var-item sb-var-item-client" @click="toggleTip(v.key)">
              <span class="sb-var-key">{{ v.key }}</span>
              <span class="sb-var-eq">=</span>
              <template v-if="v.public">
                <span class="sb-var-val sb-val-ok">{{ v.value }} ✅</span>
              </template>
              <template v-else>
                <span class="sb-var-val sb-val-no">❌ undefined</span>
              </template>
            </li>
          </ul>
        </div>
      </div>
      <div v-if="activeTooltip" class="sb-tooltip-bar">
        <span class="sb-tooltip-icon">💡</span>
        {{ envVars.find(v => v.key === activeTooltip)?.tip }}
      </div>
      <div class="sb-warning-bar">
        ⚠️ 把 API_KEY 暴露给客户端 = 把保险箱密码贴在大门上
      </div>
    </template>

    <!-- ═══ MIDDLEWARE MODE ═══ -->
    <template v-else>
      <div class="sb-mw-controls">
        <label class="sb-toggle">
          <input type="checkbox" v-model="loggedIn" :disabled="mwRunning" />
          <span>{{ loggedIn ? '✅ 已登录' : '❌ 未登录' }}</span>
        </label>
        <label v-if="loggedIn" class="sb-toggle">
          <input type="checkbox" v-model="isAdmin" :disabled="mwRunning" />
          <span>{{ isAdmin ? '👑 role=admin' : '👤 role=user' }}</span>
        </label>
        <label v-if="loggedIn" class="sb-toggle">
          <input type="checkbox" v-model="hasToken" :disabled="mwRunning" />
          <span>{{ hasToken ? '🔑 携带 Token' : '🚫 无 Token' }}</span>
        </label>
        <button class="sb-btn" :disabled="mwRunning" @click="runMiddleware">发送请求</button>
        <button class="sb-btn sb-btn-reset" :disabled="mwRunning" @click="resetBalls">重置</button>
      </div>
      <div class="sb-mw-rule">🛡️ 中间件规则：{{ guardRule }}</div>
      <div class="sb-mw-stage">
        <div class="sb-mw-col sb-mw-queue">
          <div class="sb-mw-col-label">请求队列</div>
          <TransitionGroup name="sb-ball">
            <div
              v-for="b in reqBalls.filter(x => x.state === 'queue')"
              :key="b.id"
              class="sb-ball"
              :style="{ background: b.color }"
            >{{ b.path }}</div>
          </TransitionGroup>
        </div>
        <div class="sb-mw-col sb-mw-guard">
          <div class="sb-guard-icon">🛡️</div>
          <TransitionGroup name="sb-ball">
            <div
              v-for="b in reqBalls.filter(x => x.state === 'flying')"
              :key="b.id"
              class="sb-ball sb-ball-fly"
              :style="{ background: b.color }"
            >{{ b.path }}</div>
          </TransitionGroup>
        </div>
        <div class="sb-mw-col sb-mw-results">
          <div class="sb-mw-col-label">结果</div>
          <TransitionGroup name="sb-result">
            <div
              v-for="b in reqBalls.filter(x => x.state === 'passed' || x.state === 'blocked')"
              :key="b.id"
              class="sb-result-item"
              :class="b.state === 'passed' ? 'sb-result-pass' : 'sb-result-block'"
            >
              <span class="sb-ball sb-ball-sm" :style="{ background: b.color }">{{ b.path }}</span>
              <span class="sb-result-msg">{{ b.message }}</span>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.sb-container {
  max-width: 688px;
  margin: 1.5rem auto;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  color: #1a1a1a;
}

/* ─── BOUNDARY MODE ─── */
.sb-split {
  display: flex;
  gap: 0;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
}
.sb-zone {
  flex: 1;
  padding: 16px;
  min-width: 0;
}
.sb-server { background: #e8f5e9; }
.sb-client { background: #ffeaea; }
.sb-zone-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
}
.sb-file-label {
  display: inline-block;
  font-size: 12px;
  background: rgba(0,0,0,.08);
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 10px;
  font-family: 'Fira Code', monospace;
}
.sb-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  flex-shrink: 0;
  background: #f5f5f5;
}
.sb-divider-line {
  flex: 1;
  width: 2px;
  border-left: 2px dashed #bbb;
}
.sb-divider-label {
  writing-mode: vertical-rl;
  font-size: 11px;
  color: #888;
  padding: 6px 0;
  letter-spacing: 2px;
}
.sb-var-list { list-style: none; padding: 0; margin: 0; }
.sb-var-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background .2s;
  flex-wrap: wrap;
  font-family: 'Fira Code', ui-monospace, monospace;
  font-size: 12px;
  line-height: 1.6;
}
.sb-var-item:hover { background: rgba(0,0,0,.06); }
.sb-var-key { color: #9333ea; font-weight: 600; }
.sb-var-eq { color: #888; }
.sb-var-val { color: #333; word-break: break-all; }
.sb-val-ok { color: #15a051; }
.sb-val-no { color: #ff3b30; opacity: .8; }
.sb-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
  margin-left: auto;
  flex-shrink: 0;
  font-family: system-ui, sans-serif;
}
.sb-badge-pub { background: #d1fae5; color: #15a051; }
.sb-badge-priv { background: #fee2e2; color: #ff3b30; }
.sb-tooltip-bar {
  margin-top: 10px;
  padding: 10px 14px;
  background: #fffbeb;
  border: 1px solid #f0d68a;
  border-radius: 8px;
  font-size: 13px;
  color: #92600a;
  animation: sb-fade-in .25s ease;
}
.sb-tooltip-icon { margin-right: 4px; }
.sb-warning-bar {
  margin-top: 10px;
  padding: 10px 14px;
  background: #fff0f0;
  border: 1px solid #ffb3b3;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #cc2020;
  text-align: center;
}

/* ─── MIDDLEWARE MODE ─── */
.sb-mw-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}
.sb-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
}
.sb-toggle input { accent-color: #15a051; cursor: pointer; }
.sb-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  background: #15a051;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity .2s;
}
.sb-btn:disabled { opacity: .5; cursor: not-allowed; }
.sb-btn:hover:not(:disabled) { opacity: .85; }
.sb-btn-reset { background: #888; }
.sb-mw-rule {
  padding: 8px 14px;
  background: #f0f4ff;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  font-size: 13px;
  color: #4338ca;
  margin-bottom: 14px;
  text-align: center;
  font-weight: 600;
}
.sb-mw-stage {
  display: flex;
  gap: 0;
  min-height: 180px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
}
.sb-mw-col {
  flex: 1;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.sb-mw-col-label {
  font-size: 12px;
  font-weight: 700;
  color: #666;
  margin-bottom: 4px;
}
.sb-mw-queue { background: #f8f9fa; }
.sb-mw-guard {
  background: #f0f4ff;
  border-left: 1px dashed #c7d2fe;
  border-right: 1px dashed #c7d2fe;
  justify-content: center;
}
.sb-guard-icon { font-size: 32px; margin-bottom: 6px; }
.sb-mw-results { background: #f8f9fa; }
.sb-ball {
  padding: 5px 12px;
  border-radius: 20px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  font-family: 'Fira Code', monospace;
  white-space: nowrap;
  transition: all .4s ease;
}
.sb-ball-fly { animation: sb-pulse .6s ease infinite alternate; }
.sb-ball-sm {
  padding: 3px 8px;
  font-size: 11px;
  display: inline-block;
}
.sb-result-item {
  display: flex;
  align-items: center;
  gap: 8px;
  animation: sb-fade-in .35s ease;
  width: 100%;
}
.sb-result-msg { font-size: 12px; font-weight: 600; }
.sb-result-pass .sb-result-msg { color: #15a051; }
.sb-result-block .sb-result-msg { color: #ff3b30; }

/* Transitions */
.sb-ball-enter-active, .sb-ball-leave-active { transition: all .35s ease; }
.sb-ball-enter-from { opacity: 0; transform: translateX(-20px); }
.sb-ball-leave-to { opacity: 0; transform: translateX(20px); }
.sb-result-enter-active { transition: all .35s ease; }
.sb-result-enter-from { opacity: 0; transform: translateY(10px); }

@keyframes sb-pulse {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}
@keyframes sb-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ─── DARK MODE ─── */
:global(html.dark) .sb-container { color: #e0e0e0; }
:global(html.dark) .sb-split { border-color: #333; }
:global(html.dark) .sb-server { background: #0d2818; }
:global(html.dark) .sb-client { background: #2a0f0f; }
:global(html.dark) .sb-divider { background: #1a1a1a; }
:global(html.dark) .sb-divider-line { border-color: #555; }
:global(html.dark) .sb-divider-label { color: #888; }
:global(html.dark) .sb-file-label { background: rgba(255,255,255,.1); color: #ccc; }
:global(html.dark) .sb-var-item:hover { background: rgba(255,255,255,.06); }
:global(html.dark) .sb-var-val { color: #ccc; }
:global(html.dark) .sb-badge-pub { background: #064e2a; color: #6ee7a0; }
:global(html.dark) .sb-badge-priv { background: #4a1010; color: #fca5a5; }
:global(html.dark) .sb-tooltip-bar { background: #2a2000; border-color: #5a4a10; color: #f0d68a; }
:global(html.dark) .sb-warning-bar { background: #2a0f0f; border-color: #7f1d1d; color: #fca5a5; }
:global(html.dark) .sb-mw-rule { background: #1a1a3a; border-color: #4338ca; color: #a5b4fc; }
:global(html.dark) .sb-mw-stage { border-color: #333; }
:global(html.dark) .sb-mw-queue { background: #1a1a1a; }
:global(html.dark) .sb-mw-guard { background: #1a1a2e; border-color: #4338ca; }
:global(html.dark) .sb-mw-results { background: #1a1a1a; }
:global(html.dark) .sb-mw-col-label { color: #999; }

/* ─── RESPONSIVE ─── */
@media (max-width: 640px) {
  .sb-split { flex-direction: column; }
  .sb-divider {
    flex-direction: row;
    width: 100%;
    height: 32px;
    padding: 0 12px;
  }
  .sb-divider-line {
    flex: 1;
    height: 0;
    width: auto;
    border-left: none;
    border-top: 2px dashed #bbb;
  }
  .sb-divider-label {
    writing-mode: horizontal-tb;
    padding: 0 8px;
  }
  .sb-mw-stage { flex-direction: column; min-height: auto; }
  .sb-mw-guard {
    border-left: none;
    border-right: none;
    border-top: 1px dashed #c7d2fe;
    border-bottom: 1px dashed #c7d2fe;
  }
  .sb-var-item { font-size: 11px; }
}
</style>
