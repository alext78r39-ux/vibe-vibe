<script setup lang="ts">
const serverVars = [
  { name: 'DATABASE_URL', value: 'postgres://user:pass@host/db' },
  { name: 'AUTH_SECRET', value: 'super-secret-key' },
  { name: 'STRIPE_SECRET_KEY', value: 'sk_live_...' },
]

const clientVars = [
  { name: 'NEXT_PUBLIC_APP_URL', value: 'https://myapp.com' },
  { name: 'NEXT_PUBLIC_STRIPE_KEY', value: 'pk_live_...' },
]
</script>

<template>
  <div class="env-boundary">
    <div class="env-zones">
      <!-- Server Zone -->
      <div class="env-zone env-zone-server">
        <div class="zone-header zone-header-server">
          <span class="zone-icon">&#x1F512;</span>
          <span class="zone-title">服务端 (安全)</span>
        </div>
        <div class="var-list">
          <div v-for="v in serverVars" :key="v.name" class="var-item var-item-server">
            <code class="var-name">{{ v.name }}</code>
            <code class="var-val">={{ v.value }}</code>
          </div>
        </div>
        <div class="zone-footer zone-footer-server">只在服务端代码中可用</div>
      </div>

      <!-- Boundary -->
      <div class="boundary-divider">
        <div class="boundary-line"></div>
        <div class="boundary-label">安全边界</div>
        <div class="boundary-line"></div>
      </div>

      <!-- Client Zone -->
      <div class="env-zone env-zone-client">
        <div class="zone-header zone-header-client">
          <span class="zone-icon">&#x1F310;</span>
          <span class="zone-title">客户端 (公开)</span>
        </div>
        <div class="var-list">
          <div v-for="v in clientVars" :key="v.name" class="var-item var-item-client">
            <code class="var-name">{{ v.name }}</code>
            <code class="var-val">={{ v.value }}</code>
          </div>
        </div>
        <div class="zone-footer zone-footer-client">会被打包到浏览器 JS 中</div>
      </div>
    </div>

    <!-- Leak Warning -->
    <div class="leak-warning">
      <div class="leak-arrow">
        <span class="leak-from">服务端变量</span>
        <span class="leak-icon">&#x274C;</span>
        <span class="leak-to">客户端代码</span>
      </div>
      <div class="leak-text">泄露风险：在客户端代码中使用服务端变量会导致密钥暴露</div>
    </div>

    <!-- Rule -->
    <div class="env-rule">
      <span class="rule-badge">规则</span>
      <span class="rule-text">带 <code>NEXT_PUBLIC_</code> 前缀 = 客户端可见，不带前缀 = 仅服务端</span>
    </div>
  </div>
</template>

<style scoped>
.env-boundary {
  max-width: 688px;
  margin: 1.5rem auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg);
  padding: 20px;
}

.env-zones {
  display: flex;
  align-items: stretch;
  gap: 0;
}

.env-zone {
  flex: 1;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.env-zone-server {
  background: rgba(21, 160, 81, 0.06);
  border: 1.5px solid rgba(21, 160, 81, 0.25);
}

.env-zone-client {
  background: rgba(46, 179, 223, 0.06);
  border: 1.5px solid rgba(46, 179, 223, 0.25);
}

.zone-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 15px;
}

.zone-header-server { color: #15a051; }
.zone-header-client { color: #2eb3df; }
.zone-icon { font-size: 18px; }

.var-list { display: flex; flex-direction: column; gap: 6px; }

.var-item {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.var-item-server { background: rgba(21, 160, 81, 0.08); }
.var-item-client { background: rgba(46, 179, 223, 0.08); }

.var-name { color: var(--vp-c-text-1); font-weight: 600; }
.var-val { color: var(--vp-c-text-3); font-size: 11px; }

.zone-footer {
  font-size: 11px;
  font-weight: 500;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px dashed;
}

.zone-footer-server { color: #15a051; border-color: rgba(21, 160, 81, 0.3); }
.zone-footer-client { color: #2eb3df; border-color: rgba(46, 179, 223, 0.3); }

/* Boundary Divider */
.boundary-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  flex-shrink: 0;
}

.boundary-line {
  width: 2px;
  flex: 1;
  background: repeating-linear-gradient(
    to bottom,
    var(--vp-c-text-3) 0,
    var(--vp-c-text-3) 4px,
    transparent 4px,
    transparent 8px
  );
  min-height: 20px;
}

.boundary-label {
  writing-mode: vertical-rl;
  font-size: 11px;
  font-weight: 700;
  color: var(--vp-c-text-3);
  padding: 8px 0;
  letter-spacing: 2px;
}

/* Leak Warning */
.leak-warning {
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.06);
  border: 1.5px solid rgba(239, 68, 68, 0.25);
  border-radius: 10px;
}

.leak-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.leak-from { color: #15a051; }
.leak-icon { font-size: 18px; }
.leak-to { color: #2eb3df; }

.leak-text {
  text-align: center;
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
}

/* Rule */
.env-rule {
  margin-top: 12px;
  padding: 10px 14px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--vp-c-text-1);
}

.rule-badge {
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.rule-text code {
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--vp-c-bg-mute);
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

/* Dark Mode */
:global(html.dark) .env-zone-server {
  background: rgba(21, 160, 81, 0.08);
  border-color: rgba(21, 160, 81, 0.3);
}
:global(html.dark) .env-zone-client {
  background: rgba(46, 179, 223, 0.08);
  border-color: rgba(46, 179, 223, 0.3);
}
:global(html.dark) .var-item-server { background: rgba(21, 160, 81, 0.12); }
:global(html.dark) .var-item-client { background: rgba(46, 179, 223, 0.12); }
:global(html.dark) .leak-warning {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.3);
}

/* Responsive */
@media (max-width: 640px) {
  .env-boundary { padding: 14px; }
  .env-zones { flex-direction: column; gap: 0; }
  .boundary-divider {
    flex-direction: row;
    padding: 10px 0;
  }
  .boundary-line {
    height: 2px;
    width: auto;
    min-height: 0;
    min-width: 20px;
    background: repeating-linear-gradient(
      to right,
      var(--vp-c-text-3) 0,
      var(--vp-c-text-3) 4px,
      transparent 4px,
      transparent 8px
    );
  }
  .boundary-label {
    writing-mode: horizontal-tb;
    padding: 0 8px;
  }
  .var-item { font-size: 11px; }
  .leak-arrow { font-size: 12px; gap: 8px; }
  .env-rule { flex-direction: column; gap: 6px; text-align: center; }
}
</style>
