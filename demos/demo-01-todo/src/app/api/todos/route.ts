import { db } from '@/db'
import { todos } from '@/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { NextRequest } from 'next/server'
import { createTodoSchema } from '@/lib/validation'

// R - Read（查）：获取待办，支持分类和状态过滤
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    const conditions = []
    if (category && category !== 'all') {
      conditions.push(eq(todos.category, category))
    }
    if (status === 'active') {
      conditions.push(eq(todos.completed, false))
    } else if (status === 'completed') {
      conditions.push(eq(todos.completed, true))
    }

    const query = db.select().from(todos)
    const result = conditions.length > 0
      ? await query.where(and(...conditions)).orderBy(asc(todos.order), asc(todos.createdAt))
      : await query.orderBy(asc(todos.order), asc(todos.createdAt))

    return Response.json(result)
  } catch (error) {
    console.error('GET /api/todos failed:', error)
    return Response.json({ error: '查询失败' }, { status: 500 })
  }
}

// C - Create（增）：添加一条待办
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createTodoSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { title, category, dueDate } = parsed.data
    const values: Record<string, unknown> = { title }
    if (category) values.category = category
    if (dueDate) values.dueDate = new Date(dueDate)

    const newTodo = await db.insert(todos).values(values as typeof todos.$inferInsert).returning()
    return Response.json(newTodo[0], { status: 201 })
  } catch (error) {
    console.error('POST /api/todos failed:', error)
    return Response.json({ error: '创建失败' }, { status: 500 })
  }
}
