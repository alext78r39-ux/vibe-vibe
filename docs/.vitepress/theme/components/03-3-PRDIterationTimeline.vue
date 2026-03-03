<script setup lang="ts">
import { ref, computed } from 'vue'

interface PRDSection { name: string; filled: boolean; isNew: boolean }
interface Stage { id: number; icon: string; title: string; focus: string; color: string; sections: PRDSection[] }

const stages: Stage[] = [
  { id: 0, icon: '📝', title: '草稿', focus: '为什么做', color: '#007aff', sections: [
    { name: '文档信息', filled: true, isNew: true },
    { name: '项目概述', filled: true, isNew: true },
    { name: '核心问题', filled: true, isNew: true },
    { name: '方案概述', filled: false, isNew: false },
    { name: '细节方案', filled: false, isNew: false },
    { name: '上线计划', filled: false, isNew: false },
  ]},
  { id: 1, icon: '🔍', title: '评审', focus: '做什么', color: '#ff9500', sections: [
    { name: '文档信息', filled: true, isNew: false },
    { name: '项目概述', filled: true, isNew: false },
    { name: '核心问题', filled: true, isNew: false },
    { name: '业务流程', filled: true, isNew: true },
    { name: '功能清单', filled: true, isNew: true },
    { name: '信息架构', filled: true, isNew: true },
    { name: '交互说明', filled: false, isNew: false },
    { name: '上线计划', filled: false, isNew: false },
  ]},
  { id: 2, icon: '✅', title: '定稿', focus: '怎么做', color: '#34c759', sections: [
    { name: '文档信息', filled: true, isNew: false },
    { name: '项目概述', filled: true, isNew: false },
    { name: '核心问题', filled: true, isNew: false },
    { name: '业务流程', filled: true, isNew: false },
    { name: '功能清单', filled: true, isNew: false },
    { name: '信息架构', filled: true, isNew: false },
    { name: '交互说明', filled: true, isNew: true },
    { name: '边缘情况', filled: true, isNew: true },
    { name: '非功能需求', filled: true, isNew: true },
    { name: '上线计划', filled: true, isNew: true },
  ]},
]

const activeStage = ref(0)
const showNewOnly = ref(false)
const currentStage = computed(() => stages[activeStage.value])
const displaySections = computed(() =>
  showNewOnly.value ? currentStage.value.sections.filter(s => s.isNew) : currentStage.value.sections
)
</script>
<!-- PH_T -->

<template>
  <div class="prd-timeline">
    <div class="timeline-bar">
      <div v-for="(stage, i) in stages" :key="stage.id" class="tl-item">
        <div class="tl-node" :class="{ active: activeStage === i }" :style="{ borderColor: stage.color, background: activeStage === i ? stage.color : 'white' }" @click="activeStage = i">
          <span class="tl-icon">{{ stage.icon }}</span>
        </div>
        <div class="tl-label" :class="{ active: activeStage === i }">
          <span class="tl-title">{{ stage.title }}</span>
          <span class="tl-focus">{{ stage.focus }}</span>
        </div>
        <div v-if="i < stages.length - 1" class="tl-line" :class="{ filled: activeStage > i }"></div>
      </div>
    </div>

    <div class="content-panel">
      <div class="panel-tabs">
        <button class="tab-btn" :class="{ active: !showNewOnly }" @click="showNewOnly = false">全部内容</button>
        <button class="tab-btn" :class="{ active: showNewOnly }" @click="showNewOnly = true">新增内容</button>
      </div>
      <div class="sections-grid">
        <div v-for="section in displaySections" :key="section.name" class="section-card" :class="{ filled: section.filled, unfilled: !section.filled }">
          <span class="section-check">{{ section.filled ? '✅' : '⬜' }}</span>
          <span class="section-name">{{ section.name }}</span>
          <span v-if="section.isNew && !showNewOnly" class="new-badge">NEW</span>
        </div>
      </div>
      <div class="stage-stats">
        已完成 {{ currentStage.sections.filter(s => s.filled).length }} / {{ currentStage.sections.length }} 个部分
      </div>
    </div>
  </div>
</template>
<!-- PH_S -->

<style scoped>
.prd-timeline { background: linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%); border-radius: 20px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8); font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif; }
.timeline-bar { display: flex; align-items: flex-start; justify-content: center; margin-bottom: 24px; padding: 0 20px; }
.tl-item { display: flex; flex-direction: column; align-items: center; position: relative; flex: 0 0 auto; }
.tl-node { width: 56px; height: 56px; border-radius: 50%; border: 3px solid #d1d1d6; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; background: white; z-index: 1; }
.tl-node:hover { transform: scale(1.1); }
.tl-node.active { box-shadow: 0 0 0 6px rgba(0,122,255,0.15); }
.tl-icon { font-size: 24px; }
.tl-node.active .tl-icon { filter: brightness(0) invert(1); }
.tl-label { text-align: center; margin-top: 10px; }
.tl-title { display: block; font-size: 14px; font-weight: 600; color: #1d1d1f; }
.tl-focus { display: block; font-size: 12px; color: #86868b; margin-top: 2px; }
.tl-label.active .tl-title { color: #007aff; }
.tl-line { width: 80px; height: 3px; background: #d1d1d6; position: absolute; top: 28px; left: calc(50% + 32px); z-index: 0; transition: background 0.3s; }
.tl-line.filled { background: #34c759; }
.content-panel { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.panel-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.tab-btn { padding: 8px 16px; border-radius: 10px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; background: #f5f5f7; color: #86868b; }
.tab-btn.active { background: #007aff; color: white; }
.sections-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; margin-bottom: 16px; }
.section-card { display: flex; align-items: center; gap: 8px; padding: 12px; border-radius: 10px; font-size: 13px; font-weight: 500; transition: all 0.2s; animation: fadeIn 0.3s ease; }
.section-card.filled { background: #f0fff4; border: 1px solid #34c759; color: #1d1d1f; }
.section-card.unfilled { background: transparent; border: 2px dashed #d1d1d6; color: #86868b; }
.section-check { font-size: 14px; }
.section-name { flex: 1; }
.new-badge { font-size: 10px; background: #ff9500; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
.stage-stats { font-size: 13px; color: #86868b; text-align: center; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-color-scheme: dark) {
  .prd-timeline { background: linear-gradient(180deg, #1c1c1e 0%, #2c2c2e 100%); }
  .content-panel { background: #2c2c2e; }
  .tl-node { background: #2c2c2e; border-color: #48484a; }
  .tl-title { color: #f5f5f7; }
  .tl-focus, .stage-stats { color: #8e8e93; }
  .section-card.filled { background: #1c3a1c; color: #f5f5f7; }
  .section-card.unfilled { border-color: #48484a; color: #8e8e93; }
  .tab-btn { background: #3a3a3c; color: #8e8e93; }
  .tab-btn.active { background: #007aff; color: white; }
  .tl-line { background: #48484a; }
}
@media (max-width: 640px) {
  .prd-timeline { padding: 16px; }
  .tl-line { width: 40px; }
  .tl-node { width: 48px; height: 48px; }
  .tl-icon { font-size: 20px; }
  .sections-grid { grid-template-columns: 1fr 1fr; }
}
</style>
