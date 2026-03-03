<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

interface ConfigQuestion {
  question: string
  options: string[]
  default: number
}

const configQuestions: ConfigQuestion[] = [
  { question: 'Would you like to use TypeScript?', options: ['Yes', 'No'], default: 0 },
  { question: 'Would you like to use ESLint?', options: ['Yes', 'No'], default: 0 },
  { question: 'Would you like to use Tailwind CSS?', options: ['Yes', 'No'], default: 0 },
  { question: 'Would you like your code inside a `src/` directory?', options: ['Yes', 'No'], default: 0 },
  { question: 'Would you like to use App Router? (recommended)', options: ['Yes', 'No'], default: 0 },
]

const phase = ref<'idle' | 'command' | 'config' | 'installing' | 'done'>('idle')
const currentQuestion = ref(0)
const answers = ref<number[]>([])
const typedText = ref('')
const installProgress = ref(0)
const projectName = ref('my-app')
let timer: number | null = null

const command = 'pnpm create next-app@latest my-app'

async function start() {
  phase.value = 'command'
  typedText.value = ''
  currentQuestion.value = 0
  answers.value = []
  installProgress.value = 0

  // Type command
  for (let i = 0; i <= command.length; i++) {
    typedText.value = command.slice(0, i)
    await delay(40)
  }
  await delay(500)
  phase.value = 'config'
}

function selectOption(optIndex: number) {
  answers.value.push(optIndex)
  if (currentQuestion.value < configQuestions.length - 1) {
    currentQuestion.value++
  } else {
    startInstall()
  }
}

async function startInstall() {
  phase.value = 'installing'
  for (let i = 0; i <= 100; i += 5) {
    installProgress.value = i
    await delay(60)
  }
  phase.value = 'done'
}

const fileTree = [
  { name: 'my-app/', indent: 0, icon: '📁', type: 'dir' },
  { name: 'src/', indent: 1, icon: '📁', type: 'dir' },
  { name: 'app/', indent: 2, icon: '📁', type: 'dir' },
  { name: 'page.tsx', indent: 3, icon: '📄', type: 'file' },
  { name: 'layout.tsx', indent: 3, icon: '📄', type: 'file' },
  { name: 'globals.css', indent: 3, icon: '🎨', type: 'file' },
  { name: 'public/', indent: 1, icon: '📁', type: 'dir' },
  { name: 'package.json', indent: 1, icon: '📦', type: 'config' },
  { name: 'tsconfig.json', indent: 1, icon: '⚙️', type: 'config' },
  { name: 'tailwind.config.ts', indent: 1, icon: '🎨', type: 'config' },
  { name: 'next.config.ts', indent: 1, icon: '⚙️', type: 'config' },
]

function reset() {
  if (timer) clearTimeout(timer)
  phase.value = 'idle'
  typedText.value = ''
  currentQuestion.value = 0
  answers.value = []
  installProgress.value = 0
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => { timer = window.setTimeout(resolve, ms) })
}

onUnmounted(() => { if (timer) clearTimeout(timer) })
</script>

<template>
  <div class="scaffold-flow">
    <div class="sf-window">
      <div class="sf-header">
        <div class="window-controls">
          <span class="ctrl close"></span>
          <span class="ctrl minimize"></span>
          <span class="ctrl maximize"></span>
        </div>
        <div class="sf-title">🏗️ 脚手架模拟器</div>
        <button class="reset-btn" @click="reset" title="重置">↻</button>
      </div>

      <div class="sf-body">
        <!-- Idle -->
        <div v-if="phase === 'idle'" class="idle-screen">
          <div class="idle-icon">🚀</div>
          <div class="idle-text">模拟 Next.js 项目创建过程</div>
          <div class="idle-sub">体验脚手架如何帮你自动生成项目结构</div>
          <button class="start-btn" @click="start">开始创建项目</button>
        </div>

        <!-- Terminal -->
        <div v-else class="terminal">
          <!-- Command phase -->
          <div class="term-line">
            <span class="prompt">$</span>
            <span class="cmd-text">{{ typedText }}</span>
            <span v-if="phase === 'command'" class="cursor-blink">▊</span>
          </div>

          <!-- Config phase -->
          <template v-if="phase === 'config' || phase === 'installing' || phase === 'done'">
            <div class="term-output">
              <span class="brand">▲ Next.js 16</span>
            </div>

            <template v-for="(q, i) in configQuestions" :key="i">
              <div v-if="i < currentQuestion || (i === currentQuestion && phase === 'config') || phase !== 'config'" class="config-line">
                <span class="config-q">{{ q.question }}</span>
                <template v-if="i < answers.length">
                  <span class="config-a" :class="{ yes: answers[i] === 0 }">
                    {{ q.options[answers[i]] }}
                  </span>
                </template>
                <template v-else-if="i === currentQuestion && phase === 'config'">
                  <div class="config-options">
                    <button
                      v-for="(opt, oi) in q.options" :key="oi"
                      class="config-opt-btn"
                      :class="{ recommended: oi === q.default }"
                      @click="selectOption(oi)"
                    >
                      {{ opt }}
                      <span v-if="oi === q.default" class="rec-tag">推荐</span>
                    </button>
                  </div>
                </template>
              </div>
            </template>
          </template>

          <!-- Installing -->
          <template v-if="phase === 'installing'">
            <div class="install-section">
              <div class="install-text">📦 安装依赖中...</div>
              <div class="install-bar-wrap">
                <div class="install-bar" :style="{ width: installProgress + '%' }"></div>
              </div>
              <div class="install-pct">{{ installProgress }}%</div>
            </div>
          </template>

          <!-- Done -->
          <template v-if="phase === 'done'">
            <div class="done-section">
              <div class="done-msg">✅ 项目创建成功！</div>
              <div class="file-tree">
                <div class="tree-title">生成的文件结构：</div>
                <div
                  v-for="(file, i) in fileTree" :key="i"
                  class="tree-item"
                  :style="{ paddingLeft: (file.indent * 20 + 12) + 'px' }"
                  :class="file.type"
                >
                  <span class="tree-icon">{{ file.icon }}</span>
                  <span class="tree-name">{{ file.name }}</span>
                </div>
              </div>
              <div class="next-steps">
                <div class="next-title">接下来运行：</div>
                <code>cd my-app && pnpm dev</code>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scaffold-flow {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 20px 0;
}
.sf-window {
  background: #1e1e2e;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.sf-header {
  display: flex; align-items: center; padding: 12px 16px;
  background: linear-gradient(180deg, #2d2d44 0%, #1e1e2e 100%);
  border-bottom: 1px solid #2d2d44;
}
.window-controls { display: flex; gap: 8px; }
.ctrl { width: 12px; height: 12px; border-radius: 50%; }
.ctrl.close { background: #ff5f56; }
.ctrl.minimize { background: #ffbd2e; }
.ctrl.maximize { background: #27c93f; }
.sf-title { flex: 1; text-align: center; color: #a0a0b0; font-size: 13px; }
.reset-btn {
  background: transparent; border: none; color: #888; cursor: pointer;
  font-size: 16px; padding: 4px 8px; border-radius: 4px; transition: all 0.2s;
}
.reset-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }
.sf-body { padding: 20px; min-height: 300px; }
.idle-screen {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 260px; text-align: center;
}
.idle-icon { font-size: 48px; margin-bottom: 16px; }
.idle-text { font-size: 18px; font-weight: 600; color: #e2e8f0; margin-bottom: 8px; }
.idle-sub { font-size: 13px; color: #718096; margin-bottom: 24px; }
.start-btn {
  padding: 12px 32px; background: linear-gradient(135deg, #007aff, #5856d6);
  color: #fff; border: none; border-radius: 8px; font-size: 14px;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.start-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,122,255,0.3); }
.terminal {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 13px; line-height: 1.8;
}
.term-line { color: #e2e8f0; }
.prompt { color: #34c759; margin-right: 8px; }
.cmd-text { color: #63b3ed; }
.cursor-blink { color: #e2e8f0; animation: blink 1s step-end infinite; }
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
.term-output { margin: 8px 0; }
.brand { color: #e2e8f0; font-weight: 600; }
.config-line { margin: 6px 0; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.config-q { color: #a0aec0; }
.config-a { font-weight: 600; }
.config-a.yes { color: #34c759; }
.config-a:not(.yes) { color: #ff9500; }
.config-options { display: flex; gap: 8px; margin-top: 4px; }
.config-opt-btn {
  padding: 6px 16px; background: #252542; border: 1px solid #3d3d5c;
  border-radius: 6px; color: #e2e8f0; cursor: pointer; font-size: 12px;
  font-family: inherit; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
}
.config-opt-btn:hover { border-color: #007aff; background: #2d2d4a; }
.config-opt-btn.recommended { border-color: #34c759; }
.rec-tag {
  font-size: 9px; padding: 1px 6px; background: #34c759;
  color: #fff; border-radius: 8px;
}
.install-section { margin-top: 16px; }
.install-text { color: #a0aec0; margin-bottom: 8px; }
.install-bar-wrap {
  height: 6px; background: #2d3748; border-radius: 3px; overflow: hidden; margin-bottom: 4px;
}
.install-bar {
  height: 100%; background: linear-gradient(90deg, #34c759, #007aff);
  border-radius: 3px; transition: width 0.1s;
}
.install-pct { font-size: 11px; color: #718096; text-align: right; }
.done-section { margin-top: 16px; }
.done-msg { color: #34c759; font-weight: 600; font-size: 14px; margin-bottom: 16px; }
.file-tree {
  background: #16162a; border-radius: 8px; padding: 14px; margin-bottom: 16px;
  border: 1px solid #2d2d4a;
}
.tree-title { font-size: 11px; color: #718096; margin-bottom: 8px; font-family: -apple-system, sans-serif; }
.tree-item {
  padding: 3px 0; display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #a0aec0;
}
.tree-item.dir { color: #63b3ed; font-weight: 500; }
.tree-item.config { color: #ff9500; }
.tree-icon { font-size: 14px; }
.next-steps {
  padding: 12px; background: #252542; border-radius: 8px; border: 1px solid #3d3d5c;
}
.next-title { font-size: 11px; color: #718096; margin-bottom: 6px; font-family: -apple-system, sans-serif; }
.next-steps code {
  font-size: 13px; color: #34c759;
}
</style>
