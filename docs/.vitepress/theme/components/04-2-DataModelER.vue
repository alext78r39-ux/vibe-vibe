<script setup lang="ts">
interface Field {
  name: string
  type: string
  tag?: 'PK' | 'FK'
}

interface Table {
  name: string
  color: string
  fields: Field[]
}

const tables: Table[] = [
  {
    name: 'users',
    color: '#007aff',
    fields: [
      { name: 'id', type: 'uuid', tag: 'PK' },
      { name: 'email', type: 'text' },
      { name: 'name', type: 'text' },
      { name: 'created_at', type: 'timestamp' },
    ],
  },
  {
    name: 'posts',
    color: '#34c759',
    fields: [
      { name: 'id', type: 'uuid', tag: 'PK' },
      { name: 'title', type: 'text' },
      { name: 'content', type: 'text' },
      { name: 'author_id', type: 'uuid', tag: 'FK' },
      { name: 'created_at', type: 'timestamp' },
    ],
  },
]
</script>

<template>
  <div class="er-root">
    <div class="er-diagram">
      <div class="er-table" v-for="t in tables" :key="t.name" :style="{ borderColor: t.color }">
        <div class="er-table-header" :style="{ background: t.color, color: '#fff' }">
          {{ t.name }}
        </div>
        <div class="er-table-body">
          <div
            v-for="f in t.fields"
            :key="f.name"
            :class="['er-field', { fk: f.tag === 'FK' }]"
          >
            <span class="er-field-name">{{ f.name }}</span>
            <span class="er-field-type">{{ f.type }}</span>
            <span v-if="f.tag" :class="['er-tag', f.tag.toLowerCase()]">{{ f.tag }}</span>
          </div>
        </div>
      </div>

      <div class="er-relation">
        <div class="er-rel-label er-rel-one">1</div>
        <div class="er-rel-line"></div>
        <div class="er-rel-label er-rel-many">N</div>
      </div>
    </div>
    <div class="er-caption">users.id ← posts.author_id (一对多)</div>
  </div>
</template>

<style scoped>
.er-root { margin: 24px 0; max-width: 688px; margin-left: auto; margin-right: auto; }
.er-diagram {
  display: flex; align-items: center; justify-content: center; gap: 0;
  position: relative;
}
.er-table {
  border: 2px solid var(--vp-c-divider); border-radius: 10px; overflow: hidden;
  min-width: 180px; background: var(--vp-c-bg); flex-shrink: 0;
}
.er-table-header {
  padding: 8px 14px; font-size: 13px; font-weight: 700; text-align: center;
  letter-spacing: 0.5px;
}
.er-table-body { padding: 4px 0; }
.er-field {
  display: flex; align-items: center; gap: 8px; padding: 5px 14px;
  font-size: 12px; color: var(--vp-c-text-1);
}
.er-field.fk { background: rgba(255, 149, 0, 0.08); }
.er-field-name { font-weight: 600; font-family: 'SF Mono', Monaco, monospace; min-width: 80px; }
.er-field-type { font-size: 11px; color: var(--vp-c-text-3); font-family: 'SF Mono', Monaco, monospace; }
.er-tag {
  padding: 1px 5px; border-radius: 4px; font-size: 9px; font-weight: 700;
  margin-left: auto; flex-shrink: 0;
}
.er-tag.pk { background: rgba(0,122,255,0.12); color: #007aff; }
.er-tag.fk { background: rgba(255,149,0,0.12); color: #ff9500; }
.er-relation {
  display: flex; flex-direction: column; align-items: center; gap: 0;
  padding: 0 12px; flex-shrink: 0;
}
.er-rel-label {
  font-size: 14px; font-weight: 800; width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%; background: var(--vp-c-bg-soft);
  border: 2px solid #ff9500; color: #ff9500;
}
.er-rel-line {
  width: 3px; height: 40px; background: #ff9500; border-radius: 2px;
}
.er-caption {
  text-align: center; margin-top: 14px; font-size: 12px; color: var(--vp-c-text-3);
  font-family: 'SF Mono', Monaco, monospace;
}
@media (max-width: 640px) {
  .er-diagram { flex-direction: column; gap: 0; }
  .er-relation { flex-direction: row; padding: 8px 0; }
  .er-rel-line { width: 40px; height: 3px; }
  .er-table { min-width: 220px; width: 100%; max-width: 280px; }
}
</style>
