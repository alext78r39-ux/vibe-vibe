'use client'

import { useEffect } from 'react'
import { motion } from 'motion/react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-4 py-4">
        <p className="text-sm font-medium text-text-heading">Todo App (认证版)</p>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10"
        >
          <AlertTriangle size={28} className="text-danger" />
        </motion.div>
        <h2 className="text-xl font-semibold text-text-heading">出了点问题</h2>
        <p className="max-w-sm text-center text-sm text-text-muted">
          {error.message || '页面加载失败，请稍后重试'}
        </p>
        <Button onClick={reset} variant="outline">
          <RotateCcw size={14} />
          重试
        </Button>
      </main>
      <footer className="border-t border-border px-4 py-4 text-center text-xs text-text-muted">
        Vibecoding 教学示例 · 遇到问题请刷新页面
      </footer>
    </div>
  )
}
