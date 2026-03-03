'use client'

import { useEffect } from 'react'
import { motion } from 'motion/react'
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('Dashboard error:', error)
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
        <h2 className="text-xl font-semibold text-text-heading">待办加载失败</h2>
        <p className="max-w-sm text-center text-sm text-text-muted">
          {error.message || '无法加载待办数据，请检查网络连接后重试'}
        </p>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/login')} variant="ghost" size="sm">
            <ArrowLeft size={14} />
            返回登录
          </Button>
          <Button onClick={reset} variant="outline" size="sm">
            <RotateCcw size={14} />
            重试
          </Button>
        </div>
      </main>
      <footer className="border-t border-border px-4 py-4 text-center text-xs text-text-muted">
        Vibecoding 教学示例 · 遇到问题请刷新页面
      </footer>
    </div>
  )
}
