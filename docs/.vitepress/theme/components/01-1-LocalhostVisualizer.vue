<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

interface Room {
  port: number
  service: string | null
  icon: string
  zone: 'system' | 'registered' | 'dynamic'
}

const mode = ref<'dev' | 'prod'>('dev')
const errorPort = ref<number | null>(null)
let errorTimer: number | null = null

const rooms = ref<Room[]>([
  { port: 80, service: 'HTTP', icon: '🌐', zone: 'system' },
  { port: 443, service: 'HTTPS', icon: '🔒', zone: 'system' },
  { port: 3000, service: 'Next.js', icon: '⚛️', zone: 'registered' },
  { port: 3001, service: null, icon: '', zone: 'registered' },
  { port: 5173, service: 'Vite', icon: '⚡', zone: 'registered' },
  { port: 5174, service: null, icon: '', zone: 'registered' },
  { port: 8000, service: null, icon: '', zone: 'registered' },
  { port: 8080, service: null, icon: '', zone: 'registered' },
  { port: 49152, service: null, icon: '', zone: 'dynamic' },
  { port: 49153, service: null, icon: '', zone: 'dynamic' },
])

const availableServices = [
  { name: 'Express', icon: '🚂' },
  { name: 'Python', icon: '🐍' },
  { name: 'Astro', icon: '🚀' },
]

function clickRoom(room: Room) {
  if (room.service) {
    // Trigger EADDRINUSE error
    errorPort.value = room.port
    if (errorTimer) clearTimeout(errorTimer)
    errorTimer = window.setTimeout(() => { errorPort.value = null }, 2000)
  } else {
    // Start a random service
    const svc = availableServices[Math.floor(Math.random() * availableServices.length)]
    const idx = rooms.value.findIndex(r => r.port === room.port)
    rooms.value[idx] = { ...room, service: svc.name, icon: svc.icon }
  }
}

function getZoneLabel(zone: string): string {
  switch (zone) {
    case 'system': return '系统端口 (0-1023)'
    case 'registered': return '注册端口 (1024-49151)'
    case 'dynamic': return '动态端口 (49152-65535)'
    default: return ''
  }
}

function getZoneColor(zone: string): string {
  switch (zone) {
    case 'system': return '#ff3b30'
    case 'registered': return '#007aff'
    case 'dynamic': return '#5856d6'
    default: return '#718096'
  }
}

function reset() {
  if (errorTimer) clearTimeout(errorTimer)
  errorPort.value = null
  rooms.value = rooms.value.map(r => {
    if (['Next.js', 'Vite', 'HTTP', 'HTTPS'].includes(r.service || '')) return r
    return { ...r, service: null, icon: '' }
  })
}

onUnmounted(() => { if (errorTimer) clearTimeout(errorTimer) })
</script>

<template>
  <div class="lh-viz">
    <div class="lh-window">
      <div class="lh-header">
        <div class="window-controls">
          <span class="ctrl close"></span>
          <span class="ctrl minimize"></span>
          <span class="ctrl maximize"></span>
        </div>
        <div class="lh-title">🏢 Localhost 端口可视化</div>
        <button class="reset-btn" @click="reset" title="重置">↻</button>
      </div>

      <div class="lh-body">
        <!-- Mode toggle -->
        <div class="mode-toggle">
          <button :class="{ active: mode === 'dev' }" @click="mode = 'dev'">🛠️ 开发模式</button>
          <button :class="{ active: mode === 'prod' }" @click="mode = 'prod'">🚀 生产模式</button>
        </div>

        <!-- Error toast -->
        <Transition name="toast">
          <div v-if="errorPort" class="error-toast">
            <span class="error-icon">❌</span>
            <div class="error-content">
              <div class="error-title">EADDRINUSE</div>
              <div class="error-msg">端口 {{ errorPort }} 已被占用！</div>
            </div>
          </div>
        </Transition>

        <!-- Building visualization -->
        <div class="building">
          <div class="building-roof">
            <div class="building-address">
              <span class="addr-label">地址</span>
              <span class="addr-value">127.0.0.1 (localhost)</span>
            </div>
          </div>

          <!-- Zones -->
          <div v-for="zone in ['system', 'registered', 'dynamic']" :key="zone" class="zone">
            <div class="zone-label" :style="{ borderColor: getZoneColor(zone) }">
              <span class="zone-dot" :style="{ background: getZoneColor(zone) }"></span>
              {{ getZoneLabel(zone) }}
            </div>
            <div class="rooms-grid">
              <div
                v-for="room in rooms.filter(r => r.zone === zone)"
                :key="room.port"
                class="room"
                :class="{ occupied: room.service, error: errorPort === room.port }"
                @click="clickRoom(room)"
              >
                <div class="room-number">{{ room.port }}</div>
                <div v-if="room.service" class="room-service">
                  <span class="room-icon">{{ room.icon }}</span>
                  <span class="room-name">{{ room.service }}</span>
                </div>
                <div v-else class="room-empty">空闲</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Production architecture -->
        <Transition name="fade">
          <div v-if="mode === 'prod'" class="prod-arch">
            <div class="arch-title">生产环境架构</div>
            <div class="arch-flow">
              <div class="arch-node user">
                <span class="arch-icon">👤</span>
                <span>用户浏览器</span>
              </div>
              <div class="arch-arrow">→</div>
              <div class="arch-node nginx">
                <span class="arch-icon">🔀</span>
                <span>Nginx (80/443)</span>
              </div>
              <div class="arch-arrow">→</div>
              <div class="arch-node app">
                <span class="arch-icon">⚛️</span>
                <span>你的应用 (3000)</span>
              </div>
            </div>
            <div class="arch-note">用户只看到域名，Nginx 将请求转发到内部端口</div>
          </div>
        </Transition>
      </div>

      <div class="lh-footer">
        <span class="footer-icon">💡</span>
        <span>点击空闲房间启动服务，点击已占用房间触发端口冲突</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lh-viz {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 20px 0;
}
.lh-window {
  background: #1e1e2e;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.lh-header {
  display: flex; align-items: center; padding: 12px 16px;
  background: linear-gradient(180deg, #2d2d44 0%, #1e1e2e 100%);
  border-bottom: 1px solid #2d2d44;
}
.window-controls { display: flex; gap: 8px; }
.ctrl { width: 12px; height: 12px; border-radius: 50%; }
.ctrl.close { background: #ff5f56; }
.ctrl.minimize { background: #ffbd2e; }
.ctrl.maximize { background: #27c93f; }
.lh-title { flex: 1; text-align: center; color: #a0a0b0; font-size: 13px; }
.reset-btn {
  background: transparent; border: none; color: #888; cursor: pointer;
  font-size: 16px; padding: 4px 8px; border-radius: 4px; transition: all 0.2s;
}
.reset-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }
.lh-body { padding: 20px; position: relative; }
.mode-toggle {
  display: flex; gap: 8px; margin-bottom: 20px; justify-content: center;
}
.mode-toggle button {
  padding: 8px 20px; background: #252542; border: 1px solid #3d3d5c;
  border-radius: 8px; color: #a0aec0; cursor: pointer; font-size: 13px;
  transition: all 0.2s;
}
.mode-toggle button.active {
  background: #1a2a4a; border-color: #007aff; color: #e2e8f0;
}
.mode-toggle button:hover { border-color: #007aff; }
.error-toast {
  position: absolute; top: 70px; right: 20px; z-index: 10;
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; background: #3d1a1a; border: 1px solid #ff3b30;
  border-radius: 10px; box-shadow: 0 8px 24px rgba(255,59,48,0.3);
}
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(20px); }
.error-icon { font-size: 20px; }
.error-title { font-size: 13px; font-weight: 600; color: #fc8181; font-family: 'SF Mono', Monaco, monospace; }
.error-msg { font-size: 11px; color: #a0aec0; }
.building { margin-bottom: 20px; }
.building-roof {
  padding: 12px 16px; background: linear-gradient(135deg, #252542, #2d2d4a);
  border-radius: 10px 10px 0 0; border: 1px solid #3d3d5c; border-bottom: none;
  text-align: center;
}
.addr-label { font-size: 10px; color: #718096; margin-right: 8px; }
.addr-value { font-size: 14px; font-weight: 600; color: #63b3ed; font-family: 'SF Mono', Monaco, monospace; }
.zone {
  border: 1px solid #2d2d4a; border-top: none; padding: 12px;
}
.zone:last-child { border-radius: 0 0 10px 10px; }
.zone-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; color: #718096; margin-bottom: 10px;
  padding-left: 8px; border-left: 2px solid;
}
.zone-dot { width: 6px; height: 6px; border-radius: 50%; }
.rooms-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px;
}
.room {
  padding: 10px; background: #252542; border: 1px solid #3d3d5c;
  border-radius: 8px; cursor: pointer; transition: all 0.2s; text-align: center;
}
.room:hover { border-color: #007aff; background: #2d2d4a; }
.room.occupied { background: #1a2a3a; border-color: #007aff; }
.room.error { animation: shake 0.3s; border-color: #ff3b30 !important; background: #3d1a1a !important; }
@keyframes shake {
  0%,100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.room-number {
  font-size: 14px; font-weight: 600; color: #e2e8f0;
  font-family: 'SF Mono', Monaco, monospace; margin-bottom: 4px;
}
.room-service { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.room-icon { font-size: 16px; }
.room-name { font-size: 10px; color: #63b3ed; }
.room-empty { font-size: 10px; color: #4a5568; }
.prod-arch {
  background: #252542; border-radius: 10px; padding: 16px;
  border: 1px solid #3d3d5c; text-align: center;
}
.arch-title { font-size: 13px; font-weight: 600; color: #e2e8f0; margin-bottom: 16px; }
.arch-flow {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  flex-wrap: wrap;
}
.arch-node {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 12px 16px; border-radius: 8px; font-size: 12px; color: #e2e8f0;
}
.arch-node.user { background: #1a2a3a; }
.arch-node.nginx { background: #2a2a1a; }
.arch-node.app { background: #1a2a2a; }
.arch-icon { font-size: 24px; }
.arch-arrow { color: #718096; font-size: 20px; }
.arch-note { font-size: 11px; color: #718096; margin-top: 12px; }
.fade-enter-active, .fade-leave-active { transition: all 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
.lh-footer {
  padding: 12px 20px; background: #16162a; border-top: 1px solid #2d2d44;
  font-size: 12px; color: #a0aec0; display: flex; align-items: center; gap: 8px;
}
.footer-icon { font-size: 14px; }
@media (max-width: 640px) {
  .rooms-grid { grid-template-columns: repeat(2, 1fr); }
  .arch-flow { flex-direction: column; }
  .arch-arrow { transform: rotate(90deg); }
}
</style>
