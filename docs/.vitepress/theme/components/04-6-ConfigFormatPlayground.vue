<script setup lang="ts">
import { ref, computed, watch } from 'vue'

type Format = 'json' | 'yaml' | 'csv'

const activeFormat = ref<Format>('json')
const editorContent = ref('')
const parseError = ref('')

const presets = {
  json: `{
  "name": "张三",
  "age": 25,
  "email": "zhang@example.com",
  "hobbies": ["阅读", "游泳", "编程"]
}`,
  yaml: `name: 张三
age: 25
email: zhang@example.com
hobbies:
  - 阅读
  - 游泳
  - 编程`,
  csv: `name,age,email
张三,25,zhang@example.com
李四,30,li@example.com
王五,28,wang@example.com`,
}

function selectFormat(f: Format) {
  activeFormat.value = f
  editorContent.value = presets[f]
  parseError.value = ''
}

selectFormat('json')

const parsed = computed(() => {
  const content = editorContent.value.trim()
  if (!content) return null
  parseError.value = ''

  if (activeFormat.value === 'json') {
    try {
      return JSON.parse(content)
    } catch (e: any) {
      parseError.value = `JSON 语法错误: ${e.message}`
      return null
    }
  }

  if (activeFormat.value === 'yaml') {
    // Simple YAML parser for demo
    try {
      const result: Record<string, any> = {}
      const lines = content.split('\n')
      let currentKey = ''
      let currentArray: string[] | null = null

      for (const line of lines) {
        if (line.trim().startsWith('#') || !line.trim()) continue
        if (line.match(/^\s+-\s+/)) {
          if (currentArray) currentArray.push(line.replace(/^\s+-\s+/, ''))
        } else {
          if (currentArray && currentKey) {
            result[currentKey] = currentArray
            currentArray = null
          }
          const match = line.match(/^(\w+):\s*(.*)$/)
          if (match) {
            currentKey = match[1]
            const val = match[2].trim()
            if (val) {
              result[currentKey] = isNaN(Number(val)) ? val : Number(val)
            } else {
              currentArray = []
            }
          }
        }
      }
      if (currentArray && currentKey) result[currentKey] = currentArray
      return result
    } catch {
      parseError.value = 'YAML 解析失败'
      return null
    }
  }

  if (activeFormat.value === 'csv') {
    try {
      const lines = content.split('\n').filter(l => l.trim())
      if (lines.length < 2) return []
      const headers = lines[0].split(',').map(h => h.trim())
      return lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim())
        const obj: Record<string, string> = {}
        headers.forEach((h, i) => { obj[h] = vals[i] || '' })
        return obj
      })
    } catch {
      parseError.value = 'CSV 解析失败'
      return null
    }
  }
  return null
})

const convertedJson = computed(() => {
  if (!parsed.value) return ''
  try {
    return JSON.stringify(parsed.value, null, 2)
  } catch { return '' }
})

watch(editorContent, () => { parseError.value = '' })
</script>

<template>
  <div class="cfp-root">
    <div class="cfp-tabs">
      <button v-for="f in (['json', 'yaml', 'csv'] as const)" :key="f"
        :class="['cfp-tab', { active: activeFormat === f }]"
        @click="selectFormat(f)">
        {{ f.toUpperCase() }}
      </button>
    </div>

    <div class="cfp-layout">
      <div class="cfp-editor-wrap">
        <div class="cfp-editor-label">编辑区 ({{ activeFormat.toUpperCase() }})</div>
        <textarea v-model="editorContent" class="cfp-editor" :class="{ error: parseError }"
          spellcheck="false" rows="10"></textarea>
        <div v-if="parseError" class="cfp-error">⚠️ {{ parseError }}</div>
      </div>

      <div class="cfp-preview-wrap">
        <div class="cfp-editor-label">解析结果 (JSON)</div>
        <pre v-if="parsed" class="cfp-preview">{{ convertedJson }}</pre>
        <div v-else class="cfp-preview cfp-preview-empty">等待有效输入...</div>
      </div>
    </div>

    <div class="cfp-hint">
      <span v-if="activeFormat === 'json'">💡 JSON 的键必须用双引号，末尾不能有多余逗号</span>
      <span v-else-if="activeFormat === 'yaml'">💡 YAML 用缩进表示层级，只能用空格不能用 Tab</span>
      <span v-else>💡 CSV 用逗号分隔字段，第一行是表头</span>
    </div>
  </div>
</template>

<style scoped>
.cfp-root { margin: 24px 0; }
.cfp-tabs { display: flex; gap: 6px; margin-bottom: 14px; }
.cfp-tab {
  padding: 6px 18px; border-radius: 8px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); font-size: 13px; font-weight: 700; cursor: pointer;
  color: var(--vp-c-text-2); transition: all 0.2s;
  font-family: 'SF Mono', Monaco, monospace;
}
.cfp-tab.active { border-color: var(--vp-c-brand); color: var(--vp-c-brand); background: var(--vp-c-brand-dimm); }
.cfp-layout { display: flex; gap: 12px; }
.cfp-editor-wrap, .cfp-preview-wrap { flex: 1; min-width: 0; }
.cfp-editor-label { font-size: 11px; font-weight: 600; color: var(--vp-c-text-3); margin-bottom: 6px; }
.cfp-editor {
  width: 100%; padding: 12px; border-radius: 8px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); font-size: 12px; line-height: 1.6;
  font-family: 'SF Mono', Monaco, monospace; color: var(--vp-c-text-1);
  resize: vertical; outline: none; transition: border-color 0.2s; box-sizing: border-box;
}
.cfp-editor:focus { border-color: var(--vp-c-brand); }
.cfp-editor.error { border-color: #ff3b30; }
.cfp-error { font-size: 12px; color: #ff3b30; margin-top: 6px; }
.cfp-preview {
  padding: 12px; border-radius: 8px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); font-size: 12px; line-height: 1.6;
  font-family: 'SF Mono', Monaco, monospace; color: var(--vp-c-text-1);
  min-height: 200px; overflow-x: auto; white-space: pre; margin: 0;
}
.cfp-preview-empty { color: var(--vp-c-text-3); font-style: italic; }
.cfp-hint {
  margin-top: 10px; padding: 8px 14px; border-radius: 6px;
  background: var(--vp-c-default-soft); font-size: 12px; color: var(--vp-c-text-2);
}
@media (max-width: 640px) {
  .cfp-layout { flex-direction: column; }
}
</style>
