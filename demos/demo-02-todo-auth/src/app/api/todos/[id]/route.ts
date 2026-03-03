import { db } from '@/db'
import { todos } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const patchSchema = z.object({
  completed: z.boolean(),
})

async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: '未登录' }, { status: 401 })

    const { id } = await params
    const numId = Number(id)
    if (!Number.isFinite(numId) || numId <= 0) {
      return Response.json({ error: '无效的 ID' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const updated = await db
      .update(todos)
      .set({ completed: parsed.data.completed })
      .where(and(eq(todos.id, numId), eq(todos.userId, session.user.id)))
      .returning()

    if (!updated.length) return Response.json({ error: '未找到' }, { status: 404 })
    return Response.json(updated[0])
  } catch (error) {
    console.error('PATCH /api/todos/[id] failed:', error)
    return Response.json({ error: '更新失败' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: '未登录' }, { status: 401 })

    const { id } = await params
    const numId = Number(id)
    if (!Number.isFinite(numId) || numId <= 0) {
      return Response.json({ error: '无效的 ID' }, { status: 400 })
    }

    await db
      .delete(todos)
      .where(and(eq(todos.id, numId), eq(todos.userId, session.user.id)))
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('DELETE /api/todos/[id] failed:', error)
    return Response.json({ error: '删除失败' }, { status: 500 })
  }
}
