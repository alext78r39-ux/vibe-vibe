<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps<{ mode?: 'register' | 'login' | 'protected' }>()
const currentMode = computed(() => props.mode ?? 'register')

const timers = ref<number[]>([])
function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    const id = window.setTimeout(resolve, ms)
    timers.value = [...timers.value, id]
  })
}
onUnmounted(() => { timers.value.forEach(id => clearTimeout(id)) })

/* ── Register ── */
const regStep = ref(-1)
const regRunning = ref(false)
const regDone = ref(false)
const regHashText = ref('')
const regPlain = 'mypassword123'
const regHash = '$2b$10$xK9v3qZmRtYp'
const regDbRow = ref(false)
const regCookie = ref(false)

const regSteps = [
  { icon: '📧', label: '输入邮箱密码' },
  { icon: '🔍', label: '检查邮箱' },
  { icon: '🔒', label: '密码加密' },
  { icon: '💾', label: '写入数据库' },
  { icon: '🎫', label: '创建会话' },
]

async function startRegister() {
  if (regRunning.value) return
  regRunning.value = true
  regDone.value = false
  regStep.value = -1
  regHashText.value = regPlain
  regDbRow.value = false
  regCookie.value = false

  regStep.value = 0; await delay(800)
  regStep.value = 1; await delay(800)
  regStep.value = 2
  // typewriter hash animation
  for (let i = 0; i <= regHash.length; i++) {
    regHashText.value = regHash.slice(0, i) + regPlain.slice(i)
    await delay(50)
  }
  regHashText.value = regHash
  await delay(400)
  regStep.value = 3; await delay(300)
  regDbRow.value = true; await delay(800)
  regStep.value = 4; await delay(300)
  regCookie.value = true; await delay(600)
  regDone.value = true
  regRunning.value = false
}

/* ── Login ── */
const loginStep = ref(-1)
const loginRunning = ref(false)
const loginDone = ref(false)
const loginFail = ref(false)
const loginCompareIdx = ref(-1)
const loginMatchChars = ref<boolean[]>([])
const storedHash = '$2b$10$xK9v3qZmRtYp'
const inputHashOk = '$2b$10$xK9v3qZmRtYp'
const inputHashBad = '$2b$10$WRONG_HASH_XX'

async function startLogin() {
  if (loginRunning.value) return
  loginRunning.value = true
  loginDone.value = false
  loginStep.value = -1
  loginCompareIdx.value = -1
  loginMatchChars.value = []

  loginStep.value = 0; await delay(800)
  loginStep.value = 1; await delay(800)
  loginStep.value = 2
  const inputH = loginFail.value ? inputHashBad : inputHashOk
  const chars: boolean[] = []
  for (let i = 0; i < storedHash.length; i++) {
    chars.push(inputH[i] === storedHash[i])
    loginMatchChars.value = [...chars]
    loginCompareIdx.value = i
    await delay(50)
  }
  await delay(400)
  if (loginFail.value) {
    loginDone.value = true
    loginRunning.value = false
    return
  }
  loginStep.value = 3; await delay(800)
  loginDone.value = true
  loginRunning.value = false
}

const loginSteps = computed(() => {
  const base = [
    { icon: '📧', label: '输入邮箱密码' },
    { icon: '🔍', label: '查找用户' },
    { icon: '🔐', label: '比对密码' },
    { icon: '🎫', label: '创建会话' },
  ]
  return base
})

/* ── Protected ── */
const hasCookie = ref(true)
const protAnim = ref<'idle' | 'checking' | 'granted' | 'denied'>('idle')
const protRunning = ref(false)

async function checkProtected() {
  if (protRunning.value) return
  protRunning.value = true
  protAnim.value = 'checking'
  await delay(1000)
  protAnim.value = hasCookie.value ? 'granted' : 'denied'
  await delay(100)
  protRunning.value = false
}

function toggleCookie(val: boolean) {
  hasCookie.value = val
  protAnim.value = 'idle'
}
</script>

<template>
  <div class="af-container">
    <!-- ═══ REGISTER ═══ -->
    <template v-if="currentMode === 'register'">
      <div class="af-progress">
        <div v-for="(s, i) in regSteps" :key="i" class="af-step" :class="{ active: regStep >= i, current: regStep === i }">
          <div class="af-node">{{ s.icon }}</div>
          <span class="af-label">{{ s.label }}</span>
        </div>
        <div class="af-progress-line">
          <div class="af-progress-fill" :style="{ width: regStep >= 0 ? ((regStep / (regSteps.length - 1)) * 100) + '%' : '0%' }"></div>
        </div>
      </div>

      <div class="af-stage">
        <div v-if="regStep < 0" class="af-start-area">
          <button class="af-btn af-btn-green" @click="startRegister">开始注册</button>
        </div>

        <div v-if="regStep === 0" class="af-panel af-fade-in">
          <div class="af-mock-input"><span class="af-input-label">邮箱</span><span class="af-input-val">user@example.com</span></div>
          <div class="af-mock-input"><span class="af-input-label">密码</span><span class="af-input-val">••••••••••••</span></div>
        </div>

        <div v-if="regStep === 1" class="af-panel af-fade-in">
          <div class="af-db-check">
            <span class="af-db-icon af-blink">🗄️</span>
            <span class="af-check-result">邮箱未注册 ✓</span>
          </div>
        </div>

        <div v-if="regStep === 2" class="af-panel af-fade-in">
          <div class="af-hash-demo">
            <div class="af-hash-row"><span class="af-hash-label">明文</span><code class="af-code">{{ regPlain }}</code></div>
            <div class="af-hash-arrow">↓ bcrypt</div>
            <div class="af-hash-row"><span class="af-hash-label">哈希</span><code class="af-code af-mono">{{ regHashText }}</code></div>
          </div>
        </div>

        <div v-if="regStep === 3" class="af-panel af-fade-in">
          <div class="af-mini-table">
            <div class="af-table-header"><span>id</span><span>email</span><span>password_hash</span></div>
            <div class="af-table-row" :class="{ 'af-slide-in': regDbRow }">
              <span>1</span><span>user@example.com</span><span class="af-mono">$2b$10$xK...</span>
            </div>
          </div>
        </div>

        <div v-if="regStep === 4" class="af-panel af-fade-in">
          <div class="af-cookie-demo">
            <span class="af-cookie-icon" :class="{ 'af-pop-in': regCookie }">🍪</span>
            <code v-if="regCookie" class="af-code af-fade-in">session_token=abc8f3e...</code>
          </div>
        </div>

        <div v-if="regDone" class="af-result af-fade-in af-result-ok">
          ✅ 注册成功！跳转到 Dashboard
        </div>
      </div>

      <button v-if="regDone" class="af-btn af-btn-outline" @click="regStep = -1; regDone = false">重新演示</button>
    </template>
    <!-- ═══ LOGIN ═══ -->
    <template v-if="currentMode === 'login'">
      <div class="af-toggle-bar">
        <label class="af-toggle-label">
          <input type="checkbox" v-model="loginFail" :disabled="loginRunning" />
          <span>失败场景（密码错误）</span>
        </label>
      </div>

      <div class="af-progress">
        <div v-for="(s, i) in loginSteps" :key="i" class="af-step"
          :class="{ active: loginStep >= i, current: loginStep === i, fail: loginFail && loginStep === 2 && i === 2 && loginDone }">
          <div class="af-node">{{ s.icon }}</div>
          <span class="af-label">{{ s.label }}</span>
        </div>
        <div class="af-progress-line">
          <div class="af-progress-fill" :style="{ width: loginStep >= 0 ? ((loginStep / (loginSteps.length - 1)) * 100) + '%' : '0%' }"
            :class="{ 'af-fill-red': loginFail && loginDone }"></div>
        </div>
      </div>

      <div class="af-stage">
        <div v-if="loginStep < 0" class="af-start-area">
          <button class="af-btn af-btn-cyan" @click="startLogin">开始登录</button>
        </div>

        <div v-if="loginStep === 0" class="af-panel af-fade-in">
          <div class="af-mock-input"><span class="af-input-label">邮箱</span><span class="af-input-val">user@example.com</span></div>
          <div class="af-mock-input"><span class="af-input-label">密码</span><span class="af-input-val">••••••••••••</span></div>
        </div>

        <div v-if="loginStep === 1" class="af-panel af-fade-in">
          <div class="af-mini-table">
            <div class="af-table-header"><span>id</span><span>email</span><span>password_hash</span></div>
            <div class="af-table-row af-row-highlight">
              <span>1</span><span>user@example.com</span><span class="af-mono">$2b$10$xK...</span>
            </div>
          </div>
        </div>

        <div v-if="loginStep === 2" class="af-panel af-fade-in">
          <div class="af-compare">
            <div class="af-compare-col">
              <div class="af-compare-title">输入密码哈希</div>
              <code class="af-code af-mono af-compare-hash">
                <span v-for="(ch, ci) in (loginFail ? inputHashBad : inputHashOk)" :key="ci"
                  :class="{ 'af-ch-ok': ci <= loginCompareIdx && loginMatchChars[ci], 'af-ch-fail': ci <= loginCompareIdx && !loginMatchChars[ci] }">{{ ch }}</span>
              </code>
            </div>
            <div class="af-compare-vs">VS</div>
            <div class="af-compare-col">
              <div class="af-compare-title">数据库存储哈希</div>
              <code class="af-code af-mono af-compare-hash">
                <span v-for="(ch, ci) in storedHash" :key="ci"
                  :class="{ 'af-ch-ok': ci <= loginCompareIdx && loginMatchChars[ci], 'af-ch-fail': ci <= loginCompareIdx && !loginMatchChars[ci] }">{{ ch }}</span>
              </code>
            </div>
          </div>
          <div v-if="loginDone && loginFail" class="af-result af-fade-in af-result-fail">❌ 密码不匹配 ✗</div>
        </div>

        <div v-if="loginStep === 3 && !loginFail" class="af-panel af-fade-in">
          <div class="af-cookie-demo">
            <span class="af-cookie-icon af-pop-in">🍪</span>
            <code class="af-code af-fade-in">session_token=xyz9d2f...</code>
          </div>
        </div>

        <div v-if="loginDone && !loginFail" class="af-result af-fade-in af-result-ok">✅ 登录成功！</div>
      </div>

      <button v-if="loginDone" class="af-btn af-btn-outline" @click="loginStep = -1; loginDone = false">重新演示</button>
    </template>
    <!-- ═══ PROTECTED ═══ -->
    <template v-if="currentMode === 'protected'">
      <div class="af-toggle-bar">
        <button class="af-btn-sm" :class="{ 'af-btn-sm-active': hasCookie }" @click="toggleCookie(true)">有 Cookie</button>
        <button class="af-btn-sm" :class="{ 'af-btn-sm-active': !hasCookie }" @click="toggleCookie(false)">无 Cookie</button>
        <button class="af-btn af-btn-purple" @click="checkProtected" :disabled="protRunning" style="margin-left:12px">发起请求</button>
      </div>

      <div class="af-prot-flow">
        <div class="af-prot-browser">
          <div class="af-prot-bar">/dashboard</div>
          <div class="af-prot-icon">🌐</div>
        </div>

        <div class="af-prot-arrow" :class="{ 'af-arrow-active': protAnim !== 'idle' }">→</div>

        <div class="af-prot-guard" :class="{ 'af-guard-checking': protAnim === 'checking', 'af-guard-open': protAnim === 'granted', 'af-guard-closed': protAnim === 'denied' }">
          <div class="af-shield">🛡️</div>
          <div class="af-guard-label">检查 Cookie</div>
        </div>

        <div class="af-prot-arrow" :class="{ 'af-arrow-active': protAnim === 'granted' || protAnim === 'denied' }">→</div>

        <div class="af-prot-result">
          <div v-if="protAnim === 'idle' || protAnim === 'checking'" class="af-prot-placeholder">?</div>
          <div v-if="protAnim === 'granted'" class="af-prot-granted af-fade-in">
            <div class="af-dash-thumb">📊 Dashboard</div>
            <div class="af-prot-msg af-msg-ok">✅ 会话有效，允许访问</div>
          </div>
          <div v-if="protAnim === 'denied'" class="af-prot-denied af-bounce-in">
            <div class="af-redirect-arrow">↩ /login</div>
            <div class="af-prot-msg af-msg-fail">❌ 无效会话，重定向登录</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.af-container {
  max-width: 688px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1a1a2e;
}
:global(html.dark) .af-container { color: #e0e0e0; }

/* ── Buttons ── */
.af-btn {
  padding: 10px 28px; border: none; border-radius: 8px; font-size: 15px;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.af-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.af-btn-green { background: #15a051; color: #fff; }
.af-btn-green:hover:not(:disabled) { background: #128a44; }
.af-btn-cyan { background: #2eb3df; color: #fff; }
.af-btn-cyan:hover:not(:disabled) { background: #239cc4; }
.af-btn-purple { background: #9333ea; color: #fff; }
.af-btn-purple:hover:not(:disabled) { background: #7e22ce; }
.af-btn-outline {
  background: transparent; border: 1.5px solid #888; color: #555;
  margin-top: 16px; font-size: 13px; padding: 6px 18px;
}
:global(html.dark) .af-btn-outline { border-color: #666; color: #aaa; }
.af-btn-sm {
  padding: 6px 16px; border: 1.5px solid #ccc; border-radius: 6px;
  background: transparent; font-size: 13px; cursor: pointer; color: #555; transition: all 0.2s;
}
:global(html.dark) .af-btn-sm { border-color: #555; color: #aaa; }
.af-btn-sm-active { background: #9333ea; color: #fff; border-color: #9333ea; }

/* ── Progress Bar ── */
.af-progress {
  display: flex; justify-content: space-between; align-items: flex-start;
  position: relative; margin: 20px 0 28px; padding: 0 8px;
}
.af-progress-line {
  position: absolute; top: 18px; left: 28px; right: 28px; height: 3px;
  background: #e0e0e0; border-radius: 2px; z-index: 0;
}
:global(html.dark) .af-progress-line { background: #333; }
.af-progress-fill {
  height: 100%; background: #15a051; border-radius: 2px;
  transition: width 0.5s ease;
}
.af-fill-red { background: #ff3b30 !important; }
.af-step {
  display: flex; flex-direction: column; align-items: center;
  position: relative; z-index: 1; flex: 1; min-width: 0;
}
.af-node {
  width: 36px; height: 36px; border-radius: 50%;
  background: #f0f0f0; display: flex; align-items: center; justify-content: center;
  font-size: 16px; transition: all 0.3s; border: 2px solid #ddd;
}
:global(html.dark) .af-node { background: #2a2a3e; border-color: #444; }
.af-step.active .af-node { border-color: #15a051; background: #e6f9ee; }
:global(html.dark) .af-step.active .af-node { background: #1a3a28; }
.af-step.current .af-node { box-shadow: 0 0 0 4px rgba(21,160,81,0.2); transform: scale(1.1); }
.af-step.fail .af-node { border-color: #ff3b30 !important; background: #fff0f0 !important; box-shadow: 0 0 0 4px rgba(255,59,48,0.2) !important; }
:global(html.dark) .af-step.fail .af-node { background: #3a1a1a !important; }
.af-label { font-size: 11px; margin-top: 6px; text-align: center; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80px; }
.af-step.active .af-label { color: #15a051; font-weight: 600; }
.af-step.fail .af-label { color: #ff3b30 !important; }
/* ── Stage / Panels ── */
.af-stage { min-height: 120px; margin: 8px 0; }
.af-start-area { display: flex; justify-content: center; padding: 24px 0; }
.af-panel {
  background: #f8f9fa; border: 1px solid #e8e8e8; border-radius: 10px;
  padding: 16px 20px; margin: 8px 0;
}
:global(html.dark) .af-panel { background: #1e1e2e; border-color: #333; }

/* ── Mock Inputs ── */
.af-mock-input {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; margin: 4px 0; background: #fff; border: 1px solid #ddd;
  border-radius: 6px; font-size: 14px;
}
:global(html.dark) .af-mock-input { background: #252538; border-color: #444; }
.af-input-label { font-size: 12px; color: #888; min-width: 36px; }
.af-input-val { color: #333; font-family: monospace; }
:global(html.dark) .af-input-val { color: #ccc; }

/* ── DB Check ── */
.af-db-check { display: flex; align-items: center; gap: 12px; font-size: 15px; }
.af-db-icon { font-size: 28px; }
.af-check-result { color: #15a051; font-weight: 600; }

/* ── Hash Demo ── */
.af-hash-demo { text-align: center; }
.af-hash-row { display: flex; align-items: center; gap: 10px; justify-content: center; margin: 4px 0; }
.af-hash-label { font-size: 12px; color: #888; min-width: 32px; text-align: right; }
.af-hash-arrow { color: #D4952C; font-weight: 700; font-size: 13px; margin: 4px 0; }
.af-code {
  background: #1e1e2e; color: #e0e0e0; padding: 4px 10px;
  border-radius: 4px; font-size: 13px; font-family: 'Fira Code', monospace;
  word-break: break-all;
}
.af-mono { font-family: 'Fira Code', monospace; }

/* ── Mini Table ── */
.af-mini-table { font-size: 13px; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
:global(html.dark) .af-mini-table { border-color: #444; }
.af-table-header {
  display: grid; grid-template-columns: 40px 1fr 1fr;
  background: #eee; padding: 6px 10px; font-weight: 600; font-size: 12px; color: #666;
}
:global(html.dark) .af-table-header { background: #2a2a3e; color: #aaa; }
.af-table-row {
  display: grid; grid-template-columns: 40px 1fr 1fr;
  padding: 8px 10px; font-size: 13px; transition: all 0.3s;
}
.af-table-row.af-slide-in { animation: af-slideIn 0.4s ease-out; }
.af-row-highlight { background: rgba(46,179,223,0.1); border-left: 3px solid #2eb3df; }
:global(html.dark) .af-row-highlight { background: rgba(46,179,223,0.08); }

/* ── Cookie ── */
.af-cookie-demo { display: flex; align-items: center; gap: 12px; justify-content: center; }
.af-cookie-icon { font-size: 32px; }
/* ── Compare (Login) ── */
.af-compare { display: flex; align-items: center; gap: 12px; justify-content: center; flex-wrap: wrap; }
.af-compare-col { flex: 1; min-width: 180px; text-align: center; }
.af-compare-title { font-size: 12px; color: #888; margin-bottom: 6px; }
.af-compare-vs { font-weight: 800; color: #D4952C; font-size: 14px; }
.af-compare-hash { display: inline-block; letter-spacing: 0.5px; word-break: break-all; }
.af-ch-ok { color: #15a051; font-weight: 700; }
.af-ch-fail { color: #ff3b30; font-weight: 700; }

/* ── Results ── */
.af-result { text-align: center; padding: 12px; border-radius: 8px; font-weight: 600; margin-top: 12px; font-size: 15px; }
.af-result-ok { background: rgba(21,160,81,0.1); color: #15a051; }
:global(html.dark) .af-result-ok { background: rgba(21,160,81,0.08); }
.af-result-fail { background: rgba(255,59,48,0.1); color: #ff3b30; }
:global(html.dark) .af-result-fail { background: rgba(255,59,48,0.08); }

/* ── Toggle Bar ── */
.af-toggle-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.af-toggle-label { display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; color: #555; }
:global(html.dark) .af-toggle-label { color: #aaa; }
.af-toggle-label input { accent-color: #ff3b30; }

/* ── Protected Flow ── */
.af-prot-flow {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; padding: 24px 0; flex-wrap: wrap;
}
.af-prot-browser {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 12px 16px; background: #f0f0f0; border-radius: 10px; min-width: 100px;
}
:global(html.dark) .af-prot-browser { background: #252538; }
.af-prot-bar {
  font-family: monospace; font-size: 12px; background: #fff; padding: 3px 10px;
  border-radius: 4px; border: 1px solid #ddd; color: #333;
}
:global(html.dark) .af-prot-bar { background: #1a1a2e; border-color: #444; color: #ccc; }
.af-prot-icon { font-size: 28px; }
.af-prot-arrow {
  font-size: 24px; color: #ccc; transition: all 0.3s; font-weight: 700;
}
.af-arrow-active { color: #2eb3df; transform: scale(1.2); }
.af-prot-guard {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 16px 20px; border: 2px dashed #ddd; border-radius: 12px;
  transition: all 0.4s;
}
:global(html.dark) .af-prot-guard { border-color: #444; }
.af-guard-checking { border-color: #D4952C; background: rgba(212,149,44,0.05); }
.af-guard-open { border-color: #15a051; background: rgba(21,160,81,0.05); border-style: solid; }
.af-guard-closed { border-color: #ff3b30; background: rgba(255,59,48,0.05); border-style: solid; }
.af-shield { font-size: 28px; transition: transform 0.3s; }
.af-guard-checking .af-shield { animation: af-pulse 0.6s infinite alternate; }
.af-guard-open .af-shield { transform: scale(1.2); }
.af-guard-closed .af-shield { transform: scale(0.9); }
.af-guard-label { font-size: 12px; color: #888; }
.af-prot-result { min-width: 140px; text-align: center; }
.af-prot-placeholder { font-size: 32px; color: #ccc; }
.af-dash-thumb {
  background: #e6f9ee; padding: 12px 20px; border-radius: 8px;
  font-weight: 600; color: #15a051; font-size: 15px; margin-bottom: 6px;
}
:global(html.dark) .af-dash-thumb { background: #1a3a28; }
.af-redirect-arrow {
  font-family: monospace; font-size: 18px; font-weight: 700;
  color: #ff3b30; margin-bottom: 6px;
}
.af-prot-msg { font-size: 12px; }
.af-msg-ok { color: #15a051; }
.af-msg-fail { color: #ff3b30; }
/* ── Animations ── */
.af-fade-in { animation: af-fadeIn 0.35s ease-out; }
.af-pop-in { animation: af-popIn 0.35s ease-out; }
.af-bounce-in { animation: af-bounceIn 0.5s ease-out; }
.af-blink { animation: af-blink 0.6s ease-in-out 3; }

@keyframes af-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes af-popIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
@keyframes af-slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes af-bounceIn {
  0% { opacity: 0; transform: scale(0.6); }
  60% { transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes af-blink { 50% { opacity: 0.3; } }
@keyframes af-pulse { from { transform: scale(1); } to { transform: scale(1.15); } }

/* ── Responsive ── */
@media (max-width: 640px) {
  .af-container { padding: 12px; }
  .af-progress { gap: 2px; }
  .af-label { font-size: 10px; max-width: 56px; }
  .af-node { width: 30px; height: 30px; font-size: 13px; }
  .af-progress-line { top: 15px; left: 20px; right: 20px; }
  .af-compare { flex-direction: column; gap: 8px; }
  .af-compare-vs { display: none; }
  .af-prot-flow { flex-direction: column; gap: 8px; }
  .af-prot-arrow { transform: rotate(90deg); }
  .af-arrow-active { transform: rotate(90deg) scale(1.2); }
}
</style>
