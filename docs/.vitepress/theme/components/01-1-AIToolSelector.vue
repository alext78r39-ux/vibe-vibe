<script setup lang="ts">
import { ref, computed } from 'vue'

interface Question {
  id: string
  text: string
  options: { label: string; value: string; icon: string }[]
}

interface Tool {
  name: string
  icon: string
  type: string
  cost: string
  reason: string
  tags: string[]
}

const questions: Question[] = [
  {
    id: 'interface',
    text: '你更喜欢哪种交互方式？',
    options: [
      { label: '图形界面（GUI）', value: 'gui', icon: '🖥️' },
      { label: '命令行（CLI）', value: 'cli', icon: '⌨️' },
      { label: '都可以', value: 'both', icon: '🤷' },
    ]
  },
  {
    id: 'backend',
    text: '你的项目需要后端功能吗？',
    options: [
      { label: '需要（数据库、API）', value: 'yes', icon: '🗄️' },
      { label: '纯前端就够了', value: 'no', icon: '🎨' },
      { label: '不确定', value: 'maybe', icon: '🤔' },
    ]
  },
  {
    id: 'budget',
    text: '你的预算偏好？',
    options: [
      { label: '免费优先', value: 'free', icon: '🆓' },
      { label: '性价比优先', value: 'value', icon: '💰' },
      { label: '效果优先', value: 'best', icon: '🚀' },
    ]
  },
]

const answers = ref<Record<string, string>>({})
const currentStep = ref(0)
const showResult = ref(false)

function selectOption(questionId: string, value: string) {
  answers.value[questionId] = value
  if (currentStep.value < questions.length - 1) {
    setTimeout(() => { currentStep.value++ }, 200)
  } else {
    setTimeout(() => { showResult.value = true }, 200)
  }
}

const recommendation = computed<Tool[]>(() => {
  const a = answers.value
  const tools: Tool[] = []

  if (a.interface === 'cli' || a.interface === 'both') {
    tools.push({
      name: 'Claude Code + GLM',
      icon: '⌨️',
      type: 'CLI 工具',
      cost: a.budget === 'free' ? '编码套餐约 ¥0.02/次' : '编码套餐约 ¥0.02/次',
      reason: '命令行原生体验，工作流强大，支持国内模型，性价比极高',
      tags: ['推荐', 'CLI', '国内直连'],
    })
  }

  if (a.interface === 'gui' || a.interface === 'both') {
    if (a.budget === 'free') {
      tools.push({
        name: 'Trae',
        icon: '🎯',
        type: 'IDE 工具',
        cost: '免费',
        reason: '字节出品，中文友好，免费使用，适合入门',
        tags: ['免费', 'IDE', '中文'],
      })
    } else {
      tools.push({
        name: 'Cursor',
        icon: '🖱️',
        type: 'IDE 工具',
        cost: '$20/月',
        reason: '基于 VS Code，AI 深度集成，社区活跃',
        tags: ['IDE', '主流'],
      })
    }
  }

  if (a.backend === 'yes' || a.backend === 'maybe') {
    tools.push({
      name: 'Next.js 全栈方案',
      icon: '🏗️',
      type: '框架',
      cost: '免费',
      reason: '前后端一体，API Routes 内置，Vercel 一键部署',
      tags: ['全栈', '推荐'],
    })
  }

  if (tools.length === 0) {
    tools.push({
      name: 'Claude Code + GLM',
      icon: '⌨️',
      type: 'CLI 工具',
      cost: '编码套餐约 ¥0.02/次',
      reason: '本教程推荐的默认方案',
      tags: ['推荐'],
    })
  }

  return tools
})

function reset() {
  answers.value = {}
  currentStep.value = 0
  showResult.value = false
}
</script>

<template>
  <div class="tool-selector">
    <div class="ts-window">
      <div class="ts-header">
        <div class="window-controls">
          <span class="ctrl close"></span>
          <span class="ctrl minimize"></span>
          <span class="ctrl maximize"></span>
        </div>
        <div class="ts-title">🧭 AI 工具选择向导</div>
        <button class="reset-btn" @click="reset" title="重新选择">↻</button>
      </div>

      <div class="ts-body">
        <!-- Progress -->
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: (showResult ? 100 : (currentStep / questions.length) * 100) + '%' }"
          ></div>
        </div>

        <!-- Questions -->
        <template v-if="!showResult">
          <div class="question-card">
            <div class="step-badge">问题 {{ currentStep + 1 }} / {{ questions.length }}</div>
            <div class="question-text">{{ questions[currentStep].text }}</div>
            <div class="options-list">
              <button
                v-for="opt in questions[currentStep].options"
                :key="opt.value"
                class="option-btn"
                :class="{ selected: answers[questions[currentStep].id] === opt.value }"
                @click="selectOption(questions[currentStep].id, opt.value)"
              >
                <span class="opt-icon">{{ opt.icon }}</span>
                <span class="opt-label">{{ opt.label }}</span>
              </button>
            </div>
          </div>

          <!-- Previous answers -->
          <div v-if="currentStep > 0" class="prev-answers">
            <div
              v-for="i in currentStep" :key="i"
              class="prev-item"
              @click="currentStep = i - 1; showResult = false"
            >
              <span class="prev-q">{{ questions[i-1].text }}</span>
              <span class="prev-a">{{ questions[i-1].options.find(o => o.value === answers[questions[i-1].id])?.label }}</span>
            </div>
          </div>
        </template>

        <!-- Results -->
        <template v-else>
          <div class="result-section">
            <div class="result-title">🎯 推荐方案</div>
            <div class="tool-cards">
              <div v-for="tool in recommendation" :key="tool.name" class="tool-card">
                <div class="tool-header">
                  <span class="tool-icon">{{ tool.icon }}</span>
                  <div class="tool-meta">
                    <div class="tool-name">{{ tool.name }}</div>
                    <div class="tool-type">{{ tool.type }}</div>
                  </div>
                  <div class="tool-cost">{{ tool.cost }}</div>
                </div>
                <div class="tool-reason">{{ tool.reason }}</div>
                <div class="tool-tags">
                  <span v-for="tag in tool.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
            </div>
            <button class="retry-btn" @click="reset">🔄 重新选择</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tool-selector {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 20px 0;
}
.ts-window {
  background: #1e1e2e;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.ts-header {
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
.ts-title { flex: 1; text-align: center; color: #a0a0b0; font-size: 13px; }
.reset-btn {
  background: transparent; border: none; color: #888; cursor: pointer;
  font-size: 16px; padding: 4px 8px; border-radius: 4px; transition: all 0.2s;
}
.reset-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }
.ts-body { padding: 24px; }
.progress-bar {
  height: 4px; background: #2d3748; border-radius: 2px; margin-bottom: 24px; overflow: hidden;
}
.progress-fill {
  height: 100%; background: linear-gradient(90deg, #007aff, #5856d6);
  border-radius: 2px; transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
}
.question-card { text-align: center; }
.step-badge {
  display: inline-block; font-size: 11px; padding: 3px 12px;
  background: #252542; border-radius: 12px; color: #718096; margin-bottom: 16px;
}
.question-text {
  font-size: 18px; font-weight: 600; color: #e2e8f0; margin-bottom: 24px;
}
.options-list { display: flex; flex-direction: column; gap: 10px; max-width: 400px; margin: 0 auto; }
.option-btn {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 20px; background: #252542; border: 1px solid #3d3d5c;
  border-radius: 10px; color: #e2e8f0; cursor: pointer; transition: all 0.2s;
  text-align: left; font-size: 14px;
}
.option-btn:hover { border-color: #007aff; background: #2d2d4a; }
.option-btn.selected { border-color: #007aff; background: #1a2a4a; box-shadow: 0 0 0 2px rgba(0,122,255,0.3); }
.opt-icon { font-size: 20px; }
.opt-label { flex: 1; }
.prev-answers { margin-top: 20px; display: flex; flex-direction: column; gap: 6px; }
.prev-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 14px; background: #252542; border-radius: 6px;
  font-size: 12px; cursor: pointer; transition: all 0.2s;
}
.prev-item:hover { background: #2d2d4a; }
.prev-q { color: #718096; }
.prev-a { color: #63b3ed; font-weight: 500; }
.result-section { text-align: center; }
.result-title { font-size: 20px; font-weight: 600; color: #e2e8f0; margin-bottom: 20px; }
.tool-cards { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.tool-card {
  padding: 16px; background: #252542; border: 1px solid #3d3d5c;
  border-radius: 10px; text-align: left;
}
.tool-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.tool-icon { font-size: 28px; }
.tool-meta { flex: 1; }
.tool-name { font-size: 15px; font-weight: 600; color: #e2e8f0; }
.tool-type { font-size: 11px; color: #718096; }
.tool-cost {
  font-size: 12px; padding: 4px 10px; background: #1a2a3a;
  border-radius: 6px; color: #63b3ed; font-family: 'SF Mono', Monaco, monospace;
}
.tool-reason { font-size: 13px; color: #a0aec0; line-height: 1.5; margin-bottom: 10px; }
.tool-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.tag {
  font-size: 10px; padding: 2px 8px; border-radius: 10px;
  background: #2d3748; color: #a0aec0;
}
.tag:first-child { background: #1a3a2a; color: #68d391; }
.retry-btn {
  padding: 10px 24px; background: #252542; border: 1px solid #3d3d5c;
  border-radius: 8px; color: #a0aec0; cursor: pointer; font-size: 13px;
  transition: all 0.2s;
}
.retry-btn:hover { border-color: #007aff; color: #e2e8f0; }
@media (max-width: 640px) {
  .question-text { font-size: 16px; }
  .options-list { max-width: 100%; }
}
</style>
