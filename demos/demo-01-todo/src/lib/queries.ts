import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Todo {
  id: number
  title: string
  completed: boolean
  category: string
  dueDate: string | null
  order: number
  createdAt: string
}

// 获取待办列表
export function useTodos(category?: string | null) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)

  return useQuery<Todo[]>({
    queryKey: ['todos', category ?? 'all'],
    queryFn: async () => {
      const res = await fetch(`/api/todos?${params}`)
      if (!res.ok) throw new Error('获取待办失败')
      return res.json()
    },
  })
}

// 添加待办
export function useAddTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { title: string; category?: string; dueDate?: string }) => {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('添加失败')
      return res.json() as Promise<Todo>
    },
    // 乐观更新：立即在列表末尾显示新项
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previous = queryClient.getQueriesData<Todo[]>({ queryKey: ['todos'] })

      queryClient.setQueriesData<Todo[]>({ queryKey: ['todos'] }, (old) => {
        if (!old) return old
        const optimistic: Todo = {
          id: -Date.now(),
          title: newData.title,
          completed: false,
          category: newData.category ?? 'inbox',
          dueDate: newData.dueDate ?? null,
          order: old.length,
          createdAt: new Date().toISOString(),
        }
        return [...old, optimistic]
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

// 切换完成状态
export function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      })
      if (!res.ok) throw new Error('更新失败')
      return res.json() as Promise<Todo>
    },
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previous = queryClient.getQueriesData<Todo[]>({ queryKey: ['todos'] })

      queryClient.setQueriesData<Todo[]>({ queryKey: ['todos'] }, (old) =>
        old?.map((t) => (t.id === id ? { ...t, completed } : t))
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

// 删除待办
export function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('删除失败')
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previous = queryClient.getQueriesData<Todo[]>({ queryKey: ['todos'] })

      queryClient.setQueriesData<Todo[]>({ queryKey: ['todos'] }, (old) =>
        old?.filter((t) => t.id !== id)
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

// 拖拽排序
export function useReorderTodos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (items: { id: number; order: number }[]) => {
      const res = await fetch('/api/todos/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      if (!res.ok) throw new Error('排序失败')
    },
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previous = queryClient.getQueriesData<Todo[]>({ queryKey: ['todos'] })

      queryClient.setQueriesData<Todo[]>({ queryKey: ['todos'] }, (old) => {
        if (!old) return old
        const orderMap = new Map(items.map((i) => [i.id, i.order]))
        return [...old]
          .map((t) => (orderMap.has(t.id) ? { ...t, order: orderMap.get(t.id)! } : t))
          .sort((a, b) => a.order - b.order)
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
