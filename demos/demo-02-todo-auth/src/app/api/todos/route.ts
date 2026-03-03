import { db } from '@/db'
import { todos } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and, lt, desc, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const createTodoSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  note: z.string().max(500).optional(),
  dueDate: z.string().datetime().optional(),
})

async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

// 游标分页查询（按 createdAt DESC，cursor 也基于 id 但排序一致）
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: '未登录' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = Math.min(Number(searchParams.get('limit') || '20'), 50)
    const priority = searchParams.get('priority')

    const conditions = [eq(todos.userId, session.user.id)]
    if (priority && priority !== 'all') {
      conditions.push(eq(todos.priority, priority))
    }
    if (cursor) {
      conditions.push(lt(todos.id, Number(cursor)))
    }

    const items = await db
      .select()
      .from(todos)
      .where(and(...conditions))
      .orderBy(desc(todos.id))
      .limit(limit + 1)

    const hasMore = items.length > limit
    if (hasMore) items.pop()

    return Response.json({
      items,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    })
  } catch (error) {
    console.error('GET /api/todos failed:', error)
    return Response.json({ error: '查询失败' }, { status: 500 })
  }
}

// 创建待办
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: '未登录' }, { status: 401 })

    const body = await request.json()
    const parsed = createTodoSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { title, priority, note, dueDate } = parsed.data
    const values: Record<string, unknown> = { title, userId: session.user.id }
    if (priority) values.priority = priority
    if (note) values.note = note
    if (dueDate) values.dueDate = new Date(dueDate)

    const newTodo = await db
      .insert(todos)
      .values(values as typeof todos.$inferInsert)
      .returning()
    return Response.json(newTodo[0], { status: 201 })
  } catch (error) {
    console.error('POST /api/todos failed:', error)
    return Response.json({ error: '创建失败' }, { status: 500 })
  }
}
