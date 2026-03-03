<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{ mode?: 'crud' | 'n1' | 'paging' | 'tx' }>(), { mode: 'crud' })

// ─── Shared timer cleanup ───
const timers: number[] = []
function later(fn: () => void, ms: number) {
  const id = window.setTimeout(fn, ms)
  timers.push(id)
  return id
}
onUnmounted(() => timers.forEach(clearTimeout))

// ─── MODE 1: CRUD Live Database ───
interface Row {
  id: number; name: string; phone: string; address: string
  deletedAt: string | null; highlight?: 'create' | 'read' | 'update' | 'delete' | null
}
const nextId = ref(4)
const crudRows = ref<Row[]>([
  { id: 1, name: '小明', phone: '138****1234', address: '北京市朝阳区', deletedAt: null, highlight: null },
  { id: 2, name: '小红', phone: '139****5678', address: '上海市浦东新区', deletedAt: null, highlight: null },
  { id: 3, name: '小李', phone: '137****9012', address: '深圳市南山区', deletedAt: null, highlight: null },
])
const crudSql = ref('')
const crudSqlVisible = ref(false)
const crudLog = ref<{ time: string; text: string; type: string }[]>([])
const crudBusy = ref(false)

const names = ['小张', '小王', '小赵', '小刘', '小陈', '小杨', '小周', '小吴']
const addrs = ['广州市天河区', '杭州市西湖区', '成都市武侯区', '南京市鼓楼区', '武汉市洪山区']
const now = () => new Date().toLocaleTimeString('zh-CN', { hour12: false })

function typewriteSql(sql: string, cb?: () => void) {
  crudSql.value = ''
  crudSqlVisible.value = true
  let i = 0
  const tick = () => {
    if (i < sql.length) {
      crudSql.value = sql.slice(0, i + 1)
      i++
      later(tick, 18)
    } else if (cb) later(cb, 400)
  }
  tick()
}

function addLog(text: string, type: string) {
  crudLog.value = [{ time: now(), text, type }, ...crudLog.value].slice(0, 20)
}

function clearHighlights() {
  crudRows.value = crudRows.value.map(r => ({ ...r, highlight: null }))
}

function crudCreate() {
  if (crudBusy.value) return
  crudBusy.value = true
  clearHighlights()
  const id = nextId.value
  nextId.value = id + 1
  const n = names[Math.floor(Math.random() * names.length)]
  const a = addrs[Math.floor(Math.random() * addrs.length)]
  const phone = '13' + String(Math.floor(Math.random() * 10)) + '****' + String(1000 + Math.floor(Math.random() * 9000))
  typewriteSql(`INSERT INTO users (name, phone, address)\nVALUES ('${n}', '${phone}', '${a}');`, () => {
    const newRow: Row = { id, name: n, phone, address: a, deletedAt: null, highlight: 'create' }
    crudRows.value = [newRow, ...crudRows.value.filter(r => !r.deletedAt)]
    addLog(`创建用户 ${n} (id=${id})`, 'create')
    later(() => { clearHighlights(); crudBusy.value = false }, 1200)
  })
}

function crudRead() {
  if (crudBusy.value) return
  crudBusy.value = true
  clearHighlights()
  const alive = crudRows.value.filter(r => !r.deletedAt)
  if (!alive.length) { crudBusy.value = false; return }
  const target = alive[Math.floor(Math.random() * alive.length)]
  typewriteSql(`SELECT * FROM users\nWHERE id = ${target.id};`, () => {
    crudRows.value = crudRows.value.map(r => r.id === target.id ? { ...r, highlight: 'read' } : r)
    addLog(`查询用户 ${target.name} (id=${target.id})`, 'read')
    later(() => { clearHighlights(); crudBusy.value = false }, 1200)
  })
}

function crudUpdate() {
  if (crudBusy.value) return
  crudBusy.value = true
  clearHighlights()
  const alive = crudRows.value.filter(r => !r.deletedAt)
  if (!alive.length) { crudBusy.value = false; return }
  const target = alive[Math.floor(Math.random() * alive.length)]
  const newAddr = addrs[Math.floor(Math.random() * addrs.length)]
  typewriteSql(`UPDATE users\nSET address = '${newAddr}'\nWHERE id = ${target.id};`, () => {
    crudRows.value = crudRows.value.map(r =>
      r.id === target.id ? { ...r, address: newAddr, highlight: 'update' } : r
    )
    addLog(`更新用户 ${target.name} 地址 → ${newAddr}`, 'update')
    later(() => { clearHighlights(); crudBusy.value = false }, 1200)
  })
}

function crudDelete() {
  if (crudBusy.value) return
  crudBusy.value = true
  clearHighlights()
  const alive = crudRows.value.filter(r => !r.deletedAt)
  if (!alive.length) { crudBusy.value = false; return }
  const target = alive[Math.floor(Math.random() * alive.length)]
  const ts = new Date().toISOString()
  typewriteSql(`UPDATE users\nSET deleted_at = '${ts}'\nWHERE id = ${target.id};`, () => {
    crudRows.value = crudRows.value.map(r =>
      r.id === target.id ? { ...r, deletedAt: ts, highlight: 'delete' } : r
    )
    addLog(`软删除用户 ${target.name} (id=${target.id})`, 'delete')
    later(() => {
      crudRows.value = crudRows.value.filter(r => !(r.deletedAt && r.highlight === 'delete'))
      clearHighlights()
      crudBusy.value = false
    }, 1500)
  })
}

// ─── MODE 2: N+1 Query Storm ───
const userCount = ref(10)
const n1Running = ref(false)
const n1Arrows = ref<{ id: number; label: string; done: boolean }[]>([])
const joinArrow = ref<{ label: string; done: boolean } | null>(null)
const n1Sent = ref(0)
const n1Total = computed(() => userCount.value + 1)
const n1Time = computed(() => n1Total.value * 3)
const n1Finished = ref(false)
const joinFinished = ref(false)

function runN1Demo() {
  if (n1Running.value) return
  n1Running.value = true
  n1Finished.value = false
  joinFinished.value = false
  n1Sent.value = 0
  const n = userCount.value
  const arrows: { id: number; label: string; done: boolean }[] = [
    { id: 0, label: 'SELECT * FROM users', done: false },
    ...Array.from({ length: n }, (_, i) => ({
      id: i + 1, label: `SELECT * FROM orders WHERE user_id=${i + 1}`, done: false,
    })),
  ]
  n1Arrows.value = arrows
  joinArrow.value = { label: 'SELECT u.*, o.* FROM users JOIN orders ON u.id = o.user_id', done: false }

  let idx = 0
  const delay = Math.max(15, 1500 / arrows.length)
  const tick = () => {
    if (idx < arrows.length) {
      n1Arrows.value = n1Arrows.value.map((a, i) => i === idx ? { ...a, done: true } : a)
      n1Sent.value = idx + 1
      idx++
      later(tick, delay)
    } else {
      n1Finished.value = true
      n1Running.value = false
    }
  }
  later(tick, 200)
  later(() => {
    joinArrow.value = { ...joinArrow.value!, done: true }
    joinFinished.value = true
  }, 500)
}

// ─── MODE 3: Paging Waste Visualization ───
const pageNum = ref(1)
const pageSize = 20
const totalSquares = 200
const pagingAnimating = ref(false)
const scanIndex = ref(-1)

const offsetWaste = computed(() => (pageNum.value - 1) * pageSize)
const offsetReturn = computed(() => Math.min(pageNum.value * pageSize, totalSquares))

function animatePaging() {
  if (pagingAnimating.value) return
  pagingAnimating.value = true
  scanIndex.value = 0
  const end = Math.min(offsetReturn.value, totalSquares)
  const tick = () => {
    if (scanIndex.value < end) {
      scanIndex.value = scanIndex.value + 1
      later(tick, scanIndex.value < offsetWaste.value ? 4 : 15)
    } else {
      pagingAnimating.value = false
    }
  }
  later(tick, 50)
}

// ─── MODE 4: Transaction Transfer ───
const txScene = ref<'success' | 'fail'>('success')
const txRunning = ref(false)
const balanceA = ref(1000)
const balanceB = ref(500)
const txStep = ref(-1)
const txLocked = ref(false)
const txResult = ref<'none' | 'success' | 'fail'>('none')
const txLog = ref<{ sql: string; status: string }[]>([])

function animateBalance(target: 'a' | 'b', from: number, to: number, cb?: () => void) {
  const step = from < to ? 10 : -10
  let cur = from
  const tick = () => {
    cur += step
    if ((step > 0 && cur >= to) || (step < 0 && cur <= to)) {
      if (target === 'a') balanceA.value = to; else balanceB.value = to
      if (cb) later(cb, 300)
    } else {
      if (target === 'a') balanceA.value = cur; else balanceB.value = cur
      later(tick, 20)
    }
  }
  tick()
}

function runTx() {
  if (txRunning.value) return
  txRunning.value = true
  txResult.value = 'none'
  txStep.value = -1
  balanceA.value = 1000
  balanceB.value = 500
  txLog.value = []
  txLocked.value = false

  const isSuccess = txScene.value === 'success'

  // Step 0: BEGIN
  later(() => {
    txStep.value = 0
    txLocked.value = true
    txLog.value = [...txLog.value, { sql: 'BEGIN;', status: 'ok' }]

    // Step 1: Deduct
    later(() => {
      txStep.value = 1
      txLog.value = [...txLog.value, { sql: "UPDATE accounts SET balance = balance - 200 WHERE name = '小明';", status: 'ok' }]
      animateBalance('a', 1000, 800, () => {
        if (!isSuccess) {
          // FAIL: insufficient balance scenario
          txStep.value = 2
          txLog.value = [...txLog.value, { sql: "-- ERROR: 模拟转账失败", status: 'fail' }]
          later(() => {
            txStep.value = 3
            txLog.value = [...txLog.value, { sql: 'ROLLBACK;', status: 'rollback' }]
            animateBalance('a', 800, 1000, () => {
              txLocked.value = false
              txResult.value = 'fail'
              txRunning.value = false
            })
          }, 600)
          return
        }
        // Step 2: Credit
        txStep.value = 2
        txLog.value = [...txLog.value, { sql: "UPDATE accounts SET balance = balance + 200 WHERE name = '小红';", status: 'ok' }]
        animateBalance('b', 500, 700, () => {
          // Step 3: COMMIT
          txStep.value = 3
          txLog.value = [...txLog.value, { sql: 'COMMIT;', status: 'ok' }]
          txLocked.value = false
          txResult.value = 'success'
          txRunning.value = false
        })
      })
    }, 600)
  }, 400)
}
</script>

<template>
  <div class="cv-root">
    <!-- MODE 1: CRUD Live Database -->
    <div v-if="props.mode === 'crud'" class="cv-body">
      <div class="cv-actions">
        <button class="cv-btn cv-btn-create" @click="crudCreate" :disabled="crudBusy">+ 创建</button>
        <button class="cv-btn cv-btn-read" @click="crudRead" :disabled="crudBusy">&#128269; 查询</button>
        <button class="cv-btn cv-btn-update" @click="crudUpdate" :disabled="crudBusy">&#9999;&#65039; 更新</button>
        <button class="cv-btn cv-btn-delete" @click="crudDelete" :disabled="crudBusy">&#128465; 删除</button>
      </div>
      <div v-if="crudSqlVisible" class="cv-sql-display">
        <span class="cv-sql-prefix">SQL &gt;</span>
        <span class="cv-sql-text">{{ crudSql }}<span class="cv-cursor">|</span></span>
      </div>
      <div class="cv-table-wrap">
        <table class="cv-table">
          <thead>
            <tr><th>id</th><th>姓名</th><th>手机</th><th>地址</th><th>状态</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in crudRows" :key="row.id"
              :class="[
                'cv-row',
                row.highlight === 'create' ? 'cv-row-create' : '',
                row.highlight === 'read' ? 'cv-row-read' : '',
                row.highlight === 'update' ? 'cv-row-update' : '',
                row.highlight === 'delete' ? 'cv-row-delete' : '',
              ]">
              <td>{{ row.id }}</td>
              <td>{{ row.name }}</td>
              <td>{{ row.phone }}</td>
              <td>{{ row.address }}</td>
              <td>
                <span v-if="row.deletedAt" class="cv-status-deleted">已删除</span>
                <span v-else class="cv-status-active">正常</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="crudLog.length" class="cv-log">
        <div class="cv-log-title">操作日志</div>
        <div v-for="(l, i) in crudLog" :key="i" :class="['cv-log-item', 'cv-log-' + l.type]">
          <span class="cv-log-time">{{ l.time }}</span>
          <span class="cv-log-text">{{ l.text }}</span>
        </div>
      </div>
    </div>

    <!-- MODE 2: N+1 Query Storm -->
    <div v-if="props.mode === 'n1'" class="cv-body">
      <div class="cv-bar-ctrl">
        <span class="cv-lbl">用户数量</span>
        <input type="range" min="5" max="50" step="5" v-model.number="userCount" class="cv-slider" :disabled="n1Running" />
        <span class="cv-val">{{ userCount }}</span>
        <button class="cv-btn" @click="runN1Demo" :disabled="n1Running">发起查询</button>
      </div>
      <div class="cv-n1-arena">
        <div class="cv-n1-side">
          <div class="cv-n1-box cv-n1-app">
            <div class="cv-n1-icon">&#128100;</div>
            <div class="cv-n1-label">应用</div>
          </div>
        </div>
        <div class="cv-n1-middle">
          <div class="cv-n1-lane cv-n1-bad-lane">
            <div class="cv-n1-lane-title cv-bad-text">N+1 方式</div>
            <div class="cv-n1-arrow-zone">
              <div v-for="a in n1Arrows.filter(x => x.done).slice(-8)" :key="a.id"
                class="cv-arrow cv-arrow-red">
                <span class="cv-arrow-label">{{ a.label.length > 35 ? a.label.slice(0, 35) + '...' : a.label }}</span>
              </div>
            </div>
            <div class="cv-n1-counter">已发送: {{ n1Sent }}/{{ n1Total }} 次查询</div>
          </div>
          <div class="cv-n1-lane cv-n1-good-lane">
            <div class="cv-n1-lane-title cv-good-text">JOIN 方式</div>
            <div class="cv-n1-arrow-zone">
              <div v-if="joinArrow && joinArrow.done" class="cv-arrow cv-arrow-green">
                <span class="cv-arrow-label">{{ joinArrow.label.length > 50 ? joinArrow.label.slice(0, 50) + '...' : joinArrow.label }}</span>
              </div>
            </div>
            <div class="cv-n1-counter">{{ joinFinished ? '1/1 次查询' : '等待中...' }}</div>
          </div>
        </div>
        <div class="cv-n1-side">
          <div class="cv-n1-box cv-n1-db">
            <div class="cv-n1-icon">&#128451;</div>
            <div class="cv-n1-label">数据库</div>
          </div>
        </div>
      </div>
      <div v-if="n1Finished && joinFinished" class="cv-summary cv-good-bg">
        N+1: {{ n1Total }}次查询, ~{{ n1Time }}ms &nbsp;|&nbsp; JOIN: 1次查询, ~5ms &nbsp;|&nbsp; 快了 <strong>{{ Math.round(n1Time / 5) }}x</strong>
      </div>
    </div>

    <!-- MODE 3: Paging Waste -->
    <div v-if="props.mode === 'paging'" class="cv-body">
      <div class="cv-bar-ctrl">
        <span class="cv-lbl">当前页码</span>
        <input type="range" min="1" max="100" v-model.number="pageNum" class="cv-slider" />
        <span class="cv-val">第 {{ pageNum }} 页</span>
        <button class="cv-btn" @click="animatePaging" :disabled="pagingAnimating">扫描动画</button>
      </div>
      <div class="cv-pg-section">
        <div class="cv-pg-title cv-bad-text">OFFSET 分页</div>
        <div class="cv-grid-squares">
          <div v-for="i in totalSquares" :key="'o' + i"
            :class="[
              'cv-sq',
              scanIndex >= 0 && i <= scanIndex
                ? (i <= offsetWaste ? 'cv-sq-red' : i <= offsetReturn ? 'cv-sq-green' : 'cv-sq-gray')
                : (i <= offsetWaste ? 'cv-sq-red-static' : i <= offsetReturn ? 'cv-sq-green-static' : 'cv-sq-gray'),
            ]"></div>
        </div>
        <div class="cv-pg-info">扫描了 <strong>{{ offsetReturn }}</strong> 行，丢弃了 <strong class="cv-bad-text">{{ offsetWaste }}</strong> 行，只返回 <strong class="cv-good-text">{{ pageSize }}</strong> 行</div>
      </div>
      <div class="cv-pg-section">
        <div class="cv-pg-title cv-good-text">Cursor 游标分页</div>
        <div class="cv-grid-squares">
          <div v-for="i in totalSquares" :key="'c' + i"
            :class="[
              'cv-sq',
              i > offsetWaste && i <= offsetReturn ? 'cv-sq-green-static' : 'cv-sq-gray',
            ]"></div>
        </div>
        <div class="cv-pg-info">直接定位，只扫描 <strong class="cv-good-text">{{ pageSize }}</strong> 行</div>
      </div>
      <div v-if="pageNum > 10" class="cv-summary cv-warn-bg">
        翻到第 {{ pageNum }} 页，OFFSET 先扫描 {{ offsetReturn }} 行再丢弃 {{ offsetWaste }} 行
      </div>
    </div>

    <!-- MODE 4: Transaction Transfer -->
    <div v-if="props.mode === 'tx'" class="cv-body">
      <div class="cv-bar-ctrl">
        <span class="cv-lbl">场景</span>
        <button :class="['cv-toggle', { active: txScene === 'success' }]" @click="txScene = 'success'">成功</button>
        <button :class="['cv-toggle', { active: txScene === 'fail' }]" @click="txScene = 'fail'">失败（余额不足）</button>
        <button class="cv-btn" @click="runTx" :disabled="txRunning">转账 ¥200</button>
      </div>
      <div class="cv-tx-cards">
        <div :class="['cv-account', txLocked ? 'cv-account-locked' : '', txResult === 'fail' ? 'cv-account-fail' : '', txResult === 'success' ? 'cv-account-ok' : '']">
          <div class="cv-account-lock" v-if="txLocked">&#128274;</div>
          <div class="cv-account-result" v-if="txResult === 'success'">&#10004;</div>
          <div class="cv-account-result cv-result-fail" v-if="txResult === 'fail'">&#10008;</div>
          <div class="cv-account-name">小明</div>
          <div class="cv-account-balance">¥{{ balanceA.toLocaleString() }}</div>
        </div>
        <div class="cv-tx-arrow-mid">
          <div v-if="txStep >= 1" class="cv-tx-flow">→ ¥200 →</div>
        </div>
        <div :class="['cv-account', txLocked ? 'cv-account-locked' : '', txResult === 'fail' ? 'cv-account-fail' : '', txResult === 'success' ? 'cv-account-ok' : '']">
          <div class="cv-account-lock" v-if="txLocked">&#128274;</div>
          <div class="cv-account-result" v-if="txResult === 'success'">&#10004;</div>
          <div class="cv-account-result cv-result-fail" v-if="txResult === 'fail'">&#10008;</div>
          <div class="cv-account-name">小红</div>
          <div class="cv-account-balance">¥{{ balanceB.toLocaleString() }}</div>
        </div>
      </div>
      <div v-if="txLog.length" class="cv-tx-log">
        <div class="cv-log-title">SQL 日志</div>
        <div v-for="(l, i) in txLog" :key="i" :class="['cv-tx-log-item', 'cv-txlog-' + l.status]">
          <span class="cv-tx-log-num">{{ i + 1 }}.</span>
          <code>{{ l.sql }}</code>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* ─── Root ─── */
.cv-root { margin: 1.5rem 0; }
.cv-body { padding: 0; }

/* ─── Shared Controls ─── */
.cv-bar-ctrl { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.cv-lbl { font-size: 13px; color: var(--vp-c-text-2); font-weight: 500; }
.cv-slider { flex: 0 0 130px; accent-color: var(--vp-c-brand-1); }
.cv-val { font-size: 14px; font-weight: 700; color: var(--vp-c-text-1); min-width: 50px; }
.cv-btn {
  padding: 6px 16px; border: none; border-radius: 8px;
  background: var(--vp-c-brand-1); color: #fff; font-size: 12px;
  font-weight: 600; cursor: pointer; transition: opacity .15s;
}
.cv-btn:hover { opacity: .85; }
.cv-btn:disabled { opacity: .4; cursor: not-allowed; }
.cv-toggle {
  padding: 4px 12px; border: 1.5px solid var(--vp-c-divider); border-radius: 6px;
  background: var(--vp-c-bg); font-size: 12px; color: var(--vp-c-text-2);
  cursor: pointer; transition: all .15s;
}
.cv-toggle.active { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); font-weight: 600; }
.cv-bad-text { color: #ff3b30; }
.cv-good-text { color: #15a051; }
.cv-summary {
  text-align: center; margin-top: 14px; padding: 10px 16px;
  border-radius: 8px; font-size: 13px; animation: cvFadeIn .3s;
}
.cv-good-bg { background: #15a05112; color: #15a051; }
.cv-warn-bg { background: #D4952C14; border: 1px solid #D4952C30; color: var(--vp-c-text-1); }

/* ─── CRUD Actions ─── */
.cv-actions { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.cv-btn-create { background: #15a051; }
.cv-btn-read { background: #2eb3df; }
.cv-btn-update { background: #D4952C; }
.cv-btn-delete { background: #ff3b30; }

/* ─── SQL Display ─── */
.cv-sql-display {
  background: #1a1a2e; color: #0f0; border-radius: 8px; padding: 10px 14px;
  font-family: var(--vp-font-family-mono); font-size: 12px; margin-bottom: 12px;
  min-height: 40px; line-height: 1.6; white-space: pre-wrap; animation: cvFadeIn .2s;
}
.cv-sql-prefix { color: #888; margin-right: 8px; }
.cv-sql-text { color: #4ade80; }
.cv-cursor { animation: cvBlink 0.8s infinite; color: #4ade80; }

/* ─── Mini Table ─── */
.cv-table-wrap { overflow-x: auto; border-radius: 12px; border: 1.5px solid var(--vp-c-divider); }
.cv-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.cv-table th {
  background: var(--vp-c-bg-soft); padding: 8px 12px; text-align: left;
  font-weight: 600; color: var(--vp-c-text-2); font-size: 12px;
  border-bottom: 1.5px solid var(--vp-c-divider);
}
.cv-table td { padding: 8px 12px; border-bottom: 1px solid var(--vp-c-divider); color: var(--vp-c-text-1); }
/* Row highlights */
.cv-row { transition: all .4s ease; }
.cv-row-create { animation: cvSlideIn .5s ease; background: #15a05118; }
.cv-row-read { background: #2eb3df18; box-shadow: inset 0 0 0 2px #2eb3df40; }
.cv-row-update { background: #D4952C18; }
.cv-row-update td:nth-child(4) { color: #D4952C; font-weight: 700; }
.cv-row-delete { text-decoration: line-through; opacity: .5; background: #ff3b3018; }
.cv-status-active { color: #15a051; font-size: 12px; font-weight: 500; }
.cv-status-deleted { color: #ff3b30; font-size: 12px; font-weight: 500; }

/* ─── Operation Log ─── */
.cv-log { margin-top: 12px; max-height: 140px; overflow-y: auto; border-radius: 8px; border: 1px solid var(--vp-c-divider); padding: 8px; }
.cv-log-title { font-size: 12px; font-weight: 600; color: var(--vp-c-text-2); margin-bottom: 6px; }
.cv-log-item { font-size: 11px; padding: 3px 0; display: flex; gap: 8px; animation: cvFadeIn .2s; }
.cv-log-time { color: var(--vp-c-text-3); font-family: var(--vp-font-family-mono); flex-shrink: 0; }
.cv-log-text { color: var(--vp-c-text-1); }
.cv-log-create .cv-log-text { color: #15a051; }
.cv-log-read .cv-log-text { color: #2eb3df; }
.cv-log-update .cv-log-text { color: #D4952C; }
.cv-log-delete .cv-log-text { color: #ff3b30; }

/* ─── N+1 Arena ─── */
.cv-n1-arena { display: flex; align-items: stretch; gap: 0; min-height: 200px; border: 1.5px solid var(--vp-c-divider); border-radius: 12px; overflow: hidden; }
.cv-n1-side { display: flex; align-items: center; justify-content: center; padding: 16px; background: var(--vp-c-bg-soft); min-width: 80px; }
.cv-n1-box { text-align: center; }
.cv-n1-icon { font-size: 28px; margin-bottom: 4px; }
.cv-n1-label { font-size: 12px; font-weight: 600; color: var(--vp-c-text-1); }
.cv-n1-middle { flex: 1; display: flex; flex-direction: column; }
.cv-n1-lane { flex: 1; padding: 10px 12px; border-bottom: 1px solid var(--vp-c-divider); }
.cv-n1-lane:last-child { border-bottom: none; }
.cv-n1-lane-title { font-size: 12px; font-weight: 600; margin-bottom: 6px; }
.cv-n1-arrow-zone { min-height: 50px; display: flex; flex-direction: column; gap: 3px; overflow: hidden; }
.cv-n1-counter { font-size: 11px; color: var(--vp-c-text-3); margin-top: 6px; font-family: var(--vp-font-family-mono); }

/* Arrows */
.cv-arrow { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-family: var(--vp-font-family-mono); animation: cvArrowFly .3s ease-out; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cv-arrow-red { background: #ff3b3015; color: #ff3b30; border-left: 3px solid #ff3b30; }
.cv-arrow-green { background: #15a05115; color: #15a051; border-left: 3px solid #15a051; }
.cv-arrow-label { font-size: 10px; }

/* ─── Paging Squares ─── */
.cv-pg-section { margin-bottom: 16px; }
.cv-pg-title { font-size: 13px; font-weight: 600; margin-bottom: 8px; }
.cv-grid-squares { display: flex; flex-wrap: wrap; gap: 2px; margin-bottom: 8px; }
.cv-sq { width: 10px; height: 10px; border-radius: 2px; transition: background .1s; }
.cv-sq-gray { background: var(--vp-c-divider); }
.cv-sq-red { background: #ff3b30; animation: cvPulseRed .2s; }
.cv-sq-red-static { background: #ff3b3060; }
.cv-sq-green { background: #15a051; animation: cvPulseGreen .2s; }
.cv-sq-green-static { background: #15a05180; }
.cv-pg-info { font-size: 12px; color: var(--vp-c-text-2); }
.cv-pg-info strong { color: var(--vp-c-text-1); }

/* ─── Transaction Cards ─── */
.cv-tx-cards { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 16px; }
.cv-account {
  flex: 0 0 160px; padding: 20px; border-radius: 12px; text-align: center;
  border: 2px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);
  position: relative; transition: all .3s;
}
.cv-account-locked { border-color: #D4952C; box-shadow: 0 0 12px #D4952C30; }
.cv-account-ok { border-color: #15a051; box-shadow: 0 0 12px #15a05130; }
.cv-account-fail { border-color: #ff3b30; box-shadow: 0 0 12px #ff3b3030; }
.cv-account-lock { position: absolute; top: 8px; right: 8px; font-size: 16px; animation: cvFadeIn .2s; }
.cv-account-result { position: absolute; top: 8px; right: 8px; font-size: 18px; color: #15a051; animation: cvBounce .4s; }
.cv-result-fail { color: #ff3b30; }
.cv-account-name { font-size: 16px; font-weight: 700; color: var(--vp-c-text-1); margin-bottom: 8px; }
.cv-account-balance { font-size: 24px; font-weight: 800; color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }
.cv-tx-arrow-mid { font-size: 14px; font-weight: 700; color: var(--vp-c-text-2); min-width: 80px; text-align: center; }
.cv-tx-flow { color: #D4952C; animation: cvFadeIn .3s; }

/* ─── TX SQL Log ─── */
.cv-tx-log { border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 10px; }
.cv-tx-log-item { font-size: 11px; padding: 3px 0; display: flex; gap: 6px; animation: cvFadeIn .2s; }
.cv-tx-log-num { color: var(--vp-c-text-3); flex-shrink: 0; }
.cv-tx-log-item code { font-family: var(--vp-font-family-mono); font-size: 11px; color: var(--vp-c-text-1); }
.cv-txlog-ok code { color: #15a051; }
.cv-txlog-fail code { color: #ff3b30; }
.cv-txlog-rollback code { color: #D4952C; }

/* ─── Animations ─── */
@keyframes cvFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes cvSlideIn { from { opacity: 0; transform: translateY(-20px); background: #15a05130; } to { opacity: 1; transform: none; } }
@keyframes cvBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes cvArrowFly { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: none; } }
@keyframes cvPulseRed { from { background: #ff3b3080; transform: scale(1.3); } to { background: #ff3b30; transform: scale(1); } }
@keyframes cvPulseGreen { from { background: #15a05180; transform: scale(1.3); } to { background: #15a051; transform: scale(1); } }
@keyframes cvBounce { 0% { transform: scale(0); } 60% { transform: scale(1.3); } 100% { transform: scale(1); } }

/* ─── Responsive ─── */
@media (max-width: 640px) {
  .cv-actions { gap: 6px; }
  .cv-actions .cv-btn { padding: 5px 10px; font-size: 11px; }
  .cv-n1-arena { flex-direction: column; min-height: auto; }
  .cv-n1-side { min-width: auto; padding: 10px; }
  .cv-tx-cards { flex-direction: column; gap: 10px; }
  .cv-account { flex: none; width: 100%; }
  .cv-tx-arrow-mid { transform: rotate(90deg); }
  .cv-bar-ctrl { gap: 6px; }
  .cv-slider { flex: 0 0 100px; }
  .cv-table { font-size: 11px; }
  .cv-table th, .cv-table td { padding: 6px 8px; }
}
</style>
