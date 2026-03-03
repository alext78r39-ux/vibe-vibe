import { pgTable, serial, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core'

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  completed: boolean('completed').default(false),
  category: text('category').default('inbox'),
  dueDate: timestamp('due_date'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
})
