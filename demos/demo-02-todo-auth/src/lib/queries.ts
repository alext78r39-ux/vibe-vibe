import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface Todo {
  id: number
  title: string
  completed: boolean
  priority: string
  note: string | null
  dueDate: string | null
  userId: string
  createdAt: string
}

interface TodoPage {
  items: Todo[]
  nextCursor: number | null
}

interface Profile {
  user: { id: string; name: string; email: string; image: string | null }
  stats: { total: number; completed: number; thisWeek: number }
}

// 无限滚动待办列表
export function useTodosInfinite(priority?: string | null) {
  return useInfiniteQuery<TodoPage>({
    queryKey: ['todos', priority ?? 'all'],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      params.set('limit', '20')
      if (priority && priority !== 'all') params.set('priority', priority)
      if (pageParam) params.set('cursor', String(pageParam))
      const res = await fetch(`/api/todos?${params}`)
      if (!res.ok) throw new Error('获取待办失败')
      return res.json()
    },
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}

// 添加待办
export function useAddTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { title: string; priority?: string; note?: string; dueDate?: string }) => {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('添加失败')
      return res.json() as Promise<Todo>
    },
    onSuccess: () => toast.success('待办已添加'),
    onError: () => toast.error('添加失败'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  })
}

// 切换完成
export function useToggleTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      })
      if (!res.ok) throw new Error('更新失败')
      return res.json()
    },
    onSuccess: (_data, { completed }) => toast.success(completed ? '已完成' : '已恢复'),
    onError: () => toast.error('更新失败'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  })
}

// 删除待办
export function useDeleteTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('删除失败')
    },
    onSuccess: () => toast.success('待办已删除'),
    onError: () => toast.error('删除失败'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  })
}

// 获取个人资料
export function useProfile() {
  return useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('获取资料失败')
      return res.json()
    },
  })
}

// 更新用户名
export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('更新失败')
      return res.json()
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}
