<script setup lang="ts">
import { ref, reactive } from 'vue'

const nums = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31]
const target = 23

const linear = reactive({
  active: -1,
  found: false,
  steps: 0,
  done: false,
  checked: new Set<number>(),
})

const binary = reactive({
  lo: 0,
  hi: nums.length - 1,
  mid: -1,
  found: false,
  steps: 0,
  done: false,
  checked: new Set<number>(),
})

const running = ref(false)

function reset() {
  linear.active = -1
  linear.found = false
  linear.steps = 0
  linear.done = false
  linear.checked = new Set()
  binary.lo = 0
  binary.hi = nums.length - 1
  binary.mid = -1
  binary.found = false
  binary.steps = 0
  binary.done = false
  binary.checked = new Set()
}

function startSearch() {
  if (running.value) return
  reset()
  running.value = true
  runLinear()
  runBinary()
}

function runLinear() {
  let i = 0
  const timer = setInterval(() => {
    linear.active = i
    linear.checked = new Set([...linear.checked, i])
    linear.steps = i + 1
    if (nums[i] === target) {
      linear.found = true
      linear.done = true
      clearInterval(timer)
      checkDone()
    } else {
      i++
      if (i >= nums.length) {
        linear.done = true
        clearInterval(timer)
        checkDone()
      }
    }
  }, 300)
}

function runBinary() {
  let lo = 0
  let hi = nums.length - 1
  const timer = setInterval(() => {
    if (lo > hi) {
      binary.done = true
      clearInterval(timer)
      checkDone()
      return
    }
    const mid = Math.floor((lo + hi) / 2)
    binary.lo = lo
    binary.hi = hi
    binary.mid = mid
    binary.checked = new Set([...binary.checked, mid])
    binary.steps++
    if (nums[mid] === target) {
      binary.found = true
      binary.done = true
      clearInterval(timer)
      checkDone()
    } else if (nums[mid] < target) {
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }, 600)
}

function checkDone() {
  if (linear.done && binary.done) {
    running.value = false
  }
}

function linearClass(i: number) {
  if (linear.found && i === linear.active) return 'found'
  if (i === linear.active) return 'checking'
  if (linear.checked.has(i)) return 'visited'
  return ''
}

function binaryClass(i: number) {
  if (binary.found && i === binary.mid) return 'found'
  if (i === binary.mid) return 'checking'
  if (!binary.done && i >= binary.lo && i <= binary.hi) return 'in-range'
  if (binary.checked.has(i)) return 'visited'
  return ''
}
</script>

<template>
  <div class="srch-root">
    <div class="srch-target">目标值: <strong>{{ target }}</strong></div>
    <div class="srch-panels">
      <div class="srch-panel">
        <div class="srch-panel-title">线性搜索</div>
        <div class="srch-nums">
          <div
            v-for="(n, i) in nums"
            :key="'l' + i"
            :class="['srch-num', linearClass(i)]"
          >{{ n }}</div>
        </div>
        <div class="srch-status">
          <span v-if="linear.done && linear.found" class="srch-found">找到! {{ linear.steps }} 步</span>
          <span v-else-if="linear.done">未找到</span>
          <span v-else-if="linear.steps > 0">搜索中... 第 {{ linear.steps }} 步</span>
          <span v-else class="srch-idle">等待开始</span>
        </div>
      </div>
      <div class="srch-panel">
        <div class="srch-panel-title">二分搜索</div>
        <div class="srch-nums">
          <div
            v-for="(n, i) in nums"
            :key="'b' + i"
            :class="['srch-num', binaryClass(i)]"
          >{{ n }}</div>
        </div>
        <div class="srch-status">
          <span v-if="binary.done && binary.found" class="srch-found">找到! {{ binary.steps }} 步</span>
          <span v-else-if="binary.done">未找到</span>
          <span v-else-if="binary.steps > 0">搜索中... 第 {{ binary.steps }} 步</span>
          <span v-else class="srch-idle">等待开始</span>
        </div>
      </div>
    </div>
    <div class="srch-actions">
      <button class="srch-btn" @click="startSearch" :disabled="running">
        {{ running ? '搜索中...' : '开始搜索' }}
      </button>
      <button v-if="linear.done || binary.done" class="srch-btn srch-btn-reset" @click="reset">
        重置
      </button>
    </div>
  </div>
</template>

<style scoped>
.srch-root { margin: 24px 0; max-width: 688px; margin-left: auto; margin-right: auto; }
.srch-target {
  text-align: center; margin-bottom: 16px; font-size: 14px; color: var(--vp-c-text-2);
}
.srch-target strong { color: var(--vp-c-text-1); font-size: 16px; }
.srch-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.srch-panel {
  padding: 16px; border-radius: 12px; border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.srch-panel-title {
  font-size: 13px; font-weight: 700; color: var(--vp-c-text-1);
  margin-bottom: 12px; text-align: center;
}
.srch-nums { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; }
.srch-num {
  width: 34px; height: 30px; display: flex; align-items: center; justify-content: center;
  border-radius: 6px; font-size: 11px; font-weight: 600;
  border: 1.5px solid var(--vp-c-divider); background: var(--vp-c-bg);
  color: var(--vp-c-text-2); transition: all 0.2s;
}
.srch-num.checking {
  border-color: #ff9500; background: rgba(255,149,0,0.12); color: #ff9500;
  transform: scale(1.1);
}
.srch-num.visited { border-color: var(--vp-c-divider); opacity: 0.35; }
.srch-num.in-range { border-color: #007aff; background: rgba(0,122,255,0.06); }
.srch-num.found {
  border-color: #34c759; background: rgba(52,199,89,0.15); color: #34c759;
  transform: scale(1.15); font-weight: 800;
}
.srch-status {
  margin-top: 12px; text-align: center; font-size: 12px; color: var(--vp-c-text-3);
  min-height: 20px;
}
.srch-found { color: #34c759; font-weight: 700; }
.srch-idle { font-style: italic; }
.srch-actions { display: flex; justify-content: center; gap: 10px; margin-top: 16px; }
.srch-btn {
  padding: 8px 22px; border-radius: 8px; border: none; font-size: 13px;
  font-weight: 600; cursor: pointer; background: var(--vp-c-brand); color: #fff;
  transition: all 0.2s;
}
.srch-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
.srch-btn:disabled { opacity: 0.5; cursor: default; }
.srch-btn-reset {
  background: var(--vp-c-bg-soft); color: var(--vp-c-text-2);
  border: 1.5px solid var(--vp-c-divider);
}
.srch-btn-reset:hover { border-color: var(--vp-c-text-3); }
@media (max-width: 640px) {
  .srch-panels { grid-template-columns: 1fr; }
  .srch-num { width: 30px; height: 26px; font-size: 10px; }
}
</style>
