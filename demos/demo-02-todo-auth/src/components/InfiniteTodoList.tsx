'use client'

import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { AnimatePresence } from 'motion/react'
import { motion } from 'motion/react'
import { Loader2 } from 'lucide-react'
import { TodoItem } from './TodoItem'
import { EmptyState } from './EmptyState'
import type { Todo } from '@/lib/queries'

interface InfiniteTodoListProps {
  pages: { items: Todo[]; nextCursor: number | null }[]
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  onToggle: (id: number, completed: boolean) => void
  onDelete: (id: number) => void
}

export function InfiniteTodoList({
  pages,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onToggle,
  onDelete,
}: InfiniteTodoListProps) {
  const { ref, inView } = useInView({ threshold: 0 })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const allTodos = pages.flatMap((p) => p.items)

  return (
    <>
      <ul className="space-y-2">
        <AnimatePresence mode="popLayout">
          {allTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </AnimatePresence>

        {allTodos.length === 0 && <EmptyState />}
      </ul>

      {/* 触底加载触发器 */}
      <div ref={ref} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Loader2 size={20} className="text-text-muted" />
          </motion.div>
        )}
        {!hasNextPage && allTodos.length > 0 && (
          <p className="text-xs text-text-muted">已加载全部</p>
        )}
      </div>
    </>
  )
}
