'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Check, Circle, Trash2 } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import type { Todo } from '@/lib/queries'

const priorityConfig = {
  high: { label: '高', color: 'text-red-400', bg: 'bg-red-400/10' },
  medium: { label: '中', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  low: { label: '低', color: 'text-green-400', bg: 'bg-green-400/10' },
} as const

function dueDateColor(dateStr: string): string {
  const d = new Date(dateStr)
  if (isPast(d) && !isToday(d)) return 'text-red-400'
  if (isToday(d)) return 'text-amber-400'
  return 'text-text-muted'
}

interface TodoItemProps {
  todo: Todo
  onToggle: (id: number, completed: boolean) => void
  onDelete: (id: number) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const priority = priorityConfig[todo.priority as keyof typeof priorityConfig] ?? priorityConfig.medium

  return (
    <TooltipProvider delayDuration={400}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, x: -60 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="glass-card group flex items-center gap-3 rounded-xl px-4 py-3.5 hover:-translate-y-0.5"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onToggle(todo.id, !todo.completed)}
              className="shrink-0 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
              aria-label={todo.completed ? '标记为未完成' : '标记为完成'}
            >
              {todo.completed ? (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-check text-white"
                >
                  <Check size={12} strokeWidth={3} />
                </motion.div>
              ) : (
                <Circle size={20} className="text-text-muted" strokeWidth={1.5} />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>{todo.completed ? '标记为未完成' : '标记为完成'}</TooltipContent>
        </Tooltip>

        <div className="flex flex-1 flex-col gap-0.5">
          <span className={`text-sm transition-all ${todo.completed ? 'text-text-muted line-through' : 'text-text'}`}>
            {todo.title}
          </span>
          <div className="flex items-center gap-2">
            {todo.note && (
              <span className="text-xs text-text-muted">{todo.note}</span>
            )}
            {todo.dueDate && (
              <span className={`text-[10px] ${dueDateColor(todo.dueDate)}`}>
                {format(new Date(todo.dueDate), 'M/d')}
              </span>
            )}
          </div>
        </div>

        <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${priority.color} ${priority.bg}`}>
          {priority.label}
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmDelete(true)}
              className="h-7 w-7 shrink-0 text-text-muted opacity-0 transition-all hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="删除"
            >
              <Trash2 size={15} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>删除待办</TooltipContent>
        </Tooltip>
      </motion.div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>确定要删除「{todo.title}」吗？此操作不可撤销。</DialogDescription>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDelete(todo.id)
                setConfirmDelete(false)
              }}
            >
              删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
