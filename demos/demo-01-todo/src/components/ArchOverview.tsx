'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Layers, ChevronDown, ArrowRight } from 'lucide-react'

const layers = [
  {
    name: '用户界面层',
    tech: 'React + Framer Motion + Tailwind CSS',
    items: ['表单验证 (react-hook-form)', '防抖搜索 (use-debounce)', '暗色模式 (next-themes)', '拖拽排序 (@dnd-kit)', '快捷键 (react-hotkeys-hook)'],
  },
  {
    name: '状态管理层',
    tech: 'TanStack Query (React Query)',
    items: ['useTodos() — 查询待办列表', 'useAddTodo() — 乐观更新添加', 'useToggleTodo() — 乐观更新切换', 'useDeleteTodo() — 乐观更新删除'],
  },
  {
    name: 'API 路由层',
    tech: 'Next.js Route Handlers',
    items: ['GET /api/todos — 按分类查询', 'POST /api/todos — Zod 验证后插入', 'PATCH /api/todos/[id] — 切换完成状态', 'DELETE /api/todos/[id] — 删除记录'],
  },
  {
    name: '数据库层',
    tech: 'Drizzle ORM + Neon PostgreSQL',
    items: ['todos 表: id, title, completed, category, dueDate, order', '共享 Zod Schema (前后端 DRY)'],
  },
]

export function ArchOverview() {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-6"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="teaching-toggle group flex w-full items-center gap-2 rounded-xl px-4 py-3"
      >
        <Layers size={18} className="text-primary" />
        <span className="flex-1 text-left text-sm font-medium text-text-heading">
          技术架构总览
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
            <div className="space-y-2 px-1 pt-3">
              {layers.map((layer, i) => (
                <motion.div
                  key={layer.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="teaching-card rounded-xl p-3"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-xs font-semibold text-text-heading">{layer.name}</span>
                  </div>
                  <p className="mb-1.5 ml-7">
                    <span className="teaching-lib-tag rounded px-1.5 py-0.5 text-[10px] font-mono">
                      {layer.tech}
                    </span>
                  </p>
                  <ul className="ml-7 space-y-0.5">
                    {layer.items.map((item) => (
                      <li key={item} className="flex items-center gap-1.5 text-[11px] text-text-muted">
                        <ArrowRight size={8} className="shrink-0 text-primary/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
