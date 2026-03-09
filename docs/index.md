---
title: Vibe Vibe
titleTemplate: false
---

<script setup>
import { onMounted } from 'vue'

function resolveLocaleEntry() {
  if (typeof navigator === 'undefined') return '/zh/'

  const languages = Array.isArray(navigator.languages) && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language]

  return languages.some((language) => language?.toLowerCase().startsWith('zh'))
    ? '/zh/'
    : '/en/'
}

onMounted(() => {
  if (typeof window !== 'undefined' && window.location.pathname === '/') {
    window.location.replace(resolveLocaleEntry())
  }
})
</script>

# 正在根据浏览器语言跳转

Vibe Vibe 会优先根据你的浏览器语言进入中文或英文版本。

- [进入中文版本](/zh/)
- [Continue in English](/en/)
