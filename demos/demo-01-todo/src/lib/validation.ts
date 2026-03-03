import { z } from 'zod'

export const createTodoSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多 200 字'),
  category: z.enum(['inbox', 'work', 'personal']).optional(),
  dueDate: z.string().optional(),
})

export type CreateTodoInput = z.infer<typeof createTodoSchema>
