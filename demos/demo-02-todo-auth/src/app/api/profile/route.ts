import { db } from '@/db'
import { todos, user } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and, sql, gte } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextRequest } from 'next/server'
import { startOfWeek } from 'date-fns'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(1, '用户名不能为空').max(50).optional(),
  image: z.string().optional(),
})

async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

// 获取个人资料 + 统计
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: '未登录' }, { status: 401 })

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

    const [stats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        completed: sql<number>`count(*) filter (where ${todos.completed} = true)::int`,
        thisWeek: sql<number>`count(*) filter (where ${todos.createdAt} >= ${weekStart})::int`,
      })
      .from(todos)
      .where(eq(todos.userId, session.user.id))

    return Response.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
      stats: stats ?? { total: 0, completed: 0, thisWeek: 0 },
    })
  } catch (error) {
    console.error('GET /api/profile failed:', error)
    return Response.json({ error: '获取资料失败' }, { status: 500 })
  }
}

// 更新用户名
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: '未登录' }, { status: 401 })

    const body = await request.json()
    const parsed = updateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() }
    if (parsed.data.name) updates.name = parsed.data.name.trim()
    if (parsed.data.image) updates.image = parsed.data.image

    const updated = await db
      .update(user)
      .set(updates)
      .where(eq(user.id, session.user.id))
      .returning()

    return Response.json(updated[0])
  } catch (error) {
    console.error('PATCH /api/profile failed:', error)
    return Response.json({ error: '更新失败' }, { status: 500 })
  }
}
