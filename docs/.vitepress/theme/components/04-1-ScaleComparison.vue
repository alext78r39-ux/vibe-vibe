<script setup lang="ts">
interface ScaleCard {
  title: string
  icon: string
  stack: string[]
  features: string[]
  color: string
  recommended?: boolean
}

const cards: ScaleCard[] = [
  {
    title: '初创/个人项目',
    icon: '🚀',
    stack: ['Next.js', 'Supabase', 'Vercel'],
    features: ['快速上线', '低成本', '一人全栈'],
    color: '#34c759',
    recommended: true,
  },
  {
    title: '中型团队',
    icon: '👥',
    stack: ['Next.js', 'PostgreSQL', 'AWS/自建'],
    features: ['可扩展', '团队协作', '定制化'],
    color: '#007aff',
  },
  {
    title: '大型企业',
    icon: '🏢',
    stack: ['微服务', 'K8s', '多语言'],
    features: ['高可用', '独立部署', '专业团队'],
    color: '#ff9500',
  },
]
</script>

<template>
  <div class="sc-root">
    <div class="sc-grid">
      <div
        v-for="card in cards"
        :key="card.title"
        :class="['sc-card', { recommended: card.recommended }]"
        :style="{ borderColor: card.color }"
      >
        <div v-if="card.recommended" class="sc-badge" :style="{ background: card.color }">
          推荐起步方案
        </div>
        <div class="sc-icon">{{ card.icon }}</div>
        <div class="sc-title">{{ card.title }}</div>
        <div class="sc-stack">
          <span v-for="s in card.stack" :key="s" class="sc-stack-tag">{{ s }}</span>
        </div>
        <div class="sc-features">
          <span
            v-for="f in card.features"
            :key="f"
            class="sc-feature"
            :style="{ background: card.color + '18', color: card.color }"
          >
            {{ f }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sc-root { margin: 24px 0; max-width: 688px; margin-left: auto; margin-right: auto; }
.sc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.sc-card {
  position: relative; padding: 20px 16px; border-radius: 12px;
  border: 2px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);
  text-align: center; transition: all 0.2s;
}
.sc-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.sc-card.recommended { background: var(--vp-c-bg); }
:global(html.dark) .sc-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
.sc-badge {
  position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
  padding: 2px 12px; border-radius: 999px; font-size: 11px; font-weight: 700;
  color: #fff; white-space: nowrap;
}
.sc-icon { font-size: 32px; margin-bottom: 8px; margin-top: 6px; }
.sc-title { font-size: 14px; font-weight: 700; color: var(--vp-c-text-1); margin-bottom: 10px; }
.sc-stack { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; margin-bottom: 12px; }
.sc-stack-tag {
  padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;
  background: var(--vp-c-default-soft); color: var(--vp-c-text-2);
}
.sc-features { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; }
.sc-feature {
  padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600;
}
@media (max-width: 640px) {
  .sc-grid { grid-template-columns: 1fr; max-width: 320px; margin: 0 auto; }
}
</style>
