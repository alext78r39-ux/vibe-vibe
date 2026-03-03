<script setup lang="ts">
import { ref, computed } from 'vue'

interface CompareItem { id: number; category: string; bad: string; problem: string; good: string }

const items: CompareItem[] = [
  { id: 1, category: '范围', bad: '做一个待办清单功能，用户可以添加任务、勾选完成。', problem: '没有明确范围，AI可能加一堆不需要的功能', good: 'In-Scope: 添加任务、查看列表、勾选完成、删除任务\nOut-of-Scope: 登录注册、云同步、分类标签' },
  { id: 2, category: '用户', bad: '用户可以添加任务', problem: '没说用户是谁，可能做成团队版', good: '目标用户：我自己（职场人士，每天处理5-10个任务）\n用户场景：早上打开电脑，快速看今天要做什么' },
  { id: 3, category: '边界', bad: '（未提及边缘情况）', problem: '没说边缘情况，快速点击会重复提交', good: '边缘情况：\n- 快速连续点击添加按钮 → 防抖处理\n- 空内容提交 → 禁用按钮\n- 超长文本 → 限制100字符' },
  { id: 4, category: '流程', bad: '（无流程图）', problem: '没有流程图，AI可能理解错业务逻辑', good: '核心业务流程：\n打开页面 → 查看任务列表 → 添加新任务/勾选完成/删除任务' },
  { id: 5, category: '细节', bad: '勾选完成', problem: '没说完成后的视觉效果和数据处理', good: '勾选完成：\n- 视觉：文字添加删除线，透明度降低\n- 数据：标记completed=true，移到列表底部\n- 可撤销：再次点击恢复未完成状态' },
]

const categories = ['全部', '范围', '用户', '边界', '流程', '细节']
const activeCategory = ref('全部')
const viewMode = ref<'side' | 'diff'>('side')
const hoveredId = ref<number | null>(null)

const filtered = computed(() =>
  activeCategory.value === '全部' ? items : items.filter(i => i.category === activeCategory.value)
)
</script>
<!-- PH_T -->

<template>
  <div class="prd-compare">
    <div class="cmp-header">
      <span class="cmp-title">📋 好 PRD vs 坏 PRD</span>
      <div class="view-toggle">
        <button :class="{ active: viewMode === 'side' }" @click="viewMode = 'side'">并排</button>
        <button :class="{ active: viewMode === 'diff' }" @click="viewMode = 'diff'">差异</button>
      </div>
    </div>
    <div class="cat-filter">
      <button v-for="cat in categories" :key="cat" class="cat-btn" :class="{ active: activeCategory === cat }" @click="activeCategory = cat">{{ cat }}</button>
    </div>

    <template v-if="viewMode === 'side'">
      <div class="side-view">
        <div class="side-col bad-col">
          <div class="col-label bad">❌ 坏 PRD</div>
          <div v-for="item in filtered" :key="'b'+item.id" class="cmp-item bad-item" :class="{ hovered: hoveredId === item.id }" @mouseenter="hoveredId = item.id" @mouseleave="hoveredId = null">
            <span class="item-cat">{{ item.category }}</span>
            <p class="item-text">{{ item.bad }}</p>
            <div v-if="hoveredId === item.id" class="problem-tip">💡 {{ item.problem }}</div>
          </div>
        </div>
        <div class="side-col good-col">
          <div class="col-label good">✅ 好 PRD</div>
          <div v-for="item in filtered" :key="'g'+item.id" class="cmp-item good-item" :class="{ highlighted: hoveredId === item.id }">
            <span class="item-cat">{{ item.category }}</span>
            <pre class="item-text pre-text">{{ item.good }}</pre>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="diff-view">
        <div v-for="item in filtered" :key="'d'+item.id" class="diff-item">
          <span class="diff-cat">{{ item.category }}</span>
          <div class="diff-bad"><span class="diff-marker">−</span> {{ item.bad }}</div>
          <div class="diff-problem">💡 {{ item.problem }}</div>
          <pre class="diff-good"><span class="diff-marker">+</span> {{ item.good }}</pre>
        </div>
      </div>
    </template>
  </div>
</template>
<!-- PH_S -->

<style scoped>
.prd-compare { background: linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%); border-radius: 20px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8); font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif; }
.cmp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.cmp-title { font-size: 16px; font-weight: 600; color: #1d1d1f; }
.view-toggle { display: flex; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.view-toggle button { padding: 6px 16px; border: none; background: transparent; font-size: 13px; font-weight: 500; cursor: pointer; color: #86868b; transition: all 0.2s; }
.view-toggle button.active { background: #007aff; color: white; }
.cat-filter { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.cat-btn { padding: 6px 14px; border-radius: 8px; border: none; background: white; font-size: 12px; font-weight: 600; cursor: pointer; color: #86868b; transition: all 0.2s; }
.cat-btn.active { background: #007aff; color: white; }
.cat-btn:hover:not(.active) { background: #e8e8ed; }
.side-view { display: flex; gap: 16px; }
.side-col { flex: 1; min-width: 0; }
.col-label { padding: 10px 16px; border-radius: 12px 12px 0 0; font-size: 14px; font-weight: 600; text-align: center; }
.col-label.bad { background: #fff0f0; color: #ff3b30; }
.col-label.good { background: #f0fff4; color: #34c759; }
.cmp-item { background: white; padding: 14px; border-radius: 0; border-bottom: 1px solid #f0f0f0; transition: all 0.2s; }
.cmp-item:last-child { border-radius: 0 0 12px 12px; border-bottom: none; }
.bad-item { border-left: 3px solid #ff3b30; cursor: pointer; }
.bad-item.hovered { background: #fff5f5; }
.good-item { border-left: 3px solid #34c759; }
.good-item.highlighted { background: #f0fff4; box-shadow: 0 0 0 2px rgba(52,199,89,0.3); }
.item-cat { font-size: 11px; font-weight: 600; color: #86868b; background: #f5f5f7; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-bottom: 6px; }
.item-text { margin: 0; font-size: 13px; color: #1d1d1f; line-height: 1.6; }
.pre-text { white-space: pre-wrap; font-family: inherit; background: transparent; border: none; padding: 0; }
.problem-tip { margin-top: 8px; padding: 8px 10px; background: #fff8e6; border-radius: 8px; font-size: 12px; color: #ff9500; font-weight: 500; animation: fadeIn 0.2s ease; }
.diff-view { display: flex; flex-direction: column; gap: 12px; }
.diff-item { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.diff-cat { font-size: 11px; font-weight: 600; color: #86868b; background: #f5f5f7; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-bottom: 10px; }
.diff-bad { background: #fff0f0; padding: 10px 12px; border-radius: 8px; font-size: 13px; color: #ff3b30; margin-bottom: 6px; }
.diff-problem { font-size: 12px; color: #ff9500; padding: 6px 0; font-weight: 500; }
.diff-good { background: #f0fff4; padding: 10px 12px; border-radius: 8px; font-size: 13px; color: #34c759; margin: 0; white-space: pre-wrap; font-family: inherit; border: none; }
.diff-marker { font-weight: 700; margin-right: 6px; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-color-scheme: dark) {
  .prd-compare { background: linear-gradient(180deg, #1c1c1e 0%, #2c2c2e 100%); }
  .cmp-title { color: #f5f5f7; }
  .cmp-item, .diff-item { background: #2c2c2e; }
  .item-text { color: #f5f5f7; }
  .col-label.bad { background: #3a1c1c; }
  .col-label.good { background: #1c3a1c; }
  .bad-item.hovered { background: #3a1c1c; }
  .good-item.highlighted { background: #1c3a1c; }
  .view-toggle { background: #2c2c2e; }
  .view-toggle button { color: #8e8e93; }
  .cat-btn { background: #2c2c2e; color: #8e8e93; }
  .item-cat, .diff-cat { background: #3a3a3c; }
  .diff-bad { background: #3a1c1c; }
  .diff-good { background: #1c3a1c; }
  .problem-tip { background: #3a2e1c; }
  .cmp-item { border-bottom-color: #3a3a3c; }
}
@media (max-width: 640px) {
  .prd-compare { padding: 16px; }
  .side-view { flex-direction: column; }
}
</style>
