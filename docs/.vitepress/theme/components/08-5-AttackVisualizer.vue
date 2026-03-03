<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref<'sql' | 'xss' | 'csrf'>('sql')

const tabs = [
  { key: 'sql' as const, label: 'SQL 注入' },
  { key: 'xss' as const, label: 'XSS' },
  { key: 'csrf' as const, label: 'CSRF' },
]

const csrfSteps = [
  { icon: '\u2705', text: '用户登录了银行网站（浏览器保存了有效 Cookie）' },
  { icon: '\uD83C\uDF10', text: '用户访问了恶意网站' },
  { icon: '\uD83D\uDCE8', text: '恶意网站偷偷向银行发送请求（浏览器自动带上 Cookie）' },
  { icon: '\uD83C\uDFE6', text: '银行以为是用户本人操作，执行转账' },
]
</script>

<template>
  <div class="atk-viz">
    <div class="tab-bar">
      <button
        v-for="t in tabs" :key="t.key"
        :class="['tab-btn', { active: activeTab === t.key }]"
        @click="activeTab = t.key"
      >{{ t.label }}</button>
    </div>

    <!-- Tab 1: SQL Injection -->
    <div v-if="activeTab === 'sql'" class="tab-content">
      <div class="atk-scenario">
        <div class="atk-input-mock">
          <div class="input-bar">
            <span class="input-label">用户名</span>
            <span class="input-value input-malicious">admin' OR '1'='1</span>
          </div>
        </div>

        <div class="atk-result atk-result-bad">
          <div class="result-header result-header-bad">&#x274C; 危险：未参数化</div>
          <pre class="atk-code atk-code-bad">SELECT * FROM users WHERE name = '<span class="hl-inject">admin' OR '1'='1</span>'</pre>
          <div class="result-note result-note-bad">条件永远为真，返回所有用户数据</div>
        </div>

        <div class="atk-result atk-result-good">
          <div class="result-header result-header-good">&#x2705; 安全：参数化查询</div>
          <pre class="atk-code atk-code-good">SELECT * FROM users WHERE name = <span class="hl-param">$1</span></pre>
          <div class="atk-param-box">
            <span class="param-label">参数：</span>
            <code class="param-value">["admin' OR '1'='1"]</code>
          </div>
          <div class="result-note result-note-good">整个输入被当作普通字符串，不会被执行</div>
        </div>
      </div>
    </div>

    <!-- Tab 2: XSS -->
    <div v-if="activeTab === 'xss'" class="tab-content">
      <div class="atk-scenario">
        <div class="atk-input-mock">
          <div class="input-bar">
            <span class="input-label">评论内容</span>
            <span class="input-value input-malicious">&lt;script&gt;steal(document.cookie)&lt;/script&gt;</span>
          </div>
        </div>

        <div class="atk-result atk-result-bad">
          <div class="result-header result-header-bad">&#x274C; 未转义：脚本被执行</div>
          <div class="xss-demo xss-demo-bad">
            <div class="xss-browser">
              <div class="xss-browser-bar">浏览器</div>
              <div class="xss-browser-body">
                <div class="xss-executing">
                  <span class="xss-warn-icon">&#x26A0;&#xFE0F;</span>
                  <span>脚本正在执行...</span>
                </div>
                <div class="xss-stolen">Cookie 被窃取: session=abc123...</div>
              </div>
            </div>
          </div>
        </div>

        <div class="atk-result atk-result-good">
          <div class="result-header result-header-good">&#x2705; 已转义：显示为纯文本</div>
          <div class="xss-demo xss-demo-good">
            <div class="xss-browser">
              <div class="xss-browser-bar">浏览器</div>
              <div class="xss-browser-body">
                <div class="xss-safe-text">&amp;lt;script&amp;gt;steal(document.cookie)&amp;lt;/script&amp;gt;</div>
                <div class="xss-safe-note">显示为普通文字，不会执行</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 3: CSRF -->
    <div v-if="activeTab === 'csrf'" class="tab-content">
      <div class="atk-scenario">
        <div class="csrf-title">攻击过程</div>
        <div class="csrf-steps">
          <div v-for="(s, i) in csrfSteps" :key="i" class="csrf-step" :class="{ 'csrf-step-danger': i >= 2 }">
            <span class="csrf-step-num" :class="{ 'csrf-num-danger': i >= 2 }">{{ i + 1 }}</span>
            <span class="csrf-step-icon">{{ s.icon }}</span>
            <span class="csrf-step-text">{{ s.text }}</span>
          </div>
        </div>

        <!-- CSRF Defense -->
        <div class="csrf-defense">
          <div class="defense-header">
            <span class="defense-icon">&#x1F6E1;&#xFE0F;</span>
            <span class="defense-title">防御：CSRF Token</span>
          </div>
          <div class="defense-body">
            <div class="defense-explain">每个表单带一个随机 Token，服务器验证 Token 是否匹配。恶意网站无法获取这个 Token，所以伪造的请求会被拒绝。</div>
            <div class="defense-example">
              <div class="defense-form">
                <code class="defense-code">&lt;form&gt;</code>
                <code class="defense-code defense-code-token">&nbsp;&nbsp;&lt;input type="hidden" name="csrf_token" value="<span class="hl-token">a8f3k9...</span>"&gt;</code>
                <code class="defense-code">&nbsp;&nbsp;&lt;button&gt;转账&lt;/button&gt;</code>
                <code class="defense-code">&lt;/form&gt;</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.atk-viz {
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
.atk-scenario { display: flex; flex-direction: column; gap: 14px; }

/* ── Input Mock ── */
.atk-input-mock { margin-bottom: 4px; }

.input-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--vp-c-bg-soft);
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 13px;
}

.input-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-3);
  min-width: 60px;
}

.input-value {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  color: var(--vp-c-text-1);
}

.input-malicious {
  color: #ef4444;
  font-weight: 600;
}

/* ── Results ── */
.atk-result {
  padding: 14px 16px;
  border-radius: 10px;
}

.atk-result-bad {
  background: rgba(239, 68, 68, 0.05);
  border: 1.5px solid rgba(239, 68, 68, 0.2);
}

.atk-result-good {
  background: rgba(21, 160, 81, 0.05);
  border: 1.5px solid rgba(21, 160, 81, 0.2);
}

.result-header {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 8px;
}

.result-header-bad { color: #ef4444; }
.result-header-good { color: #15a051; }

.atk-code {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  margin: 6px 0;
  overflow-x: auto;
  white-space: pre;
  line-height: 1.5;
}

.atk-code-bad {
  background: rgba(239, 68, 68, 0.08);
  color: var(--vp-c-text-1);
  border: 1px solid rgba(239, 68, 68, 0.15);
}

.atk-code-good {
  background: rgba(21, 160, 81, 0.08);
  color: var(--vp-c-text-1);
  border: 1px solid rgba(21, 160, 81, 0.15);
}

.hl-inject {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  font-weight: 700;
  padding: 1px 3px;
  border-radius: 3px;
}

.hl-param {
  background: rgba(21, 160, 81, 0.2);
  color: #15a051;
  font-weight: 700;
  padding: 1px 3px;
  border-radius: 3px;
}

.atk-param-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  margin: 6px 0;
}

.param-label {
  color: var(--vp-c-text-3);
  font-weight: 600;
}

.param-value {
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: #15a051;
}

.result-note {
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
}

.result-note-bad { color: #ef4444; }
.result-note-good { color: #15a051; }

/* ── XSS Demo ── */
.xss-demo { margin-top: 8px; }

.xss-browser {
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.xss-browser-bar {
  padding: 6px 12px;
  background: var(--vp-c-bg-soft);
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-text-3);
  border-bottom: 1px solid var(--vp-c-divider);
}

.xss-browser-body { padding: 12px 14px; }

.xss-executing {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #ef4444;
  font-weight: 600;
  margin-bottom: 6px;
}

.xss-warn-icon { font-size: 16px; }

.xss-stolen {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: #ef4444;
  padding: 6px 10px;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 4px;
}

.xss-safe-text {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-2);
  padding: 6px 10px;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  margin-bottom: 6px;
}

.xss-safe-note {
  font-size: 12px;
  color: #15a051;
  font-weight: 500;
}

/* ── CSRF ── */
.csrf-title {
  font-weight: 700;
  font-size: 14px;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.csrf-steps {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.csrf-step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  font-size: 13px;
  color: var(--vp-c-text-1);
  transition: all 0.2s;
}

.csrf-step-danger {
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.2);
}

.csrf-step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

.csrf-num-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.csrf-step-icon { font-size: 16px; flex-shrink: 0; }

/* ── CSRF Defense ── */
.csrf-defense {
  margin-top: 8px;
  border: 1.5px solid rgba(21, 160, 81, 0.25);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(21, 160, 81, 0.04);
}

.defense-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(21, 160, 81, 0.08);
  font-weight: 700;
  font-size: 14px;
  color: #15a051;
}

.defense-icon { font-size: 18px; }
.defense-body { padding: 14px 16px; }

.defense-explain {
  font-size: 13px;
  color: var(--vp-c-text-1);
  line-height: 1.6;
  margin-bottom: 12px;
}

.defense-form {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.defense-code {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-2);
  padding: 2px 0;
  display: block;
}

.defense-code-token { color: var(--vp-c-text-1); }

.hl-token {
  background: rgba(21, 160, 81, 0.15);
  color: #15a051;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
}

/* ── Dark Mode ── */
:global(html.dark) .atk-result-bad {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.25);
}
:global(html.dark) .atk-result-good {
  background: rgba(21, 160, 81, 0.08);
  border-color: rgba(21, 160, 81, 0.25);
}
:global(html.dark) .atk-code-bad { background: rgba(239, 68, 68, 0.1); }
:global(html.dark) .atk-code-good { background: rgba(21, 160, 81, 0.1); }
:global(html.dark) .csrf-step-danger {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.25);
}
:global(html.dark) .csrf-defense {
  background: rgba(21, 160, 81, 0.06);
  border-color: rgba(21, 160, 81, 0.3);
}
:global(html.dark) .csrf-defense .defense-header {
  background: rgba(21, 160, 81, 0.12);
}
:global(html.dark) .xss-browser { border-color: #333; }
:global(html.dark) .xss-browser-bar { background: #1e1e2e; }

/* ── Responsive ── */
@media (max-width: 640px) {
  .tab-content { padding: 14px; }
  .tab-btn { font-size: 12px; padding: 10px 4px; }
  .input-bar { flex-direction: column; align-items: flex-start; gap: 4px; }
  .input-value { font-size: 12px; word-break: break-all; }
  .atk-code { font-size: 11px; padding: 6px 8px; }
  .csrf-step { font-size: 12px; padding: 6px 10px; }
  .defense-explain { font-size: 12px; }
  .defense-code { font-size: 11px; }
}
</style>
