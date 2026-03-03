<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref<'structure' | 'pagination'>('structure')

// ─── Tab 1: Data Structure Comparison ───
const nestedJson = `{
  "id": 1,
  "title": "星际穿越",
  "director": {
    "id": 5,
    "name": "诺兰"
  }
}`

const flatJson = `{
  "id": 1,
  "title": "星际穿越",
  "director_id": 5
}
// 需要再请求 /api/directors/5`

// ─── Tab 2: Pagination Comparison ───
interface PaginationMethod {
  name: string
  param: string
  desc: string
  pros: string[]
  cons: string[]
  color: string
}

const paginations: PaginationMethod[] = [
  {
    name: 'Offset 分页',
    param: '?page=3&limit=10',
    desc: '跳到第 30 条开始取 10 条',
    pros: ['简单直观', '可跳页'],
    cons: ['数据变动时可能重复/遗漏'],
    color: '#2eb3df',
  },
  {
    name: 'Cursor 分页',
    param: '?cursor=abc123&limit=10',
    desc: '从这个标记往后取 10 条',
    pros: ['数据一致性好', '性能稳定'],
    cons: ['不能跳页'],
    color: '#15a051',
  },
]
</script>

<template>
  <div class="ae-container">
    <div class="ae-tab-bar">
      <button
        :class="['ae-tab', { active: activeTab === 'structure' }]"
        @click="activeTab = 'structure'"
      >数据结构对比</button>
      <button
        :class="['ae-tab', { active: activeTab === 'pagination' }]"
        @click="activeTab = 'pagination'"
      >分页对比</button>
    </div>

    <!-- Tab 1: Structure Comparison -->
    <div v-if="activeTab === 'structure'" class="ae-body">
      <p class="ae-intro">同一份数据，两种返回方式。嵌套结构一次拿全，扁平结构需要二次请求。</p>
      <div class="ae-compare">
        <div class="ae-card ae-card-nested">
          <div class="ae-card-header">
            <span class="ae-badge" style="background: #9333ea">嵌套结构</span>
            <span class="ae-hint">一次请求，数据完整</span>
          </div>
          <pre class="ae-code"><span class="ae-line">{{'{'}}</span>
<span class="ae-line">  "id": 1,</span>
<span class="ae-line">  "title": "星际穿越",</span>
<span class="ae-line ae-highlight-nested">  "director": {{'{'}}</span>
<span class="ae-line ae-highlight-nested">    "id": 5,</span>
<span class="ae-line ae-highlight-nested">    "name": "诺兰"</span>
<span class="ae-line ae-highlight-nested">  {{'}'}}</span>
<span class="ae-line">{{'}'}} </span></pre>
        </div>
        <div class="ae-card ae-card-flat">
          <div class="ae-card-header">
            <span class="ae-badge" style="background: #2eb3df">扁平结构</span>
            <span class="ae-hint">轻量返回，按需获取</span>
          </div>
          <pre class="ae-code"><span class="ae-line">{{'{'}}</span>
<span class="ae-line">  "id": 1,</span>
<span class="ae-line">  "title": "星际穿越",</span>
<span class="ae-line ae-highlight-flat">  "director_id": 5</span>
<span class="ae-line">{{'}'}} </span>
<span class="ae-line ae-comment">// 需要再请求 /api/directors/5</span></pre>
        </div>
      </div>
      <div class="ae-summary">
        <div class="ae-summary-item">
          <span class="ae-dot" style="background: #9333ea"></span>
          <span>嵌套：减少请求次数，但响应体更大。适合数据量小、关联紧密的场景。</span>
        </div>
        <div class="ae-summary-item">
          <span class="ae-dot" style="background: #2eb3df"></span>
          <span>扁平：响应轻量，客户端按需拼装。适合列表页、移动端等带宽敏感场景。</span>
        </div>
      </div>
    </div>

    <!-- Tab 2: Pagination Comparison -->
    <div v-if="activeTab === 'pagination'" class="ae-body">
      <p class="ae-intro">两种主流分页策略，各有取舍。</p>
      <div class="ae-page-cards">
        <div
          v-for="p in paginations" :key="p.name"
          class="ae-page-card"
          :style="{ '--pc-color': p.color }"
        >
          <div class="ae-page-name">{{ p.name }}</div>
          <code class="ae-page-param">{{ p.param }}</code>
          <div class="ae-page-arrow">↓</div>
          <div class="ae-page-desc">{{ p.desc }}</div>
          <div class="ae-page-list">
            <div class="ae-page-section">
              <span class="ae-page-label ae-page-pro">优点</span>
              <ul>
                <li v-for="pro in p.pros" :key="pro">{{ pro }}</li>
              </ul>
            </div>
            <div class="ae-page-section">
              <span class="ae-page-label ae-page-con">缺点</span>
              <ul>
                <li v-for="con in p.cons" :key="con">{{ con }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ae-container {
  margin: 1.5rem 0;
  max-width: 688px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

/* ─── Tab Bar ─── */
.ae-tab-bar {
  display: flex;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.ae-tab {
  flex: 1;
  padding: 12px 8px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: all .2s;
  border-bottom: 2px solid transparent;
}
.ae-tab.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
}
.ae-tab:hover:not(.active) { background: var(--vp-c-bg-mute); }

/* ─── Body ─── */
.ae-body { padding: 20px; }
.ae-intro { color: var(--vp-c-text-2); font-size: 13px; margin: 0 0 16px; }

/* ─── Structure Compare ─── */
.ae-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}
.ae-card {
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg);
}
.ae-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}
.ae-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
}
.ae-hint {
  font-size: 11px;
  color: var(--vp-c-text-3);
}
.ae-code {
  padding: 12px;
  margin: 0;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  line-height: 1.6;
  color: var(--vp-c-text-1);
  overflow-x: auto;
  white-space: pre;
}
.ae-line { display: block; }
.ae-highlight-nested {
  background: #9333ea18;
  border-left: 2px solid #9333ea;
  padding-left: 6px;
  margin-left: -8px;
}
.ae-highlight-flat {
  background: #2eb3df18;
  border-left: 2px solid #2eb3df;
  padding-left: 6px;
  margin-left: -8px;
}
.ae-comment { color: var(--vp-c-text-3); font-style: italic; }

/* ─── Summary ─── */
.ae-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ae-summary-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.ae-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

/* ─── Pagination Cards ─── */
.ae-page-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.ae-page-card {
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 16px;
  background: var(--vp-c-bg);
  transition: border-color .2s;
  border-top: 3px solid var(--pc-color);
}
.ae-page-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}
.ae-page-param {
  display: inline-block;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--pc-color);
  font-weight: 600;
}
.ae-page-arrow {
  text-align: center;
  font-size: 16px;
  color: var(--vp-c-text-3);
  margin: 6px 0;
}
.ae-page-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
  padding: 8px 10px;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  margin-bottom: 12px;
  text-align: center;
}
.ae-page-list { display: flex; flex-direction: column; gap: 8px; }
.ae-page-section ul {
  margin: 4px 0 0;
  padding-left: 18px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}
.ae-page-label {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
}
.ae-page-pro { background: #15a05118; color: #15a051; }
.ae-page-con { background: #ef444418; color: #ef4444; }

/* ─── Dark Mode ─── */
:global(html.dark) .ae-code { background: #1a1a2e; }
:global(html.dark) .ae-highlight-nested { background: #9333ea25; }
:global(html.dark) .ae-highlight-flat { background: #2eb3df25; }

/* ─── Responsive ─── */
@media (max-width: 640px) {
  .ae-compare { grid-template-columns: 1fr; }
  .ae-page-cards { grid-template-columns: 1fr; }
  .ae-tab { font-size: 12px; padding: 10px 4px; }
  .ae-code { font-size: 11px; padding: 8px; }
}
</style>
