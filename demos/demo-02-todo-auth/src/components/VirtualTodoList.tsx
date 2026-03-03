'use client'

import { useRef, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { TodoItem } from './TodoItem'
import { EmptyState } from './EmptyState'
import type { Todo } from '@/lib/queries'

interface VirtualTodoListProps {
  pages: { items: Todo[]; nextCursor: number | null }[]
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  onToggle: (id: number, completed: boolean) => void
  onDelete: (id: number) => void
}

export function VirtualTodoList({
  pages,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onToggle,
  onDelete,
}: VirtualTodoListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const allTodos = pages.flatMap((p) => p.items)

  const virtualizer = useVirtualizer({
    count: allTodos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 5,
  })

  const handleScroll = useCallback(() => {
    const el = parentRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    if (scrollHeight - scrollTop - clientHeight < 100 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (allTodos.length === 0) {
    return <EmptyState />
  }

  return (
    <div
      ref={parentRef}
      onScroll={handleScroll}
      className="max-h-[60vh] overflow-auto"
    >
      <ul
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const todo = allTodos[virtualRow.index]
          return (
            <li
              key={todo.id}
              className="absolute left-0 top-0 w-full"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="pb-2">
                <TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />
              </div>
            </li>
          )
        })}
      </ul>

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Loader2 size={20} className="text-text-muted" />
          </motion.div>
        </div>
      )}
      {!hasNextPage && allTodos.length > 0 && (
        <p className="py-4 text-center text-xs text-text-muted">已加载全部</p>
      )}
    </div>
  )
}
