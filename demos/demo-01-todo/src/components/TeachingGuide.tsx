'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { GraduationCap, ChevronDown, Keyboard, Moon, Search, PartyPopper, FormInput } from 'lucide-react'

const features = [
  {
    icon: FormInput,
    name: '表单验证 (Form Validation)',
    lib: 'react-hook-form + @hookform/resolvers + zod',
    desc: '声明式表单管理：用 zod schema 定义规则，react-hook-form 自动校验、显示错误、管理状态。前后端共用同一份 schema。',
    tryIt: '试一试：不输入标题直接点「添加」，看看验证错误提示。',
  },
  {
    icon: Moon,
    name: '暗色模式 (Dark Mode)',
    lib: 'next-themes',
    desc: '基于 CSS class 的主题切换，支持系统偏好自动检测。ThemeProvider 包裹应用，useTheme() 读写当前主题。',
    tryIt: '试一试：点击右上角的月亮/太阳图标切换主题。',
  },
  {
    icon: Search,
    name: '防抖搜索 (Debounced Search)',
    lib: 'use-debounce',
    desc: '用户输入时延迟 300ms 才触发搜索，避免每次按键都过滤列表。useDebouncedCallback 封装了防抖逻辑。',
    tryIt: '试一试：在搜索框快速输入文字，注意列表不会每个字母都刷新。',
  },
  {
    icon: PartyPopper,
    name: '庆祝动效 (Confetti)',
    lib: 'canvas-confetti',
    desc: '当所有待办完成时触发彩纸动画。用 useRef 记录上一次进度，只在 0→100% 的瞬间触发一次。',
    tryIt: '试一试：添加几个待办，然后全部勾选完成，看看会发生什么。',
  },
  {
    icon: Keyboard,
    name: '键盘快捷键 (Hotkeys)',
    lib: 'react-hotkeys-hook',
    desc: 'useHotkeys 钩子监听全局按键组合，无需手动管理 addEventListener。支持 Ctrl/Cmd 修饰键。',
    tryIt: '试一试：按 Ctrl+N 聚焦输入框，按 Ctrl+/ 打开快捷键帮助。',
  },
]

export function TeachingGuide() {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-10"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="teaching-toggle group flex w-full items-center gap-2 rounded-xl px-4 py-3"
      >
        <GraduationCap size={18} className="text-primary" />
        <span className="flex-1 text-left text-sm font-medium text-text-heading">
          本页用到的库和交互模式
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-text-muted" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-1 pt-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="teaching-card rounded-xl p-4"
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <f.icon size={14} className="text-primary" />
                    <span className="text-xs font-semibold text-text-heading">{f.name}</span>
                  </div>
                  <p className="mb-1 text-[11px] leading-relaxed text-text-muted">
                    <span className="teaching-lib-tag mr-1.5 rounded px-1.5 py-0.5 text-[10px] font-mono">
                      {f.lib}
                    </span>
                  </p>
                  <p className="mb-2 text-[11px] leading-relaxed text-text">{f.desc}</p>
                  <p className="teaching-try-tag rounded-lg px-3 py-1.5 text-[11px] font-medium">
                    {f.tryIt}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
