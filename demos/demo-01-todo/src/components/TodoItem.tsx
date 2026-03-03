'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'motion/react'
import { Check, Circle, Trash2, GripVertical, Calendar } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { MarkdownTitle } from '@/components/MarkdownTitle'
import type { Todo } from '@/lib/queries'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: number, completed: boolean) => void
  onDelete: (id: number) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const dueDateLabel = todo.dueDate ? formatDueDate(todo.dueDate) : null

  return (
    <TooltipProvider delayDuration={400}>
      <motion.li
        ref={setNodeRef}
        style={style}
        layout
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, x: -60 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <Card className="group flex items-center gap-3 px-4 py-3.5 hover:-translate-y-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                {...attributes}
                {...listeners}
                className="shrink-0 cursor-grab touch-none text-text-muted opacity-0 transition-opacity group-hover:opacity-60 focus-visible:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                aria-label="拖拽排序"
              >
                <GripVertical size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>拖拽排序</TooltipContent>
          </Tooltip>

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
                  <Circle size={20} className="text-border" strokeWidth={1.5} />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>{todo.completed ? '标记为未完成' : '标记为完成'}</TooltipContent>
          </Tooltip>

          <div className="flex flex-1 flex-col gap-0.5">
            <span
              className={`text-sm transition-all ${
                todo.completed ? 'text-text-muted line-through decoration-border' : 'text-text'
              }`}
            >
              <MarkdownTitle text={todo.title} />
            </span>
            {dueDateLabel && (
              <Badge variant={dueDateLabel.variant} className="w-fit gap-1 text-[10px]">
                <Calendar size={10} />
                {dueDateLabel.text}
              </Badge>
            )}
          </div>

          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-text-muted opacity-0 transition-all hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
                    aria-label="删除"
                  >
                    <Trash2 size={15} />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>删除待办</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除「{todo.title}」吗？此操作不可撤销。
              </AlertDialogDescription>
              <div className="mt-4 flex justify-end gap-2">
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(todo.id)}>
                  删除
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </motion.li>
    </TooltipProvider>
  )
}

function formatDueDate(dateStr: string) {
  const date = new Date(dateStr)
  if (isToday(date)) return { text: '今天到期', variant: 'default' as const }
  if (isPast(date)) return { text: `已过期 · ${format(date, 'M月d日', { locale: zhCN })}`, variant: 'destructive' as const }
  return { text: format(date, 'M月d日', { locale: zhCN }), variant: 'secondary' as const }
}
