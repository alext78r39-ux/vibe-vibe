<script setup lang="ts">
import { ref, computed } from 'vue'

interface CheckItem { id: number; category: string; text: string; why: string }

const items: CheckItem[] = [
  { id: 1, category: '用户', text: 'AI 明确说了目标用户是谁', why: '模糊的用户定义会导致AI做出错误的设计决策。"所有人"不是用户画像。' },
  { id: 2, category: '功能', text: 'AI 列出了 3-5 个核心功能', why: '核心功能太少说明需求不清晰，太多说明没有聚焦。3-5个是MVP的合理范围。' },
  { id: 3, category: '功能', text: 'AI 明确了不做哪些功能', why: 'Out-of-Scope 比 In-Scope 更重要。不说清楚不做什么，AI会自由发挥。' },
  { id: 4, category: '范围', text: 'AI 理解了完整的使用流程', why: '流程是功能之间的连接。缺少流程，AI可能把独立功能做对，但整体体验不连贯。' },
  { id: 5, category: '数据', text: '数据怎么存、存什么已明确', why: '数据模型是代码的骨架。存储方式（本地/云端）直接影响技术架构选择。' },
  { id: 6, category: '数据', text: '边缘情况已讨论', why: '边缘情况是bug的温床。空输入、网络断开、并发操作——不提前想清楚，上线后必出问题。' },
  { id: 7, category: '技术', text: '技术约束已说明', why: '技术栈、部署环境、性能要求——这些约束决定了AI选择什么框架和方案。' },
  { id: 8, category: '技术', text: '让 AI 总结确认，它的理解准确', why: '最后的确认环节是安全网。让AI复述理解，能发现之前遗漏的误解。' },
]

const checked = ref<Set<number>>(new Set())
const expanded = ref<Set<number>>(new Set())

const total = items.length
const doneCount = computed(() => checked.value.size)
const progress = computed(() => doneCount.value / total)
const allDone = computed(() => doneCount.value === total)

function toggle(id: number) {
  const s = new Set(checked.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  checked.value = s
}
function toggleExpand(id: number) {
  const s = new Set(expanded.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  expanded.value = s
}
function reset() { checked.value = new Set(); expanded.value = new Set() }

const categories = [...new Set(items.map(i => i.category))]
const circumference = 2 * Math.PI * 40
const dashOffset = computed(() => circumference * (1 - progress.value))
const ringColor = computed(() => progress.value >= 1 ? '#34c759' : '#007aff')
</script>
<!-- PH_T -->

<template>
  <div class="checklist-wrap">
    <div class="cl-header">
      <div class="ring-area">
        <svg class="progress-ring" width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" fill="none" stroke="#e8e8ed" stroke-width="6" />
          <circle cx="48" cy="48" r="40" fill="none" :stroke="ringColor" stroke-width="6" stroke-linecap="round"
            :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset"
            transform="rotate(-90 48 48)" style="transition: stroke-dashoffset 0.4s ease, stroke 0.3s;" />
        </svg>
        <span class="ring-text" :class="{ done: allDone }">{{ doneCount }}/{{ total }}</span>
      </div>
      <div class="cl-info">
        <span class="cl-title">讨论结束检查清单</span>
        <span class="cl-sub">全部勾选后即可让 AI 生成 PRD</span>
      </div>
      <button class="reset-btn" @click="reset">↺</button>
    </div>

    <div v-for="cat in categories" :key="cat" class="cat-group">
      <div class="cat-label">{{ cat }}</div>
      <div v-for="item in items.filter(i => i.category === cat)" :key="item.id" class="cl-item" :class="{ checked: checked.has(item.id) }">
        <div class="item-row" @click="toggle(item.id)">
          <span class="checkbox" :class="{ on: checked.has(item.id) }">
            <svg v-if="checked.has(item.id)" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>
          </span>
          <span class="item-text">{{ item.text }}</span>
          <button class="expand-btn" @click.stop="toggleExpand(item.id)">{{ expanded.has(item.id) ? '−' : '+' }}</button>
        </div>
        <div v-if="expanded.has(item.id)" class="why-panel">
          💡 {{ item.why }}
        </div>
      </div>
    </div>

    <Transition name="celebrate">
      <div v-if="allDone" class="celebration">
        <div class="confetti-wrap">
          <span v-for="i in 12" :key="i" class="confetti" :style="{ left: (i * 8) + '%', animationDelay: (i * 0.1) + 's' }"></span>
        </div>
        <div class="celebrate-text">🎉 准备就绪！可以让 AI 生成 PRD 了</div>
      </div>
    </Transition>
  </div>
</template>
<!-- PH_S -->

<style scoped>
.checklist-wrap { background: linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%); border-radius: 20px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8); font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif; }
.cl-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.ring-area { position: relative; width: 96px; height: 96px; flex-shrink: 0; }
.progress-ring { display: block; }
.ring-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 18px; font-weight: 700; color: #1d1d1f; }
.ring-text.done { color: #34c759; }
.cl-info { flex: 1; }
.cl-title { display: block; font-size: 16px; font-weight: 600; color: #1d1d1f; }
.cl-sub { display: block; font-size: 12px; color: #86868b; margin-top: 4px; }
.reset-btn { width: 36px; height: 36px; border-radius: 50%; border: none; background: white; color: #86868b; cursor: pointer; font-size: 18px; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.reset-btn:hover { background: #e8e8ed; color: #1d1d1f; }
.cat-group { margin-bottom: 16px; }
.cat-label { font-size: 12px; font-weight: 700; color: #86868b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; padding-left: 4px; }
.cl-item { background: white; border-radius: 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); overflow: hidden; transition: all 0.2s; }
.cl-item.checked { background: #f0fff4; }
.item-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; cursor: pointer; }
.checkbox { width: 24px; height: 24px; border-radius: 7px; border: 2px solid #d1d1d6; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
.checkbox.on { background: #34c759; border-color: #34c759; animation: checkPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.checkbox svg { width: 14px; height: 14px; }
@keyframes checkPop { 0% { transform: scale(0.8); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
.item-text { flex: 1; font-size: 14px; color: #1d1d1f; font-weight: 500; }
.expand-btn { width: 28px; height: 28px; border-radius: 50%; border: none; background: #f5f5f7; color: #86868b; cursor: pointer; font-size: 16px; font-weight: 600; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
.expand-btn:hover { background: #e8e8ed; }
.why-panel { padding: 0 14px 12px 50px; font-size: 13px; color: #86868b; line-height: 1.6; animation: fadeIn 0.2s ease; }
.celebration { text-align: center; margin-top: 16px; position: relative; overflow: hidden; padding: 20px; background: #f0fff4; border-radius: 16px; border: 2px solid #34c759; }
.celebrate-text { font-size: 16px; font-weight: 700; color: #34c759; position: relative; z-index: 1; }
.celebrate-enter-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.celebrate-enter-from { opacity: 0; transform: scale(0.9) translateY(10px); }
.confetti-wrap { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; }
.confetti { position: absolute; top: -10px; width: 8px; height: 8px; border-radius: 50%; animation: confettiFall 1.5s ease-out forwards; }
.confetti:nth-child(odd) { background: #34c759; }
.confetti:nth-child(even) { background: #007aff; }
.confetti:nth-child(3n) { background: #ff9500; width: 6px; height: 10px; border-radius: 2px; }
@keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(80px) rotate(360deg); opacity: 0; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-color-scheme: dark) {
  .checklist-wrap { background: linear-gradient(180deg, #1c1c1e 0%, #2c2c2e 100%); }
  .cl-title, .item-text, .ring-text { color: #f5f5f7; }
  .cl-sub, .cat-label, .why-panel { color: #8e8e93; }
  .cl-item { background: #2c2c2e; }
  .cl-item.checked { background: #1c3a1c; }
  .checkbox { border-color: #48484a; }
  .expand-btn { background: #3a3a3c; color: #8e8e93; }
  .reset-btn { background: #2c2c2e; }
  .celebration { background: #1c3a1c; border-color: #34c759; }
  .progress-ring circle:first-child { stroke: #3a3a3c; }
}
@media (max-width: 640px) {
  .checklist-wrap { padding: 16px; }
  .cl-header { flex-wrap: wrap; }
  .ring-area { width: 72px; height: 72px; }
  .progress-ring { width: 72px; height: 72px; }
  .ring-text { font-size: 15px; }
}
</style>
