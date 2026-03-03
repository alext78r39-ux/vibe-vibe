<script setup lang="ts">
import { ref } from 'vue'

interface Field {
  key: string
  value: string
  line: number
  title: string
  required: boolean
  description: string
  command?: string
}

const fields: Field[] = [
  { key: 'name', value: '"my-app"', line: 1, title: '项目名称', required: true, description: '项目的唯一标识符。必须是小写英文，可用连字符分隔。发布到 npm 时就是包名。', command: 'pnpm init 时自动生成' },
  { key: 'version', value: '"1.0.0"', line: 2, title: '版本号', required: true, description: '遵循语义化版本（Semver）：主版本.次版本.修订号。1.0.0 → 1.0.1（修 bug）→ 1.1.0（加功能）→ 2.0.0（破坏性变更）。' },
  { key: 'private', value: 'true', line: 3, title: '私有标记', required: false, description: '设为 true 防止意外发布到 npm。个人项目建议始终设为 true。' },
  { key: 'scripts', value: '{ ... }', line: 4, title: '脚本命令', required: false, description: '定义可执行的命令快捷方式。pnpm dev 实际执行的就是 scripts.dev 对应的命令。', command: 'pnpm dev / pnpm build / pnpm lint' },
  { key: 'dependencies', value: '{ ... }', line: 5, title: '生产依赖', required: false, description: '项目运行时必需的包。如 React、Next.js。用户访问你的网站时，这些代码会被加载。', command: 'pnpm add react' },
  { key: 'devDependencies', value: '{ ... }', line: 6, title: '开发依赖', required: false, description: '仅开发时需要的包。如 TypeScript、ESLint。打包后不会包含在最终产物中。', command: 'pnpm add -D typescript' },
]

const activeField = ref<Field | null>(null)
const semverExample = ref('')

const semverParts = [
  { symbol: '^', name: '兼容更新', desc: '^18.0.0 → 允许 18.x.x，不允许 19.0.0', color: '#34c759' },
  { symbol: '~', name: '修订更新', desc: '~18.0.0 → 允许 18.0.x，不允许 18.1.0', color: '#ff9500' },
  { symbol: '', name: '精确版本', desc: '18.0.0 → 只允许 18.0.0', color: '#ff3b30' },
]

function selectField(field: Field) {
  activeField.value = activeField.value?.key === field.key ? null : field
}
</script>

<template>
  <div class="pkg-explorer">
    <div class="pkg-window">
      <div class="pkg-header">
        <div class="window-controls">
          <span class="ctrl close"></span>
          <span class="ctrl minimize"></span>
          <span class="ctrl maximize"></span>
        </div>
        <div class="pkg-title">📄 package.json 交互式查看器</div>
      </div>

      <div class="pkg-body">
        <div class="pkg-layout">
          <!-- Code panel -->
          <div class="code-panel">
            <div class="code-header">package.json</div>
            <pre class="code-block"><span class="brace">{</span>
<template v-for="(field, i) in fields" :key="field.key">
<span
  class="code-line"
  :class="{ active: activeField?.key === field.key }"
  @click="selectField(field)"
>  <span class="key">"{{ field.key }}"</span>: <span class="val">{{ field.value }}</span>{{ i < fields.length - 1 ? ',' : '' }}</span>
</template>
<span class="brace">}</span></pre>
            <div class="code-hint">👆 点击任意字段查看说明</div>
          </div>

          <!-- Info panel -->
          <div class="info-panel">
            <template v-if="activeField">
              <div class="info-card">
                <div class="info-title">
                  <span class="info-badge" :class="{ required: activeField.required }">
                    {{ activeField.required ? '必填' : '可选' }}
                  </span>
                  {{ activeField.title }}
                </div>
                <div class="info-desc">{{ activeField.description }}</div>
                <div v-if="activeField.command" class="info-cmd">
                  <span class="cmd-label">相关命令</span>
                  <code>{{ activeField.command }}</code>
                </div>
              </div>

              <!-- Semver section for version field -->
              <div v-if="activeField.key === 'version' || activeField.key === 'dependencies'" class="semver-section">
                <div class="semver-title">版本号前缀含义</div>
                <div class="semver-list">
                  <div v-for="sv in semverParts" :key="sv.symbol" class="semver-item">
                    <span class="semver-symbol" :style="{ color: sv.color }">
                      {{ sv.symbol || '无' }}
                    </span>
                    <div class="semver-info">
                      <div class="semver-name">{{ sv.name }}</div>
                      <div class="semver-desc">{{ sv.desc }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="info-empty">
              <div class="empty-icon">📋</div>
              <div class="empty-text">点击左侧字段<br/>查看详细说明</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pkg-explorer {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 20px 0;
}
.pkg-window {
  background: #1e1e2e;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.pkg-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(180deg, #2d2d44 0%, #1e1e2e 100%);
  border-bottom: 1px solid #2d2d44;
}
.window-controls { display: flex; gap: 8px; }
.ctrl { width: 12px; height: 12px; border-radius: 50%; }
.ctrl.close { background: #ff5f56; }
.ctrl.minimize { background: #ffbd2e; }
.ctrl.maximize { background: #27c93f; }
.pkg-title {
  flex: 1; text-align: center; color: #a0a0b0; font-size: 13px;
}
.pkg-body { padding: 20px; }
.pkg-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}
.code-panel {
  background: #16162a;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #2d2d4a;
}
.code-header {
  padding: 8px 14px;
  font-size: 11px;
  color: #718096;
  background: #252542;
  border-bottom: 1px solid #2d2d4a;
}
.code-block {
  margin: 0;
  padding: 14px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 13px;
  line-height: 1.8;
  color: #e2e8f0;
  overflow-x: auto;
}
.brace { color: #718096; }
.code-line {
  cursor: pointer;
  display: inline-block;
  width: 100%;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s;
}
.code-line:hover { background: rgba(99,179,237,0.1); }
.code-line.active {
  background: rgba(99,179,237,0.2);
  box-shadow: inset 3px 0 0 #007aff;
}
.key { color: #63b3ed; }
.val { color: #68d391; }
.code-hint {
  padding: 8px 14px;
  font-size: 11px;
  color: #718096;
  border-top: 1px solid #2d2d4a;
  text-align: center;
}
.info-panel { min-height: 200px; }
.info-card {
  background: #252542;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #3d3d5c;
  margin-bottom: 12px;
}
.info-title {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.info-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #2d3748;
  color: #a0aec0;
  font-weight: 500;
}
.info-badge.required { background: #ff3b30; color: #fff; }
.info-desc {
  font-size: 13px;
  color: #a0aec0;
  line-height: 1.6;
  margin-bottom: 10px;
}
.info-cmd {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #2d2d4a;
}
.cmd-label {
  font-size: 10px;
  color: #718096;
  white-space: nowrap;
}
.info-cmd code {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 12px;
  background: #1e1e2e;
  padding: 4px 10px;
  border-radius: 4px;
  color: #63b3ed;
}
.semver-section {
  background: #252542;
  border-radius: 8px;
  padding: 14px;
  border: 1px solid #3d3d5c;
}
.semver-title {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 10px;
}
.semver-list { display: flex; flex-direction: column; gap: 8px; }
.semver-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  background: rgba(255,255,255,0.03);
  border-radius: 6px;
}
.semver-symbol {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 18px;
  font-weight: 700;
  width: 30px;
  text-align: center;
}
.semver-name { font-size: 12px; font-weight: 600; color: #e2e8f0; }
.semver-desc { font-size: 11px; color: #718096; }
.info-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #718096;
  text-align: center;
}
.empty-icon { font-size: 40px; margin-bottom: 12px; }
.empty-text { font-size: 13px; line-height: 1.6; }
@media (max-width: 640px) {
  .pkg-layout { grid-template-columns: 1fr; }
}
</style>