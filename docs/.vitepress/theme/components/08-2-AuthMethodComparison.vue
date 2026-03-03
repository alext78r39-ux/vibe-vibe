<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref<'session-token' | 'oauth'>('session-token')

const sessionSteps = [
  { num: 1, text: '用户登录' },
  { num: 2, text: '服务器创建 Session，存入数据库' },
  { num: 3, text: '返回 Session ID (Cookie)' },
  { num: 4, text: '后续请求带 Cookie' },
  { num: 5, text: '服务器查数据库验证' },
]

const tokenSteps = [
  { num: 1, text: '用户登录' },
  { num: 2, text: '服务器生成 JWT Token' },
  { num: 3, text: '返回 Token' },
  { num: 4, text: '后续请求带 Token (Header)' },
  { num: 5, text: '服务器验证签名（不查数据库）' },
]

const compareRows = [
  { label: '存储位置', session: '服务端（数据库）', token: '客户端（localStorage / Cookie）' },
  { label: '撤销能力', session: '可随时撤销', token: '无法主动撤销（等过期）' },
  { label: '数据库依赖', session: '每次请求查数据库', token: '无需数据库查询' },
]

interface OAuthParty { icon: string; label: string }
const parties: OAuthParty[] = [
  { icon: '\uD83D\uDC64', label: '用户' },
  { icon: '\uD83D\uDCF1', label: '你的应用' },
  { icon: '\uD83D\uDD11', label: 'GitHub / Google' },
]

const oauthSteps = [
  { from: 0, to: 1, text: '1. 点击"用 GitHub 登录"' },
  { from: 1, to: 2, text: '2. 跳转到 GitHub 授权页' },
  { from: 0, to: 2, text: '3. 用户同意授权' },
  { from: 2, to: 1, text: '4. GitHub 返回授权码' },
  { from: 1, to: 2, text: '5. 用授权码换取用户信息' },
  { from: 1, to: 0, text: '6. 创建本地账号 / 登录成功' },
]

const oauthStep = ref(-1)
const oauthRunning = ref(false)

async function playOAuth() {
  if (oauthRunning.value) return
  oauthRunning.value = true
  oauthStep.value = -1
  for (let i = 0; i < oauthSteps.length; i++) {
    oauthStep.value = i
    await new Promise(r => setTimeout(r, 900))
  }
  oauthRunning.value = false
}
</script>

<template>
  <div class="auth-compare">
    <div class="tab-bar">
      <button
        :class="['tab-btn', { active: activeTab === 'session-token' }]"
        @click="activeTab = 'session-token'"
      >Session vs Token</button>
      <button
        :class="['tab-btn', { active: activeTab === 'oauth' }]"
        @click="activeTab = 'oauth'"
      >OAuth 流程</button>
    </div>

    <!-- Tab 1: Session vs Token -->
    <div v-if="activeTab === 'session-token'" class="tab-content">
      <div class="flow-columns">
        <!-- Session Flow -->
        <div class="flow-col flow-col-session">
          <div class="flow-col-title flow-title-session">Session 流程</div>
          <div class="flow-steps">
            <div v-for="s in sessionSteps" :key="s.num" class="flow-step flow-step-session">
              <span class="step-num step-num-session">{{ s.num }}</span>
              <span class="step-text">{{ s.text }}</span>
            </div>
          </div>
        </div>
        <!-- Token Flow -->
        <div class="flow-col flow-col-token">
          <div class="flow-col-title flow-title-token">Token 流程</div>
          <div class="flow-steps">
            <div v-for="s in tokenSteps" :key="s.num" class="flow-step flow-step-token">
              <span class="step-num step-num-token">{{ s.num }}</span>
              <span class="step-text">{{ s.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Comparison Table -->
      <div class="compare-table">
        <div class="compare-header">
          <span class="compare-cell compare-label-cell"></span>
          <span class="compare-cell compare-h-session">Session</span>
          <span class="compare-cell compare-h-token">Token</span>
        </div>
        <div v-for="row in compareRows" :key="row.label" class="compare-row">
          <span class="compare-cell compare-label-cell">{{ row.label }}</span>
          <span class="compare-cell">{{ row.session }}</span>
          <span class="compare-cell">{{ row.token }}</span>
        </div>
      </div>
    </div>

    <!-- Tab 2: OAuth -->
    <div v-if="activeTab === 'oauth'" class="tab-content">
      <!-- Three parties -->
      <div class="oauth-parties">
        <div
          v-for="(p, i) in parties" :key="i"
          class="oauth-party"
          :class="{
            'party-active': oauthStep >= 0 && (oauthSteps[oauthStep].from === i || oauthSteps[oauthStep].to === i)
          }"
        >
          <div class="party-icon">{{ p.icon }}</div>
          <div class="party-label">{{ p.label }}</div>
        </div>
      </div>

      <!-- Sequence steps -->
      <div class="oauth-sequence">
        <div
          v-for="(s, i) in oauthSteps" :key="i"
          class="oauth-seq-step"
          :class="{ 'seq-active': oauthStep === i, 'seq-done': oauthStep > i }"
        >
          <div class="seq-arrow">
            <span class="seq-from">{{ parties[s.from].icon }}</span>
            <span class="seq-line">
              <span class="seq-line-bar"></span>
              <span class="seq-line-head"></span>
            </span>
            <span class="seq-to">{{ parties[s.to].icon }}</span>
          </div>
          <div class="seq-text">{{ s.text }}</div>
        </div>
      </div>

      <div class="oauth-controls">
        <button class="play-btn" @click="playOAuth" :disabled="oauthRunning">
          {{ oauthRunning ? '播放中...' : '播放流程' }}
        </button>
        <button v-if="oauthStep >= 0 && !oauthRunning" class="reset-btn" @click="oauthStep = -1">重置</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-compare {
  max-width: 688px;
  margin: 1.5rem auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.tab-bar {
  display: flex;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.tab-btn {
  flex: 1;
  padding: 12px 8px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
}

.tab-btn:hover:not(.active) { background: var(--vp-c-bg-mute); }
.tab-content { padding: 20px; }

/* ── Flow Columns ── */
.flow-columns {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.flow-col {
  flex: 1;
  border-radius: 10px;
  padding: 14px;
}

.flow-col-session {
  background: rgba(46, 179, 223, 0.06);
  border: 1.5px solid rgba(46, 179, 223, 0.2);
}

.flow-col-token {
  background: rgba(147, 51, 234, 0.06);
  border: 1.5px solid rgba(147, 51, 234, 0.2);
}

.flow-col-title {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 12px;
  text-align: center;
}

.flow-title-session { color: #2eb3df; }
.flow-title-token { color: #9333ea; }

.flow-steps { display: flex; flex-direction: column; gap: 6px; }

.flow-step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--vp-c-text-1);
}

.flow-step-session { background: rgba(46, 179, 223, 0.08); }
.flow-step-token { background: rgba(147, 51, 234, 0.08); }

.step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.step-num-session { background: #2eb3df; }
.step-num-token { background: #9333ea; }
.step-text { line-height: 1.4; }

/* ── Compare Table ── */
.compare-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  font-size: 12px;
}

.compare-header {
  display: grid;
  grid-template-columns: 100px 1fr 1fr;
  background: var(--vp-c-bg-soft);
  font-weight: 700;
  font-size: 12px;
}

.compare-h-session { color: #2eb3df; }
.compare-h-token { color: #9333ea; }

.compare-row {
  display: grid;
  grid-template-columns: 100px 1fr 1fr;
  border-top: 1px solid var(--vp-c-divider);
}

.compare-cell {
  padding: 8px 10px;
  color: var(--vp-c-text-2);
}

.compare-label-cell {
  font-weight: 600;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}

/* ── OAuth Parties ── */
.oauth-parties {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 0 10px;
}

.oauth-party {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  border: 2px solid var(--vp-c-divider);
  border-radius: 12px;
  transition: all 0.3s;
  min-width: 80px;
  background: var(--vp-c-bg);
}

.party-active {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 12px var(--vp-c-brand-soft);
  transform: translateY(-2px);
}

.party-icon { font-size: 28px; }
.party-label { font-size: 12px; font-weight: 600; color: var(--vp-c-text-1); }

/* ── OAuth Sequence ── */
.oauth-sequence {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.oauth-seq-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  transition: all 0.3s;
  opacity: 0.5;
}

.seq-active {
  opacity: 1;
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  transform: scale(1.02);
}

.seq-done { opacity: 0.7; }

.seq-arrow {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  min-width: 80px;
}

.seq-from, .seq-to { font-size: 16px; }

.seq-line {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 20px;
}

.seq-line-bar {
  flex: 1;
  height: 2px;
  background: var(--vp-c-text-3);
}

.seq-line-head {
  width: 0;
  height: 0;
  border-left: 6px solid var(--vp-c-text-3);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
}

.seq-text {
  font-size: 13px;
  color: var(--vp-c-text-1);
  font-weight: 500;
}

/* ── Controls ── */
.oauth-controls {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.play-btn {
  padding: 8px 24px;
  border: none;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.play-btn:hover:not(:disabled) { opacity: 0.85; }
.play-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.reset-btn {
  padding: 8px 18px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover { border-color: var(--vp-c-text-3); }

/* ── Dark Mode ── */
:global(html.dark) .flow-col-session {
  background: rgba(46, 179, 223, 0.08);
  border-color: rgba(46, 179, 223, 0.25);
}
:global(html.dark) .flow-col-token {
  background: rgba(147, 51, 234, 0.08);
  border-color: rgba(147, 51, 234, 0.25);
}
:global(html.dark) .flow-step-session { background: rgba(46, 179, 223, 0.12); }
:global(html.dark) .flow-step-token { background: rgba(147, 51, 234, 0.12); }

/* ── Responsive ── */
@media (max-width: 640px) {
  .tab-content { padding: 14px; }
  .flow-columns { flex-direction: column; gap: 12px; }
  .compare-header, .compare-row {
    grid-template-columns: 70px 1fr 1fr;
  }
  .compare-cell { padding: 6px 6px; font-size: 11px; }
  .oauth-parties { gap: 8px; padding: 0; }
  .oauth-party { padding: 8px 10px; min-width: 60px; }
  .party-icon { font-size: 22px; }
  .party-label { font-size: 11px; }
  .seq-text { font-size: 12px; }
}
</style>
