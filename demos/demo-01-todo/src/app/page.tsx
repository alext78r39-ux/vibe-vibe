'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, useScroll, useTransform } from 'motion/react'
import { Plus, BookOpen, Calendar as CalendarIcon, X, Inbox, Briefcase, User } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryState } from 'nuqs'
import { useHotkeys } from 'react-hotkeys-hook'
import confetti from 'canvas-confetti'
import { useAppStore } from '@/store/app-store'
import { useTodos, useAddTodo, useToggleTodo, useDeleteTodo, useReorderTodos } from '@/lib/queries'
import { TodoList } from '@/components/TodoList'
import { CategoryFilter } from '@/components/CategoryFilter'
import { SearchInput } from '@/components/SearchInput'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'
import { TeachingSidebar } from '@/components/TeachingSidebar'
import { StatsChart } from '@/components/StatsChart'
import { FeatureCarousel } from '@/components/FeatureCarousel'
import { createTodoSchema, type CreateTodoInput } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

function TodoApp() {
  const [category] = useQueryState('category', { defaultValue: 'all' })
  const { data: todos = [], isLoading } = useTodos(category)
  const addTodo = useAddTodo()
  const toggleTodo = useToggleTodo()
  const deleteTodo = useDeleteTodo()
  const reorderTodos = useReorderTodos()

  const search = useAppStore((s) => s.search.query)
  const sidebarOpen = useAppStore((s) => s.sidebar.isOpen)
  const openSidebar = useAppStore((s) => s.openSidebar)
  const closeSidebar = useAppStore((s) => s.closeSidebar)
  const toggleShortcuts = useAppStore((s) => s.toggleShortcuts)

  const prevProgressRef = useRef(0)
  const headerRef = useRef<HTMLDivElement>(null)

  const { scrollY } = useScroll()
  const headerY = useTransform(scrollY, [0, 200], [0, -30])
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.8])

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    control,
    formState: { errors },
  } = useForm<CreateTodoInput>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: { title: '', dueDate: undefined },
  })

  useHotkeys('ctrl+n', (e) => { e.preventDefault(); setFocus('title') })
  useHotkeys('ctrl+/', (e) => { e.preventDefault(); toggleShortcuts() })

  const [formCategory, setFormCategory] = useState<string | undefined>(undefined)

  const onValid = (data: CreateTodoInput) => {
    const activeCategory = formCategory || (category === 'all' ? 'inbox' : category)
    addTodo.mutate(
      { title: data.title, category: activeCategory, dueDate: data.dueDate || undefined },
      {
        onSuccess: () => {
          toast.success('已添加到清单')
          reset()
          setFormCategory(undefined)
        },
      }
    )
  }

  const filteredTodos = search
    ? todos.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    : todos

  const completed = todos.filter((t) => t.completed).length
  const progress = todos.length > 0 ? (completed / todos.length) * 100 : 0

  useEffect(() => {
    if (progress === 100 && prevProgressRef.current < 100 && todos.length > 0) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } })
    }
    prevProgressRef.current = progress
  }, [progress, todos.length])

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sidebar-panel hidden w-80 shrink-0 border-r border-border-light lg:block">
        <TeachingSidebar />
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={closeSidebar}
          />
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="sidebar-panel absolute left-0 top-0 h-full w-80 border-r border-border-light shadow-xl"
          >
            <button
              onClick={closeSidebar}
              className="absolute right-3 top-3 rounded-lg p-1 text-text-muted hover:text-text"
              aria-label="关闭侧边栏"
            >
              <X size={18} />
            </button>
            <TeachingSidebar />
          </motion.aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
          <motion.div
            ref={headerRef}
            style={{ y: headerY, opacity: headerOpacity }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center sm:mb-10"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary"
            >
              <BookOpen size={28} strokeWidth={1.5} />
            </motion.div>
            <h1 className="font-display text-4xl text-text-heading sm:text-5xl">我的待办</h1>
            <p className="mt-2 text-sm text-text-muted">第七章 CRUD 示例</p>

            <button
              onClick={openSidebar}
              className="mt-3 inline-flex items-center gap-1 rounded-lg border border-border-light px-3 py-1.5 text-xs text-text-muted transition-colors hover:text-text lg:hidden"
              aria-label="打开学习面板"
            >
              <BookOpen size={12} />
              学习面板
            </button>
          </motion.div>

          <CategoryFilter />
          <SearchInput />

          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit(onValid)}
            className="mb-8 flex flex-col gap-3"
          >
            <div className="flex gap-2 sm:gap-3">
              <div className="flex-1">
                <Input
                  {...register('title')}
                  placeholder="写点什么..."
                  aria-label="待办标题"
                />
                {errors.title && (
                  <p className="mt-1 px-1 text-xs text-danger" role="alert">{errors.title.message}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={addTodo.isPending}
                className="self-start"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">添加</span>
              </Button>
            </div>
            <div className="flex items-center gap-3 px-1">
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger className="w-28" aria-label="分类">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbox"><Inbox className="mr-1.5 inline h-3 w-3" />收件箱</SelectItem>
                  <SelectItem value="work"><Briefcase className="mr-1.5 inline h-3 w-3" />工作</SelectItem>
                  <SelectItem value="personal"><User className="mr-1.5 inline h-3 w-3" />个人</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <CalendarIcon size={14} className="text-text-muted" />
                <input
                  type="date"
                  {...register('dueDate')}
                  className="input-field rounded-lg px-3 py-1.5 text-xs"
                  aria-label="截止日期"
                />
              </div>
            </div>
          </motion.form>

          {todos.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 px-1">
              <div className="mb-1.5 flex items-center justify-between text-xs text-text-muted">
                <span>{completed} / {todos.length} 已完成</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} aria-label={`完成进度 ${Math.round(progress)}%`} />
            </motion.div>
          )}

          <StatsChart todos={todos} />

          <TodoList
            todos={filteredTodos}
            isLoading={isLoading}
            onToggle={(id, completed) => toggleTodo.mutate({ id, completed })}
            onDelete={(id) => {
              deleteTodo.mutate(id, { onSuccess: () => toast.info('已从清单移除') })
            }}
            onReorder={(items) => reorderTodos.mutate(items)}
            onAddFirst={() => setFocus('title')}
          />

          <FeatureCarousel />
          <KeyboardShortcuts />
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense>
      <TodoApp />
    </Suspense>
  )
}