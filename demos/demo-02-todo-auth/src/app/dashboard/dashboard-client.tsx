'use client'

import { useEffect, useState, Suspense, useMemo } from 'react'
import { motion } from 'motion/react'
import { Plus, LogOut, Shield, User, BookOpen, X, List, Table2, Zap } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useHotkeys } from 'react-hotkeys-hook'
import { useQueryState } from 'nuqs'
import { useAction } from 'next-safe-action/hooks'
import { addTodoAction } from '@/app/actions/add-todo'
import { useTodosInfinite, useAddTodo, useToggleTodo, useDeleteTodo } from '@/lib/queries'
import { VirtualTodoList } from '@/components/VirtualTodoList'
import { TodoTable } from '@/components/TodoTable'
import { PriorityFilter } from '@/components/PriorityFilter'
import { DashboardChart } from '@/components/DashboardChart'
import { CommandPalette } from '@/components/CommandPalette'
import { DatePickerPopover } from '@/components/DatePickerPopover'
import { TeachingSidebar } from '@/components/TeachingSidebar'
import { DashboardSkeleton } from '@/components/DashboardSkeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'

function DashboardContent() {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useQueryState('priority', { defaultValue: 'all' })
  const [cmdOpen, setCmdOpen] = useState(false)
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [useServerAction, setUseServerAction] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'table'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('todo-view-mode') as 'list' | 'table') || 'list'
    }
    return 'list'
  })

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
  } = useTodosInfinite(priority)

  const addTodo = useAddTodo()
  const toggleTodo = useToggleTodo()
  const deleteTodo = useDeleteTodo()
  const safeAction = useAction(addTodoAction)

  useHotkeys('mod+k', (e) => { e.preventDefault(); setCmdOpen(true) })

  useEffect(() => {
    localStorage.setItem('todo-view-mode', viewMode)
  }, [viewMode])

  const allItems = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  )

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const payload = {
      title,
      priority: (priority === 'all' ? 'medium' : priority) as 'low' | 'medium' | 'high',
      dueDate: dueDate?.toISOString(),
    }

    if (useServerAction) {
      safeAction.execute(payload)
      toast.success('已通过 Server Action 添加')
    } else {
      addTodo.mutate(payload)
    }
    setTitle('')
    setDueDate(undefined)
  }

  const handleLogout = async () => {
    await authClient.signOut()
    toast.success('已登出')
    router.push('/login')
  }

  if (isPending) return <DashboardSkeleton />
  if (!session) return null

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex min-h-screen">
        <aside className="sidebar-panel hidden w-80 shrink-0 border-r border-border lg:block">
          <TeachingSidebar />
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="sidebar-panel absolute left-0 top-0 h-full w-80 border-r border-border shadow-xl"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute right-3 top-3 rounded-lg p-1 text-text-muted hover:text-text"
                aria-label="关闭侧边栏"
              >
                <X size={18} />
              </button>
              <TeachingSidebar />
            </motion.aside>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated">
                  <Shield size={18} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-text-heading">
                    {session.user.name} 的待办
                  </h1>
                  <p className="text-xs text-text-muted">认证版 · 虚拟列表 · ⌘K</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSidebarOpen(true)}
                      className="lg:hidden"
                      aria-label="打开学习面板"
                    >
                      <BookOpen size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>学习面板</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push('/profile')}
                      aria-label="个人资料"
                    >
                      <User size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>个人资料</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      aria-label="登出"
                    >
                      <LogOut size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>登出</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </header>
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
            {allItems.length > 0 && (
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="glass-card rounded-xl px-4 py-3 text-center">
                  <p className="text-xl font-semibold text-text-heading">{allItems.length}</p>
                  <p className="text-[10px] text-text-muted">总待办</p>
                </div>
                <div className="glass-card rounded-xl px-4 py-3 text-center">
                  <p className="text-xl font-semibold text-check">{allItems.filter(t => t.completed).length}</p>
                  <p className="text-[10px] text-text-muted">已完成</p>
                </div>
                <div className="glass-card rounded-xl px-4 py-3 text-center">
                  <p className="text-xl font-semibold text-red-400">{allItems.filter(t => t.priority === 'high').length}</p>
                  <p className="text-[10px] text-text-muted">高优先</p>
                </div>
                <div className="glass-card rounded-xl px-4 py-3 text-center">
                  <p className="text-xl font-semibold text-primary">{allItems.filter(t => !t.completed).length}</p>
                  <p className="text-[10px] text-text-muted">进行中</p>
                </div>
              </div>
            )}

            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleAdd}
              className="mb-6 flex gap-2 sm:gap-3"
            >
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="添加新待办..."
                className="flex-1"
                aria-label="待办标题"
              />
              <DatePickerPopover selected={dueDate} onSelect={setDueDate} />
              <Button type="submit" disabled={addTodo.isPending || safeAction.isPending}>
                <Plus size={16} />
                <span className="hidden sm:inline">添加</span>
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={useServerAction ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setUseServerAction((v) => !v)}
                    aria-label={useServerAction ? '当前: Server Action' : '当前: API Route'}
                  >
                    <Zap size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {useServerAction ? 'Server Action 模式' : 'API Route 模式'}（点击切换）
                </TooltipContent>
              </Tooltip>
            </motion.form>

            <div className="mb-4 flex items-center justify-between">
              <PriorityFilter value={priority} onChange={setPriority} />
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setViewMode('list')}
                      aria-label="列表视图"
                    >
                      <List size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>列表视图</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setViewMode('table')}
                      aria-label="表格视图"
                    >
                      <Table2 size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>表格视图</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {data && <DashboardChart pages={data.pages} />}

            {isLoading ? (
              <DashboardSkeleton />
            ) : data ? (
              viewMode === 'table' ? (
                <TodoTable
                  items={allItems}
                  onToggle={(id, completed) => toggleTodo.mutate({ id, completed })}
                  onDelete={(id) => deleteTodo.mutate(id)}
                />
              ) : (
                <VirtualTodoList
                  pages={data.pages}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  fetchNextPage={fetchNextPage}
                  onToggle={(id, completed) => toggleTodo.mutate({ id, completed })}
                  onDelete={(id) => deleteTodo.mutate(id)}
                />
              )
            ) : null}
          </div>
        </div>

        <CommandPalette
          open={cmdOpen}
          onOpenChange={setCmdOpen}
          onAddTodo={() => document.querySelector<HTMLInputElement>('.input-dark')?.focus()}
          onFilterPriority={setPriority}
          onProfile={() => router.push('/profile')}
          onLogout={handleLogout}
        />
      </div>
    </TooltipProvider>
  )
}

export default function DashboardClient() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
