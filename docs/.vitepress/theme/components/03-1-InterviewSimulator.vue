<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

interface Option { text: string; isGood: boolean; response: string; explanation: string }
interface Round { options: Option[] }

const rounds: Round[] = [
  { options: [
    { text: '你觉得我这个待办清单的想法怎么样？', isGood: false, response: '听起来不错啊！', explanation: '❌ 引导性问题，对方只会给礼貌赞美，无法获得真实反馈。' },
    { text: '能聊聊你平时怎么管理每天的任务吗？', isGood: true, response: '我现在用便签纸，每天早上写一张，但经常忘带或者丢了...', explanation: '✅ 开放式问题，让对方描述真实行为，能发现真实痛点。' },
    { text: '你是不是经常忘记要做的事？', isGood: false, response: '嗯...偶尔吧。', explanation: '❌ 封闭式引导问题，暗示了你期望的答案。' },
  ]},
  { options: [
    { text: '上次忘记任务是什么时候？当时发生了什么？', isGood: true, response: '上周五忘了给客户发报告，被领导说了一顿。后来我在手机上设了三个闹钟...', explanation: '✅ 追问具体事件，获得了真实痛点场景和现有解决方案。' },
    { text: '如果有一个App能帮你管理任务，你会用吗？', isGood: false, response: '会啊，听起来挺好的。', explanation: '❌ "你会用吗"几乎总是得到肯定回答，这是虚假信号。' },
  ]},
  { options: [
    { text: '我们的App会有智能提醒和AI分类，你觉得怎么样？', isGood: false, response: '哇，听起来很厉害！', explanation: '❌ 在推销功能而不是了解需求，对方的赞美毫无价值。' },
    { text: '你现在用便签纸管理任务，最让你头疼的是什么？', isGood: true, response: '主要是容易丢，而且没法设提醒。有时候一张纸上写了十几件事，分不清轻重缓急...', explanation: '✅ 深入挖掘现有方案的痛点，这些才是真正需要解决的问题。' },
  ]},
  { options: [
    { text: '你试过其他工具吗？比如手机备忘录或其他App？', isGood: true, response: '试过滴答清单，但功能太多了，光设置就花了半小时，后来就没用了。还试过苹果备忘录，太简单了...', explanation: '✅ 了解竞品体验，发现用户对"简单但够用"的需求。' },
    { text: '你愿意为这样的App付费吗？每月10块钱？', isGood: false, response: '嗯...看情况吧。', explanation: '❌ 过早讨论付费，给出具体价格让对方不好意思拒绝。' },
  ]},
  { options: [
    { text: '最后，你能帮我推荐给你的同事吗？', isGood: false, response: '好啊，等做出来我看看。', explanation: '❌ 空洞的承诺，没有实质性行动。' },
    { text: '如果下周我做出一个简单原型，你愿意花15分钟试用并给反馈吗？', isGood: true, response: '可以啊，你加我微信，做好了发我。', explanation: '✅ 请求具体的、有成本的承诺（时间），这才是真正的兴趣信号。' },
  ]},
]

interface ChatMsg { type: 'user' | 'interviewee' | 'system'; text: string; isGood?: boolean }

const currentRound = ref(0)
const chatHistory = ref<ChatMsg[]>([])
const goodCount = ref(0)
const badCount = ref(0)
const showOptions = ref(true)
const chatArea = ref<HTMLElement | null>(null)
const isComplete = computed(() => currentRound.value >= rounds.length)

function selectOption(opt: Option) {
  showOptions.value = false
  chatHistory.value.push({ type: 'user', text: opt.text, isGood: opt.isGood })
  setTimeout(() => {
    chatHistory.value.push({ type: 'interviewee', text: opt.response })
    setTimeout(() => {
      chatHistory.value.push({ type: 'system', text: opt.explanation, isGood: opt.isGood })
      if (opt.isGood) goodCount.value++; else badCount.value++
      currentRound.value++
      if (!isComplete.value) showOptions.value = true
      nextTick(() => { if (chatArea.value) chatArea.value.scrollTop = chatArea.value.scrollHeight })
    }, 600)
  }, 800)
}

function reset() {
  currentRound.value = 0; chatHistory.value = []; goodCount.value = 0; badCount.value = 0; showOptions.value = true
}

const finalText = computed(() => {
  if (goodCount.value >= 4) return '🎉 优秀的访谈者！你善于用开放式问题挖掘真实需求。'
  if (goodCount.value >= 3) return '👍 不错！大部分问题问得很好，注意避免引导性提问。'
  return '⚠️ 需要练习。太多引导性问题会让你得到虚假信号。'
})
</script>
<!-- PH_T -->

<template>
  <div class="interview-sim">
    <div class="sim-header">
      <div class="sim-info">
        <span class="sim-title">🎙️ 用户访谈模拟器</span>
        <span class="sim-desc">场景：验证「极简待办清单」App — 被访者：小王，28岁，产品经理</span>
      </div>
      <div class="scoreboard">
        <span class="score good-score">✅ {{ goodCount }}</span>
        <span class="score bad-score">❌ {{ badCount }}</span>
        <button class="reset-btn" @click="reset">↺</button>
      </div>
    </div>

    <div class="chat-area" ref="chatArea">
      <div v-for="(msg, i) in chatHistory" :key="i" class="chat-msg" :class="msg.type">
        <div v-if="msg.type === 'user'" class="bubble user-bubble">
          <span class="bubble-label">你的提问</span>
          {{ msg.text }}
        </div>
        <div v-else-if="msg.type === 'interviewee'" class="bubble interviewee-bubble">
          <span class="bubble-label">小王</span>
          {{ msg.text }}
        </div>
        <div v-else class="system-msg" :class="{ good: msg.isGood, bad: !msg.isGood }">
          {{ msg.text }}
        </div>
      </div>
    </div>

    <div v-if="!isComplete && showOptions" class="options-area">
      <span class="options-label">第 {{ currentRound + 1 }}/{{ rounds.length }} 轮 — 选择你的问题：</span>
      <div class="options-list">
        <button v-for="(opt, i) in rounds[currentRound].options" :key="i" class="option-btn" @click="selectOption(opt)">
          {{ opt.text }}
        </button>
      </div>
    </div>

    <div v-if="isComplete" class="final-result">
      <div class="final-text">{{ finalText }}</div>
      <div class="final-stats">好问题 {{ goodCount }} / 坏问题 {{ badCount }}</div>
      <button class="reset-btn-large" @click="reset">重新开始</button>
    </div>
  </div>
</template>
<!-- PH_S -->

<style scoped>
.interview-sim { background: linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%); border-radius: 20px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8); font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif; }
.sim-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.sim-title { font-size: 16px; font-weight: 600; color: #1d1d1f; display: block; }
.sim-desc { font-size: 12px; color: #86868b; display: block; margin-top: 4px; }
.scoreboard { display: flex; align-items: center; gap: 10px; }
.score { padding: 4px 12px; border-radius: 8px; font-size: 14px; font-weight: 600; }
.good-score { background: #f0fff4; color: #34c759; }
.bad-score { background: #fff0f0; color: #ff3b30; }
.reset-btn { width: 32px; height: 32px; border-radius: 50%; border: none; background: #f5f5f7; color: #86868b; cursor: pointer; font-size: 16px; transition: all 0.2s; }
.reset-btn:hover { background: #e8e8ed; color: #1d1d1f; }
.chat-area { background: white; border-radius: 16px; padding: 16px; max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin-bottom: 16px; min-height: 120px; }
.chat-msg { animation: fadeUp 0.3s ease; }
.chat-msg.user { display: flex; justify-content: flex-end; }
.chat-msg.interviewee { display: flex; justify-content: flex-start; }
.chat-msg.system { display: flex; justify-content: center; }
.bubble { padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.6; max-width: 85%; }
.bubble-label { display: block; font-size: 11px; font-weight: 600; margin-bottom: 4px; opacity: 0.6; }
.user-bubble { background: #007aff; color: white; border-bottom-right-radius: 4px; }
.interviewee-bubble { background: #f5f5f7; color: #1d1d1f; border-bottom-left-radius: 4px; }
.system-msg { font-size: 12px; padding: 8px 14px; border-radius: 10px; max-width: 90%; text-align: center; font-weight: 500; }
.system-msg.good { background: #f0fff4; color: #34c759; }
.system-msg.bad { background: #fff0f0; color: #ff3b30; }
.options-area { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.options-label { font-size: 13px; font-weight: 600; color: #86868b; display: block; margin-bottom: 10px; }
.options-list { display: flex; flex-direction: column; gap: 8px; }
.option-btn { padding: 12px 16px; border-radius: 12px; border: 2px solid #e8e8ed; background: white; font-size: 13px; color: #1d1d1f; cursor: pointer; text-align: left; transition: all 0.2s; line-height: 1.5; }
.option-btn:hover { border-color: #007aff; background: #f0f7ff; transform: translateX(4px); }
.final-result { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); text-align: center; }
.final-text { font-size: 15px; font-weight: 600; color: #1d1d1f; margin-bottom: 8px; }
.final-stats { font-size: 13px; color: #86868b; margin-bottom: 16px; }
.reset-btn-large { padding: 10px 24px; border-radius: 12px; border: none; background: linear-gradient(135deg, #007aff, #5856d6); color: white; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.reset-btn-large:hover { transform: translateY(-1px); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-color-scheme: dark) {
  .interview-sim { background: linear-gradient(180deg, #1c1c1e 0%, #2c2c2e 100%); }
  .sim-title, .final-text { color: #f5f5f7; }
  .sim-desc, .options-label, .final-stats { color: #8e8e93; }
  .chat-area, .options-area, .final-result { background: #2c2c2e; }
  .interviewee-bubble { background: #3a3a3c; color: #f5f5f7; }
  .option-btn { background: #2c2c2e; border-color: #48484a; color: #f5f5f7; }
  .option-btn:hover { border-color: #0a84ff; background: #1c2a3e; }
  .reset-btn { background: #3a3a3c; color: #8e8e93; }
  .system-msg.good { background: #1c3a1c; }
  .system-msg.bad { background: #3a1c1c; }
}
@media (max-width: 640px) {
  .interview-sim { padding: 16px; }
  .chat-area { max-height: 300px; }
  .bubble { max-width: 95%; }
}
</style>
