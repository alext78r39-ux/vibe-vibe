<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref<'anatomy' | 'relations' | 'constraints' | 'types'>('anatomy')

// ─── Tab 1: Table Anatomy ───
const columns = [
  { name: 'id', type: 'serial', constraint: 'PRIMARY KEY', color: '#15a051', desc: '自增主键，每行唯一标识。数据库自动生成，不需要手动填写。就像身份证号，绝不重复。' },
  { name: 'phone', type: 'text', constraint: 'NOT NULL, UNIQUE', color: '#D4952C', desc: '手机号，文本类型。NOT NULL 表示必填，UNIQUE 表示不能重复——一个手机号只能注册一个账号。' },
  { name: 'nickname', type: 'text', constraint: 'NOT NULL', color: '#D4952C', desc: '昵称，文本类型。NOT NULL 表示必填，但没有 UNIQUE，所以不同用户可以叫同一个名字。' },
  { name: 'address', type: 'text', constraint: '—', color: '', desc: '收货地址，文本类型。没有 NOT NULL，说明可以为空——用户可以之后再填。' },
  { name: 'created_at', type: 'timestamp', constraint: 'DEFAULT now()', color: '', desc: '注册时间，时间戳类型。DEFAULT now() 表示如果不填，自动记录当前时间。' },
]
const sampleRows = [
  { id: 1, phone: '138****8888', nickname: '小明', address: '北京市朝阳区建国路88号', created_at: '2024-01-15 09:30' },
  { id: 2, phone: '139****9999', nickname: '小红', address: '上海市浦东新区陆家嘴', created_at: '2024-02-20 14:15' },
  { id: 3, phone: '137****7777', nickname: '老王', address: null, created_at: '2024-03-01 18:00' },
]
const selectedCol = ref<number | null>(null)

// ─── Tab 2: Relationships ───
type RelType = 'one-to-many' | 'many-to-many' | 'one-to-one'
const activeRelation = ref<RelType>('one-to-many')
const selectedLink = ref<string | null>(null)

interface RelTable { name: string; fields: string[] }
interface RelLink { from: string; to: string; label: string; desc: string }
interface RelData { tables: RelTable[]; links: RelLink[] }

const relations: Record<RelType, RelData> = {
  'one-to-many': {
    tables: [
      { name: 'users', fields: ['id', 'phone', 'nickname'] },
      { name: 'orders', fields: ['id', 'user_id', 'amount', 'status'] },
    ],
    links: [
      { from: 'users.id', to: 'orders.user_id', label: '1 : N', desc: '一个用户可以下多个订单。orders.user_id 是外键，指向 users.id。删除用户前必须先处理他的订单。' },
    ],
  },
  'many-to-many': {
    tables: [
      { name: 'orders', fields: ['id', 'user_id', 'total'] },
      { name: 'order_items', fields: ['id', 'order_id', 'dish_id', 'qty'] },
      { name: 'dishes', fields: ['id', 'name', 'price'] },
    ],
    links: [
      { from: 'orders.id', to: 'order_items.order_id', label: '1 : N', desc: '一个订单包含多个菜品条目。order_items 是中间表，拆解了订单和菜品的多对多关系。' },
      { from: 'dishes.id', to: 'order_items.dish_id', label: '1 : N', desc: '一道菜可以出现在多个订单里。通过 order_items 中间表，实现了 orders ↔ dishes 的多对多。' },
    ],
  },
  'one-to-one': {
    tables: [
      { name: 'users', fields: ['id', 'phone', 'nickname'] },
      { name: 'profiles', fields: ['id', 'user_id', 'avatar', 'bio'] },
    ],
    links: [
      { from: 'users.id', to: 'profiles.user_id', label: '1 : 1', desc: '一个用户对应一份详细资料。user_id 加了 UNIQUE 约束，保证一个用户只有一条 profile。拆表是为了把不常用的大字段分离出去。' },
    ],
  },
}

const relDesc: Record<RelType, string> = {
  'one-to-many': '最常见的关系。一个用户有多个订单，一个商家有多道菜。',
  'many-to-many': '需要中间表拆解。一个订单包含多道菜，一道菜也出现在多个订单里。',
  'one-to-one': '不太常见，通常用于拆分大表。一个用户对应一份详细资料。',
}

// ─── Tab 3: Constraints ───
const constraints = [
  {
    name: 'PRIMARY KEY', icon: '🔑', color: '#15a051',
    good: { sql: "INSERT INTO users (id, phone) VALUES (1, '138...')", note: 'id=1 是唯一的，插入成功' },
    bad: { sql: "INSERT INTO users (id, phone) VALUES (1, '139...')", note: 'id=1 已存在！主键不允许重复', error: 'ERROR: duplicate key value violates unique constraint "users_pkey"' },
    explain: '主键是每行的"身份证号"，必须唯一且不能为空。通常用自增 serial 类型，数据库自动分配。',
  },
  {
    name: 'FOREIGN KEY', icon: '🔗', color: '#2eb3df',
    good: { sql: "INSERT INTO orders (user_id, amount) VALUES (1, 35.00)", note: 'user_id=1 在 users 表中存在，插入成功' },
    bad: { sql: "INSERT INTO orders (user_id, amount) VALUES (999, 35.00)", note: 'user_id=999 在 users 表中不存在！', error: 'ERROR: insert or update violates foreign key constraint "orders_user_id_fkey"' },
    explain: '外键确保引用的数据真实存在。不能给一个不存在的用户创建订单——这就是"引用完整性"。',
  },
  {
    name: 'NOT NULL', icon: '⛔', color: '#D4952C',
    good: { sql: "INSERT INTO users (phone, nickname) VALUES ('138...', '小明')", note: '必填字段都有值，插入成功' },
    bad: { sql: "INSERT INTO users (phone, nickname) VALUES ('138...', NULL)", note: 'nickname 是必填的，不能为空！', error: 'ERROR: null value in column "nickname" violates not-null constraint' },
    explain: 'NOT NULL 表示这个字段必须有值。适用于业务上不能缺失的数据，比如用户昵称、手机号。',
  },
  {
    name: 'UNIQUE', icon: '🎯', color: '#9333ea',
    good: { sql: "INSERT INTO users (phone) VALUES ('138****8888')", note: '这个手机号还没被注册，插入成功' },
    bad: { sql: "INSERT INTO users (phone) VALUES ('138****8888')", note: '这个手机号已经注册过了！', error: 'ERROR: duplicate key value violates unique constraint "users_phone_key"' },
    explain: 'UNIQUE 保证某列的值不重复。和主键的区别：一张表只有一个主键，但可以有多个 UNIQUE 列。',
  },
]
const expandedConstraint = ref<number | null>(null)

// ─── Tab 4: Data Types ───
const dataTypes = [
  { name: 'serial', icon: '🔢', usage: '自增 ID', example: '1, 2, 3...', drizzle: "serial('id').primaryKey()" },
  { name: 'text', icon: '📝', usage: '任意长度文本', example: "'你好世界'", drizzle: "text('name').notNull()" },
  { name: 'integer', icon: '🔟', usage: '整数', example: '42, -1, 0', drizzle: "integer('age')" },
  { name: 'boolean', icon: '✅', usage: '真/假', example: 'true / false', drizzle: "boolean('is_active').default(true)" },
  { name: 'timestamp', icon: '🕐', usage: '日期时间', example: "'2024-01-15 09:30:00'", drizzle: "timestamp('created_at').defaultNow()" },
  { name: 'jsonb', icon: '📦', usage: '结构化 JSON', example: '\'{\"tags\":[\"vip\"]}\'', drizzle: "jsonb('metadata')" },
  { name: 'real', icon: '💰', usage: '浮点数', example: '3.14, 99.9', drizzle: "real('price')" },
  { name: 'uuid', icon: '🆔', usage: '全局唯一标识', example: "'a1b2c3d4-...'", drizzle: "uuid('id').defaultRandom()" },
]

const tabs = [
  { key: 'anatomy' as const, label: '表的解剖' },
  { key: 'relations' as const, label: '关系图' },
  { key: 'constraints' as const, label: '约束演示' },
  { key: 'types' as const, label: '数据类型' },
]
</script>

<template>
  <div class="db-viz">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        v-for="t in tabs" :key="t.key"
        :class="['tab-btn', { active: activeTab === t.key }]"
        @click="activeTab = t.key"
      >{{ t.label }}</button>
    </div>

    <!-- Tab 1: Anatomy -->
    <div v-if="activeTab === 'anatomy'" class="tab-content">
      <p class="tab-intro">点击任意列名，查看该列的详细说明。</p>
      <div class="table-wrap">
        <table class="db-table">
          <thead>
            <tr>
              <th
                v-for="(col, i) in columns" :key="col.name"
                :class="{ clickable: true, selected: selectedCol === i }"
                :style="col.color ? { borderBottom: `3px solid ${col.color}` } : {}"
                @click="selectedCol = selectedCol === i ? null : i"
              >
                <span class="col-name">{{ col.name }}</span>
                <span class="col-type">{{ col.type }}</span>
                <span v-if="col.constraint !== '—'" class="col-badge" :style="{ background: col.color || '#666' }">{{ col.constraint }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in sampleRows" :key="row.id">
              <td :class="{ highlight: selectedCol === 0 }">{{ row.id }}</td>
              <td :class="{ highlight: selectedCol === 1 }">{{ row.phone }}</td>
              <td :class="{ highlight: selectedCol === 2 }">{{ row.nickname }}</td>
              <td :class="{ highlight: selectedCol === 3, 'null-val': !row.address }">{{ row.address ?? 'NULL' }}</td>
              <td :class="{ highlight: selectedCol === 4 }">{{ row.created_at }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="selectedCol !== null" class="detail-box" :style="{ borderColor: columns[selectedCol].color || '#666' }">
        <strong>{{ columns[selectedCol].name }}</strong>（{{ columns[selectedCol].type }}）— {{ columns[selectedCol].desc }}
      </div>
    </div>

    <!-- Tab 2: Relationships -->
    <div v-if="activeTab === 'relations'" class="tab-content">
      <div class="rel-type-bar">
        <button
          v-for="rt in (['one-to-many','many-to-many','one-to-one'] as RelType[])" :key="rt"
          :class="['rel-btn', { active: activeRelation === rt }]"
          @click="activeRelation = rt; selectedLink = null"
        >{{ rt === 'one-to-many' ? '一对多' : rt === 'many-to-many' ? '多对多' : '一对一' }}</button>
      </div>
      <p class="rel-desc">{{ relDesc[activeRelation] }}</p>
      <div class="rel-diagram">
        <div
          v-for="(tbl, ti) in relations[activeRelation].tables" :key="tbl.name"
          class="rel-table"
          :class="{ 'rel-middle': relations[activeRelation].tables.length === 3 && ti === 1 }"
        >
          <div class="rel-table-name">{{ tbl.name }}</div>
          <div
            v-for="f in tbl.fields" :key="f"
            class="rel-field"
            :class="{
              'rel-pk': f === 'id',
              'rel-fk': f.endsWith('_id') && f !== 'id',
              'rel-linked': selectedLink !== null && (
                relations[activeRelation].links.some(l => l.from === tbl.name + '.' + f && selectedLink === l.from + '-' + l.to) ||
                relations[activeRelation].links.some(l => l.to === tbl.name + '.' + f && selectedLink === l.from + '-' + l.to)
              )
            }"
          >{{ f }}</div>
        </div>
      </div>
      <div class="rel-links">
        <div
          v-for="link in relations[activeRelation].links" :key="link.from + link.to"
          class="rel-link-card"
          :class="{ active: selectedLink === link.from + '-' + link.to }"
          @click="selectedLink = selectedLink === link.from + '-' + link.to ? null : link.from + '-' + link.to"
        >
          <span class="link-label">{{ link.from }} → {{ link.to }}</span>
          <span class="link-badge">{{ link.label }}</span>
        </div>
      </div>
      <div v-if="selectedLink" class="detail-box" style="border-color: #2eb3df">
        {{ relations[activeRelation].links.find(l => l.from + '-' + l.to === selectedLink)?.desc }}
      </div>
    </div>

    <!-- Tab 3: Constraints -->
    <div v-if="activeTab === 'constraints'" class="tab-content">
      <p class="tab-intro">点击卡片展开，查看正确 vs 违规插入的对比。</p>
      <div class="constraint-grid">
        <div
          v-for="(c, i) in constraints" :key="c.name"
          class="constraint-card"
          :class="{ expanded: expandedConstraint === i }"
          @click="expandedConstraint = expandedConstraint === i ? null : i"
        >
          <div class="constraint-header" :style="{ borderLeft: `4px solid ${c.color}` }">
            <span class="constraint-icon">{{ c.icon }}</span>
            <span class="constraint-name">{{ c.name }}</span>
          </div>
          <p class="constraint-explain">{{ c.explain }}</p>
          <div v-if="expandedConstraint === i" class="constraint-demo">
            <div class="demo-good">
              <div class="demo-label good-label">✅ 正确</div>
              <code>{{ c.good.sql }}</code>
              <p>{{ c.good.note }}</p>
            </div>
            <div class="demo-bad">
              <div class="demo-label bad-label">❌ 违规</div>
              <code>{{ c.bad.sql }}</code>
              <p>{{ c.bad.note }}</p>
              <div class="error-msg">{{ c.bad.error }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 4: Data Types -->
    <div v-if="activeTab === 'types'" class="tab-content">
      <p class="tab-intro">PostgreSQL 常用数据类型 + Drizzle ORM 写法速查。</p>
      <div class="type-grid">
        <div v-for="dt in dataTypes" :key="dt.name" class="type-card">
          <div class="type-icon">{{ dt.icon }}</div>
          <div class="type-name">{{ dt.name }}</div>
          <div class="type-usage">{{ dt.usage }}</div>
          <div class="type-example">示例：<code>{{ dt.example }}</code></div>
          <div class="type-drizzle">Drizzle：<code>{{ dt.drizzle }}</code></div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.db-viz {
  margin: 1.5rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg);
}
.tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.tab-btn {
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
.tab-btn.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
}
.tab-btn:hover:not(.active) { background: var(--vp-c-bg-mute); }
.tab-content { padding: 20px; }
.tab-intro { color: var(--vp-c-text-2); font-size: 13px; margin: 0 0 16px; }

/* ─── Tab 1: Anatomy ─── */
.table-wrap { overflow-x: auto; }
.db-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.db-table th {
  padding: 10px 8px 6px;
  text-align: left;
  cursor: pointer;
  vertical-align: top;
  background: var(--vp-c-bg-soft);
  transition: background .15s;
}
.db-table th.selected { background: var(--vp-c-bg-mute); }
.db-table th:hover { background: var(--vp-c-bg-mute); }
.col-name { display: block; font-weight: 600; color: var(--vp-c-text-1); }
.col-type { display: block; font-size: 11px; color: var(--vp-c-text-3); font-family: var(--vp-font-family-mono); }
.col-badge {
  display: inline-block;
  margin-top: 4px;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  color: #fff;
  font-weight: 600;
}
.db-table td {
  padding: 8px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  transition: background .15s;
}
.db-table td.highlight { background: var(--vp-c-brand-soft); }
.null-val { color: var(--vp-c-text-3); font-style: italic; }
.detail-box {
  margin-top: 12px;
  padding: 12px 16px;
  border-left: 4px solid;
  border-radius: 0 8px 8px 0;
  background: var(--vp-c-bg-soft);
  font-size: 13px;
  color: var(--vp-c-text-1);
  line-height: 1.6;
  animation: fadeIn .2s;
}

/* ─── Tab 2: Relationships ─── */
.rel-type-bar { display: flex; gap: 8px; margin-bottom: 12px; }
.rel-btn {
  padding: 6px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  background: var(--vp-c-bg);
  cursor: pointer;
  font-size: 13px;
  color: var(--vp-c-text-2);
  transition: all .2s;
}
.rel-btn.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
.rel-desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 16px; }
.rel-diagram {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.rel-table {
  border: 2px solid var(--vp-c-divider);
  border-radius: 8px;
  min-width: 140px;
  overflow: hidden;
  background: var(--vp-c-bg);
}
.rel-table-name {
  padding: 8px 12px;
  font-weight: 700;
  font-size: 14px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}
.rel-middle { border-style: dashed; }
.rel-field {
  padding: 6px 12px;
  font-size: 13px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
  border-bottom: 1px solid var(--vp-c-divider);
  transition: background .15s;
}
.rel-field:last-child { border-bottom: none; }
.rel-pk { color: #15a051; font-weight: 600; }
.rel-fk { color: #2eb3df; font-weight: 500; }
.rel-linked { background: #2eb3df22; }
.rel-links { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
.rel-link-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
  transition: all .15s;
}
.rel-link-card:hover, .rel-link-card.active {
  border-color: #2eb3df;
  background: #2eb3df11;
}
.link-badge {
  padding: 2px 8px;
  border-radius: 4px;
  background: #2eb3df;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

/* ─── Tab 3: Constraints ─── */
.constraint-grid { display: grid; gap: 12px; }
.constraint-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all .2s;
  background: var(--vp-c-bg);
}
.constraint-card:hover { border-color: var(--vp-c-text-3); }
.constraint-card.expanded { border-color: var(--vp-c-brand-1); }
.constraint-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.constraint-icon { font-size: 18px; }
.constraint-explain {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.constraint-demo {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  animation: fadeIn .2s;
}
.demo-good, .demo-bad {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12px;
}
.demo-good { background: #15a05112; border: 1px solid #15a05133; }
.demo-bad { background: #ef444412; border: 1px solid #ef444433; }
.demo-label {
  font-weight: 700;
  font-size: 12px;
  margin-bottom: 6px;
}
.good-label { color: #15a051; }
.bad-label { color: #ef4444; }
.constraint-demo code {
  display: block;
  font-size: 11px;
  padding: 6px 8px;
  border-radius: 4px;
  background: var(--vp-c-bg);
  margin: 4px 0;
  word-break: break-all;
  color: var(--vp-c-text-1);
}
.constraint-demo p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--vp-c-text-2);
}
.error-msg {
  margin-top: 6px;
  padding: 6px 8px;
  border-radius: 4px;
  background: #ef444418;
  color: #ef4444;
  font-size: 11px;
  font-family: var(--vp-font-family-mono);
  word-break: break-all;
}

/* ─── Tab 4: Data Types ─── */
.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.type-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 14px;
  background: var(--vp-c-bg);
  transition: border-color .2s;
}
.type-card:hover { border-color: var(--vp-c-brand-1); }
.type-icon { font-size: 24px; margin-bottom: 4px; }
.type-name {
  font-weight: 700;
  font-size: 15px;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
}
.type-usage {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 2px 0 8px;
}
.type-example, .type-drizzle {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-top: 4px;
}
.type-example code, .type-drizzle code {
  font-size: 11px;
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

/* ─── Shared ─── */
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

@media (max-width: 640px) {
  .tab-btn { font-size: 12px; padding: 10px 4px; }
  .rel-diagram { flex-direction: column; align-items: stretch; }
  .constraint-demo { grid-template-columns: 1fr; }
  .type-grid { grid-template-columns: 1fr; }
}
</style>
