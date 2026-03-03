'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { useAppStore } from '@/store/app-store'

const shortcuts = [
  { keys: 'Ctrl + N', desc: '聚焦输入框' },
  { keys: 'Ctrl + /', desc: '快捷键帮助' },
]

export function KeyboardShortcuts() {
  const open = useAppStore((s) => s.shortcuts.isOpen)
  const closeShortcuts = useAppStore((s) => s.closeShortcuts)

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeShortcuts()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, closeShortcuts])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closeShortcuts}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-72 rounded-2xl border border-border bg-surface-card p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-heading">快捷键</h3>
              <button onClick={closeShortcuts} className="text-text-muted hover:text-text">
                <X size={16} />
              </button>
            </div>
            <ul className="space-y-2.5">
              {shortcuts.map((s) => (
                <li key={s.keys} className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">{s.desc}</span>
                  <kbd className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-text-muted">
                    {s.keys}
                  </kbd>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] text-text-muted sm:hidden">
              快捷键仅在桌面端可用
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
