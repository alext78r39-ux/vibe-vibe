'use server'

import { authActionClient } from '@/lib/safe-action'
import { createTodoSchema } from '@/lib/validation'
import { db } from '@/db'
import { todos } from '@/db/schema'

export const addTodoAction = authActionClient
  .schema(createTodoSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { title, priority, note, dueDate } = parsedInput
    const values: Record<string, unknown> = { title, userId: ctx.session.user.id }
    if (priority) values.priority = priority
    if (note) values.note = note
    if (dueDate) values.dueDate = new Date(dueDate)

    const [newTodo] = await db
      .insert(todos)
      .values(values as typeof todos.$inferInsert)
      .returning()

    return newTodo
  })
