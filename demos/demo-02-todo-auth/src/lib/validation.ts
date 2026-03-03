import { z } from 'zod'

export const createTodoSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  note: z.string().max(500).optional(),
  dueDate: z.string().datetime().optional(),
})

export type CreateTodoInput = z.infer<typeof createTodoSchema>
