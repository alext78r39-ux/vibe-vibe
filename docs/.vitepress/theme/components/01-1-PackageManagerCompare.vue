<script setup lang="ts">
import { ref, onUnmounted, reactive } from 'vue'

interface Project {
  name: string
  deps: string[]
  installed: boolean
}

const projects = reactive<Project[]>([
  { name: '项目 A', deps: ['react', 'next', 'tailwind', 'lodash'], installed: false },
  { name: '项目 B', deps: ['react', 'next', 'axios', 'lodash'], installed: false },
  { name: '项目 C', deps: ['react', 'vue', 'tailwind', 'dayjs'], installed: false },
])

const npmDisk = ref(0)
const pnpmDisk = ref(0)
const pnpmStore = ref<string[]>([])
const animating = ref(false)
const currentProject = ref(-1)
let timer: number | null = null

const depSize: Record<string, number> = {
  react: 45, next: 120, tailwind: 65, lodash: 25, axios: 15, vue: 80, dayjs: 5,
}

function getDiskLabel(mb: number): string {
  return mb >= 1000 ? `${(mb / 1000).toFixed(1)} GB` : `${mb} MB`
}

async function installProject(index: number) {
  if (animating.value) return
  if (projects[index].installed) return
  animating.value = true
  currentProject.value = index
  const deps = projects[index].deps

  for (const dep of deps) {
    const size = depSize[dep] || 20
    // npm always copies
    npmDisk.value += size
    // pnpm only adds to store if not already there
    if (!pnpmStore.value.includes(dep)) {
      pnpmStore.value.push(dep)
      pnpmDisk.value += size
    }
    // small link cost for pnpm
    pnpmDisk.value += 1
    await delay(300)
  }

  projects[index].installed = true
  animating.value = false
  currentProject.value = -1
}

function reset() {
  if (timer) clearInterval(timer)
  projects.forEach(p => p.installed = false)
  npmDisk.value = 0
  pnpmDisk.value = 0
  pnpmStore.value = []
  animating.value = false
  currentProject.value = -1
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    timer = window.setTimeout(resolve, ms)
  })
}

const savings = ref('')
function getSavings(): string {
  if (npmDisk.value === 0) return ''
  const pct = Math.round((1 - pnpmDisk.value / npmDisk.value) * 100)
  return `节省 ${pct}%`
}

onUnmounted(() => { if (timer) clearTimeout(timer) })
</script>

<template>
  <div class="pm-compare">
    <div class="pm-window">
      <div class="pm-header">
        <div class="window-controls">
          <span class="ctrl close"></span>
          <span class="ctrl minimize"></span>
          <span class="ctrl maximize"></span>
        </div>
        <div class="pm-title">📦 npm vs pnpm 安装对比</div>
        <button class="reset-btn" @click="reset" title="重置">↻</button>
      </div>

      <div class="pm-body">
        <!-- Project buttons -->
        <div class="project-list">
          <button
            v-for="(proj, i) in projects" :key="i"
            class="project-btn"
            :class="{ installed: proj.installed, active: currentProject === i }"
            :disabled="animating || proj.installed"
            @click="installProject(i)"
          >
            <span class="proj-icon">{{ proj.installed ? '✅' : currentProject === i ? '⏳' : '📁' }}</span>
            <span class="proj-name">{{ proj.name }}</span>
            <span class="proj-deps">{{ proj.deps.join(', ') }}</span>
          </button>
        </div>

        <!-- Side by side comparison -->
        <div class="compare-grid">
          <!-- npm side -->
          <div class="side npm-side">
            <div class="side-label">
              <span class="label-icon">📦</span> npm
              <span class="label-tag">每次复制</span>
            </div>
            <div class="disk-bar-wrap">
              <div class="disk-bar npm-bar" :style="{ width: Math.min(npmDisk / 8, 100) + '%' }"></div>
            </div>
            <div class="disk-value">{{ getDiskLabel(npmDisk) }}</div>
            <div class="dep-blocks">
              <template v-for="(proj, i) in projects" :key="'npm-' + i">
                <div v-if="proj.installed" class="dep-group">
                  <div class="dep-group-label">{{ proj.name }}</div>
                  <div class="dep-items">
                    <span v-for="dep in proj.deps" :key="dep" class="dep-chip npm-chip">{{ dep }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- pnpm side -->
          <div class="side pnpm-side">
            <div class="side-label">
              <span class="label-icon">⚡</span> pnpm
              <span class="label-tag green">硬链接共享</span>
            </div>
            <div class="disk-bar-wrap">
              <div class="disk-bar pnpm-bar" :style="{ width: Math.min(pnpmDisk / 8, 100) + '%' }"></div>
            </div>
            <div class="disk-value">
              {{ getDiskLabel(pnpmDisk) }}
              <span v-if="npmDisk > 0" class="savings">{{ getSavings() }}</span>
            </div>
            <div class="dep-blocks">
              <div v-if="pnpmStore.length" class="dep-group store-group">
                <div class="dep-group-label">全局 Store（共享）</div>
                <div class="dep-items">
                  <span v-for="dep in pnpmStore" :key="dep" class="dep-chip pnpm-chip">{{ dep }}</span>
                </div>
              </div>
              <template v-for="(proj, i) in projects" :key="'pnpm-' + i">
                <div v-if="proj.installed" class="dep-group link-group">
                  <div class="dep-group-label">{{ proj.name }}（链接）</div>
                  <div class="dep-items">
                    <span v-for="dep in proj.deps" :key="dep" class="dep-chip link-chip">🔗 {{ dep }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="pm-footer">
        <span class="footer-icon">💡</span>
        <span>点击上方项目按钮，观察两种包管理器的磁盘占用差异</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pm-compare {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 20px 0;
}
.pm-window {
  background: #1e1e2e;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.pm-header {
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
.pm-title {
  flex: 1;
  text-align: center;
  color: #a0a0b0;
  font-size: 13px;
}
.reset-btn {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}
.reset-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }
.pm-body { padding: 20px; }
.project-list {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.project-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: #252542;
  border: 1px solid #3d3d5c;
  border-radius: 8px;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 120px;
}
.project-btn:hover:not(:disabled) {
  border-color: #007aff;
  background: #2d2d4a;
}
.project-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.project-btn.installed { border-color: #34c759; background: #1a2e1a; }
.project-btn.active { border-color: #ff9500; animation: pulse 1s infinite; }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,149,0,0.3); } 50% { box-shadow: 0 0 0 6px rgba(255,149,0,0); } }
.proj-icon { font-size: 20px; }
.proj-name { font-size: 13px; font-weight: 600; }
.proj-deps { font-size: 10px; color: #718096; }
.compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.side {
  padding: 16px;
  border-radius: 10px;
  border: 1px solid #2d2d4a;
}
.npm-side { background: #2a2030; }
.pnpm-side { background: #1a2a20; }
.side-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 12px;
}
.label-icon { font-size: 16px; }
.label-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #ff3b30;
  color: #fff;
  font-weight: 500;
}
.label-tag.green { background: #34c759; }
.disk-bar-wrap {
  height: 8px;
  background: #2d3748;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}
.disk-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
  min-width: 0;
}
.npm-bar { background: linear-gradient(90deg, #ff3b30, #ff9500); }
.pnpm-bar { background: linear-gradient(90deg, #34c759, #007aff); }
.disk-value {
  font-size: 12px;
  color: #a0aec0;
  font-family: 'SF Mono', Monaco, monospace;
  margin-bottom: 12px;
}
.savings {
  color: #34c759;
  font-weight: 600;
  margin-left: 8px;
}
.dep-blocks { display: flex; flex-direction: column; gap: 8px; }
.dep-group {
  padding: 8px;
  background: rgba(255,255,255,0.03);
  border-radius: 6px;
}
.dep-group-label {
  font-size: 10px;
  color: #718096;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.dep-items { display: flex; flex-wrap: wrap; gap: 4px; }
.dep-chip {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, monospace;
}
.npm-chip { background: #3d2a2a; color: #fc8181; }
.pnpm-chip { background: #1a3a2a; color: #68d391; }
.link-chip { background: #1a2a3a; color: #63b3ed; font-size: 10px; }
.store-group { border: 1px dashed #34c759; }
.link-group { border: 1px dashed #3d3d5c; }
.pm-footer {
  padding: 12px 20px;
  background: #16162a;
  border-top: 1px solid #2d2d44;
  font-size: 12px;
  color: #a0aec0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.footer-icon { font-size: 14px; }
@media (max-width: 640px) {
  .compare-grid { grid-template-columns: 1fr; }
  .project-list { flex-direction: column; }
}
</style>
