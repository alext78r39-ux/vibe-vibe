'use client'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { AnimatePresence } from 'motion/react'
import { TodoItem } from './TodoItem'
import { EmptyState } from './EmptyState'
import { TodoSkeleton } from './TodoSkeleton'
import type { Todo } from '@/lib/queries'

interface TodoListProps {
  todos: Todo[]
  isLoading?: boolean
  onToggle: (id: number, completed: boolean) => void
  onDelete: (id: number) => void
  onReorder: (items: { id: number; order: number }[]) => void
  onAddFirst?: () => void
}

export function TodoList({ todos, isLoading, onToggle, onDelete, onReorder, onAddFirst }: TodoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = todos.findIndex((t) => t.id === active.id)
    const newIndex = todos.findIndex((t) => t.id === over.id)
    const reordered = arrayMove(todos, oldIndex, newIndex)

    onReorder(reordered.map((t, i) => ({ id: t.id, order: i })))
  }

  if (isLoading) return <TodoSkeleton />

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2.5" role="list" aria-label="待办列表">
          <AnimatePresence mode="popLayout">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>

          {todos.length === 0 && <EmptyState onAdd={onAddFirst} />}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
