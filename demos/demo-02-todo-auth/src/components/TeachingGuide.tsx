'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { GraduationCap, ChevronDown, List, Command, CalendarDays, Bell, Keyboard } from 'lucide-react'

const features = [
  {
    icon: List,
    name: '虚拟列表 (Virtual Scrolling)',
    lib: '@tanstack/react-virtual',
    desc: '只渲染可视区域内的 DOM 节点，即使有上万条数据也不卡顿。useVirtualizer 计算每行位置，用 absolute 定位 + transform 实现高性能滚动。',
    tryIt: '试一试：添加大量待办，然后快速滚动列表，注意页面始终流畅。打开浏览器 DevTools 的 Elements 面板，观察 DOM 节点数量不会随数据增长。',
  },
  {
    icon: Command,
    name: '命令面板 (Command Palette)',
    lib: 'cmdk',
    desc: '类似 VS Code 的 Ctrl+K 命令面板。cmdk 提供模糊搜索、键盘导航、分组等功能，用 Dialog 模式渲染为全屏遮罩。',
    tryIt: '试一试：按 Ctrl+K (Mac: Cmd+K) 打开命令面板，输入关键词搜索命令，用方向键选择并回车执行。',
  },
  {
    icon: CalendarDays,
    name: '日期选择器 (Date Picker)',
    lib: 'react-day-picker',
    desc: '轻量级日历组件，支持单选/多选/范围模式。受控模式下通过 selected + onSelect 管理状态，点击外部自动关闭。',
    tryIt: '试一试：点击表单中的「截止日期」按钮，在弹出的日历中选择一个日期，然后添加待办。',
  },
  {
    icon: Bell,
    name: '三态通知 (Toast Promise)',
    lib: 'sonner · toast.promise()',
    desc: '一个 toast 展示异步操作的三个阶段：loading（加载中）→ success（成功）→ error（失败）。比手动管理三个 toast 更简洁。',
    tryIt: '试一试：添加、完成或删除一个待办，观察底部通知从「加载中」自动变为「成功」。',
  },
  {
    icon: Keyboard,
    name: '键盘快捷键 (Hotkeys)',
    lib: 'react-hotkeys-hook',
    desc: 'useHotkeys 钩子注册全局快捷键，mod+k 自动适配 Ctrl (Windows) 和 Cmd (Mac)。',
    tryIt: '试一试：按 Ctrl+K / Cmd+K 打开命令面板。',
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
