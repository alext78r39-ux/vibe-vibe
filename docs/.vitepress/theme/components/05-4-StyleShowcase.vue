<script setup lang="ts">
import { ref, computed } from 'vue'

interface Style {
  id: string
  name: string
  nameEn: string
  features: string[]
  scenes: string[]
  prompt: string
  demoClass: string
}

const styles: Style[] = [
  {
    id: 'glass', name: '玻璃拟态', nameEn: 'Glassmorphism',
    features: ['半透明', '模糊背景', '微妙边框', '轻盈感'],
    scenes: ['社交应用', '音乐播放器', '天气应用'],
    prompt: '用玻璃拟态风格设计这个卡片，半透明白色背景，backdrop-blur 模糊效果，细微的白色边框',
    demoClass: 'demo-glass'
  },
  {
    id: 'neu', name: '新拟态', nameEn: 'Neumorphism',
    features: ['柔和凸起', '同色系阴影', '内凹效果', '触感设计'],
    scenes: ['计算器', '控制面板', '设置页面'],
    prompt: '用新拟态风格设计这个按钮，浅灰色背景，用 box-shadow 做出凸起效果',
    demoClass: 'demo-neu'
  },
  {
    id: 'brutal', name: '新粗野主义', nameEn: 'Neo-Brutalism',
    features: ['粗边框', '鲜艳色块', '无圆角', '有态度'],
    scenes: ['个人网站', '创意项目', '独立品牌'],
    prompt: '黑色粗边框（3px），鲜艳的色块背景，无圆角，字体加粗',
    demoClass: 'demo-brutal'
  },
  {
    id: 'bento', name: 'Bento 布局', nameEn: 'Bento Grid',
    features: ['网格布局', '大小不一', '圆角卡片', '信息密度'],
    scenes: ['功能展示', '产品首页', 'Dashboard'],
    prompt: '用 Bento Grid 布局展示产品功能，不同大小的卡片，圆角，微妙的阴影',
    demoClass: 'demo-bento'
  },
  {
    id: 'minimal', name: '极简主义', nameEn: 'Minimalism',
    features: ['大量留白', '少量元素', '克制配色', '字体层次'],
    scenes: ['博客', '作品集', '品牌官网'],
    prompt: '大量留白，只用黑白灰三色，字体用 Inter，重点内容用加粗区分',
    demoClass: 'demo-minimal'
  },
]

const activeId = ref('glass')
const copiedId = ref<string | null>(null)

const activeStyle = computed(() => styles.find(s => s.id === activeId.value)!)

function copyText(text: string, id: string) {
  navigator.clipboard.writeText(text)
  copiedId.value = id
  setTimeout(() => { copiedId.value = null }, 1500)
}
</script>

<template>
  <div class="ss-root">
    <div class="ss-tabs">
      <button v-for="s in styles" :key="s.id"
        :class="['ss-tab', { active: activeId === s.id }]"
        @click="activeId = s.id">
        {{ s.name }}
      </button>
    </div>

    <div class="ss-layout">
      <div class="ss-demo" :class="activeStyle.demoClass">
        <div v-if="activeId === 'glass'" class="glass-demo">
          <div class="glass-bg">🎨🌈✨🎭</div>
          <div class="glass-card">
            <div class="glass-title">玻璃拟态卡片</div>
            <div class="glass-text">半透明 + 模糊背景</div>
          </div>
        </div>
        <div v-if="activeId === 'neu'" class="neu-demo">
          <div class="neu-card">
            <div class="neu-btn">按钮</div>
            <div class="neu-btn neu-inset">凹陷</div>
          </div>
        </div>
        <div v-if="activeId === 'brutal'" class="brutal-demo">
          <div class="brutal-card">
            <div class="brutal-title">BOLD</div>
            <div class="brutal-btn">点击我</div>
          </div>
        </div>
        <div v-if="activeId === 'bento'" class="bento-demo">
          <div class="bento-grid">
            <div class="bento-item bento-lg">功能 A</div>
            <div class="bento-item">功能 B</div>
            <div class="bento-item">功能 C</div>
            <div class="bento-item bento-wide">功能 D</div>
          </div>
        </div>
        <div v-if="activeId === 'minimal'" class="minimal-demo">
          <div class="minimal-card">
            <div class="minimal-title">Less is More</div>
            <div class="minimal-text">简约而不简单</div>
            <div class="minimal-line"></div>
          </div>
        </div>
      </div>

      <div class="ss-info">
        <div class="ss-info-header">
          <h3>{{ activeStyle.name }}</h3>
          <span class="ss-name-en">{{ activeStyle.nameEn }}</span>
        </div>

        <div class="ss-tags">
          <span v-for="f in activeStyle.features" :key="f" class="ss-tag">{{ f }}</span>
        </div>

        <div class="ss-scenes">
          <span class="ss-scenes-label">适合场景：</span>
          <span v-for="sc in activeStyle.scenes" :key="sc" class="ss-scene">{{ sc }}</span>
        </div>

        <div class="ss-prompt-box">
          <div class="ss-prompt-top">
            <span>📋 提示词</span>
            <button class="ss-copy" @click="copyText(activeStyle.prompt, activeStyle.id)">
              {{ copiedId === activeStyle.id ? '✓ 已复制' : '复制' }}
            </button>
          </div>
          <div class="ss-prompt-text">{{ activeStyle.prompt }}</div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.ss-root { margin: 24px 0; }
.ss-tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.ss-tab {
  padding: 6px 16px; border-radius: 999px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); font-size: 13px;
  cursor: pointer; transition: all 0.2s;
}
.ss-tab.active { background: #15a051; color: #fff; border-color: #15a051; }
.ss-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.ss-demo {
  min-height: 220px; border-radius: 12px; border: 1px solid var(--vp-c-divider);
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  background: var(--vp-c-bg-soft); position: relative;
}
.ss-info {
  display: flex; flex-direction: column; gap: 12px;
  padding: 16px; border-radius: 12px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.ss-info-header h3 { margin: 0; font-size: 18px; color: var(--vp-c-text-1); display: inline; }
.ss-name-en { font-size: 13px; color: var(--vp-c-text-3); margin-left: 8px; }
.ss-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.ss-tag {
  padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
  background: rgba(21, 160, 81, 0.1); color: #15a051;
}
.ss-scenes { font-size: 13px; color: var(--vp-c-text-2); }
.ss-scenes-label { color: var(--vp-c-text-3); }
.ss-scene { margin-left: 6px; }
.ss-scene::before { content: '·'; margin-right: 6px; color: var(--vp-c-text-3); }
.ss-prompt-box {
  background: var(--vp-c-bg); border-radius: 8px; padding: 12px;
  border: 1px solid var(--vp-c-divider);
}
.ss-prompt-top {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 12px; color: var(--vp-c-text-3); margin-bottom: 8px;
}
.ss-copy {
  padding: 2px 10px; border-radius: 6px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); font-size: 12px; cursor: pointer;
  color: var(--vp-c-text-2); transition: all 0.2s;
}
.ss-copy:hover { border-color: #15a051; color: #15a051; }
.ss-prompt-text { font-size: 14px; color: var(--vp-c-text-1); line-height: 1.6; }

/* Glass demo */
.glass-demo { width: 100%; height: 100%; position: relative; background: linear-gradient(135deg, #15a051, #2eb3df); display: flex; align-items: center; justify-content: center; }
.glass-bg { position: absolute; inset: 0; font-size: 48px; display: flex; align-items: center; justify-content: center; gap: 8px; opacity: 0.4; }
.glass-card {
  position: relative; padding: 24px 32px; border-radius: 16px;
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);
  text-align: center;
}
.glass-title { font-size: 16px; font-weight: 700; color: #fff; }
.glass-text { font-size: 13px; color: rgba(255,255,255,0.8); margin-top: 4px; }

/* Neumorphism demo */
.neu-demo { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #e0e5ec; }
.neu-card { display: flex; gap: 16px; }
.neu-btn {
  padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px;
  background: #e0e5ec; color: #6b7280;
  box-shadow: 6px 6px 12px #b8bec7, -6px -6px 12px #ffffff;
}
.neu-inset { box-shadow: inset 4px 4px 8px #b8bec7, inset -4px -4px 8px #ffffff; }

/* Brutalism demo */
.brutal-demo { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #ffe156; }
.brutal-card { text-align: center; }
.brutal-title { font-size: 32px; font-weight: 900; color: #000; letter-spacing: -1px; }
.brutal-btn {
  margin-top: 12px; padding: 10px 28px; background: #ff6b6b; color: #000;
  border: 3px solid #000; font-weight: 800; font-size: 14px; cursor: pointer;
}

/* Bento demo */
.bento-demo { width: 100%; padding: 16px; }
.bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.bento-item {
  padding: 16px; border-radius: 12px; background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider); font-size: 13px; font-weight: 600;
  color: var(--vp-c-text-1); text-align: center;
}
.bento-lg { grid-row: span 2; display: flex; align-items: center; justify-content: center; }
.bento-wide { grid-column: span 2; }

/* Minimal demo */
.minimal-demo { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #fafafa; }
.minimal-card { text-align: center; padding: 32px; }
.minimal-title { font-size: 24px; font-weight: 300; color: #111; letter-spacing: 2px; }
.minimal-text { font-size: 13px; color: #999; margin-top: 8px; }
.minimal-line { width: 40px; height: 1px; background: #ddd; margin: 16px auto 0; }

@media (max-width: 640px) {
  .ss-layout { grid-template-columns: 1fr; }
}
</style>
