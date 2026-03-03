'use client'

import { motion } from 'motion/react'
import { ClipboardList, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onAdd?: () => void
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center py-16"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light"
      >
        <ClipboardList size={32} className="text-primary" strokeWidth={1.5} />
      </motion.div>
      <p className="font-display text-2xl text-text-muted">还没有待办事项</p>
      <p className="mt-1 text-sm text-text-muted">写点什么开始吧</p>
      {onAdd && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="mt-4"
        >
          <Plus size={14} />
          添加第一个待办
        </Button>
      )}
    </motion.div>
  )
}
