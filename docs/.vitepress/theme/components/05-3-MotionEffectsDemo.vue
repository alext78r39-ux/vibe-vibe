<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

/* ── Section 1: Stagger List ── */
const movies = ['🎬 星际穿越', '🎬 盗梦空间', '🎬 信条', '🎬 蝙蝠侠', '🎬 奥本海默']
const listPlaying = ref(false)
const listVisible = ref(false)
const listKey = ref(0)

function playList() {
  listVisible.value = false
  listPlaying.value = true
  listKey.value++
  // Small delay to reset DOM before re-triggering
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      listVisible.value = true
    })
  })
  setTimeout(() => { listPlaying.value = false }, movies.length * 120 + 600)
}

/* ── Section 2: Scroll Trigger ── */
const scrollContainer = ref<HTMLElement | null>(null)
const cardVisible = ref<boolean[]>([false, false, false, false])

const scrollCards = [
  { title: '星际穿越', year: '2014', gradient: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
  { title: '盗梦空间', year: '2010', gradient: 'linear-gradient(135deg, #141e30, #243b55)' },
  { title: '信条', year: '2020', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)' },
  { title: '奥本海默', year: '2023', gradient: 'linear-gradient(135deg, #2d1b00, #5c3d1a, #8b6914)' },
]

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const idx = Number(entry.target.getAttribute('data-idx'))
        if (entry.isIntersecting) {
          cardVisible.value = cardVisible.value.map((v, i) => i === idx ? true : v)
        }
      })
    },
    { root: scrollContainer.value, threshold: 0.3 }
  )

  const cards = scrollContainer.value?.querySelectorAll('.me-scroll-card')
  cards?.forEach(card => observer!.observe(card))
})

onUnmounted(() => { observer?.disconnect() })

function resetScroll() {
  cardVisible.value = [false, false, false, false]
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0
  }
  // Re-observe after reset
  setTimeout(() => {
    const cards = scrollContainer.value?.querySelectorAll('.me-scroll-card')
    cards?.forEach(card => observer!.observe(card))
  }, 100)
}
</script>

<template>
  <div class="me-root">
    <!-- Section 1: Stagger List -->
    <div class="me-section">
      <div class="me-section-header">
        <h4 class="me-section-title">列表交错淡入</h4>
        <button class="me-btn" @click="playList" :disabled="listPlaying">
          {{ listPlaying ? '播放中...' : '播放' }}
        </button>
      </div>
      <div class="me-list-demo">
        <div v-if="listVisible" :key="listKey" class="me-list">
          <div
            v-for="(movie, i) in movies"
            :key="i"
            class="me-list-item"
            :style="{ animationDelay: `${i * 120}ms` }"
          >
            {{ movie }}
          </div>
        </div>
        <div v-else class="me-list-placeholder">
          点击「播放」查看效果
        </div>
      </div>
    </div>

    <!-- Section 2: Scroll Trigger -->
    <div class="me-section">
      <div class="me-section-header">
        <h4 class="me-section-title">滚动触发</h4>
        <button class="me-btn me-btn-outline" @click="resetScroll">重置</button>
      </div>
      <div class="me-scroll-hint">向下滚动查看卡片动画</div>
      <div ref="scrollContainer" class="me-scroll-container">
        <div class="me-scroll-spacer">向下滚动 ↓</div>
        <div
          v-for="(card, i) in scrollCards"
          :key="i"
          :data-idx="i"
          :class="['me-scroll-card', { visible: cardVisible[i], 'from-left': i % 2 === 0, 'from-right': i % 2 !== 0 }]"
        >
          <div class="me-card-poster" :style="{ background: card.gradient }">
            <span class="me-card-icon">🎬</span>
          </div>
          <div class="me-card-info">
            <div class="me-card-title">{{ card.title }}</div>
            <div class="me-card-year">{{ card.year }}</div>
          </div>
        </div>
        <div class="me-scroll-spacer-end"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.me-root { margin: 24px 0; max-width: 688px; margin-left: auto; margin-right: auto; }
.me-section {
  margin-bottom: 24px; padding: 20px; border-radius: 12px;
  border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);
}
.me-section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.me-section-title { margin: 0; font-size: 16px; font-weight: 700; color: var(--vp-c-text-1); }
.me-btn {
  padding: 6px 18px; border: none; border-radius: 8px;
  background: #15a051; color: #fff; font-size: 13px;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.me-btn:hover:not(:disabled) { background: #128a44; }
.me-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.me-btn-outline {
  background: transparent; border: 1.5px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}
.me-btn-outline:hover { border-color: var(--vp-c-text-3); }

/* Stagger List */
.me-list-demo {
  min-height: 200px; display: flex; align-items: center; justify-content: center;
  background: var(--vp-c-bg); border-radius: 8px; border: 1px solid var(--vp-c-divider);
  padding: 16px;
}
.me-list { width: 100%; display: flex; flex-direction: column; gap: 8px; }
.me-list-item {
  padding: 12px 16px; border-radius: 8px;
  background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider);
  font-size: 15px; font-weight: 600; color: var(--vp-c-text-1);
  opacity: 0; transform: translateY(16px);
  animation: me-stagger-in 0.45s ease-out forwards;
}
@keyframes me-stagger-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.me-list-placeholder {
  font-size: 14px; color: var(--vp-c-text-3); font-style: italic;
}

/* Scroll Trigger */
.me-scroll-hint {
  font-size: 12px; color: var(--vp-c-text-3); margin-bottom: 8px;
}
.me-scroll-container {
  height: 280px; overflow-y: auto; border-radius: 8px;
  border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg);
  padding: 16px; scroll-behavior: smooth;
}
.me-scroll-spacer {
  height: 120px; display: flex; align-items: center; justify-content: center;
  font-size: 14px; color: var(--vp-c-text-3);
}
.me-scroll-spacer-end { height: 80px; }
.me-scroll-card {
  display: flex; gap: 12px; padding: 12px; margin-bottom: 16px;
  border-radius: 10px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); transition: all 0.5s ease-out;
  opacity: 0;
}
.me-scroll-card.from-left { transform: translateX(-40px); }
.me-scroll-card.from-right { transform: translateX(40px); }
.me-scroll-card.visible {
  opacity: 1; transform: translateX(0);
}
.me-card-poster {
  width: 64px; height: 80px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
}
.me-card-info { display: flex; flex-direction: column; justify-content: center; }
.me-card-title { font-size: 15px; font-weight: 700; color: var(--vp-c-text-1); }
.me-card-year { font-size: 12px; color: var(--vp-c-text-3); margin-top: 4px; }

@media (max-width: 640px) {
  .me-section { padding: 14px; }
  .me-list-item { padding: 10px 12px; font-size: 13px; }
  .me-scroll-container { height: 220px; }
  .me-card-poster { width: 48px; height: 64px; }
}
</style>
