<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Layer {
  id: string
  name: string
  icon: string
  color: string
  bgColor: string
  technologies: { name: string; icon: string; desc: string }[]
  responsibilities: string[]
}

const layers: Layer[] = [
  {
    id: 'user',
    name: '用户层',
    icon: '👤',
    color: '#ff9500',
    bgColor: 'rgba(255, 149, 0, 0.1)',
    technologies: [
      { name: 'Chrome', icon: '🌐', desc: '浏览器' },
      { name: 'iOS/Android', icon: '📱', desc: '移动端' },
      { name: 'Desktop', icon: '💻', desc: '桌面端' }
    ],
    responsibilities: ['发起请求', '交互操作', '查看结果']
  },
  {
    id: 'frontend',
    name: '前端层',
    icon: '🎨',
    color: '#007aff',
    bgColor: 'rgba(0, 122, 255, 0.1)',
    technologies: [
      { name: 'React', icon: '⚛️', desc: 'UI库' },
      { name: 'TypeScript', icon: '📘', desc: '类型安全' },
      { name: 'Tailwind', icon: '🎭', desc: 'CSS框架' },
      { name: 'shadcn/ui', icon: '🧩', desc: '组件库' }
    ],
    responsibilities: ['页面渲染', '用户交互', '状态管理', 'API调用']
  },
  {
    id: 'backend',
    name: '后端层',
    icon: '⚙️',
    color: '#5856d6',
    bgColor: 'rgba(88, 86, 214, 0.1)',
    technologies: [
      { name: 'Next.js', icon: '▲', desc: '全栈框架' },
      { name: 'Node.js', icon: '🟢', desc: '运行时' },
      { name: 'better-auth', icon: '🔐', desc: '认证库' },
      { name: 'AI SDK', icon: '🤖', desc: 'AI集成' }
    ],
    responsibilities: ['业务逻辑', '身份认证', '数据处理', 'API设计']
  },
  {
    id: 'database',
    name: '数据层',
    icon: '💾',
    color: '#34c759',
    bgColor: 'rgba(52, 199, 89, 0.1)',
    technologies: [
      { name: 'PostgreSQL', icon: '🐘', desc: '关系数据库' },
      { name: 'Drizzle', icon: '🌧️', desc: 'ORM' },
      { name: 'Redis', icon: '🔴', desc: '缓存' },
      { name: 'Supabase', icon: '⚡', desc: '托管服务' }
    ],
    responsibilities: ['数据持久化', '查询优化', '事务管理', '备份恢复']
  },
  {
    id: 'infra',
    name: '基础设施',
    icon: '🏗️',
    color: '#af52de',
    bgColor: 'rgba(175, 82, 222, 0.1)',
    technologies: [
      { name: 'Vercel', icon: '▲', desc: '部署平台' },
      { name: 'Docker', icon: '🐳', desc: '容器化' },
      { name: 'Nginx', icon: '🌊', desc: '反向代理' },
      { name: 'GitHub', icon: '🐙', desc: 'CI/CD' }
    ],
    responsibilities: ['部署托管', '负载均衡', '安全防护', '监控日志']
  }
]

const connections = [
  { from: 0, to: 1, label: 'HTTP/HTTPS', color: '#ff9500', packets: [] as number[] },
  { from: 1, to: 2, label: 'API请求', color: '#007aff', packets: [] as number[] },
  { from: 2, to: 3, label: 'SQL/ORM', color: '#5856d6', packets: [] as number[] },
  { from: 2, to: 4, label: '部署', color: '#34c759', packets: [] as number[] },
  { from: 1, to: 4, label: 'CDN', color: '#af52de', packets: [] as number[] }
]

const selectedLayer = ref<number | null>(null)
const isAnimating = ref(false)
const animationSpeed = ref(1)
const showDetailPanel = ref(false)
const hoveredTech = ref<string | null>(null)

// 数据包动画
const packetPositions = ref<number[][]>(connections.map(() => []))
let animationFrame: number | null = null
let lastTime = 0

function startAnimation() {
  if (isAnimating.value) return
  isAnimating.value = true
  lastTime = performance.now()
  animate()
}

function stopAnimation() {
  isAnimating.value = false
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
  packetPositions.value = connections.map(() => [])
}

function animate(currentTime = performance.now()) {
  if (!isAnimating.value) return

  const deltaTime = (currentTime - lastTime) / 1000
  lastTime = currentTime

  packetPositions.value = packetPositions.value.map((packets, idx) => {
    // 添加新数据包
    if (Math.random() < 0.02 * animationSpeed.value) {
      packets.push(0)
    }

    // 更新位置
    return packets
      .map(p => p + deltaTime * 0.5 * animationSpeed.value)
      .filter(p => p < 1.2)
  })

  animationFrame = requestAnimationFrame(animate)
}

function selectLayer(index: number) {
  selectedLayer.value = selectedLayer.value === index ? null : index
  showDetailPanel.value = selectedLayer.value !== null
}

function getPacketStyle(connIndex: number, packetPos: number) {
  const conn = connections[connIndex]
  const fromLayer = conn.from
  const toLayer = conn.to

  // 垂直布局的连线位置
  const layerHeight = 110
  const gap = 20
  const startY = fromLayer * (layerHeight + gap) + layerHeight / 2
  const endY = toLayer * (layerHeight + gap) + layerHeight / 2
  const currentY = startY + (endY - startY) * packetPos

  return {
    top: `${currentY}px`,
    left: '50%',
    transform: 'translateX(-50%)',
    opacity: packetPos > 1 ? 1 - (packetPos - 1) * 5 : 1
  }
}

const currentLayer = computed(() =>
  selectedLayer.value !== null ? layers[selectedLayer.value] : null
)

onMounted(() => {
  startAnimation()
})

onUnmounted(() => {
  stopAnimation()
})
</script>

<template>
  <div class="tech-stack-architecture">
    <!-- 顶部控制栏 -->
    <div class="control-bar">
      <div class="control-group">
        <button
          class="control-btn"
          :class="{ active: isAnimating }"
          @click="isAnimating ? stopAnimation() : startAnimation()"
        >
          <span class="btn-icon">{{ isAnimating ? '⏸' : '▶' }}</span>
          <span>{{ isAnimating ? '暂停' : '播放' }}</span>
        </button>
      </div>

      <div class="control-group speed-control">
        <span>速度:</span>
        <input
          v-model.number="animationSpeed"
          type="range"
          min="0.5"
          max="3"
          step="0.5"
          class="speed-slider"
        >
        <span class="speed-value">{{ animationSpeed }}x</span>
      </div>
    </div>

    <!-- 主架构图 -->
    <div class="architecture-wrapper">
      <!-- 左侧层级 -->
      <div class="layers-container">
        <div
          v-for="(layer, index) in layers"
          :key="layer.id"
          class="layer-block"
          :class="{
            selected: selectedLayer === index,
            dimmed: selectedLayer !== null && selectedLayer !== index
          }"
          :style="{ '--layer-color': layer.color, '--layer-bg': layer.bgColor }"
          @click="selectLayer(index)"
        >
          <!-- 层标题 -->
          <div class="layer-header">
            <div class="layer-icon-wrapper" :style="{ background: layer.color }">
              <span class="layer-icon">{{ layer.icon }}</span>
            </div>
            <div class="layer-title-group">
              <h4 class="layer-name">{{ layer.name }}</h4>
              <span class="layer-number">Layer {{ index + 1 }}</span>
            </div>
          </div>

          <!-- 技术标签 -->
          <div class="tech-tags">
            <span
              v-for="tech in layer.technologies"
              :key="tech.name"
              class="tech-tag"
              :class="{ hovered: hoveredTech === tech.name }"
              @mouseenter="hoveredTech = tech.name"
              @mouseleave="hoveredTech = null"
            >
              <span class="tag-icon">{{ tech.icon }}</span>
              <span class="tag-name">{{ tech.name }}</span>
            </span>
          </div>

          <!-- 连接点 -->
          <div class="connection-dots">
            <div v-if="index > 0" class="dot input-dot" :style="{ background: layer.color }"></div>
            <div v-if="index < layers.length - 1" class="dot output-dot" :style="{ background: layer.color }"></div>
          </div>
        </div>

        <!-- 数据包动画层 -->
        <div class="packets-overlay">
          <div
            v-for="(conn, connIdx) in connections"
            :key="connIdx"
            class="connection-line"
            :style="{
              top: `${conn.from * 130 + 55}px`,
              height: `${(conn.to - conn.from) * 130}px`,
              borderColor: conn.color
            }"
          >
            <div
              v-for="(pos, idx) in packetPositions[connIdx]"
              :key="idx"
              class="data-packet"
              :style="{
                ...getPacketStyle(connIdx, pos),
                background: conn.color
              }"
            >
              <span class="packet-icon">📦</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧详情面板 -->
      <div v-if="showDetailPanel && currentLayer" class="detail-panel" :style="{ borderColor: currentLayer.color }">
        <div class="panel-header" :style="{ background: currentLayer.bgColor }">
          <span class="panel-icon" :style="{ background: currentLayer.color }">{{ currentLayer.icon }}</span>
          <div>
            <h3 :style="{ color: currentLayer.color }">{{ currentLayer.name }}</h3>
            <p>技术栈详情</p>
          </div>
        </div>

        <div class="panel-content">
          <div class="section">
            <h4>🛠️ 核心技术</h4>
            <div class="tech-grid">
              <div
                v-for="tech in currentLayer.technologies"
                :key="tech.name"
                class="tech-card"
              >
                <span class="card-icon">{{ tech.icon }}</span>
                <span class="card-name">{{ tech.name }}</span>
                <span class="card-desc">{{ tech.desc }}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h4>📋 主要职责</h4>
            <ul class="responsibility-list">
              <li v-for="resp in currentLayer.responsibilities" :key="resp">
                <span class="check-icon">✓</span>
                {{ resp }}
              </li>
            </ul>
          </div>

          <div class="section">
            <h4>🔗 连接关系</h4>
            <div class="connection-info">
              <div
                v-for="conn in connections.filter(c => c.from === selectedLayer || c.to === selectedLayer)"
                :key="`${conn.from}-${conn.to}`"
                class="conn-item"
              >
                <span v-if="conn.from === selectedLayer" class="conn-flow">
                  输出 → <strong>{{ layers[conn.to].name }}</strong>
                  <span class="conn-label" :style="{ color: conn.color }">{{ conn.label }}</span>
                </span>
                <span v-else class="conn-flow">
                  ← 输入 <strong>{{ layers[conn.from].name }}</strong>
                  <span class="conn-label" :style="{ color: conn.color }">{{ conn.label }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div v-else class="empty-panel">
        <div class="empty-content">
          <span class="empty-icon">🏗️</span>
          <p>点击左侧层级查看详情</p>
          <p class="empty-hint">或观看数据包流动动画</p>
        </div>
      </div>
    </div>

    <!-- 底部图例 -->
    <div class="legend-bar">
      <div class="legend-title">📊 本教程技术栈</div>
      <div class="legend-flow">
        <div class="legend-item" v-for="(layer, idx) in layers.slice(1, 5)" :key="layer.id">
          <span class="legend-dot" :style="{ background: layer.color }"></span>
          <span class="legend-name">{{ layer.name.replace('层', '') }}</span>
          <span v-if="idx < 3" class="legend-arrow">→</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tech-stack-architecture {
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
  border-radius: 20px;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

/* 控制栏 */
.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f5f5f7;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #e8e8ed;
}

.control-btn.active {
  background: #007aff;
  color: white;
}

.btn-icon {
  font-size: 12px;
}

.speed-control {
  font-size: 13px;
  color: #8e8e93;
}

.speed-slider {
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #e8e8ed;
  border-radius: 2px;
  outline: none;
}

.speed-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #007aff;
  border-radius: 50%;
  cursor: pointer;
}

.speed-value {
  min-width: 36px;
  font-weight: 500;
  color: #1d1d1f;
}

/* 主架构 */
.architecture-wrapper {
  display: flex;
  gap: 20px;
  min-height: 600px;
}

/* 左侧层级 */
.layers-container {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.layer-block {
  background: white;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 2;
}

.layer-block:hover {
  transform: translateX(8px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.layer-block.selected {
  border-color: var(--layer-color);
  box-shadow: 0 0 0 4px var(--layer-bg), 0 8px 32px rgba(0, 0, 0, 0.12);
  transform: translateX(12px) scale(1.02);
}

.layer-block.dimmed {
  opacity: 0.4;
  transform: scale(0.98);
}

.layer-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.layer-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.layer-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.layer-name {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.layer-number {
  font-size: 12px;
  color: #8e8e93;
  font-weight: 500;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f5f5f7;
  border-radius: 8px;
  font-size: 13px;
  transition: all 0.2s ease;
}

.tech-tag:hover,
.tech-tag.hovered {
  background: var(--layer-bg);
  transform: translateY(-2px);
}

.tag-icon {
  font-size: 16px;
}

.tag-name {
  font-weight: 500;
  color: #1d1d1f;
}

.connection-dots {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 数据包动画层 */
.packets-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.connection-line {
  position: absolute;
  left: 50%;
  width: 2px;
  border-left: 2px dashed;
  opacity: 0.3;
}

.data-packet {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.1); }
}

.packet-icon {
  font-size: 14px;
}

/* 右侧详情面板 */
.detail-panel {
  width: 380px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border-left: 4px solid;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.panel-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.panel-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.panel-header h3 {
  margin: 0 0 4px 0;
  font-size: 20px;
}

.panel-header p {
  margin: 0;
  font-size: 13px;
  color: #8e8e93;
}

.panel-content {
  padding: 20px;
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #1d1d1f;
  font-weight: 600;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.tech-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 12px;
  background: #f5f5f7;
  border-radius: 12px;
  text-align: center;
  transition: all 0.2s ease;
}

.tech-card:hover {
  background: #e8e8ed;
  transform: translateY(-2px);
}

.card-icon {
  font-size: 24px;
}

.card-name {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
}

.card-desc {
  font-size: 11px;
  color: #8e8e93;
}

.responsibility-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.responsibility-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f7;
  font-size: 14px;
  color: #3a3a3c;
}

.responsibility-list li:last-child {
  border-bottom: none;
}

.check-icon {
  width: 20px;
  height: 20px;
  background: #34c759;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.connection-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.conn-item {
  padding: 12px 16px;
  background: #f5f5f7;
  border-radius: 10px;
  font-size: 13px;
}

.conn-flow {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3a3a3c;
}

.conn-label {
  margin-left: auto;
  font-weight: 600;
  font-size: 12px;
}

/* 空状态 */
.empty-panel {
  width: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content {
  text-align: center;
  padding: 40px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  display: block;
}

.empty-content p {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #1d1d1f;
  font-weight: 500;
}

.empty-hint {
  font-size: 13px !important;
  color: #8e8e93 !important;
  font-weight: 400 !important;
}

/* 底部图例 */
.legend-bar {
  margin-top: 20px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.legend-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  white-space: nowrap;
}

.legend-flow {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-name {
  font-size: 13px;
  color: #3a3a3c;
}

.legend-arrow {
  color: #c7c7cc;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 768px) {
  .architecture-wrapper {
    flex-direction: column;
  }

  .detail-panel,
  .empty-panel {
    width: auto;
  }

  .tech-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .control-bar {
    flex-wrap: wrap;
    gap: 12px;
  }

  .legend-flow {
    flex-wrap: wrap;
  }
}
</style>