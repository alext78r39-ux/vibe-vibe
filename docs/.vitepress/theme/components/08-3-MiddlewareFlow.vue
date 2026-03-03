<script setup lang="ts">
const roles = [
  {
    name: '管理员 (Admin)',
    color: '#9333ea',
    permissions: ['创建', '编辑', '删除', '查看', '管理用户', '系统设置'],
    width: '100%',
  },
  {
    name: '编辑者 (Editor)',
    color: '#2eb3df',
    permissions: ['创建', '编辑', '查看'],
    width: '70%',
  },
  {
    name: '普通用户 (User)',
    color: '#15a051',
    permissions: ['查看'],
    width: '40%',
  },
]
</script>

<template>
  <div class="mw-container">
    <!-- Section 1: Middleware Flow -->
    <div class="mw-section">
      <div class="mw-section-title">Middleware 拦截流程</div>
      <div class="mw-flow">
        <div class="mw-node mw-node-start">
          <div class="mw-node-icon">&#x1F4E8;</div>
          <div class="mw-node-label">请求到达</div>
        </div>

        <div class="mw-arrow">
          <div class="mw-arrow-line"></div>
          <div class="mw-arrow-head"></div>
        </div>

        <div class="mw-node mw-node-check">
          <div class="mw-node-icon">&#x1F6E1;&#xFE0F;</div>
          <div class="mw-node-label">Middleware 检查</div>
        </div>

        <div class="mw-arrow">
          <div class="mw-arrow-line"></div>
          <div class="mw-arrow-head"></div>
        </div>

        <div class="mw-diamond">
          <div class="mw-diamond-inner">有 Session?</div>
        </div>

        <!-- Two branches -->
        <div class="mw-branches">
          <!-- Yes branch -->
          <div class="mw-branch mw-branch-yes">
            <div class="mw-branch-label mw-label-yes">Yes</div>
            <div class="mw-branch-arrow">
              <div class="mw-arrow-line mw-line-yes"></div>
              <div class="mw-arrow-head mw-head-yes"></div>
            </div>
            <div class="mw-branch-result mw-result-yes">
              <div class="mw-result-icon">&#x2705;</div>
              <div class="mw-result-text">放行</div>
            </div>
            <div class="mw-branch-arrow">
              <div class="mw-arrow-line mw-line-yes"></div>
              <div class="mw-arrow-head mw-head-yes"></div>
            </div>
            <div class="mw-branch-dest mw-dest-yes">
              <div class="mw-dest-icon">&#x1F4C4;</div>
              <div class="mw-dest-text">页面 / API</div>
            </div>
          </div>

          <!-- No branch -->
          <div class="mw-branch mw-branch-no">
            <div class="mw-branch-label mw-label-no">No</div>
            <div class="mw-branch-arrow">
              <div class="mw-arrow-line mw-line-no"></div>
              <div class="mw-arrow-head mw-head-no"></div>
            </div>
            <div class="mw-branch-result mw-result-no">
              <div class="mw-result-icon">&#x1F6AB;</div>
              <div class="mw-result-text">拦截</div>
            </div>
            <div class="mw-branch-arrow">
              <div class="mw-arrow-line mw-line-no"></div>
              <div class="mw-arrow-head mw-head-no"></div>
            </div>
            <div class="mw-branch-dest mw-dest-no">
              <div class="mw-dest-icon">&#x1F512;</div>
              <div class="mw-dest-text">/login</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: RBAC -->
    <div class="mw-section">
      <div class="mw-section-title">RBAC 角色权限</div>
      <div class="rbac-stack">
        <div
          v-for="(role, i) in roles" :key="role.name"
          class="rbac-layer"
          :style="{ width: role.width, '--role-color': role.color }"
        >
          <div class="rbac-header">
            <span class="rbac-name">{{ role.name }}</span>
            <span v-if="i === 0" class="rbac-badge rbac-badge-all">所有权限</span>
          </div>
          <div class="rbac-permissions">
            <span
              v-for="perm in role.permissions" :key="perm"
              class="rbac-perm"
              :style="{ background: role.color + '18', color: role.color, borderColor: role.color + '40' }"
            >{{ perm }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mw-container {
  max-width: 688px;
  margin: 1.5rem auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mw-section {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.mw-section-title {
  padding: 12px 20px;
  font-weight: 700;
  font-size: 15px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

/* ── Middleware Flow ── */
.mw-flow {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: wrap;
  justify-content: center;
}

.mw-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.mw-node-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: var(--vp-c-bg-soft);
  border: 2px solid var(--vp-c-divider);
}

.mw-node-check .mw-node-icon {
  border-color: #D4952C;
  background: rgba(212, 149, 44, 0.08);
}

.mw-node-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

/* Arrows */
.mw-arrow {
  display: flex;
  align-items: center;
  padding: 0 6px;
}

.mw-arrow-line {
  width: 24px;
  height: 2px;
  background: var(--vp-c-divider);
}

.mw-arrow-head {
  width: 0;
  height: 0;
  border-left: 6px solid var(--vp-c-divider);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
}

/* Diamond */
.mw-diamond {
  width: 100px;
  height: 100px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 8px;
}

.mw-diamond-inner {
  width: 80px;
  height: 80px;
  background: var(--vp-c-bg-soft);
  border: 2px solid #D4952C;
  transform: rotate(45deg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mw-diamond-inner {
  font-size: 11px;
  font-weight: 700;
  color: #D4952C;
  transform: rotate(45deg);
  position: absolute;
}

.mw-diamond::before {
  content: '';
  position: absolute;
  width: 72px;
  height: 72px;
  border: 2px solid #D4952C;
  background: rgba(212, 149, 44, 0.06);
  transform: rotate(45deg);
  border-radius: 4px;
}

.mw-diamond-inner {
  position: relative;
  z-index: 1;
  transform: none;
  font-size: 12px;
  font-weight: 700;
  color: #D4952C;
  text-align: center;
  line-height: 1.3;
}

/* Branches */
.mw-branches {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding: 0 20px;
}

.mw-branch {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
}

.mw-branch-yes {
  background: rgba(21, 160, 81, 0.06);
  border: 1px solid rgba(21, 160, 81, 0.2);
}

.mw-branch-no {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.mw-branch-label {
  font-size: 12px;
  font-weight: 700;
  min-width: 28px;
}

.mw-label-yes { color: #15a051; }
.mw-label-no { color: #ef4444; }

.mw-branch-arrow { display: flex; align-items: center; }

.mw-line-yes { width: 20px; height: 2px; background: #15a051; }
.mw-head-yes { border-left-color: #15a051; }
.mw-line-no { width: 20px; height: 2px; background: #ef4444; }
.mw-head-no { border-left-color: #ef4444; }

.mw-branch-result {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.mw-result-yes { color: #15a051; }
.mw-result-no { color: #ef4444; }
.mw-result-icon { font-size: 16px; }

.mw-branch-dest {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.mw-dest-yes {
  background: rgba(21, 160, 81, 0.1);
  color: #15a051;
}

.mw-dest-no {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.mw-dest-icon { font-size: 16px; }

/* ── RBAC Stack ── */
.rbac-stack {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.rbac-layer {
  border: 2px solid var(--role-color);
  border-radius: 10px;
  padding: 12px 16px;
  background: color-mix(in srgb, var(--role-color) 5%, var(--vp-c-bg));
  transition: all 0.2s;
}

.rbac-layer:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--role-color) 15%, transparent);
}

.rbac-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.rbac-name {
  font-weight: 700;
  font-size: 14px;
  color: var(--role-color);
}

.rbac-badge-all {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--role-color);
  color: #fff;
  font-weight: 600;
}

.rbac-permissions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.rbac-perm {
  padding: 3px 10px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid;
}

/* ── Dark Mode ── */
:global(html.dark) .mw-node-icon { background: #1e1e2e; }
:global(html.dark) .mw-diamond::before { background: rgba(212, 149, 44, 0.1); }
:global(html.dark) .mw-branch-yes {
  background: rgba(21, 160, 81, 0.08);
  border-color: rgba(21, 160, 81, 0.25);
}
:global(html.dark) .mw-branch-no {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.25);
}
:global(html.dark) .rbac-layer {
  background: color-mix(in srgb, var(--role-color) 8%, #1e1e2e);
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .mw-flow { padding: 16px 10px; gap: 4px; }
  .mw-node-icon { width: 36px; height: 36px; font-size: 16px; }
  .mw-node-label { font-size: 10px; }
  .mw-arrow-line { width: 14px; }
  .mw-diamond { width: 80px; height: 80px; margin: 0 4px; }
  .mw-diamond::before { width: 56px; height: 56px; }
  .mw-diamond-inner { font-size: 10px; }
  .mw-branches { padding: 0 8px; }
  .mw-branch { padding: 8px 10px; gap: 6px; }
  .mw-line-yes, .mw-line-no { width: 12px; }
  .rbac-stack { padding: 14px; }
  .rbac-layer { padding: 10px 12px; width: 100% !important; }
  .rbac-name { font-size: 13px; }
  .rbac-perm { font-size: 10px; padding: 2px 8px; }
}
</style>
