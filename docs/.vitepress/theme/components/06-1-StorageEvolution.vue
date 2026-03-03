<script setup lang="ts">
import { ref, computed } from 'vue'

interface Movie { title: string; tags: string[] }

const moviePool: Movie[] = [
  { title: '流浪地球', tags: ['科幻', '灾难'] },
  { title: '你好，李焕英', tags: ['喜剧', '亲情'] },
  { title: '长津湖', tags: ['战争', '历史'] },
  { title: '哪吒之魔童降世', tags: ['动画', '神话'] },
  { title: '战狼2', tags: ['动作', '军事'] },
  { title: '满江红', tags: ['悬疑', '历史'] },
  { title: '唐人街探案3', tags: ['喜剧', '推理'] },
  { title: '我不是药神', tags: ['剧情', '社会'] },
  { title: '红海行动', tags: ['动作', '战争'] },
  { title: '西虹市首富', tags: ['喜剧', '奇幻'] },
  { title: '复仇者联盟4', tags: ['科幻', '动作'] },
  { title: '速度与激情7', tags: ['动作', '犯罪'] },
  { title: '捉妖记', tags: ['奇幻', '喜剧'] },
  { title: '美人鱼', tags: ['喜剧', '爱情'] },
  { title: '疯狂的外星人', tags: ['科幻', '喜剧'] },
  { title: '独行月球', tags: ['科幻', '喜剧'] },
  { title: '消失的她', tags: ['悬疑', '犯罪'] },
  { title: '孤注一掷', tags: ['犯罪', '剧情'] },
  { title: '封神第一部', tags: ['神话', '动作'] },
  { title: '熊出没·逆转时空', tags: ['动画', '冒险'] },
]

const movies = ref<Movie[]>([])
const bounceBtn = ref(false)
const expanded = ref<'csv' | 'json' | 'db' | null>(null)
const shakeTarget = ref<string | null>(null)

const addMovie = () => {
  if (movies.value.length >= moviePool.length) return
  movies.value = [...movies.value, moviePool[movies.value.length]]
  bounceBtn.value = true
  setTimeout(() => { bounceBtn.value = false }, 300)
  // trigger shake when hitting thresholds
  const n = movies.value.length
  if (n === 5) { shakeTarget.value = 'csv'; setTimeout(() => { shakeTarget.value = null }, 500) }
  if (n === 15) { shakeTarget.value = 'json'; setTimeout(() => { shakeTarget.value = null }, 500) }
}

const addBatch = () => {
  for (let i = 0; i < 5; i++) {
    if (movies.value.length >= moviePool.length) break
    movies.value = [...movies.value, moviePool[movies.value.length]]
  }
  const n = movies.value.length
  if (n >= 5 && n < 10) { shakeTarget.value = 'csv'; setTimeout(() => { shakeTarget.value = null }, 500) }
  if (n >= 15) { shakeTarget.value = 'json'; setTimeout(() => { shakeTarget.value = null }, 500) }
}
</script>

<template>
  <div class="se-root">
    <!-- Control Bar -->
    <div class="se-ctrl">
      <button class="se-btn-add" :class="{ 'se-bounce': bounceBtn }" @click="addMovie"
        :disabled="movies.length >= moviePool.length">
        + 添加电影
      </button>
      <button class="se-btn-batch" @click="addBatch" :disabled="movies.length >= moviePool.length">
        ×5 快速填充
      </button>
      <span class="se-counter">
        <span class="se-counter-num">{{ movies.length }}</span> / {{ moviePool.length }} 部
      </span>
      <button class="se-btn-reset" @click="movies = []; expanded = null" :disabled="movies.length === 0">重置</button>
    </div>

    <!-- Three Lanes -->
    <div class="se-lanes">
      <!-- CSV Lane -->
      <div class="se-lane" :class="{ 'se-shake': shakeTarget === 'csv' }" @click="expanded = expanded === 'csv' ? null : 'csv'">
        <div class="se-lane-left">
          <span class="se-lane-icon">📊</span>
          <span class="se-lane-name">CSV 文件</span>
        </div>
        <div class="se-lane-bar">
          <div class="se-lane-fill" :style="{
            width: movies.length === 0 ? '0%' : '100%',
            background: movies.length < 5 ? '#15a051' : movies.length < 12 ? '#D4952C' : '#ff3b30'
          }" />
        </div>
        <div class="se-lane-right">
          <span v-if="movies.length === 0" class="se-tag se-tag-idle">等待中</span>
          <span v-else-if="movies.length < 5" class="se-tag se-tag-ok">正常</span>
          <span v-else-if="movies.length < 12" class="se-tag se-tag-warn">受限</span>
          <span v-else class="se-tag se-tag-bad">崩溃</span>
          <span class="se-expand-arrow" :class="{ open: expanded === 'csv' }">&#9662;</span>
        </div>
      </div>
      <!-- CSV Detail -->
      <div v-if="expanded === 'csv'" class="se-detail">
        <div class="se-detail-inner se-mono">
          <div class="se-csv-head">标题,标签</div>
          <div v-for="(m, i) in movies" :key="i" class="se-csv-line">
            {{ m.title }},<span :class="{ 'se-strike': movies.length >= 5 }">{{ m.tags.join('|') }}</span>
          </div>
          <div v-if="movies.length >= 5" class="se-detail-warn">
            CSV 无法存储数组，标签只能拍平成 "科幻|灾难"，查询和过滤都做不了
          </div>
        </div>
      </div>

      <!-- JSON Lane -->
      <div class="se-lane" :class="{ 'se-shake': shakeTarget === 'json' }" @click="expanded = expanded === 'json' ? null : 'json'">
        <div class="se-lane-left">
          <span class="se-lane-icon">📄</span>
          <span class="se-lane-name">JSON 文件</span>
        </div>
        <div class="se-lane-bar">
          <div class="se-lane-fill" :style="{
            width: movies.length === 0 ? '0%' : '100%',
            background: movies.length < 15 ? '#15a051' : movies.length < 20 ? '#D4952C' : '#ff3b30'
          }" />
        </div>
        <div class="se-lane-right">
          <span v-if="movies.length === 0" class="se-tag se-tag-idle">等待中</span>
          <span v-else-if="movies.length < 15" class="se-tag se-tag-ok">正常</span>
          <span v-else class="se-tag se-tag-warn">变慢</span>
          <span class="se-expand-arrow" :class="{ open: expanded === 'json' }">&#9662;</span>
        </div>
      </div>
      <!-- JSON Detail -->
      <div v-if="expanded === 'json'" class="se-detail">
        <div class="se-detail-inner se-mono" style="position: relative;">
          <div>[</div>
          <div v-for="(m, i) in movies" :key="i" class="se-json-line">
            &nbsp;&nbsp;{{ `{ "title": "${m.title}", "tags": ${JSON.stringify(m.tags)} }${i < movies.length - 1 ? ',' : ''}` }}
          </div>
          <div>]</div>
          <div v-if="movies.length >= 15" class="se-spinner-mask">
            <span class="se-spinner" /> 整个文件要全部读入内存...
          </div>
        </div>
        <div v-if="movies.length >= 15" class="se-detail-warn">
          JSON 没有索引，每次查询都要读取整个文件；多人同时写入会互相覆盖
        </div>
      </div>

      <!-- Database Lane -->
      <div class="se-lane se-lane-db" @click="expanded = expanded === 'db' ? null : 'db'">
        <div class="se-lane-left">
          <span class="se-lane-icon">🗄️</span>
          <span class="se-lane-name">数据库</span>
        </div>
        <div class="se-lane-bar">
          <div class="se-lane-fill" :style="{ width: movies.length === 0 ? '0%' : '100%', background: '#15a051' }" />
        </div>
        <div class="se-lane-right">
          <span v-if="movies.length === 0" class="se-tag se-tag-idle">等待中</span>
          <span v-else class="se-tag se-tag-ok">稳定</span>
          <span class="se-expand-arrow" :class="{ open: expanded === 'db' }">&#9662;</span>
        </div>
      </div>
      <!-- DB Detail -->
      <div v-if="expanded === 'db'" class="se-detail">
        <table class="se-db-table">
          <thead><tr><th>id</th><th>title</th><th>tags</th></tr></thead>
          <tbody>
            <tr v-for="(m, i) in movies" :key="i">
              <td class="se-mono">{{ i + 1 }}</td>
              <td>{{ m.title }}</td>
              <td>
                <span v-for="t in m.tags" :key="t" class="se-pill">{{ t }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="se-detail-ok">
          数组原生支持，索引秒查，100 万条也不怕
        </div>
      </div>
    </div>

    <!-- Verdict -->
    <div v-if="movies.length >= 5" class="se-verdict">
      <template v-if="movies.length < 15">
        📊 CSV 已经扛不住标签字段了，但 JSON 和数据库还很轻松
      </template>
      <template v-else>
        📊 CSV 早已崩溃 · 📄 JSON 开始吃力 · 🗄️ 数据库依然稳如老狗
      </template>
    </div>
  </div>
</template>

<style scoped>
.se-root { margin: 1.5rem 0; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg); overflow: hidden; }

/* ─── Control Bar ─── */
.se-ctrl { display: flex; align-items: center; gap: 10px; padding: 16px 20px; border-bottom: 1px solid var(--vp-c-divider); flex-wrap: wrap; }
.se-btn-add, .se-btn-batch, .se-btn-reset {
  border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px;
  font-weight: 600; cursor: pointer; transition: opacity .15s, transform .1s;
}
.se-btn-add:active, .se-btn-batch:active, .se-btn-reset:active { transform: scale(.96); }
.se-btn-add:disabled, .se-btn-batch:disabled, .se-btn-reset:disabled { opacity: .35; cursor: not-allowed; }
.se-btn-add { background: var(--vp-c-brand-1); color: #fff; }
.se-btn-batch { background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); }
.se-btn-reset { background: var(--vp-c-bg-soft); color: var(--vp-c-text-3); border: 1px solid var(--vp-c-divider); }
.se-counter { font-size: 13px; color: var(--vp-c-text-3); margin-left: auto; }
.se-counter-num { font-size: 20px; font-weight: 800; color: var(--vp-c-text-1); vertical-align: -2px; }
.se-bounce { animation: se-bounceAnim .3s; }
@keyframes se-bounceAnim { 0% { transform: scale(1); } 40% { transform: scale(1.12); } 100% { transform: scale(1); } }

/* ─── Lanes ─── */
.se-lanes { padding: 12px 20px 16px; }
.se-lane {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px;
  border: 1.5px solid var(--vp-c-divider); border-radius: 10px;
  margin-bottom: 4px; cursor: pointer; transition: border-color .2s, background .15s;
  user-select: none;
}
.se-lane:hover { background: var(--vp-c-bg-soft); }
.se-lane-db { border-color: #15a05140; }
.se-lane-left { display: flex; align-items: center; gap: 8px; min-width: 100px; flex-shrink: 0; }
.se-lane-icon { font-size: 18px; }
.se-lane-name { font-size: 13px; font-weight: 600; color: var(--vp-c-text-1); }
.se-lane-bar { flex: 1; height: 8px; border-radius: 4px; background: var(--vp-c-bg-soft); overflow: hidden; }
.se-lane-fill { height: 100%; border-radius: 4px; transition: width .4s, background .4s; }
.se-lane-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.se-expand-arrow { font-size: 10px; color: var(--vp-c-text-3); transition: transform .2s; }
.se-expand-arrow.open { transform: rotate(180deg); }

/* Tags */
.se-tag { font-size: 11px; padding: 2px 10px; border-radius: 99px; font-weight: 600; white-space: nowrap; }
.se-tag-idle { background: var(--vp-c-bg-soft); color: var(--vp-c-text-3); }
.se-tag-ok { background: #15a05115; color: #15a051; }
.se-tag-warn { background: #D4952C15; color: #D4952C; }
.se-tag-bad { background: #ff3b3015; color: #ff3b30; }

/* Shake */
.se-shake { animation: se-shakeAnim .4s; }
@keyframes se-shakeAnim {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

/* ─── Detail Panel ─── */
.se-detail {
  margin: 0 0 8px; padding: 12px 14px; border-radius: 0 0 10px 10px;
  background: var(--vp-c-bg-soft); animation: se-slideDown .2s ease-out;
  max-height: 240px; overflow-y: auto;
}
.se-detail-inner { font-size: 11px; line-height: 1.7; color: var(--vp-c-text-2); }
.se-mono { font-family: var(--vp-font-family-mono); }
.se-csv-head { color: var(--vp-c-text-3); border-bottom: 1px dashed var(--vp-c-divider); margin-bottom: 4px; padding-bottom: 4px; }
.se-csv-line { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.se-strike { text-decoration: line-through; color: #ff3b30; opacity: .6; }
.se-json-line { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.se-spinner-mask {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  gap: 8px; background: rgba(var(--vp-c-bg-soft), .9); backdrop-filter: blur(2px);
  font-size: 12px; color: #D4952C; border-radius: 8px; background: var(--vp-c-bg-soft); opacity: .92;
}
.se-spinner {
  width: 14px; height: 14px; border: 2px solid #D4952C; border-top-color: transparent;
  border-radius: 50%; animation: se-spin .7s linear infinite; display: inline-block;
}
@keyframes se-spin { to { transform: rotate(360deg); } }

.se-detail-warn {
  margin-top: 8px; padding: 8px 12px; border-radius: 6px;
  background: #D4952C10; border-left: 3px solid #D4952C;
  font-size: 12px; color: #D4952C; line-height: 1.5;
}
.se-detail-ok {
  margin-top: 8px; padding: 8px 12px; border-radius: 6px;
  background: #15a05110; border-left: 3px solid #15a051;
  font-size: 12px; color: #15a051; line-height: 1.5;
}

/* DB Table */
.se-db-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.se-db-table th {
  text-align: left; font-size: 11px; color: var(--vp-c-text-3); font-weight: 600;
  padding: 6px 8px; border-bottom: 1px solid var(--vp-c-divider);
}
.se-db-table td { padding: 5px 8px; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); }
.se-pill {
  display: inline-block; font-size: 10px; padding: 1px 8px; border-radius: 99px;
  margin-right: 4px; font-weight: 600; background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1);
}

@keyframes se-slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 240px; } }

/* ─── Verdict ─── */
.se-verdict {
  margin: 0 20px 16px; padding: 10px 16px; border-radius: 8px;
  background: var(--vp-c-bg-soft); font-size: 13px; color: var(--vp-c-text-1);
  text-align: center; line-height: 1.6; animation: se-fadeIn .3s;
}
@keyframes se-fadeIn { from { opacity: 0; } to { opacity: 1; } }

@media (max-width: 640px) {
  .se-ctrl { gap: 8px; padding: 12px 14px; }
  .se-lanes { padding: 10px 14px 12px; }
  .se-lane-left { min-width: 80px; }
  .se-lane-name { font-size: 12px; }
}
</style>
